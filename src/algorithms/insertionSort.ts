import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';

const cppCode = `void insertionSort(int a[], int n)
{
    int key, j;

    for (int i = 1; i < n; i++)
    {
        key = a[i];
        j = i - 1;

        while (j >= 0 && a[j] > key)
        {
            a[j + 1] = a[j];
            j--;
        }

        a[j + 1] = key;
    }
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'void insertionSort(int a[], int n)',
    costLabel: 'c1',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function signature and entry invocation.',
    operationType: 'declaration',
    baseCost: 1,
    complexityClass: 'O(1)',
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
    code: '    int key, j;',
    costLabel: 'c3',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Stack variable declarations for insertion key and shifting index.',
    operationType: 'declaration',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 4,
    code: '    for (int i = 1; i < n; i++)',
    costLabel: 'c4',
    theoreticalFrequency: 'n',
    frequencyExplanation: 'Outer loop iterates through indices 1 to n - 1 (n loop condition checks).',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(N)',
    simpleExplanation: 'Picks the next element to insert into the sorted prefix.',
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
    code: '        key = a[i];',
    costLabel: 'c6',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Saves current candidate into key register.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N)',
    simpleExplanation: 'Caches element being inserted.',
  },
  {
    lineNumber: 7,
    code: '        j = i - 1;',
    costLabel: 'c7',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Sets pointer j to immediately preceding sorted item.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N)',
  },
  {
    lineNumber: 8,
    code: '        while (j >= 0 && a[j] > key)',
    costLabel: 'c8',
    theoreticalFrequency: 'Σ_{i=1}^{n-1} (t_i + 1)',
    frequencyExplanation: 'Condition check! Evaluates boundary and comparison a[j] > key. Runs 1 time per outer pass in best case (sorted), or i times in worst case (reversed).',
    operationType: 'comparison',
    baseCost: 1,
    complexityClass: 'O(N²)',
    simpleExplanation: 'Checks if larger sorted items must slide right to make space.',
  },
  {
    lineNumber: 9,
    code: '        {',
    costLabel: 'c9',
    theoreticalFrequency: 'Σ_{i=1}^{n-1} t_i',
    frequencyExplanation: 'While loop body block opening.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N²)',
  },
  {
    lineNumber: 10,
    code: '            a[j + 1] = a[j];',
    costLabel: 'c10',
    theoreticalFrequency: 'Σ_{i=1}^{n-1} t_i',
    frequencyExplanation: 'Right-shift shift: copies larger element one slot forward.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N²)',
    simpleExplanation: 'Slides item right to make space for key.',
  },
  {
    lineNumber: 11,
    code: '            j--;',
    costLabel: 'c11',
    theoreticalFrequency: 'Σ_{i=1}^{n-1} t_i',
    frequencyExplanation: 'Decrements search index.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N²)',
  },
  {
    lineNumber: 12,
    code: '        }',
    costLabel: 'c12',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'While loop close.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N)',
  },
  {
    lineNumber: 13,
    code: '        a[j + 1] = key;',
    costLabel: 'c13',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Inserts key into its properly ordered position in sorted prefix.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(N)',
    simpleExplanation: 'Drops key into its correct sorted slot.',
  },
  {
    lineNumber: 14,
    code: '    }',
    costLabel: 'c14',
    theoreticalFrequency: '1',
    frequencyExplanation: 'End of outer loop.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 15,
    code: '}',
    costLabel: 'c15',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function return.',
    operationType: 'return',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
];

export const insertionSortDefinition: AlgorithmDefinition = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  shortDescription: 'Builds sorted array one item at a time by sliding larger items rightward.',
  fullDescription: 'Insertion Sort iterates through the array and inserts each element into its proper position within the already sorted prefix. Highly efficient on nearly-sorted data, achieving Ω(n) comparisons in the best case.',
  requiresSorted: false,
  cppCode,
  lines,
  complexity: {
    bestTime: 'Ω(n)',
    averageTime: 'Θ(n²)',
    worstTime: 'O(n²)',
    spaceComplexity: 'O(1)',
    comparisonsFormula: {
      best: 'n - 1',
      worst: 'n(n - 1) / 2',
      average: 'n(n - 1) / 4',
      calculate: (n: number, dist?: InputDistribution) => {
        const worst = (n * (n - 1)) / 2;
        const best = n - 1;
        const avg = dist === 'sorted' ? best : dist === 'reversed' ? worst : (worst + best) / 2;
        return { best, worst, avg };
      },
    },
    assignmentsFormula: {
      best: '2(n - 1)',
      worst: 'n(n - 1)/2 + 2(n - 1)',
      average: 'n(n - 1)/4 + 2(n - 1)',
      calculate: (n: number, dist?: InputDistribution) => {
        const worst = (n * (n - 1)) / 2 + 2 * (n - 1);
        const best = 2 * (n - 1);
        const avg = dist === 'sorted' ? best : dist === 'reversed' ? worst : (worst + best) / 2;
        return { best, worst, avg };
      },
    },
  },
  derivations: [
    {
      title: '1. Line-by-Line While Condition Formulation',
      formula: 'T(n) = c_1 + c_3 + c_4 \\cdot n + c_6(n-1) + c_7(n-1) + c_8 \\sum_{i=1}^{n-1} (t_i + 1) + c_{10} \\sum_{i=1}^{n-1} t_i + c_{13}(n-1)',
      explanation: 'In the best case (sorted), t_i = 0, so the while loop checks exactly 1 condition per pass, yielding linear Ω(n) time. In the worst case (reversed), t_i = i, yielding quadratic O(n²) time.',
    },
    {
      title: '2. Average-Case Comparison Analysis',
      formula: 'E[C(n)] = \\sum_{i=1}^{n-1} \\frac{i}{2} = \\frac{1}{2} \\frac{n(n - 1)}{2} = \\frac{n(n - 1)}{4} \\approx 0.25 n^2',
      explanation: 'On average, each element must slide past half of the already-sorted prefix before finding its insertion slot.',
    },
  ],
  intuitiveGuide: {
    shape: 'linear',
    plainEnglishSummary: 'Like sorting playing cards in your hand: take the next card and slide it left until it fits.',
    scalingRule: 'If the data is already sorted, it runs in linear O(n) time. On reversed data, it takes O(n²).',
    threeStepBreakdown: {
      step1Loops: 'For each item i from 1 to n - 1, compare it backwards against sorted cards.',
      step2Counts: 'Best case: 1 comparison per card = (n - 1). Worst case: 1 + 2 + ... + (n - 1) = n(n - 1)/2.',
      step3BigO: 'Adapts from O(n) on sorted data to O(n²) on reverse data.',
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

    record(1, {}, [], [], [], `Starting insertionSort(a, n = ${n})`);
    record(3, {}, [], [], [], `Declared int key, j`);

    const sortedIndices: number[] = [0];

    for (let i = 1; i < n; i++) {
      record(4, { i }, [], [], [...sortedIndices], `Outer loop: inserting element at index i = ${i}`);

      const key = a[i];
      assignments++;
      record(6, { i, key }, [], [], [...sortedIndices], `key = a[${i}] (${key})`);

      let j = i - 1;
      assignments++;
      record(7, { i, j, key }, [], [], [...sortedIndices], `j = ${j}`);

      while (j >= 0) {
        comparisons++;
        const cmpExpr = `a[${j}] > key`;
        const condition = a[j] > key;
        const cmpRes = `${a[j]} > ${key} -> ${condition}`;

        record(8, { i, j, key }, [j], [], [...sortedIndices], `Testing while (j >= 0 && a[j] > key)`, cmpExpr, cmpRes);

        if (!condition) {
          break;
        }

        a[j + 1] = a[j];
        assignments++;
        record(10, { i, j, key }, [], [j + 1], [...sortedIndices], `a[${j + 1}] = a[${j}] (${a[j]}), sliding item right`);

        j--;
        assignments++;
        record(11, { i, j, key }, [], [], [...sortedIndices], `j-- (j is now ${j})`);
      }

      a[j + 1] = key;
      assignments++;
      record(13, { i, j: j + 1, key }, [], [j + 1], [...sortedIndices, i], `a[${j + 1}] = key (${key}), inserted into place`);

      sortedIndices.push(i);
    }

    record(15, {}, [], [], Array.from({ length: n }, (_, idx) => idx), `Insertion sort complete. Total comparisons: ${comparisons}`);

    return steps;
  },
  runBenchmark: (sizes: number[], distribution: InputDistribution): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      let comparisons = 0;
      let assignments = 0;

      for (let i = 1; i < n; i++) {
        const key = arr[i];
        let j = i - 1;
        assignments++;
        while (j >= 0) {
          comparisons++;
          if (arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
            assignments += 2;
          } else {
            break;
          }
        }
        arr[j + 1] = key;
        assignments++;
      }

      const theoreticalWorst = (n * (n - 1)) / 2;
      const theoreticalBest = n - 1;
      const theoreticalAvg = (theoreticalWorst + theoreticalBest) / 2;

      return {
        n,
        observedComparisons: comparisons,
        observedAssignments: assignments,
        totalOperations: comparisons,
        theoreticalWorst,
        theoreticalAvg,
        theoreticalBest,
      };
    });
  },
  getStandaloneCpp: (arraySize: number, distribution: InputDistribution): string => {
    const sampleArr = generateArray(arraySize, distribution);
    return `#include <iostream>
using namespace std;

void insertionSort(int a[], int n)
{
    int key, j;

    for (int i = 1; i < n; i++)
    {
        key = a[i];
        j = i - 1;

        while (j >= 0 && a[j] > key)
        {
            a[j + 1] = a[j];
            j--;
        }

        a[j + 1] = key;
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

    insertionSort(a, n);

    cout << "Sorted array: ";
    for (int i = 0; i < n; i++)
        cout << a[i] << " ";
    cout << "\\n";

    return 0;
}`;
  },
};
