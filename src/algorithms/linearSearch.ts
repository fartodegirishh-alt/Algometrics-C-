import {
  AlgorithmDefinition,
  BenchmarkPoint,
  InputDistribution,
  LineCostDefinition,
  StepState,
} from '../types/algorithm';
import { generateArray } from '../utils/arrayUtils';

const cppCode = `int linearSearch(int a[], int n, int key)
{
    for (int i = 0; i < n; i++)
    {
        if (a[i] == key)
            return i;
    }

    return -1;
}`;

const lines: LineCostDefinition[] = [
  {
    lineNumber: 1,
    code: 'int linearSearch(int a[], int n, int key)',
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
    code: '    for (int i = 0; i < n; i++)',
    costLabel: 'c3',
    theoreticalFrequency: 'k + 1 (1 to n + 1)',
    frequencyExplanation: 'Loop counter increment and termination test. Runs until key is found at position k or exits after n iterations.',
    operationType: 'loop_control',
    baseCost: 1,
    complexityClass: 'O(N)',
    simpleExplanation: 'Iterates through indices 0 to n - 1.',
  },
  {
    lineNumber: 4,
    code: '    {',
    costLabel: 'c4',
    theoreticalFrequency: 'k (1 to n)',
    frequencyExplanation: 'Loop body opening.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N)',
  },
  {
    lineNumber: 5,
    code: '        if (a[i] == key)',
    costLabel: 'c5',
    theoreticalFrequency: 'k (1 to n)',
    frequencyExplanation: 'Core target comparison: checks if current element equals search key. Runs 1 time if key is at index 0, or n times if key is at end or absent.',
    operationType: 'comparison',
    baseCost: 1,
    complexityClass: 'O(N)',
    simpleExplanation: 'Compares array item a[i] against key.',
  },
  {
    lineNumber: 6,
    code: '            return i;',
    costLabel: 'c6',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Early exit return when search succeeds.',
    operationType: 'return',
    baseCost: 1,
    complexityClass: 'O(1)',
    simpleExplanation: 'Returns index where key was found.',
  },
  {
    lineNumber: 7,
    code: '    }',
    costLabel: 'c7',
    theoreticalFrequency: 'k',
    frequencyExplanation: 'Loop end.',
    operationType: 'none',
    baseCost: 0,
    complexityClass: 'O(N)',
  },
  {
    lineNumber: 8,
    code: '    return -1;',
    costLabel: 'c8',
    theoreticalFrequency: '0 or 1',
    frequencyExplanation: 'Returns -1 indicating key is not present in the array.',
    operationType: 'return',
    baseCost: 1,
    complexityClass: 'O(1)',
    simpleExplanation: 'Returned if key was not found after full scan.',
  },
  {
    lineNumber: 9,
    code: '}',
    costLabel: 'c9',
    theoreticalFrequency: '1',
    frequencyExplanation: 'Function return.',
    operationType: 'return',
    baseCost: 1,
    complexityClass: 'O(1)',
  },
];

export const linearSearchDefinition: AlgorithmDefinition = {
  id: 'linear-search',
  name: 'Linear Search',
  category: 'searching',
  shortDescription: 'Sequentially checks each element of the array until a match is found or the end is reached.',
  fullDescription: 'Linear Search scans through elements one by one from left to right. It works on unsorted or sorted arrays and takes O(1) time if the key is at index 0, and O(n) time on average or in the worst case.',
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
      best: '1',
      worst: 'n + 1',
      average: '(n + 1) / 2',
      calculate: (n: number) => {
        return { best: 1, worst: n + 1, avg: Math.round((n + 1) / 2) };
      },
    },
  },
  derivations: [
    {
      title: '1. Comparison Formula',
      formula: 'C_{best} = 1, \\quad C_{worst} = n, \\quad C_{avg} = \\frac{1}{n} \\sum_{i=1}^n i = \\frac{n+1}{2}',
      explanation: 'If the target is at the first index, only 1 comparison is performed. If at the end or missing, exactly n comparisons occur.',
    },
    {
      title: '2. Asymptotic Bound',
      formula: 'T(n) = c \\cdot n + d = \\mathcal{O}(n)',
      explanation: 'Since the number of comparisons grows in direct proportion to array size n, the search is strictly linear.',
    },
  ],
  intuitiveGuide: {
    shape: 'linear',
    plainEnglishSummary: 'Looks through the items one after another like flipping through pages of a book from start to finish.',
    scalingRule: 'If you double the array size from 10 to 20, search time doubles in the worst case.',
    threeStepBreakdown: {
      step1Loops: 'Single loop inspects element 0, 1, 2, ... up to n - 1.',
      step2Counts: 'Best case: 1 step (found immediately). Worst case: n steps (at the very end or absent).',
      step3BigO: 'Linear O(n) worst/average time.',
    },
  },
  generateSteps: (initialArray: number[], targetVal: number = 45): StepState[] => {
    const steps: StepState[] = [];
    const a = [...initialArray];
    const n = a.length;
    let comparisons = 0;
    const assignments = 0;
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

    record(1, { key: targetVal }, [], [], [], `Starting linearSearch(a, n = ${n}, key = ${targetVal})`);

    let foundIdx = -1;

    for (let i = 0; i < n; i++) {
      record(3, { i, key: targetVal }, [], [], [], `Loop test: i = ${i} < ${n}`);

      comparisons++;
      const cmpExpr = `a[${i}] == key`;
      const isMatch = a[i] === targetVal;
      const cmpRes = `${a[i]} == ${targetVal} -> ${isMatch}`;

      record(5, { i, key: targetVal }, [i], [], [], `Checking if a[${i}] (${a[i]}) == key (${targetVal})`, cmpExpr, cmpRes);

      if (isMatch) {
        foundIdx = i;
        record(6, { i, key: targetVal }, [i], [], [i], `Target found at index ${i}! Returning ${i}`, cmpExpr, cmpRes);
        break;
      }
    }

    if (foundIdx === -1) {
      record(8, { key: targetVal }, [], [], [], `Target ${targetVal} not found in array. Returning -1`);
    }

    return steps;
  },
  runBenchmark: (sizes: number[], distribution: InputDistribution, targetVal: number = 45): BenchmarkPoint[] => {
    return sizes.map((n) => {
      const arr = generateArray(n, distribution);
      let comparisons = 0;
      for (let i = 0; i < n; i++) {
        comparisons++;
        if (arr[i] === targetVal) {
          break;
        }
      }
      return {
        n,
        observedComparisons: comparisons,
        observedAssignments: comparisons,
        totalOperations: comparisons,
        theoreticalWorst: n,
        theoreticalAvg: Math.round((n + 1) / 2),
        theoreticalBest: 1,
      };
    });
  },
  getStandaloneCpp: (arraySize: number, distribution: InputDistribution): string => {
    const sampleArr = generateArray(arraySize, distribution);
    const key = sampleArr[Math.floor(sampleArr.length / 2)] || 45;
    return `#include <iostream>
using namespace std;

int linearSearch(int a[], int n, int key)
{
    for (int i = 0; i < n; i++)
    {
        if (a[i] == key)
            return i;
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

    cout << "Array elements: ";
    for (int i = 0; i < n; i++)
        cout << a[i] << " ";
    cout << "\\n";

    cout << "Element to search: " << key << "\\n";

    result = linearSearch(a, n, key);

    if (result == -1)
        cout << "Element not found\\n";
    else
        cout << "Element found at position " << result + 1 << " (index " << result << ")\\n";

    return 0;
}`;
  },
};
