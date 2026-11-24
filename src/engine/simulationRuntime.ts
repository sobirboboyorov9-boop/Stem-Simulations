import {
  TeacherSimulationDefinition,
  StudioObject,
  StudioVariable,
  StudioFormula,
  StudioMovement,
  StudioReaction,
  StudioLogicRule,
  StudioGraph,
  Vector2D
} from '../types/simulationStudio.js';
import { evaluateFormula, EvaluationContext } from './formulaEvaluator.js';

export interface RuntimeParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  opacity: number;
}

export interface RuntimeState {
  time: number;
  dt: number;
  isRunning: boolean;
  speed: number;
  objects: StudioObject[];
  variables: StudioVariable[];
  formulas: StudioFormula[];
  movements: StudioMovement[];
  reactions: StudioReaction[];
  logicRules: StudioLogicRule[];
  graphs: StudioGraph[];
  trails: Map<string, Vector2D[]>;
  particles: RuntimeParticle[];
  selectedObjectId: string | null;
  draggedObjectId: string | null;
  hoveredObjectId: string | null;
}

export class SimulationRuntime {
  private definition: TeacherSimulationDefinition;
  private state: RuntimeState;
  private listeners: Set<() => void> = new Set();
  private audioCtx: AudioContext | null = null;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;

  constructor(definition: TeacherSimulationDefinition) {
    this.definition = JSON.parse(JSON.stringify(definition));
    this.state = this.createInitialState();
  }

  public getDefinition(): TeacherSimulationDefinition {
    return this.definition;
  }

  public getState(): RuntimeState {
    return this.state;
  }

