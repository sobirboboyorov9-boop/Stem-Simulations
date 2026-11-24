import React, { useState } from 'react';
import {
  StudioSubject,
  StudioObject
} from '../../types/simulationStudio.js';
import {
  SUBJECT_TOOLBOXES,
  UNIVERSAL_COMPONENTS,
  ToolboxComponent
} from '../../data/subjectToolboxes.js';
import {
  Search,
  Plus,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Info,
  Circle,
  Square,
  HelpCircle
} from 'lucide-react';

interface ComponentToolboxProps {
  subject: StudioSubject;
  onAddComponent: (comp: ToolboxComponent) => void;
  onOpenCustomComponentModal: () => void;
}

export const ComponentToolbox: React.FC<ComponentToolboxProps> = ({
  subject,
  onAddComponent,
  onOpenCustomComponentModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    all: true
  });

  const categories = SUBJECT_TOOLBOXES[subject] || [];

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: prev[catId] === undefined ? false : !prev[catId]
    }));
  };

  const isCategoryExpanded = (catId: string) => {
    return expandedCategories[catId] !== false;
  };

  // Filter components
  const filterList = (items: ToolboxComponent[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  };

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none overflow-hidden h-full">
      {/* Header & Subject Info */}
      <div className="p-3.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Layers className="size-3.5 text-indigo-400" />
            <span>{subject} Toolbox</span>
          </div>
          <button
            onClick={onOpenCustomComponentModal}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600/80 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors"
            title="Create your own custom simulation object"
          >
            <Plus className="size-3" />
            <span>Custom</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2 size-3.5 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${subject} tools...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Component Library List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Subject Specific Categories */}
        {categories.map(cat => {
          const filtered = filterList(cat.components);
          if (filtered.length === 0 && searchQuery) return null;
          const isExpanded = isCategoryExpanded(cat.id);

          return (
            <div key={cat.id} className="space-y-1.5">
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white py-1 px-1 rounded transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  {isExpanded ? (
                    <ChevronDown className="size-3.5 text-slate-500 group-hover:text-indigo-400" />
                  ) : (
                    <ChevronRight className="size-3.5 text-slate-500 group-hover:text-indigo-400" />
                  )}
                  <span>{cat.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 px-1.5 py-0.2 rounded bg-slate-800">
                  {filtered.length}
                </span>
              </button>

              {isExpanded && (
                <div className="grid grid-cols-1 gap-1.5 pl-2">
                  {filtered.map(comp => (
                    <div
                      key={comp.id}
                      onClick={() => onAddComponent(comp)}
                      draggable
                      onDragStart={e => {
                        e.dataTransfer.setData('application/json', JSON.stringify(comp));
                      }}
                      className="group flex items-start gap-2.5 p-2 rounded-lg bg-slate-800/60 hover:bg-indigo-950/40 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition-all hover:shadow-sm"
                    >
                      <div
                        className="size-8 rounded flex items-center justify-center shrink-0 border border-slate-700 shadow-inner font-bold text-xs"
                        style={{
                          backgroundColor: comp.defaultColor,
                          borderColor: comp.borderColor || 'transparent',
                          color: '#ffffff'
                        }}
                      >
                        {comp.shape === 'circle' && <Circle className="size-4" />}
                        {comp.shape === 'rect' && <Square className="size-4" />}
                        {comp.shape !== 'circle' && comp.shape !== 'rect' && (
                          <span>{comp.name.charAt(0)}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-200 truncate">
                            {comp.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          {comp.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Universal Components Section */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <button
            onClick={() => toggleCategory('universal')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white py-1 px-1 rounded transition-colors group"
          >
            <div className="flex items-center gap-1.5">
              {isCategoryExpanded('universal') ? (
                <ChevronDown className="size-3.5 text-slate-500 group-hover:text-indigo-400" />
              ) : (
                <ChevronRight className="size-3.5 text-slate-500 group-hover:text-indigo-400" />
              )}
              <span>Universal Tools & Probes</span>
            </div>
            <span className="text-[10px] text-slate-500 px-1.5 py-0.2 rounded bg-slate-800">
              {UNIVERSAL_COMPONENTS.length}
            </span>
          </button>

          {isCategoryExpanded('universal') && (
            <div className="grid grid-cols-1 gap-1.5 pl-2">
              {filterList(UNIVERSAL_COMPONENTS).map(comp => (
                <div
                  key={comp.id}
                  onClick={() => onAddComponent(comp)}
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData('application/json', JSON.stringify(comp));
                  }}
                  className="group flex items-start gap-2.5 p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-600 cursor-pointer transition-all"
                >
                  <div
                    className="size-7 rounded flex items-center justify-center shrink-0 border border-slate-700 text-slate-300"
                    style={{ backgroundColor: comp.defaultColor }}
                  >
                    <span className="text-xs font-bold">{comp.name.charAt(0)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                      {comp.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {comp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Helper */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0 flex items-center gap-2 text-[11px] text-slate-400">
        <Info className="size-4 text-indigo-400 shrink-0" />
        <span>Click or drag any component onto the canvas to add it.</span>
      </div>
    </aside>
  );
};
