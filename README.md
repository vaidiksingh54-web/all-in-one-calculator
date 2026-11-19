# ◈ CalcVerse — All-in-One Calculator Suite

A beautifully designed, calm-colored calculator suite with **8 powerful tools** in a single responsive web app. Built with pure HTML, CSS, and JavaScript — no frameworks, no dependencies.

![CalcVerse](https://img.shields.io/badge/CalcVerse-v1.0-6C9BCF?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

## ✨ Features

### 🧮 Standard Calculator
Full-featured arithmetic calculator with history display, keyboard support, and percentage calculations.

### 🔬 Scientific Calculator
Advanced functions including trigonometry (sin, cos, tan), logarithms (log, ln), square roots, factorials, powers, constants (π, e), and more.

### 🔄 Unit Converter
Convert between units across **5 categories**:
- 🌡️ Temperature (°C, °F, K)
- 📏 Length (m, km, cm, mm, mi, yd, ft, in)
- ⚖️ Weight (kg, g, mg, lb, oz, ton)
- 🚀 Speed (m/s, km/h, mph, knot)
- 💾 Digital Storage (B, KB, MB, GB, TB, PB)

### 🎂 Age Calculator
Calculate exact age in years, months, and days with days-until-next-birthday countdown.

### ⚖️ BMI Calculator
Body Mass Index calculator with a visual gauge, color-coded categories, and health status indicator.

### 💰 Tip Calculator
Smart tip calculator with preset percentages, custom slider, bill splitting, and per-person breakdown.

### 🏦 Loan Calculator
Mortgage/loan calculator using the standard amortization formula with visual principal-vs-interest breakdown.

### 🎨 Color Converter
Real-time conversion between HEX, RGB, and HSL color formats with live preview and one-click copy.

## 🎨 Design Philosophy

- **3D Glassmorphism** — Translucent frosted glass cards, dynamic backdrop blur (`backdrop-filter`), and floating ambient glowing orbs
- **Tactile 3D Buttons & Mouse Tilt** — Interactive 3D perspective tilt on hover, realistic button depression, and bevel shadows
- **Click-to-Copy Result** — Click any calculator display or result to instantly copy with a glass toast notification
- **Calm Ocean Color Palette** — Soft blues, sage greens, gentle lavenders, and warm rose tones
- **Dark & Light Themes** — Smooth theme toggle with localStorage persistence
- **Responsive Design** — Works beautifully on desktop, tablet, and mobile
- **Clean & Minimal** — No visual clutter, just pure usability
- **Accessible** — Semantic HTML, keyboard navigation, proper contrast ratios

## 🔒 Security First

- **No `eval()`** — Custom recursive-descent math parser with proper operator precedence
- **No external dependencies** — Zero third-party JavaScript libraries
- **Input validation** — All inputs are sanitized and validated

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/vaidiksingh54-web/all-in-one-calculator.git
   ```

2. **Open in browser**
   ```bash
   cd calcverse
   # Simply open index.html in your browser
   # Or use a local server:
   npx serve .
   ```

No build steps. No npm install. No bundler. Just open and use.

## 📁 Project Structure

```
all-in-one-calculator/
├── calculator/
│   ├── index.html    # Semantic HTML with all 8 tool panels
│   ├── style.css     # Complete design system with CSS custom properties
│   └── app.js        # All calculator logic (safe math parser, no eval)
├── README.md
├── LICENSE
└── .gitignore
```

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| HTML5 | Semantic markup, accessibility |
| CSS3 | Custom properties, Grid, Flexbox, animations |
| Vanilla JS | IIFE modules, recursive-descent parser, DOM manipulation |
| Google Fonts | Inter (UI) + JetBrains Mono (numbers) |

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `0-9` | Number input |
| `+` `-` `*` `/` | Operators |
| `Enter` or `=` | Calculate |
| `Escape` | Clear |
| `Backspace` | Delete last character |
| `%` | Percentage |

## 📱 Responsive Breakpoints

- **Desktop** — Full sidebar + spacious calculator layout
- **Tablet** (≤768px) — Collapsible sidebar with hamburger menu
- **Mobile** (≤400px) — Compact layout with touch-optimized buttons

## 📄 License

MIT License — feel free to use, modify, and share.

---

<p align="center">
  Built with 💙 and pure web technologies
</p>
