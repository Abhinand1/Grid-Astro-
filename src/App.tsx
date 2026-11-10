/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Calendar, Clock, MapPin, User, SunMedium, Compass, Flame, Scroll, Menu, ArrowRight, Star, ChevronDown, CheckCircle, XCircle, ShieldAlert, Scale, Activity, ArrowLeft, Loader2, Grid3X3, Info, X } from 'lucide-react';
import { getCurrentNakshatra, getDayNakshatra, getKeralaDayPanchang } from './utils/astronomy';
import { NAKSHATRAS, getRasiFromNakshatraPada } from './utils/astroData';
import { MatchReport, PoruthamResult } from './utils/porutham';
import { IndepthReport } from './utils/indepth';
import { RasiChart } from './components/RasiChart';
import { DOSHAM_EXPLANATIONS, DoshamExplanation } from './constants/doshamExplanations';
import { PORUTHAM_EXPLANATIONS, PoruthamExplanation } from './constants/poruthamExplanations';
import { DasaPeriod } from './utils/dasa';
import { MuhurthamDate } from './utils/muhurtham';
import { DasaTimeline } from './components/DasaTimeline';
import { MuhurthamFinder } from './components/MuhurthamFinder';
import { DailyHoroscopeModal } from './components/DailyHoroscopeModal';
import { DailyPanchangModal } from './components/DailyPanchangModal';
import { PoruthamDetailModal } from './components/PoruthamDetailModal';
import { HousewarmingView } from './components/HousewarmingView';
import { GeneralHoroscopeView } from './components/GeneralHoroscopeView';
import { VahanaMuhurthamView } from './components/VahanaMuhurthamView';
import { BabyNamingView } from './components/BabyNamingView';
import { PrashnaKundaliView } from './components/PrashnaKundaliView';
import { TransitForecastView } from './components/TransitForecastView';
import { BhoomiPujaView } from './components/BhoomiPujaView';
import { EarlyLifeSamskarasView } from './components/EarlyLifeSamskarasView';
import { VyaparMuhurthamView } from './components/VyaparMuhurthamView';
import { CareerVocationalView } from './components/CareerVocationalView';
import { MedicalAstrologyView } from './components/MedicalAstrologyView';
import { FinancialWealthView } from './components/FinancialWealthView';
import { RemedialPrescriptionsView } from './components/RemedialPrescriptionsView';
import { YatraMuhurthamView } from './components/YatraMuhurthamView';
import { SpiritualInitiationView } from './components/SpiritualInitiationView';
import { LitigationStrategyView } from './components/LitigationStrategyView';
import { AstrometeorologyView } from './components/AstrometeorologyView';
import { CustomSelect } from './components/CustomSelect';
import { CustomDatePicker } from './components/CustomDatePicker';
import { CustomTimePicker } from './components/CustomTimePicker';
import { sanitizeInput } from './utils/sanitize';
import { haptic } from './utils/haptics';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import * as Comlink from 'comlink';
import type { AstroWorker } from './workers/astro.worker';
import { useLanguage } from './contexts/LanguageContext';

const worker = new Worker(new URL('./workers/astro.worker.ts', import.meta.url), { type: 'module' });
const astroWorker = Comlink.wrap<AstroWorker>(worker);

const ZODIAC_SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

type ViewState = 
  | 'home' 
  | 'form' 
  | 'basic' 
  | 'chart' 
  | 'muhurtham' 
  | 'analysis' 
  | 'janam-kundli' 
  | 'housewarming' 
  | 'general-horoscope' 
  | 'vahana-muhurtham' 
  | 'baby-naming' 
  | 'prashna-kundali' 
  | 'transit-forecast' 
  | 'bhoomi-puja' 
  | 'early-life-samskaras' 
  | 'vyapar-muhurtham' 
  | 'career-vocational'
  | 'medical-astrology'
  | 'financial-wealth'
  | 'remedial-prescriptions'
  | 'yatra-muhurtham'
  | 'spiritual-initiation'
  | 'litigation-strategy'
  | 'astrometeorology'
  | 'about' 
  | 'privacy' 
  | 'contact' 
  | 'terms' 
  | 'help';

