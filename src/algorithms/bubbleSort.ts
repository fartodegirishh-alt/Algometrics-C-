import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';

const cppCode = `void bubbleSort(int a[], int n)
{
    int temp;

    for (int i = 0; i < n - 1; i++)
    {
        for (int j = 0; j < n - i - 1; j++)
        {
            if (a[j] > a[j + 1])
            {
                temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'void bubbleSort(int a[], int n)',
    costLabel: 'c1',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function signature and entry point.',
    operationType: 'declaration',
    baseCost: 1,
    complexityClass: 'O(1)',
    simpleExplanation: 'Called once when the sort starts.',
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
    code: '    int temp;',
    costLabel: 'c3',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Declaration of temporary variable for swapping.',
    operationType: 'declaration',
    baseCost: 1,
    complexityClass: 'O(1)',
    simpleExplanation: 'Allocates space for temporary value in stack.',
  },
  {
    lineNumber: 4,
    code: '    for (int i = 0; i < n - 1; i++)',
    costLabel: 'c4',
    theoreticalFrequency: 'n',
    frequencyExplanation: 'Outer loop header: executed n times (runs n - 1 iterations plus 1 final exit check).',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(N)',
    simpleExplanation: 'Controls outer passes from i = 0 to n - 2.',
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
    code: '        for (int j = 0; j < n - i - 1; j++)',
    costLabel: 'c6',
    theoreticalFrequency: 'Σ_{i=0}^{n-2} (n - i) = n(n + 1)/2 - 1',
    frequencyExplanation: 'Inner loop condition checks: executes once more than loop body for each outer pass.',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(N²)',
    simpleExplanation: 'Nested loop running (n - i - 1) times for each outer pass.',
  },
  {
    lineNumber: 7,
    code: '        {',
    costLabel: 'c7',
    theoreticalFrequency: 'n(n - 1) / 2',
    frequencyExplanation: 'Inner loop body block opening.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N²)',
  },
  {
    lineNumber: 8,
    code: '            if (a[j] > a[j + 1])',
    costLabel: 'c8',
    theoreticalFrequency: 'n(n - 1) / 2',
    frequencyExplanation: 'Primary element comparison! Checked exactly (n - 1) + (n - 2) + ... + 1 = n(n - 1)/2 times.',
    operationType: 'comparison',
    baseCost: 1,
    complexityClass: 'O(N²)',
    simpleExplanation: 'Compares adjacent items a[j] and a[j + 1].',
  },
  {
    lineNumber: 9,
    code: '            {',
    costLabel: 'c9',
    theoreticalFrequency: '0 to n(n - 1) / 2',
    frequencyExplanation: 'Conditional swap block opening.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N²)',
  },
  {
    lineNumber: 10,
    code: '                temp = a[j];',
    costLabel: 'c10',
    theoreticalFrequency: '0 to n(n - 1) / 2',
    frequencyExplanation: 'Saves left element to temporary variable.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N²)',
    simpleExplanation: 'Stores a[j] before overwriting.',
  },
  {
    lineNumber: 11,
    code: '                a[j] = a[j + 1];',
    costLabel: 'c11',
    theoreticalFrequency: '0 to n(n - 1) / 2',
    frequencyExplanation: 'Copies right element into left position.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N²)',
    simpleExplanation: 'Moves smaller adjacent item to the left.',
  },
  {
    lineNumber: 12,
    code: '                a[j + 1] = temp;',
    costLabel: 'c12',
    theoreticalFrequency: '0 to n(n - 1) / 2',
    frequencyExplanation: 'Assigns stored temporary value into right position.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N²)',
    simpleExplanation: 'Puts original a[j] into a[j + 1], completing swap.',
  },
  {
    lineNumber: 13,
    code: '            }',
    costLabel: 'c13',
    theoreticalFrequency: '0 to n(n - 1) / 2',
    frequencyExplanation: 'End of swap block.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N²)',
  },
  {
    lineNumber: 14,
    code: '        }',
    costLabel: 'c14',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'End of inner loop.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N)',
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
    simpleExplanation: 'Function finishes, array is now fully sorted.',
  },
];

export const bubbleSortDefinition: AlgorithmDefinition = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'sorting',
  shortDescription: 'Iteratively compares adjacent elements and swaps them if out of order.',
  fullDescription: 'Bubble Sort steps through the array, comparing adjacent pairs and bubbling the largest unsorted element to the end of the array on each pass.',
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
        const count = (n * (n - 1)) / 2;
        return { best: count, worst: count, avg: count };
      },
    },
    assignmentsFormula: {
      best: '0',
      worst: '3 · n(n - 1) / 2',
      average: '1.5 · n(n - 1) / 2',
      calculate: (n: number, dist?: InputDistribution) => {
        const worst = 3 * ((n * (n - 1)) / 2);
        const best = 0;
        const avg = dist === 'sorted' ? 0 : dist === 'reversed' ? worst : worst / 2;
        return { best, worst, avg };
      },
    },
  },
  derivations: [
    {
      title: '1. Line-by-Line Summation Formulation',
      formula: 'T(n) = c_1 + c_3 + c_4 \\cdot n + c_6 \\sum_{i=0}^{n-2}(n-i) + c_8 \\sum_{i=0}^{n-2}(n-i-1) + (c_{10}+c_{11}+c_{12}) \\cdot S',
      explanation: 'Every line contributes a constant cost multiplied by the exact number of times it is executed.',
    },
    {
      title: '2. Inner Loop Comparisons Closed Form',
      formula: 'C(n) = \\sum_{i=0}^{n-2} (n - i - 1) = (n - 1) + (n - 2) + \\dots + 1 = \\frac{n(n - 1)}{2} = \\frac{1}{2}n^2 - \\frac{1}{2}n',
      explanation: 'The arithmetic progression of the inner loop directly yields the exact comparison count: n(n - 1)/2.',
    },
    {
      title: '3. Total Asymptotic Complexity',
      formula: 'T(n) = a \\cdot n^2 + b \\cdot n + c \\implies T(n) = \\mathcal{O}(n^2)',
      explanation: 'Because the dominant term is n², the algorithm is asymptotically quadratic in all cases.',
    },
  ],
  intuitiveGuide: {
    shape: 'staircase',
    plainEnglishSummary: 'Nested loops compare adjacent items. In each pass, the largest unsorted item bubbles to the end.',
    scalingRule: 'If you double the array size from 10 to 20, comparisons increase by 4x.',
    threeStepBreakdown: {
      step1Loops: 'Outer loop runs (n - 1) passes. Inner loop compares adjacent pairs (n - i - 1) times.',
      step2Counts: 'Total comparisons = (n - 1) + (n - 2) + ... + 1 = n(n - 1)/2 comparisons.',
      step3BigO: 'Dropping lower-order terms and coefficients gives O(n²).',
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

    record(1, {}, [], [], [], `Starting bubbleSort(a, n = ${n})`);
    record(3, {}, [], [], [], `int temp declared`);

    const sortedIndices: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      record(4, { i }, [], [], [...sortedIndices], `Outer loop pass i = ${i} of ${n - 2}`);

      for (let j = 0; j < n - i - 1; j++) {
        record(6, { i, j }, [], [], [...sortedIndices], `Inner loop: examining index j = ${j}`);

        comparisons++;
        const cmpExpr = `a[${j}] > a[${j + 1}]`;
        const cmpRes = `${a[j]} > ${a[j + 1]} -> ${a[j] > a[j + 1] ? 'true' : 'false'}`;

        record(8, { i, j }, [j, j + 1], [], [...sortedIndices], `Comparing a[${j}] (${a[j]}) and a[${j + 1}] (${a[j + 1]})`, cmpExpr, cmpRes);

        if (a[j] > a[j + 1]) {
          const temp = a[j];
          assignments++;
          record(10, { i, j }, [], [j], [...sortedIndices], `temp = a[${j}] (${temp})`);

          assignments++;
          a[j] = a[j + 1];
          record(11, { i, j }, [], [j, j + 1], [...sortedIndices], `a[${j}] = a[${j + 1}] (${a[j]})`);

          assignments++;
          a[j + 1] = temp;
          record(12, { i, j }, [], [j, j + 1], [...sortedIndices], `a[${j + 1}] = temp (${temp})`);
        }
      }
      sortedIndices.push(n - 1 - i);
    }

    sortedIndices.push(0);
    record(16, {}, [], [], Array.from({ length: n }, (_, idx) => idx), `Bubble sort complete. Total comparisons: ${comparisons}`);

    return steps;
  },
  runBenchmark: (sizes: number[], distribution: InputDistribution): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      let comparisons = 0;
      let assignments = 0;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          comparisons++;
          if (arr[j] > arr[j + 1]) {
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
            assignments += 3;
          }
        }
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

void bubbleSort(int a[], int n)
{
    int temp;

    for (int i = 0; i < n - 1; i++)
    {
        for (int j = 0; j < n - i - 1; j++)
        {
            if (a[j] > a[j + 1])
            {
                temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
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

    bubbleSort(a, n);

    cout << "Sorted array: ";
    for (int i = 0; i < n; i++)
        cout << a[i] << " ";
    cout << "\\n";

    return 0;
}`;
  },
};
