/**
 * ============================================================================
 * AlgoMetrics Pure C++ HTTP Backend Server (C++17)
 * ============================================================================
 * - Fully implemented in modern C++ (C++17) with standard library sockets.
 * - Zero Java, zero external dependencies required.
 * - Handles CORS, algorithm execution requests, and returns JSON traces.
 *
 * Compilation:
 *   g++ -std=c++17 -O2 server.cpp -o algo_server -lpthread
 *
 * Execution:
 *   ./algo_server 8080
 * ============================================================================
 */

#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <cstring>
#include <cstdlib>
#include <chrono>
#include <thread>
#include <mutex>

#ifdef _WIN32
  #include <winsock2.h>
  #include <ws2tcpip.h>
  #pragma comment(lib, "ws2_32.lib")
#else
  #include <sys/types.h>
  #include <sys/socket.h>
  #include <netinet/in.h>
  #include <unistd.h>
#endif

#include "algorithms.hpp"

namespace algometrics {

// Parse simple JSON array of integers from string like "[10, 4, 30, 2]"
std::vector<int> parseJsonIntArray(const std::string& body) {
    std::vector<int> result;
    size_t start = body.find('[');
    size_t end = body.find(']', start);
    if (start == std::string::npos || end == std::string::npos) return result;

    std::string inner = body.substr(start + 1, end - start - 1);
    std::stringstream ss(inner);
    std::string token;
    while (std::getline(ss, token, ',')) {
        // Trim token
        size_t first = token.find_first_not_of(" \t\r\n\"");
        size_t last = token.find_last_not_of(" \t\r\n\"");
        if (first != std::string::npos && last != std::string::npos) {
            try {
                result.push_back(std::stoi(token.substr(first, last - first + 1)));
            } catch (...) {}
        }
    }
    return result;
}

// Extract string value for a key in a JSON object
std::string extractJsonString(const std::string& json, const std::string& key) {
    std::string needle = "\"" + key + "\"";
    size_t pos = json.find(needle);
    if (pos == std::string::npos) return "";

    size_t colon = json.find(':', pos + needle.length());
    if (colon == std::string::npos) return "";

    size_t valStart = json.find('"', colon + 1);
    if (valStart == std::string::npos) return "";

    size_t valEnd = json.find('"', valStart + 1);
    if (valEnd == std::string::npos) return "";

    return json.substr(valStart + 1, valEnd - valStart - 1);
}

// Extract int value for a key in a JSON object
int extractJsonInt(const std::string& json, const std::string& key, int defaultVal = 0) {
    std::string needle = "\"" + key + "\"";
    size_t pos = json.find(needle);
    if (pos == std::string::npos) return defaultVal;

    size_t colon = json.find(':', pos + needle.length());
    if (colon == std::string::npos) return defaultVal;

    size_t valStart = json.find_first_of("0123456789-", colon + 1);
    if (valStart == std::string::npos) return defaultVal;

    size_t valEnd = json.find_first_not_of("0123456789", valStart + (json[valStart] == '-' ? 1 : 0));
    std::string numStr = (valEnd == std::string::npos) 
        ? json.substr(valStart) 
        : json.substr(valStart, valEnd - valStart);

    try {
        return std::stoi(numStr);
    } catch (...) {
        return defaultVal;
    }
}

std::string buildHttpResponse(int statusCode, const std::string& statusText, const std::string& contentType, const std::string& body) {
    std::ostringstream ss;
    ss << "HTTP/1.1 " << statusCode << " " << statusText << "\r\n";
    ss << "Server: AlgoMetrics-CPP-Backend/1.0\r\n";
    ss << "Content-Type: " << contentType << "\r\n";
    ss << "Content-Length: " << body.length() << "\r\n";
    ss << "Access-Control-Allow-Origin: *\r\n";
    ss << "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
    ss << "Access-Control-Allow-Headers: Content-Type, Authorization\r\n";
    ss << "Connection: close\r\n";
    ss << "\r\n";
    ss << body;
    return ss.str();
}

std::string handleRequest(const std::string& method, const std::string& path, const std::string& body) {
    if (method == "OPTIONS") {
        return buildHttpResponse(204, "No Content", "text/plain", "");
    }

    if (method == "GET" && path == "/api/status") {
        std::string json = "{\"status\":\"online\",\"backend\":\"Pure C++17 Native Server\",\"compiler\":\"Standard C++\",\"port\":8080}";
        return buildHttpResponse(200, "OK", "application/json", json);
    }

    if (method == "GET" && path == "/api/algorithms") {
        std::string json = "{\n"
                           "  \"algorithms\": [\n"
                           "    {\"id\": \"bubble-sort\", \"name\": \"Bubble Sort\", \"category\": \"sorting\", \"complexity\": \"O(n²)\"},\n"
                           "    {\"id\": \"selection-sort\", \"name\": \"Selection Sort\", \"category\": \"sorting\", \"complexity\": \"O(n²)\"},\n"
                           "    {\"id\": \"insertion-sort\", \"name\": \"Insertion Sort\", \"category\": \"sorting\", \"complexity\": \"O(n²)\"},\n"
                           "    {\"id\": \"linear-search\", \"name\": \"Linear Search\", \"category\": \"searching\", \"complexity\": \"O(n)\"},\n"
                           "    {\"id\": \"binary-search\", \"name\": \"Binary Search\", \"category\": \"searching\", \"complexity\": \"O(log n)\"}\n"
                           "  ]\n"
                           "}";
        return buildHttpResponse(200, "OK", "application/json", json);
    }

    if (method == "POST" && path == "/api/execute") {
        std::string algoId = extractJsonString(body, "algorithmId");
        if (algoId.empty()) algoId = "bubble-sort";

        std::vector<int> arr = parseJsonIntArray(body);
        if (arr.empty()) {
            arr = {45, 12, 89, 34, 25, 7, 63, 51};
        }

        int target = extractJsonInt(body, "target", 34);

        AlgorithmResult res;
        if (algoId == "bubble-sort") {
            res = runBubbleSort(arr);
        } else if (algoId == "selection-sort") {
            res = runSelectionSort(arr);
        } else if (algoId == "insertion-sort") {
            res = runInsertionSort(arr);
        } else if (algoId == "linear-search") {
            res = runLinearSearch(arr, target);
        } else if (algoId == "binary-search") {
            res = runBinarySearch(arr, target);
        } else {
            res = runBubbleSort(arr);
        }

        std::string jsonResponse = resultToJson(res);
        return buildHttpResponse(200, "OK", "application/json", jsonResponse);
    }

    // 404 Not Found
    std::string notFoundJson = "{\"error\":\"Not Found\",\"path\":\"" + path + "\"}";
    return buildHttpResponse(404, "Not Found", "application/json", notFoundJson);
}

} // namespace algometrics

