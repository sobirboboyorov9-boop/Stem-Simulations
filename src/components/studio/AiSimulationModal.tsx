import React, { useState } from 'react';
import {
  StudioSubject,
  TeacherSimulationDefinition,
  StudioVariable,
  StudioFormula
} from '../../types/simulationStudio.js';
import {
  Sparkles,
  X,
  Wand2,
  Loader2,
  Lightbulb,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Flame,
  ArrowRight,
  Sliders,
  Check,
  RefreshCw,
  HelpCircle,
  Stethoscope,
  Code2,
  Atom,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { STARTER_TEMPLATES } from '../../data/studioTemplates.js';

interface AiSimulationModalProps {
  isOpen: boolean;
  subject: StudioSubject;
  currentDefinition: TeacherSimulationDefinition;
  onClose: () => void;
  onApplyGeneratedSimulation: (def: TeacherSimulationDefinition) => void;
}

type AiTab = 'architect' | 'copilot' | 'formula' | 'diagnose';

interface SubjectPreset {
  title: string;
  prompt: string;
  tag: string;
  grade: '6-8' | '9-12' | 'University';
}

const EXTENSIVE_PRESETS: Record<StudioSubject, SubjectPreset[]> = {
  Physics: [
    {
      title: 'Elastic Double Pendulum Chaos',
      prompt: 'Create a dual-arm coupled pendulum simulation demonstrating deterministic chaos, energy conservation, and live phase space velocity trajectories.',
      tag: 'NGSS HS-PS3-1',
      grade: '9-12'
    },
    {
      title: 'Ballistics with Atmospheric Drag',
      prompt: 'Build a cannon trajectory ballistics laboratory with adjustable muzzle velocity, angle, air drag coefficient, and a destructible target station.',
      tag: 'Kinematics',
      grade: '6-8'
    },
    {
      title: 'Orbital Gravity & Kepler’s Laws',
      prompt: 'Simulate planetary orbital mechanics around a central star with adjustable mass, eccentricity, velocity vectors, and orbital period telemetry.',
      tag: 'Gravitation',
      grade: '9-12'
    },
    {
      title: 'Hooke’s Law Damped Harmonic Oscillator',
      prompt: 'Create an interactive spring-mass system with damping coefficient slider, spring constant k, mass adjustment, and real-time kinetic vs potential energy graphs.',
      tag: 'AP Physics',
      grade: '9-12'
    }
  ],
  Robotics: [
    {
      title: 'Autonomous Rover with Sonar Obstacle Avoidance',
      prompt: 'Design a differential-drive robot with 3 ultrasonic distance sensors that navigates an obstacle maze, switches states on detection, and executes PID avoidance maneuvers.',
      tag: 'Autonomous Navigation',
      grade: '9-12'
    },
    {
      title: '2-DOF Robotic Arm Inverse Kinematics',
      prompt: 'Build a 2-joint articulated robotic arm with angle controls, reach workspace visualizer, and a magnetic end-effector for picking up lab sample crates.',
      tag: 'Kinematics & Control',
      grade: 'University'
    },
    {
      title: 'Line Following Robot with Optical Sensors',
      prompt: 'Simulate a mobile robot with dual reflectance sensors tracking a circuit path with adjustable motor speeds and correction proportional gain.',
      tag: 'Sensor Feedback',
      grade: '6-8'
    }
  ],
  Chemistry: [
    {
      title: 'Acid-Base Titration with pH Indicator',
      prompt: 'Create a burette titration experiment with strong acid, 0.1M NaOH titrant dispensing, phenolphthalein colorimetric shift at pH 8.2, and real-time titration curve plot.',
      tag: 'AP Chem Equivalence',
      grade: '9-12'
    },
    {
      title: 'Maxwell-Boltzmann Gas Kinetic Chamber',
      prompt: 'Simulate 60 interacting gas molecules in a closed container with temperature control, pressure sensor, piston volume slider, and velocity distribution histogram.',
      tag: 'Thermodynamics',
      grade: '9-12'
    },
    {
      title: 'Electrolysis of Water & Gas Capture',
      prompt: 'Build an electrolytic cell with cathode and anode electrodes generating H2 and O2 bubbles at a 2:1 volumetric ratio with voltage controls.',
      tag: 'Electrochemistry',
      grade: '6-8'
    }
  ],
  Biology: [
    {
      title: 'Enzyme-Substrate Lock & Key Kinetics',
      prompt: 'Create an enzyme catalysis simulation with active sites, substrate binding, competitive inhibitors, temperature denaturation curve, and product reaction rate graph.',
      tag: 'AP Biology Enzymes',
      grade: '9-12'
    },
    {
      title: 'Lotka-Volterra Predator-Prey Dynamics',
      prompt: 'Simulate an ecosystem with reproducing rabbits, hunting foxes, grass resource regrowth, carrying capacity limit, and oscillating population graphs.',
      tag: 'Ecosystem Ecology',
      grade: '6-8'
    },
    {
      title: 'Cell Membrane Osmosis & Hypertonic Solutions',
      prompt: 'Build a plant cell model with semi-permeable membrane, solute concentration slider, turgor pressure gauge, and cell wall deformation.',
      tag: 'Cellular Transport',
      grade: '6-8'
    }
  ],
  Geography: [
    {
      title: 'Subduction Zone Tectonic Earthquakes',
      prompt: 'Simulate oceanic-continental plate convergence, fault friction lockup, sudden seismic slip release, and tsunami wave dispersion with seismograph plot.',
      tag: 'Plate Tectonics',
      grade: '6-8'
    },
    {
      title: 'Atmospheric Coriolis Effect & Cyclones',
      prompt: 'Create a rotating hemisphere weather model demonstrating wind deflection, low pressure cyclone vortex formation, and hurricane intensity categories.',
      tag: 'Climatology',
      grade: '9-12'
    },
    {
      title: 'River Delta Sediment Deposition',
      prompt: 'Simulate river water flow carrying sediment particles of varied grain sizes that deposit into an ocean basin forming distributary alluvial channels.',
      tag: 'Geomorphology',
      grade: '6-8'
    }
  ],
  'Computer Science': [
    {
      title: 'Network Packet Routing & Buffer Drops',
      prompt: 'Design a multi-node packet switching topology with router queues, bandwidth latency sliders, dropped packet counters, and congestion visualizer.',
      tag: 'Networking Protocol',
      grade: '9-12'
    },
    {
      title: 'Interactive 4-Bit Binary Full Adder',
      prompt: 'Build a digital logic circuit with interactive logic gates (AND, OR, XOR), input switches (A, B, Carry-In), and LED outputs showing binary addition.',
      tag: 'Digital Logic',
      grade: '9-12'
    },
    {
      title: 'Sorting Algorithm Race Visualizer',
      prompt: 'Simulate array elements comparing and swapping under QuickSort vs BubbleSort with step counter and operation latency controls.',
      tag: 'Algorithms & O(N)',
      grade: '9-12'
    }
  ],
  Mathematics: [
    {
      title: 'Dynamic Trigonometric Unit Circle',
      prompt: 'Create an interactive unit circle with rotating angle theta, live sine and cosine projection bars, tangent asymptote line, and continuous wave plot.',
      tag: 'Trigonometry',
      grade: '9-12'
    },
    {
      title: 'Fourier Series Harmonic Synthesizer',
      prompt: 'Simulate square and sawtooth wave reconstruction by adding odd harmonics (sin(nx)/n) with harmonic count slider and sound wave visualizer.',
      tag: 'Calculus & Fourier',
      grade: 'University'
    },
    {
      title: 'Differential Calculus Tangent Slope Engine',
      prompt: 'Build an interactive polynomial curve explorer with draggable point x, instantaneous secant-to-tangent limit slider, and derivative f\'(x) plot.',
      tag: 'Calculus Derivatives',
      grade: '9-12'
    }
  ]
};

const QUICK_COPILOT_CHIPS = [
  'Add air resistance slider & wind vector',
  'Add dynamic collision particle explosion',
  'Add kinetic vs potential energy real-time graph',
  'Set gravity to Moon (1.62 m/s²) and add terrain crater',
  'Add an interactive target zone at (750, 420)',
  'Add 3 graded inquiry challenge questions',
  'Add spring elasticity and damping slider',
  'Add a color change state rule on high speed'
];

export const AiSimulationModal: React.FC<AiSimulationModalProps> = ({
  isOpen,
  subject,
  currentDefinition,
  onClose,
  onApplyGeneratedSimulation
}) => {
  const [activeTab, setActiveTab] = useState<AiTab>('architect');

  // Architect Form State
  const [selectedSubject, setSelectedSubject] = useState<StudioSubject>(subject);
  const [prompt, setPrompt] = useState('');
  const [gradeLevel, setGradeLevel] = useState<'3-5' | '6-8' | '9-12' | 'University'>('6-8');
  const [difficulty, setDifficulty] = useState<'Exploratory' | 'Introductory' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [pedagogicalGoal, setPedagogicalGoal] = useState('');
  const [standardAlignment, setStandardAlignment] = useState('');

  // Copilot State
  const [copilotInstruction, setCopilotInstruction] = useState('');

  // Formula State
  const [formulaDescription, setFormulaDescription] = useState('');

  // Processing & Results
  const [isProcessing, setIsProcessing] = useState(false);
  const [reasoningLogs, setReasoningLogs] = useState<string[]>([]);
  const [generatedDef, setGeneratedDef] = useState<TeacherSimulationDefinition | null>(null);
  const [copilotChanges, setCopilotChanges] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState<{ type: string; message: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = EXTENSIVE_PRESETS[selectedSubject] || EXTENSIVE_PRESETS.Physics;

  // 1. Handle AI Simulation Architect Generation
  const handleGenerateSimulation = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setError(null);
    setGeneratedDef(null);
    setReasoningLogs([
      `Initiating Gemini 3.7 AI STEM Architect for ${selectedSubject}...`,
      `Analyzing pedagogical goals: "${prompt.slice(0, 50)}..."`,
      'Formulating coordinate geometry and kinematic bodies...',
      'Wiring reactive variable bindings and formula evaluators...',
      'Synthesizing visual logic triggers and telemetry graphs...'
    ]);

    try {
      const res = await fetch('/api/studio/generate-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          subject: selectedSubject,
          gradeLevel,
          difficulty,
          pedagogicalGoal,
          standard: standardAlignment
        })
      });

      if (!res.ok) throw new Error('AI Generator network response was not ok');
      const data = await res.json();
      if (data.simulation) {
        setGeneratedDef(data.simulation);
        if (data.reasoning) setReasoningLogs(data.reasoning);
        return;
      }
    } catch (e: any) {
      console.warn('Using client-side fallback generator:', e);
      const fallback =
        STARTER_TEMPLATES.find(t => t.subject === selectedSubject) || STARTER_TEMPLATES[0];
      setGeneratedDef(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Handle AI Sim Copilot Modification
  const handleCopilotModify = async (instructionToUse?: string) => {
    const text = instructionToUse || copilotInstruction;
    if (!text.trim()) return;
    setIsProcessing(true);
    setError(null);
    setCopilotChanges([]);

    try {
      const res = await fetch('/api/studio/modify-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDefinition,
          instruction: text
        })
      });

      if (!res.ok) throw new Error('AI Copilot request failed');
      const data = await res.json();
      if (data.updatedSimulation) {
        setGeneratedDef(data.updatedSimulation);
        setCopilotChanges(data.changes || [data.summary]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to apply copilot modification');
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Handle Auto-Tuner Diagnostician
  const handleRunDiagnostician = async () => {
    setIsProcessing(true);
    setError(null);
    setDiagnostics([]);

    try {
      const res = await fetch('/api/studio/auto-tune-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definition: currentDefinition })
      });

      if (!res.ok) throw new Error('Auto-Tuner request failed');
      const data = await res.json();
      if (data.tunedSimulation) {
        setGeneratedDef(data.tunedSimulation);
        setDiagnostics(data.diagnostics || []);
      }
    } catch (e: any) {
      setError(e.message || 'Diagnostic scan failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Handle Formula Generator
  const handleGenerateFormula = async () => {
    if (!formulaDescription.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/studio/generate-formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formulaDescription,
          subject: currentDefinition.subject
        })
      });

      if (!res.ok) throw new Error('Formula generator failed');
      const data = await res.json();
      if (data.formula) {
        const updated = JSON.parse(JSON.stringify(currentDefinition));
        updated.formulas.push(data.formula);
        if (data.newVariables) {
          updated.variables.push(...data.newVariables);
        }
        setGeneratedDef(updated);
        setCopilotChanges([`Added mathematical formula: "${data.formula.name}"`, ...data.newVariables.map((v: any) => `Added variable: "${v.label}"`)]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to synthesize formula');
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply final generated or modified definition
  const handleAcceptAndApply = () => {
    if (generatedDef) {
      onApplyGeneratedSimulation(generatedDef);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-950/50">
              <Sparkles className="size-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  AI Science Simulation Architect & Copilot
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                  Gemini 3.7 Pro Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Design multi-body physics experiments, reactive mathematical laws, and interactive inquiry labs in seconds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 gap-2 pt-2">
          <button
            onClick={() => { setActiveTab('architect'); setGeneratedDef(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'architect'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="size-4" />
            <span>AI Sim Architect (From Scratch)</span>
          </button>

          <button
            onClick={() => { setActiveTab('copilot'); setGeneratedDef(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'copilot'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="size-4" />
            <span>AI Sim Copilot (Refine Active Lab)</span>
          </button>

          <button
            onClick={() => { setActiveTab('formula'); setGeneratedDef(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'formula'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="size-4" />
            <span>AI Formula & Law Engine</span>
          </button>

          <button
            onClick={() => { setActiveTab('diagnose'); setGeneratedDef(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'diagnose'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="size-4" />
            <span>AI Auto-Tuner & Diagnostician</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: ARCHITECT (FROM SCRATCH) */}
          {activeTab === 'architect' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Configuration & Prompt */}
              <div className="lg:col-span-7 space-y-4">
                {/* Subject & Grade Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={e => setSelectedSubject(e.target.value as StudioSubject)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Robotics">Robotics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Geography">Geography</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Computer Science">Computer Science</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Grade Level</label>
                    <select
                      value={gradeLevel}
                      onChange={e => setGradeLevel(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500"
                    >
                      <option value="3-5">Elementary (3-5)</option>
                      <option value="6-8">Middle School (6-8)</option>
                      <option value="9-12">High School (9-12)</option>
                      <option value="University">AP / University</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500"
                    >
                      <option value="Exploratory">Exploratory</option>
                      <option value="Introductory">Introductory</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced Multi-Stage</option>
                    </select>
                  </div>
                </div>

                {/* Prompt Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-200">
                      Describe the experiment, apparatus, or physical phenomenon:
                    </label>
                    <span className="text-[10px] text-slate-500">Natural language input</span>
                  </div>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={`e.g., "Build an interactive ${selectedSubject} simulation exploring how changing the launch angle and mass affects the maximum height and distance, with real-time kinetic energy graphs and target obstacles..."`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none shadow-inner"
                  />
                </div>

                {/* Optional Curriculum Goal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Curriculum Standard (Optional)
                    </label>
                    <input
                      type="text"
                      value={standardAlignment}
                      onChange={e => setStandardAlignment(e.target.value)}
                      placeholder="e.g., NGSS HS-PS2-1 or AP Chem Unit 8"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Target Learning Objective (Optional)
                    </label>
                    <input
                      type="text"
                      value={pedagogicalGoal}
                      onChange={e => setPedagogicalGoal(e.target.value)}
                      placeholder="e.g., Calculate acceleration from slope"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateSimulation}
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-950/60 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Synthesizing Simulation Architecture...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="size-4" />
                      <span>Generate Complete Interactive Simulation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Inspiration Presets & AI Stage Visualizer */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Lightbulb className="size-4 text-amber-400" />
                  <span>High-Yield {selectedSubject} Presets:</span>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {presets.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPrompt(preset.prompt)}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                          {preset.title}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-medium border border-indigo-500/30">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI SIM COPILOT (ITERATIVE REFINER) */}
          {activeTab === 'copilot' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
                <Cpu className="size-5 text-indigo-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-indigo-200">
                    Active Canvas: "{currentDefinition.title}" ({currentDefinition.objects.length} Objects,{' '}
                    {currentDefinition.variables.length} Variables, {currentDefinition.logicRules.length} Rules)
                  </p>
                  <p className="text-slate-400">
                    Instruct Gemini to add new sensors, tune gravity, inject particle bursts, attach real-time charts, or adjust collision dynamics on your live simulation.
                  </p>
                </div>
              </div>

              {/* Quick Action Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  One-Click Copilot Enhancements:
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_COPILOT_CHIPS.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCopilotInstruction(chip);
                        handleCopilotModify(chip);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-950/40 text-slate-300 hover:text-white text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="size-3 text-indigo-400" />
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Command Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Or enter your custom refinement instruction:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={copilotInstruction}
                    onChange={e => setCopilotInstruction(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCopilotModify()}
                    placeholder="e.g., 'Make the ball bounce with 0.95 elasticity and spawn a glowing cyan trail with 120 points'"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopilotModify()}
                    disabled={isProcessing || !copilotInstruction.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shrink-0 shadow-md"
                  >
                    {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                    <span>Apply Refinement</span>
                  </button>
                </div>
              </div>

              {/* Copilot Change Log */}
              {copilotChanges.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="size-4" />
                    <span>Copilot Enhancements Applied:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {copilotChanges.map((change, idx) => (
                      <li key={idx}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI FORMULA & LAW ENGINE */}
          {activeTab === 'formula' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-slate-300">
                <h4 className="font-bold text-purple-200 mb-1">Natural Language Equation Compiler</h4>
                <p className="text-slate-400">
                  Type physical laws, differential relations, or mathematical algebraic dependencies. AI compiles them into live reactive formula nodes with synchronized sliders.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Describe the Formula / Equation:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formulaDescription}
                    onChange={e => setFormulaDescription(e.target.value)}
                    placeholder="e.g., 'Spring restoring force with damping: F = -k * x - c * v' or 'Centripetal acceleration: a = v^2 / r'"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={handleGenerateFormula}
                    disabled={isProcessing || !formulaDescription.trim()}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shrink-0 shadow-md"
                  >
                    {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Code2 className="size-4" />}
                    <span>Compile Formula</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI AUTO-TUNER & DIAGNOSTICIAN */}
          {activeTab === 'diagnose' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <Stethoscope className="size-5 text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-emerald-200">Simulation Health & Balance Audit</p>
                  <p className="text-slate-400">
                    The AI Auto-Tuner audits canvas boundary safety, unlinked control sliders, excessive velocities, orphaned variables, and physical stability, automatically applying repairs.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunDiagnostician}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Running Diagnostic Engine...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Scan & Auto-Tune Active Simulation</span>
                  </>
                )}
              </button>

              {diagnostics.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-300">Diagnostic Report & Actions:</h4>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {diagnostics.map((diag, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                          diag.type === 'fixed'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                        }`}
                      >
                        <CheckCircle2 className="size-3.5 shrink-0" />
                        <span>{diag.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reasoning / Progress Display */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <Loader2 className="size-4 animate-spin" />
                <span>AI Engineering Pipeline Active:</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-400">
                {reasoningLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <ChevronRight className="size-3 text-indigo-500" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Result Preview Card */}
          {generatedDef && (
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/50 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-400 animate-ping" />
                  <h4 className="text-xs font-bold text-white">Generated Simulation Ready:</h4>
                  <span className="text-indigo-300 text-xs font-bold">{generatedDef.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{generatedDef.objects.length} Objects</span>
                  <span>•</span>
                  <span>{generatedDef.variables.length} Controls</span>
                  <span>•</span>
                  <span>{generatedDef.graphs.length} Graphs</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{generatedDef.description}</p>

              {/* Inquiry preview */}
              {generatedDef.educationalGuide?.inquiryQuestions && (
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <BookOpen className="size-3" /> Sample Inquiry Question:
                  </span>
                  <p className="text-slate-300 italic">
                    "{generatedDef.educationalGuide.inquiryQuestions[0]}"
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="size-3.5 text-purple-400" />
            <span>Generates complete 60 FPS Verlet physics, reactivity, and telemetry graphs.</span>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>

            {generatedDef && (
              <button
                type="button"
                onClick={handleAcceptAndApply}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all cursor-pointer"
              >
                <Check className="size-4" />
                <span>Load into Studio Canvas</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
