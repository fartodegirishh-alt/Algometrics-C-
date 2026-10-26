# AlgoMetrics C++ Backend

A **100% pure C++17** backend service for executing, instrumenting, and benchmarking searching and sorting algorithms.

- **Zero Java**
- **Zero external dependencies** (uses standard C++17 library and standard POSIX/Winsock sockets)
- Tracks exact empirical comparisons line-by-line using `InstrumentedInt`.

---

## Files

- `algorithms.hpp`: Core C++ implementation of Bubble Sort, Selection Sort, Insertion Sort, Linear Search, and Binary Search, along with the `InstrumentedInt` operator-overloaded comparison tracker and JSON serializer.
- `server.cpp`: Standalone multi-threaded C++ HTTP REST API server listening on port `8080`.
- `cli.cpp`: Standalone command-line executable demonstrating C++ algorithm execution and metrics printing.
- `Makefile`: Build script for `g++` / `clang++`.
- `CMakeLists.txt`: Standard CMake build file.

---

## Building and Running

### 1. Using Make
```bash
cd backend
make
```

### 2. Manual Compilation with GCC (C++17)
```bash
# Compile Server
g++ -std=c++17 -O2 server.cpp -o algo_server -lpthread

# Compile CLI
g++ -std=c++17 -O2 cli.cpp -o algo_cli
```

### 3. Run the C++ Server
```bash
./algo_server 8080
```
Server will start and serve:
- `GET  /api/status`
- `GET  /api/algorithms`
- `POST /api/execute`

### 4. Run the C++ CLI
```bash
./algo_cli
```