  public updateDefinition(newDef: TeacherSimulationDefinition) {
    const wasRunning = this.state.isRunning;
    this.definition = JSON.parse(JSON.stringify(newDef));
    this.state.objects = JSON.parse(JSON.stringify(newDef.objects));
    this.state.variables = JSON.parse(JSON.stringify(newDef.variables));
    this.state.formulas = JSON.parse(JSON.stringify(newDef.formulas));
    this.state.movements = JSON.parse(JSON.stringify(newDef.movements));
    this.state.reactions = JSON.parse(JSON.stringify(newDef.reactions));
    this.state.logicRules = JSON.parse(JSON.stringify(newDef.logicRules));
    this.state.graphs = JSON.parse(JSON.stringify(newDef.graphs));
    this.notify();
    if (wasRunning) {
      this.play();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private createInitialState(): RuntimeState {
    const trails = new Map<string, Vector2D[]>();
    for (const obj of this.definition.objects) {
      if (obj.trail?.enabled) {
        trails.set(obj.id, [{ x: obj.x, y: obj.y }]);
      }
    }

    return {
      time: 0,
      dt: 0.016,
      isRunning: false,
      speed: 1.0,
      objects: JSON.parse(JSON.stringify(this.definition.objects)),
      variables: JSON.parse(JSON.stringify(this.definition.variables)),
      formulas: JSON.parse(JSON.stringify(this.definition.formulas)),
      movements: JSON.parse(JSON.stringify(this.definition.movements)),
      reactions: JSON.parse(JSON.stringify(this.definition.reactions)),
      logicRules: JSON.parse(JSON.stringify(this.definition.logicRules)),
      graphs: JSON.parse(JSON.stringify(this.definition.graphs)),
      trails,
      particles: [],
      selectedObjectId: null,
      draggedObjectId: null,
      hoveredObjectId: null
    };
  }

  public play() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    this.lastTimestamp = performance.now();
    this.initAudio();

    // Trigger on_start event rules
    this.triggerLogicEvent('on_start');

    this.loop();
    this.notify();
  }

  public pause() {
    this.state.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.notify();
  }

  public reset() {
    this.pause();
    this.state = this.createInitialState();
    this.triggerLogicEvent('on_reset');
    this.notify();
  }

  public setSpeed(speed: number) {
    this.state.speed = Math.max(0.1, Math.min(5.0, speed));
    this.notify();
  }

  public setVariable(variableIdOrName: string, value: any) {
    const v = this.state.variables.find(
      item => item.id === variableIdOrName || item.name === variableIdOrName
    );
    if (v) {
      v.value = value;
      // Trigger value change logic
      this.triggerLogicEvent('on_value_change', { variableId: v.id });
      // Re-evaluate formulas dependent on this
      this.evaluateAllFormulas();
      this.notify();
    }
  }

  public getVariableValue(varName: string): any {
    const v = this.state.variables.find(item => item.name === varName || item.id === varName);
    return v ? v.value : 0;
  }

  public setSelectedObject(id: string | null) {
    this.state.selectedObjectId = id;
    this.notify();
  }

  public setHoveredObject(id: string | null) {
    this.state.hoveredObjectId = id;
  }

  public startDragObject(id: string) {
    this.state.draggedObjectId = id;
    this.setSelectedObject(id);
    this.triggerLogicEvent('on_drag', { objectId: id });
  }

  public endDragObject() {
    this.state.draggedObjectId = null;
    this.notify();
  }

  public setCustomProperty(objectId: string, key: string, val: any) {
    const obj = this.state.objects.find(o => o.id === objectId);
    if (!obj) return;
    if (!obj.customProperties) obj.customProperties = [];
    const prop = obj.customProperties.find(p => p.key === key);
    if (prop) {
      prop.value = val;
    } else {
      obj.customProperties.push({
        key,
        label: key,
        type: typeof val === 'number' ? 'number' : typeof val === 'boolean' ? 'boolean' : 'string',
        value: val
      });
    }
    this.notify();
  }

  private loop = () => {
    if (!this.state.isRunning) return;

    const now = performance.now();
    const rawDt = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    // Cap delta time to prevent spiraling after tab inactive
    const dt = Math.min(rawDt, 0.05) * this.state.speed * (this.definition.physics.timeScale || 1.0);
    this.state.dt = dt;
    this.state.time += dt;

    this.step(dt);
    this.notify();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  public step(dt: number) {
    const physics = this.definition.physics;
    const canvas = this.definition.canvas;

    // 1. Evaluate all mathematical formulas
    this.evaluateAllFormulas();

    // 2. Process specialized movements
    this.processMovements(dt);

    // 3. Process kinematic physics & position updates
    for (const obj of this.state.objects) {
      if (obj.isStatic || this.state.draggedObjectId === obj.id) continue;

      if (physics.enabled) {
        // Apply world gravity scaled by object's gravityScale
        const gScale = obj.gravityScale !== undefined ? obj.gravityScale : 1.0;
        const gx = physics.gravity.x * gScale * 10;
        const gy = physics.gravity.y * gScale * 10;

        obj.velocity.x += (obj.acceleration.x + gx) * dt;
        obj.velocity.y += (obj.acceleration.y + gy) * dt;

        // Apply air resistance drag
        const drag = 1.0 - (physics.airResistance || 0) * dt;
        obj.velocity.x *= Math.max(0, drag);
        obj.velocity.y *= Math.max(0, drag);

        // Apply friction
        const friction = 1.0 - (obj.friction || 0) * 0.1 * dt;
        obj.velocity.x *= Math.max(0, friction);
        obj.velocity.y *= Math.max(0, friction);
      }

      // Position step
      obj.x += obj.velocity.x * dt * 10;
      obj.y += obj.velocity.y * dt * 10;

      // Angular velocity step
      if (obj.angularVelocity) {
        obj.rotation = (obj.rotation + obj.angularVelocity * dt) % 360;
      }

      // Boundary handling
      if (physics.boundaryMode === 'bounce') {
        const radX = obj.width / 2;
        const radY = obj.height / 2;
        const elast = obj.elasticity !== undefined ? obj.elasticity : 0.7;

        if (obj.x - radX < 0) {
          obj.x = radX;
          obj.velocity.x = -obj.velocity.x * elast;
        } else if (obj.x + radX > canvas.width) {
          obj.x = canvas.width - radX;
          obj.velocity.x = -obj.velocity.x * elast;
        }

        if (obj.y - radY < 0) {
          obj.y = radY;
          obj.velocity.y = -obj.velocity.y * elast;
        } else if (obj.y + radY > canvas.height) {
          obj.y = canvas.height - radY;
          obj.velocity.y = -obj.velocity.y * elast;
        }
      } else if (physics.boundaryMode === 'wrap') {
        if (obj.x < -obj.width) obj.x = canvas.width;
        if (obj.x > canvas.width + obj.width) obj.x = 0;
        if (obj.y < -obj.height) obj.y = canvas.height;
        if (obj.y > canvas.height + obj.height) obj.y = 0;
      }

      // Update trail points
      if (obj.trail?.enabled) {
        let trail = this.state.trails.get(obj.id);
        if (!trail) {
          trail = [];
          this.state.trails.set(obj.id, trail);
        }
        trail.push({ x: obj.x, y: obj.y });
        const maxPoints = obj.trail.maxPoints || 100;
        if (trail.length > maxPoints) {
          trail.splice(0, trail.length - maxPoints);
        }
      }
    }

    // 4. Collision & Reaction processing
    this.processCollisionsAndReactions();

    // 5. Update sensor sweeps & rays
    this.processSensors();

    // 6. Process logic event rules (on_tick, conditions)
    this.triggerLogicEvent('on_tick');

    // 7. Update particles
    this.updateParticles(dt);

    // 8. Record real-time graph points
    this.updateGraphs();
  }

  private evaluateAllFormulas() {
    const context: EvaluationContext = {
      variables: this.state.variables.reduce((acc, v) => {
        acc[v.name] = v.value;
        return acc;
      }, {} as Record<string, any>),
      objects: this.state.objects.reduce((acc, o) => {
        acc[o.id] = o;
        return acc;
      }, {} as Record<string, StudioObject>),
      time: this.state.time,
      dt: this.state.dt
    };

    for (const formula of this.state.formulas) {
      if (!formula.expression) continue;
      const res = evaluateFormula(formula.expression, context);
      if (res.success && res.value !== undefined) {
        this.applyFormulaResult(formula.target, res.value);
      }
    }
  }

  private applyFormulaResult(target: string, value: any) {
    if (!target) return;

    if (target.startsWith('var:')) {
      const varName = target.slice(4);
      const v = this.state.variables.find(item => item.name === varName || item.id === varName);
      if (v) v.value = value;
    } else if (target.startsWith('obj:')) {
      const parts = target.slice(4).split('.');
      const objId = parts[0];
      const obj = this.state.objects.find(o => o.id === objId);
      if (!obj) return;

      if (parts.length === 2) {
        const prop = parts[1];
        if (prop in obj) {
          (obj as any)[prop] = value;
        } else if (obj.customProperties) {
          const cp = obj.customProperties.find(p => p.key === prop);
          if (cp) cp.value = value;
        }
      } else if (parts.length === 3) {
        const parentProp = parts[1];
        const subProp = parts[2];
        if (parentProp === 'velocity') {
          if (subProp === 'x') obj.velocity.x = Number(value) || 0;
          if (subProp === 'y') obj.velocity.y = Number(value) || 0;
        } else if (parentProp === 'customProperties') {
          const cp = obj.customProperties?.find(p => p.key === subProp);
          if (cp) cp.value = value;
        } else if (parentProp === 'subjectData' && obj.subjectData) {
          (obj.subjectData as any)[subProp] = value;
        }
      }
    }
  }

  private processMovements(dt: number) {
    for (const mov of this.state.movements) {
      if (!mov.enabled) continue;
      const obj = this.state.objects.find(o => o.id === mov.objectId);
      if (!obj || obj.isStatic) continue;

      switch (mov.type) {
        case 'rotate_rpm': {
          const rpm = mov.parameters.rpm || 30;
          obj.rotation = (obj.rotation + rpm * 6 * dt) % 360;
          break;
        }
        case 'oscillate': {
          const freq = mov.parameters.frequency || 1;
          const amp = mov.parameters.amplitude || 50;
          const axis = mov.parameters.axis || 'y';
          const shift = Math.sin(this.state.time * freq * 2 * Math.PI) * amp * dt * 5;
          if (axis === 'x' || axis === 'both') obj.x += shift;
          if (axis === 'y' || axis === 'both') obj.y += shift;
          break;
        }
        case 'follow_target': {
          const target = this.state.objects.find(o => o.id === mov.parameters.targetObjectId);
          if (target) {
            const dx = target.x - obj.x;
            const dy = target.y - obj.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 10) {
              const speed = (mov.parameters.speed || 50) * dt;
              obj.x += (dx / dist) * speed;
              obj.y += (dy / dist) * speed;
              obj.rotation = (Math.atan2(dy, dx) * 180) / Math.PI;
            }
          }
          break;
        }
        case 'brownian': {
          const jitter = (mov.parameters.speed || 20) * dt;
          obj.x += (Math.random() - 0.5) * jitter * 20;
          obj.y += (Math.random() - 0.5) * jitter * 20;
          break;
        }
      }
    }
  }

  private processCollisionsAndReactions() {
    const objs = this.state.objects;
    for (let i = 0; i < objs.length; i++) {
      for (let j = i + 1; j < objs.length; j++) {
        const a = objs[i];
        const b = objs[j];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const minDist = (a.width + b.width) / 4 + (a.height + b.height) / 4;

        if (dist < minDist && dist > 0.001) {
          // Collision detected!
          if (this.definition.physics.enableCollisions && (!a.isStatic || !b.isStatic)) {
            const nx = dx / dist;
            const ny = dy / dist;
            const kx = a.velocity.x - b.velocity.x;
            const ky = a.velocity.y - b.velocity.y;
            const p = 2 * (nx * kx + ny * ky) / (a.mass + b.mass);

            if (!a.isStatic) {
              a.velocity.x -= p * b.mass * nx * (a.elasticity || 0.8);
              a.velocity.y -= p * b.mass * ny * (a.elasticity || 0.8);
            }
            if (!b.isStatic) {
              b.velocity.x += p * a.mass * nx * (b.elasticity || 0.8);
              b.velocity.y += p * a.mass * ny * (b.elasticity || 0.8);
            }
          }

          // Check custom reactions
          this.executeReactions('collision', a.id, b.id);
          this.triggerLogicEvent('on_collision', { objectId: a.id, targetObjectId: b.id });
        }
      }
    }
  }

  private executeReactions(triggerType: string, srcId: string, targetId?: string) {
    for (const r of this.state.reactions) {
      if (!r.enabled || r.triggerType !== triggerType) continue;
      if (r.sourceObjectId === srcId || (r.sourceObjectId === '*' && r.targetObjectId === targetId)) {
        for (const act of r.actions) {
          this.executeAction(act.type, r.sourceObjectId, act.params);
        }
      }
    }
  }

  private processSensors() {
    for (const obj of this.state.objects) {
      if (obj.subjectData?.sensorType === 'ultrasonic') {
        const range = obj.subjectData.sensorRange || 200;
        let closestDist = range;

        // Cast ray in direction of object's rotation
        const rad = (obj.rotation * Math.PI) / 180;
        const dirX = Math.cos(rad);
        const dirY = Math.sin(rad);

        for (const other of this.state.objects) {
          if (other.id === obj.id) continue;
          const dx = other.x - obj.x;
          const dy = other.y - obj.y;
          const dot = dx * dirX + dy * dirY;

          if (dot > 0 && dot < closestDist) {
            // Perpendicular distance to ray line
            const perpDist = Math.abs(dx * dirY - dy * dirX);
            if (perpDist < (other.width + other.height) / 4) {
              closestDist = Math.round(dot);
            }
          }
        }

        obj.subjectData.sensorReading = closestDist;
        if (obj.customProperties) {
          const cp = obj.customProperties.find(p => p.key === 'obstacleDistanceCm' || p.key === 'detectedDistanceCm');
          if (cp) cp.value = closestDist;
        }

        // Trigger sensor detection event
        this.triggerLogicEvent('on_sensor_detect', { objectId: obj.id, threshold: closestDist });
      }
    }
  }

  public triggerLogicEvent(
    event: string,
    params?: { objectId?: string; targetObjectId?: string; variableId?: string; threshold?: number }
  ) {
    for (const rule of this.state.logicRules) {
      if (!rule.enabled) continue;
      if (rule.when.trigger !== event) continue;

      if (params?.objectId && rule.when.objectId && rule.when.objectId !== params.objectId) continue;
      if (params?.variableId && rule.when.variableId && rule.when.variableId !== params.variableId) continue;

      // Evaluate IF condition
      let conditionMet = true;
      if (rule.ifCondition && rule.ifCondition.left) {
        const leftVal = this.resolveConditionOperand(rule.ifCondition.left, params);
        const rightVal = this.resolveConditionOperand(rule.ifCondition.right, params);
        conditionMet = this.compareValues(leftVal, rule.ifCondition.operator, rightVal);
      }

      if (conditionMet) {
        for (const act of rule.thenActions) {
          this.executeLogicAction(act);
        }
      } else if (rule.elseActions) {
        for (const act of rule.elseActions) {
          this.executeLogicAction(act);
        }
      }
    }
  }

  private resolveConditionOperand(operand: string, params?: any): any {
    if (!operand) return 0;
    if (operand === 'sensor:reading') {
      const obj = this.state.objects.find(o => o.id === params?.objectId);
      return obj?.subjectData?.sensorReading !== undefined ? obj.subjectData.sensorReading : 999;
    }
    if (operand.startsWith('var:')) {
      return this.getVariableValue(operand.slice(4));
    }
    if (operand.startsWith('obj:')) {
      const parts = operand.slice(4).split('.');
      const obj = this.state.objects.find(o => o.id === parts[0]);
      if (obj && parts[1]) {
        return (obj as any)[parts[1]] || 0;
      }
      return 0;
    }
    if (!isNaN(Number(operand))) {
      return Number(operand);
    }
    return operand;
  }

  private compareValues(left: any, op: string, right: any): boolean {
    const l = Number(left) !== null && !isNaN(Number(left)) ? Number(left) : String(left);
    const r = Number(right) !== null && !isNaN(Number(right)) ? Number(right) : String(right);

    switch (op) {
      case '==':
        return l == r;
      case '!=':
        return l != r;
      case '>':
        return Number(l) > Number(r);
      case '<':
        return Number(l) < Number(r);
      case '>=':
        return Number(l) >= Number(r);
      case '<=':
        return Number(l) <= Number(r);
      case 'contains':
        return String(l).includes(String(r));
      default:
        return false;
    }
  }

  private executeLogicAction(act: any) {
    const obj = this.state.objects.find(o => o.id === act.target);

    switch (act.action) {
      case 'set_variable':
        this.setVariable(act.target, act.value);
        break;
      case 'change_state':
        if (obj) {
          obj.currentState = act.value;
          const matched = obj.states?.find(s => s.id === act.value);
          if (matched && matched.color) {
            obj.color = matched.color;
          }
        }
        break;
      case 'rotate':
        if (obj) {
          obj.rotation = (obj.rotation + (Number(act.value) || 45)) % 360;
        }
        break;
      case 'apply_force':
        if (obj) {
          obj.velocity.x += act.value?.x || 0;
          obj.velocity.y += act.value?.y || 0;
        }
        break;
      case 'emit_particles':
        if (obj) {
          this.emitParticlesAt(obj.x, obj.y, act.value?.color || '#38bdf8', act.value?.count || 20);
        }
        break;
      case 'reset_position':
        if (obj && act.value) {
          obj.x = act.value.x;
          obj.y = act.value.y;
          obj.velocity = { x: 0, y: 0 };
        }
        break;
      case 'play_sound':
        this.playTone(act.value?.frequency || 440, act.value?.duration || 0.15);
        break;
    }
  }

  private executeAction(type: string, srcId: string, params: Record<string, any>) {
    const obj = this.state.objects.find(o => o.id === srcId);
    if (!obj) return;

    if (type === 'emit_particles') {
      this.emitParticlesAt(obj.x, obj.y, params.color || '#fbbf24', params.count || 20);
    } else if (type === 'play_sound') {
      this.playTone(params.frequency || 520, params.duration || 0.1);
    } else if (type === 'bounce') {
      obj.velocity.x = -obj.velocity.x * (params.factor || 1);
      obj.velocity.y = -obj.velocity.y * (params.factor || 1);
    }
  }

  public emitParticlesAt(x: number, y: number, color: string, count: number = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = 30 + Math.random() * 120;
      this.state.particles.push({
        id: `p_${Date.now()}_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 5,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.6,
        opacity: 1
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.state.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.opacity = 1 - p.life / p.maxLife;
    }
  }

  private updateGraphs() {
    for (const g of this.state.graphs) {
      let xVal = this.state.time;
      if (g.xSource.startsWith('var:')) {
        xVal = Number(this.getVariableValue(g.xSource.slice(4))) || 0;
      }

      let yVal = 0;
      if (g.ySource.startsWith('var:')) {
        yVal = Number(this.getVariableValue(g.ySource.slice(4))) || 0;
      } else if (g.ySource.startsWith('obj:')) {
        const parts = g.ySource.slice(4).split('.');
        const obj = this.state.objects.find(o => o.id === parts[0]);
        if (obj) {
          if (parts[1] === 'x') yVal = obj.x;
          else if (parts[1] === 'y') yVal = obj.y;
          else if (parts[1] === 'velocity' && parts[2]) yVal = (obj.velocity as any)[parts[2]] || 0;
          else if (obj.customProperties) {
            const cp = obj.customProperties.find(p => p.key === parts[parts.length - 1]);
            if (cp) yVal = Number(cp.value) || 0;
          }
        }
      }

      if (!g.dataPoints) g.dataPoints = [];
      g.dataPoints.push({ x: Number(xVal.toFixed(2)), y: Number(yVal.toFixed(2)) });
      const maxPts = g.maxPoints || 80;
      if (g.dataPoints.length > maxPts) {
        g.dataPoints.splice(0, g.dataPoints.length - maxPts);
      }
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      try {
        const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioClass) {
          this.audioCtx = new AudioClass();
        }
      } catch (e) {
        // Audio synthesis fallback
      }
    }
  }

  public playTone(freq: number = 440, duration: number = 0.15) {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // safe ignore
    }
  }
}
