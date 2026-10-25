import React, { useState } from 'react';
import { AlgorithmDefinition, InputDistribution } from '../types/algorithm';
import { Copy, Check, Download, Terminal, X } from 'lucide-react';

interface CppExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  algorithm: AlgorithmDefinition;
  arraySize: number;
  distribution: InputDistribution;
}

export const CppExportModal: React.FC<CppExportModalProps> = ({
  isOpen,
  onClose,
  algorithm,
  arraySize,
  distribution,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cppSource = algorithm.getStandaloneCpp(arraySize, distribution);

  const handleCopy = () => {
    navigator.clipboard.writeText(cppSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([cppSource], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${algorithm.id}_instrumented.cpp`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 sm:p-6">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Standalone C++ Source &amp; Instrumentation Harness
            </h3>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-xs font-mono text-sky-600 dark:text-sky-400">{algorithm.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white dark:bg-sky-400 dark:hover:bg-sky-300 dark:text-slate-950 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .CPP</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Local build instructions callout */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
          <span>Compile with: <code className="text-sky-700 dark:text-sky-300 font-bold">g++ -std=c++17 -O2 main.cpp -o main && ./main</code></span>
          <span className="text-slate-500">Zero external dependencies (C++17 STL)</span>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-5 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre select-text">
          {cppSource}
        </div>
      </div>
    </div>
  );
};
