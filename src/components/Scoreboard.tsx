import React, { useState, useEffect } from 'react';
import { X, Trophy, Award, Star, Lightbulb, ShieldCheck, Music, Palette, Search, Building2, Edit3, Database, RefreshCw, CheckCircle2, FileText, Printer } from 'lucide-react';
import { BADGES_LIST } from '../data/badgesData';
import type { BadgeItem } from '../data/badgesData';
import type { UserGameState, StudentProfile } from '../utils/storage';
import { saveGameState } from '../utils/storage';
import { soundFx } from '../utils/audio';
import { getGlobalStudentLogs, type GlobalStudentLog } from '../services/classroomService';

interface ScoreboardProps {
  gameState: UserGameState;
  onClose: () => void;
  onUpdateState: (newState: UserGameState) => void;
  onOpenGradeSheet?: (levelId: string) => void;
}

const getBadgeIcon = (iconName: string) => {
  switch (iconName) {
    case 'Lightbulb': return <Lightbulb className="w-6 h-6" />;
    case 'ShieldCheck': return <ShieldCheck className="w-6 h-6" />;
    case 'Music': return <Music className="w-6 h-6" />;
    case 'Palette': return <Palette className="w-6 h-6" />;
    case 'Search': return <Search className="w-6 h-6" />;
    case 'Building2': return <Building2 className="w-6 h-6" />;
    case 'Award': return <Award className="w-6 h-6" />;
    default: return <Trophy className="w-6 h-6" />;
  }
};

const LEVEL_NAMES: Record<string, string> = {
  patents_basic: 'Level 1: Patents Workshop',
  trademarks_basic: 'Level 2: Brand Guardian Quest',
  copyrights_basic: 'Level 3: Creator\'s Studio',
  designs_basic: 'Level 4: Product Design Lab',
  detective_case1: 'Level 5: IP Detective Case #101',
  detective_case2: 'Level 6: IP Detective Case #102',
  detective_case3: 'Level 7: IP Detective Case #103',
  startup_simulator: 'Level 8: TechVeda IP Empire Simulator'
};

const LEADERBOARD_SEED = [
  { rank: 1, name: 'Aarav Sharma', school: 'DPS R.K. Puram, Delhi', score: 2850, stars: 24, badge: 'CIPAM Champion' },
  { rank: 2, name: 'Ananya Patel', school: 'Kendriya Vidyalaya, Mumbai', score: 2600, stars: 22, badge: 'IP Startup Tycoon' },
  { rank: 3, name: 'Rohan Verma', school: 'St. Xavier\'s, Kolkata', score: 2450, stars: 20, badge: 'IP Detective' },
  { rank: 4, name: 'Priya Sundaram', school: 'National Public School, Bengaluru', score: 2300, stars: 19, badge: 'Design Maestro' },
];

