import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ------------------------------------------------------------------ *
 * StudyStack — flashcards + study modes
 * Design: cool exam-paper ground, warm index-card white, highlighter
 * yellow. The signature is the physical stack: the pile behind the
 * current card shrinks as you work through it.
 * ------------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;450;500;600;700&display=swap');

.ss {
  --paper: #E4EAF0;
  --paper-deep: #D2DCE7;
  --card: #FDFBF6;
  --ink: #0E1D33;
  --ink-soft: #5C6E85;
  --rule: #BFCEDE;
  --hl: #FFE23D;
  --teal: #0B7161;
  --rose: #C82F48;
  --navy: #16305A;
  --teal-soft: #DFEFE9;
  --rose-soft: #FBE3E6;
  --placeholder: #A8B6C6;
  --ghost-hover: rgba(255,255,255,.5);
  --drop-bg: rgba(253,251,246,.55);

  --display: 'Bricolage Grotesque', 'Helvetica Neue', sans-serif;
  --body: 'IBM Plex Sans', system-ui, sans-serif;
  --mono: 'IBM Plex Mono', ui-monospace, monospace;

  background: var(--paper);
  color: var(--ink);
  font-family: var(--body);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  transition: background .15s ease, color .15s ease;
}
.ss.dark {
  --paper: #131722;
  --paper-deep: #1B2130;
  --card: #1E2536;
  --ink: #E8ECF4;
  --ink-soft: #8B99B0;
  --rule: #323C52;
  --hl: #F2CE3B;
  --teal: #2FBF95;
  --rose: #FF7A8E;
  --navy: #86A9FF;
  --teal-soft: #1C3A34;
  --rose-soft: #3D232B;
  --placeholder: #556278;
  --ghost-hover: rgba(255,255,255,.07);
  --drop-bg: rgba(30,37,54,.55);
}
.ss *, .ss *::before, .ss *::after { box-sizing: border-box; }
.ss button { font: inherit; color: inherit; cursor: pointer; border: none; background: none; }
.ss :focus-visible { outline: 2.5px solid var(--navy); outline-offset: 2px; }
.ss input, .ss textarea { font: inherit; color: inherit; }

/* ---------- shell ---------- */
.ss-wrap { max-width: 1080px; margin: 0 auto; padding: 20px 20px 72px; }
.ss-top { display: flex; align-items: baseline; gap: 14px; padding: 6px 0 22px; flex-wrap: wrap; }
.ss-mark {
  font-family: var(--display); font-weight: 800; font-size: 21px;
  letter-spacing: -0.03em; display: flex; align-items: center; gap: 7px;
}
.ss-mark i {
  width: 15px; height: 19px; background: var(--card); border: 1.5px solid var(--ink);
  border-radius: 2px; box-shadow: 3px 3px 0 var(--hl); display: block;
}
.ss-crumb {
  font-family: var(--mono); font-size: 11.5px; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--ink-soft);
}
.ss-spacer { flex: 1; }

/* ---------- today panel ---------- */
.ss-today {
  border: 1.5px solid var(--ink); border-radius: 4px; background: var(--paper-deep);
  padding: 26px 28px; display: flex; gap: 30px; align-items: center;
  flex-wrap: wrap; margin-bottom: 34px;
  background-image: repeating-linear-gradient(transparent 0 27px, rgba(14,29,51,.055) 27px 28px);
}
.ss-today-copy { flex: 1 1 260px; }
.ss-eyebrow {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-soft); margin-bottom: 8px;
}
.ss-today h1 {
  font-family: var(--display); font-weight: 700; letter-spacing: -0.035em;
  font-size: clamp(28px, 5vw, 42px); line-height: 1.02; margin: 0 0 6px;
}
.ss-today h1 mark { background: var(--hl); padding: 0 .12em; }
.ss-today p { margin: 0; color: var(--ink-soft); font-size: 14.5px; max-width: 42ch; }
.ss-pile { position: relative; width: 132px; height: 96px; flex: 0 0 auto; }
.ss-pile span {
  position: absolute; inset: 0; border: 1.5px solid var(--ink); border-radius: 3px;
  background: var(--card);
}

/* ---------- buttons ---------- */
.ss-btn {
  font-family: var(--body); font-weight: 600; font-size: 14px;
  border: 1.5px solid var(--ink); border-radius: 3px; background: var(--card);
  padding: 10px 16px; box-shadow: 3px 3px 0 var(--ink);
  transition: transform .1s ease, box-shadow .1s ease;
}
.ss-btn:hover { transform: translate(1.5px, 1.5px); box-shadow: 1.5px 1.5px 0 var(--ink); }
.ss-btn:active { transform: translate(3px, 3px); box-shadow: 0 0 0 var(--ink); }
.ss-btn.hl { background: var(--hl); }
.ss-btn.ghost { box-shadow: none; background: transparent; }
.ss-btn.ghost:hover { background: var(--ghost-hover); transform: none; }
.ss-btn.sm { padding: 6px 11px; font-size: 12.5px; box-shadow: 2px 2px 0 var(--ink); }
.ss-btn[disabled] { opacity: .4; cursor: not-allowed; box-shadow: none; transform: none; }
.ss-link {
  font-family: var(--mono); font-size: 12px; text-decoration: underline;
  text-underline-offset: 3px; color: var(--ink-soft);
}
.ss-link:hover { color: var(--ink); }

/* ---------- deck grid ---------- */
.ss-sec-head {
  display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;
}
.ss-sec-head h2 {
  font-family: var(--display); font-weight: 700; font-size: 17px;
  letter-spacing: -0.02em; margin: 0;
}
.ss-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(258px, 1fr)); }
.ss-deck {
  text-align: left; border: 1.5px solid var(--ink); border-radius: 4px;
  background: var(--card); padding: 0; overflow: hidden; display: block; width: 100%;
  box-shadow: 4px 4px 0 var(--paper-deep); transition: box-shadow .12s, transform .12s;
}
.ss-deck:hover { transform: translate(-1px,-1px); box-shadow: 6px 6px 0 var(--navy); }
.ss-deck-top { border-bottom: 1.5px solid var(--rose); padding: 14px 16px 10px; }
.ss-deck-top h3 {
  font-family: var(--display); font-weight: 700; font-size: 19px;
  letter-spacing: -0.02em; margin: 0 0 3px; line-height: 1.15;
}
.ss-deck-top .ss-sub { font-family: var(--mono); font-size: 11px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: .08em; }
.ss-deck-body { padding: 12px 16px 14px; display: flex; flex-direction: column; gap: 10px; }
.ss-meta { display: flex; gap: 14px; font-family: var(--mono); font-size: 11.5px; color: var(--ink-soft); }
.ss-meta b { color: var(--ink); font-weight: 600; }
.ss-bar { height: 7px; background: var(--paper-deep); border-radius: 99px; overflow: hidden; }
.ss-bar i { display: block; height: 100%; background: var(--teal); border-radius: 99px; transition: width .4s ease; }
.ss-due-dot {
  display: inline-block; background: var(--hl); border: 1.2px solid var(--ink);
  border-radius: 99px; padding: 1px 7px; font-family: var(--mono); font-size: 11px; font-weight: 500;
}

