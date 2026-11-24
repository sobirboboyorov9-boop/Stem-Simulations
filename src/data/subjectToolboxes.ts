import { StudioSubject, CustomComponentTemplate, ShapeType } from '../types/simulationStudio.js';

export interface ToolboxCategory {
  id: string;
  name: string;
  icon: string;
  components: ToolboxComponent[];
}

export interface ToolboxComponent {
  id: string;
  name: string;
  category: string;
  subject: StudioSubject | 'Universal';
  icon: string;
  description: string;
  shape: ShapeType;
  defaultColor: string;
  borderColor?: string;
  width: number;
  height: number;
  defaultWidth?: number;
  defaultHeight?: number;
  mass?: number;
  elasticity?: number;
  friction?: number;
  rotation?: number;
  isStatic?: boolean;
  isDraggable?: boolean;
  charge?: number;
  temperature?: number;
  subjectData?: Record<string, any>;
  customProperties?: Array<{
    key: string;
    label: string;
    type: 'number' | 'string' | 'boolean' | 'color';
    value: any;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
    description?: string;
  }>;
  states?: Array<{ id: string; name: string; color?: string; properties?: Record<string, any> }>;
}

export const UNIVERSAL_COMPONENTS: ToolboxComponent[] = [
  {
    id: 'uni_text_label',
    name: 'Text Label',
    category: 'Universal',
    subject: 'Universal',
    icon: 'Type',
    description: 'Dynamic text label bound to variables or instructional notes.',
    shape: 'rect',
    defaultColor: 'rgba(255,255,255,0.9)',
    borderColor: '#cbd5e1',
    width: 140,
    height: 36,
    isStatic: true,
    isDraggable: true,
    customProperties: [
      { key: 'text', label: 'Display Text', type: 'string', value: 'Observation Note' },
      { key: 'fontSize', label: 'Font Size (px)', type: 'number', value: 14 }
    ]
  },
  {
    id: 'uni_probe_meter',
    name: 'Measurement Probe',
    category: 'Universal',
    subject: 'Universal',
    icon: 'Gauge',
    description: 'Draggable sensor probe that measures local field, temperature, velocity, or concentration.',
    shape: 'rounded_rect',
    defaultColor: '#1e293b',
    borderColor: '#38bdf8',
    width: 90,
    height: 50,
    isStatic: true,
    isDraggable: true,
    customProperties: [
      { key: 'targetMetric', label: 'Measured Metric', type: 'string', value: 'Velocity' },
      { key: 'showLiveReading', label: 'Show Reading', type: 'boolean', value: true }
    ]
  },
  {
    id: 'uni_timer',
    name: 'Digital Stopwatch',
    category: 'Universal',
    subject: 'Universal',
    icon: 'Timer',
    description: 'Real-time or simulation-time digital stopwatch with start/pause/lap triggers.',
    shape: 'rounded_rect',
    defaultColor: '#0f172a',
    borderColor: '#f59e0b',
    width: 120,
    height: 48,
    isStatic: true,
    isDraggable: true,
    customProperties: [
      { key: 'isRunning', label: 'Running', type: 'boolean', value: false },
      { key: 'elapsedSec', label: 'Elapsed (s)', type: 'number', value: 0, unit: 's' }
    ]
  },
  {
    id: 'uni_particle_emitter',
    name: 'Particle Emitter',
    category: 'Universal',
    subject: 'Universal',
    icon: 'Sparkles',
    description: 'Continuous or pulsed particle fountain with customizable speed, spread, and decay.',
    shape: 'particle_system',
    defaultColor: '#ec4899',
    width: 40,
    height: 40,
    isStatic: true,
    isDraggable: true,
    customProperties: [
      { key: 'rate', label: 'Emit Rate (/s)', type: 'number', value: 20 },
      { key: 'particleLife', label: 'Lifespan (s)', type: 'number', value: 2, unit: 's' },
      { key: 'particleColor', label: 'Particle Color', type: 'color', value: '#38bdf8' }
    ]
  },
  {
    id: 'uni_barrier_wall',
    name: 'Rigid Barrier / Wall',
    category: 'Universal',
    subject: 'Universal',
    icon: 'Shield',
    description: 'Impenetrable boundary or reflector for particles, light rays, and rigid bodies.',
    shape: 'rect',
    defaultColor: '#475569',
    borderColor: '#334155',
    width: 24,
    height: 180,
    isStatic: true,
    isDraggable: true,
    mass: 99999
  }
];

