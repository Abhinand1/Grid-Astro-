import React from 'react';

interface RasiChartProps {
  title: string;
  moonSign: string;
  planets?: { name: string; rasi: string }[];
}

const RASI_ORDER = [
  "Meena", "Mesha", "Rishabha", "Mithuna",
  "Karkitaka", "Simha", "Kanya", "Tula",
  "Vrischika", "Dhanu", "Makara", "Kumbha"
];

// South Indian Chart Layout Indices (0-11)
// 11 0  1  2
// 10       3
// 9        4
// 8  7  6  5
const CHART_LAYOUT = [
  [11, 0, 1, 2],
  [10, -1, -1, 3],
  [9, -1, -1, 4],
  [8, 7, 6, 5]
];

const RASI_NAMES_MALAYALAM: Record<string, string> = {
  "Mesha": "മേടം",
  "Rishabha": "ഇടവം",
  "Mithuna": "മിഥുനം",
  "Karkitaka": "കർക്കിടകം",
  "Simha": "ചിങ്ങം",
  "Kanya": "കന്നി",
  "Tula": "തുലാം",
  "Vrischika": "വൃശ്ചികം",
  "Dhanu": "ധനു",
  "Makara": "മകരം",
  "Kumbha": "കുംഭം",
  "Meena": "മീനം"
};

export const RasiChart: React.FC<RasiChartProps> = ({ title, moonSign, planets = [] }) => {
  const getPlanetsInSign = (rasiName: string) => {
    const p = planets.filter(p => p.rasi === rasiName).map(p => p.name);
    if (moonSign === rasiName) p.push("ചന്ദ്രൻ");
    return p;
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">{title}</h3>
      <div className="grid grid-cols-4 gap-0 border-2 border-slate-800 aspect-square max-w-[300px] mx-auto">
        {CHART_LAYOUT.map((row, rowIndex) => (
          row.map((rasiIdx, colIndex) => {
            if (rasiIdx === -1) {
              return <div key={`empty-${rowIndex}-${colIndex}`} className="bg-slate-50 border border-slate-200"></div>;
            }
            
            const rasiName = RASI_ORDER.find((_, i) => {
                // Map RASI_ORDER to the standard index
                // RASI_ORDER is [Meena, Mesha, ...]
                // Mesha is index 1 in RASI_ORDER, but index 0 in our logic?
                // Let's simplify: RASI_ORDER[rasiIdx]
                return i === rasiIdx;
            }) || "";

            const signPlanets = getPlanetsInSign(rasiName);

            return (
              <div 
                key={rasiName} 
                className="border border-slate-800 p-1 flex flex-col items-center justify-start min-h-[60px] relative"
              >
                <span className="text-[10px] text-slate-400 absolute top-0.5 right-1">
                  {RASI_NAMES_MALAYALAM[rasiName]}
                </span>
                <div className="mt-4 flex flex-wrap justify-center gap-1">
                  {signPlanets.map((p, i) => (
                    <span key={i} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1 rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        ))}
      </div>
      <p className="text-center text-xs text-slate-400 mt-4">രാശി ചക്രം (Rasi Chart)</p>
    </div>
  );
};
