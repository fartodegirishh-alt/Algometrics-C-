import React from 'react';
import { Code2, Play, Calculator, Download, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface NavbarProps {
  activeTab: 'visualizer' | 'complexity' | 'cpp';
  setActiveTab: (tab: 'visualizer' | 'complexity' | 'cpp') => void;
  onExportCpp: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onExportCpp,
  soundEnabled,
  setSoundEnabled,
  theme,
  setTheme,
}) => {
  return (
    <header className="flex items-center justify-between gap-6 px-6 py-3.5 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shrink-0 transition-colors">
      {/* Zone 1: Brand Wordmark (Single text element in display face, no pills, no subtitles) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
          <Code2 className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
          AlgoMetrics C++
        </span>
      </div>

      {/* Zone 2: 3 single-line text navigation links (Benchmark curves tab removed) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
        <button
          onClick={() => setActiveTab('visualizer')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
            activeTab === 'visualizer'
              ? 'text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 font-semibold'
              : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Interactive Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('complexity')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
            activeTab === 'complexity'
              ? 'text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 font-semibold'
              : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Line Complexity Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('cpp')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
            activeTab === 'cpp'
              ? 'text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 font-semibold'
              : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>C++ Source &amp; Harness</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action & Theme/Sound Utilities */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Light / Dark Mode Toggle Switch */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-1.5 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-sky-600" />
          )}
          <span className="hidden sm:inline text-xs font-medium">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            soundEngine.enabled = next;
          }}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
          title={soundEnabled ? 'Mute Audio Tones' : 'Unmute Audio Tones'}
          aria-label="Toggle sound"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-600" />
          )}
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onExportCpp}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-400 dark:hover:bg-sky-300 dark:text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export .CPP</span>
        </button>
      </div>
    </header>
  );
};
