/**
 * ============================================================================
 * AlgoMetrics C++ Command Line Interface (CLI)
 * ============================================================================
 * Run any algorithm directly in terminal, counting exact comparisons
 * and printing step-by-step state in pure C++ (C++17).
 * ============================================================================
 */

#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include "algorithms.hpp"

int main() {
    std::cout << "========================================================\n";
    std::cout << "  AlgoMetrics C++ Algorithm Execution Engine (CLI)\n";
    std::cout << "  Pure C++17 Runtime & Operation Instrumentation\n";
    std::cout << "========================================================\n\n";

    std::vector<int> sampleArray = {45, 12, 89, 34, 25, 7, 63, 51};

    std::cout << "Initial Array: [";
    for (size_t i = 0; i < sampleArray.size(); ++i) {
        std::cout << sampleArray[i] << (i + 1 < sampleArray.size() ? ", " : "");
    }
    std::cout << "]\n\n";

    // 1. Bubble Sort
    std::cout << "--- 1. Executing Bubble Sort in Pure C++ ---\n";
    auto bRes = algometrics::runBubbleSort(sampleArray);
    std::cout << "Theoretical Complexity: " << bRes.timeComplexity << "\n";
    std::cout << "Observed Comparisons:   " << bRes.totalComparisons << "\n";
    std::cout << "Recorded Step Count:    " << bRes.steps.size() << "\n\n";

    // 2. Selection Sort
    std::cout << "--- 2. Executing Selection Sort in Pure C++ ---\n";
    auto sRes = algometrics::runSelectionSort(sampleArray);
    std::cout << "Theoretical Complexity: " << sRes.timeComplexity << "\n";
    std::cout << "Observed Comparisons:   " << sRes.totalComparisons << "\n\n";

    // 3. Insertion Sort
    std::cout << "--- 3. Executing Insertion Sort in Pure C++ ---\n";
    auto iRes = algometrics::runInsertionSort(sampleArray);
    std::cout << "Theoretical Complexity: " << iRes.timeComplexity << "\n";
    std::cout << "Observed Comparisons:   " << iRes.totalComparisons << "\n\n";

    // 4. Merge Sort
    std::cout << "--- 4. Executing Merge Sort in Pure C++ ---\n";
    auto mRes = algometrics::runMergeSort(sampleArray);
    std::cout << "Theoretical Complexity: " << mRes.timeComplexity << "\n";
    std::cout << "Observed Comparisons:   " << mRes.totalComparisons << "\n\n";

    // 5. Heap Sort
    std::cout << "--- 5. Executing Heap Sort in Pure C++ ---\n";
    auto hRes = algometrics::runHeapSort(sampleArray);
    std::cout << "Theoretical Complexity: " << hRes.timeComplexity << "\n";
    std::cout << "Observed Comparisons:   " << hRes.totalComparisons << "\n\n";

    // 6. Linear Search
    std::cout << "--- 6. Executing Linear Search for target = 34 ---\n";
    auto lRes = algometrics::runLinearSearch(sampleArray, 34);
    std::cout << "Theoretical Complexity: " << lRes.timeComplexity << "\n";
    std::cout << "Observed Comparisons:   " << lRes.totalComparisons << "\n\n";

    // 7. Binary Search
    std::cout << "--- 7. Executing Binary Search for target = 34 ---\n";
    auto binRes = algometrics::runBinarySearch(sampleArray, 34);
    std::cout << "Theoretical Complexity: " << binRes.timeComplexity << "\n";
    std::cout << "Observed Comparisons:   " << binRes.totalComparisons << "\n\n";

    std::cout << "All C++ algorithms executed successfully with zero Java!\n";
    return 0;
}
