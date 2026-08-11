import React, { useState } from 'react';
import { X, Sparkles, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { IP_TITBITS } from '../data/ipTitbitsData';
import type { IPTitbit } from '../data/ipTitbitsData';
import { soundFx } from '../utils/audio';

interface DidYouKnowModalProps {
  onClose: () => void;
}

export const DidYouKnowModal: React.FC<DidYouKnowModalProps> = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTitbit: IPTitbit = IP_TITBITS[currentIndex];

  const handleNext = () => {
    soundFx.playClick();
    setCurrentIndex((prev) => (prev + 1) % IP_TITBITS.length);
  };

  const handlePrev = () => {
    soundFx.playClick();
    setCurrentIndex((prev) => (prev - 1 + IP_TITBITS.length) % IP_TITBITS.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-2xl rounded-3xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Did You Know? IP Titbits</h2>
              <p className="text-xs text-slate-400">Real-world Indian & global IP stories</p>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Viewer Area */}
        <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category Tag & Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                {currentTitbit.category} Story #{currentIndex + 1} of {IP_TITBITS.length}
              </span>
              <span className="text-3xl">{currentTitbit.imageEmoji}</span>
            </div>

            {/* Story Title & Content */}
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">{currentTitbit.title}</h3>
              <p className="text-sm font-semibold text-indigo-300">{currentTitbit.tagline}</p>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              {currentTitbit.content}
            </p>

            {/* Key Fact / Takeaway */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200 font-semibold leading-relaxed">
                {currentTitbit.fact}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Story
            </button>

            <div className="flex items-center gap-1.5">
              {IP_TITBITS.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => { soundFx.playClick(); setCurrentIndex(idx); }}
                  className={`w-2.5 h-2.5 rounded-full cursor-pointer transition ${
                    idx === currentIndex ? 'bg-amber-400 w-6' : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-amber-500/20"
            >
              Next Story <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
