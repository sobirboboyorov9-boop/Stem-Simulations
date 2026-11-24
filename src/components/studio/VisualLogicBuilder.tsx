import React, { useState } from 'react';
import {
  StudioLogicRule,
  StudioVariable,
  StudioFormula,
  StudioGraph,
  StudioObject,
  LogicEventTrigger
} from '../../types/simulationStudio.js';
import {
  Workflow,
  Plus,
  Trash2,
  Play,
  Sparkles,
  Volume2,
  RotateCw,
  GitBranch,
  FunctionSquare,
  Sliders,
  LineChart,
  CheckCircle2,
  ChevronDown,
  Layers
} from 'lucide-react';
import { MathRenderer } from '../MathRenderer.js';

function formatFormulaToLatex(target: string, expr: string): string {
  const t = target.replace(/^(var|obj):/, '');
  let e = expr.replace(/(var|obj):/g, '');
  if (!e.includes('\\frac') && e.includes('/')) {
    const parts = e.split('/');
    if (parts.length === 2) {
      const num = parts[0].trim().replace(/^\(|\)$/g, '');
      const den = parts[1].trim().replace(/^\(|\)$/g, '');
      e = `\\frac{${num}}{${den}}`;
    }
  }
  e = e.replace(/\*/g, ' \\cdot ');
  return `${t} = ${e}`;
}
import { validateFormulaSyntax } from '../../engine/formulaEvaluator.js';

interface VisualLogicBuilderProps {
  logicRules: StudioLogicRule[];
  variables: StudioVariable[];
  formulas: StudioFormula[];
  graphs: StudioGraph[];
  objects: StudioObject[];
  onUpdateRules: (rules: StudioLogicRule[]) => void;
  onUpdateVariables: (variables: StudioVariable[]) => void;
  onUpdateFormulas: (formulas: StudioFormula[]) => void;
  onUpdateGraphs: (graphs: StudioGraph[]) => void;
}

