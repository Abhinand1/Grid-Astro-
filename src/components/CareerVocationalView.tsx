import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NAKSHATRAS } from '../utils/astroData';
import { calculateCareerForecast, CareerForecastResult } from '../utils/keralaAstrologySuite';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomSelect } from './CustomSelect';
import { haptic } from '../utils/haptics';

interface CareerVocationalViewProps {
  onBack: () => void;
}

export const CareerVocationalView: React.FC<CareerVocationalViewProps> = ({ onBack }) => {
  const { lang } = useLanguage();
  const [selectedStarId, setSelectedStarId] = useState<number>(1);
  const [forecast, setForecast] = useState<CareerForecastResult>(() => calculateCareerForecast(1));

  const handleStarChange = (starId: number) => {
    setSelectedStarId(starId);
    haptic.light();
    const result = calculateCareerForecast(starId);
    setForecast(result);
  };

  const starOptions = NAKSHATRAS.map((s) => ({
    value: s.id,
    label: lang === 'ml' ? `${s.id}. ${s.malayalamName} (${s.name})` : `${s.id}. ${s.name} (${s.malayalamName})`
  }));

  return (
    <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 pb-32">
      {/* Top Header */}
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

        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[14px]">work</span>
            {lang === 'ml' ? 'കർമ്മ ഭാവ വിശകലനം' : 'Karma Bhava Analysis'}
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 shadow-xl border border-white/10 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-indigo-300">
            {lang === 'ml' ? 'തൊഴിൽ & നേതൃത്വ ഭാഗ്യം' : 'Career & Vocational Direction'}
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {lang === 'ml' ? 'കർമ്മഫലവും ജീവിതാഭിവൃദ്ധിയും' : 'Vocational Mastery & Leadership Aptitude'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {lang === 'ml'
              ? 'പത്താം ഭാവമായ കർമ്മ സ്ഥാനത്തിന്റെയും കർമ്മാധിപന്റെയും സൂക്ഷ്മ വിശകലനം വഴി അനുയോജ്യമായ തൊഴിൽ മേഖലകളും സംരംഭകത്വ സാധ്യതകളും കണ്ടെത്തുക.'
              : 'Pinpoint optimal career fields, leadership aptitude, and corporate vs. entrepreneurial inclinations based on 10th house (Karma Bhava) alignment.'}
          </p>
        </div>
      </div>

      {/* Nakshatra Selector Card */}
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
        {/* Core Archetype Banner */}
        <motion.div
          key={selectedStarId}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-indigo-100"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">
                {lang === 'ml' ? 'തൊഴിൽ പ്രകൃതം' : 'Career Archetype'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                {lang === 'ml' ? forecast.careerArchetypeMl : forecast.careerArchetypeEn}
              </h2>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-100 shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">stars</span>
              <div className="text-left text-xs">
                <span className="text-slate-500 block text-[10px]">{lang === 'ml' ? 'കർമ്മ രാശി & നാഥൻ' : '10th House & Lord'}</span>
                <span className="font-bold text-slate-800">
                  {lang === 'ml' ? `${forecast.karmaRasiMl} (${forecast.karmaLordMl})` : `${forecast.karmaRasi} (${forecast.karmaLord})`}
                </span>
              </div>
            </div>
          </div>

          {/* Three Key Aptitude Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mt-6">
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">{lang === 'ml' ? 'നേതൃത്വ ശേഷി' : 'Leadership'}</span>
                <span className="text-xs font-extrabold text-indigo-600">{forecast.leadershipScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${forecast.leadershipScore}%` }} />
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">{lang === 'ml' ? 'സംരംഭകത്വം' : 'Entrepreneurship'}</span>
                <span className="text-xs font-extrabold text-emerald-600">{forecast.entrepreneurshipScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: `${forecast.entrepreneurshipScore}%` }} />
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">{lang === 'ml' ? 'കോർപ്പറേറ്റ് മികവ്' : 'Corporate'}</span>
                <span className="text-xs font-extrabold text-blue-600">{forecast.corporateScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${forecast.corporateScore}%` }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Optimal Career Fields */}
        <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-slate-100">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="material-symbols-outlined text-primary text-xl">verified</span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {lang === 'ml' ? 'ഏറ്റവും അനുയോജ്യമായ തൊഴിൽ മേഖലകൾ' : 'Optimal Career Fields & Vocations'}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(lang === 'ml' ? forecast.suitableFieldsMl : forecast.suitableFieldsEn).map((field, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">{field}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Strategic Guidance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-slate-100 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">psychology</span>
              {lang === 'ml' ? 'പ്രധാന തൊഴിൽ ഗുണങ്ങൾ' : 'Core Professional Strengths'}
            </h4>
            <ul className="space-y-2.5">
              {(lang === 'ml' ? forecast.strengthsMl : forecast.strengthsEn).map((str, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-slate-100 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-lg">trending_up</span>
              {lang === 'ml' ? 'അനുകൂല കാലഘട്ടങ്ങൾ' : 'Favorable Transit Cycles'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'ml' ? forecast.favorablePeriodsMl : forecast.favorablePeriodsEn}
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 italic">
                {lang === 'ml' ? forecast.guidanceMl : forecast.guidanceEn}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
