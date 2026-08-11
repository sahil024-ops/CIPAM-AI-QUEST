import React, { useState, useEffect, useRef } from 'react';
import { X, Users, Play, Timer, CheckCircle2, XCircle, Trophy, Sparkles, Key, LogIn, Wifi, Loader2 } from 'lucide-react';
import { soundFx } from '../utils/audio';
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
  type ClassroomStudent 
} from '../services/classroomService';

interface ClassroomModeProps {
  onClose: () => void;
}

interface Question {
  id: number;
  question: string;
  category: 'Patents' | 'Trademarks' | 'Copyrights' | 'Industrial Designs';
  options: string[];
  correctIndex: number;
  explanation: string;
}

const CLASSROOM_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Alex invented a foldable solar backpack that charges laptops in 30 minutes. What IP protects this invention\'s technical mechanism?',
    category: 'Patents',
    options: ['Trademark ®', 'Patent ⚙️', 'Copyright ©', 'Geographical Indication 🌾'],
    correctIndex: 1,
    explanation: 'A Patent protects new, useful, and non-obvious technical inventions and functional mechanisms for 20 years!'
  },
  {
    id: 2,
    question: 'Which symbol can be legally used ONLY AFTER a brand name or logo is officially registered with the Trademark Registry in India?',
    category: 'Trademarks',
    options: ['™ symbol', '© symbol', '® symbol', '℗ symbol'],
    correctIndex: 2,
    explanation: 'The ® symbol signifies an officially Registered Trademark. The ™ symbol can be used while the application is pending.'
  },
  {
    id: 3,
    question: 'Maya composed an original song and posted it online. Under Indian law, when does Copyright protection begin for her music?',
    category: 'Copyrights',
    options: [
      'Automatically upon creation in tangible form',
      'Only after paying ₹10,000 to the police',
      'After 5 years of publishing',
      'Copyright does not apply to music'
    ],
    correctIndex: 0,
    explanation: 'Copyright protection arises automatically the moment an original work is expressed in a tangible form!'
  },
  {
    id: 4,
    question: 'A company designed a bottle with a unique curved, wavy glass aesthetic shape. Which IP category protects this visual appearance?',
    category: 'Industrial Designs',
    options: ['Patent', 'Industrial Design 🎨', 'Trade Secret', 'Copyright'],
    correctIndex: 1,
    explanation: 'Industrial Design registration protects ONLY the visual shape, aesthetic look, pattern, or color combination of an item.'
  },
  {
    id: 5,
    question: 'Which of the following allows a school student to quote a brief excerpt from a book in a homework project without copyright infringement?',
    category: 'Copyrights',
    options: ['Fair Use for Educational Purposes', 'Illegal Piracy', 'Patent Exemption', 'Trademark Licensing'],
    correctIndex: 0,
    explanation: 'Fair Use explicitly permits limited usage of copyrighted works for education, research, news reporting, and criticism.'
  }
];

export type StudentStatus = 'NOT_JOINED' | 'JOINING' | 'JOINED_WAITING' | 'QUIZ_ACTIVE' | 'QUIZ_FINISHED';

const QUESTION_DURATION_SEC = 15;

