import React from 'react';
import { StepState } from '../types/algorithm';

interface ArrayVisualizerProps {
  currentStep: StepState | null;
  targetVal?: number;
  isSearching: boolean;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  currentStep,
  targetVal,
  isSearching,
}) => {
  if (!currentStep) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
        No execution trace loaded.
      </div>
    );
  }

  const { array, indices, comparingIndices, swappingIndices, sortedIndices } = currentStep;
  const maxVal = Math.max(...array, 100);
  const minVal = Math.min(...array, 0);
  const range = Math.max(1, maxVal - minVal);

  // Invert indices mapping to get pointer labels per element
  const indexPointers: { [index: number]: string[] } = {};
  Object.entries(indices).forEach(([label, idx]) => {
    if (idx >= 0 && idx < array.length) {
      if (!indexPointers[idx]) indexPointers[idx] = [];
      indexPointers[idx].push(label);
    }
  });

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs transition-colors">
      {/* Visual Header / Active Step Message */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wider shrink-0">
            Step {currentStep.stepIndex + 1}
          </span>
          <span className="text-slate-400 dark:text-slate-500 shrink-0">·</span>
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
            {currentStep.message}
          </span>
        </div>

        {currentStep.highlightExpression && (
          <div className="shrink-0 flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-amber-600 dark:text-amber-300">
            <span>{currentStep.highlightExpression}</span>
            {currentStep.expressionResult && (
              <>
                <span className="text-slate-400 dark:text-slate-500">→</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {currentStep.expressionResult.split('->')[1]?.trim() || currentStep.expressionResult}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Bar Chart Visualization */}
      <div className="relative h-60 w-full flex items-end justify-center gap-1.5 pt-8 pb-7 px-2 overflow-x-auto">
        {array.map((val, idx) => {
          const isComparing = comparingIndices.includes(idx);
          const isSwapping = swappingIndices.includes(idx);
          const isSorted = sortedIndices.includes(idx);
          const pointers = indexPointers[idx] || [];
          const isTarget = isSearching && val === targetVal;

          // Height percentage (min 15% for visibility, max 95%)
          const heightPct = Math.max(15, Math.min(95, ((val - minVal) / range) * 85 + 10));

          let barBg = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/60';
          let glowStyle = '';

          if (isSwapping) {
            barBg = 'bg-emerald-500 text-white dark:text-slate-950 font-bold border-emerald-600 dark:border-emerald-400';
            glowStyle = 'shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/50';
          } else if (isComparing) {
            barBg = 'bg-amber-400 text-slate-950 font-bold border-amber-500 dark:border-amber-300';
            glowStyle = 'shadow-md shadow-amber-500/30 ring-2 ring-amber-400/50';
          } else if (isSorted) {
            barBg = 'bg-sky-500 dark:bg-sky-600/90 text-white font-medium border-sky-600 dark:border-sky-400/80';
          } else if (isTarget) {
            barBg = 'bg-violet-600 text-white font-medium border-violet-700 dark:border-violet-400/80 ring-1 ring-violet-400';
          }

          return (
            <div
              key={idx}
              className="relative flex-1 max-w-[56px] min-w-[20px] h-full flex flex-col justify-end items-center group"
            >
              {/* Pointer Markers above bar */}
              {pointers.length > 0 && (
                <div className="absolute top-0 flex flex-col items-center pointer-events-none z-10 animate-bounce duration-500">
                  <div className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-xs">
                    {pointers.join(', ')}
                  </div>
                  <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-sky-600 dark:border-t-sky-400" />
                </div>
              )}

              {/* Element Bar */}
              <div
                style={{ height: `${heightPct}%` }}
                className={`w-full rounded-t-md border transition-all duration-150 flex flex-col items-center justify-between py-1 text-xs select-none ${barBg} ${glowStyle}`}
              >
                <span className="font-mono text-[11px] leading-none tabular-nums font-semibold">
                  {val}
                </span>
              </div>

              {/* Bottom Index Label */}
              <div className="absolute -bottom-6 text-[10px] font-mono text-slate-500 dark:text-slate-500 tabular-nums font-medium">
                {idx}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Call Stack Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400 border border-amber-500 inline-block" />
            <span>Comparing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600 inline-block" />
            <span>Assign / Swap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sky-500 dark:bg-sky-600 border border-sky-600 inline-block" />
            <span>Sorted / Matched</span>
          </div>
          {isSearching && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-violet-600 border border-violet-500 inline-block" />
              <span>Target: {targetVal}</span>
            </div>
          )}
        </div>

        {currentStep.callStack && currentStep.callStack.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 truncate max-w-md">
            <span className="text-slate-400 dark:text-slate-500 uppercase">Stack:</span>
            <span className="text-sky-600 dark:text-sky-300 truncate">
              {currentStep.callStack[currentStep.callStack.length - 1]}
            </span>
            {currentStep.callStack.length > 1 && (
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                (+{currentStep.callStack.length - 1} frames)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