export const Scoreboard: React.FC<ScoreboardProps> = ({ gameState, onClose, onUpdateState, onOpenGradeSheet }) => {
  const [activeTab, setActiveTab] = useState<'Badges' | 'GradeSheets' | 'Leaderboard' | 'DatabaseLogs' | 'Profile'>('Badges');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<StudentProfile>({ ...gameState.profile });
  const [dbLogs, setDbLogs] = useState<GlobalStudentLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const totalStars = Object.values(gameState.levelProgress).reduce((acc, curr) => acc + curr.stars, 0);
  const isTeacher = gameState.profile.role === 'Teacher';

  const fetchDbLogs = async () => {
    setLoadingLogs(true);
    try {
      const logs = await getGlobalStudentLogs();
      setDbLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'DatabaseLogs') {
      fetchDbLogs();
    }
  }, [activeTab]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedState = { ...gameState, profile: profileForm };
    saveGameState(updatedState);
    onUpdateState(updatedState);
    setIsEditingProfile(false);
    soundFx.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-700 flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  {isTeacher ? 'Teacher Dashboard & Scoreboard' : 'Trophy Hall & Scoreboard'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {isTeacher ? '👨‍🏫 Educator Mode' : '👦 Student Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Track earned IP badges, level grade sheets, and student rankings</p>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 gap-2 sm:gap-4 overflow-x-auto">
          {(['Badges', 'GradeSheets', 'Leaderboard', 'DatabaseLogs', 'Profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { soundFx.playClick(); setActiveTab(tab); }}
              className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap ${
                activeTab === tab
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'Badges' && `Badges (${gameState.badges.length}/${BADGES_LIST.length})`}
              {tab === 'GradeSheets' && '📜 Level Grade Sheets'}
              {tab === 'Leaderboard' && 'School Leaderboard'}
              {tab === 'DatabaseLogs' && '☁️ DB Student Logs'}
              {tab === 'Profile' && (isTeacher ? 'Teacher Profile' : 'Student Profile')}
            </button>
          ))}
        </div>

        {/* Modal Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'Badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {BADGES_LIST.map((badge: BadgeItem) => {
                const isUnlocked = gameState.badges.includes(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isUnlocked
                        ? 'bg-slate-900/90 border-slate-700 hover:border-amber-500/50 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800/80 opacity-50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${badge.color} flex items-center justify-center text-white shadow-md`}>
                          {getBadgeIcon(badge.icon)}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isUnlocked
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          {isUnlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-white">{badge.name}</h4>
                        <div className="text-xs text-amber-400 font-medium mb-1">{badge.title}</div>
                        <p className="text-xs text-slate-300 leading-snug">{badge.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 italic">
                      Requirement: {badge.requirement}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'GradeSheets' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Per-Level Performance Grade Sheets (Separate from Certificate)</span>
                </div>
                <span className="font-bold text-amber-400">Min Pass: 100 Pts / 1 Star</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(LEVEL_NAMES).map((lvlId) => {
                  const prog = gameState.levelProgress[lvlId];
                  const sheet = gameState.gradeSheets?.[lvlId];
                  const isCompleted = prog?.completed;
                  const score = sheet?.score ?? prog?.score ?? 0;
                  const stars = sheet?.stars ?? prog?.stars ?? 0;

                  return (
                    <div
                      key={lvlId}
                      className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                        isCompleted
                          ? 'bg-slate-900 border-slate-700 hover:border-indigo-500/50'
                          : 'bg-slate-950 border-slate-800/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{LEVEL_NAMES[lvlId]}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}>
                            {isCompleted ? 'Level Passed' : 'Not Passed Yet'}
                          </span>
                        </div>

                        {isCompleted && (
                          <div className="text-right">
                            <div className="text-sm font-black text-amber-400">{score} pts</div>
                            <div className="text-xs text-amber-400 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400" /> {stars} Stars
                            </div>
                          </div>
                        )}
                      </div>

                      {isCompleted ? (
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            if (onOpenGradeSheet) onOpenGradeSheet(lvlId);
                          }}
                          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
                        >
                          <Printer className="w-3.5 h-3.5" /> View & Print Grade Sheet
                        </button>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic">
                          Score at least 100 points on this level to generate grade sheet.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'Leaderboard' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/20 text-xs text-blue-200 flex items-center justify-between">
                <span>Top Performing Students across Indian Schools (CIPAM IP Quest)</span>
                <span className="font-bold text-amber-400 flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400" /> Stars Total: {totalStars}</span>
              </div>

              <div className="space-y-2">
                {/* User's Current Position Card */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                      YOU
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white flex items-center gap-2">
                        {gameState.profile.name}
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          {isTeacher ? '👨‍🏫 Teacher Account' : 'Your Active Rank'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{gameState.profile.schoolName}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-amber-400">{gameState.totalScore} pts</div>
                    <div className="text-xs text-slate-400">{totalStars} Stars</div>
                  </div>
                </div>

                {LEADERBOARD_SEED.map((student) => (
                  <div key={student.rank} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${
                        student.rank === 1 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{student.rank}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{student.name}</div>
                        <div className="text-xs text-slate-400">{student.school}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-200">{student.score} pts</div>
                      <div className="text-xs text-amber-400 flex items-center gap-1 justify-end">
                        <Star className="w-3 h-3 fill-amber-400" /> {student.stars} Stars
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'DatabaseLogs' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-indigo-200">Firebase & Real-time Database Logged Progress</span>
                </div>
                <button
                  onClick={fetchDbLogs}
                  disabled={loadingLogs}
                  className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 transition flex items-center gap-1 font-bold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} /> Refresh Database
                </button>
              </div>

              {dbLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  No database logs recorded yet. Complete classroom live quizzes or quest levels to log student progress!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dbLogs.map((log, index) => (
                    <div key={log.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between transition hover:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-xl">
                          {log.avatarEmoji || '🎓'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {log.studentName}
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3 h-3" /> Logged #{index + 1}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Levels Completed: <strong className="text-slate-200">{log.levelsCompletedCount || 0}</strong> • Badges: <strong className="text-amber-400">{log.badges?.length || 0}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-amber-400">{log.totalScore} pts</div>
                        <div className="text-[10px] text-slate-500">
                          {log.updatedAt ? new Date(log.updatedAt).toLocaleTimeString() : 'Just now'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Profile' && (
            <div className="max-w-xl mx-auto space-y-6">
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <h3 className="text-base font-bold text-white">Edit {isTeacher ? 'Teacher' : 'Student'} Details</h3>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">{isTeacher ? 'Designation' : 'Class / Grade'}</label>
                    <input
                      type="text"
                      required
                      value={profileForm.grade}
                      onChange={(e) => setProfileForm({ ...profileForm, grade: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">School / Institution Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.schoolName}
                      onChange={(e) => setProfileForm({ ...profileForm, schoolName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition"
                    >
                      Save Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-center">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl">
                    {gameState.profile.avatar}
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase mb-2">
                      {isTeacher ? '👨‍🏫 Verified Educator Account' : '👦 Registered Student'}
                    </div>
                    <h3 className="text-2xl font-black text-white">{gameState.profile.name}</h3>
                    <p className="text-sm text-amber-400 font-bold">{gameState.profile.grade} • {gameState.profile.schoolName}</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">ID: {gameState.profile.studentId || (isTeacher ? 'CIPAM-TCH-84920' : 'CIPAM-STU-84920')}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Total Score</div>
                      <div className="text-base font-black text-amber-400">{gameState.totalScore}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Stars</div>
                      <div className="text-base font-black text-amber-400">{totalStars}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Badges</div>
                      <div className="text-base font-black text-amber-400">{gameState.badges.length}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => { soundFx.playClick(); setIsEditingProfile(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile Info
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
