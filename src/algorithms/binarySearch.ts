import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';

const cppCode = `int binarySearch(int a[], int n, int key)
{
    int low = 0;
    int high = n - 1;

    while (low <= high)
    {
        int mid = (low + high) / 2;

        if (a[mid] == key)
            return mid;

        else if (a[mid] < key)
            low = mid + 1;

        else
            high = mid - 1;
    }

    return -1;
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'int binarySearch(int a[], int n, int key)',
    costLabel: 'c1',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function signature and entry invocation.',
    operationType: 'declaration',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 2,
    code: '{',
    costLabel: 'c2',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function block opening.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 3,
    code: '    int low = 0;',
    costLabel: 'c3',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Initializes lower bound of search window to index 0.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 4,
    code: '    int high = n - 1;',
    costLabel: 'c4',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Initializes upper bound of search window to index n - 1.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 5,
    code: '    while (low <= high)',
    costLabel: 'c5',
    theoreticalFrequency: 'log₂ n + 1',
    frequencyExplanation: 'While loop interval validity check. Halves search interval on each iteration.',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(log N)',
    simpleExplanation: 'Continues while search interval contains at least one item.',
  },
  {
    lineNumber: 6,
    code: '    {',
    costLabel: 'c6',
    theoreticalFrequency: 'log₂ n',
    frequencyExplanation: 'Loop block start.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 7,
    code: '        int mid = (low + high) / 2;',
    costLabel: 'c7',
    theoreticalFrequency: 'log₂ n',
    frequencyExplanation: 'Computes median index of the remaining search window.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(log N)',
    simpleExplanation: 'Picks the middle index of the current range.',
  },
  {
    lineNumber: 8,
    code: '        if (a[mid] == key)',
    costLabel: 'c8',
    theoreticalFrequency: 'log₂ n',
    frequencyExplanation: 'Primary equality check: checks if midpoint contains search key.',
    operationType: 'comparison',
    baseCost: 1,
    complexityClass: 'O(log N)',
    simpleExplanation: 'Checks if middle element matches key.',
  },
  {
    lineNumber: 9,
    code: '            return mid;',
    costLabel: 'c9',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Returns matched index immediately.',
    operationType: 'return',
    baseCost: 1,
    complexityClass: 'O(1)',
    simpleExplanation: 'Target found at midpoint, return index.',
  },
  {
    lineNumber: 10,
    code: '        else if (a[mid] < key)',
    costLabel: 'c10',
    theoreticalFrequency: 'log₂ n',
    frequencyExplanation: 'Directional comparison: checks if target is in upper or lower half.',
    operationType: 'comparison',
    baseCost: 1,
    complexityClass: 'O(log N)',
    simpleExplanation: 'Checks if key is to the right of mid.',
  },
  {
    lineNumber: 11,
    code: '            low = mid + 1;',
    costLabel: 'c11',
    theoreticalFrequency: 'k_1 · log₂ n',
    frequencyExplanation: 'Discards left half; shifts lower bound rightward.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 12,
    code: '        else',
    costLabel: 'c12',
    theoreticalFrequency: 'log₂ n',
    frequencyExplanation: 'Alternative branch when a[mid] > key.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 13,
    code: '            high = mid - 1;',
    costLabel: 'c13',
    theoreticalFrequency: 'k_2 · log₂ n',
    frequencyExplanation: 'Discards right half; shifts upper bound leftward.',
    operationType: 'assignment',
    baseCost: 1,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 14,
    code: '    }',
    costLabel: 'c14',
    theoreticalFrequency: 'log₂ n',
    frequencyExplanation: 'End of while loop.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(log N)',
  },
  {
    lineNumber: 15,
    code: '    return -1;',
    costLabel: 'c15',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Returned if window collapsed without finding the key.',
    operationType: 'return',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
  {
    lineNumber: 16,
    code: '}',
    costLabel: 'c16',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function return.',
    operationType: 'return',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
];

export const binarySearchDefinition: AlgorithmDefinition = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'searching',
  shortDescription: 'Finds key position in a sorted array by repeatedly dividing search interval in half.',
  fullDescription: 'Binary Search requires the array to be sorted. On each step, it compares the target with the middle element, eliminating half of the remaining array elements and achieving O(log n) time.',
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
      worst: '2 ⌊log₂ n⌋ + 2',
      average: '2 ⌊log₂ n⌋',
      calculate: (n: number) => {
        const log2n = Math.floor(Math.log2(n || 1));
        return { best: 1, worst: 2 * log2n + 2, avg: 2 * log2n + 1 };
      },
    },
    assignmentsFormula: {
      best: '3',
      worst: 'log₂ n + 2',
      average: 'log₂ n + 2',
      calculate: (n: number) => {
        const log2n = Math.floor(Math.log2(n || 1));
        return { best: 3, worst: log2n + 2, avg: log2n + 2 };
      },
    },
  },
  derivations: [
    {
      title: '1. Search Space Reduction Relation',
      formula: 'N_k = \\frac{n}{2^k} \\ge 1 \\implies 2^k \\le n \\implies k \\le \\log_2 n',
      explanation: 'Since the search space is divided by 2 on every iteration, at most ⌊log₂ n⌋ + 1 iterations can occur before window collapses.',
    },
    {
      title: '2. Total Comparisons Closed Form',
      formula: 'C(n) \\le 2 \\lfloor \\log_2 n \\rfloor + 2 = \\mathcal{O}(\\log n)',
      explanation: 'At most two comparisons per iteration (equality check and directional inequality), leading to strict logarithmic time.',
    },
  ],
  intuitiveGuide: {
    shape: 'halving',
    plainEnglishSummary: 'Like searching for a word in a dictionary: open to the middle, see if the target is before or after, and discard the other half.',
    scalingRule: 'If you double the array size from 1000 to 2000, it takes only 1 extra step!',
    threeStepBreakdown: {
      step1Loops: 'Look at the midpoint mid = (low + high) / 2.',
      step2Counts: 'If too high, search left. If too low, search right. Search space cuts in half every time.',
      step3BigO: 'Takes at most log₂(n) steps, giving O(log n).',
    },
  },
  generateSteps: (initialArray: number[], targetVal: number = 45): StepState[] => {
    const steps: StepState[] = [];
    const a = [...initialArray].sort((x, y) => x - y);
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

    record(1, { key: targetVal }, [], [], [], `Starting binarySearch(a, n = ${n}, key = ${targetVal})`);

    let low = 0;
    let high = n - 1;
    assignments += 2;
    record(3, { low, high, key: targetVal }, [], [], [], `low = 0`);
    record(4, { low, high, key: targetVal }, [], [], [], `high = n - 1 = ${high}`);

    let found = false;

    while (low <= high) {
      record(5, { low, high, key: targetVal }, [], [], [], `while (low <= high): window is [${low}, ${high}]`);

      const mid = Math.floor((low + high) / 2);
      assignments++;
      record(7, { low, high, mid, key: targetVal }, [mid], [], [], `mid = (low + high) / 2 = ${mid} (value: ${a[mid]})`);

      comparisons++;
      const cmpEqExpr = `a[${mid}] == key`;
      const isEq = a[mid] === targetVal;
      const cmpEqRes = `${a[mid]} == ${targetVal} -> ${isEq}`;

      record(8, { low, high, mid, key: targetVal }, [mid], [], [], `Checking if a[mid] == key (${a[mid]} == ${targetVal})`, cmpEqExpr, cmpEqRes);

      if (isEq) {
        found = true;
        record(9, { low, high, mid, key: targetVal }, [mid], [], [mid], `Match found! Returning index ${mid}`, cmpEqExpr, cmpEqRes);
        break;
      }

      comparisons++;
      const cmpLtExpr = `a[${mid}] < key`;
      const isLt = a[mid] < targetVal;
      const cmpLtRes = `${a[mid]} < ${targetVal} -> ${isLt}`;

      record(10, { low, high, mid, key: targetVal }, [mid], [], [], `else if (a[mid] < key): checking ${a[mid]} < ${targetVal}`, cmpLtExpr, cmpLtRes);

      if (isLt) {
        low = mid + 1;
        assignments++;
        record(11, { low, high, mid, key: targetVal }, [], [], [], `Target is in right half: low = mid + 1 (${low})`);
      } else {
        high = mid - 1;
        assignments++;
        record(13, { low, high, mid, key: targetVal }, [], [], [], `Target is in left half: high = mid - 1 (${high})`);
      }
    }

    if (!found) {
      record(15, { low, high, key: targetVal }, [], [], [], `Search window collapsed (low > high). Returning -1`);
    }

    return steps;
  },
  runBenchmark: (sizes: number[], distribution: InputDistribution, targetVal: number = 45): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution).sort((x, y) => x - y);
      let comparisons = 0;
      let assignments = 2;
      let low = 0;
      let high = n - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        assignments++;
        comparisons++;
        if (arr[mid] === targetVal) {
          break;
        }
        comparisons++;
        if (arr[mid] < targetVal) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
        assignments++;
      }
      const log2n = Math.floor(Math.log2(n || 1));
      return {
        n,
        observedComparisons: comparisons,
        observedAssignments: assignments,
        totalOperations: comparisons,
        theoreticalWorst: 2 * log2n + 2,
        theoreticalAvg: 2 * log2n + 1,
        theoreticalBest: 1,
      };
    });
  },
  getStandaloneCpp: (arraySize: number, distribution: InputDistribution): string => {
    const sampleArr = generateArray(arraySize, distribution).sort((x, y) => x - y);
    const key = sampleArr[Math.floor(sampleArr.length / 2)] || 45;
    return `#include <iostream>
using namespace std;

int binarySearch(int a[], int n, int key)
{
    int low = 0;
    int high = n - 1;

    while (low <= high)
    {
        int mid = (low + high) / 2;

        if (a[mid] == key)
            return mid;

        else if (a[mid] < key)
            low = mid + 1;

        else
            high = mid - 1;
    }

    return -1;
}

int main()
{
    int a[50], n, key, result;

    // Default sample input initialized for demonstration:
    n = ${Math.min(arraySize, 50)};
    int sampleData[] = {${sampleArr.slice(0, 50).join(', ')}};
    for (int i = 0; i < n; i++) a[i] = sampleData[i];
    key = ${key};

    cout << "Sorted array elements: ";
    for (int i = 0; i < n; i++)
        cout << a[i] << " ";
    cout << "\\n";

    cout << "Element to search: " << key << "\\n";

    result = binarySearch(a, n, key);

    if (result == -1)
        cout << "Element not found\\n";
    else
        cout << "Element found at position " << result + 1 << " (index " << result << ")\\n";

    return 0;
}`;
  },
};
