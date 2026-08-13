/* StudyStack — "Calm neutral" theme.
   Drop-in replacement for the CSS template string that used to live at the top
   of StudyStack.jsx. Every class name from the original is preserved, so the
   JSX needs almost no changes. See INTEGRATION.md. */

export const CSS = `
.ss {
  /* ---- neutral surfaces ---- */
  --paper: #F7F7F5;
  --paper-deep: #EDEDE9;
  --card: #FFFFFF;

  /* ---- text ---- */
  --ink: #1B1B19;
  --ink-soft: #6B6B65;
  --ink-faint: #9A9A93;
  --placeholder: #B4B4AC;

  /* ---- lines ---- */
  --rule: #E4E4DF;
  --rule-strong: #D0D0C9;

  /* ---- accent (indigo) ---- */
  --accent: #5B54C9;
  --accent-hover: #4A43B5;
  --accent-soft: #EEEDFE;
  --accent-text: #3C3489;
  --on-accent: #FFFFFF;

  /* ---- semantic ---- */
  --teal: #167F63;
  --teal-soft: #E4F3EE;
  --teal-text: #0F6E56;
  --rose: #C0453F;
  --rose-soft: #FBEAE9;
  --rose-text: #99302B;

  /* ---- legacy aliases: old JSX still references these ---- */
  --hl: var(--accent-soft);
  --navy: var(--accent);
  --ghost-hover: rgba(27,27,25,.045);
  --drop-bg: #F1F1EE;

  /* ---- type ---- */
  --display: 'Inter', system-ui, -apple-system, sans-serif;
  --body: 'Inter', system-ui, -apple-system, sans-serif;
  --mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace;

  /* ---- radii ---- */
  --r-1: 8px;
  --r-2: 12px;
  --r-3: 16px;
  --r-pill: 999px;

  /* ---- spacing ---- */
  --s-1: 4px;
  --s-2: 8px;
  --s-3: 12px;
  --s-4: 16px;
  --s-5: 24px;
  --s-6: 32px;
  --s-7: 48px;

  /* ---- elevation ---- */
  --sh-1: 0 1px 2px rgba(18,18,16,.05);
  --sh-2: 0 2px 8px rgba(18,18,16,.07);
  --sh-3: 0 12px 40px rgba(18,18,16,.12);

  /* ---- motion ---- */
  --ease: cubic-bezier(.2,0,0,1);
  --t-fast: 120ms;
  --t-base: 200ms;

  background: var(--paper);
  color: var(--ink);
  font-family: var(--body);
  font-size: 15px;
  line-height: 1.55;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'cv02','cv03','cv04','cv11';
}

.ss.dark {
  --paper: #16161A;
  --paper-deep: #202026;
  --card: #1C1C21;

  --ink: #EBEBE7;
  --ink-soft: #9A9A94;
  --ink-faint: #6E6E68;
  --placeholder: #5C5C57;

  --rule: #2C2C33;
  --rule-strong: #3E3E47;

  --accent: #8F88E8;
  --accent-hover: #A29CEE;
  --accent-soft: #292552;
  --accent-text: #CECBF6;
  --on-accent: #14122E;

  --teal: #5DCAA5;
  --teal-soft: #16342C;
  --teal-text: #9FE1CB;
  --rose: #F09595;
  --rose-soft: #3A2222;
  --rose-text: #F7C1C1;

  --ghost-hover: rgba(255,255,255,.06);
  --drop-bg: #202026;

  --sh-1: 0 1px 2px rgba(0,0,0,.3);
  --sh-2: 0 2px 8px rgba(0,0,0,.35);
  --sh-3: 0 12px 40px rgba(0,0,0,.5);
}

.ss *, .ss *::before, .ss *::after { box-sizing: border-box; }
.ss button { font: inherit; color: inherit; cursor: pointer; border: none; background: none; }
.ss input, .ss textarea, .ss select { font: inherit; color: inherit; }
.ss :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--r-1); }
.ss ::selection { background: var(--accent-soft); color: var(--accent-text); }

/* ---------------- shell ---------------- */
.ss-wrap { max-width: 1060px; margin: 0 auto; padding: var(--s-5) var(--s-5) var(--s-7); }

.ss-top {
  display: flex; align-items: center; gap: var(--s-3);
  padding: var(--s-2) 0 var(--s-6); flex-wrap: wrap;
}
.ss-mark {
  display: flex; align-items: center; gap: var(--s-2);
  font-family: var(--display); font-weight: 600; font-size: 16px; letter-spacing: -.015em;
}
.ss-mark i {
  position: relative; display: block; width: 24px; height: 24px;
  background: var(--accent); border-radius: 7px; border: none; box-shadow: none;
}
.ss-mark i::after {
  content: ""; position: absolute; left: 6px; right: 6px; top: 7px; height: 2px;
  background: var(--on-accent); border-radius: 1px;
  box-shadow: 0 5px 0 var(--on-accent);
}
.ss-crumb { font-size: 13px; color: var(--ink-soft); letter-spacing: 0; text-transform: none; font-family: var(--body); }
.ss-spacer { flex: 1; }

/* ---------------- hero / today ---------------- */
.ss-today {
  border: 1px solid var(--rule); border-radius: var(--r-3); background: var(--card);
  box-shadow: var(--sh-1); padding: var(--s-5) var(--s-5);
  display: flex; gap: var(--s-5); align-items: center; flex-wrap: wrap;
  margin-bottom: var(--s-6); background-image: none;
}
.ss-today-copy { flex: 1 1 260px; }
.ss-eyebrow {
  font-size: 13px; color: var(--ink-soft); margin-bottom: var(--s-2);
  letter-spacing: 0; text-transform: none; font-family: var(--body);
}
.ss-today h1 {
  font-family: var(--display); font-weight: 600; letter-spacing: -.025em;
  font-size: clamp(24px, 4vw, 32px); line-height: 1.15; margin: 0 0 var(--s-2);
}
.ss-today h1 mark {
  background: var(--accent-soft); color: var(--accent-text);
  padding: 0 .16em; border-radius: 5px;
}
.ss-today p { margin: 0; color: var(--ink-soft); font-size: 14px; max-width: 52ch; }

.ss-pile { position: relative; width: 132px; height: 96px; flex: 0 0 auto; }
.ss-pile span {
  position: absolute; inset: 0; border: 1px solid var(--rule);
  border-radius: var(--r-2); background: var(--card); box-shadow: var(--sh-1);
}

/* ---------------- daily queue call to action ---------------- */
.ss-cta {
  display: flex; align-items: center; gap: var(--s-5); width: 100%; text-align: left;
  background: var(--accent-soft); border: 1px solid transparent;
  border-radius: var(--r-3); padding: var(--s-5); margin-bottom: var(--s-6);
  transition: border-color var(--t-fast) var(--ease), transform var(--t-fast) var(--ease);
}
.ss-cta:hover { border-color: var(--accent); transform: translateY(-1px); }
.ss-cta-num {
  font-family: var(--display); font-size: 40px; font-weight: 600; line-height: 1;
  letter-spacing: -.03em; color: var(--accent-text); font-variant-numeric: tabular-nums;
  flex: 0 0 auto;
}
.ss-cta-copy { flex: 1 1 200px; min-width: 0; }
.ss-cta-copy strong {
  display: block; font-family: var(--display); font-weight: 600;
  font-size: 16px; letter-spacing: -.015em; color: var(--accent-text); margin-bottom: 2px;
}
.ss-cta-copy span { display: block; font-size: 13px; color: var(--accent-text); opacity: .78; }
.ss-cta-go {
  flex: 0 0 auto; background: var(--accent); color: var(--on-accent);
  font-weight: 500; font-size: 14px; padding: 10px 18px; border-radius: var(--r-1);
  transition: background var(--t-fast) var(--ease);
}
.ss-cta:hover .ss-cta-go { background: var(--accent-hover); }
@media (max-width: 560px) {
  .ss-cta { flex-wrap: wrap; gap: var(--s-3); }
  .ss-cta-go { width: 100%; text-align: center; }
}

/* ---------------- buttons ---------------- */
.ss-btn {
  font-family: var(--body); font-weight: 500; font-size: 14px;
  border: 1px solid var(--rule); border-radius: var(--r-1); background: var(--card);
  color: var(--ink); padding: 9px 16px; box-shadow: var(--sh-1);
  transition: background var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease),
              transform var(--t-fast) var(--ease);
}
.ss-btn:hover { background: var(--paper-deep); border-color: var(--rule-strong); transform: none; box-shadow: var(--sh-1); }
.ss-btn:active { transform: scale(.985); }
.ss-btn.hl {
  background: var(--accent); color: var(--on-accent); border-color: var(--accent);
}
.ss-btn.hl:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
.ss-btn.hl .ss-note, .ss-btn.hl .ss-crumb { color: var(--on-accent); opacity: .8; }
.ss-btn.ghost { background: transparent; border-color: transparent; box-shadow: none; }
.ss-btn.ghost:hover { background: var(--ghost-hover); border-color: transparent; }
.ss-btn.sm { padding: 6px 12px; font-size: 13px; }
.ss-btn[disabled] { opacity: .45; cursor: not-allowed; box-shadow: none; transform: none; }
.ss-btn[disabled]:hover { background: var(--card); border-color: var(--rule); }

.ss-link {
  font-family: var(--body); font-size: 13px; color: var(--ink-soft);
  text-decoration: none; border-bottom: 1px solid var(--rule-strong); padding-bottom: 1px;
  transition: color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease);
}
.ss-link:hover { color: var(--accent); border-color: var(--accent); }

/* ---------------- deck grid ---------------- */
.ss-sec-head { display: flex; align-items: center; gap: var(--s-3); margin-bottom: var(--s-4); flex-wrap: wrap; }
.ss-sec-head h2 {
  font-family: var(--display); font-weight: 600; font-size: 15px;
  letter-spacing: -.01em; margin: 0; color: var(--ink-soft);
}
.ss-grid { display: grid; gap: var(--s-3); grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }

.ss-deck {
  text-align: left; display: block; width: 100%; padding: var(--s-4);
  border: 1px solid var(--rule); border-radius: var(--r-2); background: var(--card);
  box-shadow: var(--sh-1); overflow: hidden;
  transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease),
              transform var(--t-fast) var(--ease);
}
.ss-deck:hover { border-color: var(--rule-strong); box-shadow: var(--sh-2); transform: translateY(-2px); }
.ss-deck-top { border-bottom: none; padding: 0 0 var(--s-3); }
.ss-deck-top h3 {
  font-family: var(--display); font-weight: 600; font-size: 15px;
  letter-spacing: -.015em; margin: 0 0 2px; line-height: 1.3;
}
.ss-deck-top .ss-sub {
  font-family: var(--body); font-size: 12.5px; color: var(--ink-faint);
  text-transform: none; letter-spacing: 0;
}
.ss-deck-body { padding: 0; display: flex; flex-direction: column; gap: var(--s-3); }
.ss-meta { display: flex; align-items: center; gap: var(--s-3); font-family: var(--body); font-size: 12.5px; color: var(--ink-soft); }
.ss-meta b { color: var(--ink); font-weight: 500; }

.ss-bar { height: 5px; background: var(--paper-deep); border-radius: var(--r-pill); overflow: hidden; }
.ss-bar i { display: block; height: 100%; background: var(--accent); border-radius: var(--r-pill); transition: width .45s var(--ease); }

.ss-due-dot {
  display: inline-block; background: var(--accent-soft); color: var(--accent-text);
  border: none; border-radius: var(--r-pill); padding: 2px 9px;
  font-family: var(--body); font-size: 12px; font-weight: 500;
}

/* ---------------- deck detail ---------------- */
.ss-modes { display: flex; gap: var(--s-2); flex-wrap: wrap; margin: var(--s-1) 0 var(--s-6); }
.ss-mode { flex: 1 1 150px; text-align: left; padding: var(--s-3) var(--s-4); }
.ss-mode strong {
  display: block; font-family: var(--display); font-size: 14px;
  font-weight: 600; letter-spacing: -.01em; margin-bottom: 1px;
}
.ss-mode span { font-size: 12.5px; color: var(--ink-soft); font-weight: 400; }

.ss-rows { border: 1px solid var(--rule); border-radius: var(--r-2); overflow: hidden; background: var(--card); box-shadow: var(--sh-1); }
.ss-row { padding: var(--s-3) var(--s-4); border-bottom: 1px solid var(--rule); transition: background var(--t-fast) var(--ease); }
.ss-row:last-child { border-bottom: none; }
.ss-row:hover { background: var(--paper-deep); }
.ss-row-main { display: grid; grid-template-columns: 32px 1fr 1.4fr 28px; gap: var(--s-3); align-items: start; }
.ss-row-n { font-family: var(--mono); font-size: 12px; color: var(--ink-faint); padding-top: 3px; font-variant-numeric: tabular-nums; }
.ss-cell {
  border: none; background: transparent; width: 100%; resize: none; overflow: hidden;
  font-size: 14px; line-height: 1.5; padding: 2px 0; border-radius: 0;
}
.ss-cell:focus { outline: none; box-shadow: 0 1px 0 var(--accent); }
.ss-cell::placeholder { color: var(--placeholder); }
.ss-cell.term { font-weight: 500; }
.ss-x { color: var(--ink-faint); font-size: 17px; line-height: 1; padding: 2px 5px; border-radius: var(--r-1); }
.ss-x:hover { color: var(--rose); background: var(--rose-soft); }

.ss-row-meta {
  display: flex; align-items: center; gap: var(--s-3);
  margin-top: var(--s-2); margin-left: 44px; max-width: calc(100% - 44px);
}
.ss-tag-input {
  flex: 1; border: none; background: transparent; font-family: var(--body);
  font-size: 12.5px; color: var(--ink-soft); padding: 2px 0;
}
.ss-tag-input::placeholder { color: var(--placeholder); }
.ss-tag-input:focus { color: var(--ink); outline: none; }
.ss-type-select {
  flex: 0 0 auto; border: 1px solid var(--rule); border-radius: var(--r-1);
  background: var(--card); font-family: var(--body); font-size: 12px;
  color: var(--ink-soft); padding: 4px 8px;
}

.ss-mcq-editor {
  margin: var(--s-3) 0 0 44px; max-width: calc(100% - 44px); padding: var(--s-3) var(--s-4);
  border: 1px solid var(--rule); border-radius: var(--r-2); background: var(--paper);
  display: flex; flex-direction: column; gap: var(--s-2);
}
.ss-mcq-opt { display: flex; align-items: flex-start; gap: var(--s-2); }
.ss-mcq-opt input[type="radio"] { margin-top: 5px; flex: 0 0 auto; accent-color: var(--accent); }
.ss-mcq-opt-input {
  flex: 1; border: none; background: transparent; resize: none; overflow: hidden;
  font-size: 13.5px; line-height: 1.45; padding: 2px 0;
}
.ss-mcq-opt-input::placeholder { color: var(--placeholder); }
.ss-mcq-explain {
  border: none; border-top: 1px solid var(--rule); background: transparent;
  resize: none; overflow: hidden; font-family: var(--body); font-size: 12.5px;
  color: var(--ink-soft); padding: var(--s-2) 0 0; margin-top: var(--s-1);
}
.ss-mcq-explain::placeholder { color: var(--placeholder); }

/* ---------------- chips ---------------- */
.ss-chips { display: flex; gap: var(--s-2); flex-wrap: wrap; align-items: center; }
.ss-chip {
  font-family: var(--body); font-size: 13px; border: 1px solid var(--rule);
  border-radius: var(--r-pill); padding: 5px 12px; color: var(--ink-soft); background: var(--card);
  transition: background var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
}
.ss-chip:hover { border-color: var(--rule-strong); color: var(--ink); }
.ss-chip.on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent-text); font-weight: 500; }
.ss-chip.leech { border-color: var(--rule); color: var(--rose); }
.ss-chip.leech.on { background: var(--rose-soft); border-color: var(--rose); color: var(--rose-text); }

/* ---------------- study surface ---------------- */
.ss-study { display: flex; flex-direction: column; align-items: center; gap: var(--s-5); }
.ss-studybar { width: 100%; display: flex; align-items: center; gap: var(--s-4); flex-wrap: wrap; }
.ss-count { font-family: var(--body); font-size: 13px; color: var(--ink-soft); font-variant-numeric: tabular-nums; }
.ss-track { flex: 1; min-width: 120px; height: 4px; background: var(--paper-deep); border-radius: var(--r-pill); overflow: hidden; }
.ss-track i { display: block; height: 100%; background: var(--accent); border-radius: var(--r-pill); transition: width .35s var(--ease); }

.ss-stage-row { display: flex; align-items: center; gap: var(--s-4); width: 100%; justify-content: center; }
.ss-side-actions { display: flex; flex-direction: column; gap: var(--s-2); flex: 0 0 auto; }
.ss-side-actions .ss-btn { white-space: nowrap; }
@media (max-width: 760px) {
  .ss-stage-row { flex-direction: column; }
  .ss-side-actions { flex-direction: row; }
}

.ss-stage { position: relative; width: 100%; max-width: 620px; }
.ss-ghost {
  position: absolute; left: 6px; right: 6px; top: 8px; height: 100%;
  border: 1px solid var(--rule); border-radius: var(--r-3); background: var(--card);
  opacity: .6;
}
.ss-flip { perspective: 1600px; position: relative; }
.ss-flip-in {
  position: relative; transform-style: preserve-3d;
  transition: transform .45s var(--ease); min-height: clamp(260px, 42vh, 350px);
}
.ss-flip.on .ss-flip-in { transform: rotateY(180deg); }
.ss-face {
  position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden;
  border: 1px solid var(--rule); border-radius: var(--r-3); background: var(--card);
  box-shadow: var(--sh-2);
  display: flex; flex-direction: column; padding: var(--s-5) var(--s-6) var(--s-6); cursor: pointer;
}
.ss-face.back { transform: rotateY(180deg); }
.ss-face-rule {
  border-bottom: 1px solid var(--rule); margin: 0 calc(var(--s-6) * -1) 0;
  padding: 0 var(--s-6) var(--s-3);
  display: flex; justify-content: space-between; align-items: center;
}
.ss-face-lab {
  font-family: var(--body); font-size: 12px; letter-spacing: 0;
  text-transform: none; color: var(--ink-faint);
}
.ss-face-mid { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--s-5) 0; }
.ss-face-mid p {
  font-family: var(--display); font-weight: 500; letter-spacing: -.02em;
  font-size: clamp(20px, 3.2vw, 28px); line-height: 1.3; text-align: center; margin: 0;
}
.ss-face.back .ss-face-mid p {
  font-family: var(--body); font-weight: 400;
  font-size: clamp(16px, 2.4vw, 19px); line-height: 1.6;
}
.ss-hint { font-family: var(--body); font-size: 12.5px; color: var(--ink-faint); text-align: center; }

.ss-verdicts { display: flex; gap: var(--s-3); width: 100%; max-width: 620px; }
.ss-verdicts .ss-btn { flex: 1; }
.ss-v-no { background: var(--rose-soft); border-color: var(--rose-soft); color: var(--rose-text); }
.ss-v-no:hover { background: var(--rose-soft); border-color: var(--rose); }
.ss-v-yes { background: var(--teal-soft); border-color: var(--teal-soft); color: var(--teal-text); }
.ss-v-yes:hover { background: var(--teal-soft); border-color: var(--teal); }

/* ---------------- typed answer ---------------- */
.ss-panel {
  width: 100%; max-width: 620px; border: 1px solid var(--rule); border-radius: var(--r-3);
  background: var(--card); box-shadow: var(--sh-1); padding: var(--s-5) var(--s-6) var(--s-6);
}
.ss-prompt {
  font-family: var(--display); font-weight: 500; font-size: clamp(19px, 3vw, 26px);
  letter-spacing: -.02em; line-height: 1.3; margin: var(--s-3) 0 var(--s-5);
}
.ss-input {
  width: 100%; border: 1px solid var(--rule); border-radius: var(--r-1);
  background: var(--paper); padding: 11px 14px; font-size: 16px; font-family: var(--body);
  transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease);
}
.ss-input::placeholder { color: var(--placeholder); }
.ss-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.ss-feed { margin-top: var(--s-5); padding-top: var(--s-4); border-top: 1px solid var(--rule); }
.ss-tag {
  font-family: var(--body); font-size: 12px; font-weight: 500; letter-spacing: 0;
  text-transform: none; border: none; border-radius: var(--r-pill);
  padding: 3px 10px; display: inline-block;
}
.ss-tag.ok { background: var(--teal-soft); color: var(--teal-text); }
.ss-tag.no { background: var(--rose-soft); color: var(--rose-text); }
.ss-ans { font-size: 16px; margin: var(--s-3) 0 0; line-height: 1.6; }
.ss-you { font-family: var(--body); font-size: 13px; color: var(--ink-soft); margin-top: var(--s-2); }
.ss-you s { color: var(--rose); }

/* ---------------- match ---------------- */
.ss-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--s-2); width: 100%; }
.ss-tile {
  border: 1px solid var(--rule); border-radius: var(--r-2); background: var(--card);
  padding: var(--s-3); min-height: 104px; font-size: 13.5px; line-height: 1.45;
  text-align: left; box-shadow: var(--sh-1);
  transition: border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease),
              transform var(--t-fast) var(--ease), opacity .3s var(--ease);
  display: flex; align-items: center;
}
.ss-tile:hover { border-color: var(--rule-strong); }
.ss-tile.term { font-family: var(--display); font-weight: 500; font-size: 15px; letter-spacing: -.01em; }
.ss-tile.pick { background: var(--accent-soft); border-color: var(--accent); color: var(--accent-text); }
.ss-tile.gone { opacity: 0; pointer-events: none; transform: scale(.96); }
.ss-tile.bad { animation: ss-shake .3s var(--ease); border-color: var(--rose); background: var(--rose-soft); }
@keyframes ss-shake { 25%{transform:translateX(-5px)} 50%{transform:translateX(5px)} 75%{transform:translateX(-3px)} }
.ss-clock { font-family: var(--mono); font-size: 24px; font-weight: 500; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }

/* ---------------- test / results ---------------- */
.ss-q { border-bottom: 1px solid var(--rule); padding: var(--s-5) 0; }
.ss-q:first-child { padding-top: var(--s-1); }
.ss-q:last-child { border-bottom: none; }
.ss-q-h {
  font-family: var(--body); font-size: 12.5px; letter-spacing: 0;
  text-transform: none; color: var(--ink-faint); margin-bottom: var(--s-2);
}
.ss-q-p {
  font-family: var(--display); font-weight: 500; font-size: 17px;
  letter-spacing: -.015em; line-height: 1.45; margin: 0 0 var(--s-4);
}
.ss-opts { display: grid; gap: var(--s-2); }
.ss-opt {
  border: 1px solid var(--rule); border-radius: var(--r-1); background: var(--card);
  padding: 11px 14px; text-align: left; font-size: 14px; line-height: 1.5;
  display: flex; gap: var(--s-3); align-items: flex-start;
  transition: border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease);
}
.ss-opt:hover { border-color: var(--rule-strong); background: var(--paper-deep); }
.ss-opt.on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent-text); }
.ss-opt.right { border-color: var(--teal); background: var(--teal-soft); color: var(--teal-text); }
.ss-opt.wrong { border-color: var(--rose); background: var(--rose-soft); color: var(--rose-text); }
.ss-opt kbd { font-family: var(--mono); font-size: 12px; padding-top: 2px; color: var(--ink-faint); }
.ss-score {
  font-family: var(--display); font-size: clamp(48px, 10vw, 76px); font-weight: 600;
  letter-spacing: -.04em; line-height: 1; font-variant-numeric: tabular-nums;
}
.ss-score small { font-family: var(--body); font-size: 14px; font-weight: 400; letter-spacing: 0; color: var(--ink-soft); }

/* ---------------- mock test palette ---------------- */
.ss-palette { display: grid; grid-template-columns: repeat(auto-fill, minmax(38px, 1fr)); gap: var(--s-2); }
.ss-pal {
  aspect-ratio: 1; border-radius: var(--r-1); font-family: var(--mono); font-size: 12.5px; font-weight: 500;
  border: 1px solid var(--rule); background: var(--card); color: var(--ink-faint);
  font-variant-numeric: tabular-nums;
  transition: border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease);
}
.ss-pal-unvisited { border-style: dashed; }
.ss-pal-visited { border-color: var(--rule-strong); color: var(--ink); }
.ss-pal-answered { border-color: transparent; background: var(--accent-soft); color: var(--accent-text); }
.ss-pal-marked { border-color: transparent; background: var(--rose-soft); color: var(--rose-text); }
.ss-pal.current { outline: 2px solid var(--accent); outline-offset: 1px; }

/* ---------------- grades ---------------- */
.ss-grades { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--s-2); width: 100%; max-width: 620px; }
.ss-grade { padding: 11px var(--s-2); text-align: center; }
.ss-grade strong { display: block; font-size: 13.5px; font-weight: 500; }
.ss-grade span { font-family: var(--body); font-size: 12px; color: var(--ink-soft); }

/* ---------------- empty state ---------------- */
.ss-empty {
  border: 1px dashed var(--rule-strong); border-radius: var(--r-2);
  padding: var(--s-7) var(--s-5); text-align: center; background: var(--card);
}
.ss-empty h3 { font-family: var(--display); font-size: 17px; font-weight: 600; margin: 0 0 var(--s-1); letter-spacing: -.015em; }
.ss-empty p { color: var(--ink-soft); font-size: 14px; margin: 0 0 var(--s-4); }

/* ---------------- sheets ---------------- */
.ss-sheet {
  position: fixed; inset: 0; background: rgba(20,20,18,.4); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center; padding: var(--s-5); z-index: 40;
  animation: ss-fade .16s var(--ease);
}
@keyframes ss-fade { from { opacity: 0 } }
.ss-sheet-in {
  background: var(--card); border: 1px solid var(--rule); border-radius: var(--r-3);
  box-shadow: var(--sh-3); padding: var(--s-5); width: 100%; max-width: 500px;
  max-height: 88vh; overflow-y: auto;
  animation: ss-rise .2s var(--ease);
}
@keyframes ss-rise { from { opacity: 0; transform: translateY(8px) } }
.ss-sheet-in.wide { max-width: 640px; }
.ss-sheet-in h3 { font-family: var(--display); font-size: 18px; font-weight: 600; letter-spacing: -.02em; margin: 0 0 var(--s-1); }
.ss-sheet-in p { color: var(--ink-soft); font-size: 13.5px; margin: 0 0 var(--s-4); }

.ss-ta {
  width: 100%; min-height: 150px; border: 1px solid var(--rule); border-radius: var(--r-1);
  background: var(--paper); padding: var(--s-3); font-family: var(--mono);
  font-size: 13px; line-height: 1.65;
  transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease);
}
.ss-ta:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.ss-field {
  width: 100%; border: 1px solid var(--rule); border-radius: var(--r-1); background: var(--paper);
  padding: 10px 13px; font-size: 15px; margin-bottom: var(--s-3);
  transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease);
}
.ss-field::placeholder { color: var(--placeholder); }
.ss-field:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.ss-actions { display: flex; gap: var(--s-2); justify-content: flex-end; margin-top: var(--s-4); }
.ss-note { font-family: var(--body); font-size: 12.5px; color: var(--ink-soft); line-height: 1.65; }

/* ---------------- import ---------------- */
.ss-tabs { display: flex; gap: var(--s-1); margin-bottom: var(--s-4); border-bottom: 1px solid var(--rule); }
.ss-tab {
  font-family: var(--body); font-size: 13px; text-transform: none; letter-spacing: 0;
  padding: var(--s-2) var(--s-3); border: none; border-bottom: 2px solid transparent;
  margin-bottom: -1px; color: var(--ink-soft); border-radius: 0;
  transition: color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease);
}
.ss-tab:hover { color: var(--ink); }
.ss-tab.on { border-bottom-color: var(--accent); color: var(--ink); font-weight: 500; background: transparent; }

.ss-drop {
  border: 1px dashed var(--rule-strong); border-radius: var(--r-2);
  padding: var(--s-6) var(--s-5); text-align: center; background: var(--drop-bg);
  transition: background var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease);
}
.ss-drop.over { background: var(--accent-soft); border-color: var(--accent); }
.ss-drop p { margin: var(--s-2) 0 0; font-size: 13px; color: var(--ink-soft); }

.ss-srcs { display: flex; flex-direction: column; gap: var(--s-2); margin-top: var(--s-3); }
.ss-src {
  display: flex; gap: var(--s-3); align-items: center; border: 1px solid var(--rule);
  border-radius: var(--r-1); background: var(--card); padding: 10px 12px; font-size: 13px;
}
.ss-src b { font-family: var(--display); font-weight: 600; letter-spacing: -.01em; }
.ss-src .ss-fname { font-family: var(--mono); font-size: 11.5px; color: var(--ink-faint); }
.ss-src .ss-n { font-family: var(--mono); font-size: 12px; color: var(--ink-soft); }

.ss-prev { border-left: 2px solid var(--accent); border-radius: 0; padding-left: var(--s-3); margin-top: var(--s-4); }
.ss-prev div { font-size: 12.5px; line-height: 1.65; color: var(--ink-soft); }
.ss-prev div b { color: var(--ink); font-weight: 500; }

.ss-fmt { margin-top: var(--s-4); font-family: var(--body); font-size: 12.5px; color: var(--ink-soft); }
.ss-fmt summary { cursor: pointer; color: var(--ink-soft); }
.ss-fmt summary:hover { color: var(--accent); }
.ss-fmt pre {
  background: var(--paper); border: 1px solid var(--rule); border-radius: var(--r-1);
  padding: var(--s-3); overflow-x: auto; font-family: var(--mono);
  font-size: 11.5px; line-height: 1.75; margin: var(--s-3) 0 0;
}
.ss-err { color: var(--rose); font-family: var(--body); font-size: 12.5px; margin-top: var(--s-3); }

/* ---------------- responsive ---------------- */
@media (max-width: 620px) {
  .ss-wrap { padding: var(--s-4) var(--s-4) var(--s-7); }
  .ss-tiles { grid-template-columns: repeat(2, 1fr); }
  .ss-grades { grid-template-columns: repeat(2, 1fr); }
  .ss-row-main { grid-template-columns: 22px 1fr 26px; }
  .ss-row-main .ss-cell.def { grid-column: 2 / 3; }
  .ss-row-meta { margin-left: 32px; max-width: calc(100% - 32px); flex-wrap: wrap; }
  .ss-mcq-editor { margin-left: 32px; max-width: calc(100% - 32px); }
  .ss-today { padding: var(--s-4); }
  .ss-face { padding: var(--s-4) var(--s-4) var(--s-5); }
  .ss-face-rule { margin: 0 calc(var(--s-4) * -1) 0; padding: 0 var(--s-4) var(--s-3); }
  .ss-panel { padding: var(--s-4); }
  .ss-pile { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ss *, .ss *::before, .ss *::after { transition: none !important; animation: none !important; }
}
`;
