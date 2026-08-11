import React, { useState } from 'react';
import { Star, Lock, Sparkles, CheckCircle2, Trophy, Lightbulb, ShieldCheck, Music, Palette, Search, Headphones, Microscope, Building2, ChevronRight } from 'lucide-react';
import { LEVELS_DATA } from '../data/levelsData';
import type { LevelTier } from '../data/levelsData';
import type { UserGameState } from '../utils/storage';
import { soundFx } from '../utils/audio';

interface QuestMapProps {
  gameState: UserGameState;
  onSelectLevel: (levelId: string) => void;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Lightbulb': return <Lightbulb className="w-6 h-6" />;
    case 'ShieldCheck': return <ShieldCheck className="w-6 h-6" />;
    case 'Music': return <Music className="w-6 h-6" />;
    case 'Palette': return <Palette className="w-6 h-6" />;
    case 'Search': return <Search className="w-6 h-6" />;
    case 'Headphones': return <Headphones className="w-6 h-6" />;
    case 'Microscope': return <Microscope className="w-6 h-6" />;
    case 'Building2': return <Building2 className="w-6 h-6" />;
    default: return <Sparkles className="w-6 h-6" />;
  }
};

export const QuestMap: React.FC<QuestMapProps> = ({ gameState, onSelectLevel }) => {
  const [activeTier, setActiveTier] = useState<LevelTier>('Basic');
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>('patents_basic');

  const filteredLevels = LEVELS_DATA.filter((lvl) => lvl.tier === activeTier);
  const selectedLevel = LEVELS_DATA.find((l) => l.id === selectedLevelId) || LEVELS_DATA[0];

  const getLevelProgressInfo = (levelId: string) => {
    const levelState = gameState.levelProgress[levelId];
    if (!levelState) return { unlocked: levelId === 'patents_basic', completed: false, stars: 0, score: 0 };
    return levelState;
  };

  const completedCount = Object.values(gameState.levelProgress).filter((l) => l.completed).length;
  const totalLevels = LEVELS_DATA.length;
  const progressPercentage = Math.round((completedCount / totalLevels) * 100);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Welcome Banner & Quest Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> CIPAM Intellectual Property Mission
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Welcome, <span className="text-gradient-gold">{gameState.profile.name}</span>! 🚀
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Explore the interactive quest map to master <strong className="text-amber-400">Patents, Trademarks, Copyrights, and Industrial Designs</strong>. Complete visual minigames, solve detective cases, and become an official CIPAM IP Hero!
            </p>

            {/* Global Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Overall IP Quest Progress</span>
                <span className="text-amber-400 font-bold">{completedCount}/{totalLevels} Levels ({progressPercentage}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm shadow-amber-500/50"
                  style={{ width: `${Math.max(5, progressPercentage)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Profile & Badge Summary Card */}
          <div className="glass-card p-4 rounded-2xl border border-slate-700/80 w-full md:w-auto min-w-[240px] space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
                {gameState.profile.avatar}
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">{gameState.profile.grade} • {gameState.profile.schoolName}</div>
                <div className="text-sm font-extrabold text-white flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400" /> {gameState.badges.length} Badges Earned
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Selector Tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
        {(['Basic', 'Intermediate', 'Advanced'] as LevelTier[]).map((tier, idx) => {
          const isActive = activeTier === tier;
          return (
            <button
              key={tier}
              onClick={() => { soundFx.playClick(); setActiveTier(tier); }}
              className={`flex-1 max-w-[220px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center border border-slate-700 font-black">
                {idx + 1}
              </span>
              <span>Level {idx + 1}: {tier}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Level Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Level Nodes Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>Tier {activeTier === 'Basic' ? '1' : activeTier === 'Intermediate' ? '2' : '3'}: {activeTier} Progression</span>
            </h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {filteredLevels.length} Quest Modules
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredLevels.map((lvl) => {
              const prog = getLevelProgressInfo(lvl.id);
              const isSelected = selectedLevelId === lvl.id;

              return (
                <div
                  key={lvl.id}
                  onClick={() => {
                    if (prog.unlocked) {
                      soundFx.playClick();
                      setSelectedLevelId(lvl.id);
                    } else {
                      soundFx.playWrong();
                    }
                  }}
                  className={`glass-card p-5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden border ${
                    isSelected
                      ? 'border-amber-400 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/30'
                      : prog.unlocked
                      ? 'border-slate-700/80 hover:border-slate-500 hover:scale-[1.02]'
                      : 'opacity-60 border-slate-800 cursor-not-allowed bg-slate-950/80'
                  }`}
                >
                  {/* Top Header Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${lvl.color} flex items-center justify-center text-white shadow-md ${prog.unlocked ? 'active-node-pulse' : ''}`}>
                      {getLevelProgressInfo(lvl.id).unlocked ? getIconComponent(lvl.icon) : <Lock className="w-5 h-5 text-slate-400" />}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {prog.completed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                        </span>
                      ) : prog.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}

                      {/* Stars Rating */}
                      {prog.unlocked && (
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`w-4 h-4 ${
                                starIdx <= prog.stars
                                  ? 'text-amber-400 fill-amber-400 drop-shadow'
                                  : 'text-slate-700 fill-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {lvl.ipCategory}
                    </span>
                    <h4 className="text-lg font-extrabold text-white leading-snug">{lvl.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-2">{lvl.subtitle}</p>
                  </div>

                  {/* Selected Indicator Arrow */}
                  {isSelected && (
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400">
                      <span>Selected Quest</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Level Inspector & Launch Panel */}
        <div className="glass-card p-6 rounded-3xl border border-slate-700 space-y-6 sticky top-24">
          {selectedLevel ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${selectedLevel.color} flex items-center justify-center text-white shadow-lg`}>
                    {getIconComponent(selectedLevel.icon)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {selectedLevel.ipCategory} Module
                    </span>
                    <h3 className="text-xl font-black text-white">{selectedLevel.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedLevel.description}
                </p>
              </div>

              {/* Story Brief Box */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Mission Briefing
                </div>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "{selectedLevel.storyBrief}"
                </p>
              </div>

              {/* Stats & Rewards */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Max Score</div>
                  <div className="text-base font-black text-amber-400">{selectedLevel.maxScore} pts</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Reward Badge</div>
                  <div className="text-xs font-bold text-indigo-300 truncate">
                    {selectedLevel.badgeAwarded ? 'Unlock Trophy' : 'Level Stars'}
                  </div>
                </div>
              </div>

              {/* Play / Start Button */}
              {getLevelProgressInfo(selectedLevel.id).unlocked ? (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onSelectLevel(selectedLevel.id);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base tracking-wide shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 group transition transform active:scale-95"
                >
                  <Sparkles className="w-5 h-5 fill-white group-hover:scale-110 transition" />
                  <span>Start Module Challenge</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-4 rounded-2xl bg-slate-800 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700"
                >
                  <Lock className="w-4 h-4" />
                  <span>Complete Previous Level to Unlock</span>
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-400">Select a level from the quest map to inspect mission details.</div>
          )}
        </div>
      </div>
    </div>
  );
};
