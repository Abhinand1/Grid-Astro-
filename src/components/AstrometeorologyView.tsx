import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NAKSHATRAS } from '../utils/astroData';
import {
  calculateAstrometeorology,
  AstrometeorologyResult,
  calculateAstrocartography,
  AstrocartographyResult
} from '../utils/keralaAstrologySuite';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomSelect } from './CustomSelect';
import { haptic } from '../utils/haptics';

interface AstrometeorologyViewProps {
  onBack: () => void;
}

export const AstrometeorologyView: React.FC<AstrometeorologyViewProps> = ({ onBack }) => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'nhattuvela' | 'relocation'>('nhattuvela');
  const [selectedStarId, setSelectedStarId] = useState<number>(1);
  const [weatherData] = useState<AstrometeorologyResult>(() => calculateAstrometeorology());
  const [cartoData, setCartoData] = useState<AstrocartographyResult>(() => calculateAstrocartography(1));

  const handleStarChange = (starId: number) => {
    setSelectedStarId(starId);
    haptic.light();
    setCartoData(calculateAstrocartography(starId));
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

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-teal-500/10 text-teal-800 border border-teal-500/20">
          <span className="material-symbols-outlined text-[14px]">cloudy_snowing</span>
          {lang === 'ml' ? 'ഞാറ്റുവേല & ദിഗ്ബലം' : 'Nhattuvela & Dig-Bala'}
        </span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 shadow-xl border border-white/10 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-teal-300">
            {lang === 'ml' ? 'മഴ പ്രവചനവും വാസ്തു ദിഗ്ബലവും' : 'Astrometeorology & Relocation'}
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {lang === 'ml' ? 'ഞാറ്റുവേല മഴഫലവും സ്ഥാനമാറ്റ ഭാഗ്യവും' : 'Kerala Nhattuvela, Weather & Relocation'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {lang === 'ml'
              ? 'സൂര്യന്റെ നക്ഷത്ര സഞ്ചാരത്തെ ആധാരമാക്കിയുള്ള പരമ്പരാഗത ഞാറ്റുവേല മഴക്കണക്കുകളും, തൊഴിൽ-സാമ്പത്തിക വളർച്ചയ്ക്ക് അനുകൂലമായ ഭൂമിശാസ്ത്ര ദിശകളും അറിയുക.'
              : 'Forecast monsoon patterns and agricultural cycles via Kerala\'s 27 Nhattuvelas, and identify supportive relocation cities using planetary Dig-Bala.'}
          </p>
        </div>
      </div>

      {/* Dual Tab Control */}
      <div className="flex bg-slate-100/80 p-1.5 rounded-2xl mb-6 border border-slate-200/60">
        <button
          onClick={() => {
            haptic.light();
            setActiveTab('nhattuvela');
          }}
          className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all min-h-[44px] flex items-center justify-center gap-2 ${
            activeTab === 'nhattuvela' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">water_drop</span>
          <span>{lang === 'ml' ? 'ഞാറ്റുവേല മഴഫലം (Weather)' : 'Nhattuvela & Rain Forecast'}</span>
        </button>
        <button
          onClick={() => {
            haptic.light();
            setActiveTab('relocation');
          }}
          className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all min-h-[44px] flex items-center justify-center gap-2 ${
            activeTab === 'relocation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">explore</span>
          <span>{lang === 'ml' ? 'സ്ഥാനമാറ്റ ദിഗ്ബലം (Relocation)' : 'Astrocartography & Relocation'}</span>
        </button>
      </div>

      {/* Tab 1: Astrometeorology / Nhattuvela */}
      {activeTab === 'nhattuvela' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-teal-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-2.5 py-1 rounded-full">
                  {lang === 'ml' ? 'നിലവിലെ സൗര ഞാറ്റുവേല' : 'Current Active Solar Cycle'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                  {lang === 'ml' ? weatherData.currentNhattuvelaMl : weatherData.currentNhattuvelaEn}
                </h3>
              </div>
              <div className="bg-teal-50 px-4 py-2.5 rounded-2xl border border-teal-200/50 text-right shrink-0">
                <span className="text-[10px] text-slate-500 block">{lang === 'ml' ? 'മഴ സാധ്യത' : 'Rain Probability'}</span>
                <span className="text-lg font-extrabold text-teal-900">{weatherData.rainProbabilityScore}%</span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-teal-50/50 border border-teal-100/60">
              <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block mb-1">
                {lang === 'ml' ? 'പരമ്പരാഗത ചൊല്ല്' : 'Traditional Kerala Folklore Lore'}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-teal-950 italic">
                {lang === 'ml' ? weatherData.traditionalSayingMl : weatherData.traditionalSayingEn}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                {lang === 'ml' ? 'കാലാവസ്ഥാ നിരീക്ഷണം' : 'Observed Weather State'}
              </span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'ml' ? weatherData.rainfallStatusMl : weatherData.rainfallStatusEn}
              </p>
            </div>
          </div>

          {/* Agricultural Wisdom Card */}
          <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-slate-100 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">agriculture</span>
              {lang === 'ml' ? 'കാർഷിക നിർദ്ദേശങ്ങൾ' : 'Agricultural Planting Guidance'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'ml' ? weatherData.agriculturalAdviceMl : weatherData.agriculturalAdviceEn}
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 italic">
                {lang === 'ml' ? weatherData.varshaPhalamSummaryMl : weatherData.varshaPhalamSummaryEn}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Astrocartography / Relocation */}
      {activeTab === 'relocation' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Star Selector */}
          <div className="bg-white rounded-[24px] p-4 sm:p-6 shadow-sm border border-slate-100">
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

          {/* Directions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-[26px] p-5 shadow-xs border border-slate-100 space-y-2">
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">
                {lang === 'ml' ? 'തൊഴിൽ & അധികാരം (South/Dig-Bala)' : 'Career Expansion Direction'}
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'ml' ? cartoData.careerDirectionMl : cartoData.careerDirectionEn}
              </h4>
            </div>

            <div className="bg-white rounded-[26px] p-5 shadow-xs border border-slate-100 space-y-2">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
                {lang === 'ml' ? 'ധനസമൃദ്ധി & വ്യാപാരം' : 'Wealth & Business Direction'}
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'ml' ? cartoData.wealthDirectionMl : cartoData.wealthDirectionEn}
              </h4>
            </div>

            <div className="bg-white rounded-[26px] p-5 shadow-xs border border-slate-100 space-y-2">
              <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block">
                {lang === 'ml' ? 'മനഃസമാധാനം & കുടുംബം' : 'Domestic Peace & Well-being'}
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'ml' ? cartoData.peaceDirectionMl : cartoData.peaceDirectionEn}
              </h4>
            </div>

            <div className="bg-rose-50/60 rounded-[26px] p-5 border border-rose-100 space-y-2">
              <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block">
                {lang === 'ml' ? 'വെല്ലുവിളികൾ നിറഞ്ഞ ദിക്ക്' : 'Challenging Direction'}
              </span>
              <h4 className="text-sm font-bold text-rose-800">
                {lang === 'ml' ? cartoData.challengingDirectionMl : cartoData.challengingDirectionEn}
              </h4>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-[24px] p-4 sm:p-5 flex items-start gap-3">
            <span className="material-symbols-outlined text-slate-600 text-xl shrink-0 mt-0.5">location_on</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {lang === 'ml' ? cartoData.relocationAdviceMl : cartoData.relocationAdviceEn}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
