// LocalStorage helper for student game state, progress, score, and badges

export const MIN_SCORE_TO_PASS = 100; // Minimum score threshold required to pass level and unlock next tier

export interface StudentProfile {
  name: string;
  avatar: string;
  grade: string;
  schoolName: string;
  stateCity?: string;
  studentId?: string;
  role?: 'Student' | 'Teacher';
  isOnboarded?: boolean;
}

export interface LevelProgress {
  levelId: string;
  unlocked: boolean;
  completed: boolean;
  score: number;
  maxScore: number;
  stars: number; // 0 to 3
}

export interface LevelGradeSheet {
  levelId: string;
  levelTitle: string;
  score: number;
  maxScore: number;
  stars: number;
  accuracyPercentage: number;
  completedAt: string;
  gradeCode: string; // e.g. "CIPAM-GRD-84920"
}

export interface UserGameState {
  profile: StudentProfile;
  totalScore: number;
  xp: number;
  streak: number;
  completedLevels: string[];
  levelProgress: Record<string, LevelProgress>;
  gradeSheets?: Record<string, LevelGradeSheet>;
  badges: string[]; // Badge IDs
  unlockedTitbits: string[];
  certificateEarned: boolean;
}

const STORAGE_KEY = 'cipam_ip_quest_user_state_v1';

const DEFAULT_STATE: UserGameState = {
  profile: {
    name: 'Young Innovator',
    avatar: '⚡',
    grade: 'Class 8',
    schoolName: 'Delhi Public School',
    stateCity: 'New Delhi, Delhi',
    studentId: 'CIPAM-STU-84920',
    role: 'Student',
    isOnboarded: false,
  },
  totalScore: 0,
  xp: 0,
  streak: 1,
  completedLevels: [],
  levelProgress: {
    'patents_basic': { levelId: 'patents_basic', unlocked: true, completed: false, score: 0, maxScore: 300, stars: 0 },
    'trademarks_basic': { levelId: 'trademarks_basic', unlocked: false, completed: false, score: 0, maxScore: 300, stars: 0 },
    'copyrights_basic': { levelId: 'copyrights_basic', unlocked: false, completed: false, score: 0, maxScore: 300, stars: 0 },
    'designs_basic': { levelId: 'designs_basic', unlocked: false, completed: false, score: 0, maxScore: 300, stars: 0 },
    'detective_case1': { levelId: 'detective_case1', unlocked: false, completed: false, score: 0, maxScore: 400, stars: 0 },
    'detective_case2': { levelId: 'detective_case2', unlocked: false, completed: false, score: 0, maxScore: 400, stars: 0 },
    'detective_case3': { levelId: 'detective_case3', unlocked: false, completed: false, score: 0, maxScore: 400, stars: 0 },
    'startup_simulator': { levelId: 'startup_simulator', unlocked: false, completed: false, score: 0, maxScore: 500, stars: 0 },
  },
  gradeSheets: {},
  badges: [],
  unlockedTitbits: ['basmati_gi', 'turmeric_patent'],
  certificateEarned: false,
};

export const loadGameState = (): UserGameState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...DEFAULT_STATE, 
        ...parsed,
        gradeSheets: parsed.gradeSheets || {} 
      };
    }
  } catch (e) {
    console.error('Error loading game state from localStorage:', e);
  }
  return DEFAULT_STATE;
};

export const saveGameState = (state: UserGameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving game state to localStorage:', e);
  }
};

export const resetGameState = (): UserGameState => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error resetting game state:', e);
  }
  return DEFAULT_STATE;
};
