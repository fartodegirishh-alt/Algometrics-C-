import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';

const cppCode = `void merge(int a[], int low, int mid, int high)
{
    int temp[50];
    int i = low;
    int j = mid + 1;
    int k = low;

    while (i <= mid && j <= high)
    {
        if (a[i] <= a[j])
            temp[k++] = a[i++];
        else
            temp[k++] = a[j++];
    }

    while (i <= mid)
        temp[k++] = a[i++];

    while (j <= high)
        temp[k++] = a[j++];

    for (int i = low; i <= high; i++)
        a[i] = temp[i];
}

void mergeSort(int a[], int low, int high)
{
    if (low < high)
    {
        int mid = (low + high) / 2;

        mergeSort(a, low, mid);
        mergeSort(a, mid + 1, high);

        merge(a, low, mid, high);
    }
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'void merge(int a[], int low, int mid, int high)',
    costLabel: 'c1',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Merge routine called for every non-trivial subtree.',
    operationType: 'declaration',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 2,
    code: '{',
    costLabel: 'c2',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Block start.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 3,
    code: '    int temp[50];',
    costLabel: 'c3',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Auxiliary temporary array allocation for merging sorted halves.',
    operationType: 'declaration',
    baseCost: 1,
    complexityClass: 'O(1)',
    simpleExplanation: 'Buffer to hold merged elements in order.',
  },
  {
    lineNumber: 4,
    code: '    int i = low;',
    costLabel: 'c4',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Left subarray pointer initialization.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 5,
    code: '    int j = mid + 1;',
    costLabel: 'c5',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Right subarray pointer initialization.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 6,
    code: '    int k = low;',
    costLabel: 'c6',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Auxiliary merge pointer initialization.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 7,
    code: '    while (i <= mid && j <= high)',
    costLabel: 'c7',
    theoreticalFrequency: 'n log n',
    frequencyExplanation: 'Main two-pointer merge comparison loop.',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 8,
    code: '    {',
    costLabel: 'c8',
    theoreticalFrequency: 'n log n',
    frequencyExplanation: 'Loop body opening.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 9,
    code: '        if (a[i] <= a[j])',
    costLabel: 'c9',
    theoreticalFrequency: 'n log n',
    frequencyExplanation: 'Comparison of heads of two sorted lists: a[i] <= a[j].',
    operationType: 'comparison',
    baseCost: 1,
    complexityClass: 'O(N log N)',
    simpleExplanation: 'Picks the smaller of the two subarray heads.',
  },
  {
    lineNumber: 10,
    code: '            temp[k++] = a[i++];',
    costLabel: 'c10',
    theoreticalFrequency: 'k_1 · n log n',
    frequencyExplanation: 'Copies left element into temp and increments pointers.',
    operationType: 'assignment',
    baseCost: 2,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 11,
    code: '        else',
    costLabel: 'c11',
    theoreticalFrequency: 'n log n',
    frequencyExplanation: 'Branch for smaller right element.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 12,
    code: '            temp[k++] = a[j++];',
    costLabel: 'c12',
    theoreticalFrequency: 'k_2 · n log n',
    frequencyExplanation: 'Copies right element into temp and increments pointers.',
    operationType: 'assignment',
    baseCost: 2,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 13,
    code: '    }',
    costLabel: 'c13',
    theoreticalFrequency: 'n log n',
    frequencyExplanation: 'End of main merge loop.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 14,
    code: '    while (i <= mid)',
    costLabel: 'c14',
    theoreticalFrequency: 'c · n log n',
    frequencyExplanation: 'Flushes any remaining elements from left subarray.',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 15,
    code: '        temp[k++] = a[i++];',
    costLabel: 'c15',
    theoreticalFrequency: 'c · n log n',
    frequencyExplanation: 'Copies remaining left elements directly.',
    operationType: 'assignment',
    baseCost: 2,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 16,
    code: '    while (j <= high)',
    costLabel: 'c16',
    theoreticalFrequency: 'c · n log n',
    frequencyExplanation: 'Flushes any remaining elements from right subarray.',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 17,
    code: '        temp[k++] = a[j++];',
    costLabel: 'c17',
    theoreticalFrequency: 'c · n log n',
    frequencyExplanation: 'Copies remaining right elements directly.',
    operationType: 'assignment',
    baseCost: 2,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 18,
    code: '    for (int i = low; i <= high; i++)',
    costLabel: 'c18',
    theoreticalFrequency: 'n log n',
    frequencyExplanation: 'Copies sorted elements from temp back into main array a[].',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 19,
    code: '        a[i] = temp[i];',
    costLabel: 'c19',
    theoreticalFrequency: 'n log n',
    frequencyExplanation: 'Writes merged slice back into original array.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 20,
    code: '}',
    costLabel: 'c20',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'End of merge function.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 21,
    code: 'void mergeSort(int a[], int low, int high)',
    costLabel: 'c21',
    theoreticalFrequency: '2n - 1',
    frequencyExplanation: 'Recursive divide-and-conquer function entry.',
    operationType: 'declaration',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 22,
    code: '{',
    costLabel: 'c22',
    theoreticalFrequency: '2n - 1',
    frequencyExplanation: 'Block start.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 23,
    code: '    if (low < high)',
    costLabel: 'c23',
    theoreticalFrequency: '2n - 1',
    frequencyExplanation: 'Base case recursion test.',
    operationType: 'comparison',
    baseCost: 1,
    complexityClass: 'O(log N)',
    simpleExplanation: 'Checks if subarray has 2 or more elements.',
  },
  {
    lineNumber: 24,
    code: '    {',
    costLabel: 'c24',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Divide block start.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 25,
    code: '        int mid = (low + high) / 2;',
    costLabel: 'c25',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Calculates midpoint to divide array into two equal halves.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 26,
    code: '        mergeSort(a, low, mid);',
    costLabel: 'c26',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Recursive call to sort left half.',
    operationType: 'recursion',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 27,
    code: '        mergeSort(a, mid + 1, high);',
    costLabel: 'c27',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Recursive call to sort right half.',
    operationType: 'recursion',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 28,
    code: '        merge(a, low, mid, high);',
    costLabel: 'c28',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Merges the two sorted halves in linear O(k) time.',
    operationType: 'recursion',
    baseCost: 1,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 29,
    code: '    }',
    costLabel: 'c29',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'End of conditional block.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 30,
    code: '}',
    costLabel: 'c30',
    theoreticalFrequency: '2n - 1',
    frequencyExplanation: 'Function return.',
    operationType: 'return',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
];

export const mergeSortDefinition: AlgorithmDefinition = {
  id: 'merge-sort',
  name: 'Merge Sort',
  category: 'sorting',
  shortDescription: 'Divide-and-conquer algorithm that recursively divides array in half, sorts each half, and merges them.',
  fullDescription: 'Merge Sort repeatedly splits the array into two halves until single-element arrays are reached, then merges the sorted halves in linear time. It provides a guaranteed O(n log n) runtime across all input distributions.',
  requiresSorted: false,
  cppCode,
  lines,
  complexity: {
    bestTime: 'Ω(n log n)',
    averageTime: 'Θ(n log n)',
    worstTime: 'O(n log n)',
    spaceComplexity: 'O(n)',
    comparisonsFormula: {
      best: '0.5 n log₂ n',
      worst: 'n log₂ n - n + 1',
      average: 'n log₂ n - 1.158 n',
      calculate: (n: number) => {
        const log2n = Math.log2(n || 1);
        const worst = Math.round(n * log2n - n + 1);
        const best = Math.round(0.5 * n * log2n);
        const avg = Math.round(n * log2n - 1.158 * n);
        return { best: Math.max(1, best), worst: Math.max(1, worst), avg: Math.max(1, avg) };
      },
    },
    assignmentsFormula: {
      best: '2 n log₂ n',
      worst: '2 n log₂ n',
      average: '2 n log₂ n',
      calculate: (n: number) => {
        const val = Math.round(2 * n * Math.log2(n || 1));
        return { best: val, worst: val, avg: val };
      },
    },
  },
  derivations: [
    {
      title: '1. Divide-and-Conquer Recurrence Relation',
      formula: 'T(n) = 2 T(n/2) + \\Theta(n)',
      explanation: 'Dividing into two halves of size n/2 requires 2 subproblems, and merging takes linear Θ(n) work.',
    },
    {
      title: '2. Master Theorem Solution (Case 2)',
      formula: 'a = 2, b = 2 \\implies n^{\\log_b a} = n^{\\log_2 2} = n^1 = f(n) \\implies T(n) = \\Theta(n \\log n)',
      explanation: 'Since the subproblem cost matches the merge cost, total work across all log₂(n) tree levels is strictly Θ(n log n).',
    },
  ],
  intuitiveGuide: {
    shape: 'tree',
    plainEnglishSummary: 'Splits the array into two equal halves repeatedly until each piece has 1 number, then merges them back together in order.',
    scalingRule: 'If you double the array size from 10 to 20, operations increase by only about 2.3x (much faster than quadratic sorts).',
    threeStepBreakdown: {
      step1Loops: 'Height of recursion tree is log₂(n) levels. Each level merges n total items.',
      step2Counts: 'Total comparisons at each level ≤ n. Total over log₂(n) levels = n log₂(n).',
      step3BigO: 'Guaranteed O(n log n) in all cases, best, average, and worst.',
    },
  },
  generateSteps: (initialArray: number[]): StepState[] => {
    const steps: StepState[] = [];
    const a = [...initialArray];
    const n = a.length;
    let comparisons = 0;
    let assignments = 0;
    const lineHits: { [line: number]: number } = {};

    const record = (
      line: number,
      indices: { [k: string]: number },
      comparing: number[],
      swapping: number[],
      sorted: number[],
      msg: string,
      expr?: string,
      res?: string
    ) => {
      lineHits[line] = (lineHits[line] || 0) + 1;
      steps.push({
        stepIndex: steps.length,
        lineNumber: line,
        array: [...a],
        indices,
        comparingIndices: comparing,
        swappingIndices: swapping,
        sortedIndices: sorted,
        comparisons,
        assignments,
        lineHits: { ...lineHits },
        message: msg,
        highlightExpression: expr,
        expressionResult: res,
      });
    };

    const temp = new Array(Math.max(50, n)).fill(0);

    const merge = (low: number, mid: number, high: number) => {
      record(1, { low, mid, high }, [], [], [], `merge(a, low = ${low}, mid = ${mid}, high = ${high})`);
      record(3, { low, mid, high }, [], [], [], `Allocated temp array`);

      let i = low;
      let j = mid + 1;
      let k = low;
      assignments += 3;
      record(4, { low, mid, high, i }, [], [], [], `i = ${low}`);
      record(5, { low, mid, high, i, j }, [], [], [], `j = ${mid + 1}`);
      record(6, { low, mid, high, i, j, k }, [], [], [], `k = ${low}`);

      while (i <= mid && j <= high) {
        comparisons++;
        const cmpExpr = `a[${i}] <= a[${j}]`;
        const condition = a[i] <= a[j];
        const cmpRes = `${a[i]} <= ${a[j]} -> ${condition}`;

        record(9, { low, mid, high, i, j, k }, [i, j], [], [], `Comparing a[${i}] (${a[i]}) <= a[${j}] (${a[j]})`, cmpExpr, cmpRes);

        if (condition) {
          temp[k++] = a[i++];
          assignments += 2;
          record(10, { low, mid, high, i, j, k }, [], [i - 1], [], `temp[${k - 1}] = a[${i - 1}] (${temp[k - 1]}) from left`);
        } else {
          temp[k++] = a[j++];
          assignments += 2;
          record(12, { low, mid, high, i, j, k }, [], [j - 1], [], `temp[${k - 1}] = a[${j - 1}] (${temp[k - 1]}) from right`);
        }
      }

      while (i <= mid) {
        temp[k++] = a[i++];
        assignments += 2;
        record(15, { low, mid, high, i, j, k }, [], [i - 1], [], `Copying remaining left item a[${i - 1}] to temp[${k - 1}]`);
      }

      while (j <= high) {
        temp[k++] = a[j++];
        assignments += 2;
        record(17, { low, mid, high, i, j, k }, [], [j - 1], [], `Copying remaining right item a[${j - 1}] to temp[${k - 1}]`);
      }

      for (let idx = low; idx <= high; idx++) {
        a[idx] = temp[idx];
        assignments++;
        record(19, { low, mid, high, i: idx }, [], [idx], [], `a[${idx}] = temp[${idx}] (${a[idx]}), writing back merged element`);
      }
    };

    const mergeSort = (low: number, high: number) => {
      record(21, { low, high }, [], [], [], `mergeSort(a, low = ${low}, high = ${high})`);
      record(23, { low, high }, [], [], [], `Checking low < high (${low} < ${high} -> ${low < high})`);

      if (low < high) {
        const mid = Math.floor((low + high) / 2);
        assignments++;
        record(25, { low, mid, high }, [], [], [], `mid = (${low} + ${high}) / 2 = ${mid}`);

        mergeSort(low, mid);
        mergeSort(mid + 1, high);
        merge(low, mid, high);
      }
    };

    mergeSort(0, n - 1);
    record(30, {}, [], [], Array.from({ length: n }, (_, idx) => idx), `Merge sort complete. Total comparisons: ${comparisons}`);

    return steps;
  },
  runBenchmark: (sizes: number[], distribution: InputDistribution): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      let comparisons = 0;
      let assignments = 0;
      const temp = new Array(Math.max(50, n)).fill(0);

      const merge = (low: number, mid: number, high: number) => {
        let i = low;
        let j = mid + 1;
        let k = low;
        while (i <= mid && j <= high) {
          comparisons++;
          if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
          } else {
            temp[k++] = arr[j++];
          }
          assignments += 2;
        }
        while (i <= mid) {
          temp[k++] = arr[i++];
          assignments += 2;
        }
        while (j <= high) {
          temp[k++] = arr[j++];
          assignments += 2;
        }
        for (let idx = low; idx <= high; idx++) {
          arr[idx] = temp[idx];
          assignments++;
        }
      };

      const sort = (low: number, high: number) => {
        if (low < high) {
          const mid = Math.floor((low + high) / 2);
          sort(low, mid);
          sort(mid + 1, high);
          merge(low, mid, high);
        }
      };

      sort(0, n - 1);

      const log2n = Math.log2(n || 1);
      const theoretical = Math.round(n * log2n);

      return {
        n,
        observedComparisons: comparisons,
        observedAssignments: assignments,
        totalOperations: comparisons,
        theoreticalWorst: theoretical,
        theoreticalAvg: theoretical,
        theoreticalBest: Math.round(0.5 * theoretical),
      };
    });
  },
  getStandaloneCpp: (arraySize: number, distribution: InputDistribution): string => {
    const sampleArr = generateArray(arraySize, distribution);
    return `#include <iostream>
