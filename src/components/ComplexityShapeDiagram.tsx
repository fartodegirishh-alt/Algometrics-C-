import React from 'react';
import { AlgorithmDefinition, StepState } from '../types/algorithm';
import { Sparkles } from 'lucide-react';

interface ComplexityShapeDiagramProps {
  algorithm: AlgorithmDefinition;
  currentStep: StepState | null;
  arraySize: number;
}

export const ComplexityShapeDiagram: React.FC<ComplexityShapeDiagramProps> = ({
  algorithm,
  currentStep,
  arraySize,
}) => {
  // Clamp visual size for diagram so it's clean and readable
  const displayN = Math.min(arraySize, 8);
  const currentIndices = currentStep?.indices || {};
  const currentI = currentIndices['i'] ?? -1;
  const currentJ = currentIndices['j'] ?? -1;

  // Determine which diagram type to render
  const isQuadratic = algorithm.complexity.worstTime.includes('n²');
  const isNLogN = algorithm.complexity.averageTime.includes('log') && algorithm.complexity.averageTime.includes('n');
  const isLogN = algorithm.complexity.worstTime.includes('log n') || algorithm.complexity.averageTime.includes('log');
  const isSqrt = algorithm.complexity.worstTime.includes('√n');
  const isLinear = algorithm.complexity.worstTime.includes('O(n)') && !isQuadratic && !isNLogN;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-5 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Visual Model: Why is this {algorithm.complexity.averageTime}?
          </h3>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-500/30 text-xs font-mono text-sky-700 dark:text-sky-300 font-semibold">
          {algorithm.complexity.averageTime} Growth Rate
        </div>
      </div>

      {/* Main Visual Diagram Canvas */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center min-h-[220px]">
        {/* 1. Quadratic (Staircase / Triangle) for Bubble / Selection / Insertion Sort */}
        {isQuadratic && (
          <div className="w-full max-w-md flex flex-col items-center gap-3">
            <div className="text-xs text-slate-700 dark:text-slate-300 text-center font-medium">
              The "Triangle of Work": Comparisons form a staircase (half an N × N square)
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              {Array.from({ length: displayN - 1 }, (_, rowIdx) => {
                const totalInRow = displayN - 1 - rowIdx;
                const isCurrentRow = currentI === rowIdx;

                return (
                  <div key={rowIdx} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 w-12 text-right">
                      Pass {rowIdx}:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalInRow }, (_, colIdx) => {
                        const isCurrentCell = isCurrentRow && currentJ === colIdx;
                        const isCompleted = currentI > rowIdx || (isCurrentRow && currentJ > colIdx);

                        return (
                          <div
                            key={colIdx}
                            className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono transition-all duration-150 ${
                              isCurrentCell
                                ? 'bg-amber-400 text-slate-950 font-bold scale-110 shadow-sm shadow-amber-400/50 ring-2 ring-amber-300'
                                : isCompleted
                                ? 'bg-sky-500 dark:bg-sky-600 text-white'
                                : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700/60'
                            }`}
                            title={`Pass ${rowIdx}, pair check ${colIdx}`}
                          >
                            ✓
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pl-1">
                      {totalInRow} {totalInRow === 1 ? 'pair' : 'pairs'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 text-center flex flex-wrap items-center justify-center gap-2">
              <span className="text-slate-700 dark:text-slate-300">Sum of checks:</span>
              <span className="text-amber-600 dark:text-amber-300 font-bold">
                {displayN - 1} + {displayN - 2} + ... + 1 = {((displayN * (displayN - 1)) / 2)}
              </span>
              <span className="text-slate-400 dark:text-slate-500">→</span>
              <span className="text-sky-600 dark:text-sky-400 font-bold">½ · N² ≈ O(N²)</span>
            </div>
          </div>
        )}

        {/* 2. N log N (Recursion Tree: Levels × Work per level) */}
        {isNLogN && (
          <div className="w-full max-w-lg flex flex-col items-center gap-3">
            <div className="text-xs text-slate-700 dark:text-slate-300 text-center font-medium">
              The "Tree Model": log₂(N) levels deep, and each level does exactly N work!
            </div>

            <div className="w-full flex flex-col gap-2 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs">
              {/* Level 0 */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Level 0 (Root)</span>
                <div className="flex-1 mx-4 h-6 rounded bg-sky-100 dark:bg-sky-500/20 border border-sky-300 dark:border-sky-400/40 flex items-center justify-center text-sky-700 dark:text-sky-300 font-semibold text-[11px]">
                  1 array of size {arraySize}
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] w-20 text-right">Work = {arraySize}</span>
              </div>

              {/* Level 1 */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Level 1 (Half)</span>
                <div className="flex-1 mx-4 flex items-center gap-2">
                  <div className="flex-1 h-6 rounded bg-sky-100 dark:bg-sky-500/20 border border-sky-300 dark:border-sky-400/40 flex items-center justify-center text-sky-700 dark:text-sky-300 text-[11px]">
                    Size {Math.floor(arraySize / 2)}
                  </div>
                  <div className="flex-1 h-6 rounded bg-sky-100 dark:bg-sky-500/20 border border-sky-300 dark:border-sky-400/40 flex items-center justify-center text-sky-700 dark:text-sky-300 text-[11px]">
                    Size {Math.ceil(arraySize / 2)}
                  </div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] w-20 text-right">Work = {arraySize}</span>
              </div>

              {/* Level 2 */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Level log₂(N)</span>
                <div className="flex-1 mx-4 flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex-1 h-6 rounded bg-sky-100 dark:bg-sky-500/20 border border-sky-300 dark:border-sky-400/40 flex items-center justify-center text-sky-700 dark:text-sky-300 text-[10px]">
                      1 item
                    </div>
                  ))}
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] w-20 text-right">Work = {arraySize}</span>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>(Tree Depth <strong className="text-amber-600 dark:text-amber-300">log₂ N</strong>) × (Work per Level <strong className="text-emerald-600 dark:text-emerald-300">N</strong>)</span>
              <span className="text-slate-400 dark:text-slate-500">=</span>
              <span className="text-sky-600 dark:text-sky-400 font-bold text-sm">O(N log N)</span>
            </div>
          </div>
        )}

        {/* 3. Logarithmic (Halving Ladder for Binary Search) */}
        {isLogN && !isNLogN && (
          <div className="w-full max-w-md flex flex-col items-center gap-3">
            <div className="text-xs text-slate-700 dark:text-slate-300 text-center font-medium">
              The "Halving Ladder": Slicing search space in half at every step
            </div>

            <div className="w-full flex flex-col gap-2 font-mono text-xs">
              {[arraySize, Math.floor(arraySize / 2), Math.floor(arraySize / 4), 1].filter((v, idx, a) => a.indexOf(v) === idx && v >= 1).map((sz, step) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="w-16 text-slate-500 dark:text-slate-400 text-right text-[11px]">Step {step + 1}:</span>
                  <div
                    style={{ width: `${Math.max(15, (sz / arraySize) * 100)}%` }}
                    className="h-7 rounded-md bg-gradient-to-r from-sky-500 to-sky-400 text-white font-bold flex items-center justify-center text-xs transition-all duration-300"
                  >
                    {sz} {sz === 1 ? 'item' : 'items left'}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs font-mono text-slate-700 dark:text-slate-300 text-center">
              Cut in half until 1 item remains: <span className="text-amber-600 dark:text-amber-300 font-bold">log₂({arraySize}) ≈ {Math.ceil(Math.log2(arraySize))} steps max</span>
              <span className="text-slate-400 dark:text-slate-500"> → </span>
              <span className="text-sky-600 dark:text-sky-400 font-bold">O(log N)</span>
            </div>
          </div>
        )}

        {/* 4. Linear Search (1 check per box) */}
        {isLinear && (
          <div className="w-full max-w-md flex flex-col items-center gap-3">
            <div className="text-xs text-slate-700 dark:text-slate-300 text-center font-medium">
              The "Conveyor Belt": Checks each item one by one from left to right
            </div>

            <div className="flex items-center gap-1.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {Array.from({ length: displayN }).map((_, idx) => {
                const isChecked = currentI >= idx;
                const isCurrent = currentI === idx;
                return (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                        : isChecked
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    {idx}
                  </div>
                );
              })}
            </div>

            <div className="text-xs font-mono text-slate-700 dark:text-slate-300">
              1 check per element: at most <span className="text-amber-600 dark:text-amber-300 font-bold">N = {arraySize}</span> checks
              <span className="text-slate-400 dark:text-slate-500"> → </span>
              <span className="text-sky-600 dark:text-sky-400 font-bold">O(N)</span>
            </div>
          </div>
        )}

        {/* 5. Jump Search (Blocks of √N) */}
        {isSqrt && (
          <div className="w-full max-w-md flex flex-col items-center gap-3">
            <div className="text-xs text-slate-700 dark:text-slate-300 text-center font-medium">
              The "Block Leaper": Jump by blocks of size √N, then linear scan inside
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300">
              <span>Block leaps (<strong className="text-amber-600 dark:text-amber-300">√N</strong>)</span>
              <span>+</span>
              <span>Linear scan in block (<strong className="text-emerald-600 dark:text-emerald-300">√N</strong>)</span>
              <span>=</span>
              <span className="text-sky-600 dark:text-sky-400 font-bold text-sm">2√N → O(√N)</span>
            </div>
          </div>
        )}
      </div>

      {/* Plain English "What This Means in Real Life" Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex flex-col gap-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium">1. How it works in code</span>
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
            {isQuadratic
              ? 'Has 2 nested loops: for each element in the outer loop, the inner loop scans through the rest of the array.'
              : isNLogN
              ? 'Divides the problem in half recursively (log N levels), then processes all N elements at each level.'
              : isLogN
              ? 'Eliminates half of the remaining choices with a single comparison test.'
              : 'Scans through the list item-by-item until finding a match or finishing the list.'}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex flex-col gap-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium">2. Scaling Rule (The "Doubling Test")</span>
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
            {isQuadratic
              ? 'Doubling array size (e.g., from 10 to 20) multiplies operations by 4×! (Quadruples work).'
              : isNLogN
              ? 'Doubling array size only slightly more than doubles the work (2.2×). Highly scalable!'
              : isLogN
              ? 'Doubling array size adds just ONE extra comparison. 1 million items takes only ~20 checks!'
              : 'Doubling array size doubles the operations 1-to-1.'}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex flex-col gap-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium">3. Big-O Simplification Rule</span>
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
            We drop constants (like ½ or +3) and keep only the fastest growing term because as N grows large (like N = 10,000), it dwarfs everything else!
          </p>
        </div>
      </div>
    </div>
  );
};
