#!/usr/bin/env python3
"""Report suspect cards in decks.json. Read-only: it never edits anything,
because deciding what a mangled card *should* say needs a human.

The import heuristics in parseCardText split on ": " and " - ", which works for
notes but shatters prose — so an extracted deck accumulates cards whose "term"
is a sentence fragment and whose "def" is the tail end of it. Under an SRS a
wrong card is worse than a missing one: you rehearse it until you believe it.

Usage:
    python3 tools/audit_decks.py [decks.json] [--limit N]
"""

import json
import re
import sys
from collections import defaultdict

# Cards whose definition is only a year/date or a bare option label are almost
# always the back half of a sentence the splitter cut in two.
STUB_DEF = re.compile(r"^[\W]*(?:\d{4}|[ivxIVX]+\.|[A-E]\.|i\.e\.|[A-E],)[\W]*$")
FRAGMENT_TERM = re.compile(r"^(?:List[-–—\s]?I{1,2}|Note|Text Solution|Comprehension|"
                           r"Assertion|Chronological order|Birth order|Wrote|His other Essays|Essay)\b", re.I)
DANGLING = re.compile(r"[,;:(]\s*$|\b(?:and|or|the|of|in|by|with|to)\s*$", re.I)


def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", (s or "").lower()).strip()


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    path = args[0] if args else "decks.json"
    limit = 15
    for a in sys.argv[1:]:
        if a.startswith("--limit"):
            limit = int(a.split("=")[1]) if "=" in a else limit

    data = json.load(open(path, encoding="utf-8"))
    findings = defaultdict(list)
    seen_terms = defaultdict(list)
    total = 0

    for deck in data.get("decks", []):
        title = deck.get("title", deck.get("id"))
        for card in deck.get("cards", []):
            total += 1
            term = (card.get("term") or "").strip()
            definition = (card.get("def") or "").strip()
            where = f"{title} / {card.get('id')}"

            if not term or not definition:
                findings["empty side"].append((where, term[:70], definition[:70]))
            if STUB_DEF.match(definition):
                findings["definition is just a date or option label"].append((where, term[:70], definition[:70]))
            if FRAGMENT_TERM.match(term):
                findings["term is a source artifact, not a prompt"].append((where, term[:70], definition[:70]))
            if DANGLING.search(term):
                findings["term ends mid-clause (bad split)"].append((where, term[:70], definition[:70]))
            if len(term) > 160:
                findings["term is a whole paragraph"].append((where, term[:70], definition[:70]))
            if term:
                seen_terms[norm(term)].append((where, definition))

    for key, entries in seen_terms.items():
        if len(entries) < 2:
            continue
        defs = {norm(d) for _, d in entries}
        bucket = "duplicate term, CONFLICTING definitions" if len(defs) > 1 else "duplicate term, same definition"
        findings[bucket].append((entries[0][0], key[:70], f"{len(entries)} copies"))

    print(f"{total} cards in {len(data.get('decks', []))} decks\n")
    if not findings:
        print("Nothing flagged.")
        return
    order = sorted(findings.items(), key=lambda kv: -len(kv[1]))
    for label, entries in order:
        print(f"## {label} — {len(entries)}")
        for where, term, definition in entries[:limit]:
            print(f"   {where}\n     term: {term}\n     def : {definition}")
        if len(entries) > limit:
            print(f"   … {len(entries) - limit} more")
        print()
    print("Conflicting duplicates are the priority: two cards teaching "
          "different answers to the same prompt actively train the wrong one.")


if __name__ == "__main__":
    main()
