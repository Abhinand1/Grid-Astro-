import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NAKSHATRAS } from '../utils/astroData';
import { calculateRemedialPrescriptions, RemedialPrescriptionResult } from '../utils/keralaAstrologySuite';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomSelect } from './CustomSelect';
import { haptic } from '../utils/haptics';

interface RemedialPrescriptionsViewProps {
  onBack: () => void;
}

export const RemedialPrescriptionsView: React.FC<RemedialPrescriptionsViewProps> = ({ onBack }) => {
  const { lang } = useLanguage();
  const [selectedStarId, setSelectedStarId] = useState<number>(1);
  const [remedies, setRemedies] = useState<RemedialPrescriptionResult>(() => calculateRemedialPrescriptions(1));

  const handleStarChange = (starId: number) => {
    setSelectedStarId(starId);
    haptic.light();
    setRemedies(calculateRemedialPrescriptions(starId));
  };

  const starOptions = NAKSHATRAS.map((s) => ({
    value: s.id,
    label: lang === 'ml' ? `${s.id}. ${s.malayalamName} (${s.name})` : `${s.id}. ${s.name} (${s.malayalamName})`
  }));

  return (
    <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 pb-32">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <button
          onClick={() => {
            haptic.light();
            onBack();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 active:scale-95 transition-all text-slate-700 text-xs sm:text-sm font-semibold shrink-0 min-h-[44px]"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>{lang === 'ml' ? 'തിരികെ' : 'Back'}</span>
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-800 border border-purple-500/20">
          <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
          {lang === 'ml' ? 'പരിഹാര വിധികൾ' : 'Parihara Vidhikal'}
        </span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 shadow-xl border border-white/10 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-purple-300">
            {lang === 'ml' ? 'രത്നധാരണവും ക്ഷേത്ര വഴിപാടുകളും' : 'Remedial Prescriptions & Vazhipadu'}
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {lang === 'ml' ? 'ദോഷശമനവും തനതായ കേരളീയ പരിഹാരങ്ങളും' : 'Sacred Gemstones, Mantras & Temple Offerings'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {lang === 'ml'
              ? 'ദശാസന്ധികൾ, ഏഴരശ്ശനി, ജന്മനക്ഷത്ര ദോഷങ്ങൾ എന്നിവ പരിഹരിക്കാൻ ശാസ്ത്രീയമായ രത്നധാരണവും കേരളത്തിലെ പ്രശസ്തമായ ക്ഷേത്ര വഴിപാടുകളും മന്ത്രജപങ്ങളും.'
              : 'Empower your destiny and neutralize planetary afflictions with authentic Kerala temple offerings (Vazhipadu), Vedic gemstones (Ratna Dharana), and sacred Mantras.'}
          </p>
        </div>
      </div>

      {/* Star Selector */}
      <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 mb-6 sm:mb-8">
        <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
          {lang === 'ml' ? 'നിങ്ങളുടെ ജന്മ നക്ഷത്രം തിരഞ്ഞെടുക്കുക' : 'Select Your Janma Nakshatra'}
        </label>
        <CustomSelect
          value={selectedStarId}
          onChange={(val) => handleStarChange(Number(val))}
          options={starOptions}
          placeholder={lang === 'ml' ? 'നക്ഷത്രം തിരഞ്ഞെടുക്കുക' : 'Select Nakshatra'}
        />
      </div>

      {/* Main Results View */}
      <div className="space-y-5 sm:space-y-6">
        {/* Gemstone Recommendation Card */}
        <motion.div
          key={selectedStarId}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-purple-100"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-full">
                {lang === 'ml' ? 'അനുയോജ്യമായ ഭാഗ്യരത്നം' : 'Prescribed Auspicious Gemstone'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                {lang === 'ml' ? remedies.prescribedGemstoneMl : remedies.prescribedGemstoneEn}
              </h2>
            </div>
            <div className="bg-purple-50/70 px-4 py-2.5 rounded-2xl border border-purple-200/50 shrink-0 text-xs">
              <span className="text-slate-500 block text-[10px]">{lang === 'ml' ? 'ശുപാർശ ചെയ്യുന്ന തൂക്കം' : 'Recommended Weight'}</span>
              <span className="font-extrabold text-purple-900 text-sm">{remedies.gemstoneWeight}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                {lang === 'ml' ? 'ധരിക്കേണ്ട വിരൽ' : 'Finger of Placement'}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                {lang === 'ml' ? remedies.gemstoneFingerMl : remedies.gemstoneFingerEn}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                {lang === 'ml' ? 'പണിയേണ്ട ലോഹം' : 'Setting Metal'}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                {lang === 'ml' ? remedies.gemstoneMetalMl : remedies.gemstoneMetalEn}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Temple Offerings & Sacred Shrines */}
        <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-purple-700 text-2xl">temple_hindu</span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {lang === 'ml' ? 'കേരളീയ ക്ഷേത്ര വഴിപാടുകൾ' : 'Sacred Kerala Temple Vazhipadu'}
            </h3>
          </div>

          <div className="space-y-2.5 mb-5">
            {(lang === 'ml' ? remedies.primaryVazhipaduMl : remedies.primaryVazhipaduEn).map((vazhi, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100/60">
                <span className="material-symbols-outlined text-purple-600 text-lg shrink-0 mt-0.5">check_circle</span>
                <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{vazhi}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {lang === 'ml' ? 'ദർശനം നടത്തേണ്ട പുണ്യക്ഷേത്രം' : 'Recommended Pilgrimage Shrine'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              {lang === 'ml' ? remedies.sacredTempleMl : remedies.sacredTempleEn}
            </span>
          </div>
        </div>

        {/* Mantra & Daanam Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-slate-100 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-lg">record_voice_over</span>
              {lang === 'ml' ? 'നിത്യേന ജപിക്കേണ്ട മന്ത്രം' : 'Daily Chanting Mantra'}
            </h4>
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/70">
              <p className="text-xs sm:text-sm font-semibold text-indigo-950 italic">
                {lang === 'ml' ? remedies.chantingMantraMl : remedies.chantingMantraEn}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-slate-100 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">volunteer_activism</span>
              {lang === 'ml' ? 'പുണ്യ ദാനങ്ങൾ' : 'Prescribed Daanam (Charity)'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'ml' ? remedies.daanamMl : remedies.daanamEn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
