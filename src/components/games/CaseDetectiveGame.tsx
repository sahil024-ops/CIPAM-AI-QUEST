import React, { useState } from 'react';
import { ArrowLeft, Search, CheckCircle2, ShieldAlert, Trophy, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';

interface CaseDetectiveGameProps {
  levelId: string;
  onComplete: (score: number, stars: number) => void;
  onBack: () => void;
}

interface CaseDetails {
  title: string;
  caseNumber: string;
  category: string;
  brief: string;
  clues: string[];
  options: {
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

const CASE_DATABASE: Record<string, CaseDetails> = {
  detective_case1: {
    title: 'Case #101: The Counterfeit Tech Mystery',
    caseNumber: 'CASE-2026-101',
    category: 'Trademarks & Industrial Designs',
    brief: 'A mystery online vendor is selling cheap "PulseWatch X" smartwatches using a registered brand font and identical curved metallic casing.',
    clues: [
      'Clue 1: The vendor copied the trademarked logo font to trick buyers into believing it is genuine.',
      'Clue 2: The casing shape was registered as an Industrial Design at CIPAM Design Office Kolkata 2 years ago.',
      'Clue 3: The vendor claims "Shapes cannot be protected by law".'
    ],
    options: [
      {
        label: 'Issue Cease-and-Desist for both Trademark & Industrial Design Infringement',
        isCorrect: true,
        explanation: 'Excellent Detective work! Both trademark identity AND registered industrial design aesthetics were infringed!'
      },
      {
        label: 'Only file for Patent infringement',
        isCorrect: false,
        explanation: 'Incorrect. Patent law protects internal mechanics, whereas this case concerns trademark logo and visual design shape.'
      },
      {
        label: 'Dismiss the case because shapes cannot be legally protected',
        isCorrect: false,
        explanation: 'Incorrect! Registered Industrial Designs explicitly protect unique visual shapes and casing contours!'
      }
    ]
  },
  detective_case2: {
    title: 'Case #102: The Viral Beat Heist',
    caseNumber: 'CASE-2026-102',
    category: 'Copyright & Music Licensing',
    brief: 'A famous influencer sampled Maya\'s 30-second original flute melody into a commercial advertisement generating ₹5,00,000 revenue without asking or paying Maya.',
    clues: [
      'Clue 1: Maya created the flute track in her home studio and uploaded it to audio streaming platforms.',
      'Clue 2: The influencer used 100% of Maya\'s audio track as the background score for a commercial ad.',
      'Clue 3: The influencer claims "I gave credit in the description so it is Fair Use".'
    ],
    options: [
      {
        label: 'Ruling: Commercial ad usage without license is Copyright Infringement (Giving credit alone does NOT equal Fair Use)',
        isCorrect: true,
        explanation: 'Spot on! Merely writing credit in a caption does NOT replace paying for a commercial license under Copyright Law.'
      },
      {
        label: 'Ruling: Dismiss case because writing credit makes it Fair Use',
        isCorrect: false,
        explanation: 'Incorrect! Fair Use applies primarily to educational/news/review usage, not commercial ad campaigns!'
      },
      {
        label: 'Ruling: Maya loses because flutes cannot be copyrighted',
        isCorrect: false,
        explanation: 'Incorrect! Music compositions and sound recordings are fully protected by Copyright.'
      }
    ]
  },
  detective_case3: {
    title: 'Case #103: The Herbal Secret Battle',
    caseNumber: 'CASE-2026-103',
    category: 'Patents vs Traditional Knowledge',
    brief: 'A foreign pharmaceutical firm filed a patent claim for a Neem & Tulsi antibacterial extract, claiming it as their novel discovery.',
    clues: [
      'Clue 1: Ayurvedic texts (AYUSH) written over 1,000 years ago document Neem and Tulsi antibacterial properties.',
      'Clue 2: A patent requires global NOVELTY (must be brand new, never known anywhere).',
      'Clue 3: India\'s Traditional Knowledge Digital Library (TKDL) contains ancient documented proof.'
    ],
    options: [
      {
        label: 'Submit TKDL evidence to revoke the patent claim (Traditional Knowledge cannot be patented)',
        isCorrect: true,
        explanation: 'Brilliant! Indian CSIR successfully used traditional texts to revoke invalid patents on Neem & Turmeric!'
      },
      {
        label: 'Grant the patent because it was filed in a foreign country first',
        isCorrect: false,
        explanation: 'Incorrect! Novelty is judged GLOBALLY. Prior public knowledge anywhere in the world invalidates a patent claim.'
      },
      {
        label: 'Convert the patent into a Trademark',
        isCorrect: false,
        explanation: 'Incorrect. Trademarks protect brand names, not botanical extraction methods.'
      }
    ]
  }
};

export const CaseDetectiveGame: React.FC<CaseDetectiveGameProps> = ({ levelId, onComplete, onBack }) => {
  const caseData = CASE_DATABASE[levelId] || CASE_DATABASE['detective_case1'];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = caseData.options[idx].isCorrect;

    if (isCorrect) {
      soundFx.playCorrect();
    } else {
      soundFx.playWrong();
    }
  };

  const handleCompleteCase = () => {
    soundFx.playClick();
    setIsFinished(true);
    const score = selectedOption !== null && caseData.options[selectedOption].isCorrect ? 400 : 150;
    const calculatedStars = score === 400 ? 3 : 1;
    soundFx.playVictory();
    try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
    onComplete(score, calculatedStars);
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Level 2: IP Detective</span>
          <h2 className="text-base font-black text-white">{caseData.title}</h2>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            {caseData.caseNumber}
          </span>
        </div>
      </div>

      {!isFinished ? (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700 space-y-6">
          {/* Case File Folder */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Search className="w-4 h-4" /> Case File Investigation
              </span>
              <span className="text-xs font-bold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                {caseData.category}
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed italic">
              "{caseData.brief}"
            </p>

            {/* Collected Evidence Clues */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collected Legal Evidence:</div>
              <div className="space-y-1.5">
                {caseData.clues.map((clue, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-cyan-200">
                    🔍 {clue}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verdict Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" /> Deliver Your Legal Court Verdict:
            </h3>

            <div className="space-y-2">
              {caseData.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-cyan-500/50';

                if (isAnswered) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold ring-2 ring-emerald-500/30';
                  } else if (selectedOption === idx) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                  } else {
                    btnStyle = 'bg-slate-950 border-slate-900 text-slate-600 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <span>{opt.label}</span>
                    {isAnswered && opt.isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {isAnswered && selectedOption === idx && !opt.isCorrect && <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation & Proceed */}
          {isAnswered && selectedOption !== null && (
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 space-y-3 animate-fadeIn">
              <div className="font-extrabold text-base text-amber-300">Court Verdict Explanation:</div>
              <p className="leading-relaxed">{caseData.options[selectedOption].explanation}</p>

              <button
                onClick={handleCompleteCase}
                className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition shadow-xl shadow-cyan-500/20"
              >
                Conclude Case & File Report ▶
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl border border-slate-700 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">Case Solved! 🔍</h3>
            <p className="text-xs text-slate-300">You earned the <strong>IP Detective Badge</strong>!</p>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onBack(); }}
            className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base transition shadow-xl shadow-cyan-500/20"
          >
            Return to Quest Map
          </button>
        </div>
      )}
    </div>
  );
};