/* ---------- deck detail ---------- */
.ss-modes { display: flex; gap: 10px; flex-wrap: wrap; margin: 4px 0 30px; }
.ss-mode { flex: 1 1 150px; text-align: left; padding: 13px 15px; }
.ss-mode strong { font-family: var(--display); font-size: 16px; font-weight: 700; letter-spacing: -.02em; display: block; }
.ss-mode span { font-size: 12px; color: var(--ink-soft); }
.ss-rows { border: 1.5px solid var(--ink); border-radius: 4px; overflow: hidden; background: var(--card); }
.ss-row { padding: 12px 14px; border-bottom: 1px solid var(--rule); }
.ss-row:last-child { border-bottom: none; }
.ss-row-main { display: grid; grid-template-columns: 34px 1fr 1.4fr 30px; gap: 12px; align-items: start; }
.ss-row-n { font-family: var(--mono); font-size: 11.5px; color: var(--ink-soft); padding-top: 3px; }
.ss-cell {
  border: none; background: transparent; width: 100%; resize: none; overflow: hidden;
  font-size: 14.5px; line-height: 1.45; padding: 2px 0;
}
.ss-cell::placeholder { color: var(--placeholder); }
.ss-cell.term { font-weight: 600; }
.ss-x { color: var(--ink-soft); font-size: 17px; line-height: 1; padding: 2px 4px; }
.ss-x:hover { color: var(--rose); }
.ss-tag-input {
  display: block; width: 100%; margin-top: 6px; margin-left: 46px; max-width: calc(100% - 46px);
  border: none; background: transparent; font-family: var(--mono); font-size: 11.5px;
  color: var(--ink-soft); padding: 2px 0;
}
.ss-tag-input::placeholder { color: var(--placeholder); }
.ss-tag-input:focus { color: var(--ink); outline: none; }
.ss-chips { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.ss-chip {
  font-family: var(--mono); font-size: 11.5px; border: 1.2px solid var(--rule); border-radius: 99px;
  padding: 4px 11px; color: var(--ink-soft); background: var(--card);
}
.ss-chip:hover { border-color: var(--ink); color: var(--ink); }
.ss-chip.on { border-color: var(--ink); background: var(--hl); color: var(--ink); }

/* ---------- study surface ---------- */
.ss-study { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.ss-studybar { width: 100%; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.ss-count { font-family: var(--mono); font-size: 12.5px; color: var(--ink-soft); }
.ss-track { flex: 1; min-width: 120px; height: 4px; background: var(--paper-deep); }
.ss-track i { display: block; height: 100%; background: var(--ink); transition: width .3s; }

.ss-stage-row { display: flex; align-items: center; gap: 16px; width: 100%; justify-content: center; }
.ss-side-actions { display: flex; flex-direction: column; gap: 10px; flex: 0 0 auto; }
.ss-side-actions .ss-btn { white-space: nowrap; }
@media (max-width: 760px) {
  .ss-stage-row { flex-direction: column; }
  .ss-side-actions { flex-direction: row; }
}

.ss-stage { position: relative; width: 100%; max-width: 620px; }
.ss-ghost {
  position: absolute; left: 0; right: 0; top: 0; height: 100%;
  border: 1.5px solid var(--ink); border-radius: 5px; background: var(--card);
}
.ss-flip { perspective: 1600px; position: relative; }
.ss-flip-in {
  position: relative; transform-style: preserve-3d; transition: transform .48s cubic-bezier(.4,.15,.2,1);
  min-height: clamp(260px, 42vh, 350px);
}
.ss-flip.on .ss-flip-in { transform: rotateY(180deg); }
.ss-face {
  position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden;
  border: 1.5px solid var(--ink); border-radius: 5px; background: var(--card);
  box-shadow: 6px 6px 0 var(--paper-deep);
  display: flex; flex-direction: column; padding: 20px 26px 26px; cursor: pointer;
}
.ss-face.back { transform: rotateY(180deg); }
.ss-face-rule {
  border-bottom: 1.5px solid var(--rose); margin: 0 -26px 0; padding: 0 26px 12px;
  display: flex; justify-content: space-between; align-items: center;
}
.ss-face-lab { font-family: var(--mono); font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-soft); }
.ss-face-mid { flex: 1; display: flex; align-items: center; justify-content: center; padding: 18px 0; }
.ss-face-mid p {
  font-family: var(--display); font-weight: 500; letter-spacing: -.02em;
  font-size: clamp(20px, 3.4vw, 30px); line-height: 1.22; text-align: center; margin: 0;
}
.ss-face.back .ss-face-mid p { font-family: var(--body); font-weight: 450; font-size: clamp(17px, 2.5vw, 21px); line-height: 1.45; }
.ss-hint { font-family: var(--mono); font-size: 11px; color: var(--ink-soft); text-align: center; }
.ss-verdicts { display: flex; gap: 12px; width: 100%; max-width: 620px; }
.ss-verdicts .ss-btn { flex: 1; }
.ss-v-no { background: var(--rose-soft); }
.ss-v-yes { background: var(--teal-soft); }

/* ---------- typed answer ---------- */
.ss-panel {
  width: 100%; max-width: 620px; border: 1.5px solid var(--ink); border-radius: 5px;
  background: var(--card); box-shadow: 6px 6px 0 var(--paper-deep); padding: 22px 26px 26px;
}
.ss-prompt { font-family: var(--display); font-weight: 500; font-size: clamp(20px, 3.2vw, 28px); letter-spacing: -.02em; line-height: 1.2; margin: 14px 0 20px; }
.ss-input {
  width: 100%; border: none; border-bottom: 2px solid var(--ink); background: transparent;
  padding: 9px 2px; font-size: 18px; font-family: var(--body);
}
.ss-input:focus { outline: none; border-bottom-color: var(--navy); box-shadow: 0 2px 0 var(--navy); }
.ss-feed { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--rule); }
.ss-tag {
  font-family: var(--mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
  border: 1.2px solid var(--ink); border-radius: 2px; padding: 2px 7px; display: inline-block;
}
.ss-tag.ok { background: var(--teal-soft); }
.ss-tag.no { background: var(--rose-soft); }
.ss-ans { font-size: 18px; margin: 10px 0 0; line-height: 1.45; }
.ss-you { font-family: var(--mono); font-size: 13px; color: var(--ink-soft); margin-top: 6px; }
.ss-you s { color: var(--rose); }

/* ---------- match ---------- */
.ss-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: 100%; }
.ss-tile {
  border: 1.5px solid var(--ink); border-radius: 4px; background: var(--card);
  padding: 12px 11px; min-height: 104px; font-size: 13.5px; line-height: 1.35; text-align: left;
  box-shadow: 3px 3px 0 var(--paper-deep); transition: transform .1s, box-shadow .1s, opacity .25s;
  display: flex; align-items: center;
}
.ss-tile.term { font-family: var(--display); font-weight: 600; font-size: 15.5px; letter-spacing: -.01em; }
.ss-tile.pick { background: var(--hl); box-shadow: 3px 3px 0 var(--ink); }
.ss-tile.gone { opacity: 0; pointer-events: none; }
.ss-tile.bad { animation: ss-shake .3s; border-color: var(--rose); }
@keyframes ss-shake { 25%{transform:translateX(-5px)} 50%{transform:translateX(5px)} 75%{transform:translateX(-3px)} }
.ss-clock { font-family: var(--mono); font-size: 26px; font-weight: 500; font-variant-numeric: tabular-nums; }

/* ---------- test / results ---------- */
.ss-q { border-bottom: 1px solid var(--rule); padding: 20px 0; }
.ss-q:first-child { padding-top: 4px; }
.ss-q:last-child { border-bottom: none; }
.ss-q-h { font-family: var(--mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 8px; }
.ss-q-p { font-family: var(--display); font-weight: 500; font-size: 19px; letter-spacing: -.015em; line-height: 1.3; margin: 0 0 14px; }
.ss-opts { display: grid; gap: 8px; }
.ss-opt {
  border: 1.5px solid var(--rule); border-radius: 3px; background: transparent;
  padding: 11px 13px; text-align: left; font-size: 14.5px; line-height: 1.4;
  display: flex; gap: 10px; align-items: flex-start;
}
.ss-opt:hover { border-color: var(--ink); }
.ss-opt.on { border-color: var(--ink); background: var(--hl); }
.ss-opt.right { border-color: var(--teal); background: var(--teal-soft); }
.ss-opt.wrong { border-color: var(--rose); background: var(--rose-soft); }
.ss-opt kbd { font-family: var(--mono); font-size: 11px; padding-top: 2px; color: var(--ink-soft); }
.ss-score { font-family: var(--display); font-size: clamp(52px, 11vw, 84px); font-weight: 800; letter-spacing: -.05em; line-height: .9; }
.ss-score small { font-family: var(--mono); font-size: 14px; font-weight: 400; letter-spacing: 0; color: var(--ink-soft); }

/* ---------- grades ---------- */
.ss-grades { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; width: 100%; max-width: 620px; }
.ss-grade { padding: 11px 8px; text-align: center; }
.ss-grade strong { display: block; font-size: 13.5px; }
.ss-grade span { font-family: var(--mono); font-size: 10.5px; color: var(--ink-soft); }

/* ---------- misc ---------- */
.ss-empty { border: 1.5px dashed var(--ink); border-radius: 4px; padding: 34px 26px; text-align: center; }
.ss-empty h3 { font-family: var(--display); font-size: 20px; font-weight: 700; margin: 0 0 6px; letter-spacing: -.02em; }
.ss-empty p { color: var(--ink-soft); font-size: 14px; margin: 0 0 16px; }
.ss-sheet {
  position: fixed; inset: 0; background: rgba(14,29,51,.42); display: flex;
  align-items: center; justify-content: center; padding: 20px; z-index: 40;
}
.ss-sheet-in {
  background: var(--paper); border: 1.5px solid var(--ink); border-radius: 5px;
  box-shadow: 8px 8px 0 var(--navy); padding: 24px; width: 100%; max-width: 520px;
}
.ss-sheet-in h3 { font-family: var(--display); font-size: 21px; font-weight: 700; letter-spacing: -.025em; margin: 0 0 4px; }
.ss-sheet-in p { color: var(--ink-soft); font-size: 13.5px; margin: 0 0 16px; }
.ss-ta {
  width: 100%; min-height: 150px; border: 1.5px solid var(--ink); border-radius: 3px;
  background: var(--card); padding: 11px 12px; font-family: var(--mono); font-size: 13px; line-height: 1.6;
}
.ss-field {
  width: 100%; border: 1.5px solid var(--ink); border-radius: 3px; background: var(--card);
  padding: 10px 12px; font-size: 15px; margin-bottom: 10px;
}
.ss-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
.ss-note { font-family: var(--mono); font-size: 11.5px; color: var(--ink-soft); line-height: 1.6; }

/* ---------- import ---------- */
.ss-sheet-in.wide { max-width: 640px; }
.ss-sheet-in { max-height: 88vh; overflow-y: auto; }
.ss-tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1.5px solid var(--rule); }
.ss-tab {
  font-family: var(--mono); font-size: 11.5px; text-transform: uppercase; letter-spacing: .09em;
  padding: 7px 11px; border: 1.5px solid transparent; border-bottom: none; margin-bottom: -1.5px;
  color: var(--ink-soft); border-radius: 3px 3px 0 0;
}
.ss-tab.on { border-color: var(--rule); background: var(--card); color: var(--ink); }
.ss-drop {
  border: 1.5px dashed var(--ink); border-radius: 4px; padding: 26px 20px; text-align: center;
  background: var(--drop-bg); transition: background .15s;
}
.ss-drop.over { background: var(--hl); }
.ss-drop p { margin: 8px 0 0; font-size: 13px; color: var(--ink-soft); }
.ss-srcs { display: flex; flex-direction: column; gap: 7px; margin-top: 12px; }
.ss-src {
  display: flex; gap: 10px; align-items: center; border: 1.2px solid var(--rule);
  border-radius: 3px; background: var(--card); padding: 9px 11px; font-size: 13px;
}
.ss-src b { font-family: var(--display); font-weight: 700; letter-spacing: -.015em; }
.ss-src .ss-fname { font-family: var(--mono); font-size: 11px; color: var(--ink-soft); }
.ss-src .ss-n { font-family: var(--mono); font-size: 11.5px; }
.ss-prev { border-left: 3px solid var(--hl); padding-left: 11px; margin-top: 14px; }
.ss-prev div { font-size: 12.5px; line-height: 1.55; color: var(--ink-soft); }
.ss-prev div b { color: var(--ink); font-weight: 600; }
.ss-fmt { margin-top: 16px; font-family: var(--mono); font-size: 11.5px; color: var(--ink-soft); }
.ss-fmt summary { cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.ss-fmt pre {
  background: var(--card); border: 1px solid var(--rule); border-radius: 3px;
  padding: 11px 12px; overflow-x: auto; font-size: 11px; line-height: 1.7; margin: 10px 0 0;
}
.ss-err { color: var(--rose); font-family: var(--mono); font-size: 11.5px; margin-top: 10px; }

@media (max-width: 620px) {
  .ss-tiles { grid-template-columns: repeat(2, 1fr); }
  .ss-grades { grid-template-columns: repeat(2, 1fr); }
  .ss-row-main { grid-template-columns: 22px 1fr 26px; }
  .ss-row-main .ss-cell.def { grid-column: 2 / 3; }
  .ss-tag-input { margin-left: 34px; max-width: calc(100% - 34px); }
  .ss-today { padding: 20px; }
  .ss-pile { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ss * { transition: none !important; animation: none !important; }
}
`;

/* ------------------------------ data ------------------------------ */

const DAY = 86400000;
const uid = () => Math.random().toString(36).slice(2, 10);

const freshSrs = () => ({ due: 0, stability: 0, difficulty: 5, reps: 0, lapses: 0 });

const mkCard = (term, def) => ({ id: uid(), term, def, tags: [], srs: freshSrs() });
const cardTags = (c) => c.tags || [];

const SEED = [];

/* --------------------------- scheduling ---------------------------
 * Simplified FSRS: tracks stability (days) and difficulty (1-10).
 * Swap in the `ts-fsrs` package for the real optimizer in production.
 * ----------------------------------------------------------------- */

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const FIRST = [0.5, 1.2, 3.2, 8.0]; // again / hard / good / easy

function grade(srs, g) {
  const now = Date.now();
  const next = { ...srs, reps: srs.reps + 1 };
  next.difficulty = clamp(srs.difficulty - 0.7 * (g - 3), 1, 10);
  if (srs.reps === 0 || srs.stability === 0) {
    next.stability = FIRST[g - 1];
  } else if (g === 1) {
    next.lapses = srs.lapses + 1;
    next.stability = Math.max(0.4, srs.stability * 0.32);
  } else {
    const ease = [0, 1.15, 1.9, 2.7][g - 1];
    const dPenalty = 1 - (next.difficulty - 5) * 0.055;
    next.stability = srs.stability * (1 + (ease - 1) * dPenalty);
  }
  next.stability = clamp(next.stability, 0.25, 3650);
  next.due = now + next.stability * DAY;
  return next;
}

// A card due any time before the *next* rollover counts as due today —
// otherwise a card due at 23:10 never shows up in an earlier session.
const ROLLOVER_HOUR = 4;
function nextRollover(ts) {
  const d = new Date(ts);
  d.setHours(ROLLOVER_HOUR, 0, 0, 0);
  if (d.getTime() <= ts) d.setDate(d.getDate() + 1);
  return d.getTime();
}
const isDue = (c) => c.srs.due < nextRollover(Date.now());
const dueCount = (d) => d.cards.filter(isDue).length;

// A global queue across every deck, capped so a multi-day backlog doesn't
// dump hundreds of cards on you at once — extra due cards just roll to
// tomorrow instead of being lost.
const DAILY_NEW_CAP = 20;
const DAILY_REVIEW_CAP = 150;
function buildDailyQueue(decks) {
  const due = decks.flatMap((d) => d.cards).filter(isDue);
  const fresh = due.filter((c) => c.srs.reps === 0).slice(0, DAILY_NEW_CAP);
  const seen = due.filter((c) => c.srs.reps > 0).slice(0, DAILY_REVIEW_CAP);
  return [...fresh, ...seen];
}
const mastery = (d) =>
  d.cards.length ? d.cards.reduce((s, c) => s + Math.min(c.srs.stability / 21, 1), 0) / d.cards.length : 0;

function humanGap(ms) {
  const days = ms / DAY;
  if (days < 1) return `${Math.max(1, Math.round(days * 24))}h`;
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${(days / 30).toFixed(1)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

/* --------------------------- answer check -------------------------- */

const STOP = /\b(a|an|the|to|el|la|los|las|un|una|de|of)\b/g;
const norm = (s) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ").replace(STOP, " ").replace(/\s+/g, " ").trim();

function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m || !n) return Math.max(m, n);
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

function checkAnswer(given, expected) {
  const g = norm(given), e = norm(expected);
  if (!g) return false;
  if (g === e) return true;
  return lev(g, e) <= Math.max(1, Math.floor(e.length * 0.12));
}

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* -------------------------- markdown import ------------------------
 * Auto-detects the shapes people actually keep notes in: tables,
 * `## Term` + body, `Term :: definition`, Q/A pairs, definition lists.
 * ----------------------------------------------------------------- */

const MAX_IMPORT = 2000;

const clean = (s) =>
  (s || "")
    .replace(/^\s*>\s?/g, "")
    .replace(/^\s*[-*+]\s+\[[ xX]\]\s*/, "")
    .replace(/^\s*[-*+]\s+/, "")
    .replace(/^\s*\d+[.)]\s+/, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\s][^*]*)\*/g, "$1")
    .replace(/(^|\s)_([^_]+)_(?=\s|$)/g, "$1$2")
    .replace(/^#+\s*/, "")
    .replace(/\s+/g, " ")
    .trim();

// First matching separator wins, so definitions may contain later dashes.
const SEPS = [/\s*::\s*/, /\t+/, /\s*\|\s*/, /\s+[—–]\s+/, /\s+-\s+/, /\s*:\s+/];

function splitPair(line) {
  for (const re of SEPS) {
    const m = line.match(re);
    if (m && m.index > 0) {
      const term = line.slice(0, m.index);
      const def = line.slice(m.index + m[0].length);
      if (clean(term) && clean(def)) return [term, def];
    }
  }
  return null;
}

const Q_LINE = /^(?:\*\*|__)?\s*(?:Q|Question)\s*(?:\*\*|__)?\s*[:.)]\s*(?:\*\*|__)?\s*(.+)$/i;
const A_LINE = /^(?:\*\*|__)?\s*(?:A|Answer)\s*(?:\*\*|__)?\s*[:.)]\s*(?:\*\*|__)?\s*(.*)$/i;
const LIST = /^\s*(?:[-*+]|\d+[.)])\s+/;

