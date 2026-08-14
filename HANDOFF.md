# StudyStack — Handoff

**Repo:** `github.com/materialcritic/studystack` (public)
**Local path:** `/Users/floppa/Claude_Cowork/studystack/`
**Purpose:** personal flashcard + spaced-repetition app for UGC NET exam prep (Paper 1 + Paper 2/Political Science)
**Last updated:** 2026-08-14, commit `cf7682e`

Read this in full before doing anything else in this project — it has the full build history, every data-loss incident and how it was fixed, and exactly what's left to build.

---

## Quick start

```bash
cd /Users/floppa/Claude_Cowork/studystack
npm run build          # one-shot build, auto-stamps index.html's cache-bust
npm run watch          # or this, for auto-rebuild on save
python3 server.py 8746 # or use preview_start({name:"studystack"}) via .claude/launch.json
```

Open `http://localhost:8746`. The `.claude/launch.json` entry (in `/Users/floppa/Claude_Cowork/.claude/launch.json`) is named `"studystack"`, port 8746.

**Current data (as of this write-up): 3 decks, 565 cards total**
- Parliament, Executive & State Institutions — 159 cards (Paper-2, imported from an extraction pipeline)
- Political Thinkers & Their Works — 166 cards (Paper-2, same source)
- Mega Mix — 240 cards (the user's own deck, imported from Knowt.com mid-session on 2026-08-14)

---

## What this actually is

A single-file-React app (`src/StudyStack.jsx`, ~2,140 lines) bundled with esbuild, served by a custom Python `server.py` that also exposes `GET`/`POST /api/decks` backed by `decks.json`. No database — the deck data lives entirely in that one JSON file, tracked in git.

**Why built this way:** deliberately mirrors the user's other personal project, `ugc-net-quiz` (`/Users/floppa/Claude_Cowork/ugc-net-quiz/`), which uses the exact same pattern: static React/vanilla-JS app + Python server + JSON file, deployed by running the server on an Android phone (Termux + tmux) reachable from anywhere via Tailscale, with Syncthing keeping the Mac and phone copies in sync. See that project's `handoff/HANDOFF.md` for the exact phone-side setup steps if you need them — they're not repeated here.

## Deployment status

**Local only.** The Android/Tailscale/Syncthing side has **not** been set up for StudyStack — only `python3 server.py` on the Mac, previewed via the `preview_start` tool. When that work happens, reuse the ugc-net-quiz phone setup (Termux, tmux, Tailscale Android app, already running) rather than redoing it from scratch — just add StudyStack's folder to the existing Syncthing config and give it its own tmux window/port in `~/start-server.sh`.

**One thing to know when that happens:** `server.py` was hardened in this session (see below) and now binds `127.0.0.1` by default instead of `0.0.0.0`. The phone's `start-server.sh` launch command will need `--lan` appended, e.g. `python3 server.py 8744 --lan`, or the Android server won't be reachable over Tailscale.

---

## Recurring issue you should know about: the dev server keeps dying

**This happened at least 3 times across sessions**, each time silently: the local `python3 server.py` process would die mid-session (confirmed via `ERR_CONNECTION_REFUSED` / `lsof -i :8746` showing nothing), and a browser tab that had been sitting open would occasionally re-POST a stale in-memory snapshot of `decks` once the server came back — clobbering real card data.

**Every time this happened, it was caught and fully recovered** by diffing the live `decks.json` against the last known-good git commit and merging back only the specific missing cards (never a blind revert, so legitimate progress from the same session wasn't lost). Total real data lost across all incidents: zero, after recovery.

**What's already done to reduce the risk:**
- `server.py` was rewritten (commit `b47e41e`) with rate-limited backups (numbered slots rotate at most once per 10 min, not on every 400ms autosave — the old version could evict all 10 backup slots within a minute of typing), a daily snapshot kept 30 days, and an automatic `pre-shrink-*` snapshot + stderr warning whenever a write would drop >10% of the total card count.
- The client already mirrors `decks`/`bests` to `localStorage` on every save and falls back to it if the server is unreachable on load (Phase 0 work, see roadmap section below).
- Writes are atomic (`tmp` file + `os.replace` + `fsync`) so a crash mid-write can't truncate `decks.json`.

**What's NOT been root-caused:** *why* the server process itself keeps dying. It's not something in StudyStack's own code — it happens between conversation turns, likely something in the local Claude Code / preview-tool environment killing background processes. If this keeps happening once the user is using the app day-to-day outside of these sessions, that's worth investigating properly rather than continuing to route around it with better backups.

**If you hit "Not saving — storage unavailable" in the header:** that's the client's `fetch('/api/decks', {method:'POST'})` throwing. Check `lsof -i :8746` — if nothing's listening, the server died; restart it with `preview_start({name:"studystack"})` and reload the tab. No data is lost while this is showing (nothing destructive has been written), it just means changes aren't persisted until the connection comes back.

**Practical lesson for future sessions:** don't leave multiple browser tabs open against this app for long stretches. Close tabs you're done verifying with rather than letting them accumulate — a stale tab's autosave is the actual mechanism that turned "server restarted" into "cards went missing."

---

## Full build history (chronological)

### Initial build (commit `84d6247`)
Converted the user-supplied single-file React component into a working app: `src/theme.js`... no wait, initial theme was inline. esbuild bundle (`build.js` → `app.js`), `server.py`, `index.html`, `.claude/launch.json` entry. Dataset started empty per the user's explicit request (data added later via import).

### Early feature additions
- Flag/Delete buttons in Flashcards mode (`669c8e7`)
- Home nav (← Home link), per-deck "Reset progress", dark mode toggle, **removed the original "Learn" mode** (typed-recall version — later replaced by a different, MCQ-based Learn mode, see below) (`4cf2f15`)
- `decks.json` moved from gitignored to tracked in git (`3cb6478`) — this turned out to be essential; git history is what made every subsequent data-loss recovery possible

### The roadmap (`studystack-roadmap.md`, user-supplied review doc)
A thorough external code review was provided, structured as Phase 0 through Phase 6 plus "Part 3" NET-specific question types. Worked through **in full** except where noted:

- **Phase 0** (`7acf093`) — data-safety bugs: due-date rollover (4am boundary instead of exact-timestamp comparison), atomic server writes + rotating backups (v1, later hardened further), localStorage client mirror, CSV/TSV import (real delimited parser instead of the markdown-oriented one), fixed stale "restore the two samples" copy (there were no samples), `inert`+`tabIndex` instead of just `aria-hidden` on the flip card's hidden face.
- **Phase 1** (`3a806c1`) — card schema gained `tags: []`; tag filter chips on the deck screen; **cross-deck tag-scoped study sessions** (a tag pulls matching cards from every deck into one session — works because card IDs are globally unique, so grading/flagging/deleting routes back to the real origin deck automatically).
- **Phase 2** (`30d9ac4`) — global daily queue: "Study everything due today" button on home, merges due cards across every deck, capped at 20 new / 150 review (rest rolls to tomorrow). Note: cap is enforced **per session**, not a persisted cross-session daily counter — reopening the queue same day offers another 20 new cards. Flagged as a known simplification, not fixed.
- **Phase 3** (`0334b41`) — authored MCQ + Assertion-Reason card types (`type`, `options[]`, `answer`, `explanation` fields). Test mode uses authored options instead of random unrelated-definition distractors when present. Assertion-Reason auto-fills the 4 canonical NTA codes. **Only MCQ/Assertion-Reason were built** — match-the-following, chronological/sequence, and multi-statement question types from the original roadmap were never built (see "Not done" below).
- **Phase 4** (`8511c72`, `869a82d`) — reverse/mixed study direction (Term→Def / Def→Term / Mixed toggle, deterministic per-card hash for "mixed" so it's stable without extra state), leech detection (`srs.lapses >= 6` pulls a card out of the automated daily queue's review bucket but keeps it reachable via the deck's own Review — surfaced via a "⚠ N leeches" filter chip), key-term scoring for typed recall (`keywords[]`/`alternates[]` fields, 80%-coverage-or-full-match scoring, missing keywords shown after grading).
- **Phase 5** (`4a9ca47`) — Mock Test mode: countdown timer (72s/question, matching the real 50Q/60min ratio), question palette (unvisited/visited/answered/marked states, jump to any question), Save & Next / Mark for Review / Clear Response flow with no feedback until submit, optional negative marking toggle (off by default — real UGC NET has none), post-test analysis (accuracy-by-tag, time per question), "Create deck from N missed" (clones missed cards with fresh IDs/SRS into a new focus deck).
- **Part 6 polish** (`df73a70`, `4aa67fd`) — search across all cards from the home screen, a Stats screen (total/due/retention/leech count, 30-day reviews-due forecast bar chart, retention-by-tag — deliberately scoped to what's actually persisted, **not** fabricated accuracy-over-time data since nothing logs historical test attempts), PWA manifest + service worker (network-first with cache fallback, `/api/*` never cached), Anki-compatible TSV export per deck.

### A second external review (`studystack-fixes.md`) — applied in full
A follow-up review found and fixed **real, live bugs**, not just polish:

1. **Test/MockTest reshuffle-on-submit** (`44b1606`) — both built their question set via `useMemo(..., [deck.cards, size])`. Submitting calls `onGrade` per question, which replaces every card object via `setDecks`, invalidating the memo and reshuffling with fresh `Math.random()` calls *before* the results screen rendered. Users could see blank/wrong results for questions they'd actually answered correctly. Fixed by freezing the question set once via `useState(() => ...)` at mount. **Verified by actually answering a real 10-question test and diffing what was submitted against what the results screen showed — 0 mismatches after the fix** (there were mismatches before, reproduced and confirmed the bug was real).
2. **The stale-save bug, real root cause found** (same commit) — `DeckDetail`'s mutators (`setCard`, `setType`, `setOption`, add/remove card) and `ImportSheet`'s `onAppend` all built a whole new deck object from the `deck` **prop captured at render time**, discarding anything committed to state between that render and the click. `gradeCard`/`patchCard`/`deleteCard` already used functional `setDecks` correctly — this was the one path that didn't, and is very likely the actual mechanism behind at least some of the "cards went missing" incidents, not just the stale-tab theory. Fixed by replacing `onPatch(finishedDeckObject)` with `onUpdate(deckId, updater)` everywhere, always running against current state.
3. **Flashcards stale refs + Match timer bugs** (same commit) — Flashcards stored shuffled card *objects* instead of ids (Review already did this right), so an edit made elsewhere kept showing stale text mid-session; fixed to resolve ids through a `byId` map every render, with an effect that skips a vanished id instead of ending the session early. Match's "Play again" never reset its timer (`t0` was `useState`, not a ref) — round two's clock kept counting from round one's start, recording bogus best times; fixed with a ref that Play Again explicitly resets, plus a `priorBest` ref since `onBest` fired before the result screen rendered (so the "New best time" message was always wrong).
4. **`server.py` hardening** (`b47e41e`) — see the "recurring issue" section above.
5. **`decks.json` reformatted** (`7ee222d`) — from one ~500KB single line to `indent=1, ensure_ascii=False`, matching the new server's write format, so future commits show readable diffs.
6. **`build.js` auto-stamps cache-busting** (folded into `44b1606`) — `index.html`'s `?v=N` was hand-bumped every single commit throughout this project (tedious, easy to forget — a stale cache looks exactly like "the fix didn't work"). Now derives an 8-char hash from `app.js`'s own contents and rewrites `index.html` automatically on every build. **Don't hand-edit the `?v=` query param anymore** — just run `npm run build` and it updates itself.
7. **`tools/audit_decks.py`** (`ec42cf3`) — read-only script flagging suspect cards (stub definitions that are just a bare year/option letter — the back half of a split sentence; source artifacts used as terms like "List-II", "Note"; duplicate terms with conflicting definitions — the real priority, since two cards teaching different answers to the same prompt actively train the wrong one). Run: `python3 tools/audit_decks.py decks.json --limit=15`. **Not yet acted on** — 93 of the original 325 cards were flagged, including a real "April 1951" vs "April 1952" contradiction about when Parliament came into existence. This is manual editorial work the user hasn't started.

### Visual overhaul (`b996422`, `3a0acca`)
User supplied `theme.js` + `INTEGRATION.md` for a full "calm neutral" redesign — warm-grey surfaces, white cards, hairline borders, single indigo accent, Inter + IBM Plex Mono, replacing the original neo-brutalist look (blue-grey paper, hard offset shadows, highlighter yellow). Applied in full: new `src/theme.js` module (same class/CSS-variable names as before, so JSX needed minimal changes), fonts moved to `<link>` tags instead of a blocking `@import`, the daily-queue CTA rebuilt as a bold single click-target (`.ss-cta-go` is deliberately a `<span>`, not a nested `<button>` — nesting buttons is invalid HTML, flagged explicitly by the user and verified via DOM inspection), emoji dropped throughout for the monochrome-palette rule. Then a follow-up fix: `html`/`body` never had their default margin reset, letting the page background show through as a white border on all 4 sides in dark mode — fixed with a `margin:0` reset + `prefers-color-scheme`-matched background.

### Recent small features (this session, 2026-08-14)
- **Copy button** (`c85e930`) — copies whichever face is currently showing (respects flip state + direction) to clipboard, in Flashcards mode.
- **Edit button** (`a49b75f`) — small sheet (reuses `.ss-sheet` pattern) to fix a card's term/def without leaving the study session; updates live via `onPatchCard`.
- **Fullscreen button** (`e3c6f1f`) — standard Fullscreen API, synced via `fullscreenchange` listener. **Could not be visually verified working** — this session's preview browser tool rejects `requestFullscreen()` with "Permissions check failed" regardless of gesture legitimacy or iframe status (confirmed it's a restriction of the automated browser itself, not the app). Should work normally in a real user-driven browser; worth a manual check next session.
- **Learn mode** (`cf7682e`) — new mode: MCQ-based (4 options, authored-options-with-generated-fallback via `mcOptionsFor()`), repeat-until-mastered (2 correct in a row per card, a miss cycles the card to the back of the queue rather than repeating immediately). **Deliberately practice-only** — doesn't call `onGrade`, confirmed live that correct answers don't touch `srs.reps`/`srs.due`. Scoped to a minimal core (question + 4 options + feedback + progress bar) — no hint button, flag, inline edit, or audio, unlike the Knowt.com screenshot that inspired the request.

---

## What's NOT done (the actual remaining backlog)

From the original roadmap, still open:
- **Match-the-following, chronological/sequence, and multi-statement question types** (Part 3) — only MCQ/Assertion-Reason got built.
- **Confusion tracking** (4.5, "log which wrong option you pick, auto-generate a confusables deck") — needs a persisted results-history log, which doesn't exist. Test/Mock Test results are ephemeral right now, nothing logs attempts over time.
- **True "accuracy over time" stats** — same blocker; the Stats screen only shows what's derivable from current SRS state (a stability-based retention proxy), not real historical accuracy, because nothing stores past attempts.
- **Splitting `StudyStack.jsx` into modules** — currently ~2,140 lines. The visual-overhaul integration doc explicitly flagged this as a deliberately-deferred follow-up (real merge risk, doesn't belong bundled with a visual change). Worth doing before it grows much further.
- **Card content quality** — `tools/audit_decks.py` found 93 suspect cards (26 with conflicting duplicate definitions). Nobody has gone through the list yet.
- **Android/Tailscale/Syncthing deployment** — see "Deployment status" above. Not started for StudyStack specifically (the pattern exists and works for the sibling `ugc-net-quiz` project).
- **Native `confirm()` dialogs** (delete deck, erase all, delete card) still render as OS popups, which will look out of place against the new sheet-based visual design. Flagged, not fixed.
- **No focus trap / Escape handler / `role="dialog"`** on the `.ss-sheet` modals.
- **No routing** — `view` is plain component state, so the browser back button exits the whole app rather than backing out of a study session.
- **No automated tests.** Every verification in this project has been manual (via the browser preview tool). The pure functions (`grade`, `nextRollover`/`isDue`, `buildDailyQueue`, `scoreWritten`, `parseCardText`, `parseDelimited`) would be the cheap win if a test suite is ever wanted — `parseCardText` especially, given how much heuristic branching it has.

## Known but accepted simplifications (not bugs, just worth knowing)
- Daily queue's new/review cap resets per session, not tracked cumulatively across a day.
- Reverse/mixed direction only applies to Flashcards and Review — Match and Test/MockTest always run term→def.
- Learn mode is practice-only by explicit user choice this session — doesn't feed into the SRS schedule at all.

---

## If you're picking this up in a new session

1. **Read this file fully first.** Then check `git log --oneline` to confirm nothing's landed since this was written.
2. **Check the server is actually running** before assuming anything's broken — `lsof -i :8746`, and remember the recurring dev-server-death issue above.
3. **Before testing anything destructive** (delete, erase all, bulk import) **against the real decks.json**, either use a scratch deck (create one, test, delete it after — this project's whole session history is full of examples of this pattern) or snapshot `decks.json` first with `cp decks.json /tmp/backup.json`.
4. **Never hand-edit `index.html`'s `?v=` param** — it's automatic now, just run `npm run build`.
5. If the user asks "what's left," point them at the "What's NOT done" section above rather than re-deriving it.
