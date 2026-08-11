import React, { useState } from 'react';
import { X, BookOpen, Clock, Building2, CheckCircle2, Lightbulb } from 'lucide-react';
import { RECAP_TOPICS } from '../data/recapData';
import type { RecapTopic } from '../data/recapData';
import { soundFx } from '../utils/audio';

interface QuickRecapModalProps {
  onClose: () => void;
}

export const QuickRecapModal: React.FC<QuickRecapModalProps> = ({ onClose }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('recap_patents');

  const selectedTopic = RECAP_TOPICS.find((t) => t.id === selectedTopicId) || RECAP_TOPICS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Quick IP Learning Recap & Cheat Sheet</h2>
              <p className="text-xs text-slate-400">CIPAM student reference guide for school exams & game recap</p>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topic Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 overflow-x-auto p-3 gap-2">
          {RECAP_TOPICS.map((topic: RecapTopic) => {
            const isSelected = selectedTopicId === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => { soundFx.playClick(); setSelectedTopicId(topic.id); }}
                className={`py-2 px-4 rounded-xl font-bold text-xs shrink-0 transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{topic.symbol}</span>
                <span>{topic.category}</span>
              </button>
            );
          })}
        </div>

        {/* Content Viewer */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedTopic.symbol}</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {selectedTopic.category} Cheat Sheet
                </span>
                <h3 className="text-2xl font-black text-white">{selectedTopic.title}</h3>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <strong>Definition:</strong> {selectedTopic.definition}
            </p>
          </div>

          {/* Key Legal Rules */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Legal Criteria
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedTopic.keyPoints.map((point, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Examples & Authorities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 sm:col-span-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Validity Term
              </div>
              <div className="text-xs font-bold text-amber-300">{selectedTopic.validityPeriod}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 sm:col-span-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Indian Governing Registry
              </div>
              <div className="text-xs font-bold text-indigo-200">{selectedTopic.governingOffice}</div>
            </div>
          </div>

          {/* Real-World Examples */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Real-World Examples
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTopic.examples.map((ex, idx) => (
                <span key={idx} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                  • {ex}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
