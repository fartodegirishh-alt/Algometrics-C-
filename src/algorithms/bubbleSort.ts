import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';
import { generateStandaloneCpp } from './cppGenerators';

const cppCode = `void bubbleSort(std::vector<InstrumentedInt>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; ++j) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'void bubbleSort(std::vector<InstrumentedInt>& arr) {',
    costLabel: 'c1',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function call overhead, executed once on invocation.',
    operationType: 'declaration',
    baseCost: 1,
  },
  {
    lineNumber: 2,
    code: '    int n = arr.size();',
    costLabel: 'c2',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Reading size and initializing constant integer n.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 3,
    code: '    for (int i = 0; i < n - 1; ++i) {',
    costLabel: 'c3',
    theoreticalFrequency: 'n',
    frequencyExplanation: 'Outer loop boundary check. Runs n times in worst/average case (exits on i = n-1), or 1 time if already sorted.',
    operationType: 'loop_control',
    baseCost: 1,
  },
  {
    lineNumber: 4,
    code: '        bool swapped = false;',
    costLabel: 'c4',
    theoreticalFrequency: 'n - 1 (or 1 in best case)',
    frequencyExplanation: 'Flag initialization before each pass through the unsorted array segment.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 5,
    code: '        for (int j = 0; j < n - i - 1; ++j) {',
    costLabel: 'c5',
    theoreticalFrequency: 'Σ_{i=0}^{k} (n - i)',
    frequencyExplanation: 'Inner loop condition executed once more than body per outer pass: sum from (n-i) over passes.',
    operationType: 'loop_control',
    baseCost: 1,
  },
  {
    lineNumber: 6,
    code: '            if (arr[j] > arr[j + 1]) {',
    costLabel: 'c6',
    theoreticalFrequency: 'n(n - 1) / 2',
    frequencyExplanation: 'Primary element comparison! Number of comparisons equals (n-1) + (n-2) + ... + 1 = n(n-1)/2.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 7,
    code: '                std::swap(arr[j], arr[j + 1]);',
    costLabel: 'c7',
    theoreticalFrequency: '0 (best) to n(n-1)/2 (worst)',
    frequencyExplanation: 'Inversions swap! 3 assignments per swap (tmp = a, a = b, b = tmp). 0 if sorted, maximum n(n-1)/2 if reverse sorted.',
    operationType: 'assignment',
    baseCost: 3,
  },
  {
    lineNumber: 8,
    code: '                swapped = true;',
    costLabel: 'c8',
    theoreticalFrequency: '0 (best) to n(n-1)/2 (worst)',
    frequencyExplanation: 'Setting boolean swapped flag whenever an inversion is resolved.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 9,
    code: '            }',
    costLabel: 'c9',
    theoreticalFrequency: 'n(n - 1) / 2',
    frequencyExplanation: 'Inner if-block boundary.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 10,
    code: '        }',
    costLabel: 'c10',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Inner loop termination boundary.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 11,
    code: '        if (!swapped) break;',
    costLabel: 'c11',
    theoreticalFrequency: 'n - 1 (or 1 in best case)',
    frequencyExplanation: 'Adaptive early termination check: detects if zero swaps occurred, achieving Ω(n) best-case complexity.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 12,
    code: '    }',
    costLabel: 'c12',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Outer loop completion.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 13,
    code: '}',
    costLabel: 'c13',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function return.',
    operationType: 'return',
    baseCost: 1,
  },
];

export const bubbleSortDefinition: AlgorithmDefinition = {
  id: 'bubble-sort',
  name: 'Bubble Sort (Adaptive)',
  category: 'sorting',
  shortDescription: 'Iteratively compares adjacent elements and swaps them if out of order, with early exit optimization.',
  fullDescription: 'Bubble Sort steps through the list, comparing adjacent pairs and bubbling the largest unsorted element to the end. The adaptive variant tracks a boolean flag `swapped`. If no swaps occur in a pass, the array is already sorted, terminating in Ω(n) time.',
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
      average: 'n(n - 1) / 2 ≈ 0.5 n²',
      calculate: (n: number, dist?: InputDistribution) => {
        const worst = (n * (n - 1)) / 2;
        const best = n - 1;
        const avg = dist === 'sorted' ? best : dist === 'reversed' ? worst : (worst + best) / 2;
        return { best, worst, avg };
      },
    },
    assignmentsFormula: {
      best: '0',
      worst: '3 · n(n - 1) / 2',
      average: '3 · n(n - 1) / 4 ≈ 0.75 n²',
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
      formula: 'T(n) = c_1 + c_2 + c_3 \\cdot n + c_4 (n-1) + c_5 \\sum_{i=0}^{n-2}(n-i) + c_6 \\sum_{i=0}^{n-2}(n-i-1) + c_7 \\cdot W + c_{11} \\cdot k',
      explanation: 'Every line contributes a fixed constant hardware cost multiplied by the number of times that statement is executed.',
    },
    {
      title: '2. Inner Loop Comparison Closed Form',
      formula: 'C(n) = \\sum_{i=0}^{n-2} (n - i - 1) = (n - 1) + (n - 2) + \\dots + 1 = \\frac{n(n - 1)}{2} = \\frac{1}{2}n^2 - \\frac{1}{2}n',
      explanation: 'The arithmetic progression of the inner loop directly yields the quadratic term n²/2.',
    },
    {
      title: '3. Total Asymptotic Complexity',
      formula: 'T(n) = a \\cdot n^2 + b \\cdot n + c \\implies T(n) = \\mathcal{O}(n^2)',
      explanation: 'Because the highest order term is n² and a > 0, the runtime is asymptotically bounded above and below by n² in worst and average cases.',
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

    record(1, {}, [], [], [], 'Function invoked: bubbleSort(arr)');
    record(2, { n }, [], [], [], `int n = arr.size() [n = ${n}]`);

    const sortedSet = new Set<number>();

    for (let i = 0; i < n - 1; ++i) {
      record(3, { i, n }, [], [], Array.from(sortedSet), `Outer pass i = ${i} of ${n - 1}`);
      let swapped = false;
      assignments += 1;
      record(4, { i }, [], [], Array.from(sortedSet), `bool swapped = false for pass ${i}`);

      for (let j = 0; j < n - i - 1; ++j) {
        record(5, { i, j }, [], [], Array.from(sortedSet), `Inner loop: j = ${j}`);

        comparisons += 1;
        const compResult = arr[j] > arr[j + 1];
        record(
          6,
          { i, j, 'j+1': j + 1 },
          [j, j + 1],
          [],
          Array.from(sortedSet),
          `Comparing arr[${j}] (${arr[j]}) > arr[${j + 1}] (${arr[j + 1]}) -> ${compResult ? 'SWAP NEEDED' : 'IN ORDER'}`,
          `arr[${j}] > arr[${j + 1}]`,
          `${arr[j]} > ${arr[j + 1]} -> ${compResult}`
        );

        if (compResult) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          assignments += 3; // std::swap copies 3 times
          record(
            7,
            { i, j, 'j+1': j + 1 },
            [],
            [j, j + 1],
            Array.from(sortedSet),
            `std::swap(arr[${j}], arr[${j + 1}]): Swapped ${arr[j + 1]} and ${arr[j]} (3 assignments)`
          );

          swapped = true;
          assignments += 1;
          record(8, { i, j }, [], [], Array.from(sortedSet), `swapped = true`);
        }
      }

      sortedSet.add(n - i - 1);

      record(
        11,
        { i },
        [],
        [],
        Array.from(sortedSet),
        `Early-exit check: !swapped is ${!swapped ? 'TRUE -> Array is sorted!' : 'FALSE -> Continue to next pass'}`
      );
      if (!swapped) {
        break;
      }
    }

    for (let k = 0; k < n; k++) sortedSet.add(k);
    record(13, {}, [], [], Array.from(sortedSet), `Sorting complete! Total comparisons: ${comparisons}, Total assignments: ${assignments}`);

    return steps;
  },

  runBenchmark: (sizes: number[], distribution: InputDistribution): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      let comparisons = 0;
      let assignments = 0;

      for (let i = 0; i < n - 1; ++i) {
        let swapped = false;
        assignments++;
        for (let j = 0; j < n - i - 1; ++j) {
          comparisons++;
          if (arr[j] > arr[j + 1]) {
            const tmp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = tmp;
            assignments += 3;
            swapped = true;
            assignments++;
          }
        }
        if (!swapped) break;
      }

      const theoreticalWorst = (n * (n - 1)) / 2 + 3 * ((n * (n - 1)) / 2);
      const theoreticalBest = n - 1;
      const theoreticalAvg = theoreticalWorst / 2;

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
      'Bubble Sort (Adaptive)',
      cppCode,
      'bubbleSort(arr);',
      false,
      arraySize,
      distribution
    );
  },
};
