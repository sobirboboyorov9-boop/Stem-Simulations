import { TeacherSimulationDefinition } from '../types/simulationStudio.js';

export const STUDIO_STARTER_TEMPLATES: TeacherSimulationDefinition[] = [
  // 1. ⚛️ PHYSICS: Projectile Motion & Kinematics
  {
    id: 'template_physics_projectile',
    title: 'Kinematic Projectile Motion & Trajectory Analysis',
    slug: 'projectile-motion-analysis',
    description: 'Investigate how muzzle velocity, launch angle, and gravity affect projectile range, flight time, and maximum apogee.',
    subject: 'Physics',
    gradeLevel: '9-12',
    difficulty: 'Intermediate',
    authorId: 'system_template',
    authorName: 'STEM-Simulations Physics Team',
    status: 'published',
    version: '1.0.0',
    isTemplate: true,
    canvas: {
      width: 900,
      height: 520,
      background: '#0f172a',
      grid: true,
      gridSize: 30,
      snapToGrid: false,
      coordinateSystem: 'cartesian',
      showAxes: true,
      origin: { x: 80, y: 440 },
      scale: 1
    },
    physics: {
      enabled: true,
      gravity: { x: 0, y: 9.81 },
      airResistance: 0.01,
      timeScale: 1.0,
      boundaryMode: 'bounce',
      enableCollisions: true
    },
    objects: [
      {
        id: 'phys_ground',
        name: 'Ground Target Line',
        category: 'Terrain',
        subject: 'Physics',
        shape: 'rect',
        x: 450,
        y: 490,
        width: 900,
        height: 60,
        rotation: 0,
        scale: 1,
        color: '#1e293b',
        borderColor: '#334155',
        borderWidth: 2,
        opacity: 1,
        zIndex: 1,
        visible: true,
        mass: 99999,
        friction: 0.8,
        elasticity: 0.3,
        isStatic: true,
        isDraggable: false,
        charge: 0,
        temperature: 20,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        customProperties: []
      },
      {
        id: 'projectile_ball',
        name: 'Cannon Projectile',
        category: 'Mechanics',
        subject: 'Physics',
        shape: 'circle',
        x: 100,
        y: 430,
        width: 32,
        height: 32,
        rotation: 0,
        scale: 1,
        color: '#38bdf8',
        borderColor: '#0284c7',
        borderWidth: 2,
        opacity: 1,
        zIndex: 10,
        visible: true,
        mass: 2.0,
        friction: 0.1,
        elasticity: 0.65,
        isStatic: false,
        isDraggable: true,
        charge: 0,
        temperature: 25,
        velocity: { x: 22, y: -22 },
        acceleration: { x: 0, y: 9.81 },
        angularVelocity: 0,
        gravityScale: 1.0,
        trail: { enabled: true, color: '#38bdf8', maxPoints: 120 },
        showVectors: { velocity: true, acceleration: true },
        customProperties: [
          { key: 'apogeeM', label: 'Max Height (m)', type: 'number', value: 24.6, unit: 'm' },
          { key: 'flightTimeS', label: 'Flight Time (s)', type: 'number', value: 4.48, unit: 's' }
        ]
      },
      {
        id: 'target_bullseye',
        name: 'Landing Target',
        category: 'Mechanics',
        subject: 'Physics',
        shape: 'rounded_rect',
        x: 650,
        y: 455,
        width: 70,
        height: 16,
        rotation: 0,
        scale: 1,
        color: '#ef4444',
        borderColor: '#fca5a5',
        borderWidth: 2,
        opacity: 1,
        zIndex: 5,
        visible: true,
        mass: 1000,
        friction: 0.9,
        elasticity: 0.2,
        isStatic: true,
        isDraggable: true,
        charge: 0,
        temperature: 20,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        customProperties: []
      }
    ],
    variables: [
      {
        id: 'var_launch_speed',
        name: 'launchSpeed',
        label: 'Initial Muzzle Speed (v₀)',
        type: 'number',
        defaultValue: 25,
        value: 25,
        min: 5,
        max: 50,
        step: 1,
        unit: 'm/s',
        isEditable: true,
        description: 'Muzzle exit speed of the projectile.'
      },
      {
        id: 'var_launch_angle',
        name: 'launchAngle',
        label: 'Elevation Launch Angle (θ)',
        type: 'number',
        defaultValue: 45,
        value: 45,
        min: 5,
        max: 85,
        step: 1,
        unit: '°',
        isEditable: true,
        description: 'Angle above the horizontal ground.'
      },
      {
        id: 'var_gravity',
        name: 'gravity',
        label: 'Gravitational Field (g)',
        type: 'number',
        defaultValue: 9.81,
        value: 9.81,
        min: 1.62,
        max: 24.79,
        step: 0.1,
        unit: 'm/s²',
        isEditable: true,
        description: 'Planetary gravity (9.81 on Earth, 1.62 on Moon, 3.71 on Mars).'
      }
    ],
    formulas: [
      {
        id: 'form_vx',
        name: 'Calculate Vx',
        target: 'obj:projectile_ball.velocity.x',
        expression: 'var:launchSpeed * cos(var:launchAngle * pi / 180)',
        unit: 'm/s',
        isValid: true
      },
      {
        id: 'form_vy',
        name: 'Calculate Vy',
        target: 'obj:projectile_ball.velocity.y',
        expression: '-1 * var:launchSpeed * sin(var:launchAngle * pi / 180)',
        unit: 'm/s',
        isValid: true
      }
    ],
    movements: [],
    reactions: [
      {
        id: 'react_hit_target',
        name: 'Bullseye Impact Detection',
        enabled: true,
        triggerType: 'collision',
        sourceObjectId: 'projectile_ball',
        targetObjectId: 'target_bullseye',
        actions: [
          { type: 'emit_particles', params: { color: '#fbbf24', count: 30 } },
          { type: 'play_sound', params: { frequency: 660, type: 'sine' } }
        ]
      }
    ],
    logicRules: [
      {
        id: 'rule_reset_launch',
        name: 'Fire / Reset Cannon',
        enabled: true,
        when: { trigger: 'on_value_change', variableId: 'var_launch_speed' },
        thenActions: [
          { id: 'act_reset_ball', action: 'reset_position', target: 'projectile_ball', value: { x: 100, y: 430 } }
        ]
      }
    ],
    controls: [
      {
        id: 'ctrl_speed',
        type: 'slider',
        label: 'Launch Velocity (v₀)',
        boundVariableId: 'var_launch_speed',
        min: 5,
        max: 50,
        step: 1,
        unit: 'm/s',
        x: 20,
        y: 20
      },
      {
        id: 'ctrl_angle',
        type: 'slider',
        label: 'Launch Angle (θ)',
        boundVariableId: 'var_launch_angle',
        min: 10,
        max: 85,
        step: 1,
        unit: '°',
        x: 20,
        y: 80
      },
      {
        id: 'ctrl_gravity',
        type: 'slider',
        label: 'Planetary Gravity (g)',
        boundVariableId: 'var_gravity',
        min: 1.62,
        max: 24.79,
        step: 0.5,
        unit: 'm/s²',
        x: 20,
        y: 140
      }
    ],
    graphs: [
      {
        id: 'graph_height_time',
        title: 'Vertical Height (Y) vs Time',
        type: 'line',
        xSource: 'time',
        ySource: 'obj:projectile_ball.y',
        xLabel: 'Time (s)',
        yLabel: 'Altitude (m)',
        color: '#38bdf8',
        dataPoints: [],
        maxPoints: 80
      }
    ],
    educationalGuide: {
      learningGoals: [
        'Determine how launch angle influences horizontal displacement (range) and apex height.',
        'Verify that horizontal velocity remains constant in the absence of air resistance.',
        'Predict the optimal angle for maximum range under varying gravitational fields.'
      ],
      inquiryQuestions: [
        'Which angle produces maximum horizontal range on Earth?',
        'If you double the launch speed, by what factor does the total range increase?'
      ],
      instructions: 'Adjust the launch angle and muzzle speed sliders, then press Play to observe the trajectory arc and vector arrows.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 2. 🤖 ROBOTICS: Obstacle Avoidance Autonomous Rover
  {
    id: 'template_robotics_rover',
    title: 'Autonomous Mobile Rover with Ultrasonic Obstacle Avoidance',
    slug: 'robotics-obstacle-avoidance-rover',
    description: 'Design autonomous decision logic for a 2-wheel differential drive rover using ultrasonic sonar distance readings.',
    subject: 'Robotics',
    gradeLevel: '9-12',
    difficulty: 'Intermediate',
    authorId: 'system_template',
    authorName: 'STEM-Simulations Robotics Lab',
    status: 'published',
    version: '1.0.0',
    isTemplate: true,
    canvas: {
      width: 900,
      height: 520,
      background: '#090d16',
      grid: true,
      gridSize: 40,
      snapToGrid: false,
      coordinateSystem: 'screen',
      origin: { x: 0, y: 0 },
      scale: 1
    },
    physics: {
      enabled: true,
      gravity: { x: 0, y: 0 },
      airResistance: 0.05,
      timeScale: 1.0,
      boundaryMode: 'bounce',
      enableCollisions: true
    },
    objects: [
      {
        id: 'rover_main',
        name: 'Autonomous Rover Chassis',
        category: 'Robots',
        subject: 'Robotics',
        shape: 'rounded_rect',
        x: 180,
        y: 260,
        width: 75,
        height: 65,
        rotation: 0,
        scale: 1,
        color: '#0284c7',
        borderColor: '#38bdf8',
        borderWidth: 3,
        opacity: 1,
        zIndex: 10,
        visible: true,
        mass: 4.0,
        friction: 0.2,
        elasticity: 0.4,
        isStatic: false,
        isDraggable: true,
        charge: 0,
        temperature: 25,
        velocity: { x: 40, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        subjectData: {
          motorSpeedLeft: 60,
          motorSpeedRight: 60,
          sensorType: 'ultrasonic',
          sensorRange: 220,
          sensorFOV: 40,
          sensorReading: 180,
          isAutonomous: true
        },
        customProperties: [
          { key: 'stateMode', label: 'Behavior State', type: 'string', value: 'Cruising' },
          { key: 'obstacleDistanceCm', label: 'Sonar Distance (cm)', type: 'number', value: 180, unit: 'cm' }
        ],
        states: [
          { id: 'cruising', name: 'Cruising Forward', color: '#0284c7' },
          { id: 'avoiding', name: 'Obstacle Detected - Steering', color: '#f59e0b' },
          { id: 'reversing', name: 'Collision Proximity - Reverse', color: '#ef4444' }
        ],
        trail: { enabled: true, color: '#38bdf8', maxPoints: 90 }
      },
      {
        id: 'obstacle_1',
        name: 'Pillar Obstacle A',
        category: 'Sensors',
        subject: 'Robotics',
        shape: 'rounded_rect',
        x: 480,
        y: 260,
        width: 60,
        height: 80,
        rotation: 0,
        scale: 1,
        color: '#e11d48',
        borderColor: '#fda4af',
        borderWidth: 2,
        opacity: 1,
        zIndex: 5,
        visible: true,
        mass: 99999,
        friction: 0.9,
        elasticity: 0.5,
        isStatic: true,
        isDraggable: true,
        charge: 0,
        temperature: 20,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        customProperties: []
      },
      {
        id: 'obstacle_2',
        name: 'Pillar Obstacle B',
        category: 'Sensors',
        subject: 'Robotics',
        shape: 'circle',
        x: 700,
        y: 160,
        width: 70,
        height: 70,
        rotation: 0,
        scale: 1,
        color: '#d97706',
        borderColor: '#fde68a',
        borderWidth: 2,
        opacity: 1,
        zIndex: 5,
        visible: true,
        mass: 99999,
        friction: 0.9,
        elasticity: 0.5,
        isStatic: true,
        isDraggable: true,
        charge: 0,
        temperature: 20,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        customProperties: []
      }
    ],
    variables: [
      {
        id: 'var_sonar_threshold',
        name: 'sonarThreshold',
        label: 'Safety Threshold Distance',
        type: 'number',
        defaultValue: 100,
        value: 100,
        min: 30,
        max: 200,
        step: 5,
        unit: 'cm',
        isEditable: true,
        description: 'Distance at which rover initiates avoidance maneuver.'
      },
      {
        id: 'var_cruise_speed',
        name: 'cruiseSpeed',
        label: 'Forward Speed',
        type: 'number',
        defaultValue: 60,
        value: 60,
        min: 10,
        max: 100,
        step: 5,
        unit: '%',
        isEditable: true,
        description: 'Base motor PWM percentage.'
      }
    ],
    formulas: [],
    movements: [
      {
        id: 'move_rover',
        name: 'Differential Forward Drive',
        objectId: 'rover_main',
        type: 'kinematic',
        enabled: true,
        parameters: { speed: 45 }
      }
    ],
    reactions: [
      {
        id: 'react_bump',
        name: 'Bumper Physical Collision',
        enabled: true,
        triggerType: 'collision',
        sourceObjectId: 'rover_main',
        targetObjectId: 'obstacle_1',
        actions: [
          { type: 'bounce', params: { factor: 1.0 } },
          { type: 'emit_particles', params: { color: '#f59e0b', count: 15 } }
        ]
      }
    ],
    logicRules: [
      {
        id: 'rule_avoidance_trigger',
        name: 'WHEN Sensor < Safety Threshold THEN Turn',
        enabled: true,
        when: { trigger: 'on_sensor_detect', objectId: 'rover_main', threshold: 100 },
        ifCondition: { left: 'sensor:reading', operator: '<', right: '100' },
        thenActions: [
          { id: 'act_rover_avoid', action: 'change_state', target: 'rover_main', value: 'avoiding' },
          { id: 'act_rover_turn', action: 'rotate', target: 'rover_main', value: 45, duration: 0.5 }
        ],
        elseActions: [
          { id: 'act_rover_cruise', action: 'change_state', target: 'rover_main', value: 'cruising' }
        ]
      }
    ],
    controls: [
      {
        id: 'ctrl_threshold',
        type: 'slider',
        label: 'Obstacle Distance Threshold (cm)',
        boundVariableId: 'var_sonar_threshold',
        min: 40,
        max: 180,
        step: 5,
        unit: 'cm',
        x: 20,
        y: 20
      },
      {
        id: 'ctrl_speed',
        type: 'slider',
        label: 'Motor Drive Speed (%)',
        boundVariableId: 'var_cruise_speed',
        min: 20,
        max: 100,
        step: 5,
        unit: '%',
        x: 20,
        y: 80
      }
    ],
    graphs: [
      {
        id: 'graph_sensor_distance',
        title: 'Sonar Sensor Distance (cm)',
        type: 'line',
        xSource: 'time',
        ySource: 'obj:rover_main.customProperties.obstacleDistanceCm',
        xLabel: 'Time (s)',
        yLabel: 'Distance (cm)',
        color: '#f59e0b',
        dataPoints: [],
        maxPoints: 80
      }
    ],
    educationalGuide: {
      learningGoals: [
        'Understand closed-loop sensor-actuator feedback control in autonomous robotics.',
        'Implement condition-action rules using ultrasonic sensor distance triggers.',
        'Tune safety thresholds to prevent high-speed cornering collisions.'
      ],
      inquiryQuestions: [
        'How does increasing the cruise speed affect the required safety distance threshold?',
        'Why does a differential drive turn when the left motor speed differs from the right?'
      ],
      instructions: 'Drag obstacles across the arena and adjust the safety threshold slider to observe autonomous evasion steering.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 3. 🧪 CHEMISTRY: Acid-Base Titration & pH Neutralization
  {
    id: 'template_chemistry_titration',
    title: 'Acid-Base Titration & Neutralization Equivalence',
    slug: 'acid-base-titration-equivalence',
    description: 'Titrate 0.1M HCl with 0.1M NaOH and monitor colorimetric indicator transitions at the pH 7.0 equivalence point.',
    subject: 'Chemistry',
    gradeLevel: '9-12',
    difficulty: 'Intermediate',
    authorId: 'system_template',
    authorName: 'STEM-Simulations Chemistry Faculty',
    status: 'published',
    version: '1.0.0',
    isTemplate: true,
    canvas: {
      width: 900,
      height: 520,
      background: '#0b1329',
      grid: false,
      gridSize: 20,
      snapToGrid: false,
      coordinateSystem: 'screen',
      origin: { x: 0, y: 0 },
      scale: 1
    },
    physics: {
      enabled: false,
      gravity: { x: 0, y: 0 },
      airResistance: 0,
      timeScale: 1.0,
      boundaryMode: 'none',
      enableCollisions: false
    },
    objects: [
      {
        id: 'chem_erlenmeyer',
        name: 'Reaction Flask (HCl)',
        category: 'Glassware',
        subject: 'Chemistry',
        shape: 'rounded_rect',
        x: 450,
        y: 360,
        width: 170,
        height: 180,
        rotation: 0,
        scale: 1,
        color: 'rgba(239, 68, 68, 0.45)',
        borderColor: '#ef4444',
        borderWidth: 3,
        opacity: 0.9,
        zIndex: 5,
        visible: true,
        mass: 1,
        friction: 0.5,
        elasticity: 0,
        isStatic: true,
        isDraggable: false,
        charge: 0,
        temperature: 25,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        subjectData: {
          formula: 'HCl',
          volumeMl: 50,
          concentrationMolar: 0.1,
          pH: 1.0,
          colorIndicator: 'phenolphthalein'
        },
        customProperties: [
          { key: 'solutionVolumeMl', label: 'Total Volume (mL)', type: 'number', value: 50, unit: 'mL' },
          { key: 'currentPh', label: 'Solution pH', type: 'number', value: 1.0, min: 0, max: 14 }
        ],
        states: [
          { id: 'acidic', name: 'Colorless (Acidic pH < 8.2)', color: 'rgba(239, 68, 68, 0.45)' },
          { id: 'equivalent', name: 'Faint Pink (Equivalence Point pH 7-8)', color: 'rgba(244, 114, 182, 0.65)' },
          { id: 'basic', name: 'Vibrant Magenta (Basic pH > 9)', color: 'rgba(219, 39, 119, 0.85)' }
        ]
      },
      {
        id: 'chem_buret_tube',
        name: 'Titration Burette (0.1M NaOH)',
        category: 'Glassware',
        subject: 'Chemistry',
        shape: 'rect',
        x: 450,
        y: 120,
        width: 36,
        height: 200,
        rotation: 0,
        scale: 1,
        color: 'rgba(56, 189, 248, 0.3)',
        borderColor: '#0284c7',
        borderWidth: 2,
        opacity: 0.95,
        zIndex: 8,
        visible: true,
        mass: 1,
        friction: 0,
        elasticity: 0,
        isStatic: true,
        isDraggable: false,
        charge: 0,
        temperature: 25,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        customProperties: [
          { key: 'titrantDispensedMl', label: 'NaOH Added (mL)', type: 'number', value: 0, unit: 'mL' }
        ]
      }
    ],
    variables: [
      {
        id: 'var_naoh_added',
        name: 'naohVolume',
        label: 'Volume of 0.1M NaOH Added (mL)',
        type: 'number',
        defaultValue: 0,
        value: 0,
        min: 0,
        max: 100,
        step: 0.5,
        unit: 'mL',
        isEditable: true,
        description: 'Volume of base delivered from the burette.'
      },
      {
        id: 'var_initial_acid_vol',
        name: 'acidVolume',
        label: 'Initial HCl Sample Volume (mL)',
        type: 'number',
        defaultValue: 50,
        value: 50,
        min: 10,
        max: 100,
        step: 5,
        unit: 'mL',
        isEditable: true,
        description: 'Sample volume of 0.1M HCl.'
      }
    ],
    formulas: [
      {
        id: 'form_titration_ph',
        name: 'Titration Curve Equation',
        target: 'obj:chem_erlenmeyer.customProperties.currentPh',
        expression: 'var:naohVolume < 50 ? 1 - log10(max(0.0001, (50 - var:naohVolume) / (50 + var:naohVolume))) : (var:naohVolume == 50 ? 7 : 14 + log10(max(0.0001, (var:naohVolume - 50) / (50 + var:naohVolume))))',
        unit: 'pH',
        isValid: true
      }
    ],
    movements: [],
    reactions: [],
    logicRules: [
      {
        id: 'rule_indicator_color',
        name: 'Phenolphthalein Color Shift',
        enabled: true,
        when: { trigger: 'on_value_change', variableId: 'var_naoh_added' },
        ifCondition: { left: 'var:naohVolume', operator: '>=', right: '50' },
        thenActions: [
          { id: 'act_chem_equiv', action: 'change_state', target: 'chem_erlenmeyer', value: 'equivalent' },
          { id: 'act_chem_pink', action: 'emit_particles', target: 'chem_erlenmeyer', value: { color: '#ec4899', count: 12 } }
        ],
        elseActions: [
          { id: 'act_chem_acid', action: 'change_state', target: 'chem_erlenmeyer', value: 'acidic' }
        ]
      }
    ],
    controls: [
      {
        id: 'ctrl_titrant_slider',
        type: 'slider',
        label: 'Dispense 0.1M NaOH Titrant (mL)',
        boundVariableId: 'var_naoh_added',
        min: 0,
        max: 100,
        step: 0.5,
        unit: 'mL',
        x: 20,
        y: 20
      }
    ],
    graphs: [
      {
        id: 'graph_titration_curve',
        title: 'Titration Curve (pH vs Titrant Volume)',
        type: 'line',
        xSource: 'var:naohVolume',
        ySource: 'obj:chem_erlenmeyer.customProperties.currentPh',
        xLabel: 'NaOH Volume (mL)',
        yLabel: 'pH Value',
        color: '#ec4899',
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 14,
        dataPoints: [],
        maxPoints: 100
      }
    ],
    educationalGuide: {
      learningGoals: [
        'Analyze how neutralization produces a steep sigmoidal pH titration curve near the equivalence point.',
        'Relate hydronium [H₃O⁺] and hydroxide [OH⁻] molar concentrations to solution pH.',
        'Identify indicator transition intervals for phenolphthalein.'
      ],
      inquiryQuestions: [
        'Why does the pH jump so rapidly between 48 mL and 52 mL of titrant?',
        'What volume of 0.1M NaOH is strictly required to neutralize 50 mL of 0.1M HCl?'
      ],
      instructions: 'Use the titrant slider to add NaOH dropwise and observe the flask state transition at 50 mL equivalence.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 4. 🧬 BIOLOGY: Cell Membrane Osmosis & Diffusion
  {
    id: 'template_biology_osmosis',
    title: 'Cell Membrane Osmosis & Turgor Pressure',
    slug: 'cell-membrane-osmosis-diffusion',
    description: 'Observe water transport across semipermeable lipid bilayers into hypertonic, isotonic, and hypotonic extracellular solutions.',
    subject: 'Biology',
    gradeLevel: '9-12',
    difficulty: 'Intermediate',
    authorId: 'system_template',
    authorName: 'STEM-Simulations Biology Team',
    status: 'published',
    version: '1.0.0',
    isTemplate: true,
    canvas: {
      width: 900,
      height: 520,
      background: '#064e3b',
      grid: false,
      gridSize: 30,
      snapToGrid: false,
      coordinateSystem: 'screen',
      origin: { x: 0, y: 0 },
      scale: 1
    },
    physics: {
      enabled: true,
      gravity: { x: 0, y: 0 },
      airResistance: 0.02,
      timeScale: 1.0,
      boundaryMode: 'bounce',
      enableCollisions: true
    },
    objects: [
      {
        id: 'cell_body',
        name: 'Semi-Permeable Cell Body',
        category: 'Cellular',
        subject: 'Biology',
        shape: 'rounded_rect',
        x: 450,
        y: 260,
        width: 240,
        height: 200,
        rotation: 0,
        scale: 1,
        color: '#059669',
        borderColor: '#34d399',
        borderWidth: 4,
        opacity: 0.8,
        zIndex: 5,
        visible: true,
        mass: 99999,
        friction: 0.2,
        elasticity: 0.9,
        isStatic: true,
        isDraggable: false,
        charge: 0,
        temperature: 37,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        subjectData: {
          cellType: 'Plant Cell',
          membranePermeability: 0.8,
          health: 100
        },
        customProperties: [
          { key: 'turgorPressureKPa', label: 'Turgor Pressure (kPa)', type: 'number', value: 120, unit: 'kPa' },
          { key: 'cellVolumeRatio', label: 'Volume Index (%)', type: 'number', value: 100, unit: '%' }
        ],
        states: [
          { id: 'turgid', name: 'Turgid (Hypotonic)', color: '#10b981' },
          { id: 'flaccid', name: 'Isotonic Equilibrium', color: '#059669' },
          { id: 'plasmolyzed', name: 'Plasmolyzed (Hypertonic)', color: '#047857' }
        ]
      }
    ],
    variables: [
      {
        id: 'var_external_solute',
        name: 'extSolute',
        label: 'Extracellular Solute Molarity (M)',
        type: 'number',
        defaultValue: 0.3,
        value: 0.3,
        min: 0.05,
        max: 1.0,
        step: 0.05,
        unit: 'mol/L',
        isEditable: true,
        description: 'Solute concentration in external bath solution.'
      }
    ],
    formulas: [
      {
        id: 'form_turgor',
        name: 'Osmotic Turgor Equation',
        target: 'obj:cell_body.customProperties.turgorPressureKPa',
        expression: 'max(10, 250 * (0.3 / var:extSolute))',
        unit: 'kPa',
        isValid: true
      }
    ],
    movements: [],
    reactions: [],
    logicRules: [],
    controls: [
      {
        id: 'ctrl_solute_slider',
        type: 'slider',
        label: 'External Solute Concentration (M)',
        boundVariableId: 'var_external_solute',
        min: 0.05,
        max: 1.0,
        step: 0.05,
        unit: 'M',
        x: 20,
        y: 20
      }
    ],
    graphs: [
      {
        id: 'graph_turgor',
        title: 'Turgor Pressure vs External Solute',
        type: 'line',
        xSource: 'var:extSolute',
        ySource: 'obj:cell_body.customProperties.turgorPressureKPa',
        xLabel: 'Extracellular Solute (M)',
        yLabel: 'Turgor Pressure (kPa)',
        color: '#34d399',
        dataPoints: [],
        maxPoints: 60
      }
    ],
    educationalGuide: {
      learningGoals: [
        'Differentiate between hypertonic, hypotonic, and isotonic cellular environments.',
        'Observe how water flows down its chemical potential gradient across semipermeable membranes.'
      ],
      inquiryQuestions: [
        'What happens to plant turgor pressure when external salinity increases?'
      ],
      instructions: 'Modify extracellular solute concentration to simulate freshwater vs saline environments.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 5. 🌍 GEOGRAPHY: Plate Tectonics & Volcanic Pressure
  {
    id: 'template_geography_tectonics',
    title: 'Plate Tectonics, Magma Chamber & Volcanic Eruptions',
    slug: 'tectonic-plate-volcanic-eruption',
    description: 'Simulate convergent subduction zones, magma accumulation, and explosive eruption thresholds.',
    subject: 'Geography',
    gradeLevel: '6-8',
    difficulty: 'Introductory',
    authorId: 'system_template',
    authorName: 'STEM-Simulations Geography Team',
    status: 'published',
    version: '1.0.0',
    isTemplate: true,
    canvas: {
      width: 900,
      height: 520,
      background: '#451a03',
      grid: false,
      gridSize: 30,
      snapToGrid: false,
      coordinateSystem: 'screen',
      origin: { x: 0, y: 0 },
      scale: 1
    },
    physics: {
      enabled: false,
      gravity: { x: 0, y: 0 },
      airResistance: 0,
      timeScale: 1.0,
      boundaryMode: 'none',
      enableCollisions: false
    },
    objects: [
      {
        id: 'geo_volcano_cone',
        name: 'Stratovolcano Cone',
        category: 'Terrain',
        subject: 'Geography',
        shape: 'triangle',
        x: 450,
        y: 280,
        width: 280,
        height: 220,
        rotation: 0,
        scale: 1,
        color: '#78350f',
        borderColor: '#b91c1c',
        borderWidth: 3,
        opacity: 1,
        zIndex: 5,
        visible: true,
        mass: 1,
        friction: 0,
        elasticity: 0,
        isStatic: true,
        isDraggable: false,
        charge: 0,
        temperature: 1100,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        subjectData: {
          magmaPressure: 40,
          elevation: 3200
        },
        customProperties: [
          { key: 'chamberPressureMPa', label: 'Magma Chamber Pressure', type: 'number', value: 40, min: 0, max: 120, unit: 'MPa' }
        ],
        states: [
          { id: 'dormant', name: 'Dormant (P < 50 MPa)', color: '#78350f' },
          { id: 'unrest', name: 'Volcanic Unrest (50-85 MPa)', color: '#991b1b' },
          { id: 'erupting', name: 'Explosive Eruption (> 85 MPa)', color: '#dc2626' }
        ]
      }
    ],
    variables: [
      {
        id: 'var_subduction_rate',
        name: 'subductionSpeed',
        label: 'Tectonic Convergence Rate (cm/yr)',
        type: 'number',
        defaultValue: 6,
        value: 6,
        min: 1,
        max: 15,
        step: 1,
        unit: 'cm/yr',
        isEditable: true,
        description: 'Rate of oceanic plate subduction into the asthenosphere.'
      }
    ],
    formulas: [
      {
        id: 'form_magma_pressure',
        name: 'Subduction Pressure Build-up',
        target: 'obj:geo_volcano_cone.customProperties.chamberPressureMPa',
        expression: 'var:subductionSpeed * 12',
        unit: 'MPa',
        isValid: true
      }
    ],
    movements: [],
    reactions: [],
    logicRules: [
      {
        id: 'rule_eruption_alert',
        name: 'Trigger Eruption above 85 MPa',
        enabled: true,
        when: { trigger: 'on_value_change', variableId: 'var_subduction_rate' },
        ifCondition: { left: 'var:subductionSpeed', operator: '>=', right: '8' },
        thenActions: [
          { id: 'act_erupt_1', action: 'change_state', target: 'geo_volcano_cone', value: 'erupting' },
          { id: 'act_erupt_2', action: 'emit_particles', target: 'geo_volcano_cone', value: { color: '#f97316', count: 40 } }
        ],
        elseActions: [
          { id: 'act_erupt_3', action: 'change_state', target: 'geo_volcano_cone', value: 'dormant' }
        ]
      }
    ],
    controls: [
      {
        id: 'ctrl_subduction_slider',
        type: 'slider',
        label: 'Plate Subduction Speed (cm/yr)',
        boundVariableId: 'var_subduction_rate',
        min: 1,
        max: 15,
        step: 1,
        unit: 'cm/yr',
        x: 20,
        y: 20
      }
    ],
    graphs: [],
    educationalGuide: {
      learningGoals: [
        'Explain how subducting tectonic plates melt to generate volatile-rich magma chambers.',
        'Connect plate movement velocity with volcanic eruption frequencies.'
      ],
      inquiryQuestions: [
        'Why do convergent plate boundaries produce more explosive eruptions than divergent ridges?'
      ],
      instructions: 'Increase subduction velocity above 8 cm/yr to trigger the explosive eruption threshold.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 6. 💻 COMPUTER SCIENCE: Packet Routing & Network Firewall
  {
    id: 'template_cs_firewall_routing',
    title: 'Network Packet Routing & Stateful Firewall Inspection',
    slug: 'network-packet-routing-firewall',
    description: 'Trace TCP/IP packet transmission across routers and enforce security firewall filtering rules.',
    subject: 'Computer Science',
    gradeLevel: '9-12',
    difficulty: 'Intermediate',
    authorId: 'system_template',
    authorName: 'STEM-Simulations CS Department',
    status: 'published',
    version: '1.0.0',
    isTemplate: true,
    canvas: {
      width: 900,
      height: 520,
      background: '#020617',
      grid: true,
      gridSize: 30,
      snapToGrid: false,
      coordinateSystem: 'screen',
      origin: { x: 0, y: 0 },
      scale: 1
    },
    physics: {
      enabled: false,
      gravity: { x: 0, y: 0 },
      airResistance: 0,
      timeScale: 1.0,
      boundaryMode: 'none',
      enableCollisions: false
    },
    objects: [
      {
        id: 'cs_client_pc',
        name: 'Client Workstation',
        category: 'Networking',
        subject: 'Computer Science',
        shape: 'rounded_rect',
        x: 120,
        y: 260,
        width: 80,
        height: 70,
        rotation: 0,
        scale: 1,
        color: '#1e293b',
        borderColor: '#38bdf8',
        borderWidth: 2,
        opacity: 1,
        zIndex: 5,
        visible: true,
        mass: 1,
        friction: 0,
        elasticity: 0,
        isStatic: true,
        isDraggable: false,
        charge: 0,
        temperature: 20,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        customProperties: [
          { key: 'ip', label: 'IP Address', type: 'string', value: '192.168.1.10' }
        ]
      },
      {
        id: 'cs_firewall_node',
        name: 'Stateful Firewall Gate',
        category: 'Networking',
        subject: 'Computer Science',
        shape: 'rounded_rect',
        x: 450,
        y: 260,
        width: 50,
        height: 140,
        rotation: 0,
        scale: 1,
        color: '#991b1b',
        borderColor: '#f87171',
        borderWidth: 3,
        opacity: 0.9,
        zIndex: 8,
        visible: true,
        mass: 1,
        friction: 0,
        elasticity: 0,
        isStatic: true,
        isDraggable: false,
        charge: 0,
        temperature: 20,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        customProperties: [
          { key: 'isPort80Allowed', label: 'Port 80 (HTTP) Open', type: 'boolean', value: true },
          { key: 'isPort22Allowed', label: 'Port 22 (SSH) Open', type: 'boolean', value: false }
        ],
        states: [
          { id: 'allowing', name: 'Traffic Allowed', color: '#16a34a' },
          { id: 'blocking', name: 'Traffic Dropped / Blocked', color: '#991b1b' }
        ]
      },
      {
        id: 'cs_dest_server',
        name: 'Production Cloud Server',
        category: 'Networking',
        subject: 'Computer Science',
        shape: 'rect',
        x: 780,
        y: 260,
        width: 85,
        height: 100,
        rotation: 0,
        scale: 1,
        color: '#1e293b',
        borderColor: '#10b981',
        borderWidth: 2,
        opacity: 1,
        zIndex: 5,
        visible: true,
        mass: 1,
        friction: 0,
        elasticity: 0,
        isStatic: true,
        isDraggable: false,
        charge: 0,
        temperature: 20,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        customProperties: [
          { key: 'ip', label: 'Destination IP', type: 'string', value: '10.0.0.1' }
        ]
      }
    ],
    variables: [
      {
        id: 'var_packet_port',
        name: 'packetPort',
        label: 'Destination Port Number',
        type: 'select',
        defaultValue: '80',
        value: '80',
        options: ['80', '443', '22', '3306', '8080'],
        isEditable: true,
        description: 'Target TCP port on server.'
      }
    ],
    formulas: [],
    movements: [],
    reactions: [],
    logicRules: [
      {
        id: 'rule_firewall_filter',
        name: 'Firewall Port Filter Inspection',
        enabled: true,
        when: { trigger: 'on_value_change', variableId: 'var_packet_port' },
        ifCondition: { left: 'var:packetPort', operator: '==', right: '80' },
        thenActions: [
          { id: 'act_fw_allow', action: 'change_state', target: 'cs_firewall_node', value: 'allowing' }
        ],
        elseActions: [
          { id: 'act_fw_block', action: 'change_state', target: 'cs_firewall_node', value: 'blocking' }
        ]
      }
    ],
    controls: [
      {
        id: 'ctrl_port_dropdown',
        type: 'dropdown',
        label: 'Target Destination Port',
        boundVariableId: 'var_packet_port',
        options: ['80 (HTTP)', '443 (HTTPS)', '22 (SSH)', '3306 (MySQL)'],
        x: 20,
        y: 20
      }
    ],
    graphs: [],
    educationalGuide: {
      learningGoals: [
        'Understand OSI Layer 3/4 packet routing and access control lists (ACLs).',
        'Simulate how firewalls inspect transport headers and enforce security policies.'
      ],
      inquiryQuestions: [
        'Why should port 22 (SSH) never be left exposed without strict firewall rules?'
      ],
      instructions: 'Switch target port between 80 (allowed) and other ports (blocked) to observe firewall state.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 7. 📐 MATHEMATICS: Quadratic Function & Parabola Explorer
  {
    id: 'template_math_quadratic',
    title: 'Quadratic Functions, Parabola Roots & Vertex Transformations',
    slug: 'quadratic-function-parabola-explorer',
    description: 'Explore the vertex form and standard form y = ax² + bx + c, calculating the discriminant (Δ = b² - 4ac) and real roots.',
    subject: 'Mathematics',
    gradeLevel: '9-12',
    difficulty: 'Intermediate',
    authorId: 'system_template',
    authorName: 'STEM-Simulations Mathematics Group',
    status: 'published',
    version: '1.0.0',
    isTemplate: true,
    canvas: {
      width: 900,
      height: 520,
      background: '#090d16',
      grid: true,
      gridSize: 30,
      snapToGrid: false,
      coordinateSystem: 'cartesian',
      showAxes: true,
      origin: { x: 450, y: 260 },
      scale: 1
    },
    physics: {
      enabled: false,
      gravity: { x: 0, y: 0 },
      airResistance: 0,
      timeScale: 1.0,
      boundaryMode: 'none',
      enableCollisions: false
    },
    objects: [
      {
        id: 'math_vertex_point',
        name: 'Parabola Vertex (h, k)',
        category: 'Functions',
        subject: 'Mathematics',
        shape: 'circle',
        x: 450,
        y: 260,
        width: 20,
        height: 20,
        rotation: 0,
        scale: 1,
        color: '#f43f5e',
        borderColor: '#ffe4e6',
        borderWidth: 2,
        opacity: 1,
        zIndex: 10,
        visible: true,
        mass: 1,
        friction: 0,
        elasticity: 0,
        isStatic: true,
        isDraggable: true,
        charge: 0,
        temperature: 20,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        angularVelocity: 0,
        gravityScale: 0,
        customProperties: [
          { key: 'discriminant', label: 'Discriminant (Δ)', type: 'number', value: 0 },
          { key: 'rootCount', label: 'Real Roots', type: 'number', value: 1 }
        ]
      }
    ],
    variables: [
      {
        id: 'var_coeff_a',
        name: 'coeffA',
        label: 'Leading Coefficient (a)',
        type: 'number',
        defaultValue: 1.0,
        value: 1.0,
        min: -5.0,
        max: 5.0,
        step: 0.1,
        isEditable: true,
        description: 'Governs vertical stretch, compression, and reflection across the x-axis.'
      },
      {
        id: 'var_coeff_b',
        name: 'coeffB',
        label: 'Linear Coefficient (b)',
        type: 'number',
        defaultValue: 0.0,
        value: 0.0,
        min: -10.0,
        max: 10.0,
        step: 0.5,
        isEditable: true,
        description: 'Shifts the axis of symmetry x = -b / (2a).'
      },
      {
        id: 'var_coeff_c',
        name: 'coeffC',
        label: 'Vertical Intercept (c)',
        type: 'number',
        defaultValue: 0.0,
        value: 0.0,
        min: -10.0,
        max: 10.0,
        step: 0.5,
        isEditable: true,
        description: 'The y-intercept of the parabola (0, c).'
      }
    ],
    formulas: [
      {
        id: 'form_discriminant',
        name: 'Discriminant Formula',
        target: 'obj:math_vertex_point.customProperties.discriminant',
        expression: 'var:coeffB * var:coeffB - 4 * var:coeffA * var:coeffC',
        unit: 'Δ',
        isValid: true
      }
    ],
    movements: [],
    reactions: [],
    logicRules: [],
    controls: [
      {
        id: 'ctrl_a',
        type: 'slider',
        label: 'Leading Coefficient (a)',
        boundVariableId: 'var_coeff_a',
        min: -5.0,
        max: 5.0,
        step: 0.1,
        x: 20,
        y: 20
      },
      {
        id: 'ctrl_b',
        type: 'slider',
        label: 'Linear Term (b)',
        boundVariableId: 'var_coeff_b',
        min: -10.0,
        max: 10.0,
        step: 0.5,
        x: 20,
        y: 80
      },
      {
        id: 'ctrl_c',
        type: 'slider',
        label: 'Constant Term (c)',
        boundVariableId: 'var_coeff_c',
        min: -10.0,
        max: 10.0,
        step: 0.5,
        x: 20,
        y: 140
      }
    ],
    graphs: [
      {
        id: 'graph_parabola',
        title: 'f(x) = ax² + bx + c',
        type: 'line',
        xSource: 'var:x',
        ySource: 'var:y',
        xLabel: 'x',
        yLabel: 'f(x)',
        color: '#06b6d4',
        dataPoints: [],
        maxPoints: 80
      }
    ],
    educationalGuide: {
      learningGoals: [
        'Understand how coefficient (a) determines curvature and concavity.',
        'Relate the sign of the discriminant (Δ = b² - 4ac) to the number of real roots (0, 1, or 2).'
      ],
      inquiryQuestions: [
        'What happens to the parabola when a = 0?',
        'How does changing c translate the curve vertically?'
      ],
      instructions: 'Manipulate coefficients a, b, and c to observe real-time transformations and root counts.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const STARTER_TEMPLATES = STUDIO_STARTER_TEMPLATES;
