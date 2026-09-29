import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Calendar, Heart, Star, ArrowLeft, Volume2, Bookmark } from 'lucide-react';
import { NAKSHATRAS } from '../utils/astroData';
import { calculateBabyNaming, BabyNamingResult } from '../utils/babyNaming';
import { CustomSelect } from './CustomSelect';
import { CustomDatePicker } from './CustomDatePicker';
import { useLanguage } from '../contexts/LanguageContext';
import { haptic } from '../utils/haptics';

interface Props {
  onBack: () => void;
}

export const BabyNamingView: React.FC<Props> = ({ onBack }) => {
  const { lang, t } = useLanguage();
  const [starId, setStarId] = useState<number>(4); // Rohini
  const [pada, setPada] = useState<number>(1);
  const [gender, setGender] = useState<'boy' | 'girl' | 'all'>('all');
  const [dob, setDob] = useState<string>('2026-09-01');
  const [result, setResult] = useState<BabyNamingResult>(() =>
    calculateBabyNaming({ starId: 4, pada: 1, gender: 'all', dob: '2026-09-01' })
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.medium();
    const res = calculateBabyNaming({ starId, pada, gender, dob });
    setResult(res);
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
            {lang === 'ml' ? 'നാമകരണവും നാമാക്ഷരങ്ങളും' : 'Baby Naming & Star Sounds'}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug">
            {lang === 'ml' 
              ? 'നക്ഷത്ര പാദാക്ഷരങ്ങളും ഇരുപത്തെട്ട് ചടങ്ങിനുള്ള ശുഭ തീയതികളും' 
              : 'Sacred Pada Syllables, Names & Namakarana Muhurtham'}
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 sm:pb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <Heart size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-800 text-sm leading-tight">
              {lang === 'ml' ? 'കുഞ്ഞിന്റെ നക്ഷത്ര വിവരങ്ങൾ' : 'Baby Birth Star Details'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
              {lang === 'ml' ? 'നക്ഷത്രവും ജനനത്തീയതിയും നൽകുക' : 'Provide nakshatra and date of birth'}
            </p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
              {lang === 'ml' ? 'കുഞ്ഞിന്റെ ലിംഗം' : 'Baby Gender'}
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { key: 'boy', en: 'Boy', ml: 'ആൺകുട്ടി' },
                { key: 'girl', en: 'Girl', ml: 'പെൺകുട്ടി' },
                { key: 'all', en: 'Both', ml: 'എല്ലാം' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => { haptic.light(); setGender(item.key as any); }}
                  className={`min-h-[44px] py-2 px-1 sm:px-2 rounded-xl sm:rounded-2xl border text-[11px] sm:text-xs font-bold transition-all text-center flex items-center justify-center active:scale-98 ${
                    gender === item.key
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{lang === 'ml' ? item.ml : item.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Star & Pada */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
                {lang === 'ml' ? 'നക്ഷത്രം' : 'Nakshatra'}
              </label>
              <CustomSelect
                value={starId}
                onChange={(val) => setStarId(Number(val))}
                options={NAKSHATRAS.map(star => ({
                  value: star.id,
                  label: lang === 'ml' ? `${star.malayalamName} (${star.name})` : `${star.name} (${star.malayalamName})`
                }))}
                placeholder="Select Star"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
                {lang === 'ml' ? 'പാദം' : 'Pada'}
              </label>
              <CustomSelect
                value={pada}
                onChange={(val) => setPada(Number(val))}
                options={[1, 2, 3, 4].map(p => ({
                  value: p,
                  label: `${p}-ാം പാദം`
                }))}
                placeholder="Pada"
              />
            </div>
          </div>

          {/* DOB */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
              {lang === 'ml' ? 'ജനനത്തീയതി (ഇരുപത്തെട്ട് കണക്കാക്കാൻ)' : 'Date of Birth (For 28th Day Irupathettu)'}
            </label>
            <CustomDatePicker
              value={dob}
              onChange={(d) => setDob(d)}
              maxDate={null}
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] py-3.5 sm:py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-600/20 active:scale-98 transition-transform flex items-center justify-center gap-2 text-sm"
          >
            <BookOpen size={17} className="shrink-0" />
            <span className="truncate">{lang === 'ml' ? 'നാമാക്ഷരങ്ങളും പേരുകളും കാണുക' : 'Find Auspicious Sounds & Names'}</span>
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-4 sm:space-y-6">
        {/* Sacred Syllables Banner */}
        <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700 rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 text-white shadow-xl space-y-3 sm:space-y-4">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 block">
                {lang === 'ml' ? 'നക്ഷത്ര പാദാക്ഷരങ്ങൾ' : 'Sacred Pada Sounds'}
              </span>
              <h3 className="text-lg sm:text-xl font-black mt-0.5 leading-tight">
                {lang === 'ml' ? result.nakshatraMalayalam : result.nakshatra} ({result.pada}-ാം പാദം)
              </h3>
            </div>
            <Volume2 size={22} className="text-white/80 shrink-0 mt-0.5" />
          </div>

          <p className="text-xs text-white/80 leading-relaxed">
            {lang === 'ml' 
              ? 'ഈ നക്ഷത്രത്തിന്റെ 4 പാദങ്ങൾക്കും നിശ്ചയിക്കപ്പെട്ടിട്ടുള്ള പരമ്പരാഗത അക്ഷരങ്ങൾ താഴെ നൽകുന്നു. കുഞ്ഞിന്റെ പേര് ഈ അക്ഷരങ്ങളിൽ തുടങ്ങുന്നത് ശുഭകരമാണ്:' 
              : 'Traditional seed syllables for the 4 quarters of this nakshatra. Names beginning with these syllables attract auspicious vibrations:'}
          </p>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-1">
            {result.syllables.map((syl, i) => (
              <div 
                key={i} 
                className={`rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center border backdrop-blur-md ${
                  (i + 1) === result.pada
                    ? 'bg-white text-rose-900 border-white font-black shadow-lg scale-105'
                    : 'bg-white/10 text-white border-white/20 font-bold'
                }`}
              >
                <span className="text-[8px] sm:text-[9px] uppercase block opacity-70 mb-0.5 truncate">{i + 1}-ാം പാദം</span>
                <span className="text-sm sm:text-base font-extrabold">{syl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Names */}
        <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Bookmark size={16} className="text-rose-600 shrink-0" />
              <span>{lang === 'ml' ? 'നിർദ്ദേശിക്കപ്പെട്ട പേരുകൾ' : 'Auspicious Vedic Names'}</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold shrink-0">{result.suggestedNames.length} {lang === 'ml' ? 'പേരുകൾ' : 'Names'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {result.suggestedNames.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100/80 space-y-1">
                <div className="flex justify-between items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 shrink-0">
                    {item.gender}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed break-words">{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Traditional Milestones (Irupathettu / 28th Day) */}
        {result.namakaranaDates.length > 0 && (
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-3 sm:space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-rose-600 shrink-0" />
              <span>{lang === 'ml' ? 'നാമകരണ ശുഭ തീയതികൾ (ഇരുപത്തെട്ട്)' : 'Namakarana Ceremony Dates'}</span>
            </h3>

            <div className="space-y-2.5 sm:space-y-3">
              {result.namakaranaDates.map((item, i) => (
                <div key={i} className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                  item.dayNumber === 28 
                    ? 'bg-rose-50/70 border-rose-200' 
                    : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <h4 className={`text-xs font-black truncate ${item.dayNumber === 28 ? 'text-rose-900' : 'text-slate-800'}`}>
                      {lang === 'ml' ? item.titleMalayalam : item.title}
                    </h4>
                    <span className="text-xs font-bold text-slate-700 shrink-0">{item.dateFormatted}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed break-words">
                    {lang === 'ml' ? item.descriptionMalayalam : item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
