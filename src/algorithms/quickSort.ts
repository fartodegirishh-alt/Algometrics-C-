import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';
import { generateStandaloneCpp } from './cppGenerators';

const cppCode = `int partition(std::vector<InstrumentedInt>& arr, int low, int high) {
    InstrumentedInt pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; ++j) {
        if (arr[j] < pivot) {
            ++i;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(std::vector<InstrumentedInt>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'int partition(std::vector<InstrumentedInt>& arr, int low, int high) {',
    costLabel: 'c1',
    theoreticalFrequency: 'Calls: O(n)',
    frequencyExplanation: 'Partition subroutine invoked once per internal recursion node.',
    operationType: 'declaration',
    baseCost: 1,
  },
  {
    lineNumber: 2,
    code: '    InstrumentedInt pivot = arr[high];',
    costLabel: 'c2',
    theoreticalFrequency: 'Calls: O(n)',
    frequencyExplanation: 'Select last element of subarray as pivot element (Lomuto scheme).',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 3,
    code: '    int i = low - 1;',
    costLabel: 'c3',
    theoreticalFrequency: 'Calls: O(n)',
    frequencyExplanation: 'Initialize index of smaller element boundary.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 4,
    code: '    for (int j = low; j < high; ++j) {',
    costLabel: 'c4',
    theoreticalFrequency: 'Sum: O(n log n) avg, O(n²) worst',
    frequencyExplanation: 'Loop from low to high - 1 to partition elements around pivot.',
    operationType: 'loop_control',
    baseCost: 1,
  },
  {
    lineNumber: 5,
    code: '        if (arr[j] < pivot) {',
    costLabel: 'c5',
    theoreticalFrequency: 'Sum: n log₂ n avg, n(n-1)/2 worst',
    frequencyExplanation: 'Core Comparison: tests if current element is strictly less than pivot.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 6,
    code: '            ++i;',
    costLabel: 'c6',
    theoreticalFrequency: '0 to high - low',
    frequencyExplanation: 'Increment smaller element partition pointer i.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 7,
    code: '            std::swap(arr[i], arr[j]);',
    costLabel: 'c7',
    theoreticalFrequency: '0 to high - low',
    frequencyExplanation: 'Swap current smaller element into left boundary (3 assignments).',
    operationType: 'assignment',
    baseCost: 3,
  },
  {
    lineNumber: 8,
    code: '        }',
    costLabel: 'c8',
    theoreticalFrequency: 'Loop body',
    frequencyExplanation: 'End if.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 9,
    code: '    }',
    costLabel: 'c9',
    theoreticalFrequency: 'Loop exit',
    frequencyExplanation: 'End partition loop.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 10,
    code: '    std::swap(arr[i + 1], arr[high]);',
    costLabel: 'c10',
    theoreticalFrequency: 'Calls: O(n)',
    frequencyExplanation: 'Place pivot into its correct absolute sorted index between partitions.',
    operationType: 'assignment',
    baseCost: 3,
  },
  {
    lineNumber: 11,
    code: '    return i + 1;',
    costLabel: 'c11',
    theoreticalFrequency: 'Calls: O(n)',
    frequencyExplanation: 'Return pivot index pi.',
    operationType: 'return',
    baseCost: 1,
  },
  {
    lineNumber: 12,
    code: '}',
    costLabel: 'c12',
    theoreticalFrequency: 'Calls: O(n)',
    frequencyExplanation: 'End partition function.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 13,
    code: '',
    costLabel: 'c13',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Divider',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 14,
    code: 'void quickSort(std::vector<InstrumentedInt>& arr, int low, int high) {',
    costLabel: 'c14',
    theoreticalFrequency: 'O(n) to O(n²)',
    frequencyExplanation: 'Recursive entry for Quick Sort.',
    operationType: 'recursion',
    baseCost: 1,
  },
  {
    lineNumber: 15,
    code: '    if (low < high) {',
    costLabel: 'c15',
    theoreticalFrequency: 'O(n) to O(n²)',
    frequencyExplanation: 'Subarray boundary validity test.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 16,
    code: '        int pi = partition(arr, low, high);',
    costLabel: 'c16',
    theoreticalFrequency: 'O(n)',
    frequencyExplanation: 'Linear partitioning step: returns fixed pivot index.',
    operationType: 'recursion',
    baseCost: 1,
  },
  {
    lineNumber: 17,
    code: '        quickSort(arr, low, pi - 1);',
    costLabel: 'c17',
    theoreticalFrequency: 'O(n)',
    frequencyExplanation: 'Recurse on left subarray (elements strictly smaller than pivot).',
    operationType: 'recursion',
    baseCost: 1,
  },
  {
    lineNumber: 18,
    code: '        quickSort(arr, pi + 1, high);',
    costLabel: 'c18',
    theoreticalFrequency: 'O(n)',
    frequencyExplanation: 'Recurse on right subarray (elements greater than or equal to pivot).',
    operationType: 'recursion',
    baseCost: 1,
  },
  {
    lineNumber: 19,
    code: '    }',
    costLabel: 'c19',
    theoreticalFrequency: '-',
    frequencyExplanation: 'End if.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 20,
    code: '}',
    costLabel: 'c20',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Return from quickSort.',
    operationType: 'return',
    baseCost: 1,
  },
];

export const quickSortDefinition: AlgorithmDefinition = {
  id: 'quick-sort',
  name: 'Quick Sort (Lomuto)',
  category: 'sorting',
  shortDescription: 'In-place divide-and-conquer algorithm that partitions around a pivot, sorting subarrays recursively.',
  fullDescription: 'Quick Sort chooses a pivot element (here, `arr[high]`) and partitions the array such that all smaller elements precede the pivot and all greater elements follow it. Then it recurses on both halves. Average runtime is Θ(n log n), while worst-case is O(n²) when partitions are maximally unbalanced.',
  requiresSorted: false,
  cppCode,
  lines,
  complexity: {
    bestTime: 'Ω(n log n)',
    averageTime: 'Θ(n log n)',
    worstTime: 'O(n²)',
    spaceComplexity: 'O(log n)',
    comparisonsFormula: {
      best: 'n log₂ n',
      worst: 'n(n - 1) / 2',
      average: '2 n ln n ≈ 1.38 n log₂ n',
      calculate: (n: number, dist?: InputDistribution) => {
        const worst = (n * (n - 1)) / 2;
        const best = Math.round(n * Math.log2(n));
        const avg = Math.round(1.386 * n * Math.log2(n));
        if (dist === 'sorted' || dist === 'reversed') {
          return { best, worst, avg: worst };
        }
        return { best, worst, avg };
      },
    },
    assignmentsFormula: {
      best: '2 n log₂ n',
      worst: '3 · n(n - 1) / 2',
      average: '2.5 n log₂ n',
      calculate: (n: number, dist?: InputDistribution) => {
        const worst = 3 * ((n * (n - 1)) / 2);
        const best = Math.round(2 * n * Math.log2(n));
        const avg = dist === 'sorted' || dist === 'reversed' ? worst : Math.round(2.5 * n * Math.log2(n));
        return { best, worst, avg };
      },
    },
  },
  derivations: [
    {
      title: '1. Average-Case Recurrence',
      formula: 'T(n) = \\frac{1}{n} \\sum_{k=0}^{n-1} [T(k) + T(n - 1 - k)] + \\Theta(n)',
      explanation: 'Over all uniform random pivot positions k, the expected runtime evaluates to 2 n ln n = 1.386 n log2(n) = Theta(n log n).',
    },
    {
      title: '2. Worst-Case Degradation',
      formula: 'T(n) = T(n - 1) + \\Theta(n) = \\sum_{k=1}^n k = \\frac{n(n + 1)}{2} = \\mathcal{O}(n^2)',
      explanation: 'When the chosen pivot is consistently the maximum or minimum (e.g. on already-sorted input with last element pivot), partition depth degrades to n.',
    },
    {
      title: '3. In-Place Space Advantage',
      formula: '\\text{Space} = \\mathcal{O}(\\log n) \\text{ call stack frames}',
      explanation: 'Unlike Merge Sort which requires O(n) auxiliary array allocation, Quick Sort sorts strictly in-place with only activation record stack overhead.',
    },
  ],
  generateSteps: (initialArray: number[]): StepState[] => {
    const steps: StepState[] = [];
    const arr = [...initialArray];
    const n = arr.length;
    let comparisons = 0;
    let assignments = 0;
    const lineHits: { [line: number]: number } = {};
    const callStack: string[] = [];
    const sortedSet = new Set<number>();

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
        callStack: [...callStack],
        comparisons,
        assignments,
        lineHits: { ...lineHits },
        message: msg,
        highlightExpression: expr,
        expressionResult: result,
      });
    };

    function partition(low: number, high: number): number {
      callStack.push(`partition(low=${low}, high=${high})`);
      record(1, { low, high }, [], [], Array.from(sortedSet), `Entering partition(arr, ${low}, ${high})`);

      const pivot = arr[high];
      assignments += 1;
      record(2, { low, high, pivot: high }, [], [], Array.from(sortedSet), `Selected pivot arr[${high}] = ${pivot}`);

      let i = low - 1;
      assignments += 1;
      record(3, { low, high, i, pivot: high }, [], [], Array.from(sortedSet), `Initialized left boundary i = ${i}`);

      for (let j = low; j < high; ++j) {
        record(4, { low, high, i, j, pivot: high }, [], [], Array.from(sortedSet), `Scanning index j = ${j}`);

        comparisons += 1;
        const isLess = arr[j] < pivot;
        record(
          5,
          { low, high, i, j, pivot: high },
          [j, high],
          [],
          Array.from(sortedSet),
          `Checking if arr[${j}] (${arr[j]}) < pivot (${pivot}) -> ${isLess ? 'Yes, swap to left partition' : 'No, keep on right'}`,
          `arr[${j}] < ${pivot}`,
          `${arr[j]} < ${pivot} -> ${isLess}`
        );

        if (isLess) {
          ++i;
          assignments += 1;
          record(6, { low, high, i, j, pivot: high }, [], [], Array.from(sortedSet), `Incremented boundary i to ${i}`);

          const tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;
          assignments += 3;
          record(
            7,
            { low, high, i, j, pivot: high },
            [],
            [i, j],
            Array.from(sortedSet),
            `std::swap(arr[${i}], arr[${j}]): Swapped ${arr[j]} and ${arr[i]}`
          );
        }
      }

      const tmp = arr[i + 1];
      arr[i + 1] = arr[high];
      arr[high] = tmp;
      assignments += 3;
      const pi = i + 1;
      sortedSet.add(pi);
      record(
        10,
        { low, high, pi },
        [],
        [pi, high],
        Array.from(sortedSet),
        `Placed pivot (${pivot}) into final sorted index ${pi}`
      );

      record(11, { low, high, pi }, [], [], Array.from(sortedSet), `Returning pivot index ${pi}`);
      callStack.pop();
      return pi;
    }

    function sort(low: number, high: number) {
      callStack.push(`quickSort(low=${low}, high=${high})`);
      record(14, { low, high }, [], [], Array.from(sortedSet), `quickSort(arr, ${low}, ${high})`);

      comparisons += 1; // if (low < high)
      record(15, { low, high }, [], [], Array.from(sortedSet), `Check if low (${low}) < high (${high}) -> ${low < high}`);

      if (low < high) {
        const pi = partition(low, high);
        assignments += 1;
        record(16, { low, high, pi }, [], [], Array.from(sortedSet), `Partition complete: pivot fixed at index ${pi}`);

        record(17, { low, high, 'pi-1': pi - 1 }, [], [], Array.from(sortedSet), `Recursing left: quickSort(${low}, ${pi - 1})`);
        sort(low, pi - 1);

        record(18, { low, high, 'pi+1': pi + 1 }, [], [], Array.from(sortedSet), `Recursing right: quickSort(${pi + 1}, ${high})`);
        sort(pi + 1, high);
      } else if (low === high) {
        sortedSet.add(low);
      }

      callStack.pop();
    }

    sort(0, n - 1);
    for (let k = 0; k < n; k++) sortedSet.add(k);
    record(20, {}, [], [], Array.from(sortedSet), `Quick Sort completed! Total comparisons: ${comparisons}, Total assignments: ${assignments}`);

    return steps;
  },

  runBenchmark: (sizes: number[], distribution: InputDistribution): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      let comparisons = 0;
      let assignments = 0;

      function bPartition(l: number, h: number): number {
        const piv = arr[h];
        assignments++;
        let i = l - 1;
        assignments++;
        for (let j = l; j < h; ++j) {
          comparisons++;
          if (arr[j] < piv) {
            i++;
            assignments++;
            const t = arr[i];
            arr[i] = arr[j];
            arr[j] = t;
            assignments += 3;
          }
        }
        const t = arr[i + 1];
        arr[i + 1] = arr[h];
        arr[h] = t;
        assignments += 3;
        return i + 1;
      }

      function bQuick(l: number, h: number) {
        comparisons++;
        if (l < h) {
          const pi = bPartition(l, h);
          assignments++;
          bQuick(l, pi - 1);
          bQuick(pi + 1, h);
        }
      }

      bQuick(0, n - 1);

      const theoreticalWorst = (n * (n - 1)) / 2 + 3 * ((n * (n - 1)) / 2);
      const log2n = Math.log2(n);
      const theoreticalBest = Math.round(n * log2n + 2 * n * log2n);
      const theoreticalAvg = Math.round(1.386 * n * log2n + 2.5 * n * log2n);

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
      'Quick Sort (Lomuto Partition)',
      cppCode,
      'quickSort(arr, 0, arr.size() - 1);',
      false,
      arraySize,
      distribution
    );
  },
};
