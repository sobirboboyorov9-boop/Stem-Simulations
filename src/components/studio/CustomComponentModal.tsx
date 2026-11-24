import React, { useState } from 'react';
import { StudioSubject, ShapeType, CustomProperty } from '../../types/simulationStudio.js';
import { ToolboxComponent } from '../../data/subjectToolboxes.js';
import { X, Plus, Trash2, Layers, Check } from 'lucide-react';

interface CustomComponentModalProps {
  isOpen: boolean;
  subject: StudioSubject;
  onClose: () => void;
  onSaveComponent: (comp: ToolboxComponent) => void;
}

export const CustomComponentModal: React.FC<CustomComponentModalProps> = ({
  isOpen,
  subject,
  onClose,
  onSaveComponent
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Custom Lab Gear');
  const [shape, setShape] = useState<ShapeType>('circle');
  const [width, setWidth] = useState(40);
  const [height, setHeight] = useState(40);
  const [color, setColor] = useState('#8b5cf6');
  const [borderColor, setBorderColor] = useState('#6d28d9');
  const [isStatic, setIsStatic] = useState(false);
  const [mass, setMass] = useState(1);
  const [elasticity, setElasticity] = useState(0.8);
  const [customProps, setCustomProps] = useState<CustomProperty[]>([]);

  // Add field state
  const [fieldKey, setFieldKey] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<'number' | 'string' | 'boolean'>('number');
  const [fieldValue, setFieldValue] = useState<any>(0);
  const [fieldUnit, setFieldUnit] = useState('');

  if (!isOpen) return null;

  const handleAddField = () => {
    if (!fieldKey.trim()) return;
    setCustomProps([
      ...customProps,
      {
        key: fieldKey.trim(),
        label: fieldLabel.trim() || fieldKey.trim(),
        type: fieldType,
        value: fieldType === 'number' ? parseFloat(fieldValue) || 0 : fieldValue,
        unit: fieldUnit.trim() || undefined
      }
    ]);
    setFieldKey('');
    setFieldLabel('');
    setFieldUnit('');
  };

  const handleRemoveField = (index: number) => {
    setCustomProps(customProps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newComp: ToolboxComponent = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      subject,
      icon: 'Layers',
      description: description.trim() || `Custom ${subject} object`,
      category,
      shape,
      width,
      height,
      defaultWidth: width,
      defaultHeight: height,
      defaultColor: color,
      borderColor,
      isStatic,
      mass,
      elasticity,
      customProperties: customProps
    };

    onSaveComponent(newComp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="size-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Layers className="size-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Design Custom Simulation Object</h2>
            <p className="text-xs text-slate-400">Add a reusable component to your {subject} toolbox.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Component Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Copper Calorimeter"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Shape</label>
              <select
                value={shape}
                onChange={e => setShape(e.target.value as ShapeType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-indigo-500"
              >
                <option value="circle">Circle</option>
                <option value="rect">Rectangle</option>
                <option value="rounded_rect">Rounded Rectangle</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description</label>
            <input
              type="text"
              placeholder="What this component does in the simulation..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={e => setWidth(parseInt(e.target.value) || 20)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={e => setHeight(parseInt(e.target.value) || 20)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Fill Color</label>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Border</label>
              <input
                type="color"
                value={borderColor}
                onChange={e => setBorderColor(e.target.value)}
                className="w-full h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Mass (kg)</label>
              <input
                type="number"
                value={mass}
                onChange={e => setMass(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-xs"
              />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                checked={isStatic}
                onChange={e => setIsStatic(e.target.checked)}
                className="size-4 accent-indigo-500 rounded"
              />
              <span className="font-semibold text-slate-300">Anchor In Place (Static)</span>
            </div>
          </div>

          {/* Custom Properties */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="font-bold text-slate-200 block">Object Custom Properties & State</span>
            {customProps.map((cp, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="font-mono text-indigo-300">
                  {cp.label} ({cp.type}): {cp.value} {cp.unit}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveField(idx)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}

            <div className="grid grid-cols-4 gap-2 pt-1">
              <input
                type="text"
                placeholder="Key (e.g. molarity)"
                value={fieldKey}
                onChange={e => setFieldKey(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Label"
                value={fieldLabel}
                onChange={e => setFieldLabel(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Default Val"
                value={fieldValue}
                onChange={e => setFieldValue(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddField}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-950"
            >
              Add to Subject Toolbox
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
