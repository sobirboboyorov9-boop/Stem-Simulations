import React from 'react';
import { StudioSubject } from '../../types/simulationStudio.js';
import {
  Globe,
  Dna,
  FlaskConical,
  LineChart,
  Atom,
  Terminal,
  Bot,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

interface SubjectSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubject: (subject: StudioSubject, templateId?: string) => void;
}

interface SubjectCardInfo {
  subject: StudioSubject;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  tools: string[];
  templates: Array<{ id: string; name: string }>;
}

const SUBJECTS: SubjectCardInfo[] = [
  {
    subject: 'Physics',
    title: 'Physics Studio',
    tagline: 'Mechanics, Electromagnetism, Waves, Optics, Harmonic Oscillations & Gravity',
    icon: Atom,
    accentColor: '#38bdf8',
    bgColor: 'from-sky-950/40 to-slate-900/80',
    borderColor: 'border-sky-500/40 hover:border-sky-400',
    tools: ['Projectiles', 'Forces', 'Circuits', 'Springs', 'Pendulums', 'Lenses', 'Charges'],
    templates: [
      { id: 'template_physics_projectile', name: 'Projectile Kinematics' }
    ]
  },
  {
    subject: 'Robotics',
    title: 'Robotics Studio',
    tagline: 'Autonomous Rovers, Ultrasonic Sonar, Motor Control, Differential Steering & Arms',
    icon: Bot,
    accentColor: '#38bdf8',
    bgColor: 'from-cyan-950/40 to-slate-900/80',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    tools: ['Differential Rovers', 'Sonar LiDAR', 'Servo Arms', 'Line Trackers', 'Encoders', 'Obstacles'],
    templates: [
      { id: 'template_robotics_rover', name: 'Autonomous Rover & Sonar' }
    ]
  },
  {
    subject: 'Chemistry',
    title: 'Chemistry Studio',
    tagline: 'Titrations, Acid-Base Neutralization, Particle Kinetics, Solutions & pH Shift',
    icon: FlaskConical,
    accentColor: '#ec4899',
    bgColor: 'from-pink-950/40 to-slate-900/80',
    borderColor: 'border-pink-500/40 hover:border-pink-400',
    tools: ['Beakers & Burettes', 'Bunsen Flame', 'pH Strips', 'Gas Particles', 'Reagent Flasks'],
    templates: [
      { id: 'template_chemistry_titration', name: 'Acid-Base Titration' }
    ]
  },
  {
    subject: 'Biology',
    title: 'Biology Studio',
    tagline: 'Cellular Osmosis, Enzyme Kinetics, Mitochondria ATP, Photosynthesis & Ecology',
    icon: Dna,
    accentColor: '#10b981',
    bgColor: 'from-emerald-950/40 to-slate-900/80',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    tools: ['Eukaryote Cells', 'Nucleus DNA', 'Membranes', 'Solute Diffusion', 'Trophic Webs'],
    templates: [
      { id: 'template_biology_osmosis', name: 'Cell Membrane Osmosis' }
    ]
  },
  {
    subject: 'Geography',
    title: 'Geography Studio',
    tagline: 'Plate Tectonics, Volcanism, Atmospheric Climate, Insolation & Demographics',
    icon: Globe,
    accentColor: '#f59e0b',
    bgColor: 'from-amber-950/40 to-slate-900/80',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    tools: ['Volcano Cones', 'Tectonic Crust', 'Precipitation Clouds', 'Sun Insolation', 'Urban Centers'],
    templates: [
      { id: 'template_geography_tectonics', name: 'Plate Tectonics & Magma' }
    ]
  },
  {
    subject: 'Computer Science',
    title: 'Computer Science Studio',
    tagline: 'Packet Routing, Stateful Firewalls, Logic Gates, Protocols & Architecture',
    icon: Terminal,
    accentColor: '#8b5cf6',
    bgColor: 'from-purple-950/40 to-slate-900/80',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    tools: ['Routers & Firewalls', 'IP Packets', 'Servers', 'AND/OR/NOT Gates', 'Buffer Queues'],
    templates: [
      { id: 'template_cs_firewall_routing', name: 'Packet Routing & Firewall' }
    ]
  },
  {
    subject: 'Mathematics',
    title: 'Mathematics Studio',
    tagline: 'Coordinate Geometry, Quadratic Polynomials, Unit Circle Trigonometry & Vectors',
    icon: LineChart,
    accentColor: '#06b6d4',
    bgColor: 'from-teal-950/40 to-slate-900/80',
    borderColor: 'border-teal-500/40 hover:border-teal-400',
    tools: ['Cartesian Grids', 'Polynomial Curves', '2D Vectors', 'Unit Circles', 'Dynamic Vertices'],
    templates: [
      { id: 'template_math_quadratic', name: 'Quadratic Functions & Roots' }
    ]
  }
];

export const SubjectSelectorModal: React.FC<SubjectSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectSubject
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="size-5" />
        </button>

        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="size-3.5" />
            Teacher Simulation Studio
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Choose Your Subject Studio
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Each subject provides a specialized component library, domain physical rules, and tailored visual logic systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECTS.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.subject}
                className={`group relative rounded-xl border bg-gradient-to-b ${item.bgColor} ${item.borderColor} p-5 transition-all duration-200 hover:shadow-lg flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="size-11 rounded-lg flex items-center justify-center bg-slate-800/80 border border-slate-700/60 shadow-inner"
                      style={{ color: item.accentColor }}
                    >
                      <Icon className="size-6" />
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                      {item.subject}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {item.tagline}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.tools.map(tool => (
                      <span
                        key={tool}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800/60 text-slate-300 border border-slate-700/40"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
                  <button
                    onClick={() => onSelectSubject(item.subject)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-950"
                  >
                    <span>Blank Canvas</span>
                    <ArrowRight className="size-3.5" />
                  </button>

                  {item.templates.length > 0 && (
                    <button
                      onClick={() => onSelectSubject(item.subject, item.templates[0].id)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700/60 transition-colors"
                    >
                      <span>Load Starter: {item.templates[0].name}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
