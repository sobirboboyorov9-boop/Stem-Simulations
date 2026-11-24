import React, { useState } from 'react';
import {
  StudioObject,
  TeacherSimulationDefinition,
  CustomProperty
} from '../../types/simulationStudio.js';
import {
  Sliders,
  Move,
  Palette,
  Atom,
  Layers,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Compass,
  Gauge,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface PropertyInspectorProps {
  selectedObject: StudioObject | null;
  definition: TeacherSimulationDefinition;
  onUpdateObject: (updated: StudioObject) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (obj: StudioObject) => void;
  onUpdateWorldSettings: (newDef: TeacherSimulationDefinition) => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  selectedObject,
  definition,
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject,
  onUpdateWorldSettings
}) => {
  const [activeTab, setActiveTab] = useState<'transform' | 'physics' | 'subject' | 'custom' | 'states'>('transform');
  const [newPropKey, setNewPropKey] = useState('');
  const [newPropLabel, setNewPropLabel] = useState('');
  const [newPropType, setNewPropType] = useState<'number' | 'string' | 'boolean'>('number');
  const [newPropValue, setNewPropValue] = useState<any>(0);
  const [newPropUnit, setNewPropUnit] = useState('');
  const [showAddPropModal, setShowAddPropModal] = useState(false);

  // If no object is selected, render World & Environment settings
  if (!selectedObject) {
    const physics = definition.physics;
    const canvas = definition.canvas;

    return (
      <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 select-none overflow-hidden h-full">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Compass className="size-3.5 text-indigo-400" />
            <span>World & Environment</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            Global
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300">
          {/* World Gravity */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 block">World Gravity (m/s²)</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500">Gravity X</span>
                <input
                  type="number"
                  value={physics.gravity.x}
                  onChange={e =>
                    onUpdateWorldSettings({
                      ...definition,
                      physics: {
                        ...physics,
                        gravity: { ...physics.gravity, x: parseFloat(e.target.value) || 0 }
                      }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Gravity Y</span>
                <input
                  type="number"
                  value={physics.gravity.y}
                  onChange={e =>
                    onUpdateWorldSettings({
                      ...definition,
                      physics: {
                        ...physics,
                        gravity: { ...physics.gravity, y: parseFloat(e.target.value) || 0 }
                      }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Air Drag & Resistance */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-200">Air Resistance Drag</span>
              <span className="text-slate-400">{physics.airResistance}</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.005"
              value={physics.airResistance}
              onChange={e =>
                onUpdateWorldSettings({
                  ...definition,
                  physics: {
                    ...physics,
                    airResistance: parseFloat(e.target.value)
                  }
                })
              }
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Boundary Behavior */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 block">Boundary Wall Behavior</label>
            <select
              value={physics.boundaryMode}
              onChange={e =>
                onUpdateWorldSettings({
                  ...definition,
                  physics: {
                    ...physics,
                    boundaryMode: e.target.value as any
                  }
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
            >
              <option value="bounce">Bounce off Boundaries</option>
              <option value="wrap">Wrap Around Screen</option>
              <option value="none">Open Infinite Space</option>
              <option value="stop">Stop at Edges</option>
            </select>
          </div>

          {/* Canvas Dimensions & Background */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <label className="font-bold text-slate-200 block">Canvas Stage Settings</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500">Width (px)</span>
                <input
                  type="number"
                  value={canvas.width}
                  onChange={e =>
                    onUpdateWorldSettings({
                      ...definition,
                      canvas: { ...canvas, width: parseInt(e.target.value) || 900 }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Height (px)</span>
                <input
                  type="number"
                  value={canvas.height}
                  onChange={e =>
                    onUpdateWorldSettings({
                      ...definition,
                      canvas: { ...canvas, height: parseInt(e.target.value) || 520 }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[10px] text-slate-500 block mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={canvas.background}
                  onChange={e =>
                    onUpdateWorldSettings({
                      ...definition,
                      canvas: { ...canvas, background: e.target.value }
                    })
                  }
                  className="size-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="text-xs text-slate-400">{canvas.background}</span>
              </div>
            </div>

            {/* Grid Toggle */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Show Grid Lines</span>
              <input
                type="checkbox"
                checked={canvas.grid}
                onChange={e =>
                  onUpdateWorldSettings({
                    ...definition,
                    canvas: { ...canvas, grid: e.target.checked }
                  })
                }
                className="rounded accent-indigo-500 size-4"
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Handle adding custom property to object
  const handleAddCustomProperty = () => {
    if (!newPropKey.trim()) return;
    const current = selectedObject.customProperties || [];
    const updated: CustomProperty = {
      key: newPropKey.trim(),
      label: newPropLabel.trim() || newPropKey.trim(),
      type: newPropType,
      value: newPropType === 'number' ? parseFloat(newPropValue) || 0 : newPropValue,
      unit: newPropUnit.trim() || undefined
    };
    onUpdateObject({
      ...selectedObject,
      customProperties: [...current, updated]
    });
    setNewPropKey('');
    setNewPropLabel('');
    setNewPropUnit('');
    setShowAddPropModal(false);
  };

  const handleRemoveCustomProp = (key: string) => {
    onUpdateObject({
      ...selectedObject,
      customProperties: (selectedObject.customProperties || []).filter(p => p.key !== key)
    });
  };

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 select-none overflow-hidden h-full">
      {/* Header with Object Title & Actions */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="size-6 rounded flex items-center justify-center shrink-0 border"
            style={{ backgroundColor: selectedObject.color, borderColor: selectedObject.borderColor }}
          />
          <input
            type="text"
            value={selectedObject.name}
            onChange={e => onUpdateObject({ ...selectedObject, name: e.target.value })}
            className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 font-bold text-xs text-white focus:outline-none truncate w-36"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicateObject(selectedObject)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Duplicate Object"
          >
            <Copy className="size-3.5" />
          </button>
          <button
            onClick={() => onDeleteObject(selectedObject.id)}
            className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
            title="Delete Object"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 shrink-0">
        <button
          onClick={() => setActiveTab('transform')}
          className={`py-2 text-center transition-colors border-b-2 ${
            activeTab === 'transform'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
              : 'border-transparent hover:text-white'
          }`}
        >
          Transform
        </button>
        <button
          onClick={() => setActiveTab('physics')}
          className={`py-2 text-center transition-colors border-b-2 ${
            activeTab === 'physics'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
              : 'border-transparent hover:text-white'
          }`}
        >
          Physics
        </button>
        <button
          onClick={() => setActiveTab('subject')}
          className={`py-2 text-center transition-colors border-b-2 ${
            activeTab === 'subject'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
              : 'border-transparent hover:text-white'
          }`}
        >
          Domain
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`py-2 text-center transition-colors border-b-2 ${
            activeTab === 'custom'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
              : 'border-transparent hover:text-white'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
        {/* TAB 1: TRANSFORM & STYLING */}
        {activeTab === 'transform' && (
          <div className="space-y-4">
            {/* Position */}
            <div>
              <span className="font-bold text-slate-200 block mb-1">Coordinates (X, Y)</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded px-2 py-1">
                  <span className="text-[10px] text-slate-500 font-bold">X</span>
                  <input
                    type="number"
                    value={Math.round(selectedObject.x)}
                    onChange={e => onUpdateObject({ ...selectedObject, x: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded px-2 py-1">
                  <span className="text-[10px] text-slate-500 font-bold">Y</span>
                  <input
                    type="number"
                    value={Math.round(selectedObject.y)}
                    onChange={e => onUpdateObject({ ...selectedObject, y: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <span className="font-bold text-slate-200 block mb-1">Dimensions (W × H)</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded px-2 py-1">
                  <span className="text-[10px] text-slate-500 font-bold">W</span>
                  <input
                    type="number"
                    value={selectedObject.width}
                    onChange={e =>
                      onUpdateObject({ ...selectedObject, width: Math.max(10, parseFloat(e.target.value) || 10) })
                    }
                    className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded px-2 py-1">
                  <span className="text-[10px] text-slate-500 font-bold">H</span>
                  <input
                    type="number"
                    value={selectedObject.height}
                    onChange={e =>
                      onUpdateObject({ ...selectedObject, height: Math.max(10, parseFloat(e.target.value) || 10) })
                    }
                    className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-200">Rotation Angle</span>
                <span className="text-slate-400 font-mono">{Math.round(selectedObject.rotation)}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={Math.round(selectedObject.rotation)}
                onChange={e => onUpdateObject({ ...selectedObject, rotation: parseFloat(e.target.value) || 0 })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Color & Appearance */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="font-bold text-slate-200 block">Appearance & Styling</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Fill Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedObject.color.startsWith('#') ? selectedObject.color : '#3b82f6'}
                      onChange={e => onUpdateObject({ ...selectedObject, color: e.target.value })}
                      className="size-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Border Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedObject.borderColor?.startsWith('#') ? selectedObject.borderColor : '#1d4ed8'}
                      onChange={e => onUpdateObject({ ...selectedObject, borderColor: e.target.value })}
                      className="size-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Overlays (Vectors & Trails) */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="font-bold text-slate-200 block">Visual Overlays</span>
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-slate-300">
                  <span>Show Velocity Vector</span>
                  <input
                    type="checkbox"
                    checked={selectedObject.showVectors?.velocity || false}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        showVectors: { ...selectedObject.showVectors, velocity: e.target.checked }
                      })
                    }
                    className="rounded accent-indigo-500 size-4"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-300">
                  <span>Show Acceleration Vector</span>
                  <input
                    type="checkbox"
                    checked={selectedObject.showVectors?.acceleration || false}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        showVectors: { ...selectedObject.showVectors, acceleration: e.target.checked }
                      })
                    }
                    className="rounded accent-indigo-500 size-4"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-300">
                  <span>Enable Motion Trail</span>
                  <input
                    type="checkbox"
                    checked={selectedObject.trail?.enabled || false}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        trail: {
                          enabled: e.target.checked,
                          color: selectedObject.trail?.color || '#38bdf8',
                          maxPoints: selectedObject.trail?.maxPoints || 100
                        }
                      })
                    }
                    className="rounded accent-indigo-500 size-4"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PHYSICS & KINEMATICS */}
        {activeTab === 'physics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="font-semibold text-slate-200">Static (Immovable)</span>
              <input
                type="checkbox"
                checked={selectedObject.isStatic}
                onChange={e => onUpdateObject({ ...selectedObject, isStatic: e.target.checked })}
                className="rounded accent-indigo-500 size-4"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">Mass (kg)</span>
                <span className="text-slate-400 font-mono">{selectedObject.mass} kg</span>
              </div>
              <input
                type="number"
                value={selectedObject.mass}
                disabled={selectedObject.isStatic}
                onChange={e =>
                  onUpdateObject({ ...selectedObject, mass: Math.max(0.01, parseFloat(e.target.value) || 1) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">Elasticity / Bounce (0 - 1)</span>
                <span className="text-slate-400 font-mono">{selectedObject.elasticity}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedObject.elasticity}
                onChange={e => onUpdateObject({ ...selectedObject, elasticity: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">Friction</span>
                <span className="text-slate-400 font-mono">{selectedObject.friction}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedObject.friction}
                onChange={e => onUpdateObject({ ...selectedObject, friction: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="font-bold text-slate-200 block">Initial Velocity (Vx, Vy)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500">Vx (m/s)</span>
                  <input
                    type="number"
                    value={selectedObject.velocity.x}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        velocity: { ...selectedObject.velocity, x: parseFloat(e.target.value) || 0 }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Vy (m/s)</span>
                  <input
                    type="number"
                    value={selectedObject.velocity.y}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        velocity: { ...selectedObject.velocity, y: parseFloat(e.target.value) || 0 }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBJECT-SPECIFIC DOMAIN DATA */}
        {activeTab === 'subject' && (
          <div className="space-y-3">
            <span className="font-bold text-slate-200 block">{selectedObject.subject} Properties</span>

            {/* Render any subjectData keys */}
            {selectedObject.subjectData ? (
              Object.entries(selectedObject.subjectData).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <input
                    type={typeof val === 'number' ? 'number' : 'text'}
                    value={typeof val === 'object' ? JSON.stringify(val) : val}
                    onChange={e => {
                      const updatedSubjectData = {
                        ...selectedObject.subjectData,
                        [key]: typeof val === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                      };
                      onUpdateObject({
                        ...selectedObject,
                        subjectData: updatedSubjectData
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                  />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No subject-specific properties configured.</p>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOM PROPERTIES */}
        {activeTab === 'custom' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Custom Variables</span>
              <button
                onClick={() => setShowAddPropModal(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold"
              >
                <Plus className="size-3" />
                <span>Add Field</span>
              </button>
            </div>

            {selectedObject.customProperties && selectedObject.customProperties.length > 0 ? (
              selectedObject.customProperties.map(prop => (
                <div key={prop.key} className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">{prop.label || prop.key}</span>
                    <button
                      onClick={() => handleRemoveCustomProp(prop.key)}
                      className="text-slate-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type={prop.type === 'number' ? 'number' : prop.type === 'color' ? 'color' : 'text'}
                      value={prop.value}
                      onChange={e => {
                        const val = prop.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                        const updatedProps = (selectedObject.customProperties || []).map(p =>
                          p.key === prop.key ? { ...p, value: val } : p
                        );
                        onUpdateObject({ ...selectedObject, customProperties: updatedProps });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                    />
                    {prop.unit && <span className="text-[10px] text-slate-500 shrink-0">{prop.unit}</span>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No custom properties added yet.</p>
            )}

            {/* Modal to add new property */}
            {showAddPropModal && (
              <div className="p-3 rounded-lg bg-slate-950 border border-indigo-500/50 space-y-2 mt-2">
                <span className="text-xs font-bold text-indigo-300 block">New Property Field</span>
                <input
                  type="text"
                  placeholder="Property Key (e.g. temperature)"
                  value={newPropKey}
                  onChange={e => setNewPropKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Display Label"
                  value={newPropLabel}
                  onChange={e => setNewPropLabel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newPropType}
                    onChange={e => setNewPropType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                  >
                    <option value="number">Number</option>
                    <option value="string">Text</option>
                    <option value="boolean">Boolean</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Unit (e.g. °C, M, V)"
                    value={newPropUnit}
                    onChange={e => setNewPropUnit(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowAddPropModal(false)}
                    className="px-2 py-1 rounded text-slate-400 hover:text-white text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomProperty}
                    className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
