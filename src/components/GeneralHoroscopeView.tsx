import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Sparkles, Calendar, Clock, MapPin, Compass, Briefcase, Heart, Shield, Activity, Gem, ArrowLeft, ChevronDown } from 'lucide-react';
import { NAKSHATRAS, RASIS } from '../utils/astroData';
import { generateGeneralHoroscope, HoroscopeReading } from '../utils/generalHoroscope';
import { CustomSelect } from './CustomSelect';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomTimePicker } from './CustomTimePicker';
import { useLanguage } from '../contexts/LanguageContext';
import { haptic } from '../utils/haptics';
import { sanitizeInput } from '../utils/sanitize';

interface Props {
  onBack: () => void;
}

export const GeneralHoroscopeView: React.FC<Props> = ({ onBack }) => {
  const { lang, t } = useLanguage();
  
  const [details, setDetails] = useState({
    name: 'അശ്വതി നായർ (Aswathi)',
    dob: '1996-08-14',
    time: '10:30',
    place: 'Kochi, Kerala',
    starId: 1, // Aswathi
    pada: 1
  });

  const [activeTab, setActiveTab] = useState<'personality' | 'career' | 'finance' | 'marriage' | 'health' | 'remedies'>('personality');
  const [reading, setReading] = useState<HoroscopeReading | null>(() => 
    generateGeneralHoroscope({
      name: 'അശ്വതി നായർ (Aswathi)',
      dob: '1996-08-14',
      time: '10:30',
      place: 'Kochi, Kerala',
      starId: 1,
      pada: 1
    })
  );

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.medium();
    const result = generateGeneralHoroscope({
      name: details.name,
      dob: details.dob,
      time: details.time,
      place: details.place,
      starId: details.starId,
      pada: details.pada
    });
    setReading(result);
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
            {lang === 'ml' ? 'പൊതു ജാതക ഫലം' : 'General Horoscope'}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug">
            {lang === 'ml' 
              ? 'നക്ഷത്രവും ഗ്രഹനിലയും അടിസ്ഥാനമാക്കിയുള്ള സമഗ്ര ജാതക വിശകലനം' 
              : 'Complete Life Predictions & Astrological Profile'}
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 sm:pb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-800 text-sm leading-tight">
              {lang === 'ml' ? 'ജാതകന്റെ വിവരങ്ങൾ' : 'Enter Birth Details'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
              {lang === 'ml' ? 'കൃത്യമായ ജാതക ഫലം ലഭിക്കാൻ വിവരങ്ങൾ നൽകുക' : 'Provide accurate birth details for calculations'}
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
              {lang === 'ml' ? 'പേര്' : 'Full Name'}
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 h-12 rounded-2xl px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: sanitizeInput(e.target.value) })}
              required
            />
          </div>

          {/* Star & Pada */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
                {lang === 'ml' ? 'ജനന നക്ഷത്രം' : 'Birth Star (Nakshatra)'}
              </label>
              <CustomSelect
                value={details.starId}
                onChange={(val) => setDetails({ ...details, starId: Number(val) })}
                options={NAKSHATRAS.map(star => ({
                  value: star.id,
                  label: lang === 'ml' ? `${star.malayalamName} (${star.name})` : `${star.name} (${star.malayalamName})`
                }))}
                placeholder={lang === 'ml' ? 'നക്ഷത്രം തിരഞ്ഞെടുക്കുക' : 'Select Nakshatra'}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
                {lang === 'ml' ? 'പാദം' : 'Pada (Quarter)'}
              </label>
              <CustomSelect
                value={details.pada}
                onChange={(val) => setDetails({ ...details, pada: Number(val) })}
                options={[1, 2, 3, 4].map(p => ({
                  value: p,
                  label: `${p}-ാം പാദം (Pada ${p})`
                }))}
                placeholder="Pada"
              />
            </div>
          </div>

          {/* DOB & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
                {lang === 'ml' ? 'ജനനത്തീയതി' : 'Date of Birth'}
              </label>
              <CustomDatePicker
                value={details.dob}
                onChange={(dob) => setDetails({ ...details, dob })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
                {lang === 'ml' ? 'ജനന സമയം' : 'Time of Birth'}
              </label>
              <CustomTimePicker
                value={details.time}
                onChange={(time) => setDetails({ ...details, time })}
              />
            </div>
          </div>

          {/* Place */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 ml-1">
              {lang === 'ml' ? 'ജനന സ്ഥലം' : 'Place of Birth'}
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 h-12 rounded-2xl px-4 pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                value={details.place}
                onChange={(e) => setDetails({ ...details, place: sanitizeInput(e.target.value) })}
                placeholder="City, State"
              />
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full min-h-[48px] py-3.5 sm:py-4 bg-gradient-to-r from-primary to-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-98 transition-transform flex items-center justify-center gap-2 text-sm mt-1"
          >
            <Sparkles size={17} className="shrink-0" />
            <span className="truncate">{lang === 'ml' ? 'ജാതക ഫലം കണക്കാക്കുക' : 'Generate Horoscope Reading'}</span>
          </button>
        </form>
      </div>

      {/* Reading Result View */}
      {reading && (
        <div className="space-y-4 sm:space-y-6">
          {/* Cosmic Identity Banner */}
          <div className="bg-gradient-to-br from-amber-600 via-primary to-amber-900 rounded-[24px] sm:rounded-[36px] p-4 sm:p-7 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10 space-y-3.5 sm:space-y-4">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70 block">
                    {lang === 'ml' ? 'വേദ ജ്യോതിഷ വിവരണം' : 'Vedic Birth Profile'}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black mt-0.5 leading-tight break-words">{reading.name}</h2>
                </div>
                <div className="shrink-0">
                  <span className="text-[10px] sm:text-xs bg-white/20 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap">
                    {reading.pada}-ാം പാദം (Pada {reading.pada})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1">
                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/10">
                  <span className="text-[9px] uppercase tracking-wider text-white/70 block leading-tight">
                    {lang === 'ml' ? 'നക്ഷത്രം' : 'Nakshatra'}
                  </span>
                  <p className="font-extrabold text-xs sm:text-sm mt-0.5 leading-snug break-words">
                    {lang === 'ml' ? reading.nakshatraMalayalam : reading.nakshatra}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/10">
                  <span className="text-[9px] uppercase tracking-wider text-white/70 block leading-tight">
                    {lang === 'ml' ? 'രാശി' : 'Rasi'}
                  </span>
                  <p className="font-extrabold text-xs sm:text-sm mt-0.5 leading-snug break-words">
                    {lang === 'ml' ? reading.rasiMalayalam : reading.rasi}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/10">
                  <span className="text-[9px] uppercase tracking-wider text-white/70 block leading-tight">
                    {lang === 'ml' ? 'ലഗ്നം' : 'Lagna'}
                  </span>
                  <p className="font-extrabold text-xs sm:text-sm mt-0.5 leading-snug break-words">
                    {lang === 'ml' ? reading.lagnaMalayalam : reading.lagna}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/10">
                  <span className="text-[9px] uppercase tracking-wider text-white/70 block leading-tight">
                    {lang === 'ml' ? 'അധിപൻ' : 'Ruler'}
                  </span>
                  <p className="font-extrabold text-xs sm:text-sm mt-0.5 leading-snug break-words">
                    {lang === 'ml' ? reading.rulingPlanetMalayalam : reading.rulingPlanet}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sacred Astrological Bio Grid */}
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-3 sm:space-y-3.5">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Compass size={17} className="text-primary shrink-0" />
              <span>{lang === 'ml' ? 'നക്ഷത്ര ഘടകങ്ങളും ഭാഗ്യ ചിഹ്നങ്ങളും' : 'Sacred Nakshatra Attributes'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              <div className="bg-slate-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">{lang === 'ml' ? 'വൃക്ഷം' : 'Nakshatra Tree'}</span>
                <span className="text-xs font-bold text-slate-800 break-words leading-tight block">{reading.nakshatraTree}</span>
              </div>
              <div className="bg-slate-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">{lang === 'ml' ? 'മൃഗം' : 'Animal'}</span>
                <span className="text-xs font-bold text-slate-800 break-words leading-tight block">{reading.nakshatraAnimal}</span>
              </div>
              <div className="bg-slate-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">{lang === 'ml' ? 'പക്ഷി' : 'Bird'}</span>
                <span className="text-xs font-bold text-slate-800 break-words leading-tight block">{reading.nakshatraBird}</span>
              </div>
              <div className="bg-slate-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">{lang === 'ml' ? 'ഗണം' : 'Gana'}</span>
                <span className="text-xs font-bold text-slate-800 break-words leading-tight block">{reading.nakshatraGana}</span>
              </div>
              <div className="bg-slate-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">{lang === 'ml' ? 'ഭൂതം' : 'Element'}</span>
                <span className="text-xs font-bold text-slate-800 break-words leading-tight block">{reading.nakshatraElement}</span>
              </div>
              <div className="bg-slate-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">{lang === 'ml' ? 'അധിദേവത' : 'Deity'}</span>
                <span className="text-xs font-bold text-slate-800 break-words leading-tight block">{reading.deity}</span>
              </div>
              <div className="bg-amber-50/70 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-amber-100/80">
                <span className="text-[9px] font-bold text-amber-700 uppercase block mb-0.5">{lang === 'ml' ? 'ഭാഗ്യ രത്നം' : 'Lucky Gem'}</span>
                <span className="text-xs font-black text-amber-900 break-words leading-tight block">{reading.luckyGem}</span>
              </div>
              <div className="bg-amber-50/70 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-amber-100/80">
                <span className="text-[9px] font-bold text-amber-700 uppercase block mb-0.5">{lang === 'ml' ? 'ഭാഗ്യ നിറം' : 'Lucky Color'}</span>
                <span className="text-xs font-black text-amber-900 break-words leading-tight block">{reading.luckyColor}</span>
              </div>
              <div className="bg-amber-50/70 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-amber-100/80 col-span-2 sm:col-span-1">
                <span className="text-[9px] font-bold text-amber-700 uppercase block mb-0.5">{lang === 'ml' ? 'ഭാഗ്യ ദിനം & സംഖ്യ' : 'Lucky Day & No.'}</span>
                <span className="text-xs font-black text-amber-900 break-words leading-tight block">{reading.luckyDay} • {reading.luckyNumber}</span>
              </div>
            </div>
          </div>

          {/* Predictions Tab System */}
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4 sm:space-y-5">
            {/* Tab Buttons */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-none touch-pan-x -mx-1 px-1">
              {[
                { key: 'personality', label: lang === 'ml' ? 'സ്വഭാവം' : 'Personality', icon: User },
                { key: 'career', label: lang === 'ml' ? 'തൊഴിൽ' : 'Career', icon: Briefcase },
                { key: 'finance', label: lang === 'ml' ? 'ധനം' : 'Finance', icon: Gem },
                { key: 'marriage', label: lang === 'ml' ? 'ദാമ്പത്യം' : 'Marriage', icon: Heart },
                { key: 'health', label: lang === 'ml' ? 'ആരോഗ്യം' : 'Health', icon: Activity },
                { key: 'remedies', label: lang === 'ml' ? 'പരിഹാരങ്ങൾ' : 'Remedies', icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => { haptic.light(); setActiveTab(tab.key as any); }}
                    className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold shrink-0 whitespace-nowrap transition-all active:scale-95 ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Reading */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 leading-relaxed text-sm text-slate-800">
                  <h4 className="font-extrabold text-sm sm:text-base text-primary mb-2">
                    {lang === 'ml' ? 'ജ്യോതിഷ നിഗമനം' : 'Vedic Analysis'}
                  </h4>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm break-words">
                    {lang === 'ml' ? reading[activeTab].ml : reading[activeTab].en}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Planetary Placements Table */}
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-3 sm:space-y-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {lang === 'ml' ? 'ഗ്രഹ നില (Planetary Positions)' : 'Planetary Positions'}
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold shrink-0">Lahiri Ayanamsa</span>
            </div>

            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full text-left text-xs table-fixed">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">
                    <th className="w-[30%] pb-2 pl-1">{lang === 'ml' ? 'ഗ്രഹം' : 'Planet'}</th>
                    <th className="w-[26%] pb-2">{lang === 'ml' ? 'രാശി' : 'Rasi'}</th>
                    <th className="w-[24%] pb-2 text-center">{lang === 'ml' ? 'ഭാവം' : 'House'}</th>
                    <th className="w-[20%] pb-2 text-right pr-1">{lang === 'ml' ? 'സ്ഫുടം' : 'Degree'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {reading.planets.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2 sm:py-2.5 pl-1 font-bold text-slate-900 truncate">
                        {lang === 'ml' ? p.nameMalayalam : p.name}
                      </td>
                      <td className="py-2 sm:py-2.5 truncate">
                        {lang === 'ml' ? p.rasiMalayalam : p.rasi}
                      </td>
                      <td className="py-2 sm:py-2.5 text-center">
                        <span className="bg-slate-100 text-slate-700 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold whitespace-nowrap inline-block">
                          {p.house}-ാം ഭാവം
                        </span>
                      </td>
                      <td className="py-2 sm:py-2.5 text-right pr-1 text-slate-500 font-mono text-[10px] sm:text-[11px] whitespace-nowrap">
                        {p.longitude}°
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
