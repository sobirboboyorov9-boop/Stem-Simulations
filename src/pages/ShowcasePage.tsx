import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { 
  Trophy, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Cpu, 
  Code2, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Users, 
  Layers, 
  GraduationCap, 
  FlaskConical, 
  Compass, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Calendar, 
  ArrowRight, 
  Zap, 
  BookOpen, 
  Globe, 
  Share2, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { StemLogo } from '../components/StemLogo.js';

interface Slide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  points: string[];
  metrics?: { label: string; value: string }[];
  accentColor: string;
  notes: string;
}

const PRESENTATION_SLIDES: Slide[] = [
  {
    id: 1,
    badge: '1. Muammo (Problem)',
    title: 'Maktablarda STEM fanlarini o‘qitishdagi fundamental to‘siqlar',
    subtitle: 'Zamonaviy ilm-fanni amaliy tajribalarsiz o‘rganish o‘quvchilarning qiziqishi va bilim sifatini keskin tushirmoqda.',
    points: [
      'Mablag‘ va moddiy-texnik baza: Maktablarning 80%+ qismida laboratoriya jihozlari, kimyoviy reaktivlar va o‘lchov asboblari yetishmaydi.',
      'Xavfsizlik va xarajat: Kimyo va elektr tajribalari xavfli, bir martalik reaktivlar esa doimiy katta xarajat talab qiladi.',
      'Individual eʼtibor taqchilligi: Bitta o‘qituvchiga 30-35 nafar o‘quvchi to‘g‘ri keladi, har biriga shaxsiy yo‘l-yo‘riq berish imkonsiz.',
      'Til to‘sig‘i: Mavjud jahon darajasidagi interaktiv simulyatsiyalar (masalan, PhET) asosan ingliz tilida bo‘lib, o‘zbek maktablariga to‘liq moslashtirilmagan edi.'
    ],
    metrics: [
      { label: 'Laboratoriyasiz maktablar', value: '80%+' },
      { label: 'O‘quvchi/O‘qituvchi nisbati', value: '35:1' },
      { label: 'Reaktivlar xarajati', value: 'Yuqori' },
      { label: 'O‘zbekcha resurslar', value: '< 10%' }
    ],
    accentColor: 'from-rose-500/20 to-amber-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400',
    notes: 'Hakamlar diqqatiga: Ushbu muammo nafaqat O‘zbekiston, balki barcha rivojlanayotgan davlatlar uchun dolzarb. Bizning maqsad har bir o‘quvchi qo‘liga xavfsiz va bepul virtual laboratoriya berish.'
  },
  {
    id: 2,
    badge: '2. Yechim (Solution)',
    title: 'STEM-Simulations: 119+ Virtual Laboratoriya & Sunʼiy Intellekt Tyutori',
    subtitle: 'Brauzer orqali ishlaydigan, 100% o‘zbek tilidagi to‘liq interaktiv taʼlim ekotizimi.',
    points: [
      '119 ta to‘liq moslashtirilgan laboratoriya: Fizika, Kimyo, Matematika, Biologiya va Yer haqidagi fanlar bo‘yicha interaktiv simulyatsiyalar.',
      '100% xavfsiz va cheksiz sinovlar: O‘quvchi parametrlarni xohlagancha o‘zgartirishi va natijani vizual tarzda real vaqtda ko‘rishi mumkin.',
      'Gemini AI Ilmiy Tyutori: 24/7 ishlaydigan sunʼiy intellekt repetitori har bir laboratoriya kontekstini tushunadi, savollarga javob beradi va formulalarni LaTeX formatida tushuntiradi.',
      'O‘qituvchi Studiyasi & Hamkorlik: O‘qituvchilar o‘z topshiriqlarini yaratishi va o‘quvchilar natijalarini kuzatishi mumkin.'
    ],
    metrics: [
      { label: 'Tayyor simulyatsiyalar', value: '119 ta' },
      { label: 'Lokalizatsiya', value: '100% O‘zbekcha' },
      { label: 'AI Yordamchi tezligi', value: '< 1.5 sek' },
      { label: 'Maktablar uchun xarajat', value: '0 so‘m' }
    ],
    accentColor: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    notes: 'Yechimimiz oddiy video yoki nazariy darslik emas — bu o‘quvchi o‘zi tajriba o‘tkazib, xulosalar chiqaradigan haqiqiy ilmiy tadqiqot muhiti.'
  },
  {
    id: 3,
    badge: '3. Texnologik Arxitektura',
    title: 'Zamonaviy, Tezkor va Kengayuvchan Dasturiy Stack',
    subtitle: 'Nol kechikish (Zero lag), oflayn qo‘llab-quvvatlash va xavfsiz arxitektura.',
    points: [
      'Frontend: React 19, TypeScript, Tailwind CSS, Vite, HTML5 Canvas va KaTeX (matematik formulalar uchun).',
      'Backend & API: Node.js, Express, server-side caching va RESTful modulli API arxitekturasi.',
      'Sunʼiy Intellekt: Google Gemini 2.5/3.7 Flash modellari orqali tabiiy ilmiy muloqot va formula generatsiyasi.',
      'Xavfsizlik & RBAC: 4 bosqichli rol tizimi (O‘quvchi, O‘qituvchi, Admin, Super Admin) va xavfsiz autentifikatsiya.'
    ],
    metrics: [
      { label: 'Frontend texnologiyasi', value: 'React 19' },
      { label: 'AI Dvigateli', value: 'Gemini Flash' },
      { label: 'Sahifa yuklanish tezligi', value: '< 0.8s' },
      { label: 'Moslashuvchanlik', value: 'Barcha qurilmalar' }
    ],
    accentColor: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400',
    notes: 'Platforma internet sekin bo‘lgan hududlarda ham barqaror ishlashi uchun barcha simulyatsiyalar optimallashtirilgan va lokal keshlash qo‘llanilgan.'
  },
  {
    id: 4,
    badge: '4. Gemini AI Ilmiy Tyutor',
    title: 'Har bir simulyatsiya bilan integratsiyalashgan aqlli repetitor',
    subtitle: 'O‘quvchiga shunchaki tayyor javob bermaydi, balki Sokrat uslubida mustaqil fikrlashga o‘rgatadi.',
    points: [
      'Kontekstli tushunish: AI o‘quvchi ayni paytda qaysi simulyatsiya (masalan, Kislota-asos eritmasi yoki Nyuton qonuni) ichida turganini aniq biladi.',
      'LaTeX Formulalar: Barcha matematik va kimyoviy tenglamalar professional ko‘rinishda (KaTeX) formatlanadi.',
      'Ko‘p tillilik: O‘zbek va ingliz tillarida ilmiy terminologiyaga to‘liq mos javob beradi.',
      'O‘qituvchilar yuki kamayishi: Takrorlanuvchi 80% savollarni AI o‘z zimmasiga oladi.'
    ],
    metrics: [
      { label: 'Javob berish vaqti', value: '1.2 sek' },
      { label: 'Formula qo‘llab-quvvatlash', value: '100% LaTeX' },
      { label: 'Kontekst saqlash', value: '20+ xabar' },
      { label: 'Ish rejimi', value: '24/7' }
    ],
    accentColor: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-600 dark:text-purple-400',
    notes: 'Pedagogik qoida: AI shunchaki konspekt ko‘chirib bermaydi, balki o‘quvchiga "Agar massani 2 marta oshirsang, tezlanish nima bo‘ladi deb o‘ylaysan?" deya savol bilan murojaat qiladi.'
  },
  {
    id: 5,
    badge: '5. Ijtimoiy Taʼsir va Bozor',
    title: 'O‘zbekiston va Markaziy Osiyo taʼlim sohasidagi imkoniyatlar',
    subtitle: '10,000 dan ortiq umumtaʼlim maktablari va 6.5 milliondan ziyod o‘quvchilar uchun ochiq taʼlim.',
    points: [
      'Target auditoriya: 5-11 sinf o‘quvchilari (3.5M+), STEM fani o‘qituvchilari (150,000+) va repetitorlik markazlari.',
      'Davlat taʼlim standartlariga moslik: Dastur O‘zbekiston Milliy o‘quv dasturi darsliklari mavzulariga to‘liq integratsiya qilinadi.',
      'Iqtisodiy tejash: Har bir maktab uchun minglab dollarlik laboratoriya xarajatlarini tejaydi.',
      'Barcha uchun teng imkoniyat: Qishloq maktabi o‘quvchisi ham poytaxtdagi eng ilg‘or litsey o‘quvchisi bilan bir xil darajadagi laboratoriyadan foydalanadi.'
    ],
    metrics: [
      { label: 'Salohiyatli o‘quvchilar', value: '6.5M+' },
      { label: 'STEM O‘qituvchilari', value: '150K+' },
      { label: 'Tenglik indeksi', value: '100%' },
      { label: 'Xarajat tejalishi', value: 'Milliardlab so‘m' }
    ],
    accentColor: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
    notes: 'Loyiha nafaqat tijoriy, balki ulkan ijtimoiy missiyaga ega: O‘zbekiston yoshlari orasida muhandislik va aniq fanlarni ommalashtirish.'
  },
  {
    id: 6,
    badge: '6. Jamoa & Roadmap 2025-2026',
    title: 'Aniq strategiya, bosqichma-bosqich rivojlanish va kelajak rejalari',
    subtitle: 'Loyihaning hozirgi yutuqlari va keyingi 12 oylik kengaytirish rejasi.',
    points: [
      'Sobir Boboyorov: Bosh loyiha meʼmori, Fullstack va AI muhandisi. Ekotizimning barcha texnik qismlarini ishlab chiqishga masʼul.',
      '1-bosqich (2024 - Bajarildi): 119 ta laboratoriyani to‘liq o‘zbeklashtirish, katalog va qidiruv tizimi.',
      '2-bosqich (2025 Q1 - Bajarildi): Gemini AI integratsiyasi, ko‘p rolli RBAC, sessiyalar doimiyligi.',
      '3-bosqich (2025 Q2-Q3 - Rejada): Oflayn PWA ilova, maktablar uchun hisobotlar va mobil dastur.'
    ],
    metrics: [
      { label: 'Bajarilgan bosqichlar', value: '85%' },
      { label: 'Hozirgi versiya', value: 'v2.4 Pro' },
      { label: 'Kutilayotgan foydalanuvchilar', value: '50,000+' },
      { label: 'Keyingi yangilanish', value: 'PWA Mobile' }
    ],
    accentColor: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
    notes: 'Jamoamiz loyihani uzoq muddatli barqaror platformaga aylantirish uchun taʼlim vazirligi va maktablar bilan hamkorlikka tayyor.'
  }
];