// Unambiguous card lines. Prose can accidentally contain ": " or " - ",
// so those only count when the line is also a list item.
const strictCard = (l) =>
  /^\s*\|/.test(l) || /::/.test(l) || /\t/.test(l) || Q_LINE.test(l) ||
  /^[:>]\s+/.test(l) || (LIST.test(l) && !!splitPair(l));
const looseCard = (l) => l.length < 90 && !!splitPair(l);

const TABLE_HEAD = /^(term|word|front|question|q|key|concept|vocab|vocabulary)$/i;
const cells = (row) => row.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
const isRule = (row) => /^\s*\|?[\s|:-]*-[\s|:-]*\|?\s*$/.test(row);

// RFC4180-ish delimited parsing (handles quoted fields containing the
// delimiter, newlines, or escaped quotes) — markdown-oriented parseCardText
// can't handle a comma-separated file since commas appear inside prose defs.
function parseDelimited(raw, delim) {
  const text = (raw || "").replace(/\r\n?/g, "\n");
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delim) {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); rows.push(row); row = []; field = "";
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

function cardsFromDelimited(rows) {
  if (!rows.length) return [];
  const start = rows[0].length >= 2 && TABLE_HEAD.test((rows[0][0] || "").trim()) ? 1 : 0;
  const cards = [];
  for (let i = start; i < rows.length && cards.length < MAX_IMPORT; i++) {
    const term = clean(rows[i][0] || "");
    const def = clean(rows[i].slice(1).join(" — "));
    if (term && def) cards.push([term, def]);
  }
  return cards;
}

