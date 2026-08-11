import React, { useState, useEffect } from 'react';
import { X, Users, Play, Timer, CheckCircle2, XCircle, Trophy, Sparkles, ArrowRight, RotateCcw, Key, LogIn, Wifi } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { 
  createClassroomSession, 
  joinClassroomSession, 
  subscribeToClassroom, 
  updateRoomStage, 
  submitStudentAnswer, 
  logStudentGlobalProgress,
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

export const ClassroomMode: React.FC<ClassroomModeProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'TeacherHost' | 'StudentJoin'>('TeacherHost');
  const [gameStage, setGameStage] = useState<'Lobby' | 'Playing' | 'Finished'>('Lobby');

  // Teacher Host State
  const [roomCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [session, setSession] = useState<ClassroomSession | null>(null);

  // Student Join State
  const [inputCode, setInputCode] = useState('');
  const [studentNameInput, setStudentNameInput] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [myStudentInfo, setMyStudentInfo] = useState<ClassroomStudent | null>(null);

  // Quiz Gameplay State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);

  const currentQ = CLASSROOM_QUESTIONS[currentQIndex];

  // Initialize Teacher Host Room Session
  useEffect(() => {
    if (activeTab === 'TeacherHost') {
      createClassroomSession(roomCode, 'Teacher').then((newSession) => {
        setSession(newSession);
      });
    }
  }, [activeTab, roomCode]);

  // Subscribe to real-time database updates for current room code
  const targetRoomCode = activeTab === 'TeacherHost' ? roomCode : inputCode;
  useEffect(() => {
    if (!targetRoomCode || targetRoomCode.length !== 6) return;

    const unsubscribe = subscribeToClassroom(targetRoomCode, (updatedSession) => {
      setSession(updatedSession);

      // Student sync stage & question index from Teacher
      if (activeTab === 'StudentJoin') {
        if (updatedSession.gameStage && updatedSession.gameStage !== gameStage) {
          setGameStage(updatedSession.gameStage);
        }
        if (typeof updatedSession.currentQIndex === 'number' && updatedSession.currentQIndex !== currentQIndex) {
          setCurrentQIndex(updatedSession.currentQIndex);
          setSelectedOption(null);
          setIsAnswered(false);
          setTimeLeft(15);
        }
      }
    });

    return () => unsubscribe();
  }, [targetRoomCode, activeTab, gameStage, currentQIndex]);

  // Timer effect during play
  useEffect(() => {
    if (gameStage !== 'Playing' || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStage, isAnswered, currentQIndex]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    soundFx.playWrong();
  };

  const handleTeacherStartQuiz = async () => {
    soundFx.playClick();
    setGameStage('Playing');
    setCurrentQIndex(0);
    await updateRoomStage(roomCode, 'Playing', 0);
  };

  const handleStudentJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');

    const cleanCode = inputCode.trim();
    if (cleanCode.length !== 6) {
      setCodeError('Please enter a valid 6-digit Classroom Room Code!');
      soundFx.playWrong();
      return;
    }

    try {
      const student = await joinClassroomSession(cleanCode, studentNameInput.trim());
      soundFx.playCorrect();
      setMyStudentInfo(student);
      setJoinSuccess(true);

      // If room is already playing, join live question arena directly
      if (session && session.gameStage === 'Playing') {
        setGameStage('Playing');
        setCurrentQIndex(session.currentQIndex || 0);
      }
    } catch (err) {
      setCodeError('Failed to join classroom session. Check your network or room code.');
    }
  };

  const handleSelectOption = async (idx: number) => {
    if (isAnswered) return;
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

    // Submit answer to real-time database if joined as student
    if (myStudentInfo && inputCode) {
      await submitStudentAnswer(inputCode, myStudentInfo.studentId, earnedPoints, isCorrect, currentQIndex);
    }
  };

  const handleNextQuestion = async () => {
    soundFx.playClick();
    if (currentQIndex < CLASSROOM_QUESTIONS.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);

      if (activeTab === 'TeacherHost') {
        await updateRoomStage(roomCode, 'Playing', nextIdx);
      }
    } else {
      setGameStage('Finished');
      soundFx.playVictory();

      if (activeTab === 'TeacherHost') {
        await updateRoomStage(roomCode, 'Finished', currentQIndex);
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

  const handleRestart = async () => {
    soundFx.playClick();
    setGameStage('Lobby');
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTimeLeft(15);
    setJoinSuccess(false);

    if (activeTab === 'TeacherHost') {
      await updateRoomStage(roomCode, 'Lobby', 0);
    }
  };

  const connectedStudents = session?.students || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-3xl rounded-3xl border border-indigo-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Classroom Live Quiz Arena</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  <Wifi className="w-3 h-3 animate-pulse" /> Live DB Synced
                </span>
              </div>
              <p className="text-xs text-slate-400">Interactive Real-Time Classroom Show for Teachers & Students</p>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs (Only in Lobby Stage) */}
        {gameStage === 'Lobby' && (
          <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 gap-2 shrink-0">
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

        {/* Modal Content */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between overflow-y-auto">
          {gameStage === 'Lobby' && activeTab === 'TeacherHost' && (
            <div className="space-y-6 text-center py-2">
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
                <div className="text-4xl font-black text-gradient-purple tracking-wider font-mono">{roomCode}</div>
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
                    Waiting for students to enter room code <strong>#{roomCode}</strong> on their phones...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-36 overflow-y-auto p-1">
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

              <button
                onClick={handleTeacherStartQuiz}
                className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
              >
                <Play className="w-5 h-5 fill-white" /> Start Live Classroom Quiz ({connectedStudents.length} Joined)
              </button>
            </div>
          )}

          {gameStage === 'Lobby' && activeTab === 'StudentJoin' && (
            <div className="space-y-6 text-center py-4 max-w-md mx-auto">
              {!joinSuccess ? (
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
                      placeholder="e.g. 849201"
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
                      placeholder="e.g. Aarav Sharma"
                      value={studentNameInput}
                      onChange={(e) => setStudentNameInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-slate-950" /> Join Live Classroom Room
                  </button>
                </form>
              ) : (
                <div className="space-y-6 py-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Connected to Room #{inputCode}!</h3>
                    <p className="text-xs text-slate-300">
                      Welcome, <strong className="text-amber-400">{studentNameInput || myStudentInfo?.studentName || 'Student'}</strong>! You are connected to the live classroom.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Real-time Network Synced • Ready for Live Questions</span>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setGameStage('Playing');
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-slate-950" /> Enter Live Question Arena ▶
                  </button>
                </div>
              )}
            </div>
          )}

          {gameStage === 'Playing' && (
            <div className="space-y-6">
              {/* Top Progress & Timer Bar */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  Question {currentQIndex + 1} of {CLASSROOM_QUESTIONS.length}
                </span>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-sm">
                  <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'animate-bounce text-rose-400' : ''}`} />
                  <span>{timeLeft}s</span>
                </div>

                <div className="text-xs font-black text-amber-400">Score: {score} pts</div>
              </div>

              {/* Question Text */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {currentQ.category}
                </span>
                <h3 className="text-lg md:text-xl font-extrabold text-white leading-snug">{currentQ.question}</h3>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-indigo-500/50';

                  if (isAnswered) {
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
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                      {isAnswered && selectedOption === idx && idx !== currentQ.correctIndex && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Teacher Projector View: Realtime Connected Students Scoreboard */}
              {activeTab === 'TeacherHost' && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5 text-indigo-400 font-black">
                      <Trophy className="w-3.5 h-3.5" /> Live Classroom Leaderboard ({connectedStudents.length} Students)
                    </span>
                    <span className="text-[10px] text-emerald-400">Auto Syncing</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1">
                    {connectedStudents.map((st, i) => (
                      <div key={st.studentId} className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-amber-400 font-bold">#{i + 1}</span>
                          <span>{st.avatarEmoji}</span>
                          <span className="font-bold text-white truncate">{st.studentName}</span>
                        </div>
                        <span className="font-black text-amber-400 shrink-0">{st.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Explanation */}
              {isAnswered && (
                <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed space-y-3">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Sparkles className="w-4 h-4" /> CIPAM Legal Explanation:
                  </div>
                  <div>{currentQ.explanation}</div>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <span>{currentQIndex < CLASSROOM_QUESTIONS.length - 1 ? 'Next Question' : 'View Classroom Results'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {gameStage === 'Finished' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-2xl">
                <Trophy className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white">Classroom Quiz Complete! 🏆</h3>
                <p className="text-xs text-slate-300">Great job mastering Intellectual Property Rights!</p>
              </div>

              {/* Final Real-time Podium for Teacher Host */}
              {activeTab === 'TeacherHost' && connectedStudents.length > 0 && (
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 max-w-md mx-auto space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Classroom Live Champions</div>
                  <div className="space-y-2">
                    {connectedStudents
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 3)
                      .map((st, rank) => (
                        <div key={st.studentId} className="p-3 rounded-2xl bg-slate-800/80 border border-amber-500/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉'}</span>
                            <span className="text-xl">{st.avatarEmoji}</span>
                            <span className="font-extrabold text-white">{st.studentName}</span>
                          </div>
                          <span className="font-black text-amber-400">{st.score} pts</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-sm mx-auto space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Classroom Score</div>
                <div className="text-4xl font-black text-amber-400">{score} pts</div>
              </div>

              <div className="flex gap-3 max-w-sm mx-auto">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Restart Session
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
                >
                  Return to Quest Map
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
