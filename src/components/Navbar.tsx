import React, { useState } from 'react';
import { Award, Volume2, VolumeX, Sparkles, BookOpen, Users, Trophy, LogOut } from 'lucide-react';
import { soundFx } from '../utils/audio';
import type { UserGameState } from '../utils/storage';
import { resetGameState } from '../utils/storage';

interface NavbarProps {
  gameState: UserGameState;
  onOpenScoreboard: () => void;
  onOpenRecap: () => void;
  onOpenTitbits: () => void;
  onOpenClassroom: () => void;
  onOpenCertificate: () => void;
  onOpenOnboarding: () => void;
  onStateReset: (newState: UserGameState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  gameState,
  onOpenScoreboard,
  onOpenRecap,
  onOpenTitbits,
  onOpenClassroom,
  onOpenCertificate,
  onOpenOnboarding,
  onStateReset
}) => {
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.playClick();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to Log Out? Your progress is saved, and you will return to the Role Login screen.')) {
      const resetState = resetGameState();
      onStateReset(resetState);
      onOpenOnboarding();
      soundFx.playClick();
    }
  };

  const isTeacher = gameState.profile.role === 'Teacher';

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* CIPAM & App Branding */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 p-[2px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-amber-400 text-lg">
              IP
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                CIPAM India
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Ministry of Commerce & Industry</span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              CIPAM IP Quest <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            </h1>
          </div>
        </div>

        {/* Middle Quick Navigation Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => { soundFx.playClick(); onOpenOnboarding(); }}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
              isTeacher 
                ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
            title="Edit Role & Profile Details"
          >
            <span>{gameState.profile.avatar || '⚡'}</span>
            <span className="truncate max-w-[140px]">
              {isTeacher ? '👨‍🏫 ' : '👦 '}
              {gameState.profile.name || 'Login Profile'}
            </span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); onOpenRecap(); }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Quick Recap Cheat Sheet"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>IP Recap</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); onOpenTitbits(); }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Did You Know? IP Titbits"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>IP Titbits</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); onOpenClassroom(); }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-200 border border-indigo-700/50 transition"
            title="Classroom Live Quiz Mode"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Classroom Mode</span>
          </button>

          {gameState.completedLevels.length > 0 && (
            <button
              onClick={() => { soundFx.playClick(); onOpenCertificate(); }}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition animate-bounce-gentle"
              title="View Final Merit Certificate"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>Certificate</span>
            </button>
          )}
        </div>

        {/* Student/Teacher Stats & Controls */}
        <div className="flex items-center gap-3">
          {/* Score & Dashboard Badge */}
          <button
            onClick={() => { soundFx.playClick(); onOpenScoreboard(); }}
            className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 hover:border-amber-500/50 px-3 py-1.5 rounded-2xl transition group"
          >
            <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isTeacher ? 'Educator Score' : 'Score'}
              </div>
              <div className="text-xs font-black text-amber-400 flex items-center gap-1">
                {gameState.totalScore} <span className="text-[10px] text-slate-400 font-normal">pts</span>
              </div>
            </div>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Logout / Switch Profile */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition flex items-center gap-1 font-bold text-xs"
            title="Log Out & Switch Profile"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline">Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
