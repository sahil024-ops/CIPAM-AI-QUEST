import React, { useState } from 'react';
import { Sparkles, User, GraduationCap, Building2, MapPin, ShieldCheck, Rocket, BookOpen } from 'lucide-react';
import type { StudentProfile, UserGameState } from '../utils/storage';
import { saveGameState } from '../utils/storage';
import { soundFx } from '../utils/audio';

interface OnboardingModalProps {
  gameState: UserGameState;
  onComplete: (updatedState: UserGameState) => void;
  onClose?: () => void;
}

const STUDENT_AVATARS = [
  { emoji: '⚡', label: 'IP Explorer' },
  { emoji: '🔬', label: 'Young Inventor' },
  { emoji: '🎨', label: 'Creative Artist' },
  { emoji: '🔍', label: 'IP Detective' },
  { emoji: '🛡️', label: 'Brand Guardian' },
  { emoji: '🚀', label: 'Tech Founder' },
];

const TEACHER_AVATARS = [
  { emoji: '👩‍🏫', label: 'IP Educator' },
  { emoji: '👨‍🏫', label: 'Science Master' },
  { emoji: '🎓', label: 'CIPAM Mentor' },
  { emoji: '🏛️', label: 'Legal Advisor' },
  { emoji: '📚', label: 'Innovation Coach' },
  { emoji: '🌟', label: 'Principal Guide' },
];

const GRADES = [
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

const TEACHER_DESIGNATIONS = [
  'IPR Educator & Teacher', 'PGT Science / Innovation Teacher', 'Computer Science & Tech Lead', 'School Vice Principal / Principal', 'Atal Tinkering Lab In-Charge'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ gameState, onComplete, onClose }) => {
  const [role, setRole] = useState<'Student' | 'Teacher'>(gameState.profile.role || 'Student');
  const [name, setName] = useState(gameState.profile.name !== 'Young Innovator' ? gameState.profile.name : '');
  const [grade, setGrade] = useState(gameState.profile.grade || 'Class 8');
  const [schoolName, setSchoolName] = useState(gameState.profile.schoolName !== 'Delhi Public School' ? gameState.profile.schoolName : '');
  const [stateCity, setStateCity] = useState(gameState.profile.stateCity || '');
  const [selectedAvatar, setSelectedAvatar] = useState(gameState.profile.avatar || (role === 'Student' ? '⚡' : '👩‍🏫'));

  const avatarOptions = role === 'Student' ? STUDENT_AVATARS : TEACHER_AVATARS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playVictory();

    const prefix = role === 'Teacher' ? 'CIPAM-TCH-' : 'CIPAM-STU-';
    const studentId = gameState.profile.studentId && gameState.profile.studentId.startsWith(prefix)
      ? gameState.profile.studentId
      : `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;

    const updatedProfile: StudentProfile = {
      role,
      name: name.trim() || (role === 'Teacher' ? 'Educator' : 'Student Hero'),
      avatar: selectedAvatar,
      grade: role === 'Teacher' ? (grade || 'IPR Educator') : grade,
      schoolName: schoolName.trim() || 'Indian National School',
      stateCity: stateCity.trim() || 'New Delhi, India',
      studentId,
      isOnboarded: true,
    };

    const updatedState: UserGameState = {
      ...gameState,
      profile: updatedProfile,
    };

    saveGameState(updatedState);
    onComplete(updatedState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fadeIn">
      <div className="glass-card w-full max-w-xl rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-slate-800 space-y-2 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> CIPAM Role & Profile Registration
          </div>
          <h2 className="text-2xl font-black text-white">Select Role & Create Profile</h2>
          <p className="text-xs text-slate-300">
            Define whether you are joining as a <strong>Student Explorer</strong> or <strong>Classroom Teacher / Educator</strong>!
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-3 bg-slate-900/90 gap-3 border-b border-slate-800">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setRole('Student');
              setSelectedAvatar('⚡');
              if (TEACHER_DESIGNATIONS.includes(grade)) setGrade('Class 8');
            }}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
              role === 'Student'
                ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/30'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-3xl">👦</span>
            <div>
              <div className="text-sm font-extrabold text-white">Student Role</div>
              <div className="text-[10px] text-amber-300">Quests, Minigames & Certificates</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setRole('Teacher');
              setSelectedAvatar('👩‍🏫');
              setGrade(TEACHER_DESIGNATIONS[0]);
            }}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
              role === 'Teacher'
                ? 'bg-indigo-500/20 border-indigo-400 text-white ring-2 ring-indigo-400/30'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-3xl">👩‍🏫</span>
            <div>
              <div className="text-sm font-extrabold text-white">Teacher / Educator</div>
              <div className="text-[10px] text-indigo-300">Host Live Class & Track Scores</div>
            </div>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[65vh]">
          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Choose {role === 'Teacher' ? 'Educator' : 'Student'} Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {avatarOptions.map((av) => (
                <button
                  type="button"
                  key={av.emoji}
                  onClick={() => { soundFx.playClick(); setSelectedAvatar(av.emoji); }}
                  className={`p-3 rounded-2xl border text-2xl transition flex flex-col items-center justify-center ${
                    selectedAvatar === av.emoji
                      ? role === 'Teacher'
                        ? 'bg-indigo-500/20 border-indigo-400 ring-2 ring-indigo-400/30 scale-105'
                        : 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30 scale-105'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                  title={av.label}
                >
                  <span>{av.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Full Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" /> {role === 'Teacher' ? 'Teacher / Educator Full Name' : 'Student Full Name'}
            </label>
            <input
              type="text"
              required
              placeholder={role === 'Teacher' ? 'e.g. Dr. Sunita Sharma' : 'e.g. Aarav Sharma'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 outline-none"
            />
          </div>

          {/* Class / Grade OR Designation & School Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                {role === 'Teacher' ? <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> : <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />}
                {role === 'Teacher' ? 'Designation' : 'Class / Grade'}
              </label>
              {role === 'Student' ? (
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-amber-400 outline-none"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-indigo-400 outline-none"
                >
                  {TEACHER_DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" /> School / Institution Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kendriya Vidyalaya / DPS"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* State / City Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> State / City
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mumbai, Maharashtra"
              value={stateCity}
              onChange={(e) => setStateCity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 outline-none"
            />
          </div>

          {/* Registration Notice */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> Verified CIPAM Portal Profile
            </span>
            <span className="font-mono text-amber-400 font-bold">
              Role: {role === 'Teacher' ? '👨‍🏫 Teacher' : '👦 Student'}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className={`flex-1 py-3.5 rounded-2xl text-slate-950 font-black text-sm transition shadow-xl flex items-center justify-center gap-2 ${
                role === 'Teacher'
                  ? 'bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-300 hover:to-purple-400 shadow-indigo-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/20'
              }`}
            >
              <Rocket className="w-4 h-4 text-slate-950" />
              <span>Save & Launch CIPAM {role === 'Teacher' ? 'Teacher Hub' : 'Quest'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
