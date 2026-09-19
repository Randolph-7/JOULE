import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import {
  LayoutDashboard, ListOrdered, CalendarDays, Plus, X,
  TrendingUp, TrendingDown, Target, Percent, Flame, Snowflake,
  Trash2, ChevronLeft, ChevronRight, BookOpen, Settings as SettingsIcon,
  Upload, LogOut, Image as ImageIcon, CheckCircle2, Circle, BarChart3,
  Smile, Meh, Frown, Download, Building2, ShieldAlert, Lock, Unlock,
  Pencil, Ban, Play, Sparkles, Compass
} from "lucide-react";
import Papa from "papaparse";

/* ---------------------------------------------------------
   Design tokens — dark navy base, violet brand accent (theme-able)
--------------------------------------------------------- */
const THEMES = {
  dark: {
    bg: "#0B0D14", panel: "#161923", panelAlt: "#1D2130",
    border: "#272B3A", borderSoft: "#1F2330",
    text: "#EDEFF5", textDim: "#9198AC", textFaint: "#5C6478",
    profit: "#3ECF8E", profitDim: "#1B3F32",
    loss: "#F0566B", lossDim: "#4A2130",
    accent: "#7C5CFC", accentDim: "#241E42", accent2: "#5B8DEF",
    amber: "#E0A64C", amberDim: "#443519",
  },
  light: {
    bg: "#F4F5F9", panel: "#FFFFFF", panelAlt: "#F0F1F6",
    border: "#E1E3EC", borderSoft: "#EBECF3",
    text: "#181B27", textDim: "#565F76", textFaint: "#8890A3",
    profit: "#1C9A64", profitDim: "#DFF5EA",
    loss: "#D8394F", lossDim: "#FBE5E9",
    accent: "#6C4CF1", accentDim: "#ECE6FF", accent2: "#3B6FE0",
    amber: "#B0740A", amberDim: "#FBF1DA",
  },
};
const T = { ...THEMES.dark };
function applyTheme(name) { Object.assign(T, THEMES[name] || THEMES.dark); }
function cssVars() { return `:root{ --bg:${T.bg}; --panel:${T.panel}; --panel-alt:${T.panelAlt}; --border:${T.border}; --border-soft:${T.borderSoft}; --text:${T.text}; --text-dim:${T.textDim}; --text-faint:${T.textFaint}; }`; }

/* ---------------------------------------------------------
   Language / i18n (English + French)
--------------------------------------------------------- */
const TRANSLATIONS = {
  en: {
    "nav.dashboard": "Dashboard", "nav.tradeLog": "Trade log", "nav.calendar": "Calendar", "nav.preTrade": "Pre-Trade",
    "nav.accounts": "Accounts", "nav.playbook": "Playbook", "nav.risk": "Risk management", "nav.journal": "Journal",
    "nav.reports": "Reports", "nav.settings": "Settings",
    "nav.section.trading": "TRADING", "nav.section.management": "MANAGEMENT", "nav.section.riskReports": "RISK & REPORTS",
    "view.dashboard.title": "Overview", "view.dashboard.subtitle": "Your performance at a glance",
    "view.trades.title": "Trade log", "view.trades.subtitle": "Every trade you've logged",
    "view.calendar.title": "Calendar", "view.calendar.subtitle": "Daily P&L, day by day",
    "view.pretrade.title": "Pre-Trade", "view.pretrade.subtitle": "Forecast and debate a thesis before you enter",
    "view.accounts.title": "Accounts", "view.accounts.subtitle": "Every broker and prop-firm account you track",
    "view.risk.title": "Risk management", "view.risk.subtitle": "Daily loss and drawdown limits by account",
    "view.playbook.title": "Playbook", "view.playbook.subtitle": "The rules you hold yourself to",
    "view.journal.title": "Journal", "view.journal.subtitle": "Mindset and reflections over time",
    "view.reports.title": "Reports", "view.reports.subtitle": "Deeper cuts of your performance",
    "view.settings.title": "Settings", "view.settings.subtitle": "Profile, preferences, and your data",
    "action.importCsv": "Import CSV", "action.logTrade": "Log trade", "action.newPlan": "New pre-trade plan", "action.addAccount": "Add account",
    "common.allAccounts": "All accounts",
    "dashboard.accountBalance": "Account balance & P&L", "dashboard.winRate": "Trade win %", "dashboard.profitFactor": "Profit factor",
    "dashboard.avgWinLoss": "Avg win/loss trade", "dashboard.currentStreak": "Current streak", "dashboard.portfolioStatus": "Portfolio Status",
    "dashboard.equityCurve": "Equity curve", "dashboard.avgR": "Avg R-multiple", "dashboard.expectancy": "Expectancy / trade",
    "dashboard.discipline": "Discipline score", "dashboard.winLossSplit": "Win / loss split", "dashboard.pnlByStrategy": "P&L by strategy",
    "dashboard.bestWorst": "Best / worst", "dashboard.bestTrade": "Best trade", "dashboard.worstTrade": "Worst trade",
    "dashboard.rewardVsRisk": "Reward vs. risked stop", "dashboard.expectedPnl": "Expected P&L per trade", "dashboard.rulesFollowed": "Playbook rules followed",
    "settings.profile": "Profile", "settings.name": "Name", "settings.email": "Email", "settings.saveProfile": "Save profile",
    "settings.preferences": "Preferences", "settings.language": "Language", "settings.theme": "Theme", "settings.light": "Light", "settings.dark": "Dark",
    "settings.data": "Data", "settings.exportJson": "Export JSON", "settings.exportCsv": "Export CSV", "settings.clearAll": "Clear all data", "settings.logout": "Log out",
  },
  fr: {
    "nav.dashboard": "Tableau de bord", "nav.tradeLog": "Journal des trades", "nav.calendar": "Calendrier", "nav.preTrade": "Pré-trade",
    "nav.accounts": "Comptes", "nav.playbook": "Playbook", "nav.risk": "Gestion du risque", "nav.journal": "Journal",
    "nav.reports": "Rapports", "nav.settings": "Paramètres",
    "nav.section.trading": "TRADING", "nav.section.management": "GESTION", "nav.section.riskReports": "RISQUE & RAPPORTS",
    "view.dashboard.title": "Aperçu", "view.dashboard.subtitle": "Votre performance en un coup d'œil",
    "view.trades.title": "Journal des trades", "view.trades.subtitle": "Tous les trades enregistrés",
    "view.calendar.title": "Calendrier", "view.calendar.subtitle": "P&L quotidien, jour par jour",
    "view.pretrade.title": "Pré-trade", "view.pretrade.subtitle": "Prévoyez et débattez d'une thèse avant d'entrer",
    "view.accounts.title": "Comptes", "view.accounts.subtitle": "Chaque compte broker ou prop firm que vous suivez",
    "view.risk.title": "Gestion du risque", "view.risk.subtitle": "Limites de perte quotidienne et de drawdown par compte",
    "view.playbook.title": "Playbook", "view.playbook.subtitle": "Les règles que vous vous imposez",
    "view.journal.title": "Journal", "view.journal.subtitle": "État d'esprit et réflexions dans le temps",
    "view.reports.title": "Rapports", "view.reports.subtitle": "Analyses plus poussées de votre performance",
    "view.settings.title": "Paramètres", "view.settings.subtitle": "Profil, préférences et vos données",
    "action.importCsv": "Importer un CSV", "action.logTrade": "Enregistrer un trade", "action.newPlan": "Nouveau plan pré-trade", "action.addAccount": "Ajouter un compte",
    "common.allAccounts": "Tous les comptes",
    "dashboard.accountBalance": "Solde du compte & P&L", "dashboard.winRate": "Taux de réussite", "dashboard.profitFactor": "Facteur de profit",
    "dashboard.avgWinLoss": "Gain/perte moyen", "dashboard.currentStreak": "Série en cours", "dashboard.portfolioStatus": "Statut du portefeuille",
    "dashboard.equityCurve": "Courbe d'équité", "dashboard.avgR": "R-multiple moyen", "dashboard.expectancy": "Espérance / trade",
    "dashboard.discipline": "Score de discipline", "dashboard.winLossSplit": "Répartition gains / pertes", "dashboard.pnlByStrategy": "P&L par stratégie",
    "dashboard.bestWorst": "Meilleur / pire", "dashboard.bestTrade": "Meilleur trade", "dashboard.worstTrade": "Pire trade",
    "dashboard.rewardVsRisk": "Gain par rapport au risque pris", "dashboard.expectedPnl": "P&L attendu par trade", "dashboard.rulesFollowed": "Règles du playbook suivies",
    "settings.profile": "Profil", "settings.name": "Nom", "settings.email": "E-mail", "settings.saveProfile": "Enregistrer le profil",
    "settings.preferences": "Préférences", "settings.language": "Langue", "settings.theme": "Thème", "settings.light": "Clair", "settings.dark": "Sombre",
    "settings.data": "Données", "settings.exportJson": "Exporter en JSON", "settings.exportCsv": "Exporter en CSV", "settings.clearAll": "Effacer toutes les données", "settings.logout": "Se déconnecter",
  },
};
let LANG = "en";
function setLangGlobal(l) { LANG = l; }
function t(key) { const dict = TRANSLATIONS[LANG] || TRANSLATIONS.en; return dict[key] ?? TRANSLATIONS.en[key] ?? key; }

const fontSans = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const fontMono = "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace";
const DEFAULT_RULES = [
  "Waited for confirmation before entry",
  "Sized position per risk plan",
  "Set a stop loss before entering",
  "Followed exit plan / target",
  "Avoided revenge trading",
];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const MISTAKE_TAGS = ["FOMO entry", "Oversized", "No stop set", "Moved stop", "Chased entry", "Early exit", "Late exit", "Revenge trade"];
const EMOTION_TAGS = ["Calm", "Confident", "Anxious", "Frustrated", "Excited", "Bored", "Impatient"];

/* ---------------------------------------------------------
   Seed data
--------------------------------------------------------- */
function seedAccounts() {
  return [
    { id: "acct-1", name: "Main Brokerage", firm: "Personal", type: "personal", startingBalance: 25000, maxDailyLossPct: 5, maxDrawdownPct: 10, consistencyRulePct: 0, profitTarget: 0, defaultFees: 1, status: "active", createdDate: "2026-07-01" },
    { id: "acct-2", name: "Topstep Futures Combine", firm: "Topstep", type: "propfirm", startingBalance: 150000, maxDailyLossPct: 3, maxDrawdownPct: 6, consistencyRulePct: 40, profitTarget: 9000, defaultFees: 4.5, status: "active", createdDate: "2026-08-01" },
  ];
}
function seedTrades() {
  const raw = [
    ["2026-08-03", "NVDA", "long", 40, 118.2, 121.9, 117.1, 4.2, "Breakout", "Followed plan, took profit at target."],
    ["2026-08-03", "TSLA", "short", 25, 262.4, 259.1, 264.8, 3.8, "Reversal", "Faded morning spike."],
    ["2026-08-04", "AAPL", "long", 60, 227.5, 226.4, 225.0, 2.1, "Pullback", "Cut early, chart still worked after."],
    ["2026-08-05", "SPY", "long", 100, 561.2, 564.8, 558.9, 5.0, "Trend", "Clean trend day, held through pullback."],
    ["2026-08-05", "MSFT", "short", 30, 421.0, 424.6, 417.2, 3.0, "Breakout", "Bad short, broke resistance instead of failing."],
    ["2026-08-06", "AMD", "long", 80, 142.3, 139.9, 140.1, 4.5, "Reversal", "Entered too early, no confirmation."],
    ["2026-08-07", "NVDA", "long", 50, 119.8, 124.5, 117.9, 4.8, "Trend", "Scaled out in thirds, best trade of week."],
    ["2026-08-10", "QQQ", "short", 40, 483.6, 480.1, 486.0, 3.2, "Reversal", "Waited for confirmation candle, worked well."],
    ["2026-08-11", "TSLA", "long", 20, 255.0, 258.9, 251.5, 2.9, "Breakout", ""],
    ["2026-08-12", "META", "long", 15, 512.0, 508.2, 505.0, 2.4, "Pullback", "Sized too big for the setup quality."],
    ["2026-08-12", "SPY", "short", 90, 566.4, 563.9, 569.0, 4.6, "Trend", "Good discipline on stop placement."],
    ["2026-08-13", "AAPL", "long", 55, 224.1, 227.0, 222.0, 2.8, "Breakout", "Textbook breakout retest."],
    ["2026-08-14", "AMD", "short", 70, 140.5, 143.2, 137.8, 4.1, "Reversal", "Fought the trend, shouldn't have."],
    ["2026-08-17", "NVDA", "long", 45, 122.0, 120.1, 119.5, 3.6, "Pullback", "Support failed, honored stop quickly."],
    ["2026-08-18", "MSFT", "long", 35, 418.5, 423.0, 415.0, 3.3, "Trend", ""],
    ["2026-08-19", "QQQ", "long", 60, 479.2, 482.4, 476.5, 4.0, "Breakout", "Great volume confirmation."],
    ["2026-08-20", "TSLA", "short", 30, 261.8, 257.3, 265.0, 3.5, "Reversal", "Patience paid off waiting for the rejection."],
    ["2026-08-21", "SPY", "long", 110, 564.0, 562.1, 561.0, 5.2, "Pullback", "Chased the entry, no edge."],
    ["2026-08-24", "META", "short", 18, 515.5, 511.0, 519.0, 2.6, "Trend", "Good read on exhaustion move."],
    ["2026-08-25", "AAPL", "short", 50, 228.9, 231.5, 226.0, 3.0, "Reversal", "Squeeze caught me offside."],
    ["2026-08-26", "NVDA", "long", 60, 121.5, 126.2, 119.0, 5.0, "Breakout", "Let winners run, best day this month."],
    ["2026-08-27", "AMD", "long", 40, 138.0, 140.8, 136.0, 3.4, "Trend", ""],
    ["2026-08-28", "QQQ", "short", 55, 485.0, 482.0, 488.0, 3.9, "Pullback", "Solid risk/reward, 1:2.5."],
    ["2026-08-31", "SPY", "long", 95, 563.5, 567.9, 560.5, 5.5, "Trend", "Held overnight gap continuation."],
    ["2026-09-01", "TSLA", "long", 22, 259.5, 256.0, 255.0, 2.7, "Breakout", "False breakout, market chop."],
    ["2026-09-02", "MSFT", "short", 28, 424.8, 421.2, 428.0, 3.1, "Reversal", "Nice fade off the highs."],
    ["2026-09-03", "META", "long", 16, 509.0, 514.6, 505.5, 2.5, "Trend", "Stuck to the plan all the way to target."],
    ["2026-09-04", "NVDA", "short", 48, 125.8, 128.9, 122.5, 4.4, "Pullback", "Wrong side of momentum, exited late."],
    ["2026-09-08", "AAPL", "long", 58, 226.0, 229.4, 223.5, 2.9, "Breakout", ""],
    ["2026-09-09", "SPY", "short", 100, 568.2, 565.0, 571.5, 5.1, "Reversal", "Great entry off resistance confluence."],
  ];
  const stockTrades = raw.map(([date, symbol, side, qty, entry, exit, stop, fees, tag, notes], i) => {
    const gross = side === "long" ? (exit - entry) * qty : (entry - exit) * qty;
    const pnl = Math.round((gross - fees) * 100) / 100;
    const risk = Math.abs(entry - stop) * qty;
    const rMultiple = risk ? Math.round((pnl / risk) * 100) / 100 : null;
    return { id: `seed-${i}`, date, symbol, side, qty, entry, exit, stopLoss: stop, fees, tag, notes, pnl, risk, rMultiple, hasScreenshot: false, accountId: "acct-1", assetType: "stock", pointValue: 1 };
  });
  const futuresRaw = [
    ["2026-09-01", "ES", "long", 2, 5710.25, 5719.50, 5704.00, 4.5, "Trend", "Held through the NY open, ES trending cleanly.", 50],
    ["2026-09-03", "NQ", "short", 1, 19850.00, 19809.00, 19891.00, 4.5, "Reversal", "Faded the open against an overextended move.", 20],
    ["2026-09-05", "ES", "long", 3, 5722.00, 5715.75, 5717.50, 4.5, "Pullback", "Stopped out on a shallow pullback that reversed after.", 50],
    ["2026-09-08", "ES", "long", 2, 5730.50, 5741.00, 5724.00, 4.5, "Breakout", "Clean breakout of the overnight high, scaled out in pieces."],
    ["2026-09-09", "NQ", "long", 1, 19920.00, 19965.00, 19895.00, 4.5, "Trend", "Rode the morning trend, exited into resistance."],
  ];
  const futuresTrades = futuresRaw.map(([date, symbol, side, qty, entry, exit, stop, fees, tag, notes, pointValueMaybe], i) => {
    const pointValue = pointValueMaybe || (symbol === "NQ" ? 20 : 50);
    const points = side === "long" ? exit - entry : entry - exit;
    const pnl = Math.round((points * pointValue * qty - fees) * 100) / 100;
    const riskPoints = Math.abs(entry - stop);
    const risk = Math.round(riskPoints * pointValue * qty * 100) / 100;
    const rMultiple = risk ? Math.round((pnl / risk) * 100) / 100 : null;
    return { id: `seedf-${i}`, date, symbol, side, qty, entry, exit, stopLoss: stop, fees, tag, notes, pnl, risk, rMultiple, hasScreenshot: false, accountId: "acct-2", assetType: "futures", pointValue };
  });
  const forexRaw = [
    ["2026-09-02", "EURUSD", "long", 50000, 1.0850, 1.0910, 1.0820, 5, "Trend", "Rode dollar weakness after the CPI print."],
    ["2026-09-10", "GBPUSD", "short", 40000, 1.2680, 1.2625, 1.2715, 5, "Reversal", "Faded the spike into resistance after the BoE presser."],
  ];
  const forexTrades = forexRaw.map(([date, symbol, side, qty, entry, exit, stop, fees, tag, notes], i) => {
    const gross = side === "long" ? (exit - entry) * qty : (entry - exit) * qty;
    const pnl = Math.round((gross - fees) * 100) / 100;
    const risk = Math.round(Math.abs(entry - stop) * qty * 100) / 100;
    const rMultiple = risk ? Math.round((pnl / risk) * 100) / 100 : null;
    return { id: `seedx-${i}`, date, symbol, side, qty, entry, exit, stopLoss: stop, fees, tag, notes, pnl, risk, rMultiple, hasScreenshot: false, accountId: "acct-1", assetType: "forex", pointValue: 1 };
  });
  return [...stockTrades, ...futuresTrades, ...forexTrades];
}
function seedJournal() {
  return [
    { date: "2026-08-05", mood: "great", note: "Sharp all session. Stuck to the plan on every entry." },
    { date: "2026-08-14", mood: "rough", note: "Forced a short against a clear uptrend. Need to respect trend days." },
    { date: "2026-08-26", mood: "great", note: "Best trade of the month on NVDA — patient scale-out." },
    { date: "2026-09-04", mood: "neutral", note: "Slow to react on the short, gave back some open profit." },
  ];
}

