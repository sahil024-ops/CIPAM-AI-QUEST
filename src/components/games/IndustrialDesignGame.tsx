import React, { useState } from 'react';
import { ArrowLeft, Palette, X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';

interface IndustrialDesignGameProps {
  onComplete: (score: number, stars: number) => void;
  onBack: () => void;
}

interface ProductElement {
  id: number;
  productName: string;
  featureDescription: string;
  isDesignProtected: boolean; // True if visual design aesthetic, false if functional patent mechanism
  explanation: string;
  imageEmoji: string;
}

const DESIGN_ELEMENTS: ProductElement[] = [
  {
    id: 1,
    productName: 'Ergonomic Curved Gaming Headset',
    featureDescription: 'The external sleek honeycomb earcup shape and vibrant LED ring contour pattern.',
    isDesignProtected: true,
    explanation: 'Correct! The outer 3D visual shape and aesthetic pattern are protected under Industrial Design!',
    imageEmoji: '🎧'
  },
  {
    id: 2,
    productName: 'Ergonomic Curved Gaming Headset',
    featureDescription: 'The internal noise-canceling audio chip micro-circuitry.',
    isDesignProtected: false,
    explanation: 'Correct! Internal technical chips and functional electronics require a Patent, NOT an Industrial Design.',
    imageEmoji: '⚙️'
  },
  {
    id: 3,
    productName: 'Contour Glass Beverage Bottle',
    featureDescription: 'The unique curved hourglass glass shape and ribbed surface texture.',
    isDesignProtected: true,
    explanation: 'Correct! The outer 3D visual aesthetic shape is a classic Industrial Design.',
    imageEmoji: '🍾'
  },
  {
    id: 4,
    productName: 'Self-Cleaning Water Bottle',
    featureDescription: 'The UV-C light sterilization water purification mechanism inside the cap.',
    isDesignProtected: false,
    explanation: 'Correct! The technical water purification function requires a Patent.',
    imageEmoji: '🧪'
  },
  {
    id: 5,
    productName: 'Futuristic Curved Smartwatch',
    featureDescription: 'The ultra-thin curved metallic bezel and geometric strap ornament.',
    isDesignProtected: true,
    explanation: 'Correct! Outer visual shape, bezel contours, and strap ornaments are Industrial Designs.',
    imageEmoji: '⌚'
  }
];

export const IndustrialDesignGame: React.FC<IndustrialDesignGameProps> = ({ onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentItem = DESIGN_ELEMENTS[currentIndex];

  const handleDecision = (userSaysDesign: boolean) => {
    if (answered) return;
    setUserChoice(userSaysDesign);
    setAnswered(true);

    const isCorrect = userSaysDesign === currentItem.isDesignProtected;

    if (isCorrect) {
      soundFx.playCorrect();
      setScore((prev) => prev + 60);
    } else {
      soundFx.playWrong();
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentIndex < DESIGN_ELEMENTS.length - 1) {
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Level 1: Design Lab</span>
          <h2 className="text-base font-black text-white">Visual Aesthetic vs Technical Utility</h2>
        </div>

        <div className="text-right">
          <div className="text-xs font-black text-emerald-400">{score} / 300 pts</div>
          <div className="text-[10px] text-slate-400 font-semibold">Feature {currentIndex + 1} of {DESIGN_ELEMENTS.length}</div>
        </div>
      </div>

      {!isFinished ? (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700 space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl">{currentItem.imageEmoji}</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Product: {currentItem.productName}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">Target Feature:</h3>
              <p className="text-sm text-slate-200 mt-2 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                "{currentItem.featureDescription}"
              </p>
            </div>
          </div>

          {!answered ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleDecision(true)}
                className="py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
              >
                <Palette className="w-5 h-5" /> Industrial Design (Visual Shape) 🎨
              </button>
              <button
                onClick={() => handleDecision(false)}
                className="py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
              >
                <X className="w-5 h-5" /> Patent (Technical Function) ⚙️
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 ${
                userChoice === currentItem.isDesignProtected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}>
                <div className="font-extrabold text-base flex items-center gap-2">
                  {userChoice === currentItem.isDesignProtected ? 'Correct Product Design Choice! 🎨' : 'Incorrect Choice! ❌'}
                </div>
                <p className="leading-relaxed">{currentItem.explanation}</p>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base transition shadow-xl shadow-emerald-600/20"
              >
                {currentIndex < DESIGN_ELEMENTS.length - 1 ? 'Next Product Feature ▶' : 'Finish Design Module'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl border border-slate-700 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">Industrial Design Module Cleared! 🎨</h3>
            <p className="text-xs text-slate-300">You earned the <strong>Design Maestro</strong> Trophy Badge!</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-xs mx-auto">
            <div className="text-xs font-bold text-slate-400 uppercase">Module Score</div>
            <div className="text-4xl font-black text-emerald-400">{score} / 300 pts</div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onBack(); }}
            className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base transition shadow-xl shadow-emerald-600/20"
          >
            Return to Quest Map
          </button>
        </div>
      )}
    </div>
  );
};
