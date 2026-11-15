# Grid Astro — Kerala Vedic Astrology, Panchangam & Matchmaking

**Grid Astro** is a bilingual (**English & Malayalam / മലയാളം**) Vedic astrology and Kerala Jyothisham Progressive Web App (PWA) built with React, TypeScript, Tailwind CSS v4, and high-precision astronomical ephemeris calculations (`astronomy-engine`). Every calculation follows traditional Kerala Panchangam and Jyothisham rules with Lahiri (Chitra Paksha) Ayanamsa.

---

## Core Features

### 1. Authentic Kerala Panchangam & Daily Star (ദിവസ നാൾ)
- **Udaya Nakshatra (Sunrise Star):** Determines the official Malayalam calendar Day Star based on the Moon's sidereal longitude at local Kerala sunrise (`getKeralaDayPanchang`), matching traditional Malayalam calendars.
- **Live Transit & Transition Timings:** Displays exact star transition times in IST, elapsed Nazhika duration from sunrise, upcoming Nakshatra, sunrise/sunset times, **Tithi** (Paksha & lunar day), and **Kollavarsham** (Malayalam Era date & month).
- **Daily Panchangam Modal:** Interactive breakdown of the day's sunrise star vs. instantaneous lunar transit with traditional explanation notes.
- **Personalized Daily Horoscope:** Nakshatra-based daily predictions, transit house impact, lucky color, lucky number, specific remedies (പരിഹാരം), and a real-time South Indian Rasi chart of current planetary positions.

### 2. Marriage Matchmaking (വിവാഹ പൊരുത്തം)
- **Dashakoota (10 Porutham) Analysis:** Evaluates Dina, Gana, Mahendra, Sthree Deergha, Yoni, Vedha, Rajju, Rasi, Rasyadhipathi, and Vasya with Pada-level Rasi derivation (`getRasiFromNakshatraPada`).
- **Fatal Gatekeeper Veto Checks:** Strict verification of Rajju Dosham (Siro, Kanta, Udara, Uru, Pada) and Vedha afflictions, plus interactive detail modals explaining each Porutham rule.
- **In-Depth Cosmic Verification:**
  - **Papasamyam Balance:** Multi-point malefic weighting across Lagna, Moon, and Venus charts (`Mars`, `Saturn`, `Sun`, `Rahu`, `Ketu`) with precise Sidereal Ascendant calculation.
  - **Chovva Dosham (Kuja Dosham):** Individual bride and groom status checks (`NO_DOSHA`, `ACTIVE_DOSHA`, `DOSHA_CANCELLED`) with classical cancellation exceptions.
  - **Dasa Sandhi Collision Check:** Scans Mahadasa transitions within the prospective marriage window to detect overlapping Dasa Sandhi periods.
  - **Vimshottari Dasa Timeline:** Dynamic planetary period and transition timeline for both partners.
  - **Auspicious Marriage Muhurtham Finder:** Scans upcoming dates for compatible Tarabalam, favorable Tithis, and Kerala solar month rules (avoiding Karkidakam & Dhanu).
- **South Indian Rasi Chart (രാശി ചക്രം):** Visual 12-house South Indian chart mapping planetary longitudes and birth Lagna.
- **Exportable PDF Reports:** Generates clean, multi-page A4 PDF compatibility and horoscope reports using `html-to-image` and `jsPDF`.

### 3. Complete Kerala Jyothisham Suite (17 Specialized Modules)
- **General Horoscope (പൊതു ജാതകം):** Comprehensive birth-star and Pada analysis covering personality, career, finance, marriage, health, and remedies.
- **Janam Kundli (ജനന ജാതകം):** Natal chart and planetary overview.
- **Prashna Vicharam / Kundali (പ്രശ്ന വിചാരം):** Instant horary query engine using real-time astronomical Ascendant and planetary alignments.
- **Transit Forecast & Ezharashani (ഗോചാര ഫലം):** Saturn (Sade Sati / Ezharashani / Ashtama Shani) and Jupiter transit impact analysis.
- **Career & Vocational Direction (തൊഴിൽ & കർമ്മഫലം):** 10th-house karmic inclinations, leadership, and vocational guidance.
- **Medical Astrology & Surgery (ആയുർ ജ്യോതിഷം):** Tridosha constitution balance and auspicious timing guidance for treatments and surgeries.
- **Financial & Wealth Forecasting (ധന ഭാവ ഫലം):** Dhana Yoga, Lakshmi Yoga, and wealth-accumulation indicators.
- **Remedial Prescriptions & Vazhipadu (പരിഹാര വിധികൾ):** Personalized Nakshatra-based gemstone recommendations (Ratnam) and Kerala temple offerings (Vazhipadu).
- **Housewarming Muhurtham (ഗൃഹപ്രവേശം):** Auspicious Grihapravesham dates and timings.
- **Bhoomi Puja (ഭൂമിപൂജ):** Foundation-laying Muhurtham finder.
- **Business Launch / Vyapar Muhurtham (വ്യാപാര മുഹൂർത്തം):** Favorable dates and stars for starting commercial ventures.
- **Vehicle Muhurtham (വാഹന മുഹൂർത്തം):** Auspicious dates and color guidance for vehicle purchases.
- **Travel Muhurtham (യാത്രാ മുഹൂർത്തം):** Vaara Shoola, Chandrabalam, and travel safety timing.
- **Baby Naming (നാമകരണം):** Nakshatra Pada-specific sacred seed syllables (നാമാക്ഷരങ്ങൾ) and name suggestions.
- **Early Life Samskaras (ബാല്യകാല സംസ്കാരങ്ങൾ):** Auspicious timing for Annaprasanam (Choroonu), Vidyarambham, and early rites.
- **Spiritual Initiation & Diksha (ഇഷ്ടദേവത):** Ishta Devatha identification and mantra/sadhana guidance.
- **Litigation & Dispute Strategy (വ്യവഹാര ജ്യോതിഷം):** Planetary strength analysis for legal and dispute resolution timing.
- **Astrometeorology & Relocation (കാലാവസ്ഥാ ജ്യോതിഷം):** Seasonal rainfall/weather trends and directional relocation insights.