/* ---------------------------------------------------------
   Storage helpers
--------------------------------------------------------- */
async function loadKey(key, fallback) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : fallback; } catch (e) { return fallback; }
}
async function saveKey(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); } catch (e) { /* best effort */ }
}

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
const fmtMoney = (n) => { const abs = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); return `${n < 0 ? "-" : ""}$${abs}`; };
const fmtShort = (n) => { const sign = n < 0 ? "-" : ""; const abs = Math.abs(n); if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(abs >= 10000 ? 1 : 2)}K`; return `${sign}$${abs.toFixed(0)}`; };
const fmtDate = (d) => { const [y, m, day] = d.split("-"); return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m - 1]} ${+day}`; };
const todayStr = () => new Date().toISOString().slice(0, 10);
const weekday = (d) => new Date(d + "T00:00:00").toLocaleDateString("default", { weekday: "short" });

function computeStats(trades) {
  if (trades.length === 0) return { net: 0, winRate: 0, profitFactor: 0, avgWin: 0, avgLoss: 0, wins: 0, losses: 0, total: 0, best: 0, worst: 0, streak: { type: "none", count: 0 }, avgR: 0, expectancy: 0, disciplineRate: null };
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl < 0);
  const net = trades.reduce((s, t) => s + t.pnl, 0);
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const winRate = (wins.length / trades.length) * 100;
  const profitFactor = grossLoss === 0 ? grossWin : grossWin / grossLoss;
  const avgWin = wins.length ? grossWin / wins.length : 0;
  const avgLoss = losses.length ? grossLoss / losses.length : 0;
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  let streakType = null, streakCount = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const tt = sorted[i].pnl > 0 ? "win" : "loss";
    if (streakType === null) { streakType = tt; streakCount = 1; } else if (tt === streakType) streakCount++; else break;
  }
  const best = Math.max(...trades.map(t => t.pnl));
  const worst = Math.min(...trades.map(t => t.pnl));
  const rTrades = trades.filter(t => t.rMultiple !== null && t.rMultiple !== undefined);
  const avgR = rTrades.length ? rTrades.reduce((s, t) => s + t.rMultiple, 0) / rTrades.length : 0;
  const expectancy = (winRate / 100) * avgWin - (1 - winRate / 100) * avgLoss;
  const checklistTrades = trades.filter(t => t.checklist && Object.keys(t.checklist).length > 0);
  const disciplineRate = checklistTrades.length ? checklistTrades.reduce((s, t) => { const vals = Object.values(t.checklist); return s + (vals.filter(Boolean).length / vals.length); }, 0) / checklistTrades.length * 100 : null;
  return { net, winRate, profitFactor, avgWin, avgLoss, wins: wins.length, losses: losses.length, total: trades.length, best, worst, streak: { type: streakType || "none", count: streakCount }, avgR, expectancy, disciplineRate };
}
function equityCurve(trades, startingBalance) {
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  let running = startingBalance || 0;
  return sorted.map((t, i) => { running += t.pnl; return { idx: i + 1, date: fmtDate(t.date), equity: Math.round(running * 100) / 100 }; });
}
function drawdownSeries(trades, startingBalance) {
  const curve = equityCurve(trades, startingBalance);
  let peak = startingBalance || 0;
  return curve.map(pt => { peak = Math.max(peak, pt.equity); return { idx: pt.idx, date: pt.date, drawdown: Math.round((pt.equity - peak) * 100) / 100 }; });
}
function dailyPnl(trades) { const map = {}; trades.forEach(t => { map[t.date] = (map[t.date] || 0) + t.pnl; }); return map; }
function computeDayStreak(daily) {
  const dates = Object.keys(daily).sort();
  if (!dates.length) return { type: "none", count: 0 };
  let type = null, count = 0;
  for (let i = dates.length - 1; i >= 0; i--) { const t = daily[dates[i]] > 0 ? "win" : "loss"; if (type === null) { type = t; count = 1; } else if (t === type) count++; else break; }
  return { type: type || "none", count };
}
function rHistogram(trades) {
  const buckets = [{ label: "< -2R", min: -Infinity, max: -2, count: 0 }, { label: "-2 to -1R", min: -2, max: -1, count: 0 }, { label: "-1 to 0R", min: -1, max: 0, count: 0 }, { label: "0 to 1R", min: 0, max: 1, count: 0 }, { label: "1 to 2R", min: 1, max: 2, count: 0 }, { label: "> 2R", min: 2, max: Infinity, count: 0 }];
  trades.forEach(t => { if (t.rMultiple === null || t.rMultiple === undefined) return; const b = buckets.find(b => t.rMultiple > b.min && t.rMultiple <= b.max) || buckets[buckets.length - 1]; b.count++; });
  return buckets;
}
function computeZella(trades, stats, startingBalance) {
  const dd = drawdownSeries(trades, startingBalance);
  const worstDD = Math.min(0, ...dd.map(d => d.drawdown));
  const ddPct = startingBalance ? Math.abs(worstDD) / startingBalance * 100 : 0;
  const daily = Object.values(dailyPnl(trades));
  const mean = daily.reduce((a, b) => a + b, 0) / (daily.length || 1);
  const variance = daily.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (daily.length || 1);
  const cv = mean !== 0 ? Math.abs(Math.sqrt(variance) / mean) : 1;
  const winScore = clamp(stats.winRate, 0, 100);
  const pfScore = clamp((stats.profitFactor / 3) * 100, 0, 100);
  const avgWLScore = clamp(((stats.avgLoss ? stats.avgWin / stats.avgLoss : 3) / 3) * 100, 0, 100);
  const maxDDScore = clamp(100 - ddPct * 4, 0, 100);
  const recoveryFactor = worstDD < 0 ? stats.net / Math.abs(worstDD) : stats.net > 0 ? 3 : 0;
  const recoveryScore = clamp(recoveryFactor * 25, 0, 100);
  const consistencyScore = clamp(100 - cv * 40, 0, 100);
  const overall = (winScore + pfScore + avgWLScore + maxDDScore + recoveryScore + consistencyScore) / 6;
  return [
    { metric: "Win %", value: Math.round(winScore) }, { metric: "Profit factor", value: Math.round(pfScore) },
    { metric: "Avg win/loss", value: Math.round(avgWLScore) }, { metric: "Max drawdown", value: Math.round(maxDDScore) },
    { metric: "Recovery factor", value: Math.round(recoveryScore) }, { metric: "Consistency", value: Math.round(consistencyScore) },
  ].map(d => ({ ...d, overall: Math.round(overall) }));
}
function computeAccountMetrics(account, trades) {
  const own = trades.filter(t => t.accountId === account.id);
  const net = own.reduce((s, t) => s + t.pnl, 0);
  const balance = account.startingBalance + net;
  const today = todayStr();
  const dailyPnlToday = own.filter(t => t.date === today).reduce((s, t) => s + t.pnl, 0);
  const dd = drawdownSeries(own, account.startingBalance);
  const worstDD = Math.min(0, ...dd.map(d => d.drawdown));
  const dailyLimit = account.startingBalance * (account.maxDailyLossPct / 100);
  const ddLimit = account.startingBalance * (account.maxDrawdownPct / 100);
  const dailyUsedPct = dailyLimit ? clamp((dailyPnlToday < 0 ? Math.abs(dailyPnlToday) : 0) / dailyLimit * 100, 0, 150) : 0;
  const ddUsedPct = ddLimit ? clamp(Math.abs(worstDD) / ddLimit * 100, 0, 150) : 0;
  const daily = dailyPnl(own);
  const bestDay = Math.max(0, ...Object.values(daily));
  const consistencyPct = (account.consistencyRulePct && net > 0) ? clamp((bestDay / net) * 100, 0, 200) : 0;
  const consistencyBreached = !!(account.consistencyRulePct && net > 0 && consistencyPct > account.consistencyRulePct);
  const targetProgressPct = account.profitTarget ? clamp((net / account.profitTarget) * 100, 0, 100) : null;
  const targetHit = !!(account.profitTarget && net >= account.profitTarget);
  const breached = dailyUsedPct >= 100 || ddUsedPct >= 100 || consistencyBreached;
  return { net, balance, dailyPnl: dailyPnlToday, worstDD, dailyLimit, ddLimit, dailyUsedPct, ddUsedPct, consistencyPct, consistencyBreached, targetProgressPct, targetHit, breached, tradeCount: own.length };
}

/* ---------------------------------------------------------
   Small UI atoms
--------------------------------------------------------- */
function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: active ? T.accentDim : "transparent", color: active ? "#B7A6FF" : T.textDim, fontFamily: fontSans, fontSize: 13.5, fontWeight: 500, textAlign: "left" }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = T.panelAlt; }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      <Icon size={16} />{label}
    </button>
  );
}
function NavLabel({ children }) { return <div style={{ fontSize: 10, color: T.textFaint, fontWeight: 700, letterSpacing: 0.6, padding: "0 12px", margin: "14px 0 6px" }}>{children}</div>; }
function Pill({ children, tone = "neutral" }) {
  const map = { profit: { bg: T.profitDim, fg: T.profit }, loss: { bg: T.lossDim, fg: T.loss }, neutral: { bg: T.panelAlt, fg: T.textDim }, amber: { bg: T.amberDim, fg: T.amber } };
  const c = map[tone];
  return <span style={{ background: c.bg, color: c.fg, fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 20, fontFamily: fontSans, whiteSpace: "nowrap" }}>{children}</span>;
}
function ProgressBar({ pct }) {
  const w = clamp(pct, 0, 100);
  const color = pct >= 100 ? T.loss : pct >= 70 ? T.amber : T.profit;
  return <div style={{ height: 7, borderRadius: 4, background: T.borderSoft, overflow: "hidden" }}><div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: 4 }} /></div>;
}
function Modal({ children, onClose, width = 460 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(6,8,11,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, width, maxWidth: "94vw", padding: 22, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
const inputStyle = { width: "100%", background: "var(--panel-alt)", border: "1px solid var(--border)", borderRadius: 7, padding: "9px 11px", color: "var(--text)", fontFamily: fontSans, fontSize: 13.5, outline: "none", boxSizing: "border-box" };
const labelStyle = { fontSize: 11.5, color: "var(--text-dim)", fontWeight: 600, marginBottom: 6, display: "block" };
function PrimaryButton({ children, onClick, disabled, style }) {
  return <button onClick={onClick} disabled={disabled} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: disabled ? T.panelAlt : `linear-gradient(135deg, #8B6CFF, #6C4CF1)`, color: disabled ? T.textFaint : "#fff", fontFamily: fontSans, fontWeight: 700, fontSize: 13.5, cursor: disabled ? "not-allowed" : "pointer", ...style }}>{children}</button>;
}
function getMoods() { return { great: { icon: Smile, color: T.profit, label: "Great" }, neutral: { icon: Meh, color: T.amber, label: "Neutral" }, rough: { icon: Frown, color: T.loss, label: "Rough" } }; }

function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel} width={400}>
      <h3 style={{ margin: "0 0 10px", fontSize: 16, color: T.text, fontWeight: 600 }}>{title}</h3>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: T.textDim, lineHeight: 1.55 }}>{message}</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textDim, fontFamily: fontSans, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
        <button onClick={onConfirm} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: T.loss, color: "#fff", fontFamily: fontSans, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------
   Gauge atoms
