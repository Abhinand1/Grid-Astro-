import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NAKSHATRAS } from '../utils/astroData';
import {
  calculateMedicalAstrology,
  MedicalAstrologyResult,
  findChikitsaMuhurthams,
  ChikitsaMuhurthamDate
} from '../utils/keralaAstrologySuite';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomSelect } from './CustomSelect';
import { haptic } from '../utils/haptics';

interface MedicalAstrologyViewProps {
  onBack: () => void;
}

export const MedicalAstrologyView: React.FC<MedicalAstrologyViewProps> = ({ onBack }) => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'constitution' | 'surgery'>('constitution');
  const [selectedStarId, setSelectedStarId] = useState<number>(1);
  const [medicalData, setMedicalData] = useState<MedicalAstrologyResult>(() => calculateMedicalAstrology(1));
  const [surgeryDates, setSurgeryDates] = useState<ChikitsaMuhurthamDate[]>(() => findChikitsaMuhurthams(1));

  const handleStarChange = (starId: number) => {
    setSelectedStarId(starId);
    haptic.light();
    setMedicalData(calculateMedicalAstrology(starId));
    setSurgeryDates(findChikitsaMuhurthams(starId));
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

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
          <span className="material-symbols-outlined text-[14px]">local_hospital</span>
          {lang === 'ml' ? 'ആയുർ ജ്യോതിഷം' : 'Ayur-Jyotish'}
        </span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 shadow-xl border border-white/10 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-teal-300">
            {lang === 'ml' ? 'ആരോഗ്യവും ചികിത്സാ മുഹൂർത്തവും' : 'Medical Astrology & Surgical Timing'}
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {lang === 'ml' ? 'ത്രിദോഷ പ്രകൃതിയും ശസ്ത്രക്രിയാ ശുഭവേളയും' : 'Tridosha Constitution & Healing Muhurtha'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {lang === 'ml'
              ? 'ജാതകത്തിലെ ആറാം ഭാവവും നക്ഷത്ര ദോഷങ്ങളും വിശകലനം ചെയ്ത് ശാരീരിക ബലഹീനതകൾ കണ്ടെത്തുക; ചികിത്സകൾക്കും ശസ്ത്രക്രിയകൾക്കും ഉത്തമമായ ശുഭവേളകൾ തിരഞ്ഞെടുക്കുക.'
              : 'Assess constitutional dosha imbalances (Vata/Pitta/Kapha), vulnerable body zones, and elect safe windows for scheduled medical procedures free from Chandra Ashtama.'}
          </p>
        </div>
      </div>

      {/* Star Selector */}
      <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 mb-6">
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

      {/* Dual Tab Control */}
      <div className="flex bg-slate-100/80 p-1.5 rounded-2xl mb-6 border border-slate-200/60">
        <button
          onClick={() => {
            haptic.light();
            setActiveTab('constitution');
          }}
          className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all min-h-[44px] flex items-center justify-center gap-2 ${
            activeTab === 'constitution' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">vital_signs</span>
          <span>{lang === 'ml' ? 'ത്രിദോഷ പ്രകൃതി (Ayur-Jyotish)' : 'Tridosha & Constitutional Health'}</span>
        </button>
        <button
          onClick={() => {
            haptic.light();
            setActiveTab('surgery');
          }}
          className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all min-h-[44px] flex items-center justify-center gap-2 ${
            activeTab === 'surgery' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">medical_services</span>
          <span>{lang === 'ml' ? 'ചികിത്സാ മുഹൂർത്തം (Surgery)' : 'Chikitsa & Surgery Timing'}</span>
        </button>
      </div>

      {/* Tab 1: Constitutional Analysis */}
      {activeTab === 'constitution' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Main Dosha Badge */}
          <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-teal-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-2.5 py-1 rounded-full">
                  {lang === 'ml' ? 'പ്രാഥമിക ശരീര പ്രകൃതം' : 'Primary Ayurvedic Constitution'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                  {lang === 'ml' ? medicalData.primaryDoshaMl : `${medicalData.primaryDosha} Prakrithi`}
                </h3>
              </div>
              <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 text-xs">
                <span className="text-slate-500 block text-[10px]">{lang === 'ml' ? 'ശ്രദ്ധിക്കേണ്ട ശാരീരിക ഭാഗങ്ങൾ' : 'Vulnerable Organ Zone'}</span>
                <span className="font-bold text-slate-800 text-sm">
                  {lang === 'ml' ? medicalData.vulnerableOrganMl : medicalData.vulnerableOrganEn}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-4">
              {lang === 'ml' ? medicalData.constitutionalAnalysisMl : medicalData.constitutionalAnalysisEn}
            </p>
          </div>

          {/* Diet and Ayurvedic Therapies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-slate-100 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-lg">restaurant</span>
                {lang === 'ml' ? 'അനുയോജ്യമായ ഭക്ഷണ ക്രമം' : 'Dietary Harmony Recommendations'}
              </h4>
              <ul className="space-y-2.5">
                {(lang === 'ml' ? medicalData.dietaryRecommendationsMl : medicalData.dietaryRecommendationsEn).map((d, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-slate-100 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600 text-lg">spa</span>
                {lang === 'ml' ? 'ആയുർവേദ പ്രതിവിധികൾ' : 'Ayurvedic Therapies & Herbs'}
              </h4>
              <ul className="space-y-2.5">
                {(lang === 'ml' ? medicalData.ayurvedicRemediesMl : medicalData.ayurvedicRemediesEn).map((r, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2 leading-relaxed">
                    <span className="text-teal-500 font-bold mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Temple Remedy */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-[24px] p-5 sm:p-6 flex items-start gap-3.5">
            <span className="material-symbols-outlined text-emerald-700 text-2xl shrink-0 mt-0.5">temple_hindu</span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950 mb-1">
                {lang === 'ml' ? 'ആയുരാരോഗ്യ ക്ഷേത്ര വഴിപാട്' : 'Sacred Healing Temple Vazhipadu'}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                {lang === 'ml' ? medicalData.templeVazhipaduMl : medicalData.templeVazhipaduEn}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Surgery & Treatment Timing */}
      {activeTab === 'surgery' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-4 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-700 text-xl shrink-0 mt-0.5">warning</span>
            <div>
              <p className="font-bold mb-1">
                {lang === 'ml' ? 'ജ്യോതിഷ മുന്നറിയിപ്പ് (Disclaimer)' : 'Vedic Elective Surgery Rule'}
              </p>
              <p className="text-xs leading-relaxed text-amber-800">
                {lang === 'ml'
                  ? 'അടിയന്തിര ശസ്ത്രക്രിയകൾക്ക് മുഹൂർത്തം ബാധകമല്ല. ആസൂത്രിതമായ ചികിൽസകൾക്ക് ചന്ദ്രാഷ്ടമവും രിക്ത തിഥികളും ഒഴിവാക്കി ശുഭവേളകൾ തിരഞ്ഞെടുക്കുക.'
                  : 'Emergency procedures must never be delayed for astrology. For scheduled elective surgeries, avoid Chandra Ashtama, Riktha tithis, and Vishti karana.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {surgeryDates.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[24px] p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base sm:text-lg text-slate-900">{item.dateFormatted}</span>
                    <span className="text-xs font-bold text-slate-500">({lang === 'ml' ? item.weekdayMl : item.weekdayEn})</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {item.quality}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <span>
                      <strong className="text-slate-800">{lang === 'ml' ? 'നക്ഷത്രം:' : 'Star:'}</strong>{' '}
                      {lang === 'ml' ? item.starNameMl : item.starNameEn}
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-slate-800">{lang === 'ml' ? 'തിഥി:' : 'Tithi:'}</strong>{' '}
                      {lang === 'ml' ? item.tithiNameMl : item.tithiNameEn}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 italic mt-1">
                    {lang === 'ml' ? item.recommendationMl : item.recommendationEn}
                  </p>
                </div>

                <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100 text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block">{lang === 'ml' ? 'ശുഭ മുഹൂർത്ത സമയം' : 'Auspicious Window'}</span>
                  <span className="text-xs font-bold text-slate-800">{item.muhurthaWindow}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
