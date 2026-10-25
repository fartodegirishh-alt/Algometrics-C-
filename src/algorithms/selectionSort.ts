import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';
import { generateStandaloneCpp } from './cppGenerators';

const cppCode = `void selectionSort(std::vector<InstrumentedInt>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        int min_idx = i;
        for (int j = i + 1; j < n; ++j) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }
        if (min_idx != i) {
            std::swap(arr[i], arr[min_idx]);
        }
    }
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'void selectionSort(std::vector<InstrumentedInt>& arr) {',
    costLabel: 'c1',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function entry point.',
    operationType: 'declaration',
    baseCost: 1,
  },
  {
    lineNumber: 2,
    code: '    int n = arr.size();',
    costLabel: 'c2',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Size initialization.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 3,
    code: '    for (int i = 0; i < n - 1; ++i) {',
    costLabel: 'c3',
    theoreticalFrequency: 'n',
    frequencyExplanation: 'Outer loop iterates over each position from 0 to n-2.',
    operationType: 'loop_control',
    baseCost: 1,
  },
  {
    lineNumber: 4,
    code: '        int min_idx = i;',
    costLabel: 'c4',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Initialize index of current minimum candidate.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 5,
    code: '        for (int j = i + 1; j < n; ++j) {',
    costLabel: 'c5',
    theoreticalFrequency: 'Σ_{i=0}^{n-2} (n - i)',
    frequencyExplanation: 'Inner loop boundary checks: (n - i) checks per outer pass.',
    operationType: 'loop_control',
    baseCost: 1,
  },
  {
    lineNumber: 6,
    code: '            if (arr[j] < arr[min_idx]) {',
    costLabel: 'c6',
    theoreticalFrequency: 'n(n - 1) / 2',
    frequencyExplanation: 'Key Comparison: Evaluated exactly n(n-1)/2 times regardless of initial input order!',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 7,
    code: '                min_idx = j;',
    costLabel: 'c7',
    theoreticalFrequency: '0 (sorted) to n(n-1)/2 (worst)',
    frequencyExplanation: 'Updating pointer to new minimum candidate within unsorted partition.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 8,
    code: '            }',
    costLabel: 'c8',
    theoreticalFrequency: 'n(n - 1) / 2',
    frequencyExplanation: 'Inner if block closure.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 9,
    code: '        }',
    costLabel: 'c9',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Inner loop closure.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 10,
    code: '        if (min_idx != i) {',
    costLabel: 'c10',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Check whether minimum is already in its final spot to avoid unnecessary swap.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 11,
    code: '            std::swap(arr[i], arr[min_idx]);',
    costLabel: 'c11',
    theoreticalFrequency: '0 to n - 1',
    frequencyExplanation: 'Element relocation: At most n - 1 swaps total (3 assignments each). Selection Sort minimizes memory writes!',
    operationType: 'assignment',
    baseCost: 3,
  },
  {
    lineNumber: 12,
    code: '        }',
    costLabel: 'c12',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Outer if closure.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 13,
    code: '    }',
    costLabel: 'c13',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Outer loop termination.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 14,
    code: '}',
    costLabel: 'c14',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function return.',
    operationType: 'return',
    baseCost: 1,
  },
];

export const selectionSortDefinition: AlgorithmDefinition = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'sorting',
  shortDescription: 'Repeatedly finds minimum element from unsorted section and places it at beginning. Minimizes swaps.',
  fullDescription: 'Selection Sort divides the array into sorted and unsorted segments. In each pass, it scans the entire remaining unsorted section to locate the minimum element and performs at most one swap per pass. Its comparison count is invariant to array ordering.',
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
        const val = (n * (n - 1)) / 2;
        return { best: val, worst: val, avg: val };
      },
    },
    assignmentsFormula: {
      best: '0',
      worst: '3(n - 1)',
      average: '3(n - 1) / 2',
      calculate: (n: number) => {
        return { best: 0, worst: 3 * (n - 1), avg: 1.5 * (n - 1) };
      },
    },
  },
  derivations: [
    {
      title: '1. Invariant Comparison Cost',
      formula: 'C(n) = \\sum_{i=0}^{n-2} \\sum_{j=i+1}^{n-1} 1 = \\sum_{i=0}^{n-2} (n - 1 - i) = \\frac{n(n - 1)}{2}',
      explanation: 'Selection Sort performs the exact same number of comparisons regardless of whether the array is already sorted, reversed, or random.',
    },
    {
      title: '2. Minimal Memory Write Property',
      formula: 'S(n) \\le n - 1 \\implies \\text{Swaps } = \\mathcal{O}(n)',
      explanation: 'Unlike Bubble Sort or Insertion Sort which may perform O(n²) swaps, Selection Sort executes strictly at most n - 1 swaps, making it advantageous when memory write cycles are expensive.',
    },
    {
      title: '3. Big-O Formulation',
      formula: 'T(n) = c_6 \\cdot \\frac{n^2 - n}{2} + \\mathcal{O}(n) = \\Theta(n^2)',
      explanation: 'The quadratic comparison count dominates the runtime across all input distributions.',
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

    record(1, {}, [], [], [], 'Function invoked: selectionSort(arr)');
    record(2, { n }, [], [], [], `int n = arr.size() [n = ${n}]`);

    const sortedSet = new Set<number>();

    for (let i = 0; i < n - 1; ++i) {
      record(3, { i, n }, [], [], Array.from(sortedSet), `Outer pass i = ${i}`);
      let min_idx = i;
      assignments += 1;
      record(4, { i, min_idx }, [], [], Array.from(sortedSet), `min_idx = ${i} (value: ${arr[i]})`);

      for (let j = i + 1; j < n; ++j) {
        record(5, { i, j, min_idx }, [], [], Array.from(sortedSet), `Inner loop: scanning candidate j = ${j}`);

        comparisons += 1;
        const isSmaller = arr[j] < arr[min_idx];
        record(
          6,
          { i, j, min_idx },
          [j, min_idx],
          [],
          Array.from(sortedSet),
          `Checking if arr[${j}] (${arr[j]}) < arr[min_idx (${min_idx})] (${arr[min_idx]}) -> ${isSmaller ? 'NEW MINIMUM FOUND' : 'Not smaller'}`,
          `arr[${j}] < arr[${min_idx}]`,
          `${arr[j]} < ${arr[min_idx]} -> ${isSmaller}`
        );

        if (isSmaller) {
          min_idx = j;
          assignments += 1;
          record(7, { i, j, min_idx }, [], [], Array.from(sortedSet), `min_idx updated to ${j} (value: ${arr[j]})`);
        }
      }

      comparisons += 1; // if (min_idx != i)
      record(
        10,
        { i, min_idx },
        [],
        [],
        Array.from(sortedSet),
        `Checking if min_idx (${min_idx}) != i (${i}) -> ${min_idx !== i ? 'Swap required' : 'Already in place'}`
      );

      if (min_idx !== i) {
        const tmp = arr[i];
        arr[i] = arr[min_idx];
        arr[min_idx] = tmp;
        assignments += 3;
        record(
          11,
          { i, min_idx },
          [],
          [i, min_idx],
          Array.from(sortedSet),
          `std::swap(arr[${i}], arr[${min_idx}]): Placed minimum ${arr[i]} into sorted position ${i}`
        );
      }

      sortedSet.add(i);
    }

    for (let k = 0; k < n; k++) sortedSet.add(k);
    record(14, {}, [], [], Array.from(sortedSet), `Selection Sort completed! Total comparisons: ${comparisons}, Total assignments: ${assignments}`);

    return steps;
  },

  runBenchmark: (sizes: number[], distribution: InputDistribution): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      let comparisons = 0;
      let assignments = 0;

      for (let i = 0; i < n - 1; ++i) {
        let min_idx = i;
        assignments++;
        for (let j = i + 1; j < n; ++j) {
          comparisons++;
          if (arr[j] < arr[min_idx]) {
            min_idx = j;
            assignments++;
          }
        }
        comparisons++;
        if (min_idx !== i) {
          const tmp = arr[i];
          arr[i] = arr[min_idx];
          arr[min_idx] = tmp;
          assignments += 3;
        }
      }

      const theoreticalWorst = (n * (n - 1)) / 2 + 3 * (n - 1);
      const theoreticalBest = (n * (n - 1)) / 2;
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
      'Selection Sort',
      cppCode,
      'selectionSort(arr);',
      false,
      arraySize,
      distribution
    );
  },
};