--------------------------------------------------------- */
function SemiGauge({ value, color = T.profit, track = T.borderSoft }) {
  const data = [{ v: clamp(value, 0, 100) }, { v: 100 - clamp(value, 0, 100) }];
  return (
    <div style={{ position: "relative", width: 96, height: 54 }}>
      <PieChart width={96} height={96}><Pie data={data} dataKey="v" cx={48} cy={48} startAngle={180} endAngle={0} innerRadius={30} outerRadius={44} stroke="none"><Cell fill={color} /><Cell fill={track} /></Pie></PieChart>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 8, textAlign: "center", fontFamily: fontMono, fontWeight: 700, fontSize: 15, color: T.text }}>{value.toFixed(1)}%</div>
    </div>
  );
}
function RingGauge({ fraction, color = T.profit, track = T.borderSoft, label }) {
  const f = clamp(fraction, 0, 1);
  const data = [{ v: f }, { v: 1 - f }];
  return (
    <div style={{ position: "relative", width: 78, height: 78 }}>
      <PieChart width={78} height={78}><Pie data={data} dataKey="v" cx={39} cy={39} startAngle={90} endAngle={90 - 360 * f} innerRadius={27} outerRadius={37} stroke="none"><Cell fill={color} /><Cell fill={track} /></Pie></PieChart>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontMono, fontWeight: 700, fontSize: 14, color: T.text }}>{label}</div>
    </div>
  );
}
function WinLossBar({ avgWin, avgLoss }) {
  const total = avgWin + avgLoss || 1;
  const winPct = (avgWin / total) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: fontMono, fontSize: 13, fontWeight: 700 }}><span style={{ color: T.profit }}>{fmtShort(avgWin)}</span><span style={{ color: T.loss }}>-{fmtShort(avgLoss)}</span></div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: T.borderSoft }}><div style={{ width: `${winPct}%`, background: T.profit }} /><div style={{ width: `${100 - winPct}%`, background: T.loss }} /></div>
    </div>
  );
}
function StreakBadge({ count, type, label }) {
  const color = type === "win" ? T.profit : type === "loss" ? T.loss : T.textFaint;
  return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><div style={{ width: 52, height: 52, borderRadius: "50%", border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontMono, fontWeight: 700, fontSize: 17, color: T.text }}>{count}</div><span style={{ fontSize: 10, color: T.textFaint, fontWeight: 700, letterSpacing: 0.4 }}>{label}</span></div>);
}
function ScoreCard({ label, value, sub, children }) {
  return (<div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}><div style={{ fontSize: 12, color: T.textDim, fontWeight: 600 }}>{label}</div>{value !== undefined && <div style={{ fontFamily: fontMono, fontSize: 21, fontWeight: 700, color: T.text }}>{value}</div>}{children}{sub && <div style={{ fontSize: 11, color: T.textFaint }}>{sub}</div>}</div>);
}

/* ---------------------------------------------------------
   Login screen (lightweight local profile — not secure multi-user auth)
--------------------------------------------------------- */
function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (
    <div style={{ minHeight: 640, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontSans }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap'); ${cssVars()} *{box-sizing:border-box;} input:focus{border-color:${T.accent} !important;}`}</style>
      <div style={{ width: 360, maxWidth: "90vw", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 22 }}><div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, #8B6CFF, #6C4CF1)`, display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={17} color="#fff" strokeWidth={2.5} /></div><span style={{ fontWeight: 700, fontSize: 17, color: T.text }}>Joule</span></div>
        <h1 style={{ margin: "0 0 6px", fontSize: 17, color: T.text }}>Welcome back</h1>
        <p style={{ margin: "0 0 20px", fontSize: 12.5, color: T.textFaint }}>Set up your local trading journal profile.</p>
        <label style={labelStyle}>Name</label><input style={{ ...inputStyle, marginBottom: 12 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" />
        <label style={labelStyle}>Email</label><input style={{ ...inputStyle, marginBottom: 20 }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <PrimaryButton disabled={!name.trim()} onClick={() => onLogin({ name: name.trim(), email: email.trim(), joined: todayStr() })}>Enter journal</PrimaryButton>
        <p style={{ margin: "14px 0 0", fontSize: 11, color: T.textFaint, textAlign: "center" }}>Single-user local profile, stored to your account only. Not a secure multi-user login.</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Add / Edit Account Modal
--------------------------------------------------------- */
function AddAccountModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ? { ...initial, startingBalance: String(initial.startingBalance), maxDailyLossPct: String(initial.maxDailyLossPct), maxDrawdownPct: String(initial.maxDrawdownPct), consistencyRulePct: String(initial.consistencyRulePct || 0), profitTarget: String(initial.profitTarget || 0), defaultFees: String(initial.defaultFees || 0) } : { name: "", firm: "", type: "personal", startingBalance: "25000", maxDailyLossPct: "5", maxDrawdownPct: "10", consistencyRulePct: "40", profitTarget: "0", defaultFees: "0" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const canSave = form.name.trim() && form.startingBalance;
  const isPropFirm = form.type === "propfirm";
  const submit = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id || `acct-${Date.now()}`, name: form.name.trim(), firm: form.firm.trim() || (form.type === "propfirm" ? "Prop firm" : "Personal"),
      type: form.type, startingBalance: parseFloat(form.startingBalance) || 0, maxDailyLossPct: parseFloat(form.maxDailyLossPct) || 0,
      maxDrawdownPct: parseFloat(form.maxDrawdownPct) || 0, consistencyRulePct: isPropFirm ? (parseFloat(form.consistencyRulePct) || 0) : 0,
      profitTarget: isPropFirm ? (parseFloat(form.profitTarget) || 0) : 0, defaultFees: parseFloat(form.defaultFees) || 0,
      status: initial?.status || "active", createdDate: initial?.createdDate || todayStr(),
    });
  };
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><h3 style={{ margin: 0, fontSize: 16, color: T.text, fontWeight: 600 }}>{initial ? "Edit account" : "Add trading account"}</h3><button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textDim, padding: 4 }}><X size={18} /></button></div>
      <div style={{ marginBottom: 12 }}><label style={labelStyle}>Account name</label><input style={inputStyle} placeholder="e.g. Topstep Futures Combine" value={form.name} onChange={set("name")} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={labelStyle}>Type</label><select style={inputStyle} value={form.type} onChange={set("type")}><option value="personal">Personal</option><option value="propfirm">Prop firm</option></select></div>
        <div><label style={labelStyle}>Broker / firm</label><input style={inputStyle} placeholder="e.g. Topstep, Apex, Interactive Brokers" value={form.firm} onChange={set("firm")} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={labelStyle}>Starting balance</label><input type="number" style={inputStyle} value={form.startingBalance} onChange={set("startingBalance")} /></div>
        <div><label style={labelStyle}>Default fees / trade ($)</label><input type="number" step="0.1" style={inputStyle} value={form.defaultFees} onChange={set("defaultFees")} placeholder="Auto-fills new trades" /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: isPropFirm ? 12 : 18 }}>
        <div><label style={labelStyle}>Max daily loss (%)</label><input type="number" step="0.5" style={inputStyle} value={form.maxDailyLossPct} onChange={set("maxDailyLossPct")} /></div>
        <div><label style={labelStyle}>Max trailing drawdown (%)</label><input type="number" step="0.5" style={inputStyle} value={form.maxDrawdownPct} onChange={set("maxDrawdownPct")} /></div>
      </div>
      {isPropFirm && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div><label style={labelStyle}>Consistency rule (%)</label><input type="number" step="1" style={inputStyle} value={form.consistencyRulePct} onChange={set("consistencyRulePct")} placeholder="e.g. 40" /></div>
          <div><label style={labelStyle}>Profit target ($)</label><input type="number" step="100" style={inputStyle} value={form.profitTarget} onChange={set("profitTarget")} placeholder="e.g. 9000" /></div>
        </div>
      )}
      <p style={{ fontSize: 11, color: T.textFaint, margin: "-8px 0 16px" }}>This tracks the account's rules locally — it doesn't connect to your broker or prop firm. Trades you log or import get assigned to it manually.</p>
      <PrimaryButton disabled={!canSave} onClick={submit}>{initial ? "Save changes" : "Add account"}</PrimaryButton>
    </Modal>
  );
}

/* ---------------------------------------------------------
   Add Trade Modal
--------------------------------------------------------- */
function StarRating({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n === value ? 0 : n)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: n <= value ? T.amber : T.borderSoft, fontSize: 20, lineHeight: 1 }}>★</button>
      ))}
    </div>
  );
}
function TagChips({ options, selected, onToggle, tone = "neutral" }) {
  const colors = { neutral: { on: T.accentDim, onFg: "#B7A6FF", onBorder: T.accent }, loss: { on: T.lossDim, onFg: T.loss, onBorder: T.lossDim } };
  const c = colors[tone];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map(opt => { const on = selected.includes(opt); return (
        <button key={opt} type="button" onClick={() => onToggle(opt)} style={{ padding: "5px 10px", borderRadius: 20, border: `1px solid ${on ? c.onBorder : T.border}`, background: on ? c.on : T.panelAlt, color: on ? c.onFg : T.textDim, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: fontSans }}>{opt}</button>
      ); })}
    </div>
  );
}
/* ---------------------------------------------------------
   AI Analyst — Pre-Trade Lock debate
   Calls the Anthropic API with web search directly from the browser.
   This only works when this file is running as a live Claude artifact
   (the fetch to api.anthropic.com is available in that context) — it
   will not work if this .jsx is dropped into an arbitrary app/server
   without that same endpoint wired up.
--------------------------------------------------------- */
function verdictTone(v) {
  const s = (v || "").toLowerCase();
  if (s.includes("conflict")) return "loss";
  if (s.includes("partial")) return "amber";
  if (s.includes("align")) return "profit";
  return "neutral";
}
const ANALYST_SYSTEM_PROMPT = "You are a senior macro analyst at a hedge fund, helping a trader pressure-test their pre-trade thesis before they lock it into their journal. Use web search to ground your view in current, real economic data, news, and market sentiment for the instrument discussed — favor reputable sources (Reuters, Bloomberg, central bank releases, exchange data). Be direct, like a real trading-desk debate: challenge weak reasoning, ask sharpening questions, and change your view if the trader makes a good point backed by facts. Keep replies tight — a few sentences to a short paragraph — this is a live back-and-forth, not a report. This is for the trader's own personal journal, not investment advice issued to a third party. On your very first reply only, start with a line 'VERDICT: [Aligned / Partially Aligned / Conflicting / Insufficient Thesis]' before your macro read; on every later reply, skip that line and just respond conversationally to keep the debate going.";
async function callAnalystChat(messages) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: ANALYST_SYSTEM_PROMPT,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });
  if (!response.ok) throw new Error(`request failed (${response.status})`);
  const data = await response.json();
  const text = (data.content || []).map(b => (b.type === "text" ? b.text : "")).filter(Boolean).join("\n").trim();
  if (!text) throw new Error("empty response");
  return text;
}
function buildOpeningMessage({ symbol, side, assetType, tag, stopLoss, notes }) {
  const typeLabel = assetType === "futures" ? "futures" : assetType === "forex" ? "forex" : "stock/ETF";
  return `Here's my pre-trade thesis:
Instrument: ${symbol || "unspecified"} (${typeLabel})
Direction: ${side === "long" ? "Long" : "Short"}
Strategy tag: ${tag}
${stopLoss ? `Stop loss: ${stopLoss}\n` : ""}Today's date: ${todayStr()}

My notes/thesis: "${(notes || "").trim() || "(none written yet)"}"

What's the current macro and sentiment backdrop for this, and does my thesis hold up? Start your reply with a line "VERDICT: [Aligned / Partially Aligned / Conflicting / Insufficient Thesis]".`;
}
function ChatBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 8 }}>
      <div style={{ maxWidth: "88%", background: isUser ? T.accentDim : T.panel, border: `1px solid ${isUser ? T.accent : T.border}`, borderRadius: 10, padding: "8px 11px", fontSize: 12.5, color: isUser ? "#E7E1FF" : T.textDim, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
        {content}
      </div>
    </div>
  );
}
function LockedThesisCard({ lock }) {
  return (
    <div style={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        {lock.verdict ? <Pill tone={verdictTone(lock.verdict)}>{lock.verdict}</Pill> : <Pill>Debated</Pill>}
        <span style={{ fontSize: 10.5, color: T.textFaint }}>{new Date(lock.timestamp).toLocaleString()}</span>
      </div>
      <div style={{ maxHeight: 240, overflowY: "auto" }}>{lock.messages.map((m, i) => <ChatBubble key={i} role={m.role} content={m.content} />)}</div>
    </div>
  );
}

function AddTradeModal({ rules, accounts, preTradePlans, defaultAccountId, onClose, onSave }) {
  const initialAccountId = defaultAccountId || accounts[0]?.id || "";
  const initialFees = accounts.find(a => a.id === initialAccountId)?.defaultFees;
  const [form, setForm] = useState({ date: todayStr(), symbol: "", side: "long", qty: "", entry: "", exit: "", stopLoss: "", fees: initialFees !== undefined ? String(initialFees) : "0", tag: "Breakout", notes: "", accountId: initialAccountId, assetType: "stock", pointValue: "1", mae: "", mfe: "", preTradePlanId: "" });
  const [rating, setRating] = useState(0);
  const [mistakeTags, setMistakeTags] = useState([]);
  const [emotionTags, setEmotionTags] = useState([]);
  const [checklist, setChecklist] = useState(() => Object.fromEntries(rules.map(r => [r, false])));
  const [screenshot, setScreenshot] = useState(null);
  const fileRef = useRef(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isFutures = form.assetType === "futures";
  const canSave = form.symbol && form.qty && form.entry && form.exit && form.accountId && (!isFutures || form.pointValue);
  const toggleTag = (list, setList) => (tag) => setList(list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag]);
  const onAccountChange = (e) => { const id = e.target.value; const acct = accounts.find(a => a.id === id); setForm({ ...form, accountId: id, fees: acct?.defaultFees !== undefined ? String(acct.defaultFees) : form.fees }); };
  const [fileError, setFileError] = useState("");
  const handleFile = (e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 4 * 1024 * 1024) { setFileError("Image is too large — please use one under 4MB."); return; } setFileError(""); const reader = new FileReader(); reader.onload = () => setScreenshot(reader.result); reader.readAsDataURL(file); };
  const submit = () => {
    if (!canSave) return;
    const qty = parseFloat(form.qty), entry = parseFloat(form.entry), exit = parseFloat(form.exit), fees = parseFloat(form.fees || 0);
    const stopLoss = form.stopLoss ? parseFloat(form.stopLoss) : null;
    const multiplier = isFutures ? (parseFloat(form.pointValue) || 1) : 1;
    const gross = form.side === "long" ? (exit - entry) * qty * multiplier : (entry - exit) * qty * multiplier;
    const pnl = Math.round((gross - fees) * 100) / 100;
    const risk = stopLoss !== null ? Math.round(Math.abs(entry - stopLoss) * qty * multiplier * 100) / 100 : null;
    const rMultiple = risk ? Math.round((pnl / risk) * 100) / 100 : null;
    const mae = form.mae ? parseFloat(form.mae) : null;
    const mfe = form.mfe ? parseFloat(form.mfe) : null;
    const trade = { id: `t-${Date.now()}`, date: form.date, symbol: form.symbol.toUpperCase(), side: form.side, qty, entry, exit, stopLoss, fees, tag: form.tag, notes: form.notes, pnl, risk, rMultiple, mae, mfe, rating: rating || null, mistakeTags, emotionTags, checklist: rules.length ? checklist : undefined, hasScreenshot: !!screenshot, accountId: form.accountId, assetType: form.assetType, pointValue: multiplier, preTradePlanId: form.preTradePlanId || null };
    onSave(trade, screenshot);
  };
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><h3 style={{ margin: 0, fontSize: 16, color: T.text, fontWeight: 600 }}>Log a trade</h3><button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textDim, padding: 4 }}><X size={18} /></button></div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Account</label>
        <select style={inputStyle} value={form.accountId} onChange={onAccountChange}>{accounts.map(a => <option key={a.id} value={a.id}>{a.name} · {a.firm}</option>)}</select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={labelStyle}>Date</label><input type="date" style={inputStyle} value={form.date} onChange={set("date")} /></div>
        <div><label style={labelStyle}>Symbol</label><input placeholder={isFutures ? "ES" : form.assetType === "forex" ? "EURUSD" : "NVDA"} style={inputStyle} value={form.symbol} onChange={set("symbol")} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isFutures ? "1fr 1fr 1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={labelStyle}>Asset type</label><select style={inputStyle} value={form.assetType} onChange={set("assetType")}><option value="stock">Stock / ETF</option><option value="futures">Futures</option><option value="forex">Forex</option></select></div>
        <div><label style={labelStyle}>Side</label><select style={inputStyle} value={form.side} onChange={set("side")}><option value="long">Long</option><option value="short">Short</option></select></div>
        {isFutures && <div><label style={labelStyle}>Point value ($/pt)</label><input type="number" step="0.01" style={inputStyle} value={form.pointValue} onChange={set("pointValue")} placeholder="e.g. 50 for ES" /></div>}
      </div>
      <div style={{ marginBottom: 12 }}><label style={labelStyle}>Strategy tag</label><select style={inputStyle} value={form.tag} onChange={set("tag")}>{["Breakout", "Reversal", "Trend", "Pullback", "Other"].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={labelStyle}>{isFutures ? "Contracts" : form.assetType === "forex" ? "Units" : "Quantity"}</label><input type="number" style={inputStyle} value={form.qty} onChange={set("qty")} placeholder={form.assetType === "forex" ? "e.g. 100000 = 1 lot" : undefined} /></div>
        <div><label style={labelStyle}>Entry</label><input type="number" step="0.0001" style={inputStyle} value={form.entry} onChange={set("entry")} /></div>
        <div><label style={labelStyle}>Exit</label><input type="number" step="0.0001" style={inputStyle} value={form.exit} onChange={set("exit")} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={labelStyle}>Stop loss (for risk / R)</label><input type="number" step="0.01" style={inputStyle} value={form.stopLoss} onChange={set("stopLoss")} placeholder="Optional" /></div>
        <div><label style={labelStyle}>Fees</label><input type="number" step="0.01" style={inputStyle} value={form.fees} onChange={set("fees")} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={labelStyle}>Max adverse excursion ($)</label><input type="number" step="0.01" style={inputStyle} value={form.mae} onChange={set("mae")} placeholder="Optional — worst it moved against you" /></div>
        <div><label style={labelStyle}>Max favorable excursion ($)</label><input type="number" step="0.01" style={inputStyle} value={form.mfe} onChange={set("mfe")} placeholder="Optional — best it moved in your favor" /></div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Link a pre-trade plan (optional)</label>
        <select style={inputStyle} value={form.preTradePlanId} onChange={set("preTradePlanId")}>
          <option value="">— none —</option>
          {preTradePlans.filter(p => p.locked && !p.linkedTradeId).map(p => <option key={p.id} value={p.id}>{p.symbol} · {p.side === "long" ? "Long" : "Short"} · {fmtDate(p.date)}</option>)}
        </select>
        <p style={{ fontSize: 11, color: T.textFaint, margin: "6px 0 0" }}>Locked plans from the Pre-Trade tab that haven't been linked to a trade yet. Create one there before you enter.</p>
      </div>
      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Trade rating</label><StarRating value={rating} onChange={setRating} /></div>
      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Mistakes (optional)</label><TagChips options={MISTAKE_TAGS} selected={mistakeTags} onToggle={toggleTag(mistakeTags, setMistakeTags)} tone="loss" /></div>
      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Emotions (optional)</label><TagChips options={EMOTION_TAGS} selected={emotionTags} onToggle={toggleTag(emotionTags, setEmotionTags)} /></div>
      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Notes</label><textarea rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: fontSans }} value={form.notes} onChange={set("notes")} placeholder="What was the setup? What did you do well or poorly?" /></div>
      {rules.length > 0 && (<div style={{ marginBottom: 14 }}><label style={labelStyle}>Playbook checklist</label><div style={{ display: "flex", flexDirection: "column", gap: 6, background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: 10 }}>{rules.map(r => (<label key={r} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: T.textDim, cursor: "pointer" }}><input type="checkbox" checked={checklist[r] || false} onChange={(e) => setChecklist({ ...checklist, [r]: e.target.checked })} style={{ accentColor: T.accent }} />{r}</label>))}</div></div>)}
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Chart screenshot</label>
        {screenshot ? (<div style={{ position: "relative", display: "inline-block" }}><img src={screenshot} alt="Trade screenshot" style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 8, border: `1px solid ${T.border}`, display: "block" }} /><button onClick={() => setScreenshot(null)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(14,18,23,0.85)", border: "none", borderRadius: 6, cursor: "pointer", padding: 4, color: T.text }}><X size={13} /></button></div>) : (<button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "16px 0", borderRadius: 8, border: `1px dashed ${T.border}`, background: T.panelAlt, color: T.textDim, cursor: "pointer", fontFamily: fontSans, fontSize: 12.5 }}><ImageIcon size={15} /> Upload a chart screenshot</button>)}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        {fileError && <div style={{ fontSize: 11.5, color: T.loss, marginTop: 6 }}>{fileError}</div>}
      </div>
      <PrimaryButton disabled={!canSave} onClick={submit}>Save trade</PrimaryButton>
    </Modal>
  );
}

