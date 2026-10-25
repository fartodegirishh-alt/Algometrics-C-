import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';
import { generateStandaloneCpp } from './cppGenerators';

const cppCode = `int linearSearch(const std::vector<InstrumentedInt>& arr, const InstrumentedInt& target) {
    int n = arr.size();
    for (int i = 0; i < n; ++i) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'int linearSearch(const std::vector<InstrumentedInt>& arr, const InstrumentedInt& target) {',
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
    frequencyExplanation: 'Vector size assignment.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 3,
    code: '    for (int i = 0; i < n; ++i) {',
    costLabel: 'c3',
    theoreticalFrequency: 'k + 1 (where k = matches found or n)',
    frequencyExplanation: 'Loop control check executed each iteration.',
    operationType: 'loop_control',
    baseCost: 1,
  },
  {
    lineNumber: 4,
    code: '        if (arr[i] == target) {',
    costLabel: 'c4',
    theoreticalFrequency: 'k (1 to n)',
    frequencyExplanation: 'Target Equality Comparison: 1 if target is at index 0 (best case); n if at end or absent (worst case).',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 5,
    code: '            return i;',
    costLabel: 'c5',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Early return on match found.',
    operationType: 'return',
    baseCost: 1,
  },
  {
    lineNumber: 6,
    code: '        }',
    costLabel: 'c6',
    theoreticalFrequency: 'k',
    frequencyExplanation: 'End if.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 7,
    code: '    }',
    costLabel: 'c7',
    theoreticalFrequency: '1 if not found, 0 if found early',
    frequencyExplanation: 'Loop exit.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 8,
    code: '    return -1;',
    costLabel: 'c8',
    theoreticalFrequency: '1 (only when target not found)',
    frequencyExplanation: 'Sentinel return indicating target not present.',
    operationType: 'return',
    baseCost: 1,
  },
  {
    lineNumber: 9,
    code: '}',
    costLabel: 'c9',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function exit.',
    operationType: 'return',
    baseCost: 1,
  },
];

export const linearSearchDefinition: AlgorithmDefinition = {
  id: 'linear-search',
  name: 'Linear Search',
  category: 'searching',
  shortDescription: 'Sequentially checks every element from index 0 to n-1 until a match is found or end is reached.',
  fullDescription: 'Linear Search (sequential search) examines each element in succession until the target value is found or the collection is exhausted. It operates on arbitrary unsorted or sorted sequences. Best case is Ω(1) when the target is at index 0; worst case is O(n) when absent or at the final index.',
  requiresSorted: false,
  cppCode,
  lines,
  complexity: {
    bestTime: 'Ω(1)',
    averageTime: 'Θ(n)',
    worstTime: 'O(n)',
    spaceComplexity: 'O(1)',
    comparisonsFormula: {
      best: '1',
      worst: 'n',
      average: '(n + 1) / 2',
      calculate: (n: number) => {
        return { best: 1, worst: n, avg: Math.round((n + 1) / 2) };
      },
    },
    assignmentsFormula: {
      best: '2',
      worst: 'n + 2',
      average: '(n + 1) / 2 + 2',
      calculate: (n: number) => {
        return { best: 2, worst: n + 2, avg: Math.round((n + 1) / 2) + 2 };
      },
    },
  },
  derivations: [
    {
      title: '1. Average-Case Mathematical Expectation',
      formula: 'E[C] = \\sum_{k=1}^n k \\cdot P(\\text{found at } k) = \\frac{1}{n} \\sum_{k=1}^n k = \\frac{1}{n} \\frac{n(n + 1)}{2} = \\frac{n + 1}{2}',
      explanation: 'Under uniform probability assumption where the target is equally likely to reside at any index 1 through n, the expected number of comparisons is exactly (n + 1) / 2.',
    },
    {
      title: '2. Best & Worst Extremes',
      formula: 'C_{\\min} = 1, \\quad C_{\\max} = n',
      explanation: 'If the target is at index 0, exactly 1 comparison is performed. If absent or at index n - 1, exactly n comparisons are made.',
    },
    {
      title: '3. Asymptotic Classification',
      formula: 'T(n) = c_3 \\cdot k + c_4 \\cdot k + \\text{const} \\implies T(n) = \\mathcal{O}(n)',
      explanation: 'The operation count is strictly linear with respect to the input size n.',
    },
  ],
  generateSteps: (initialArray: number[], targetVal?: number): StepState[] => {
    const steps: StepState[] = [];
    const arr = [...initialArray];
    const n = arr.length;
    const target = targetVal !== undefined ? targetVal : arr[Math.floor(arr.length / 2)] || 42;
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

    record(1, { target }, [], [], [], `Function linearSearch(arr, target=${target}) called`);
    record(2, { n, target }, [], [], [], `int n = arr.size() [n = ${n}]`);

    let foundIdx = -1;
    for (let i = 0; i < n; ++i) {
      assignments += 1;
      record(3, { i, target }, [], [], [], `Loop step: checking element index i = ${i}`);

      comparisons += 1;
      const match = arr[i] === target;
      record(
        4,
        { i, target },
        [i],
        [],
        match ? [i] : [],
        `Comparing arr[${i}] (${arr[i]}) == target (${target}) -> ${match ? 'MATCH FOUND!' : 'No match, continue'}`,
        `arr[${i}] == ${target}`,
        `${arr[i]} == ${target} -> ${match}`
      );

      if (match) {
        foundIdx = i;
        record(5, { i, target }, [], [], [i], `Target found at index ${i}! Returning index ${i}`);
        break;
      }
    }

    if (foundIdx === -1) {
      record(8, { target }, [], [], [], `Target ${target} not found in array. Returning -1`);
    }

    return steps;
  },

  runBenchmark: (sizes: number[], distribution: InputDistribution, targetVal?: number): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      const target = targetVal !== undefined ? targetVal : arr[Math.floor(n * 0.75)] || 999;
      let comparisons = 0;
      let assignments = 1; // n = arr.size()

      let found = false;
      for (let i = 0; i < n; ++i) {
        assignments++; // i
        comparisons++;
        if (arr[i] === target) {
          found = true;
          break;
        }
      }

      const theoreticalWorst = n;
      const theoreticalBest = 1;
      const theoreticalAvg = Math.round((n + 1) / 2);

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
      'Linear Search',
      cppCode,
      'InstrumentedInt target = arr[arr.size() / 2];\n        int idx = linearSearch(arr, target);\n        std::cout << "Target found at index: " << idx << "\\n";',
      true,
      arraySize,
      distribution
    );
  },
};
