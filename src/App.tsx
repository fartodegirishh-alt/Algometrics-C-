/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ArrayVisualizer } from './components/ArrayVisualizer';
import { CppCodeViewer } from './components/CppCodeViewer';
import { PlaybackControls } from './components/PlaybackControls';
import { ArrayControls } from './components/ArrayControls';
import { MetricsSummary } from './components/MetricsSummary';
import { LineComplexityTable } from './components/LineComplexityTable';
import { LineByLineCostTable } from './components/LineByLineCostTable';
import { CppExportModal } from './components/CppExportModal';
import { AlgorithmDefinition, InputDistribution, StepState } from './types/algorithm';
import { ALGORITHMS } from './algorithms/registry';
import { generateArray } from './utils/arrayUtils';
import { soundEngine } from './utils/soundEngine';
import {
  inferLineComplexityClass,
  getComplexityClassInfo,
  getPlainEnglishLineExplanation,
} from './utils/complexityUtils';

export default function App() {
  // Theme state: defaults to off-white/light mode as requested
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Navigation & Modal State
  const [activeTab, setActiveTab] = useState<'visualizer' | 'complexity'>('visualizer');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Algorithm & Dataset State
  const [algorithm, setAlgorithm] = useState<AlgorithmDefinition>(ALGORITHMS[0]);
  const [arraySize, setArraySize] = useState<number>(10);
  const [distribution, setDistribution] = useState<InputDistribution>('random');
  const [rawArray, setRawArray] = useState<number[]>(() => generateArray(10, 'random'));
  const [targetVal, setTargetVal] = useState<number>(45);

  // Simulation & Stepper State
  const [steps, setSteps] = useState<StepState[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(160);
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync theme with HTML documentElement class for Tailwind dark variant
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Re-generate steps whenever algorithm, array, or target changes
  const computeSteps = useCallback((algo: AlgorithmDefinition, arr: number[], target?: number) => {
    // If search algorithm requires sorted array, pass sorted array
    const effectiveArray = algo.requiresSorted ? [...arr].sort((a, b) => a - b) : [...arr];
    const generated = algo.generateSteps(effectiveArray, target);
    setSteps(generated);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  // Initial load & dataset updates
  useEffect(() => {
    computeSteps(algorithm, rawArray, targetVal);
  }, [algorithm, rawArray, targetVal, computeSteps]);

  // Audio trigger on step change
  useEffect(() => {
    if (!soundEnabled || steps.length === 0) return;
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    if (currentStepIndex === steps.length - 1) {
      soundEngine.playSuccessTone();
    } else if (currentStep.swappingIndices.length >= 2) {
      const idxA = currentStep.swappingIndices[0];
      const idxB = currentStep.swappingIndices[1];
      const valA = currentStep.array[idxA] || 50;
      const valB = currentStep.array[idxB] || 50;
      soundEngine.playSwapTone(valA, valB);
    } else if (currentStep.comparingIndices.length >= 1) {
      const idxA = currentStep.comparingIndices[0];
      const idxB = currentStep.comparingIndices[1] ?? idxA;
      const valA = currentStep.array[idxA] || 50;
      const valB = currentStep.array[idxB] || 50;
      soundEngine.playComparisonTone(valA, valB);
    }
  }, [currentStepIndex, soundEnabled, steps]);

  // Breakpoint toggling
  const toggleBreakpoint = (line: number) => {
    setBreakpoints((prev) => {
      const next = new Set(prev);
      if (next.has(line)) next.delete(line);
      else next.add(line);
      return next;
    });
  };

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }

        const nextIndex = prev + 1;
        const nextStep = steps[nextIndex];

        // Check if next step hits a breakpoint
        if (nextStep && breakpoints.has(nextStep.lineNumber)) {
          setIsPlaying(false);
        }

        return nextIndex;
      });
    }, speedMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps, speedMs, breakpoints]);

  // Stepper handlers
  const handlePlayPause = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleRunToEnd = () => {
    setIsPlaying(false);
    setCurrentStepIndex(steps.length - 1);
  };

  const handleSeek = (index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(index);
  };

  // Dataset generation handlers
  const handleRegenerate = () => {
    const newArr = generateArray(arraySize, distribution);
    setRawArray(newArr);
    if (algorithm.category === 'searching') {
      setTargetVal(newArr[Math.floor(newArr.length / 2)] || 45);
    }
  };

  const handleArraySizeChange = (newSize: number) => {
    setArraySize(newSize);
    const newArr = generateArray(newSize, distribution);
    setRawArray(newArr);
    if (algorithm.category === 'searching') {
      setTargetVal(newArr[Math.floor(newArr.length / 2)] || 45);
    }
  };

  const handleDistributionChange = (newDist: InputDistribution) => {
    setDistribution(newDist);
    const newArr = generateArray(arraySize, newDist);
    setRawArray(newArr);
    if (algorithm.category === 'searching') {
      setTargetVal(newArr[Math.floor(newArr.length / 2)] || 45);
    }
  };

  const handleSetCustomArray = (customArr: number[]) => {
    setArraySize(customArr.length);
    setRawArray(customArr);
    if (algorithm.category === 'searching') {
      setTargetVal(customArr[0] || 45);
    }
  };

  const currentStep = steps[currentStepIndex] || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-sky-500/20 selection:text-sky-900 dark:selection:text-white">
      {/* 1. Global Navigation Bar adhering to Top-Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportCpp={() => setShowExportModal(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        theme={theme}
        setTheme={setTheme}
      />

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 flex flex-col gap-5">
        {/* Sub-header Context / Algorithm Overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {algorithm.name}
              </h1>
              <span className="text-slate-400 dark:text-slate-600">·</span>
              <span className="text-xs font-mono text-sky-600 dark:text-sky-400 capitalize font-medium">
                {algorithm.category}
              </span>
              <span className="text-slate-400 dark:text-slate-600">·</span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                O({algorithm.complexity.worstTime.replace(/[^a-zA-Z0-9()^]/g, '')})
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {algorithm.shortDescription}
            </p>
          </div>

          {/* Quick tab switcher for mobile/desktop (Benchmark Curves removed) */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-900 rounded-lg text-xs font-medium shrink-0 border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'visualizer'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Visualizer
            </button>
            <button
              onClick={() => setActiveTab('complexity')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'complexity'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Line Complexity
            </button>
          </div>
        </div>

        {/* Dynamic Section Rendering based on Active Tab */}
        {activeTab === 'visualizer' && (
          <div className="flex flex-col gap-5">
            {/* Array Controls & Algorithm Selector */}
            <ArrayControls
              currentAlgorithm={algorithm}
              onSelectAlgorithm={(algo) => {
                setAlgorithm(algo);
                setSelectedLine(null);
              }}
              arraySize={arraySize}
              setArraySize={handleArraySizeChange}
              distribution={distribution}
              setDistribution={handleDistributionChange}
              onRegenerate={handleRegenerate}
              onSetCustomArray={handleSetCustomArray}
              targetVal={targetVal}
              setTargetVal={setTargetVal}
              currentArray={rawArray}
            />

            {/* Metrics Row: Observed Operations vs Theoretical Bounds */}
            <MetricsSummary
              algorithm={algorithm}
              currentStep={currentStep}
              arraySize={arraySize}
              distribution={distribution}
            />

            {/* Two-Zone Layout: Left Visualizer Stage, Right C++ Stepper & Line Costs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Zone (60%): Interactive Array Canvas & Transport Controls */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <ArrayVisualizer
                  currentStep={currentStep}
                  targetVal={targetVal}
                  isSearching={algorithm.category === 'searching'}
                />

                <PlaybackControls
                  currentStepIndex={currentStepIndex}
                  totalSteps={steps.length}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onStepForward={handleStepForward}
                  onStepBackward={handleStepBackward}
                  onReset={handleReset}
                  onRunToEnd={handleRunToEnd}
                  onSeek={handleSeek}
                  speedMs={speedMs}
                  setSpeedMs={setSpeedMs}
                />
              </div>

              {/* Right Zone (40%): C++ Code & Line Cost Inspector */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <CppCodeViewer
                  algorithm={algorithm}
                  lines={algorithm.lines}
                  currentStep={currentStep}
                  selectedLine={selectedLine}
                  setSelectedLine={setSelectedLine}
                  breakpoints={breakpoints}
                  toggleBreakpoint={toggleBreakpoint}
                />

                {/* Quick Line Analysis Callout */}
                {currentStep && (
                  <div className="p-3.5 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs flex flex-col gap-2 transition-colors">
                    {(() => {
                      const currentLineDef = algorithm.lines.find((l) => l.lineNumber === currentStep.lineNumber);
                      if (!currentLineDef) return null;
                      const cls = inferLineComplexityClass(currentLineDef, algorithm);
                      const clsInfo = getComplexityClassInfo(cls);
                      const plainInfo = getPlainEnglishLineExplanation(currentLineDef, algorithm, arraySize);

                      return (
                        <>
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-200">Executing Line {currentStep.lineNumber}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${clsInfo.badgeBg} ${clsInfo.badgeBorder} ${clsInfo.badgeText}`}>
                                {cls}
                              </span>
                            </div>
                            <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold text-[11px]">
                              Hit {currentStep.lineHits[currentStep.lineNumber] || 1}×
                            </span>
                          </div>

                          <div className="font-mono text-slate-900 dark:text-amber-200 bg-slate-100 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80 truncate text-[11.5px]">
                            {currentLineDef.code || '// Statement'}
                          </div>

                          <div className="flex flex-col gap-0.5 text-[11.5px]">
                            <span className="text-sky-700 dark:text-sky-300 font-semibold">{plainInfo.headline}</span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{plainInfo.detail}</p>
                          </div>

                          <button
                            onClick={() => setActiveTab('complexity')}
                            className="text-left text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 pt-1.5 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between cursor-pointer"
                          >
                            <span>Why is this line {cls}? See visual explanation →</span>
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Line-by-Line Complexity Table with Cost, Repetition, and Total Time */}
            <LineByLineCostTable
              algorithm={algorithm}
              currentStep={currentStep}
              selectedLine={selectedLine}
              setSelectedLine={setSelectedLine}
              arraySize={arraySize}
            />
          </div>
        )}

        {activeTab === 'complexity' && (
          <div className="flex flex-col gap-5">
            {/* Top Metrics Row */}
            <MetricsSummary
              algorithm={algorithm}
              currentStep={currentStep}
              arraySize={arraySize}
              distribution={distribution}
            />

            {/* Line by line table and mathematical breakdown */}
            <LineComplexityTable
              algorithm={algorithm}
              currentStep={currentStep}
              selectedLine={selectedLine}
              setSelectedLine={setSelectedLine}
              arraySize={arraySize}
            />
          </div>
        )}
      </main>

      {/* 3. Export Modal */}
      <CppExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        algorithm={algorithm}
        arraySize={arraySize}
        distribution={distribution}
      />
    </div>
  );
}