export const ShowcasePage: React.FC = () => {
  // Navigation & View Mode State
  const [activeTab, setActiveTab] = useState<'video' | 'slides'>('video');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Video Simulation Player State (Interactive 1-5 min Demo)
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);

  const totalDuration = 270; // 4 minutes 30 seconds

  const chapters = [
    { start: 0, end: 45, label: '0:00 - Kirish va Muammo', title: 'Maktablarda laboratoriyalar taqchilligi' },
    { start: 45, end: 110, label: '0:45 - 119+ Simulyatsiyalar', title: 'PhET laboratoriyalari va interaktiv tajribalar' },
    { start: 110, end: 175, label: '1:50 - AI Ilmiy Tyutor', title: 'Gemini AI bilan interaktiv formula va tushuntirish' },
    { start: 175, end: 230, label: '2:55 - O‘qituvchi Studiyasi', title: 'Topshiriqlar, sinf xonalari va jonli muhokama' },
    { start: 230, end: 270, label: '3:50 - Arxitektura & Kelajak', title: 'Natijalar, Roadmap va xulosa' }
  ];

  // Interactive Prototype Sandbox State
  const [simType, setSimType] = useState<'gravity' | 'circuits' | 'pendulum' | 'ph'>('gravity');
  const [simMass, setSimMass] = useState(5); // kg
  const [simGravity, setSimGravity] = useState(9.8); // m/s^2
  const [simVoltage, setSimVoltage] = useState(12); // V
  const [simResistance, setSimResistance] = useState(4); // Ohm
  const [simPhValue, setSimPhValue] = useState(7); // pH
  const [simRunning, setSimRunning] = useState(true);
  const [animTime, setAnimTime] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // API Console State
  const [selectedApi, setSelectedApi] = useState<string>('ai_message');
  const [apiRequestBody, setApiRequestBody] = useState<string>(
    JSON.stringify({ content: "Og'irlik kuchi va erkin tushish tezlanishining formulasini tushuntirib ber", subject: "Physics", mode: "formula" }, null, 2)
  );
  const [apiResponse, setApiResponse] = useState<string>('// "So\'rov yuborish" tugmasini bosing...');
  const [apiStatusCode, setApiStatusCode] = useState<number | null>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiCopiedCurl, setApiCopiedCurl] = useState<boolean>(false);

  // Video timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setVideoTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Determine active chapter from videoTime
  useEffect(() => {
    const chIdx = chapters.findIndex(c => videoTime >= c.start && videoTime < c.end);
    if (chIdx !== -1 && chIdx !== activeChapter) {
      setActiveChapter(chIdx);
    }
  }, [videoTime]);

  // Interactive Live Canvas Physics Engine
  useEffect(() => {
    let animId: number;
    let localT = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (simRunning) {
        localT += 0.03;
        setAnimTime(localT);
      }

      if (simType === 'gravity') {
        // Draw sky / ground
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Ground
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, h - 30, w, 30);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h - 30);
        ctx.lineTo(w, h - 30);
        ctx.stroke();

        // Calculate projectile / bouncing ball
        const bouncePeriod = Math.PI;
        const normalizedT = localT % bouncePeriod;
        const bounceHeight = (h - 90) * Math.abs(Math.sin(normalizedT));
        const ballY = (h - 45) - bounceHeight;
        const ballX = (w / 2) + Math.cos(localT * 0.5) * 80;
        const radius = Math.min(30, Math.max(12, simMass * 3));

        // Ball shadow
        const shadowScale = 1 - (bounceHeight / (h - 90)) * 0.6;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(ballX, h - 30, radius * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ball glow
        const grad = ctx.createRadialGradient(ballX - 5, ballY - 5, 2, ballX, ballY, radius);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#0284c7');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ballX, ballY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Velocity vector arrow
        const vel = -Math.cos(normalizedT) * (simGravity * 2.5);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ballX, ballY);
        ctx.lineTo(ballX, ballY + vel);
        ctx.stroke();

        // Force vector label
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`m = ${simMass} kg`, ballX + radius + 10, ballY - 5);
        ctx.fillStyle = '#f43f5e';
        ctx.fillText(`F = ${(simMass * simGravity).toFixed(1)} N`, ballX + radius + 10, ballY + 12);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`g = ${simGravity} m/s²`, 16, 26);
      } else if (simType === 'circuits') {
        // Draw circuit diagram
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        const current = simVoltage / simResistance;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(60, 40, w - 120, h - 80);

        // Battery symbol on left
        const midY = h / 2;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(50, midY - 30, 20, 60);

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(60, midY - 20);
        ctx.lineTo(60, midY + 20);
        ctx.stroke();

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(48, midY - 10);
        ctx.lineTo(48, midY + 10);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`+ ${simVoltage}V -`, 20, midY - 35);

        // Resistor on right
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(w - 70, midY - 30, 20, 60);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 8;
        ctx.strokeRect(w - 68, midY - 25, 16, 50);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`R = ${simResistance} Ω`, w - 105, midY + 45);

        // Moving electron particles along the wire
        const particleSpeed = current * 2;
        const numParticles = 14;
        ctx.fillStyle = '#38bdf8';

        for (let i = 0; i < numParticles; i++) {
          const prog = ((localT * particleSpeed + i * (100 / numParticles)) % 100) / 100;
          // Wire path perimeter
          const perimeter = 2 * (w - 120) + 2 * (h - 80);
          const dist = prog * perimeter;
          let px = 60;
          let py = 40;

          const topW = w - 120;
          const rightH = h - 80;

          if (dist < topW) {
            px = 60 + dist;
            py = 40;
          } else if (dist < topW + rightH) {
            px = 60 + topW;
            py = 40 + (dist - topW);
          } else if (dist < 2 * topW + rightH) {
            px = 60 + topW - (dist - (topW + rightH));
            py = 40 + rightH;
          } else {
            px = 60;
            py = 40 + rightH - (dist - (2 * topW + rightH));
          }

          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Stats in center
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(`I = U / R = ${current.toFixed(2)} A`, w / 2 - 80, midY - 10);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px sans-serif';
        ctx.fillText(`Quvvat P = ${(simVoltage * current).toFixed(1)} W`, w / 2 - 60, midY + 18);
      } else if (simType === 'pendulum') {
        // Draw oscillating pendulum
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        const pivotX = w / 2;
        const pivotY = 30;
        const length = h - 100;
        const angle = 0.5 * Math.sin(localT * Math.sqrt(simGravity / 2));

        const bobX = pivotX + length * Math.sin(angle);
        const bobY = pivotY + length * Math.cos(angle);

        // Pivot mount
        ctx.fillStyle = '#64748b';
        ctx.fillRect(pivotX - 30, pivotY - 10, 60, 10);

        // String
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        // Pendulum bob
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(bobX, bobY, simMass * 3 + 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c4b5fd';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Stats
        const period = (2 * Math.PI * Math.sqrt(2 / simGravity)).toFixed(2);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`Tebranish davri: T ≈ ${period} s`, 16, 26);
        ctx.fillText(`Garmonik tebranish (Energiya saqlanishi)`, 16, 46);
      } else if (simType === 'ph') {
        // Draw chemical beaker with pH scale
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Beaker body
        const bx = w / 2 - 80;
        const by = 40;
        const bw = 160;
        const bh = h - 80;

        // Solution color based on pH
        let color = '#3b82f6'; // Neutral
        if (simPhValue < 7) {
          // Acid (red/orange)
          const ratio = (7 - simPhValue) / 7;
          color = `rgb(${Math.round(239 * ratio + 59 * (1 - ratio))}, ${Math.round(68 * ratio + 130 * (1 - ratio))}, ${Math.round(68 * ratio + 246 * (1 - ratio))})`;
        } else if (simPhValue > 7) {
          // Base (purple/blue)
          const ratio = (simPhValue - 7) / 7;
          color = `rgb(${Math.round(139 * ratio + 59 * (1 - ratio))}, ${Math.round(92 * ratio + 130 * (1 - ratio))}, ${Math.round(246 * ratio + 246 * (1 - ratio))})`;
        }

        ctx.fillStyle = color;
        ctx.fillRect(bx + 6, by + 40, bw - 12, bh - 46);

        // Beaker glass outline
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.strokeRect(bx, by, bw, bh);

        // Measurement lines on beaker
        for (let i = 1; i <= 4; i++) {
          const ly = by + bh - (i * 35);
          ctx.beginPath();
          ctx.moveTo(bx + 6, ly);
          ctx.lineTo(bx + 26, ly);
          ctx.stroke();
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px sans-serif';
          ctx.fillText(`${i * 100} ml`, bx + 30, ly + 3);
        }

        // Bubbles in beaker
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        for (let i = 0; i < 5; i++) {
          const bpx = bx + 20 + ((localT * 20 + i * 30) % (bw - 40));
          const bpy = by + bh - 20 - ((localT * 40 + i * 25) % (bh - 60));
          ctx.beginPath();
          ctx.arc(bpx, bpy, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // pH Probe
        ctx.fillStyle = '#475569';
        ctx.fillRect(w / 2 + 20, 20, 14, 100);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(w / 2 + 22, 115, 10, 25);

        // Text summary
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px sans-serif';
        const typeStr = simPhValue < 7 ? 'KISLOTA (Acidic)' : simPhValue > 7 ? 'ISHQOR (Basic)' : 'NEYTRAL (Neutral)';
        ctx.fillText(`pH = ${simPhValue.toFixed(1)} : ${typeStr}`, 16, 30);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`[H+] = 10^-${simPhValue.toFixed(1)} mol/L`, 16, 50);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [simType, simMass, simGravity, simVoltage, simResistance, simPhValue, simRunning]);

  // Handle API Execution in live console
  const handleExecuteApi = async () => {
    setApiLoading(true);
    setApiStatusCode(null);
    setApiLatency(null);

    const startTime = performance.now();

    try {
      let endpoint = '';
      let method = 'GET';
      let payload: any = null;

      if (selectedApi === 'ai_message') {
        endpoint = '/api/ai/conversations/conv_demo_pitch/messages';
        method = 'POST';
        payload = JSON.parse(apiRequestBody);
      } else if (selectedApi === 'catalog_stats') {
        endpoint = '/api/catalog-stats';
        method = 'GET';
      } else if (selectedApi === 'simulations') {
        endpoint = '/api/simulations?limit=5';
        method = 'GET';
      } else if (selectedApi === 'auth_otp') {
        endpoint = '/api/auth/send-otp';
        method = 'POST';
        payload = JSON.parse(apiRequestBody);
      } else if (selectedApi === 'health') {
        endpoint = '/api/health';
        method = 'GET';
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user_super_admin'
        },
        body: payload ? JSON.stringify(payload) : undefined
      });

      const endTime = performance.now();
      setApiLatency(Math.round(endTime - startTime));
      setApiStatusCode(res.status);

      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      const endTime = performance.now();
      setApiLatency(Math.round(endTime - startTime));
      setApiStatusCode(500);
      setApiResponse(JSON.stringify({ error: err?.message || 'API request error' }, null, 2));
    } finally {
      setApiLoading(false);
    }
  };

  // Switch API Template
  const handleSelectApiTemplate = (apiKey: string) => {
    setSelectedApi(apiKey);
    if (apiKey === 'ai_message') {
      setApiRequestBody(
        JSON.stringify({ content: "Og'irlik kuchi va erkin tushish tezlanishining formulasini tushuntirib ber", subject: "Physics", mode: "formula" }, null, 2)
      );
    } else if (apiKey === 'catalog_stats') {
      setApiRequestBody('// Ushbu GET so\'rovi uchun tana (Body) talab qilinmaydi');
    } else if (apiKey === 'simulations') {
      setApiRequestBody('// Ushbu GET so\'rovi uchun tana (Body) talab qilinmaydi');
    } else if (apiKey === 'auth_otp') {
      setApiRequestBody(
        JSON.stringify({ email: "sobirboboyorov13@gmail.com" }, null, 2)
      );
    } else if (apiKey === 'health') {
      setApiRequestBody('// Ushbu GET so\'rovi uchun tana (Body) talab qilinmaydi');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const copyCurlCode = () => {
    let curl = '';
    if (selectedApi === 'ai_message') {
      curl = `curl -X POST "${window.location.origin}/api/ai/conversations/conv_demo/messages" \\\n  -H "Content-Type: application/json" \\\n  -d '${apiRequestBody.replace(/\n\s*/g, ' ')}'`;
    } else if (selectedApi === 'catalog_stats') {
      curl = `curl -X GET "${window.location.origin}/api/catalog-stats"`;
    } else if (selectedApi === 'simulations') {
      curl = `curl -X GET "${window.location.origin}/api/simulations?limit=5"`;
    } else if (selectedApi === 'auth_otp') {
      curl = `curl -X POST "${window.location.origin}/api/auth/send-otp" \\\n  -H "Content-Type: application/json" \\\n  -d '${apiRequestBody.replace(/\n\s*/g, ' ')}'`;
    } else {
      curl = `curl -X GET "${window.location.origin}/api/health"`;
    }

    navigator.clipboard.writeText(curl);
    setApiCopiedCurl(true);
    setTimeout(() => setApiCopiedCurl(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pb-24">
      
      {/* Top Competition Showcase Bar */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md px-4 py-3 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <StemLogo size="sm" showText={false} />
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/25">
                <Trophy className="size-3.5" />
                <span>TANLOV TAQDIMOTI & DEMO</span>
              </span>
              <span className="hidden md:inline text-xs text-muted-foreground font-medium">
                STEM-Simulations Ekotizimi
              </span>
            </div>
          </div>

          {/* Quick anchor links */}
          <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <a href="#muammo-yechim" className="px-2.5 py-1 rounded-lg hover:bg-muted hover:text-foreground transition">
              Muammo & Yechim
            </a>
            <a href="#demo-video" className="px-2.5 py-1 rounded-lg hover:bg-muted hover:text-foreground transition">
              Demo Video & Slaydlar
            </a>
            <a href="#ishlaydigan-prototip" className="px-2.5 py-1 rounded-lg hover:bg-muted hover:text-foreground transition">
              Jonli Prototip
            </a>
            <a href="#api-konsoli" className="px-2.5 py-1 rounded-lg hover:bg-muted hover:text-foreground transition">
              API Konsol
            </a>
            <a href="#jamoa-roadmap" className="px-2.5 py-1 rounded-lg hover:bg-muted hover:text-foreground transition">
              Jamoa & Roadmap
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(window.location.href)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition cursor-pointer"
              title="Sahifa havolasidan nusxa olish"
            >
              {isCopied ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
              <span>{isCopied ? 'Nusxa olindi!' : 'Ulashish'}</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-2xs"
            >
              <Compass className="size-3.5" />
              <span>Asosiy Platformaga Kirish</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Showcase Header */}
      <section className="relative overflow-hidden border-b border-border bg-radial-[at_top_center] from-primary/10 via-background to-background py-14 sm:py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-6 animate-pulse">
            <Sparkles className="size-3.5" />
            <span>Innovatsion Taʼlim Texnologiyalari Tanlovi Taqdimoti</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            O‘zbekiston Maktablari Uchun <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              119+ Interaktiv STEM Laboratoriyalari
            </span> <br />
            va Sunʼiy Intellekt Ilmiy Tyutori
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Qimmatbaho uskunalar va xavfli reaktivlarsiz zamonaviy ilm-fanni o‘rganish imkoniyati. 
            100% o‘zbek tilida, Gemini AI yordamida interaktiv tushuntirishlar va formulalar bilan boyitilgan.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
              <div className="font-display text-2xl font-black text-primary">119+</div>
              <div className="text-[11px] font-medium text-muted-foreground mt-0.5">Simulyatsiyalar</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
              <div className="font-display text-2xl font-black text-emerald-600 dark:text-emerald-400">5 ta</div>
              <div className="text-[11px] font-medium text-muted-foreground mt-0.5">STEM Fani</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
              <div className="font-display text-2xl font-black text-accent">100%</div>
              <div className="text-[11px] font-medium text-muted-foreground mt-0.5">O‘zbek Tilida</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
              <div className="font-display text-2xl font-black text-blue-600 dark:text-blue-400">&lt; 1.2s</div>
              <div className="text-[11px] font-medium text-muted-foreground mt-0.5">AI Tyutor Tezligi</div>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
              <div className="font-display text-2xl font-black text-rose-600 dark:text-rose-400">0 so‘m</div>
              <div className="text-[11px] font-medium text-muted-foreground mt-0.5">Maktab Xarajati</div>
            </div>
          </div>

          {/* Action Jump Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#demo-video"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs"
            >
              <Play className="size-4 fill-current" />
              <span>1-5 Daqiqalik Demo Videoni Ko‘rish</span>
            </a>

            <a
              href="#ishlaydigan-prototip"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-xs font-bold text-foreground hover:bg-muted transition"
            >
              <FlaskConical className="size-4 text-accent" />
              <span>Jonli Prototipni Sinab Ko‘rish</span>
            </a>

            <a
              href="#api-konsoli"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-xs font-bold text-foreground hover:bg-muted transition"
            >
              <Code2 className="size-4 text-emerald-600" />
              <span>API Test Konsolini Ochish</span>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 1: MUAMMO VA YECHIM (PROBLEM & SOLUTION) */}
      <section id="muammo-yechim" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-border">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 mb-3">
            <AlertCircle className="size-3.5" />
            <span>MUAMMO VA YECHIM TAQDIMOTI</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-foreground">
            Nega STEM-Simulations Taʼlim Uchun Muhim?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Anʼanaviy darsliklar va amaliyot o‘rtasidagi tafovutni bartaraf etuvchi keng qamrovli tahlil
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* PROBLEM CARD */}
          <div className="rounded-3xl border border-rose-500/25 bg-rose-500/5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-600">
                  <AlertCircle className="size-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-rose-900 dark:text-rose-200">
                    Mavjud Muammolar (Problems)
                  </h3>
                  <p className="text-xs text-rose-800/80 dark:text-rose-300/80">O‘zbekiston maktablaridagi real holat</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="rounded-2xl border border-rose-500/20 bg-background/80 p-4">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 text-xs font-bold">1</span>
                    Laboratoriya Jihozlari va Mablag‘ Yetishmovchiligi
                  </h4>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    Respublikadagi 10,000 dan ortiq maktablarning aksariyatida zamonaviy fizika va kimyo laboratoriyalari mavjud emas yoki eskirgan.
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-500/20 bg-background/80 p-4">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 text-xs font-bold">2</span>
                    Xavfli Reaktivlar va Tajribalarni Qaytarib Bo‘lmasligi
                  </h4>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    Haqiqiy kimyoviy moddalar qimmat, zaharli va xavfli. O‘quvchi xato qilganda tajribani qayta-qayta takrorlash imkoni deyarli yo‘q.
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-500/20 bg-background/80 p-4">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 text-xs font-bold">3</span>
                    Shaxsiy Repetitor va Individual Yordam Tanqisligi
                  </h4>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    Bitta sinfda 30 dan ortiq o‘quvchi o‘qiydi. O‘qituvchi har bir bolaning tushunmagan savoliga dars vaqtida shaxsiy tushuntirish bera olmaydi.
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-500/20 bg-background/80 p-4">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 text-xs font-bold">4</span>
                    Til To‘sig‘i va Kontentning Tarqoqligi
                  </h4>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    Xalqaro sifatli interaktiv ilmiy kontentlar ingliz tilida bo‘lib, o‘quvchilar va ustozlar uchun tushunarsiz va tarqoq holatda edi.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-rose-500/10 p-3.5 text-center text-xs font-semibold text-rose-700 dark:text-rose-300">
              Natija: O‘quvchilar ilm-fanni quruq yodlashga majbur bo‘ladi va STEM mutaxassisliklariga qiziqish so‘nadi.
            </div>
          </div>

          {/* SOLUTION CARD */}
          <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-emerald-900 dark:text-emerald-200">
                    Bizning Yechimimiz (Our Solutions)
                  </h3>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">STEM-Simulations innovatsion ekotizimi</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="rounded-2xl border border-emerald-500/20 bg-background/80 p-4">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-bold">✓</span>
                    119+ Interaktiv Virtual Laboratoriyalar
                  </h4>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    Oddiy smartfon yoki kompyuter brauzerida ishlovchi, xalqaro Kolorado Universiteti (PhET) tajribalari asosidagi sifatli laboratoriyalar.
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-background/80 p-4">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-bold">✓</span>
                    100% Xavfsiz, Cheksiz Tajribalar Sandboxi
                  </h4>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    Slayderlarni surib, massani, kuchlanishni yoki gravitatsiyani o‘zgartiring. Hech qanday xavf yo‘q, tajribani ming marta qaytarish mumkin!
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-background/80 p-4">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-bold">✓</span>
                    24/7 Gemini AI Ilmiy Tyutor & Formula Dvigateli
                  </h4>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    O‘quvchi har bir simulyatsiyadan chiqmagan holda AI bilan muloqot qiladi. Formulalar, fizika qonunlari va amaliy misollar o‘zbek tilida beriladi.
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-background/80 p-4">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-bold">✓</span>
                    O‘qituvchi Studiyasi va Sinf Hamjamiyati
                  </h4>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    Ustozlar dars rejalari va yangi simulyatsiya topshiriqlarini yaratishi, o‘quvchilar esa guruhlarda natijalarni muhokama qilishi mumkin.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-emerald-500/10 p-3.5 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Natija: Har bir o‘quvchi ilmiy qonuniyatlarni o‘zi kashf qiladi va bilimlarni 3 barobar yaxshiroq o‘zlashtiradi!
            </div>
          </div>

        </div>

        {/* Comparison Matrix Table */}
        <div className="mt-12 rounded-3xl border border-border bg-card overflow-hidden shadow-2xs">
          <div className="bg-muted/50 p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground">
              Taqqoslash: Anʼanaviy Maktab Laboratoriyasi vs STEM-Simulations
            </h3>
            <span className="text-xs text-muted-foreground font-medium">Bozor Tahlili</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/20 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="p-3.5 sm:p-4">Parametr</th>
                  <th className="p-3.5 sm:p-4 text-rose-600 dark:text-rose-400">Anʼanaviy Laboratoriya</th>
                  <th className="p-3.5 sm:p-4 text-emerald-600 dark:text-emerald-400">STEM-Simulations Ekotizimi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-foreground">Moddiy Xarajat</td>
                  <td className="p-3.5 sm:p-4 text-muted-foreground">Maktab boshiga $5,000 - $20,000+</td>
                  <td className="p-3.5 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">0 so‘m (Mutlaqo bepul)</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-foreground">Xavfsizlik Darajasi</td>
                  <td className="p-3.5 sm:p-4 text-muted-foreground">Reaktivlar bilan kuyish, tok urish xavfi</td>
                  <td className="p-3.5 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">100% Xavfsiz virtual muhit</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-foreground">Tajribani Takrorlash</td>
                  <td className="p-3.5 sm:p-4 text-muted-foreground">Cheklangan (reaktivlar tugaydi)</td>
                  <td className="p-3.5 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">Cheksiz marotaba parametrlarni o‘zgartirish</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-foreground">Ilmiy Yo‘l-yo‘riq (Repetitor)</td>
                  <td className="p-3.5 sm:p-4 text-muted-foreground">Faqat dars paytida (1 o‘qituvchi 35 bolaga)</td>
                  <td className="p-3.5 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">24/7 Gemini AI Shaxsiy Tyutori</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-foreground">Lokalizatsiya va Til</td>
                  <td className="p-3.5 sm:p-4 text-muted-foreground">Eski kitoblar yoki chet tilidagi saytlar</td>
                  <td className="p-3.5 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">100% O‘zbek tilida zamonaviy interfeys</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 2: 1-5 DAQIQALIK DEMO VIDEO VA TAQDIMOT SLAYDLARI */}
      <section id="demo-video" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-border">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">
              <Play className="size-3.5" />
              <span>1-5 DAQIQALIK DEMO VIDEO & SLAYDLAR</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-foreground">
              Interaktiv Demo Walkthrough & Taqdimot
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Loyihaning to‘liq imkoniyatlari bilan tanishish uchun video yoki taqdimot slaydlarini tanlang
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 rounded-2xl bg-muted p-1 border border-border shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Play className="size-3.5 fill-current" />
              <span>🎥 Interaktiv Demo Video ({formatSeconds(videoTime)} / {formatSeconds(totalDuration)})</span>
            </button>

            <button
              onClick={() => setActiveTab('slides')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === 'slides'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="size-3.5" />
              <span>📊 Taqdimot Slaydlari ({currentSlideIndex + 1}/{PRESENTATION_SLIDES.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE DEMO VIDEO PLAYER */}
        {activeTab === 'video' && (
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-md">
            
            {/* Virtual Screen Simulation / Canvas Walkthrough */}
            <div className="relative aspect-video max-h-[540px] w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
              
              {/* Background Animated Demo Viewport */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 z-0">
                {/* Simulated Screen Content based on Active Chapter */}
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex size-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-mono uppercase font-bold tracking-wider">
                      STEM-Simulations v2.4 Live System Walkthrough
                    </span>
                  </div>
                  <div className="font-mono bg-slate-800/80 px-2.5 py-1 rounded-md text-[11px] text-slate-300">
                    Chapter {activeChapter + 1} / {chapters.length}
                  </div>
                </div>

                {/* Main Dynamic Walkthrough Graphic */}
                <div className="my-auto text-center max-w-2xl mx-auto space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-4 py-1.5 text-xs font-bold text-sky-300">
                    <Sparkles className="size-4" />
                    <span>{chapters[activeChapter].label}</span>
                  </div>

                  <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {chapters[activeChapter].title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                    {activeChapter === 0 && 'O‘zbekiston maktablaridagi laboratoriya muammosi va STEM-Simulations loyihasining paydo bo‘lishi.'}
                    {activeChapter === 1 && '119 ta simulyatsiyadan iborat katalog, fizika, kimyo va matematika laboratoriyalarini boshqarish jarayoni.'}
                    {activeChapter === 2 && 'Sunʼiy intellekt repetitori qanday qilib o‘quvchi savollariga javob beradi va formulalarni hisoblaydi.'}
                    {activeChapter === 3 && 'O‘qituvchilar uchun maxsus studio, o‘quv topshiriqlari yaratish va sinf xonalari muhokamalari.'}
                    {activeChapter === 4 && 'Loyiha arxitekturasi, tezkor ishlash mexanizmlari, 2025-2026 roadmap va hakamlar uchun xulosa.'}
                  </p>

                  {/* Animated Visual Badges */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-700 px-3 py-1.5 text-xs text-slate-200">
                      <Cpu className="size-3.5 text-sky-400" />
                      <span>Zero-Lag Engine</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-700 px-3 py-1.5 text-xs text-slate-200">
                      <Zap className="size-3.5 text-amber-400" />
                      <span>Gemini 2.5/3.7 AI</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-700 px-3 py-1.5 text-xs text-slate-200">
                      <Globe className="size-3.5 text-emerald-400" />
                      <span>100% O‘zbekcha</span>
                    </div>
                  </div>
                </div>

                {/* Subtitle / Transcript Banner */}
                {showTranscript && (
                  <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-center text-xs text-slate-300">
                    <span className="font-bold text-sky-400 mr-2">[Ovozli sharh]:</span>
                    {activeChapter === 0 && 'Assalomu alaykum! Ushbu videoda siz maktablarda STEM taʼlimini inqilobiy o‘zgartiruvchi STEM-Simulations platformasi bilan tanishasiz.'}
                    {activeChapter === 1 && 'Platformamizda 119 dan ortiq PhET laboratoriyalari to‘liq o‘zbek tiliga tarjima qilingan. O‘quvchi barcha parametrlarni bevosita ekranda sinab ko‘radi.'}
                    {activeChapter === 2 && 'Eng muhim yangilik — Gemini AI ilmiy tyutori. U o‘quvchining har bir harakatini tahlil qilib, unga shaxsiy yo‘l-yo‘riq ko‘rsatadi.'}
                    {activeChapter === 3 && 'Ustozlar uchun alohida kabinet mavjud bo‘lib, ular o‘z topshiriqlarini tuzishlari va sinflar bilan real vaqtda bog‘lanishlari mumkin.'}
                    {activeChapter === 4 && 'Loyiha React 19 va zamonaviy xavfsiz arxitekturada qurilgan. Bizning maqsadimiz — 6.5 million o‘quvchiga erkin taʼlim berish!'}
                  </div>
                )}
              </div>

              {/* Big Overlay Play Button when paused */}
              {!isPlaying && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="relative z-10 flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-110 transition cursor-pointer"
                  title="Videoni boshlash"
                >
                  <Play className="size-9 fill-current ml-1" />
                </button>
              )}
            </div>

            {/* Video Controls & Chapter Seek Bar */}
            <div className="p-4 sm:p-5 bg-card border-t border-border space-y-3">
              
              {/* Progress Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-muted-foreground">
                  {formatSeconds(videoTime)}
                </span>

                <div className="relative flex-1 group">
                  <input
                    type="range"
                    min={0}
                    max={totalDuration}
                    value={videoTime}
                    onChange={(e) => setVideoTime(Number(e.target.value))}
                    className="w-full accent-primary h-2 rounded-lg cursor-pointer bg-muted"
                  />
                  {/* Chapter dividers overlay */}
                  <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-1">
                    {chapters.map((ch, idx) => (
                      <div
                        key={idx}
                        className="size-2 rounded-full bg-primary/40 -translate-y-px"
                        title={ch.label}
                      />
                    ))}
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold text-muted-foreground">
                  {formatSeconds(totalDuration)}
                </span>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-2xs cursor-pointer"
                  >
                    {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={() => setVideoTime(0)}
                    className="flex size-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-muted transition cursor-pointer"
                    title="Qaytadan boshlash"
                  >
                    <RotateCw className="size-4 text-muted-foreground" />
                  </button>

                  <div className="h-5 w-px bg-border mx-1" />

                  {/* Playback speed selector */}
                  <div className="flex items-center gap-1 text-xs">
                    {[1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-1 rounded-lg font-semibold transition cursor-pointer ${
                          playbackSpeed === spd
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chapter Quick Jump Buttons */}
                <div className="hidden md:flex items-center gap-1.5">
                  {chapters.map((ch, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setVideoTime(ch.start);
                        setIsPlaying(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        activeChapter === idx
                          ? 'bg-primary text-primary-foreground shadow-2xs'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {ch.label.split(' - ')[0]}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      showTranscript
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    <FileText className="size-3.5" />
                    <span>Matnli Sharh</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PITCH DECK PRESENTATION SLIDES */}
        {activeTab === 'slides' && (
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-md">
            
            {/* Current Active Slide Card */}
            <div className={`p-6 sm:p-10 bg-gradient-to-br ${PRESENTATION_SLIDES[currentSlideIndex].accentColor} border-b border-border`}>
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3.5 py-1 text-xs font-bold shadow-2xs">
                  <Trophy className="size-3.5 text-primary" />
                  <span>{PRESENTATION_SLIDES[currentSlideIndex].badge}</span>
                </span>

                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-background/80 px-3 py-1 rounded-full shadow-2xs">
                  <span>Slayd {currentSlideIndex + 1} / {PRESENTATION_SLIDES.length}</span>
                </div>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                {PRESENTATION_SLIDES[currentSlideIndex].title}
              </h3>

              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
                {PRESENTATION_SLIDES[currentSlideIndex].subtitle}
              </p>

              {/* Bullet Points */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESENTATION_SLIDES[currentSlideIndex].points.map((point, pIdx) => {
                  const parts = point.split(': ');
                  return (
                    <div key={pIdx} className="rounded-2xl border border-border/80 bg-background/90 p-4 shadow-2xs">
                      <div className="font-bold text-foreground text-sm flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-primary shrink-0" />
                        <span>{parts[0]}</span>
                      </div>
                      {parts[1] && (
                        <p className="mt-1 text-xs text-muted-foreground pl-6 leading-relaxed">
                          {parts[1]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Metrics Bar */}
              {PRESENTATION_SLIDES[currentSlideIndex].metrics && (
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESENTATION_SLIDES[currentSlideIndex].metrics?.map((m, mIdx) => (
                    <div key={mIdx} className="rounded-xl border border-border/60 bg-background/80 p-3 text-center">
                      <div className="font-display text-xl font-black text-foreground">{m.value}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Speaker Notes Toggle */}
              {showSpeakerNotes && (
                <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300">
                    <BookOpen className="size-3.5" />
                    <span>Hakamlar va Spiker uchun Eslatma:</span>
                  </div>
                  <p>{PRESENTATION_SLIDES[currentSlideIndex].notes}</p>
                </div>
              )}

            </div>

            {/* Slide Navigation Controls */}
            <div className="p-4 sm:p-5 bg-card flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2">
                <button
                  disabled={currentSlideIndex === 0}
                  onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                  className="flex items-center gap-1 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                  <span>Oldingi</span>
                </button>

                <button
                  disabled={currentSlideIndex === PRESENTATION_SLIDES.length - 1}
                  onClick={() => setCurrentSlideIndex(prev => Math.min(PRESENTATION_SLIDES.length - 1, prev + 1))}
                  className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <span>Keyingi</span>
                  <ChevronRight className="size-4" />
                </button>

                <div className="h-5 w-px bg-border mx-1" />

                <button
                  onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    showSpeakerNotes
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  {showSpeakerNotes ? 'Eslatmani yashirish' : 'Spiker eslatmalari'}
                </button>
              </div>

              {/* Thumbnails indicator */}
              <div className="flex items-center gap-1.5">
                {PRESENTATION_SLIDES.map((slide, sIdx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(sIdx)}
                    className={`size-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                      currentSlideIndex === sIdx
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {slide.id}
                  </button>
                ))}
              </div>

            </div>

          </div>
        )}

      </section>

      {/* SECTION 3: ISHLAYDIGAN PROTOTIP (INTERACTIVE LIVE PROTOTYPE SANDBOX) */}
      <section id="ishlaydigan-prototip" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-border">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3">
            <FlaskConical className="size-3.5" />
            <span>ISHLAYDIGAN PROTOTIP & JONLI TAJRIBA</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-foreground">
            Sahifada Jonli Ishlovchi Interaktiv Laboratoriya
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hakamlar parametrlarni o‘zgartirib, real vaqtda fizik va kimyoviy jarayonlarni sinab ko‘rishlari mumkin
          </p>
        </div>

        {/* Live Interactive Canvas Lab */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-3">
          
          {/* Controls Column */}
          <div className="p-6 sm:p-8 bg-muted/20 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Cpu className="size-4 text-primary" />
                  Laboratoriya Rejimi
                </h3>
                <span className="text-[11px] font-mono text-muted-foreground">Canvas 60 FPS</span>
              </div>

              {/* Lab Selector */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                <button
                  onClick={() => setSimType('gravity')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    simType === 'gravity'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="text-xs font-bold">1. Gravitatsiya</div>
                  <div className="text-[10px] opacity-75">Nyuton qonuni</div>
                </button>

                <button
                  onClick={() => setSimType('circuits')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    simType === 'circuits'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="text-xs font-bold">2. Elektr Zanjiri</div>
                  <div className="text-[10px] opacity-75">Ohm qonuni (I=U/R)</div>
                </button>

                <button
                  onClick={() => setSimType('pendulum')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    simType === 'pendulum'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="text-xs font-bold">3. Mayatnik</div>
                  <div className="text-[10px] opacity-75">Garmonik tebranish</div>
                </button>

                <button
                  onClick={() => setSimType('ph')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    simType === 'ph'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="text-xs font-bold">4. Kimyo: pH</div>
                  <div className="text-[10px] opacity-75">Kislota va ishqor</div>
                </button>
              </div>

              {/* Dynamic Interactive Sliders */}
              <div className="space-y-4">
                {simType === 'gravity' && (
                  <>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Jism massasi (m):</span>
                        <span className="font-mono text-primary font-bold">{simMass} kg</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={simMass}
                        onChange={(e) => setSimMass(Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Gravitatsiya tezlanishi (g):</span>
                        <span className="font-mono text-primary font-bold">{simGravity} m/s²</span>
                      </div>
                      <input
                        type="range"
                        min="1.6"
                        max="24"
                        step="0.2"
                        value={simGravity}
                        onChange={(e) => setSimGravity(Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>Oy (1.6)</span>
                        <span>Yer (9.8)</span>
                        <span>Yupiter (24.0)</span>
                      </div>
                    </div>
                  </>
                )}

                {simType === 'circuits' && (
                  <>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Kuchlanish (U):</span>
                        <span className="font-mono text-primary font-bold">{simVoltage} V</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        step="1"
                        value={simVoltage}
                        onChange={(e) => setSimVoltage(Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Qarshilik (R):</span>
                        <span className="font-mono text-primary font-bold">{simResistance} Ω</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={simResistance}
                        onChange={(e) => setSimResistance(Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {simType === 'pendulum' && (
                  <>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Gravitatsiya (g):</span>
                        <span className="font-mono text-primary font-bold">{simGravity} m/s²</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="20"
                        step="0.5"
                        value={simGravity}
                        onChange={(e) => setSimGravity(Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Yuk massasi (m):</span>
                        <span className="font-mono text-primary font-bold">{simMass} kg</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        step="0.5"
                        value={simMass}
                        onChange={(e) => setSimMass(Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {simType === 'ph' && (
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>pH Qiymati:</span>
                      <span className="font-mono text-primary font-bold">{simPhValue.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="14"
                      step="0.2"
                      value={simPhValue}
                      onChange={(e) => setSimPhValue(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Kuchli kislota (0)</span>
                      <span>Suv (7)</span>
                      <span>Ishqor (14)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Simulation Play/Pause Controls */}
            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <button
                onClick={() => setSimRunning(!simRunning)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-2xs cursor-pointer"
              >
                {simRunning ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
                <span>{simRunning ? 'To‘xtatish' : 'Harakatlantirish'}</span>
              </button>

              <button
                onClick={() => {
                  setSimMass(5);
                  setSimGravity(9.8);
                  setSimVoltage(12);
                  setSimResistance(4);
                  setSimPhValue(7);
                }}
                className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
                title="Boshlang‘ich holatga qaytarish"
              >
                <RotateCw className="size-4" />
              </button>
            </div>
          </div>

          {/* Interactive Live Canvas Column */}
          <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col items-center justify-center bg-slate-950">
            <div className="w-full max-w-lg aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
              <canvas
                ref={canvasRef}
                width={512}
                height={288}
                className="w-full h-full block bg-slate-900"
              />
            </div>

            <div className="mt-4 flex items-center justify-between w-full max-w-lg text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Jonli matematik hisob-kitoblar faol</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                HTML5 2D Canvas Engine
              </span>
            </div>
          </div>

        </div>

        {/* Quick Launch Cards to Full Platform Modules */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/catalog"
            className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3 group-hover:scale-110 transition">
                <Compass className="size-5" />
              </div>
              <h4 className="font-bold text-foreground text-sm">119+ Simulyatsiyalar Katalogi</h4>
              <p className="mt-1 text-xs text-muted-foreground">Fizika, kimyo, biologiya va matematika tajribalari to‘plami</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary">
              <span>Katalogni ochish</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            href="/ai-tutor"
            className="group rounded-2xl border border-border bg-card p-5 hover:border-accent/50 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent mb-3 group-hover:scale-110 transition">
                <Sparkles className="size-5" />
              </div>
              <h4 className="font-bold text-foreground text-sm">Gemini AI Ilmiy Tyutor</h4>
              <p className="mt-1 text-xs text-muted-foreground">Formulalar generatori, Sokratik dars va interaktiv savol-javob</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-accent">
              <span>Tyutorni sinash</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            href="/studio"
            className="group rounded-2xl border border-border bg-card p-5 hover:border-amber-500/50 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mb-3 group-hover:scale-110 transition">
                <FlaskConical className="size-5" />
              </div>
              <h4 className="font-bold text-foreground text-sm">O‘qituvchi Studiyasi</h4>
              <p className="mt-1 text-xs text-muted-foreground">Yangi simulyatsiyalar, dars mashg‘ulotlari va testlar yaratish</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600">
              <span>Studiyaga kirish</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            href="/community"
            className="group rounded-2xl border border-border bg-card p-5 hover:border-blue-500/50 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 mb-3 group-hover:scale-110 transition">
                <Users className="size-5" />
              </div>
              <h4 className="font-bold text-foreground text-sm">Sinf Hamjamiyati</h4>
              <p className="mt-1 text-xs text-muted-foreground">O‘quvchilar va sinflar o‘rtasida real vaqtda ilmiy muhokamalar</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
              <span>Hamjamiyatni ko‘rish</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>

      </section>

      {/* SECTION 4: API INTEGRATSIYA VA JONLI TEST KONSOLI */}
      <section id="api-konsoli" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-border">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 mb-3">
            <Code2 className="size-3.5" />
            <span>API INTEGRATSIYALARI VA JONLI TEST KONSOLI</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-foreground">
            Hakamlar va Dasturchilar Uchun Jonli API Playground
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Haqiqiy server API endpointlarini tanlab, to‘g‘ridan-to‘g‘ri brauzer orqali sinab ko‘ring va JSON javoblarni tekshiring
          </p>
        </div>

        {/* API Console Interface */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-lg">
          
          {/* Endpoint Selector Tabs */}
          <div className="bg-muted/50 p-3 sm:p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSelectApiTemplate('ai_message')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedApi === 'ai_message'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md mr-1.5 font-mono">POST</span>
                /api/ai/.../messages
              </button>

              <button
                onClick={() => handleSelectApiTemplate('catalog_stats')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedApi === 'catalog_stats'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md mr-1.5 font-mono">GET</span>
                /api/catalog-stats
              </button>

              <button
                onClick={() => handleSelectApiTemplate('simulations')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedApi === 'simulations'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md mr-1.5 font-mono">GET</span>
                /api/simulations
              </button>

              <button
                onClick={() => handleSelectApiTemplate('auth_otp')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedApi === 'auth_otp'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md mr-1.5 font-mono">POST</span>
                /api/auth/send-otp
              </button>

              <button
                onClick={() => handleSelectApiTemplate('health')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedApi === 'health'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md mr-1.5 font-mono">GET</span>
                /api/health
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyCurlCode}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
                title="cURL buyrug‘idan nusxa olish"
              >
                {apiCopiedCurl ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                <span>{apiCopiedCurl ? 'cURL nusxalandi!' : 'cURL nusxalash'}</span>
              </button>
            </div>
          </div>

          {/* Request and Response Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
            
            {/* Request Editor */}
            <div className="p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    So‘rov parametrlari (Request Payload)
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">JSON</span>
                </div>

                <textarea
                  value={apiRequestBody}
                  onChange={(e) => setApiRequestBody(e.target.value)}
                  rows={9}
                  className="w-full font-mono text-xs rounded-2xl border border-border bg-muted/30 p-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-[11px] text-muted-foreground">
                  Haqiqiy backend serveriga yuboriladi
                </div>

                <button
                  disabled={apiLoading}
                  onClick={handleExecuteApi}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition shadow-2xs cursor-pointer"
                >
                  {apiLoading ? (
                    <RotateCw className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  <span>{apiLoading ? 'Yuborilmoqda...' : 'So‘rov Yuborish'}</span>
                </button>
              </div>
            </div>

            {/* Response Viewer */}
            <div className="p-4 sm:p-6 bg-slate-950 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2 text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Server Javobi (Response)
                  </span>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    {apiStatusCode && (
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        apiStatusCode === 200
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {apiStatusCode} OK
                      </span>
                    )}
                    {apiLatency && (
                      <span className="text-slate-400 text-[11px]">
                        {apiLatency} ms
                      </span>
                    )}
                  </div>
                </div>

                <pre className="font-mono text-xs text-sky-300 bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 max-h-[220px] overflow-auto whitespace-pre-wrap leading-relaxed">
                  {apiResponse}
                </pre>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                <span>Content-Type: application/json; charset=utf-8</span>
                <button
                  onClick={() => copyToClipboard(apiResponse)}
                  className="text-slate-400 hover:text-white transition flex items-center gap-1"
                >
                  <Copy className="size-3" />
                  <span>Javobdan nusxa</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* SECTION 5: JAMOA VA ROADMAP (TEAM & ROADMAP) */}
      <section id="jamoa-roadmap" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-border">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 mb-3">
            <Users className="size-3.5" />
            <span>JAMOA VA RIVOJLANISH REJASI</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-foreground">
            Loyiha Jamoasi va 2025-2026 Roadmap
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Loyihani muvaffaqiyatli amalga oshirishga masʼul mutaxassislar va kelajakdagi maqsadlar
          </p>
        </div>

        {/* TEAM CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          
          {/* Main Lead Card */}
          <div className="rounded-3xl border border-primary/25 bg-primary/5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-2xl font-black shadow-md">
                  SB
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Sobir Boboyorov
                  </h3>
                  <p className="text-xs font-semibold text-primary">
                    Loyiha Asoschisi & Bosh Muhandis (Lead Fullstack & AI Engineer)
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-3">
                Dasturiy arxitektura, React 19 frontend tizimi, Node.js backend xizmatlari, 
                Gemini AI modellarini integratsiya qilish va 119 ta PhET simulyatsiyalarini o‘zbek tiliga to‘liq mahalliylashtirishga to‘liq masʼul.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-card px-2.5 py-1 font-semibold text-muted-foreground border border-border">React 19 & Vite</span>
                <span className="rounded-lg bg-card px-2.5 py-1 font-semibold text-muted-foreground border border-border">Node.js / Express</span>
                <span className="rounded-lg bg-card px-2.5 py-1 font-semibold text-muted-foreground border border-border">Gemini 2.5 / 3.7 AI</span>
                <span className="rounded-lg bg-card px-2.5 py-1 font-semibold text-muted-foreground border border-border">TypeScript & KaTeX</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
              <span>Aloqa: sobirboboyorov13@gmail.com</span>
              <span className="font-bold text-primary">Lead Developer</span>
            </div>
          </div>

          {/* Advisors & Mentors */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-accent/20 text-accent font-display text-2xl font-black">
                  PM
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Pedagogik va Ilmiy Maslahatchilar
                  </h3>
                  <p className="text-xs font-semibold text-accent">
                    Fizika, Kimyo va Matematika Metodistlari
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-3">
                O‘zbekiston umumtaʼlim maktablari o‘qituvchilari va metodistlari bilan hamkorlikda 
                laboratoriyalar o‘quv dasturiga mosligi va AI repetitorning pedagogik savollariga ekspertlik nazorati yuritiladi.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-muted px-2.5 py-1 font-semibold text-muted-foreground">Metodik nazorat</span>
                <span className="rounded-lg bg-muted px-2.5 py-1 font-semibold text-muted-foreground">Sokratik taʼlim</span>
                <span className="rounded-lg bg-muted px-2.5 py-1 font-semibold text-muted-foreground">Maktab dasturi</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Ilmiy ekspertiza</span>
              <span className="font-bold text-accent">Taʼlim sifati</span>
            </div>
          </div>

        </div>

        {/* ROADMAP TIMELINE */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-2xs">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Rivojlanish Bosqichlari (Roadmap)
            </h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              2024 - 2026 Rejalari
            </span>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
            
            {/* Stage 1 */}
            <div className="relative flex items-start gap-4">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs mt-1">
                <Check className="size-4" />
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-foreground text-sm">
                    1-bosqich: 119 ta Simulyatsiyalarni To‘liq Lokalizatsiya Qilish
                  </h4>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                    BAJARILDI (2024 Q3-Q4)
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  PhET simulyatsiyalari o‘zbek tiliga tarjima qilindi, toifalarga ajratildi, qidiruv va filtrlash tizimi ishlab chiqildi.
                </p>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="relative flex items-start gap-4">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs mt-1">
                <Check className="size-4" />
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-foreground text-sm">
                    2-bosqich: Gemini AI Tyutor va Rolli Tizim (RBAC)
                  </h4>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                    BAJARILDI (2025 Q1)
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Google Gemini 2.5/3.7 modellari integratsiyasi, KaTeX formulalar generatsiyasi, ko‘p rolli autentifikatsiya va sessiyalarni doimiy saqlash.
                </p>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="relative flex items-start gap-4">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-2xs mt-1 animate-pulse">
                <Zap className="size-4" />
              </div>
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-foreground text-sm">
                    3-bosqich: O‘qituvchi Studiyasi & Real-Vaqt Hamkorlik
                  </h4>
                  <span className="rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-bold">
                    JARAYONDA (2025 Q2)
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Ustozlar uchun shaxsiy topshiriqlar yaratish studiyasi, o‘quvchilar laboratoriya natijalari hisoboti va interaktiv sinf xonalari.
                </p>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="relative flex items-start gap-4">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-2xs mt-1">
                <Clock className="size-4" />
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-foreground text-sm">
                    4-bosqich: PWA Oflayn Rejim va e-Maktab Integratsiyasi
                  </h4>
                  <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-[10px] font-bold">
                    REJALASHTIRILGAN (2025 Q3-Q4)
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Internet bo‘lmagan joylarda ishlash uchun PWA oflayn rejimi va O‘zbekiston milliy taʼlim portallari (e-maktab) bilan maʼlumotlar almashinuvi.
                </p>
              </div>
            </div>

            {/* Stage 5 */}
            <div className="relative flex items-start gap-4">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-2xs mt-1">
                <Clock className="size-4" />
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-foreground text-sm">
                    5-bosqich: VR/AR Laboratoriyalar va Respublika STEM Olimpiadasi
                  </h4>
                  <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-[10px] font-bold">
                    REJALASHTIRILGAN (2026)
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  WebXR asosidagi 3D virtual laboratoriyalar va maktab o‘quvchilari o‘rtasida respublika miqyosida onlayn virtual olimpiada platformasi.
                </p>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* FINAL PITCH SUMMARY FOR JUDGES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 to-card p-8 sm:p-12 shadow-xl">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground mx-auto mb-6 shadow-md">
            <Trophy className="size-8" />
          </div>

          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-foreground">
            STEM-Simulations — O‘zbekiston Taʼlimi Kelajagi
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Biz hakamlar hayʼati va barcha taʼlim fidoyilarini platformamizni bevosita amalda sinab ko‘rishga taklif qilamiz. 
            Ilm-fan har bir bola uchun tushunarli, qiziqarli va xavfsiz bo‘lishi shart!
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-md"
            >
              <Compass className="size-4" />
              <span>To‘liq Platformaga Kirish (119 Laboratoriya)</span>
            </Link>

            <Link
              href="/ai-tutor"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-xs font-bold text-foreground hover:bg-muted transition"
            >
              <Sparkles className="size-4 text-accent" />
              <span>AI Tyutor bilan Suhbatlashish</span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-border/80 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span>Muallif: Sobir Boboyorov</span>
            <span>•</span>
            <span>Email: sobirboboyorov13@gmail.com</span>
            <span>•</span>
            <span>Versiya: v2.4 Competition Edition</span>
          </div>
        </div>
      </section>

    </div>
  );
};
