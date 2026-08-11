import { db, doc, setDoc, getDoc, onSnapshot, updateDoc, collection, getDocs } from './firebase';

export interface ClassroomQuestion {
  id: number;
  question: string;
  category: 'Patents' | 'Trademarks' | 'Copyrights' | 'Industrial Designs';
  options: string[];
  correctIndex: number;
  explanation: string;
  tier: 1 | 2 | 3;
}

export interface ClassroomStudent {
  studentId: string;
  studentName: string;
  avatarEmoji: string;
  score: number;
  status: 'JOINED' | 'ACTIVE' | 'DISCONNECTED';
  answersRecord?: Record<number, { selectedIndex: number; points: number; isCorrect: boolean }>;
  joinedAt: string;
}

export interface ClassroomSession {
  roomCode: string;
  teacherId: string;
  teacherName: string;
  tier: 1 | 2 | 3;
  tierTitle: string;
  status: 'WAITING' | 'ACTIVE' | 'FINISHED';
  currentQuestionIndex: number;
  questionStartedAt?: number;
  durationSec: number;
  createdAt: string;
  questions: ClassroomQuestion[];
  students: ClassroomStudent[];
}

export interface SavedStudentClassroomSession {
  roomCode: string;
  studentId: string;
  studentName: string;
  avatarEmoji: string;
  joinedAt: string;
}

export interface GlobalStudentLog {
  id: string;
  studentName: string;
  avatarEmoji: string;
  totalScore: number;
  badges: string[];
  levelsCompletedCount: number;
  updatedAt: string;
}

const AVATAR_EMOJIS = ['🚀', '⚡', '🎓', '💡', '🦁', '🌟', '🎨', '🔍', '🏆', '🔥', '🤖', '🦊'];

// Tier 1 Question Bank — Basic IP Awareness for School Students
const TIER_1_QUESTIONS: ClassroomQuestion[] = [
  {
    id: 1,
    question: 'Alex invented a foldable solar backpack that charges laptops in 30 minutes. Which IP right protects this technical mechanism?',
    category: 'Patents',
    options: ['Trademark ®', 'Patent ⚙️', 'Copyright ©', 'Geographical Indication 🌾'],
    correctIndex: 1,
    explanation: 'A Patent protects new, non-obvious technical inventions and functional mechanisms for 20 years!',
    tier: 1
  },
  {
    id: 2,
    question: 'Which symbol can legally be used ONLY AFTER a brand name or logo is officially registered with the Trademark Registry in India?',
    category: 'Trademarks',
    options: ['™ symbol', '© symbol', '® symbol', '℗ symbol'],
    correctIndex: 2,
    explanation: 'The ® symbol signifies an officially Registered Trademark. The ™ symbol can be used while an application is pending.',
    tier: 1
  },
  {
    id: 3,
    question: 'Maya composed an original song and posted it online. Under Indian law, when does Copyright protection begin for her music?',
    category: 'Copyrights',
    options: [
      'Automatically upon creation in tangible form',
      'Only after paying ₹10,000 to the police',
      'After 5 years of public publishing',
      'Copyright does not apply to music'
    ],
    correctIndex: 0,
    explanation: 'Copyright protection arises automatically the moment an original work is expressed in a tangible form!',
    tier: 1
  },
  {
    id: 4,
    question: 'A company designed a bottle with a unique curved, wavy glass aesthetic shape. Which IP category protects this visual appearance?',
    category: 'Industrial Designs',
    options: ['Patent', 'Industrial Design 🎨', 'Trade Secret', 'Copyright'],
    correctIndex: 1,
    explanation: 'Industrial Design registration protects ONLY the visual shape, aesthetic look, pattern, or color combination of an item.',
    tier: 1
  },
  {
    id: 5,
    question: 'Darjeeling Tea is famous worldwide for its distinct flavor originating from a specific region. What IP right protects this origin name?',
    category: 'Trademarks',
    options: ['Patent', 'Geographical Indication (GI Tag) 🌾', 'Copyright', 'Trade Secret'],
    correctIndex: 1,
    explanation: 'A Geographical Indication (GI) identifies goods originating from a specific region with qualities attributable to that origin.',
    tier: 1
  }
];

