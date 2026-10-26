#ifndef ALGORITHMS_HPP
#define ALGORITHMS_HPP

#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <memory>
#include <cmath>
#include <algorithm>
#include <chrono>

namespace algometrics {

// Tracker for operations performed during execution
struct ExecutionMetrics {
    uint64_t comparisons = 0;

    void reset() {
        comparisons = 0;
    }
};

inline ExecutionMetrics g_metrics;

// Instrumented Integer to track exact comparisons
class InstrumentedInt {
public:
    int value;

    InstrumentedInt() : value(0) {}
    InstrumentedInt(int v) : value(v) {}
    InstrumentedInt(const InstrumentedInt& o) : value(o.value) {}

    InstrumentedInt& operator=(const InstrumentedInt& o) {
        value = o.value;
        return *this;
    }

    InstrumentedInt& operator=(int v) {
        value = v;
        return *this;
    }

    bool operator<(const InstrumentedInt& o) const {
        g_metrics.comparisons++;
        return value < o.value;
    }

    bool operator>(const InstrumentedInt& o) const {
        g_metrics.comparisons++;
        return value > o.value;
    }

    bool operator<=(const InstrumentedInt& o) const {
        g_metrics.comparisons++;
        return value <= o.value;
    }

    bool operator>=(const InstrumentedInt& o) const {
        g_metrics.comparisons++;
        return value >= o.value;
    }

    bool operator==(const InstrumentedInt& o) const {
        g_metrics.comparisons++;
        return value == o.value;
    }

    bool operator!=(const InstrumentedInt& o) const {
        g_metrics.comparisons++;
        return value != o.value;
    }
};

struct ExecutionStep {
    int stepNumber;
    int lineNumber;
    std::string code;
    std::vector<int> arrayState;
    std::vector<int> comparingIndices;
    std::vector<int> swappedIndices;
    uint64_t comparisonsSoFar;
    std::string description;
};

struct AlgorithmResult {
    std::string algorithmId;
    std::string algorithmName;
    std::string timeComplexity;
    uint64_t totalComparisons;
    std::vector<ExecutionStep> steps;
};

// 1. Bubble Sort
inline AlgorithmResult runBubbleSort(std::vector<int> input) {
    g_metrics.reset();
    AlgorithmResult result;
    result.algorithmId = "bubble-sort";
    result.algorithmName = "Bubble Sort";
    result.timeComplexity = "O(n²)";

    std::vector<InstrumentedInt> arr;
    for (int v : input) arr.emplace_back(v);

    int n = static_cast<int>(arr.size());
    int step = 0;

    auto recordStep = [&](int line, const std::string& code, const std::vector<int>& cmp, const std::vector<int>& swp, const std::string& desc) {
        ExecutionStep s;
        s.stepNumber = ++step;
        s.lineNumber = line;
        s.code = code;
        for (const auto& item : arr) s.arrayState.push_back(item.value);
        s.comparingIndices = cmp;
        s.swappedIndices = swp;
        s.comparisonsSoFar = g_metrics.comparisons;
        s.description = desc;
        result.steps.push_back(s);
    };

    recordStep(1, "int n = arr.size();", {}, {}, "Initialized array length n = " + std::to_string(n));

    for (int i = 0; i < n - 1; ++i) {
        bool swapped = false;
        recordStep(2, "for (int i = 0; i < n - 1; ++i)", {}, {}, "Starting outer pass i = " + std::to_string(i));

        for (int j = 0; j < n - i - 1; ++j) {
            recordStep(4, "if (arr[j] > arr[j + 1])", {j, j + 1}, {}, "Comparing arr[" + std::to_string(j) + "] and arr[" + std::to_string(j + 1) + "]");
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true;
                recordStep(5, "std::swap(arr[j], arr[j + 1]);", {}, {j, j + 1}, "Swapped out-of-order elements at " + std::to_string(j) + " and " + std::to_string(j + 1));
            }
        }
        if (!swapped) {
            recordStep(8, "if (!swapped) break;", {}, {}, "No swaps occurred in this pass; array is already sorted.");
            break;
        }
    }

    recordStep(10, "return arr;", {}, {}, "Bubble sort complete.");
    result.totalComparisons = g_metrics.comparisons;
    return result;
}