export const SUBJECT_TOOLBOXES: Record<StudioSubject, ToolboxCategory[]> = {
  // ==========================================
  // 1. 🌍 GEOGRAPHY STUDIO
  // ==========================================
  Geography: [
    {
      id: 'geo_landforms',
      name: 'Terrain & Landforms',
      icon: 'Mountain',
      components: [
        {
          id: 'geo_volcano',
          name: 'Active Volcano',
          category: 'Terrain',
          subject: 'Geography',
          icon: 'Flame',
          description: 'Stratovolcano with magma chamber pressure and eruption threshold.',
          shape: 'triangle',
          defaultColor: '#78350f',
          borderColor: '#b91c1c',
          width: 140,
          height: 110,
          isStatic: true,
          isDraggable: true,
          subjectData: { elevation: 2800, magmaPressure: 35, climateType: 'Alpine' },
          customProperties: [
            { key: 'magmaPressure', label: 'Magma Pressure (MPa)', type: 'number', value: 35, min: 0, max: 100, unit: 'MPa' },
            { key: 'isErupting', label: 'Erupting', type: 'boolean', value: false }
          ],
          states: [
            { id: 'dormant', name: 'Dormant', color: '#78350f' },
            { id: 'active', name: 'Active Tremors', color: '#991b1b' },
            { id: 'erupting', name: 'Erupting', color: '#dc2626' }
          ]
        },
        {
          id: 'geo_plate',
          name: 'Tectonic Plate Boundary',
          category: 'Terrain',
          subject: 'Geography',
          icon: 'Move',
          description: 'Continental or oceanic crust segment with directional drift vectors.',
          shape: 'rounded_rect',
          defaultColor: '#854d0e',
          borderColor: '#ca8a04',
          width: 200,
          height: 50,
          isStatic: true,
          isDraggable: true,
          subjectData: { tectonicPlate: 'Pacific', tectonicVector: { x: 2.5, y: 0 } },
          customProperties: [
            { key: 'driftRateCmYr', label: 'Drift Rate (cm/yr)', type: 'number', value: 5, unit: 'cm/yr' },
            { key: 'stressAccumulated', label: 'Stress (GPa)', type: 'number', value: 1.2, unit: 'GPa' }
          ]
        },
        {
          id: 'geo_ocean_reservoir',
          name: 'Ocean Water Basin',
          category: 'Terrain',
          subject: 'Geography',
          icon: 'Waves',
          description: 'Deep marine basin regulating thermal absorption and evaporation cycles.',
          shape: 'rect',
          defaultColor: '#0369a1',
          borderColor: '#0284c7',
          width: 260,
          height: 100,
          isStatic: true,
          isDraggable: true,
          subjectData: { volumeMl: 500000, temperatureKelvin: 288 },
          customProperties: [
            { key: 'salinity', label: 'Salinity (PSU)', type: 'number', value: 35, unit: 'PSU' },
            { key: 'evaporationRate', label: 'Evaporation (mm/day)', type: 'number', value: 4 }
          ]
        }
      ]
    },
    {
      id: 'geo_atmosphere',
      name: 'Atmosphere & Climate',
      icon: 'CloudRain',
      components: [
        {
          id: 'geo_rain_cloud',
          name: 'Precipitation Cloud',
          category: 'Atmosphere',
          subject: 'Geography',
          icon: 'CloudRain',
          description: 'Cumulonimbus cloud system producing rain based on atmospheric humidity.',
          shape: 'rounded_rect',
          defaultColor: '#64748b',
          borderColor: '#38bdf8',
          width: 130,
          height: 65,
          isStatic: false,
          isDraggable: true,
          mass: 5,
          subjectData: { rainfallMm: 85, climateType: 'Tropical' },
          customProperties: [
            { key: 'humidityPercent', label: 'Relative Humidity (%)', type: 'number', value: 85, unit: '%' },
            { key: 'rainfallIntensity', label: 'Rain Intensity (mm/h)', type: 'number', value: 12, unit: 'mm/h' }
          ]
        },
        {
          id: 'geo_sun_radiation',
          name: 'Solar Insolation Source',
          category: 'Atmosphere',
          subject: 'Geography',
          icon: 'Sun',
          description: 'Zenith solar radiation emitter governing seasonal thermal flux and day/night.',
          shape: 'circle',
          defaultColor: '#f59e0b',
          borderColor: '#fbbf24',
          width: 80,
          height: 80,
          isStatic: true,
          isDraggable: true,
          customProperties: [
            { key: 'solarZenithAngle', label: 'Zenith Angle (°)', type: 'number', value: 45, unit: '°' },
            { key: 'insolationWatts', label: 'Insolation (W/m²)', type: 'number', value: 1361, unit: 'W/m²' }
          ]
        }
      ]
    },
    {
      id: 'geo_population',
      name: 'Human Geography',
      icon: 'Users',
      components: [
        {
          id: 'geo_settlement',
          name: 'Urban Settlement',
          category: 'Human Geography',
          subject: 'Geography',
          icon: 'Building2',
          description: 'Population center with growth rate, resource demand, and urbanization index.',
          shape: 'rect',
          defaultColor: '#475569',
          borderColor: '#e2e8f0',
          width: 90,
          height: 70,
          isStatic: true,
          isDraggable: true,
          subjectData: { population: 250000 },
          customProperties: [
            { key: 'populationCount', label: 'Population', type: 'number', value: 250000 },
            { key: 'growthRatePct', label: 'Annual Growth (%)', type: 'number', value: 2.1, unit: '%' },
            { key: 'waterConsumption', label: 'Water Demand (L/day)', type: 'number', value: 500000 }
          ]
        }
      ]
    }
  ],

  // ==========================================
  // 2. 🧬 BIOLOGY STUDIO
  // ==========================================
  Biology: [
    {
      id: 'bio_cellular',
      name: 'Cellular Structures',
      icon: 'CircleDot',
      components: [
        {
          id: 'bio_animal_cell',
          name: 'Eukaryotic Cell Body',
          category: 'Cellular',
          subject: 'Biology',
          icon: 'CircleDot',
          description: 'Animal cell body containing cytoplasm, organelles, and flexible membrane.',
          shape: 'rounded_rect',
          defaultColor: '#059669',
          borderColor: '#10b981',
          width: 220,
          height: 180,
          isStatic: true,
          isDraggable: true,
          subjectData: { cellType: 'Eukaryote', membranePermeability: 0.6, atpLevel: 100, health: 100 },
          customProperties: [
            { key: 'osmoticTension', label: 'Turgor / Osmotic Pressure (kPa)', type: 'number', value: 101, unit: 'kPa' },
            { key: 'internalSoluteConc', label: 'Internal Solute (mol/L)', type: 'number', value: 0.3, unit: 'M' }
          ]
        },
        {
          id: 'bio_nucleus',
          name: 'Cell Nucleus & DNA',
          category: 'Cellular',
          subject: 'Biology',
          icon: 'Dna',
          description: 'Information storage center containing genomic DNA for transcription.',
          shape: 'circle',
          defaultColor: '#4338ca',
          borderColor: '#818cf8',
          width: 70,
          height: 70,
          isStatic: false,
          isDraggable: true,
          customProperties: [
            { key: 'transcriptionActive', label: 'Transcription Active', type: 'boolean', value: true },
            { key: 'mrnaYield', label: 'mRNA Transcripts', type: 'number', value: 12 }
          ]
        },
        {
          id: 'bio_mitochondria',
          name: 'Mitochondrion (ATP Factory)',
          category: 'Cellular',
          subject: 'Biology',
          icon: 'Zap',
          description: 'Aerobic cellular powerhouse generating ATP via oxidative phosphorylation.',
          shape: 'rounded_rect',
          defaultColor: '#c2410c',
          borderColor: '#f97316',
          width: 60,
          height: 35,
          isStatic: false,
          isDraggable: true,
          subjectData: { atpLevel: 80 },
          customProperties: [
            { key: 'oxygenConsumption', label: 'O₂ Rate (pmol/s)', type: 'number', value: 4.5 },
            { key: 'atpOutputPerSec', label: 'ATP Produced/s', type: 'number', value: 36 }
          ]
        },
        {
          id: 'bio_chloroplast',
          name: 'Chloroplast (Photosynthesis)',
          category: 'Cellular',
          subject: 'Biology',
          icon: 'Leaf',
          description: 'Plant organelle synthesizing glucose from photons, H₂O, and CO₂.',
          shape: 'rounded_rect',
          defaultColor: '#15803d',
          borderColor: '#4ade80',
          width: 65,
          height: 40,
          isStatic: false,
          isDraggable: true,
          customProperties: [
            { key: 'photonFlux', label: 'Light Intensity (µmol/m²s)', type: 'number', value: 500 },
            { key: 'glucoseSynthesisRate', label: 'Glucose Output', type: 'number', value: 8.2 }
          ]
        },
        {
          id: 'bio_water_molecule',
          name: 'Water Molecule (H₂O)',
          category: 'Cellular',
          subject: 'Biology',
          icon: 'Droplet',
          description: 'Diffusing solvent particle driven by osmotic gradients and Brownian motion.',
          shape: 'circle',
          defaultColor: '#38bdf8',
          width: 20,
          height: 20,
          isStatic: false,
          isDraggable: true,
          mass: 0.1,
          elasticity: 0.95,
          customProperties: [
            { key: 'isSolvent', label: 'Solvent', type: 'boolean', value: true }
          ]
        }
      ]
    },
    {
      id: 'bio_ecology',
      name: 'Ecology & Organisms',
      icon: 'Bug',
      components: [
        {
          id: 'bio_producer_plant',
          name: 'Autotrophic Plant',
          category: 'Ecology',
          subject: 'Biology',
          icon: 'Flower2',
          description: 'Primary producer converting sunlight to biomass in a food chain.',
          shape: 'rounded_rect',
          defaultColor: '#16a34a',
          width: 70,
          height: 90,
          isStatic: true,
          isDraggable: true,
          subjectData: { trophicLevel: 'producer', biomass: 100, health: 100 },
          customProperties: [
            { key: 'biomassGrams', label: 'Biomass (g)', type: 'number', value: 150 },
            { key: 'growthRate', label: 'Growth Factor', type: 'number', value: 1.15 }
          ]
        },
        {
          id: 'bio_herbivore',
          name: 'Herbivore Organism',
          category: 'Ecology',
          subject: 'Biology',
          icon: 'Rabbit',
          description: 'Primary consumer feeding on autotrophs to sustain population dynamics.',
          shape: 'circle',
          defaultColor: '#d97706',
          width: 45,
          height: 45,
          isStatic: false,
          isDraggable: true,
          mass: 2,
          subjectData: { trophicLevel: 'primary_consumer', health: 100 },
          customProperties: [
            { key: 'energyJoules', label: 'Energy Reserve (J)', type: 'number', value: 500 },
            { key: 'hungerThreshold', label: 'Hunger Rate', type: 'number', value: 5 }
          ]
        },
        {
          id: 'bio_predator',
          name: 'Apex Predator',
          category: 'Ecology',
          subject: 'Biology',
          icon: 'Skull',
          description: 'Secondary or tertiary consumer regulating prey density via Lotka-Volterra equations.',
          shape: 'circle',
          defaultColor: '#b91c1c',
          width: 55,
          height: 55,
          isStatic: false,
          isDraggable: true,
          mass: 8,
          subjectData: { trophicLevel: 'secondary_consumer', health: 100 },
          customProperties: [
            { key: 'preyDetectionRadius', label: 'Hunt Radius (px)', type: 'number', value: 160 }
          ]
        }
      ]
    }
  ],

  // ==========================================
  // 3. 🧪 CHEMISTRY STUDIO
  // ==========================================
  Chemistry: [
    {
      id: 'chem_apparatus',
      name: 'Lab Glassware & Hardware',
      icon: 'FlaskConical',
      components: [
        {
          id: 'chem_beaker',
          name: 'Graduated Beaker (500mL)',
          category: 'Glassware',
          subject: 'Chemistry',
          icon: 'Beaker',
          description: 'Standard reaction vessel with visible meniscus fluid level, pH, and temperature.',
          shape: 'rounded_rect',
          defaultColor: 'rgba(255,255,255,0.2)',
          borderColor: '#38bdf8',
          width: 140,
          height: 160,
          isStatic: true,
          isDraggable: true,
          subjectData: { volumeMl: 300, pH: 7.0, temperatureKelvin: 298.15, concentrationMolar: 0.1 },
          customProperties: [
            { key: 'liquidLevelMl', label: 'Volume (mL)', type: 'number', value: 250, min: 0, max: 500, unit: 'mL' },
            { key: 'solutionColor', label: 'Liquid Hue', type: 'color', value: '#60a5fa' },
            { key: 'pH', label: 'Solution pH', type: 'number', value: 7.0, min: 0, max: 14 }
          ]
        },
        {
          id: 'chem_buret',
          name: 'Precision Burette & Stopcock',
          category: 'Glassware',
          subject: 'Chemistry',
          icon: 'Pipette',
          description: 'Dispenser for acid-base titrations with dropwise flow-rate control.',
          shape: 'rect',
          defaultColor: 'rgba(224,242,254,0.3)',
          borderColor: '#0284c7',
          width: 32,
          height: 200,
          isStatic: true,
          isDraggable: true,
          customProperties: [
            { key: 'dispensedMl', label: 'Titrant Added (mL)', type: 'number', value: 0, min: 0, max: 50, unit: 'mL' },
            { key: 'flowRateDropsPerSec', label: 'Drip Rate (drops/s)', type: 'number', value: 2 }
          ]
        },
        {
          id: 'chem_bunsen_burner',
          name: 'Bunsen Burner Flame',
          category: 'Glassware',
          subject: 'Chemistry',
          icon: 'Flame',
          description: 'Thermal heat source increasing kinetic particle velocity and reaction rates.',
          shape: 'rounded_rect',
          defaultColor: '#1e293b',
          borderColor: '#f97316',
          width: 70,
          height: 80,
          isStatic: true,
          isDraggable: true,
          customProperties: [
            { key: 'isLit', label: 'Flame Active', type: 'boolean', value: false },
            { key: 'flameTemperatureC', label: 'Flame Temp (°C)', type: 'number', value: 800, unit: '°C' }
          ]
        }
      ]
    },
    {
      id: 'chem_matter',
      name: 'Particles, Acids & Bases',
      icon: 'Atom',
      components: [
        {
          id: 'chem_atom_particle',
          name: 'Reactive Atom Particle',
          category: 'Particles',
          subject: 'Chemistry',
          icon: 'Circle',
          description: 'Kinetic particle obeying gas laws, elastic collisions, and activation energy barriers.',
          shape: 'circle',
          defaultColor: '#ef4444',
          width: 24,
          height: 24,
          isStatic: false,
          isDraggable: true,
          mass: 1,
          elasticity: 1.0,
          subjectData: { elementSymbol: 'O', phase: 'gas' },
          customProperties: [
            { key: 'kineticEnergyJoules', label: 'Kinetic Energy (J)', type: 'number', value: 3.7e-21 }
          ]
        },
        {
          id: 'chem_acid_bottle',
          name: 'Hydrochloric Acid (HCl)',
          category: 'Reagents',
          subject: 'Chemistry',
          icon: 'TestTube',
          description: 'Strong monoprotic acid reagent for neutralization and pH shifts.',
          shape: 'rounded_rect',
          defaultColor: '#dc2626',
          borderColor: '#ef4444',
          width: 55,
          height: 75,
          isStatic: true,
          isDraggable: true,
          subjectData: { formula: 'HCl', concentrationMolar: 1.0, pH: 0.0 },
          customProperties: [
            { key: 'molarity', label: 'Molarity (M)', type: 'number', value: 1.0, unit: 'M' }
          ]
        },
        {
          id: 'chem_base_bottle',
          name: 'Sodium Hydroxide (NaOH)',
          category: 'Reagents',
          subject: 'Chemistry',
          icon: 'TestTubes',
          description: 'Strong base reagent for titration neutralizing hydronium ions into water.',
          shape: 'rounded_rect',
          defaultColor: '#2563eb',
          borderColor: '#3b82f6',
          width: 55,
          height: 75,
          isStatic: true,
          isDraggable: true,
          subjectData: { formula: 'NaOH', concentrationMolar: 1.0, pH: 14.0 },
          customProperties: [
            { key: 'molarity', label: 'Molarity (M)', type: 'number', value: 1.0, unit: 'M' }
          ]
        },
        {
          id: 'chem_ph_indicator',
          name: 'Universal pH Strip',
          category: 'Reagents',
          subject: 'Chemistry',
          icon: 'Sparkle',
          description: 'Colorimetric probe changing hue from red (pH 1) to green (pH 7) to purple (pH 14).',
          shape: 'rect',
          defaultColor: '#eab308',
          width: 18,
          height: 80,
          isStatic: true,
          isDraggable: true,
          customProperties: [
            { key: 'detectedPh', label: 'pH Reading', type: 'number', value: 7.0 }
          ]
        }
      ]
    }
  ],

  // ==========================================
  // 4. 📐 MATHEMATICS STUDIO
  // ==========================================
  Mathematics: [
    {
      id: 'math_graphs_functions',
      name: 'Functions & Coordinate Geometry',
      icon: 'LineChart',
      components: [
        {
          id: 'math_cartesian_plane',
          name: 'Cartesian Coordinate Grid',
          category: 'Functions',
          subject: 'Mathematics',
          icon: 'Grid',
          description: '2D grid with major/minor tick intervals, axis labels, and origin at center.',
          shape: 'rect',
          defaultColor: 'rgba(248,250,252,0.6)',
          borderColor: '#64748b',
          width: 320,
          height: 240,
          isStatic: true,
          isDraggable: false,
          customProperties: [
            { key: 'xMin', label: 'X Min', type: 'number', value: -10 },
            { key: 'xMax', label: 'X Max', type: 'number', value: 10 },
            { key: 'yMin', label: 'Y Min', type: 'number', value: -10 },
            { key: 'yMax', label: 'Y Max', type: 'number', value: 10 }
          ]
        },
        {
          id: 'math_vector_arrow',
          name: 'Dynamic 2D Vector',
          category: 'Functions',
          subject: 'Mathematics',
          icon: 'MoveUpRight',
          description: 'Vector with magnitude, angle (θ), and decomposed X/Y components.',
          shape: 'arrow',
          defaultColor: '#8b5cf6',
          width: 120,
          height: 30,
          rotation: 45,
          isStatic: true,
          isDraggable: true,
          customProperties: [
            { key: 'magnitude', label: 'Magnitude |v|', type: 'number', value: 10 },
            { key: 'angleDegrees', label: 'Angle θ (°)', type: 'number', value: 45, unit: '°' },
            { key: 'componentX', label: 'v_x', type: 'number', value: 7.07 },
            { key: 'componentY', label: 'v_y', type: 'number', value: 7.07 }
          ]
        },
        {
          id: 'math_polynomial_curve',
          name: 'Interactive Polynomial Curve',
          category: 'Functions',
          subject: 'Mathematics',
          icon: 'Spline',
          description: 'Real-time curve plot of y = ax² + bx + c or arbitrary algebraic equations.',
          shape: 'custom_svg',
          defaultColor: '#06b6d4',
          width: 280,
          height: 180,
          isStatic: true,
          isDraggable: false,
          subjectData: { mathExpression: 'a*x^2 + b*x + c', functionType: 'quadratic' },
          customProperties: [
            { key: 'coeffA', label: 'Coefficient a', type: 'number', value: 1.0 },
            { key: 'coeffB', label: 'Coefficient b', type: 'number', value: 0.0 },
            { key: 'coeffC', label: 'Constant c', type: 'number', value: 0.0 }
          ]
        }
      ]
    },
    {
      id: 'math_geometry',
      name: 'Shapes & Trigonometry',
      icon: 'Shapes',
      components: [
        {
          id: 'math_unit_circle',
          name: 'Trigonometric Unit Circle',
          category: 'Geometry',
          subject: 'Mathematics',
          icon: 'Disc',
          description: 'Unit circle visualizing sin(θ), cos(θ), tan(θ), and radian angles.',
          shape: 'circle',
          defaultColor: 'rgba(238,242,255,0.5)',
          borderColor: '#6366f1',
          width: 160,
          height: 160,
          isStatic: true,
          isDraggable: true,
          customProperties: [
            { key: 'thetaDegrees', label: 'Angle θ (°)', type: 'number', value: 30, min: 0, max: 360, unit: '°' },
            { key: 'sineValue', label: 'sin(θ)', type: 'number', value: 0.5 },
            { key: 'cosineValue', label: 'cos(θ)', type: 'number', value: 0.866 }
          ]
        },
        {
          id: 'math_polygon_vertex',
          name: 'Draggable Polygon Vertex',
          category: 'Geometry',
          subject: 'Mathematics',
          icon: 'CircleDot',
          description: 'Movable point on geometry planes calculating perimeter, area, and interior angles.',
          shape: 'circle',
          defaultColor: '#f43f5e',
          width: 24,
          height: 24,
          isStatic: false,
          isDraggable: true
        }
      ]
    }
  ],

  // ==========================================
  // 5. ⚛️ PHYSICS STUDIO
  // ==========================================
  Physics: [
    {
      id: 'phys_mechanics',
      name: 'Mechanics & Kinematics',
      icon: 'Orbit',
      components: [
        {
          id: 'phys_mass_ball',
          name: 'Rigid Ball / Projectile',
          category: 'Mechanics',
          subject: 'Physics',
          icon: 'Circle',
          description: 'Spherical mass with velocity, acceleration, gravity, and trajectory trail.',
          shape: 'circle',
          defaultColor: '#3b82f6',
          borderColor: '#1d4ed8',
          width: 48,
          height: 48,
          mass: 2.0,
          elasticity: 0.8,
          friction: 0.05,
          isStatic: false,
          isDraggable: true,
          customProperties: [
            { key: 'massKg', label: 'Mass (kg)', type: 'number', value: 2.0, unit: 'kg' },
            { key: 'restitution', label: 'Elasticity (0-1)', type: 'number', value: 0.8, min: 0, max: 1 }
          ]
        },
        {
          id: 'phys_cannon',
          name: 'Projectile Cannon Launcher',
          category: 'Mechanics',
          subject: 'Physics',
          icon: 'Crosshair',
          description: 'Adjustable elevation cannon firing mass projectiles at specified initial speeds.',
          shape: 'rounded_rect',
          defaultColor: '#334155',
          borderColor: '#475569',
          width: 80,
          height: 40,
          rotation: -45,
          isStatic: true,
          isDraggable: true,
          customProperties: [
            { key: 'launchAngleDeg', label: 'Elevation Angle (°)', type: 'number', value: 45, min: 0, max: 90, unit: '°' },
            { key: 'initialVelocityM_S', label: 'Muzzle Velocity (m/s)', type: 'number', value: 18, unit: 'm/s' },
            { key: 'launchHeightM', label: 'Height (m)', type: 'number', value: 0, unit: 'm' }
          ]
        },
        {
          id: 'phys_spring_mass',
          name: 'Harmonic Spring Damper',
          category: 'Mechanics',
          subject: 'Physics',
          icon: 'Activity',
          description: 'Hooke law elastic spring calculating F = -k·x and harmonic oscillation period.',
          shape: 'rect',
          defaultColor: '#e2e8f0',
          borderColor: '#64748b',
          width: 140,
          height: 24,
          isStatic: true,
          isDraggable: true,
          subjectData: { springConstant: 50 },
          customProperties: [
            { key: 'springConstantK', label: 'Stiffness k (N/m)', type: 'number', value: 50, unit: 'N/m' },
            { key: 'dampingRatio', label: 'Damping (c)', type: 'number', value: 0.05 },
            { key: 'displacementM', label: 'Displacement (m)', type: 'number', value: 0.4, unit: 'm' }
          ]
        },
        {
          id: 'phys_pendulum_bob',
          name: 'Simple Gravity Pendulum',
          category: 'Mechanics',
          subject: 'Physics',
          icon: 'CircleDotDashed',
          description: 'Pivot suspended mass oscillating with period T = 2π√(L/g).',
          shape: 'circle',
          defaultColor: '#8b5cf6',
          width: 36,
          height: 36,
          isStatic: false,
          isDraggable: true,
          subjectData: { pendulumLength: 1.2 },
          customProperties: [
            { key: 'rodLengthM', label: 'Length L (m)', type: 'number', value: 1.2, unit: 'm' },
            { key: 'initialThetaDeg', label: 'Release Angle (°)', type: 'number', value: 30, unit: '°' }
          ]
        }
      ]
    },
    {
      id: 'phys_electromagnetism',
      name: 'Electricity & Circuits',
      icon: 'Zap',
      components: [
        {
          id: 'phys_dc_battery',
          name: 'DC Voltage Source (Battery)',
          category: 'Electricity',
          subject: 'Physics',
          icon: 'BatteryCharging',
          description: 'Constant electromotive force (EMF) driving circuit electron loops.',
          shape: 'rounded_rect',
          defaultColor: '#1e293b',
          borderColor: '#eab308',
          width: 70,
          height: 40,
          isStatic: true,
          isDraggable: true,
          subjectData: { voltage: 9.0, isCircuitClosed: true },
          customProperties: [
            { key: 'voltageVolts', label: 'Voltage (V)', type: 'number', value: 9.0, unit: 'V' },
            { key: 'internalResistanceOhms', label: 'Internal R (Ω)', type: 'number', value: 0.1, unit: 'Ω' }
          ]
        },
        {
          id: 'phys_resistor',
          name: 'Linear Resistor (Ω)',
          category: 'Electricity',
          subject: 'Physics',
          icon: 'SlidersHorizontal',
          description: 'Ohmic load dissipating power P = I²·R according to Ohm law (V = I·R).',
          shape: 'rounded_rect',
          defaultColor: '#d97706',
          borderColor: '#b45309',
          width: 75,
          height: 30,
          isStatic: true,
          isDraggable: true,
          subjectData: { resistance: 100 },
          customProperties: [
            { key: 'resistanceOhms', label: 'Resistance (Ω)', type: 'number', value: 100, unit: 'Ω' }
          ]
        },
        {
          id: 'phys_light_bulb',
          name: 'Incandescent Lamp Bulb',
          category: 'Electricity',
          subject: 'Physics',
          icon: 'Lightbulb',
          description: 'Resistive visual element glowing proportionally to electric current throughput.',
          shape: 'circle',
          defaultColor: '#fef08a',
          borderColor: '#facc15',
          width: 50,
          height: 50,
          isStatic: true,
          isDraggable: true,
          subjectData: { resistance: 20 },
          states: [
            { id: 'off', name: 'Off', color: '#64748b' },
            { id: 'dim', name: 'Dim Glow', color: '#fef08a' },
            { id: 'bright', name: 'Full Brightness', color: '#facc15' },
            { id: 'blown', name: 'Burnt Out', color: '#1e293b' }
          ]
        },
        {
          id: 'phys_knife_switch',
          name: 'SPST Knife Switch',
          category: 'Electricity',
          subject: 'Physics',
          icon: 'ToggleRight',
          description: 'Manual or event-driven circuit interrupter switching loop continuity.',
          shape: 'rounded_rect',
          defaultColor: '#475569',
          borderColor: '#94a3b8',
          width: 60,
          height: 32,
          isStatic: true,
          isDraggable: true,
          subjectData: { isCircuitClosed: false },
          customProperties: [
            { key: 'isClosed', label: 'Closed (Conducting)', type: 'boolean', value: false }
          ]
        }
      ]
    }
  ],

  // ==========================================
  // 6. 💻 COMPUTER SCIENCE / IT STUDIO
  // ==========================================
  'Computer Science': [
    {
      id: 'cs_networking',
      name: 'Networking & Telecommunications',
      icon: 'Network',
      components: [
        {
          id: 'cs_router',
          name: 'Layer 3 Packet Router',
          category: 'Networking',
          subject: 'Computer Science',
          icon: 'Router',
          description: 'IP packet routing device with forwarding tables and queue buffer.',
          shape: 'rounded_rect',
          defaultColor: '#0284c7',
          borderColor: '#38bdf8',
          width: 80,
          height: 50,
          isStatic: true,
          isDraggable: true,
          subjectData: { isRouter: true, ipAddress: '192.168.1.1', bandwidthMbps: 1000 },
          customProperties: [
            { key: 'packetLossPct', label: 'Packet Drop Rate (%)', type: 'number', value: 0, unit: '%' },
            { key: 'bufferCapacity', label: 'Buffer Queue Size', type: 'number', value: 50 }
          ]
        },
        {
          id: 'cs_firewall',
          name: 'Stateful Inspection Firewall',
          category: 'Networking',
          subject: 'Computer Science',
          icon: 'ShieldCheck',
          description: 'Security filter evaluating ports and protocols (ALLOW or DROP packets).',
          shape: 'rounded_rect',
          defaultColor: '#b91c1c',
          borderColor: '#f87171',
          width: 40,
          height: 120,
          isStatic: true,
          isDraggable: true,
          subjectData: { isFirewall: true, ruleAction: 'allow' },
          customProperties: [
            { key: 'blockedPort', label: 'Filtered Port', type: 'number', value: 80 },
            { key: 'inspectPayload', label: 'Deep Packet Inspection', type: 'boolean', value: true }
          ]
        },
        {
          id: 'cs_server_node',
          name: 'Web / Database Server',
          category: 'Networking',
          subject: 'Computer Science',
          icon: 'Server',
          description: 'Host endpoint responding to HTTP/TCP requests with CPU load and latency.',
          shape: 'rect',
          defaultColor: '#334155',
          borderColor: '#64748b',
          width: 75,
          height: 90,
          isStatic: true,
          isDraggable: true,
          subjectData: { isServer: true, ipAddress: '10.0.0.8', port: 443 },
          customProperties: [
            { key: 'cpuLoadPct', label: 'CPU Utilization (%)', type: 'number', value: 25, unit: '%' },
            { key: 'activeConnections', label: 'Active Sockets', type: 'number', value: 120 }
          ]
        },
        {
          id: 'cs_data_packet',
          name: 'IPv4 Data Packet',
          category: 'Networking',
          subject: 'Computer Science',
          icon: 'Mail',
          description: 'Network protocol payload packet traveling through links and routers.',
          shape: 'rounded_rect',
          defaultColor: '#10b981',
          width: 32,
          height: 22,
          isStatic: false,
          isDraggable: true,
          mass: 0.5,
          customProperties: [
            { key: 'ttl', label: 'Time To Live (TTL)', type: 'number', value: 64 },
            { key: 'protocol', label: 'Protocol', type: 'string', value: 'TCP' }
          ]
        }
      ]
    },
    {
      id: 'cs_logic_gates',
      name: 'Digital Logic & Architecture',
      icon: 'Binary',
      components: [
        {
          id: 'cs_gate_and',
          name: '2-Input AND Gate',
          category: 'Logic',
          subject: 'Computer Science',
          icon: 'Binary',
          description: 'Boolean gate outputting HIGH (1) if and only if both inputs are HIGH.',
          shape: 'rounded_rect',
          defaultColor: '#4f46e5',
          borderColor: '#818cf8',
          width: 70,
          height: 48,
          isStatic: true,
          isDraggable: true,
          subjectData: { gateType: 'AND', binaryValue: 0 },
          customProperties: [
            { key: 'inputA', label: 'Input A', type: 'number', value: 0, min: 0, max: 1 },
            { key: 'inputB', label: 'Input B', type: 'number', value: 0, min: 0, max: 1 },
            { key: 'outputQ', label: 'Output Q', type: 'number', value: 0 }
          ]
        },
        {
          id: 'cs_gate_or',
          name: '2-Input OR Gate',
          category: 'Logic',
          subject: 'Computer Science',
          icon: 'Cpu',
          description: 'Boolean gate outputting HIGH (1) if at least one input is HIGH.',
          shape: 'rounded_rect',
          defaultColor: '#7c3aed',
          borderColor: '#a78bfa',
          width: 70,
          height: 48,
          isStatic: true,
          isDraggable: true,
          subjectData: { gateType: 'OR', binaryValue: 0 },
          customProperties: [
            { key: 'inputA', label: 'Input A', type: 'number', value: 0, min: 0, max: 1 },
            { key: 'inputB', label: 'Input B', type: 'number', value: 0, min: 0, max: 1 },
            { key: 'outputQ', label: 'Output Q', type: 'number', value: 0 }
          ]
        },
        {
          id: 'cs_gate_not',
          name: 'Inverter (NOT Gate)',
          category: 'Logic',
          subject: 'Computer Science',
          icon: 'ToggleLeft',
          description: 'Boolean inverter flipping 0 to 1 and 1 to 0.',
          shape: 'triangle',
          defaultColor: '#db2777',
          borderColor: '#f472b6',
          width: 55,
          height: 40,
          isStatic: true,
          isDraggable: true,
          subjectData: { gateType: 'NOT', binaryValue: 1 },
          customProperties: [
            { key: 'inputA', label: 'Input A', type: 'number', value: 0, min: 0, max: 1 },
            { key: 'outputQ', label: 'Output Q', type: 'number', value: 1 }
          ]
        }
      ]
    }
  ],

  // ==========================================
  // 7. 🤖 ROBOTICS STUDIO
  // ==========================================
  Robotics: [
    {
      id: 'robo_actuators',
      name: 'Mobile Robots & Actuators',
      icon: 'Bot',
      components: [
        {
          id: 'robo_differential_rover',
          name: '2-Wheel Differential Rover',
          category: 'Robots',
          subject: 'Robotics',
          icon: 'Bot',
          description: 'Mobile chassis driven by independent Left/Right DC gearmotors with wheel encoders.',
          shape: 'rounded_rect',
          defaultColor: '#0ea5e9',
          borderColor: '#0284c7',
          width: 80,
          height: 80,
          mass: 5.0,
          isStatic: false,
          isDraggable: true,
          subjectData: {
            motorSpeedLeft: 0,
            motorSpeedRight: 0,
            wheelRadius: 3.5,
            trackWidth: 15,
            isAutonomous: true
          },
          customProperties: [
            { key: 'speedLeft', label: 'Left Motor (%)', type: 'number', value: 50, min: -100, max: 100, unit: '%' },
            { key: 'speedRight', label: 'Right Motor (%)', type: 'number', value: 50, min: -100, max: 100, unit: '%' },
            { key: 'batteryVoltageV', label: 'LiPo Battery (V)', type: 'number', value: 11.1, unit: 'V' }
          ]
        },
        {
          id: 'robo_arm_2dof',
          name: '2-DOF Articulated Robotic Arm',
          category: 'Robots',
          subject: 'Robotics',
          icon: 'GitFork',
          description: 'Kinematic robotic arm with shoulder and elbow servo joints.',
          shape: 'custom_svg',
          defaultColor: '#475569',
          borderColor: '#f59e0b',
          width: 160,
          height: 120,
          isStatic: true,
          isDraggable: true,
          subjectData: {
            armJoints: [
              { length: 80, angleDeg: 45, color: '#0ea5e9' },
              { length: 60, angleDeg: -30, color: '#f59e0b' }
            ]
          },
          customProperties: [
            { key: 'shoulderAngleDeg', label: 'Shoulder Servo θ₁ (°)', type: 'number', value: 45, min: -180, max: 180, unit: '°' },
            { key: 'elbowAngleDeg', label: 'Elbow Servo θ₂ (°)', type: 'number', value: -30, min: -180, max: 180, unit: '°' }
          ]
        }
      ]
    },
    {
      id: 'robo_sensors',
      name: 'Sensors & Perception',
      icon: 'Radar',
      components: [
        {
          id: 'robo_ultrasonic_sensor',
          name: 'HC-SR04 Ultrasonic Distance Sensor',
          category: 'Sensors',
          subject: 'Robotics',
          icon: 'Radar',
          description: 'Sonar transducer calculating obstacle distance via time-of-flight acoustic echoes.',
          shape: 'rounded_rect',
          defaultColor: '#1e293b',
          borderColor: '#38bdf8',
          width: 50,
          height: 25,
          isStatic: true,
          isDraggable: true,
          subjectData: { sensorType: 'ultrasonic', sensorRange: 200, sensorFOV: 30, sensorReading: 120 },
          customProperties: [
            { key: 'maxRangeCm', label: 'Max Detection Range', type: 'number', value: 250, unit: 'cm' },
            { key: 'detectedDistanceCm', label: 'Live Distance', type: 'number', value: 120, unit: 'cm' }
          ]
        },
        {
          id: 'robo_ir_line_tracker',
          name: 'Infrared Line Tracking Sensor',
          category: 'Sensors',
          subject: 'Robotics',
          icon: 'Eye',
          description: 'Reflective optical sensor distinguishing high vs low albedo line tracks.',
          shape: 'circle',
          defaultColor: '#334155',
          borderColor: '#ef4444',
          width: 28,
          height: 28,
          isStatic: false,
          isDraggable: true,
          subjectData: { sensorType: 'ir', sensorReading: 1 },
          customProperties: [
            { key: 'reflectanceValue', label: 'Reflectance (0-1)', type: 'number', value: 0.95 }
          ]
        },
        {
          id: 'robo_obstacle_block',
          name: 'Navigation Obstacle Block',
          category: 'Sensors',
          subject: 'Robotics',
          icon: 'Square',
          description: 'Solid test obstacle detected by LiDAR, ultrasonics, and bumpers.',
          shape: 'rounded_rect',
          defaultColor: '#e11d48',
          borderColor: '#be123c',
          width: 60,
          height: 60,
          isStatic: true,
          isDraggable: true,
          mass: 1000
        }
      ]
    }
  ]
};
