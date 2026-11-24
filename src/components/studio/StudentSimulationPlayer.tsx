import React, { useState, useEffect, useRef } from 'react';
import {
  TeacherSimulationDefinition,
  StudioObject,
  StudioVariable
} from '../../types/simulationStudio.js';
import { SimulationRuntime } from '../../engine/simulationRuntime.js';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sliders,
  LineChart,
  HelpCircle,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface StudentSimulationPlayerProps {
  definition: TeacherSimulationDefinition;
  onExitPreview?: () => void;
}

export const StudentSimulationPlayer: React.FC<StudentSimulationPlayerProps> = ({
  definition,
  onExitPreview
}) => {
  const [runtime] = useState(() => new SimulationRuntime(definition));
  const [state, setState] = useState(() => runtime.getState());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'graphs' | 'inquiry'>('controls');
  const [inquiryAnswers, setInquiryAnswers] = useState<Record<string, string>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<Record<string, boolean>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to runtime updates at 60 FPS
  useEffect(() => {
    const unsub = runtime.subscribe(() => {
      setState({ ...runtime.getState() });
    });
    return unsub;
  }, [runtime]);

  // Update runtime when definition changes
  useEffect(() => {
    runtime.updateDefinition(definition);
  }, [definition, runtime]);

  const canvasWidth = definition.canvas.width || 900;
  const canvasHeight = definition.canvas.height || 520;

  // 60FPS Canvas Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const currentState = runtime.getState();

      // Clear Canvas
      ctx.fillStyle = definition.canvas.background || '#0f172a';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw Grid
      if (definition.canvas.grid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const gs = definition.canvas.gridSize || 30;
        for (let x = 0; x <= canvasWidth; x += gs) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasHeight);
          ctx.stroke();
        }
        for (let y = 0; y <= canvasHeight; y += gs) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasWidth, y);
          ctx.stroke();
        }
      }

      // Draw Trails
      for (const [objId, pts] of currentState.trails.entries()) {
        const obj = currentState.objects.find(o => o.id === objId);
        if (!obj || pts.length < 2) continue;
        ctx.strokeStyle = obj.trail?.color || '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Objects
      const sorted = [...currentState.objects].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      for (const obj of sorted) {
        if (!obj.visible) continue;

        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate((obj.rotation * Math.PI) / 180);
        ctx.scale(obj.scale || 1, obj.scale || 1);
        ctx.globalAlpha = obj.opacity !== undefined ? obj.opacity : 1;

        const halfW = obj.width / 2;
        const halfH = obj.height / 2;

        ctx.fillStyle = obj.color || '#3b82f6';
        ctx.strokeStyle = obj.borderColor || '#1d4ed8';
        ctx.lineWidth = obj.borderWidth || 2;

        // Sonar Raycast Cone
        if (obj.subjectData?.sensorType === 'ultrasonic') {
          const range = obj.subjectData.sensorRange || 200;
          const fov = ((obj.subjectData.sensorFOV || 40) * Math.PI) / 180;
          ctx.save();
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.beginPath();
          ctx.moveTo(halfW, 0);
          ctx.arc(halfW, 0, range, -fov / 2, fov / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        switch (obj.shape) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, halfW, 0, 2 * Math.PI);
            ctx.fill();
            if (obj.borderWidth) ctx.stroke();
            break;
          case 'rounded_rect':
            drawRoundedRect(ctx, -halfW, -halfH, obj.width, obj.height, 8);
            ctx.fill();
            if (obj.borderWidth) ctx.stroke();
            break;
          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(0, -halfH);
            ctx.lineTo(halfW, halfH);
            ctx.lineTo(-halfW, halfH);
            ctx.closePath();
            ctx.fill();
            if (obj.borderWidth) ctx.stroke();
            break;
          case 'rect':
          default:
            ctx.fillRect(-halfW, -halfH, obj.width, obj.height);
            if (obj.borderWidth) ctx.strokeRect(-halfW, -halfH, obj.width, obj.height);
            break;
        }

        // Labels
        if (obj.label || obj.showLabel !== false) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(obj.label || obj.name, 0, halfH + 14);
        }

        // Value tags
        const liveMetric = obj.customProperties?.find(p => p.key === 'currentPh' || p.key === 'obstacleDistanceCm' || p.key === 'reading');
        if (liveMetric) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(-halfW, -halfH - 22, obj.width, 18);
          ctx.strokeStyle = '#38bdf8';
          ctx.strokeRect(-halfW, -halfH - 22, obj.width, 18);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${liveMetric.label}: ${liveMetric.value}`, 0, -halfH - 12);
        }

        ctx.restore();
      }

      // Draw Particles
      for (const p of currentState.particles) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [runtime, definition, canvasWidth, canvasHeight]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col lg:flex-row h-full w-full bg-slate-950 text-white select-none overflow-hidden"
    >
      {/* Main Simulation Stage */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Control Bar */}
        <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300">
              {definition.subject}
            </span>
            <h2 className="text-sm font-bold text-slate-100 truncate">{definition.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {state.isRunning ? (
              <button
                onClick={() => runtime.pause()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                <Pause className="size-3.5 fill-current" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => runtime.play()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950 transition-colors"
              >
                <Play className="size-3.5 fill-current" />
                <span>Run Experiment</span>
              </button>
            )}

            <button
              onClick={() => runtime.reset()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset"
            >
              <RotateCcw className="size-4" />
            </button>

            <div className="h-4 w-px bg-slate-800" />

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>

            {onExitPreview && (
              <button
                onClick={onExitPreview}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Exit Preview
              </button>
            )}
          </div>
        </div>

        {/* Canvas Display */}
        <div className="flex-1 flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
          <div className="rounded-xl border border-slate-800 shadow-2xl overflow-hidden bg-slate-900">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="block cursor-pointer"
              style={{ maxWidth: '100%', maxHeight: '72vh', width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
            />
          </div>
        </div>
      </div>

      {/* Right Control & Telemetry Panel */}
      <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0">
        {/* Tab Headers */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab('controls')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'controls' ? 'border-indigo-500 text-indigo-300' : 'border-transparent hover:text-white'
            }`}
          >
            <Sliders className="size-3.5" />
            <span>Variables</span>
          </button>
          <button
            onClick={() => setActiveTab('graphs')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'graphs' ? 'border-indigo-500 text-indigo-300' : 'border-transparent hover:text-white'
            }`}
          >
            <LineChart className="size-3.5" />
            <span>Graphs</span>
          </button>
          <button
            onClick={() => setActiveTab('inquiry')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'inquiry' ? 'border-indigo-500 text-indigo-300' : 'border-transparent hover:text-white'
            }`}
          >
            <HelpCircle className="size-3.5" />
            <span>Inquiry</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 1: VARIABLE SLIDERS */}
          {activeTab === 'controls' && (
            <div className="space-y-4">
              <span className="font-bold text-slate-200 block text-xs">Experimental Controls</span>

              {state.variables.length > 0 ? (
                state.variables.map(v => (
                  <div key={v.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{v.label}</span>
                      <span className="font-mono text-indigo-300 text-xs">
                        {v.value} {v.unit}
                      </span>
                    </div>

                    {v.type === 'number' && (
                      <input
                        type="range"
                        min={v.min || 0}
                        max={v.max || 100}
                        step={v.step || 1}
                        value={v.value}
                        onChange={e => runtime.setVariable(v.id, parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No adjustable variables defined in this lab.</p>
              )}
            </div>
          )}

          {/* TAB 2: LIVE GRAPHS */}
          {activeTab === 'graphs' && (
            <div className="space-y-4">
              <span className="font-bold text-slate-200 block text-xs">Real-Time Data Telemetry</span>

              {state.graphs.length > 0 ? (
                state.graphs.map(g => (
                  <div key={g.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{g.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {g.ySource} vs {g.xSource}
                      </span>
                    </div>

                    <div className="h-28 bg-slate-900 rounded-lg p-2 flex items-end justify-between gap-1 border border-slate-800">
                      {g.dataPoints && g.dataPoints.slice(-30).map((pt, idx) => {
                        const min = g.minY !== undefined ? g.minY : 0;
                        const max = g.maxY !== undefined ? g.maxY : 50;
                        const pct = Math.max(5, Math.min(100, ((pt.y - min) / (max - min || 1)) * 100));
                        return (
                          <div
                            key={idx}
                            style={{ height: `${pct}%`, backgroundColor: g.color || '#38bdf8' }}
                            className="w-1.5 rounded-t transition-all duration-75"
                            title={`(${pt.x}, ${pt.y})`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No graphs configured for this simulation.</p>
              )}
            </div>
          )}

          {/* TAB 3: INQUIRY WORKSHEET */}
          {activeTab === 'inquiry' && (
            <div className="space-y-4">
              <span className="font-bold text-slate-200 block text-xs">Guided Inquiry Questions</span>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="font-bold text-indigo-300 block">Question 1: Hypothesis</span>
                <p className="text-slate-300">
                  How does increasing the primary variable affect the rate of reaction or velocity?
                </p>
                <textarea
                  rows={2}
                  value={inquiryAnswers['q1'] || ''}
                  onChange={e => setInquiryAnswers({ ...inquiryAnswers, q1: e.target.value })}
                  placeholder="Record your observation..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs resize-none"
                />
                <button
                  onClick={() => setIsAnswerSubmitted({ ...isAnswerSubmitted, q1: true })}
                  className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  {isAnswerSubmitted['q1'] ? 'Observation Logged ✓' : 'Submit Observation'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
