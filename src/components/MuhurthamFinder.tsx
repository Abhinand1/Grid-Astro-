import React from 'react';
import { motion } from 'motion/react';
import { MuhurthamDate } from '../utils/muhurtham';
import { Calendar, Star, CheckCircle } from 'lucide-react';

interface MuhurthamFinderProps {
  muhurthams: MuhurthamDate[];
}

export function MuhurthamFinder({ muhurthams }: MuhurthamFinderProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Calendar size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">വിവാഹ മുഹൂർത്തങ്ങൾ</h3>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Auspicious Dates</p>
        </div>
      </div>

      <div className="space-y-4">
        {muhurthams.map((m, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {m.date.toLocaleDateString('en-US', { month: 'short' })}
              </span>
              <span className="text-xl font-bold text-indigo-600">
                {m.date.getDate()}
              </span>
            </div>

            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-800">{m.malayalamStar}</h4>
                {m.quality === 'Excellent' && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <Star size={10} className="fill-yellow-700" />
                    BEST
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-tight">
                {m.description}
              </p>
            </div>

            <div className="flex-shrink-0">
              <CheckCircle size={20} className="text-green-500" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
