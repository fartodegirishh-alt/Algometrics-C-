import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';

const cppCode = `void heapify(int a[], int n, int i)
{
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;

    if (left < n && a[left] > a[largest])
        largest = left;

    if (right < n && a[right] > a[largest])
        largest = right;

    if (largest != i)
    {
        swap(a[i], a[largest]);
        heapify(a, n, largest);
    }
}

void heapSort(int a[], int n)
{
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(a, n, i);

    for (int i = n - 1; i > 0; i--)
    {
        swap(a[0], a[i]);
        heapify(a, i, 0);
    }
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'void heapify(int a[], int n, int i)',
    costLabel: 'c1',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Sift-down routine to maintain max-heap property at node i.',
    operationType: 'declaration',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 2,
    code: '{',
    costLabel: 'c2',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Block start.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 3,
    code: '    int largest = i;',
    costLabel: 'c3',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Initialize root as candidate largest element.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 4,
    code: '    int left = 2 * i + 1;',
    costLabel: 'c4',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Compute index of left child in binary heap.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 5,
    code: '    int right = 2 * i + 2;',
    costLabel: 'c5',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Compute index of right child in binary heap.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 6,
    code: '    if (left < n && a[left] > a[largest])',
    costLabel: 'c6',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Checks if left child exists and is greater than current largest.',
    operationType: 'comparison',
    baseCost: 1,
    complexityClass: 'O(log N)',
    simpleExplanation: 'Compares left child with parent.',
  },
  {
    lineNumber: 7,
    code: '        largest = left;',
    costLabel: 'c7',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Sets largest to left child index.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 8,
    code: '    if (right < n && a[right] > a[largest])',
    costLabel: 'c8',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Checks if right child exists and is greater than running largest.',
    operationType: 'comparison',
    baseCost: 1,
    complexityClass: 'O(log N)',
    simpleExplanation: 'Compares right child with largest so far.',
  },
  {
    lineNumber: 9,
    code: '        largest = right;',
    costLabel: 'c9',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Sets largest to right child index.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 10,
    code: '    if (largest != i)',
    costLabel: 'c10',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Checks if any child was strictly larger than node i.',
    operationType: 'comparison',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 11,
    code: '    {',
    costLabel: 'c11',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Swap block start.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 12,
    code: '        swap(a[i], a[largest]);',
    costLabel: 'c12',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Swaps root with largest child.',
    operationType: 'assignment',
    baseCost: 3,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 13,
    code: '        heapify(a, n, largest);',
    costLabel: 'c13',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Recursively heapifies the affected sub-tree downwards.',
    operationType: 'recursion',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 14,
    code: '    }',
    costLabel: 'c14',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'End swap block.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 15,
    code: '}',
    costLabel: 'c15',
    theoreticalFrequency: 'O(log n)',
    frequencyExplanation: 'Return from heapify.',
    operationType: 'return',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 16,
    code: 'void heapSort(int a[], int n)',
    costLabel: 'c16',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Heap sort entry point.',
    operationType: 'declaration',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 17,
    code: '{',
    costLabel: 'c17',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Block start.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 18,
    code: '    for (int i = n / 2 - 1; i >= 0; i--)',
    costLabel: 'c18',
    theoreticalFrequency: 'n / 2',
    frequencyExplanation: 'Build heap phase: processes all internal non-leaf nodes in bottom-up order.',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(N)',
    simpleExplanation: 'Builds initial max-heap in linear O(n) total comparisons.',
  },
  {
    lineNumber: 19,
    code: '        heapify(a, n, i);',
    costLabel: 'c19',
    theoreticalFrequency: 'n / 2',
    frequencyExplanation: 'Heapifies subtree rooted at internal node i.',
    operationType: 'recursion',
    baseCost: 1,
    complexityClass: 'O(N)',
  },
  {
    lineNumber: 20,
    code: '    for (int i = n - 1; i > 0; i--)',
    costLabel: 'c20',
    theoreticalFrequency: 'n',
    frequencyExplanation: 'Extraction phase: repeatedly moves max to end and sifts down.',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 21,
    code: '    {',
    costLabel: 'c21',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Extraction block start.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 22,
    code: '        swap(a[0], a[i]);',
    costLabel: 'c22',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Swaps current max root (a[0]) into sorted position at end of heap.',
    operationType: 'assignment',
    baseCost: 3,
    complexityClass: 'O(N)',
  },
  {
    lineNumber: 23,
    code: '        heapify(a, i, 0);',
    costLabel: 'c23',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'Re-establishes max heap property on reduced heap of size i.',
    operationType: 'recursion',
    baseCost: 1,
    complexityClass: 'O(N log N)',
  },
  {
    lineNumber: 24,
    code: '    }',
    costLabel: 'c24',
    theoreticalFrequency: 'n - 1',
    frequencyExplanation: 'End extraction loop.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 25,
    code: '}',
    costLabel: 'c25',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function return.',
    operationType: 'return',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
];

export const heapSortDefinition: AlgorithmDefinition = {
  id: 'heap-sort',
  name: 'Heap Sort',
  category: 'sorting',
  shortDescription: 'Builds a max-heap, then repeatedly extracts the root maximum to the end of the array.',
  fullDescription: 'Heap Sort organizes elements into a binary max-heap. It converts the array in linear O(n) time into a heap, then repeatedly swaps the maximum root to the end and restores the heap property in O(log n) time per item.',
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
        const log2n = Math.log2(n || 1);
        const worst = Math.round(2 * n * log2n);
        const best = Math.round(n * log2n);
        const avg = Math.round(1.5 * n * log2n);
        return { best: Math.max(1, best), worst: Math.max(1, worst), avg: Math.max(1, avg) };
      },
    },
    assignmentsFormula: {
      best: 'n log₂ n',
      worst: '3 n log₂ n',
      average: '2 n log₂ n',
      calculate: (n: number) => {
        const val = Math.round(2 * n * Math.log2(n || 1));
        return { best: val, worst: val, avg: val };
      },
    },
  },
  derivations: [
    {
      title: '1. Build-Heap Phase (Linear Bound)',
      formula: '\\sum_{h=0}^{\\lfloor \\log n \\rfloor} \\left\\lceil \\frac{n}{2^{h+1}} \\right\\rceil O(h) = O\\left(n \\sum_{h=0}^{\\infty} \\frac{h}{2^h}\\right) = O(2n) = O(n)',
      explanation: 'Although individual heapify operations take O(h), most nodes are near the leaves where h is tiny. The sum converges to O(n).',
    },
    {
      title: '2. Extraction Phase (Logarithmic Extraction)',
      formula: '\\sum_{i=1}^{n-1} 2 \\log_2(i) \\le 2 \\log_2(n!) \\approx 2 n \\log_2(n) - 2.88 n = \\mathcal{O}(n \\log n)',
      explanation: 'Extracting each of the (n - 1) items requires sifting down from root to leaf, taking at most 2 log₂(n) comparisons per element.',
    },
  ],
  intuitiveGuide: {
    shape: 'tree',
    plainEnglishSummary: 'Organizes the numbers like a family tree where every parent is bigger than its children (max-heap). Plucks the top maximum number one by one.',
    scalingRule: 'If you double the array size from 10 to 20, operations increase by only about 2.3x.',
    threeStepBreakdown: {
      step1Loops: 'Phase 1: Build max-heap bottom-up in O(n) operations.',
      step2Counts: 'Phase 2: Extract top maximum (n - 1) times, each sift-down takes at most 2 log₂(n) steps.',
      step3BigO: 'Total = O(n) + O(n log n) = O(n log n) in all cases.',
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

    const sortedIndices: number[] = [];

    const heapify = (size: number, i: number) => {
      record(1, { n: size, i }, [], [], [...sortedIndices], `heapify(a, n = ${size}, i = ${i})`);

      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      assignments += 3;
      record(3, { n: size, i, largest }, [], [], [...sortedIndices], `largest = ${i}`);
      record(4, { n: size, i, largest, left }, [], [], [...sortedIndices], `left = 2 * ${i} + 1 = ${left}`);
      record(5, { n: size, i, largest, left, right }, [], [], [...sortedIndices], `right = 2 * ${i} + 2 = ${right}`);

      if (left < size) {
        comparisons++;
        const cmpExpr = `left < n && a[${left}] > a[${largest}]`;
        const isLeftBigger = a[left] > a[largest];
        const cmpRes = `${a[left]} > ${a[largest]} -> ${isLeftBigger}`;
        record(6, { n: size, i, largest, left }, [left, largest], [], [...sortedIndices], `Comparing left child a[${left}] (${a[left]}) > a[largest] (${a[largest]})`, cmpExpr, cmpRes);
        if (isLeftBigger) {
          largest = left;
          assignments++;
          record(7, { n: size, i, largest }, [], [], [...sortedIndices], `largest = left (${largest})`);
        }
      }

      if (right < size) {
        comparisons++;
        const cmpExpr = `right < n && a[${right}] > a[${largest}]`;
        const isRightBigger = a[right] > a[largest];
        const cmpRes = `${a[right]} > ${a[largest]} -> ${isRightBigger}`;
        record(8, { n: size, i, largest, right }, [right, largest], [], [...sortedIndices], `Comparing right child a[${right}] (${a[right]}) > a[largest] (${a[largest]})`, cmpExpr, cmpRes);
        if (isRightBigger) {
          largest = right;
          assignments++;
          record(9, { n: size, i, largest }, [], [], [...sortedIndices], `largest = right (${largest})`);
        }
      }

      record(10, { n: size, i, largest }, [], [], [...sortedIndices], `Checking if (largest != i) (${largest} != ${i})`);

      if (largest !== i) {
        // swap(a[i], a[largest])
        const temp = a[i];
        a[i] = a[largest];
        a[largest] = temp;
        assignments += 3;
        record(12, { n: size, i, largest }, [], [i, largest], [...sortedIndices], `swap(a[${i}], a[${largest}]), swapped ${a[largest]} with ${a[i]}`);

        heapify(size, largest);
      }
    };

    record(16, {}, [], [], [], `Starting heapSort(a, n = ${n})`);

    // Build heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      record(18, { i }, [], [], [], `Build heap pass for parent i = ${i}`);
      heapify(n, i);
    }

    // Extract elements
    for (let i = n - 1; i > 0; i--) {
      record(20, { i }, [], [], [...sortedIndices], `Extraction pass: moving max root a[0] to index i = ${i}`);

      const temp = a[0];
      a[0] = a[i];
      a[i] = temp;
      assignments += 3;
      record(22, { i }, [], [0, i], [...sortedIndices], `swap(a[0], a[${i}]), placed maximum ${a[i]} into sorted spot`);

      sortedIndices.push(i);
      heapify(i, 0);
    }

    sortedIndices.push(0);
    record(25, {}, [], [], Array.from({ length: n }, (_, idx) => idx), `Heap sort complete. Total comparisons: ${comparisons}`);

    return steps;
  },
  runBenchmark: (sizes: number[], distribution: InputDistribution): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      let comparisons = 0;
      let assignments = 0;

      const heapify = (size: number, i: number) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < size) {
          comparisons++;
          if (arr[left] > arr[largest]) largest = left;
        }
        if (right < size) {
          comparisons++;
          if (arr[right] > arr[largest]) largest = right;
        }
        if (largest !== i) {
          const temp = arr[i];
          arr[i] = arr[largest];
          arr[largest] = temp;
          assignments += 3;
          heapify(size, largest);
        }
      };

      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
      }
      for (let i = n - 1; i > 0; i--) {
        const temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        assignments += 3;
        heapify(i, 0);
      }

      const log2n = Math.log2(n || 1);
      const theoretical = Math.round(2 * n * log2n);

      return {
        n,
        observedComparisons: comparisons,
        observedAssignments: assignments,
        totalOperations: comparisons,
        theoreticalWorst: theoretical,
        theoreticalAvg: Math.round(1.5 * n * log2n),
        theoreticalBest: Math.round(n * log2n),
      };
    });
  },
  getStandaloneCpp: (arraySize: number, distribution: InputDistribution): string => {
    const sampleArr = generateArray(arraySize, distribution);
    return `#include <iostream>
using namespace std;

void heapify(int a[], int n, int i)
{
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;

    if (left < n && a[left] > a[largest])
        largest = left;

    if (right < n && a[right] > a[largest])
        largest = right;

    if (largest != i)
    {
        swap(a[i], a[largest]);
        heapify(a, n, largest);
    }
}

void heapSort(int a[], int n)
{
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(a, n, i);

    for (int i = n - 1; i > 0; i--)
    {
        swap(a[0], a[i]);
        heapify(a, i, 0);
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

    heapSort(a, n);

    cout << "Sorted array: ";
    for (int i = 0; i < n; i++)
        cout << a[i] << " ";
    cout << "\\n";

    return 0;
}`;
  },
};
