import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';
import { generateStandaloneCpp } from './cppGenerators';

const cppCode = `int jumpSearch(const std::vector<InstrumentedInt>& arr, const InstrumentedInt& target) {
    int n = arr.size();
    int step = std::sqrt(n);
    int prev = 0;

    while (arr[std::min(step, n) - 1] < target) {
        prev = step;
        step += std::sqrt(n);
        if (prev >= n) return -1;
    }

    while (arr[prev] < target) {
        prev++;
        if (prev == std::min(step, n)) return -1;
    }

    if (arr[prev] == target) return prev;
    return -1;
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'int jumpSearch(const std::vector<InstrumentedInt>& arr, const InstrumentedInt& target) {',
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
    code: '    int step = std::sqrt(n);',
    costLabel: 'c3',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Optimal block jumping step: m = √n minimizes total jumps + linear scans.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 4,
    code: '    int prev = 0;',
    costLabel: 'c4',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Track starting index of current block.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 5,
    code: '',
    costLabel: 'c5',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Spacing',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 6,
    code: '    while (arr[std::min(step, n) - 1] < target) {',
    costLabel: 'c6',
    theoreticalFrequency: '≤ √n times',
    frequencyExplanation: 'Jump block condition: skips ahead by blocks of size √n.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 7,
    code: '        prev = step;',
    costLabel: 'c7',
    theoreticalFrequency: '≤ √n',
    frequencyExplanation: 'Advance block start boundary.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 8,
    code: '        step += std::sqrt(n);',
    costLabel: 'c8',
    theoreticalFrequency: '≤ √n',
    frequencyExplanation: 'Advance block end boundary.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 9,
    code: '        if (prev >= n) return -1;',
    costLabel: 'c9',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Boundary guard if target exceeds maximum array element.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 10,
    code: '    }',
    costLabel: 'c10',
    theoreticalFrequency: '-',
    frequencyExplanation: 'End jump loop.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 11,
    code: '',
    costLabel: 'c11',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Spacing',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 12,
    code: '    while (arr[prev] < target) {',
    costLabel: 'c12',
    theoreticalFrequency: '≤ √n times',
    frequencyExplanation: 'Linear scan within identified block: at most √n comparisons.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 13,
    code: '        prev++;',
    costLabel: 'c13',
    theoreticalFrequency: '≤ √n',
    frequencyExplanation: 'Increment within block.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 14,
    code: '        if (prev == std::min(step, n)) return -1;',
    costLabel: 'c14',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'End-of-block guard.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 15,
    code: '    }',
    costLabel: 'c15',
    theoreticalFrequency: '-',
    frequencyExplanation: 'End linear block loop.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 16,
    code: '',
    costLabel: 'c16',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Spacing',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 17,
    code: '    if (arr[prev] == target) return prev;',
    costLabel: 'c17',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Final match verification.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 18,
    code: '    return -1;',
    costLabel: 'c18',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Not found return.',
    operationType: 'return',
    baseCost: 1,
  },
  {
    lineNumber: 19,
    code: '}',
    costLabel: 'c19',
    theoreticalFrequency: '1',
    frequencyExplanation: 'End jumpSearch.',
    operationType: 'return',
    baseCost: 1,
  },
];

export const jumpSearchDefinition: AlgorithmDefinition = {
  id: 'jump-search',
  name: 'Jump Search',
  category: 'searching',
  shortDescription: 'Searches sorted array by leaping ahead by fixed block steps of size √n, then scanning linearly.',
  fullDescription: 'Jump Search reduces linear search overhead by jumping ahead in fixed blocks of size m = √n. Once a block is found where the boundary element exceeds the target, it performs a linear search strictly within that block. It achieves O(√n) complexity, serving as a middle ground between Linear Search and Binary Search (especially valuable when backward seeks are costly).',
  requiresSorted: true,
  cppCode,
  lines,
  complexity: {
    bestTime: 'Ω(1)',
    averageTime: 'Θ(√n)',
    worstTime: 'O(√n)',
    spaceComplexity: 'O(1)',
    comparisonsFormula: {
      best: '1',
      worst: '2√n - 1',
      average: '√n',
      calculate: (n: number) => {
        const sqrtN = Math.floor(Math.sqrt(n));
        return {
          best: 1,
          worst: 2 * sqrtN - 1,
          avg: sqrtN,
        };
      },
    },
    assignmentsFormula: {
      best: '3',
      worst: '2√n + 3',
      average: '√n + 3',
      calculate: (n: number) => {
        const sqrtN = Math.floor(Math.sqrt(n));
        return {
          best: 3,
          worst: 2 * sqrtN + 3,
          avg: sqrtN + 3,
        };
      },
    },
  },
  derivations: [
    {
      title: '1. Optimal Block Size Derivation',
      formula: 'f(m) = \\frac{n}{m} + (m - 1), \\quad \\frac{df}{dm} = -\\frac{n}{m^2} + 1 = 0 \\implies m = \\sqrt{n}',
      explanation: 'Differentiating the sum of block jumps (n/m) and linear scan within block (m - 1) minimizes total cost at m = √n.',
    },
    {
      title: '2. Worst-Case Bound',
      formula: 'C(n) \\le \\left(\\frac{n}{\\sqrt{n}} - 1\\right) + \\sqrt{n} = 2\\sqrt{n} - 1 = \\mathcal{O}(\\sqrt{n})',
      explanation: 'Worst case jumps to the very last block and checks all √n items in that block, bounding comparisons by 2√n - 1.',
    },
  ],
  generateSteps: (initialArray: number[], targetVal?: number): StepState[] => {
    const steps: StepState[] = [];
    const arr = [...initialArray].sort((a, b) => a - b);
    const n = arr.length;
    const target = targetVal !== undefined ? targetVal : arr[Math.floor(n * 0.6)] ?? arr[0];
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

    record(1, { target }, [], [], [], `jumpSearch(arr, target=${target}) started on sorted array`);
    const blockSize = Math.max(1, Math.floor(Math.sqrt(n)));
    let step = blockSize;
    assignments += 2;
    record(3, { step, target }, [], [], [], `Computed block jump step = √${n} ≈ ${step}`);

    let prev = 0;
    assignments += 1;
    record(4, { prev, step, target }, [], [], [], `Initialized prev = 0`);

    while (arr[Math.min(step, n) - 1] < target) {
      comparisons += 1;
      const probeIdx = Math.min(step, n) - 1;
      record(
        6,
        { prev, step, probe: probeIdx, target },
        [probeIdx],
        [],
        [],
        `Jumping block: checking boundary arr[${probeIdx}] (${arr[probeIdx]}) < target (${target}) -> YES, leap forward`,
        `arr[${probeIdx}] < ${target}`,
        `${arr[probeIdx]} < ${target} -> true`
      );

      prev = step;
      step += blockSize;
      assignments += 2;
      record(8, { prev, step, target }, [], [], [], `Leaped: prev = ${prev}, next boundary = ${step}`);

      if (prev >= n) {
        comparisons += 1;
        record(9, { prev, target }, [], [], [], `prev exceeds array size: target not found`);
        return steps;
      }
    }

    // Record the loop termination comparison
    const probeIdx = Math.min(step, n) - 1;
    comparisons += 1;
    record(
      6,
      { prev, step, probe: probeIdx, target },
      [probeIdx],
      [],
      [],
      `Boundary arr[${probeIdx}] (${arr[probeIdx]}) >= target (${target}) -> Target contained in block [${prev} .. ${probeIdx}]`,
      `arr[${probeIdx}] < ${target}`,
      `${arr[probeIdx]} < ${target} -> false`
    );

    // Linear search phase
    while (arr[prev] < target) {
      comparisons += 1;
      record(
        12,
        { prev, step, target },
        [prev],
        [],
        [],
        `Linear scan: arr[${prev}] (${arr[prev]}) < target (${target}) -> Next element`,
        `arr[${prev}] < ${target}`,
        `${arr[prev]} < ${target} -> true`
      );

      prev++;
      assignments += 1;
      record(13, { prev, step, target }, [], [], [], `prev incremented to ${prev}`);

      comparisons += 1;
      if (prev === Math.min(step, n)) {
        record(14, { prev, target }, [], [], [], `Reached end of block without match. Returning -1`);
        return steps;
      }
    }

    comparisons += 1;
    const match = arr[prev] === target;
    record(
      17,
      { prev, target },
      [prev],
      [],
      match ? [prev] : [],
      `Verification: arr[${prev}] (${arr[prev]}) == target (${target}) -> ${match ? 'MATCH FOUND!' : 'Not matched'}`,
      `arr[${prev}] == ${target}`,
      `${arr[prev]} == ${target} -> ${match}`
    );

    return steps;
  },

  runBenchmark: (sizes: number[], _dist: InputDistribution, targetVal?: number): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, 'sorted');
      const target = targetVal !== undefined ? targetVal : arr[Math.floor(n * 0.75)] ?? 999;
      let comparisons = 0;
      let assignments = 3; // n, step, prev

      const blockSize = Math.max(1, Math.floor(Math.sqrt(n)));
      let step = blockSize;
      let prev = 0;

      while (true) {
        const probe = Math.min(step, n) - 1;
        comparisons++;
        if (arr[probe] < target) {
          prev = step;
          step += blockSize;
          assignments += 2;
          comparisons++;
          if (prev >= n) break;
        } else {
          break;
        }
      }

      while (prev < Math.min(step, n)) {
        comparisons++;
        if (arr[prev] < target) {
          prev++;
          assignments++;
        } else {
          break;
        }
      }

      comparisons++;
      if (prev < n && arr[prev] === target) {
        // found
      }

      const sqrtN = Math.floor(Math.sqrt(n));
      const theoreticalWorst = 2 * sqrtN + 3;
      const theoreticalBest = 1;
      const theoreticalAvg = sqrtN + 3;

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
      'Jump Search',
      cppCode,
      '// Jump search requires a sorted array\n        std::sort(arr.begin(), arr.end());\n        InstrumentedInt target = arr[arr.size() * 3 / 4];\n        int idx = jumpSearch(arr, target);\n        std::cout << "Target found at index: " << idx << "\\n";',
      true,
      arraySize,
      distribution
    );
  },
};