/* ---------------------------------------------------------
   Pre-Trade Plan Modal — forecast & debate before you have a trade
--------------------------------------------------------- */
function PreTradePlanModal({ onClose, onSave }) {
  const [form, setForm] = useState({ date: todayStr(), symbol: "", side: "long", assetType: "stock", tag: "Breakout", stopLoss: "", notes: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [verdict, setVerdict] = useState("");
  const [locked, setLocked] = useState(false);
  const send = async (textOverride, isOpening) => {
    const text = (textOverride ?? input).trim();
    if (!text) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setStatus("loading"); setError("");
    try {
      const reply = await callAnalystChat(newMessages);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
      if (isOpening) { const v = (reply.match(/VERDICT:\s*([^\n]+)/i) || [])[1]; if (v) setVerdict(v.trim()); }
      setStatus("idle");
    } catch (e) { setStatus("error"); setError(e?.message || "network error"); }
  };
  const startDebate = () => send(buildOpeningMessage({ symbol: form.symbol, side: form.side, assetType: form.assetType, tag: form.tag, stopLoss: form.stopLoss, notes: form.notes }), true);
  const retry = async () => {
    setStatus("loading"); setError("");
    try {
      const reply = await callAnalystChat(messages);
      setMessages([...messages, { role: "assistant", content: reply }]);
      setStatus("idle");
    } catch (e) { setStatus("error"); setError(e?.message || "network error"); }
  };
  const canSavePlan = locked && messages.length > 0 && form.symbol;
  const savePlan = () => {
    if (!canSavePlan) return;
    onSave({ id: `plan-${Date.now()}`, date: form.date, symbol: form.symbol.toUpperCase(), side: form.side, assetType: form.assetType, tag: form.tag, stopLoss: form.stopLoss ? parseFloat(form.stopLoss) : null, notes: form.notes, verdict, messages, locked: true, linkedTradeId: null, timestamp: new Date().toISOString() });
  };
  return (
    <Modal onClose={onClose} width={520}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: T.text, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><Compass size={17} color="#B7A6FF" /> New pre-trade plan</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textDim, padding: 4 }}><X size={18} /></button>
      </div>
      <p style={{ fontSize: 11.5, color: T.textFaint, margin: "-10px 0 16px" }}>Plan and pressure-test a forecast before you've even entered — no entry/exit needed yet. Link it to the real trade later from Trade log.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={labelStyle}>Date</label><input type="date" style={inputStyle} value={form.date} onChange={set("date")} disabled={locked} /></div>
        <div><label style={labelStyle}>Symbol</label><input placeholder={form.assetType === "futures" ? "ES" : form.assetType === "forex" ? "EURUSD" : "NVDA"} style={inputStyle} value={form.symbol} onChange={set("symbol")} disabled={locked} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={labelStyle}>Asset type</label><select style={inputStyle} value={form.assetType} onChange={set("assetType")} disabled={locked}><option value="stock">Stock / ETF</option><option value="futures">Futures</option><option value="forex">Forex</option></select></div>
        <div><label style={labelStyle}>Direction</label><select style={inputStyle} value={form.side} onChange={set("side")} disabled={locked}><option value="long">Long</option><option value="short">Short</option></select></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={labelStyle}>Strategy tag</label><select style={inputStyle} value={form.tag} onChange={set("tag")} disabled={locked}>{["Breakout", "Reversal", "Trend", "Pullback", "Other"].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        <div><label style={labelStyle}>Planned stop (optional)</label><input type="number" step="0.0001" style={inputStyle} value={form.stopLoss} onChange={set("stopLoss")} disabled={locked} /></div>
      </div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Thesis / forecast</label><textarea rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: fontSans }} value={form.notes} onChange={set("notes")} placeholder="What do you expect to happen and why?" disabled={locked} /></div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Debate with the analyst</label>
          {locked && <Pill tone="neutral"><Lock size={10} style={{ marginRight: 4, display: "inline", verticalAlign: -1 }} />Locked</Pill>}
        </div>
        {messages.length === 0 && !locked && (
          <button type="button" onClick={startDebate} disabled={!form.symbol || status === "loading"} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 11px", color: "#B7A6FF", fontSize: 11.5, fontWeight: 700, cursor: (!form.symbol || status === "loading") ? "not-allowed" : "pointer", fontFamily: fontSans, opacity: !form.symbol ? 0.5 : 1 }}>
            <Sparkles size={13} /> Start debate with the analyst
          </button>
        )}
        {messages.length > 0 && (
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: 10, background: T.panelAlt, maxHeight: 260, overflowY: "auto", marginBottom: 8 }}>
            {messages.map((m, i) => <ChatBubble key={i} role={m.role} content={m.content} />)}
            {status === "loading" && <div style={{ fontSize: 11.5, color: T.textFaint, display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={12} /> Thinking…</div>}
            {status === "error" && <div style={{ fontSize: 11.5, color: T.loss }}>Couldn't reach the analyst ({error}). <button type="button" onClick={retry} style={{ background: "none", border: "none", color: T.loss, textDecoration: "underline", cursor: "pointer", fontSize: 11.5, fontFamily: fontSans }}>Retry</button></div>}
          </div>
        )}
        {messages.length > 0 && !locked && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="Push back, ask a question, or add context…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }} disabled={status === "loading"} />
            <button type="button" onClick={() => send()} disabled={!input.trim() || status === "loading"} style={{ padding: "0 14px", borderRadius: 7, border: "none", background: T.accent, color: "#fff", fontWeight: 700, cursor: (!input.trim() || status === "loading") ? "not-allowed" : "pointer", fontFamily: fontSans }}>Send</button>
          </div>
        )}
        {messages.length > 0 && !locked && (
          <button type="button" onClick={() => setLocked(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "9px 0", borderRadius: 8, border: `1px solid ${T.accent}`, background: T.accentDim, color: "#B7A6FF", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: fontSans }}>
            <Lock size={13} /> Lock this thesis
          </button>
        )}
        {messages.length === 0 && !locked && <p style={{ fontSize: 11, color: T.textFaint, margin: "8px 0 0" }}>Uses live web search — informational only, not financial advice.</p>}
      </div>
      {locked ? <PrimaryButton onClick={savePlan}>Save plan</PrimaryButton> : <p style={{ fontSize: 11, color: T.textFaint, textAlign: "center", margin: 0 }}>Lock the thesis above to save this plan. Closing before locking discards it.</p>}
    </Modal>
  );
}

/* ---------------------------------------------------------
   Trade Detail Modal
--------------------------------------------------------- */
function TradeDetailModal({ trade, accounts, preTradePlans, onClose, onDelete }) {
  const [screenshot, setScreenshot] = useState(null);
  const [loadingShot, setLoadingShot] = useState(trade.hasScreenshot);
  useEffect(() => {
    let active = true;
    if (trade.hasScreenshot) window.storage.get(`shot:${trade.id}`).then(r => { if (active) { setScreenshot(r.value); setLoadingShot(false); } }).catch(() => { if (active) setLoadingShot(false); });
    return () => { active = false; };
  }, [trade.id, trade.hasScreenshot]);
  const accountName = accounts.find(a => a.id === trade.accountId)?.name || "Unassigned";
  const isFutures = trade.assetType === "futures";
  const assetTypeLabel = trade.assetType === "futures" ? "Futures" : trade.assetType === "forex" ? "Forex" : "Stock / ETF";
  const rows = [
    ["Account", accountName], ["Symbol", trade.symbol], ["Asset type", assetTypeLabel], ["Side", trade.side === "long" ? "Long" : "Short"], ["Date", fmtDate(trade.date)],
    ["Quantity", trade.qty], ["Entry", trade.entry.toFixed(2)], ["Exit", trade.exit.toFixed(2)],
    ...(isFutures ? [["Point value", `$${trade.pointValue}/pt`]] : []),
    ["Stop loss", trade.stopLoss ? trade.stopLoss.toFixed(2) : "—"], ["Fees", fmtMoney(trade.fees || 0)],
    ["Risk", trade.risk ? fmtMoney(trade.risk) : "—"], ["R-multiple", trade.rMultiple !== null && trade.rMultiple !== undefined ? `${trade.rMultiple.toFixed(2)}R` : "—"], ["Strategy", trade.tag],
  ];
  const efficiency = (trade.mfe && trade.pnl > 0) ? clamp((trade.pnl / trade.mfe) * 100, 0, 100) : null;
  return (
    <Modal onClose={onClose} width={520}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}><div><h3 style={{ margin: 0, fontSize: 17, color: T.text, fontWeight: 700 }}>{trade.symbol}</h3><div style={{ fontFamily: fontMono, fontSize: 20, fontWeight: 700, color: trade.pnl >= 0 ? T.profit : T.loss, marginTop: 4 }}>{fmtMoney(trade.pnl)}</div>{trade.rating ? <div style={{ marginTop: 4, color: T.amber, fontSize: 13, letterSpacing: 1 }}>{"★".repeat(trade.rating)}<span style={{ color: T.borderSoft }}>{"★".repeat(5 - trade.rating)}</span></div> : null}</div><button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textDim, padding: 4 }}><X size={18} /></button></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", marginBottom: 16 }}>{rows.map(([label, val]) => (<div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${T.borderSoft}`, padding: "6px 0" }}><span style={{ fontSize: 12.5, color: T.textFaint }}>{label}</span><span style={{ fontSize: 12.5, color: T.text, fontFamily: fontMono, fontWeight: 600 }}>{val}</span></div>))}</div>
      {(trade.mae || trade.mfe) && (<div style={{ marginBottom: 16 }}><div style={{ fontSize: 11.5, color: T.textFaint, fontWeight: 600, marginBottom: 6 }}>MAE / MFE</div><div style={{ display: "flex", gap: 16, fontSize: 12.5, color: T.textDim }}>{trade.mae ? <span>Adverse: <b style={{ color: T.loss, fontFamily: fontMono }}>{fmtMoney(trade.mae)}</b></span> : null}{trade.mfe ? <span>Favorable: <b style={{ color: T.profit, fontFamily: fontMono }}>{fmtMoney(trade.mfe)}</b></span> : null}{efficiency !== null ? <span>Efficiency: <b style={{ color: T.text, fontFamily: fontMono }}>{efficiency.toFixed(0)}%</b></span> : null}</div></div>)}
      {(trade.mistakeTags?.length > 0 || trade.emotionTags?.length > 0) && (<div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>{trade.mistakeTags?.map(t => <Pill key={t} tone="loss">{t}</Pill>)}{trade.emotionTags?.map(t => <Pill key={t}>{t}</Pill>)}</div>)}
      {trade.preTradePlanId && (() => { const plan = preTradePlans.find(p => p.id === trade.preTradePlanId); return plan ? (<div style={{ marginBottom: 16 }}><div style={{ fontSize: 11.5, color: T.textFaint, fontWeight: 600, marginBottom: 6 }}>PRE-TRADE PLAN · LOCKED BEFORE ENTRY</div><LockedThesisCard lock={{ verdict: plan.verdict, messages: plan.messages, timestamp: plan.timestamp }} /></div>) : null; })()}
      {trade.notes && (<div style={{ marginBottom: 16 }}><div style={{ fontSize: 11.5, color: T.textFaint, fontWeight: 600, marginBottom: 5 }}>NOTES</div><div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.5 }}>{trade.notes}</div></div>)}
      {trade.checklist && Object.keys(trade.checklist).length > 0 && (<div style={{ marginBottom: 16 }}><div style={{ fontSize: 11.5, color: T.textFaint, fontWeight: 600, marginBottom: 6 }}>PLAYBOOK CHECKLIST</div><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{Object.entries(trade.checklist).map(([rule, checked]) => (<div key={rule} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: checked ? T.textDim : T.textFaint }}>{checked ? <CheckCircle2 size={14} color={T.profit} /> : <Circle size={14} color={T.textFaint} />}{rule}</div>))}</div></div>)}
      {(loadingShot || screenshot) && (<div style={{ marginBottom: 16 }}><div style={{ fontSize: 11.5, color: T.textFaint, fontWeight: 600, marginBottom: 6 }}>CHART SCREENSHOT</div>{loadingShot ? <div style={{ fontSize: 12.5, color: T.textFaint }}>Loading image…</div> : <img src={screenshot} alt="Trade screenshot" style={{ maxWidth: "100%", borderRadius: 8, border: `1px solid ${T.border}` }} />}</div>)}
      <button onClick={() => onDelete(trade)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "10px 0", borderRadius: 8, border: `1px solid ${T.lossDim}`, background: "transparent", color: T.loss, fontFamily: fontSans, fontWeight: 600, fontSize: 13, cursor: "pointer" }}><Trash2 size={14} /> Delete trade</button>
    </Modal>
  );
}