function parseCardText(raw, fallbackTitle) {
  let text = (raw || "").replace(/\r\n?/g, "\n");
  let title = "";

  const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) {
    const t = fm[1].match(/^title:\s*(.+)$/m);
    if (t) title = t[1].trim().replace(/^["']|["']$/g, "");
    text = text.slice(fm[0].length);
  }

  const lines = [];                                  // blank out fenced code
  let fenced = false;
  for (const l of text.split("\n")) {
    if (/^\s*(```|~~~)/.test(l)) { fenced = !fenced; lines.push(""); continue; }
    lines.push(fenced ? "" : l);
  }
  const hasSub = /^\s*#{2,6}\s+\S/m.test(text);
  const cards = [];
  let pending = null;

  const push = (t, d) => {
    const term = clean(t), def = clean(d);
    if (term && def && cards.length < MAX_IMPORT) cards.push([term, def]);
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (!t || /^([-*_]\s*){3,}$/.test(t)) { i++; continue; }

    if (/^\|/.test(t) && t.slice(1).includes("|")) {  // markdown table
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const body = rows.filter((r) => !isRule(r)).map(cells);
      const start = body.length && TABLE_HEAD.test(body[0][0] || "") ? 1 : 0;
      for (let k = start; k < body.length; k++) push(body[k][0], body[k].slice(1).join(" — "));
      pending = null;
      continue;
    }

    const q = t.match(Q_LINE);
    if (q) {                                          // Q: / A: pairs
      const stop = (s) => !s || /^#{1,6}\s/.test(s) || Q_LINE.test(s);
      let j = i + 1, answer = "";
      while (j < lines.length) {
        const n = lines[j].trim();
        if (n && stop(n)) break;
        const a = n.match(A_LINE);
        if (a) {
          answer = a[1];
          j++;
          while (j < lines.length && lines[j].trim() && !stop(lines[j].trim())) {
            answer += " " + lines[j].trim();
            j++;
          }
          break;
        }
        j++;
      }
      if (answer) { push(q[1], answer); i = j; pending = null; continue; }
    }

    const h = t.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const head = h[2];
      if (level === 1 && hasSub) {                    // H1 is the deck name
        if (!title) title = clean(head);
        i++; pending = null; continue;
      }
      let j = i + 1;
      const body = [];
      while (j < lines.length && !/^\s*#{1,6}\s+/.test(lines[j])) { body.push(lines[j].trim()); j++; }
      const filled = body.filter(Boolean);
      const isSection =
        filled.some(strictCard) ||
        (filled.length >= 3 && filled.every(looseCard));
      if (isSection) {                                   // cards live inside it
        if (level === 1 && !title) title = clean(head);
        i++; pending = null; continue;
      }
      if (filled.length) { push(head, filled.join(" ")); i = j; pending = null; continue; }
      if (level === 1 && !title) title = clean(head);
      i++; pending = null;
      continue;
    }

    const dl = t.match(/^[:>]\s+(.+)$/);              // definition list
    if (dl && pending) { push(pending, dl[1]); pending = null; i++; continue; }

    const pair = splitPair(t);
    if (pair) { push(pair[0], pair[1]); pending = null; i++; continue; }

    pending = t;
    i++;
  }

  return { title: title || clean(fallbackTitle) || "", cards };
}

function toMarkdown(deck) {
  const head = `# ${deck.title}\n${deck.subject ? `\n_${deck.subject}_\n` : ""}`;
  return head + "\n" + deck.cards.map((c) => `## ${c.term}\n\n${c.def}\n`).join("\n");
}

/* ------------------------------ pieces ----------------------------- */

function Pile({ n = 5, w = 132, h = 96 }) {
  return (
    <div className="ss-pile" style={{ width: w, height: h }}>
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          style={{
            transform: `translate(${i * 5}px, ${-i * 5}px) rotate(${(i % 2 ? 1 : -1) * (i * 0.8)}deg)`,
            zIndex: i,
            background: i === n - 1 ? "var(--hl)" : "var(--card)",
          }}
        />
      ))}
    </div>
  );
}

function Card({ front, back, flipped, onFlip, remaining = 0, label = "Term" }) {
  const ghosts = Math.min(Math.max(remaining - 1, 0), 3);
  return (
    <div className="ss-stage">
      {Array.from({ length: ghosts }).map((_, i) => (
        <div
          key={i}
          className="ss-ghost"
          style={{ transform: `translate(${(i + 1) * 5}px, ${(i + 1) * 6}px)`, zIndex: -1 - i, opacity: 0.5 - i * 0.12 }}
        />
      ))}
      <div className={`ss-flip${flipped ? " on" : ""}`}>
        <div className="ss-flip-in">
          <div className="ss-face" onClick={onFlip} role="button" tabIndex={flipped ? -1 : 0}
            aria-hidden={flipped} inert={flipped ? "" : undefined}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onFlip(); } }}>
            <div className="ss-face-rule"><span className="ss-face-lab">{label}</span></div>
            <div className="ss-face-mid"><p>{front}</p></div>
            <div className="ss-hint">click or press space to flip</div>
          </div>
          <div className="ss-face back" onClick={onFlip} role="button" tabIndex={flipped ? 0 : -1}
            aria-hidden={!flipped} inert={!flipped ? "" : undefined}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onFlip(); } }}>
            <div className="ss-face-rule"><span className="ss-face-lab">Definition</span></div>
            <div className="ss-face-mid"><p>{back}</p></div>
            <div className="ss-hint">click to flip back</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bar({ done, total }) {
  const pct = total ? (done / total) * 100 : 0;
  return (
    <div className="ss-studybar">
      <span className="ss-count">{done} / {total}</span>
      <div className="ss-track"><i style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function Done({ title, lines, actions }) {
  return (
    <div className="ss-panel" style={{ textAlign: "center" }}>
      <div className="ss-eyebrow">Session complete</div>
      <div className="ss-score">{title}</div>
      {lines.map((l, i) => <p key={i} className="ss-note" style={{ marginTop: 10 }}>{l}</p>)}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>{actions}</div>
    </div>
  );
}

/* ------------------------------ modes ------------------------------ */

function Flashcards({ deck, onExit, onGrade, onPatchCard, onDeleteCard, backLabel = "Back to deck" }) {
  const [queue, setQueue] = useState(() => shuffle(deck.cards));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState([]);
  const [flagged, setFlagged] = useState(() => new Set(deck.cards.filter((c) => c.flagged).map((c) => c.id)));
  const card = queue[i];

  const answer = useCallback((known) => {
    if (!card) return;
    onGrade(card.id, known ? 3 : 1);
    if (!known) setMissed((m) => [...m, card]);
    setFlipped(false);
    setI((n) => n + 1);
  }, [card, onGrade]);

  const toggleFlag = useCallback(() => {
    if (!card) return;
    const next = !flagged.has(card.id);
    setFlagged((f) => {
      const s = new Set(f);
      if (next) s.add(card.id); else s.delete(card.id);
      return s;
    });
    onPatchCard(card.id, { flagged: next });
  }, [card, flagged, onPatchCard]);

  const removeCard = useCallback(() => {
    if (!card) return;
    if (!confirm(`Delete "${card.term}"? This can't be undone.`)) return;
    onDeleteCard(card.id);
    setQueue((q) => q.filter((c) => c.id !== card.id));
    setFlipped(false);
  }, [card, onDeleteCard]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === " ") { e.preventDefault(); setFlipped((f) => !f); }
      if (e.key === "ArrowRight") answer(true);
      if (e.key === "ArrowLeft") answer(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [answer]);

  if (!card) {
    return (
      <Done
        title={`${queue.length - missed.length}/${queue.length}`}
        lines={[missed.length ? `Still learning: ${missed.map((c) => c.term).join(", ")}` : "Everything marked known."]}
        actions={[
          missed.length ? (
            <button key="r" className="ss-btn hl" onClick={() => { setQueue(shuffle(missed)); setMissed([]); setI(0); }}>
              Redo {missed.length} missed
            </button>
          ) : null,
          <button key="a" className="ss-btn" onClick={() => { setQueue(shuffle(deck.cards)); setMissed([]); setI(0); }}>Shuffle all</button>,
          <button key="e" className="ss-btn ghost" onClick={onExit}>{backLabel}</button>,
        ]}
      />
    );
  }

  return (
    <div className="ss-study">
      <Bar done={i} total={queue.length} />
      <div className="ss-stage-row">
        <Card front={card.term} back={card.def} flipped={flipped} remaining={queue.length - i}
          onFlip={() => setFlipped((f) => !f)} />
        <div className="ss-side-actions">
          <button className={`ss-btn sm${flagged.has(card.id) ? " hl" : ""}`} onClick={toggleFlag}>
            {flagged.has(card.id) ? "🚩 Flagged" : "🚩 Flag"}
          </button>
          <button className="ss-btn sm" onClick={removeCard}>🗑 Delete</button>
        </div>
      </div>
      <div className="ss-verdicts">
        <button className="ss-btn ss-v-no" onClick={() => answer(false)}>Still learning <span className="ss-note">←</span></button>
        <button className="ss-btn ss-v-yes" onClick={() => answer(true)}>Got it <span className="ss-note">→</span></button>
      </div>
    </div>
  );
}

function Match({ deck, onExit, best, onBest, backLabel = "Back to deck" }) {
  const PAIRS = Math.min(6, deck.cards.length);
  const build = () => {
    const picked = shuffle(deck.cards).slice(0, PAIRS);
    return shuffle(picked.flatMap((c) => [
      { key: c.id + ":t", cid: c.id, text: c.term, kind: "term" },
      { key: c.id + ":d", cid: c.id, text: c.def, kind: "def" },
    ]));
  };
  const [tiles, setTiles] = useState(build);
  const [sel, setSel] = useState(null);
  const [cleared, setCleared] = useState([]);
  const [bad, setBad] = useState(null);
  const [t0] = useState(() => Date.now());
  const [ms, setMs] = useState(0);
  const finished = cleared.length === PAIRS;

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setMs(Date.now() - t0), 100);
    return () => clearInterval(id);
  }, [finished, t0]);

  useEffect(() => {
    if (finished) onBest(ms / 1000);
  }, [finished]); // eslint-disable-line

  const tap = (tile) => {
    if (cleared.includes(tile.cid) || bad) return;
    if (!sel) { setSel(tile); return; }
    if (sel.key === tile.key) { setSel(null); return; }
    if (sel.cid === tile.cid) {
      setCleared((c) => [...c, tile.cid]);
      setSel(null);
    } else {
      setBad([sel.key, tile.key]);
      setTimeout(() => { setBad(null); setSel(null); }, 320);
    }
  };

  if (finished) {
    const secs = (ms / 1000).toFixed(1);
    return (
      <Done title={`${secs}s`}
        lines={[best && best < ms / 1000 ? `Your best is ${best.toFixed(1)}s.` : "New best time."]}
        actions={[
          <button key="r" className="ss-btn hl" onClick={() => { setTiles(build()); setCleared([]); setSel(null); setMs(0); }}>Play again</button>,
          <button key="e" className="ss-btn ghost" onClick={onExit}>{backLabel}</button>,
        ]} />
    );
  }

  return (
    <div className="ss-study">
      <div className="ss-studybar">
        <span className="ss-clock">{(ms / 1000).toFixed(1)}s</span>
        <span className="ss-spacer" />
        <span className="ss-count">{cleared.length} / {PAIRS} pairs</span>
        {best ? <span className="ss-count">best {best.toFixed(1)}s</span> : null}
      </div>
      <div className="ss-tiles">
        {tiles.map((t) => (
          <button key={t.key}
            className={`ss-tile ${t.kind}${cleared.includes(t.cid) ? " gone" : ""}${sel && sel.key === t.key ? " pick" : ""}${bad && bad.includes(t.key) ? " bad" : ""}`}
            onClick={() => tap(t)}>
            {t.text}
          </button>
        ))}
      </div>
      <button className="ss-link" onClick={onExit}>Leave game</button>
    </div>
  );
}

