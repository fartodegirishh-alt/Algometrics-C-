import React from 'react';
import { AlgorithmDefinition, InputDistribution, StepState } from '../types/algorithm';
import { CheckCircle2, Cpu, GitCompare, ArrowUpDown, Lightbulb } from 'lucide-react';

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
  const assignments = currentStep?.assignments ?? 0;
  const totalOps = comparisons + assignments;

  const theoreticalComps = algorithm.complexity.comparisonsFormula.calculate(arraySize, distribution);
  const theoreticalAssigns = algorithm.complexity.assignmentsFormula.calculate(arraySize, distribution);

  // Expected total operations
  const expectedTotal = Math.max(1, theoreticalComps.avg + theoreticalAssigns.avg);
  const percentComplete = Math.min(100, Math.round((totalOps / expectedTotal) * 100));

  // Plain-English takeaway rule based on algorithm complexity
  const getSimpleTakeaway = () => {
    if (algorithm.complexity.worstTime.includes('n²')) {
      return {
        tag: 'Quadratic O(N²)',
        summary: `Has nested loops. Doubling array from ${arraySize} to ${arraySize * 2} items will multiply operations by 4× (~${Math.round(expectedTotal * 4)} ops).`,
      };
    }
    if (algorithm.complexity.averageTime.includes('log') && algorithm.complexity.averageTime.includes('n')) {
      return {
        tag: 'Linearithmic O(N log N)',
        summary: `Recursion splits work in half. Doubling array from ${arraySize} to ${arraySize * 2} items only slightly more than doubles work (~${Math.round(expectedTotal * 2.2)} ops).`,
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
        summary: `Leaps in blocks of size √${arraySize} ≈ ${Math.floor(Math.sqrt(arraySize))}. Greatly reduces search steps without full binary halving.`,
      };
    }
    return {
      tag: 'Linear O(N)',
      summary: `Checks items one by one. Work scales 1-to-1 directly with input size.`,
    };
  };

  const takeaway = getSimpleTakeaway();

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Comparisons Metric */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <GitCompare className="w-3.5 h-3.5 text-amber-400" />
              <span>Comparisons (C)</span>
            </span>
            <span className="font-mono text-[10px] text-amber-400">Elements Tested</span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
              {comparisons.toLocaleString()}
            </div>
            <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
              Expected: <span className="text-amber-300 font-semibold">{theoreticalComps.avg}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex justify-between">
            <span>Range: {theoreticalComps.best} to {theoreticalComps.worst}</span>
          </div>
        </div>

        {/* 2. Assignments / Swaps Metric */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Assignments (A)</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-400">Writes &amp; Swaps</span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
              {assignments.toLocaleString()}
            </div>
            <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
              Expected: <span className="text-emerald-300 font-semibold">{theoreticalAssigns.avg}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex justify-between">
            <span>Range: {theoreticalAssigns.best} to {theoreticalAssigns.worst}</span>
          </div>
        </div>

        {/* 3. Total Operation Workload & Progress */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Total Work (C + A)</span>
            </span>
            <span className="font-mono text-[10px] text-sky-400">Instruction Hits</span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-sky-300 tabular-nums tracking-tight">
              {totalOps.toLocaleString()}
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                style={{ width: `${percentComplete}%` }}
                className="bg-sky-400 h-full rounded-full transition-all duration-200"
              />
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex justify-between">
            <span>Target: ~{expectedTotal} total ops</span>
            <span className="text-slate-400">{percentComplete}%</span>
          </div>
        </div>

        {/* 4. Asymptotic Bounds Card */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Time Complexity</span>
            </span>
            <span className="font-mono text-[10px] text-violet-400">Big-O Bounds</span>
          </div>

          <div className="my-2 flex flex-col gap-1 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Worst Case:</span>
              <span className="font-bold text-amber-300">{algorithm.complexity.worstTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Average:</span>
              <span className="font-bold text-sky-300">{algorithm.complexity.averageTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Best Case:</span>
              <span className="font-bold text-emerald-300">{algorithm.complexity.bestTime}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex justify-between">
            <span>Aux Memory: {algorithm.complexity.spaceComplexity}</span>
          </div>
        </div>
      </div>

      {/* 5. Plain English Rule-of-Thumb Callout */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-300 truncate">
            <strong className="text-white font-semibold">{takeaway.tag}: </strong>
            {takeaway.summary}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap shrink-0">
          Scaling Takeaway
        </span>
      </div>
    </div>
  );
};
