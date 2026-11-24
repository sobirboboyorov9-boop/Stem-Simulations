import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  StudioObject,
  TeacherSimulationDefinition,
  Vector2D
} from '../../types/simulationStudio.js';
import { SimulationRuntime } from '../../engine/simulationRuntime.js';

interface InteractiveCanvasProps {
  runtime: SimulationRuntime;
  definition: TeacherSimulationDefinition;
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (updated: StudioObject) => void;
  onDropNewComponent: (compJson: string, canvasPos: Vector2D) => void;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  runtime,
  definition,
  selectedObjectId,
  onSelectObject,
  onUpdateObject,
  onDropNewComponent
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Vector2D>({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<'move' | 'rotate' | 'resize' | null>(null);

  // Resize canvas to match internal simulation definition or container
  const canvasWidth = definition.canvas.width || 900;
  const canvasHeight = definition.canvas.height || 520;

  // Convert client mouse event to canvas coordinate
  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Vector2D => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, [canvasWidth, canvasHeight]);

  // Main Render Loop
  useEffect(() => {
    let animationId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = runtime.getState();
      const canvasCfg = definition.canvas;

      // 1. Clear background
      ctx.fillStyle = canvasCfg.background || '#0f172a';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 2. Draw Grid & Coordinate Axes
      if (canvasCfg.grid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        const gridSize = canvasCfg.gridSize || 30;

        for (let x = 0; x <= canvasWidth; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasHeight);
          ctx.stroke();
        }
        for (let y = 0; y <= canvasHeight; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasWidth, y);
          ctx.stroke();
        }
      }

      // Draw Cartesian origin axes if enabled
      if (canvasCfg.showAxes) {
        const ox = canvasCfg.origin?.x !== undefined ? canvasCfg.origin.x : 50;
        const oy = canvasCfg.origin?.y !== undefined ? canvasCfg.origin.y : canvasHeight - 50;

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1.5;

        // X Axis
        ctx.beginPath();
        ctx.moveTo(0, oy);
        ctx.lineTo(canvasWidth, oy);
        ctx.stroke();

        // Y Axis
        ctx.beginPath();
        ctx.moveTo(ox, 0);
        ctx.lineTo(ox, canvasHeight);
        ctx.stroke();

        // Axis labels
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillText('+X', canvasWidth - 25, oy - 6);
        ctx.fillText('+Y', ox + 6, 15);
      }

      // 3. Draw Object Trajectory Trails
      for (const [objId, pts] of state.trails.entries()) {
        const obj = state.objects.find(o => o.id === objId);
        if (!obj || pts.length < 2) continue;

        ctx.strokeStyle = obj.trail?.color || '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 4. Draw Objects (sorted by zIndex)
      const sortedObjects = [...state.objects].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      for (const obj of sortedObjects) {
        if (!obj.visible) continue;

        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate((obj.rotation * Math.PI) / 180);
        ctx.scale(obj.scale || 1, obj.scale || 1);
        ctx.globalAlpha = obj.opacity !== undefined ? obj.opacity : 1;

        const w = obj.width;
        const h = obj.height;
        const halfW = w / 2;
        const halfH = h / 2;

        // Specialized Drawing based on shape & subject
        ctx.fillStyle = obj.color || '#3b82f6';
        ctx.strokeStyle = obj.borderColor || '#1d4ed8';
        ctx.lineWidth = obj.borderWidth || 2;

        // Ultrasonic Sensor Field / Sonar Cone
        if (obj.subjectData?.sensorType === 'ultrasonic') {
          const range = obj.subjectData.sensorRange || 200;
          const fov = ((obj.subjectData.sensorFOV || 40) * Math.PI) / 180;
          ctx.save();
          ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1;
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
            drawRoundedRect(ctx, -halfW, -halfH, w, h, 8);
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

          case 'arrow':
            drawArrow(ctx, -halfW, 0, halfW, 0, 10);
            break;

          case 'rect':
          default:
            ctx.fillRect(-halfW, -halfH, w, h);
            if (obj.borderWidth) ctx.strokeRect(-halfW, -halfH, w, h);
            break;
        }

        // Object Label or Icon
        if (obj.label || obj.showLabel !== false) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const labelText = obj.label || obj.name;
          ctx.fillText(labelText, 0, halfH + 14);
        }

        // Custom property overlay badge (e.g. pH reading, RPM, distance)
        const liveMetric = obj.customProperties?.find(p => p.key === 'currentPh' || p.key === 'obstacleDistanceCm' || p.key === 'reading');
        if (liveMetric) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(-halfW, -halfH - 22, w, 18);
          ctx.strokeStyle = '#38bdf8';
          ctx.strokeRect(-halfW, -halfH - 22, w, 18);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${liveMetric.label}: ${liveMetric.value}`, 0, -halfH - 12);
        }

        // Vectors Overlay (Velocity & Acceleration Arrows)
        if (obj.showVectors?.velocity && (Math.abs(obj.velocity.x) > 0.1 || Math.abs(obj.velocity.y) > 0.1)) {
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.fillStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          const vx = obj.velocity.x * 2.5;
          const vy = obj.velocity.y * 2.5;
          drawArrow(ctx, 0, 0, vx, vy, 6);
          ctx.restore();
        }

        if (obj.showVectors?.acceleration && (Math.abs(obj.acceleration.x) > 0.1 || Math.abs(obj.acceleration.y) > 0.1)) {
          ctx.save();
          ctx.strokeStyle = '#22c55e';
          ctx.fillStyle = '#22c55e';
          ctx.lineWidth = 2;
          const ax = obj.acceleration.x * 2.5;
          const ay = obj.acceleration.y * 2.5;
          drawArrow(ctx, 0, 0, ax, ay, 6);
          ctx.restore();
        }

        ctx.restore();

        // 5. Draw Selection Highlight Bounding Box & Handles
        if (obj.id === selectedObjectId) {
          ctx.save();
          ctx.translate(obj.x, obj.y);
          ctx.rotate((obj.rotation * Math.PI) / 180);
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(-halfW - 6, -halfH - 6, w + 12, h + 12);
          ctx.setLineDash([]);

          // Resize Pin Handle at Bottom Right
          ctx.fillStyle = '#6366f1';
          ctx.fillRect(halfW + 2, halfH + 2, 8, 8);

          // Rotation Handle Top Center
          ctx.beginPath();
          ctx.arc(0, -halfH - 18, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(0, -halfH - 6);
          ctx.lineTo(0, -halfH - 13);
          ctx.stroke();

          ctx.restore();
        }
      }

      // 6. Draw Active Particles
      for (const p of state.particles) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [runtime, definition, canvasWidth, canvasHeight, selectedObjectId]);

  // Handle Drag & Drop of new components from toolbox
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    const canvasPos = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };

    onDropNewComponent(data, canvasPos);
  };

  // Canvas Mouse Down: Select & start dragging objects or transform handles
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e);
    const state = runtime.getState();

    // Check hit on objects (top to bottom of zIndex)
    const objects = [...state.objects].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    let hitObj: StudioObject | null = null;
    for (const obj of objects) {
      const halfW = obj.width / 2;
      const halfH = obj.height / 2;
      if (
        pos.x >= obj.x - halfW &&
        pos.x <= obj.x + halfW &&
        pos.y >= obj.y - halfH &&
        pos.y <= obj.y + halfH
      ) {
        hitObj = obj;
        break;
      }
    }

    if (hitObj) {
      onSelectObject(hitObj.id);
      setIsDragging(true);
      setActiveHandle('move');
      setDragOffset({
        x: pos.x - hitObj.x,
        y: pos.y - hitObj.y
      });
      runtime.startDragObject(hitObj.id);
    } else {
      onSelectObject(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedObjectId) return;
    const pos = getCanvasCoords(e);
    const state = runtime.getState();
    const obj = state.objects.find(o => o.id === selectedObjectId);
    if (!obj) return;

    if (activeHandle === 'move') {
      const updated = {
        ...obj,
        x: Math.round(pos.x - dragOffset.x),
        y: Math.round(pos.y - dragOffset.y)
      };
      onUpdateObject(updated);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setActiveHandle(null);
      runtime.endDragObject();
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative select-none"
    >
      <div className="relative rounded-xl border border-slate-800 shadow-2xl overflow-hidden bg-slate-900">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="cursor-crosshair block"
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
        />
      </div>
    </div>
  );
};

// Helper Canvas Drawing Functions
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

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  headLen: number
) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}