int main(int argc, char* argv[]) {
    int port = 8080;
    if (argc > 1) {
        port = std::atoi(argv[1]);
        if (port <= 0) port = 8080;
    }

    std::cout << "======================================================\n";
    std::cout << "  AlgoMetrics C++ Backend Server (Native C++17)\n";
    std::cout << "  Zero Java / Pure Standard C++ Backend Service\n";
    std::cout << "======================================================\n";
    std::cout << "[C++ Backend] Initializing native socket server on port " << port << "...\n";

#ifdef _WIN32
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "[C++ Backend] Failed to initialize Winsock.\n";
        return 1;
    }
#endif

    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        std::cerr << "[C++ Backend] Error creating socket.\n";
        return 1;
    }

    int opt = 1;
#ifdef _WIN32
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));
#else
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
#endif

    struct sockaddr_in address;
    std::memset(&address, 0, sizeof(address));
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port);

    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
        std::cerr << "[C++ Backend] Bind failed on port " << port << ".\n";
        return 1;
    }

    if (listen(server_fd, 10) < 0) {
        std::cerr << "[C++ Backend] Listen failed.\n";
        return 1;
    }

    std::cout << "[C++ Backend] Server running at http://localhost:" << port << "/\n";
    std::cout << "[C++ Backend] Endpoints:\n";
    std::cout << "  - GET  /api/status      (Check C++ backend health)\n";
    std::cout << "  - GET  /api/algorithms  (List supported algorithms)\n";
    std::cout << "  - POST /api/execute     (Run C++ instrumented algorithm)\n";
    std::cout << "[C++ Backend] Ready for incoming HTTP connections...\n";

    while (true) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        int client_sock = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);
        if (client_sock < 0) {
            continue;
        }

        std::thread([client_sock]() {
            char buffer[8192];
            std::memset(buffer, 0, sizeof(buffer));

#ifdef _WIN32
            int bytes_read = recv(client_sock, buffer, sizeof(buffer) - 1, 0);
#else
            int bytes_read = read(client_sock, buffer, sizeof(buffer) - 1);
#endif

            if (bytes_read > 0) {
                std::string request(buffer, bytes_read);
                std::istringstream reqStream(request);
                std::string method, path, protocol;
                reqStream >> method >> path >> protocol;

                // Find body (after \r\n\r\n)
                size_t bodyPos = request.find("\r\n\r\n");
                std::string body = "";
                if (bodyPos != std::string::npos) {
                    body = request.substr(bodyPos + 4);
                }

                std::string response = algometrics::handleRequest(method, path, body);

#ifdef _WIN32
                send(client_sock, response.c_str(), response.length(), 0);
                closesocket(client_sock);
#else
                write(client_sock, response.c_str(), response.length());
                close(client_sock);
#endif
            } else {
#ifdef _WIN32
                closesocket(client_sock);
#else
                close(client_sock);
#endif
            }
        }).detach();
    }

#ifdef _WIN32
    closesocket(server_fd);
    WSACleanup();
#else
    close(server_fd);
#endif

    return 0;
}
