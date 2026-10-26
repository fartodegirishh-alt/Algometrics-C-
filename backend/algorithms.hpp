#ifndef ALGORITHMS_HPP
#define ALGORITHMS_HPP

#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <cmath>
#include <algorithm>

namespace algometrics {

struct ExecutionMetrics {
    uint64_t comparisons = 0;

    void reset() {
        comparisons = 0;
    }
};

inline ExecutionMetrics g_metrics;

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

// 1. Bubble Sort (User Code)
inline AlgorithmResult runBubbleSort(std::vector<int> input) {
    g_metrics.reset();
    AlgorithmResult result;
    result.algorithmId = "bubble-sort";
    result.algorithmName = "Bubble Sort";
    result.timeComplexity = "O(n²)";

    std::vector<InstrumentedInt> a;
    for (int v : input) a.emplace_back(v);
    int n = static_cast<int>(a.size());
    int step = 0;

    auto recordStep = [&](int line, const std::string& code, const std::vector<int>& cmp, const std::vector<int>& swp, const std::string& desc) {
        ExecutionStep s;
        s.stepNumber = ++step;
        s.lineNumber = line;
        s.code = code;
        for (const auto& item : a) s.arrayState.push_back(item.value);
        s.comparingIndices = cmp;
        s.swappedIndices = swp;
        s.comparisonsSoFar = g_metrics.comparisons;
        s.description = desc;
        result.steps.push_back(s);
    };

    recordStep(1, "void bubbleSort(int a[], int n)", {}, {}, "Entering bubbleSort");
    recordStep(3, "int temp;", {}, {}, "Declared temp");

    for (int i = 0; i < n - 1; i++) {
        recordStep(4, "for (int i = 0; i < n - 1; i++)", {}, {}, "Outer pass i = " + std::to_string(i));
        for (int j = 0; j < n - i - 1; j++) {
            recordStep(6, "for (int j = 0; j < n - i - 1; j++)", {}, {}, "Inner check j = " + std::to_string(j));
            recordStep(8, "if (a[j] > a[j + 1])", {j, j + 1}, {}, "Comparing a[" + std::to_string(j) + "] and a[" + std::to_string(j + 1) + "]");
            if (a[j] > a[j + 1]) {
                InstrumentedInt temp = a[j];
                recordStep(10, "temp = a[j];", {}, {j}, "Saved temp = " + std::to_string(temp.value));
                a[j] = a[j + 1];
                recordStep(11, "a[j] = a[j + 1];", {}, {j, j + 1}, "Shifted right element left");
                a[j + 1] = temp;
                recordStep(12, "a[j + 1] = temp;", {}, {j, j + 1}, "Completed swap");
            }
        }
    }

    recordStep(16, "}", {}, {}, "Bubble sort complete");
    result.totalComparisons = g_metrics.comparisons;
    return result;
}

// 2. Selection Sort (User Code)
inline AlgorithmResult runSelectionSort(std::vector<int> input) {
    g_metrics.reset();
    AlgorithmResult result;
    result.algorithmId = "selection-sort";
    result.algorithmName = "Selection Sort";
    result.timeComplexity = "O(n²)";

    std::vector<InstrumentedInt> a;
    for (int v : input) a.emplace_back(v);
    int n = static_cast<int>(a.size());
    int step = 0;

    auto recordStep = [&](int line, const std::string& code, const std::vector<int>& cmp, const std::vector<int>& swp, const std::string& desc) {
        ExecutionStep s;
        s.stepNumber = ++step;
        s.lineNumber = line;
        s.code = code;
        for (const auto& item : a) s.arrayState.push_back(item.value);
        s.comparingIndices = cmp;
        s.swappedIndices = swp;
        s.comparisonsSoFar = g_metrics.comparisons;
        s.description = desc;
        result.steps.push_back(s);
    };

    recordStep(1, "void selectionSort(int a[], int n)", {}, {}, "Entering selectionSort");
    recordStep(3, "int minIndex, temp;", {}, {}, "Declared minIndex, temp");

    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;
        recordStep(4, "for (int i = 0; i < n - 1; i++)", {}, {}, "Outer loop i = " + std::to_string(i));
        recordStep(6, "minIndex = i;", {}, {}, "minIndex = " + std::to_string(minIndex));

        for (int j = i + 1; j < n; j++) {
            recordStep(7, "for (int j = i + 1; j < n; j++)", {}, {}, "Inner loop j = " + std::to_string(j));
            recordStep(9, "if (a[j] < a[minIndex])", {j, minIndex}, {}, "Comparing a[" + std::to_string(j) + "] < a[minIndex]");
            if (a[j] < a[minIndex]) {
                minIndex = j;
                recordStep(10, "minIndex = j;", {}, {}, "New minIndex = " + std::to_string(minIndex));
            }
        }

        InstrumentedInt temp = a[i];
        recordStep(12, "temp = a[i];", {}, {i}, "temp = a[" + std::to_string(i) + "]");
        a[i] = a[minIndex];
        recordStep(13, "a[i] = a[minIndex];", {}, {i, minIndex}, "Moved min to index " + std::to_string(i));
        a[minIndex] = temp;
        recordStep(14, "a[minIndex] = temp;", {}, {i, minIndex}, "Completed swap");
    }

