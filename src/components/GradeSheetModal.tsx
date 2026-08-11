import React from 'react';
import { X, Printer, Award, CheckCircle2, XCircle, Star, Sparkles, Building2, User, FileText } from 'lucide-react';
import type { UserGameState, LevelGradeSheet } from '../utils/storage';
import { soundFx } from '../utils/audio';

interface GradeSheetModalProps {
  gameState: UserGameState;
  levelId: string;
  onClose: () => void;
}

const LEVEL_NAMES: Record<string, string> = {
  patents_basic: 'Level 1: Patents Workshop (Novelty & Mechanism Sorter)',
  trademarks_basic: 'Level 2: Brand Guardian (Trademarks & Logo Inspector)',
  copyrights_basic: 'Level 3: Creator\'s Studio (Copyrights & Fair Use Judge)',
  designs_basic: 'Level 4: Product Design Lab (Industrial Shape & Contours)',
  detective_case1: 'Level 5: IP Detective Case #101 (Counterfeit Tech Mystery)',
  detective_case2: 'Level 6: IP Detective Case #102 (The Viral Beat Heist)',
  detective_case3: 'Level 7: IP Detective Case #103 (Herbal Secret Battle)',
  startup_simulator: 'Level 8: TechVeda IP Empire (Startup Mastermind Simulator)'
};

export const GradeSheetModal: React.FC<GradeSheetModalProps> = ({ gameState, levelId, onClose }) => {
  const gradeSheet: LevelGradeSheet | undefined = gameState.gradeSheets?.[levelId];
  const levelProg = gameState.levelProgress[levelId];

  const levelTitle = LEVEL_NAMES[levelId] || 'IP Quest Level Performance';
  const score = gradeSheet?.score ?? levelProg?.score ?? 0;
  const maxScore = gradeSheet?.maxScore ?? levelProg?.maxScore ?? 300;
  const stars = gradeSheet?.stars ?? levelProg?.stars ?? 0;
  const isPassed = score >= 100;
  const accuracy = Math.min(100, Math.round((score / maxScore) * 100));

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-2xl rounded-3xl border border-indigo-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Official Level Grade Sheet</h2>
              <p className="text-xs text-slate-400">Separate Per-Level Performance Report Card</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Printer className="w-4 h-4 text-slate-950" /> Print Grade Sheet
            </button>
            <button
              onClick={() => { soundFx.playClick(); onClose(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grade Sheet Document View */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-950 text-slate-100 space-y-6 print:bg-white print:text-black print:p-8">
          {/* Document Header */}
          <div className="text-center space-y-2 border-b border-slate-800 pb-6 print:border-black">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-widest print:border-black print:text-black">
              <Sparkles className="w-3 h-3 text-amber-400" /> Government of India • CIPAM IPR Quest
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight print:text-black">
              INDIVIDUAL LEVEL GRADE SHEET
            </h1>
            <p className="text-xs text-amber-400 font-bold print:text-gray-800">{levelTitle}</p>
          </div>

          {/* User Profile Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs print:bg-gray-100 print:border-gray-300 print:text-black">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-300 print:text-black">
                <User className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Name:</span> <strong className="text-white print:text-black">{gameState.profile.name}</strong>
              </div>
              <div className="flex items-center gap-2 text-slate-300 print:text-black">
                <Award className="w-4 h-4 text-indigo-400" />
                <span className="font-bold">Role:</span> <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono print:text-black">{gameState.profile.role || 'Student'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 print:text-black">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">School / Org:</span> <span>{gameState.profile.schoolName}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-slate-300 print:text-black">
                <span className="font-bold">CIPAM Identification:</span> <span className="font-mono text-amber-400 font-bold print:text-black">{gameState.profile.studentId || 'CIPAM-STU-84920'}</span>
              </div>
              <div className="text-slate-300 print:text-black">
                <span className="font-bold">Class / Grade:</span> <span>{gameState.profile.grade}</span>
              </div>
              <div className="text-slate-300 print:text-black">
                <span className="font-bold">Evaluation Date:</span> <span>{gradeSheet?.completedAt ? new Date(gradeSheet.completedAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics Table */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 print:bg-gray-50 print:border-gray-300">
            <h3 className="text-sm font-black uppercase text-slate-300 tracking-wider print:text-black">
              Level Evaluation Criteria & Score Breakdown
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-white print:border-gray-300">
                <div className="text-[10px] text-slate-400 uppercase font-bold print:text-gray-600">Points Earned</div>
                <div className="text-xl font-black text-amber-400 print:text-black">{score} / {maxScore}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-white print:border-gray-300">
                <div className="text-[10px] text-slate-400 uppercase font-bold print:text-gray-600">Stars Rated</div>
                <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
                  <span>{stars}</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-white print:border-gray-300">
                <div className="text-[10px] text-slate-400 uppercase font-bold print:text-gray-600">Accuracy</div>
                <div className="text-xl font-black text-emerald-400 print:text-black">{accuracy}%</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-white print:border-gray-300">
                <div className="text-[10px] text-slate-400 uppercase font-bold print:text-gray-600">Pass Status</div>
                <div className={`text-base font-black flex items-center justify-center gap-1 ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{isPassed ? 'PASSED' : 'RETRY'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level Passing Criteria Note */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed print:bg-gray-100 print:text-black print:border-gray-300">
            <div className="font-bold mb-1">CIPAM Passing Rules:</div>
            <div>
              A minimum score of <strong>100 Points (1 Star)</strong> is required to pass this level and earn progression approval. 
              {isPassed 
                ? ' User has satisfied all minimum criteria and earned official level credit.' 
                : ' User did not meet the minimum 100-point requirement and must re-evaluate this level.'}
            </div>
          </div>

          {/* Official Stamp & Sign Footnote */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 print:border-black print:text-black">
            <div>Verification Code: <strong className="font-mono text-slate-300 print:text-black">{gradeSheet?.gradeCode || 'CIPAM-GRD-' + Math.floor(10000 + Math.random() * 90000)}</strong></div>
            <div>Certified by Cell for IPR Promotion and Management (CIPAM India)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
