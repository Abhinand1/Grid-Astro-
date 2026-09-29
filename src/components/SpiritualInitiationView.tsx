import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NAKSHATRAS } from '../utils/astroData';
import { calculateSpiritualForecast, SpiritualForecastResult } from '../utils/keralaAstrologySuite';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomSelect } from './CustomSelect';
import { haptic } from '../utils/haptics';

interface SpiritualInitiationViewProps {
  onBack: () => void;
}

export const SpiritualInitiationView: React.FC<SpiritualInitiationViewProps> = ({ onBack }) => {
  const { lang } = useLanguage();
  const [selectedStarId, setSelectedStarId] = useState<number>(1);
  const [spiritualData, setSpiritualData] = useState<SpiritualForecastResult>(() => calculateSpiritualForecast(1));

  const handleStarChange = (starId: number) => {
    setSelectedStarId(starId);
    haptic.light();
    setSpiritualData(calculateSpiritualForecast(starId));
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

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-900 border border-amber-500/20">
          <span className="material-symbols-outlined text-[14px]">self_improvement</span>
          {lang === 'ml' ? 'ആത്മീയ ദീക്ഷ' : 'Diksha & Ishta Devatha'}
        </span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 shadow-xl border border-white/10 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-300">
            {lang === 'ml' ? 'ഇഷ്ടദേവതയും മന്ത്രോപദേശവും' : 'Spiritual Inclination & Initiation'}
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {lang === 'ml' ? 'ധർമ്മ-മോക്ഷ സാധനയും ഉപാസനാ മൂർത്തിയും' : 'Ishta Devatha, Sacred Mantra & Diksha'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {lang === 'ml'
              ? 'ജാതകത്തിലെ ഒമ്പതാം ഭാവം (ധർമ്മസ്ഥാനം), പന്ത്രണ്ടാം ഭാവം (മോക്ഷസ്ഥാനം) എന്നിവ വിശകലനം ചെയ്ത് നിങ്ങളുടെ ജന്മസിദ്ധമായ ഇഷ്ടദേവതയെയും ഉപാസനാ രീതികളെയും അറിയുക.'
              : 'Identify your soul\'s spiritual potential, authentic Kerala Ishta Devatha, optimal mantras, and auspicious timing for sacred initiation (Diksha/Upadesha).'}
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
        {/* Ishta Devatha Card */}
        <motion.div
          key={selectedStarId}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-amber-100"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full">
                {lang === 'ml' ? 'പ്രധാന ആരാധനാ മൂർത്തി (ഇഷ്ടദേവത)' : 'Primary Chosen Deity (Ishta Devatha)'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                {lang === 'ml' ? spiritualData.ishtaDevathaMl : spiritualData.ishtaDevathaEn}
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-2 rounded-2xl border border-amber-200/50 shrink-0">
              <span className="material-symbols-outlined text-amber-700 text-xl">self_improvement</span>
              <div className="text-left text-xs">
                <span className="text-slate-500 block text-[10px]">{lang === 'ml' ? 'ആത്മീയ ശക്തി' : 'Spiritual Index'}</span>
                <span className="font-extrabold text-amber-900">{spiritualData.spiritualStrengthScore}%</span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-4">
            {lang === 'ml' ? spiritualData.ishtaDevathaDescMl : spiritualData.ishtaDevathaDescEn}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                {lang === 'ml' ? 'ധർമ്മ ഭാവം (9-ാം ഭാവം)' : '9th House (Dharma Bhava)'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {lang === 'ml' ? spiritualData.dharmaRasiMl : spiritualData.dharmaRasiEn}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                {lang === 'ml' ? 'മോക്ഷ ഭാവം (12-ാം ഭാവം)' : '12th House (Moksha Bhava)'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {lang === 'ml' ? spiritualData.mokshaRasiMl : spiritualData.mokshaRasiEn}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Daily Spiritual Sadhana */}
        <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-amber-700 text-xl">brightness_7</span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {lang === 'ml' ? 'നിത്യേനയുള്ള ആത്മീയ സാധന' : 'Recommended Daily Spiritual Sadhana'}
            </h3>
          </div>

          <div className="space-y-2.5">
            {(lang === 'ml' ? spiritualData.recommendedPracticesMl : spiritualData.recommendedPracticesEn).map((practice, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="material-symbols-outlined text-amber-600 text-lg shrink-0 mt-0.5">spa</span>
                <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{practice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Initiation & Diksha Timing Guidance */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-[26px] p-5 sm:p-6 flex items-start gap-3.5">
          <span className="material-symbols-outlined text-amber-800 text-2xl shrink-0 mt-0.5">school</span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-950 mb-1">
              {lang === 'ml' ? 'ദീക്ഷാ & മന്ത്രോപദേശ മുഹൂർത്ത നിയമങ്ങൾ' : 'Sacred Diksha & Upadesha Timing'}
            </h4>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              {lang === 'ml' ? spiritualData.initiationMuhurthaSummaryMl : spiritualData.initiationMuhurthaSummaryEn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
