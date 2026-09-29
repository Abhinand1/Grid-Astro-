import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon, Clock, Calendar, SunMedium, Compass, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getKeralaDayPanchang, KeralaDayPanchang } from '../utils/astronomy';
import { haptic } from '../utils/haptics';

interface DailyPanchangModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'en' | 'ml';
}

export function DailyPanchangModal({ isOpen, onClose, lang = 'ml' }: DailyPanchangModalProps) {
  const panchang: KeralaDayPanchang = React.useMemo(() => getKeralaDayPanchang(), [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="bg-white rounded-3xl shadow-2xl border border-amber-100 max-w-lg w-full overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 p-5 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0">
                <SunMedium className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight leading-tight">
                  {lang === 'ml' ? 'ഇന്നത്തെ നാളും പഞ്ചാംഗവും' : "Today's Nakshatra & Panchangam"}
                </h3>
                <p className="text-[11px] text-amber-100/90 font-medium">
                  {panchang.malayalamDate.formattedMl} • {panchang.malayalamDate.formattedEn}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                haptic.light();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
            {/* Primary Star Cards: Day Star (Aswathi) vs Current Transit (Bharani) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Day Star Card (Udaya Nakshatra) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 relative shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-600" />
                    {lang === 'ml' ? 'ദിവസ നാൾ (ഉദയനക്ഷത്രം)' : 'Day Star (Sunrise)'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                </div>
                <div className="text-2xl font-black text-amber-950 tracking-tight leading-none my-1">
                  {lang === 'ml' ? panchang.dayNakshatra.malayalamName : panchang.dayNakshatra.name}
                </div>
                <p className="text-[11px] font-bold text-amber-900/90">
                  {lang === 'ml' ? `സാധുത: രാവിലെ ${panchang.transitionTimeFormatted} വരെ` : `Valid till ${panchang.transitionTimeFormatted}`}
                </p>
                <p className="text-[10px] text-amber-700 font-medium mt-0.5">
                  {lang === 'ml' ? `സൂര്യോദയത്തിൽ നിന്ന് ${panchang.nazhikaDuration}` : `${panchang.nazhikaValue.toFixed(1)} Nazhika from Sunrise`}
                </p>
                <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center gap-1 text-[10px] font-semibold text-amber-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{lang === 'ml' ? 'കലണ്ടറുകളിൽ നൽകിയിട്ടുള്ള നാൾ' : 'Official Calendar Star of the Day'}</span>
                </div>
              </div>

              {/* Instantaneous / Next Star Card */}
              <div className={`p-4 rounded-2xl border ${panchang.isTransitioned ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-90'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${panchang.isTransitioned ? 'text-indigo-800 bg-indigo-100' : 'text-slate-600 bg-slate-200'}`}>
                    <Moon className="w-3 h-3 text-indigo-500" />
                    {panchang.isTransitioned 
                      ? (lang === 'ml' ? 'ഇപ്പോഴത്തെ തത്സമയം' : 'Current Active Star') 
                      : (lang === 'ml' ? 'അടുത്ത നക്ഷത്രം' : 'Next Star')}
                  </span>
                  {panchang.isTransitioned && (
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                      {lang === 'ml' ? 'തത്സമയം' : 'Active'}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight leading-none my-1">
                  {lang === 'ml' ? panchang.nextNakshatra.malayalamName : panchang.nextNakshatra.name}
                </div>
                <p className="text-[11px] font-bold text-slate-700">
                  {lang === 'ml' ? `${panchang.transitionTimeFormatted} മുതൽ ആരംഭിച്ചു` : `Active from ${panchang.transitionTimeFormatted}`}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {lang === 'ml' ? 'നാളെ രാവിലെ വരെ തുടരും' : 'Continues until tomorrow'}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[10px] font-semibold text-indigo-700">
                  <Compass className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{lang === 'ml' ? 'ഗ്രഹസഞ്ചാരപ്രകാരമുള്ള നിലവിലെ നാൾ' : 'Instantaneous Moon Transit Position'}</span>
                </div>
              </div>
            </div>

            {/* Crucial Explanation Box: Why Calendar shows Ashwathi */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/80">
              <div className="flex items-start gap-2.5">
                <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-amber-950">
                    {lang === 'ml' 
                      ? '💡 കലണ്ടറും ആപ്പിലെ സമയവും തമ്മിലുള്ള വ്യത്യാസം എന്തുകൊണ്ട്?' 
                      : "💡 Why does the calendar show 'Aswathi'?"}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-amber-900 font-medium">
                    {lang === 'ml' ? panchang.explanation.ml : panchang.explanation.en}
                  </p>
                  <p className="text-[10.5px] leading-relaxed text-amber-800/90 font-medium pt-1">
                    {lang === 'ml'
                      ? 'കലണ്ടറുകളിൽ രേഖപ്പെടുത്തിയിട്ടുള്ള "അശ്വതി 6 3/4" എന്നത് സൂര്യോദയത്തിന് ശേഷം 6¾ നാഴിക (രാവിലെ 09:03 വരെ) അശ്വതി നക്ഷത്രമാണെന്നും അതിനുശേഷം ഭരണി ആരംഭിക്കുന്നു എന്നുമാണ് അർത്ഥമാക്കുന്നത്. പിറന്നാൾ, വ്രതം, പൂജകൾ എന്നിവയ്ക്ക് സൂര്യോദയ നക്ഷത്രമായ (ഉദയനാൾ) അശ്വതിയാണ് പ്രാമാണികമായി എടുക്കുന്നത്.'
                      : 'The calendar notation "Aswathi 6 3/4" denotes that Ashwathi prevailed for 6¾ Nazhika (~09:03 AM) after sunrise, after which Bharani begins. For birthday rituals (Pirannal) and religious observances, the Udaya Nakshatra (Ashwathi) is authoritative.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Kerala Panchangam 5 Angas & Timings Grid */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {lang === 'ml' ? 'ഇന്നത്തെ പഞ്ചാംഗാംഗങ്ങൾ' : "Panchangam Details"}
              </h4>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{lang === 'ml' ? 'സൂര്യോദയം (Sunrise)' : 'Sunrise'}</span>
                  <span className="font-extrabold text-slate-900 text-sm">{panchang.sunriseFormatted} IST</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{lang === 'ml' ? 'സൂര്യാസ്തമയം (Sunset)' : 'Sunset'}</span>
                  <span className="font-extrabold text-slate-900 text-sm">{panchang.sunsetFormatted} IST</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{lang === 'ml' ? 'തിഥി (Tithi)' : 'Tithi'}</span>
                  <span className="font-extrabold text-slate-900 text-sm truncate block">
                    {lang === 'ml' ? panchang.tithi.nameMl : panchang.tithi.nameEn}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{lang === 'ml' ? 'കൊല്ലവർഷ തീയതി' : 'Malayalam Date'}</span>
                  <span className="font-extrabold text-slate-900 text-sm truncate block">
                    {lang === 'ml' ? `${panchang.malayalamDate.monthMalayalam} ${panchang.malayalamDate.day}` : `${panchang.malayalamDate.month} ${panchang.malayalamDate.day}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
            <button
              onClick={() => {
                haptic.light();
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              {lang === 'ml' ? 'ശരി (Done)' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
