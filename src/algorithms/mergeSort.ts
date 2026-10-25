import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';
import { generateStandaloneCpp } from './cppGenerators';

const cppCode = `void merge(std::vector<InstrumentedInt>& arr, int left, int mid, int right) {
    std::vector<InstrumentedInt> temp(right - left + 1);
    int i = left, j = mid + 1, k = 0;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
        }
    }
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    for (int p = 0; p < k; ++p) arr[left + p] = temp[p];
}

void mergeSort(std::vector<InstrumentedInt>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'void merge(std::vector<InstrumentedInt>& arr, int left, int mid, int right) {',
    costLabel: 'c1',
    theoreticalFrequency: 'n - 1 calls',
    frequencyExplanation: 'Merge routine executed once per non-leaf internal node in recurrence tree.',
    operationType: 'declaration',
    baseCost: 1,
  },
  {
    lineNumber: 2,
    code: '    std::vector<InstrumentedInt> temp(right - left + 1);',
    costLabel: 'c2',
    theoreticalFrequency: 'n - 1 calls',
    frequencyExplanation: 'Allocates auxiliary buffer for merging sub-arrays. Accounts for O(n) auxiliary space.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 3,
    code: '    int i = left, j = mid + 1, k = 0;',
    costLabel: 'c3',
    theoreticalFrequency: 'n - 1 calls',
    frequencyExplanation: 'Indices initialization for left subarray, right subarray, and output buffer.',
    operationType: 'assignment',
    baseCost: 3,
  },
  {
    lineNumber: 4,
    code: '    while (i <= mid && j <= right) {',
    costLabel: 'c4',
    theoreticalFrequency: 'O(n log n)',
    frequencyExplanation: 'Merge loop condition: runs until one of the two halves is exhausted.',
    operationType: 'loop_control',
    baseCost: 1,
  },
  {
    lineNumber: 5,
    code: '        if (arr[i] <= arr[j]) {',
    costLabel: 'c5',
    theoreticalFrequency: 'O(n log n)',
    frequencyExplanation: 'Core Comparison: picks smaller of the two heads. Guaranteed <= n log2(n) comparisons total.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 6,
    code: '            temp[k++] = arr[i++];',
    costLabel: 'c6',
    theoreticalFrequency: 'O(n log n)',
    frequencyExplanation: 'Copying left element into buffer (1 assignment).',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 7,
    code: '        } else {',
    costLabel: 'c7',
    theoreticalFrequency: 'O(n log n)',
    frequencyExplanation: 'Else branch.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 8,
    code: '            temp[k++] = arr[j++];',
    costLabel: 'c8',
    theoreticalFrequency: 'O(n log n)',
    frequencyExplanation: 'Copying right element into buffer (1 assignment).',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 9,
    code: '        }',
    costLabel: 'c9',
    theoreticalFrequency: 'O(n log n)',
    frequencyExplanation: 'If-else closure.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 10,
    code: '    }',
    costLabel: 'c10',
    theoreticalFrequency: 'n - 1 calls',
    frequencyExplanation: 'End of dual-scan while loop.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 11,
    code: '    while (i <= mid) temp[k++] = arr[i++];',
    costLabel: 'c11',
    theoreticalFrequency: 'O(n log n)',
    frequencyExplanation: 'Drain remaining elements of left partition directly into temp buffer.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 12,
    code: '    while (j <= right) temp[k++] = arr[j++];',
    costLabel: 'c12',
    theoreticalFrequency: 'O(n log n)',
    frequencyExplanation: 'Drain remaining elements of right partition directly into temp buffer.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 13,
    code: '    for (int p = 0; p < k; ++p) arr[left + p] = temp[p];',
    costLabel: 'c13',
    theoreticalFrequency: 'n log2(n)',
    frequencyExplanation: 'Copy back buffer elements into original array. Exact sum across levels equals n * ceil(log2 n).',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 14,
    code: '}',
    costLabel: 'c14',
    theoreticalFrequency: 'n - 1 calls',
    frequencyExplanation: 'End merge.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 15,
    code: '',
    costLabel: 'c15',
    theoreticalFrequency: '-',
    frequencyExplanation: 'Divider',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 16,
    code: 'void mergeSort(std::vector<InstrumentedInt>& arr, int left, int right) {',
    costLabel: 'c16',
    theoreticalFrequency: '2n - 1 calls',
    frequencyExplanation: 'Recursive entry: total recursive activations in binary recursion tree of size n is 2n - 1.',
    operationType: 'recursion',
    baseCost: 1,
  },
  {
    lineNumber: 17,
    code: '    if (left < right) {',
    costLabel: 'c17',
    theoreticalFrequency: '2n - 1 calls',
    frequencyExplanation: 'Base-case check (left < right). Evaluates false for all n leaves.',
    operationType: 'comparison',
    baseCost: 1,
  },
  {
    lineNumber: 18,
    code: '        int mid = left + (right - left) / 2;',
    costLabel: 'c18',
    theoreticalFrequency: 'n - 1 calls',
    frequencyExplanation: 'Overflow-safe midpoint computation.',
    operationType: 'assignment',
    baseCost: 1,
  },
  {
    lineNumber: 19,
    code: '        mergeSort(arr, left, mid);',
    costLabel: 'c19',
    theoreticalFrequency: 'n - 1 calls',
    frequencyExplanation: 'Recursive call on left half: T(ceil(n/2)).',
    operationType: 'recursion',
    baseCost: 1,
  },
  {
    lineNumber: 20,
    code: '        mergeSort(arr, mid + 1, right);',
    costLabel: 'c20',
    theoreticalFrequency: 'n - 1 calls',
    frequencyExplanation: 'Recursive call on right half: T(floor(n/2)).',
    operationType: 'recursion',
    baseCost: 1,
  },
  {
    lineNumber: 21,
    code: '        merge(arr, left, mid, right);',
    costLabel: 'c21',
    theoreticalFrequency: 'n - 1 calls',
    frequencyExplanation: 'Linear time merge subroutine: O(n) work per level.',
    operationType: 'recursion',
    baseCost: 1,
  },
  {
    lineNumber: 22,
    code: '    }',
    costLabel: 'c22',
    theoreticalFrequency: '2n - 1',
    frequencyExplanation: 'End if.',
    operationType: 'none',
    baseCost: 0,
  },
  {
    lineNumber: 23,
    code: '}',
    costLabel: 'c23',
    theoreticalFrequency: '2n - 1',
    frequencyExplanation: 'Return from mergeSort activation.',
    operationType: 'return',
    baseCost: 1,
  },
];

export const mergeSortDefinition: AlgorithmDefinition = {
  id: 'merge-sort',
  name: 'Merge Sort',
  category: 'sorting',
  shortDescription: 'Divide-and-conquer algorithm that divides input into halves, sorts recursively, and merges.',
  fullDescription: 'Merge Sort splits the array recursively down to single-element subarrays, then merges adjacent sorted lists using a linear scan. Its performance is strictly Θ(n log n) across all cases, providing predictable, stable sorting at the cost of O(n) auxiliary memory.',
  requiresSorted: false,
  cppCode,
  lines,
  complexity: {
    bestTime: 'Ω(n log n)',
    averageTime: 'Θ(n log n)',
    worstTime: 'O(n log n)',
    spaceComplexity: 'O(n)',
    comparisonsFormula: {
      best: '0.5 n log₂ n',
      worst: 'n log₂ n - n + 1',
      average: 'n log₂ n - 0.9 n',
      calculate: (n: number) => {
        const log2n = Math.log2(n);
        const worst = Math.round(n * log2n - n + 1);
        const best = Math.round(0.5 * n * log2n);
        const avg = Math.round(n * log2n - 0.9 * n);
        return { best, worst, avg };
      },
    },
    assignmentsFormula: {
      best: '2 n log₂ n',
      worst: '2 n log₂ n',
      average: '2 n log₂ n',
      calculate: (n: number) => {
        const val = Math.round(2 * n * Math.log2(n));
        return { best: val, worst: val, avg: val };
      },
    },
  },
  derivations: [
    {
      title: '1. Divide-and-Conquer Recurrence Relation',
      formula: 'T(n) = 2T(n/2) + c \\cdot n, \\quad T(1) = \\Theta(1)',
      explanation: 'Two recursive calls of size n/2 plus linear work Theta(n) to merge the two sorted halves back into array.',
    },
    {
      title: '2. Master Theorem (Case 2)',
      formula: 'a = 2, b = 2, f(n) = \\Theta(n^1) \\implies n^{\\log_b a} = n^{\\log_2 2} = n^1 \\implies T(n) = \\Theta(n \\log n)',
      explanation: 'Since f(n) matches n^(log_b a), Case 2 of the Master Theorem applies, confirming strictly Theta(n log n).',
    },
    {
      title: '3. Recursion Tree Depth and Operation Tally',
      formula: '\\text{Depth} = \\log_2 n, \\quad \\text{Cost per level} = c \\cdot n \\implies \\text{Total Cost} = c \\cdot n \\log_2 n',
      explanation: 'Each level of the binary tree does exactly n merge operations. With log2(n) levels, the total comparison and copy workload scales as n log2(n).',
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

    function merge(left: number, mid: number, right: number) {
      callStack.push(`merge(left=${left}, mid=${mid}, right=${right})`);
      record(1, { left, mid, right }, [], [], [], `Entering merge(arr, ${left}, ${mid}, ${right})`);

      const temp: number[] = new Array(right - left + 1);
      assignments += temp.length;
      record(2, { left, mid, right }, [], [], [], `Allocated temporary buffer of size ${temp.length}`);

      let i = left;
      let j = mid + 1;
      let k = 0;
      assignments += 3;
      record(3, { left, mid, right, i, j, k }, [], [], [], `Initialized i = ${i}, j = ${j}, k = ${k}`);

      while (i <= mid && j <= right) {
        comparisons += 1;
        const takeLeft = arr[i] <= arr[j];
        record(
          5,
          { left, mid, right, i, j, k },
          [i, j],
          [],
          [],
          `Comparing arr[${i}] (${arr[i]}) <= arr[${j}] (${arr[j]}) -> ${takeLeft ? 'Take left' : 'Take right'}`,
          `arr[${i}] <= arr[${j}]`,
          `${arr[i]} <= ${arr[j]} -> ${takeLeft}`
        );

        if (takeLeft) {
          temp[k++] = arr[i++];
          assignments += 1;
          record(6, { left, mid, right, i, j, k }, [], [], [], `Copied left element ${temp[k - 1]} to temp[${k - 1}]`);
        } else {
          temp[k++] = arr[j++];
          assignments += 1;
          record(8, { left, mid, right, i, j, k }, [], [], [], `Copied right element ${temp[k - 1]} to temp[${k - 1}]`);
        }
      }

      while (i <= mid) {
        temp[k++] = arr[i++];
        assignments += 1;
        record(11, { left, mid, right, i, k }, [], [], [], `Drained remaining left element into temp`);
      }

      while (j <= right) {
        temp[k++] = arr[j++];
        assignments += 1;
        record(12, { left, mid, right, j, k }, [], [], [], `Drained remaining right element into temp`);
      }

      for (let p = 0; p < k; ++p) {
        arr[left + p] = temp[p];
        assignments += 1;
        record(
          13,
          { left, right, p, dest: left + p },
          [],
          [left + p],
          [],
          `Copied buffer temp[${p}] (${temp[p]}) back into arr[${left + p}]`
        );
      }

      record(14, { left, right }, [], [], [], `Merged subsegment [${left}..${right}]`);
      callStack.pop();
    }

    function sort(left: number, right: number) {
      callStack.push(`mergeSort(left=${left}, right=${right})`);
      record(16, { left, right }, [], [], [], `mergeSort(arr, ${left}, ${right})`);

      comparisons += 1; // if (left < right)
      record(17, { left, right }, [], [], [], `Check if left (${left}) < right (${right}) -> ${left < right}`);

      if (left < right) {
        const mid = left + Math.floor((right - left) / 2);
        assignments += 1;
        record(18, { left, right, mid }, [], [], [], `Computed mid = ${mid}`);

        record(19, { left, mid }, [], [], [], `Recursing left: mergeSort(${left}, ${mid})`);
        sort(left, mid);

        record(20, { 'mid+1': mid + 1, right }, [], [], [], `Recursing right: mergeSort(${mid + 1}, ${right})`);
        sort(mid + 1, right);

        record(21, { left, mid, right }, [], [], [], `Calling merge(${left}, ${mid}, ${right})`);
        merge(left, mid, right);
      }

      callStack.pop();
    }

    sort(0, n - 1);
    record(23, {}, [], [], Array.from({ length: n }, (_, idx) => idx), `Merge Sort finished! Comparisons: ${comparisons}, Assignments: ${assignments}`);

    return steps;
  },

  runBenchmark: (sizes: number[], distribution: InputDistribution): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      let comparisons = 0;
      let assignments = 0;

      function benchMerge(l: number, m: number, r: number) {
        const temp: number[] = new Array(r - l + 1);
        assignments += temp.length;
        let i = l, j = m + 1, k = 0;
        assignments += 3;
        while (i <= m && j <= r) {
          comparisons++;
          if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
            assignments++;
          } else {
            temp[k++] = arr[j++];
            assignments++;
          }
        }
        while (i <= m) {
          temp[k++] = arr[i++];
          assignments++;
        }
        while (j <= r) {
          temp[k++] = arr[j++];
          assignments++;
        }
        for (let p = 0; p < k; ++p) {
          arr[l + p] = temp[p];
          assignments++;
        }
      }

      function benchSort(l: number, r: number) {
        comparisons++;
        if (l < r) {
          const m = l + Math.floor((r - l) / 2);
          assignments++;
          benchSort(l, m);
          benchSort(m + 1, r);
          benchMerge(l, m, r);
        }
      }

      benchSort(0, n - 1);

      const log2n = Math.log2(n);
      const theoreticalWorst = Math.round(n * log2n + 2 * n * log2n);
      const theoreticalBest = Math.round(0.5 * n * log2n + 2 * n * log2n);
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
      'Merge Sort',
      cppCode,
      'mergeSort(arr, 0, arr.size() - 1);',
      false,
      arraySize,
      distribution
    );
  },
};