// 2. Selection Sort
inline AlgorithmResult runSelectionSort(std::vector<int> input) {
    g_metrics.reset();
    AlgorithmResult result;
    result.algorithmId = "selection-sort";
    result.algorithmName = "Selection Sort";
    result.timeComplexity = "O(n²)";

    std::vector<InstrumentedInt> arr;
    for (int v : input) arr.emplace_back(v);

    int n = static_cast<int>(arr.size());
    int step = 0;

    auto recordStep = [&](int line, const std::string& code, const std::vector<int>& cmp, const std::vector<int>& swp, const std::string& desc) {
        ExecutionStep s;
        s.stepNumber = ++step;
        s.lineNumber = line;
        s.code = code;
        for (const auto& item : arr) s.arrayState.push_back(item.value);
        s.comparingIndices = cmp;
        s.swappedIndices = swp;
        s.comparisonsSoFar = g_metrics.comparisons;
        s.description = desc;
        result.steps.push_back(s);
    };

    recordStep(1, "int n = arr.size();", {}, {}, "Array size = " + std::to_string(n));

    for (int i = 0; i < n - 1; ++i) {
        int minIdx = i;
        recordStep(3, "int minIdx = i;", {}, {}, "Set current minimum index to " + std::to_string(i));

        for (int j = i + 1; j < n; ++j) {
            recordStep(5, "if (arr[j] < arr[minIdx])", {j, minIdx}, {}, "Comparing candidate arr[" + std::to_string(j) + "] with minimum arr[" + std::to_string(minIdx) + "]");
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
                recordStep(6, "minIdx = j;", {}, {}, "Found new minimum index at " + std::to_string(minIdx));
            }
        }

        if (minIdx != i) {
            std::swap(arr[i], arr[minIdx]);
            recordStep(8, "std::swap(arr[i], arr[minIdx]);", {}, {i, minIdx}, "Swapped element into sorted position at index " + std::to_string(i));
        }
    }

    recordStep(10, "return arr;", {}, {}, "Selection sort complete.");
    result.totalComparisons = g_metrics.comparisons;
    return result;
}

// 3. Insertion Sort
inline AlgorithmResult runInsertionSort(std::vector<int> input) {
    g_metrics.reset();
    AlgorithmResult result;
    result.algorithmId = "insertion-sort";
    result.algorithmName = "Insertion Sort";
    result.timeComplexity = "O(n²)";

    std::vector<InstrumentedInt> arr;
    for (int v : input) arr.emplace_back(v);

    int n = static_cast<int>(arr.size());
    int step = 0;

    auto recordStep = [&](int line, const std::string& code, const std::vector<int>& cmp, const std::vector<int>& swp, const std::string& desc) {
        ExecutionStep s;
        s.stepNumber = ++step;
        s.lineNumber = line;
        s.code = code;
        for (const auto& item : arr) s.arrayState.push_back(item.value);
        s.comparingIndices = cmp;
        s.swappedIndices = swp;
        s.comparisonsSoFar = g_metrics.comparisons;
        s.description = desc;
        result.steps.push_back(s);
    };

    recordStep(1, "int n = arr.size();", {}, {}, "Array size = " + std::to_string(n));

    for (int i = 1; i < n; ++i) {
        InstrumentedInt key = arr[i];
        int j = i - 1;
        recordStep(3, "int key = arr[i]; int j = i - 1;", {}, {}, "Extracting key arr[" + std::to_string(i) + "] = " + std::to_string(key.value));

        while (j >= 0) {
            recordStep(5, "while (j >= 0 && arr[j] > key)", {j}, {}, "Comparing arr[" + std::to_string(j) + "] > key (" + std::to_string(key.value) + ")");
            if (arr[j] > key) {
                arr[j + 1] = arr[j];
                recordStep(6, "arr[j + 1] = arr[j];", {}, {j + 1}, "Shifted arr[" + std::to_string(j) + "] rightward to index " + std::to_string(j + 1));
                j--;
            } else {
                break;
            }
        }
        arr[j + 1] = key;
        recordStep(9, "arr[j + 1] = key;", {}, {j + 1}, "Inserted key into sorted position at index " + std::to_string(j + 1));
    }

    recordStep(11, "return arr;", {}, {}, "Insertion sort complete.");
    result.totalComparisons = g_metrics.comparisons;
    return result;
}

// 4. Linear Search
inline AlgorithmResult runLinearSearch(std::vector<int> input, int target) {
    g_metrics.reset();
    AlgorithmResult result;
    result.algorithmId = "linear-search";
    result.algorithmName = "Linear Search";
    result.timeComplexity = "O(n)";

    std::vector<InstrumentedInt> arr;
    for (int v : input) arr.emplace_back(v);
    InstrumentedInt targetItem(target);

    int n = static_cast<int>(arr.size());
    int step = 0;

    auto recordStep = [&](int line, const std::string& code, const std::vector<int>& cmp, const std::string& desc) {
        ExecutionStep s;
        s.stepNumber = ++step;
        s.lineNumber = line;
        s.code = code;
        for (const auto& item : arr) s.arrayState.push_back(item.value);
        s.comparingIndices = cmp;
        s.comparisonsSoFar = g_metrics.comparisons;
        s.description = desc;
        result.steps.push_back(s);
    };

    recordStep(1, "int n = arr.size();", {}, "Starting linear search for target = " + std::to_string(target));

    int foundIndex = -1;
    for (int i = 0; i < n; ++i) {
        recordStep(3, "if (arr[i] == target)", {i}, "Checking arr[" + std::to_string(i) + "] == " + std::to_string(target));
        if (arr[i] == targetItem) {
            foundIndex = i;
            recordStep(4, "return i;", {i}, "Target found at index " + std::to_string(i));
            break;
        }
    }

    if (foundIndex == -1) {
        recordStep(6, "return -1;", {}, "Target not found in array.");
    }

    result.totalComparisons = g_metrics.comparisons;
    return result;
}