    recordStep(16, "}", {}, {}, "Selection sort complete");
    result.totalComparisons = g_metrics.comparisons;
    return result;
}

// 3. Insertion Sort (User Code)
inline AlgorithmResult runInsertionSort(std::vector<int> input) {
    g_metrics.reset();
    AlgorithmResult result;
    result.algorithmId = "insertion-sort";
    result.algorithmName = "Insertion Sort";
    result.timeComplexity = "O(n²)";

    std::vector<InstrumentedInt> a;
    for (int v : input) a.emplace_back(v);
    int n = static_cast<int>(a.size());
    int step = 0;

    auto recordStep = [&](int line, const std::string& code, const std::vector<int>& cmp, const std::vector<int>& swp, const std::string& desc) {
        ExecutionStep s;
        s.stepNumber = ++step;
        s.lineNumber = line;
        s.code = code;
        for (const auto& item : a) s.arrayState.push_back(item.value);
        s.comparingIndices = cmp;
        s.swappedIndices = swp;
        s.comparisonsSoFar = g_metrics.comparisons;
        s.description = desc;
        result.steps.push_back(s);
    };

    recordStep(1, "void insertionSort(int a[], int n)", {}, {}, "Entering insertionSort");
    recordStep(3, "int key, j;", {}, {}, "Declared key, j");

    for (int i = 1; i < n; i++) {
        InstrumentedInt key = a[i];
        int j = i - 1;
        recordStep(4, "for (int i = 1; i < n; i++)", {}, {}, "Inserting element i = " + std::to_string(i));
        recordStep(6, "key = a[i];", {}, {}, "key = " + std::to_string(key.value));
        recordStep(7, "j = i - 1;", {}, {}, "j = " + std::to_string(j));

        while (j >= 0) {
            recordStep(8, "while (j >= 0 && a[j] > key)", {j}, {}, "Comparing a[" + std::to_string(j) + "] > key (" + std::to_string(key.value) + ")");
            if (a[j] > key) {
                a[j + 1] = a[j];
                recordStep(10, "a[j + 1] = a[j];", {}, {j + 1}, "Slid element rightward to index " + std::to_string(j + 1));
                j--;
                recordStep(11, "j--;", {}, {}, "j is now " + std::to_string(j));
            } else {
                break;
            }
        }
        a[j + 1] = key;
        recordStep(13, "a[j + 1] = key;", {}, {j + 1}, "Inserted key at index " + std::to_string(j + 1));
    }

    recordStep(15, "}", {}, {}, "Insertion sort complete");
    result.totalComparisons = g_metrics.comparisons;
    return result;
}

