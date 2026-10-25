import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Gauge,
} from 'lucide-react';

interface PlaybackControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onRunToEnd: () => void;
  onSeek: (stepIndex: number) => void;
  speedMs: number;
  setSpeedMs: (speed: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentStepIndex,
  totalSteps,
  isPlaying,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
  onRunToEnd,
  onSeek,
  speedMs,
  setSpeedMs,
}) => {
  const isAtStart = currentStepIndex <= 0;
  const isAtEnd = currentStepIndex >= totalSteps - 1;

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      {/* Top row: Transport buttons + Speed control */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Reset */}
          <button
            onClick={onReset}
            disabled={isAtStart}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
            title="Reset to Step 0"
            aria-label="Reset simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step Backward */}
          <button
            onClick={onStepBackward}
            disabled={isAtStart || isPlaying}
            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
            title="Step Backward (Prev C++ Line)"
            aria-label="Previous step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Main Play/Pause Button */}
          <button
            onClick={onPlayPause}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-sky-600 text-white hover:bg-sky-500 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isAtEnd ? 'Replay' : 'Run'}</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={onStepForward}
            disabled={isAtEnd || isPlaying}
            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
            title="Step Forward (Next C++ Line)"
            aria-label="Next step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Run to End */}
          <button
            onClick={onRunToEnd}
            disabled={isAtEnd}
            className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
            title="Fast Forward to End"
            aria-label="Run to end"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Adjustment */}
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Gauge className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Speed:</span>
          </div>

          <input
            type="range"
            min="20"
            max="600"
            step="20"
            value={620 - speedMs}
            onChange={(e) => setSpeedMs(620 - Number(e.target.value))}
            className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />

          <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] w-14 text-right tabular-nums">
            {speedMs}ms
          </span>
        </div>
      </div>

      {/* Step scrubber timeline */}
      <div className="flex items-center gap-3 pt-1">
        <input
          type="range"
          min="0"
          max={Math.max(0, totalSteps - 1)}
          value={currentStepIndex}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />

        <div className="text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap tabular-nums">
          <span className="text-sky-600 dark:text-sky-300 font-semibold">{currentStepIndex + 1}</span>
          <span className="text-slate-400 dark:text-slate-600"> / </span>
          <span>{totalSteps} steps</span>
        </div>
      </div>
    </div>
  );
};