// 5. Binary Search
inline AlgorithmResult runBinarySearch(std::vector<int> input, int target) {
    g_metrics.reset();
    AlgorithmResult result;
    result.algorithmId = "binary-search";
    result.algorithmName = "Binary Search";
    result.timeComplexity = "O(log n)";

    // Binary search requires sorted array
    std::sort(input.begin(), input.end());

    std::vector<InstrumentedInt> arr;
    for (int v : input) arr.emplace_back(v);
    InstrumentedInt targetItem(target);

    int n = static_cast<int>(arr.size());
    int step = 0;

    auto recordStep = [&](int line, const std::string& code, const std::vector<int>& cmp, const std::string& desc) {
        ExecutionStep s;
        s.stepNumber = ++step;
        s.lineNumber = line;
        s.code = code;
        for (const auto& item : arr) s.arrayState.push_back(item.value);
        s.comparingIndices = cmp;
        s.comparisonsSoFar = g_metrics.comparisons;
        s.description = desc;
        result.steps.push_back(s);
    };

    int low = 0;
    int high = n - 1;
    recordStep(1, "int low = 0, high = n - 1;", {}, "Initialized search boundaries [0, " + std::to_string(high) + "] for target " + std::to_string(target));

    bool found = false;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        recordStep(3, "int mid = low + (high - low) / 2;", {mid}, "Calculated midpoint mid = " + std::to_string(mid));

        recordStep(4, "if (arr[mid] == target)", {mid}, "Comparing arr[" + std::to_string(mid) + "] == " + std::to_string(target));
        if (arr[mid] == targetItem) {
            recordStep(5, "return mid;", {mid}, "Target found at index " + std::to_string(mid));
            found = true;
            break;
        }

        recordStep(7, "else if (arr[mid] < target)", {mid}, "Checking if arr[" + std::to_string(mid) + "] < " + std::to_string(target));
        if (arr[mid] < targetItem) {
            low = mid + 1;
            recordStep(8, "low = mid + 1;", {}, "Target is in right half; moving low to " + std::to_string(low));
        } else {
            high = mid - 1;
            recordStep(10, "high = mid - 1;", {}, "Target is in left half; moving high to " + std::to_string(high));
        }
    }

    if (!found) {
        recordStep(12, "return -1;", {}, "Target not found within boundaries.");
    }

    result.totalComparisons = g_metrics.comparisons;
    return result;
}

// Convert AlgorithmResult to JSON
inline std::string resultToJson(const AlgorithmResult& res) {
    std::ostringstream ss;
    ss << "{\n";
    ss << "  \"algorithmId\": \"" << res.algorithmId << "\",\n";
    ss << "  \"algorithmName\": \"" << res.algorithmName << "\",\n";
    ss << "  \"timeComplexity\": \"" << res.timeComplexity << "\",\n";
    ss << "  \"totalComparisons\": " << res.totalComparisons << ",\n";
    ss << "  \"steps\": [\n";

    for (size_t i = 0; i < res.steps.size(); ++i) {
        const auto& s = res.steps[i];
        ss << "    {\n";
        ss << "      \"stepNumber\": " << s.stepNumber << ",\n";
        ss << "      \"lineNumber\": " << s.lineNumber << ",\n";
        ss << "      \"code\": \"" << s.code << "\",\n";
        ss << "      \"comparisonsSoFar\": " << s.comparisonsSoFar << ",\n";
        ss << "      \"description\": \"" << s.description << "\",\n";
        
        // arrayState
        ss << "      \"arrayState\": [";
        for (size_t a = 0; a < s.arrayState.size(); ++a) {
            ss << s.arrayState[a] << (a + 1 < s.arrayState.size() ? "," : "");
        }
        ss << "],\n";

        // comparingIndices
        ss << "      \"comparingIndices\": [";
        for (size_t c = 0; c < s.comparingIndices.size(); ++c) {
            ss << s.comparingIndices[c] << (c + 1 < s.comparingIndices.size() ? "," : "");
        }
        ss << "]\n";

        ss << "    }" << (i + 1 < res.steps.size() ? "," : "") << "\n";
    }

    ss << "  ]\n";
    ss << "}\n";
    return ss.str();
}

} // namespace algometrics

#endif // ALGORITHMS_HPP
