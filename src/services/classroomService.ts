import { db, doc, setDoc, onSnapshot, collection, getDocs } from './firebase';

export interface ClassroomStudent {
  studentId: string;
  studentName: string;
  score: number;
  currentQIndex: number;
  isAnswered: boolean;
  lastAnswerCorrect: boolean;
  joinedAt: string;
  avatarEmoji: string;
}

export interface ClassroomSession {
  roomCode: string;
  teacherName: string;
  gameStage: 'Lobby' | 'Playing' | 'Finished';
  currentQIndex: number;
  createdAt: string;
  students: ClassroomStudent[];
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

// Memory cache for room sessions
const inMemorySessions: Record<string, ClassroomSession> = {};

// Fallback BroadcastChannel for instant local network / tab sync
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('cipam_classroom_channel') 
  : null;

// Helper to handle local storage fallback state
const getLocalSessionKey = (roomCode: string) => `cipam_room_${roomCode}`;
const getGlobalLogsKey = () => `cipam_global_student_logs`;

const saveLocalSessionMemoryOnly = (session: ClassroomSession) => {
  inMemorySessions[session.roomCode] = session;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(getLocalSessionKey(session.roomCode), JSON.stringify(session));
    } catch (e) {}
  }
};

const publishSessionToCloud = async (session: ClassroomSession) => {
  saveLocalSessionMemoryOnly(session);
  broadcastChannel?.postMessage({ type: 'ROOM_UPDATE', roomCode: session.roomCode, session });

  // 1. Publish to zero-config real-time HTTP/WebSocket relay (works across Incognito, Mobile, and cross-browsers)
  try {
    await fetch(`https://ntfy.sh/cipam_room_${session.roomCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
  } catch (err) {
    console.warn('ntfy.sh cloud relay error:', err);
  }

  // 2. Publish to Firebase Firestore if available
  try {
    const roomRef = doc(db, 'classrooms', session.roomCode);
    await setDoc(roomRef, session);
  } catch (err) {
    console.warn('Firestore sync fallback:', err);
  }
};

const getLocalSession = async (roomCode: string): Promise<ClassroomSession | null> => {
  if (inMemorySessions[roomCode]) {
    return inMemorySessions[roomCode];
  }

  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(getLocalSessionKey(roomCode));
    if (data) {
      try {
        const parsed = JSON.parse(data);
        inMemorySessions[roomCode] = parsed;
        return parsed;
      } catch (e) {}
    }
  }

  // Fetch latest state from cloud relay if not found locally
  try {
    const res = await fetch(`https://ntfy.sh/cipam_room_${roomCode}/json?poll=1`);
    if (res.ok) {
      const text = await res.text();
      const lines = text.trim().split('\n');
      for (const line of lines.reverse()) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message) {
            const session = JSON.parse(parsed.message) as ClassroomSession;
            if (session && session.roomCode === roomCode) {
              inMemorySessions[roomCode] = session;
              return session;
            }
          }
        } catch (e) {}
      }
    }
  } catch (err) {}

  return null;
};

/**
 * Creates a new Classroom Room Session (Teacher Host)
 */
export async function createClassroomSession(roomCode: string, teacherName: string = 'Teacher'): Promise<ClassroomSession> {
  const initialSession: ClassroomSession = {
    roomCode,
    teacherName,
    gameStage: 'Lobby',
    currentQIndex: 0,
    createdAt: new Date().toISOString(),
    students: []
  };

  await publishSessionToCloud(initialSession);
  return initialSession;
}

/**
 * Student Joins an active Classroom Room
 */
export async function joinClassroomSession(roomCode: string, studentName: string): Promise<ClassroomStudent> {
  const studentId = 'std_' + Math.random().toString(36).substring(2, 9);
  const randomEmoji = AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];

  const newStudent: ClassroomStudent = {
    studentId,
    studentName: studentName.trim() || 'Anonymous Student',
    score: 0,
    currentQIndex: 0,
    isAnswered: false,
    lastAnswerCorrect: false,
    joinedAt: new Date().toISOString(),
    avatarEmoji: randomEmoji
  };

  // Get current active session
  const currentSession = (await getLocalSession(roomCode)) || {
    roomCode,
    teacherName: 'Teacher',
    gameStage: 'Lobby',
    currentQIndex: 0,
    createdAt: new Date().toISOString(),
    students: []
  };

  // Remove existing student with same name if re-joining
  const updatedStudents = currentSession.students.filter(s => s.studentName.toLowerCase() !== studentName.toLowerCase());
  updatedStudents.push(newStudent);

  const updatedSession: ClassroomSession = {
    ...currentSession,
    students: updatedStudents
  };

  await publishSessionToCloud(updatedSession);
  return newStudent;
}

/**
 * Subscribes to real-time updates for a classroom room session across Incognito, Mobile & tabs
 */
