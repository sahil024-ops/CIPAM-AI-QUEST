import React, { useState } from 'react';
import { ArrowLeft, Check, X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';

interface PatentGameProps {
  onComplete: (score: number, stars: number) => void;
  onBack: () => void;
}

interface InventionItem {
  id: number;
  name: string;
  inventor: string;
  description: string;
  imageEmoji: string;
  isPatentable: boolean;
  reason: string;
  criteria: {
    novel: boolean;
    inventiveStep: boolean;
    industrialUse: boolean;
  };
}

const INVENTIONS: InventionItem[] = [
  {
    id: 1,
    name: 'Solar-Powered Automated Plant Waterer',
    inventor: 'Alex (Class 8 Student)',
    description: 'A custom IoT device using micro-sensors and solar energy to monitor soil moisture and automatically release optimal water.',
    imageEmoji: '🌱',
    isPatentable: true,
    reason: 'Correct! It is completely novel, involves an inventive technical step, and has practical industrial application.',
    criteria: { novel: true, inventiveStep: true, industrialUse: true }
  },
  {
    id: 2,
    name: 'Standard Wound Paste using Haldi & Turmeric',
    inventor: 'Local Herbal Co.',
    description: 'A traditional turmeric paste for healing cuts using ancient home recipes.',
    imageEmoji: '🌿',
    isPatentable: false,
    reason: 'Correct! Traditional Knowledge (like Haldi for wound healing) is NOT patentable because it lacks global novelty.',
    criteria: { novel: false, inventiveStep: false, industrialUse: true }
  },
  {
    id: 3,
    name: 'Foldable Emergency Solar Lamp Helmet',
    inventor: 'Alex',
    description: 'A light-weight safety helmet with integrated flexible solar panels and emergency SOS beacon for miners.',
    imageEmoji: '🪖',
    isPatentable: true,
    reason: 'Correct! Novel safety gear integration with active industrial usage.',
    criteria: { novel: true, inventiveStep: true, industrialUse: true }
  },
  {
    id: 4,
    name: 'Abstract Mathematical Formula (E = mc²)',
    inventor: 'Theoretical Physics Group',
    description: 'A pure mathematical equation written on paper describing cosmic energy.',
    imageEmoji: '📐',
    isPatentable: false,
    reason: 'Correct! Laws of nature, scientific theories, and pure mathematical methods CANNOT be patented.',
    criteria: { novel: true, inventiveStep: true, industrialUse: false }
  },
  {
    id: 5,
    name: 'Biodegradable Seaweed Plastic Bag',
    inventor: 'Alex & School Eco Club',
    description: 'A novel chemical synthesis process turning red algae into 100% water-soluble eco-friendly plastic.',
    imageEmoji: '🛍️',
    isPatentable: true,
    reason: 'Correct! A new chemical manufacturing process that solves plastic pollution.',
    criteria: { novel: true, inventiveStep: true, industrialUse: true }
  }
];

export const PatentGame: React.FC<PatentGameProps> = ({ onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentItem = INVENTIONS[currentIndex];

  const handleDecision = (userSaysPatentable: boolean) => {
    if (answered) return;
    setUserChoice(userSaysPatentable);
    setAnswered(true);

    const isCorrect = userSaysPatentable === currentItem.isPatentable;

    if (isCorrect) {
      soundFx.playCorrect();
      setScore((prev) => prev + 60);
    } else {
      soundFx.playWrong();
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentIndex < INVENTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAnswered(false);
      setUserChoice(null);
    } else {
      setIsFinished(true);
      const calculatedStars = score >= 240 ? 3 : score >= 150 ? 2 : 1;
      soundFx.playVictory();
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
      onComplete(score, calculatedStars);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800">
        <button
          onClick={() => { soundFx.playClick(); onBack(); }}
          className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Map
        </button>

        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Level 1: Patents Workshop</span>
          <h2 className="text-base font-black text-white">The Patent Inspector Challenge</h2>
        </div>

        <div className="text-right">
          <div className="text-xs font-black text-amber-400">{score} / 300 pts</div>
          <div className="text-[10px] text-slate-400 font-semibold">Item {currentIndex + 1} of {INVENTIONS.length}</div>
        </div>
      </div>

      {!isFinished ? (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700 space-y-6">
          {/* Item Conveyor Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl">{currentItem.imageEmoji}</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Inventor: {currentItem.inventor}
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">{currentItem.name}</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">{currentItem.description}</p>
            </div>

            {/* Patent Criteria Checklist */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">1. Novelty</div>
                <div className="font-extrabold text-amber-400">Brand New?</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">2. Inventive Step</div>
                <div className="font-extrabold text-indigo-300">Non-Obvious?</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">3. Industrial Use</div>
                <div className="font-extrabold text-emerald-400">Manufacturable?</div>
              </div>
            </div>
          </div>

          {/* Decision Buttons */}
          {!answered ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleDecision(true)}
                className="py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
              >
                <Check className="w-5 h-5" /> Grant Patent ⚙️
              </button>
              <button
                onClick={() => handleDecision(false)}
                className="py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2 transition"
              >
                <X className="w-5 h-5" /> Reject / Not Patentable ❌
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 ${
                userChoice === currentItem.isPatentable
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}>
                <div className="font-extrabold text-base flex items-center gap-2">
                  {userChoice === currentItem.isPatentable ? 'Correct Verdict! 🎉' : 'Incorrect Verdict! ❌'}
                </div>
                <p className="leading-relaxed">{currentItem.reason}</p>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base transition shadow-xl shadow-amber-500/20"
              >
                {currentIndex < INVENTIONS.length - 1 ? 'Next Invention ▶' : 'Finish Patent Module'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl border border-slate-700 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">Patents Module Cleared! 🎉</h3>
            <p className="text-xs text-slate-300">You earned the <strong>Patent Pioneer</strong> Trophy Badge!</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-xs mx-auto">
            <div className="text-xs font-bold text-slate-400 uppercase">Module Score</div>
            <div className="text-4xl font-black text-amber-400">{score} / 300 pts</div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onBack(); }}
            className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base transition shadow-xl shadow-amber-500/20"
          >
            Return to Quest Map
          </button>
        </div>
      )}
    </div>
  );
};
