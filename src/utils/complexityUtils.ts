import { ComplexityClass, LineCostDefinition, AlgorithmDefinition } from '../types/algorithm';

export function getComplexityClassInfo(cls: ComplexityClass): {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
} {
  switch (cls) {
    case 'O(1)':
      return {
        label: 'O(1) Constant',
        badgeBg: 'bg-emerald-500/10',
        badgeBorder: 'border-emerald-500/30',
        badgeText: 'text-emerald-400',
        description: 'Runs fixed number of times regardless of array size (Setup / Returns).',
      };
    case 'O(N)':
      return {
        label: 'O(N) Linear',
        badgeBg: 'bg-sky-500/10',
        badgeBorder: 'border-sky-500/30',
        badgeText: 'text-sky-400',
        description: 'Runs once per array item (Single outer loop).',
      };
    case 'O(N²)':
      return {
        label: 'O(N²) Quadratic',
        badgeBg: 'bg-amber-500/10',
        badgeBorder: 'border-amber-500/30',
        badgeText: 'text-amber-400',
        description: 'Runs inside nested loop: N outer passes × N inner elements.',
      };
    case 'O(log N)':
      return {
        label: 'O(log N) Logarithmic',
        badgeBg: 'bg-violet-500/10',
        badgeBorder: 'border-violet-500/30',
        badgeText: 'text-violet-400',
        description: 'Runs once per interval halving (Search space cuts in half).',
      };
    case 'O(N log N)':
      return {
        label: 'O(N log N) Linearithmic',
        badgeBg: 'bg-indigo-500/10',
        badgeBorder: 'border-indigo-500/30',
        badgeText: 'text-indigo-400',
        description: 'Recursion tree: log N levels × N items per level.',
      };
    case 'O(√N)':
      return {
        label: 'O(√N) Sublinear',
        badgeBg: 'bg-teal-500/10',
        badgeBorder: 'border-teal-500/30',
        badgeText: 'text-teal-400',
        description: 'Block jumping leaps by √N elements.',
      };
    case 'O(log log N)':
      return {
        label: 'O(log log N) Double-Log',
        badgeBg: 'bg-cyan-500/10',
        badgeBorder: 'border-cyan-500/30',
        badgeText: 'text-cyan-400',
        description: 'Interpolation search key estimations.',
      };
    default:
      return {
        label: 'O(1)',
        badgeBg: 'bg-slate-800',
        badgeBorder: 'border-slate-700',
        badgeText: 'text-slate-300',
        description: 'Standard statement.',
      };
  }
}

export function inferLineComplexityClass(
  line: LineCostDefinition,
  algo: AlgorithmDefinition
): ComplexityClass {
  const code = line.code.trim();
  const freq = line.theoreticalFrequency.toLowerCase();

  if (freq === '1' || line.operationType === 'declaration' || line.operationType === 'return') {
    return 'O(1)';
  }

  if (algo.complexity.worstTime.includes('n²')) {
    if (freq.includes('n(n') || freq.includes('σ') || freq.includes('sum') || code.includes('arr[j]') || code.includes('swap(arr[j') || code.includes('arr[j + 1] =')) {
      return 'O(N²)';
    }
    if (freq.includes('n') && !freq.includes('log')) {
      return 'O(N)';
    }
  }

  if (algo.complexity.averageTime.includes('log') && algo.complexity.averageTime.includes('n')) {
    if (freq.includes('log') || code.includes('temp[') || code.includes('merge(') || code.includes('arr[i]') || code.includes('partition(')) {
      return 'O(N log N)';
    }
    if (freq.includes('n calls') || freq.includes('2n')) {
      return 'O(N)';
    }
  }

  if (algo.complexity.worstTime.includes('log n') || algo.complexity.worstTime.includes('log')) {
    if (code.includes('while') || code.includes('mid') || code.includes('arr[mid]')) {
      return 'O(log N)';
    }
  }

  if (algo.complexity.worstTime.includes('√n')) {
    if (code.includes('step') || code.includes('prev') || code.includes('while')) {
      return 'O(√N)';
    }
  }

  if (freq.includes('n') && !freq.includes('log') && !freq.includes('√')) {
    return 'O(N)';
  }

  return 'O(1)';
}

export function getPlainEnglishLineExplanation(
  line: LineCostDefinition,
  algo: AlgorithmDefinition,
  n: number
): {
  headline: string;
  detail: string;
  loopLevel: string;
} {
  const cls = inferLineComplexityClass(line, algo);

  if (cls === 'O(1)') {
    return {
      headline: 'Runs 1 time (Setup or Exit)',
      detail: `This line is outside all loops. Whether the array has 10 items or 10,000 items, this statement executes just 1 time.`,
      loopLevel: 'Level 0 (Outside loops)',
    };
  }

  if (cls === 'O(N)') {
    return {
      headline: `Runs ${n} times (Once per item)`,
      detail: `This statement is in the outer loop. For an array of size N = ${n}, it executes once per element (roughly ${n} times).`,
      loopLevel: 'Level 1 (Single loop)',
    };
  }

  if (cls === 'O(N²)') {
    const approxHits = Math.round((n * (n - 1)) / 2);
    return {
      headline: `Runs ~${approxHits} times (Nested Loop: N × N)`,
      detail: `This line sits inside BOTH the outer loop and the inner loop. Every time the outer loop runs, the inner loop scans elements again, forming a triangle of ${approxHits} operations.`,
      loopLevel: 'Level 2 (Nested loops: N × N)',
    };
  }

  if (cls === 'O(log N)') {
    const maxSteps = Math.ceil(Math.log2(n));
    return {
      headline: `Runs at most ${maxSteps} times (Halving search space)`,
      detail: `Instead of checking items one by one, each step cuts the remaining search window in half. For N = ${n}, it takes at most ${maxSteps} steps.`,
      loopLevel: 'Logarithmic loop (Divides by 2)',
    };
  }

  if (cls === 'O(N log N)') {
    const approx = Math.round(n * Math.log2(n));
    return {
      headline: `Runs ~${approx} times (Tree Work: N × log₂ N)`,
      detail: `The recursion tree has log₂(N) levels of depth. At each level, all N items are processed/merged.`,
      loopLevel: 'Divide-and-conquer recursion',
    };
  }

  if (cls === 'O(√N)') {
    const sqrtN = Math.floor(Math.sqrt(n));
    return {
      headline: `Runs ~${sqrtN} times (Block Leaps of size √N)`,
      detail: `Leaps forward across blocks of size √${n} ≈ ${sqrtN}. Takes roughly √N jumps plus √N linear checks.`,
      loopLevel: 'Square-root block stepping',
    };
  }

  return {
    headline: 'Standard statement',
    detail: line.frequencyExplanation,
    loopLevel: 'Function body',
  };
}