export function subscribeToClassroom(roomCode: string, callback: (session: ClassroomSession) => void): () => void {
  // 1. Initial local/memory load
  if (inMemorySessions[roomCode]) {
    callback(inMemorySessions[roomCode]);
  } else if (typeof window !== 'undefined') {
    const localData = localStorage.getItem(getLocalSessionKey(roomCode));
    if (localData) {
      try {
        callback(JSON.parse(localData));
      } catch (e) {}
    }
  }

  // 2. BroadcastChannel Listener (Normal tabs)
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'ROOM_UPDATE' && event.data?.roomCode === roomCode) {
      saveLocalSessionMemoryOnly(event.data.session);
      callback(event.data.session);
    }
  };
  broadcastChannel?.addEventListener('message', handleBroadcast);

  // 3. LocalStorage StorageEvent listener for cross-tab sync
  const handleStorage = (event: StorageEvent) => {
    if (event.key === getLocalSessionKey(roomCode) && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        saveLocalSessionMemoryOnly(parsed);
        callback(parsed);
      } catch (e) {}
    }
  };
  window.addEventListener('storage', handleStorage);

  // 4. Real-time Cloud SSE Relay Listener (Works across Incognito, Mobile Devices & Cross-Browsers)
  let eventSource: EventSource | null = null;
  try {
    eventSource = new EventSource(`https://ntfy.sh/cipam_room_${roomCode}/sse`);
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.message) {
          const session = JSON.parse(parsed.message) as ClassroomSession;
          if (session && session.roomCode === roomCode) {
            saveLocalSessionMemoryOnly(session);
            callback(session);
          }
        }
      } catch (e) {}
    };
  } catch (err) {
    console.warn('Cloud SSE relay error:', err);
  }

  // Polling fallback every 1.5 seconds for instant state fetch
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
              const session = JSON.parse(parsed.message) as ClassroomSession;
              if (session && session.roomCode === roomCode) {
                const current = inMemorySessions[roomCode];
                if (!current || JSON.stringify(current) !== JSON.stringify(session)) {
                  saveLocalSessionMemoryOnly(session);
                  callback(session);
                }
                break;
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }, 1500);

  // 5. Firestore Realtime Listener
  let unsubscribeFirestore = () => {};
  try {
    const roomRef = doc(db, 'classrooms', roomCode);
    unsubscribeFirestore = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ClassroomSession;
        saveLocalSessionMemoryOnly(data);
        callback(data);
      }
    }, () => {});
  } catch (err) {}

  // Cleanup handler
  return () => {
    broadcastChannel?.removeEventListener('message', handleBroadcast);
    window.removeEventListener('storage', handleStorage);
    clearInterval(pollInterval);
    eventSource?.close();
    unsubscribeFirestore();
  };
}

/**
 * Teacher updates room game stage / question index
 */
export async function updateRoomStage(
  roomCode: string,
  gameStage: 'Lobby' | 'Playing' | 'Finished',
  currentQIndex: number = 0
): Promise<void> {
  const currentSession = (await getLocalSession(roomCode)) || {
    roomCode,
    teacherName: 'Teacher',
    gameStage,
    currentQIndex,
    createdAt: new Date().toISOString(),
    students: []
  };

  const updatedSession: ClassroomSession = {
    ...currentSession,
    gameStage,
    currentQIndex
  };

  await publishSessionToCloud(updatedSession);
}

/**
 * Student submits an answer & updates score
 */
export async function submitStudentAnswer(
  roomCode: string,
  studentId: string,
  earnedPoints: number,
  isCorrect: boolean,
  currentQIndex: number
): Promise<void> {
  const currentSession = await getLocalSession(roomCode);
  if (!currentSession) return;

  const updatedStudents = currentSession.students.map((student) => {
    if (student.studentId === studentId) {
      return {
        ...student,
        score: student.score + earnedPoints,
        currentQIndex,
        isAnswered: true,
        lastAnswerCorrect: isCorrect
      };
    }
    return student;
  });

  const updatedSession: ClassroomSession = {
    ...currentSession,
    students: updatedStudents
  };

  await publishSessionToCloud(updatedSession);
}

/**
 * Logs a student's global progress into the database
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

  // Save to LocalStorage array
  if (typeof window !== 'undefined') {
    const existingStr = localStorage.getItem(getGlobalLogsKey());
    const logs: GlobalStudentLog[] = existingStr ? JSON.parse(existingStr) : [];
    const index = logs.findIndex(l => l.id === id);
    if (index >= 0) {
      logs[index] = logEntry;
    } else {
      logs.push(logEntry);
    }
    try {
      localStorage.setItem(getGlobalLogsKey(), JSON.stringify(logs));
    } catch (e) {}
  }

  // Save to Firestore
  try {
    const logRef = doc(db, 'student_progress', id);
    await setDoc(logRef, logEntry, { merge: true });
  } catch (err) {}
}

/**
 * Retrieves logged student records for Teacher Scoreboard Dashboard
 */
export async function getGlobalStudentLogs(): Promise<GlobalStudentLog[]> {
  const localLogs: GlobalStudentLog[] = typeof window !== 'undefined' && localStorage.getItem(getGlobalLogsKey())
    ? JSON.parse(localStorage.getItem(getGlobalLogsKey())!)
    : [
        {
          id: 'log_aarav',
          studentName: 'Aarav Sharma',
          avatarEmoji: '⚡',
          totalScore: 1850,
          badges: ['patent_pioneer', 'brand_guardian', 'copyright_defender', 'cipam_champion'],
          levelsCompletedCount: 8,
          updatedAt: new Date().toISOString()
        },
        {
          id: 'log_priya',
          studentName: 'Priya Patel',
          avatarEmoji: '🎨',
          totalScore: 1420,
          badges: ['patent_pioneer', 'design_maestro'],
          levelsCompletedCount: 5,
          updatedAt: new Date().toISOString()
        },
        {
          id: 'log_rohan',
          studentName: 'Rohan Gupta',
          avatarEmoji: '🔍',
          totalScore: 1100,
          badges: ['ip_detective'],
          levelsCompletedCount: 4,
          updatedAt: new Date().toISOString()
        }
      ];

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

  return localLogs.sort((a, b) => b.totalScore - a.totalScore);
}