/* ---------------------------------------------------------
   Import CSV Modal
--------------------------------------------------------- */
const FIELD_ALIASES = { date: ["date", "trade date", "opened"], symbol: ["symbol", "ticker"], side: ["side", "action", "direction", "type"], qty: ["qty", "quantity", "shares", "size"], entry: ["entry", "entryprice", "entry price", "buy price", "open price"], exit: ["exit", "exitprice", "exit price", "sell price", "close price"], fees: ["fees", "commission", "commissions"] };
function guessMapping(headers) { const lower = headers.map(h => h.toLowerCase().trim()); const mapping = {}; Object.entries(FIELD_ALIASES).forEach(([field, aliases]) => { const idx = lower.findIndex(h => aliases.includes(h)); mapping[field] = idx >= 0 ? headers[idx] : ""; }); return mapping; }
function ImportModal({ accounts, defaultAccountId, onClose, onImport }) {
  const [step, setStep] = useState("input");
  const [text, setText] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [accountId, setAccountId] = useState(defaultAccountId || accounts[0]?.id || "");
  const fileRef = useRef(null);
  const parse = (csvText) => { const result = Papa.parse(csvText, { header: true, skipEmptyLines: true }); const hdrs = result.meta.fields || []; setHeaders(hdrs); setRows(result.data); setMapping(guessMapping(hdrs)); setStep("map"); };
  const handleFile = (e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { setText(reader.result); parse(reader.result); }; reader.readAsText(file); };
  const ready = mapping.date && mapping.symbol && mapping.qty && mapping.entry && mapping.exit && accountId;
  const doImport = () => {
    const feesKey = mapping.fees;
    const imported = rows.map((row, i) => {
      const date = (row[mapping.date] || "").slice(0, 10) || todayStr();
      const symbol = (row[mapping.symbol] || "?").toUpperCase();
      const sideRaw = (row[mapping.side] || "long").toLowerCase();
      const side = ["short", "sell", "s"].includes(sideRaw) ? "short" : "long";
      const qty = parseFloat(row[mapping.qty]) || 0;
      const entry = parseFloat(row[mapping.entry]) || 0;
      const exit = parseFloat(row[mapping.exit]) || 0;
      const fees = feesKey ? parseFloat(row[feesKey]) || 0 : 0;
      const gross = side === "long" ? (exit - entry) * qty : (entry - exit) * qty;
      const pnl = Math.round((gross - fees) * 100) / 100;
      return { id: `imp-${Date.now()}-${i}`, date, symbol, side, qty, entry, exit, stopLoss: null, fees, tag: "Imported", notes: "", pnl, risk: null, rMultiple: null, hasScreenshot: false, accountId };
    }).filter(t => t.symbol !== "?" && t.qty > 0);
    onImport(imported);
  };
  return (
    <Modal onClose={onClose} width={560}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><h3 style={{ margin: 0, fontSize: 16, color: T.text, fontWeight: 600 }}>Import trades from broker CSV</h3><button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textDim, padding: 4 }}><X size={18} /></button></div>
      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Import into account</label><select style={inputStyle} value={accountId} onChange={(e) => setAccountId(e.target.value)}>{accounts.map(a => <option key={a.id} value={a.id}>{a.name} · {a.firm}</option>)}</select></div>
      {step === "input" && (<>
        <p style={{ fontSize: 12.5, color: T.textDim, marginTop: 0 }}>Upload a CSV export from your broker, or paste it below. Any column layout works — you'll map the columns next.</p>
        <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px 0", borderRadius: 8, border: `1px dashed ${T.border}`, background: T.panelAlt, color: T.textDim, cursor: "pointer", fontFamily: fontSans, fontSize: 12.5, marginBottom: 12 }}><Upload size={15} /> Choose a .csv file</button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={handleFile} />
        <div style={{ fontSize: 11.5, color: T.textFaint, textAlign: "center", marginBottom: 12 }}>— or paste CSV text —</div>
        <textarea rows={6} style={{ ...inputStyle, fontFamily: fontMono, fontSize: 12, resize: "vertical", marginBottom: 14 }} placeholder="Date,Symbol,Side,Qty,Entry,Exit,Fees" value={text} onChange={(e) => setText(e.target.value)} />
        <PrimaryButton disabled={!text.trim()} onClick={() => parse(text)}>Continue</PrimaryButton>
      </>)}
      {step === "map" && (<>
        <p style={{ fontSize: 12.5, color: T.textDim, marginTop: 0 }}>Match your CSV's columns to the fields Joule needs. {rows.length} rows detected.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>{["date", "symbol", "side", "qty", "entry", "exit", "fees"].map(field => (<div key={field} style={{ display: "grid", gridTemplateColumns: "110px 1fr", alignItems: "center", gap: 10 }}><label style={{ ...labelStyle, marginBottom: 0, textTransform: "capitalize" }}>{field}{field === "fees" ? " (optional)" : ""}</label><select style={inputStyle} value={mapping[field] || ""} onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}><option value="">— not mapped —</option>{headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>))}</div>
        <div style={{ display: "flex", gap: 10 }}><button onClick={() => setStep("input")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textDim, fontFamily: fontSans, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Back</button><div style={{ flex: 2 }}><PrimaryButton disabled={!ready} onClick={doImport}>Import {rows.length} trades</PrimaryButton></div></div>
      </>)}
    </Modal>
  );
}

/* ---------------------------------------------------------
   Day Detail Modal
--------------------------------------------------------- */
function DayDetailModal({ date, trades, journalEntry, onClose, onSaveJournal }) {
  const [mood, setMood] = useState(journalEntry?.mood || "neutral");
  const [note, setNote] = useState(journalEntry?.note || "");
  const dayTrades = trades.filter(t => t.date === date);
  const net = dayTrades.reduce((s, t) => s + t.pnl, 0);
  return (
    <Modal onClose={onClose} width={480}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ margin: 0, fontSize: 16, color: T.text, fontWeight: 600 }}>{fmtDate(date)}</h3><button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textDim, padding: 4 }}><X size={18} /></button></div>
      {dayTrades.length > 0 && (<div style={{ marginBottom: 18 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 11.5, color: T.textFaint, fontWeight: 600 }}>{dayTrades.length} TRADE{dayTrades.length > 1 ? "S" : ""}</span><span style={{ fontFamily: fontMono, fontWeight: 700, fontSize: 13, color: net >= 0 ? T.profit : T.loss }}>{fmtMoney(net)}</span></div><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{dayTrades.map(t => (<div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.panelAlt, borderRadius: 7, padding: "8px 11px" }}><span style={{ fontSize: 12.5, color: T.text, fontWeight: 600 }}>{t.symbol} <span style={{ color: T.textFaint, fontWeight: 400 }}>· {t.side}</span></span><span style={{ fontFamily: fontMono, fontSize: 12.5, fontWeight: 700, color: t.pnl >= 0 ? T.profit : T.loss }}>{fmtMoney(t.pnl)}</span></div>))}</div></div>)}
      <label style={labelStyle}>How did the day feel?</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>{Object.entries(getMoods()).map(([key, m]) => { const Icon = m.icon; const active = mood === key; return (<button key={key} onClick={() => setMood(key)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 0", borderRadius: 8, border: `1px solid ${active ? m.color : T.border}`, background: active ? `${m.color}22` : T.panelAlt, cursor: "pointer" }}><Icon size={18} color={active ? m.color : T.textFaint} /><span style={{ fontSize: 11, color: active ? m.color : T.textFaint, fontWeight: 600 }}>{m.label}</span></button>); })}</div>
      <label style={labelStyle}>Journal note</label>
      <textarea rows={4} style={{ ...inputStyle, resize: "vertical", marginBottom: 16 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you notice about your mindset, discipline, or decisions today?" />
      <PrimaryButton onClick={() => { onSaveJournal({ date, mood, note }); onClose(); }}>Save entry</PrimaryButton>
    </Modal>
  );
}

/* ---------------------------------------------------------
   Dashboard view
--------------------------------------------------------- */
function Dashboard({ trades, stats, startingBalance }) {
  const curve = useMemo(() => equityCurve(trades, startingBalance), [trades, startingBalance]);
  const daily = useMemo(() => dailyPnl(trades), [trades]);
  const dayStreak = useMemo(() => computeDayStreak(daily), [daily]);
  const zella = useMemo(() => computeZella(trades, stats, startingBalance), [trades, stats, startingBalance]);
  const overall = zella[0]?.overall || 0;
  const pieData = [{ name: "Wins", value: stats.wins }, { name: "Losses", value: stats.losses }];
  const byTag = useMemo(() => { const m = {}; trades.forEach(t => { m[t.tag] = (m[t.tag] || 0) + t.pnl; }); return Object.entries(m).map(([tag, pnl]) => ({ tag, pnl: Math.round(pnl * 100) / 100 })); }, [trades]);
  const gaugeColor = stats.winRate >= 50 ? T.profit : T.loss;
  return (
    <div>
      <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        <ScoreCard label={t("dashboard.accountBalance")} value={fmtMoney(startingBalance + stats.net)} sub={`${stats.net >= 0 ? "+" : ""}${fmtMoney(stats.net)} P&L`} />
        <ScoreCard label={t("dashboard.winRate")}><SemiGauge value={stats.winRate} color={gaugeColor} /><div style={{ fontSize: 11, color: T.textFaint, textAlign: "center", marginTop: -4 }}>{stats.wins}W · {stats.losses}L</div></ScoreCard>
        <ScoreCard label={t("dashboard.profitFactor")}><div style={{ display: "flex", justifyContent: "center" }}><RingGauge fraction={stats.profitFactor / 3} color={T.profit} label={stats.profitFactor.toFixed(2)} /></div></ScoreCard>
        <ScoreCard label={t("dashboard.avgWinLoss")}><WinLossBar avgWin={stats.avgWin} avgLoss={stats.avgLoss} /></ScoreCard>
        <ScoreCard label={t("dashboard.currentStreak")}><div style={{ display: "flex", gap: 14, justifyContent: "center" }}><StreakBadge count={dayStreak.count} type={dayStreak.type} label="DAYS" /><StreakBadge count={stats.streak.count} type={stats.streak.type} label="TRADES" /></div></ScoreCard>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 14, marginBottom: 14 }}>
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 13, color: T.textDim, fontWeight: 600 }}>{t("dashboard.portfolioStatus")}</div><div style={{ fontFamily: fontMono, fontWeight: 700, fontSize: 17, color: "#B7A6FF" }}>{overall}</div></div>
          <ResponsiveContainer width="100%" height={210}><RadarChart data={zella} outerRadius="72%"><PolarGrid stroke={T.borderSoft} /><PolarAngleAxis dataKey="metric" tick={{ fill: T.textFaint, fontSize: 10, fontFamily: fontSans }} /><Radar dataKey="value" stroke={T.accent} fill={T.accent} fillOpacity={0.35} /></RadarChart></ResponsiveContainer>
          <div style={{ height: 6, borderRadius: 3, background: "linear-gradient(90deg, #F0566B, #E0A64C, #3ECF8E)", position: "relative", marginTop: 4 }}><div style={{ position: "absolute", top: -3, left: `calc(${overall}% - 6px)`, width: 12, height: 12, borderRadius: "50%", background: "#fff", border: `2px solid ${T.accent}` }} /></div>
        </div>
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 13, color: T.textDim, fontWeight: 600, marginBottom: 14 }}>{t("dashboard.equityCurve")}</div>
          <ResponsiveContainer width="100%" height={230}><AreaChart data={curve} margin={{ left: -18, top: 4, right: 8 }}><defs><linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={0.35} /><stop offset="100%" stopColor={T.accent} stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke={T.borderSoft} vertical={false} /><XAxis dataKey="idx" tick={{ fill: T.textFaint, fontSize: 11, fontFamily: fontMono }} axisLine={{ stroke: T.border }} tickLine={false} /><YAxis tick={{ fill: T.textFaint, fontSize: 11, fontFamily: fontMono }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={64} domain={["auto", "auto"]} /><Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5 }} labelStyle={{ color: T.textDim }} formatter={(v) => [fmtMoney(v), "Equity"]} labelFormatter={(l, p) => p?.[0]?.payload?.date || l} /><Area type="monotone" dataKey="equity" stroke={T.accent} strokeWidth={2} fill="url(#eqFill)" /></AreaChart></ResponsiveContainer>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        <ScoreCard label={t("dashboard.avgR")} value={`${stats.avgR >= 0 ? "+" : ""}${stats.avgR.toFixed(2)}R`} sub={t("dashboard.rewardVsRisk")} />
        <ScoreCard label={t("dashboard.expectancy")} value={fmtMoney(stats.expectancy)} sub={t("dashboard.expectedPnl")} />
        <ScoreCard label={t("dashboard.discipline")} value={stats.disciplineRate !== null ? `${stats.disciplineRate.toFixed(0)}%` : "—"} sub={t("dashboard.rulesFollowed")} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}><div style={{ fontSize: 13, color: T.textDim, fontWeight: 600, marginBottom: 14 }}>{t("dashboard.winLossSplit")}</div><ResponsiveContainer width="100%" height={150}><PieChart><Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={3} stroke="none"><Cell fill={T.profit} /><Cell fill={T.loss} /></Pie><Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5 }} /></PieChart></ResponsiveContainer></div>
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}><div style={{ fontSize: 13, color: T.textDim, fontWeight: 600, marginBottom: 14 }}>{t("dashboard.pnlByStrategy")}</div><ResponsiveContainer width="100%" height={150}><BarChart data={byTag} margin={{ left: -18, top: 4 }}><CartesianGrid stroke={T.borderSoft} vertical={false} /><XAxis dataKey="tag" tick={{ fill: T.textFaint, fontSize: 10, fontFamily: fontSans }} axisLine={{ stroke: T.border }} tickLine={false} /><YAxis tick={{ fill: T.textFaint, fontSize: 11, fontFamily: fontMono }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={46} /><Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5 }} formatter={(v) => [fmtMoney(v), "P&L"]} /><Bar dataKey="pnl" radius={[4, 4, 0, 0]}>{byTag.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? T.profit : T.loss} />)}</Bar></BarChart></ResponsiveContainer></div>
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}><div style={{ fontSize: 13, color: T.textDim, fontWeight: 600, marginBottom: 14 }}>{t("dashboard.bestWorst")}</div><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{[[t("dashboard.bestTrade"), fmtMoney(stats.best), T.profit], [t("dashboard.worstTrade"), fmtMoney(stats.worst), T.loss]].map(([label, val, color]) => (<div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.borderSoft}` }}><span style={{ fontSize: 13, color: T.textDim }}>{label}</span><span style={{ fontFamily: fontMono, fontSize: 14, fontWeight: 600, color }}>{val}</span></div>))}</div></div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Trades log view
--------------------------------------------------------- */
/* ---------------------------------------------------------
   Pre-Trade view — forecasts, debated and locked before execution
--------------------------------------------------------- */
function PreTradePlanDetailModal({ plan, onClose, onDelete }) {
  return (
    <Modal onClose={onClose} width={520}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, color: T.text, fontWeight: 700 }}>{plan.symbol}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}><Pill tone={plan.side === "long" ? "profit" : "loss"}>{plan.side === "long" ? "Long" : "Short"}</Pill><Pill>{plan.tag}</Pill>{plan.linkedTradeId && <Pill tone="neutral">Linked to a trade</Pill>}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textDim, padding: 4 }}><X size={18} /></button>
      </div>
      <div style={{ fontSize: 11.5, color: T.textFaint, marginBottom: 12 }}>{fmtDate(plan.date)}{plan.stopLoss ? ` · planned stop ${plan.stopLoss}` : ""}</div>
      {plan.notes && (<div style={{ marginBottom: 16 }}><div style={{ fontSize: 11.5, color: T.textFaint, fontWeight: 600, marginBottom: 5 }}>THESIS</div><div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.5 }}>{plan.notes}</div></div>)}
      <div style={{ marginBottom: 16 }}><div style={{ fontSize: 11.5, color: T.textFaint, fontWeight: 600, marginBottom: 6 }}>ANALYST DEBATE</div><LockedThesisCard lock={{ verdict: plan.verdict, messages: plan.messages, timestamp: plan.timestamp }} /></div>
      <button onClick={() => onDelete(plan)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "10px 0", borderRadius: 8, border: `1px solid ${T.lossDim}`, background: "transparent", color: T.loss, fontFamily: fontSans, fontWeight: 600, fontSize: 13, cursor: "pointer" }}><Trash2 size={14} /> Delete plan</button>
    </Modal>
  );
}
function PreTradeView({ plans, onAdd, onSelect }) {
  const sorted = [...plans].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return (
    <div>
      <div style={{ marginBottom: 14, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 7, background: `linear-gradient(135deg, #8B6CFF, #6C4CF1)`, color: "#fff", border: "none", borderRadius: 8, padding: "9px 15px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: fontSans }}><Plus size={15} /> New pre-trade plan</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map(plan => (
          <button key={plan.id} onClick={() => onSelect(plan)} style={{ textAlign: "left", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{plan.symbol}</span>
                <Pill tone={plan.side === "long" ? "profit" : "loss"}>{plan.side === "long" ? "Long" : "Short"}</Pill>
                <Pill tone={verdictTone(plan.verdict)}>{plan.verdict || "Debated"}</Pill>
              </div>
              <span style={{ fontSize: 11, color: T.textFaint }}>{fmtDate(plan.date)}</span>
            </div>
            <p style={{ margin: "0 0 6px", fontSize: 12.5, color: T.textDim, lineHeight: 1.5 }}>{plan.notes || "No thesis written."}</p>
            <span style={{ fontSize: 11, color: plan.linkedTradeId ? T.profit : T.textFaint }}>{plan.linkedTradeId ? "Linked to a trade" : "Not yet traded"}</span>
          </button>
        ))}
        {sorted.length === 0 && <div style={{ fontSize: 12.5, color: T.textFaint, padding: "30px 0", textAlign: "center" }}>No pre-trade plans yet — forecast and debate a thesis before you enter.</div>}
      </div>
    </div>
  );
}

