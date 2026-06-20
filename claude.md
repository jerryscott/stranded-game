# STRANDED! — project briefing

A nostalgic early-'80s sci-fi dramedy, browser-based hex exploration game. Pure vanilla HTML/CSS/JS + inline SVG — no frameworks, no build dependencies currently. `index.html` is a single self-contained file (the legacy format, built iteratively as a Claude.ai Artifact before this migration).

## Current goal: split into multi-file source + a bundle script

`index.html` has outgrown single-file editing (~1,400 lines: markup, CSS, and one big `<script>`). Goal: split it into clean modules that map onto the section-comment headers already in the file, then add a small build script that concatenates everything back into one distributable HTML file for actual play (no React/TS/npm deps needed — a simple Node concat script or esbuild is plenty).

Proposed module split (mirrors existing `/* ===== SECTION: X ===== */` comments in the file):
- `data.js` — TUNING constants, TERRAIN, DIRS/KEYDIR/DORD/DWORD, item factories, SPECIAL hexes, BLOCKED edges, BUILDINGS config
- `world.js` — buildLattice, applyBlockedEdges, applyBuildingWalls, initWorld, rng
- `state.js` — freshState, the `S` global
- `helpers.js` — posKey, neighbor, edgeType, barrierKind, has, comp, log, clamp, effectTone
- `render-map.js` — all SVG/doodle/blob/barrier-drawing functions, renderMap
- `render-status.js` — renderVMeters, renderStatus
- `render-controls.js` — buildActions, renderControls, renderChoice, pickChoice, cancelMode
- `game-logic.js` — vitals, movement, raft/swim, items/manipulables, power trap
- `puzzles.js` — decoder ring, footlocker combo
- `intro.js` — cutscene SVG builder + playIntro/skipIntro/beginGame
- `boot.js` — refresh, boot, restart, final invocation

Note: function ordering currently relies on JS hoisting (functions get called before their declaration appears later in the file). When splitting into modules, either use ES module `import`/`export` explicitly, or keep load order correct in the bundle script — don't assume hoisting works the same across separate `<script>` tags.

## Known accepted limitations (do not "fix" without discussion)

- Puzzle answers (`CIPHER_SHIFT`, `LOCKER_CODE`, `PLAINTEXT`) are plaintext constants, readable via devtools. Accepted: any client-only obfuscation in a browser game is theater against a determined player. Documented, not a bug.
- Render functions build DOM via `innerHTML` template strings. Fine today because nothing player-typed reaches them. Revisit (escape input / switch to textContent) the moment any free-text input feature is added.

## Backlog — DO NOT implement without explicit request

- Additional status meters: nutrition, mental clarity/sanity, stamina, warmth, morale (each needs its own +/- criteria, like health/hydration already have)
- Multi-genre thematic mash-up (fantasy, romance, historical fiction, etc.)
- Visibility tied to terrain (towers/peaks → see further, spot distant boons/threats)
- Barrier *vision* properties separate from *passability* (e.g. see across a river you can't cross)
- One-way passages
- Raft can capsize / is one-use
- Carry-and-consume-later inventory for food/water (currently most food/water is consumed instantly on pickup)
- Larger/different grid layouts, map decorations
- Advanced schema: creatures (own data schema), NPCs, bosses, decision-altering events, lingering effects

## What's already built (don't re-derive from scratch — read the code)

- 5×5×5 hex grid (61 hexes), procedurally generated filler terrain + ~16 hand-placed special locations
- Fog of war: unvisited hexes aren't drawn at all; revealed hexes are irregular organic blobs (not clean hexagons) that merge seamlessly across open edges and retreat short of blocked edges
- Barrier types: `mountains`, `thicket`, `wall` (man-made, building-only), `water` (river/lake, rendered with mist, blocks sight not just movement)
- Buildings: a generic `BUILDINGS` config (hex set + explicit entrance list) auto-seals every other edge as a `wall` barrier — built for multiple future buildings with different entrance counts
- Raft side-quest (driftwood + vines + foam → cross water); swimming without a raft is an instant-death choice prompt, not silent
- Health + Hydration as vertical fill-bar meters; 4 more (Nutrition/Clarity/Stamina/Warmth) exist as greyed UI placeholders only — no mechanics yet (see Backlog)
- Doom clock as a turn-based timeout, rendered as a full-height vertical bar alongside the meters
- Two puzzles: Caesar-shift decoder ring (obelisk), 4-digit combo lock (footlocker, with a rock-smash alternate solution)
- A power-switch curiosity trap: safe choice vs. an instant-death "grab the red wire" choice
- Intro cutscene: hand-drawn SVG ship-crash animation → story panel with opening log text + key-diagram instructions → Begin button. Plays once per session, NOT replayed by `restart()`.
- `restart()` rebuilds the world deterministically (clears + regenerates `HEXES`/`COORD2ID`/barrier map from the seeded generator) rather than snapshotting — simpler, always pristine
- Full state shape declared upfront in `freshState()` — no ad-hoc property growth on `S`

## Process note

This project has an external code-review pass (nicknamed "Ada") that periodically reviews the code and flags issues (restart missing, item-tone logic, naming, spaghetti structure, etc.) — issues get triaged and most get fixed; a couple are deliberately accepted limitations (see above). If review feedback references code that doesn't match what's actually in the repo, treat that as a stale-file mismatch to flag, not a real regression — this has happened before.
