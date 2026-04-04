import React from 'react';
import { motion } from 'motion/react';
import { DasaPeriod } from '../utils/dasa';
import { Clock } from 'lucide-react';

interface DasaTimelineProps {
  title: string;
  timeline: DasaPeriod[];
  color: 'blue' | 'pink';
}

/**
 * ⚡ Bolt Performance Optimization
 * Wrapped DasaTimeline in React.memo()
 *
 * 🎯 Why: This component iterates over a timeline array and renders several motion elements.
 * Unnecessary re-renders when parent state updates will trigger reconciliation of all timeline nodes.
 *
 * 📊 Impact: Avoids re-rendering the full timeline array unless its props actually change,
 * improving perceived UI responsiveness and saving CPU time.
 */
export const DasaTimeline = React.memo(function DasaTimeline({ title, timeline, color }: DasaTimelineProps) {
  const accentColor = color === 'pink' ? 'bg-pink-500' : 'bg-blue-500';
  const textColor = color === 'pink' ? 'text-pink-600' : 'text-blue-600';
  const bgColor = color === 'pink' ? 'bg-pink-50' : 'bg-blue-50';

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center ${textColor}`}>
          <Clock size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Vimshottari Dasa</p>
        </div>
      </div>

      <div className="relative space-y-4">
        {/* Vertical Line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100" />

        {timeline.map((period, idx) => {
          const isCurrent = new Date() >= period.startDate && new Date() <= period.endDate;
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-10"
            >
              {/* Dot */}
              <div className={`absolute left-0 top-1.5 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${isCurrent ? accentColor : 'bg-slate-200'}`}>
                {isCurrent && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${isCurrent ? `border-indigo-200 ${bgColor} ring-2 ring-indigo-500/10` : 'border-slate-50 bg-slate-50/50'}`}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-bold ${isCurrent ? textColor : 'text-slate-700'}`}>
                    {period.malayalamPlanet} ({period.planet})
                  </h4>
                  <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg shadow-sm text-slate-500">
                    {period.duration} Years
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>{period.startDate.getFullYear()}</span>
                  <div className="w-4 h-px bg-slate-300" />
                  <span>{period.endDate.getFullYear()}</span>
                </div>
                {isCurrent && (
                  <div className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${textColor}`}>
                    നിലവിലെ ദശ (Current Period)
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});