// Tier 2 Question Bank — IP Detective Scenario-Based Cases
const TIER_2_QUESTIONS: ClassroomQuestion[] = [
  {
    id: 1,
    question: 'Case #101: A competitor starts selling sportswear using a logo almost identical to a famous brand logo. What type of IP infringement is this?',
    category: 'Trademarks',
    options: ['Patent Infringement', 'Trademark Infringement 🏷️', 'Copyright Piracy', 'Design Infringement'],
    correctIndex: 1,
    explanation: 'Using a confusingly similar brand logo on competing products infringes trademark rights and misleads consumers.',
    tier: 2
  },
  {
    id: 2,
    question: 'Case #102: A blog downloads an artist\'s digital illustration without permission and sells prints online. Which IP right was violated?',
    category: 'Copyrights',
    options: ['Copyright 🎨', 'Patent', 'Trade Secret', 'Industrial Design'],
    correctIndex: 0,
    explanation: 'Reproducing and selling an artist\'s original artwork without authorization violates their Copyright rights.',
    tier: 2
  },
  {
    id: 3,
    question: 'Case #103: A student quotes 2 lines from a published book in a school essay and cites the author. Why is this legal under IP law?',
    category: 'Copyrights',
    options: ['Fair Use for Educational Purposes 📚', 'Illegal Piracy', 'Patent Exemption', 'Trademark Licensing'],
    correctIndex: 0,
    explanation: 'Fair Use permits limited usage of copyrighted works for education, research, news reporting, and criticism.',
    tier: 2
  },
  {
    id: 4,
    question: 'Case #104: A company created a soft drink recipe kept locked in a vault with strict non-disclosure agreements. What IP category is this?',
    category: 'Patents',
    options: ['Patent', 'Trade Secret 🔐', 'Industrial Design', 'Copyright'],
    correctIndex: 1,
    explanation: 'A Trade Secret protects confidential business information (like formulas) maintained with secrecy measures without public disclosure.',
    tier: 2
  },
  {
    id: 5,
    question: 'Case #105: A rival firm copies the exact 3D ergonomic handle curvature of a registered electric toothbrush. What IP right is infringed?',
    category: 'Industrial Designs',
    options: ['Copyright', 'Industrial Design 🎨', 'Trademark', 'Geographical Indication'],
    correctIndex: 1,
    explanation: 'Copying the aesthetic, non-functional 3D outer shape of a registered product violates Industrial Design protection.',
    tier: 2
  }
];

// Tier 3 Question Bank — Advanced IP Mastermind & Startup Strategy
const TIER_3_QUESTIONS: ClassroomQuestion[] = [
  {
    id: 1,
    question: 'Startup Strategy: An EdTech startup builds an AI tutoring robot, writes original software code, and creates a catchy brand name. Which IP package do they need?',
    category: 'Patents',
    options: [
      'Patent for hardware, Copyright for code, Trademark for brand 🚀',
      'Only a Copyright is sufficient for everything',
      'Only a Trade Secret for the brand name',
      'IP protection is not required for startups'
    ],
    correctIndex: 0,
    explanation: 'A successful startup uses a multi-layered IP portfolio: Patents for hardware/mechanisms, Copyright for code, and Trademarks for branding!',
    tier: 3
  },
  {
    id: 2,
    question: 'Novelty Rules: An EV startup displays their new battery design at a public trade fair BEFORE filing a patent application. What risk do they face?',
    category: 'Patents',
    options: [
      'Loss of novelty, making the invention unpatentable ⚠️',
      'Automatic patent grant',
      'Double patent protection',
      'No risk at all'
    ],
    correctIndex: 0,
    explanation: 'Public disclosure prior to patent filing destroys absolute novelty in most jurisdictions, making the invention unpatentable!',
    tier: 3
  },
  {
    id: 3,
    question: 'Software IP: A startup releases their core software library under an Open Source MIT license. Can they still register a Trademark for their company name?',
    category: 'Trademarks',
    options: [
      'Yes! Open source code does not prevent trademark registration 🏷️',
      'No, open source software loses trademark rights',
      'Only if they pay royalty fees to MIT',
      'Trademarks do not apply to tech companies'
    ],
    correctIndex: 0,
    explanation: 'Open Source licensing governs the copyright of the code, while Trademarks protect the brand identity. They are completely separate IP rights!',
    tier: 3
  },
  {
    id: 4,
    question: 'Commercialization: A green energy startup licenses its patented solar cell technology to a global manufacturer in exchange for royalties. What is this process called?',
    category: 'Patents',
    options: ['Technology Licensing & IP Commercialization 💼', 'Trademark Piracy', 'Counterfeiting', 'Public Domain Dedication'],
    correctIndex: 0,
    explanation: 'IP Licensing enables inventors to monetize their patents by granting manufacturing rights to partners in exchange for ongoing royalty revenue.',
    tier: 3
  },
  {
    id: 5,
    question: 'Global Protection: A startup wants patent protection in 50 countries simultaneously. Which international framework simplifies this process?',
    category: 'Patents',
    options: [
      'Patent Cooperation Treaty (PCT) 🌍',
      'Local Municipal Copyright Board',
      'UNESCO Heritage Registrar',
      'Consumer Redressal Forum'
    ],
    correctIndex: 0,
    explanation: 'The PCT (Patent Cooperation Treaty) administered by WIPO allows filing a single international patent application covering over 150 countries!',
    tier: 3
  }
];