function TradesLog({ trades, accounts, onSelect }) {
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? trades : filter === "wins" ? trades.filter(t => t.pnl > 0) : trades.filter(t => t.pnl < 0);
  const sorted = [...shown].sort((a, b) => b.date.localeCompare(a.date));
  const acctName = (id) => accounts.find(a => a.id === id)?.name || "Unassigned";
  const filterBtn = (key, label) => (<button onClick={() => setFilter(key)} style={{ padding: "6px 13px", borderRadius: 7, border: `1px solid ${filter === key ? T.accent : T.border}`, background: filter === key ? T.accentDim : "transparent", color: filter === key ? "#B7A6FF" : T.textDim, fontFamily: fontSans, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{label}</button>);
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8 }}>{filterBtn("all", "All")}{filterBtn("wins", "Wins")}{filterBtn("losses", "Losses")}</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fontSans }}>
          <thead><tr style={{ background: T.panelAlt }}>{["Date", "Account", "Symbol", "Side", "Qty", "Entry", "Exit", "Risk", "R", "Strategy", "Rating", "P&L", ""].map(h => (<th key={h} style={{ textAlign: ["P&L", "Qty", "Entry", "Exit", "Risk", "R"].includes(h) ? "right" : "left", padding: "10px 14px", fontSize: 11.5, color: T.textFaint, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>))}</tr></thead>
          <tbody>
            {sorted.map(t => (
              <tr key={t.id} style={{ borderTop: `1px solid ${T.borderSoft}`, cursor: "pointer" }} onClick={() => onSelect(t)}>
                <td style={{ padding: "11px 14px", fontSize: 13, color: T.textDim, whiteSpace: "nowrap" }}>{fmtDate(t.date)}</td>
                <td style={{ padding: "11px 14px", fontSize: 12, color: T.textFaint, whiteSpace: "nowrap" }}>{acctName(t.accountId)}</td>
                <td style={{ padding: "11px 14px", fontSize: 13, color: T.text, fontWeight: 600 }}>{t.symbol}{t.hasScreenshot && <ImageIcon size={11} style={{ marginLeft: 6, display: "inline", verticalAlign: "middle" }} color={T.textFaint} />}</td>
                <td style={{ padding: "11px 14px" }}><Pill tone={t.side === "long" ? "profit" : "loss"}>{t.side === "long" ? "Long" : "Short"}</Pill></td>
                <td style={{ padding: "11px 14px", fontSize: 13, color: T.textDim, textAlign: "right", fontFamily: fontMono }}>{t.qty}</td>
                <td style={{ padding: "11px 14px", fontSize: 13, color: T.textDim, textAlign: "right", fontFamily: fontMono }}>{t.entry.toFixed(2)}</td>
                <td style={{ padding: "11px 14px", fontSize: 13, color: T.textDim, textAlign: "right", fontFamily: fontMono }}>{t.exit.toFixed(2)}</td>
                <td style={{ padding: "11px 14px", fontSize: 12.5, color: T.textFaint, textAlign: "right", fontFamily: fontMono }}>{t.risk ? fmtMoney(t.risk) : "—"}</td>
                <td style={{ padding: "11px 14px", fontSize: 12.5, textAlign: "right", fontFamily: fontMono, color: t.rMultiple == null ? T.textFaint : t.rMultiple >= 0 ? T.profit : T.loss }}>{t.rMultiple != null ? `${t.rMultiple.toFixed(1)}R` : "—"}</td>
                <td style={{ padding: "11px 14px", fontSize: 12.5, color: T.textDim }}>{t.tag}</td>
                <td style={{ padding: "11px 14px", fontSize: 11, color: T.amber, letterSpacing: 1, whiteSpace: "nowrap" }}>{t.rating ? "★".repeat(t.rating) : "—"}</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontFamily: fontMono, fontSize: 13.5, fontWeight: 700, color: t.pnl >= 0 ? T.profit : T.loss }}>{fmtMoney(t.pnl)}</td>
                <td style={{ padding: "11px 14px", color: T.textFaint }}>›</td>
              </tr>
            ))}
            {sorted.length === 0 && <tr><td colSpan={13} style={{ padding: "30px 16px", textAlign: "center", color: T.textFaint, fontSize: 13 }}>No trades match this filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Calendar view
--------------------------------------------------------- */
function CalendarView({ trades, onSelectDay }) {
  const daily = useMemo(() => dailyPnl(trades), [trades]);
  const dates = Object.keys(daily);
  const initial = dates.length ? dates.sort().at(-1) : todayStr();
  const [cursor, setCursor] = useState(() => { const d = new Date(initial); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = cursor.toLocaleString("default", { month: "long", year: "numeric" });
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const maxAbs = Math.max(1, ...Object.values(daily).map(v => Math.abs(v)));
  const monthEntries = Object.entries(daily).filter(([date]) => { const d = new Date(date); return d.getFullYear() === year && d.getMonth() === month; });
  const monthPnl = monthEntries.reduce((s, [, v]) => s + v, 0);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const weekSummaries = weeks.map((row) => { let sum = 0, activeDays = 0; row.forEach(d => { if (d === null) return; const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; if (daily[ds] !== undefined) { sum += daily[ds]; activeDays++; } }); return { sum: Math.round(sum * 100) / 100, activeDays }; });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 14 }}>
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><button onClick={() => setCursor(new Date(year, month - 1, 1))} style={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", padding: 5, color: T.textDim }}><ChevronLeft size={16} /></button><div style={{ fontSize: 15, fontWeight: 600, color: T.text, minWidth: 150, textAlign: "center" }}>{monthLabel}</div><button onClick={() => setCursor(new Date(year, month + 1, 1))} style={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", padding: 5, color: T.textDim }}><ChevronRight size={16} /></button><button onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} style={{ marginLeft: 4, background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", padding: "5px 10px", color: T.textDim, fontSize: 11.5, fontWeight: 600 }}>This month</button></div>
          <div style={{ fontFamily: fontMono, fontWeight: 700, fontSize: 14, color: monthPnl >= 0 ? T.profit : T.loss }}>{fmtMoney(monthPnl)} this month</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, color: T.textFaint, fontWeight: 600, padding: "4px 0" }}>{d}</div>)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>{cells.map((d, i) => { if (d === null) return <div key={i} />; const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; const pnl = daily[dateStr]; const has = pnl !== undefined; const intensity = has ? Math.min(1, Math.abs(pnl) / maxAbs) : 0; const bg = !has ? T.panelAlt : pnl >= 0 ? `rgba(62, 207, 142, ${0.12 + intensity * 0.5})` : `rgba(240, 86, 107, ${0.12 + intensity * 0.5})`; return (<button key={i} onClick={() => onSelectDay(dateStr)} style={{ background: bg, borderRadius: 7, padding: "8px 6px", minHeight: 58, border: `1px solid ${has ? "transparent" : T.borderSoft}`, cursor: "pointer", textAlign: "left" }}><div style={{ fontSize: 11, color: T.textFaint, marginBottom: 4 }}>{d}</div>{has && <div style={{ fontFamily: fontMono, fontSize: 11.5, fontWeight: 700, color: pnl >= 0 ? T.profit : T.loss }}>{fmtShort(pnl)}</div>}</button>); })}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{weekSummaries.map((w, i) => (<div key={i} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px" }}><div style={{ fontSize: 11, color: T.textFaint, fontWeight: 600, marginBottom: 4 }}>Week {i + 1}</div><div style={{ fontFamily: fontMono, fontWeight: 700, fontSize: 15, color: w.activeDays ? (w.sum >= 0 ? T.profit : T.loss) : T.textFaint }}>{w.activeDays ? fmtShort(w.sum) : "$0"}</div><div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 2 }}>{w.activeDays} day{w.activeDays === 1 ? "" : "s"}</div></div>))}</div>
    </div>
  );
}

/* ---------------------------------------------------------
   Accounts view
--------------------------------------------------------- */
function AccountsView({ accounts, trades, onAdd, onEdit, onDelete, onToggleStatus }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  return (
    <div>
      <div style={{ marginBottom: 14, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: `linear-gradient(135deg, #8B6CFF, #6C4CF1)`, color: "#fff", border: "none", borderRadius: 8, padding: "9px 15px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: fontSans }}><Plus size={15} /> Add account</button>
      </div>
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fontSans }}>
            <thead><tr style={{ background: T.panelAlt }}>{["Account", "Type / firm", "Balance", "Daily P&L", "Risk usage", "Status", ""].map(h => (<th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11.5, color: T.textFaint, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>))}</tr></thead>
            <tbody>
              {accounts.map(a => {
                const m = computeAccountMetrics(a, trades);
                const statusTone = m.breached ? "loss" : a.status === "disabled" ? "neutral" : "profit";
                const statusLabel = m.breached ? "Locked" : a.status === "disabled" ? "Disabled" : "Active";
                return (
                  <tr key={a.id} style={{ borderTop: `1px solid ${T.borderSoft}` }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: T.text, fontWeight: 600 }}>{a.name}<div style={{ fontSize: 11, color: T.textFaint, fontWeight: 400 }}>{m.tradeCount} trades</div></td>
                    <td style={{ padding: "12px 16px" }}><Pill tone={a.type === "propfirm" ? "amber" : "neutral"}>{a.type === "propfirm" ? "Prop firm" : "Personal"}</Pill><div style={{ fontSize: 11.5, color: T.textFaint, marginTop: 4 }}>{a.firm}</div></td>
                    <td style={{ padding: "12px 16px", fontFamily: fontMono, fontSize: 13, color: T.text, fontWeight: 600 }}>{fmtMoney(m.balance)}</td>
                    <td style={{ padding: "12px 16px", fontFamily: fontMono, fontSize: 13, fontWeight: 600, color: m.dailyPnl >= 0 ? T.profit : T.loss }}>{fmtMoney(m.dailyPnl)}</td>
                    <td style={{ padding: "12px 16px", width: 130 }}><ProgressBar pct={Math.max(m.dailyUsedPct, m.ddUsedPct)} /><div style={{ fontSize: 10, color: T.textFaint, marginTop: 4 }}>{Math.round(Math.max(m.dailyUsedPct, m.ddUsedPct))}% of limit</div></td>
                    <td style={{ padding: "12px 16px" }}><Pill tone={statusTone}>{statusLabel}</Pill></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setEditing(a)} title="Edit" style={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: 6, cursor: "pointer", color: T.textDim }}><Pencil size={13} /></button>
                        <button onClick={() => onToggleStatus(a.id)} title={a.status === "disabled" ? "Enable" : "Disable"} style={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: 6, cursor: "pointer", color: T.textDim }}>{a.status === "disabled" ? <Play size={13} /> : <Ban size={13} />}</button>
                        <button onClick={() => onDelete(a)} title="Delete" style={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: 6, cursor: "pointer", color: T.loss }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {accounts.length === 0 && <tr><td colSpan={7} style={{ padding: "30px 16px", textAlign: "center", color: T.textFaint, fontSize: 13 }}>No accounts yet — add one to start logging trades.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <p style={{ fontSize: 11, color: T.textFaint, marginTop: 12 }}>Accounts here are for organizing your own trades by broker or prop-firm challenge — Joule doesn't connect to real brokerage or prop-firm logins.</p>
      {adding && <AddAccountModal onClose={() => setAdding(false)} onSave={(acc) => { onAdd(acc); setAdding(false); }} />}
      {editing && <AddAccountModal initial={editing} onClose={() => setEditing(null)} onSave={(acc) => { onEdit(acc); setEditing(null); }} />}
    </div>
  );
}

/* ---------------------------------------------------------
   Risk Management view
--------------------------------------------------------- */
function RiskManagementView({ accounts, trades }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {accounts.map(a => {
        const m = computeAccountMetrics(a, trades);
        return (
          <div key={a.id} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{a.name}</div><div style={{ fontSize: 11.5, color: T.textFaint }}>{a.firm}</div></div>
              {m.breached ? <Pill tone="loss"><Lock size={10} style={{ marginRight: 4, display: "inline", verticalAlign: -1 }} />Locked</Pill> : a.status === "disabled" ? <Pill tone="neutral">Disabled</Pill> : <Pill tone="profit"><Unlock size={10} style={{ marginRight: 4, display: "inline", verticalAlign: -1 }} />Active</Pill>}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, color: T.textDim, fontWeight: 600 }}>Daily loss limit</span><span style={{ fontSize: 12, fontFamily: fontMono, color: T.textFaint }}>{fmtMoney(Math.min(0, m.dailyPnl))} / -{fmtMoney(m.dailyLimit)}</span></div>
              <ProgressBar pct={m.dailyUsedPct} />
            </div>
            <div style={{ marginBottom: a.type === "propfirm" ? 16 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, color: T.textDim, fontWeight: 600 }}>Max trailing drawdown</span><span style={{ fontSize: 12, fontFamily: fontMono, color: T.textFaint }}>{fmtMoney(m.worstDD)} / -{fmtMoney(m.ddLimit)}</span></div>
              <ProgressBar pct={m.ddUsedPct} />
            </div>
            {a.type === "propfirm" && a.consistencyRulePct > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, color: T.textDim, fontWeight: 600 }}>Consistency rule</span><span style={{ fontSize: 12, fontFamily: fontMono, color: T.textFaint }}>best day {m.consistencyPct.toFixed(0)}% of profit / max {a.consistencyRulePct}%</span></div>
                <ProgressBar pct={(m.consistencyPct / a.consistencyRulePct) * 100} />
              </div>
            )}
            {a.type === "propfirm" && a.profitTarget > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, color: T.textDim, fontWeight: 600 }}>Profit target</span><span style={{ fontSize: 12, fontFamily: fontMono, color: m.targetHit ? T.profit : T.textFaint }}>{fmtMoney(m.net)} / {fmtMoney(a.profitTarget)}{m.targetHit ? " ✓" : ""}</span></div>
                <div style={{ height: 7, borderRadius: 4, background: T.borderSoft, overflow: "hidden" }}><div style={{ width: `${m.targetProgressPct}%`, height: "100%", background: T.accent, borderRadius: 4 }} /></div>
              </div>
            )}
          </div>
        );
      })}
      {accounts.length === 0 && <div style={{ fontSize: 12.5, color: T.textFaint, padding: "30px 0" }}>No accounts to manage risk for yet.</div>}
    </div>
  );
}

