import React from 'react';
import { AlgorithmDefinition, InputDistribution, StepState } from '../types/algorithm';
import { CheckCircle2, GitCompare, Lightbulb } from 'lucide-react';

interface MetricsSummaryProps {
  algorithm: AlgorithmDefinition;
  currentStep: StepState | null;
  arraySize: number;
  distribution: InputDistribution;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({
  algorithm,
  currentStep,
  arraySize,
  distribution,
}) => {
  const comparisons = currentStep?.comparisons ?? 0;
  const theoreticalComps = algorithm.complexity.comparisonsFormula.calculate(arraySize, distribution);

  // Plain-English takeaway rule based on algorithm complexity
  const getSimpleTakeaway = () => {
    if (algorithm.complexity.worstTime.includes('n²')) {
      return {
        tag: 'Quadratic O(N²)',
        summary: `Has nested loops. Doubling array from ${arraySize} to ${arraySize * 2} items will multiply comparisons by 4× (~${Math.round(theoreticalComps.avg * 4)} comparisons).`,
      };
    }
    if (algorithm.complexity.averageTime.includes('log') && algorithm.complexity.averageTime.includes('n')) {
      return {
        tag: 'Linearithmic O(N log N)',
        summary: `Recursion splits work in half. Doubling array from ${arraySize} to ${arraySize * 2} items only slightly more than doubles comparisons (~${Math.round(theoreticalComps.avg * 2.2)} comparisons).`,
      };
    }
    if (algorithm.complexity.worstTime.includes('log') || algorithm.complexity.averageTime.includes('log')) {
      return {
        tag: 'Logarithmic O(log N)',
        summary: `Cuts remaining choices in half at every step. Doubling array from ${arraySize} to ${arraySize * 2} items only adds 1 single comparison!`,
      };
    }
    if (algorithm.complexity.worstTime.includes('√n')) {
      return {
        tag: 'Sub-linear O(√N)',
        summary: `Leaps in blocks of size √${arraySize} ≈ ${Math.floor(Math.sqrt(arraySize))}. Greatly reduces search comparisons without full binary halving.`,
      };
    }
    return {
      tag: 'Linear O(N)',
      summary: `Checks items one by one. Comparisons scale 1-to-1 directly with input size.`,
    };
  };

  const takeaway = getSimpleTakeaway();

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. Comparisons Metric */}
        <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <GitCompare className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="text-slate-900 dark:text-slate-200 font-semibold">Comparisons (C)</span>
            </span>
            <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Elements Tested</span>
          </div>

          <div className="my-2.5">
            <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {comparisons.toLocaleString()}
            </div>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
              Expected for N={arraySize}: <span className="text-amber-600 dark:text-amber-300 font-bold">{theoreticalComps.avg}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-500 font-mono flex justify-between">
            <span>Best: {theoreticalComps.best}</span>
            <span>Worst: {theoreticalComps.worst}</span>
          </div>
        </div>

        {/* 2. Asymptotic Bounds Card */}
        <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              <span className="text-slate-900 dark:text-slate-200 font-semibold">Time Complexity</span>
            </span>
            <span className="font-mono text-[10px] text-violet-600 dark:text-violet-400 font-semibold">Big-O Bounds</span>
          </div>

          <div className="my-2 flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Worst Case O:</span>
              <span className="font-bold text-amber-600 dark:text-amber-300 text-sm">{algorithm.complexity.worstTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Average Case Θ:</span>
              <span className="font-bold text-sky-600 dark:text-sky-300 text-sm">{algorithm.complexity.averageTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Best Case Ω:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-300 text-sm">{algorithm.complexity.bestTime}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-500 font-mono flex justify-between">
            <span>Aux Memory: {algorithm.complexity.spaceComplexity}</span>
          </div>
        </div>
      </div>

      {/* 3. Plain English Rule-of-Thumb Callout */}
      <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center justify-between gap-3 text-xs transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 truncate">
            <strong className="text-slate-900 dark:text-white font-semibold">{takeaway.tag}: </strong>
            {takeaway.summary}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-500 whitespace-nowrap shrink-0">
          Scaling Takeaway
        </span>
      </div>
    </div>
  );
};