export const VisualLogicBuilder: React.FC<VisualLogicBuilderProps> = ({
  logicRules,
  variables,
  formulas,
  graphs,
  objects,
  onUpdateRules,
  onUpdateVariables,
  onUpdateFormulas,
  onUpdateGraphs
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'formulas' | 'variables' | 'graphs'>('rules');
  const [isExpanded, setIsExpanded] = useState(true);

  // New Rule Creator State
  const [showAddRule, setShowAddRule] = useState(false);
  const [ruleName, setRuleName] = useState('When sensor detects obstacle turn robot');
  const [ruleTrigger, setRuleTrigger] = useState<LogicEventTrigger>('on_sensor_detect');
  const [ruleTriggerObj, setRuleTriggerObj] = useState(objects[0]?.id || '');
  const [ruleIfLeft, setRuleIfLeft] = useState('sensor:reading');
  const [ruleIfOp, setRuleIfOp] = useState<any>('<');
  const [ruleIfRight, setRuleIfRight] = useState('100');
  const [ruleActionType, setRuleActionType] = useState<any>('rotate');
  const [ruleActionTarget, setRuleActionTarget] = useState(objects[0]?.id || '');
  const [ruleActionValue, setRuleActionValue] = useState('45');

  // New Variable Creator State
  const [showAddVar, setShowAddVar] = useState(false);
  const [varName, setVarName] = useState('temperature');
  const [varLabel, setVarLabel] = useState('Solution Temp (°C)');
  const [varType, setVarType] = useState<'number' | 'boolean' | 'string'>('number');
  const [varDefault, setVarDefault] = useState<any>(25);
  const [varMin, setVarMin] = useState(0);
  const [varMax, setVarMax] = useState(100);
  const [varStep, setVarStep] = useState(1);
  const [varUnit, setVarUnit] = useState('°C');

  // New Formula State
  const [showAddFormula, setShowAddFormula] = useState(false);
  const [formName, setFormName] = useState('Calculate Acceleration');
  const [formTarget, setFormTarget] = useState(objects[0] ? `obj:${objects[0].id}.velocity.x` : 'var:acceleration');
  const [formExpression, setFormExpression] = useState('var:force / 2');

  const handleAddRule = () => {
    const newRule: StudioLogicRule = {
      id: `rule_${Date.now()}`,
      name: ruleName.trim() || 'Custom Logic Block',
      enabled: true,
      when: {
        trigger: ruleTrigger,
        objectId: ruleTriggerObj || undefined
      },
      ifCondition: {
        left: ruleIfLeft,
        operator: ruleIfOp,
        right: ruleIfRight
      },
      thenActions: [
        {
          id: `act_${Date.now()}`,
          action: ruleActionType,
          target: ruleActionTarget,
          value: !isNaN(Number(ruleActionValue)) ? Number(ruleActionValue) : ruleActionValue
        }
      ]
    };
    onUpdateRules([...logicRules, newRule]);
    setShowAddRule(false);
  };

  const handleToggleRule = (id: string) => {
    onUpdateRules(logicRules.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const handleDeleteRule = (id: string) => {
    onUpdateRules(logicRules.filter(r => r.id !== id));
  };

  const handleAddVariable = () => {
    if (!varName.trim()) return;
    const newVar: StudioVariable = {
      id: `var_${Date.now()}`,
      name: varName.trim().replace(/\s+/g, '_'),
      label: varLabel.trim() || varName.trim(),
      type: varType,
      defaultValue: varDefault,
      value: varDefault,
      min: varMin,
      max: varMax,
      step: varStep,
      unit: varUnit.trim() || undefined,
      isEditable: true
    };
    onUpdateVariables([...variables, newVar]);
    setShowAddVar(false);
  };

  const handleDeleteVariable = (id: string) => {
    onUpdateVariables(variables.filter(v => v.id !== id));
  };

  const handleAddFormula = () => {
    const syntax = validateFormulaSyntax(formExpression, variables);
    const newForm: StudioFormula = {
      id: `form_${Date.now()}`,
      name: formName.trim() || 'Mathematical Relationship',
      target: formTarget,
      expression: formExpression.trim(),
      isValid: syntax.isValid,
      errorMessage: syntax.error
    };
    onUpdateFormulas([...formulas, newForm]);
    setShowAddFormula(false);
  };

  const handleDeleteFormula = (id: string) => {
    onUpdateFormulas(formulas.filter(f => f.id !== id));
  };

  return (
    <div className="h-64 bg-slate-900 border-t border-slate-800 flex flex-col shrink-0 select-none overflow-hidden z-20">
      {/* Bottom Bar Header */}
      <div className="h-9 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Workflow className="size-3.5 text-indigo-400" />
            <span>Behavior & Logic Engine</span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'rules' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="size-3" />
              <span>Event Rules ({logicRules.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('variables')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'variables' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="size-3" />
              <span>Variables ({variables.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('formulas')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'formulas' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FunctionSquare className="size-3" />
              <span>Formulas ({formulas.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('graphs')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'graphs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChart className="size-3" />
              <span>Graphs ({graphs.length})</span>
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'rules' && (
            <button
              onClick={() => setShowAddRule(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-sm"
            >
              <Plus className="size-3" />
              <span>Add Logic Block</span>
            </button>
          )}
          {activeTab === 'variables' && (
            <button
              onClick={() => setShowAddVar(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-sm"
            >
              <Plus className="size-3" />
              <span>New Variable</span>
            </button>
          )}
          {activeTab === 'formulas' && (
            <button
              onClick={() => setShowAddFormula(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-sm"
            >
              <Plus className="size-3" />
              <span>New Formula</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-3 text-xs">
        {/* TAB 1: VISUAL LOGIC RULES */}
        {activeTab === 'rules' && (
          <div className="flex flex-wrap gap-3 items-start">
            {logicRules.map(rule => (
              <div
                key={rule.id}
                className={`w-96 rounded-xl border p-3 bg-slate-950/80 shadow-md flex flex-col justify-between ${
                  rule.enabled ? 'border-slate-700' : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="font-bold text-slate-200 truncate">{rule.name}</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule.id)}
                        className="rounded accent-indigo-500 size-3.5"
                      />
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Block Structure: WHEN -> IF -> THEN */}
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-950/30 px-2 py-1 rounded border border-amber-500/20">
                      <span>WHEN:</span>
                      <span className="text-slate-200 font-normal">
                        {rule.when.trigger} {rule.when.objectId ? `[${rule.when.objectId}]` : ''}
                      </span>
                    </div>

                    {rule.ifCondition && (
                      <div className="flex items-center gap-1.5 text-sky-400 font-bold bg-sky-950/30 px-2 py-1 rounded border border-sky-500/20">
                        <span>IF:</span>
                        <span className="text-slate-200 font-normal">
                          {rule.ifCondition.left} {rule.ifCondition.operator} {rule.ifCondition.right}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/20">
                      <span>THEN:</span>
                      <span className="text-slate-200 font-normal">
                        {rule.thenActions.map(a => `${a.action} (${a.target} = ${JSON.stringify(a.value)})`).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Inline Add Rule Modal */}
            {showAddRule && (
              <div className="w-96 rounded-xl border border-indigo-500/50 p-3 bg-slate-950 shadow-xl space-y-2.5">
                <span className="font-bold text-indigo-300 block text-xs">Create Visual Logic Block</span>
                <input
                  type="text"
                  placeholder="Rule Name"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Trigger Event</span>
                    <select
                      value={ruleTrigger}
                      onChange={e => setRuleTrigger(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                    >
                      <option value="on_sensor_detect">Sensor Detects Distance</option>
                      <option value="on_collision">Object Collision</option>
                      <option value="on_value_change">Variable Value Shift</option>
                      <option value="on_click">User Click</option>
                      <option value="on_tick">Simulation Step Tick</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Target Object</span>
                    <select
                      value={ruleTriggerObj}
                      onChange={e => setRuleTriggerObj(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                    >
                      {objects.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* IF condition */}
                <div className="flex items-center gap-1.5 text-xs">
                  <input
                    type="text"
                    placeholder="Left (e.g. sensor:reading)"
                    value={ruleIfLeft}
                    onChange={e => setRuleIfLeft(e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white font-mono"
                  />
                  <select
                    value={ruleIfOp}
                    onChange={e => setRuleIfOp(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white font-bold"
                  >
                    <option value="<">&lt;</option>
                    <option value=">">&gt;</option>
                    <option value="==">==</option>
                    <option value=">=">&gt;=</option>
                    <option value="<=">&lt;=</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Right (e.g. 100)"
                    value={ruleIfRight}
                    onChange={e => setRuleIfRight(e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white font-mono"
                  />
                </div>

                {/* THEN action */}
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <select
                    value={ruleActionType}
                    onChange={e => setRuleActionType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                  >
                    <option value="rotate">Rotate</option>
                    <option value="change_state">Change State</option>
                    <option value="emit_particles">Emit Particles</option>
                    <option value="apply_force">Apply Force</option>
                    <option value="play_sound">Play Sound</option>
                  </select>
                  <select
                    value={ruleActionTarget}
                    onChange={e => setRuleActionTarget(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                  >
                    {objects.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Value (e.g. 45)"
                    value={ruleActionValue}
                    onChange={e => setRuleActionValue(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowAddRule(false)}
                    className="px-2 py-1 rounded text-slate-400 hover:text-white text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddRule}
                    className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]"
                  >
                    Create Block
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VARIABLES */}
        {activeTab === 'variables' && (
          <div className="flex flex-wrap gap-3 items-start">
            {variables.map(v => (
              <div
                key={v.id}
                className="w-72 rounded-xl border border-slate-800 p-3 bg-slate-950/80 shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-200">{v.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">var:{v.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteVariable(v.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {v.type === 'number' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Value</span>
                      <span className="font-mono text-white">
                        {v.value} {v.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={v.min || 0}
                      max={v.max || 100}
                      step={v.step || 1}
                      value={v.value}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        onUpdateVariables(variables.map(item => (item.id === v.id ? { ...item, value: val } : item)));
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                )}
              </div>
            ))}

            {showAddVar && (
              <div className="w-80 rounded-xl border border-indigo-500/50 p-3 bg-slate-950 shadow-xl space-y-2">
                <span className="font-bold text-indigo-300 block text-xs">Add New Variable</span>
                <input
                  type="text"
                  placeholder="Variable Identifier (e.g. launchSpeed)"
                  value={varName}
                  onChange={e => setVarName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Display Label"
                  value={varLabel}
                  onChange={e => setVarLabel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={varMin}
                    onChange={e => setVarMin(parseFloat(e.target.value) || 0)}
                    className="bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={varMax}
                    onChange={e => setVarMax(parseFloat(e.target.value) || 100)}
                    className="bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={varUnit}
                    onChange={e => setVarUnit(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowAddVar(false)}
                    className="px-2 py-1 rounded text-slate-400 hover:text-white text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddVariable}
                    className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]"
                  >
                    Add Variable
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FORMULAS */}
        {activeTab === 'formulas' && (
          <div className="flex flex-wrap gap-3 items-start">
            {formulas.map(f => (
              <div
                key={f.id}
                className="w-80 rounded-xl border border-slate-800 p-3 bg-slate-950/80 shadow-md space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{f.name}</span>
                  <button
                    onClick={() => handleDeleteFormula(f.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="font-mono text-xs text-indigo-300 bg-indigo-950/30 p-1.5 rounded border border-indigo-500/20">
                  {f.target} = {f.expression}
                </div>
                <div className="pt-0.5">
                  <MathRenderer
                    math={formatFormulaToLatex(f.target, f.expression)}
                    displayMode={false}
                    className="w-full justify-center bg-indigo-950/50 border-indigo-500/25 text-indigo-200 py-1"
                  />
                </div>
              </div>
            ))}

            {showAddFormula && (
              <div className="w-80 rounded-xl border border-indigo-500/50 p-3 bg-slate-950 shadow-xl space-y-2">
                <span className="font-bold text-indigo-300 block text-xs">Define Formula Relationship</span>
                <input
                  type="text"
                  placeholder="Formula Description"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Target Variable or Property (e.g. obj:ball.velocity.x)"
                  value={formTarget}
                  onChange={e => setFormTarget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Expression (e.g. var:speed * cos(var:angle))"
                  value={formExpression}
                  onChange={e => setFormExpression(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white font-mono"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowAddFormula(false)}
                    className="px-2 py-1 rounded text-slate-400 hover:text-white text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddFormula}
                    className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]"
                  >
                    Save Formula
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GRAPHS */}
        {activeTab === 'graphs' && (
          <div className="flex flex-wrap gap-4 items-start">
            {graphs.map(g => (
              <div
                key={g.id}
                className="w-80 rounded-xl border border-slate-800 p-3 bg-slate-950 shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{g.title}</span>
                  <span className="text-[10px] text-slate-400">{g.dataPoints?.length || 0} pts</span>
                </div>
                <div className="h-28 bg-slate-900 rounded p-2 flex items-end justify-between gap-1 border border-slate-800">
                  {g.dataPoints && g.dataPoints.slice(-30).map((pt, idx) => {
                    const min = g.minY !== undefined ? g.minY : 0;
                    const max = g.maxY !== undefined ? g.maxY : 50;
                    const pct = Math.max(5, Math.min(100, ((pt.y - min) / (max - min || 1)) * 100));
                    return (
                      <div
                        key={idx}
                        style={{ height: `${pct}%`, backgroundColor: g.color || '#38bdf8' }}
                        className="w-1.5 rounded-t"
                        title={`(${pt.x}, ${pt.y})`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