function Test({ deck, onExit, onGrade, backLabel = "Back to deck" }) {
  const size = Math.min(10, deck.cards.length);
  const questions = useMemo(() => {
    const picked = shuffle(deck.cards).slice(0, size);
    return picked.map((c, i) => {
      const canMC = deck.cards.length >= 4;
      const type = canMC && i % 2 === 0 ? "mc" : "written";
      if (type === "mc") {
        const wrong = shuffle(deck.cards.filter((x) => x.id !== c.id)).slice(0, 3).map((x) => x.def);
        return { card: c, type, options: shuffle([c.def, ...wrong]) };
      }
      return { card: c, type };
    });
  }, [deck.cards, size]);

  const [answers, setAnswers] = useState({});
  const [graded, setGraded] = useState(false);

  const results = useMemo(() => {
    if (!graded) return null;
    return questions.map((q) => {
      const a = answers[q.card.id] || "";
      const ok = q.type === "mc" ? a === q.card.def : checkAnswer(a, q.card.def);
      return { ...q, given: a, ok };
    });
  }, [graded, questions, answers]);

  const submit = () => {
    questions.forEach((q) => {
      const a = answers[q.card.id] || "";
      const ok = q.type === "mc" ? a === q.card.def : checkAnswer(a, q.card.def);
      onGrade(q.card.id, ok ? 3 : 1);
    });
    setGraded(true);
  };

  const answered = Object.values(answers).filter((v) => (v || "").trim()).length;
  const correct = results ? results.filter((r) => r.ok).length : 0;

  return (
    <div className="ss-study">
      {graded ? (
        <div className="ss-panel" style={{ textAlign: "center", marginBottom: 4 }}>
          <div className="ss-eyebrow">Result</div>
          <div className="ss-score">{Math.round((correct / questions.length) * 100)}%<small> · {correct} of {questions.length}</small></div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            <button className="ss-btn hl" onClick={onExit}>{backLabel}</button>
          </div>
        </div>
      ) : (
        <Bar done={answered} total={questions.length} />
      )}

      <div className="ss-panel">
        {(results || questions).map((q, i) => (
          <div className="ss-q" key={q.card.id}>
            <div className="ss-q-h">
              {String(i + 1).padStart(2, "0")} · {q.type === "mc" ? "Multiple choice" : "Written"}
              {results ? <> · <span className={`ss-tag ${q.ok ? "ok" : "no"}`}>{q.ok ? "Correct" : "Missed"}</span></> : null}
            </div>
            <p className="ss-q-p">{q.card.term}</p>
            {q.type === "mc" ? (
              <div className="ss-opts">
                {q.options.map((o, j) => {
                  let cls = "ss-opt";
                  if (results) {
                    if (o === q.card.def) cls += " right";
                    else if (o === q.given) cls += " wrong";
                  } else if (answers[q.card.id] === o) cls += " on";
                  return (
                    <button key={j} className={cls} disabled={graded}
                      onClick={() => setAnswers((a) => ({ ...a, [q.card.id]: o }))}>
                      <kbd>{"ABCD"[j]}</kbd><span>{o}</span>
                    </button>
                  );
                })}
              </div>
            ) : results ? (
              <>
                <p className="ss-ans">{q.card.def}</p>
                <div className="ss-you">you wrote {q.given ? (q.ok ? q.given : <s>{q.given}</s>) : "— blank —"}</div>
              </>
            ) : (
              <input className="ss-input" placeholder="Your answer" aria-label={`Answer for ${q.card.term}`}
                value={answers[q.card.id] || ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.card.id]: e.target.value }))} />
            )}
          </div>
        ))}
      </div>

      {!graded ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="ss-btn hl" onClick={submit}>Submit test</button>
          <button className="ss-btn ghost" onClick={onExit}>Cancel</button>
        </div>
      ) : null}
    </div>
  );
}