export default function App() {
  const { lang, setLang, t } = useLanguage();
  const [boyDetails, setBoyDetails] = useState<{
    name: string;
    dob: string;
    time: string;
    place: string;
    starId: number;
    pada?: number;
    rasi?: string;
  }>({
    name: 'അർജുൻ (Arjun)',
    dob: '1994-05-20',
    time: '14:30',
    place: 'Palakkad',
    starId: 25, // Poororuttathi
    pada: 1,
    rasi: 'Kumbham'
  });

  const [girlDetails, setGirlDetails] = useState<{
    name: string;
    dob: string;
    time: string;
    place: string;
    starId: number;
    pada?: number;
    rasi?: string;
  }>({
    name: 'ശ്രേയ (Shreya)',
    dob: '1997-11-05',
    time: '09:45',
    place: 'Thrissur',
    starId: 4, // Rohini
    pada: 1,
    rasi: 'Edavam'
  });

  const [matchResult, setMatchResult] = useState<MatchReport | null>(null);
  const [indepthResult, setIndepthResult] = useState<IndepthReport | null>(null);
  const [view, setView] = useState<ViewState>('home');
  const [isLoadingIndepth, setIsLoadingIndepth] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedExplanation, setSelectedExplanation] = useState<DoshamExplanation | PoruthamExplanation | null>(null);
  const [boyDasa, setBoyDasa] = useState<DasaPeriod[]>([]);
  const [girlDasa, setGirlDasa] = useState<DasaPeriod[]>([]);
  const [muhurthams, setMuhurthams] = useState<MuhurthamDate[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isDailyHoroscopeOpen, setIsDailyHoroscopeOpen] = useState(false);
  const [isMuhurthamCalendarOpen, setIsMuhurthamCalendarOpen] = useState(false);
  const [selectedPorutham, setSelectedPorutham] = useState<PoruthamResult | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Fix: Every page should start from starting top of the page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  useEffect(() => {
    if (boyDetails.starId && girlDetails.starId) {
      const fetchDasaAndMuhurthams = async () => {
        const bd = await astroWorker.calculateDasaTimeline(boyDetails.starId, boyDetails.dob, boyDetails.time, boyDetails.pada);
        const gd = await astroWorker.calculateDasaTimeline(girlDetails.starId, girlDetails.dob, girlDetails.time, girlDetails.pada);
        const m = await astroWorker.findMuhurthams(girlDetails.starId, boyDetails.starId);
        setBoyDasa(bd);
        setGirlDasa(gd);
        setMuhurthams(m);
      };
      fetchDasaAndMuhurthams();
    }
  }, [boyDetails.starId, boyDetails.dob, boyDetails.time, boyDetails.pada, girlDetails.starId, girlDetails.dob, girlDetails.time, girlDetails.pada]);

  const getPoruthamIcon = (name: string) => {
    switch (name) {
      case 'Dina': return 'schedule';
      case 'Gana': return 'groups';
      case 'Mahendra': return 'shield';
      case 'Stree Deergha': return 'straighten';
      case 'Yoni': return 'pets';
      case 'Rasi': return 'grid_view';
      case 'Rasyadhipathi': return 'stars';
      case 'Vasya': return 'favorite';
      case 'Rajju': return 'link';
      case 'Vedha': return 'block';
      default: return 'star';
    }
  };

  const panchang = getKeralaDayPanchang();
  const [isPanchangModalOpen, setIsPanchangModalOpen] = useState(false);
  const currentNakshatra = panchang.dayNakshatra; // Authentic Kerala Calendar Day Star (Udaya Nakshatra)

  const getCurrentTithi = () => {
    return lang === 'ml' ? panchang.tithi.nameMl : panchang.tithi.nameEn;
  };

  const getCurrentAlignment = () => {
    return {
      sun: lang === 'ml' ? panchang.malayalamDate.monthMalayalam : panchang.malayalamDate.month,
      moon: lang === 'ml' ? panchang.dayNakshatra.malayalamName : panchang.dayNakshatra.name,
      rising: lang === 'ml' ? 'കന്നി' : 'Virgo',
      score: 88,
      status: lang === 'ml' ? 'അതിവിശിഷ്ടം' : 'Excellent'
    };
  };

  const currentAlignment = getCurrentAlignment();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (boyDetails.starId === 0 || girlDetails.starId === 0) {
      alert('ദയവായി നക്ഷത്രം തിരഞ്ഞെടുക്കുക (Please select Nakshatra)');
      return;
    }

    const gRasi = girlDetails.rasi || getRasiFromNakshatraPada(girlDetails.starId, girlDetails.pada || 1);
    const bRasi = boyDetails.rasi || getRasiFromNakshatraPada(boyDetails.starId, boyDetails.pada || 1);

    const result = await astroWorker.calculatePorutham(
      girlDetails.starId, 
      boyDetails.starId,
      girlDetails.pada || 1,
      boyDetails.pada || 1,
      gRasi,
      bRasi
    );
    setMatchResult(result);
    setView('basic');
  };

  const handleIndepthCheck = async () => {
    setIsLoadingIndepth(true);
    try {
      const gRasi = girlDetails.rasi || getRasiFromNakshatraPada(girlDetails.starId, girlDetails.pada || 1);
      const bRasi = boyDetails.rasi || getRasiFromNakshatraPada(boyDetails.starId, boyDetails.pada || 1);
      const result = await astroWorker.calculateIndepth(
        { ...boyDetails, rasi: bRasi }, 
        { ...girlDetails, rasi: gRasi }
      );
      setIndepthResult(result);
      
      // Calculate Dasa and Muhurthams
      setBoyDasa(await astroWorker.calculateDasaTimeline(boyDetails.starId, boyDetails.dob, boyDetails.time, boyDetails.pada));
      setGirlDasa(await astroWorker.calculateDasaTimeline(girlDetails.starId, girlDetails.dob, girlDetails.time, girlDetails.pada));
      setMuhurthams(await astroWorker.findMuhurthams(girlDetails.starId, boyDetails.starId));
      
      setView('analysis');
    } catch (error) {
      console.error(error);
      alert("വിശദമായ പരിശോധന പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക. (Failed to calculate in-depth report. Please try again.)");
    } finally {
      setIsLoadingIndepth(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('pdf-report-template');
    if (!element) return;

    setIsGeneratingPdf(true);
    try {
      // Temporarily make the element visible for capture
      element.style.display = 'block';
      element.style.position = 'fixed';
      element.style.top = '0';
      element.style.left = '0';
      element.style.zIndex = '9999';
      element.style.opacity = '1';

      // Small delay to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use html-to-image for better quality and reliability with modern CSS (oklch)
      const dataUrl = await toPng(element, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: {
          opacity: '1',
          transform: 'none',
        }
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`Grid_Astro_Report_${boyDetails.name || 'Boy'}_${girlDetails.name || 'Girl'}.pdf`);
    } catch (error) {
      console.error('PDF Error:', error);
      alert('PDF നിർമ്മാണത്തിൽ തകരാർ സംഭവിച്ചു. (Failed to generate PDF.)');
    } finally {
      // Always hide it back
      if (element) {
        element.style.display = 'none';
        element.style.position = 'fixed';
        element.style.left = '-9999px';
      }
      setIsGeneratingPdf(false);
    }
  };

  const getBoyStar = () => NAKSHATRAS.find(s => s.id === boyDetails.starId);
  const getGirlStar = () => NAKSHATRAS.find(s => s.id === girlDetails.starId);

  // Mock planetary positions for visual completeness
  const mockPlanets = [
    { name: "സൂര്യൻ", rasi: "Mesha" },
    { name: "വ്യാഴം", rasi: "Simha" },
    { name: "ശനി", rasi: "Kumbha" },
    { name: "ചൊവ്വ", rasi: "Vrischika" }
  ];

  return (
    <div className={`min-h-[100dvh] bg-surface font-sans text-on-surface relative flex flex-col overflow-x-hidden`}>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-[0.4]">
        <svg viewBox="0 0 800 800" className="w-[200%] h-[200%] md:w-[150%] md:h-[150%] animate-[spin_180s_linear_infinite] text-primary/30" fill="currentColor" style={{ filter: 'drop-shadow(0 0 20px rgba(144, 77, 0, 0.15))' }}>
          <path d="M400 50 A350 350 0 1 1 399.9 50 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10"/>
          <path d="M400 100 A300 300 0 1 1 399.9 100 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
          <path d="M400 150 A250 250 0 1 1 399.9 150 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <g transform="translate(400, 400)">
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={i} transform={`rotate(${i * 30}) translate(0, -325)`}>
                <text textAnchor="middle" dominantBaseline="middle" fontSize="32" transform={`rotate(${-i * 30})`}>
                  {ZODIAC_SIGNS[i]}
                </text>
              </g>
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={`inner-${i}`} transform={`rotate(${i * 30 + 15}) translate(0, -275)`}>
                <circle r="4" fill="currentColor" />
              </g>
            ))}
            {Array.from({ length: 27 }).map((_, i) => (
              <g key={`nakshatra-${i}`} transform={`rotate(${i * (360/27)}) translate(0, -225)`}>
                <text textAnchor="middle" dominantBaseline="middle" fontSize="12" transform={`rotate(${-i * (360/27)})`}>
                  ★
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
      
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white overflow-hidden"
          >
            {/* Background Spinning Zodiacs */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="relative w-[800px] h-[800px] flex items-center justify-center"
              >
                {ZODIAC_SIGNS.map((sign, i) => (
                  <div
                    key={`bg-sign-${i}`}
                    className="absolute text-6xl font-serif"
                    style={{
                      transform: `rotate(${i * 30}deg) translateY(-350px)`,
                    }}
                  >
                    {sign}
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Celestial Rings Animation */}
              <div className="relative w-48 h-48 mb-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[0.5px] border-primary/20 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border-[0.5px] border-primary/10 rounded-full border-dashed"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-8 border-[0.5px] border-primary/5 rounded-full"
                />
                
                {/* Inner Spinning Zodiacs */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {ZODIAC_SIGNS.map((sign, i) => (
                    <div
                      key={`inner-sign-${i}`}
                      className="absolute text-xs font-serif text-primary/40"
                      style={{
                        transform: `rotate(${i * 30}deg) translateY(-85px)`,
                      }}
                    >
                      {sign}
                    </div>
                  ))}
                </motion.div>

                {/* Center Pulsing Star */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2 h-2 bg-primary rounded-full blur-[2px]"
                  />
                </div>
              </div>

              {/* Logo Animation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-3xl md:text-4xl tracking-tight text-slate-900 flex items-center justify-center gap-1 [&_span:first-child]:font-bold [&_span:last-child]:font-light">
                  <span>Grid</span><span>Astro</span>
                </div>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 120 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                  className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary"
                >
                  Celestial Intelligence
                </motion.p>
              </motion.div>
            </div>

            {/* Loading Progress Bar */}
            <div className="absolute bottom-16 w-48 h-[2px] bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="h-full bg-primary"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background texture removed - using the one above */}
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-100/50 shadow-sm flex justify-between items-center px-4 sm:px-6 h-14 shrink-0 font-['Plus_Jakarta_Sans'] font-medium">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button 
            onClick={() => {
              haptic.light();
              if (view === 'home') {
                setIsMenuOpen(true);
                return;
              }
              if (view === 'form') setView('home');
              else if (view === 'basic') setView('form');
              else if (view === 'analysis') setView('basic');
              else if (view === 'chart') setView('basic');
              else if (view === 'muhurtham') setView('analysis');
              else setView('home');
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all shrink-0"
            aria-label="Navigation Menu"
          >
            <span className="material-symbols-outlined text-slate-700 text-[22px]">
              {view === 'home' ? 'menu' : 'arrow_back'}
            </span>
          </button>
          <div 
            onClick={() => setView('home')}
            className="text-lg tracking-tight text-slate-900 flex items-center justify-center gap-0.5 [&_span:first-child]:font-bold [&_span:last-child]:font-light cursor-pointer select-none"
          >
            <span>Grid</span><span>Astro</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => {
              haptic.light();
              setLang(lang === 'en' ? 'ml' : 'en');
            }}
            className="px-2.5 py-1 text-[10px] font-bold text-primary bg-primary/10 rounded-lg uppercase tracking-wider shrink-0 active:scale-95 transition-transform"
          >
            {lang === 'en' ? 'മലയാളം' : 'EN'}
          </button>
          <div 
            onClick={() => {
              haptic.light();
              setIsPanchangModalOpen(true);
            }}
            className="flex flex-col items-end justify-center leading-none min-w-0 cursor-pointer"
            title={lang === 'ml' ? "ഇന്നത്തെ നാളും പഞ്ചാംഗവും" : "Today's Nakshatra & Panchangam"}
          >
            <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-primary/70 mb-0.5">Nakshatra</span>
            <span className="text-[10px] font-black text-slate-900 leading-none truncate max-w-[85px] sm:max-w-none">{lang === 'ml' ? panchang.dayNakshatra.malayalamName : panchang.dayNakshatra.name}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1 whitespace-nowrap">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 max-w-xl mx-auto w-full overflow-x-hidden pt-6 sm:pt-8 pb-24">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <section className="mb-12">
                <h1 className="text-4xl tracking-tight mb-4 leading-[1.1]">
                  <span className="block font-extrabold text-on-surface">{t('home.hero1')}</span>
                  <span className="block font-light text-primary">{t('home.hero2')}</span>
                </h1>
                <p className="text-on-surface-variant text-lg leading-relaxed mb-8 opacity-80">
                  {t('home.desc')}
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => { haptic.light(); setView('form'); }}
                    className="bg-celestial-gradient text-white font-semibold py-4 px-8 rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                  >
                    {t('btn.check')}
                  </button>
                  <button 
                    onClick={() => { haptic.light(); setView('general-horoscope'); }}
                    className="bg-white/60 backdrop-blur-md border border-white/30 text-primary font-semibold py-4 px-8 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] active:scale-95 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                  >
                    {t('home.explore')}
                  </button>
                </div>
              </section>

              {/* Today's Kerala Panchangam Banner */}
              <section className="mb-8">
                <div 
                  onClick={() => {
                    haptic.light();
                    setIsPanchangModalOpen(true);
                  }}
                  className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 border-2 border-amber-300/80 rounded-[28px] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-200/90 text-amber-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                          <SunMedium className="w-3 h-3 text-amber-700" />
                          {lang === 'ml' ? 'ഇന്നത്തെ ദിവസ നാൾ' : "Today's Day Star"}
                        </span>
                        <span className="text-[10px] font-bold text-amber-800/80 whitespace-nowrap">
                          {lang === 'ml' ? panchang.malayalamDate.formattedMl : panchang.malayalamDate.formattedEn}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight leading-none">
                          {lang === 'ml' ? panchang.dayNakshatra.malayalamName : panchang.dayNakshatra.name}
                        </h2>
                        <span className="inline-flex items-center whitespace-nowrap shrink-0 text-xs font-bold text-amber-800 bg-amber-100/90 border border-amber-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                          {lang === 'ml' ? 'ഉദയനക്ഷത്രം' : 'Sunrise Star'}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 font-semibold pt-0.5 leading-relaxed">
                        {lang === 'ml'
                          ? `സാധുത: രാവിലെ ${panchang.transitionTimeFormatted} വരെ (${panchang.nazhikaDuration}) • തുടർന്ന് ${panchang.nextNakshatra.malayalamName}`
                          : `Valid till ${panchang.transitionTimeFormatted} (${panchang.nazhikaValue.toFixed(1)} Nazhika) • Then ${panchang.nextNakshatra.name}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0 pt-0.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-900 bg-white/90 border border-amber-200 px-3 py-1.5 rounded-xl group-hover:bg-amber-100 transition-colors shadow-2xs whitespace-nowrap">
                        {lang === 'ml' ? 'പഞ്ചാംഗം കാണുക' : 'View Details'}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Current Alignment */}
              <section className="mb-12">
                <div className="bg-white/60 backdrop-blur-2xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-white/40 relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'wght' 100" }}>brightness_high</span>
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-6">{t('home.current_alignment')}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-primary mb-2">wb_sunny</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{t('home.sun')}</p>
                      <p className="font-bold text-on-surface">{currentAlignment.sun}</p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <span className="material-symbols-outlined text-primary mb-2">dark_mode</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{t('home.moon')}</p>
                      <p className="font-bold text-on-surface">{currentAlignment.moon}</p>
                    </div>
                    <div className="text-center">
                      <span className="material-symbols-outlined text-primary mb-2">north_east</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{t('home.rising')}</p>
                      <p className="font-bold text-on-surface">{currentAlignment.rising}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Divine Alignment Meter */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  {t('home.divine_alignment')}
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                </h2>
                <div className="bg-surface-container-low rounded-[32px] p-8 text-center relative">
                  <div className="relative inline-block">
                    <svg className="w-48 h-48 -rotate-90">
                      <circle className="text-surface-variant/30" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                      <circle 
                        cx="96" 
                        cy="96" 
                        fill="transparent" 
                        r="88" 
                        stroke="url(#gauge-gradient)" 
                        strokeDasharray="552.92" 
                        strokeDashoffset={552.92 * (1 - currentAlignment.score / 100)} 
                        strokeLinecap="round" 
                        strokeWidth="12"
                        className="transition-all duration-1000 ease-out"
                      ></circle>
                      <defs>
                        <linearGradient id="gauge-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                          <stop offset="0%" style={{ stopColor: '#F2994A' }}></stop>
                          <stop offset="100%" style={{ stopColor: '#904D00' }}></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-extrabold text-on-surface tracking-tighter">{currentAlignment.score}%</span>
                      <span className="text-xs font-bold text-primary tracking-widest uppercase">{currentAlignment.status}</span>
                    </div>
                  </div>
                  <p className="mt-6 text-on-surface-variant/70 text-sm italic leading-relaxed">
                    {t('home.divine_desc')}
                  </p>
                </div>
              </section>

              {/* Vedic Insights & Services */}
              <section className="mb-10 sm:mb-12">
                <div className="flex justify-between items-center mb-5 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold">{t('home.vedic_insights')}</h2>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full shrink-0">
                    {lang === 'ml' ? 'ആധികാരിക ജ്യോതിഷം' : 'Panchangam'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  {/* Daily Horoscope */}
                  <div 
                    onClick={() => { haptic.light(); setIsDailyHoroscopeOpen(true); }}
                    className="col-span-2 bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-sm border border-slate-100 relative overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4 sm:mb-6">
                        <span className="material-symbols-outlined text-2xl sm:text-3xl text-primary">wb_sunny</span>
                        <span className="bg-primary/10 text-primary text-[10px] px-2.5 sm:px-3 py-1 rounded-full font-bold uppercase shrink-0">{t('home.live_reading')}</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold mb-1 leading-tight">{t('home.daily')}</h4>
                      <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">{t('home.daily_desc')}</p>
                    </div>
                  </div>

                  {/* Housewarming Muhurtham */}
                  <div 
                    onClick={() => { haptic.light(); setView('housewarming'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">cottage</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'ഗൃഹപ്രവേശം' : 'Housewarming'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'ഉത്തമ മുഹൂർത്തങ്ങൾ' : 'Grihapravesham Dates'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'പരിശോധിക്കുക' : 'Check Dates'} →
                    </span>
                  </div>

                  {/* General Horoscope */}
                  <div 
                    onClick={() => { haptic.light(); setView('general-horoscope'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">psychology</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'പൊതു ജാതകം' : 'General Horoscope'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'സ്വഭാവവും ജീവിത ഫലങ്ങളും' : 'Life & Career Reading'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-primary mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'വായിക്കുക' : 'Read Chart'} →
                    </span>
                  </div>

                  {/* Vehicle Muhurtham */}
                  <div 
                    onClick={() => { haptic.light(); setView('vahana-muhurtham'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">directions_car</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'വാഹന മുഹൂർത്തം' : 'Vehicle Muhurtham'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'വാഹനം വാങ്ങാൻ ശുഭദിനങ്ങൾ' : 'Vehicle Purchase Dates'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'കണ്ടെത്തുക' : 'Find Dates'} →
                    </span>
                  </div>

                  {/* Baby Naming */}
                  <div 
                    onClick={() => { haptic.light(); setView('baby-naming'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">child_care</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'നാമകരണം' : 'Baby Naming'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'നക്ഷത്ര പാദാക്ഷരങ്ങൾ' : 'Sacred Seed Sounds'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'തുടങ്ങുക' : 'Explore'} →
                    </span>
                  </div>

                  {/* Prashna Kundali */}
                  <div 
                    onClick={() => { haptic.light(); setView('prashna-kundali'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-500/10 text-purple-700 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">help_outline</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'പ്രശ്ന വിചാരം' : 'Prashna Vicharam'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'തത്സമയ ചോദ്യ വിചാരം' : 'Instant Horary Query'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-purple-700 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'ചോദിക്കുക' : 'Ask Query'} →
                    </span>
                  </div>

                  {/* Transit Forecast & Ezharashani */}
                  <div 
                    onClick={() => { haptic.light(); setView('transit-forecast'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">track_changes</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'ഗോചാര ഫലം' : 'Transits & Ezharashani'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'ഏഴരശ്ശനി & വ്യാഴ മാറ്റം' : 'Saturn & Jupiter Transit'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'പരിശോധിക്കുക' : 'View Impact'} →
                    </span>
                  </div>

                  {/* Vyapar Muhurtham */}
                  <div 
                    onClick={() => { haptic.light(); setView('vyapar-muhurtham'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">storefront</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'വ്യാപാര മുഹൂർത്തം' : 'Business Launch'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'സ്ഥാപനം തുടങ്ങാൻ' : 'Vyapar Muhurta'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'കണ്ടെത്തുക' : 'Find Dates'} →
                    </span>
                  </div>

                  {/* Bhoomi Puja */}
                  <div 
                    onClick={() => { haptic.light(); setView('bhoomi-puja'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">foundation</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'ഭൂമിപൂജ' : 'Bhoomi Puja'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'തറക്കല്ലിടൽ മുഹൂർത്തം' : 'Foundation Laying'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'പരിശോധിക്കുക' : 'Check Dates'} →
                    </span>
                  </div>

                  {/* Career & Vocational Direction */}
                  <div 
                    onClick={() => { haptic.light(); setView('career-vocational'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">work</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'തൊഴിൽ & കർമ്മഫലം' : 'Career & Direction'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'നേതൃത്വവും സംരംഭകത്വവും' : 'Leadership & Vocation'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'കാണുക' : 'Explore'} →
                    </span>
                  </div>

                  {/* Medical Astrology & Surgery */}
                  <div 
                    onClick={() => { haptic.light(); setView('medical-astrology'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-teal-500/10 text-teal-700 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">local_hospital</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'ആയുർ ജ്യോതിഷം' : 'Medical Astrology'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'ത്രിദോഷം & ചികിത്സാ വേള' : 'Tridosha & Surgery'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-teal-700 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'പരിശോധിക്കുക' : 'Check'} →
                    </span>
                  </div>

                  {/* Financial & Wealth Forecasting */}
                  <div 
                    onClick={() => { haptic.light(); setView('financial-wealth'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">payments</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'ധന ഭാവ ഫലം' : 'Wealth & Prosperity'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'ലക്ഷ്മീ യോഗവും സമ്പാദ്യവും' : 'Lakshmi Yoga & Savings'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'അറിയുക' : 'Analyze'} →
                    </span>
                  </div>

                  {/* Remedial Prescriptions & Vazhipadu */}
                  <div 
                    onClick={() => { haptic.light(); setView('remedial-prescriptions'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-500/10 text-purple-700 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">diamond</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'പരിഹാര വിധികൾ' : 'Remedies & Gemstones'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'രത്നവും ക്ഷേത്ര വഴിപാടുകളും' : 'Ratnam & Vazhipadu'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-purple-700 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'കാണുക' : 'Remedies'} →
                    </span>
                  </div>

                  {/* Travel & Migration Timing */}
                  <div 
                    onClick={() => { haptic.light(); setView('yatra-muhurtham'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-sky-500/10 text-sky-700 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">flight_takeoff</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'യാത്രാ മുഹൂർത്തം' : 'Travel Muhurtham'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'വാരശൂല & ചന്ദ്രബലം' : 'Vaara Shoola & Safety'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-sky-700 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'തിരഞ്ഞെടുക്കുക' : 'Select'} →
                    </span>
                  </div>

                  {/* Spiritual Initiation & Diksha */}
                  <div 
                    onClick={() => { haptic.light(); setView('spiritual-initiation'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-900 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">self_improvement</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'ഇഷ്ടദേവത' : 'Ishta Devatha & Diksha'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'ഉപാസന & മന്ത്രദീക്ഷ' : 'Mantra & Sadhana'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-900 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'അറിയുക' : 'Discover'} →
                    </span>
                  </div>

                  {/* Astrometeorology & Relocation */}
                  <div 
                    onClick={() => { haptic.light(); setView('astrometeorology'); }}
                    className="bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">cloudy_snowing</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mb-1 text-slate-900 leading-tight">
                        {lang === 'ml' ? 'ഞാറ്റുവേല & മഴഫലം' : 'Nhattuvela & Weather'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                        {lang === 'ml' ? 'മഴക്കണക്കും ദിഗ്ബലവും' : 'Rain Lore & Dig-Bala'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 mt-2.5 sm:mt-3 inline-flex items-center gap-1">
                      {lang === 'ml' ? 'കാണുക' : 'Forecast'} →
                    </span>
                  </div>
                </div>
              </section>

              {/* Testimonial */}
              <section className="mb-12">
                <div className="bg-primary-container/20 rounded-[32px] p-8 relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                      <img className="w-full h-full object-cover" alt="Ananya Sharma" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf06mdPnWG1ryJp5Qe8W6kXfEVEJ-PuW2rVE-XxqeErUvRjfLJ2gwllt3ndddG3ecK-N4dOacoq4tnAV2iCko0MQxD-fGADfkVMs2RNUZWR8uLXLo9sV9qvqn6M7NgIReDw708Rh8DNkvkyOcqlmGQBT3kAgDh3NhToSsgjFuiZkNP0m1IOJyupAyQLSTIGgqF2rRuOP5tML2SpE9J8vrR5ipIooyQL7Ull6w0YPsRp2UxQz2iqA5koLSKwk3NVJmU-mEWwapfAg" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm">Ananya Sharma</h5>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Entrepreneur</p>
                    </div>
                  </div>
                  <p className="text-on-surface-variant italic leading-relaxed relative z-10">
                    {t('home.testimonial')}
                  </p>
                  <div className="absolute bottom-6 right-8 text-primary opacity-20">
                    <span className="material-symbols-outlined text-6xl">format_quote</span>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className="bg-white px-6 pt-12 pb-32 border-t border-slate-50 -mx-5">
                <div className="flex items-center gap-0.5 text-2xl tracking-tight text-slate-900 mb-8">
                  <span className="font-bold">Grid</span><span className="font-light">Astro</span>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div>
                    <h6 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-4">{t('nav.universe')}</h6>
                    <ul className="space-y-3 text-sm font-medium text-slate-600">
                      <li><button onClick={() => setView('home')} className="hover:text-primary transition-colors">{t('nav.horoscope')}</button></li>
                      <li><button onClick={() => setView('form')} className="hover:text-primary transition-colors">{t('nav.matching')}</button></li>
                      <li><button onClick={() => setView('janam-kundli')} className="hover:text-primary transition-colors">{t('nav.kundli')}</button></li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-4">{t('nav.company')}</h6>
                    <ul className="space-y-3 text-sm font-medium text-slate-600">
                      <li><button onClick={() => setView('about')} className="hover:text-primary transition-colors">{t('nav.about')}</button></li>
                      <li><button onClick={() => setView('privacy')} className="hover:text-primary transition-colors">{t('nav.privacy_short')}</button></li>
                      <li><button onClick={() => setView('contact')} className="hover:text-primary transition-colors">{t('nav.contact_short')}</button></li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-6 mb-8 text-slate-400">
                  <span className="material-symbols-outlined">public</span>
                  <span className="material-symbols-outlined">camera</span>
                  <span className="material-symbols-outlined">alternate_email</span>
                </div>
                <p className="text-xs text-slate-400">© 2026 Grid Astro. All rights reserved.</p>
              </footer>
            </motion.div>
          )}

          {view === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Headline Section */}
              <section className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-on-background mb-2">{t('form.title')}</h1>
                <p className="text-on-surface-variant font-medium leading-relaxed">{t('form.desc')}</p>
              </section>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Partner I Details */}
                <div className="bg-surface-container-lowest/60 backdrop-blur-xl rounded-[32px] p-6 shadow-sm border border-white/40">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <h2 className="text-lg font-bold">{t('form.partner1')}</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">{t('form.name')}</label>
                      <input 
                        className="w-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-slate-800 h-14 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder={t('form.name_placeholder')} 
                        type="text"
                        value={boyDetails.name}
                        onChange={(e) => setBoyDetails({ ...boyDetails, name: sanitizeInput(e.target.value) })}
                        maxLength={100}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1.5 group">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 group-focus-within:text-primary transition-colors">{t('form.star')}</label>
                        <CustomSelect
                          value={boyDetails.starId || ''}
                          onChange={(val) => {
                            const newStar = Number(val);
                            const newRasi = getRasiFromNakshatraPada(newStar, boyDetails.pada || 1);
                            setBoyDetails({ ...boyDetails, starId: newStar, rasi: newRasi });
                          }}
                          options={NAKSHATRAS.map(star => ({ value: star.id, label: `${lang === 'ml' ? star.malayalamName : star.name}` }))}
                          placeholder={t('form.star_placeholder')}
                        />
                      </div>
                      <div className="space-y-1.5 group">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 group-focus-within:text-primary transition-colors">{t('form.pada')}</label>
                        <CustomSelect
                          value={boyDetails.pada || 1}
                          onChange={(val) => {
                            const newPada = Number(val);
                            const newRasi = getRasiFromNakshatraPada(boyDetails.starId, newPada);
                            setBoyDetails({ ...boyDetails, pada: newPada, rasi: newRasi });
                          }}
                          options={[
                            { value: 1, label: lang === 'ml' ? 'പാദം 1' : 'Pada 1' },
                            { value: 2, label: lang === 'ml' ? 'പാദം 2' : 'Pada 2' },
                            { value: 3, label: lang === 'ml' ? 'പാദം 3' : 'Pada 3' },
                            { value: 4, label: lang === 'ml' ? 'പാദം 4' : 'Pada 4' }
                          ]}
                          placeholder={t('form.pada_placeholder')}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">{t('form.dob')}</label>
                        <CustomDatePicker
                          value={boyDetails.dob}
                          onChange={(date) => setBoyDetails({ ...boyDetails, dob: date })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">{t('form.time')}</label>
                        <CustomTimePicker
                          value={boyDetails.time}
                          onChange={(time) => setBoyDetails({ ...boyDetails, time })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">{t('form.place')}</label>
                      <div className="relative">
                        <input 
                          className="w-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-slate-800 h-14 rounded-xl px-4 pl-11 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                          placeholder={t('form.place_placeholder')} 
                          type="text"
                          value={boyDetails.place}
                          onChange={(e) => setBoyDetails({ ...boyDetails, place: sanitizeInput(e.target.value) })}
                          maxLength={100}
                          required
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">location_on</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Divider */}
                <div className="flex justify-center items-center py-2">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent"></div>
                  <div className="mx-4 p-2 rounded-full bg-surface-container-high text-primary/60">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </div>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent"></div>
                </div>

                {/* Partner II Details */}
                <div className="bg-surface-container-lowest/60 backdrop-blur-xl rounded-[32px] p-6 shadow-sm border border-white/40">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">person_2</span>
                    </div>
                    <h2 className="text-lg font-bold">{t('form.partner2')}</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">{t('form.name')}</label>
                      <input 
                        className="w-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-slate-800 h-14 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder={t('form.name_placeholder')} 
                        type="text"
                        value={girlDetails.name}
                        onChange={(e) => setGirlDetails({ ...girlDetails, name: sanitizeInput(e.target.value) })}
                        maxLength={100}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1.5 group">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 group-focus-within:text-primary transition-colors">{t('form.star')}</label>
                        <CustomSelect
                          value={girlDetails.starId || ''}
                          onChange={(val) => {
                            const newStar = Number(val);
                            const newRasi = getRasiFromNakshatraPada(newStar, girlDetails.pada || 1);
                            setGirlDetails({ ...girlDetails, starId: newStar, rasi: newRasi });
                          }}
                          options={NAKSHATRAS.map(star => ({ value: star.id, label: `${lang === 'ml' ? star.malayalamName : star.name}` }))}
                          placeholder={t('form.star_placeholder')}
                        />
                      </div>
                      <div className="space-y-1.5 group">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 group-focus-within:text-primary transition-colors">{t('form.pada')}</label>
                        <CustomSelect
                          value={girlDetails.pada || 1}
                          onChange={(val) => {
                            const newPada = Number(val);
                            const newRasi = getRasiFromNakshatraPada(girlDetails.starId, newPada);
                            setGirlDetails({ ...girlDetails, pada: newPada, rasi: newRasi });
                          }}
                          options={[
                            { value: 1, label: lang === 'ml' ? 'പാദം 1' : 'Pada 1' },
                            { value: 2, label: lang === 'ml' ? 'പാദം 2' : 'Pada 2' },
                            { value: 3, label: lang === 'ml' ? 'പാദം 3' : 'Pada 3' },
                            { value: 4, label: lang === 'ml' ? 'പാദം 4' : 'Pada 4' }
                          ]}
                          placeholder={t('form.pada_placeholder')}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">{t('form.dob')}</label>
                        <CustomDatePicker
                          value={girlDetails.dob}
                          onChange={(date) => setGirlDetails({ ...girlDetails, dob: date })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">{t('form.time')}</label>
                        <CustomTimePicker
                          value={girlDetails.time}
                          onChange={(time) => setGirlDetails({ ...girlDetails, time })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">{t('form.place')}</label>
                      <div className="relative">
                        <input 
                          className="w-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-slate-800 h-14 rounded-xl px-4 pl-11 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                          placeholder={t('form.place_placeholder')} 
                          type="text"
                          value={girlDetails.place}
                          onChange={(e) => setGirlDetails({ ...girlDetails, place: sanitizeInput(e.target.value) })}
                          maxLength={100}
                          required
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">location_on</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculate Button */}
                <div className="pt-4">
                  <button 
                    className="w-full bg-gradient-to-r from-primary to-primary-container text-white h-16 rounded-full font-bold text-lg shadow-xl shadow-primary-container/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                    type="submit"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
                    {t('form.calculate')}
                  </button>
                </div>

                {/* Trust Badge */}
                <div className="flex items-center justify-center gap-2 py-4 text-on-surface-variant/70">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span className="text-[11px] font-semibold uppercase tracking-widest">{t('form.trust_badge')}</span>
                </div>
              </form>
            </motion.div>
          )}

          {view === 'basic' && (
            <motion.div 
              key="basic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative min-h-screen pb-24"
              id="report-content-basic"
            >
              <section className="text-center space-y-6">
                <div className="space-y-1">
                  <p className="text-primary font-bold tracking-widest text-[10px] uppercase">{t('result.celestial_reading')}</p>
                  <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">{t('result.harmonious_match')}</h1>
                </div>

                {/* Main Score Gauge */}
                <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                  {/* Astrological background wheel graphic */}
                  <div className="absolute inset-0 opacity-10 animate-[spin_20s_linear_infinite]">
                    <svg className="w-full h-full text-primary" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeDasharray="2 2" strokeWidth="0.5"></circle>
                      <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="currentColor" strokeWidth="0.2"></path>
                    </svg>
                  </div>

                  {/* Glassmorphic Gauge */}
                  <div className="relative z-10 w-52 h-52 rounded-full bg-white/40 backdrop-blur-2xl shadow-[0_24px_48px_rgba(144,77,0,0.08)] flex flex-col items-center justify-center border border-white/40">
                    <div className="absolute inset-0 rounded-full border-[6px] border-surface-container-high"></div>
                    {/* Saffron Progress Track */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 208 208">
                      <circle 
                        cx="104" 
                        cy="104" 
                        fill="none" 
                        r="98" 
                        stroke="url(#saffron-gradient)" 
                        strokeDasharray="615.44" 
                        strokeDashoffset={615.44 - (615.44 * (matchResult?.totalScore || 0)) / 10} 
                        strokeLinecap="round" 
                        strokeWidth="8"
                      ></circle>
                      <defs>
                        <linearGradient id="saffron-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                          <stop offset="0%" stopColor="#904D00"></stop>
                          <stop offset="100%" stopColor="#F2994A"></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="text-5xl font-extrabold text-on-surface tracking-tighter">
                      {Math.round((matchResult?.totalScore || 0) * 10)}%
                    </span>
                    <span className="text-sm font-semibold text-primary opacity-80">{t('result.score')}</span>
                  </div>
                </div>

                <p className="text-on-surface-variant leading-relaxed text-sm px-4">
                  {t('result.match_desc')}
                </p>
              </section>

              {/* Detailed Breakdown */}
              <section className="space-y-4 mt-8">
                <h2 className="text-xl font-bold px-1">{t('result.porutham')}</h2>
                <div className="grid gap-4">
                  {matchResult && matchResult.results.map((res, idx) => (
                    <div 
                      key={`result-${idx}`} 
                      onClick={() => { haptic.light(); setSelectedPorutham(res); }}
                      className="bg-white/60 backdrop-blur-xl p-4 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white/40 flex items-start gap-4 cursor-pointer hover:bg-white/80 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        res.status === 'Uthamam' ? 'bg-primary-container/20' : 
                        res.status === 'Adhamam' ? 'bg-error-container/20' : 'bg-orange-100/40'
                      }`}>
                        <span className="material-symbols-outlined text-primary">{getPoruthamIcon(res.name)}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-base">{lang === 'ml' ? res.malayalamName : res.name} Porutham</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            res.status === 'Uthamam' ? 'bg-green-100 text-green-700' : 
                            res.status === 'Adhamam' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {res.status === 'Uthamam' ? t('result.uthamam') : res.status === 'Adhamam' ? t('result.adhamam') : t('result.madhyamam')}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                          {PORUTHAM_EXPLANATIONS[res.name]?.description || 'Indicates compatibility in family growth and lineage prosperity.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Expert Note */}
              <section className="bg-[#F2994A]/10 p-6 rounded-[32px] relative overflow-hidden mt-8">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                      <img alt="Astrologer" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBN8ZYihF0NhKwcnoaBP2BJd4AsFzX1KVkTu_9w-bDmxATGAh7KXZy87ds1H-yC1NWJqOOhw72mgvIIAcs2jlJE_zILLlTlArytsx2UkHUFQBQHnyLEmCBYjrcvMh6HO50ky90H0YO-fHkff13ul9yd0YwzmfregCAotgzCEVeqYCqssFKglfNmpV17ih6TsZE1GqFCn5zLVvzmYGj_PD0y5jyMqJXnWfll3vORTyty1y-CEZ3KEFGjBjMmJsNJOleQszSA9ExjPA" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">{t('result.expert_insight')}</p>
                      <p className="text-[10px] text-on-surface-variant">{t('result.acharya')}</p>
                    </div>
                  </div>
                  <blockquote className="text-sm italic text-on-surface font-medium leading-relaxed">
                    "{matchResult?.overallRecommendation}"
                  </blockquote>
                </div>
              </section>

              {/* Actions */}
              <section className="space-y-4 pb-12 mt-8">
                <button 
                  onClick={() => { haptic.light(); downloadPDF(); }}
                  disabled={isGeneratingPdf}
                  className="w-full h-14 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold shadow-[0_12px_24px_rgba(144,77,0,0.2)] active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <span className="material-symbols-outlined">download</span>}
                  {isGeneratingPdf ? 'Saving...' : t('btn.download')}
                </button>
                <button 
                  onClick={() => { haptic.light(); handleIndepthCheck(); }}
                  disabled={isLoadingIndepth}
                  className="w-full h-14 bg-white/60 backdrop-blur-xl border border-primary/20 text-primary rounded-full font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoadingIndepth ? <Loader2 size={18} className="animate-spin" /> : <span className="material-symbols-outlined">psychology</span>}
                  {isLoadingIndepth ? 'Analyzing...' : t('btn.indepth')}
                </button>
              </section>
            </motion.div>
          )}



          {view === 'muhurtham' && (
            <motion.div 
              key="muhurtham"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative min-h-screen pb-24"
            >
              <div className="relative z-10 space-y-8">
                {/* Hero Headline Section */}
                <section className="mt-4">
                  <h1 className="text-3xl font-extrabold text-on-surface tracking-tight leading-tight">
                    {t('muhurtham.auspicious_alignment')} <br/>
                    <span className="text-primary font-light">{t('muhurtham.dasa_timeline')}</span>
                  </h1>
                  <p className="mt-2 text-on-surface-variant text-sm font-medium opacity-80">{t('muhurtham.desc')}</p>
                </section>

                {/* Muhurtham Strength Gauge */}
                <section className="glass-card rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-container/10 rounded-full blur-3xl"></div>
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{t('muhurtham.current_phase')}</span>
                      <h2 className="text-xl font-bold">{t('muhurtham.strength')}</h2>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-primary">84%</span>
                    </div>
                  </div>
                  <div className="relative h-3 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#904D00] to-[#F2994A] rounded-full" style={{ width: '84%' }}></div>
                  </div>
                  <div className="mt-4 flex justify-between text-[11px] font-semibold text-on-surface-variant">
                    <span>{t('muhurtham.90day')}</span>
                    <span className="text-primary">{t('muhurtham.high_alignment')}</span>
                  </div>
                </section>

                {/* Growth Synergy Card */}
                <section className="bg-gradient-to-br from-primary to-secondary-container rounded-[32px] p-6 text-white shadow-xl shadow-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                      <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>flare</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{t('muhurtham.growth_synergy')}</h3>
                      <p className="text-sm text-white/90 leading-relaxed mt-1 font-medium">
                        {t('muhurtham.growth_desc')}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Auspicious Dates Horizontal Scroll */}
                <section>
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="text-lg font-bold">{t('muhurtham.upcoming_dates')}</h2>
                    <button onClick={() => { haptic.light(); setIsMuhurthamCalendarOpen(true); }} className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full active:scale-95 transition-transform">{t('muhurtham.view_calendar')}</button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                    {/* Date 1 */}
                    <div className="min-w-[140px] glass-card rounded-3xl p-5 flex flex-col items-center justify-center space-y-3 shadow-sm border border-white/40">
                      <div className="w-12 h-12 bg-surface-container-highest rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">brightness_7</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xs font-bold text-on-surface-variant">SEPT 14</span>
                        <span className="text-sm font-extrabold text-on-surface">{t('muhurtham.marriage')}</span>
                      </div>
                    </div>
                    {/* Date 2 */}
                    <div className="min-w-[140px] glass-card rounded-3xl p-5 flex flex-col items-center justify-center space-y-3 shadow-sm border border-white/40">
                      <div className="w-12 h-12 bg-surface-container-highest rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">house</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xs font-bold text-on-surface-variant">OCT 02</span>
                        <span className="text-sm font-extrabold text-on-surface">{t('muhurtham.house')}</span>
                      </div>
                    </div>
                    {/* Date 3 */}
                    <div className="min-w-[140px] glass-card rounded-3xl p-5 flex flex-col items-center justify-center space-y-3 shadow-sm border border-white/40">
                      <div className="w-12 h-12 bg-surface-container-highest rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">payments</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xs font-bold text-on-surface-variant">OCT 18</span>
                        <span className="text-sm font-extrabold text-on-surface">{t('muhurtham.wealth')}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Vimshottari Dasa Flow */}
                <section className="space-y-6">
                  <h2 className="text-lg font-bold px-2">{t('muhurtham.vimshottari')} ({girlDetails.name.split(' ')[0]})</h2>
                  <div className="relative space-y-8 pl-8">
                    {/* Timeline Line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-surface-variant to-surface-variant opacity-40"></div>
                    
                    {(() => {
                      const now = new Date();
                      const currentIndex = girlDasa.findIndex(d => now >= d.startDate && now <= d.endDate);
                      const displayDasas = currentIndex !== -1 
                        ? girlDasa.slice(currentIndex, currentIndex + 4)
                        : girlDasa.slice(0, 4);

                      return displayDasas.map((dasa, idx) => {
                        const isCurrent = idx === 0;
                        const progress = isCurrent 
                          ? Math.max(0, Math.min(100, ((now.getTime() - dasa.startDate.getTime()) / (dasa.endDate.getTime() - dasa.startDate.getTime())) * 100))
                          : 0;

                        return (
                          <div key={dasa.planet} className={`relative ${!isCurrent ? 'opacity-60' : ''}`}>
                            <div className={`absolute -left-[29px] top-1 ${isCurrent ? 'w-5 h-5 bg-primary ring-4 ring-primary/20' : 'w-4 h-4 bg-surface-variant border-2 border-white'} rounded-full flex items-center justify-center`}>
                              {isCurrent && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <div className={`glass-card rounded-[24px] p-5 shadow-sm ${isCurrent ? 'border-l-4 border-primary' : ''}`}>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className={`font-extrabold ${isCurrent ? 'text-primary' : ''}`}>{dasa.planet} {t('muhurtham.mahadasa')}</h4>
                                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                                    {isCurrent ? t('muhurtham.current_period') : idx === 1 ? t('muhurtham.next_major') : t('muhurtham.upcoming')}
                                  </p>
                                </div>
                                <span className={`text-xs font-bold ${isCurrent ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'} px-2 py-0.5 rounded-lg`}>
                                  {dasa.startYear} - {dasa.endYear}
                                </span>
                              </div>
                              {isCurrent && (
                                <div className="bg-surface-container-low rounded-xl p-3 mt-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold">Active Period</span>
                                    <span className="text-[10px] font-bold text-on-surface-variant">Ends {dasa.endYear}</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-surface-variant rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${progress}%` }}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </section>

                {/* Astrology Background Texture/Graphic */}
                <div className="flex justify-center py-8 opacity-20 pointer-events-none">
                  <svg className="w-48 h-48 stroke-primary fill-none" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" strokeWidth="0.5"></circle>
                    <circle cx="100" cy="100" r="60" strokeWidth="0.5"></circle>
                    <path d="M100 10 L100 190 M10 100 L190 100 M36.4 36.4 L163.6 163.6 M163.6 36.4 L36.4 163.6" strokeWidth="0.5"></path>
                    <text className="fill-primary text-[8px] font-bold" x="95" y="25">ARI</text>
                    <text className="fill-primary text-[8px] font-bold" x="175" y="105">CAN</text>
                    <text className="fill-primary text-[8px] font-bold" x="95" y="185">LIB</text>
                    <text className="fill-primary text-[8px] font-bold" x="15" y="105">CAP</text>
                  </svg>
                </div>

                {/* Floating Action Button for detailed report */}
                <div className="fixed bottom-24 right-6 z-40">
                  <button 
                    onClick={() => { haptic.light(); setView('analysis'); }}
                    className="w-14 h-14 bg-gradient-to-tr from-primary to-primary-container rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-white active:scale-90 transition-transform duration-150"
                  >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'chart' && (
            <motion.div 
              key="chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative min-h-screen pb-32"
            >
              <div className="relative z-10 space-y-8">
                <section className="space-y-1 mt-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-on-surface leading-tight">{t('chart.rashi_chakram')}</h1>
                  <p className="text-on-surface-variant/70 font-medium">{t('chart.planetary_positions')}</p>
                </section>

                {/* Boy's Chart */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">{t('chart.boy_chart')}</h2>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t('chart.natal')}</span>
                  </div>
                  <div className="glass-card rounded-[32px] p-4 shadow-sm border border-white/50">
                    <div className="rasi-grid w-full overflow-hidden rounded-2xl bg-white/40">
                      {/* Row 1 */}
                      <div className="rasi-cell border-t-0 border-l-0 text-[10px] font-bold text-on-surface-variant">PI</div>
                      <div className="rasi-cell border-t-0 text-[10px] font-bold text-on-surface-variant">AR</div>
                      <div className="rasi-cell border-t-0 text-[10px] font-bold text-on-surface-variant">TA <span className="text-primary mt-1">JU</span></div>
                      <div className="rasi-cell border-t-0 border-r-0 text-[10px] font-bold text-on-surface-variant">GE</div>
                      {/* Row 2 */}
                      <div className="rasi-cell border-l-0 text-[10px] font-bold text-on-surface-variant">AQ <span className="text-primary mt-1">SA</span></div>
                      <div className="rasi-center flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-[10px] font-bold text-on-surface-variant/40 block mb-1">ASC</span>
                          <span className="text-sm font-extrabold text-primary">Karka</span>
                        </div>
                      </div>
                      <div className="rasi-cell border-r-0 text-[10px] font-bold text-on-surface-variant">CN <span className="text-primary mt-1">MO</span></div>
                      {/* Row 3 */}
                      <div className="rasi-cell border-l-0 text-[10px] font-bold text-on-surface-variant">CP</div>
                      <div className="rasi-cell border-r-0 text-[10px] font-bold text-on-surface-variant">LE <span className="text-primary mt-1">SU</span></div>
                      {/* Row 4 */}
                      <div className="rasi-cell border-b-0 border-l-0 text-[10px] font-bold text-on-surface-variant">SA</div>
                      <div className="rasi-cell border-b-0 text-[10px] font-bold text-on-surface-variant">SC <span className="text-primary mt-1">MA</span></div>
                      <div className="rasi-cell border-b-0 text-[10px] font-bold text-on-surface-variant">LI <span className="text-primary mt-1">VE</span></div>
                      <div className="rasi-cell border-b-0 border-r-0 text-[10px] font-bold text-on-surface-variant">VI <span className="text-primary mt-1">ME</span></div>
                    </div>
                    <div className="mt-4 px-2 py-3 bg-surface-container-low/50 rounded-2xl flex justify-around text-center">
                      <div>
                        <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase">{t('chart.nakshatra')}</p>
                        <p className="text-xs font-bold text-on-surface">{lang === 'ml' ? NAKSHATRAS.find(n => n.id === boyDetails.starId)?.malayalamName : NAKSHATRAS.find(n => n.id === boyDetails.starId)?.name || 'Rohini'}</p>
                      </div>
                      <div className="w-px h-6 bg-outline-variant/20"></div>
                      <div>
                        <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase">{t('chart.rasi')}</p>
                        <p className="text-xs font-bold text-on-surface">Vrishabha</p>
                      </div>
                      <div className="w-px h-6 bg-outline-variant/20"></div>
                      <div>
                        <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase">{t('chart.pada')}</p>
                        <p className="text-xs font-bold text-on-surface">2</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Girl's Chart */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">{t('chart.girl_chart')}</h2>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t('chart.natal')}</span>
                  </div>
                  <div className="glass-card rounded-[32px] p-4 shadow-sm border border-white/50">
                    <div className="rasi-grid w-full overflow-hidden rounded-2xl bg-white/40">
                      {/* Row 1 */}
                      <div className="rasi-cell border-t-0 border-l-0 text-[10px] font-bold text-on-surface-variant">PI <span className="text-primary mt-1">MA</span></div>
                      <div className="rasi-cell border-t-0 text-[10px] font-bold text-on-surface-variant">AR</div>
                      <div className="rasi-cell border-t-0 text-[10px] font-bold text-on-surface-variant">TA</div>
                      <div className="rasi-cell border-t-0 border-r-0 text-[10px] font-bold text-on-surface-variant">GE <span className="text-primary mt-1">JU</span></div>
                      {/* Row 2 */}
                      <div className="rasi-cell border-l-0 text-[10px] font-bold text-on-surface-variant">AQ</div>
                      <div className="rasi-center flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-[10px] font-bold text-on-surface-variant/40 block mb-1">ASC</span>
                          <span className="text-sm font-extrabold text-primary">Simha</span>
                        </div>
                      </div>
                      <div className="rasi-cell border-r-0 text-[10px] font-bold text-on-surface-variant">CN <span className="text-primary mt-1">SU</span></div>
                      {/* Row 3 */}
                      <div className="rasi-cell border-l-0 text-[10px] font-bold text-on-surface-variant">CP <span className="text-primary mt-1">SA</span></div>
                      <div className="rasi-cell border-r-0 text-[10px] font-bold text-on-surface-variant">LE <span className="text-primary mt-1">ME</span></div>
                      {/* Row 4 */}
                      <div className="rasi-cell border-b-0 border-l-0 text-[10px] font-bold text-on-surface-variant">SA <span className="text-primary mt-1">MO</span></div>
                      <div className="rasi-cell border-b-0 text-[10px] font-bold text-on-surface-variant">SC</div>
                      <div className="rasi-cell border-b-0 text-[10px] font-bold text-on-surface-variant">LI <span className="text-primary mt-1">VE</span></div>
                      <div className="rasi-cell border-b-0 border-r-0 text-[10px] font-bold text-on-surface-variant">VI</div>
                    </div>
                    <div className="mt-4 px-2 py-3 bg-surface-container-low/50 rounded-2xl flex justify-around text-center">
                      <div>
                        <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase">{t('chart.nakshatra')}</p>
                        <p className="text-xs font-bold text-on-surface">{lang === 'ml' ? NAKSHATRAS.find(n => n.id === girlDetails.starId)?.malayalamName : NAKSHATRAS.find(n => n.id === girlDetails.starId)?.name || 'Moola'}</p>
                      </div>
                      <div className="w-px h-6 bg-outline-variant/20"></div>
                      <div>
                        <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase">{t('chart.rasi')}</p>
                        <p className="text-xs font-bold text-on-surface">Dhanu</p>
                      </div>
                      <div className="w-px h-6 bg-outline-variant/20"></div>
                      <div>
                        <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase">{t('chart.pada')}</p>
                        <p className="text-xs font-bold text-on-surface">1</p>
                      </div>
                    </div>
                  </div>
                </section>
                {/* Action Buttons */}
                <section className="space-y-3 pt-4">
                  <button 
                    onClick={() => { haptic.light(); downloadPDF(); }}
                    className="w-full bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-fixed font-bold py-4 rounded-full shadow-xl shadow-orange-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    {t('action.download_report')}
                  </button>
                  <button 
                    onClick={() => { haptic.light(); setView('basic'); }}
                    className="w-full bg-white/40 backdrop-blur-md border border-white/60 text-on-surface-variant font-bold py-4 rounded-full active:scale-[0.98] transition-all"
                  >
                    {t('action.back_to_dashboard')}
                  </button>
                </section>
              </div>
            </motion.div>
          )}

          {view === 'analysis' && indepthResult && (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="relative min-h-screen pb-32"
              id="report-content"
            >
              {/* Background Graphic Elements */}
              <div className="absolute top-20 right-[-20%] opacity-10 w-64 h-64 rotate-12 pointer-events-none z-0">
                <img 
                  className="w-full h-full object-contain" 
                  alt="Celestial patterns" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB62n4Y_onNANxK-i_mulUA3DcednmezvkPBzy8JjV4IbwHU04XuS9V4k0yKvvTxhEFMtCrQ1J8dqVBLRh6l2_cek4-A0dJoZpqdmoSmUBIlvIuTS_qen5EJWgVrIRLIQ5EzDHHyv37qoDtCgjiU3unM7U5ZPjPlPRMHGQytFoPE9ED1glt5toKM07VD8lbwTKGUEYvON2SBiktI81H2Bvm7ffqHaqvSrRWfLqvbop3PqnxhsuDptPSTyBSlR_orsPoD07RQrLFjA"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="relative z-10 space-y-8">
                {/* Headline */}
                <section className="pt-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2 leading-tight">
                    In-depth Cosmic <br/>
                    <span className="text-primary italic font-semibold">Analysis.</span>
                  </h1>
                  <p className="text-on-surface-variant text-sm font-medium leading-relaxed opacity-80">
                    A detailed verification of planetary alignment and dosha balancing for lifelong harmony.
                  </p>
                </section>

                {/* Celestial Analysis Card with Rashi Chart Button */}
                <section>
                  <div className="glass-card rounded-[32px] p-6 shadow-sm border border-white/40 bg-celestial-gradient text-white">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold">Rashi Chakram</h2>
                        <p className="text-white/70 text-xs mt-1 font-medium">Planetary positions & alignments</p>
                      </div>
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">grid_view</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex -space-x-3">
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-container flex items-center justify-center text-[10px] font-bold">B</div>
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container">G</div>
                      </div>
                      <div className="text-xs font-medium text-white/90">
                        {t('indepth.detailed_natal')}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => { haptic.light(); setView('chart'); }}
                        className="w-full py-4 bg-white text-primary font-extrabold rounded-2xl shadow-lg shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        {t('indepth.view_rashi')}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                      <button 
                        onClick={() => { haptic.light(); downloadPDF(); }}
                        className="w-full py-3 bg-white/20 text-white border border-white/30 font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        {t('action.download_pdf')}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Papasamyam Balance Card */}
                <section>
                  <div className="glass-card rounded-[32px] p-6 shadow-sm border border-white/40">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold text-on-surface">{t('indepth.papasamyam')}</h2>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider ${
                        indepthResult.papasamyam.isCompatible ? 'bg-[#e7f5ed] text-[#1e5d3c]' : 'bg-error-container text-on-error-container'
                      }`}>
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {indepthResult.papasamyam.isCompatible ? 'check_circle' : 'warning'}
                        </span> 
                        {indepthResult.papasamyam.isCompatible ? t('indepth.balanced') : t('indepth.high_deviation')}
                      </span>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Boy */}
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                          <span>{boyDetails.name.split(' ')[0]}</span>
                          <span className="text-primary">{indepthResult.papasamyam.boyScore} {t('indepth.score')}</span>
                        </div>
                        <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(indepthResult.papasamyam.boyScore / 20) * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
                          />
                        </div>
                      </div>
                      
                      {/* Girl */}
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                          <span>{girlDetails.name.split(' ')[0]}</span>
                          <span className="text-primary">{indepthResult.papasamyam.girlScore} {t('indepth.score')}</span>
                        </div>
                        <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(indepthResult.papasamyam.girlScore / 20) * 100}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full opacity-80"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-6 text-xs text-on-surface-variant leading-relaxed italic border-t border-outline-variant/10 pt-4">
                      {indepthResult.papasamyam.description}
                    </p>
                  </div>
                </section>

                {/* Kuja Dosham Analysis */}
                <section className="grid grid-cols-2 gap-4">
                  {/* Boy */}
                  <div className="bg-surface-container-low rounded-[28px] p-5 flex flex-col items-center justify-center text-center glass-card">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${indepthResult.chovvaDosham.boyHasDosham ? 'bg-error-container' : 'bg-surface-container-highest'}`}>
                      <span className={`material-symbols-outlined ${indepthResult.chovvaDosham.boyHasDosham ? 'text-error' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: indepthResult.chovvaDosham.boyHasDosham ? "'FILL' 1" : "" }}>
                        {indepthResult.chovvaDosham.boyHasDosham ? 'flare' : 'bedtime'}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-on-surface mb-1">{t('indepth.kuja_dosham')}</h3>
                    <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant mb-3 font-semibold">{boyDetails.name.split(' ')[0]}</p>
                    <div className={`bg-white px-4 py-1.5 rounded-full text-[11px] font-bold shadow-sm ${indepthResult.chovvaDosham.boyHasDosham ? 'text-error' : 'text-[#1e5d3c]'}`}>
                      {indepthResult.chovvaDosham.boyStatus === 'ACTIVE_DOSHA' ? t('indepth.present') : 
                       indepthResult.chovvaDosham.boyStatus === 'DOSHA_CANCELLED' ? (lang === 'ml' ? 'പരിഹൃത ദോഷം' : 'Cancelled') : t('indepth.absent')}
                    </div>
                  </div>

                  {/* Girl */}
                  <div className="bg-surface-container-low rounded-[28px] p-5 flex flex-col items-center justify-center text-center glass-card">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${indepthResult.chovvaDosham.girlHasDosham ? 'bg-error-container' : 'bg-surface-container-highest'}`}>
                      <span className={`material-symbols-outlined ${indepthResult.chovvaDosham.girlHasDosham ? 'text-error' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: indepthResult.chovvaDosham.girlHasDosham ? "'FILL' 1" : "" }}>
                        {indepthResult.chovvaDosham.girlHasDosham ? 'flare' : 'bedtime'}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-on-surface mb-1">{t('indepth.kuja_dosham')}</h3>
                    <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant mb-3 font-semibold">{girlDetails.name.split(' ')[0]}</p>
                    <div className={`bg-white px-4 py-1.5 rounded-full text-[11px] font-bold shadow-sm ${indepthResult.chovvaDosham.girlHasDosham ? 'text-error' : 'text-[#1e5d3c]'}`}>
                      {indepthResult.chovvaDosham.girlStatus === 'ACTIVE_DOSHA' ? t('indepth.present') : 
                       indepthResult.chovvaDosham.girlStatus === 'DOSHA_CANCELLED' ? (lang === 'ml' ? 'പരിഹൃത ദോഷം' : 'Cancelled') : t('indepth.absent')}
                    </div>
                  </div>

                  <div className="col-span-2 bg-white/40 p-4 rounded-2xl border border-outline-variant/10 glass-card">
                    <p className="text-[11px] text-on-surface-variant leading-tight">
                      <strong className="text-on-surface">{t('indepth.insight')}:</strong> {indepthResult.chovvaDosham.description}
                    </p>
                  </div>
                </section>

                {/* Bhava Analysis */}
                <section>
                  <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-on-surface-variant mb-4 ml-1">{t('indepth.bhava_analysis')}</h2>
                  <div className="flex flex-col gap-3">
                    {[
                      { house: t('indepth.house_1'), status: t('indepth.strong'), desc: t('indepth.desc_1'), icon: 'person_outline' },
                      { house: t('indepth.house_7'), status: t('indepth.promising'), desc: t('indepth.desc_7'), icon: 'favorite' },
                      { house: t('indepth.house_8'), status: t('indepth.balanced_status'), desc: t('indepth.desc_8'), icon: 'shield' }
                    ].map((item, idx) => (
                      <motion.div 
                        key={item.house}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-outline-variant/5 glass-card"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">{item.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-xs font-bold">{item.house}</h4>
                            <span className="text-[10px] text-primary font-bold">{item.status}</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant leading-none">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Celestial Recommendation */}
                <section className="pb-10">
                  <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#904D00] to-[#F2994A] p-8 text-white shadow-xl">
                    {/* Sparkle decorations */}
                    <span className="material-symbols-outlined absolute top-4 right-8 text-white/20 text-4xl">stars</span>
                    <span className="material-symbols-outlined absolute bottom-10 left-4 text-white/10 text-6xl">flare</span>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-white/80">{t('indepth.celestial_recommendation')}</h3>
                      
                      <div className="relative mb-6">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle className="text-white/10" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                          <motion.circle 
                            initial={{ strokeDashoffset: 364.4 }}
                            animate={{ strokeDashoffset: 364.4 - (364.4 * (matchResult?.totalScore || 0) / 10) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="text-white" 
                            cx="64" cy="64" 
                            fill="transparent" 
                            r="58" 
                            stroke="currentColor" 
                            strokeDasharray="364.4" 
                            strokeLinecap="round" 
                            strokeWidth="8"
                          ></motion.circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black">{((matchResult?.totalScore || 0) * 10).toFixed(0)}%</span>
                          <span className="text-[10px] font-bold uppercase">Score</span>
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium leading-relaxed mb-6 px-2">
                        {indepthResult.overallRecommendation}
                      </p>
                      
                      <div className="flex flex-col gap-3 w-full">
                        <button 
                          onClick={() => { haptic.light(); downloadPDF(); }}
                          className="w-full py-4 px-6 bg-white text-primary rounded-full font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform duration-200"
                        >
                          <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                          Download Detailed PDF
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => { haptic.light(); setView('muhurtham'); }}
                            className="w-full py-3 px-4 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform duration-200"
                          >
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            Muhurtham
                          </button>
                          <button 
                            onClick={() => { haptic.light(); setView('basic'); }}
                            className="w-full py-3 px-4 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform duration-200"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {view === 'janam-kundli' && (
            <motion.div 
              key="janam-kundli"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative min-h-screen pb-24"
            >
              <section className="text-center space-y-6 pt-4">
                <div className="space-y-1">
                  <p className="text-primary font-bold tracking-widest text-[10px] uppercase">{t('page.kundli.subtitle')}</p>
                  <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">{t('page.kundli.title')}</h1>
                </div>
                <div className="bg-white/60 backdrop-blur-2xl rounded-[32px] p-8 shadow-sm border border-white/40 text-left">
                  <p className="text-on-surface-variant leading-relaxed text-sm mb-6">
                    {t('page.kundli.desc')}
                  </p>
                  <div className="space-y-4">
                    <div className="bg-surface-container-low p-4 rounded-2xl">
                      <h3 className="font-bold text-on-surface mb-1">{t('page.kundli.planetary')}</h3>
                      <p className="text-xs text-on-surface-variant">{t('page.kundli.planetary_desc')}</p>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-2xl">
                      <h3 className="font-bold text-on-surface mb-1">{t('page.kundli.dasha')}</h3>
                      <p className="text-xs text-on-surface-variant">{t('page.kundli.dasha_desc')}</p>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-2xl">
                      <h3 className="font-bold text-on-surface mb-1">{t('page.kundli.yoga')}</h3>
                      <p className="text-xs text-on-surface-variant">{t('page.kundli.yoga_desc')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <button 
                      onClick={() => setView('general-horoscope')}
                      className="flex-1 bg-primary text-white font-semibold py-4 rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-transform text-sm"
                    >
                      {lang === 'ml' ? 'ജാതകം കാണുക' : 'Generate Full Jathakam'}
                    </button>
                    <button 
                      onClick={() => setView('home')}
                      className="px-6 py-4 bg-slate-100 text-slate-700 font-semibold rounded-full active:scale-95 transition-transform text-sm text-center"
                    >
                      {t('action.back_to_home')}
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}


        {/* About Us View */}
      {view === 'about' && (
          <motion.div 
            key="about"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 px-4 max-w-xl mx-auto w-full pt-6 pb-24"
          >
            <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-6">{t('page.about.title')}</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>{t('page.about.p1')}</p>
                <p>{t('page.about.p2')}</p>
                <p>{t('page.about.p3')}</p>
              </div>
              <button 
                onClick={() => setView('home')}
                className="mt-8 w-full py-4 bg-slate-100 text-slate-800 font-bold rounded-full active:scale-95 transition-transform"
              >
                {t('action.back_to_home')}
              </button>
            </div>
          </motion.div>
        )}

      {/* Contact Us View */}
      {view === 'contact' && (
          <motion.div 
            key="contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 px-4 max-w-xl mx-auto w-full pt-6 pb-24"
          >
            <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-6">{t('page.contact.title')}</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('page.contact.email')}</p>
                    <p className="text-slate-800 font-medium">support@gridastro.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('page.contact.address')}</p>
                    <p className="text-slate-800 font-medium">123 Celestial Way, Star City, Kerala</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('page.contact.phone')}</p>
                    <p className="text-slate-800 font-medium">+91 98765 43210</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setView('home')}
                className="mt-10 w-full py-4 bg-primary text-white font-bold rounded-full active:scale-95 transition-transform"
              >
                {t('action.send_message')}
              </button>
            </div>
          </motion.div>
        )}

      {/* Privacy Policy View */}
      {view === 'privacy' && (
          <motion.div 
            key="privacy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 px-4 max-w-xl mx-auto w-full pt-6 pb-24"
          >
            <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-6">{t('page.privacy.title')}</h2>
              <div className="space-y-4 text-slate-600 text-sm leading-relaxed overflow-y-auto max-h-[400px] pr-2">
                <p className="font-bold text-slate-800">1. Data Collection</p>
                <p>{t('page.privacy.p1')}</p>
                <p className="font-bold text-slate-800">2. Usage</p>
                <p>{t('page.privacy.p2')}</p>
                <p className="font-bold text-slate-800">3. Security</p>
                <p>{t('page.privacy.p3')}</p>
              </div>
              <button 
                onClick={() => setView('home')}
                className="mt-8 w-full py-4 bg-slate-100 text-slate-800 font-bold rounded-full active:scale-95 transition-transform"
              >
                {t('action.back_to_home')}
              </button>
            </div>
          </motion.div>
        )}

      {/* Terms of Service View */}
      {view === 'terms' && (
          <motion.div 
            key="terms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 px-4 max-w-xl mx-auto w-full pt-6 pb-24"
          >
            <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-6">{t('page.terms.title')}</h2>
              <div className="space-y-4 text-slate-600 text-sm leading-relaxed overflow-y-auto max-h-[400px] pr-2">
                <p className="font-bold text-slate-800">1. Acceptance of Terms</p>
                <p>{t('page.terms.p1')}</p>
                <p className="font-bold text-slate-800">2. Accuracy of Data</p>
                <p>{t('page.terms.p2')}</p>
                <p className="font-bold text-slate-800">3. User Responsibility</p>
                <p>{t('page.terms.p3')}</p>
              </div>
              <button 
                onClick={() => setView('home')}
                className="mt-8 w-full py-4 bg-slate-100 text-slate-800 font-bold rounded-full active:scale-95 transition-transform"
              >
                {t('action.back_to_home')}
              </button>
            </div>
          </motion.div>
        )}

      {/* Help Center View */}
      {view === 'help' && (
          <motion.div 
            key="help"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 px-4 max-w-xl mx-auto w-full pt-6 pb-24"
          >
            <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-6">{t('page.help.title')}</h2>
              <div className="space-y-4">
                {[
                  { q: t('page.help.q1'), a: t('page.help.a1') },
                  { q: t('page.help.q2'), a: t('page.help.a2') },
                  { q: t('page.help.q3'), a: t('page.help.a3') }
                ].map((item) => (
                  <div key={item.q} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-bold text-slate-800 text-sm mb-1">{item.q}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setView('home')}
                className="mt-8 w-full py-4 bg-primary text-white font-bold rounded-full active:scale-95 transition-transform"
              >
                {t('action.contact_support')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Housewarming Muhurtham View */}
        {view === 'housewarming' && (
          <motion.div
            key="housewarming"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <HousewarmingView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* General Horoscope View */}
        {view === 'general-horoscope' && (
          <motion.div
            key="general-horoscope"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <GeneralHoroscopeView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Vehicle Muhurtham View */}
        {view === 'vahana-muhurtham' && (
          <motion.div
            key="vahana-muhurtham"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <VahanaMuhurthamView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Baby Naming View */}
        {view === 'baby-naming' && (
          <motion.div
            key="baby-naming"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <BabyNamingView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Prashna Kundali View */}
        {view === 'prashna-kundali' && (
          <motion.div
            key="prashna-kundali"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <PrashnaKundaliView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Transit & Ezharashani View */}
        {view === 'transit-forecast' && (
          <motion.div
            key="transit-forecast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <TransitForecastView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Bhoomi Puja & Foundation View */}
        {view === 'bhoomi-puja' && (
          <motion.div
            key="bhoomi-puja"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <BhoomiPujaView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Early Life Samskaras View */}
        {view === 'early-life-samskaras' && (
          <motion.div
            key="early-life-samskaras"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <EarlyLifeSamskarasView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Vyapar / Business Launch Muhurtham View */}
        {view === 'vyapar-muhurtham' && (
          <motion.div
            key="vyapar-muhurtham"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <VyaparMuhurthamView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Career & Vocational Direction View */}
        {view === 'career-vocational' && (
          <motion.div
            key="career-vocational"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <CareerVocationalView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Medical Astrology & Surgery Timing View */}
        {view === 'medical-astrology' && (
          <motion.div
            key="medical-astrology"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <MedicalAstrologyView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Financial & Wealth Forecasting View */}
        {view === 'financial-wealth' && (
          <motion.div
            key="financial-wealth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <FinancialWealthView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Remedial Prescriptions & Vazhipadu View */}
        {view === 'remedial-prescriptions' && (
          <motion.div
            key="remedial-prescriptions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <RemedialPrescriptionsView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Travel & Migration Timing View */}
        {view === 'yatra-muhurtham' && (
          <motion.div
            key="yatra-muhurtham"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <YatraMuhurthamView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Spiritual Initiation & Diksha View */}
        {view === 'spiritual-initiation' && (
          <motion.div
            key="spiritual-initiation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <SpiritualInitiationView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Litigation Strategy & Disputes View */}
        {view === 'litigation-strategy' && (
          <motion.div
            key="litigation-strategy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <LitigationStrategyView onBack={() => setView('home')} />
          </motion.div>
        )}

        {/* Astrometeorology & Relocation View */}
        {view === 'astrometeorology' && (
          <motion.div
            key="astrometeorology"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-xl mx-auto w-full"
          >
            <AstrometeorologyView onBack={() => setView('home')} />
          </motion.div>
        )}
        </AnimatePresence>



      {/* Explanation Modal */}
      <AnimatePresence>
        {selectedExplanation && (
          <motion.div
            key="explanation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedExplanation(null)}
            className="fixed inset-0 z-[100] bg-surface-container-highest/40 backdrop-blur-md"
          />
        )}
        {selectedExplanation && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="explanation-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/50 overflow-hidden pointer-events-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-on-surface tracking-tight">{selectedExplanation.malayalamTitle}</h3>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">{selectedExplanation.title}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedExplanation(null)}
                    className="p-2 rounded-2xl bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-surface-container-lowest/50 rounded-3xl p-5 border border-white/20">
                    <p className="text-on-surface leading-relaxed text-lg font-bold">
                      {selectedExplanation.malayalamDescription}
                    </p>
                  </div>
                  <div className="h-px bg-surface-variant/20 w-full" />
                  <div className="px-2">
                    <p className="text-on-surface-variant leading-relaxed text-sm italic font-medium">
                      {selectedExplanation.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedExplanation(null)}
                  className="w-full mt-8 py-5 bg-primary text-on-primary rounded-[24px] font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {t('action.understood')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            key="menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
        )}
        {isMenuOpen && (
          <motion.div 
            key="menu-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[320px] sm:w-[360px] max-w-[85vw] bg-white z-[101] shadow-2xl flex flex-col"
          >
              <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-br from-primary/5 to-transparent">
                <div className="text-xl tracking-tight text-slate-900 flex items-center gap-0.5 [&_span:first-child]:font-bold [&_span:last-child]:font-light">
                  <span>Grid</span><span>Astro</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all shrink-0"
                  aria-label="Close menu"
                >
                  <span className="material-symbols-outlined text-slate-500">close</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4 sm:py-5">
                {/* Main Navigation */}
                <div className="px-3.5 sm:px-4 mb-4 sm:mb-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-2">{t('nav.main_menu')}</p>
                  <nav className="space-y-1">
                    {[
                      { id: 'home', icon: 'home', label: t('nav.home'), view: 'home' },
                      { id: 'compatibility', icon: 'favorite', label: t('nav.compatibility'), view: 'form' },
                      { id: 'chart', icon: 'grid_view', label: t('nav.rashi_chart'), view: 'chart' },
                      { id: 'kundli', icon: 'explore', label: t('nav.janam_kundli'), view: 'janam-kundli' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setView(item.view as ViewState);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all min-h-[44px] ${
                          view === item.view ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                        <span className="text-sm text-left flex-1 min-w-0 leading-snug whitespace-normal">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Essential Vedic Astrology Services */}
                <div className="px-3.5 sm:px-4 mb-4 sm:mb-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-2">{t('nav.astrology_services')}</p>
                  <nav className="space-y-1">
                    {[
                      { id: 'general-horoscope', icon: 'psychology', label: t('nav.general_horoscope'), view: 'general-horoscope' },
                      { id: 'prashna-kundali', icon: 'help_outline', label: t('nav.prashna_kundali'), view: 'prashna-kundali' },
                      { id: 'transit-forecast', icon: 'track_changes', label: t('nav.transit_forecast'), view: 'transit-forecast' },
                      { id: 'career', icon: 'work', label: t('nav.career_vocational'), view: 'career-vocational' },
                      { id: 'medical', icon: 'local_hospital', label: t('nav.medical_astrology'), view: 'medical-astrology' },
                      { id: 'financial', icon: 'payments', label: t('nav.financial_wealth'), view: 'financial-wealth' },
                      { id: 'remedial', icon: 'diamond', label: t('nav.remedial_prescriptions'), view: 'remedial-prescriptions' },
                      { id: 'vyapar', icon: 'storefront', label: t('nav.vyapar_muhurtham'), view: 'vyapar-muhurtham' },
                      { id: 'housewarming', icon: 'cottage', label: t('nav.housewarming'), view: 'housewarming' },
                      { id: 'bhoomi', icon: 'foundation', label: t('nav.bhoomi_puja'), view: 'bhoomi-puja' },
                      { id: 'yatra', icon: 'flight_takeoff', label: t('nav.yatra_muhurtham'), view: 'yatra-muhurtham' },
                      { id: 'vahana', icon: 'directions_car', label: t('nav.vahana_muhurtham'), view: 'vahana-muhurtham' },
                      { id: 'naming', icon: 'child_care', label: t('nav.baby_naming'), view: 'baby-naming' },
                      { id: 'samskaras', icon: 'school', label: t('nav.early_samskaras'), view: 'early-life-samskaras' },
                      { id: 'spiritual', icon: 'self_improvement', label: t('nav.spiritual_initiation'), view: 'spiritual-initiation' },
                      { id: 'litigation', icon: 'gavel', label: t('nav.litigation_strategy'), view: 'litigation-strategy' },
                      { id: 'weather', icon: 'cloudy_snowing', label: t('nav.astrometeorology'), view: 'astrometeorology' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setView(item.view as ViewState);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 sm:py-3 rounded-2xl transition-all min-h-[44px] ${
                          view === item.view ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                        <span className="text-sm text-left flex-1 min-w-0 leading-snug whitespace-normal">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
                
                {/* Company & Info */}
                <div className="px-3.5 sm:px-4 mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-2">{t('nav.company')}</p>
                  <nav className="space-y-1">
                    {[
                      { id: 'about', icon: 'info', label: t('nav.about'), view: 'about' },
                      { id: 'contact', icon: 'mail', label: t('nav.contact'), view: 'contact' },
                      { id: 'help', icon: 'help', label: t('nav.help'), view: 'help' },
                      { id: 'privacy', icon: 'policy', label: t('nav.privacy'), view: 'privacy' },
                      { id: 'terms', icon: 'gavel', label: t('nav.terms'), view: 'terms' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setView(item.view as ViewState);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all min-h-[44px] ${
                          view === item.view ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                        <span className="text-sm text-left flex-1 min-w-0 leading-snug whitespace-normal">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
              
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">Grid Astro</p>
                    <p className="text-[10px] text-slate-500 truncate">Vedic Precision • 2026</p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 text-center">© 2026 Grid Astro. All rights reserved.</p>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
      </main>
    </div>

      {/* PDF Generation Overlay */}
      <AnimatePresence>
        {isGeneratingPdf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white"
          >
            <div className="w-20 h-20 relative mb-6">
              <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl animate-pulse">picture_as_pdf</span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Generating Report</h3>
            <p className="text-white/60 text-sm animate-pulse">Aligning celestial data for your PDF...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden PDF Report Template - Rendered off-screen for html2canvas */}
      <div className="fixed top-0 w-[800px] pointer-events-none" style={{ 
        left: '-9999px', 
        zIndex: -9999,
        backgroundColor: '#ffffff',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(144, 77, 0, 0.03) 0%, transparent 70%)'
      }} id="pdf-report-template">
        {/* Page 1: Match Report */}
        <div className="bg-white p-12 relative overflow-hidden" style={{ height: '1131px' }}>
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0 flex items-center justify-center">
            <svg viewBox="0 0 800 800" className="w-[150%] h-[150%] text-slate-900" fill="currentColor">
              <path d="M400 50 A350 350 0 1 1 399.9 50 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10"/>
              <path d="M400 100 A300 300 0 1 1 399.9 100 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M400 150 A250 250 0 1 1 399.9 150 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <g transform="translate(400, 400)">
                {Array.from({ length: 12 }).map((_, i) => (
                  <g key={`pdf1-${i}`} transform={`rotate(${i * 30}) translate(0, -325)`}>
                    <text textAnchor="middle" dominantBaseline="middle" fontSize="32" transform={`rotate(${-i * 30})`}>{ZODIAC_SIGNS[i]}</text>
                  </g>
                ))}
              </g>
            </svg>
          </div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-10 border-b pb-6">
              <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Grid Astro</h1>
              <p className="text-lg text-slate-500 uppercase tracking-widest font-semibold">Match Compatibility Report</p>
            </div>

            {/* Profiles */}
            <div className="flex justify-between items-center mb-12 bg-slate-50 p-6 rounded-2xl">
              <div className="text-center w-1/3">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Boy</p>
                <h2 className="text-2xl font-bold text-slate-800">{boyDetails.name || 'N/A'}</h2>
                <p className="text-primary font-medium mt-1">{getBoyStar()?.malayalamName} ({getBoyStar()?.name}) - {lang === 'ml' ? `പാദം ${boyDetails.pada || 1}` : `Pada ${boyDetails.pada || 1}`}</p>
                <p className="text-xs text-slate-500 font-medium">{boyDetails.rasi || getRasiFromNakshatraPada(boyDetails.starId, boyDetails.pada || 1)} Rasi</p>
              </div>
              <div className="w-1/3 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">favorite</span>
                </div>
              </div>
              <div className="text-center w-1/3">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Girl</p>
                <h2 className="text-2xl font-bold text-slate-800">{girlDetails.name || 'N/A'}</h2>
                <p className="text-primary font-medium mt-1">{getGirlStar()?.malayalamName} ({getGirlStar()?.name}) - {lang === 'ml' ? `പാദം ${girlDetails.pada || 1}` : `Pada ${girlDetails.pada || 1}`}</p>
                <p className="text-xs text-slate-500 font-medium">{girlDetails.rasi || getRasiFromNakshatraPada(girlDetails.starId, girlDetails.pada || 1)} Rasi</p>
              </div>
            </div>

            {/* Score */}
            {matchResult && (
              <div className="text-center mb-12">
                <div className="inline-block bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-[40px] border border-orange-200">
                  <p className="text-sm font-bold text-orange-800 uppercase tracking-widest mb-2">Overall Match Score</p>
                  <h3 className="text-6xl font-black text-primary">{Math.round(matchResult.totalScore * 10)}%</h3>
                </div>
              </div>
            )}

            {/* Detailed Scores */}
            {matchResult && (
              <div className="mb-20">
                <h4 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Detailed Porutham Analysis</h4>
                <div className="grid grid-cols-2 gap-4">
                  {matchResult.results.map((detail, idx) => (
                    <div key={`pdf-result-${idx}`} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">{detail.name}</p>
                        <p className="text-xs text-slate-500">{detail.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary">{detail.score}/{detail.maxScore}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Footer removed as requested */}
          </div>
        </div>

        {/* Page 2: In-depth Analysis */}
        {indepthResult && (
          <div className="bg-white p-12 relative overflow-hidden" style={{ height: '1131px' }}>
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0 flex items-center justify-center">
              <svg viewBox="0 0 800 800" className="w-[150%] h-[150%] text-slate-900" fill="currentColor">
                <path d="M400 50 A350 350 0 1 1 399.9 50 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10"/>
                <path d="M400 100 A300 300 0 1 1 399.9 100 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
                <path d="M400 150 A250 250 0 1 1 399.9 150 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                <g transform="translate(400, 400)">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <g key={`pdf2-${i}`} transform={`rotate(${i * 30}) translate(0, -325)`}>
                      <text textAnchor="middle" dominantBaseline="middle" fontSize="32" transform={`rotate(${-i * 30})`}>{ZODIAC_SIGNS[i]}</text>
                    </g>
                  ))}
                </g>
              </svg>
            </div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-10 border-b pb-6">
                <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Grid Astro</h1>
                <p className="text-lg text-slate-500 uppercase tracking-widest font-semibold">In-Depth Cosmic Analysis</p>
              </div>

              <div className="space-y-6 pb-20">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h5 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">balance</span>
                    Papasamyam (Dosha Balance)
                  </h5>
                  <p className="text-base text-slate-600 leading-relaxed">{indepthResult.papasamyam.description}</p>
                  <div className="mt-4 flex gap-6 text-sm font-medium bg-white p-4 rounded-xl inline-flex border border-slate-100">
                    <span className="text-slate-500">Boy Score: <span className="text-slate-800 text-lg ml-1">{indepthResult.papasamyam.boyScore}</span></span>
                    <div className="w-px bg-slate-200"></div>
                    <span className="text-slate-500">Girl Score: <span className="text-slate-800 text-lg ml-1">{indepthResult.papasamyam.girlScore}</span></span>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h5 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">warning</span>
                    Chovva Dosham (Kuja Dosham Check)
                  </h5>
                  <p className="text-base text-slate-600 leading-relaxed">{indepthResult.chovvaDosham.description}</p>
                  <div className="mt-4 flex gap-6 text-sm font-medium bg-white p-4 rounded-xl inline-flex border border-slate-100">
                    <span className="text-slate-500">Boy: <span className={`font-bold ml-1 ${indepthResult.chovvaDosham.boyHasDosham ? 'text-red-600' : 'text-green-700'}`}>{indepthResult.chovvaDosham.boyStatus === 'ACTIVE_DOSHA' ? 'Present' : indepthResult.chovvaDosham.boyStatus === 'DOSHA_CANCELLED' ? 'Cancelled' : 'Absent'}</span></span>
                    <div className="w-px bg-slate-200"></div>
                    <span className="text-slate-500">Girl: <span className={`font-bold ml-1 ${indepthResult.chovvaDosham.girlHasDosham ? 'text-red-600' : 'text-green-700'}`}>{indepthResult.chovvaDosham.girlStatus === 'ACTIVE_DOSHA' ? 'Present' : indepthResult.chovvaDosham.girlStatus === 'DOSHA_CANCELLED' ? 'Cancelled' : 'Absent'}</span></span>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h5 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">timeline</span>
                    Dasha Sandhi
                  </h5>
                  <p className="text-base text-slate-600 leading-relaxed">{indepthResult.dasaSandhi.description}</p>
                </div>

                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 mt-8">
                  <h5 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined">psychology</span>
                    Overall Recommendation
                  </h5>
                  <p className="text-base text-slate-800 font-medium leading-relaxed">{indepthResult.overallRecommendation}</p>
                </div>
              </div>
              
              {/* Footer removed as requested */}
            </div>
          </div>
        )}
      </div>
      
      <div id="datepicker-portal" />
      <DailyHoroscopeModal 
        isOpen={isDailyHoroscopeOpen} 
        onClose={() => setIsDailyHoroscopeOpen(false)} 
      />
      <DailyPanchangModal
        isOpen={isPanchangModalOpen}
        onClose={() => setIsPanchangModalOpen(false)}
        lang={lang}
      />

      {/* Muhurtham Calendar Modal */}
      <AnimatePresence>
        {isMuhurthamCalendarOpen && (
          <motion.div
            key="muhurtham-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMuhurthamCalendarOpen(false)}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />
        )}
        {isMuhurthamCalendarOpen && (
          <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center pointer-events-none p-0 sm:p-4">
            <motion.div
              key="muhurtham-content"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                <h3 className="text-xl font-bold text-slate-800">Muhurtham Calendar</h3>
                <button 
                  onClick={() => setIsMuhurthamCalendarOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <MuhurthamFinder muhurthams={muhurthams} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PoruthamDetailModal
        isOpen={!!selectedPorutham}
        onClose={() => setSelectedPorutham(null)}
        porutham={selectedPorutham}
        icon={selectedPorutham ? getPoruthamIcon(selectedPorutham.name) : 'star'}
      />
    </div>
  );
}