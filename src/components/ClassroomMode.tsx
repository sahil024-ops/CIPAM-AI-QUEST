import React, { useState, useEffect, useRef } from 'react';
import { X, Users, Play, Timer, CheckCircle2, XCircle, Trophy, Sparkles, Key, LogIn, Wifi, Loader2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { loadGameState, type StudentProfile } from '../utils/storage';
import { 
  createClassroomSession, 
  joinClassroomSession, 
  subscribeToClassroom, 
  updateRoomStage, 
  submitStudentAnswer, 
  logStudentGlobalProgress,
  getSavedStudentSession,
  clearStudentSession,
  type ClassroomSession, 
  type ClassroomStudent,
  type ClassroomQuestion 
} from '../services/classroomService';

interface ClassroomModeProps {
  userProfile?: StudentProfile;
  onClose: () => void;
}

const QUESTION_DURATION_SEC = 20;

export const ClassroomMode: React.FC<ClassroomModeProps> = ({ userProfile, onClose }) => {
  // Load saved user profile if not directly provided
  const activeProfile = userProfile || loadGameState().profile;
  const initialRole = activeProfile.role === 'Teacher' ? 'TeacherHost' : 'StudentJoin';

  const [activeTab, setActiveTab] = useState<'TeacherHost' | 'StudentJoin'>(initialRole);

  // Teacher Creation & Tier Selection State
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(1);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);

  // Active Room Session
  const [session, setSession] = useState<ClassroomSession | null>(null);

  // Student State Machine & Inputs
  const [inputCode, setInputCode] = useState('');
  const [studentNameInput, setStudentNameInput] = useState(activeProfile.name || '');
  const [studentAvatarInput, setStudentAvatarInput] = useState(activeProfile.avatar || '⚡');
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [myStudentInfo, setMyStudentInfo] = useState<ClassroomStudent | null>(null);

  const myStudentInfoRef = useRef<ClassroomStudent | null>(null);
  useEffect(() => {
    myStudentInfoRef.current = myStudentInfo;
  }, [myStudentInfo]);

  // Quiz Gameplay State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION_SEC);

  const activeRoomCode = session?.roomCode || inputCode.trim();

  // Auto Reconnect Saved Student Session on Mount
  useEffect(() => {
    const saved = getSavedStudentSession();
    if (saved && saved.roomCode) {
      setActiveTab('StudentJoin');
      setInputCode(saved.roomCode);
      setStudentNameInput(saved.studentName);
      setStudentAvatarInput(saved.avatarEmoji || '⚡');
      
      // Auto reconnect to saved room
      setIsConnecting(true);
      joinClassroomSession(saved.roomCode, saved.studentName, saved.avatarEmoji, saved.studentId)
        .then(({ session: joinedSession, student }) => {
          setSession(joinedSession);
          setMyStudentInfo(student);
          setIsConnecting(false);
        })
        .catch(() => {
          clearStudentSession();
          setIsConnecting(false);
        });
    }
  }, []);

  // Real-Time Room Subscription Effect (Firestore Single Source of Truth)
  useEffect(() => {
    if (!activeRoomCode || activeRoomCode.length !== 6) return;

    const unsubscribe = subscribeToClassroom(
      activeRoomCode,
      (updatedSession) => {
        setSession(updatedSession);

        // Synchronize current question index across devices
        const sIndex = updatedSession.currentQuestionIndex || 0;
        setCurrentQIndex((prevQ) => {
          if (prevQ !== sIndex) {
            setSelectedOption(null);
            setIsAnswered(false);
          }
          return sIndex;
        });

        // Restore student score and answered state for current question
        const activeStudent = myStudentInfoRef.current;
        if (activeStudent && updatedSession.students) {
          const matchingMe = updatedSession.students.find(s => s.studentId === activeStudent.studentId);
          if (matchingMe) {
            setScore(matchingMe.score);
            const recordedAnswer = matchingMe.answersRecord?.[sIndex];
            if (recordedAnswer) {
              setSelectedOption(recordedAnswer.selectedIndex);
              setIsAnswered(true);
            }
          }
        }
      },
      (err) => {
        console.warn('Realtime subscription notification:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeRoomCode]);

  // Synchronized Countdown Timer (Timestamp Math)
  useEffect(() => {
    if (!session || session.status !== 'ACTIVE') return;

    const updateTimer = () => {
      const startedAt = session.questionStartedAt || Date.now();
      const duration = session.durationSec || QUESTION_DURATION_SEC;
      const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, duration - elapsedSec);

      setTimeLeft(remaining);

      if (remaining === 0 && !isAnswered && activeTab === 'StudentJoin') {
        setIsAnswered(true);
        soundFx.playWrong();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [session?.questionStartedAt, session?.status, session?.currentQuestionIndex, isAnswered, activeTab]);

  // Teacher Action: Create New Classroom Session
  const handleTeacherCreateRoom = async () => {
    setIsCreatingRoom(true);
    soundFx.playClick();

    try {
      const newSession = await createClassroomSession(
        activeProfile.name || 'Prof. Teacher',
        activeProfile.studentId || 'CIPAM-TCH-84920',
        selectedTier
      );
      setSession(newSession);
      soundFx.playVictory();
    } catch (err) {
      console.error('Failed to create classroom session:', err);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Teacher Action: Start Classroom Activity
  const handleTeacherStartQuiz = async () => {
    if (isStartingQuiz || !session) return;
    setIsStartingQuiz(true);
    soundFx.playClick();

    try {
      setCurrentQIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      await updateRoomStage(session.roomCode, 'ACTIVE', 0);
    } catch (err) {
      console.error('Failed to start classroom activity:', err);
    } finally {
      setIsStartingQuiz(false);
    }
  };

  // Student Action: Join Live Classroom
  const handleStudentJoinRoom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setJoinError('');

    const cleanCode = inputCode.trim();
    if (cleanCode.length !== 6) {
      setJoinError('Please enter a valid 6-digit Classroom Access Code!');
      soundFx.playWrong();
      return;
    }

    setIsConnecting(true);

    try {
      const { session: joinedSession, student } = await joinClassroomSession(
        cleanCode,
        studentNameInput.trim() || activeProfile.name || 'Student',
        studentAvatarInput || activeProfile.avatar || '⚡'
      );

      soundFx.playCorrect();
      setSession(joinedSession);
      setMyStudentInfo(student);
      setIsConnecting(false);
    } catch (err: any) {
      setIsConnecting(false);
      soundFx.playWrong();
      setJoinError(err.message || 'Unable to join classroom. Please check the 6-digit code and try again.');
    }
  };

  // Student Action: Select & Submit Answer Choice
  const handleSelectOption = async (idx: number) => {
    if (activeTab !== 'StudentJoin' || isAnswered || !myStudentInfo || !session) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const currentQ = session.questions[currentQIndex];
    if (!currentQ) return;

    const isCorrect = idx === currentQ.correctIndex;
    const earnedPoints = isCorrect ? (100 + timeLeft * 5) : 0;

    if (isCorrect) {
      soundFx.playCorrect();
      setScore((prev) => prev + earnedPoints);
    } else {
      soundFx.playWrong();
    }

    // Submit answer authoritatively to Firestore
    await submitStudentAnswer(
      session.roomCode,
      myStudentInfo.studentId,
      currentQIndex,
      idx,
      earnedPoints,
      isCorrect
    );
  };

  // Teacher Action: Move to Next Question
  const handleNextQuestion = async () => {
    if (!session) return;
    soundFx.playClick();

    if (currentQIndex < session.questions.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswered(false);
      await updateRoomStage(session.roomCode, 'ACTIVE', nextIdx);
    } else {
      soundFx.playVictory();
      await updateRoomStage(session.roomCode, 'FINISHED', currentQIndex);

      // Log student progress globally
      if (myStudentInfo) {
        await logStudentGlobalProgress(
          myStudentInfo.studentName,
          myStudentInfo.avatarEmoji,
          score,
          ['classroom_champion'],
          5
        );
      }
    }
  };

  // Leave / Reset Session
  const handleLeaveRoom = () => {
    soundFx.playClick();
    clearStudentSession();
    setSession(null);
    setMyStudentInfo(null);
    setInputCode('');
    setJoinError('');
    setIsConnecting(false);
  };

  const connectedStudents = session?.students || [];
  const currentQ: ClassroomQuestion | undefined = session?.questions?.[currentQIndex];
  const isTeacherRole = activeProfile.role === 'Teacher';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-3xl rounded-3xl border border-indigo-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Classroom Live Arena</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  <Wifi className="w-3 h-3 animate-pulse" /> Realtime Firestore Synced
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isTeacherRole ? 'Teacher Educator Host Dashboard' : 'Student Interactive Classroom Arena'}
              </p>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Tab Navigation (Allows switching role view for testing) */}
        {!session && (
          <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 sm:px-6 gap-2 shrink-0">
            <button
              onClick={() => { soundFx.playClick(); setActiveTab('TeacherHost'); }}
              className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 ${
                activeTab === 'TeacherHost'
                  ? 'border-indigo-400 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>👩‍🏫 Teacher View (Create Room)</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveTab('StudentJoin'); }}
              className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 ${
                activeTab === 'StudentJoin'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>👦 Student View (Join Room)</span>
            </button>
          </div>
        )}

        {/* Main Content Scroll Area */}
        <div className="p-4 sm:p-8 flex-1 flex flex-col justify-between overflow-y-auto min-h-0">
          
          {/* ======================================================== */}
          {/* TEACHER HOST MODE — ROOM CREATION FORM & TIER SELECTOR */}
          {/* ======================================================== */}
          {activeTab === 'TeacherHost' && !session && (
            <div className="space-y-6 max-w-lg mx-auto py-2 my-auto text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Educator Smartboard Mode
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">Create a Live Classroom Session</h3>
                <p className="text-xs text-slate-300">
                  Select an IP learning level for your class, generate a 6-digit access code, and project the screen for students to join!
                </p>
              </div>

              {/* Tier Selection */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" /> Choose Learning Level / Tier:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedTier(1)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      selectedTier === 1
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-black text-amber-400">Tier 1</div>
                    <div className="text-xs font-bold text-white">Basic IP Explorer</div>
                    <div className="text-[10px] text-slate-400">Patents, Brands, Copyright basics</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTier(2)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      selectedTier === 2
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-black text-amber-400">Tier 2</div>
                    <div className="text-xs font-bold text-white">IP Detective</div>
                    <div className="text-[10px] text-slate-400">Scenario cases & infringement</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTier(3)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      selectedTier === 3
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-black text-amber-400">Tier 3</div>
                    <div className="text-xs font-bold text-white">Startup Tycoon</div>
                    <div className="text-[10px] text-slate-400">Startup IP strategy & licensing</div>
                  </button>
                </div>
              </div>

              {/* Create Classroom Button */}
              <button
                type="button"
                disabled={isCreatingRoom}
                onClick={handleTeacherCreateRoom}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 active:scale-95 text-white font-black text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition touch-manipulation cursor-pointer disabled:opacity-50"
              >
                {isCreatingRoom ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Generating AI Classroom Session...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" /> Create Live Classroom (Tier {selectedTier})
                  </>
                )}
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* TEACHER HOST MODE — WAITING ROOM & CONNECTED STUDENTS */}
          {/* ======================================================== */}
          {activeTab === 'TeacherHost' && session && session.status === 'WAITING' && (
            <div className="space-y-6 text-center py-2 my-auto">
              <div className="space-y-2 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase">
                  {session.tierTitle}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">Classroom Live Waiting Room</h3>
                <p className="text-xs text-slate-300">
                  Project this 6-digit access code on your smartboard for students to join from their devices!
                </p>
              </div>

              {/* Room Code Box */}
              <div className="max-w-xs mx-auto p-5 rounded-3xl bg-slate-900 border-2 border-indigo-500/40 space-y-1 shadow-xl">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">CLASSROOM CODE</div>
                <div className="text-4xl font-black text-gradient-purple tracking-wider font-mono">{session.roomCode}</div>
              </div>

              {/* Real-time Connected Students Grid */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Connected Students:</span>
                  <span className="text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-extrabold">
                    Students Joined: {connectedStudents.length}
                  </span>
                </div>

                {connectedStudents.length === 0 ? (
                  <div className="py-6 text-slate-500 text-xs italic flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    Waiting for students to enter code <strong>#{session.roomCode}</strong> on their devices...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-36 overflow-y-auto p-1">
                    {connectedStudents.map((st) => (
                      <div key={st.studentId} className="p-2.5 rounded-xl bg-slate-800/80 border border-indigo-500/20 flex items-center gap-2 text-left animate-fadeIn">
                        <span className="text-xl">{st.avatarEmoji}</span>
                        <div className="truncate">
                          <div className="text-xs font-bold text-white truncate">{st.studentName}</div>
                          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Ready
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Start Quiz Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isStartingQuiz}
                  onClick={handleTeacherStartQuiz}
                  className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 active:scale-95 text-white font-black text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition touch-manipulation cursor-pointer disabled:opacity-50"
                >
                  {isStartingQuiz ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Launching Live Activity...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-white" /> START CLASSROOM ({connectedStudents.length} Students)
                    </>
                  )}
                </button>

                <button
                  onClick={handleLeaveRoom}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs transition"
                >
                  Cancel / End Session
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STUDENT JOIN MODE — JOIN FORM (No Teacher Controls) */}
          {/* ======================================================== */}
          {activeTab === 'StudentJoin' && !session && (
            <div className="space-y-6 text-center py-4 max-w-md mx-auto my-auto">
              <form onSubmit={handleStudentJoinRoom} className="space-y-4 text-left">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Key className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-white">Join Live Classroom</h3>
                  <p className="text-xs text-slate-300">
                    Enter the 6-digit Classroom Code shown on your teacher's projector screen!
                  </p>
                </div>

                {/* ERROR BANNER WITH TRY AGAIN BUTTON — ZERO INFINITE SPINNERS */}
                {joinError && (
                  <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 space-y-2 text-center animate-fadeIn">
                    <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-xs">
                      <AlertCircle className="w-4 h-4" /> Unable to Join Classroom
                    </div>
                    <p className="text-xs text-slate-300">{joinError}</p>
                    <button
                      type="button"
                      onClick={() => { setJoinError(''); setInputCode(''); }}
                      className="px-4 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 transition inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Try Again
                    </button>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">6-Digit Classroom Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="e.g. 803624"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono text-center font-black text-2xl tracking-widest outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={studentNameInput}
                    onChange={(e) => setStudentNameInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-sm transition shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 touch-manipulation cursor-pointer disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Connecting to Classroom...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-slate-950" /> Join Classroom
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* STUDENT JOINED — WAITING FOR TEACHER TO START */}
          {/* ======================================================== */}
          {activeTab === 'StudentJoin' && session && session.status === 'WAITING' && (
            <div className="space-y-6 text-center py-4 max-w-md mx-auto my-auto animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">You're in!</h3>
                <p className="text-xs text-slate-300">Successfully connected to your live classroom session.</p>
              </div>

              {/* Classroom & Student Info Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500/40 space-y-4 text-left shadow-xl">
                <div className="text-center font-bold text-indigo-300 text-xs border-b border-slate-800 pb-2.5 uppercase tracking-wider">
                  {session.tierTitle}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-slate-400">Student:</span>
                    <strong className="text-white font-bold flex items-center gap-1.5">
                      <span>{myStudentInfo?.avatarEmoji || studentAvatarInput}</span>
                      <span>{myStudentInfo?.studentName || studentNameInput}</span>
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-slate-400">Classroom Code:</span>
                    <strong className="text-amber-400 font-mono text-base">#{session.roomCode}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-slate-400">Teacher:</span>
                    <strong className="text-white font-bold">{session.teacherName}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-slate-800">
                    <span className="font-semibold text-slate-400">Connection Status:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 animate-pulse" /> Connected
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-center space-y-1 animate-pulse">
                  <div className="text-xs font-black text-indigo-200">Waiting for your teacher to start...</div>
                  <p className="text-[11px] text-slate-400">The live activity will appear automatically. No page refresh needed!</p>
                </div>
              </div>

              <button
                onClick={handleLeaveRoom}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold underline transition"
              >
                Leave Classroom / Exit
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* ACTIVE QUIZ ARENA (TEACHER & STUDENT SYNCHRONIZED) */}
          {/* ======================================================== */}
          {session && session.status === 'ACTIVE' && currentQ && (
            <div className="space-y-5 animate-fadeIn my-auto">
              {/* Top Progress & Synchronized Timer Bar */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  Question {currentQIndex + 1} of {session.questions.length}
                </span>

                {/* Visible Authoritative Time Limit Bar */}
                <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-sm shadow-md">
                  <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'animate-bounce text-rose-400' : ''}`} />
                  <span>Time Left: {timeLeft}s</span>
                </div>

                {activeTab === 'StudentJoin' ? (
                  <div className="text-xs font-black text-amber-400">Score: {score} pts</div>
                ) : (
                  <div className="text-xs font-black text-indigo-300">Teacher View</div>
                )}
              </div>

              {/* Question Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {currentQ.category}
                </span>
                <h3 className="text-base sm:text-xl font-extrabold text-white leading-snug">{currentQ.question}</h3>
              </div>

              {/* Options Grid (Teacher view starts clean/unselected; Student highlights only upon answer) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-indigo-500/50';

                  // Student answer highlight logic (Only active for Student tab when student has answered)
                  if (activeTab === 'StudentJoin' && isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-extrabold ring-2 ring-emerald-500/30';
                    } else if (selectedOption === idx) {
                      btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                    } else {
                      btnStyle = 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={activeTab === 'TeacherHost' || isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between gap-2 touch-manipulation ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {activeTab === 'StudentJoin' && isAnswered && idx === currentQ.correctIndex && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                      {activeTab === 'StudentJoin' && isAnswered && selectedOption === idx && idx !== currentQ.correctIndex && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Teacher Next Question Control */}
              {(isAnswered || activeTab === 'TeacherHost') && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 space-y-3 animate-fadeIn">
                  <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Explanation & IP Takeaway:
                  </div>
                  <p className="leading-relaxed text-slate-300">{currentQ.explanation}</p>

                  {activeTab === 'TeacherHost' && (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-black text-xs transition shadow-xl shadow-indigo-600/20 touch-manipulation cursor-pointer"
                    >
                      {currentQIndex < session.questions.length - 1 ? 'Next Question ▶' : 'Finish Classroom Activity'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* QUIZ FINISHED RESULTS */}
          {/* ======================================================== */}
          {session && session.status === 'FINISHED' && (
            <div className="space-y-6 text-center py-4 my-auto animate-fadeIn">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Trophy className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white">Classroom Live Activity Completed! 🎉</h3>
                <p className="text-xs text-slate-300">Great job! All student scores have been logged to the classroom leaderboard.</p>
              </div>

              {activeTab === 'StudentJoin' && (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-xs mx-auto">
                  <div className="text-xs font-bold text-slate-400 uppercase">Your Final Quiz Score</div>
                  <div className="text-4xl font-black text-amber-400">{score} pts</div>
                </div>
              )}

              {/* Connected Students Final Leaderboard for Teacher */}
              {activeTab === 'TeacherHost' && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 max-w-md mx-auto text-left">
                  <div className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
                    Final Classroom Leaderboard ({connectedStudents.length} Students)
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {connectedStudents
                      .sort((a, b) => b.score - a.score)
                      .map((st, i) => (
                        <div key={st.studentId} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-amber-400">#{i + 1}</span>
                            <span>{st.avatarEmoji}</span>
                            <span className="font-bold text-white">{st.studentName}</span>
                          </div>
                          <span className="font-black text-amber-400">{st.score} pts</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleLeaveRoom}
                className="w-full max-w-xs mx-auto py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs transition shadow-xl shadow-indigo-600/20 touch-manipulation"
              >
                Exit Classroom Session
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
