import { InputDistribution } from '../types/algorithm';

export function generateStandaloneCpp(
  algorithmName: string,
  algorithmCodeSnippet: string,
  algorithmCallSnippet: string,
  isSearch: boolean,
  defaultSize: number = 10,
  distribution: InputDistribution = 'random'
): string {
  return `/**
 * ============================================================================
 * Algorithm Complexity & Instrumentation Lab (C++17)
 * Algorithm: ${algorithmName}
 * Purpose: Line-by-line execution, tracking empirical comparisons & assignments,
 *          and comparing against theoretical Big-O asymptotic bounds.
 *
 * Compile: g++ -std=c++17 -O2 main.cpp -o main
 * Execute: ./main
 * ============================================================================
 */

#include <iostream>
#include <vector>
#include <iomanip>
#include <cmath>
#include <random>
#include <algorithm>
#include <chrono>
#include <string>

// Global metrics tracker for real C++ execution
struct OperationMetrics {
    static inline uint64_t comparisons = 0;
    static inline uint64_t assignments = 0;
    static inline uint64_t arrayAccesses = 0;

    static void reset() {
        comparisons = 0;
        assignments = 0;
        arrayAccesses = 0;
    }
};

/**
 * Instrumented type wrapping an integer. Overloads relational and assignment
 * operators to automatically tally exact empirical operation counts.
 */
class InstrumentedInt {
private:
    int value;

public:
    InstrumentedInt() : value(0) {
        OperationMetrics::assignments++;
    }

    InstrumentedInt(int val) : value(val) {
        OperationMetrics::assignments++;
    }

    InstrumentedInt(const InstrumentedInt& other) : value(other.value) {
        OperationMetrics::assignments++;
    }

    InstrumentedInt(InstrumentedInt&& other) noexcept : value(other.value) {
        OperationMetrics::assignments++;
    }

    InstrumentedInt& operator=(const InstrumentedInt& other) {
        OperationMetrics::assignments++;
        this->value = other.value;
        return *this;
    }

    InstrumentedInt& operator=(InstrumentedInt&& other) noexcept {
        OperationMetrics::assignments++;
        this->value = other.value;
        return *this;
    }

    InstrumentedInt& operator=(int val) {
        OperationMetrics::assignments++;
        this->value = val;
        return *this;
    }

    bool operator<(const InstrumentedInt& other) const {
        OperationMetrics::comparisons++;
        return this->value < other.value;
    }

    bool operator>(const InstrumentedInt& other) const {
        OperationMetrics::comparisons++;
        return this->value > other.value;
    }

    bool operator<=(const InstrumentedInt& other) const {
        OperationMetrics::comparisons++;
        return this->value <= other.value;
    }

    bool operator>=(const InstrumentedInt& other) const {
        OperationMetrics::comparisons++;
        return this->value >= other.value;
    }

    bool operator==(const InstrumentedInt& other) const {
        OperationMetrics::comparisons++;
        return this->value == other.value;
    }

    bool operator!=(const InstrumentedInt& other) const {
        OperationMetrics::comparisons++;
        return this->value != other.value;
    }

    int get() const { return value; }
    friend std::ostream& operator<<(std::ostream& os, const InstrumentedInt& obj) {
        return os << obj.value;
    }
};

// ============================================================================
// ALGORITHM IMPLEMENTATION (C++ with exact line costs)
// ============================================================================
${algorithmCodeSnippet}

// ============================================================================
// DATASET GENERATION HELPERS
// ============================================================================
std::vector<InstrumentedInt> generateDataset(int n, const std::string& distribution) {
    std::vector<InstrumentedInt> arr(n);
    std::mt19937 rng(42); // deterministic seed for reproducibility

    if (distribution == "sorted") {
        for (int i = 0; i < n; i++) arr[i] = i * 2 + 1;
    } else if (distribution == "reversed") {
        for (int i = 0; i < n; i++) arr[i] = (n - i) * 2;
    } else if (distribution == "nearly_sorted") {
        for (int i = 0; i < n; i++) arr[i] = i * 2;
        int swaps = std::max(1, n / 10);
        for (int s = 0; s < swaps; s++) {
            int i1 = rng() % n;
            int i2 = std::min(n - 1, std::max(0, i1 + 1));
            std::swap(arr[i1], arr[i2]);
        }
    } else { // random
        std::uniform_int_distribution<int> dist(10, 999);
        for (int i = 0; i < n; i++) arr[i] = dist(rng);
    }
    return arr;
}

// ============================================================================
// MAIN BENCHMARK & COMPARISON HARNESS
// ============================================================================
int main() {
    std::cout << "===============================================================\\n";
    std::cout << "   C++ Algorithm Execution & Complexity Analysis Lab           \\n";
    std::cout << "   Algorithm: ${algorithmName}\\n";
    std::cout << "===============================================================\\n\\n";

    // 1. Single Detailed Execution on sample size N = ${defaultSize}
    {
        int n = ${defaultSize};
        std::cout << "--- 1. Single Execution Trace (N = " << n << ") ---\\n";
        auto arr = generateDataset(n, "${distribution}");
        std::cout << "Initial array: [ ";
        for (const auto& x : arr) std::cout << x << " ";
        std::cout << "]\\n";

        OperationMetrics::reset();
        auto start = std::chrono::high_resolution_clock::now();

        ${algorithmCallSnippet}

        auto finish = std::chrono::high_resolution_clock::now();
        std::chrono::duration<double, std::micro> elapsed = finish - start;

        std::cout << "Result array:  [ ";
        for (const auto& x : arr) std::cout << x << " ";
        std::cout << "]\\n";
        std::cout << "Observed Comparisons: " << OperationMetrics::comparisons << "\\n";
        std::cout << "Observed Assignments: " << OperationMetrics::assignments << "\\n";
        std::cout << "Total Operations:     " << (OperationMetrics::comparisons + OperationMetrics::assignments) << "\\n";
        std::cout << "Execution Time:       " << std::fixed << std::setprecision(2) << elapsed.count() << " us\\n\\n";
    }

    // 2. Asymptotic Scaling Benchmark across various N
    {
        std::cout << "--- 2. Empirical Operation Counts vs. Theoretical Bounds ---\\n";
        std::vector<int> sampleSizes = { 10, 20, 50, 100, 200, 500, 1000 };

        std::cout << std::left
                  << std::setw(8)  << "N"
                  << std::setw(15) << "Obs. Comp."
                  << std::setw(15) << "Obs. Assign."
                  << std::setw(15) << "Total Ops"
                  << std::setw(15) << "Time (us)"
                  << "\\n";
        std::cout << std::string(68, '-') << "\\n";

        for (int n : sampleSizes) {
            auto arr = generateDataset(n, "${distribution}");
            OperationMetrics::reset();

            auto start = std::chrono::high_resolution_clock::now();
            ${algorithmCallSnippet}
            auto finish = std::chrono::high_resolution_clock::now();
            std::chrono::duration<double, std::micro> elapsed = finish - start;

            uint64_t total = OperationMetrics::comparisons + OperationMetrics::assignments;

            std::cout << std::left
                      << std::setw(8)  << n
                      << std::setw(15) << OperationMetrics::comparisons
                      << std::setw(15) << OperationMetrics::assignments
                      << std::setw(15) << total
                      << std::setw(15) << std::fixed << std::setprecision(1) << elapsed.count()
                      << "\\n";
        }
        std::cout << std::string(68, '-') << "\\n";
    }

    return 0;
}
`;
}