// 4. Merge Sort (User Code)
inline AlgorithmResult runMergeSort(std::vector<int> input) {
    g_metrics.reset();
    AlgorithmResult result;
    result.algorithmId = "merge-sort";
    result.algorithmName = "Merge Sort";
    result.timeComplexity = "O(n log n)";

    std::vector<InstrumentedInt> a;
    for (int v : input) a.emplace_back(v);
    int n = static_cast<int>(a.size());
    int step = 0;

    auto recordStep = [&](int line, const std::string& code, const std::vector<int>& cmp, const std::vector<int>& swp, const std::string& desc) {
        ExecutionStep s;
        s.stepNumber = ++step;
        s.lineNumber = line;
        s.code = code;
        for (const auto& item : a) s.arrayState.push_back(item.value);
        s.comparingIndices = cmp;
        s.swappedIndices = swp;
        s.comparisonsSoFar = g_metrics.comparisons;
        s.description = desc;
        result.steps.push_back(s);
    };

    std::vector<InstrumentedInt> temp(std::max(50, n));

    auto merge = [&](auto& self, int low, int mid, int high) -> void {
        int i = low;
        int j = mid + 1;
        int k = low;
        recordStep(1, "void merge(int a[], int low, int mid, int high)", {}, {}, "merge: [" + std::to_string(low) + ".." + std::to_string(high) + "]");

        while (i <= mid && j <= high) {
            recordStep(9, "if (a[i] <= a[j])", {i, j}, {}, "Comparing a[" + std::to_string(i) + "] <= a[" + std::to_string(j) + "]");
            if (a[i] <= a[j]) {
                temp[k++] = a[i++];
            } else {
                temp[k++] = a[j++];
            }
        }
        while (i <= mid) {
            temp[k++] = a[i++];
        }
        while (j <= high) {
            temp[k++] = a[j++];
        }
        for (int idx = low; idx <= high; idx++) {
            a[idx] = temp[idx];
            recordStep(19, "a[i] = temp[i];", {}, {idx}, "Merged element into position " + std::to_string(idx));
        }
    };

    auto mergeSort = [&](auto& self, int low, int high) -> void {
        if (low < high) {
            int mid = (low + high) / 2;
            self(self, low, mid);
            self(self, mid + 1, high);
            merge(merge, low, mid, high);
        }
    };

    if (n > 1) {
        mergeSort(mergeSort, 0, n - 1);
    }

    recordStep(30, "}", {}, {}, "Merge sort complete");
    result.totalComparisons = g_metrics.comparisons;
    return result;
}

// 5. Heap Sort (User Code)
inline AlgorithmResult runHeapSort(std::vector<int> input) {
    g_metrics.reset();
    AlgorithmResult result;
    result.algorithmId = "heap-sort";
    result.algorithmName = "Heap Sort";
    result.timeComplexity = "O(n log n)";

    std::vector<InstrumentedInt> a;
    for (int v : input) a.emplace_back(v);
    int n = static_cast<int>(a.size());
    int step = 0;

    auto recordStep = [&](int line, const std::string& code, const std::vector<int>& cmp, const std::vector<int>& swp, const std::string& desc) {
        ExecutionStep s;
        s.stepNumber = ++step;
        s.lineNumber = line;
        s.code = code;
        for (const auto& item : a) s.arrayState.push_back(item.value);
        s.comparingIndices = cmp;
        s.swappedIndices = swp;
        s.comparisonsSoFar = g_metrics.comparisons;
        s.description = desc;
        result.steps.push_back(s);
    };

    auto heapify = [&](auto& self, int size, int i) -> void {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < size) {
            recordStep(6, "if (left < n && a[left] > a[largest])", {left, largest}, {}, "Checking left child > largest");
            if (a[left] > a[largest]) {
                largest = left;
            }
        }
        if (right < size) {
            recordStep(8, "if (right < n && a[right] > a[largest])", {right, largest}, {}, "Checking right child > largest");
            if (a[right] > a[largest]) {
                largest = right;
            }
        }
        if (largest != i) {
            std::swap(a[i], a[largest]);
            recordStep(12, "swap(a[i], a[largest]);", {}, {i, largest}, "Swapped root with child");
            self(self, size, largest);
        }
    };

    recordStep(16, "void heapSort(int a[], int n)", {}, {}, "Entering heapSort");
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(heapify, n, i);
    }
    for (int i = n - 1; i > 0; i--) {
        std::swap(a[0], a[i]);
        recordStep(22, "swap(a[0], a[i]);", {}, {0, i}, "Moved root max to position " + std::to_string(i));
        heapify(heapify, i, 0);
    }

    recordStep(25, "}", {}, {}, "Heap sort complete");
    result.totalComparisons = g_metrics.comparisons;
    return result;
}

