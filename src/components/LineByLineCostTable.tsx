import React from 'react';
import { AlgorithmDefinition, StepState } from '../types/algorithm';
import { Layers, Clock, Repeat, Calculator, Info } from 'lucide-react';

interface LineByLineCostTableProps {
  algorithm: AlgorithmDefinition;
  currentStep: StepState | null;
  selectedLine: number | null;
  setSelectedLine: (line: number) => void;
  arraySize: number;
}

// Convert "c1", "c2" to subscript notation: "c₁", "c₂"
function formatCostSubscript(label: string): string {
  if (!label) return 'c₁';
  const subscripts: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  };
  return label.replace(/\d+/g, (match) =>
    match.split('').map((ch) => subscripts[ch] || ch).join('')
  );
}

// Format the theoretical total time product c_i * rep
function formatTotalTime(costLabel: string, rep: string): string {
  const cost = formatCostSubscript(costLabel);
  const cleanRep = rep.trim();
  if (cleanRep === '1') return cost;
  if (cleanRep.includes('+') || cleanRep.includes('-') || cleanRep.includes('/')) {
    return `${cost} × (${cleanRep})`;
  }
  return `${cost} × ${cleanRep}`;
}

export const LineByLineCostTable: React.FC<LineByLineCostTableProps> = ({
  algorithm,
  currentStep,
  selectedLine,
  setSelectedLine,
  arraySize,
}) => {
  const lineHits = currentStep?.lineHits ?? {};
  const currentLine = currentStep?.lineNumber ?? 1;
  const activeInspectLineNumber = selectedLine ?? currentLine;

  // Build the overall T(n) equation string
  const formulaTerms = algorithm.lines.map((l) => {
    const cost = formatCostSubscript(l.costLabel || `c${l.lineNumber}`);
    const rep = l.theoreticalFrequency.trim();
    return rep === '1' ? cost : `${cost}·(${rep})`;
  });

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide uppercase">
            Line-by-Line Complexity Table (Cost · Repetition = Total Time)
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 text-sky-500" />
          <span>Click any line to highlight and inspect</span>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-medium">
              <th className="py-3 px-3 w-12 text-center font-mono text-[11px]">Line</th>
              <th className="py-3 px-3 font-mono text-[11px] min-w-[240px]">C++ Code Statement</th>
              
              {/* 3 Explicit Columns requested by user */}
              <th className="py-3 px-3 w-40 font-semibold bg-sky-50/60 dark:bg-sky-950/20 text-sky-900 dark:text-sky-300 border-l border-r border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Cost (time req for line)</span>
                </div>
              </th>

              <th className="py-3 px-3 w-52 font-semibold bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border-r border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Repetition (no. of times executed)</span>
                </div>
              </th>

              <th className="py-3 px-3 w-56 font-semibold bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                <div className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Total Time required</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900 font-mono">
            {algorithm.lines.map((line) => {
              const hits = lineHits[line.lineNumber] || 0;
              const isSelected = line.lineNumber === activeInspectLineNumber;
              const isCurrentExecuting = line.lineNumber === currentLine;
              const costLabel = line.costLabel || `c${line.lineNumber}`;
              const costDisplay = formatCostSubscript(costLabel);
              const repDisplay = line.theoreticalFrequency;
              const totalTimeDisplay = formatTotalTime(costLabel, repDisplay);

              return (
                <tr
                  key={line.lineNumber}
                  onClick={() => setSelectedLine(line.lineNumber)}
                  className={`cursor-pointer transition-colors ${
                    isCurrentExecuting
                      ? 'bg-amber-500/10 text-slate-900 dark:text-white font-semibold'
                      : isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {/* Line Number */}
                  <td className="py-2.5 px-3 text-center text-slate-400 dark:text-slate-500 tabular-nums">
                    <span className="flex items-center justify-center gap-1">
                      {isCurrentExecuting && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      )}
                      {line.lineNumber}
                    </span>
                  </td>

                  {/* C++ Code Statement */}
                  <td className="py-2.5 px-3 font-mono text-[11.5px] truncate max-w-[280px]">
                    <span className={isCurrentExecuting ? 'text-amber-600 dark:text-amber-300 font-bold' : ''}>
                      {line.code}
                    </span>
                  </td>

                  {/* Column 1: Cost (time req for line) */}
                  <td className="py-2.5 px-3 font-mono text-[11.5px] bg-sky-50/30 dark:bg-sky-950/10 border-l border-r border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-700 dark:text-sky-300">
                        {costDisplay}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        (O(1) unit time)
                      </span>
                    </div>
                  </td>

                  {/* Column 2: Repetition (no. of times executed) */}
                  <td className="py-2.5 px-3 font-mono text-[11.5px] bg-amber-50/30 dark:bg-amber-950/10 border-r border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-amber-700 dark:text-amber-300 font-semibold">
                        {repDisplay}
                      </span>
                      <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium tabular-nums whitespace-nowrap">
                        {hits}× executed
                      </span>
                    </div>
                  </td>

                  {/* Column 3: Total Time required */}
                  <td className="py-2.5 px-3 font-mono text-[11.5px] bg-emerald-50/30 dark:bg-emerald-950/10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                        {totalTimeDisplay}
                      </span>
                      {hits > 0 && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
                          ≈ {hits}·{costDisplay}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Textbook Total Time Derivation Footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Total Execution Time Formula T(n) = ∑ (Cost × Repetition):
          </span>
          <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 px-2.5 py-0.5 rounded bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/20">
            Asymptotic Runtime = {algorithm.complexity.worstTime}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-nowrap leading-relaxed">
          <span className="text-sky-600 dark:text-sky-400 font-bold">T(n)</span> = {formulaTerms.slice(0, 5).join(' + ')}
          {formulaTerms.length > 5 ? ' + ...' : ''}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-slate-600 dark:text-slate-400">
          <span>• <strong>Cost</strong>: Fixed machine time to evaluate that line once</span>
          <span>• <strong>Repetition</strong>: How many times that line loop body executes</span>
          <span>• <strong>Total Time</strong>: Exact product contributing to Big-O</span>
        </div>
      </div>
    </div>
  );
};
