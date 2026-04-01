# Cosmic Harmony: Advanced Kerala Vedic Astrology & Matchmaking

Cosmic Harmony is a sophisticated, full-featured Vedic astrology application built with modern web technologies. It provides precise astronomical calculations and traditional Kerala-style astrological insights, ranging from personalized daily horoscopes to complex relationship compatibility analysis.

## 🌟 Key Features

### 1. Personalized Daily Horoscope
- **Nakshatra-Based Predictions:** Get daily insights tailored to your birth star (Nakshatra).
- **Comprehensive Metrics:** View your daily status, lucky color, lucky number, and specific remedies (പരിഹാരം) in both English and Malayalam.
- **Real-Time Transit Chart:** Visualize the current planetary positions (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu) in a traditional Rashi Chart.

### 2. Vedic Matchmaking (Porutham)
- **10-Point Matching System:** Detailed analysis of the traditional 10 poruthams (Dina, Gana, Mahendra, Sthree Deergha, Yoni, Rasi, Rasiyadhipathi, Vasya, Rajju, and Vedha).
- **Compatibility Scoring:** Clear, visual representation of overall compatibility with detailed explanations for each factor.
- **Cultural Nuance:** Built specifically to align with Kerala's unique astrological traditions.

### 3. In-depth Cosmic Analysis
- **Planetary Alignment:** Detailed verification of planetary positions at the time of birth for both partners.
- **Papasamyam Balance:** Advanced calculation of dosha scores to ensure lifelong harmony and balance.
- **Dasa Sandhi Verification:** Critical check for overlapping major planetary periods that could impact the longevity of a relationship.

### 4. Muhurtham & Vimshottari Dasa
- **Auspicious Timing:** Calculate the best dates and times for significant life events based on star compatibility.
- **Dynamic Dasa Flow:** A beautiful, real-time visualization of the Vimshottari Dasa timeline, showing current Mahadasas and upcoming major cycles.

### 5. Professional PDF Reports
- **Exportable Insights:** Generate high-quality, professional PDF reports of the in-depth analysis and recommendations.
- **Modern Rendering:** Utilizes advanced image processing to ensure charts and gradients are perfectly preserved in the final document.

## 🛠️ Technical Stack

- **Frontend:** React 18, TypeScript
- **Styling:** Tailwind CSS v4 (Modern OKLCH color support)
- **Animations:** Motion (Framer Motion)
- **Astronomy Engine:** High-precision `astronomy-engine` for sidereal calculations.
- **Reporting:** `html-to-image` and `jsPDF` for reliable document generation.
- **Icons:** Lucide React & Material Symbols

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/cosmic-harmony.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📐 Architecture & Logic

The application relies on a custom-built astrological engine that bridges modern astronomical data with traditional Vedic rules:
- **Sidereal Longitude:** Calculations are performed using the Ayanamsa to ensure accuracy in the Vedic system.
- **Dynamic Charting:** The Rasi Chart component dynamically maps planetary longitudes to the 12 signs of the zodiac in the South Indian format.
- **Vimshottari Logic:** Dasa periods are calculated based on the precise degree of the Moon at birth, providing a highly accurate life timeline.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Developed with precision and care for the modern seeker of cosmic wisdom.*