export const ClassroomMode: React.FC<ClassroomModeProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'TeacherHost' | 'StudentJoin'>('TeacherHost');

  // Teacher Host State
  const [teacherRoomCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  
  // Active Room Session
  const [session, setSession] = useState<ClassroomSession | null>(null);

  // Student State Machine
  const [studentStatus, setStudentStatus] = useState<StudentStatus>('NOT_JOINED');
  const [inputCode, setInputCode] = useState('');
  const [studentNameInput, setStudentNameInput] = useState('');
  const [codeError, setCodeError] = useState('');
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

  const currentQ = CLASSROOM_QUESTIONS[currentQIndex];
  const activeRoomCode = activeTab === 'TeacherHost' ? teacherRoomCode : (inputCode.trim() || session?.roomCode || '');

  // Auto Reconnect Saved Student Session on Mount
  useEffect(() => {
    const saved = getSavedStudentSession();
    if (saved && saved.roomCode) {
      setActiveTab('StudentJoin');
      setInputCode(saved.roomCode);
      setStudentNameInput(saved.studentName);
      setStudentStatus('JOINED_WAITING');
    }
  }, []);

  // Initialize Teacher Host Room Session
  useEffect(() => {
    if (activeTab === 'TeacherHost') {
      createClassroomSession(teacherRoomCode, 'Teacher').then((newSession) => {
        setSession(newSession);
      });
    }
  }, [activeTab, teacherRoomCode]);

  // Real-Time Room Subscription Effect
  useEffect(() => {
    if (!activeRoomCode || activeRoomCode.length !== 6) return;

    const unsubscribe = subscribeToClassroom(activeRoomCode, (updatedSession) => {
      setSession(updatedSession);

      // Synchronize question index across teacher & students
      const sIndex = updatedSession.currentQIndex || 0;
      setCurrentQIndex((prevQ) => {
        if (prevQ !== sIndex) {
          setSelectedOption(null);
          setIsAnswered(false);
        }
        return sIndex;
      });

      // Student State Machine Transitions based on Server Session State
      if (activeTab === 'StudentJoin') {
        const stage = updatedSession.gameStage;

        if (stage === 'Lobby') {
          setStudentStatus((prev) => (prev === 'NOT_JOINED' || prev === 'JOINING' ? 'JOINED_WAITING' : 'JOINED_WAITING'));
        } else if (stage === 'Playing') {
          setStudentStatus('QUIZ_ACTIVE');
        } else if (stage === 'Finished') {
          setStudentStatus('QUIZ_FINISHED');
        }

        // Restore answered state for current question if recorded
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
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeRoomCode, activeTab]);

  // Synchronized Countdown Timer (Shared Timestamp Math)
  useEffect(() => {
    if (!session || session.gameStage !== 'Playing') return;

    const updateTimer = () => {
      const startedAt = session.questionStartedAt || Date.now();
      const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, QUESTION_DURATION_SEC - elapsedSec);

      setTimeLeft(remaining);

      if (remaining === 0 && !isAnswered && activeTab === 'StudentJoin') {
        setIsAnswered(true);
        soundFx.playWrong();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [session?.questionStartedAt, session?.gameStage, session?.currentQIndex, isAnswered, activeTab]);

  // Teacher Starts Quiz Action (Mobile Touch Optimized & Failsafe)
  const handleTeacherStartQuiz = async () => {
    if (isStartingQuiz) return;
    setIsStartingQuiz(true);
    soundFx.playClick();

    try {
      setCurrentQIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      await updateRoomStage(teacherRoomCode, 'Playing', 0);
    } catch (err) {
      console.error('Failed to start live classroom quiz:', err);
    } finally {
      setIsStartingQuiz(false);
    }
  };

  // Student Join Form Submit
  const handleStudentJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');

    const cleanCode = inputCode.trim();
    if (cleanCode.length !== 6) {
      setCodeError('Please enter a valid 6-digit Classroom Access Code!');
      soundFx.playWrong();
      return;
    }

    setStudentStatus('JOINING');

    try {
      const student = await joinClassroomSession(cleanCode, studentNameInput.trim());
      soundFx.playCorrect();
      setMyStudentInfo(student);

      // If room is already Playing (Late Joiner), enter QUIZ_ACTIVE immediately; else enter JOINED_WAITING
      if (session?.gameStage === 'Playing') {
        setStudentStatus('QUIZ_ACTIVE');
        setCurrentQIndex(session.currentQIndex || 0);
      } else {
        setStudentStatus('JOINED_WAITING');
      }
    } catch (err) {
      setStudentStatus('NOT_JOINED');
      setCodeError('Failed to join classroom session. Please verify room code.');
    }
  };

  // Student Choice Selection Action
  const handleSelectOption = async (idx: number) => {
    if (activeTab !== 'StudentJoin' || isAnswered || !myStudentInfo || !activeRoomCode) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    const earnedPoints = isCorrect ? (100 + timeLeft * 5) : 0;

    if (isCorrect) {
      soundFx.playCorrect();
      setScore((prev) => prev + earnedPoints);
    } else {
      soundFx.playWrong();
    }

    // Submit answer to real-time server session
    await submitStudentAnswer(activeRoomCode, myStudentInfo.studentId, earnedPoints, isCorrect, currentQIndex, idx);
  };

  // Teacher / Next Question Navigation
  const handleNextQuestion = async () => {
    soundFx.playClick();
    if (currentQIndex < CLASSROOM_QUESTIONS.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswered(false);

      if (activeTab === 'TeacherHost') {
        await updateRoomStage(teacherRoomCode, 'Playing', nextIdx);
      }
    } else {
      soundFx.playVictory();
      if (activeTab === 'TeacherHost') {
        await updateRoomStage(teacherRoomCode, 'Finished', currentQIndex);
      }

      // Log progress to global database
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

  // Leave / Exit Room Action
  const handleLeaveRoom = () => {
    soundFx.playClick();
    clearStudentSession();
    setStudentStatus('NOT_JOINED');
    setMyStudentInfo(null);
    setInputCode('');
    setStudentNameInput('');
  };

  const connectedStudents = session?.students || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-3xl rounded-3xl border border-indigo-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Top Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Classroom Live Quiz Arena</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  <Wifi className="w-3 h-3 animate-pulse" /> Realtime Synced
                </span>
              </div>
              <p className="text-xs text-slate-400">Interactive Classroom Show for Teachers & Students</p>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Tabs (Shown when Student is NOT_JOINED) */}
        {studentStatus === 'NOT_JOINED' && (
          <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 sm:px-6 gap-2 shrink-0">
            <button
              onClick={() => { soundFx.playClick(); setActiveTab('TeacherHost'); }}
              className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 ${
                activeTab === 'TeacherHost'
                  ? 'border-indigo-400 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>👩‍🏫 Host as Teacher (Projector Screen)</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveTab('StudentJoin'); }}
              className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 ${
                activeTab === 'StudentJoin'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>👦 Join as Student (Enter Code)</span>
            </button>
          </div>
        )}

        {/* Modal Main Content Area */}
        <div className="p-4 sm:p-8 flex-1 flex flex-col justify-between overflow-y-auto min-h-0">
          {/* TEACHER HOST MODE LOBBY */}
          {activeTab === 'TeacherHost' && session?.gameStage === 'Lobby' && (
            <div className="space-y-6 text-center py-2 my-auto">
              <div className="space-y-2 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase">
                  <Sparkles className="w-3.5 h-3.5" /> Teacher Smartboard Projector Mode
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">Host a Live IPR Challenge in Class!</h3>
                <p className="text-xs text-slate-300">
                  Project this screen on your smartboard. Students join from their phone browsers by typing the 6-digit room code!
                </p>
              </div>

              {/* Room Code Box */}
              <div className="max-w-xs mx-auto p-5 rounded-3xl bg-slate-900 border-2 border-indigo-500/40 space-y-1 shadow-xl">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Classroom Access Code</div>
                <div className="text-4xl font-black text-gradient-purple tracking-wider font-mono">{teacherRoomCode}</div>
              </div>

              {/* Real-time Connected Students Grid */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Connected Student Devices:</span>
                  <span className="text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-extrabold">
                    {connectedStudents.length} Active Students
                  </span>
                </div>

                {connectedStudents.length === 0 ? (
                  <div className="py-6 text-slate-500 text-xs italic">
                    Waiting for students to enter room code <strong>#{teacherRoomCode}</strong> on their phones...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-32 overflow-y-auto p-1">
                    {connectedStudents.map((st) => (
                      <div key={st.studentId} className="p-2.5 rounded-xl bg-slate-800/80 border border-indigo-500/20 flex items-center gap-2 text-left animate-fadeIn">
                        <span className="text-xl">{st.avatarEmoji}</span>
                        <div className="truncate">
                          <div className="text-xs font-bold text-white truncate">{st.studentName}</div>
                          <div className="text-[10px] text-emerald-400 font-mono">Ready to play</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Start Quiz Button (Touch Optimized for Mobile 360px-414px) */}
              <button
                type="button"
                disabled={isStartingQuiz}
                onClick={handleTeacherStartQuiz}
                className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-black text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition touch-manipulation cursor-pointer relative z-10 disabled:opacity-50"
              >
                {isStartingQuiz ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Launching Live Arena...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" /> Start Live Classroom Quiz ({connectedStudents.length} Joined)
                  </>
                )}
              </button>
            </div>
          )}

          {/* STUDENT JOIN FORM (NOT_JOINED) */}
          {activeTab === 'StudentJoin' && studentStatus === 'NOT_JOINED' && (
            <div className="space-y-6 text-center py-4 max-w-md mx-auto my-auto">
              <form onSubmit={handleStudentJoinRoom} className="space-y-4 text-left">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Key className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-white">Join Classroom Live Session</h3>
                  <p className="text-xs text-slate-300">
                    Enter the 6-digit Room Code shown on your teacher's projector screen!
                  </p>
                </div>

                {codeError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
                    {codeError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">Classroom 6-Digit Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="e.g. 558308"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono text-center font-black text-2xl tracking-widest outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">Your Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. qwerty"
                    value={studentNameInput}
                    onChange={(e) => setStudentNameInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-sm transition shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 touch-manipulation"
                >
                  <LogIn className="w-4 h-4 text-slate-950" /> Join Live Classroom & Enter Arena
                </button>
              </form>
            </div>
          )}

          {/* STUDENT JOINING LOADING STATE */}
          {studentStatus === 'JOINING' && (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto my-auto">
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
              <h3 className="text-xl font-black text-white">Connecting to Classroom #{inputCode}...</h3>
              <p className="text-xs text-slate-400">Verifying session and registering student device...</p>
            </div>
          )}

          {/* STUDENT JOINED & WAITING FOR TEACHER (JOINED_WAITING) */}
          {activeTab === 'StudentJoin' && studentStatus === 'JOINED_WAITING' && session?.gameStage !== 'Playing' && (
            <div className="space-y-6 text-center py-4 max-w-md mx-auto my-auto animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                  ✓ Connected to Classroom
                </div>
                <h3 className="text-2xl font-black text-white">Joined Successfully!</h3>
              </div>

              {/* Waiting Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500/40 space-y-4 text-left shadow-xl">
                <div className="text-center font-bold text-indigo-300 text-sm border-b border-slate-800 pb-3 uppercase tracking-wider">
                  LIVE CLASSROOM
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-slate-400">Student:</span>
                    <strong className="text-white font-bold">{myStudentInfo?.studentName || studentNameInput}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-slate-400">Room Code:</span>
                    <strong className="text-amber-400 font-mono text-base">{inputCode || session?.roomCode}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-slate-800">
                    <span className="font-semibold text-slate-400">Connection Status:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 animate-pulse" /> Connected
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-center space-y-1 animate-pulse">
                  <div className="text-xs font-black text-indigo-200">Waiting for teacher to start the quiz...</div>
                  <p className="text-[11px] text-slate-400">Please wait for the teacher to start. The quiz will begin automatically!</p>
                </div>
              </div>

              <button
                onClick={handleLeaveRoom}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold underline transition"
              >
                Leave Room / Exit Session
              </button>
            </div>
          )}

          {/* ACTIVE QUIZ ARENA (QUIZ_ACTIVE) */}
          {(session?.gameStage === 'Playing' || (activeTab === 'StudentJoin' && studentStatus === 'QUIZ_ACTIVE')) && session?.gameStage !== 'Finished' && (
            <div className="space-y-5 animate-fadeIn my-auto">
              {/* Top Progress & Synchronized Visible Timer Bar */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  Question {currentQIndex + 1} of {CLASSROOM_QUESTIONS.length}
                </span>

                {/* Visible Time Limit Bar for both Teacher & Students */}
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

              {/* Options Grid (Teacher view starts completely clean/unselected; Student highlights only upon answer) */}
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

              {/* Teacher Control & Explanation Banner */}
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
                      {currentQIndex < CLASSROOM_QUESTIONS.length - 1 ? 'Next Question ▶' : 'View Final Quiz Leaderboard'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* QUIZ FINISHED (QUIZ_FINISHED) */}
          {(session?.gameStage === 'Finished' || (activeTab === 'StudentJoin' && studentStatus === 'QUIZ_FINISHED')) && (
            <div className="space-y-6 text-center py-4 my-auto animate-fadeIn">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Trophy className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white">Classroom Live Quiz Completed! 🎉</h3>
                <p className="text-xs text-slate-300">Great job! All scores have been logged to the smartboard leaderboard.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-xs mx-auto">
                <div className="text-xs font-bold text-slate-400 uppercase">Your Final Quiz Score</div>
                <div className="text-4xl font-black text-amber-400">{score} pts</div>
              </div>

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
