import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';
import { generateStandaloneCpp } from './cppGenerators';

const cppCode = `int binarySearch(const std::vector<InstrumentedInt>& arr, const InstrumentedInt& target) {
    int low = 0;
    int high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'int binarySearch(const std::vector<InstrumentedInt>& arr, const InstrumentedInt& target) {',
    costLabel: 'c1',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function entry.',
    operationType: 'declaration',
    baseCost: 1,
  },
  {
    lineNumber: 2,
    code: '    int low = 0;',
    costLabel: 'c2',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Initialize lower search boundary.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 3,
    code: '    int high = arr.size() - 1;',
    costLabel: 'c3',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Initialize upper search boundary.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 4,
    code: '    while (low <= high) {',
    costLabel: 'c4',
    theoreticalFrequency: '1 to ⌊log₂ n⌋ + 2',
    frequencyExplanation: 'Loop condition: checks whether search interval is non-empty.',
    operationType: 'loop_control',
    baseCost: 1,
  },
  {
    lineNumber: 5,
    code: '        int mid = low + (high - low) / 2;',
    costLabel: 'c5',
    theoreticalFrequency: '1 to ⌊log₂ n⌋ + 1',
    frequencyExplanation: 'Overflow-safe midpoint calculation (divides search window in half).',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 6,
    code: '        if (arr[mid] == target) {',
    costLabel: 'c6',
    theoreticalFrequency: '1 to ⌊log₂ n⌋ + 1',
    frequencyExplanation: 'Primary Equality Comparison: 1 if target is at mid on first check (Ω(1) best case).',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 7,
    code: '            return mid;',
    costLabel: 'c7',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Return mid index upon successful match.',
    operationType: 'return',
    baseCost: 1,
  },
  {
    lineNumber: 8,
    code: '        } else if (arr[mid] < target) {',
    costLabel: 'c8',
    theoreticalFrequency: '1 to ⌊log₂ n⌋ + 1',
    frequencyExplanation: 'Order Comparison: determines whether target lies in right or left half.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 9,
    code: '            low = mid + 1;',
    costLabel: 'c9',
    theoreticalFrequency: 'Branch taken',
    frequencyExplanation: 'Discard left half: search interval becomes [mid + 1, high].',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 10,
    code: '        } else {',
    costLabel: 'c10',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Else branch.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 11,
    code: '            high = mid - 1;',
    costLabel: 'c11',
    theoreticalFrequency: 'Branch taken',
    frequencyExplanation: 'Discard right half: search interval becomes [low, mid - 1].',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 12,
    code: '        }',
    costLabel: 'c12',
    theoreticalFrequency: '-',
    frequencyExplanation: 'End if-else.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 13,
    code: '    }',
    costLabel: 'c13',
    theoreticalFrequency: '-',
    frequencyExplanation: 'End while loop.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 14,
    code: '    return -1;',
    costLabel: 'c14',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Returns -1 when search space is exhausted without finding target.',
    operationType: 'return',
    baseCost: 1,
  },
  {
    lineNumber: 15,
    code: '}',
    costLabel: 'c15',
    theoreticalFrequency: '1',
    frequencyExplanation: 'End binarySearch.',
    operationType: 'return',
    baseCost: 1,
  },
];

export const binarySearchDefinition: AlgorithmDefinition = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'searching',
  shortDescription: 'Searches sorted array by repeatedly halving the search interval in logarithmic time.',
  fullDescription: 'Binary Search requires a sorted sequence. At each iteration, it compares the target value to the middle element. If they differ, the half in which the target cannot lie is eliminated, reducing the search space from n to n/2 to n/4 ... to 1, guaranteeing at most ⌊log₂ n⌋ + 1 iterations.',
  requiresSorted: true,
  cppCode,
  lines,
  complexity: {
    bestTime: 'Ω(1)',
    averageTime: 'Θ(log n)',
    worstTime: 'O(log n)',
    spaceComplexity: 'O(1)',
    comparisonsFormula: {
      best: '1',
      worst: '2(⌊log₂ n⌋ + 1)',
      average: '2 log₂ n - 1',
      calculate: (n: number) => {
        const log2n = Math.floor(Math.log2(n));
        return {
          best: 1,
          worst: 2 * (log2n + 1),
          avg: Math.round(2 * log2n - 1),
        };
      },
    },
    assignmentsFormula: {
      best: '3',
      worst: 'log₂ n + 4',
      average: 'log₂ n + 3',
      calculate: (n: number) => {
        const log2n = Math.ceil(Math.log2(n));
        return {
          best: 3,
          worst: log2n + 4,
          avg: log2n + 3,
        };
      },
    },
  },
  derivations: [
    {
      title: '1. Interval Halving Recurrence',
      formula: 'T(n) = T(n / 2) + c, \\quad T(1) = \\Theta(1)',
      explanation: 'At every step, one comparison reduces the problem size from n to n/2, producing a linear recurrence in the exponent.',
    },
    {
      title: '2. Closed-Form Iteration Bound',
      formula: '\\frac{n}{2^k} = 1 \\implies 2^k = n \\implies k = \\log_2 n \\implies \\text{Max Steps} = \\lfloor \\log_2 n \\rfloor + 1',
      explanation: 'The search range reaches size 1 after at most log2(n) subdivisions, bounding comparisons by 2 * (floor(log2 n) + 1).',
    },
    {
      title: '3. Asymptotic Bound',
      formula: 'T(n) = \\mathcal{O}(\\log n)',
      explanation: 'Logarithmic growth means searching 1,000,000 items requires at most 20 iterations!',
    },
  ],
  generateSteps: (initialArray: number[], targetVal?: number): StepState[] => {
    const steps: StepState[] = [];
    const arr = [...initialArray].sort((a, b) => a - b);
    const n = arr.length;
    const target = targetVal !== undefined ? targetVal : arr[Math.floor(n * 0.7)] ?? arr[0];
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

    record(1, { target }, [], [], [], `binarySearch(arr, target=${target}) started on sorted array`);

    let low = 0;
    assignments += 1;
    record(2, { low, target }, [], [], [], `low = 0`);

    let high = n - 1;
    assignments += 1;
    record(3, { low, high, target }, [], [], [], `high = arr.size() - 1 [high = ${high}]`);

    let foundIdx = -1;

    while (low <= high) {
      record(4, { low, high, target }, [], [], [], `Search interval: [${low} .. ${high}] (size: ${high - low + 1})`);

      const mid = low + Math.floor((high - low) / 2);
      assignments += 1;
      record(5, { low, high, mid, target }, [], [], [], `Calculated midpoint: mid = ${mid} (value: ${arr[mid]})`);

      comparisons += 1;
      const isMatch = arr[mid] === target;
      record(
        6,
        { low, high, mid, target },
        [mid],
        [],
        isMatch ? [mid] : [],
        `Checking if arr[mid (${mid})] (${arr[mid]}) == target (${target}) -> ${isMatch ? 'MATCH FOUND!' : 'No match'}`,
        `arr[${mid}] == ${target}`,
        `${arr[mid]} == ${target} -> ${isMatch}`
      );

      if (isMatch) {
        foundIdx = mid;
        record(7, { low, high, mid, target }, [], [], [mid], `Target found at mid index ${mid}! Returning ${mid}`);
        break;
      }

      comparisons += 1;
      const isSmaller = arr[mid] < target;
      record(
        8,
        { low, high, mid, target },
        [mid],
        [],
        [],
        `Checking if arr[mid (${mid})] (${arr[mid]}) < target (${target}) -> ${isSmaller ? 'Target in right half' : 'Target in left half'}`,
        `arr[${mid}] < ${target}`,
        `${arr[mid]} < ${target} -> ${isSmaller}`
      );

      if (isSmaller) {
        low = mid + 1;
        assignments += 1;
        record(9, { low, high, mid, target }, [], [], [], `Discarded left half: new low = ${low}`);
      } else {
        high = mid - 1;
        assignments += 1;
        record(11, { low, high, mid, target }, [], [], [], `Discarded right half: new high = ${high}`);
      }
    }

    if (foundIdx === -1) {
      record(14, { target }, [], [], [], `Target ${target} absent from array. Returning -1`);
    }

    return steps;
  },

  runBenchmark: (sizes: number[], _dist: InputDistribution, targetVal?: number): BenchmarkPoint[] => {
    return sizes.map((n) => {
      // Must use sorted array for binary search
      const arr = generateArray(n, 'sorted');
      const target = targetVal !== undefined ? targetVal : arr[Math.floor(n * 0.8)] ?? 999;
      let comparisons = 0;
      let assignments = 2; // low, high

      let low = 0;
      let high = n - 1;

      while (low <= high) {
        const mid = low + Math.floor((high - low) / 2);
        assignments++;
        comparisons++;
        if (arr[mid] === target) {
          break;
        }
        comparisons++;
        if (arr[mid] < target) {
          low = mid + 1;
          assignments++;
        } else {
          high = mid - 1;
          assignments++;
        }
      }

      const log2n = Math.ceil(Math.log2(n));
      const theoreticalWorst = 2 * (log2n + 1);
      const theoreticalBest = 1;
      const theoreticalAvg = 2 * log2n - 1;

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
      'Binary Search',
      cppCode,
      '// Binary search requires a sorted array\n        std::sort(arr.begin(), arr.end());\n        InstrumentedInt target = arr[arr.size() * 3 / 4];\n        int idx = binarySearch(arr, target);\n        std::cout << "Target found at index: " << idx << "\\n";',
      true,
      arraySize,
      distribution
    );
  },
};
