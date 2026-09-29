import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NAKSHATRAS } from '../utils/astroData';
import { calculateLitigationStrategy, LitigationStrategyResult } from '../utils/keralaAstrologySuite';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomSelect } from './CustomSelect';
import { haptic } from '../utils/haptics';

interface LitigationStrategyViewProps {
  onBack: () => void;
}

export const LitigationStrategyView: React.FC<LitigationStrategyViewProps> = ({ onBack }) => {
  const { lang } = useLanguage();
  const [selectedStarId, setSelectedStarId] = useState<number>(1);
  const [strategy, setStrategy] = useState<LitigationStrategyResult>(() => calculateLitigationStrategy(1));

  const handleStarChange = (starId: number) => {
    setSelectedStarId(starId);
    haptic.light();
    setStrategy(calculateLitigationStrategy(starId));
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

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-500/10 text-rose-800 border border-rose-500/20">
          <span className="material-symbols-outlined text-[14px]">gavel</span>
          {lang === 'ml' ? 'ശത്രുജയ തന്ത്രം' : 'Litigative Strategy'}
        </span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 shadow-xl border border-white/10 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-rose-300">
            {lang === 'ml' ? 'കോടതി വ്യവഹാരങ്ങളും തർക്ക പരിഹാരവും' : 'Litigative & Dispute Strategy'}
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {lang === 'ml' ? 'ശത്രുവിജയവും കേസ് വിജയ സാധ്യതകളും' : 'Court Case Outcomes & Dispute Strategy'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {lang === 'ml'
              ? 'ആറാം ഭാവമായ ശത്രുസ്ഥാനവും ചൊവ്വ, ഗുളികൻ എന്നിവരുടെ ബലവും വിശകലനം ചെയ്ത് കോടതി വ്യവഹാരങ്ങളിലെ വിജയസാധ്യതകളും ഹർജി സമർപ്പിക്കാനുള്ള ഉത്തമ ദിനങ്ങളും അറിയുക.'
              : 'Assess court case outcomes, dispute settlement timing, and select favorable dates to file petitions or pursue arbitration based on 6th & 3rd bhava strength.'}
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
        {/* Probability Meters */}
        <motion.div
          key={selectedStarId}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-rose-100"
        >
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            {lang === 'ml' ? 'വ്യവഹാര സാധ്യതകൾ' : 'Litigation & Settlement Probability'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">{lang === 'ml' ? 'കോടതി കേസ് വിജയം' : 'Courtroom Victory'}</span>
                <span className="text-sm font-extrabold text-rose-600">{strategy.victoryProbabilityScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-rose-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${strategy.victoryProbabilityScore}%` }} />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">{lang === 'ml' ? 'ഒത്തുതീർപ്പ് സാധ്യത' : 'Arbitration / Settlement'}</span>
                <span className="text-sm font-extrabold text-blue-600">{strategy.settlementProbabilityScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${strategy.settlementProbabilityScore}%` }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Advocacy Strengths */}
        <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-rose-600 text-xl">verified_user</span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {lang === 'ml' ? 'നിയമപരമായ മേൽക്കൈ' : 'Strategic Advocacy Strengths'}
            </h3>
          </div>
          <div className="space-y-2.5">
            {(lang === 'ml' ? strategy.advocacyStrengthsMl : strategy.advocacyStrengthsEn).map((str, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="material-symbols-outlined text-rose-500 text-lg shrink-0 mt-0.5">check_circle</span>
                <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filing Days & Resolution Tactics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-slate-100 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">event_available</span>
              {lang === 'ml' ? 'ഹർജി സമർപ്പിക്കാൻ ഉത്തമ ദിനങ്ങൾ' : 'Optimal Filing Windows'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'ml' ? strategy.favorableFilingDaysMl : strategy.favorableFilingDaysEn}
            </p>
          </div>

          <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-slate-100 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-lg">handshake</span>
              {lang === 'ml' ? 'തർക്ക പരിഹാര മാർഗ്ഗം' : 'Conflict Resolution Tactics'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'ml' ? strategy.conflictResolutionTacticsMl : strategy.conflictResolutionTacticsEn}
            </p>
          </div>
        </div>

        {/* Protective Vazhipadu */}
        <div className="bg-rose-50/70 border border-rose-200/60 rounded-[26px] p-5 sm:p-6 flex items-start gap-3.5">
          <span className="material-symbols-outlined text-rose-700 text-2xl shrink-0 mt-0.5">shield</span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-rose-950 mb-1">
              {lang === 'ml' ? 'ശത്രുദോഷ ശമന വഴിപാടുകൾ' : 'Protective Temple Vazhipadu'}
            </h4>
            <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
              {lang === 'ml' ? strategy.protectiveVazhipaduMl : strategy.protectiveVazhipaduEn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