using namespace std;

void merge(int a[], int low, int mid, int high)
{
    int temp[50];
    int i = low;
    int j = mid + 1;
    int k = low;

    while (i <= mid && j <= high)
    {
        if (a[i] <= a[j])
            temp[k++] = a[i++];
        else
            temp[k++] = a[j++];
    }

    while (i <= mid)
        temp[k++] = a[i++];

    while (j <= high)
        temp[k++] = a[j++];

    for (int i = low; i <= high; i++)
        a[i] = temp[i];
}

void mergeSort(int a[], int low, int high)
{
    if (low < high)
    {
        int mid = (low + high) / 2;

        mergeSort(a, low, mid);
        mergeSort(a, mid + 1, high);

        merge(a, low, mid, high);
    }
}

int main()
{
    int a[50], n;

    // Default sample input initialized for demonstration:
    n = ${Math.min(arraySize, 50)};
    int sampleData[] = {${sampleArr.slice(0, 50).join(', ')}};
    for (int i = 0; i < n; i++) a[i] = sampleData[i];

    cout << "Original array: ";
    for (int i = 0; i < n; i++)
        cout << a[i] << " ";
    cout << "\\n";

    mergeSort(a, 0, n - 1);

    cout << "Sorted array: ";
    for (int i = 0; i < n; i++)
        cout << a[i] << " ";
    cout << "\\n";

    return 0;
}`;
  },
};
