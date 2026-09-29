import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, TrendingUp, Calendar, Clock, Star, ShieldCheck, ArrowLeft, Building2 } from 'lucide-react';
import { NAKSHATRAS } from '../utils/astroData';
import { calculateVyaparMuhurthams, BusinessCategory, VyaparMuhurthamDate } from '../utils/vyaparMuhurtham';
import { CustomSelect } from './CustomSelect';
import { useLanguage } from '../contexts/LanguageContext';
import { haptic } from '../utils/haptics';

interface Props {
  onBack: () => void;
}

export const VyaparMuhurthamView: React.FC<Props> = ({ onBack }) => {
  const { lang, t } = useLanguage();
  const [founderStarId, setFounderStarId] = useState<number>(4); // Rohini
  const [category, setCategory] = useState<BusinessCategory>('retail');
  const [monthsAhead, setMonthsAhead] = useState<number>(6);
  const [results, setResults] = useState<VyaparMuhurthamDate[]>(() =>
    calculateVyaparMuhurthams(4, 'retail', 6)
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.medium();
    const dates = calculateVyaparMuhurthams(founderStarId, category, monthsAhead);
    setResults(dates);
  };

  const selectedStar = NAKSHATRAS.find(s => s.id === founderStarId);

  const categoryOptions: { key: BusinessCategory; en: string; ml: string }[] = [
    { key: 'retail', en: 'Retail Store / Showroom', ml: 'കട / വ്യാപാരശാല' },
    { key: 'tech_startup', en: 'Tech / Software Startup', ml: 'സ്റ്റാർട്ടപ്പ് & ഐടി' },
    { key: 'services', en: 'Consultancy / Professional', ml: 'കൺസൾട്ടൻസി & സേവനങ്ങൾ' },
    { key: 'manufacturing', en: 'Manufacturing & Commercial', ml: 'വ്യവസായശാല & ഫാക്ടറി' }
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
            {lang === 'ml' ? 'വ്യാപാര വ്യവസായ മുഹൂർത്തം' : 'Business Launch (Vyapar Muhurta)'}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug">
            {lang === 'ml' 
              ? 'സ്ഥാപനങ്ങൾ തുടങ്ങാനും വലിയ കരാറുകൾ ഒപ്പിടാനുമുള്ള ശുഭദിനങ്ങൾ' 
              : 'Auspicious Timing for Company Incorporation & Launch'}
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 sm:pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-800 text-sm leading-tight">
              {lang === 'ml' ? 'സംരംഭകന്റെ വിവരങ്ങൾ' : 'Founder & Business Details'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
              {lang === 'ml' ? 'നക്ഷത്രവും ബിസിനസ്സ് വിഭാഗവും തിരഞ്ഞെടുക്കുക' : 'Select founder star and industry type'}
            </p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          {/* Founder Star */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
              {lang === 'ml' ? 'സംരംഭകന്റെ നക്ഷത്രം' : 'Founder Nakshatra'}
            </label>
            <CustomSelect
              value={founderStarId}
              onChange={(val) => setFounderStarId(Number(val))}
              options={NAKSHATRAS.map(star => ({
                value: star.id,
                label: lang === 'ml' ? `${star.malayalamName} (${star.name})` : `${star.name} (${star.malayalamName})`
              }))}
            />
          </div>

          {/* Business Category */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
              {lang === 'ml' ? 'ബിസിനസ്സ് വിഭാഗം' : 'Business Category'}
            </label>
            <CustomSelect
              value={category}
              onChange={(val) => setCategory(val as BusinessCategory)}
              options={categoryOptions.map(c => ({
                value: c.key,
                label: lang === 'ml' ? c.ml : c.en
              }))}
            />
          </div>

          {/* Months Ahead */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
              {lang === 'ml' ? 'കാലയളവ്' : 'Search Window'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 6, 9].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { haptic.light(); setMonthsAhead(m); }}
                  className={`min-h-[44px] py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-98 flex items-center justify-center ${
                    monthsAhead === m
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m} {lang === 'ml' ? 'മാസം' : 'Months'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] py-3.5 sm:py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-700/20 active:scale-98 transition-transform flex items-center justify-center gap-2 text-sm mt-1"
          >
            <TrendingUp size={17} className="shrink-0" />
            <span className="truncate">{lang === 'ml' ? 'ഉത്തമ മുഹൂർത്തങ്ങൾ കാണുക' : 'Find Auspicious Launch Dates'}</span>
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 gap-2 flex-wrap">
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2 flex-wrap">
            <span>{lang === 'ml' ? 'അനുയോജ്യമായ വ്യാപാര മുഹൂർത്തങ്ങൾ' : 'Favorable Business Launch Dates'}</span>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full shrink-0">
              {results.length} {lang === 'ml' ? 'ദിനങ്ങൾ' : 'Dates'}
            </span>
          </h3>
          {selectedStar && (
            <span className="text-[11px] text-slate-500 font-medium shrink-0">
              {lang === 'ml' ? selectedStar.malayalamName : selectedStar.name}
            </span>
          )}
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-center border border-slate-100 space-y-2">
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              {lang === 'ml' 
                ? 'അടുത്ത മാസങ്ങളിൽ അനുകൂലമായ വ്യാപാര മുഹൂർത്തങ്ങൾ ലഭ്യമല്ല. ദയവായി കൂടുതൽ മാസങ്ങൾ പരിശോധിക്കുക.' 
                : 'No favorable dates in this period. Try increasing the search window.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 sm:space-y-4">
            {results.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[22px] sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-3 sm:space-y-3.5 relative overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Top Bar */}
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-base sm:text-xl font-black text-slate-900 block leading-tight">
                      {item.dateFormatted}
                    </span>
                    <p className="text-amber-700 font-bold text-xs sm:text-sm mt-1 flex items-center gap-1.5 flex-wrap leading-tight">
                      <Calendar size={13} className="shrink-0" />
                      <span>{item.weekdayMalayalam}</span>
                      <span className="text-slate-300">•</span>
                      <span>{item.starMalayalam}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] font-black uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {lang === 'ml' ? item.qualityMalayalam : item.quality}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 whitespace-nowrap">
                      {lang === 'ml' ? 'ബലം:' : 'Score:'} <b className="text-slate-800">{item.score}%</b>
                    </span>
                  </div>
                </div>

                {/* Highlights Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 pt-1">
                  <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">{lang === 'ml' ? 'നക്ഷത്രം' : 'Star'}</span>
                    <p className="text-xs font-black text-slate-800 leading-tight break-words">{item.starMalayalam}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">{lang === 'ml' ? 'തിഥി' : 'Tithi'}</span>
                    <p className="text-xs font-black text-slate-800 leading-tight break-words">{item.tithiMalayalam}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">{lang === 'ml' ? 'താരബലം' : 'Tarabalam'}</span>
                    <p className="text-xs font-black text-emerald-700 leading-tight break-words">{item.tarabalamMalayalam}</p>
                  </div>
                </div>

                {/* Timing & Lagna */}
                <div className="bg-amber-50/70 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-amber-100/80 space-y-1">
                  <div className="flex items-start gap-2 text-amber-900 font-bold text-xs leading-snug">
                    <Clock size={14} className="text-amber-700 shrink-0 mt-0.5" />
                    <span className="break-words flex-1 min-w-0">
                      {lang === 'ml' ? 'ഉദ്ഘാടന ശുഭ സമയം:' : 'Opening Time Window:'} {item.launchWindow}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 font-medium pl-5 leading-tight break-words">
                    {lang === 'ml' ? 'അനുയോജ്യ ലഗ്നം:' : 'Ideal Lagna:'} {lang === 'ml' ? item.favorableLagnaMalayalam : item.favorableLagna}
                  </p>
                </div>

                {/* Opening Rituals */}
                <div className="text-[11px] text-slate-600 bg-slate-50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-slate-100 flex items-start gap-2">
                  <ShieldCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed break-words flex-1 min-w-0">
                    {lang === 'ml' ? item.openingRitualsMl : item.openingRitualsEn}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
