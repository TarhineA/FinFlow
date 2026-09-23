<div align="center">

# FinFlow

**Personal Finance Management, synced across your devices.**

Single-user. Installable PWA. Works offline, syncs when online.

![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Web%20PWA-blue)
![Version](https://img.shields.io/badge/version-2.0-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

</div>

---

## What is FinFlow?

FinFlow is a personal finance tracker that runs in your browser and installs as a PWA (add it to your phone home screen or desktop dock). Your data syncs across all your devices through Firebase, protected by a single sync passphrase — only you can access it. It keeps a local cache (`localStorage` + Firestore offline persistence), so it keeps working offline and catches up when you reconnect.

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
8 built-in themes (Emerald, Violet, Cyan, Amber, Rose, Mint, Ice, Sunset). Custom category manager — add, edit icon/color, or delete categories (deleted categories reassign transactions to "Uncategorized"). Edit budget amount and dates anytime. JSON import/export for full backup. CSV export for spreadsheets. Sign out of a device. Reset all data (clears this device **and** the cloud).

### Cross-Device Sync
Sign in once per device with your sync passphrase. Your budgets, transactions, and goals sync in real time across every device. Each record carries an `updatedAt` stamp so the newest edit wins on merge. First-time setup on a device that already has local data shows a one-time **Merge / Keep cloud / Keep local** dialog so nothing is ever silently lost.

### Timezone-Safe Math
All date calculations use local-time parsing to prevent recurring dates from drifting across timezone boundaries. Verified identical output across UTC, US Eastern, US Pacific, and IST.

---

## Quick Start

### Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Firebase setup (one-time)

In the [Firebase console](https://console.firebase.google.com) for your project:

1. **Authentication → Sign-in method → Email/Password → Enable**
2. **Firestore Database → Create database**
3. **Firestore → Rules** → publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Your web config lives in `src/firebase.js`.

### Deploy (Firebase Hosting)

```bash
npm install -g firebase-tools   # once
firebase login                  # once
npm run deploy                  # build + deploy
```

`npm run deploy` runs `vite build` then `firebase deploy`. Your app goes live at `https://<project>.web.app`. Open it on any device, install it (browser "Install app" / iOS "Add to Home Screen"), and sign in with your passphrase.

---

## Project Structure

```
finflow/
├── src/
│   ├── App.jsx          # entire app + sync layer
│   ├── firebase.js      # Firebase init (auth + Firestore)
│   └── main.jsx
├── scripts/
│   └── gen-icons.cjs    # regenerates PWA icons
├── public/              # PWA icons (svg + png)
├── index.html
├── vite.config.js       # Vite + PWA plugin
├── firebase.json        # Firebase Hosting config
├── .firebaserc
├── package.json
├── LICENSE
└── README.md
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 with Hooks |
| Charts | Recharts |
| Build | Vite + vite-plugin-pwa |
| Sync / Auth | Firebase (Firestore + Email/Password) |
| Storage | Firestore (cloud) + localStorage / IndexedDB (offline cache) |
| Hosting | Firebase Hosting |
| Styling | Inline styles with CSS-in-JS design tokens |

---

## Themes

Switch between 8 built-in themes anytime in Settings:

**Emerald** · **Violet** · **Cyan** · **Amber** · **Rose** · **Mint** · **Ice** · **Sunset**

---

## Data & Privacy

- Single-user: access is gated by your sync passphrase + Firestore security rules (only your own document is readable/writable)
- Data syncs via your private Firestore document; a local cache (localStorage + IndexedDB) keeps the app working offline
- No analytics or telemetry (Analytics SDK intentionally omitted)
- Export your data as JSON (full backup) or CSV (spreadsheet-compatible)
- Import JSON backups to restore data
- "Reset All" clears this device **and** deletes your cloud document
- Choose a strong passphrase — on a public URL it's the only key to your data

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
