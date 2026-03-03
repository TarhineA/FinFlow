<div align="center">

# FinFlow

**Offline Personal Finance Management.**

No accounts. No cloud. No tracking. Your data stays on your device.

![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Windows%20%7C%20macOS%20%7C%20Linux-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

</div>

---

## What is FinFlow?

FinFlow is a personal finance tracker that runs entirely in your browser or as a desktop app. All data is stored locally via `localStorage` — nothing ever leaves your machine.

**Core features:**

- **Expense & Income tracking** — log transactions with categories, dates, and notes
- **Dashboard** — today's balance, month-end projection, period-end projection, health score
- **Upcoming 7 days** — see what's coming (subscriptions, recurring transactions)
- **Subscription manager** — track recurring services with billing cycle normalization
- **Insights engine** — 15+ rule-based analytics: savings rate, velocity, weekend patterns, spike detection, no-spend streaks, and more
- **Goals tracker** — set savings targets with progress bars
- **8 themes** — Emerald, Violet, Cyan, Amber, Rose, Mint, Ice, Sunset
- **Custom categories** — add/remove categories; deleted categories reassign transactions to "Uncategorized"
- **Editable budget** — modify your budget amount and dates anytime
- **Export/Import** — JSON backup & CSV export
- **Keyboard shortcuts** — `N` (expense), `I` (income), `⌘K` (command palette)
- **Command palette** — fuzzy search all actions

---

## Quick Start

### Option 1: Run in Browser

```bash
# Clone the repo
git clone https://github.com/TarhineA/FinFlow.git
cd finflow

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser. That's it.

### Option 2: Build a Single HTML File

```bash
npm run build
```

This creates `dist/index.html` — a single, self-contained file with everything inlined. You can:
- Double-click it to open in any browser
- Host it on any static server
- Email it to someone
- Put it on a USB drive

No internet required after building.

### Option 3: Desktop App (Electron)

```bash
# Run in development
npm run electron:dev

# Build for your platform
npm run electron:build         # auto-detect
npm run electron:build:win     # Windows .exe
npm run electron:build:mac     # macOS .dmg
npm run electron:build:linux   # Linux .AppImage + .deb
```

Built desktop apps appear in the `release/` folder.

---

## Download

**Standalone App**

| Platform | Download |
|----------|----------|
| 🪟 Windows | [FinFlow-Setup-1.0.0.exe](https://github.com/TarhineA/finflow/releases/latest) |
| 🌐 Browser | [finflow.html](https://github.com/TarhineA/finflow/releases/latest) — single file, double-click to open |

> **Windows note:** You may see a SmartScreen warning saying "Unknown publisher." This is normal for indie open-source software. Click **"More info"** → **"Run anyway"**. The app is fully open source — inspect every line of code in this repo.

---

---

## Project Structure

```
finflow/
├── src/
│   ├── App.jsx          # The entire app (single component file)
│   └── main.jsx         # React entry point
├── electron/
│   └── main.cjs         # Electron main process
├── public/              # Static assets (add icon.png here)
├── index.html           # HTML entry point
├── vite.config.js       # Vite + single-file plugin config
├── package.json         # Dependencies & scripts
├── LICENSE              # MIT
└── README.md
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 with Hooks |
| Charts | Recharts |
| Build | Vite + vite-plugin-singlefile |
| Desktop | Electron |
| Storage | localStorage (browser-native) |
| Styling | Inline styles with CSS-in-JS design tokens |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Add expense |
| `I` | Add income |
| `B` | Go to dashboard |
| `⌘K` / `Ctrl+K` | Command palette |
| `Esc` | Close modals |

---

## Themes

Switch between 8 built-in themes anytime in Settings:

**Emerald** · **Violet** · **Cyan** · **Amber** · **Rose** · **Mint** · **Ice** · **Sunset**

---

## Data & Privacy

- All data stored in `localStorage` — never transmitted anywhere
- No analytics, no telemetry, no third-party scripts
- Export your data as JSON (full backup) or CSV (spreadsheet-compatible)
- Import JSON backups to restore data
- Reset all data anytime from Settings

---

## Adding an App Icon

Place a `icon.png` (512×512px recommended) in the `public/` folder. Electron builder will use it for the desktop app icon.

For macOS, you can also provide an `icon.icns`. For Windows, `icon.ico`.

---

## Contributing

PRs are welcome! Some ideas:

- [ ] Dark/light mode toggle
- [ ] Receipt photo attachment (base64 in localStorage)
- [ ] Budget templates (Lean Month, Travel Budget, etc.)
- [ ] Multi-currency support with conversion
- [ ] Data sync via file (Dropbox/Google Drive folder)
- [ ] Mobile-responsive bottom navigation
- [ ] PWA support (service worker for installability)

```bash
# Fork, clone, branch
git checkout -b feature/my-feature

# Make changes, then
npm run dev  # test locally

# Commit and PR
git add . && git commit -m "Add my feature"
git push origin feature/my-feature
```

---

## License

MIT — do whatever you want with it.

---
