import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';
import { generateStandaloneCpp } from './cppGenerators';

const cppCode = `void insertionSort(std::vector<InstrumentedInt>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; ++i) {
        InstrumentedInt key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'void insertionSort(std::vector<InstrumentedInt>& arr) {',
    costLabel: 'c1',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function entry.',
    operationType: 'declaration',
    baseCost: 1,
  },
  {
    lineNumber: 2,
    code: '    int n = arr.size();',
    costLabel: 'c2',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Array size query.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 3,
    code: '    for (int i = 1; i < n; ++i) {',
    costLabel: 'c3',
    theoreticalFrequency: 'n',
    frequencyExplanation: 'Iterates from 2nd element to end (n-1 iterations, n loop checks).',
    operationType: 'loop_control',
    baseCost: 1,
  },
  {
    lineNumber: 4,
    code: '        InstrumentedInt key = arr[i];',
    costLabel: 'c4',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Extract current element as key to insert into sorted prefix (1 assignment).',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 5,
    code: '        int j = i - 1;',
    costLabel: 'c5',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Set scan index to end of sorted prefix.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 6,
    code: '        while (j >= 0 && arr[j] > key) {',
    costLabel: 'c6',
    theoreticalFrequency: 'Σ_{i=1}^{n-1} t_i',
    frequencyExplanation: 'While loop condition: t_i is the number of times the while test is checked for value i. Best case: t_i = 1 (runs n-1 times). Worst case: t_i = i + 1 (runs n(n+1)/2 - 1 times).',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 7,
    code: '            arr[j + 1] = arr[j];',
    costLabel: 'c7',
    theoreticalFrequency: 'Σ_{i=1}^{n-1} (t_i - 1)',
    frequencyExplanation: 'Shifting element right to make room for key. 0 shifts in best case; n(n-1)/2 in worst case.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 8,
    code: '            j = j - 1;',
    costLabel: 'c8',
    theoreticalFrequency: 'Σ_{i=1}^{n-1} (t_i - 1)',
    frequencyExplanation: 'Decrement pointer j to examine next element to left.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 9,
    code: '        }',
    costLabel: 'c9',
    theoreticalFrequency: 'Σ_{i=1}^{n-1} (t_i - 1)',
    frequencyExplanation: 'While loop closure.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 10,
    code: '        arr[j + 1] = key;',
    costLabel: 'c10',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Insert extracted key into its correct sorted location (1 assignment per outer pass).',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 11,
    code: '    }',
    costLabel: 'c11',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Outer for loop closure.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 12,
    code: '}',
    costLabel: 'c12',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function return.',
    operationType: 'return',
    baseCost: 1,
  },
];

export const insertionSortDefinition: AlgorithmDefinition = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  shortDescription: 'Builds sorted array one item at a time by shifting larger elements right and inserting key.',
  fullDescription: 'Insertion Sort maintains a sorted prefix. For each element at index i, it saves the key and shifts all preceding larger elements one position to the right until finding the correct slot. Outstanding on small or nearly-sorted datasets.',
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
        const avg = dist === 'sorted' ? best : dist === 'reversed' ? worst : worst / 2;
        return { best, worst, avg };
      },
    },
    assignmentsFormula: {
      best: '2(n - 1)',
      worst: 'n(n - 1) / 2 + 2(n - 1)',
      average: 'n(n - 1) / 4 + 2(n - 1)',
      calculate: (n: number, dist?: InputDistribution) => {
        const best = 2 * (n - 1);
        const worst = (n * (n - 1)) / 2 + 2 * (n - 1);
        const avg = dist === 'sorted' ? best : dist === 'reversed' ? worst : (worst + best) / 2;
        return { best, worst, avg };
      },
    },
  },
  derivations: [
    {
      title: '1. CLRS Cost Model Formulation',
      formula: 'T(n) = c_1 + c_2 + c_3 n + c_4 (n-1) + c_5 (n-1) + c_6 \\sum_{i=1}^{n-1} t_i + c_7 \\sum_{i=1}^{n-1} (t_i - 1) + c_{10} (n-1)',
      explanation: 'Classic Cormen-Leiserson-Rivest-Stein (CLRS) line-by-line model, where t_i is the number of while loop test checks for each iteration i.',
    },
    {
      title: '2. Best-Case Analysis (Already Sorted)',
      formula: 't_i = 1 \\implies T(n) = (c_3 + c_4 + c_5 + c_6 + c_{10})n + \\text{const} = \\Omega(n)',
      explanation: 'When the array is already sorted, arr[j] > key is immediately false on the first check, yielding linear time O(n) with 0 shifts.',
    },
    {
      title: '3. Worst-Case Analysis (Reverse Sorted)',
      formula: 't_i = i + 1 \\implies \\sum_{i=1}^{n-1} i = \\frac{n(n-1)}{2} \\implies T(n) = \\mathcal{O}(n^2)',
      explanation: 'When sorted in reverse order, every element must be compared against and shifted past every predecessor in the sorted prefix.',
    },
  ],
  generateSteps: (initialArray: number[]): StepState[] => {
    const steps: StepState[] = [];
    const arr = [...initialArray];
    const n = arr.length;
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
      result?: string
    ) => {
      lineHits[line] = (lineHits[line] || 0) + 1;
      steps.push({
        stepIndex: steps.length,
        lineNumber: line,
        array: [...arr],
        indices: { ...indices },
        comparingIndices: [...comparing],
        swappingIndices: [...swapping],
        sortedIndices: [...sorted],
        comparisons,
        assignments,
        lineHits: { ...lineHits },
        message: msg,
        highlightExpression: expr,
        expressionResult: result,
      });
    };

    record(1, {}, [], [], [], 'Function invoked: insertionSort(arr)');
    record(2, { n }, [], [], [], `int n = arr.size() [n = ${n}]`);

    const sortedIndices = [0];

    for (let i = 1; i < n; ++i) {
      record(3, { i }, [], [], [...sortedIndices], `Outer loop: inserting element at index i = ${i}`);

      const key = arr[i];
      assignments += 1;
      record(4, { i, key: i }, [], [], [...sortedIndices], `Extracted key = arr[${i}] (${key})`);

      let j = i - 1;
      assignments += 1;
      record(5, { i, j }, [], [], [...sortedIndices], `Initialized scan pointer j = ${j}`);

      while (j >= 0) {
        comparisons += 1;
        const shouldShift = arr[j] > key;
        record(
          6,
          { i, j, 'j+1': j + 1 },
          [j],
          [],
          [...sortedIndices],
          `Comparing arr[${j}] (${arr[j]}) > key (${key}) -> ${shouldShift ? 'Shift needed' : 'Insertion spot reached'}`,
          `arr[${j}] > ${key}`,
          `${arr[j]} > ${key} -> ${shouldShift}`
        );

        if (!shouldShift) {
          break;
        }

        arr[j + 1] = arr[j];
        assignments += 1;
        record(
          7,
          { i, j, 'j+1': j + 1 },
          [],
          [j, j + 1],
          [...sortedIndices],
          `Shifted arr[${j}] (${arr[j]}) to index ${j + 1}`
        );

        j = j - 1;
        assignments += 1;
        record(8, { i, j }, [], [], [...sortedIndices], `j decremented to ${j}`);
      }

      arr[j + 1] = key;
      assignments += 1;
      sortedIndices.push(i);
      record(
        10,
        { i, 'j+1': j + 1 },
        [],
        [j + 1],
        [...sortedIndices],
        `Inserted key (${key}) into slot arr[${j + 1}]`
      );
    }

    record(12, {}, [], [], Array.from({ length: n }, (_, idx) => idx), `Insertion Sort completed! Comparisons: ${comparisons}, Assignments: ${assignments}`);

    return steps;
  },

  runBenchmark: (sizes: number[], distribution: InputDistribution): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      let comparisons = 0;
      let assignments = 0;

      for (let i = 1; i < n; ++i) {
        const key = arr[i];
        assignments++;
        let j = i - 1;
        assignments++;
        while (j >= 0) {
          comparisons++;
          if (arr[j] > key) {
            arr[j + 1] = arr[j];
            assignments++;
            j--;
            assignments++;
          } else {
            break;
          }
        }
        arr[j + 1] = key;
        assignments++;
      }

      const theoreticalWorst = (n * (n - 1)) / 2 + 2 * (n - 1);
      const theoreticalBest = n - 1 + 2 * (n - 1);
      const theoreticalAvg = (theoreticalWorst + theoreticalBest) / 2;

      return {
        n,
        observedComparisons: comparisons,
        observedAssignments: assignments,
        totalOperations: comparisons + assignments,
        theoreticalWorst,
        theoreticalAvg,
        theoreticalBest,
      };
    });
  },

  getStandaloneCpp: (arraySize: number, distribution: InputDistribution) => {
    return generateStandaloneCpp(
      'Insertion Sort',
      cppCode,
      'insertionSort(arr);',
      false,
      arraySize,
      distribution
    );
  },
};
