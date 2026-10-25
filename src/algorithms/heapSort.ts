import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';
import { generateStandaloneCpp } from './cppGenerators';

const cppCode = `void heapify(std::vector<InstrumentedInt>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;

    if (left < n && arr[left] > arr[largest])
        largest = left;

    if (right < n && arr[right] > arr[largest])
        largest = right;

    if (largest != i) {
        std::swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void heapSort(std::vector<InstrumentedInt>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; --i)
        heapify(arr, n, i);

    for (int i = n - 1; i > 0; --i) {
        std::swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'void heapify(std::vector<InstrumentedInt>& arr, int n, int i) {',
    costLabel: 'c1',
    theoreticalFrequency: 'Calls: O(n log n)',
    frequencyExplanation: 'Sinks element at index i down the binary heap tree to maintain max-heap property.',
    operationType: 'declaration',
    baseCost: 1,
  },
  {
    lineNumber: 2,
    code: '    int largest = i;',
    costLabel: 'c2',
    theoreticalFrequency: 'Calls: O(n log n)',
    frequencyExplanation: 'Initialize largest as root of current subtree.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 3,
    code: '    int left = 2 * i + 1;',
    costLabel: 'c3',
    theoreticalFrequency: 'Calls: O(n log n)',
    frequencyExplanation: 'Calculate 0-indexed left child position.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 4,
    code: '    int right = 2 * i + 2;',
    costLabel: 'c4',
    theoreticalFrequency: 'Calls: O(n log n)',
    frequencyExplanation: 'Calculate 0-indexed right child position.',
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
    code: '    if (left < n && arr[left] > arr[largest])',
    costLabel: 'c6',
    theoreticalFrequency: 'Calls: O(n log n)',
    frequencyExplanation: 'Comparison: check if left child exists and exceeds root value.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 7,
    code: '        largest = left;',
    costLabel: 'c7',
    theoreticalFrequency: 'Branch taken',
    frequencyExplanation: 'Update largest candidate to left child index.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 8,
    code: '',
    costLabel: 'c8',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Spacing',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 9,
    code: '    if (right < n && arr[right] > arr[largest])',
    costLabel: 'c9',
    theoreticalFrequency: 'Calls: O(n log n)',
    frequencyExplanation: 'Comparison: check if right child exists and exceeds current largest candidate.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 10,
    code: '        largest = right;',
    costLabel: 'c10',
    theoreticalFrequency: 'Branch taken',
    frequencyExplanation: 'Update largest candidate to right child index.',
    operationType: 'assignment',
    baseCost: 1,
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
    code: '    if (largest != i) {',
    costLabel: 'c12',
    theoreticalFrequency: 'Calls: O(n log n)',
    frequencyExplanation: 'Check if root violated max-heap property and must swap downward.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 13,
    code: '        std::swap(arr[i], arr[largest]);',
    costLabel: 'c13',
    theoreticalFrequency: 'Swaps: O(n log n)',
    frequencyExplanation: 'Swap root with larger child (3 assignments).',
    operationType: 'assignment',
    baseCost: 3,
  },
  {
    lineNumber: 14,
    code: '        heapify(arr, n, largest);',
    costLabel: 'c14',
    theoreticalFrequency: 'Recursion',
    frequencyExplanation: 'Recursively heapify affected subtree.',
    operationType: 'recursion',
    baseCost: 1,
  },
  {
    lineNumber: 15,
    code: '    }',
    costLabel: 'c15',
    theoreticalFrequency: '-',
    frequencyExplanation: 'End if',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 16,
    code: '}',
    costLabel: 'c16',
    theoreticalFrequency: '-',
    frequencyExplanation: 'End heapify function',
    operationType: 'return',
    baseCost: 1,
  },
  {
    lineNumber: 17,
    code: '',
    costLabel: 'c17',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Divider',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 18,
    code: 'void heapSort(std::vector<InstrumentedInt>& arr) {',
    costLabel: 'c18',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Main Heap Sort entry point.',
    operationType: 'declaration',
    baseCost: 1,
  },
  {
    lineNumber: 19,
    code: '    int n = arr.size();',
    costLabel: 'c19',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Vector size read.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 20,
    code: '    for (int i = n / 2 - 1; i >= 0; --i)',
    costLabel: 'c20',
    theoreticalFrequency: 'n / 2 + 1',
    frequencyExplanation: 'Phase 1: Build Max-Heap from lowest non-leaf node upward. Tight bound is O(n)!',
    operationType: 'loop_control',
    baseCost: 1,
  },
  {
    lineNumber: 21,
    code: '        heapify(arr, n, i);',
    costLabel: 'c21',
    theoreticalFrequency: 'n / 2 calls',
    frequencyExplanation: 'Heapify each internal node in reverse order to build initial valid heap.',
    operationType: 'recursion',
    baseCost: 1,
  },
  {
    lineNumber: 22,
    code: '',
    costLabel: 'c22',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Divider',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 23,
    code: '    for (int i = n - 1; i > 0; --i) {',
    costLabel: 'c23',
    theoreticalFrequency: 'n',
    frequencyExplanation: 'Phase 2: Extract max root to sorted suffix, then re-heapify.',
    operationType: 'loop_control',
    baseCost: 1,
  },
  {
    lineNumber: 24,
    code: '        std::swap(arr[0], arr[i]);',
    costLabel: 'c24',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Move current maximum from root arr[0] to its final sorted index arr[i] (3 assignments).',
    operationType: 'assignment',
    baseCost: 3,
  },
  {
    lineNumber: 25,
    code: '        heapify(arr, i, 0);',
    costLabel: 'c25',
    theoreticalFrequency: 'n - 1 calls',
    frequencyExplanation: 'Re-heapify reduced heap of size i from root (takes O(log i) time).',
    operationType: 'recursion',
    baseCost: 1,
  },
  {
    lineNumber: 26,
    code: '    }',
    costLabel: 'c26',
    theoreticalFrequency: '-',
    frequencyExplanation: 'End loop',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 27,
    code: '}',
    costLabel: 'c27',
    theoreticalFrequency: '1',
    frequencyExplanation: 'End function',
    operationType: 'return',
    baseCost: 1,
  },
];

export const heapSortDefinition: AlgorithmDefinition = {
  id: 'heap-sort',
  name: 'Heap Sort',
  category: 'sorting',
  shortDescription: 'Transforms array into a max-heap in O(n), then repeatedly extracts max element in O(n log n).',
  fullDescription: 'Heap Sort uses a binary heap data structure. First, `buildMaxHeap` organizes the array into a max-heap in linear O(n) time. Then, it repeatedly swaps the maximum element at the root with the last unsorted element and re-heapifies. It guarantees O(n log n) worst-case time with strictly O(1) auxiliary space.',
  requiresSorted: false,
  cppCode,
  lines,
  complexity: {
    bestTime: 'Ω(n log n)',
    averageTime: 'Θ(n log n)',
    worstTime: 'O(n log n)',
    spaceComplexity: 'O(1)',
    comparisonsFormula: {
      best: 'n log₂ n',
      worst: '2 n log₂ n',
      average: '1.5 n log₂ n',
      calculate: (n: number) => {
        const log2n = Math.log2(n);
        const worst = Math.round(2 * n * log2n);
        const best = Math.round(n * log2n);
        const avg = Math.round(1.5 * n * log2n);
        return { best, worst, avg };
      },
    },
    assignmentsFormula: {
      best: 'n log₂ n + 3n',
      worst: '3 n log₂ n + 3n',
      average: '2 n log₂ n + 3n',
      calculate: (n: number) => {
        const log2n = Math.log2(n);
        const worst = Math.round(3 * n * log2n + 3 * n);
        const best = Math.round(n * log2n + 3 * n);
        const avg = Math.round(2 * n * log2n + 3 * n);
        return { best, worst, avg };
      },
    },
  },
  derivations: [
    {
      title: '1. Phase 1: Build-Max-Heap is Strictly O(n)',
      formula: '\\sum_{h=0}^{\\lfloor \\log_2 n \\rfloor} \\left\\lceil \\frac{n}{2^{h+1}} \\right\\rceil \\cdot \\mathcal{O}(h) = \\mathcal{O}\\left( n \\sum_{h=0}^\\infty \\frac{h}{2^h} \\right) = \\mathcal{O}(2n) = \\mathcal{O}(n)',
      explanation: 'Most nodes in a heap reside close to the bottom where height h is small. Summing h / 2^h converges to 2, proving the entire heap is constructed in linear O(n) time.',
    },
    {
      title: '2. Phase 2: Extraction and Re-Heapification',
      formula: '\\sum_{i=1}^{n-1} \\mathcal{O}(\\log_2 i) = \\mathcal{O}(\\log( (n-1)! )) = \\mathcal{O}(n \\log n)',
      explanation: 'Each of the n - 1 extractions drops the new root down the heap tree of depth <= log2(n), giving strictly O(n log n) total work.',
    },
    {
      title: '3. Total Guaranteed Bound',
      formula: 'T(n) = \\mathcal{O}(n) + \\mathcal{O}(n \\log n) = \\mathcal{O}(n \\log n)',
      explanation: 'Unlike Quick Sort which can degrade to O(n²) under poor pivots, Heap Sort guarantees O(n log n) worst-case time with zero auxiliary memory.',
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

    function heapify(size: number, i: number) {
      callStack.push(`heapify(size=${size}, i=${i})`);
      record(1, { size, i }, [], [], Array.from(sortedSet), `heapify(arr, size=${size}, i=${i})`);

      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      assignments += 3;
      record(2, { size, i, largest, left, right }, [], [], Array.from(sortedSet), `Root i=${i}, Left child=${left}, Right child=${right}`);

      if (left < size) {
        comparisons += 1;
        const leftLarger = arr[left] > arr[largest];
        record(
          6,
          { size, i, largest, left },
          [left, largest],
          [],
          Array.from(sortedSet),
          `Checking left child: arr[${left}] (${arr[left]}) > arr[largest (${largest})] (${arr[largest]}) -> ${leftLarger}`,
          `arr[${left}] > arr[${largest}]`,
          `${arr[left]} > ${arr[largest]} -> ${leftLarger}`
        );
        if (leftLarger) {
          largest = left;
          assignments += 1;
          record(7, { size, i, largest }, [], [], Array.from(sortedSet), `largest updated to left child ${left}`);
        }
      }

      if (right < size) {
        comparisons += 1;
        const rightLarger = arr[right] > arr[largest];
        record(
          9,
          { size, i, largest, right },
          [right, largest],
          [],
          Array.from(sortedSet),
          `Checking right child: arr[${right}] (${arr[right]}) > arr[largest (${largest})] (${arr[largest]}) -> ${rightLarger}`,
          `arr[${right}] > arr[${largest}]`,
          `${arr[right]} > ${arr[largest]} -> ${rightLarger}`
        );
        if (rightLarger) {
          largest = right;
          assignments += 1;
          record(10, { size, i, largest }, [], [], Array.from(sortedSet), `largest updated to right child ${right}`);
        }
      }

      comparisons += 1;
      record(12, { size, i, largest }, [], [], Array.from(sortedSet), `Check if largest (${largest}) != i (${i}) -> ${largest !== i}`);

      if (largest !== i) {
        const tmp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = tmp;
        assignments += 3;
        record(
          13,
          { size, i, largest },
          [],
          [i, largest],
          Array.from(sortedSet),
          `std::swap(arr[${i}], arr[${largest}]): Swapped parent ${arr[largest]} with child ${arr[i]}`
        );

        record(14, { size, largest }, [], [], Array.from(sortedSet), `Recursing heapify on child subtree at index ${largest}`);
        heapify(size, largest);
      }

      callStack.pop();
    }

    record(18, {}, [], [], [], 'Function invoked: heapSort(arr)');
    record(19, { n }, [], [], [], `int n = arr.size() [n = ${n}]`);

    // Phase 1: Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; --i) {
      record(20, { i }, [], [], [], `Build-Heap phase: heapifying internal node i = ${i}`);
      heapify(n, i);
    }

    // Phase 2: Extract max
    for (let i = n - 1; i > 0; --i) {
      record(23, { i }, [], [], Array.from(sortedSet), `Extraction phase: swapping root max arr[0] with arr[${i}]`);
      const tmp = arr[0];
      arr[0] = arr[i];
      arr[i] = tmp;
      assignments += 3;
      sortedSet.add(i);
      record(24, { i }, [], [0, i], Array.from(sortedSet), `Extracted maximum ${arr[i]} into final position ${i}`);

      record(25, { i }, [], [], Array.from(sortedSet), `Re-heapifying root arr[0] for reduced heap size ${i}`);
      heapify(i, 0);
    }

    sortedSet.add(0);
    record(27, {}, [], [], Array.from({ length: n }, (_, idx) => idx), `Heap Sort completed! Comparisons: ${comparisons}, Assignments: ${assignments}`);

    return steps;
  },

  runBenchmark: (sizes: number[], distribution: InputDistribution): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      let comparisons = 0;
      let assignments = 0;

      function bHeapify(sz: number, idx: number) {
        let largest = idx;
        const l = 2 * idx + 1;
        const r = 2 * idx + 2;
        assignments += 3;

        if (l < sz) {
          comparisons++;
          if (arr[l] > arr[largest]) {
            largest = l;
            assignments++;
          }
        }
        if (r < sz) {
          comparisons++;
          if (arr[r] > arr[largest]) {
            largest = r;
            assignments++;
          }
        }
        comparisons++;
        if (largest !== idx) {
          const t = arr[idx];
          arr[idx] = arr[largest];
          arr[largest] = t;
          assignments += 3;
          bHeapify(sz, largest);
        }
      }

      for (let i = Math.floor(n / 2) - 1; i >= 0; --i) {
        bHeapify(n, i);
      }
      for (let i = n - 1; i > 0; --i) {
        const t = arr[0];
        arr[0] = arr[i];
        arr[i] = t;
        assignments += 3;
        bHeapify(i, 0);
      }

      const log2n = Math.log2(n);
      const theoreticalWorst = Math.round(2 * n * log2n + 3 * n * log2n + 3 * n);
      const theoreticalBest = Math.round(n * log2n + n * log2n + 3 * n);
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
      'Heap Sort',
      cppCode,
      'heapSort(arr);',
      false,
      arraySize,
      distribution
    );
  },
};
