import React, { useState } from 'react';
import { ArrowLeft, Check, X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';

interface CopyrightGameProps {
  onComplete: (score: number, stars: number) => void;
  onBack: () => void;
}

interface CopyrightScenario {
  id: number;
  workTitle: string;
  creator: string;
  actionTaken: string;
  isFairUse: boolean;
  explanation: string;
  imageEmoji: string;
}

const SCENARIOS: CopyrightScenario[] = [
  {
    id: 1,
    workTitle: 'Maya\'s Digital Oil Painting "Himalayan Sunrise"',
    creator: 'Maya (Student Artist)',
    actionTaken: 'A student includes Maya\'s painting in a school geography project slide with author credit.',
    isFairUse: true,
    explanation: 'Correct! Using copyrighted art in a non-profit educational classroom project with proper credit falls under Fair Use!',
    imageEmoji: '🎨'
  },
  {
    id: 2,
    workTitle: 'Maya\'s Original EDM Music Track "Cyber Rhythm"',
    creator: 'Maya',
    actionTaken: 'A commercial gaming company uses Maya\'s entire song in their paid video game without buying a license.',
    isFairUse: false,
    explanation: 'Correct! Using an entire copyrighted song for commercial profit without a paid license is illegal Copyright Infringement.',
    imageEmoji: '🎧'
  },
  {
    id: 3,
    workTitle: 'Science Textbook Chapter on Astronomy',
    creator: 'NCERT / Publisher',
    actionTaken: 'A website copies all 300 pages of the textbook and sells downloadable PDFs online.',
    isFairUse: false,
    explanation: 'Correct! Mass piracy and unauthorized commercial distribution violate copyright laws.',
    imageEmoji: '📚'
  },
  {
    id: 4,
    workTitle: 'Python Game Source Code',
    creator: 'Student Coder Team',
    actionTaken: 'A classmate quotes 5 lines of code in a blog post review explaining how the jump function works.',
    isFairUse: true,
    explanation: 'Correct! Quoting short code snippets for educational criticism, commentary, or review is protected under Fair Use.',
    imageEmoji: '💻'
  },
  {
    id: 5,
    workTitle: 'Short Fantasy Story Novel',
    creator: 'Maya',
    actionTaken: 'A student reads a 1-minute audio clip from Maya\'s story on a school book-review podcast with credit.',
    isFairUse: true,
    explanation: 'Correct! Reading short excerpts for non-commercial book reviews and educational commentary is Fair Use.',
    imageEmoji: '📖'
  }
];

export const CopyrightGame: React.FC<CopyrightGameProps> = ({ onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentItem = SCENARIOS[currentIndex];

  const handleDecision = (userSaysFairUse: boolean) => {
    if (answered) return;
    setUserChoice(userSaysFairUse);
    setAnswered(true);

    const isCorrect = userSaysFairUse === currentItem.isFairUse;

    if (isCorrect) {
      soundFx.playCorrect();
      setScore((prev) => prev + 60);
    } else {
      soundFx.playWrong();
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentIndex < SCENARIOS.length - 1) {
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Level 1: Copyright Studio</span>
          <h2 className="text-base font-black text-white">Fair Use vs Piracy Judge</h2>
        </div>

        <div className="text-right">
          <div className="text-xs font-black text-purple-400">{score} / 300 pts</div>
          <div className="text-[10px] text-slate-400 font-semibold">Scenario {currentIndex + 1} of {SCENARIOS.length}</div>
        </div>
      </div>

      {!isFinished ? (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700 space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl">{currentItem.imageEmoji}</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Creator: {currentItem.creator}
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">{currentItem.workTitle}</h3>
              <p className="text-sm text-slate-200 mt-2 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <strong>Action Taken:</strong> "{currentItem.actionTaken}"
              </p>
            </div>
          </div>

          {!answered ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleDecision(true)}
                className="py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
              >
                <Check className="w-5 h-5" /> Fair Use / Legal ✅
              </button>
              <button
                onClick={() => handleDecision(false)}
                className="py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2 transition"
              >
                <X className="w-5 h-5" /> Copyright Infringement ❌
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 ${
                userChoice === currentItem.isFairUse
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}>
                <div className="font-extrabold text-base flex items-center gap-2">
                  {userChoice === currentItem.isFairUse ? 'Correct Legal Judgment! ⚖️' : 'Incorrect Verdict! ❌'}
                </div>
                <p className="leading-relaxed">{currentItem.explanation}</p>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-base transition shadow-xl shadow-purple-600/20"
              >
                {currentIndex < SCENARIOS.length - 1 ? 'Next Copyright Scenario ▶' : 'Finish Copyright Module'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl border border-slate-700 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">Copyright Module Cleared! 🎨</h3>
            <p className="text-xs text-slate-300">You earned the <strong>Copyright Defender</strong> Trophy Badge!</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-xs mx-auto">
            <div className="text-xs font-bold text-slate-400 uppercase">Module Score</div>
            <div className="text-4xl font-black text-purple-400">{score} / 300 pts</div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onBack(); }}
            className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-base transition shadow-xl shadow-purple-600/20"
          >
            Return to Quest Map
          </button>
        </div>
      )}
    </div>
  );
};
