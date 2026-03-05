<div align="center">

# FinFlow

**Offline Personal Finance Management.**

No accounts. No cloud. No tracking. Your data stays on your device.

![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Version](https://img.shields.io/badge/version-2.3-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

</div>

---

## What is FinFlow?

FinFlow is a personal finance tracker that runs entirely in your browser or as a desktop app. All data is stored locally via `localStorage` — nothing ever leaves your machine.

---

## Features

### Dashboard
Today's balance, month-end balance, and period-end balance — all powered by a unified math engine that accounts for scheduled and recurring transactions. Includes monthly net, budget progress bar, category pie chart, top merchants, cash flow chart, recent transactions (with future items dimmed as "scheduled"), and a monthly summary table.

### Ledger
Day-by-day breakdown for each month with income, expenses, net, and running balance. Projected recurring charges appear on their expected dates so you can see exactly where your balance will be on any future day. Carry-forward balances include projected recurring from prior months.

### Transactions
Full transaction list with search, filtering by category/type/month, and sort by date, amount, or title. Each transaction shows its primary category and sub-category tags. Supports both one-time and recurring entries.

### Recurring Manager
Track subscriptions and recurring charges with billing cycle support (weekly, biweekly, monthly, quarterly, annually). Cards show a colored accent bar, category icon, status badge, monthly equivalent, and next billing date. Pause, resume, or delete with icon buttons. Click any card to view full payment history. Transactions with "Subscriptions" as a primary or sub-category automatically appear here even if not marked as recurring.

### Primary & Sub-Categories
Each transaction has one primary category (counts in pie charts, breakdowns, and all calculations) and optional sub-categories (used for filtering only — the amount only counts under the primary). The transaction modal has a dropdown for primary and pill-shaped chips for sub-categories.

### Bill Calendar
Visual calendar grid showing when recurring charges land each month. Navigate between months to plan ahead.

### Insights
Month-over-month bar chart, spending velocity, savings rate, streak tracker, daily average, remaining $/day, top categories, top merchants, day-of-week spending patterns, and smart insight cards (on target, overspending, great savings, etc.).

### Goals
Set savings targets with a target date and color. Allocate funds manually — each allocation creates an expense under "Savings" and reduces your balance. Track progress with visual bars. Delete a goal to return funds.

### Settings
8 built-in themes (Emerald, Violet, Cyan, Amber, Rose, Mint, Ice, Sunset). Custom category manager — add, edit icon/color, or delete categories (deleted categories reassign transactions to "Uncategorized"). Edit budget amount and dates anytime. JSON import/export for full backup. CSV export for spreadsheets. Reset all data.

### Timezone-Safe Math
All date calculations use local-time parsing to prevent recurring dates from drifting across timezone boundaries. Verified identical output across UTC, US Eastern, US Pacific, and IST.

---

## Quick Start

### Option 1: Run in Browser

```bash
git clone https://github.com/TarhineA/FinFlow.git
cd finflow
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Option 2: Build a Single HTML File

```bash
npm run build
```

Creates `dist/index.html` — a single, self-contained file with everything inlined. Double-click to open in any browser. No internet required.

### Option 3: Desktop App (Electron)

```bash
# Development
npm run electron:dev

# Build for your platform
npm run electron:build
npm run electron:build:win
npm run electron:build:mac
npm run electron:build:linux
```

Built apps appear in `release/`.

---

## Download

| Platform | Download |
|----------|----------|
| 🪟 Windows | [FinFlow-Setup.exe](https://github.com/TarhineA/finflow/releases/latest) |
| 🍎 macOS | [FinFlow.dmg](https://github.com/TarhineA/finflow/releases/latest) |
| 🐧 Linux | [FinFlow.AppImage](https://github.com/TarhineA/finflow/releases/latest) |
| 🌐 Browser | [finflow.html](https://github.com/TarhineA/finflow/releases/latest) — single file, double-click to open |

> **Windows note:** You may see a SmartScreen warning saying "Unknown publisher." This is normal for open-source software. Click **"More info"** → **"Run anyway"**. The app is fully open source — inspect every line of code in this repo.

---

## Project Structure

```
finflow/
├── src/
│   ├── App.jsx          # The entire app (single-file architecture)
│   └── main.jsx         # React entry point
├── electron/
│   └── main.cjs         # Electron main process
├── public/              # Static assets
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

## Roadmap

Planned features for upcoming releases:

- **Transaction Editing Rework** — inline editing, bulk actions, duplicate transactions, and split transactions across multiple categories with custom amounts per category.
- **Insights Rework** — redesigned insights page with interactive charts, spending trend analysis, budget forecasting, and custom date range comparisons.
- **Upcoming Transactions** — dedicated view for scheduled and projected transactions with a timeline, due-soon alerts, and the ability to confirm or skip projected recurring charges.
- **UI Rework** — visual refresh for select features including responsive mobile layout, improved navigation, and modernized card/table designs across all pages.

Have a suggestion? [Open an issue](https://github.com/TarhineA/finflow/issues) or submit a PR.

---

## License

MIT — do whatever you want with it.
