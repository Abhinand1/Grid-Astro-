import React from 'react';

interface RasiChartProps {
  title: string;
  moonSign: string;
  planets?: { name: string; rasi: string }[];
}

const RASI_ORDER = [
  "Medam", "Edavam", "Mithunam", "Karkidakam",
  "Chingam", "Kanni", "Thulam", "Vrischikam",
  "Dhanu", "Makaram", "Kumbham", "Meenam"
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
  "Medam": "മേടം",
  "Edavam": "ഇടവം",
  "Mithunam": "മിഥുനം",
  "Karkidakam": "കർക്കിടകം",
  "Chingam": "ചിങ്ങം",
  "Kanni": "കന്നി",
  "Thulam": "തുലാം",
  "Vrischikam": "വൃശ്ചികം",
  "Dhanu": "ധനു",
  "Makaram": "മകരം",
  "Kumbham": "കുംഭം",
  "Meenam": "മീനം"
};

const PLANET_ABBR: Record<string, string> = {
  "സൂര്യൻ": "സൂ",
  "ചന്ദ്രൻ": "ച",
  "ചൊവ്വ": "ചൊ",
  "ബുധൻ": "ബു",
  "വ്യാഴം": "വ്യാ",
  "ശുക്രൻ": "ശു",
  "ശനി": "ശ",
  "രാഹു": "രാ",
  "കേതു": "കേ",
  "ലഗ്നം": "ല"
};

export const RasiChart: React.FC<RasiChartProps> = ({ title, moonSign, planets = [] }) => {
  const getPlanetsInSign = (rasiName: string) => {
    const p = planets.filter(p => p.rasi === rasiName).map(p => p.name);
    if (moonSign === rasiName) p.push("ചന്ദ്രൻ");
    return p;
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">{title}</h3>
      <div className="grid grid-cols-4 gap-0 border-2 border-slate-800 aspect-square w-full max-w-[340px] mx-auto">
        {CHART_LAYOUT.map((row, rowIndex) => (
          row.map((rasiIdx, colIndex) => {
            if (rasiIdx === -1) {
              return <div key={`empty-${rowIndex}-${colIndex}`} className="bg-slate-50/50 border border-slate-200"></div>;
            }
            
            const rasiName = RASI_ORDER.find((_, i) => i === rasiIdx) || "";
            const signPlanets = getPlanetsInSign(rasiName);

            return (
              <div 
                key={rasiName} 
                className="border border-slate-800 p-1 flex flex-col items-center justify-center relative overflow-hidden"
              >
                <span className="text-[9px] sm:text-[10px] text-slate-400 absolute top-0.5 left-1">
                  {RASI_NAMES_MALAYALAM[rasiName]}
                </span>
                <div className="mt-3 flex flex-wrap justify-center gap-1 sm:gap-1.5 px-0.5 w-full">
                  {signPlanets.map((p, i) => (
                    <span key={i} className="text-[11px] sm:text-xs font-bold text-indigo-700 leading-none">
                      {PLANET_ABBR[p] || p}
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
