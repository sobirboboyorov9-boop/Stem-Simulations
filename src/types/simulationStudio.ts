export type StudioSubject = 
  | 'Geography' 
  | 'Biology' 
  | 'Chemistry' 
  | 'Mathematics' 
  | 'Physics' 
  | 'Computer Science' 
  | 'Robotics';

export type ShapeType = 'circle' | 'rect' | 'rounded_rect' | 'triangle' | 'polygon' | 'line' | 'arrow' | 'icon' | 'sensor' | 'particle_system' | 'custom_svg';

export interface Vector2D {
  x: number;
  y: number;
}

export interface CustomProperty {
  key: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'color';
  value: number | string | boolean;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export interface ObjectState {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  properties?: Record<string, any>;
}

export interface StudioObject {
  id: string;
  name: string;
  category: string;
  subject: StudioSubject | 'Universal';
  shape: ShapeType;
  icon?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  scale: number;
  color: string;
  borderColor?: string;
  borderWidth?: number;
  opacity: number;
  label?: string;
  showLabel?: boolean;
  zIndex: number;
  visible: boolean;
  isLocked?: boolean;

  // Physical & Kinematics
  mass: number;
  friction: number;
  elasticity: number; // 0 (inelastic) to 1 (perfect bounce)
  isStatic: boolean;
  isDraggable: boolean;
  charge: number; // Electric charge in Coulombs / microC
  temperature: number; // Celsius
  velocity: Vector2D;
  acceleration: Vector2D;
  angularVelocity: number; // deg/sec
  gravityScale: number; // 1 = standard world gravity, 0 = immune

  // Subject-Specific Properties
  subjectData?: {
    // Geography
    elevation?: number;
    latitude?: number;
    longitude?: number;
    climateType?: string;
    rainfallMm?: number;
    tectonicPlate?: string;
    tectonicVector?: Vector2D;
    population?: number;
    magmaPressure?: number;

    // Biology
    cellType?: string;
    membranePermeability?: number; // 0 to 1
    atpLevel?: number;
    species?: string;
    trophicLevel?: 'producer' | 'primary_consumer' | 'secondary_consumer' | 'decomposer';
    biomass?: number;
    health?: number;
    reproductionRate?: number;
    glucose?: number;
    oxygen?: number;

    // Chemistry
    elementSymbol?: string;
    atomicNumber?: number;
    formula?: string;
    phase?: 'solid' | 'liquid' | 'gas' | 'aqueous';
    pH?: number;
    concentrationMolar?: number;
    volumeMl?: number;
    moles?: number;
    colorIndicator?: string;
    temperatureKelvin?: number;
    reactivity?: number;

    // Mathematics
    mathExpression?: string;
    points?: Vector2D[];
    functionType?: 'linear' | 'quadratic' | 'polynomial' | 'trigonometric' | 'exponential';
    amplitude?: number;
    frequency?: number;
    phaseShift?: number;
    radius?: number;
    angleDeg?: number;

    // Physics
    voltage?: number;
    current?: number;
    resistance?: number;
    capacitance?: number;
    inductance?: number;
    isCircuitClosed?: boolean;
    springConstant?: number;
    pendulumLength?: number;
    refractiveIndex?: number;
    magneticFieldTesla?: number;
    wavelengthNm?: number;

    // Computer Science / IT
    ipAddress?: string;
    port?: number;
    bandwidthMbps?: number;
    packetQueue?: any[];
    gateType?: 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';
    binaryValue?: 0 | 1;
    isServer?: boolean;
    isRouter?: boolean;
    isFirewall?: boolean;
    ruleAction?: 'allow' | 'drop';

    // Robotics
    motorSpeedLeft?: number; // -100 to +100
    motorSpeedRight?: number;
    servoAngle?: number;
    sensorType?: 'ultrasonic' | 'ir' | 'lidar' | 'light' | 'touch' | 'camera';
    sensorRange?: number; // pixels / cm
    sensorFOV?: number; // degrees
    sensorReading?: number;
    wheelRadius?: number;
    trackWidth?: number;
    armJoints?: { length: number; angleDeg: number; color?: string }[];
    targetPos?: Vector2D;
    isAutonomous?: boolean;
  };

  // Custom User Defined Properties
  customProperties: CustomProperty[];

  // State Machine
  states?: ObjectState[];
  currentState?: string;

