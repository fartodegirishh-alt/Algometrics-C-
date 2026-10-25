import React, { useState } from 'react';
import { AlgorithmDefinition, StepState } from '../types/algorithm';
import {
  inferLineComplexityClass,
  getComplexityClassInfo,
  getPlainEnglishLineExplanation,
} from '../utils/complexityUtils';
import { ComplexityShapeDiagram } from './ComplexityShapeDiagram';
import {
  Sparkles,
  BookOpen,
  Layers,
} from 'lucide-react';

interface LineComplexityTableProps {
  algorithm: AlgorithmDefinition;
  currentStep: StepState | null;
  selectedLine: number | null;
  setSelectedLine: (line: number) => void;
  arraySize: number;
}

export const LineComplexityTable: React.FC<LineComplexityTableProps> = ({
  algorithm,
  currentStep,
  selectedLine,
  setSelectedLine,
  arraySize,
}) => {
  const [viewMode, setViewMode] = useState<'simple' | 'math'>('simple');

  const lineHits = currentStep?.lineHits ?? {};
  const currentLine = currentStep?.lineNumber ?? 1;
  const activeInspectLineNumber = selectedLine ?? currentLine;
  const inspectedLineDef =
    algorithm.lines.find((l) => l.lineNumber === activeInspectLineNumber) ||
    algorithm.lines[0];

  const totalCalculatedOps = algorithm.lines.reduce((acc, line) => {
    const hits = lineHits[line.lineNumber] || 0;
    return acc + hits * line.baseCost;
  }, 0);

  const inspectedClass = inferLineComplexityClass(inspectedLineDef, algorithm);
  const inspectedClassInfo = getComplexityClassInfo(inspectedClass);
  const inspectedPlainInfo = getPlainEnglishLineExplanation(
    inspectedLineDef,
    algorithm,
    arraySize
  );

  return (
    <div className="flex flex-col gap-5">
      {/* View Mode Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            How Time Complexity Is Calculated
          </span>
          <span className="text-slate-400 dark:text-slate-500">·</span>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Current Input Size: <strong className="font-mono text-sky-600 dark:text-sky-300">N = {arraySize}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-medium">
          <button
            onClick={() => setViewMode('simple')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              viewMode === 'simple'
                ? 'bg-white dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold shadow-xs border border-slate-200 dark:border-sky-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple Visual Mode</span>
          </button>

          <button
            onClick={() => setViewMode('math')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              viewMode === 'math'
                ? 'bg-white dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold shadow-xs border border-slate-200 dark:border-sky-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Formal Math &amp; Proofs</span>
          </button>
        </div>
      </div>

      {/* 1. VISUAL SHAPE MODEL */}
      <ComplexityShapeDiagram
        algorithm={algorithm}
        currentStep={currentStep}
        arraySize={arraySize}
      />

      {/* 2. 3-STEP INTUITIVE BREAKDOWN (In Simple Mode) */}
      {viewMode === 'simple' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
              <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Count Line Hits</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Every statement executes a specific number of times based on its loop level:
            </p>
            <div className="mt-1 flex flex-col gap-1.5 text-[11px] font-mono">
              <div className="flex justify-between items-center px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Outside loops:</span>
                <span className="text-slate-700 dark:text-slate-300">Runs 1 time</span>
              </div>
              <div className="flex justify-between items-center px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-sky-600 dark:text-sky-400 font-semibold">1 Loop:</span>
                <span className="text-slate-700 dark:text-slate-300">Runs N times ({arraySize})</span>
              </div>
              <div className="flex justify-between items-center px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-amber-600 dark:text-amber-400 font-semibold">2 Nested Loops:</span>
                <span className="text-slate-700 dark:text-slate-300">Runs up to N² times (~{Math.round(arraySize * arraySize * 0.5)})</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Sum Total Operations</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              We add together the execution count of all lines into a total workload:
            </p>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs flex flex-col gap-1">
              <div className="flex justify-between text-slate-800 dark:text-slate-300">
                <span>Observed Total:</span>
                <strong className="text-slate-950 dark:text-white font-bold">{totalCalculatedOps} cycles</strong>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Comps ({currentStep?.comparisons ?? 0}) + Assigns ({currentStep?.assignments ?? 0})
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Notice that the nested loop lines make up over <strong>80%</strong> of the total work!
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-600 dark:text-violet-400">
              <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Drop Smaller Terms (Big-O)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In computer science, we only care how the code scales when N becomes large (e.g. N = 10,000):
            </p>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Dominant Term Rule:</div>
              <div className="font-bold text-sky-600 dark:text-sky-400 pt-0.5">
                {algorithm.complexity.worstTime}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Smaller terms and constants are dropped because the highest-order term completely dominates the runtime.
            </p>
          </div>
        </div>
      )}

      {/* 3. ACTIVE / SELECTED LINE INSPECTOR */}
      <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-sky-300 dark:border-sky-500/30 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Line {inspectedLineDef.lineNumber} Plain-English Breakdown
            </h4>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${inspectedClassInfo.badgeBg} ${inspectedClassInfo.badgeBorder} ${inspectedClassInfo.badgeText} border`}>
              {inspectedClassInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Line Hits:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sky-600 dark:text-sky-300 font-bold tabular-nums">
              {lineHits[inspectedLineDef.lineNumber] || 0}×
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3.5">
          {/* C++ Code statement */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">C++ Statement:</div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-sky-200 overflow-x-auto whitespace-pre">
              {inspectedLineDef.code || '// Loop boundary'}
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
                {inspectedPlainInfo.headline}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {inspectedPlainInfo.detail}
              </p>
            </div>
          </div>

          {/* Quick Stats on this line */}
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Loop Level:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                {inspectedPlainInfo.loopLevel}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Operation:</span>
              <span className="capitalize font-mono text-slate-800 dark:text-slate-200">
                {inspectedLineDef.operationType.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Cost per run:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{inspectedLineDef.baseCost} cycle(s)</span>
            </div>

            <div className="pt-2 mt-auto border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Work on Line:</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                {(lineHits[inspectedLineDef.lineNumber] || 0) * inspectedLineDef.baseCost} cycles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LINE-BY-LINE TABLE */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide uppercase">
              Line-by-Line Execution Frequency Table
            </h4>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click any row to inspect its calculation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3 w-12 text-center">Line</th>
                <th className="py-2.5 px-3">C++ Code Statement</th>
                <th className="py-2.5 px-3 w-36">Frequency Class</th>
                <th className="py-2.5 px-3 w-28 text-right">Hits (N={arraySize})</th>
                <th className="py-2.5 px-3 w-28">Type</th>
                <th className="py-2.5 px-3 w-24 text-right">Work</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900/80 font-mono">
              {algorithm.lines.map((line) => {
                const hits = lineHits[line.lineNumber] || 0;
                const subtotal = hits * line.baseCost;
                const isSelected = line.lineNumber === activeInspectLineNumber;
                const cls = inferLineComplexityClass(line, algorithm);
                const clsInfo = getComplexityClassInfo(cls);

                return (
                  <tr
                    key={line.lineNumber}
                    onClick={() => setSelectedLine(line.lineNumber)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-3 text-center text-slate-400 dark:text-slate-500 tabular-nums">
                      {line.lineNumber}
                    </td>
                    <td className="py-2 px-3 truncate max-w-[280px] font-mono text-[11.5px]">
                      {line.code}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${clsInfo.badgeBg} ${clsInfo.badgeBorder} ${clsInfo.badgeText} border`}>
                        {clsInfo.label.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-sky-600 dark:text-sky-300 font-semibold tabular-nums">
                      {hits}×
                    </td>
                    <td className="py-2 px-3 text-slate-500 dark:text-slate-400 capitalize text-[11px]">
                      {line.operationType.replace('_', ' ')}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                      {subtotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 font-mono text-xs">
                <td colSpan={3} className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-slate-200">
                  Total Operations Calculated:
                </td>
                <td colSpan={3} className="py-2.5 px-3 text-right font-bold text-sky-600 dark:text-sky-400 text-sm tabular-nums">
                  {totalCalculatedOps.toLocaleString()} instruction cycles
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5. FORMAL MATHEMATICAL DERIVATIONS */}
      {viewMode === 'math' && (
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Academic &amp; Mathematical Closed-Form Derivations
            </h4>
          </div>

          <div className="flex flex-col gap-4">
            {algorithm.derivations.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 font-mono">
                    {step.title}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-amber-200 overflow-x-auto">
                  {step.formula}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