// Memory cache for session state fallback (Instant <1ms access)
const inMemorySessions: Record<string, ClassroomSession> = {};
const STUDENT_SESSION_KEY = 'cipam_active_classroom_student';

export function saveStudentSession(session: SavedStudentClassroomSession): void {
  try {
    localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(session));
  } catch (e) {}
}

export function getSavedStudentSession(): SavedStudentClassroomSession | null {
  try {
    const saved = localStorage.getItem(STUDENT_SESSION_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

export function clearStudentSession(): void {
  try {
    localStorage.removeItem(STUDENT_SESSION_KEY);
  } catch (e) {}
}

/**
 * Question Bank Generator
 * Returns rich curated questions instantly (<1ms), preventing network timeouts on room creation.
 */
export function getCuratedQuestions(tier: 1 | 2 | 3): ClassroomQuestion[] {
  if (tier === 2) return TIER_2_QUESTIONS;
  if (tier === 3) return TIER_3_QUESTIONS;
  return TIER_1_QUESTIONS;
}

/**
 * Teacher Creates a New Classroom Live Session (Instant <10ms Response)
 */
export async function createClassroomSession(
  teacherName: string = 'Prof. Teacher',
  teacherId: string = 'CIPAM-TCH-84920',
  tier: 1 | 2 | 3 = 1
): Promise<ClassroomSession> {
  const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
  const questions = getCuratedQuestions(tier);

  const tierTitles = {
    1: 'Tier 1 — Basic IP Explorer',
    2: 'Tier 2 — IP Detective Cases',
    3: 'Tier 3 — Advanced IP Startup Tycoon'
  };

  const newSession: ClassroomSession = {
    roomCode,
    teacherId,
    teacherName: teacherName.trim() || 'Prof. Teacher',
    tier,
    tierTitle: tierTitles[tier] || 'Tier 1 — Basic IP Explorer',
    status: 'WAITING',
    currentQuestionIndex: 0,
    questionStartedAt: Date.now(),
    durationSec: 20,
    createdAt: new Date().toISOString(),
    questions,
    students: []
  };

  // 1. Save in Memory & Local Storage INSTANTLY
  inMemorySessions[roomCode] = newSession;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`cipam_room_${roomCode}`, JSON.stringify(newSession));
    } catch (e) {}
  }

  // 2. Dispatch Firestore & Cloud updates asynchronously in background (Non-blocking!)
  setDoc(doc(db, 'classrooms', roomCode), newSession).catch((err) => {
    console.warn('Firestore background sync notice:', err);
  });

  fetch(`https://ntfy.sh/cipam_room_${roomCode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Title': 'ROOM_UPDATE' },
    body: JSON.stringify(newSession)
  }).catch(() => {});

  // Return new session INSTANTLY so room code displays immediately!
  return newSession;
}

/**
 * Student Joins an Active Classroom Session (Fast Lookup)
 */
export async function joinClassroomSession(
  roomCode: string,
  studentName: string,
  studentAvatar: string = '⚡',
  existingStudentId?: string
): Promise<{ session: ClassroomSession; student: ClassroomStudent }> {
  const cleanCode = roomCode.trim();
  let currentSession: ClassroomSession | null = null;

  // 1. Check Memory / Local Storage FIRST (Instant 0ms lookup!)
  if (inMemorySessions[cleanCode]) {
    currentSession = inMemorySessions[cleanCode];
  } else if (typeof window !== 'undefined') {
    const localData = localStorage.getItem(`cipam_room_${cleanCode}`);
    if (localData) {
      try {
        currentSession = JSON.parse(localData);
      } catch (e) {}
    }
  }

  // 2. Check Firestore authoritatively if not found in memory
  if (!currentSession) {
    try {
      const roomRef = doc(db, 'classrooms', cleanCode);
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        currentSession = snap.data() as ClassroomSession;
      }
    } catch (err) {}
  }

  // 3. Check Cloud Relay if still not found
  if (!currentSession) {
    try {
      const res = await fetch(`https://ntfy.sh/cipam_room_${cleanCode}/json?poll=1`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines.reverse()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message) {
              const sess = JSON.parse(parsed.message) as ClassroomSession;
              if (sess && sess.roomCode === cleanCode) {
                currentSession = sess;
                break;
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  if (!currentSession) {
    throw new Error(`Unable to join classroom. Access code #${cleanCode} was not found. Please verify the 6-digit code and try again.`);
  }

  const studentId = existingStudentId || ('std_' + Math.random().toString(36).substring(2, 9));
  const avatarEmoji = studentAvatar || AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];

  const newStudent: ClassroomStudent = {
    studentId,
    studentName: studentName.trim() || 'Anonymous Student',
    avatarEmoji,
    score: 0,
    status: 'JOINED',
    answersRecord: {},
    joinedAt: new Date().toISOString()
  };

  // Remove duplicate entry if re-joining
  const updatedStudents = (currentSession.students || []).filter(
    (s) => s.studentId !== studentId && s.studentName.toLowerCase() !== studentName.toLowerCase()
  );
  updatedStudents.push(newStudent);

  const updatedSession: ClassroomSession = {
    ...currentSession,
    students: updatedStudents
  };

  // Update memory state & local storage
  inMemorySessions[cleanCode] = updatedSession;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`cipam_room_${cleanCode}`, JSON.stringify(updatedSession));
    } catch (e) {}
  }

  // Asynchronously dispatch updates to Firestore & Cloud Relay
  setDoc(doc(db, 'classrooms', cleanCode), updatedSession, { merge: true }).catch(() => {});
  fetch(`https://ntfy.sh/cipam_room_${cleanCode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedSession)
  }).catch(() => {});

  // Save student session for auto-reconnect
  saveStudentSession({
    roomCode: cleanCode,
    studentId: newStudent.studentId,
    studentName: newStudent.studentName,
    avatarEmoji: newStudent.avatarEmoji,
    joinedAt: newStudent.joinedAt
  });

  return { session: updatedSession, student: newStudent };
}

/**
 * Subscribes to Realtime Classroom Session Updates (Single Authoritative Listener)
 */
export function subscribeToClassroom(
  roomCode: string,
  onUpdate: (session: ClassroomSession) => void,
  onError?: (err: any) => void
): () => void {
  if (!roomCode) return () => {};

  let lastStateStr = '';

  const emitSession = (session: ClassroomSession) => {
    const str = JSON.stringify(session);
    if (str !== lastStateStr) {
      lastStateStr = str;
      inMemorySessions[roomCode] = session;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`cipam_room_${roomCode}`, str);
        } catch (e) {}
      }
      onUpdate(session);
    }
  };

  // 1. Initial memory/local load
  if (inMemorySessions[roomCode]) {
    emitSession(inMemorySessions[roomCode]);
  } else if (typeof window !== 'undefined') {
    const localData = localStorage.getItem(`cipam_room_${roomCode}`);
    if (localData) {
      try {
        emitSession(JSON.parse(localData));
      } catch (e) {}
    }
  }

  // 2. Authoritative Firestore Realtime Listener
  let unsubscribeFirestore = () => {};
  try {
    const roomRef = doc(db, 'classrooms', roomCode);
    unsubscribeFirestore = onSnapshot(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          emitSession(snapshot.data() as ClassroomSession);
        }
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  } catch (err) {}

  // 3. Failsafe Cloud Polling Relay (800ms)
  const pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`https://ntfy.sh/cipam_room_${roomCode}/json?poll=1`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines.reverse()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message) {
              const sess = JSON.parse(parsed.message) as ClassroomSession;
              if (sess && sess.roomCode === roomCode) {
                emitSession(sess);
                break;
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }, 800);

  // Cleanup handler
  return () => {
    unsubscribeFirestore();
    clearInterval(pollInterval);
  };
}