  // Visual Overlays
  showVectors?: {
    velocity?: boolean;
    acceleration?: boolean;
    force?: boolean;
  };
  trail?: {
    enabled: boolean;
    color: string;
    maxPoints: number;
  };
}

export interface StudioVariable {
  id: string;
  name: string;
  label: string;
  type: 'number' | 'boolean' | 'string' | 'select';
  defaultValue: any;
  value: any;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
  isEditable: boolean;
  options?: string[];
  category?: string;
  formulaId?: string;
}

export interface StudioFormula {
  id: string;
  name: string;
  target: string; // e.g. 'var:velocity' or 'obj:ball_1.subjectData.pH' or 'obj:ball_1.x'
  expression: string; // e.g. 'var:force / obj:ball_1.mass' or 'var:distance / var:time'
  description?: string;
  unit?: string;
  isValid: boolean;
  errorMessage?: string;
}

export type MovementType = 
  | 'kinematic' 
  | 'follow_target' 
  | 'rotate_rpm' 
  | 'oscillate' 
  | 'brownian' 
  | 'path' 
  | 'orbit' 
  | 'linear_speed'
  | 'steer_differential';

export interface StudioMovement {
  id: string;
  name: string;
  objectId: string;
  type: MovementType;
  enabled: boolean;
  parameters: {
    speed?: number;
    directionDeg?: number;
    targetObjectId?: string;
    centerPos?: Vector2D;
    radius?: number;
    rpm?: number;
    frequency?: number;
    amplitude?: number;
    axis?: 'x' | 'y' | 'both';
    pathPoints?: Vector2D[];
    lookAheadDist?: number;
  };
}

export interface ReactionAction {
  type: 
    | 'bounce' 
    | 'transform' 
    | 'change_state' 
    | 'emit_particles' 
    | 'play_sound' 
    | 'set_property' 
    | 'chemical_reaction' 
    | 'circuit_toggle' 
    | 'transfer_heat' 
    | 'destroy' 
    | 'stick' 
    | 'repel';
  params: Record<string, any>;
}

export interface StudioReaction {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: 'collision' | 'proximity' | 'condition' | 'state_change';
  sourceObjectId: string;
  targetObjectId?: string; // or '*' for any
  proximityDistance?: number;
  condition?: {
    property: string;
    operator: '>' | '<' | '==' | '>=' | '<=' | '!=';
    value: any;
  };
  actions: ReactionAction[];
}

export type LogicEventTrigger = 
  | 'on_start'
  | 'on_reset'
  | 'on_tick'
  | 'on_click'
  | 'on_drag'
  | 'on_collision'
  | 'on_proximity'
  | 'on_value_change'
  | 'on_sensor_detect'
  | 'on_state_change';

export interface LogicAction {
  id: string;
  action: 
    | 'set_variable'
    | 'set_property'
    | 'apply_force'
    | 'change_state'
    | 'rotate'
    | 'move_towards'
    | 'stop_motion'
    | 'emit_particles'
    | 'play_sound'
    | 'toggle_switch'
    | 'forward_packet'
    | 'drop_packet'
    | 'set_motor_speed'
    | 'reset_position';
  target: string; // variable ID or object ID
  value: any;
  duration?: number;
}

export interface StudioLogicRule {
  id: string;
  name: string;
  enabled: boolean;
  when: {
    trigger: LogicEventTrigger;
    objectId?: string;
    targetObjectId?: string;
    variableId?: string;
    threshold?: number;
  };
  ifCondition?: {
    left: string; // e.g. 'var:gravity' or 'obj:ball_1.y' or 'sensor:reading'
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
    right: string; // e.g. '100' or 'var:limit'
  };
  thenActions: LogicAction[];
  elseActions?: LogicAction[];
}

export interface StudioControl {
  id: string;
  type: 'slider' | 'toggle' | 'button' | 'number_input' | 'dropdown' | 'joystick' | 'dial' | 'stepper';
  label: string;
  boundVariableId: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  unit?: string;
  actionEventId?: string; // if type === 'button'
  x: number;
  y: number;
  width?: number;
}

export interface StudioGraph {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'scatter' | 'gauge';
  xSource: string; // 'time' or 'var:x' or 'obj:ball.x'
  ySource: string; // 'obj:ball.velocity.y' or 'var:temperature'
  xLabel?: string;
  yLabel?: string;
  color: string;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  dataPoints: { x: number; y: number }[];
  maxPoints: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface CustomComponentTemplate {
  id: string;
  name: string;
  subject: StudioSubject;
  icon: string;
  description: string;
  baseShape: ShapeType;
  defaultColor: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultProperties: CustomProperty[];
  defaultSubjectData?: Record<string, any>;
  defaultStates?: ObjectState[];
}

export type SimulationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'published';

export interface TeacherSimulationDefinition {
  id: string;
  title: string;
  slug: string;
  description: string;
  subject: StudioSubject;
  gradeLevel: 'K-2' | '3-5' | '6-8' | '9-12' | 'University';
  difficulty: 'Exploratory' | 'Introductory' | 'Intermediate' | 'Advanced';
  thumbnail?: string;
  authorId: string;
  authorName: string;
  status: SimulationStatus;
  reviewFeedback?: string;
  version: string;
  isTemplate?: boolean;

  canvas: {
    width: number;
    height: number;
    background: string;
    grid: boolean;
    gridSize: number;
    snapToGrid: boolean;
    coordinateSystem: 'screen' | 'cartesian' | 'geographic';
    showAxes?: boolean;
    origin: Vector2D;
    scale: number;
  };

  physics: {
    enabled: boolean;
    gravity: Vector2D;
    airResistance: number;
    timeScale: number;
    boundaryMode: 'bounce' | 'wrap' | 'none' | 'stop';
    enableCollisions: boolean;
  };

  objects: StudioObject[];
  variables: StudioVariable[];
  formulas: StudioFormula[];
  movements: StudioMovement[];
  reactions: StudioReaction[];
  logicRules: StudioLogicRule[];
  controls: StudioControl[];
  graphs: StudioGraph[];
  customComponents?: CustomComponentTemplate[];

  educationalGuide?: {
    learningGoals: string[];
    inquiryQuestions: string[];
    instructions: string;
    teacherNotes?: string;
  };

  createdAt: string;
  updatedAt: string;
}
