import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NAKSHATRAS } from '../utils/astroData';
import { findYatraMuhurthams, YatraMuhurthamDate } from '../utils/keralaAstrologySuite';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomSelect } from './CustomSelect';
import { haptic } from '../utils/haptics';

interface YatraMuhurthamViewProps {
  onBack: () => void;
}

export const YatraMuhurthamView: React.FC<YatraMuhurthamViewProps> = ({ onBack }) => {
  const { lang } = useLanguage();
  const [selectedStarId, setSelectedStarId] = useState<number>(1);
  const [dates, setDates] = useState<YatraMuhurthamDate[]>(() => findYatraMuhurthams(1));

  const handleStarChange = (starId: number) => {
    setSelectedStarId(starId);
    haptic.light();
    setDates(findYatraMuhurthams(starId));
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

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-sky-500/10 text-sky-800 border border-sky-500/20">
          <span className="material-symbols-outlined text-[14px]">flight_takeoff</span>
          {lang === 'ml' ? 'യാത്രാ മുഹൂർത്തം' : 'Yatra Muhurtham'}
        </span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 shadow-xl border border-white/10 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-sky-300">
            {lang === 'ml' ? 'വിദേശയാത്ര & കുടിയേറ്റ ശുഭവേളകൾ' : 'Travel & Migration Timing'}
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {lang === 'ml' ? 'യാത്രാ മുഹൂർത്തവും വാരശൂല നിവാരണവും' : 'Optimal Departure Timing & Directional Safety'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {lang === 'ml'
              ? 'വിദേശയാത്രകൾ, കുടിയേറ്റം, തൊഴിൽ യാത്രകൾ എന്നിവയ്ക്ക് വാരശൂലയും രിക്തതിഥികളും ഒഴിവാക്കി ചന്ദ്രബലമുള്ള ഉത്തമ മുഹൂർത്തങ്ങൾ കണ്ടെത്തുക.'
              : 'Elect safe departure dates, align with favorable travel directions, and strictly avoid Vaara Shoola delays or logistical disruptions.'}
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

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600 text-lg">calendar_month</span>
            {lang === 'ml' ? 'ശുപാർശ ചെയ്യുന്ന യാത്രാ ദിനങ്ങൾ (അടുത്ത 60 ദിവസം)' : 'Auspicious Travel Dates (Next 60 Days)'}
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold">{dates.length} {lang === 'ml' ? 'മുഹൂർത്തങ്ങൾ' : 'Windows'}</span>
        </div>

        {dates.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[26px] p-5 shadow-xs border border-slate-100 space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <span className="font-extrabold text-base text-slate-900 block leading-tight">{item.dateFormatted}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {lang === 'ml' ? item.weekdayMl : item.weekdayEn} • {lang === 'ml' ? item.starNameMl : item.starNameEn}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                {item.quality}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                  {lang === 'ml' ? 'അനുകൂല യാത്രാ ദിക്കുകൾ' : 'Auspicious Travel Directions'}
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  {(lang === 'ml' ? item.favorableDirectionsMl : item.favorableDirectionsEn).join(', ')}
                </span>
              </div>

              <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100">
                <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block mb-0.5">
                  {lang === 'ml' ? 'വർജ്ജിക്കേണ്ട ദിക്ക് (വാരശൂല)' : 'Forbidden Direction (Vaara Shoola)'}
                </span>
                <span className="text-xs font-bold text-rose-700">
                  {lang === 'ml' ? item.forbiddenDirectionMl : item.forbiddenDirectionEn}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 italic">
              {lang === 'ml' ? item.recommendationMl : item.recommendationEn}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
