import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Sparkles, Clock, Compass, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { calculatePrashnaKundali, PrashnaCategory, PrashnaResult } from '../utils/prashnaKundali';
import { CustomSelect } from './CustomSelect';
import { useLanguage } from '../contexts/LanguageContext';
import { haptic } from '../utils/haptics';
import { sanitizeInput } from '../utils/sanitize';

interface Props {
  onBack: () => void;
}

export const PrashnaKundaliView: React.FC<Props> = ({ onBack }) => {
  const { lang, t } = useLanguage();
  
  const [question, setQuestion] = useState(
    lang === 'ml' 
      ? 'ഞാൻ അപേക്ഷിച്ച പുതിയ ജോലിയിൽ എനിക്ക് നിയമനം ലഭിക്കുമോ?' 
      : 'Will I successfully secure the new job offer?'
  );
  const [category, setCategory] = useState<PrashnaCategory>('career');
  const [tambula, setTambula] = useState<number>(27);
  const [result, setResult] = useState<PrashnaResult>(() => 
    calculatePrashnaKundali({
      question: 'Will I successfully secure the new job offer?',
      category: 'career',
      tambulaNumber: 27
    })
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.medium();
    const res = calculatePrashnaKundali({
      question: question.trim() || (lang === 'ml' ? 'പ്രശ്ന വിചാരം' : 'Prashna Query'),
      category,
      tambulaNumber: tambula,
      questionTime: new Date()
    });
    setResult(res);
  };

  const categories: { key: PrashnaCategory; en: string; ml: string }[] = [
    { key: 'career', en: 'Career & Job Offer', ml: 'തൊഴിൽ & പുതിയ അവസരങ്ങൾ' },
    { key: 'lost_item', en: 'Lost / Missing Item', ml: 'നഷ്ടപ്പെട്ട വസ്തുക്കൾ' },
    { key: 'health', en: 'Health & Recovery', ml: 'രോഗശാന്തി & ആരോഗ്യം' },
    { key: 'travel_visa', en: 'Travel & Visa / Migration', ml: 'യാത്ര & വിദേശയാത്ര' },
    { key: 'litigation', en: 'Litigation & Court Dispute', ml: 'കോടതി & തർക്കങ്ങൾ' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { haptic.light(); onBack(); }}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shrink-0"
          aria-label="Back"
        >
          <ArrowLeft size={19} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {lang === 'ml' ? 'പ്രശ്ന വിചാരം (തത്സമയ പ്രശ്നം)' : 'Prashna Vicharam (Horary Astrology)'}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug">
            {lang === 'ml' 
              ? 'ചോദ്യ നിമിഷത്തിലെ ഉദയലഗ്നവും താംബൂല ആരൂഢവും അടിസ്ഥാനമാക്കിയുള്ള ആധികാരിക ഫലം' 
              : 'Precise Horary Astrology Based on Udaya Lagna & Tambula Arudha'}
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 sm:pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
            <HelpCircle size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-800 text-sm leading-tight">
              {lang === 'ml' ? 'നിങ്ങളുടെ ചോദ്യം രേഖപ്പെടുത്തുക' : 'Formulate Your Question'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
              {lang === 'ml' ? 'മനസ്സിൽ ചോദ്യം ഉറപ്പിച്ച് വിഭാഗം തിരഞ്ഞെടുക്കുക' : 'Focus your query and choose the domain'}
            </p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          {/* Query category */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
              {lang === 'ml' ? 'ചോദ്യ വിഭാഗം' : 'Query Domain'}
            </label>
            <CustomSelect
              value={category}
              onChange={(val) => setCategory(val as PrashnaCategory)}
              options={categories.map(c => ({
                value: c.key,
                label: lang === 'ml' ? c.ml : c.en
              }))}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
              {lang === 'ml' ? 'കൃത്യമായ ചോദ്യം' : 'Exact Question'}
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 h-12 rounded-2xl px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
              value={question}
              onChange={(e) => setQuestion(sanitizeInput(e.target.value))}
              placeholder={lang === 'ml' ? 'ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...' : 'Enter your specific question...'}
              required
            />
          </div>

          {/* Tambula / Seed number (1 to 108) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {lang === 'ml' ? 'ആരൂഢ സംഖ്യ (1 - 108 കവടി / താംബൂലം)' : 'Arudha Number (1 - 108)'}
              </label>
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  setTambula(Math.floor(Math.random() * 108) + 1);
                }}
                className="text-[11px] font-bold text-amber-700 flex items-center gap-1 active:scale-95"
              >
                <RefreshCw size={12} />
                <span>{lang === 'ml' ? 'ക്രമരഹിത സംഖ്യ' : 'Randomize'}</span>
              </button>
            </div>
            <input
              type="number"
              min={1}
              max={108}
              value={tambula}
              onChange={(e) => setTambula(Math.max(1, Math.min(108, Number(e.target.value) || 1)))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 h-12 rounded-2xl px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] py-3.5 sm:py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-700/20 active:scale-98 transition-transform flex items-center justify-center gap-2 text-sm mt-1"
          >
            <Sparkles size={17} className="shrink-0" />
            <span>{lang === 'ml' ? 'പ്രശ്നം ചിന്തിക്കുക' : 'Cast Prashna Chart'}</span>
          </button>
        </form>
      </div>

      {/* Prashna Result View */}
      {result && (
        <div className="space-y-4 sm:space-y-6">
          {/* Outcome Verdict Card */}
          <div className="bg-gradient-to-br from-amber-600 via-primary to-amber-900 rounded-[24px] sm:rounded-[36px] p-5 sm:p-7 text-white shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 block">
                  {lang === 'ml' ? 'പ്രശ്ന വിധി' : 'Prashna Verdict'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-0.5 leading-tight">
                  {lang === 'ml' ? result.outcomeMalayalam : result.outcome}
                </h2>
                <p className="text-xs text-white/80 mt-1 italic break-words">
                  "{result.query}"
                </p>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="text-3xl sm:text-4xl font-black">{result.successProbability}%</span>
                <span className="text-[9px] uppercase tracking-wider text-white/80 font-bold">
                  {lang === 'ml' ? 'വിജയ സാധ്യത' : 'Probability'}
                </span>
              </div>
            </div>

            {/* Micro Ascendant Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                <span className="text-[9px] uppercase tracking-wider text-white/70 block">{lang === 'ml' ? 'ഉദയ ലഗ്നം' : 'Udaya Lagna'}</span>
                <p className="text-xs sm:text-sm font-extrabold mt-0.5 break-words">
                  {lang === 'ml' ? result.udayaLagna.rasiMalayalam : result.udayaLagna.rasiName}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                <span className="text-[9px] uppercase tracking-wider text-white/70 block">{lang === 'ml' ? 'ആരൂഢം' : 'Arudha Rasi'}</span>
                <p className="text-xs sm:text-sm font-extrabold mt-0.5 break-words">
                  {lang === 'ml' ? result.arudhaLagna.rasiMalayalam : result.arudhaLagna.rasiName} (#{result.arudhaLagna.number})
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                <span className="text-[9px] uppercase tracking-wider text-white/70 block">{lang === 'ml' ? 'ചന്ദ്ര രാശി' : 'Chandra Rasi'}</span>
                <p className="text-xs sm:text-sm font-extrabold mt-0.5 break-words">
                  {lang === 'ml' ? result.chandraLagna.rasiMalayalam : result.chandraLagna.rasiName}
                </p>
              </div>
            </div>
          </div>

          {/* In-depth Analysis */}
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-primary shrink-0" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                {lang === 'ml' ? 'ജ്യോതിഷ നിഗമനവും ഫലവിചാരവും' : 'Vedic Divination & Astrological Analysis'}
              </h3>
            </div>

            <p className="text-slate-700 leading-relaxed text-xs sm:text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100 break-words">
              {lang === 'ml' ? result.coreAnalysis.ml : result.coreAnalysis.en}
            </p>

            {/* Timing Window */}
            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100/80 flex items-start gap-2.5">
              <Clock size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs leading-snug break-words flex-1 min-w-0">
                <span className="font-bold text-amber-900 mr-1.5">
                  {lang === 'ml' ? 'കാര്യസാധ്യ സമയം:' : 'Estimated Timing:'}
                </span>
                <span className="text-amber-800 font-medium">
                  {lang === 'ml' ? result.timingOfEvent.ml : result.timingOfEvent.en}
                </span>
              </div>
            </div>

            {/* Prashna Shanti Remedies */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed break-words flex-1 min-w-0">
                <span className="font-bold text-slate-900 mr-1.5 block mb-0.5">
                  {lang === 'ml' ? 'പ്രശ്ന ശാന്തി പരിഹാരങ്ങൾ:' : 'Prescribed Prashna Shanti:'}
                </span>
                <span className="text-slate-600">
                  {lang === 'ml' ? result.remedialGuidance.ml : result.remedialGuidance.en}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
