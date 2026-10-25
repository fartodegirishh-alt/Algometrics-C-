import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';
import { generateStandaloneCpp } from './cppGenerators';

const cppCode = `int interpolationSearch(const std::vector<InstrumentedInt>& arr, const InstrumentedInt& target) {
    int low = 0;
    int high = arr.size() - 1;

    while (low <= high && target >= arr[low] && target <= arr[high]) {
        if (arr[high] == arr[low]) {
            if (arr[low] == target) return low;
            return -1;
        }

        // Interpolated probe position based on key value
        int pos = low + ((double)(high - low) / (arr[high].get() - arr[low].get())) * (target.get() - arr[low].get());

        if (arr[pos] == target)
            return pos;

        if (arr[pos] < target)
            low = pos + 1;
        else
            high = pos - 1;
    }
    return -1;
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'int interpolationSearch(const std::vector<InstrumentedInt>& arr, const InstrumentedInt& target) {',
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
    frequencyExplanation: 'Initialize lower boundary.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 3,
    code: '    int high = arr.size() - 1;',
    costLabel: 'c3',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Initialize upper boundary.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 4,
    code: '',
    costLabel: 'c4',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Spacing',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 5,
    code: '    while (low <= high && target >= arr[low] && target <= arr[high]) {',
    costLabel: 'c5',
    theoreticalFrequency: 'Avg: O(log log n), Worst: O(n)',
    frequencyExplanation: 'Interval boundary and range check: ensures target falls within current value window.',
    operationType: 'comparison',
    baseCost: 3,
  },
  {
    lineNumber: 6,
    code: '        if (arr[high] == arr[low]) {',
    costLabel: 'c6',
    theoreticalFrequency: 'Edge case check',
    frequencyExplanation: 'Avoid division-by-zero when subsegment elements are identical.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 7,
    code: '            if (arr[low] == target) return low;',
    costLabel: 'c7',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Immediate return if uniform flat segment matches target.',
    operationType: 'return',
    baseCost: 1,
  },
  {
    lineNumber: 8,
    code: '            return -1;',
    costLabel: 'c8',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Return not found if uniform flat segment does not match.',
    operationType: 'return',
    baseCost: 1,
  },
  {
    lineNumber: 9,
    code: '        }',
    costLabel: 'c9',
    theoreticalFrequency: '-',
    frequencyExplanation: 'End if',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 10,
    code: '',
    costLabel: 'c10',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Spacing',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 11,
    code: '        int pos = low + ((double)(high - low) / (arr[high] - arr[low])) * (target - arr[low]);',
    costLabel: 'c11',
    theoreticalFrequency: 'Avg: O(log log n)',
    frequencyExplanation: 'Probe Calculation: Probes where the target ought to be assuming uniform value distribution (like looking up "Zebra" near end of phonebook).',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 12,
    code: '',
    costLabel: 'c12',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Spacing',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 13,
    code: '        if (arr[pos] == target)',
    costLabel: 'c13',
    theoreticalFrequency: 'Avg: O(log log n)',
    frequencyExplanation: 'Comparison: check if interpolated probe hit exact target value.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 14,
    code: '            return pos;',
    costLabel: 'c14',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Early successful return on probe hit.',
    operationType: 'return',
    baseCost: 1,
  },
  {
    lineNumber: 15,
    code: '',
    costLabel: 'c15',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Spacing',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 16,
    code: '        if (arr[pos] < target)',
    costLabel: 'c16',
    theoreticalFrequency: 'Avg: O(log log n)',
    frequencyExplanation: 'Comparison: adjust interval based on probe value vs target.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 17,
    code: '            low = pos + 1;',
    costLabel: 'c17',
    theoreticalFrequency: 'Branch taken',
    frequencyExplanation: 'Target is higher: adjust low boundary.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 18,
    code: '        else',
    costLabel: 'c18',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Else',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 19,
    code: '            high = pos - 1;',
    costLabel: 'c19',
    theoreticalFrequency: 'Branch taken',
    frequencyExplanation: 'Target is lower: adjust high boundary.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 20,
    code: '    }',
    costLabel: 'c20',
    theoreticalFrequency: '-',
    frequencyExplanation: 'End while loop',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 21,
    code: '    return -1;',
    costLabel: 'c21',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Return -1 if target not located.',
    operationType: 'return',
    baseCost: 1,
  },
  {
    lineNumber: 22,
    code: '}',
    costLabel: 'c22',
    theoreticalFrequency: '1',
    frequencyExplanation: 'End function.',
    operationType: 'return',
    baseCost: 1,
  },
];

export const interpolationSearchDefinition: AlgorithmDefinition = {
  id: 'interpolation-search',
  name: 'Interpolation Search',
  category: 'searching',
  shortDescription: 'Estimates target position based on key value distribution, achieving O(log log n) on uniform data.',
  fullDescription: 'Interpolation Search improves upon Binary Search for sorted arrays that are uniformly distributed. Like a human looking up a word starting with "B" near the front of a dictionary rather than cutting in half, it calculates a probe position via linear interpolation. Average time is Θ(log log n), but can degrade to O(n) under exponential distributions.',
  requiresSorted: true,
  cppCode,
  lines,
  complexity: {
    bestTime: 'Ω(1)',
    averageTime: 'Θ(log log n)',
    worstTime: 'O(n)',
    spaceComplexity: 'O(1)',
    comparisonsFormula: {
      best: '1',
      worst: '2n',
      average: '2 log₂(log₂ n) + 2',
      calculate: (n: number) => {
        const logLogN = Math.max(1, Math.round(2 * Math.log2(Math.max(2, Math.log2(n))) + 2));
        return {
          best: 1,
          worst: 2 * n,
          avg: logLogN,
        };
      },
    },
    assignmentsFormula: {
      best: '3',
      worst: 'n + 4',
      average: 'log₂(log₂ n) + 4',
      calculate: (n: number) => {
        const avg = Math.max(2, Math.round(Math.log2(Math.max(2, Math.log2(n))) + 4));
        return {
          best: 3,
          worst: n + 4,
          avg,
        };
      },
    },
  },
  derivations: [
    {
      title: '1. Linear Interpolation Probe Formula',
      formula: '\\text{pos} = \\text{low} + \\left\\lfloor \\frac{\\text{target} - \\text{arr}[\\text{low}]}{\\text{arr}[\\text{high}] - \\text{arr}[\\text{low}]} \\cdot (\\text{high} - \\text{low}) \\right\\rfloor',
      explanation: 'Assumes linear distribution between arr[low] and arr[high]. The fraction represents the expected relative distance of the target from low.',
    },
    {
      title: '2. Average-Case O(log log n) Proof',
      formula: 'n_{k+1} \\approx \\sqrt{n_k} \\implies n_k = n^{1/2^k} = 2 \\implies 2^k = \\log_2 n \\implies k = \\log_2(\\log_2 n)',
      explanation: 'On uniform random keys, each probe reduces the remaining search window by a square root factor (n -> sqrt(n) -> n^(1/4)), taking log log n iterations.',
    },
    {
      title: '3. Worst-Case Pathological Distribution',
      formula: '\\text{arr}[i] = 2^i \\implies \\text{pos} \\approx \\text{low} \\implies T(n) = \\mathcal{O}(n)',
      explanation: 'Under exponential distribution, the interpolation formula consistently probes only 1 index away, degrading to sequential linear search.',
    },
  ],
  generateSteps: (initialArray: number[], targetVal?: number): StepState[] => {
    const steps: StepState[] = [];
    const arr = [...initialArray].sort((a, b) => a - b);
    const n = arr.length;
    const target = targetVal !== undefined ? targetVal : arr[Math.floor(n * 0.65)] ?? arr[0];
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

    record(1, { target }, [], [], [], `interpolationSearch(arr, target=${target}) started`);

    let low = 0;
    let high = n - 1;
    assignments += 2;
    record(2, { low, high, target }, [], [], [], `low = 0, high = ${high}`);

    while (low <= high && target >= arr[low] && target <= arr[high]) {
      comparisons += 3;
      record(
        5,
        { low, high, target },
        [low, high],
        [],
        [],
        `Testing boundaries: low(${low}) <= high(${high}) && ${arr[low]} <= ${target} <= ${arr[high]} -> In range!`
      );

      comparisons += 1;
      if (arr[high] === arr[low]) {
        comparisons += 1;
        if (arr[low] === target) {
          record(7, { low, high, target }, [low], [], [low], `All segment values equal and match target! Returning ${low}`);
          return steps;
        }
        record(8, { low, high, target }, [], [], [], `Segment values equal but target not present. Returning -1`);
        return steps;
      }

      const fraction = (target - arr[low]) / (arr[high] - arr[low]);
      const rawPos = low + Math.floor(fraction * (high - low));
      const pos = Math.max(low, Math.min(high, rawPos));
      assignments += 1;
      record(
        11,
        { low, high, pos, target },
        [],
        [],
        [],
        `Interpolated probe calculation: pos = ${pos} (fraction: ${(fraction * 100).toFixed(1)}% of window [${low}..${high}])`
      );

      comparisons += 1;
      const isMatch = arr[pos] === target;
      record(
        13,
        { low, high, pos, target },
        [pos],
        [],
        isMatch ? [pos] : [],
        `Probing arr[${pos}] (${arr[pos]}) == target (${target}) -> ${isMatch ? 'MATCH FOUND!' : 'Not matched'}`,
        `arr[${pos}] == ${target}`,
        `${arr[pos]} == ${target} -> ${isMatch}`
      );

      if (isMatch) {
        record(14, { low, high, pos, target }, [], [], [pos], `Target found at interpolated position ${pos}! Returning ${pos}`);
        return steps;
      }

      comparisons += 1;
      const isSmaller = arr[pos] < target;
      record(
        16,
        { low, high, pos, target },
        [pos],
        [],
        [],
        `arr[${pos}] (${arr[pos]}) < target (${target}) -> ${isSmaller ? 'Target higher' : 'Target lower'}`
      );

      if (isSmaller) {
        low = pos + 1;
        assignments += 1;
        record(17, { low, high, pos, target }, [], [], [], `Target higher: low = ${low}`);
      } else {
        high = pos - 1;
        assignments += 1;
        record(19, { low, high, pos, target }, [], [], [], `Target lower: high = ${high}`);
      }
    }

    record(21, { target }, [], [], [], `Target ${target} out of range or not found. Returning -1`);
    return steps;
  },

  runBenchmark: (sizes: number[], _dist: InputDistribution, targetVal?: number): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, 'sorted');
      const target = targetVal !== undefined ? targetVal : arr[Math.floor(n * 0.75)] ?? 999;
      let comparisons = 0;
      let assignments = 2; // low, high

      let low = 0;
      let high = n - 1;

      while (low <= high && target >= arr[low] && target <= arr[high]) {
        comparisons += 3;
        comparisons++;
        if (arr[high] === arr[low]) {
          comparisons++;
          break;
        }

        const fraction = (target - arr[low]) / (arr[high] - arr[low]);
        const pos = Math.max(low, Math.min(high, low + Math.floor(fraction * (high - low))));
        assignments++;

        comparisons++;
        if (arr[pos] === target) break;

        comparisons++;
        if (arr[pos] < target) {
          low = pos + 1;
          assignments++;
        } else {
          high = pos - 1;
          assignments++;
        }
      }

      const logLogN = Math.max(1, Math.round(2 * Math.log2(Math.max(2, Math.log2(n))) + 2));
      const theoreticalWorst = 2 * n;
      const theoreticalBest = 1;
      const theoreticalAvg = logLogN;

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
      'Interpolation Search',
      cppCode,
      '// Interpolation search operates on sorted uniform data\n        std::sort(arr.begin(), arr.end());\n        InstrumentedInt target = arr[arr.size() * 3 / 4];\n        int idx = interpolationSearch(arr, target);\n        std::cout << "Target found at index: " << idx << "\\n";',
      true,
      arraySize,
      distribution
    );
  },
};
