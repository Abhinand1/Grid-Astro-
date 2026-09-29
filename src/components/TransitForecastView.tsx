import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles, AlertTriangle, ShieldCheck, ArrowLeft, ArrowUpRight, TrendingUp, Heart, Briefcase, Gem, Activity } from 'lucide-react';
import { calculateTransitForecast, TransitReport } from '../utils/transitForecast';
import { RASIS, NAKSHATRAS } from '../utils/astroData';
import { CustomSelect } from './CustomSelect';
import { useLanguage } from '../contexts/LanguageContext';
import { haptic } from '../utils/haptics';

interface Props {
  onBack: () => void;
}

export const TransitForecastView: React.FC<Props> = ({ onBack }) => {
  const { lang, t } = useLanguage();

  const [moonRasiIdx, setMoonRasiIdx] = useState<number>(0); // Aries (Medam)
  const [nakshatraId, setNakshatraId] = useState<number>(1); // Aswathi
  const [report, setReport] = useState<TransitReport>(() =>
    calculateTransitForecast({ moonRasiIndex: 0, nakshatraId: 1 })
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.medium();
    const res = calculateTransitForecast({
      moonRasiIndex: moonRasiIdx,
      nakshatraId
    });
    setReport(res);
  };

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
            {lang === 'ml' ? 'ഗോചാര ഫലവും ഏഴരശ്ശനിമറ്റവും' : 'Planetary Transits & Ezharashani'}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug">
            {lang === 'ml' 
              ? 'ശനി, വ്യാഴം, രാഹു-കേതു എന്നിവയുടെ സമകാലിക ഗോചാര ഫലങ്ങൾ' 
              : 'Real-time Saturn, Jupiter & Rahu-Ketu Astrological Impact'}
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 sm:pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center shrink-0">
            <Compass size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-800 text-sm leading-tight">
              {lang === 'ml' ? 'നിങ്ങളുടെ ജന്മ നക്ഷത്രവും രാശിയും' : 'Your Moon Sign & Star'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
              {lang === 'ml' ? 'കൂറും ജന്മനക്ഷത്രവും തിരഞ്ഞെടുക്കുക' : 'Select your Janma Rasi and Nakshatra'}
            </p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* Moon Rasi */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
                {lang === 'ml' ? 'ചന്ദ്ര രാശി (ജന്മക്കൂർ)' : 'Moon Sign (Janma Rasi)'}
              </label>
              <CustomSelect
                value={moonRasiIdx}
                onChange={(val) => setMoonRasiIdx(Number(val))}
                options={RASIS.map((r, i) => ({
                  value: i,
                  label: lang === 'ml' ? `${r.malayalamName || r.name} (${r.name})` : `${r.name} (${r.malayalamName || r.name})`
                }))}
              />
            </div>

            {/* Nakshatra */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
                {lang === 'ml' ? 'ജന്മ നക്ഷത്രം' : 'Birth Star (Nakshatra)'}
              </label>
              <CustomSelect
                value={nakshatraId}
                onChange={(val) => setNakshatraId(Number(val))}
                options={NAKSHATRAS.map(star => ({
                  value: star.id,
                  label: lang === 'ml' ? `${star.malayalamName} (${star.name})` : `${star.name} (${star.malayalamName})`
                }))}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-700/20 active:scale-98 transition-transform flex items-center justify-center gap-2 text-sm mt-1"
          >
            <Sparkles size={17} className="shrink-0" />
            <span>{lang === 'ml' ? 'ഗോചാര ഫലം വിശകലനം ചെയ്യുക' : 'Calculate Transit Forecast'}</span>
          </button>
        </form>
      </div>

      {/* Report View */}
      {report && (
        <div className="space-y-4 sm:space-y-6">
          {/* Main Hero Transit Banner */}
          <div className="bg-gradient-to-br from-indigo-700 via-purple-800 to-slate-900 rounded-[24px] sm:rounded-[36px] p-5 sm:p-7 text-white shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 block">
                  {lang === 'ml' ? 'ഗോചാര നില' : 'Cosmic Transit Summary'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-0.5 leading-tight">
                  {lang === 'ml' ? report.moonRasiMalayalam : report.moonRasiName} ({lang === 'ml' ? report.nakshatraMalayalam : report.nakshatraName})
                </h2>
                <p className="text-xs text-white/80 mt-1 font-medium">
                  {lang === 'ml' ? report.overallVerdictMl : report.overallVerdictEn}
                </p>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="text-3xl sm:text-4xl font-black">{report.overallScore}%</span>
                <span className="text-[9px] uppercase tracking-wider text-white/80 font-bold">
                  {lang === 'ml' ? 'ശുഭ സ്കോർ' : 'Support Score'}
                </span>
              </div>
            </div>

            {/* Quick Planetary Status Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/70 block">
                    {lang === 'ml' ? 'ശനി സ്ഥിതി' : 'Saturn (Shani)'}
                  </span>
                  <p className="text-xs font-extrabold mt-0.5">
                    {lang === 'ml' ? report.saturn.sadeSatiTitleMl : report.saturn.sadeSatiTitleEn}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/20">
                  {report.saturn.houseFromMoon}-ാം ഭാവം
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/70 block">
                    {lang === 'ml' ? 'വ്യാഴം (ഗുരു)' : 'Jupiter (Guru)'}
                  </span>
                  <p className="text-xs font-extrabold mt-0.5">
                    {lang === 'ml' ? report.jupiter.statusMl : report.jupiter.statusEn}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  report.jupiter.hasGuruBala ? 'bg-emerald-400 text-emerald-950 font-black' : 'bg-white/20'
                }`}>
                  {report.jupiter.hasGuruBala ? (lang === 'ml' ? 'ഗുരുബലം' : 'Guru Bala') : `${report.jupiter.houseFromMoon}-ൽ`}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Saturn Impact Card */}
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-indigo-600 shrink-0" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                {lang === 'ml' ? 'ശനി സഞ്ചാരവും ഏഴരശ്ശനി സ്വാധീനവും' : 'Saturn Transit & Ezharashani Analysis'}
              </h3>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs sm:text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100 break-words">
              {lang === 'ml' ? report.saturn.impactDescriptionMl : report.saturn.impactDescriptionEn}
            </p>
          </div>

          {/* Detailed Jupiter & Rahu/Ketu Card */}
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600 shrink-0" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                {lang === 'ml' ? 'വ്യാഴവും രാഹു-കേതു സഞ്ചാരവും' : 'Jupiter & Rahu-Ketu Transit Effects'}
              </h3>
            </div>
            <div className="space-y-2.5">
              <p className="text-slate-700 leading-relaxed text-xs sm:text-sm bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/70 break-words">
                {lang === 'ml' ? report.jupiter.impactDescriptionMl : report.jupiter.impactDescriptionEn}
              </p>
              <p className="text-slate-700 leading-relaxed text-xs sm:text-sm bg-slate-50 p-3.5 rounded-2xl border border-slate-100 break-words">
                {lang === 'ml' ? report.rahuKetu.impactDescriptionMl : report.rahuKetu.impactDescriptionEn}
              </p>
            </div>
          </div>

          {/* 4-Domain Forecast Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Briefcase size={15} className="shrink-0" />
                <span>{lang === 'ml' ? 'തൊഴിൽ & കരിയർ' : 'Career & Business'}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed break-words">
                {lang === 'ml' ? report.predictions.career.ml : report.predictions.career.en}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <Gem size={15} className="shrink-0" />
                <span>{lang === 'ml' ? 'ധനം & നിക്ഷേപം' : 'Wealth & Finance'}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed break-words">
                {lang === 'ml' ? report.predictions.wealth.ml : report.predictions.wealth.en}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                <Activity size={15} className="shrink-0" />
                <span>{lang === 'ml' ? 'ആരോഗ്യം & ഉന്മേഷം' : 'Health & Vitality'}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed break-words">
                {lang === 'ml' ? report.predictions.health.ml : report.predictions.health.en}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                <Heart size={15} className="shrink-0" />
                <span>{lang === 'ml' ? 'കുടുംബം & ദാമ്പത്യം' : 'Family & Harmony'}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed break-words">
                {lang === 'ml' ? report.predictions.relationships.ml : report.predictions.relationships.en}
              </p>
            </div>
          </div>

          {/* Prescribed Remedies */}
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                {lang === 'ml' ? 'നിർദ്ദേശിക്കപ്പെട്ട ശാന്തി കർമ്മങ്ങൾ' : 'Prescribed Transit Shanti Remedies'}
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
              {(lang === 'ml' ? report.remedies.ml : report.remedies.en).map((rem, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span className="break-words flex-1 min-w-0">{rem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