function Review({ deck, onExit, onGrade, backLabel = "Back to deck" }) {
  const [queue, setQueue] = useState(() => deck.cards.filter(isDue).map((c) => c.id));
  const [ahead, setAhead] = useState(false);
  const [shown, setShown] = useState(false);
  const [count, setCount] = useState(0);
  const [total] = useState(() => deck.cards.filter(isDue).length);

  const byId = useMemo(() => Object.fromEntries(deck.cards.map((c) => [c.id, c])), [deck.cards]);
  const card = queue.length ? byId[queue[0]] : null;

  const startAhead = () => {
    setQueue(shuffle(deck.cards).slice(0, 10).map((c) => c.id));
    setAhead(true);
  };

  if (!card) {
    if (!total && !ahead) {
      const soonest = Math.min(...deck.cards.map((c) => c.srs.due).filter((d) => d > Date.now()));
      return (
        <div className="ss-panel" style={{ textAlign: "center" }}>
          <div className="ss-eyebrow">Nothing due</div>
          <h3 style={{ fontFamily: "var(--display)", fontSize: 24, margin: "6px 0 8px", letterSpacing: "-.025em" }}>
            This deck is clear for now
          </h3>
          <p className="ss-note">
            {Number.isFinite(soonest) ? `Next card comes back in ${humanGap(soonest - Date.now())}.` : "Study any mode to start the schedule."}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            <button className="ss-btn hl" onClick={startAhead}>Study ahead anyway</button>
            <button className="ss-btn ghost" onClick={onExit}>{backLabel}</button>
          </div>
        </div>
      );
    }
    return (
      <Done title={`${count}`} lines={[`Cards reviewed. Each one is scheduled for its next reappearance.`]}
        actions={[<button key="e" className="ss-btn hl" onClick={onExit}>{backLabel}</button>]} />
    );
  }

  const rate = (g) => {
    onGrade(card.id, g);
    setQueue((q) => q.slice(1));
    setCount((c) => c + 1);
    setShown(false);
  };

  const preview = (g) => humanGap(grade(card.srs, g).stability * DAY);

  return (
    <div className="ss-study">
      <Bar done={count} total={ahead ? count + queue.length : total} />
      <Card front={card.term} back={card.def} flipped={shown} remaining={queue.length}
        onFlip={() => setShown(true)} label={card.srs.reps ? `Seen ${card.srs.reps}×` : "New card"} />
      {shown ? (
        <div className="ss-grades">
          {[[1, "Again"], [2, "Hard"], [3, "Good"], [4, "Easy"]].map(([g, label]) => (
            <button key={g} className="ss-btn ss-grade" onClick={() => rate(g)}>
              <strong>{label}</strong><span>{preview(g)}</span>
            </button>
          ))}
        </div>
      ) : (
        <button className="ss-btn hl" onClick={() => setShown(true)} style={{ minWidth: 200 }}>Show answer</button>
      )}
      <button className="ss-link" onClick={onExit}>Leave session</button>
    </div>
  );
}

/* ------------------------------ screens ---------------------------- */

const MODES = [
  { id: "flashcards", name: "Flashcards", blurb: "Flip and sort by feel" },
  { id: "match", name: "Match", blurb: "Timed pairs against the clock" },
  { id: "test", name: "Test", blurb: "Mixed, graded at the end" },
  { id: "review", name: "Review", blurb: "Spaced repetition queue" },
];

