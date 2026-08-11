import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';

interface StartupSimulatorGameProps {
  onComplete: (score: number, stars: number) => void;
  onBack: () => void;
}

interface DecisionOption {
  label: string;
  cost: number;
  valueAdded: number;
  isOptimal: boolean;
  feedback: string;
}

interface DecisionRound {
  id: number;
  stageName: string;
  category: string;
  scenario: string;
  icon: string;
  options: DecisionOption[];
}

const STARTUP_ROUNDS: DecisionRound[] = [
  {
    id: 1,
    stageName: 'Round 1: Brand & Identity Protection',
    category: 'Trademarks',
    scenario: 'You launched your tech startup under the brand name "TechVeda". A rival firm attempts to market a clone app named "TechVeda Pro". How do you protect your brand identity?',
    icon: 'ShieldCheck',
    options: [
      {
        label: 'Register "TechVeda" trademark with CIPAM Trademark Registry India (® symbol)',
        cost: 2000,
        valueAdded: 25000,
        isOptimal: true,
        feedback: 'Optimal Choice! Official trademark registration grants nationwide exclusive legal rights and deters counterfeiters!'
      },
      {
        label: 'Ignore the rival copycat and hope customers notice the quality difference',
        cost: 0,
        valueAdded: 0,
        isOptimal: false,
        feedback: 'Poor decision. Without a registered trademark, competitors can steal your brand goodwill and confuse buyers.'
      },
      {
        label: 'File a Copyright application for the brand name word text',
        cost: 1000,
        valueAdded: 2000,
        isOptimal: false,
        feedback: 'Incorrect category! Short brand names and titles are protected under Trademarks, NOT Copyrights.'
      },
      {
        label: 'Change your company name every month to stay ahead of copycats',
        cost: 5000,
        valueAdded: 0,
        isOptimal: false,
        feedback: 'Terrible strategy! Constantly changing your brand name destroys customer recognition and wastes capital.'
      }
    ]
  },
  {
    id: 2,
    stageName: 'Round 2: Hardware & AI Circuit Innovation',
    category: 'Patents',
    scenario: 'Your engineering team invented a revolutionary AI microchip that cuts drone battery consumption by 60%. Venture Capitalists want to invest ₹50 Lakhs.',
    icon: 'Lightbulb',
    options: [
      {
        label: 'File a Patent application for the novel hardware circuit mechanism before launching',
        cost: 5000,
        valueAdded: 50000,
        isOptimal: true,
        feedback: 'Excellent! Securing a patent grants 20 years of exclusive manufacturing rights and drastically increases startup valuation!'
      },
      {
        label: 'Publish the complete circuit schematics publicly online on a blog without filing a patent',
        cost: 0,
        valueAdded: 500,
        isOptimal: false,
        feedback: 'Critical mistake! Publicly disclosing your invention destroys Novelty, legally forfeiting your right to patent it.'
      },
      {
        label: 'Register the microchip circuit under Trademark law',
        cost: 2000,
        valueAdded: 0,
        isOptimal: false,
        feedback: 'Incorrect category! Trademarks protect brand logos, not technical circuit inventions.'
      },
      {
        label: 'Keep the microchip hidden in a drawer and never manufacture or sell it',
        cost: 0,
        valueAdded: 0,
        isOptimal: false,
        feedback: 'Counter-productive! Innovation must be commercialized or licensed to generate commercial value.'
      }
    ]
  },
  {
    id: 3,
    stageName: 'Round 3: Mobile App & Source Code Protection',
    category: 'Copyrights',
    scenario: 'Your developers authored 20,000 lines of proprietary React & Python code for your mobile app control dashboard.',
    icon: 'Music',
    options: [
      {
        label: 'Enforce Copyright © ownership and attach an End User License Agreement (EULA)',
        cost: 1000,
        valueAdded: 15000,
        isOptimal: true,
        feedback: 'Smart move! Source code is automatically protected under Copyright law, and clear EULAs stop software piracy.'
      },
      {
        label: 'Sell unencrypted source code ZIP files publicly without any copyright notice or license',
        cost: 0,
        valueAdded: 1000,
        isOptimal: false,
        feedback: 'High risk! Without license notices, competitors can freely copy and resell your software.'
      },
      {
        label: 'Try to register the software source code as an Industrial Design',
        cost: 2000,
        valueAdded: 0,
        isOptimal: false,
        feedback: 'Wrong IP category! Industrial Designs protect 3D aesthetic shapes, not lines of code.'
      },
      {
        label: 'Delete the source code repositories after app compilation',
        cost: 0,
        valueAdded: 0,
        isOptimal: false,
        feedback: 'Destructive! Deleting your source code prevents future updates and destroys your core asset.'
      }
    ]
  },
  {
    id: 4,
    stageName: 'Round 4: Product Casing & Aerodynamic Design',
    category: 'Industrial Designs',
    scenario: 'Your designers sculpted a unique futuristic curved aerodynamic casing body for your drone.',
    icon: 'Palette',
    options: [
      {
        label: 'Register the 3D aesthetic casing body under Industrial Design Act at Design Office Kolkata',
        cost: 2000,
        valueAdded: 20000,
        isOptimal: true,
        feedback: 'Brilliant! Industrial Design registration locks down your product visual shape from competitor clones!'
      },
      {
        label: 'Rely only on verbal promises from competitors not to copy your design',
        cost: 0,
        valueAdded: 0,
        isOptimal: false,
        feedback: 'Naive choice. Competitors can legally replicate your product shape unless registered as an Industrial Design.'
      },
      {
        label: 'Apply for a Geographical Indication (GI) tag for your drone casing',
        cost: 3000,
        valueAdded: 0,
        isOptimal: false,
        feedback: 'Incorrect! GI tags protect region-specific goods like Darjeeling Tea, not modern manufactured electronics.'
      },
      {
        label: 'Cover the drone in plain cardboard so no one sees the shape',
        cost: 500,
        valueAdded: 0,
        isOptimal: false,
        feedback: 'Impractical! Aesthetic design is a major selling factor that should be registered, not hidden.'
      }
    ]
  }
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const StartupSimulatorGame: React.FC<StartupSimulatorGameProps> = ({ onComplete, onBack }) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [capital, setCapital] = useState(20000);
  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOptIndex, setSelectedOptIndex] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<DecisionOption[]>([]);

  const currentRound = STARTUP_ROUNDS[currentRoundIndex];

  // Randomize options for each round so answer positions never repeat predictably
  useEffect(() => {
    if (currentRound) {
      setShuffledOptions(shuffleArray(currentRound.options));
      setAnswered(false);
      setSelectedOptIndex(null);
    }
  }, [currentRoundIndex]);

  const handleChoose = (optIndex: number) => {
    if (answered) return;
    setSelectedOptIndex(optIndex);
    setAnswered(true);

    const chosen = shuffledOptions[optIndex];

    if (chosen.isOptimal) {
      soundFx.playCorrect();
      setCapital((prev) => prev - chosen.cost);
      setPortfolioValue((prev) => prev + chosen.valueAdded);
      setScore((prev) => prev + 125);
    } else {
      soundFx.playWrong();
    }
  };

  const handleNextRound = () => {
    soundFx.playClick();
    if (currentRoundIndex < STARTUP_ROUNDS.length - 1) {
      setCurrentRoundIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      const calculatedStars = score >= 400 ? 3 : score >= 250 ? 2 : 1;
      soundFx.playVictory();
      try { confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); } catch (e) {}
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Level 8: Final Mastermind</span>
          <h2 className="text-base font-black text-white">TechVeda Innovations Startup Simulator</h2>
        </div>

        <div className="text-right">
          <div className="text-xs font-black text-rose-400">{score} / 500 pts</div>
          <div className="text-[10px] text-slate-400 font-semibold">Round {currentRoundIndex + 1} of {STARTUP_ROUNDS.length}</div>
        </div>
      </div>

      {/* Startup Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">Available Capital</div>
          <div className="text-base font-black text-emerald-400">₹{capital.toLocaleString()}</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">IP Portfolio Value</div>
          <div className="text-base font-black text-amber-400">₹{portfolioValue.toLocaleString()}</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center col-span-2 sm:col-span-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">CIPAM Compliance</div>
          <div className="text-base font-black text-indigo-400">
            {score >= 375 ? '100% Complete' : score >= 250 ? '75% Complete' : '50% Complete'}
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700 space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                {currentRound.stageName} ({currentRound.category})
              </span>
            </div>

            <h3 className="text-xl font-black text-white">{currentRound.scenario}</h3>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Select Founder IP Strategy (Randomized Options):</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shuffledOptions.map((opt, idx) => {
                let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-rose-500/50';

                if (answered) {
                  if (opt.isOptimal) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold ring-2 ring-emerald-500/30';
                  } else if (selectedOptIndex === idx) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                  } else {
                    btnStyle = 'bg-slate-950 border-slate-900 text-slate-600 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={answered}
                    onClick={() => handleChoose(idx)}
                    className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition flex flex-col justify-between gap-2 ${btnStyle}`}
                  >
                    <span>{opt.label}</span>
                    <div className="flex items-center justify-between w-full pt-2 border-t border-slate-800/60">
                      <span className="text-[11px] font-bold text-amber-400">
                        {opt.cost > 0 ? `Cost: ₹${opt.cost}` : 'Free'}
                      </span>
                      {answered && opt.isOptimal && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {answered && selectedOptIndex === idx && !opt.isOptimal && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {answered && selectedOptIndex !== null && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 space-y-3 animate-fadeIn">
              <div className="font-extrabold text-base text-amber-300">Strategy Evaluation:</div>
              <p className="leading-relaxed">{shuffledOptions[selectedOptIndex].feedback}</p>

              <button
                onClick={handleNextRound}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm transition shadow-xl shadow-rose-600/20"
              >
                {currentRoundIndex < STARTUP_ROUNDS.length - 1 ? 'Next Strategy Round ▶' : 'Finish Startup Simulation'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl border border-slate-700 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">Final Level Completed! 🚀</h3>
            <p className="text-xs text-slate-300">You built a 100% compliant Indian IP startup portfolio valued at <strong>₹{portfolioValue.toLocaleString()}</strong>!</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-xs mx-auto">
            <div className="text-xs font-bold text-slate-400 uppercase">Final Simulator Score</div>
            <div className="text-4xl font-black text-rose-400">{score} / 500 pts</div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onBack(); }}
            className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base transition shadow-xl shadow-rose-600/20"
          >
            Return to Quest Map
          </button>
        </div>
      )}
    </div>
  );
};
