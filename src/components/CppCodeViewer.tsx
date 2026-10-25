import React from 'react';
import { AlgorithmDefinition, LineCostDefinition, StepState } from '../types/algorithm';
import { Circle, ArrowRight } from 'lucide-react';
import { inferLineComplexityClass, getComplexityClassInfo } from '../utils/complexityUtils';

interface CppCodeViewerProps {
  algorithm: AlgorithmDefinition;
  lines: LineCostDefinition[];
  currentStep: StepState | null;
  selectedLine: number | null;
  setSelectedLine: (line: number) => void;
  breakpoints: Set<number>;
  toggleBreakpoint: (line: number) => void;
}

export const CppCodeViewer: React.FC<CppCodeViewerProps> = ({
  algorithm,
  lines,
  currentStep,
  selectedLine,
  setSelectedLine,
  breakpoints,
  toggleBreakpoint,
}) => {
  const currentLine = currentStep?.lineNumber ?? 1;
  const lineHits = currentStep?.lineHits ?? {};

  // Simple syntax tokenizer for C++ keywords and tokens
  const renderHighlightedCode = (code: string) => {
    // Regex for basic C++ highlighting
    const tokens = code.split(/(\b(?:void|int|bool|double|float|for|while|if|else|return|break|continue|const|std|vector|swap|min|max|sqrt)\b|[{}();,<>=+\-*/&!|]+|\b\d+\b)/g);

    return tokens.map((token, i) => {
      if (['void', 'int', 'bool', 'double', 'float', 'return', 'break', 'continue', 'const'].includes(token)) {
        return <span key={i} className="text-violet-400 font-medium">{token}</span>;
      }
      if (['for', 'while', 'if', 'else'].includes(token)) {
        return <span key={i} className="text-amber-400 font-semibold">{token}</span>;
      }
      if (['std', 'vector', 'swap', 'min', 'max', 'sqrt'].includes(token)) {
        return <span key={i} className="text-sky-400">{token}</span>;
      }
      if (['InstrumentedInt'].includes(token)) {
        return <span key={i} className="text-teal-300 font-semibold">{token}</span>;
      }
      if (/^\d+$/.test(token)) {
        return <span key={i} className="text-amber-300">{token}</span>;
      }
      if (/[{}();,<>=+\-*/&!|]/.test(token)) {
        return <span key={i} className="text-slate-400">{token}</span>;
      }
      if (token.startsWith('//')) {
        return <span key={i} className="text-slate-500 italic">{token}</span>;
      }
      return <span key={i} className="text-slate-200">{token}</span>;
    });
  };

  return (
    <div className="flex flex-col bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden font-mono text-xs">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-slate-200 font-sans text-xs">C++ Source &amp; Line Instrumentation</span>
          <span className="text-slate-400 dark:text-slate-500">·</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">Click line to inspect formula &amp; set breakpoints</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">Active line: <strong className="text-sky-600 dark:text-sky-400 font-bold">L{currentLine}</strong></span>
        </div>
      </div>

      {/* Code Body */}
      <div className="overflow-x-auto divide-y divide-slate-900/60 max-h-[380px] overflow-y-auto select-none">
        {lines.map((lineDef) => {
          const isCurrent = lineDef.lineNumber === currentLine;
          const isSelected = lineDef.lineNumber === selectedLine;
          const hasBreakpoint = breakpoints.has(lineDef.lineNumber);
          const hits = lineHits[lineDef.lineNumber] || 0;

          return (
            <div
              key={lineDef.lineNumber}
              onClick={() => setSelectedLine(lineDef.lineNumber)}
              className={`group flex items-center gap-3 px-3 py-1 cursor-pointer transition-colors ${
                isCurrent
                  ? 'bg-sky-950/60 border-l-2 border-sky-400'
                  : isSelected
                  ? 'bg-slate-900/80 border-l-2 border-slate-600'
                  : 'hover:bg-slate-900/40 border-l-2 border-transparent'
              }`}
            >
              {/* Breakpoint gutter */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBreakpoint(lineDef.lineNumber);
                }}
                className="w-4 h-4 flex items-center justify-center shrink-0 text-slate-600 hover:text-red-400"
                title={hasBreakpoint ? 'Remove Breakpoint' : 'Add Breakpoint'}
              >
                {hasBreakpoint ? (
                  <Circle className="w-3 h-3 fill-red-500 text-red-500 animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full border border-slate-700 opacity-0 group-hover:opacity-100" />
                )}
              </button>

              {/* Line number */}
              <span className={`w-6 text-right shrink-0 select-none tabular-nums ${
                isCurrent ? 'text-sky-300 font-bold' : 'text-slate-600'
              }`}>
                {lineDef.lineNumber}
              </span>

              {/* Current execution pointer arrow */}
              <div className="w-3 shrink-0 flex items-center justify-center">
                {isCurrent && (
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                )}
              </div>

              {/* C++ Code content */}
              <div className="flex-1 whitespace-pre font-mono text-[11.5px] leading-relaxed">
                {renderHighlightedCode(lineDef.code)}
              </div>

              {/* Intuitive Complexity Class Badge (e.g. O(1), O(N), O(N²)) */}
              {(() => {
                const cls = inferLineComplexityClass(lineDef, algorithm);
                const info = getComplexityClassInfo(cls);
                return (
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border tabular-nums ${info.badgeBg} ${info.badgeBorder} ${info.badgeText}`}
                    title={`${info.label}: ${info.description}`}
                  >
                    {cls}
                  </span>
                );
              })()}

              {/* Execution Hit Counter */}
              <div className="w-16 text-right shrink-0">
                {hits > 0 ? (
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] tabular-nums font-semibold ${
                    hits > 50
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {hits}×
                  </span>
                ) : (
                  <span className="text-slate-700 text-[10px]">0×</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
