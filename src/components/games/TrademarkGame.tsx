import React, { useState } from 'react';
import { ArrowLeft, Check, X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';

interface TrademarkGameProps {
  onComplete: (score: number, stars: number) => void;
  onBack: () => void;
}

interface TrademarkItem {
  id: number;
  brandName: string;
  symbolUsed: string;
  isAuthentic: boolean;
  explanation: string;
  scenarioType: 'SymbolCheck' | 'CounterfeitSpot';
  imageEmoji: string;
}

const TRADEMARK_ITEMS: TrademarkItem[] = [
  {
    id: 1,
    brandName: 'Amul Butter',
    symbolUsed: '®',
    isAuthentic: true,
    explanation: 'Correct! Amul is an officially registered Well-Known Trademark in India, so using ® is legally valid!',
    scenarioType: 'SymbolCheck',
    imageEmoji: '🧈'
  },
  {
    id: 2,
    brandName: 'Abibas Sneakers',
    symbolUsed: '™',
    isAuthentic: false,
    explanation: 'Correct! "Abibas" is a deceptive counterfeit imitation of the famous Adidas trademark designed to confuse consumers.',
    scenarioType: 'CounterfeitSpot',
    imageEmoji: '👟'
  },
  {
    id: 3,
    brandName: 'Unregistered Startup App logo',
    symbolUsed: '™',
    isAuthentic: true,
    explanation: 'Correct! An unregistered startup can legally use ™ while their trademark application is being processed by CIPAM.',
    scenarioType: 'SymbolCheck',
    imageEmoji: '📱'
  },
  {
    id: 4,
    brandName: 'Pumaa Sports Shorts',
    symbolUsed: '®',
    isAuthentic: false,
    explanation: 'Correct! Spelled with double "aa", this is a fake brand infringing upon the PUMA trademark logo.',
    scenarioType: 'CounterfeitSpot',
    imageEmoji: '🩳'
  },
  {
    id: 5,
    brandName: 'Tata Salt',
    symbolUsed: '®',
    isAuthentic: true,
    explanation: 'Correct! Tata Salt is a fully registered trademark protecting brand trust across India.',
    scenarioType: 'SymbolCheck',
    imageEmoji: '🧂'
  }
];

export const TrademarkGame: React.FC<TrademarkGameProps> = ({ onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentItem = TRADEMARK_ITEMS[currentIndex];

  const handleDecision = (userSaysGenuine: boolean) => {
    if (answered) return;
    setUserChoice(userSaysGenuine);
    setAnswered(true);

    const isCorrect = userSaysGenuine === currentItem.isAuthentic;

    if (isCorrect) {
      soundFx.playCorrect();
      setScore((prev) => prev + 60);
    } else {
      soundFx.playWrong();
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentIndex < TRADEMARK_ITEMS.length - 1) {
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Level 1: Trademarks Rescue</span>
          <h2 className="text-base font-black text-white">Brand & Logo Inspector</h2>
        </div>

        <div className="text-right">
          <div className="text-xs font-black text-blue-400">{score} / 300 pts</div>
          <div className="text-[10px] text-slate-400 font-semibold">Item {currentIndex + 1} of {TRADEMARK_ITEMS.length}</div>
        </div>
      </div>

      {!isFinished ? (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700 space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 border border-slate-800 space-y-4 text-center">
            <div className="text-5xl my-2">{currentItem.imageEmoji}</div>

            <div>
              <span className="text-xs font-extrabold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                Symbol Displayed: {currentItem.symbolUsed}
              </span>
              <h3 className="text-3xl font-black text-white mt-2">{currentItem.brandName}</h3>
            </div>

            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Inspect this product! Is it a <strong>Genuine Registered Trademark</strong> or a <strong>Fake Counterfeit Knockoff</strong>?
            </p>
          </div>

          {!answered ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleDecision(true)}
                className="py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
              >
                <Check className="w-5 h-5" /> Genuine Brand ✅
              </button>
              <button
                onClick={() => handleDecision(false)}
                className="py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2 transition"
              >
                <X className="w-5 h-5" /> Counterfeit Knockoff ❌
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 ${
                userChoice === currentItem.isAuthentic
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}>
                <div className="font-extrabold text-base flex items-center gap-2">
                  {userChoice === currentItem.isAuthentic ? 'Correct Inspector Verdict! 🛡️' : 'Incorrect Verdict! ❌'}
                </div>
                <p className="leading-relaxed">{currentItem.explanation}</p>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base transition shadow-xl shadow-blue-600/20"
              >
                {currentIndex < TRADEMARK_ITEMS.length - 1 ? 'Next Brand Inspector Item ▶' : 'Finish Trademark Module'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl border border-slate-700 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">Trademark Module Cleared! 🛡️</h3>
            <p className="text-xs text-slate-300">You earned the <strong>Brand Guardian</strong> Trophy Badge!</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-xs mx-auto">
            <div className="text-xs font-bold text-slate-400 uppercase">Module Score</div>
            <div className="text-4xl font-black text-blue-400">{score} / 300 pts</div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onBack(); }}
            className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base transition shadow-xl shadow-blue-600/20"
          >
            Return to Quest Map
          </button>
        </div>
      )}
    </div>
  );
};
