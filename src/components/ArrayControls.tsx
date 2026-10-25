import React, { useState } from 'react';
import {
  AlgorithmDefinition,
  InputDistribution,
} from '../types/algorithm';
import {
  ALGORITHMS,
  SORTING_ALGORITHMS,
  SEARCHING_ALGORITHMS,
} from '../algorithms/registry';
import { Shuffle, Edit3, Target, PlusCircle, Check } from 'lucide-react';
import { parseCustomArray } from '../utils/arrayUtils';

interface ArrayControlsProps {
  currentAlgorithm: AlgorithmDefinition;
  onSelectAlgorithm: (algo: AlgorithmDefinition) => void;
  arraySize: number;
  setArraySize: (size: number) => void;
  distribution: InputDistribution;
  setDistribution: (dist: InputDistribution) => void;
  onRegenerate: () => void;
  onSetCustomArray: (arr: number[]) => void;
  targetVal: number;
  setTargetVal: (val: number) => void;
  currentArray: number[];
}

export const ArrayControls: React.FC<ArrayControlsProps> = ({
  currentAlgorithm,
  onSelectAlgorithm,
  arraySize,
  setArraySize,
  distribution,
  setDistribution,
  onRegenerate,
  onSetCustomArray,
  targetVal,
  setTargetVal,
  currentArray,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInputText, setCustomInputText] = useState('');
  const [customError, setCustomError] = useState('');

  const isSearch = currentAlgorithm.category === 'searching';

  const handleApplyCustom = () => {
    const parsed = parseCustomArray(customInputText);
    if (!parsed || parsed.length < 2) {
      setCustomError('Please enter at least 2 numbers separated by commas or spaces.');
      return;
    }
    setCustomError('');
    onSetCustomArray(parsed);
    setShowCustomModal(false);
  };

  const setPreset = (presetArray: number[]) => {
    setCustomInputText(presetArray.join(', '));
    setCustomError('');
  };

  return (
    <div className="flex flex-col gap-3.5 p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      {/* Top row: Algorithm selection, Array Size, and Prominent Custom Array button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Algorithm Select */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Algorithm:
          </label>
          <select
            value={currentAlgorithm.id}
            onChange={(e) => {
              const selected = ALGORITHMS.find((a) => a.id === e.target.value);
              if (selected) onSelectAlgorithm(selected);
            }}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <optgroup label="Sorting Algorithms">
              {SORTING_ALGORITHMS.map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name} ({algo.complexity.averageTime})
                </option>
              ))}
            </optgroup>
            <optgroup label="Searching Algorithms">
              {SEARCHING_ALGORITHMS.map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name} ({algo.complexity.averageTime})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Center / Right: Prominent Custom Array Button + Size + Target */}
        <div className="flex flex-wrap items-center gap-3">
          {/* BIGGER BUTTON FOR CUSTOM INPUT ARRAY */}
          <button
            onClick={() => {
              setCustomInputText(currentArray.join(', '));
              setCustomError('');
              setShowCustomModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
            title="Provide your own custom array numbers"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Enter Custom Array</span>
          </button>

          {/* Array Size Slider */}
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <label className="font-semibold whitespace-nowrap">N:</label>
            <input
              type="range"
              min="4"
              max="40"
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              className="w-20 h-1.5 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <span className="font-mono text-sky-600 dark:text-sky-400 font-bold w-5 text-right tabular-nums">
              {arraySize}
            </span>
          </div>

          {/* Search Target if searching */}
          {isSearch && (
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <Target className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
              <label className="font-semibold whitespace-nowrap">Target:</label>
              <input
                type="number"
                value={targetVal}
                onChange={(e) => setTargetVal(Number(e.target.value))}
                className="w-16 px-2 py-0.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono text-slate-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              {currentArray.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const randomPick = currentArray[Math.floor(Math.random() * currentArray.length)];
                    setTargetVal(randomPick);
                  }}
                  className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                  title="Pick a random value from the array"
                >
                  Pick from list
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Second row: Distribution quick presets & Regenerate */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-xs mr-1 font-medium">Quick Presets:</span>

          {(['random', 'sorted', 'reversed', 'nearly_sorted', 'few_unique'] as InputDistribution[]).map((d) => (
            <button
              key={d}
              onClick={() => setDistribution(d)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap capitalize ${
                distribution === d
                  ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold border border-sky-300 dark:border-sky-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {d.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={onRegenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Shuffle / Re-randomize</span>
        </button>
      </div>

      {/* Custom Array Dialog */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Enter Custom Array Input
                </h3>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm p-1 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Type or paste your numbers separated by spaces or commas. You can enter any integers (e.g. positive, negative, or duplicates).
            </p>

            <textarea
              rows={3}
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
              placeholder="e.g. 45, 12, 89, 23, 7, 56, 34, 91"
            />

            {/* Quick preset chips inside modal */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-medium mr-1">Load example:</span>
              <button
                type="button"
                onClick={() => setPreset([95, 80, 65, 50, 35, 20, 10, 5])}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-400"
              >
                Worst Case (Reversed)
              </button>
              <button
                type="button"
                onClick={() => setPreset([10, 20, 30, 40, 50, 60, 70, 80])}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-400"
              >
                Best Case (Sorted)
              </button>
              <button
                type="button"
                onClick={() => setPreset([30, 10, 30, 10, 50, 10, 50, 30])}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-400"
              >
                Many Duplicates
              </button>
            </div>

            {customError && (
              <div className="text-xs text-red-500 dark:text-red-400 font-medium">
                {customError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 dark:bg-sky-400 dark:hover:bg-sky-300 dark:text-slate-950 rounded-lg shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Custom Array</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
