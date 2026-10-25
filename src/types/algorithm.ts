export type AlgorithmCategory = 'sorting' | 'searching';

export type InputDistribution = 'random' | 'sorted' | 'reversed' | 'nearly_sorted' | 'few_unique';

export type OperationType = 
  | 'comparison' 
  | 'assignment' 
  | 'loop_control' 
  | 'recursion' 
  | 'declaration' 
  | 'return' 
  | 'none';

export type ComplexityClass = 'O(1)' | 'O(N)' | 'O(N²)' | 'O(log N)' | 'O(N log N)' | 'O(√N)' | 'O(log log N)';

export type VisualComplexityShape = 'staircase' | 'tree' | 'halving' | 'linear' | 'blocks';

export interface LineCostDefinition {
  lineNumber: number;
  code: string;
  costLabel: string; // e.g. "c1", "c2"
  theoreticalFrequency: string; // e.g. "n", "n - 1", "n(n-1)/2"
  frequencyExplanation: string; // human description
  operationType: OperationType;
  baseCost: number; // typically 1
  complexityClass?: ComplexityClass;
  simpleExplanation?: string;
}

export interface StepState {
  stepIndex: number;
  lineNumber: number;
  array: number[];
  indices: { [label: string]: number }; // e.g. { i: 2, j: 3, pivot: 5, low: 0, high: 9 }
  comparingIndices: number[]; // indices currently compared
  swappingIndices: number[]; // indices currently swapped / assigned
  sortedIndices: number[]; // indices guaranteed sorted / finalized
  secondaryArray?: number[]; // for merge sort auxiliary array
  callStack?: string[]; // for recursive algorithms
  comparisons: number;
  assignments: number;
  lineHits: { [line: number]: number };
  message: string;
  highlightExpression?: string; // e.g. "arr[j] > arr[j+1]"
  expressionResult?: string; // e.g. "45 > 12 -> true"
}

export interface TheoreticalBounds {
  bestTime: string; // e.g. "Ω(n)"
  averageTime: string; // e.g. "Θ(n²)"
  worstTime: string; // e.g. "O(n²)"
  spaceComplexity: string; // e.g. "O(1)"
  comparisonsFormula: {
    best: string;
    worst: string;
    average: string;
    calculate: (n: number, dist?: InputDistribution) => { best: number; worst: number; avg: number };
  };
  assignmentsFormula: {
    best: string;
    worst: string;
    average: string;
    calculate: (n: number, dist?: InputDistribution) => { best: number; worst: number; avg: number };
  };
}

export interface ComplexityDerivationStep {
  title: string;
  formula: string;
  explanation: string;
}

export interface BenchmarkPoint {
  n: number;
  observedComparisons: number;
  observedAssignments: number;
  totalOperations: number;
  theoreticalWorst: number;
  theoreticalAvg: number;
  theoreticalBest: number;
}

export interface IntuitiveComplexityGuide {
  shape: VisualComplexityShape;
  plainEnglishSummary: string;
  scalingRule: string; // e.g. "If you double array size from 10 to 20, operations increase 4x"
  threeStepBreakdown: {
    step1Loops: string;
    step2Counts: string;
    step3BigO: string;
  };
}

export interface AlgorithmDefinition {
  id: string;
  name: string;
  category: AlgorithmCategory;
  shortDescription: string;
  fullDescription: string;
  requiresSorted: boolean;
  cppCode: string;
  lines: LineCostDefinition[];
  complexity: TheoreticalBounds;
  derivations: ComplexityDerivationStep[];
  intuitiveGuide?: IntuitiveComplexityGuide;
  generateSteps: (initialArray: number[], target?: number) => StepState[];
  runBenchmark: (sizes: number[], distribution: InputDistribution, target?: number) => BenchmarkPoint[];
  getStandaloneCpp: (arraySize: number, distribution: InputDistribution) => string;
}
