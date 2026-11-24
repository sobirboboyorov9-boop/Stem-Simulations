import fs from 'fs';
import path from 'path';
import { 
  Simulation, 
  TeacherActivity, 
  User, 
  CatalogStats, 
  UserRole,
  Subject,
  AiConversation,
  AiChatMessage,
  CommunityConversation,
  CommunityMessage,
  ModerationReport
} from '../types.js';

export const SUPER_ADMIN_EMAILS = [
  'sobirboboyorov13@gmail.com',
  'sobirboboyorov9@gmail.com'
];
export const SUPER_ADMIN_EMAIL = 'sobirboboyorov13@gmail.com';

export function isSuperAdminEmail(email?: string): boolean {
  if (!email) return false;
  const em = email.trim().toLowerCase();
  return em === 'sobirboboyorov13@gmail.com' || em === 'sobirboboyorov9@gmail.com';
}

function normalizeGrade(g?: string): string {
  if (!g) return '';
  return g.trim().toUpperCase().replace(/\s+/g, '').replace(/-/g, '');
}

function isGradeMatch(channelGrade?: string, targetGrade?: string): boolean {
  if (!channelGrade || channelGrade === 'all') return true;
  if (!targetGrade || targetGrade === 'all') return true;
  
  const normChan = normalizeGrade(channelGrade);
  const normTarget = normalizeGrade(targetGrade);
  
  if (normChan === normTarget) return true;
  return false;
}

class DataStorage {
  private simulations: Simulation[] = [];
  private users: Map<string, User> = new Map();
  private favorites: Map<string, Set<string>> = new Map(); // userId -> Set of simulationIds
  private recentActivity: Map<string, { simulationId: string; timestamp: number }[]> = new Map();
  private activities: Map<string, TeacherActivity> = new Map();
  private aiConversations: Map<string, AiConversation> = new Map();
  private communityConversations: Map<string, CommunityConversation> = new Map();
  private communityMessages: Map<string, CommunityMessage[]> = new Map(); // conversationId -> messages
  private moderationReports: Map<string, ModerationReport> = new Map();
  private blockedUsers: Map<string, Set<string>> = new Map(); // userId -> set of blocked userIds
  private initialized = false;
  private storageFilePath = path.resolve(process.cwd(), 'src/data/app_persistence.json');

  constructor() {
    this.init();
  }

