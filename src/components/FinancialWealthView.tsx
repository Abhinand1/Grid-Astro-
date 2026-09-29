import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NAKSHATRAS } from '../utils/astroData';
import { calculateFinancialForecast, FinancialForecastResult } from '../utils/keralaAstrologySuite';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomSelect } from './CustomSelect';
import { haptic } from '../utils/haptics';

interface FinancialWealthViewProps {
  onBack: () => void;
}

export const FinancialWealthView: React.FC<FinancialWealthViewProps> = ({ onBack }) => {
  const { lang } = useLanguage();
  const [selectedStarId, setSelectedStarId] = useState<number>(1);
  const [forecast, setForecast] = useState<FinancialForecastResult>(() => calculateFinancialForecast(1));

  const handleStarChange = (starId: number) => {
    setSelectedStarId(starId);
    haptic.light();
    setForecast(calculateFinancialForecast(starId));
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

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-800 border border-amber-500/20">
          <span className="material-symbols-outlined text-[14px]">payments</span>
          {lang === 'ml' ? 'ധന ഭാവ ഫലം' : 'Dhana Bhava Forecast'}
        </span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 shadow-xl border border-white/10 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-300">
            {lang === 'ml' ? 'സമ്പത്തും നിക്ഷേപ ഭാഗ്യവും' : 'Financial & Wealth Forecasting'}
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {lang === 'ml' ? 'ധന യോഗങ്ങളും സമ്പാദ്യ സമൃദ്ധിയും' : 'Prosperity Cycles & Wealth Forecasting'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {lang === 'ml'
              ? 'രണ്ടാം ഭാവം (ധനസ്ഥാനം), പതിനൊന്നാം ഭാവം (ലാഭസ്ഥാനം), ഒമ്പതാം ഭാവം (ഭാഗ്യസ്ഥാനം) എന്നിവ വിശകലനം ചെയ്ത് സാമ്പത്തിക അഭിവൃദ്ധിയും സുരക്ഷിത നിക്ഷേപ മാർഗ്ഗങ്ങളും അറിയുക.'
              : 'Evaluate wealth generation capacity, speculative investment windows, cash flow cycles, and Lakshmi Yoga via 2nd, 9th, and 11th bhavas.'}
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

      {/* Results View */}
      <div className="space-y-5 sm:space-y-6">
        {/* Wealth Meter Card */}
        <motion.div
          key={selectedStarId}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-amber-100"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full">
                {lang === 'ml' ? 'ധന സാധ്യത നിലവാരം' : 'Wealth Potential Index'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                {lang === 'ml' ? forecast.wealthLevelMl : forecast.wealthLevelEn}
              </h2>
            </div>
            <div className="flex items-center gap-3 bg-amber-50/60 px-4 py-2.5 rounded-2xl border border-amber-200/50 shrink-0">
              <span className="material-symbols-outlined text-amber-600 text-2xl">account_balance</span>
              <div>
                <span className="text-[10px] text-slate-500 block">{lang === 'ml' ? 'ധന സ്കോർ' : 'Wealth Score'}</span>
                <span className="text-lg font-extrabold text-amber-700">{forecast.wealthScore} / 100</span>
              </div>
            </div>
          </div>

          {/* Bhavas Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                {lang === 'ml' ? 'രണ്ടാം ഭാവം (ധനസ്ഥാനം)' : '2nd House (Dhana Sthanam)'}
              </span>
              <span className="text-sm font-bold text-slate-800">
                {lang === 'ml' ? forecast.dhanaRasiMl : forecast.dhanaRasiEn}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                {lang === 'ml' ? 'പതിനൊന്നാം ഭാവം (ലാഭസ്ഥാനം)' : '11th House (Labha Sthanam)'}
              </span>
              <span className="text-sm font-bold text-slate-800">
                {lang === 'ml' ? forecast.labhaRasiMl : forecast.labhaRasiEn}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Auspicious Dhana Yogas */}
        <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-amber-600 text-xl">token</span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {lang === 'ml' ? 'ജാതകത്തിലെ ധന യോഗങ്ങൾ' : 'Active Dhana Yogas & Planetary Alignments'}
            </h3>
          </div>
          <div className="space-y-2.5">
            {(lang === 'ml' ? forecast.dhanaYogasMl : forecast.dhanaYogasEn).map((yoga, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100/60">
                <span className="material-symbols-outlined text-amber-600 text-lg shrink-0 mt-0.5">star</span>
                <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{yoga}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Strategy and Timing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-slate-100 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">domain</span>
              {lang === 'ml' ? 'നിക്ഷേപ തന്ത്രങ്ങൾ' : 'Optimal Investment Strategy'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'ml' ? forecast.investmentStrategyMl : forecast.investmentStrategyEn}
            </p>
          </div>

          <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-slate-100 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">autorenew</span>
              {lang === 'ml' ? 'പണമിടപാട് ചക്രങ്ങൾ' : 'Cash Flow & Inflow Cycles'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'ml' ? forecast.cashFlowCycleMl : forecast.cashFlowCycleEn}
            </p>
          </div>
        </div>

        {/* Caution Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-[24px] p-4 sm:p-5 flex items-start gap-3">
          <span className="material-symbols-outlined text-slate-600 text-xl shrink-0 mt-0.5">info</span>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lang === 'ml' ? forecast.warningMl : forecast.warningEn}
          </p>
        </div>
      </div>
    </div>
  );
};
