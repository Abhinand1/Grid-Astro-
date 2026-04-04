import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info } from 'lucide-react';
import { PoruthamResult } from '../utils/porutham';
import { PORUTHAM_EXPLANATIONS, PoruthamExplanation } from '../constants/poruthamExplanations';
import { haptic } from '../utils/haptics';

interface PoruthamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  porutham: PoruthamResult | null;
  icon: string;
}

export function PoruthamDetailModal({ isOpen, onClose, porutham, icon }: PoruthamDetailModalProps) {
  if (!isOpen || !porutham) return null;

  const explanation: PoruthamExplanation | undefined = PORUTHAM_EXPLANATIONS[porutham.name];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-white/20"
        >
          <div className={`p-6 relative ${
            porutham.status === 'Uthamam' ? 'bg-green-50' : 
            porutham.status === 'Adhamam' ? 'bg-red-50' : 'bg-orange-50'
          }`}>
            <button 
              onClick={() => { haptic.light(); onClose(); }}
              className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white/80 rounded-full transition-colors"
              aria-label="Close details"
            >
              <X size={20} className="text-slate-700" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-3 mt-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${
                porutham.status === 'Uthamam' ? 'bg-green-100 text-green-700' : 
                porutham.status === 'Adhamam' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              }`}>
                <span className="material-symbols-outlined text-3xl">{icon}</span>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{porutham.name} Porutham</h2>
                <h3 className="text-lg font-semibold text-slate-600 font-['Noto_Sans_Malayalam']">{porutham.malayalamName} പൊരുത്തം</h3>
              </div>
              
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                porutham.status === 'Uthamam' ? 'bg-green-200 text-green-800' : 
                porutham.status === 'Adhamam' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
              }`}>
                {porutham.status === 'Uthamam' ? 'Uthamam' : porutham.status === 'Adhamam' ? 'Adhamam' : 'Madhyamam'}
              </span>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Info size={18} />
                <h4>English Meaning</h4>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">
                {explanation?.description || 'Indicates compatibility in family growth and lineage prosperity.'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Info size={18} />
                <h4 className="font-['Noto_Sans_Malayalam']">മലയാളം അർത്ഥം</h4>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm font-['Noto_Sans_Malayalam']">
                {explanation?.malayalamDescription || 'കുടുംബത്തിന്റെ വളർച്ചയെയും ഐശ്വര്യത്തെയും സൂചിപ്പിക്കുന്നു.'}
              </p>
            </div>
            
            <button
              onClick={() => { haptic.light(); onClose(); }}
              className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