/**
 * Teacher Updates Room Lifecycle Status or Question Index
 */
export async function updateRoomStage(
  roomCode: string,
  status: 'WAITING' | 'ACTIVE' | 'FINISHED',
  currentQuestionIndex: number = 0
): Promise<void> {
  let currentSession = inMemorySessions[roomCode];

  if (!currentSession && typeof window !== 'undefined') {
    const localData = localStorage.getItem(`cipam_room_${roomCode}`);
    if (localData) {
      try {
        currentSession = JSON.parse(localData);
      } catch (e) {}
    }
  }

  if (!currentSession) return;

  const updatedSession: ClassroomSession = {
    ...currentSession,
    status,
    currentQuestionIndex,
    questionStartedAt: Date.now()
  };

  inMemorySessions[roomCode] = updatedSession;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`cipam_room_${roomCode}`, JSON.stringify(updatedSession));
    } catch (e) {}
  }

  setDoc(doc(db, 'classrooms', roomCode), updatedSession, { merge: true }).catch(() => {});
  fetch(`https://ntfy.sh/cipam_room_${roomCode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedSession)
  }).catch(() => {});
}

/**
 * Student Submits an Answer for the Active Question
 */
export async function submitStudentAnswer(
  roomCode: string,
  studentId: string,
  questionIndex: number,
  selectedIndex: number,
  earnedPoints: number,
  isCorrect: boolean
): Promise<void> {
  const session = inMemorySessions[roomCode];
  if (!session) return;

  const updatedStudents = (session.students || []).map((st) => {
    if (st.studentId === studentId) {
      const prevRecord = st.answersRecord || {};
      return {
        ...st,
        score: st.score + earnedPoints,
        status: 'ACTIVE' as const,
        answersRecord: {
          ...prevRecord,
          [questionIndex]: { selectedIndex, points: earnedPoints, isCorrect }
        }
      };
    }
    return st;
  });

  const updatedSession: ClassroomSession = {
    ...session,
    students: updatedStudents
  };

  inMemorySessions[roomCode] = updatedSession;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`cipam_room_${roomCode}`, JSON.stringify(updatedSession));
    } catch (e) {}
  }

  updateDoc(doc(db, 'classrooms', roomCode), { students: updatedStudents }).catch(() => {});
  fetch(`https://ntfy.sh/cipam_room_${roomCode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedSession)
  }).catch(() => {});
}