### 4. Mobile-First UX, Bilingual & PWA Ready
- **Full Bilingual Switching:** Instant toggle between English and Malayalam (`LanguageContext`) across navigation, forms, charts, and interpretations.
- **Mobile-Optimized Controls:** Custom touch-friendly pickers (`CustomSelect`, `CustomDatePicker`, `CustomTimePicker`), responsive card layouts without clipping, haptic feedback (`haptics.ts`), and forced-dark-mode protection (`color-scheme: light only`, `forced-color-adjust: none`).
- **Web Worker Offloading:** Heavy Porutham, Dasa, and Muhurtham computations run off the main thread via Comlink (`astro.worker.ts`) for smooth UI animations.
- **PWA & Static Hosting Ready:** Configured with `vite-plugin-pwa` for installability/offline caching and `public/_redirects` for SPA routing.

---

## Tech Stack

- **Framework:** React 19, TypeScript (~5.8), Vite 6
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) with warm celestial light palette
- **Animations:** `motion` (Framer Motion)
- **Astronomy Engine:** `astronomy-engine` (Lahiri / Chitra Paksha sidereal calculations)
- **Concurrency:** `comlink` Web Workers
- **PDF & Export:** `html-to-image`, `html2canvas`, `jspdf`
- **Icons:** `lucide-react` & Google Material Symbols Outlined
- **PWA:** `vite-plugin-pwa`

---

## Project Structure

```text
├── public/
│   └── _redirects                  # SPA fallback routing
├── src/
│   ├── components/
│   │   ├── CustomDatePicker.tsx    # Mobile-friendly portal date picker
│   │   ├── CustomSelect.tsx        # Responsive native/desktop dropdown
│   │   ├── CustomTimePicker.tsx    # Touch-friendly HH:MM selector
│   │   ├── DailyHoroscopeModal.tsx # Nakshatra daily prediction & transit chart
│   │   ├── DailyPanchangModal.tsx  # Kerala Udaya Nakshatra & Panchangam details
│   │   ├── DasaTimeline.tsx        # Vimshottari Dasa cycle visualization
│   │   ├── MuhurthamFinder.tsx     # Marriage Muhurtham list
│   │   ├── PoruthamDetailModal.tsx # Detailed rule breakdown per Porutham
│   │   ├── RasiChart.tsx           # South Indian 12-house Rasi grid
│   │   └── *View.tsx               # 17 specialized Kerala astrology modules
│   ├── contexts/
│   │   └── LanguageContext.tsx     # English / Malayalam localization store
│   ├── utils/
│   │   ├── astroData.ts            # 27 Nakshatras, 12 Rasis, Pada-to-Rasi mapping
│   │   ├── astronomy.ts            # Sidereal longitudes, Lagna, Kerala Panchangam
│   │   ├── keralaMatchEngine.ts    # Dashakoota, Papasamyam, Chovva Dosham, Dasa Sandhi
│   │   ├── keralaAstrologySuite.ts # Specialized Kerala Jyothisham calculators
│   │   └── ...                     # Module-specific calculation engines
│   ├── workers/
│   │   └── astro.worker.ts         # Comlink Web Worker for non-blocking math
│   ├── App.tsx                     # Main SPA shell, routing & matchmaking views
│   └── index.css                   # Tailwind v4 theme tokens & light-mode enforcement
└── vite.config.ts                  # Vite + PWA configuration
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm

### Installation & Development
```bash
npm install
npm run dev
```
The app runs on `http://localhost:3000`.

### Type Checking & Production Build
```bash
npm run lint
npm run build
```
