import React, { useRef } from 'react';
import { X, Award, Printer, CheckCircle2 } from 'lucide-react';
import type { UserGameState } from '../utils/storage';
import { soundFx } from '../utils/audio';

interface CertificateModalProps {
  gameState: UserGameState;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ gameState, onClose }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const certId = `CIPAM-IPR-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn print:p-0 print:bg-white print:static">
      <div className="glass-card w-full max-w-4xl max-h-[95vh] rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl flex flex-col print:shadow-none print:border-none print:max-w-none print:h-auto">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-white">CIPAM Youth IP Champion Certificate</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={() => { soundFx.playClick(); onClose(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 print:p-0 print:bg-white">
          <div
            ref={certificateRef}
            className="w-full max-w-3xl mx-auto p-8 md:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-4 border-amber-500/50 shadow-2xl relative overflow-hidden space-y-8 text-center print:text-slate-950 print:bg-white print:border-amber-600 print:shadow-none"
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400 pointer-events-none"></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400 pointer-events-none"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400 pointer-events-none"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400 pointer-events-none"></div>

            {/* Header Logos & Title */}
            <div className="space-y-3">
              <div className="inline-block px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest print:border-amber-600 print:text-amber-700">
                Cell for IPR Promotion and Management (CIPAM)
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-bold print:text-slate-600">
                Ministry of Commerce and Industry • Government of India
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gradient-gold tracking-tight uppercase print:text-amber-700">
                Certificate of Merit
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-semibold uppercase tracking-wider print:text-slate-600">
                Intellectual Property Awareness & Gamified Mastery
              </p>
            </div>

            {/* Awarded To Section */}
            <div className="space-y-3 my-6">
              <p className="text-sm text-slate-300 italic print:text-slate-700">This is to proudly certify that</p>
              <div className="text-3xl md:text-4xl font-black text-white underline decoration-amber-400 underline-offset-8 print:text-slate-950">
                {gameState.profile.name}
              </div>
              <p className="text-sm font-bold text-amber-300 print:text-slate-800">
                {gameState.profile.grade} • {gameState.profile.schoolName}
              </p>
            </div>

            {/* Citation */}
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto print:text-slate-800">
              has successfully completed the interactive <strong className="text-amber-400 print:text-amber-700">CIPAM IP Quest Educational Curriculum</strong>, demonstrating mastery across <strong className="text-white print:text-slate-950">Patents, Trademarks, Copyrights, and Industrial Designs</strong>.
            </p>

            {/* Score & Badges Summary */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto p-4 rounded-2xl bg-slate-900/90 border border-slate-800 print:border-amber-300 print:bg-amber-50">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Final Score</div>
                <div className="text-base font-black text-amber-400 print:text-amber-800">{gameState.totalScore} pts</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">IP Badges</div>
                <div className="text-base font-black text-amber-400 print:text-amber-800">{gameState.badges.length} Unlocked</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Status</div>
                <div className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1 mt-1 print:text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                </div>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="pt-8 border-t border-slate-800 flex items-end justify-between text-left print:border-slate-300">
              <div>
                <div className="text-xs font-bold text-slate-400 print:text-slate-600">Issued On:</div>
                <div className="text-xs font-bold text-white print:text-slate-900">{currentDate}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">ID: {certId}</div>
              </div>

              <div className="text-center space-y-1">
                <div className="w-32 h-10 border-b border-amber-400/50 mx-auto flex items-center justify-center font-serif text-amber-400 italic text-sm print:text-amber-700">
                  CIPAM Director
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider print:text-slate-700">
                  CIPAM Educational Cell
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
