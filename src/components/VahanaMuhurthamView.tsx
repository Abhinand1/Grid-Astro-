import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Car, Clock, Calendar, ShieldCheck, ArrowLeft, Palette } from 'lucide-react';
import { NAKSHATRAS } from '../utils/astroData';
import { calculateVahanaMuhurthams, VahanaMuhurthamDate } from '../utils/vahanaMuhurtham';
import { CustomSelect } from './CustomSelect';
import { useLanguage } from '../contexts/LanguageContext';
import { haptic } from '../utils/haptics';

interface Props {
  onBack: () => void;
}

export const VahanaMuhurthamView: React.FC<Props> = ({ onBack }) => {
  const { lang, t } = useLanguage();
  const [buyerStarId, setBuyerStarId] = useState<number>(1); // Default Aswathi
  const [vehicleType, setVehicleType] = useState<'two_wheeler' | 'four_wheeler' | 'commercial'>('four_wheeler');
  const [daysAhead, setDaysAhead] = useState<number>(60);
  const [results, setResults] = useState<VahanaMuhurthamDate[]>(() =>
    calculateVahanaMuhurthams(1, 'four_wheeler', 60)
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.medium();
    const dates = calculateVahanaMuhurthams(buyerStarId, vehicleType, daysAhead);
    setResults(dates);
  };

  const selectedStar = NAKSHATRAS.find(s => s.id === buyerStarId);

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
            {lang === 'ml' ? 'വാഹന മുഹൂർത്തം' : 'Vehicle Purchase Muhurtham'}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug">
            {lang === 'ml' 
              ? 'വാഹനം വാങ്ങാനും ഡെലിവറി എടുക്കാനുമുള്ള ശുഭദിനങ്ങൾ' 
              : 'Auspicious Dates for Vehicle Purchase & Delivery'}
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 sm:pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center shrink-0">
            <Car size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-800 text-sm leading-tight">
              {lang === 'ml' ? 'വാഹനം വാങ്ങുന്നയാളുടെ വിവരങ്ങൾ' : 'Buyer Details'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
              {lang === 'ml' ? 'നക്ഷത്രവും വാഹനത്തിന്റെ തരവും തിരഞ്ഞെടുക്കുക' : 'Select your star and vehicle category'}
            </p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          {/* Star Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
              {lang === 'ml' ? 'വാങ്ങുന്നയാളുടെ നക്ഷത്രം' : 'Buyer Nakshatra'}
            </label>
            <CustomSelect
              value={buyerStarId}
              onChange={(val) => setBuyerStarId(Number(val))}
              options={NAKSHATRAS.map(star => ({
                value: star.id,
                label: lang === 'ml' ? `${star.malayalamName} (${star.name})` : `${star.name} (${star.malayalamName})`
              }))}
              placeholder={lang === 'ml' ? 'നക്ഷത്രം തിരഞ്ഞെടുക്കുക' : 'Select Nakshatra'}
            />
          </div>

          {/* Vehicle Type */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
              {lang === 'ml' ? 'വാഹന വിഭാഗം' : 'Vehicle Category'}
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { type: 'two_wheeler', labelEn: '2-Wheeler', labelMl: 'ഇരുചക്രം' },
                { type: 'four_wheeler', labelEn: 'Car / SUV', labelMl: 'കാർ / SUV' },
                { type: 'commercial', labelEn: 'Commercial', labelMl: 'വാണിജ്യ വാഹനം' }
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => { haptic.light(); setVehicleType(item.type as any); }}
                  className={`py-2 px-1 sm:px-2 rounded-xl sm:rounded-2xl border text-[10px] sm:text-xs font-bold transition-all text-center leading-tight active:scale-98 flex items-center justify-center min-h-[44px] sm:min-h-[46px] ${
                    vehicleType === item.type
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="break-words">{lang === 'ml' ? item.labelMl : item.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Days Ahead */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
              {lang === 'ml' ? 'കാലയളവ്' : 'Search Window'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[30, 60, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => { haptic.light(); setDaysAhead(d); }}
                  className={`min-h-[44px] py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-98 flex items-center justify-center ${
                    daysAhead === d
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {d} {lang === 'ml' ? 'ദിവസം' : 'Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full min-h-[48px] py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-700/20 active:scale-98 transition-transform flex items-center justify-center gap-2 text-sm mt-1"
          >
            <Car size={17} className="shrink-0" />
            <span className="truncate">{lang === 'ml' ? 'ശുഭ മുഹൂർത്തങ്ങൾ കാണുക' : 'Find Auspicious Dates'}</span>
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 gap-2 flex-wrap">
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2 flex-wrap">
            <span>{lang === 'ml' ? 'അനുയോജ്യമായ വാഹന മുഹൂർത്തങ്ങൾ' : 'Favorable Vehicle Purchase Dates'}</span>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full shrink-0">
              {results.length} {lang === 'ml' ? 'ദിനങ്ങൾ' : 'Dates'}
            </span>
          </h3>
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-center border border-slate-100">
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              {lang === 'ml' 
                ? 'അടുത്ത ദിവസങ്ങളിൽ അനുകൂലമായ മുഹൂർത്തങ്ങൾ ലഭ്യമല്ല. കൂടുതൽ ദിവസങ്ങൾ തിരഞ്ഞെടുക്കുക.' 
                : 'No favorable dates in this period. Please widen the search window.'}
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
                className="bg-white rounded-[22px] sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-3 sm:space-y-3.5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-base sm:text-xl font-black text-slate-900 block leading-tight">
                      {item.dateFormatted}
                    </span>
                    <p className="text-blue-700 font-bold text-xs sm:text-sm mt-1 flex items-center gap-1.5 flex-wrap leading-tight">
                      <Calendar size={13} className="shrink-0" />
                      <span>{item.weekdayMalayalam}</span>
                      <span className="text-slate-300">•</span>
                      <span>{item.starMalayalam}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] font-black uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {lang === 'ml' ? item.qualityMalayalam : item.quality}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 whitespace-nowrap">
                      {lang === 'ml' ? 'ബലം:' : 'Score:'} <b className="text-slate-800">{item.score}%</b>
                    </span>
                  </div>
                </div>

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

                {/* Timing */}
                <div className="bg-blue-50/70 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-blue-100 text-xs font-bold text-blue-900 flex items-start gap-2">
                  <Clock size={15} className="text-blue-700 shrink-0 mt-0.5" />
                  <span className="break-words leading-snug flex-1 min-w-0">
                    {lang === 'ml' ? 'ഡെലിവറി ശുഭ സമയം:' : 'Delivery Time:'} {item.auspiciousTimeWindow}
                  </span>
                </div>

                {/* Color Recommendations */}
                <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <Palette size={15} className="text-slate-500 shrink-0 mt-0.5" />
                  <div className="text-xs leading-snug break-words flex-1 min-w-0">
                    <span className="font-bold text-slate-500 mr-1.5">
                      {lang === 'ml' ? 'അനുകൂല നിറങ്ങൾ:' : 'Lucky Colors:'}
                    </span>
                    <span className="font-bold text-slate-800">
                      {lang === 'ml' ? item.recommendedVehicleColorsMalayalam.join(', ') : item.recommendedVehicleColors.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Pooja Advice */}
                <div className="text-[11px] text-slate-600 bg-slate-50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-slate-100 flex items-start gap-2">
                  <ShieldCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed break-words flex-1 min-w-0">
                    {lang === 'ml' ? item.poojaAdviceMalayalam : item.poojaAdvice}
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
