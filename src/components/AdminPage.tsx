import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, User, LogOut, CheckCircle, AlertTriangle, Download, 
  RefreshCw, Sparkles, Clock, Calendar, ShieldCheck, 
  FileText, ArrowLeft, Loader2, Info, Check, MapPin
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { NAKSHATRAS, RASIS, getRasiFromNakshatraPada } from '../utils/astroData';
import { evaluateMarriageMatch, PersonProfile } from '../utils/keralaMatchEngine';
import { searchBestMatchingTime, ForceMatchResult } from '../utils/forceMatchEngine';

interface AdminPageProps {
  onExit: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onExit }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('gridadmin_authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
  const [maxAdjustmentWindow, setMaxAdjustmentWindow] = useState<number>(180); // 3 hours default

  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  // Sync Rasi when Nakshatra or Pada changes
  useEffect(() => {
    const derivedGirlRasi = getRasiFromNakshatraPada(girlDetails.starId, girlDetails.pada);
    setGirlDetails(prev => ({ ...prev, rasi: derivedGirlRasi }));
  }, [girlDetails.starId, girlDetails.pada]);

  useEffect(() => {
    const derivedBoyRasi = getRasiFromNakshatraPada(boyDetails.starId, boyDetails.pada);
    setBoyDetails(prev => ({ ...prev, rasi: derivedBoyRasi }));
  }, [boyDetails.starId, boyDetails.pada]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'gridadmin' && password === 'rogadmin@grid') {
      sessionStorage.setItem('gridadmin_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Username or Password (ഉപയോക്തൃനാമമോ പാസ്‌വേഡോ തെറ്റാണ്)');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gridadmin_authenticated');
    setIsAuthenticated(false);
  };

  // Run initial match check
  const handleCheckMatch = () => {
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
    setIsSearching(true);
    setForceMatchResult(null);

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
    }, 200);
  };

  // PDF Download (Unbranded)
  const handleDownloadPdf = async () => {
    const element = document.getElementById('admin-jathakam-pdf-template');
    if (!element) return;

    setIsGeneratingPdf(true);
    try {
      element.style.display = 'block';
      element.style.position = 'fixed';
      element.style.top = '0';
      element.style.left = '0';
      element.style.zIndex = '9999';
      element.style.opacity = '1';

      await new Promise(r => setTimeout(r, 600));

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
      alert('PDF generation failed. Please try again.');
    } finally {
      if (element) {
        element.style.display = 'none';
      }
      setIsGeneratingPdf(false);
    }
  };

  // -------------------------------------------------------------
  // VIEW: LOGIN SCREEN (If not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-500">
              <Lock className="w-8 h-8" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-2">
            Admin Authentication
          </h2>
          <p className="text-sm text-center text-slate-400 mb-6">
            പ്രവേശനത്തിന് ഉപയോക്തൃനാമവും രഹസ്യവാക്കും നൽകുക
          </p>

          {loginError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username (ഉപയോക്തൃനാമം)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="gridadmin"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password (രഹസ്യവാക്ക്)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl shadow-lg transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In (പ്രവേശിക്കുക)</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onExit}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Main Website (പ്രധാന താളിലേക്ക്)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: AUTHENTICATED ADMIN CONSOLE
  // -------------------------------------------------------------
  const activeReport = currentMatch;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Admin Jathakam Adjuster</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono uppercase">
                Protected Console
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              ഹോറോസ്കോപ്പ് ഒത്തുതീർപ്പാക്കൽ & ജാതക നിർമ്മാണം
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Main Site</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Intro banner */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-amber-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Auto-Compatibility & Force Match Engine</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              വധുവിന്റെ ജാതകം സ്ഥിരമായി നിലനിർത്തിക്കൊണ്ട്, ജനന സമയത്തിൽ സ്വാഭാവികമായ ചെറിയ മാറ്റങ്ങൾ (Time of Birth adjustments) മാത്രം വരുത്തിക്കൊണ്ട് വരന്റെ ജാതകം വധുവിന്റെ ജാതകവുമായി നിർബന്ധമായും ഉത്തമ പൊരുത്തമുള്ളതാക്കി മാറ്റുന്നു. മാറ്റം സാധ്യമല്ലെങ്കിൽ കൃത്യമായ കാരണം രേഖപ്പെടുത്തും.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleForceMatch}
              disabled={isSearching}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning Times...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>⚡ Force Match (പൊരുത്തപ്പെടുത്തുക)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Input Cards: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Bride Details (FIXED - NO CHANGES) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-pink-500/10 border-b border-l border-pink-500/20 text-pink-400 text-[11px] font-semibold rounded-bl-lg">
              വധു (Bride) — Fixed Reference
            </div>

            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-pink-400 inline-block"></span>
              <span>വധുവിന്റെ വിവരങ്ങൾ (Bride's Details)</span>
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">പേര് (Name)</label>
                <input
                  type="text"
                  value={girlDetails.name}
                  onChange={e => setGirlDetails({ ...girlDetails, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">ജനന തീയതി (Date of Birth)</label>
                  <input
                    type="date"
                    value={girlDetails.dob}
                    onChange={e => setGirlDetails({ ...girlDetails, dob: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">ജനന സമയം (Time of Birth)</label>
                  <input
                    type="time"
                    value={girlDetails.time}
                    onChange={e => setGirlDetails({ ...girlDetails, time: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">ജനന സ്ഥലം (Birth Place)</label>
                <input
                  type="text"
                  value={girlDetails.place}
                  onChange={e => setGirlDetails({ ...girlDetails, place: e.target.value })}
                  placeholder="Thrissur"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">നക്ഷത്രം (Nakshatra)</label>
                  <select
                    value={girlDetails.starId}
                    onChange={e => setGirlDetails({ ...girlDetails, starId: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    {NAKSHATRAS.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.id}. {n.malayalamName} ({n.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">പാദം (Pada)</label>
                  <select
                    value={girlDetails.pada}
                    onChange={e => setGirlDetails({ ...girlDetails, pada: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>പാദം 1</option>
                    <option value={2}>പാദം 2</option>
                    <option value={3}>പാദം 3</option>
                    <option value={4}>പാദം 4</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs flex items-center justify-between">
                <span className="text-slate-400">ചന്ദ്ര രാശി (Moon Rasi):</span>
                <span className="font-semibold text-amber-400">{girlDetails.rasi}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Groom Details (SUBJECT TO TIME ADJUSTMENTS) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500/10 border-b border-l border-blue-500/20 text-blue-400 text-[11px] font-semibold rounded-bl-lg">
              വരൻ (Groom) — Target for Force Match
            </div>

            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
              <span>വരന്റെ വിവരങ്ങൾ (Groom's Details)</span>
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">പേര് (Name)</label>
                <input
                  type="text"
                  value={boyDetails.name}
                  onChange={e => setBoyDetails({ ...boyDetails, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">ജനന തീയതി (Date of Birth)</label>
                  <input
                    type="date"
                    value={boyDetails.dob}
                    onChange={e => setBoyDetails({ ...boyDetails, dob: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ജനന സമയം (Original Born Time)
                  </label>
                  <input
                    type="time"
                    value={boyDetails.time}
                    onChange={e => setBoyDetails({ ...boyDetails, time: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">ജനന സ്ഥലം (Birth Place)</label>
                <input
                  type="text"
                  value={boyDetails.place}
                  onChange={e => setBoyDetails({ ...boyDetails, place: e.target.value })}
                  placeholder="Palakkad"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">നക്ഷത്രം (Nakshatra)</label>
                  <select
                    value={boyDetails.starId}
                    onChange={e => setBoyDetails({ ...boyDetails, starId: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    {NAKSHATRAS.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.id}. {n.malayalamName} ({n.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">പാദം (Pada)</label>
                  <select
                    value={boyDetails.pada}
                    onChange={e => setBoyDetails({ ...boyDetails, pada: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>പാദം 1</option>
                    <option value={2}>പാദം 2</option>
                    <option value={3}>പാദം 3</option>
                    <option value={4}>പാദം 4</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs flex items-center justify-between">
                <span className="text-slate-400">ചന്ദ്ര രാശി (Moon Rasi):</span>
                <span className="font-semibold text-blue-400">{boyDetails.rasi}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 py-2">
          <button
            onClick={handleCheckMatch}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Check Original Compatibility (പൊരുത്തം പരിശോധിക്കുക)</span>
          </button>

          <button
            onClick={handleForceMatch}
            disabled={isSearching}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-900/30 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching Time Windows...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Force Match Groom (വരന്റെ സമയം ക്രമീകരിച്ച് പൊരുത്തപ്പെടുത്തുക)</span>
              </>
            )}
          </button>
        </div>

        {/* Force Match Results or Failure Card */}
        {forceMatchResult && (
          <div className="space-y-4">
            {forceMatchResult.success ? (
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 mt-0.5">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>ഉത്തമ പൊരുത്തം വിജയകരമായി ക്രമീകരിച്ചു! (Match Succeeded)</span>
                      </h3>
                      <p className="text-xs text-emerald-300/80 mt-1">
                        വരന്റെ ജനന സമയത്തിൽ ആവശ്യമായ ചെറിയ മാറ്റം മാത്രം വരുത്തിക്കൊണ്ട് ഉത്തമ പൊരുത്തമുള്ള പുതിയ ജാതകം തയ്യാറാക്കി.
                      </p>
                    </div>
                  </div>

                  {/* PDF Download Button */}
                  <div className="shrink-0">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download Jathakam (PDF)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Adjustment Details Pill Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>യഥാർത്ഥ സമയം (Original):</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">
                      {forceMatchResult.originalBoy.time}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-emerald-500/30 p-3 rounded-xl">
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ക്രമീകരിച്ച സമയം (Adjusted):</span>
                    </div>
                    <div className="text-sm font-bold text-emerald-300 mt-1">
                      {forceMatchResult.adjustedBoy?.time} ({forceMatchResult.timeDifferenceText})
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                    <div className="text-[11px] text-slate-400">പുതിയ നക്ഷത്രം & പാദം:</div>
                    <div className="text-sm font-semibold text-white mt-1">
                      {forceMatchResult.adjustedBoy?.nakshatra} (പാദം {forceMatchResult.adjustedBoy?.pada})
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                    <div className="text-[11px] text-slate-400">പുതിയ രാശി & ലഗ്നം:</div>
                    <div className="text-sm font-semibold text-amber-300 mt-1">
                      {forceMatchResult.adjustedBoy?.chandra_rasi} / ലഗ്നം: {forceMatchResult.adjustedBoy?.lagna_rasi}
                    </div>
                  </div>
                </div>

                {/* Score & Verdict banner */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">പൊരുത്ത സ്കോർ: </span>
                    <span className="text-base font-bold text-emerald-400">
                      {forceMatchResult.matchReport?.dashakoota_score} / 10
                    </span>
                    <span className="text-slate-400 ml-2">
                      ({forceMatchResult.matchReport?.final_verdict?.recommendation})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-300">
                    <span>
                      പാപസാമ്യം: <strong className="text-white">{forceMatchResult.matchReport?.papasamya_result?.status}</strong>
                    </span>
                    <span>
                      ചൊവ്വാദോഷം: <strong className="text-white">{forceMatchResult.matchReport?.chovva_dosha_result?.overall_check}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Failure Banner (As specified in user prompt) */
              <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-5 shadow-xl flex items-start gap-3.5">
                <div className="p-2.5 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    ജനന സമയം മാത്രം മാറ്റി പൊരുത്തം ഉണ്ടാക്കുവാൻ സാധ്യമല്ല (Cannot Force Match with Born Time Alone)
                  </h3>
                  <p className="text-xs text-red-300/90 mt-1.5 leading-relaxed">
                    {forceMatchResult.failureReason}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    നിർദ്ദേശം: ജനന തീയതി മാറ്റുകയോ, അല്ലെങ്കിൽ വധുവിന്റെ നക്ഷത്രവുമായി രജ്ജു/വേധ ദോഷങ്ങൾ ഇല്ലാത്ത മറ്റൊരു പൊരുത്തം പരിശോധിക്കുകയോ ചെയ്യുക.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Porutham Breakdown Table (if calculated) */}
        {activeReport && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>ദശകൂട പൊരുത്ത പട്ടിക (Dashakoota 10 Poruthams Breakdown)</span>
              <span className="text-amber-400 font-mono text-sm">
                Score: {activeReport.dashakoota_score} / 10
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="py-2.5 px-3">പൊരുത്തം (Porutham)</th>
                    <th className="py-2.5 px-3">പ്രാധാന്യം (Significance)</th>
                    <th className="py-2.5 px-3 text-center">പോയിന്റ് (Score)</th>
                    <th className="py-2.5 px-3 text-center">ഫലം (Status)</th>
                    <th className="py-2.5 px-3">വിശദീകരണം (Details)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeReport.porutham_items?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-3 font-medium text-white flex items-center gap-1.5">
                        <span>{item.malayalamName}</span>
                        <span className="text-slate-400 text-[11px]">({item.name})</span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">{item.id}</td>
                      <td className="py-2 px-3 text-center font-mono font-semibold text-amber-400">
                        {item.score} / {item.maxScore}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'Good' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.status === 'Satisfactory'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {item.traditionalStatus}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300 text-[11px] leading-relaxed">
                        {item.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* -------------------------------------------------------------
          OFF-SCREEN PDF TEMPLATE (Strictly UNBRANDED as instructed)
          "in pdf don't use grid astro name no branding nothing just simple pdf"
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
        {/* Document Header (NO BRANDING) */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #1f2937', paddingBottom: '14px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>
            ജാതക കുറിപ്പ് / HOROSCOPE DOCUMENT
          </h1>
          <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>
            കേരള ജ്യോതിഷ ഗണിത രീതി (Kerala Traditional Jyothisha System)
          </p>
        </div>

        {/* Section 1: Native & Astrological Profile */}
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
                <tr><td style={{ color: '#4b5563' }}>അയനാ travelം (Ayanamsa):</td><td style={{ fontWeight: 600 }}>ലാഹിരി (Lahiri / Chitra Paksha)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Planetary Positions Table */}
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

        {/* Section 3: Compatibility & Porutham Matching Summary */}
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

        {/* Traditional Signoff Footer (NO BRANDING) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', fontSize: '11px', color: '#6b7280', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
          <div>തീയതി: {new Date().toLocaleDateString('en-GB')}</div>
          <div>ജ്യോതിഷ പരിശോധനാ രേഖ (Official Astrological Document)</div>
        </div>
      </div>
    </div>
  );
};