// 6. Linear Search (User Code)
inline AlgorithmResult runLinearSearch(std::vector<int> input, int key) {
    g_metrics.reset();
    AlgorithmResult result;
    result.algorithmId = "linear-search";
    result.algorithmName = "Linear Search";
    result.timeComplexity = "O(n)";

    std::vector<InstrumentedInt> a;
    for (int v : input) a.emplace_back(v);
    InstrumentedInt targetItem(key);
    int n = static_cast<int>(a.size());
    int step = 0;

    auto recordStep = [&](int line, const std::string& code, const std::vector<int>& cmp, const std::string& desc) {
        ExecutionStep s;
        s.stepNumber = ++step;
        s.lineNumber = line;
        s.code = code;
        for (const auto& item : a) s.arrayState.push_back(item.value);
        s.comparingIndices = cmp;
        s.comparisonsSoFar = g_metrics.comparisons;
        s.description = desc;
        result.steps.push_back(s);
    };

    recordStep(1, "int linearSearch(int a[], int n, int key)", {}, "Entering linearSearch for key = " + std::to_string(key));

    for (int i = 0; i < n; i++) {
        recordStep(3, "for (int i = 0; i < n; i++)", {}, "Iteration i = " + std::to_string(i));
        recordStep(5, "if (a[i] == key)", {i}, "Checking a[" + std::to_string(i) + "] == key");
        if (a[i] == targetItem) {
            recordStep(6, "return i;", {i}, "Found match at index " + std::to_string(i));
            result.totalComparisons = g_metrics.comparisons;
            return result;
        }
    }

    recordStep(8, "return -1;", {}, "Key not found");
    result.totalComparisons = g_metrics.comparisons;
    return result;
}

// 7. Binary Search (User Code)
inline AlgorithmResult runBinarySearch(std::vector<int> input, int key) {
    g_metrics.reset();
    AlgorithmResult result;
    result.algorithmId = "binary-search";
    result.algorithmName = "Binary Search";
    result.timeComplexity = "O(log n)";

    // Sorted array required
    std::sort(input.begin(), input.end());

    std::vector<InstrumentedInt> a;
    for (int v : input) a.emplace_back(v);
    InstrumentedInt targetItem(key);
    int n = static_cast<int>(a.size());
    int step = 0;

    auto recordStep = [&](int line, const std::string& code, const std::vector<int>& cmp, const std::string& desc) {
        ExecutionStep s;
        s.stepNumber = ++step;
        s.lineNumber = line;
        s.code = code;
        for (const auto& item : a) s.arrayState.push_back(item.value);
        s.comparingIndices = cmp;
        s.comparisonsSoFar = g_metrics.comparisons;
        s.description = desc;
        result.steps.push_back(s);
    };

    int low = 0;
    int high = n - 1;
    recordStep(1, "int binarySearch(int a[], int n, int key)", {}, "Entering binarySearch for key = " + std::to_string(key));
    recordStep(3, "int low = 0;", {}, "low = 0");
    recordStep(4, "int high = n - 1;", {}, "high = " + std::to_string(high));

    while (low <= high) {
        recordStep(5, "while (low <= high)", {}, "Searching range [" + std::to_string(low) + ".." + std::to_string(high) + "]");
        int mid = (low + high) / 2;
        recordStep(7, "int mid = (low + high) / 2;", {mid}, "mid = " + std::to_string(mid));

        recordStep(8, "if (a[mid] == key)", {mid}, "Comparing a[" + std::to_string(mid) + "] == key");
        if (a[mid] == targetItem) {
            recordStep(9, "return mid;", {mid}, "Match found at mid = " + std::to_string(mid));
            result.totalComparisons = g_metrics.comparisons;
            return result;
        } else {
            recordStep(10, "else if (a[mid] < key)", {mid}, "Comparing a[" + std::to_string(mid) + "] < key");
            if (a[mid] < targetItem) {
                low = mid + 1;
                recordStep(11, "low = mid + 1;", {}, "Moved low to " + std::to_string(low));
            } else {
                high = mid - 1;
                recordStep(13, "high = mid - 1;", {}, "Moved high to " + std::to_string(high));
            }
        }
    }

    recordStep(15, "return -1;", {}, "Key not found in array");
    result.totalComparisons = g_metrics.comparisons;
    return result;
}

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
        
        ss << "      \"arrayState\": [";
        for (size_t a = 0; a < s.arrayState.size(); ++a) {
            ss << s.arrayState[a] << (a + 1 < s.arrayState.size() ? "," : "");
        }
        ss << "],\n";

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
