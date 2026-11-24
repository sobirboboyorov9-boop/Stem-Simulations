import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Undo2,
  Redo2,
  Sparkles,
  Save,
  Send,
  Eye,
  Download,
  Upload,
  ChevronDown,
  CheckCircle2,
  Clock,
  Edit3
} from 'lucide-react';
import { StudioSubject, SimulationStatus } from '../../types/simulationStudio.js';

interface StudioHeaderProps {
  title: string;
  subject: StudioSubject;
  status: SimulationStatus;
  isRunning: boolean;
  canUndo: boolean;
  canRedo: boolean;
  speed: number;
  isPreviewMode: boolean;
  onTitleChange: (title: string) => void;
  onOpenSubjectModal: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSetSpeed: (speed: number) => void;
  onTogglePreview: () => void;
  onOpenAiModal: () => void;
  onSaveDraft: () => void;
  onSubmitForReview: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  title,
  subject,
  status,
  isRunning,
  canUndo,
  canRedo,
  speed,
  isPreviewMode,
  onTitleChange,
  onOpenSubjectModal,
  onPlay,
  onPause,
  onReset,
  onUndo,
  onRedo,
  onSetSpeed,
  onTogglePreview,
  onOpenAiModal,
  onSaveDraft,
  onSubmitForReview,
  onExportJson,
  onImportJson
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
            <CheckCircle2 className="size-3" />
            Published
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-950/80 border border-teal-500/50 text-teal-300">
            <CheckCircle2 className="size-3" />
            Approved
          </span>
        );
      case 'submitted':
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 border border-amber-500/50 text-amber-400">
            <Clock className="size-3" />
            In Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
            Draft
          </span>
        );
    }
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 text-white select-none z-30 shrink-0">
      {/* Left: Subject Switcher & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSubjectModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60 transition-colors text-xs font-bold shrink-0"
          title="Switch Subject Studio"
        >
          <span>{subject}</span>
          <ChevronDown className="size-3.5 opacity-70" />
        </button>

        <div className="h-5 w-px bg-slate-800 shrink-0" />

        {isEditingTitle ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={tempTitle}
              onChange={e => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={e => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTempTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="bg-slate-950 border border-indigo-500 rounded px-2 py-0.5 text-sm font-semibold text-white focus:outline-none w-64"
            />
          </div>
        ) : (
          <div
            onClick={() => {
              setTempTitle(title);
              setIsEditingTitle(true);
            }}
            className="flex items-center gap-1.5 group cursor-pointer truncate"
            title="Click to rename simulation"
          >
            <h1 className="text-sm font-bold text-slate-100 truncate max-w-xs sm:max-w-md group-hover:text-indigo-300 transition-colors">
              {title}
            </h1>
            <Edit3 className="size-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        )}

        {getStatusBadge()}
      </div>

      {/* Center: Controls (Play, Reset, Speed, Undo/Redo) */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-1 shadow-inner">
        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="size-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="size-4" />
        </button>

        <div className="h-4 w-px bg-slate-800" />

        {/* Run / Pause */}
        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
          >
            <Pause className="size-3.5 fill-current" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/50 transition-colors"
          >
            <Play className="size-3.5 fill-current" />
            <span>Run</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Reset Simulation (Time = 0)"
        >
          <RotateCcw className="size-4" />
        </button>

        <div className="h-4 w-px bg-slate-800" />

        {/* Speed Selector */}
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 px-1">
          {[0.5, 1.0, 2.0].map(s => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`px-1.5 py-0.5 rounded ${
                speed === s
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* AI Assistant */}
        <button
          onClick={onOpenAiModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-950 transition-all"
        >
          <Sparkles className="size-3.5" />
          <span>AI Builder</span>
        </button>

        {/* Test / Student Preview Mode Toggle */}
        <button
          onClick={onTogglePreview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isPreviewMode
              ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Toggle Student Interactive View"
        >
          <Eye className="size-3.5" />
          <span>{isPreviewMode ? 'Exit Test' : 'Test Preview'}</span>
        </button>

        {/* Save Draft */}
        <button
          onClick={onSaveDraft}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition-colors"
          title="Save Simulation Draft"
        >
          <Save className="size-3.5" />
          <span className="hidden md:inline">Save</span>
        </button>

        {/* Submit for Review */}
        <button
          onClick={onSubmitForReview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm"
          title="Submit to Admin/Reviewer for catalog publication"
        >
          <Send className="size-3.5" />
          <span className="hidden sm:inline">Submit</span>
        </button>

        {/* JSON Export/Import */}
        <div className="hidden xl:flex items-center gap-1 pl-1 border-l border-slate-800">
          <button
            onClick={onExportJson}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Export JSON Configuration"
          >
            <Download className="size-4" />
          </button>
          <label
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Import JSON Configuration"
          >
            <Upload className="size-4" />
            <input
              type="file"
              accept=".json"
              onChange={onImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </header>
  );
};
