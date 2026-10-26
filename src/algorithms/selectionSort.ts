import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';

const cppCode = `void selectionSort(int a[], int n)
{
    int minIndex, temp;

    for (int i = 0; i < n - 1; i++)
    {
        minIndex = i;

        for (int j = i + 1; j < n; j++)
        {
            if (a[j] < a[minIndex])
                minIndex = j;
        }

        temp = a[i];
        a[i] = a[minIndex];
        a[minIndex] = temp;
    }
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'void selectionSort(int a[], int n)',
    costLabel: 'c1',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function entry point.',
    operationType: 'declaration',
    baseCost: 1,
    complexityClass: 'O(1)',
    simpleExplanation: 'Invocation with array pointer and size.',
  },
  {
    lineNumber: 2,
    code: '{',
    costLabel: 'c2',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function block opening.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 3,
    code: '    int minIndex, temp;',
    costLabel: 'c3',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Stack variable declarations for minimum index tracking and swap buffer.',
    operationType: 'declaration',
    baseCost: 1,
    complexityClass: 'O(1)',
    simpleExplanation: 'Allocates local variables on call stack.',
  },
  {
    lineNumber: 4,
    code: '    for (int i = 0; i < n - 1; i++)',
    costLabel: 'c4',
    theoreticalFrequency: 'n',
    frequencyExplanation: 'Outer loop header executed n times (iterates n - 1 passes, plus 1 exit condition test).',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(N)',
    simpleExplanation: 'Advances boundary of sorted subarray from left to right.',
  },
  {
    lineNumber: 5,
    code: '    {',
    costLabel: 'c5',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Outer loop body block opening.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N)',
  },
  {
    lineNumber: 6,
    code: '        minIndex = i;',
    costLabel: 'c6',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Initialize index of current minimum candidate to start of unsorted section.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N)',
    simpleExplanation: 'Assumes current item is the smallest before scanning remainder.',
  },
  {
    lineNumber: 7,
    code: '        for (int j = i + 1; j < n; j++)',
    costLabel: 'c7',
    theoreticalFrequency: 'Σ_{i=0}^{n-2} (n - i)',
    frequencyExplanation: 'Inner loop condition checks: runs for all remaining unsorted elements to the right.',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(N²)',
    simpleExplanation: 'Scans all unsorted elements to find the true minimum.',
  },
  {
    lineNumber: 8,
    code: '        {',
    costLabel: 'c8',
    theoreticalFrequency: 'n(n - 1) / 2',
    frequencyExplanation: 'Inner loop body block opening.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N²)',
  },
  {
    lineNumber: 9,
    code: '            if (a[j] < a[minIndex])',
    costLabel: 'c9',
    theoreticalFrequency: 'n(n - 1) / 2',
    frequencyExplanation: 'Primary comparison! Compares candidate a[j] against running minimum a[minIndex].',
    operationType: 'comparison',
    baseCost: 1,
    complexityClass: 'O(N²)',
    simpleExplanation: 'Exact comparison count is always (n - 1) + (n - 2) + ... + 1 = n(n - 1)/2 in all cases.',
  },
  {
    lineNumber: 10,
    code: '                minIndex = j;',
    costLabel: 'c10',
    theoreticalFrequency: '0 (best) to n(n - 1)/2 (worst)',
    frequencyExplanation: 'Updates minimum index whenever a strictly smaller value is observed.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N²)',
    simpleExplanation: 'Updates pointer to new smallest element found.',
  },
  {
    lineNumber: 11,
    code: '        }',
    costLabel: 'c11',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Inner scan loop close.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N)',
  },
  {
    lineNumber: 12,
    code: '        temp = a[i];',
    costLabel: 'c12',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Saves current item into temporary variable.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N)',
    simpleExplanation: 'Swap step 1: buffer a[i].',
  },
  {
    lineNumber: 13,
    code: '        a[i] = a[minIndex];',
    costLabel: 'c13',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Places minimum element into its finalized sorted position.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N)',
    simpleExplanation: 'Swap step 2: move minimum to index i.',
  },
  {
    lineNumber: 14,
    code: '        a[minIndex] = temp;',
    costLabel: 'c14',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Stores previous a[i] into minIndex position.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N)',
    simpleExplanation: 'Swap step 3: complete element exchange.',
  },
  {
    lineNumber: 15,
    code: '    }',
    costLabel: 'c15',
    theoreticalFrequency: '1',
    frequencyExplanation: 'End of outer loop.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 16,
    code: '}',
    costLabel: 'c16',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function return.',
    operationType: 'return',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
];

export const selectionSortDefinition: AlgorithmDefinition = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'sorting',
  shortDescription: 'Finds the minimum element from the unsorted part and puts it at the beginning.',
  fullDescription: 'Selection Sort repeatedly finds the smallest element in the unsorted suffix and places it into the next sorted position. Regardless of initial order, it performs exactly n(n - 1)/2 comparisons.',
  requiresSorted: false,
  cppCode,
  lines,
  complexity: {
    bestTime: 'Ω(n²)',
    averageTime: 'Θ(n²)',
    worstTime: 'O(n²)',
    spaceComplexity: 'O(1)',
    comparisonsFormula: {
      best: 'n(n - 1) / 2',
      worst: 'n(n - 1) / 2',
      average: 'n(n - 1) / 2',
      calculate: (n: number) => {
        const c = (n * (n - 1)) / 2;
        return { best: c, worst: c, avg: c };
      },
    },
    assignmentsFormula: {
      best: '3(n - 1)',
      worst: '3(n - 1) + n(n - 1)/2',
      average: '3(n - 1) + n(n - 1)/4',
      calculate: (n: number) => {
        const swaps = 3 * (n - 1);
        return { best: swaps, worst: swaps + (n * (n - 1)) / 2, avg: swaps + (n * (n - 1)) / 4 };
      },
    },
  },
  derivations: [
    {
      title: '1. Comparison Exact Summation',
      formula: 'C(n) = \\sum_{i=0}^{n-2} \\sum_{j=i+1}^{n-1} 1 = \\sum_{i=0}^{n-2} (n - 1 - i) = (n - 1) + (n - 2) + \\dots + 1 = \\frac{n(n - 1)}{2}',
      explanation: 'The nested loop bounds depend solely on array size n, meaning comparisons are identically n(n - 1)/2 in best, worst, and average cases.',
    },
    {
      title: '2. Total Asymptotic Complexity',
      formula: 'T(n) = \\frac{1}{2} n^2 - \\frac{1}{2} n + \\mathcal{O}(n) = \\Theta(n^2)',
      explanation: 'With a fixed quadratic comparison count and linear swaps, total execution time is strictly Θ(n²).',
    },
  ],
  intuitiveGuide: {
    shape: 'staircase',
    plainEnglishSummary: 'Scans the unsorted elements to find the smallest number, then swaps it into place. Does this n times.',
    scalingRule: 'If you double the array size from 10 to 20, comparisons increase by 4x.',
    threeStepBreakdown: {
      step1Loops: 'Pass 0 scans (n - 1) items, pass 1 scans (n - 2) items, all the way down to 1.',
      step2Counts: 'Total comparisons = (n - 1) + (n - 2) + ... + 1 = n(n - 1)/2.',
      step3BigO: 'Unconditional quadratic comparisons lead directly to O(n²).',
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

    record(1, {}, [], [], [], `Starting selectionSort(a, n = ${n})`);
    record(3, {}, [], [], [], `Declared int minIndex, temp`);

    const sortedIndices: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      assignments++;
      record(4, { i }, [], [], [...sortedIndices], `Outer loop pass i = ${i}`);
      record(6, { i, minIndex }, [], [], [...sortedIndices], `minIndex = ${i} (value: ${a[i]})`);

      for (let j = i + 1; j < n; j++) {
        comparisons++;
        const cmpExpr = `a[${j}] < a[${minIndex}]`;
        const isLess = a[j] < a[minIndex];
        const cmpRes = `${a[j]} < ${a[minIndex]} -> ${isLess}`;

        record(7, { i, j, minIndex }, [], [], [...sortedIndices], `Inner loop scanning j = ${j}`);
        record(9, { i, j, minIndex }, [j, minIndex], [], [...sortedIndices], `Comparing a[${j}] (${a[j]}) < a[minIndex] (${a[minIndex]})`, cmpExpr, cmpRes);

        if (isLess) {
          minIndex = j;
          assignments++;
          record(10, { i, j, minIndex }, [], [], [...sortedIndices], `Found smaller element! minIndex = ${j} (value: ${a[j]})`);
        }
      }

      // Swap
      const temp = a[i];
      assignments++;
      record(12, { i, minIndex }, [], [i], [...sortedIndices], `temp = a[${i}] (${temp})`);

      a[i] = a[minIndex];
      assignments++;
      record(13, { i, minIndex }, [], [i, minIndex], [...sortedIndices], `a[${i}] = a[${minIndex}] (${a[i]})`);

      a[minIndex] = temp;
      assignments++;
      record(14, { i, minIndex }, [], [i, minIndex], [...sortedIndices], `a[${minIndex}] = temp (${temp})`);

      sortedIndices.push(i);
    }

    sortedIndices.push(n - 1);
    record(16, {}, [], [], Array.from({ length: n }, (_, idx) => idx), `Selection sort complete. Total comparisons: ${comparisons}`);

    return steps;
  },
  runBenchmark: (sizes: number[], distribution: InputDistribution): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      let comparisons = 0;
      let assignments = 0;

      for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        assignments++;
        for (let j = i + 1; j < n; j++) {
          comparisons++;
          if (arr[j] < arr[minIndex]) {
            minIndex = j;
            assignments++;
          }
        }
        const temp = arr[i];
        arr[i] = arr[minIndex];
        arr[minIndex] = temp;
        assignments += 3;
      }

      const theoretical = (n * (n - 1)) / 2;
      return {
        n,
        observedComparisons: comparisons,
        observedAssignments: assignments,
        totalOperations: comparisons,
        theoreticalWorst: theoretical,
        theoreticalAvg: theoretical,
        theoreticalBest: theoretical,
      };
    });
  },
  getStandaloneCpp: (arraySize: number, distribution: InputDistribution): string => {
    const sampleArr = generateArray(arraySize, distribution);
    return `#include <iostream>
using namespace std;

void selectionSort(int a[], int n)
{
    int minIndex, temp;

    for (int i = 0; i < n - 1; i++)
    {
        minIndex = i;

        for (int j = i + 1; j < n; j++)
        {
            if (a[j] < a[minIndex])
                minIndex = j;
        }

        temp = a[i];
        a[i] = a[minIndex];
        a[minIndex] = temp;
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

    selectionSort(a, n);

    cout << "Sorted array: ";
    for (int i = 0; i < n; i++)
        cout << a[i] << " ";
    cout << "\\n";

    return 0;
}`;
  },
};
