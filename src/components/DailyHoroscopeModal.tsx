import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, SunMoon, Calendar } from 'lucide-react';
import { NAKSHATRAS, RASIS } from '../utils/astroData';
import { calculateDailyHoroscope, getCurrentNakshatra, getCurrentPlanets } from '../utils/astronomy';
import { CustomSelect } from './CustomSelect';
import { haptic } from '../utils/haptics';
import { RasiChart } from './RasiChart';

interface DailyHoroscopeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyHoroscopeModal({ isOpen, onClose }: DailyHoroscopeModalProps) {
  const [selectedStar, setSelectedStar] = useState<number | ''>('');
  const [horoscope, setHoroscope] = useState<ReturnType<typeof calculateDailyHoroscope> | null>(null);
  const [currentPlanets, setCurrentPlanets] = useState<{ name: string; rasi: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !selectedStar) {
      const currentStar = getCurrentNakshatra();
      setSelectedStar(currentStar.id);
    }
  }, [isOpen, selectedStar]);

  const fetchHoroscope = async () => {
    haptic.light();
    if (!selectedStar) return;
    
    setIsLoading(true);
    setError(null);
    setHoroscope(null);
    
    try {
      const star = NAKSHATRAS.find(n => n.id === Number(selectedStar));
      if (!star) throw new Error('Star not found');
      
      const result = calculateDailyHoroscope(star.id);
      const planets = getCurrentPlanets();
      
      setHoroscope(result);
      setCurrentPlanets(planets);
      haptic.success();
    } catch (err) {
      console.error(err);
      setError('Failed to calculate daily horoscope. Please try again later.');
      haptic.error();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-white/20 max-h-[90vh] flex flex-col"
        >
          <div className="bg-gradient-to-r from-primary to-primary-container p-6 text-white relative rounded-t-3xl shrink-0">
            <button 
              aria-label="Close horoscope modal"
              onClick={() => { haptic.light(); onClose(); }}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <SunMoon className="text-white" size={28} strokeWidth={1.5} />
              <h2 className="text-xl font-bold">Daily Horoscope</h2>
            </div>
            <p className="text-white/80 text-sm">Get personalized insights based on your Malayalam star.</p>
          </div>
          
          <div className="p-6 space-y-6 overflow-y-auto overflow-x-visible">
            <div className="space-y-2 relative z-[101]">
              <label className="block text-sm font-semibold text-on-surface">Select Your Star (Nakshatra)</label>
              <CustomSelect
                value={selectedStar}
                onChange={(val) => setSelectedStar(Number(val))}
                options={NAKSHATRAS.map((star) => ({ value: star.id, label: `${star.malayalamName} (${star.name})` }))}
                placeholder="Choose a star..."
                forceDirection="down"
              />
            </div>
            
            <button
              onClick={fetchHoroscope}
              disabled={!selectedStar || isLoading}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Get My Horoscope'}
            </button>
            
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
                {error}
              </div>
            )}
            
            {horoscope && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={18} />
                    <span className="font-semibold text-sm">
                      {new Date(horoscope.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    horoscope.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                    horoscope.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                    horoscope.status === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {horoscope.statusMalayalam}
                  </div>
                </div>

                <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-orange-200/50 pb-3">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    <h3 className="font-bold text-primary">Today's Insight (ഇന്നത്തെ ഫലം)</h3>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-800 font-medium mb-1">മലയാളം:</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {horoscope.predictionMalayalam}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-800 font-medium mb-1">English:</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {horoscope.prediction}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Lucky Color</p>
                    <p className="text-sm font-bold text-indigo-900">{horoscope.luckyColorMalayalam} ({horoscope.luckyColor})</p>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Lucky Number</p>
                    <p className="text-sm font-bold text-amber-900">{horoscope.luckyNumber}</p>
                  </div>
                </div>

                <div className="p-5 bg-green-50 border border-green-100 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-green-600">health_and_safety</span>
                    <h3 className="font-bold text-green-800 text-sm">Remedy (പരിഹാരം)</h3>
                  </div>
                  <p className="text-sm text-green-900 font-medium">{horoscope.remedyMalayalam}</p>
                  <p className="text-xs text-green-700 mt-1">{horoscope.remedy}</p>
                </div>

                <RasiChart 
                  title="ഇന്നത്തെ ഗ്രഹനില (Today's Transit)"
                  moonSign={RASIS[horoscope.currentRasiIndex].name}
                  planets={currentPlanets}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