/* ---------------------------------------------------------
   Playbook view
--------------------------------------------------------- */
function PlaybookView({ rules, onChange }) {
  const [newRule, setNewRule] = useState("");
  const add = () => { if (newRule.trim()) { onChange([...rules, newRule.trim()]); setNewRule(""); } };
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, maxWidth: 560 }}>
      <div style={{ fontSize: 13, color: T.textDim, fontWeight: 600, marginBottom: 4 }}>Your trading rules</div>
      <p style={{ fontSize: 12.5, color: T.textFaint, margin: "0 0 16px" }}>Every trade you log can be checked against this list, and the dashboard tracks how consistently you follow it.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>{rules.map((r, i) => (<div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: T.panelAlt, borderRadius: 8, padding: "10px 12px" }}><span style={{ fontSize: 13, color: T.text }}>{r}</span><button onClick={() => onChange(rules.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: T.textFaint, padding: 2 }}><X size={14} /></button></div>))}{rules.length === 0 && <div style={{ fontSize: 12.5, color: T.textFaint, padding: "10px 0" }}>No rules yet — add your first one below.</div>}</div>
      <div style={{ display: "flex", gap: 8 }}><input style={inputStyle} placeholder="e.g. Never risk more than 1% per trade" value={newRule} onChange={(e) => setNewRule(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} /><button onClick={add} style={{ padding: "0 16px", borderRadius: 7, border: "none", background: `linear-gradient(135deg, #8B6CFF, #6C4CF1)`, color: "#fff", fontWeight: 700, cursor: "pointer" }}><Plus size={16} /></button></div>
    </div>
  );
}

/* ---------------------------------------------------------
   Journal view
--------------------------------------------------------- */
function computeDisciplineByDay(trades) {
  const map = {};
  trades.forEach(t => {
    if (!t.checklist) return;
    const vals = Object.values(t.checklist);
    if (!vals.length) return;
    const pct = (vals.filter(Boolean).length / vals.length) * 100;
    if (!map[t.date]) map[t.date] = { total: 0, count: 0 };
    map[t.date].total += pct; map[t.date].count += 1;
  });
  const result = {};
  Object.entries(map).forEach(([date, v]) => { result[date] = v.total / v.count; });
  return result;
}
function ConsistencyHeatmap({ trades }) {
  const discipline = useMemo(() => computeDisciplineByDay(trades), [trades]);
  const cells = useMemo(() => {
    const end = new Date(); end.setHours(0, 0, 0, 0);
    const start = new Date(end); start.setDate(start.getDate() - 69);
    start.setDate(start.getDate() - start.getDay());
    const out = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) out.push(new Date(d));
    return out;
  }, []);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, color: T.textDim, fontWeight: 600, marginBottom: 10 }}>Consistency heatmap — playbook adherence, last 10 weeks</div>
      <div style={{ display: "flex", gap: 3, overflowX: "auto" }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {week.map((d, di) => {
              const ds = d.toISOString().slice(0, 10);
              const pct = discipline[ds];
              const bg = pct === undefined ? T.borderSoft : `rgba(124, 92, 252, ${0.15 + (pct / 100) * 0.7})`;
              return <div key={di} title={`${ds}${pct !== undefined ? " · " + Math.round(pct) + "% rules followed" : ""}`} style={{ width: 11, height: 11, borderRadius: 3, background: bg }} />;
            })}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 10 }}>
        <span style={{ fontSize: 10.5, color: T.textFaint }}>Less</span>
        {[0.15, 0.35, 0.55, 0.75, 0.9].map((o, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: `rgba(124,92,252,${o})` }} />)}
        <span style={{ fontSize: 10.5, color: T.textFaint }}>More</span>
      </div>
    </div>
  );
}
function JournalView({ journal, trades, onOpenDay }) {
  const sorted = [...journal].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div>
      <ConsistencyHeatmap trades={trades} />
      <div style={{ marginBottom: 14 }}><button onClick={() => onOpenDay(todayStr())} style={{ display: "flex", alignItems: "center", gap: 7, background: `linear-gradient(135deg, #8B6CFF, #6C4CF1)`, color: "#fff", border: "none", borderRadius: 8, padding: "9px 15px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: fontSans }}><Plus size={15} /> Add today's reflection</button></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map(entry => {
          const moods = getMoods(); const m = moods[entry.mood] || moods.neutral; const Icon = m.icon;
          const dayTrades = trades.filter(t => t.date === entry.date);
          const net = dayTrades.reduce((s, t) => s + t.pnl, 0);
          return (<button key={entry.date} onClick={() => onOpenDay(entry.date)} style={{ textAlign: "left", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, cursor: "pointer" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Icon size={16} color={m.color} /><span style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>{fmtDate(entry.date)}</span>{dayTrades.length > 0 && <Pill>{dayTrades.length} trade{dayTrades.length > 1 ? "s" : ""}</Pill>}</div>{dayTrades.length > 0 && <span style={{ fontFamily: fontMono, fontWeight: 700, fontSize: 12.5, color: net >= 0 ? T.profit : T.loss }}>{fmtMoney(net)}</span>}</div><p style={{ margin: 0, fontSize: 12.5, color: T.textDim, lineHeight: 1.5 }}>{entry.note || "No note."}</p></button>);
        })}
        {sorted.length === 0 && <div style={{ fontSize: 12.5, color: T.textFaint, padding: "30px 0", textAlign: "center" }}>No journal entries yet.</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Reports view
--------------------------------------------------------- */
function computeTagPerformance(trades) {
  const map = {};
  trades.forEach(t => {
    const tags = [t.tag, ...(t.mistakeTags || []), ...(t.emotionTags || [])];
    tags.forEach(tag => { if (!tag) return; map[tag] = (map[tag] || 0) + t.pnl; });
  });
  const arr = Object.entries(map).map(([tag, pnl]) => ({ tag, pnl: Math.round(pnl * 100) / 100 }));
  const best = [...arr].sort((a, b) => b.pnl - a.pnl).slice(0, 5);
  const worst = [...arr].sort((a, b) => a.pnl - b.pnl).slice(0, 5);
  return { best, worst };
}
function ReportsView({ trades, startingBalance }) {
  const bySymbol = useMemo(() => { const m = {}; trades.forEach(t => { m[t.symbol] = (m[t.symbol] || 0) + t.pnl; }); return Object.entries(m).map(([symbol, pnl]) => ({ symbol, pnl: Math.round(pnl * 100) / 100 })).sort((a, b) => b.pnl - a.pnl); }, [trades]);
  const byWeekday = useMemo(() => { const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; const m = Object.fromEntries(order.map(d => [d, 0])); trades.forEach(t => { m[weekday(t.date)] += t.pnl; }); return order.map(d => ({ day: d, pnl: Math.round(m[d] * 100) / 100 })); }, [trades]);
  const hist = useMemo(() => rHistogram(trades), [trades]);
  const dd = useMemo(() => drawdownSeries(trades, startingBalance), [trades, startingBalance]);
  const tagPerf = useMemo(() => computeTagPerformance(trades), [trades]);
  const chartCard = (title, height, children) => (<div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}><div style={{ fontSize: 13, color: T.textDim, fontWeight: 600, marginBottom: 14 }}>{title}</div><ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer></div>);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {chartCard("Best performing tags", 190, <BarChart data={tagPerf.best} layout="vertical" margin={{ left: 8, top: 4 }}><CartesianGrid stroke={T.borderSoft} horizontal={false} /><XAxis type="number" tick={{ fill: T.textFaint, fontSize: 11, fontFamily: fontMono }} axisLine={{ stroke: T.border }} tickLine={false} tickFormatter={(v) => `$${v}`} /><YAxis type="category" dataKey="tag" tick={{ fill: T.textDim, fontSize: 11, fontFamily: fontSans }} axisLine={false} tickLine={false} width={110} /><Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5 }} formatter={(v) => [fmtMoney(v), "P&L"]} /><Bar dataKey="pnl" radius={[0, 4, 4, 0]} fill={T.profit} /></BarChart>)}
      {chartCard("Worst performing tags", 190, <BarChart data={tagPerf.worst} layout="vertical" margin={{ left: 8, top: 4 }}><CartesianGrid stroke={T.borderSoft} horizontal={false} /><XAxis type="number" tick={{ fill: T.textFaint, fontSize: 11, fontFamily: fontMono }} axisLine={{ stroke: T.border }} tickLine={false} tickFormatter={(v) => `$${v}`} /><YAxis type="category" dataKey="tag" tick={{ fill: T.textDim, fontSize: 11, fontFamily: fontSans }} axisLine={false} tickLine={false} width={110} /><Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5 }} formatter={(v) => [fmtMoney(v), "P&L"]} /><Bar dataKey="pnl" radius={[0, 4, 4, 0]} fill={T.loss} /></BarChart>)}
      {chartCard("P&L by symbol", 200, <BarChart data={bySymbol} margin={{ left: -18, top: 4 }}><CartesianGrid stroke={T.borderSoft} vertical={false} /><XAxis dataKey="symbol" tick={{ fill: T.textFaint, fontSize: 11, fontFamily: fontSans }} axisLine={{ stroke: T.border }} tickLine={false} /><YAxis tick={{ fill: T.textFaint, fontSize: 11, fontFamily: fontMono }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={50} /><Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5 }} formatter={(v) => [fmtMoney(v), "P&L"]} /><Bar dataKey="pnl" radius={[4, 4, 0, 0]}>{bySymbol.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? T.profit : T.loss} />)}</Bar></BarChart>)}
      {chartCard("P&L by day of week", 200, <BarChart data={byWeekday} margin={{ left: -18, top: 4 }}><CartesianGrid stroke={T.borderSoft} vertical={false} /><XAxis dataKey="day" tick={{ fill: T.textFaint, fontSize: 11, fontFamily: fontSans }} axisLine={{ stroke: T.border }} tickLine={false} /><YAxis tick={{ fill: T.textFaint, fontSize: 11, fontFamily: fontMono }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={50} /><Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5 }} formatter={(v) => [fmtMoney(v), "P&L"]} /><Bar dataKey="pnl" radius={[4, 4, 0, 0]}>{byWeekday.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? T.profit : T.loss} />)}</Bar></BarChart>)}
      {chartCard("R-multiple distribution", 200, <BarChart data={hist} margin={{ left: -18, top: 4 }}><CartesianGrid stroke={T.borderSoft} vertical={false} /><XAxis dataKey="label" tick={{ fill: T.textFaint, fontSize: 10, fontFamily: fontSans }} axisLine={{ stroke: T.border }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} /><YAxis tick={{ fill: T.textFaint, fontSize: 11, fontFamily: fontMono }} axisLine={false} tickLine={false} allowDecimals={false} width={30} /><Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5 }} formatter={(v) => [v, "Trades"]} /><Bar dataKey="count" radius={[4, 4, 0, 0]} fill={T.accent} /></BarChart>)}
      {chartCard("Drawdown from equity peak", 200, <AreaChart data={dd} margin={{ left: -18, top: 4, right: 8 }}><defs><linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.loss} stopOpacity={0} /><stop offset="100%" stopColor={T.loss} stopOpacity={0.4} /></linearGradient></defs><CartesianGrid stroke={T.borderSoft} vertical={false} /><XAxis dataKey="idx" tick={{ fill: T.textFaint, fontSize: 11, fontFamily: fontMono }} axisLine={{ stroke: T.border }} tickLine={false} /><YAxis tick={{ fill: T.textFaint, fontSize: 11, fontFamily: fontMono }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={64} /><Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5 }} formatter={(v) => [fmtMoney(v), "Drawdown"]} labelFormatter={(l, p) => p?.[0]?.payload?.date || l} /><Area type="monotone" dataKey="drawdown" stroke={T.loss} strokeWidth={2} fill="url(#ddFill)" /></AreaChart>)}
    </div>
  );
}

