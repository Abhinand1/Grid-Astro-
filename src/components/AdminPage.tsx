import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  User,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Download,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Info,
  Check,
  MapPin,
  Compass,
  Scale,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { NAKSHATRAS, getRasiFromNakshatraPada } from '../utils/astroData';
import { evaluateMarriageMatch, PersonProfile } from '../utils/keralaMatchEngine';
import { searchBestMatchingTime, ForceMatchResult } from '../utils/forceMatchEngine';
import { CustomSelect } from './CustomSelect';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomTimePicker } from './CustomTimePicker';
import { useLanguage } from '../contexts/LanguageContext';
import { haptic } from '../utils/haptics';
import { sanitizeInput } from '../utils/sanitize';

const ZODIAC_SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

interface AdminPageProps {
  onExit: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onExit }) => {
  const { lang, setLang } = useLanguage();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('gridadmin_authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Bride Form State
  const [girlDetails, setGirlDetails] = useState({
    name: 'ശ്രേയ (Shreya)',
    dob: '1998-05-15',
    time: '10:00',
    place: 'Thrissur',
    starId: 4, // Rohini
    pada: 1,
    rasi: 'Edavam'
  });

  // Groom Form State
  const [boyDetails, setBoyDetails] = useState({
    name: 'അർജുൻ (Arjun)',
    dob: '1995-10-22',
    time: '14:00',
    place: 'Palakkad',
    starId: 13, // Atham
    pada: 1,
    rasi: 'Kanni'
  });

  // Matching & Force Match State
  const [currentMatch, setCurrentMatch] = useState<any | null>(null);
  const [forceMatchResult, setForceMatchResult] = useState<ForceMatchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  // Sync Rasi when Nakshatra or Pada changes
  useEffect(() => {
    const derivedGirlRasi = getRasiFromNakshatraPada(girlDetails.starId, girlDetails.pada);
    setGirlDetails(prev => (prev.rasi === derivedGirlRasi ? prev : { ...prev, rasi: derivedGirlRasi }));
  }, [girlDetails.starId, girlDetails.pada]);

  useEffect(() => {
    const derivedBoyRasi = getRasiFromNakshatraPada(boyDetails.starId, boyDetails.pada);
    setBoyDetails(prev => (prev.rasi === derivedBoyRasi ? prev : { ...prev, rasi: derivedBoyRasi }));
  }, [boyDetails.starId, boyDetails.pada]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.light();
    if (username.trim() === 'gridadmin' && password === 'rogadmin@grid') {
      sessionStorage.setItem('gridadmin_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError(
        lang === 'ml'
          ? 'ഉപയോക്തൃനാമമോ പാസ്‌വേഡോ തെറ്റാണ്. ദയവായി വീണ്ടും ശ്രമിക്കുക.'
          : 'Invalid username or password. Please check your credentials.'
      );
    }
  };

  const handleLogout = () => {
    haptic.light();
    sessionStorage.removeItem('gridadmin_authenticated');
    setIsAuthenticated(false);
    setPassword('');
  };

  // Run initial match check
  const handleCheckMatch = () => {
    haptic.medium();
    setPdfError('');
    const girlStar = NAKSHATRAS.find(n => n.id === girlDetails.starId) || NAKSHATRAS[0];
    const boyStar = NAKSHATRAS.find(n => n.id === boyDetails.starId) || NAKSHATRAS[0];

    const girlProfile: PersonProfile = {
      name: girlDetails.name,
      nakshatra: girlStar.name,
      nakshatra_index: girlStar.id,
      pada: girlDetails.pada,
      chandra_rasi: girlDetails.rasi,
      dob: girlDetails.dob,
      time: girlDetails.time
    };

    const boyProfile: PersonProfile = {
      name: boyDetails.name,
      nakshatra: boyStar.name,
      nakshatra_index: boyStar.id,
      pada: boyDetails.pada,
      chandra_rasi: boyDetails.rasi,
      dob: boyDetails.dob,
      time: boyDetails.time
    };

    const report = evaluateMarriageMatch({ girl: girlProfile, boy: boyProfile });
    setCurrentMatch(report);
  };

  // Run Force Match optimization
  const handleForceMatch = () => {
    haptic.medium();
    setIsSearching(true);
    setForceMatchResult(null);
    setPdfError('');

    setTimeout(() => {
      try {
        const girlStar = NAKSHATRAS.find(n => n.id === girlDetails.starId) || NAKSHATRAS[0];
        const boyStar = NAKSHATRAS.find(n => n.id === boyDetails.starId) || NAKSHATRAS[0];

        const girlProfile: PersonProfile = {
          name: girlDetails.name,
          nakshatra: girlStar.name,
          nakshatra_index: girlStar.id,
          pada: girlDetails.pada,
          chandra_rasi: girlDetails.rasi,
          dob: girlDetails.dob,
          time: girlDetails.time
        };

        const boyProfile: PersonProfile = {
          name: boyDetails.name,
          nakshatra: boyStar.name,
          nakshatra_index: boyStar.id,
          pada: boyDetails.pada,
          chandra_rasi: boyDetails.rasi,
          dob: boyDetails.dob,
          time: boyDetails.time
        };

        const result = searchBestMatchingTime(girlProfile, boyProfile);
        setForceMatchResult(result);
        if (result.success && result.matchReport) {
          setCurrentMatch(result.matchReport);
        }
      } catch (err) {
        console.error('Force Match Error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);
  };

  // PDF Download (Strictly Unbranded)
  const handleDownloadPdf = async () => {
    const element = document.getElementById('admin-jathakam-pdf-template');
    if (!element) return;

    haptic.medium();
    setIsGeneratingPdf(true);
    setPdfError('');

    try {
      element.style.display = 'block';
      element.style.position = 'fixed';
      element.style.top = '0';
      element.style.left = '0';
      element.style.zIndex = '9999';
      element.style.opacity = '1';

      await new Promise(r => setTimeout(r, 500));

      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const boyName = forceMatchResult?.adjustedBoy?.name || boyDetails.name || 'Groom';
      pdf.save(`Jathakam_${boyName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      setPdfError(
        lang === 'ml'
          ? 'PDF നിർമ്മിക്കുന്നതിൽ പിശക് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.'
          : 'Failed to generate PDF document. Please try again.'
      );
    } finally {
      if (element) {
        element.style.display = 'none';
        element.style.left = '-9999px';
      }
      setIsGeneratingPdf(false);
    }
  };

  const starOptions = NAKSHATRAS.map(n => ({
    value: n.id,
    label: lang === 'ml' ? `${n.id}. ${n.malayalamName} (${n.name})` : `${n.id}. ${n.name} (${n.malayalamName})`
  }));

  const padaOptions = [1, 2, 3, 4].map(p => ({
    value: p,
    label: lang === 'ml' ? `പാദം ${p}` : `Pada ${p}`
  }));

  // Shared Celestial Background Mandala (matches main app)
  const CelestialBackdrop = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-[0.35]">
      <svg
        viewBox="0 0 800 800"
        className="w-[200%] h-[200%] md:w-[150%] md:h-[150%] animate-[spin_180s_linear_infinite] text-primary/30"
        fill="currentColor"
      >
        <path d="M400 50 A350 350 0 1 1 399.9 50 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10" />
        <path d="M400 100 A300 300 0 1 1 399.9 100 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M400 150 A250 250 0 1 1 399.9 150 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <g transform="translate(400, 400)">
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 30}) translate(0, -325)`}>
              <text textAnchor="middle" dominantBaseline="middle" fontSize="32" transform={`rotate(${-i * 30})`}>
                {ZODIAC_SIGNS[i]}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );

  // -------------------------------------------------------------
  // VIEW: LOGIN SCREEN (Matches main app light celestial schema)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-surface font-sans text-on-surface relative flex flex-col overflow-x-hidden">
        <CelestialBackdrop />

        <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-100/80 shadow-sm flex justify-between items-center px-4 sm:px-6 h-14 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => {
                haptic.light();
                onExit();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all shrink-0 text-slate-700"
              aria-label="Back to main site"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="text-lg tracking-tight text-slate-900 flex items-center gap-0.5 select-none">
              <span className="font-bold">Grid</span>
              <span className="font-light">Astro</span>
            </div>
          </div>

          <button
            onClick={() => {
              haptic.light();
              setLang(lang === 'en' ? 'ml' : 'en');
            }}
            className="px-2.5 py-1.5 text-[10px] font-bold text-primary bg-primary/10 rounded-lg uppercase tracking-wider shrink-0 active:scale-95 transition-transform"
          >
            {lang === 'en' ? 'മലയാളം' : 'EN'}
          </button>
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white/85 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(144,77,0,0.08)]"
          >
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
                <KeyRound size={26} />
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {lang === 'ml' ? 'അഡ്മിൻ പോർട്ടൽ' : 'Admin Portal'}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                {lang === 'ml'
                  ? 'പ്രവേശനത്തിന് ഉപയോക്തൃനാമവും പാസ്‌വേഡും നൽകുക'
                  : 'Sign in with your administrator credentials to continue'}
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 bg-error-container/70 border border-error/20 rounded-2xl text-on-error-container text-xs sm:text-sm font-medium flex items-start gap-2.5">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-error" />
                <span className="leading-snug">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                  {lang === 'ml' ? 'ഉപയോക്തൃനാമം (Username)' : 'Username'}
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={lang === 'ml' ? 'ഉപയോക്തൃനാമം നൽകുക' : 'Enter username'}
                    autoComplete="username"
                    required
                    className="w-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-slate-800 h-12 sm:h-14 rounded-2xl pl-11 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                  {lang === 'ml' ? 'പാസ്‌വേഡ് (Password)' : 'Password'}
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-slate-800 h-12 sm:h-14 rounded-2xl pl-11 pr-12 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-celestial-gradient text-white font-semibold py-4 px-6 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer min-h-[52px]"
              >
                <ShieldCheck size={18} />
                <span>{lang === 'ml' ? 'പ്രവേശിക്കുക (Sign In)' : 'Sign In to Console'}</span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  haptic.light();
                  onExit();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>{lang === 'ml' ? 'പ്രധാന താളിലേക്ക് മടങ്ങുക' : 'Return to Main Website'}</span>
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: AUTHENTICATED ADMIN CONSOLE (Matches GridAstro Design)
  // -------------------------------------------------------------
  const activeReport = currentMatch;

  return (
    <div className="min-h-[100dvh] bg-surface font-sans text-on-surface relative flex flex-col overflow-x-hidden">
      <CelestialBackdrop />

      <div className="relative z-10 flex flex-col min-h-[100dvh]">
        {/* TopAppBar — identical pattern to main app */}
        <header className="sticky top-0 w-full z-50 bg-white/85 backdrop-blur-2xl border-b border-slate-100/80 shadow-sm flex justify-between items-center px-3.5 sm:px-6 h-14 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => {
                haptic.light();
                onExit();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all shrink-0 text-slate-700"
              aria-label="Back to main site"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0 flex items-center gap-2">
              <div className="text-base sm:text-lg tracking-tight text-slate-900 flex items-center gap-0.5 shrink-0">
                <span className="font-bold">Grid</span>
                <span className="font-light">Astro</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider shrink-0">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                haptic.light();
                setLang(lang === 'en' ? 'ml' : 'en');
              }}
              className="px-2.5 py-1.5 text-[10px] font-bold text-primary bg-primary/10 rounded-lg uppercase tracking-wider shrink-0 active:scale-95 transition-transform"
            >
              {lang === 'en' ? 'മലയാളം' : 'EN'}
            </button>
            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3 py-1.5 bg-error-container/60 hover:bg-error-container text-error rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
              aria-label="Logout"
            >
              <LogOut size={14} />
              <span className="hidden xs:inline sm:inline">{lang === 'ml' ? 'ലോഗൗട്ട്' : 'Logout'}</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 max-w-4xl mx-auto w-full pt-5 sm:pt-8 pb-28 space-y-6">
          {/* Page Heading */}
          <section>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-background leading-tight">
              {lang === 'ml' ? 'ജാതക പൊരുത്ത ക്രമീകരണം' : 'Horoscope Time Adjuster'}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1.5 leading-relaxed">
              {lang === 'ml'
                ? 'വധുവിന്റെ ജാതകം സ്ഥിരമായി നിലനിർത്തിക്കൊണ്ട് വരന്റെ ജനന സമയത്തിൽ ചെറിയ മാറ്റങ്ങൾ വരുത്തി ഉത്തമ പൊരുത്തം കണ്ടെത്തുന്നു.'
                : 'Keeps the bride’s horoscope fixed while scanning small birth-time windows for the groom to achieve optimal Porutham compatibility.'}
            </p>
          </section>

          {/* Info & Quick Action Banner */}
          <section className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 border border-amber-300/80 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                  <Compass size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-amber-950 leading-snug">
                    {lang === 'ml' ? 'ഓട്ടോ-കമ്പാറ്റിബിലിറ്റി & ഫോഴ്സ് മാച്ച് എഞ്ചിൻ' : 'Auto-Compatibility & Force Match Engine'}
                  </h2>
                  <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                    {lang === 'ml'
                      ? 'രജ്ജു, വേധ, ചൊവ്വാദോഷം, പാപസാമ്യം എന്നിവ പരിശോധിച്ച് ഏറ്റവും അടുത്ത ഉത്തമ സമയം കണ്ടെത്തുന്നു.'
                      : 'Checks Rajju, Vedha, Chovva Dosham, and Papasamyam to locate the closest auspicious birth time.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleForceMatch}
                disabled={isSearching}
                className="w-full sm:w-auto shrink-0 bg-celestial-gradient text-white font-semibold py-3 px-5 rounded-full shadow-md shadow-primary/20 active:scale-[0.98] transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
              >
                {isSearching ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{lang === 'ml' ? 'പരിശോധിക്കുന്നു...' : 'Scanning Times...'}</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal size={16} />
                    <span>{lang === 'ml' ? 'ഫോഴ്സ് മാച്ച് ചെയ്യുക' : 'Force Match Groom'}</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Input Cards: Bride & Groom */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Bride Card (Fixed Reference) */}
            <div className="bg-white/85 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                    <User size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      {lang === 'ml' ? 'വധുവിന്റെ വിവരങ്ങൾ' : "Bride's Details"}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                      {lang === 'ml' ? 'സ്ഥിരമായ ജാതക റഫറൻസ്' : 'Fixed Astrological Reference'}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 text-[10px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap">
                  {lang === 'ml' ? 'സ്ഥിരം' : 'Fixed'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                    {lang === 'ml' ? 'പേര് (Name)' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={girlDetails.name}
                    onChange={e => setGirlDetails({ ...girlDetails, name: sanitizeInput(e.target.value) })}
                    className="w-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-slate-800 h-12 sm:h-14 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                      {lang === 'ml' ? 'നക്ഷത്രം (Nakshatra)' : 'Nakshatra'}
                    </label>
                    <CustomSelect
                      value={girlDetails.starId}
                      onChange={val => setGirlDetails({ ...girlDetails, starId: Number(val) })}
                      options={starOptions}
                      placeholder={lang === 'ml' ? 'നക്ഷത്രം തിരഞ്ഞെടുക്കുക' : 'Select Star'}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                      {lang === 'ml' ? 'പാദം (Pada)' : 'Pada'}
                    </label>
                    <CustomSelect
                      value={girlDetails.pada}
                      onChange={val => setGirlDetails({ ...girlDetails, pada: Number(val) })}
                      options={padaOptions}
                      placeholder="Pada"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                      {lang === 'ml' ? 'ജനന തീയതി (DOB)' : 'Date of Birth'}
                    </label>
                    <CustomDatePicker
                      value={girlDetails.dob}
                      onChange={dob => setGirlDetails({ ...girlDetails, dob })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                      {lang === 'ml' ? 'ജനന സമയം (Time)' : 'Time of Birth'}
                    </label>
                    <CustomTimePicker
                      value={girlDetails.time}
                      onChange={time => setGirlDetails({ ...girlDetails, time })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                    {lang === 'ml' ? 'ജനന സ്ഥലം (Place)' : 'Birth Place'}
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={girlDetails.place}
                      onChange={e => setGirlDetails({ ...girlDetails, place: sanitizeInput(e.target.value) })}
                      placeholder="Thrissur"
                      className="w-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-slate-800 h-12 sm:h-14 rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="p-3 bg-surface-container-low rounded-2xl text-xs flex items-center justify-between gap-2">
                  <span className="text-on-surface-variant font-medium">
                    {lang === 'ml' ? 'ചന്ദ്ര രാശി (Moon Rasi)' : 'Moon Rasi'}
                  </span>
                  <span className="font-bold text-primary">{girlDetails.rasi}</span>
                </div>
              </div>
            </div>

            {/* Groom Card (Target for Time Adjustments) */}
            <div className="bg-white/85 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <User size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      {lang === 'ml' ? 'വരന്റെ വിവരങ്ങൾ' : "Groom's Details"}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                      {lang === 'ml' ? 'സമയ ക്രമീകരണ വിഭാഗം' : 'Target for Time Adjustment'}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap">
                  {lang === 'ml' ? 'ക്രമീകരണം' : 'Adjustable'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                    {lang === 'ml' ? 'പേര് (Name)' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={boyDetails.name}
                    onChange={e => setBoyDetails({ ...boyDetails, name: sanitizeInput(e.target.value) })}
                    className="w-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-slate-800 h-12 sm:h-14 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                      {lang === 'ml' ? 'നക്ഷത്രം (Nakshatra)' : 'Nakshatra'}
                    </label>
                    <CustomSelect
                      value={boyDetails.starId}
                      onChange={val => setBoyDetails({ ...boyDetails, starId: Number(val) })}
                      options={starOptions}
                      placeholder={lang === 'ml' ? 'നക്ഷത്രം തിരഞ്ഞെടുക്കുക' : 'Select Star'}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                      {lang === 'ml' ? 'പാദം (Pada)' : 'Pada'}
                    </label>
                    <CustomSelect
                      value={boyDetails.pada}
                      onChange={val => setBoyDetails({ ...boyDetails, pada: Number(val) })}
                      options={padaOptions}
                      placeholder="Pada"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                      {lang === 'ml' ? 'ജനന തീയതി (DOB)' : 'Date of Birth'}
                    </label>
                    <CustomDatePicker
                      value={boyDetails.dob}
                      onChange={dob => setBoyDetails({ ...boyDetails, dob })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                      {lang === 'ml' ? 'യഥാർത്ഥ സമയം (Born Time)' : 'Original Born Time'}
                    </label>
                    <CustomTimePicker
                      value={boyDetails.time}
                      onChange={time => setBoyDetails({ ...boyDetails, time })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 block">
                    {lang === 'ml' ? 'ജനന സ്ഥലം (Place)' : 'Birth Place'}
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={boyDetails.place}
                      onChange={e => setBoyDetails({ ...boyDetails, place: sanitizeInput(e.target.value) })}
                      placeholder="Palakkad"
                      className="w-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-slate-800 h-12 sm:h-14 rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="p-3 bg-surface-container-low rounded-2xl text-xs flex items-center justify-between gap-2">
                  <span className="text-on-surface-variant font-medium">
                    {lang === 'ml' ? 'ചന്ദ്ര രാശി (Moon Rasi)' : 'Moon Rasi'}
                  </span>
                  <span className="font-bold text-primary">{boyDetails.rasi}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Primary & Secondary Action Controls — Thumb Zone Friendly */}
          <section className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleForceMatch}
              disabled={isSearching}
              className="flex-1 bg-celestial-gradient text-white font-semibold py-4 px-6 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[52px]"
            >
              {isSearching ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{lang === 'ml' ? 'സമയങ്ങൾ പരിശോധിക്കുന്നു...' : 'Searching Time Windows...'}</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal size={18} />
                  <span>
                    {lang === 'ml'
                      ? 'വരന്റെ സമയം ക്രമീകരിച്ച് പൊരുത്തപ്പെടുത്തുക'
                      : 'Force Match Groom (Adjust Birth Time)'}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={handleCheckMatch}
              className="sm:w-auto bg-white/80 backdrop-blur-md border border-slate-200 text-primary font-semibold py-4 px-6 rounded-full shadow-sm hover:bg-white active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer min-h-[52px]"
            >
              <CheckCircle2 size={18} />
              <span>{lang === 'ml' ? 'യഥാർത്ഥ പൊരുത്തം നോക്കുക' : 'Check Original Match'}</span>
            </button>
          </section>

          {/* Force Match Result or Failure Card */}
          {forceMatchResult && (
            <section>
              {forceMatchResult.success ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 backdrop-blur-xl border-2 border-emerald-500/35 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-sm space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check size={22} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                          {lang === 'ml'
                            ? 'ഉത്തമ പൊരുത്തം വിജയകരമായി ക്രമീകരിച്ചു!'
                            : 'Optimal Match Found & Adjusted'}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {lang === 'ml'
                            ? 'വരന്റെ ജനന സമയത്തിൽ ആവശ്യമായ ചെറിയ മാറ്റം വരുത്തി ഉത്തമ പൊരുത്തമുള്ള ജാതകം തയ്യാറാക്കി.'
                            : 'Minimal birth-time adjustment applied to the groom’s chart for harmonious compatibility.'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="w-full sm:w-auto shrink-0 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-full text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>{lang === 'ml' ? 'PDF തയ്യാറാക്കുന്നു...' : 'Creating PDF...'}</span>
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          <span>{lang === 'ml' ? 'ജാതകം PDF ഡൗൺലോഡ്' : 'Download Jathakam PDF'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {pdfError && (
                    <div className="p-3.5 bg-error-container/70 border border-error/20 rounded-2xl text-on-error-container text-xs font-medium flex items-center gap-2">
                      <AlertTriangle size={16} className="shrink-0 text-error" />
                      <span>{pdfError}</span>
                    </div>
                  )}

                  {/* Adjustment Metrics Grid — spacious & never clipped on mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-surface-container-low rounded-2xl p-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                        <Clock size={14} className="text-primary shrink-0" />
                        <span>{lang === 'ml' ? 'യഥാർത്ഥ സമയം' : 'Original Born Time'}</span>
                      </div>
                      <div className="text-base font-extrabold text-slate-900 mt-1">
                        {forceMatchResult.originalBoy.time} IST
                      </div>
                    </div>

                    <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <SlidersHorizontal size={14} className="text-emerald-700 shrink-0" />
                        <span>{lang === 'ml' ? 'ക്രമീകരിച്ച സമയം' : 'Adjusted Time'}</span>
                      </div>
                      <div className="text-base font-extrabold text-emerald-900 mt-1 break-words">
                        {forceMatchResult.adjustedBoy?.time} ({forceMatchResult.timeDifferenceText})
                      </div>
                    </div>

                    <div className="bg-surface-container-low rounded-2xl p-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {lang === 'ml' ? 'പുതിയ നക്ഷത്രം & പാദം' : 'Adjusted Star & Pada'}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-slate-900 mt-1 break-words">
                        {forceMatchResult.adjustedBoy?.nakshatra} ({lang === 'ml' ? 'പാദം' : 'Pada'} {forceMatchResult.adjustedBoy?.pada})
                      </div>
                    </div>

                    <div className="bg-surface-container-low rounded-2xl p-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {lang === 'ml' ? 'പുതിയ രാശി & ലഗ്നം' : 'Adjusted Rasi & Lagna'}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-primary mt-1 break-words">
                        {forceMatchResult.adjustedBoy?.chandra_rasi} / {lang === 'ml' ? 'ലഗ്നം' : 'Lagna'}: {forceMatchResult.adjustedBoy?.lagna_rasi}
                      </div>
                    </div>
                  </div>

                  {/* Verdict Summary Bar */}
                  <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-600 font-semibold">
                        {lang === 'ml' ? 'പൊരുത്ത സ്കോർ:' : 'Compatibility Score:'}
                      </span>
                      <span className="text-base font-black text-emerald-800">
                        {forceMatchResult.matchReport?.dashakoota_score} / 10
                      </span>
                      <span className="text-slate-500 font-medium">
                        ({forceMatchResult.matchReport?.final_verdict?.recommendation})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700 font-medium">
                      <span>
                        {lang === 'ml' ? 'പാപസാമ്യം:' : 'Papasamyam:'}{' '}
                        <strong className="text-slate-900">{forceMatchResult.matchReport?.papasamya_result?.status}</strong>
                      </span>
                      <span>
                        {lang === 'ml' ? 'ചൊവ്വാദോഷം:' : 'Chovva Dosham:'}{' '}
                        <strong className="text-slate-900">{forceMatchResult.matchReport?.chovva_dosha_result?.overall_check}</strong>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-error-container/40 border border-error/25 rounded-[28px] p-5 sm:p-6 shadow-sm flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-2xl bg-error/10 text-error flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {lang === 'ml'
                        ? 'ജനന സമയം മാത്രം മാറ്റി പൊരുത്തം ഉണ്ടാക്കുവാൻ സാധ്യമല്ല'
                        : 'Cannot Force Match with Birth Time Alone'}
                    </h3>
                    <p className="text-xs sm:text-sm text-on-error-container mt-1.5 leading-relaxed">
                      {forceMatchResult.failureReason}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-2 leading-relaxed">
                      {lang === 'ml'
                        ? 'നിർദ്ദേശം: ജനന തീയതി മാറ്റുകയോ, രജ്ജു/വേധ ദോഷങ്ങൾ ഇല്ലാത്ത മറ്റൊരു നക്ഷത്രം പരിശോധിക്കുകയോ ചെയ്യുക.'
                        : 'Suggestion: Try another birth date or evaluate a star combination without unavoidable Rajju/Vedha afflictions.'}
                    </p>
                  </div>
                </motion.div>
              )}
            </section>
          )}

          {/* Active Porutham Breakdown (Mobile Cards + Desktop Table — Zero Clipping) */}
          {activeReport && (
            <section className="bg-white/85 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Scale size={18} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {lang === 'ml' ? 'ദശകൂട പൊരുത്ത പട്ടിക (10 Poruthams)' : 'Dashakoota 10 Poruthams Breakdown'}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs sm:text-sm shrink-0">
                  {activeReport.dashakoota_score} / 10
                </span>
              </div>

              {/* Mobile Stacked Card Layout — prevents table truncation/clipping */}
              <div className="space-y-3 md:hidden">
                {activeReport.porutham_items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-surface-container-low/80 rounded-2xl p-4 space-y-2 border border-slate-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          {item.malayalamName}{' '}
                          <span className="text-slate-500 font-medium text-xs">({item.name})</span>
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-extrabold text-primary">
                          {item.score}/{item.maxScore}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            item.status === 'Good'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Satisfactory'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-error-container text-on-error-container'
                          }`}
                        >
                          {item.traditionalStatus}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed break-words">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">{lang === 'ml' ? 'പൊരുത്തം' : 'Porutham'}</th>
                      <th className="py-3 px-3 text-center">{lang === 'ml' ? 'സ്കോർ' : 'Score'}</th>
                      <th className="py-3 px-3 text-center">{lang === 'ml' ? 'ഫലം' : 'Status'}</th>
                      <th className="py-3 px-3">{lang === 'ml' ? 'വിശദീകരണം' : 'Details'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeReport.porutham_items?.map((item: any) => (
                      <tr key={item.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {item.malayalamName}{' '}
                          <span className="text-slate-400 font-normal">({item.name})</span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-primary whitespace-nowrap">
                          {item.score} / {item.maxScore}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Good'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'Satisfactory'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-error-container text-on-error-container'
                            }`}
                          >
                            {item.traditionalStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-xs leading-relaxed">
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* -------------------------------------------------------------
          OFF-SCREEN PDF TEMPLATE (Strictly UNBRANDED — Simple PDF)
         ------------------------------------------------------------- */}
      <div
        id="admin-jathakam-pdf-template"
        ref={pdfTemplateRef}
        style={{
          display: 'none',
          width: '794px',
          minHeight: '1123px',
          backgroundColor: '#ffffff',
          color: '#111827',
          padding: '40px 48px',
          fontFamily: 'serif',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ textAlign: 'center', borderBottom: '2px solid #1f2937', paddingBottom: '14px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>
            ജാതക കുറിപ്പ് / HOROSCOPE DOCUMENT
          </h1>
          <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>
            കേരള ജ്യോതിഷ ഗണിത രീതി (Kerala Traditional Jyothisha System)
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ border: '1px solid #d1d5db', padding: '14px', borderRadius: '6px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
              ജാതകന്റെ വിവരങ്ങൾ (Native's Details)
            </h3>
            <table style={{ width: '100%', fontSize: '12px', lineHeight: '1.7', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ color: '#4b5563', width: '40%' }}>പേര് (Name):</td><td style={{ fontWeight: 600 }}>{forceMatchResult?.adjustedBoy?.name || boyDetails.name}</td></tr>
                <tr><td style={{ color: '#4b5563' }}>ജനന തീയതി (DOB):</td><td style={{ fontWeight: 600 }}>{forceMatchResult?.adjustedBoy?.dob || boyDetails.dob}</td></tr>
                <tr><td style={{ color: '#4b5563' }}>ജനന സമയം (Time):</td><td style={{ fontWeight: 600 }}>{forceMatchResult?.adjustedBoy?.time || boyDetails.time} (IST)</td></tr>
                <tr><td style={{ color: '#4b5563' }}>ജനന സ്ഥലം (Place):</td><td style={{ fontWeight: 600 }}>{boyDetails.place || 'Kerala, India'}</td></tr>
              </tbody>
            </table>
          </div>

          <div style={{ border: '1px solid #d1d5db', padding: '14px', borderRadius: '6px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
              ജ്യോതിഷ സ്ഥിതി (Astrological Status)
            </h3>
            <table style={{ width: '100%', fontSize: '12px', lineHeight: '1.7', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ color: '#4b5563', width: '45%' }}>ജന്മ നക്ഷത്രം (Star):</td><td style={{ fontWeight: 600 }}>{forceMatchResult?.adjustedBoy?.nakshatra || boyDetails.starId} (പാദം {forceMatchResult?.adjustedBoy?.pada || boyDetails.pada})</td></tr>
                <tr><td style={{ color: '#4b5563' }}>ചന്ദ്ര രാശി (Moon Sign):</td><td style={{ fontWeight: 600 }}>{forceMatchResult?.adjustedBoy?.chandra_rasi || boyDetails.rasi}</td></tr>
                <tr><td style={{ color: '#4b5563' }}>ലഗ്നം (Ascendant):</td><td style={{ fontWeight: 600 }}>{forceMatchResult?.adjustedBoy?.lagna_rasi || 'മേടം (Medam)'}</td></tr>
                <tr><td style={{ color: '#4b5563' }}>അയനാംശം (Ayanamsa):</td><td style={{ fontWeight: 600 }}>ലാഹിരി (Lahiri / Chitra Paksha)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ border: '1px solid #d1d5db', padding: '12px 14px', borderRadius: '6px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 8px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
            ഗ്രഹസ്ഥിതി പട്ടിക (Planetary Positions at Birth)
          </h3>
          <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #9ca3af' }}>
                <th style={{ padding: '5px 8px' }}>ഗ്രഹം (Planet)</th>
                <th style={{ padding: '5px 8px' }}>രാശി (Sign)</th>
                <th style={{ padding: '5px 8px' }}>നക്ഷത്രം (Nakshatra)</th>
                <th style={{ padding: '5px 8px' }}>പാദം (Pada)</th>
                <th style={{ padding: '5px 8px' }}>ഭാഗ (Degree)</th>
              </tr>
            </thead>
            <tbody>
              {forceMatchResult?.planets?.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                  <td style={{ padding: '5px 8px', fontWeight: 600 }}>{p.malayalam} ({p.name})</td>
                  <td style={{ padding: '5px 8px' }}>{p.rasiMalayalam} ({p.rasi})</td>
                  <td style={{ padding: '5px 8px' }}>{p.nakshatra}</td>
                  <td style={{ padding: '5px 8px' }}>{p.pada}</td>
                  <td style={{ padding: '5px 8px', fontFamily: 'monospace' }}>{p.degree}°</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ border: '1px solid #1f2937', padding: '14px', borderRadius: '6px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 10px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
            വിവാഹ പൊരുത്ത വിശകലനം (Marriage Compatibility Evaluation)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', backgroundColor: '#f9fafb', padding: '8px 12px', borderRadius: '4px', marginBottom: '10px' }}>
            <div><strong>വധു (Bride):</strong> {girlDetails.name} — {girlDetails.starId ? NAKSHATRAS.find(n => n.id === girlDetails.starId)?.malayalamName : ''} (പാദം {girlDetails.pada}), {girlDetails.rasi}</div>
            <div><strong>വരൻ (Groom):</strong> {forceMatchResult?.adjustedBoy?.name || boyDetails.name} — {forceMatchResult?.adjustedBoy?.nakshatra} (പാദം {forceMatchResult?.adjustedBoy?.pada}), {forceMatchResult?.adjustedBoy?.chandra_rasi}</div>
          </div>

          <table style={{ width: '100%', fontSize: '10.5px', borderCollapse: 'collapse', textAlign: 'center', marginBottom: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderTop: '1px solid #9ca3af', borderBottom: '1px solid #9ca3af' }}>
                <th style={{ padding: '4px', border: '1px solid #d1d5db' }}>ദിനം</th>
                <th style={{ padding: '4px', border: '1px solid #d1d5db' }}>ഗണം</th>
                <th style={{ padding: '4px', border: '1px solid #d1d5db' }}>മാഹേന്ദ്രം</th>
                <th style={{ padding: '4px', border: '1px solid #d1d5db' }}>സ്ത്രീദീർഘം</th>
                <th style={{ padding: '4px', border: '1px solid #d1d5db' }}>യോനി</th>
                <th style={{ padding: '4px', border: '1px solid #d1d5db' }}>വേധം</th>
                <th style={{ padding: '4px', border: '1px solid #d1d5db' }}>രജ്ജു</th>
                <th style={{ padding: '4px', border: '1px solid #d1d5db' }}>രാശി</th>
                <th style={{ padding: '4px', border: '1px solid #d1d5db' }}>രാശ്യാധിപൻ</th>
                <th style={{ padding: '4px', border: '1px solid #d1d5db' }}>വശ്യം</th>
                <th style={{ padding: '4px', border: '1px solid #111827', fontWeight: 'bold' }}>ആകെ (Total)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {activeReport?.porutham_items?.map((item: any) => (
                  <td key={item.id} style={{ padding: '5px', border: '1px solid #d1d5db', fontWeight: item.score > 0 ? 600 : 400 }}>
                    {item.score}
                  </td>
                ))}
                <td style={{ padding: '5px', border: '1px solid #111827', fontWeight: 'bold', fontSize: '12px' }}>
                  {activeReport?.dashakoota_score || 0} / 10
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', paddingTop: '6px' }}>
            <div>പാപസാമ്യം (Papasamyam): <strong>അനുകൂലം (Balanced)</strong></div>
            <div>ചൊവ്വാദോഷം (Chovva Dosham): <strong>ദോഷരഹിതം (Harmonious)</strong></div>
            <div>തീരുമാനം (Verdict): <strong style={{ color: '#047857' }}>ഉത്തമ പൊരുത്തം (Recommended Match)</strong></div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', fontSize: '11px', color: '#6b7280', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
          <div>തീയതി: {new Date().toLocaleDateString('en-GB')}</div>
          <div>ജ്യോതിഷ പരിശോധനാ രേഖ (Official Astrological Document)</div>
        </div>
      </div>
    </div>
  );
};