  private saveToDisk() {
    try {
      const dataToSave = {
        users: Array.from(this.users.values()),
        favorites: Array.from(this.favorites.entries()).map(([userId, set]) => ({ userId, sims: Array.from(set) })),
        recentActivity: Array.from(this.recentActivity.entries()),
        activities: Array.from(this.activities.values()),
        aiConversations: Array.from(this.aiConversations.values()),
        communityConversations: Array.from(this.communityConversations.values()),
        communityMessages: Array.from(this.communityMessages.entries()),
        moderationReports: Array.from(this.moderationReports.values())
      };
      const dir = path.dirname(this.storageFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tmpPath = `${this.storageFilePath}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.storageFilePath);
    } catch (e) {
      console.warn('Storage saveToDisk warning:', e);
    }
  }

  private init() {
    if (this.initialized) return;
    try {
      const dataPath = path.resolve(process.cwd(), 'src/data/simulations.json');
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        this.simulations = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading simulations.json:', err);
    }

    // Seed default users
    const defaultUsers: User[] = [
      { 
        id: 'user_super_admin', 
        name: 'Sobir Boboyorov', 
        email: SUPER_ADMIN_EMAIL, 
        username: 'sobir_admin',
        role: 'SUPER_ADMIN', 
        subject: 'Physics',
        grade: 'all',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: 'STEM-Simulations Platform Creator & Lead STEM Architect. Dedicated to interactive inquiry-based education.',
        createdAt: '2024-01-10T08:00:00.000Z',
        learningActivity: {
          simulationsExplored: 119,
          inquiriesCompleted: 45,
          favoritesCount: 18,
          lastActive: new Date().toISOString()
        }
      },
      { 
        id: 'user_student', 
        name: 'Alex Rivera', 
        email: 'alex@student.edu', 
        username: 'alex_stem',
        role: 'STUDENT', 
        grade: '9',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: 'High school student passionate about astrophysics, orbital mechanics, and chemistry experiments.',
        createdAt: '2024-03-15T10:30:00.000Z',
        learningActivity: {
          simulationsExplored: 24,
          inquiriesCompleted: 8,
          favoritesCount: 4,
          lastActive: new Date().toISOString()
        }
      },
      { 
        id: 'user_teacher', 
        name: 'Dr. Sarah Lin', 
        email: 'sarah.lin@school.edu', 
        username: 'dr_sarah_physics',
        role: 'TEACHER', 
        subject: 'Physics',
        grade: 'all',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        bio: 'Senior AP Physics Educator & Inquiry Lab Designer. Researching computational STEM pedagogy.',
        createdAt: '2024-02-01T09:15:00.000Z',
        learningActivity: {
          simulationsExplored: 82,
          inquiriesCompleted: 34,
          favoritesCount: 12,
          lastActive: new Date().toISOString()
        },
        authoredSimulations: ['custom_sim_pendulum_resonance', 'custom_sim_kepler_orbits']
      },
      { 
        id: 'user_teacher_bio', 
        name: 'Prof. Aziz Rahimov', 
        email: 'aziz.rahimov@school.edu', 
        username: 'aziz_biology',
        role: 'TEACHER', 
        subject: 'Biology',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        bio: 'Biology & Genetics Teacher. Exploring cellular respiration and DNA replication simulations.',
        createdAt: '2024-02-10T11:00:00.000Z',
        learningActivity: {
          simulationsExplored: 45,
          inquiriesCompleted: 19,
          favoritesCount: 9,
          lastActive: new Date().toISOString()
        }
      },
      { 
        id: 'user_admin', 
        name: 'Marcus Vance', 
        email: 'marcus@stem-simulations.org', 
        username: 'marcus_vance',
        role: 'ADMIN', 
        subject: 'Chemistry',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        bio: 'STEM Curriculum Coordinator & Lead Lab Reviewer.',
        createdAt: '2024-01-20T14:00:00.000Z',
        learningActivity: {
          simulationsExplored: 95,
          inquiriesCompleted: 40,
          favoritesCount: 15,
          lastActive: new Date().toISOString()
        }
      }
    ];

    for (const u of defaultUsers) {
      this.users.set(u.id, u);
    }

    // Seed initial favorites for demo student
    this.favorites.set('user_student', new Set(['gravity-and-orbits', 'projectile-motion', 'build-an-atom', 'wave-on-a-string']));
    
    // Seed initial recent activity
    this.recentActivity.set('user_student', [
      { simulationId: 'gravity-and-orbits', timestamp: Date.now() - 1000 * 60 * 15 },
      { simulationId: 'projectile-motion', timestamp: Date.now() - 1000 * 60 * 60 * 2 },
      { simulationId: 'ph-scale', timestamp: Date.now() - 1000 * 60 * 60 * 24 }
    ]);

    // Seed sample teacher activities
    const sampleActivities: TeacherActivity[] = [
      {
        id: 'act_1',
        title: 'Orbital Mechanics & Planetary Harmony',
        simulationId: 'gravity-and-orbits',
        simulationTitle: 'Gravity and Orbits',
        subject: 'Physics',
        grade: '9-12',
        difficulty: 'Intermediate',
        objective: 'Analyze how changing the mass of the Sun or Earth alters orbital velocity and gravitational pull.',
        questions: [
          'What happens to Earth orbital period when you double the mass of the Sun?',
          'Why does increasing the satellite speed result in an elliptical or escape trajectory?'
        ],
        templateId: 'guided-inquiry',
        status: 'approved',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      },
      {
        id: 'act_2',
        title: 'Acid-Base Neutralization & Titration Lab',
        simulationId: 'acid-base-solutions',
        simulationTitle: 'Acid-Base Solutions',
        subject: 'Chemistry',
        grade: '9-12',
        difficulty: 'Advanced',
        objective: 'Differentiate between strong and weak acids based on molecular dissociation and resulting pH values.',
        questions: [
          'Compare the conductivity of strong acid vs weak acid of the same concentration.',
          'How does adding water to a concentrated weak acid affect both pH and hydronium concentration?'
        ],
        templateId: 'lab-worksheet',
        status: 'submitted',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
      },
      {
        id: 'act_3',
        title: 'Projectile Launch Angles & Air Resistance',
        simulationId: 'projectile-motion',
        simulationTitle: 'Projectile Motion',
        subject: 'Physics',
        grade: '6-8',
        difficulty: 'Exploratory',
        objective: 'Determine which launch angle maximizes horizontal distance under standard Earth gravity.',
        questions: [
          'Which angle provides maximum range when air resistance is negligible?',
          'What happens to the optimal launch angle when air resistance is introduced?'
        ],
        templateId: 'concept-challenge',
        status: 'draft',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    ];

    for (const act of sampleActivities) {
      this.activities.set(act.id, act);
    }

    // Seed default Community Channels / Groups for all grades (11-B, 11-A, 10-B, 10-A, 9-B, 9-A, etc.)
    const defaultChannels: CommunityConversation[] = [
      // 1. Global Announcement Channel (visible to everyone, read-only for students and teachers, admin write-only)
      {
        id: 'channel_official_announcements',
        name: '📣 STEM-Simulations Rasmiy Yangiliklar & E‘lonlar',
        type: 'announcement',
        grade: 'all',
        teacherId: 'user_super_admin',
        teacherName: 'Sobir Boboyorov',
        members: ['user_super_admin', 'user_teacher', 'user_student', 'user_admin'],
        avatar: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&auto=format&fit=crop&q=80',
        description: 'Barcha sinflar uchun rasmiy platforma yangiliklari, ilmiy olimpiada va boshqaruv e‘lonlari. (Faqat Super Admin yoza oladi).',
        lastMessage: 'STEM-Simulations 118+ interaktiv laboratoriya va AI Guided Inquiry to‘liq yangilandi!',
        lastMessageTimestamp: 'Bugun',
        unreadCount: 0
      },

      // 11-Sinf
      {
        id: 'channel_class_11b',
        name: '11-B Sinf Guruhi: Aniq Fanlar & Laboratoriya',
        type: 'group',
        subject: 'Physics',
        grade: '11-B',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        members: ['user_teacher', 'user_student', 'user_super_admin'],
        avatar: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=150&auto=format&fit=crop&q=80',
        description: '11-B sinf o‘quvchilari uchun maxsus fizika, matematika va STEM laboratoriya guruhi.',
        lastMessage: '11-B sinfi uchun fotoeffekt va kvant fizikasi bo‘yicha yangi laboratoriya ochildi!',
        lastMessageTimestamp: '12:30',
        unreadCount: 0
      },
      {
        id: 'channel_class_11a',
        name: '11-A Sinf Guruhi: Aniq Fanlar & Laboratoriya',
        type: 'group',
        subject: 'Physics',
        grade: '11-A',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        members: ['user_teacher', 'user_super_admin'],
        avatar: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150&auto=format&fit=crop&q=80',
        description: '11-A sinf o‘quvchilari uchun fizika va OTM tayyorgarlik guruhi.',
        lastMessage: 'Haftalik test simulyatsiyasi natijalari e‘lon qilindi.',
        lastMessageTimestamp: '10:45',
        unreadCount: 0
      },

      // 10-Sinf
      {
        id: 'channel_class_10b',
        name: '10-B Sinf Guruhi: Molekulyar Fizika & Kimyo',
        type: 'group',
        subject: 'Physics',
        grade: '10-B',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        members: ['user_teacher', 'user_super_admin'],
        avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
        description: '10-B sinfi uchun molekulyar fizika, termodinamika va organik kimyo laboratoriyalari.',
        lastMessage: 'Ideal gaz qonunlari bo‘yicha topshiriqlar joylandi.',
        lastMessageTimestamp: '11:15',
        unreadCount: 0
      },
      {
        id: 'channel_class_10a',
        name: '10-A Sinf Guruhi: Fizika & Termodinamika',
        type: 'group',
        subject: 'Physics',
        grade: '10-A',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        members: ['user_teacher', 'user_super_admin'],
        avatar: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=150&auto=format&fit=crop&q=80',
        description: '10-A sinf guruhi va termodinamika amaliyoti.',
        lastMessage: 'Gaz xossalari simulyatsiyasini tekshiring.',
        lastMessageTimestamp: '09:20',
        unreadCount: 0
      },

      // 9-Sinf
      {
        id: 'channel_class_9b',
        name: '9-B Sinf Guruhi: STEM & Fizika',
        type: 'group',
        subject: 'Physics',
        grade: '9-B',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        members: ['user_teacher', 'user_super_admin'],
        avatar: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=150&auto=format&fit=crop&q=80',
        description: '9-B sinf o‘quvchilari uchun kinetik energiya va kimyoviy reaksiyalar muhokamasi.',
        lastMessage: 'Gravitatsiya va orbital harakat tajribasi qo‘shildi.',
        lastMessageTimestamp: '14:10',
        unreadCount: 0
      },
      {
        id: 'channel_physics_9a',
        name: '9-A Sinf Guruhi: Fizika Ilmiy Laboratoriyasi',
        type: 'group',
        subject: 'Physics',
        grade: '9-A',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        members: ['user_teacher', 'user_student', 'user_super_admin'],
        avatar: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=150&auto=format&fit=crop&q=80',
        description: '9-A sinf fizika fani bo‘yicha gravitatsiya, impuls va to‘lqinlar muhokamasi.',
        lastMessage: 'Check the Projectile Motion simulation with air resistance for homework.',
        lastMessageTimestamp: '14:28',
        unreadCount: 0
      },

      // 8-Sinf
      {
        id: 'channel_class_8a',
        name: '8-A Sinf Guruhi: Elektr & Issiqlik Qonunlari',
        type: 'group',
        subject: 'Physics',
        grade: '8-A',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        members: ['user_teacher', 'user_super_admin'],
        avatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80',
        description: 'Om qonuni, zanjir qarshiligi va anorganik kimyo elementlari.',
        lastMessage: 'Zanjir konstruktori orqali qarshiliklarni hisoblang.',
        lastMessageTimestamp: '15:20',
        unreadCount: 0
      },

      // 7-Sinf
      {
        id: 'channel_class_7a',
        name: '7-A Sinf Guruhi: Fizika & Kimyo Ilk Qadamlar',
        type: 'group',
        subject: 'Physics',
        grade: '7-A',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        members: ['user_teacher', 'user_super_admin'],
        avatar: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=150&auto=format&fit=crop&q=80',
        description: 'Mexanika, tezlik, massa, zichlik va Arximed kuchi tajribalari.',
        lastMessage: 'Zichlik va Arximed kuchi simulyatsiyasi topshirig‘i.',
        lastMessageTimestamp: '13:10',
        unreadCount: 0
      },

      // 6-Sinf
      {
        id: 'channel_class_6a',
        name: '6-A Sinf Guruhi: Matematika & Botanika',
        type: 'group',
        subject: 'Math',
        grade: '6-A',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        members: ['user_teacher', 'user_super_admin'],
        avatar: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150&auto=format&fit=crop&q=80',
        description: 'Koordinatalar tekisligi, foizlar va o‘simliklar hujayrasi.',
        lastMessage: 'Koordinatalar o‘qida nuqtalar hosil qilish simulyatsiyasi.',
        lastMessageTimestamp: '11:40',
        unreadCount: 0
      },

      // 5-Sinf
      {
        id: 'channel_class_5a',
        name: '5-A Sinf Guruhi: Tabiiy Fanlar & Matematika',
        type: 'group',
        subject: 'Math',
        grade: '5-A',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        members: ['user_teacher', 'user_super_admin'],
        avatar: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=150&auto=format&fit=crop&q=80',
        description: 'Oddiy kasrlar, shakllar va tabiat qonunlari.',
        lastMessage: 'Oddiy kasrlar va shakllar bo‘yicha interaktiv laboratoriya qo‘shildi!',
        lastMessageTimestamp: '10:15',
        unreadCount: 0
      },

      // Direct Message
      {
        id: 'dm_sarah_alex',
        name: 'Dr. Sarah Lin (Direct)',
        type: 'direct',
        teacherId: 'user_teacher',
        teacherName: 'Dr. Sarah Lin',
        members: ['user_teacher', 'user_student'],
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        description: 'Direct inquiry tutoring channel.',
        lastMessage: 'Great job on the Orbital Mechanics worksheet, Alex!',
        lastMessageTimestamp: '09:42',
        unreadCount: 0
      }
    ];

    for (const ch of defaultChannels) {
      this.communityConversations.set(ch.id, ch);
    }

    // Seed Official Announcement Messages
    this.communityMessages.set('channel_official_announcements', [
      {
        id: 'ann_msg_1',
        conversationId: 'channel_official_announcements',
        senderId: 'user_super_admin',
        senderName: 'Sobir Boboyorov',
        senderRole: 'SUPER_ADMIN',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'Hurmatli o‘quvchilar va ustozlar! 🎉 STEM-Simulations platformasiga xush kelibsiz. Biz 118+ interaktiv simulyatsiyalar bazasini, sun\'iy intellekt laboratoriya yordamchisini va sinflar bo‘yicha ilmiy guruhlarni to‘liq ishga tushirdik.',
        timestamp: '09:00',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        isAnnouncement: true,
        reactions: { '🚀': ['user_teacher', 'user_student'], '🔥': ['user_student'], '👏': ['user_teacher'] }
      },
      {
        id: 'ann_msg_2',
        conversationId: 'channel_official_announcements',
        senderId: 'user_super_admin',
        senderName: 'Sobir Boboyorov',
        senderRole: 'SUPER_ADMIN',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: '📢 Eslatma: Ushbu rasmiy kanal butun maktab va barcha sinflar uchun umumiy yangiliklar, olimpiada e\'lonlari va boshqaruv xabarlarini e\'lon qilish uchun mo‘ljallangan. Barcha muhokamalar va dars savollarini o‘z sinfingiz guruhida o‘tkazishingiz mumkin.',
        timestamp: '11:30',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        isAnnouncement: true,
        simulationAttachment: {
          id: 'projectile-motion',
          title: 'Projectile Motion',
          subject: 'Physics',
          thumbnail: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion-600.png'
        },
        reactions: { '💡': ['user_student', 'user_teacher'], '❤️': ['user_teacher'] }
      }
    ]);

    // Seed 11-B Messages
    this.communityMessages.set('channel_class_11b', [
      {
        id: 'msg_11b_1',
        conversationId: 'channel_class_11b',
        senderId: 'user_teacher',
        senderName: 'Dr. Sarah Lin',
        senderRole: 'TEACHER',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        content: 'Assalomu alaykum, 11-B sinfi! Bugungi darsimizda Fotoeffekt qonunlari va Eynshteyn tenglamasini ($h\\nu = A + \\frac{mv^2}{2}$) interaktiv simulyatsiya orqali tahlil qilamiz.',
        timestamp: '08:30',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        isAnnouncement: true,
        simulationAttachment: {
          id: 'photoelectric-effect',
          title: 'Photoelectric Effect',
          subject: 'Physics',
          thumbnail: 'https://phet.colorado.edu/sims/html/photoelectric-effect/latest/photoelectric-effect-600.png'
        },
        reactions: { '⚡': ['user_super_admin'], '🔬': ['user_student'] }
      }
    ]);

    // Seed Community Messages
    this.communityMessages.set('channel_physics_9a', [
      {
        id: 'msg_1',
        conversationId: 'channel_physics_9a',
        senderId: 'user_teacher',
        senderName: 'Dr. Sarah Lin',
        senderRole: 'TEACHER',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        content: 'Welcome everyone to the 9-A Physics Lab group! Please explore the Gravity & Orbits simulation and answer the inquiry questions.',
        timestamp: '11:00',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        isAnnouncement: true,
        simulationAttachment: {
          id: 'gravity-and-orbits',
          title: 'Gravity and Orbits',
          subject: 'Physics',
          thumbnail: 'https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits-600.png'
        },
        reactions: { '🔬': ['user_student', 'user_super_admin'], '👍': ['user_student'] }
      },
      {
        id: 'msg_2',
        conversationId: 'channel_physics_9a',
        senderId: 'user_student',
        senderName: 'Alex Rivera',
        senderRole: 'STUDENT',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        content: 'I noticed that when increasing the Sun\'s mass, the orbital speed needs to increase dramatically or the planet falls into the star!',
        timestamp: '11:24',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        reactions: { '💡': ['user_teacher'] }
      },
      {
        id: 'msg_3',
        conversationId: 'channel_physics_9a',
        senderId: 'user_teacher',
        senderName: 'Dr. Sarah Lin',
        senderRole: 'TEACHER',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        content: 'Exactly! That comes directly from Kepler\'s Third Law and Newton\'s Law of Universal Gravitation ($v = \\sqrt{GM/r}$). Check the Projectile Motion simulation with air resistance for homework.',
        timestamp: '14:28',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        reactions: { '👏': ['user_student'] }
      }
    ]);

    this.communityMessages.set('dm_sarah_alex', [
      {
        id: 'dm_msg_1',
        conversationId: 'dm_sarah_alex',
        senderId: 'user_student',
        senderName: 'Alex Rivera',
        senderRole: 'STUDENT',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        content: 'Dr. Lin, I submitted my responses for the planetary harmony lab worksheet.',
        timestamp: '09:15',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
      },
      {
        id: 'dm_msg_2',
        conversationId: 'dm_sarah_alex',
        senderId: 'user_teacher',
        senderName: 'Dr. Sarah Lin',
        senderRole: 'TEACHER',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        content: 'Great job on the Orbital Mechanics worksheet, Alex! Your calculation for the centripetal acceleration was spot on.',
        timestamp: '09:42',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        reactions: { '❤️': ['user_student'] }
      }
    ]);

    // Seed sample AI conversations
    const sampleAiConv: AiConversation = {
      id: 'ai_conv_1',
      userId: 'user_student',
      title: 'Newton\'s Second Law & Friction',
      subject: 'Physics',
      simulationId: 'forces-and-motion-basics',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      messages: [
        {
          id: 'ai_m_1',
          role: 'user',
          content: 'How does static friction differ from kinetic friction when pushing a heavy crate?',
          timestamp: '14:31',
          simulationId: 'forces-and-motion-basics'
        },
        {
          id: 'ai_m_2',
          role: 'assistant',
          content: `### Static vs Kinetic Friction

Friction is the resistive contact force that opposes relative motion between two surfaces in contact.

#### 1. Core Physical Principle
- **Static Friction ($f_s$)**: Prevents stationary objects from moving. It adjusts to balance applied force up to a maximum threshold:
$$f_{s,max} = \\mu_s \\cdot F_N$$
- **Kinetic Friction ($f_k$)**: Opposes an object already in motion. It maintains a constant value:
$$f_k = \\mu_k \\cdot F_N$$

#### 2. Key Concept
Because surfaces have microscopic irregularities that interlock more tightly when stationary, the coefficient of static friction is almost always higher than kinetic friction:
$$\\mu_s > \\mu_k$$

#### 3. Tinker Challenge in Forces Simulation
1. Set the crate on the rough wooden surface.
2. Slowly ramp up applied force from 0N to 200N. Observe the exact peak force required to overcome static inertia.
3. Once the crate starts sliding, notice how less force is needed to sustain constant acceleration.`,
          timestamp: '14:32',
          simulationId: 'forces-and-motion-basics'
        }
      ]
    };
    this.aiConversations.set(sampleAiConv.id, sampleAiConv);

    // Load persisted state from disk if exists
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const rawSaved = fs.readFileSync(this.storageFilePath, 'utf-8');
        const saved = JSON.parse(rawSaved);
        if (saved.users && Array.isArray(saved.users)) {
          for (const u of saved.users) {
            this.users.set(u.id, u);
          }
        }
        if (saved.favorites && Array.isArray(saved.favorites)) {
          for (const fav of saved.favorites) {
            this.favorites.set(fav.userId, new Set(fav.sims));
          }
        }
        if (saved.recentActivity && Array.isArray(saved.recentActivity)) {
          for (const [uid, recents] of saved.recentActivity) {
            this.recentActivity.set(uid, recents);
          }
        }
        if (saved.activities && Array.isArray(saved.activities)) {
          for (const act of saved.activities) {
            this.activities.set(act.id, act);
          }
        }
        if (saved.aiConversations && Array.isArray(saved.aiConversations)) {
          for (const aiC of saved.aiConversations) {
            this.aiConversations.set(aiC.id, aiC);
          }
        }
        if (saved.communityConversations && Array.isArray(saved.communityConversations)) {
          for (const c of saved.communityConversations) {
            this.communityConversations.set(c.id, c);
          }
        }
        if (saved.communityMessages && Array.isArray(saved.communityMessages)) {
          for (const [cid, msgs] of saved.communityMessages) {
            this.communityMessages.set(cid, msgs);
          }
        }
        if (saved.moderationReports && Array.isArray(saved.moderationReports)) {
          for (const rep of saved.moderationReports) {
            this.moderationReports.set(rep.id, rep);
          }
        }
      }
    } catch (err) {
      console.warn('Error reading app_persistence.json:', err);
    }

    this.initialized = true;
  }

  // Simulations
  getSimulations(query?: { search?: string; subject?: string; grade?: string; featured?: boolean }): Simulation[] {
    let list = [...this.simulations];

    if (query?.subject) {
      const s = query.subject.toLowerCase();
      list = list.filter(item => item.subject.toLowerCase() === s);
    }

    if (query?.grade) {
      const g = query.grade;
      list = list.filter(item => item.grades.includes(g));
    }

    if (query?.featured !== undefined) {
      list = list.filter(item => Boolean(item.featured) === query.featured);
    }

    if (query?.search) {
      const term = query.search.toLowerCase().trim();
      list = list.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.keywords.some(k => k.toLowerCase().includes(term)) ||
        item.subject.toLowerCase().includes(term) ||
        item.slug.toLowerCase().includes(term)
      );
    }

    return list;
  }

  getSimulationById(id: string): Simulation | null {
    const sim = this.simulations.find(s => s.id === id || s.slug === id);
    if (!sim) return null;

    const related = (sim.relatedIds || [])
      .map(rId => this.simulations.find(s => s.id === rId || s.slug === rId))
      .filter(Boolean) as Simulation[];

    return { ...sim, related };
  }

  getCatalogStats(): CatalogStats {
    const subjectCounts: Record<string, number> = {
      Physics: 0,
      Chemistry: 0,
      Math: 0,
      Biology: 0,
      'Earth Science': 0,
      Geography: 0,
      'IT / Computer Science': 0,
      Robotics: 0
    };

    const gradeCounts: Record<string, number> = {
      'K-2': 0,
      '3-5': 0,
      '6-8': 0,
      '9-12': 0
    };

    for (const sim of this.simulations) {
      if (subjectCounts[sim.subject] !== undefined) {
        subjectCounts[sim.subject]++;
      }
      for (const g of sim.grades) {
        if (gradeCounts[g] !== undefined) {
          gradeCounts[g]++;
        }
      }
    }

    return {
      totalSimulations: this.simulations.length,
      subjectCounts,
      gradeCounts,
      activeLearners: 1840,
      totalExplorations: 34290
    };
  }

  // Users & RBAC
  getUser(userId: string): User | null {
    if (!userId) return null;
    return this.users.get(userId) || this.getUserByClerkId(userId) || null;
  }

  getUserByClerkId(clerkUserId: string): User | null {
    if (!clerkUserId) return null;
    for (const user of this.users.values()) {
      if (user.clerkUserId === clerkUserId || user.id === clerkUserId) {
        return user;
      }
    }
    return null;
  }

  getUserByEmail(email: string): User | null {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === clean) {
        return user;
      }
    }
    return null;
  }

  syncClerkUser(clerkUserId: string, email: string, name?: string, avatar?: string): User {
    const cleanEmail = email.trim().toLowerCase();
    const isSuper = isSuperAdminEmail(cleanEmail);

    // 1. Existing user by Clerk User ID
    let existing = this.getUserByClerkId(clerkUserId);
    if (existing) {
      let changed = false;
      if (isSuper && existing.role !== 'SUPER_ADMIN') {
        existing.role = 'SUPER_ADMIN';
        changed = true;
      }
      if (name && (!existing.name || existing.name === existing.email.split('@')[0])) {
        existing.name = name;
        existing.displayName = name;
        changed = true;
      }
      if (avatar && (!existing.avatar || existing.avatar.includes('dicebear'))) {
        existing.avatar = avatar;
        changed = true;
      }
      if (changed) {
        existing.updatedAt = new Date().toISOString();
        this.users.set(existing.id, existing);
        this.saveToDisk();
      }
      return existing;
    }

    // 2. Existing user by verified Email (Account Linking between Google OAuth & Email OTP)
    existing = this.getUserByEmail(cleanEmail);
    if (existing) {
      existing.clerkUserId = clerkUserId;
      if (isSuper) {
        existing.role = 'SUPER_ADMIN';
      }
      if (name && (!existing.name || existing.name === existing.email.split('@')[0])) {
        existing.name = name;
        existing.displayName = name;
      }
      if (avatar && (!existing.avatar || existing.avatar.includes('dicebear'))) {
        existing.avatar = avatar;
      }
      existing.updatedAt = new Date().toISOString();
      this.users.set(existing.id, existing);
      this.saveToDisk();
      return existing;
    }

    // 3. New User Profile creation (One email = One account, Default role = STUDENT)
    const displayName = name || cleanEmail.split('@')[0];
    const newUser: User = {
      id: clerkUserId,
      clerkUserId,
      name: displayName,
      displayName,
      email: cleanEmail,
      username: cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_'),
      role: isSuper ? 'SUPER_ADMIN' : 'STUDENT',
      grade: isSuper ? 'all' : '9-A',
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      bio: isSuper ? 'STEM-Simulations Platform Creator & Lead Super Admin' : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      learningActivity: {
        simulationsExplored: 0,
        inquiriesCompleted: 0,
        favoritesCount: 0,
        lastActive: new Date().toISOString()
      }
    };

    this.users.set(newUser.id, newUser);
    this.saveToDisk();
    return newUser;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  setUserRole(userId: string, role: UserRole): User | null {
    const user = this.users.get(userId);
    if (!user) return null;
    
    // Safety check: Cannot demote the designated super admin email
    if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      user.role = 'SUPER_ADMIN';
    } else {
      // Normalize role uppercase/lowercase
      user.role = role.toUpperCase() as UserRole;
    }

    this.users.set(userId, user);
    this.saveToDisk();
    return user;
  }

  setUserSubject(userId: string, subject: Subject): User | null {
    const user = this.users.get(userId);
    if (!user) return null;
    user.subject = subject;
    this.users.set(userId, user);
    this.saveToDisk();
    return user;
  }

  updateUserProfile(userId: string, updates: Partial<User>): User | null {
    const user = this.users.get(userId);
    if (!user) return null;

    // Preserve role and email integrity
    const updated: User = {
      ...user,
      name: updates.name || user.name,
      username: updates.username || user.username,
      bio: updates.bio !== undefined ? updates.bio : user.bio,
      avatar: updates.avatar || user.avatar,
      subject: updates.subject || user.subject,
      grade: updates.grade !== undefined ? updates.grade : user.grade
    };

    // Ensure super admin email always stays SUPER_ADMIN
    if (updated.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      updated.role = 'SUPER_ADMIN';
    }

    this.users.set(userId, updated);
    this.saveToDisk();
    return updated;
  }

  createUser(userData: Partial<User> & { email: string; name: string }): User {
    const isSuperAdminEmail = userData.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    const id = userData.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    const role: UserRole = isSuperAdminEmail 
      ? 'SUPER_ADMIN' 
      : (userData.role ? (userData.role.toUpperCase() as UserRole) : 'STUDENT');

    const newUser: User = {
      id,
      name: userData.name,
      email: userData.email,
      username: userData.username || userData.email.split('@')[0],
      role,
      subject: userData.subject || (role === 'TEACHER' ? 'Physics' : undefined),
      grade: userData.grade || (role === 'SUPER_ADMIN' || role === 'TEACHER' ? 'all' : undefined),
      avatar: userData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.email}`,
      bio: userData.bio || '',
      createdAt: new Date().toISOString(),
      learningActivity: {
        simulationsExplored: 1,
        inquiriesCompleted: 0,
        favoritesCount: 0,
        lastActive: new Date().toISOString()
      }
    };

    this.users.set(newUser.id, newUser);
    this.saveToDisk();
    return newUser;
  }

  deleteUser(userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    // Protect primary super admin from deletion
    if (isSuperAdminEmail(user.email)) {
      return false;
    }
    this.users.delete(userId);
    this.favorites.delete(userId);
    this.recentActivity.delete(userId);
    return true;
  }

  // Favorites
  getFavorites(userId: string): Simulation[] {
    const userFavs = this.favorites.get(userId) || new Set();
    return Array.from(userFavs)
      .map(simId => this.getSimulationById(simId))
      .filter(Boolean) as Simulation[];
  }

  addFavorite(userId: string, simulationId: string): boolean {
    if (!this.favorites.has(userId)) {
      this.favorites.set(userId, new Set());
    }
    this.favorites.get(userId)!.add(simulationId);
    
    // Update user stats
    const user = this.users.get(userId);
    if (user && user.learningActivity) {
      user.learningActivity.favoritesCount = this.favorites.get(userId)!.size;
    }
    return true;
  }

  removeFavorite(userId: string, simulationId: string): boolean {
    const userFavs = this.favorites.get(userId);
    if (!userFavs) return false;
    userFavs.delete(simulationId);
    
    const user = this.users.get(userId);
    if (user && user.learningActivity) {
      user.learningActivity.favoritesCount = userFavs.size;
    }
    return true;
  }

  isFavorite(userId: string, simulationId: string): boolean {
    return Boolean(this.favorites.get(userId)?.has(simulationId));
  }

  // Recent Activity
  getRecent(userId: string): Simulation[] {
    const list = this.recentActivity.get(userId) || [];
    const sorted = [...list].sort((a, b) => b.timestamp - a.timestamp);
    const seen = new Set<string>();
    const results: Simulation[] = [];

    for (const item of sorted) {
      if (!seen.has(item.simulationId)) {
        seen.add(item.simulationId);
        const sim = this.getSimulationById(item.simulationId);
        if (sim) results.push(sim);
      }
    }

    return results;
  }

  recordRecent(userId: string, simulationId: string): void {
    if (!this.recentActivity.has(userId)) {
      this.recentActivity.set(userId, []);
    }
    const list = this.recentActivity.get(userId)!;
    const filtered = list.filter(item => item.simulationId !== simulationId);
    filtered.unshift({ simulationId, timestamp: Date.now() });
    this.recentActivity.set(userId, filtered.slice(0, 30));

    const user = this.users.get(userId);
    if (user && user.learningActivity) {
      user.learningActivity.simulationsExplored++;
      user.learningActivity.lastActive = new Date().toISOString();
    }
  }

  clearRecent(userId: string): void {
    this.recentActivity.set(userId, []);
  }

  // Teacher Activities
  getTeacherActivities(teacherId?: string): TeacherActivity[] {
    const all = Array.from(this.activities.values());
    if (teacherId) {
      return all.filter(a => a.teacherId === teacherId);
    }
    return all;
  }

  getActivityById(id: string): TeacherActivity | null {
    return this.activities.get(id) || null;
  }

  createActivity(act: Omit<TeacherActivity, 'id' | 'createdAt' | 'updatedAt'>): TeacherActivity {
    const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const sim = this.getSimulationById(act.simulationId);
    const fullActivity: TeacherActivity = {
      ...act,
      id,
      simulationTitle: sim?.title || act.simulationTitle || 'Simulation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.activities.set(id, fullActivity);
    this.saveToDisk();
    return fullActivity;
  }

  updateActivity(id: string, updates: Partial<TeacherActivity>): TeacherActivity | null {
    const act = this.activities.get(id);
    if (!act) return null;
    const sim = updates.simulationId ? this.getSimulationById(updates.simulationId) : null;
    const updated: TeacherActivity = {
      ...act,
      ...updates,
      simulationTitle: sim?.title || updates.simulationTitle || act.simulationTitle,
      updatedAt: new Date().toISOString()
    };
    this.activities.set(id, updated);
    this.saveToDisk();
    return updated;
  }

  deleteActivity(id: string): boolean {
    const res = this.activities.delete(id);
    if (res) this.saveToDisk();
    return res;
  }

  getSubmissions(): TeacherActivity[] {
    return Array.from(this.activities.values()).filter(a => a.status === 'submitted' || a.status === 'under_review');
  }

  reviewSubmission(id: string, status: 'approved' | 'rejected', feedback?: string): TeacherActivity | null {
    const act = this.activities.get(id);
    if (!act) return null;
    act.status = status;
    if (feedback) act.feedback = feedback;
    act.updatedAt = new Date().toISOString();
    this.activities.set(id, act);
    this.saveToDisk();
    return act;
  }

  // AI Conversations
  getAiConversations(userId: string): AiConversation[] {
    const list = Array.from(this.aiConversations.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    // If no conversations exist for this user, create a welcoming initial inquiry chat
    if (list.length === 0) {
      const initial = this.createAiConversation(
        userId,
        'Ilmiy Savol-Javob va Tyutorlik',
        'Physics'
      );
      this.addAiMessage(initial.id, {
        role: 'assistant',
        content: `Salom! 👋 Men STEM-Simulations AI — tabiiy va aniq fanlar bo‘yicha shaxsiy tyutoringizman.

Fizika, Kimyo, Biologiya, Matematika, Geografiya, Dasturlash yoki Robototexnika bo‘yicha xohlagan savolingizni bering.

Bugun nimani o‘rganamiz?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'explain'
      });
      return [initial];
    }

    return list;
  }

  getAiConversationById(id: string): AiConversation | null {
    return this.aiConversations.get(id) || null;
  }

  createAiConversation(userId: string, title?: string, subject?: Subject, simulationId?: string): AiConversation {
    const id = `ai_conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newConv: AiConversation = {
      id,
      userId,
      title: title || 'Yangi Ilmiy Suhbat',
      subject: subject || 'Physics',
      simulationId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.aiConversations.set(id, newConv);
    this.saveToDisk();
    return newConv;
  }

  renameAiConversation(id: string, title: string): AiConversation | null {
    const conv = this.aiConversations.get(id);
    if (!conv) return null;
    conv.title = title;
    conv.updatedAt = new Date().toISOString();
    this.aiConversations.set(id, conv);
    this.saveToDisk();
    return conv;
  }

  deleteAiConversation(id: string): boolean {
    const res = this.aiConversations.delete(id);
    if (res) this.saveToDisk();
    return res;
  }

  clearAiMessages(id: string): boolean {
    const conv = this.aiConversations.get(id);
    if (!conv) return false;
    conv.messages = [];
    conv.updatedAt = new Date().toISOString();
    this.aiConversations.set(id, conv);
    this.saveToDisk();
    return true;
  }

  addAiMessage(conversationId: string, message: Omit<AiChatMessage, 'id'>): AiChatMessage | null {
    let conv = this.aiConversations.get(conversationId);
    if (!conv) {
      conv = {
        id: conversationId,
        userId: 'user_super_admin',
        title: 'Ilmiy Muloqot',
        subject: 'Physics',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.aiConversations.set(conversationId, conv);
    }
    const newMsg: AiChatMessage = {
      id: `ai_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...message
    };
    conv.messages.push(newMsg);
    conv.updatedAt = new Date().toISOString();
    // Dynamically update conversation title from first meaningful user question
    if (conv.messages.filter(m => m.role === 'user').length === 1 && message.role === 'user') {
      const cleanSnippet = message.content.replace(/[\n\r]+/g, ' ').trim();
      conv.title = cleanSnippet.slice(0, 42) + (cleanSnippet.length > 42 ? '...' : '');
    }
    this.aiConversations.set(conversationId, conv);
    this.saveToDisk();
    return newMsg;
  }

  // Community Chat
  getCommunityConversations(userId?: string, requestedGrade?: string): CommunityConversation[] {
    const allConvs = Array.from(this.communityConversations.values());

    if (!userId || userId === 'guest' || !this.users.has(userId)) {
      // Return public announcements and all public community channels for guest/preview
      if (!requestedGrade || requestedGrade === 'all') {
        return allConvs.filter(c => c.type !== 'direct');
      }
      return allConvs.filter(c => c.type !== 'direct' && (c.type === 'announcement' || isGradeMatch(c.grade, requestedGrade) || !c.grade || c.grade === 'all'));
    }

    const user = this.users.get(userId)!;
    const userRole = (user.role || 'STUDENT').toUpperCase();
    const isSuper = userRole === 'SUPER_ADMIN' || isSuperAdminEmail(user.email);
    const isPrivileged = isSuper || userRole === 'ADMIN' || userRole === 'TEACHER';

    // Privileged users (Teachers, Admins, Super Admin) can view all or filter by grade
    if (isPrivileged) {
      if (!requestedGrade || requestedGrade === 'all') {
        return allConvs;
      }
      return allConvs.filter(c => {
        if (c.type === 'announcement' || c.id === 'channel_official_announcements') return true;
        if (c.type === 'direct') return c.members && c.members.includes(userId);
        if (c.members && c.members.includes(userId)) return true;
        return isGradeMatch(c.grade, requestedGrade);
      });
    }

    // STUDENT Role:
    // Ensure a dedicated class channel exists for student's specific grade if defined
    if (user.grade && user.grade !== 'all') {
      const norm = normalizeGrade(user.grade);
      const existing = allConvs.find(c => c.type === 'group' && normalizeGrade(c.grade) === norm);
      if (!existing && norm) {
        const dynamicId = `channel_class_${norm.toLowerCase()}`;
        const dynamicChannel: CommunityConversation = {
          id: dynamicId,
          name: `${user.grade} Sinf Guruhi & Laboratoriya`,
          type: 'group',
          subject: 'Physics',
          grade: user.grade,
          teacherName: 'STEM Faculty',
          members: [user.id, 'user_super_admin'],
          description: `${user.grade} sinf o‘quvchilari uchun maxsus ilmiy muhokama va laboratoriya guruhi.`,
          avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${user.grade}`,
          unreadCount: 0
        };
        this.communityConversations.set(dynamicId, dynamicChannel);
        this.communityMessages.set(dynamicId, [
          {
            id: `msg_init_${norm}`,
            conversationId: dynamicId,
            senderId: 'user_super_admin',
            senderName: 'Sobir Boboyorov',
            senderRole: 'SUPER_ADMIN',
            senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            content: `Xush kelibsiz! ${user.grade} sinf guruhi yaratildi. Bu yerda dars mavzulari va laboratoriyalarni muhokama qilishingiz mumkin.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: new Date().toISOString(),
            isAnnouncement: true
          }
        ]);
        allConvs.push(dynamicChannel);
        this.saveToDisk();
      }
    }

    // Students see:
    // 1. Global Official Announcements
    // 2. Any channel they created or are a member of (NEVER disappear!)
    // 3. Direct messages they participate in
    // 4. Grade-based class channels matching their grade, or all public group study channels
    return allConvs.filter(c => {
      // Global official announcements are visible to all students
      if (c.type === 'announcement' || c.id === 'channel_official_announcements') {
        return true;
      }

      // Member or creator of channel
      if (c.members && c.members.includes(userId)) {
        return true;
      }

      // Direct message
      if (c.type === 'direct') {
        return c.members && c.members.includes(userId);
      }

      // If requestedGrade filter is active
      if (requestedGrade && requestedGrade !== 'all') {
        return isGradeMatch(c.grade, requestedGrade);
      }

      // General or grade-matched channels
      if (!c.grade || c.grade === 'all') return true;
      if (user.grade && isGradeMatch(c.grade, user.grade)) return true;

      // Group study channels are open community channels
      if (c.type === 'group') return true;

      return false;
    });
  }

  getCommunityConversationById(id: string): CommunityConversation | null {
    return this.communityConversations.get(id) || null;
  }

  createCommunityConversation(data: Omit<CommunityConversation, 'id'>): CommunityConversation {
    const id = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newConv: CommunityConversation = {
      id,
      ...data,
      unreadCount: 0
    };
    this.communityConversations.set(id, newConv);
    this.communityMessages.set(id, []);
    this.saveToDisk();
    return newConv;
  }

  getCommunityMessages(conversationId: string): CommunityMessage[] {
    return this.communityMessages.get(conversationId) || [];
  }

  getCommunityMessage(conversationId: string, messageId: string): CommunityMessage | null {
    const messages = this.communityMessages.get(conversationId);
    if (!messages) return null;
    return messages.find(m => m.id === messageId) || null;
  }

  addCommunityMessage(conversationId: string, message: Omit<CommunityMessage, 'id' | 'createdAt'>): CommunityMessage | null {
    const conv = this.communityConversations.get(conversationId);
    if (!conv) return null;

    // Strict Enforcement: Global Announcement Channel is Admin-only write
    if (conv.id === 'channel_official_announcements' || conv.type === 'announcement') {
      const sender = this.users.get(message.senderId);
      const isSuper = sender?.role === 'SUPER_ADMIN' || isSuperAdminEmail(sender?.email);
      if (!isSuper) {
        console.warn(`Unauthorized post attempt to announcement channel by user ${message.senderId}`);
        return null;
      }
    }

    if (!this.communityMessages.has(conversationId)) {
      this.communityMessages.set(conversationId, []);
    }

    const fullMessage: CommunityMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...message,
      createdAt: new Date().toISOString(),
      reactions: {}
    };

    const messages = this.communityMessages.get(conversationId)!;
    messages.push(fullMessage);
    
    // Update conversation snippet
    conv.lastMessage = message.content.slice(0, 60);
    conv.lastMessageTimestamp = message.timestamp;
    this.communityConversations.set(conversationId, conv);
    this.saveToDisk();

    return fullMessage;
  }

  toggleMessageReaction(conversationId: string, messageId: string, emoji: string, userId: string): CommunityMessage | null {
    const messages = this.communityMessages.get(conversationId);
    if (!messages) return null;
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return null;

    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

    const idx = msg.reactions[emoji].indexOf(userId);
    if (idx > -1) {
      msg.reactions[emoji].splice(idx, 1);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    } else {
      msg.reactions[emoji].push(userId);
    }

    this.saveToDisk();
    return msg;
  }

  deleteCommunityMessage(conversationId: string, messageId: string): boolean {
    const messages = this.communityMessages.get(conversationId);
    if (!messages) return false;
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx > -1) {
      messages.splice(idx, 1);
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // Safety & Moderation
  createReport(report: Omit<ModerationReport, 'id' | 'status' | 'timestamp'>): ModerationReport {
    const id = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newReport: ModerationReport = {
      id,
      ...report,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    this.moderationReports.set(id, newReport);
    return newReport;
  }

  getModerationReports(): ModerationReport[] {
    return Array.from(this.moderationReports.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  updateReportStatus(reportId: string, status: 'reviewed' | 'dismissed' | 'action_taken'): ModerationReport | null {
    const rep = this.moderationReports.get(reportId);
    if (!rep) return null;
    rep.status = status;
    this.moderationReports.set(reportId, rep);
    return rep;
  }

  blockUser(userId: string, targetUserId: string): boolean {
    if (!this.blockedUsers.has(userId)) {
      this.blockedUsers.set(userId, new Set());
    }
    this.blockedUsers.get(userId)!.add(targetUserId);
    return true;
  }

  isUserBlocked(userId: string, targetUserId: string): boolean {
    return Boolean(this.blockedUsers.get(userId)?.has(targetUserId));
  }
}

export const storage = new DataStorage();