function DeckDetail({ deck, onOpen, onPatch, onDelete, onBack, onImport }) {
  const pct = Math.round(mastery(deck) * 100);
  const due = dueCount(deck);
  const [copied, setCopied] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  const allTags = useMemo(() => {
    const s = new Set();
    deck.cards.forEach((c) => cardTags(c).forEach((t) => s.add(t)));
    return [...s].sort();
  }, [deck.cards]);

  useEffect(() => {
    if (selectedTag && !allTags.includes(selectedTag)) setSelectedTag(null);
  }, [allTags, selectedTag]);

  const visibleCards = selectedTag ? deck.cards.filter((c) => cardTags(c).includes(selectedTag)) : deck.cards;

  const onResetProgress = () => {
    if (!confirm(`Reset all progress for "${deck.title}"? Every card goes back to unseen — this can't be undone.`)) return;
    onPatch({ ...deck, cards: deck.cards.map((c) => ({ ...c, srs: freshSrs() })) });
  };

  const onCopy = async () => {
    const md = toMarkdown(deck);
    try {
      await navigator.clipboard.writeText(md);
      setCopied("Copied to clipboard");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = md;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand && document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(ok ? "Copied to clipboard" : "Copy blocked by the browser");
    }
    setTimeout(() => setCopied(""), 2200);
  };
  const setCard = (cid, field, value) =>
    onPatch({ ...deck, cards: deck.cards.map((c) => (c.id === cid ? { ...c, [field]: value } : c)) });

  return (
    <>
      <div className="ss-sec-head" style={{ marginBottom: 6 }}>
        <button className="ss-link" onClick={onBack}>← All decks</button>
      </div>
      <div className="ss-today" style={{ marginBottom: 24 }}>
        <div className="ss-today-copy">
          <div className="ss-eyebrow">{deck.subject || "No subject"}</div>
          <h1>{deck.title}</h1>
          <p>{deck.cards.length} cards · {pct}% mastered {due ? <>· <span className="ss-due-dot">{due} due</span></> : null}</p>
        </div>
        <Pile n={Math.min(5, Math.max(2, Math.ceil(deck.cards.length / 3)))} />
      </div>

      {allTags.length ? (
        <div className="ss-chips" style={{ marginBottom: 14 }}>
          {allTags.map((t) => (
            <button key={t} className={`ss-chip${selectedTag === t ? " on" : ""}`}
              onClick={() => setSelectedTag((s) => (s === t ? null : t))}>
              #{t}
            </button>
          ))}
          {selectedTag ? <button className="ss-link" onClick={() => setSelectedTag(null)}>Clear filter</button> : null}
        </div>
      ) : null}

      <div className="ss-modes">
        {MODES.map((m) => (
          <button key={m.id} className="ss-btn ss-mode" onClick={() => onOpen(m.id, selectedTag)}
            disabled={!visibleCards.length}>
            <strong>{m.name}{selectedTag ? ` · #${selectedTag}` : ""}</strong><span>{m.blurb}</span>
          </button>
        ))}
      </div>

      <div className="ss-sec-head">
        <h2>Cards{selectedTag ? ` — #${selectedTag}` : ""}</h2>
        <span className="ss-spacer" />
        <button className="ss-btn sm" onClick={onImport}>Import .md</button>
        <button className="ss-btn sm hl" onClick={() => onPatch({ ...deck, cards: [...deck.cards, mkCard("", "")] })}>
          Add card
        </button>
      </div>

      {visibleCards.length ? (
        <div className="ss-rows">
          {visibleCards.map((c, i) => (
            <div className="ss-row" key={c.id}>
              <div className="ss-row-main">
                <div className="ss-row-n">{String(i + 1).padStart(2, "0")}</div>
                <textarea className="ss-cell term" rows={1} value={c.term} placeholder="Term"
                  aria-label={`Term ${i + 1}`} onChange={(e) => setCard(c.id, "term", e.target.value)} />
                <textarea className="ss-cell def" rows={1} value={c.def} placeholder="Definition"
                  aria-label={`Definition ${i + 1}`} onChange={(e) => setCard(c.id, "def", e.target.value)} />
                <button className="ss-x" aria-label={`Delete card ${i + 1}`}
                  onClick={() => onPatch({ ...deck, cards: deck.cards.filter((x) => x.id !== c.id) })}>×</button>
              </div>
              <input className="ss-tag-input" placeholder="tags, comma separated" value={cardTags(c).join(", ")}
                aria-label={`Tags for card ${i + 1}`}
                onChange={(e) => setCard(c.id, "tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
            </div>
          ))}
        </div>
      ) : selectedTag ? (
        <div className="ss-empty">
          <h3>No cards tagged #{selectedTag}</h3>
          <p>Clear the filter to see the rest of the deck.</p>
          <button className="ss-btn hl" onClick={() => setSelectedTag(null)}>Clear filter</button>
        </div>
      ) : (
        <div className="ss-empty">
          <h3>No cards yet</h3>
          <p>Add them one at a time, or bring in a markdown file you already have.</p>
          <button className="ss-btn hl" onClick={onImport}>Import cards</button>
        </div>
      )}

      <div style={{ marginTop: 26, display: "flex", gap: 18, flexWrap: "wrap" }}>
        <button className="ss-link" onClick={onCopy}>{copied || "Copy deck as markdown"}</button>
        <button className="ss-link" onClick={onResetProgress}>Reset progress</button>
        <button className="ss-link" onClick={onDelete}>Delete this deck</button>
      </div>
    </>
  );
}

const FORMAT_HELP = `## Mitochondrion          <- heading + body
Generates ATP for the cell.

| Term    | Definition |     <- table
| ------- | ---------- |
| Osmosis | Water crosses a membrane |

- tener :: to have          <- list with ::
- estar - to be             <- dash or em dash

**Q:** What year was it?    <- question and answer
**A:** 1535

Photosynthesis              <- definition list
: Light energy into glucose`;

function ImportSheet({ deck, onClose, onAppend, onCreate }) {
  const [tab, setTab] = useState("file");
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");
  const [over, setOver] = useState(false);
  const [err, setErr] = useState("");
  const picker = useRef(null);

  const pasted = useMemo(() => parseCardText(text, ""), [text]);

  const sources = useMemo(() => {
    const s = files.map((f) => ({ key: f.id, title: f.title, cards: f.cards }));
    if (pasted.cards.length) s.push({ key: "paste", title: pasted.title || "Pasted cards", cards: pasted.cards });
    return s;
  }, [files, pasted]);

  const total = sources.reduce((n, s) => n + s.cards.length, 0);
  const preview = sources.length ? sources[0].cards.slice(0, 3) : [];

  const addFiles = async (list) => {
    const chosen = [...list];
    const usable = chosen.filter((f) => /\.(md|markdown|mdx|txt|csv|tsv)$/i.test(f.name));
    if (!usable.length) {
      setErr(chosen.length ? "That file type can't be read here. Use .md, .markdown, or .txt." : "");
      return;
    }
    setErr("");
    try {
      const read = await Promise.all(
        usable.map(async (f) => {
          const raw = await f.text();
          const base = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
          const ext = (f.name.match(/\.([^.]+)$/) || [])[1]?.toLowerCase();
          let cards, title;
          if (ext === "csv" || ext === "tsv") {
            cards = cardsFromDelimited(parseDelimited(raw, ext === "csv" ? "," : "\t"));
            title = base;
          } else {
            const parsed = parseCardText(raw, base);
            cards = parsed.cards;
            title = parsed.title || base;
          }
          return { id: uid(), name: f.name, title, cards };
        })
      );
      const empty = read.filter((r) => !r.cards.length).map((r) => r.name);
      setFiles((prev) => [...prev, ...read.filter((r) => r.cards.length)]);
      if (empty.length) setErr(`No cards found in ${empty.join(", ")}. Check the format guide below.`);
    } catch {
      setErr("That file couldn't be read. Open it and paste the contents instead.");
    }
  };

  const run = () => {
    if (!total) return;
    if (deck) {
      onAppend(sources.flatMap((s) => s.cards).map(([t, d]) => mkCard(t, d)));
    } else {
      onCreate(sources.map((s) => ({
        id: uid(),
        title: s.title || "Imported cards",
        subject: "Imported",
        cards: s.cards.map(([t, d]) => mkCard(t, d)),
      })));
    }
    onClose();
  };

  return (
    <div className="ss-sheet" onClick={onClose}>
      <div className="ss-sheet-in wide" onClick={(e) => e.stopPropagation()}>
        <h3>{deck ? `Add cards to ${deck.title}` : "Import decks"}</h3>
        <p>{deck
          ? "Anything you bring in gets appended to this deck."
          : "Each file becomes its own deck, named after its first heading."}</p>

        <div className="ss-tabs" role="tablist">
          <button className={`ss-tab${tab === "file" ? " on" : ""}`} role="tab" aria-selected={tab === "file"}
            onClick={() => setTab("file")}>Markdown file</button>
          <button className={`ss-tab${tab === "paste" ? " on" : ""}`} role="tab" aria-selected={tab === "paste"}
            onClick={() => setTab("paste")}>Paste text</button>
        </div>

        {tab === "file" ? (
          <>
            <div className={`ss-drop${over ? " over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}>
              <button className="ss-btn hl" onClick={() => picker.current && picker.current.click()}>Choose .md files</button>
              <p>or drag them here — several at once is fine</p>
              <input ref={picker} type="file" multiple accept=".md,.markdown,.mdx,.txt,.csv,.tsv" style={{ display: "none" }}
                onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </div>
            {files.length ? (
              <div className="ss-srcs">
                {files.map((f) => (
                  <div className="ss-src" key={f.id}>
                    <b>{f.title}</b>
                    <span className="ss-fname">{f.name}</span>
                    <span className="ss-spacer" />
                    <span className="ss-n">{f.cards.length} cards</span>
                    <button className="ss-x" aria-label={`Remove ${f.name}`}
                      onClick={() => setFiles((fs) => fs.filter((x) => x.id !== f.id))}>×</button>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <textarea className="ss-ta" value={text} autoFocus aria-label="Paste your cards"
            placeholder={"Mitochondrion | Generates ATP\nRibosome | Builds proteins"}
            onChange={(e) => setText(e.target.value)} />
        )}

        {err ? <div className="ss-err">{err}</div> : null}

        {total ? (
          <div className="ss-prev" aria-live="polite">
            <div style={{ marginBottom: 6 }}>
              Found <b>{total}</b> card{total === 1 ? "" : "s"}
              {!deck && sources.length > 1 ? <> across <b>{sources.length}</b> decks</> : null}
            </div>
            {preview.map((c, i) => (
              <div key={i}><b>{c[0]}</b> — {c[1].length > 90 ? c[1].slice(0, 90) + "\u2026" : c[1]}</div>
            ))}
            {total > 3 ? <div>…and {total - 3} more</div> : null}
          </div>
        ) : null}

        <details className="ss-fmt">
          <summary>What formats work?</summary>
          <pre>{FORMAT_HELP}</pre>
        </details>

        <div className="ss-actions">
          <button className="ss-btn ghost" onClick={onClose}>Cancel</button>
          <button className="ss-btn hl" disabled={!total} onClick={run}>
            {deck ? `Add ${total || ""} cards` : `Create ${sources.length > 1 ? sources.length + " decks" : "deck"}`}
          </button>
        </div>
      </div>
    </div>
  );
}


function NewDeckSheet({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  return (
    <div className="ss-sheet" onClick={onClose}>
      <div className="ss-sheet-in" onClick={(e) => e.stopPropagation()}>
        <h3>New deck</h3>
        <p>Name it after the thing you're being tested on.</p>
        <input className="ss-field" value={title} autoFocus placeholder="Deck title, e.g. Unit 4 — Thermodynamics"
          aria-label="Deck title" onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && title.trim()) onCreate(title.trim(), subject.trim()); }} />
        <input className="ss-field" value={subject} placeholder="Class or subject (optional)"
          aria-label="Subject" onChange={(e) => setSubject(e.target.value)} />
        <div className="ss-actions">
          <button className="ss-btn ghost" onClick={onClose}>Cancel</button>
          <button className="ss-btn hl" disabled={!title.trim()} onClick={() => onCreate(title.trim(), subject.trim())}>Create deck</button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- app ------------------------------ */

export default function StudyStack() {
  const [decks, setDecks] = useState(null);
  const [bests, setBests] = useState({});
  const [view, setView] = useState({ screen: "home" });
  const [sheet, setSheet] = useState(null);
  const [status, setStatus] = useState("loading");
  const [dark, setDark] = useState(() => localStorage.getItem("studystack:theme") === "dark");
  const first = useRef(true);

  useEffect(() => {
    localStorage.setItem("studystack:theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/decks");
        if (!r.ok) throw new Error("bad response");
        const data = await r.json();
        setDecks(data.decks || SEED);
        setBests(data.bests || {});
        setStatus("ready");
      } catch {
        // Server unreachable — fall back to the last local mirror before giving up to an empty deck list.
        try {
          const local = JSON.parse(localStorage.getItem("studystack:backup"));
          setDecks(local.decks || SEED);
          setBests(local.bests || {});
        } catch {
          setDecks(SEED);
        }
        setStatus("ready");
      }
    })();
  }, []);

  useEffect(() => {
    if (decks === null) return;
    if (first.current) { first.current = false; }
    const t = setTimeout(async () => {
      // Mirror to localStorage first — a second line of defence if the server write fails or corrupts.
      try { localStorage.setItem("studystack:backup", JSON.stringify({ decks, bests })); } catch {}
      try {
        const r = await fetch("/api/decks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decks, bests }),
        });
        if (!r.ok) throw new Error("bad response");
        setStatus("ready");
      } catch (e) {
        console.error("Could not save:", e);
        setStatus("nosave");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [decks, bests]);

  const patchDeck = (next) => setDecks((ds) => ds.map((d) => (d.id === next.id ? next : d)));

  const gradeCard = useCallback((cardId, g) => {
    setDecks((ds) => ds.map((d) => ({
      ...d,
      cards: d.cards.map((c) => (c.id === cardId ? { ...c, srs: grade(c.srs, g) } : c)),
    })));
  }, []);

  // Card id is globally unique, so these work whether the card came from a
  // single-deck study session or a cross-deck tag-scoped one.
  const patchCard = useCallback((cardId, updates) => {
    setDecks((ds) => ds.map((d) => ({
      ...d,
      cards: d.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
    })));
  }, []);

  const deleteCard = useCallback((cardId) => {
    setDecks((ds) => ds.map((d) => ({ ...d, cards: d.cards.filter((c) => c.id !== cardId) })));
  }, []);

  const allTags = useMemo(() => {
    const s = new Set();
    (decks || []).forEach((d) => d.cards.forEach((c) => cardTags(c).forEach((t) => s.add(t))));
    return [...s].sort();
  }, [decks]);

  const exportAll = () => {
    const blob = new Blob([JSON.stringify({ decks, bests }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studystack-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deck = decks && view.deckId ? decks.find((d) => d.id === view.deckId) : null;

  const dailyQueue = useMemo(() => (decks ? buildDailyQueue(decks) : []), [decks]);

  const studyDeck = useMemo(() => {
    if (view.screen !== "study" || !decks) return null;
    if (view.deckId) {
      if (!deck) return null;
      if (!view.tag) return deck;
      return { ...deck, cards: deck.cards.filter((c) => cardTags(c).includes(view.tag)) };
    }
    if (view.daily) {
      return { id: "daily-queue", title: "Today's queue", subject: "Across all decks", cards: dailyQueue };
    }
    if (view.tag) {
      return {
        id: `tag:${view.tag}`,
        title: `#${view.tag}`,
        subject: "Across all decks",
        cards: decks.flatMap((d) => d.cards).filter((c) => cardTags(c).includes(view.tag)),
      };
    }
    return null;
  }, [view, decks, deck, dailyQueue]);

  if (status === "loading") {
    return (
      <div className={`ss${dark ? " dark" : ""}`}><style>{CSS}</style>
        <div className="ss-wrap"><div className="ss-eyebrow">Loading your decks…</div></div>
      </div>
    );
  }

  return (
    <div className={`ss${dark ? " dark" : ""}`}>
      <style>{CSS}</style>
      <div className="ss-wrap">
        <header className="ss-top">
          <button className="ss-mark" onClick={() => setView({ screen: "home" })} style={{ cursor: "pointer" }}>
            <i />StudyStack
          </button>
          {view.screen !== "home" ? (
            <button className="ss-link" onClick={() => setView({ screen: "home" })}>← Home</button>
          ) : null}
          <span className="ss-crumb">
            {view.screen === "home" ? `${decks.length} decks`
              : view.screen === "deck" ? deck?.title
              : `${studyDeck?.title || ""} · ${view.mode}`}
          </span>
          <span className="ss-spacer" />
          {status === "nosave" ? <span className="ss-crumb" style={{ color: "var(--rose)" }}>Not saving — storage unavailable</span> : null}
          <button className="ss-btn sm ghost" onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode">
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </header>

        {view.screen === "home" ? (
          <>
            {dailyQueue.length ? (
              <button className="ss-btn hl" style={{ marginBottom: 26, padding: "16px 22px" }}
                onClick={() => setView({ screen: "study", mode: "review", daily: true })}>
                <strong style={{ fontFamily: "var(--display)", fontSize: 17 }}>
                  Study everything due today · {dailyQueue.length} cards
                </strong>
                <span className="ss-note" style={{ display: "block", marginTop: 3 }}>
                  Pulled from every deck, capped at {DAILY_NEW_CAP} new / {DAILY_REVIEW_CAP} review — the rest rolls to tomorrow.
                </span>
              </button>
            ) : null}

            <div className="ss-sec-head">
              <h2>Your decks</h2>
              <span className="ss-spacer" />
              <button className="ss-btn sm" onClick={() => setSheet("import")}>Import .md</button>
              <button className="ss-btn sm hl" onClick={() => setSheet("newdeck")}>New deck</button>
            </div>

            {decks.length ? (
              <div className="ss-grid">
                {decks.map((d) => {
                  const due = dueCount(d);
                  return (
                    <button key={d.id} className="ss-deck" onClick={() => setView({ screen: "deck", deckId: d.id })}>
                      <div className="ss-deck-top">
                        <h3>{d.title}</h3>
                        <div className="ss-sub">{d.subject || "No subject"}</div>
                      </div>
                      <div className="ss-deck-body">
                        <div className="ss-bar"><i style={{ width: `${mastery(d) * 100}%` }} /></div>
                        <div className="ss-meta">
                          <span><b>{d.cards.length}</b> cards</span>
                          <span><b>{Math.round(mastery(d) * 100)}%</b> mastered</span>
                          <span className="ss-spacer" />
                          {due ? <span className="ss-due-dot">{due} due</span> : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="ss-empty">
                <h3>No decks yet</h3>
                <p>Start with the thing you're most behind on.</p>
                <button className="ss-btn hl" onClick={() => setSheet("newdeck")}>New deck</button>
              </div>
            )}

            {allTags.length ? (
              <>
                <div className="ss-sec-head" style={{ marginTop: 34 }}>
                  <h2>Study by tag</h2>
                </div>
                <p className="ss-note" style={{ marginBottom: 10 }}>Pulls matching cards from every deck at once.</p>
                <div className="ss-chips">
                  {allTags.map((t) => (
                    <button key={t} className="ss-chip"
                      onClick={() => setView({ screen: "study", mode: "flashcards", tag: t })}>
                      #{t}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            <p className="ss-note" style={{ marginTop: 34 }}>
              Decks persist between sessions.{" "}
              <button className="ss-link" onClick={exportAll}>Export all data</button>
              {" · "}
              <button className="ss-link" onClick={() => { if (confirm("Erase all decks? This can't be undone.")) { setDecks([]); setBests({}); } }}>
                Erase all decks
              </button>
            </p>
          </>
        ) : null}

        {view.screen === "deck" && deck ? (
          <DeckDetail
            deck={deck}
            onOpen={(mode, tag) => setView({ screen: "study", deckId: deck.id, mode, tag: tag || undefined })}
            onPatch={patchDeck}
            onBack={() => setView({ screen: "home" })}
            onImport={() => setSheet("import")}
            onDelete={() => {
              if (confirm(`Delete "${deck.title}" and its ${deck.cards.length} cards?`)) {
                setDecks((ds) => ds.filter((d) => d.id !== deck.id));
                setView({ screen: "home" });
              }
            }}
          />
        ) : null}

        {view.screen === "study" && studyDeck ? (
          <>
            {view.mode === "flashcards" && (
              <Flashcards deck={studyDeck} onGrade={gradeCard} onPatchCard={patchCard} onDeleteCard={deleteCard}
                backLabel={view.deckId ? "Back to deck" : "Done"}
                onExit={() => setView(view.deckId ? { screen: "deck", deckId: view.deckId } : { screen: "home" })} />
            )}
            {view.mode === "match" && (
              <Match deck={studyDeck} best={bests[studyDeck.id]}
                onBest={(s) => setBests((b) => (!b[studyDeck.id] || s < b[studyDeck.id] ? { ...b, [studyDeck.id]: s } : b))}
                backLabel={view.deckId ? "Back to deck" : "Done"}
                onExit={() => setView(view.deckId ? { screen: "deck", deckId: view.deckId } : { screen: "home" })} />
            )}
            {view.mode === "test" && (
              <Test deck={studyDeck} onGrade={gradeCard}
                backLabel={view.deckId ? "Back to deck" : "Done"}
                onExit={() => setView(view.deckId ? { screen: "deck", deckId: view.deckId } : { screen: "home" })} />
            )}
            {view.mode === "review" && (
              <Review deck={studyDeck} onGrade={gradeCard}
                backLabel={view.deckId ? "Back to deck" : "Done"}
                onExit={() => setView(view.deckId ? { screen: "deck", deckId: view.deckId } : { screen: "home" })} />
            )}
          </>
        ) : null}
      </div>

      {sheet === "newdeck" ? (
        <NewDeckSheet onClose={() => setSheet(null)}
          onCreate={(title, subject) => {
            const d = { id: uid(), title, subject, cards: [] };
            setDecks((ds) => [d, ...ds]);
            setSheet(null);
            setView({ screen: "deck", deckId: d.id });
          }} />
      ) : null}

      {sheet === "import" ? (
        <ImportSheet
          deck={deck}
          onClose={() => setSheet(null)}
          onAppend={(cards) => patchDeck({ ...deck, cards: [...deck.cards, ...cards] })}
          onCreate={(newDecks) => {
            setDecks((ds) => [...newDecks, ...ds]);
            if (newDecks.length === 1) setView({ screen: "deck", deckId: newDecks[0].id });
          }}
        />
      ) : null}
    </div>
  );
}
