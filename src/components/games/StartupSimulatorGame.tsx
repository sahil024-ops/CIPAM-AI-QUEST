import React, { useState } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';

interface StartupSimulatorGameProps {
  onComplete: (score: number, stars: number) => void;
  onBack: () => void;
}

interface DecisionRound {
  id: number;
  stageName: string;
  category: string;
  scenario: string;
  icon: string;
  options: {
    label: string;
    cost: number;
    valueAdded: number;
    isOptimal: boolean;
    feedback: string;
  }[];
}

const STARTUP_ROUNDS: DecisionRound[] = [
  {
    id: 1,
    stageName: 'Round 1: Brand & Identity',
    category: 'Trademarks',
    scenario: 'You created your tech startup brand name "TechVeda". A competitor tries to sell knockoff apps under a similar name "TechVeda Pro".',
    icon: 'ShieldCheck',
    options: [
      {
        label: 'Register "TechVeda" trademark with CIPAM Trademark Registry India (® symbol)',
        cost: 2000,
        valueAdded: 25000,
        isOptimal: true,
        feedback: 'Optimal Choice! Registering your trademark grants exclusive rights and legal protection against copycats nationwide!'
      },
      {
        label: 'Ignore the competitor and don\'t file trademark registration',
        cost: 0,
        valueAdded: 0,
        isOptimal: false,
        feedback: 'Poor decision. Without a registered trademark, competitors can steal your brand goodwill and confuse consumers.'
      }
    ]
  },
  {
    id: 2,
    stageName: 'Round 2: Hardware Innovation',
    category: 'Patents',
    scenario: 'Your team invented an ultra-fast neural AI chip that cuts drone battery usage by 60%. Investors want to invest ₹50 Lakhs.',
    icon: 'Lightbulb',
    options: [
      {
        label: 'File a Patent application for the novel hardware circuit before launching',
        cost: 5000,
        valueAdded: 50000,
        isOptimal: true,
        feedback: 'Excellent! Filing a patent secures your 20-year exclusive manufacturing rights and boosts investor valuation!'
      },
      {
        label: 'Publish the full circuit schematics publicly online without filing a patent',
        cost: 0,
        valueAdded: 500,
        isOptimal: false,
        feedback: 'Critical mistake! Publicly disclosing your invention destroys its Novelty, preventing you from ever patenting it.'
      }
    ]
  },
  {
    id: 3,
    stageName: 'Round 3: Mobile App & Codebase',
    category: 'Copyrights',
    scenario: 'You wrote 20,000 lines of custom React & Python code for your mobile app control dashboard.',
    icon: 'Music',
    options: [
      {
        label: 'Enforce Copyright © ownership and include Fair Use terms in End User License Agreement',
        cost: 1000,
        valueAdded: 15000,
        isOptimal: true,
        feedback: 'Smart move! Source code is protected under Copyright law automatically, and clear licensing prevents software piracy.'
      },
      {
        label: 'Leave code uncredited without license notices',
        cost: 0,
        valueAdded: 0,
        isOptimal: false,
        feedback: 'Risky! Clear ownership tags and copyright notices safeguard your software IP.'
      }
    ]
  },
  {
    id: 4,
    stageName: 'Round 4: Device Aesthetics',
    category: 'Industrial Designs',
    scenario: 'Your drone has a sleek futuristic aerodynamic body shape designed by school industrial designers.',
    icon: 'Palette',
    options: [
      {
        label: 'Register the unique 3D visual body casing under Industrial Design Act at Design Office Kolkata',
        cost: 2000,
        valueAdded: 20000,
        isOptimal: true,
        feedback: 'Brilliant! Industrial Design registration protects your sleek product aesthetics from visual clones!'
      },
      {
        label: 'Rely only on word of mouth',
        cost: 0,
        valueAdded: 0,
        isOptimal: false,
        feedback: 'Without design registration, rivals can clone your exact product shape with impunity.'
      }
    ]
  }
];

export const StartupSimulatorGame: React.FC<StartupSimulatorGameProps> = ({ onComplete, onBack }) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [capital, setCapital] = useState(20000);
  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOptIndex, setSelectedOptIndex] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentRound = STARTUP_ROUNDS[currentRoundIndex];

  const handleChoose = (optIndex: number) => {
    if (answered) return;
    setSelectedOptIndex(optIndex);
    setAnswered(true);

    const chosen = currentRound.options[optIndex];

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
      setAnswered(false);
      setSelectedOptIndex(null);
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Level 3: IP Empire Tycoon</span>
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
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Select Founder IP Strategy:</h4>

            <div className="space-y-3">
              {currentRound.options.map((opt, idx) => {
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
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition flex flex-col gap-1 ${btnStyle}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold">{opt.label}</span>
                      <span className="text-xs font-bold text-amber-400 shrink-0">
                        {opt.cost > 0 ? `Cost: ₹${opt.cost}` : 'Free'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {answered && selectedOptIndex !== null && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 space-y-3 animate-fadeIn">
              <div className="font-extrabold text-base text-amber-300">Strategy Result:</div>
              <p className="leading-relaxed">{currentRound.options[selectedOptIndex].feedback}</p>

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
            <h3 className="text-3xl font-black text-white">Startup Simulator Completed! 🚀</h3>
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