/* ---------------------------------------------------------
   Settings view
--------------------------------------------------------- */
function SettingsView({ profile, onProfileChange, trades, onRequestClear, onLogout, theme, onThemeChange, language, onLanguageChange }) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const exportJSON = () => { const blob = new Blob([JSON.stringify(trades, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "trades.json"; a.click(); URL.revokeObjectURL(url); };
  const exportCSV = () => { const csv = Papa.unparse(trades.map(t => ({ date: t.date, account: t.accountId, symbol: t.symbol, side: t.side, qty: t.qty, entry: t.entry, exit: t.exit, stopLoss: t.stopLoss, fees: t.fees, tag: t.tag, pnl: t.pnl, risk: t.risk, rMultiple: t.rMultiple, notes: t.notes }))); const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "trades.csv"; a.click(); URL.revokeObjectURL(url); };
  const segBtn = (active, onClick, label) => (
    <button onClick={onClick} style={{ flex: 1, padding: "8px 0", borderRadius: 7, border: `1px solid ${active ? T.accent : T.border}`, background: active ? T.accentDim : T.panelAlt, color: active ? "#B7A6FF" : T.textDim, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: fontSans }}>{label}</button>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 520 }}>
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 13, color: T.textDim, fontWeight: 600, marginBottom: 14 }}>{t("settings.profile")}</div>
        <div style={{ marginBottom: 12 }}><label style={labelStyle}>{t("settings.name")}</label><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div style={{ marginBottom: 14 }}><label style={labelStyle}>{t("settings.email")}</label><input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <button onClick={() => onProfileChange({ ...profile, name, email })} style={{ padding: "9px 16px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.panelAlt, color: T.text, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>{t("settings.saveProfile")}</button>
      </div>
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 13, color: T.textDim, fontWeight: 600, marginBottom: 14 }}>{t("settings.preferences")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>{t("settings.language")}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {segBtn(language === "en", () => onLanguageChange("en"), "English")}
              {segBtn(language === "fr", () => onLanguageChange("fr"), "Français")}
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t("settings.theme")}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {segBtn(theme === "dark", () => onThemeChange("dark"), t("settings.dark"))}
              {segBtn(theme === "light", () => onThemeChange("light"), t("settings.light"))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 13, color: T.textDim, fontWeight: 600, marginBottom: 14 }}>{t("settings.data")}</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}><button onClick={exportJSON} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.panelAlt, color: T.text, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}><Download size={13} /> {t("settings.exportJson")}</button><button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.panelAlt, color: T.text, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}><Download size={13} /> {t("settings.exportCsv")}</button></div>
        <button onClick={onRequestClear} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 7, border: `1px solid ${T.lossDim}`, background: "transparent", color: T.loss, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}><Trash2 size={13} /> {t("settings.clearAll")}</button>
      </div>
      <button onClick={onLogout} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textDim, fontWeight: 600, fontSize: 13, cursor: "pointer" }}><LogOut size={14} /> {t("settings.logout")}</button>
    </div>
  );
}

/* ---------------------------------------------------------
   Root app
--------------------------------------------------------- */
export default function TradingJournal() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [trades, setTrades] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState("all");
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [journal, setJournal] = useState([]);
  const [view, setView] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingClear, setPendingClear] = useState(false);
  const [toast, setToast] = useState(null);
  const [preTradePlans, setPreTradePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pendingDeletePlan, setPendingDeletePlan] = useState(null);
  const [theme, setThemeState] = useState("dark");
  const [language, setLanguageState] = useState("en");
  const ready = useRef(false);

  useEffect(() => {
    (async () => {
      const [p, t, acc, aid, r, j, plans, savedTheme, savedLang] = await Promise.all([loadKey("profile", null), loadKey("trades", null), loadKey("accounts", null), loadKey("activeAccountId", "all"), loadKey("rules", DEFAULT_RULES), loadKey("journal", null), loadKey("preTradePlans", []), loadKey("theme", "dark"), loadKey("language", "en")]);
      const finalAccounts = acc !== null ? acc : seedAccounts();
      applyTheme(savedTheme); setLangGlobal(savedLang);
      setThemeState(savedTheme); setLanguageState(savedLang);
      setProfile(p); setAccounts(finalAccounts); setActiveAccountId(aid);
      setTrades(t !== null ? t : seedTrades()); setRules(r); setJournal(j !== null ? j : seedJournal());
      setPreTradePlans(plans);
      setLoading(false); ready.current = true;
    })();
  }, []);
  useEffect(() => { if (ready.current) saveKey("trades", trades); }, [trades]);
  useEffect(() => { if (ready.current) saveKey("accounts", accounts); }, [accounts]);
  useEffect(() => { if (ready.current) saveKey("activeAccountId", activeAccountId); }, [activeAccountId]);
  useEffect(() => { if (ready.current) saveKey("rules", rules); }, [rules]);
  useEffect(() => { if (ready.current) saveKey("journal", journal); }, [journal]);
  useEffect(() => { if (ready.current) saveKey("preTradePlans", preTradePlans); }, [preTradePlans]);
  useEffect(() => { if (ready.current && profile) saveKey("profile", profile); }, [profile]);
  useEffect(() => { if (ready.current) saveKey("theme", theme); }, [theme]);
  useEffect(() => { if (ready.current) saveKey("language", language); }, [language]);
  // Applied synchronously (not just in useEffect) so this render already reflects the change.
  applyTheme(theme); setLangGlobal(language);
  const changeTheme = (name) => { applyTheme(name); setThemeState(name); };
  const changeLanguage = (lang) => { setLangGlobal(lang); setLanguageState(lang); };

  const visibleTrades = useMemo(() => activeAccountId === "all" ? trades : trades.filter(t => t.accountId === activeAccountId), [trades, activeAccountId]);
  const startingBalance = useMemo(() => activeAccountId === "all" ? accounts.reduce((s, a) => s + a.startingBalance, 0) : (accounts.find(a => a.id === activeAccountId)?.startingBalance || 0), [accounts, activeAccountId]);
  const stats = useMemo(() => computeStats(visibleTrades), [visibleTrades]);

  const addTrade = (trade, screenshot) => {
    setTrades(prev => [...prev, trade]);
    if (screenshot) saveKey(`shot:${trade.id}`, screenshot);
    if (trade.preTradePlanId) setPreTradePlans(prev => prev.map(p => p.id === trade.preTradePlanId ? { ...p, linkedTradeId: trade.id } : p));
    setModal(null);
  };
  const importTrades = (imported) => { setTrades(prev => [...prev, ...imported]); setModal(null); };
  const deleteTrade = (trade) => { setTrades(prev => prev.filter(t => t.id !== trade.id)); if (trade.hasScreenshot) { try { window.storage.delete(`shot:${trade.id}`); } catch (e) {} } setSelectedTrade(null); };
  const upsertJournal = (entry) => setJournal(prev => { const others = prev.filter(e => e.date !== entry.date); return [...others, entry]; });
  const clearData = () => { setTrades([]); setJournal([]); setRules(DEFAULT_RULES); setAccounts(seedAccounts()); setActiveAccountId("all"); setPreTradePlans([]); };
  const logout = () => setProfile(null);
  const addAccount = (acc) => setAccounts(prev => [...prev, acc]);
  const editAccount = (acc) => setAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
  const deleteAccount = (acc) => setPendingDelete(acc);
  const confirmDeleteAccount = () => {
    const acc = pendingDelete;
    if (!acc) return;
    setAccounts(prev => prev.filter(a => a.id !== acc.id));
    setTrades(prev => prev.map(t => t.accountId === acc.id ? { ...t, accountId: null } : t));
    if (activeAccountId === acc.id) setActiveAccountId("all");
    setPendingDelete(null);
  };
  const toggleAccountStatus = (id) => setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "disabled" ? "active" : "disabled" } : a));
  const addPreTradePlan = (plan) => { setPreTradePlans(prev => [...prev, plan]); setModal(null); };
  const deletePreTradePlan = (plan) => setPendingDeletePlan(plan);
  const confirmDeletePreTradePlan = () => {
    const plan = pendingDeletePlan;
    if (!plan) return;
    setPreTradePlans(prev => prev.filter(p => p.id !== plan.id));
    setTrades(prev => prev.map(t => t.preTradePlanId === plan.id ? { ...t, preTradePlanId: null } : t));
    setPendingDeletePlan(null);
    setSelectedPlan(null);
  };

  if (loading) return <div style={{ minHeight: 640, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textFaint, fontFamily: fontSans, fontSize: 13 }}>Loading your journal…</div>;
  if (!profile) return <LoginScreen onLogin={setProfile} />;

  const viewMeta = {
    dashboard: [t("view.dashboard.title"), t("view.dashboard.subtitle")], trades: [t("view.trades.title"), t("view.trades.subtitle")],
    calendar: [t("view.calendar.title"), t("view.calendar.subtitle")], pretrade: [t("view.pretrade.title"), t("view.pretrade.subtitle")],
    accounts: [t("view.accounts.title"), t("view.accounts.subtitle")],
    risk: [t("view.risk.title"), t("view.risk.subtitle")], playbook: [t("view.playbook.title"), t("view.playbook.subtitle")],
    journal: [t("view.journal.title"), t("view.journal.subtitle")], reports: [t("view.reports.title"), t("view.reports.subtitle")],
    settings: [t("view.settings.title"), t("view.settings.subtitle")],
  };
  const [title, subtitle] = viewMeta[view];
  const needsAccountSwitcher = ["dashboard", "trades", "calendar", "reports", "journal"].includes(view);

  return (
    <div style={{ display: "flex", minHeight: 640, background: T.bg, fontFamily: fontSans, color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
        ${cssVars()}
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: ${T.accent} !important; }
        table { font-variant-numeric: tabular-nums; }
      `}</style>
      <div style={{ width: 216, borderRight: `1px solid ${T.border}`, padding: 18, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6, padding: "0 4px" }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg, #8B6CFF, #6C4CF1)`, display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={15} color="#fff" strokeWidth={2.5} /></div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>Joule</span>
        </div>
        <NavLabel>{t("nav.section.trading")}</NavLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <NavItem icon={LayoutDashboard} label={t("nav.dashboard")} active={view === "dashboard"} onClick={() => setView("dashboard")} />
          <NavItem icon={ListOrdered} label={t("nav.tradeLog")} active={view === "trades"} onClick={() => setView("trades")} />
          <NavItem icon={CalendarDays} label={t("nav.calendar")} active={view === "calendar"} onClick={() => setView("calendar")} />
          <NavItem icon={Compass} label={t("nav.preTrade")} active={view === "pretrade"} onClick={() => setView("pretrade")} />
        </div>
        <NavLabel>{t("nav.section.management")}</NavLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <NavItem icon={Building2} label={t("nav.accounts")} active={view === "accounts"} onClick={() => setView("accounts")} />
          <NavItem icon={BookOpen} label={t("nav.playbook")} active={view === "playbook"} onClick={() => setView("playbook")} />
        </div>
        <NavLabel>{t("nav.section.riskReports")}</NavLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <NavItem icon={ShieldAlert} label={t("nav.risk")} active={view === "risk"} onClick={() => setView("risk")} />
          <NavItem icon={Smile} label={t("nav.journal")} active={view === "journal"} onClick={() => setView("journal")} />
          <NavItem icon={BarChart3} label={t("nav.reports")} active={view === "reports"} onClick={() => setView("reports")} />
        </div>
        <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
          <NavItem icon={SettingsIcon} label={t("nav.settings")} active={view === "settings"} onClick={() => setView("settings")} />
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px" }}><div style={{ width: 26, height: 26, borderRadius: "50%", background: T.panelAlt, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: T.textDim }}>{profile.name.slice(0, 1).toUpperCase()}</div><span style={{ fontSize: 12, color: T.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.name}</span></div>
        </div>
      </div>
      <div style={{ flex: 1, padding: 24, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div><h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: -0.3 }}>{title}</h1><p style={{ margin: "3px 0 0", fontSize: 12.5, color: T.textFaint }}>{subtitle}</p></div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {needsAccountSwitcher && (
              <select value={activeAccountId} onChange={(e) => setActiveAccountId(e.target.value)} style={{ ...inputStyle, width: 180 }}>
                <option value="all">{t("common.allAccounts")}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            )}
            {view !== "pretrade" && <button onClick={() => setModal("import")} style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", color: T.textDim, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 15px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: fontSans }}><Upload size={14} /> {t("action.importCsv")}</button>}
            {view !== "pretrade" && <button onClick={() => { if (accounts.length === 0) { setToast("Add a trading account first."); setTimeout(() => setToast(null), 2600); return; } setModal("add"); }} style={{ display: "flex", alignItems: "center", gap: 7, background: `linear-gradient(135deg, #8B6CFF, #6C4CF1)`, color: "#fff", border: "none", borderRadius: 8, padding: "9px 15px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: fontSans }}><Plus size={15} /> {t("action.logTrade")}</button>}
          </div>
        </div>
        {view === "dashboard" && <Dashboard trades={visibleTrades} stats={stats} startingBalance={startingBalance} />}
        {view === "trades" && <TradesLog trades={visibleTrades} accounts={accounts} onSelect={setSelectedTrade} />}
        {view === "calendar" && <CalendarView trades={visibleTrades} onSelectDay={setSelectedDay} />}
        {view === "pretrade" && <PreTradeView plans={preTradePlans} onAdd={() => setModal("addPlan")} onSelect={setSelectedPlan} />}
        {view === "accounts" && <AccountsView accounts={accounts} trades={trades} onAdd={addAccount} onEdit={editAccount} onDelete={deleteAccount} onToggleStatus={toggleAccountStatus} />}
        {view === "risk" && <RiskManagementView accounts={accounts} trades={trades} />}
        {view === "playbook" && <PlaybookView rules={rules} onChange={setRules} />}
        {view === "journal" && <JournalView journal={journal} trades={visibleTrades} onOpenDay={setSelectedDay} />}
        {view === "reports" && <ReportsView trades={visibleTrades} startingBalance={startingBalance} />}
        {view === "settings" && <SettingsView profile={profile} onProfileChange={setProfile} trades={trades} onRequestClear={() => setPendingClear(true)} onLogout={logout} theme={theme} onThemeChange={changeTheme} language={language} onLanguageChange={changeLanguage} />}
      </div>
      {modal === "add" && <AddTradeModal rules={rules} accounts={accounts} preTradePlans={preTradePlans} defaultAccountId={activeAccountId !== "all" ? activeAccountId : accounts[0]?.id} onClose={() => setModal(null)} onSave={addTrade} />}
      {modal === "import" && <ImportModal accounts={accounts} defaultAccountId={activeAccountId !== "all" ? activeAccountId : accounts[0]?.id} onClose={() => setModal(null)} onImport={importTrades} />}
      {modal === "addPlan" && <PreTradePlanModal onClose={() => setModal(null)} onSave={addPreTradePlan} />}
      {selectedTrade && <TradeDetailModal trade={selectedTrade} accounts={accounts} preTradePlans={preTradePlans} onClose={() => setSelectedTrade(null)} onDelete={deleteTrade} />}
      {selectedPlan && <PreTradePlanDetailModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} onDelete={deletePreTradePlan} />}
      {selectedDay && <DayDetailModal date={selectedDay} trades={visibleTrades} journalEntry={journal.find(j => j.date === selectedDay)} onClose={() => setSelectedDay(null)} onSaveJournal={upsertJournal} />}
      {pendingDeletePlan && (
        <ConfirmDialog
          title={`Delete this ${pendingDeletePlan.symbol} plan?`}
          message={pendingDeletePlan.linkedTradeId ? "This plan is linked to a trade — the trade will be kept, but it will no longer show this pre-trade analysis." : "This plan hasn't been linked to a trade yet."}
          confirmLabel="Delete plan"
          onConfirm={confirmDeletePreTradePlan}
          onCancel={() => setPendingDeletePlan(null)}
        />
      )}
      {pendingDelete && (
        <ConfirmDialog
          title={`Delete "${pendingDelete.name}"?`}
          message={(() => { const c = trades.filter(t => t.accountId === pendingDelete.id).length; return c > 0 ? `This account has ${c} trade${c > 1 ? "s" : ""}. They'll be kept in your log but shown as unassigned.` : "This account has no trades logged against it."; })()}
          confirmLabel="Delete account"
          onConfirm={confirmDeleteAccount}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      {pendingClear && (
        <ConfirmDialog
          title="Clear all data?"
          message="This permanently deletes every trade, account, and journal entry, and resets your playbook. This cannot be undone."
          confirmLabel="Clear everything"
          onConfirm={() => { clearData(); setPendingClear(false); }}
          onCancel={() => setPendingClear(false)}
        />
      )}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "11px 18px", color: T.text, fontSize: 13, fontFamily: fontSans, zIndex: 60, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>{toast}</div>
      )}
    </div>
  );
}