/**
 * Logs Student Global Progress into Firestore for Teacher Dashboard
 */
export async function logStudentGlobalProgress(
  studentName: string,
  avatarEmoji: string,
  totalScore: number,
  badges: string[],
  levelsCompletedCount: number
): Promise<void> {
  const id = 'student_log_' + studentName.toLowerCase().replace(/\s+/g, '_');
  const logEntry: GlobalStudentLog = {
    id,
    studentName,
    avatarEmoji: avatarEmoji || '🎓',
    totalScore,
    badges,
    levelsCompletedCount,
    updatedAt: new Date().toISOString()
  };

  try {
    const logRef = doc(db, 'student_progress', id);
    await setDoc(logRef, logEntry, { merge: true });
  } catch (err) {}
}

/**
 * Retrieves Global Logs for Teacher Scoreboard Dashboard
 */
export async function getGlobalStudentLogs(): Promise<GlobalStudentLog[]> {
  try {
    const logsRef = collection(db, 'student_progress');
    const snapshot = await getDocs(logsRef);
    if (!snapshot.empty) {
      const firestoreLogs: GlobalStudentLog[] = [];
      snapshot.forEach(docSnap => {
        firestoreLogs.push(docSnap.data() as GlobalStudentLog);
      });
      return firestoreLogs.sort((a, b) => b.totalScore - a.totalScore);
    }
  } catch (err) {}

  return [];
}
