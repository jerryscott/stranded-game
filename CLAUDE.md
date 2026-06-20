# STRANDED! — project briefing

Early-'80s sci-fi dramedy, browser-based hex exploration game. Pure vanilla HTML/CSS/JS + inline SVG — no frameworks, no build dependencies. `index.html` is a single self-contained file (~1200 lines, currently on Iteration 5).

## Stack & conventions

- **One file**: everything lives in `index.html` — `<style>`, HTML layout, `<script>`.
- **No build step**: open in browser directly. No npm, webpack, TypeScript, etc.
- **Vanilla JS, strict mode**: `"use strict"` at top of `<script>`.
- **SECTION comments** delimit major code blocks — use them to navigate:
  `TUNING`, `DATA`, `WORLD BUILD`, `STATE`, `HELPERS`, `RENDER — MAP`,
  `RENDER — STATUS`, `RENDER — CONTROLS`, `GAME LOGIC — vitals`,
  `GAME LOGIC — movement`, `GAME LOGIC — items & manipulables`,
  `GAME LOGIC — power-switch curiosity trap`, `PUZZLES — decoder ring`,
  `PUZZLES — combo lock`, `NAV-COMP hints + win condition + doom clock`,
  `INPUT`, `INTRO CUTSCENE`, `BOOT / RESTART`.
- **Color palette** (CSS vars on `:root`): `--neon-cyan`, `--neon-mag`, `--neon-lime`, `--neon-amber`, `--neon-purple`, `--text`, `--dim`, `--bg`, `--panel`, `--panel2`, `--line`.
- **Log CSS classes**: `.sys` (lime), `.nav` (cyan, prepends "◈ NAV-COMP:"), `.ev` (amber), `.bad` (red), `.good` (bold lime), `.you` (default text).

## Architecture

### World

- **61-hex grid** procedurally placed around a center origin; coords are `(c, y)` where `c` is column.
- `HEXES{}` — map of `id → hex object`. `COORD2ID{}` — `"c,y" → id`. `BMAP{}` — `"sortedKey|sortedKey" → edge type`.
- `rng(seed)` — deterministic hash-based PRNG used for world gen.
- `buildLattice()` deep-clones `SPECIAL` on every call → restart always gets pristine state.
- Hex `comps` array: `{t:"col", ...}` = collectible; `{t:"man", ...}` = manipulable. Flags: `taken` / `done`, `hidden` (hidden comps don't show on map or in action list until unlocked).
- Terrain types: `clearing`, `forest`, `dense`, `water`, `lake`, `ruin`, `indoor`.
- Barrier types (stored in `BMAP`): `river`, `mountains`, `thicket`, `wall` (building walls).

### State

```js
S = { cur, turn, mode, decoded, power, hasRaft,
      shift, combo, choice, warned, over,
      inv, health, hydration,
      _acts, _hpW, _hydW }
```

- `mode`: `"play"` | `"decode"` | `"combo"` | `"choice"`.
- `turn` drives the DOOM clock (limit: 150).
- `inv` — array of item objects `{id, name, kind, icon, ...}`.

### Key constants (TUNING section)

| Constant | Value | Purpose |
|---|---|---|
| `DOOM_LIMIT` | 150 | Turns until game over |
| `DOOM_WARN` | [0.5, 0.75, 0.9] | Warning thresholds |
| `CIPHER_SHIFT` | 7 | ROT-7 for obelisk puzzle |
| `LOCKER_CODE` | "42" | Footlocker combo (Hitchhiker's Guide ref) |
| `DEHYDRATION_DMG` | 10 | Hydration damage per tick |
| `REQUIRED` | coolant_cell, flux_coil, green_keycard | Win-condition parts |
| `RAFT_MAT` | driftwood, vines, floatfoam | Raft build materials |

### Special hexes (fixed positions)

| ID | Coord | Notes |
|---|---|---|
| `FURROW` | 0,0 | Start — sandwich item |
| `OBELISK` | 0,-1 | Cipher puzzle (ROT-7) |
| `TRANSPORT` | 0,-4 | Win condition — install 3 parts |
| `SPRING` | -1,-0.5 | Best water source + heavy rock tool |
| `BUILD_GEN` | 1,-1.5 | Breaker panel — green=safe, red=electrocution |
| `BUILD_BREAK` | 1,-2.5 | Vending machine (needs power) → green keycard |
| `HATCH` | 1,1.5 | Cargo hatch (needs heavy rock) → coolant cell + phaser |
| `STATION` | -2,1 | Ranger cabin + combo lock footlocker → flux coil |
| `LAKESHORE` | 2,1 | Driftwood (raft mat) |
| `LAKE` | 3,0.5 | Raft-only access — lake water item |
| `DRONE` | 4,1 | Survey drone log + ration cache |
| `VINE_THICKET` | -2,-1 | Vines (raft mat) |
| `HATCH` | 1,1.5 | Floatfoam (raft mat) |
| `HOLLOW` | -1,1.5 | Spore puzzle — edible fungus (-18 hp trap) |
| `SNAKEGRASS` | 2,-1 | Hollow log — snake bite trap (-22 hp) |
| `LEANTO` | -3,1.5 | Mystery beans + hermit/bigfoot polaroid |

### Win sequence

1. Decode obelisk (ROT-7, shift=7) → learn the three required parts.
2. Power on generator (BUILD_GEN, green breaker) → vending machine activates.
3. Override cargo hatch (use heavy rock from SPRING) → coolant cell.
4. Use powered vending machine (BUILD_BREAK) → green keycard.
5. Open footlocker (STATION, combo "42") → flux coil.
6. Build raft at shore (driftwood + vines + floatfoam) → lake access.
7. Arrive at TRANSPORT with all three parts → `attemptEscape()`.

## Layout (three columns)

- **Left** (`col-left`): hex field chart map SVG — `#map` div.
- **Middle** (`col-mid`): Status card (DOOM bar + 6 vital meters) + location/terrain badges card.
- **Right** (`col-right`): Transmission Log + Inventory + Controls (action buttons / overlays).

## Known issues / intentional decisions

- **Issue #3 (accepted)**: `CIPHER_SHIFT` and `LOCKER_CODE` are plaintext constants — readable in devtools. Client-only obfuscation is theater in a single-file browser game. Documented, not worth fixing.
- **Issue #4 (open)**: `renderControls()` and related functions use innerHTML template strings. Nothing player-typed flows into them today. If a free-text input is ever added, escape it then (or switch to textContent/DOM APIs). Don't fix pre-emptively.

## Planned / placeholder features

- Four greyed-out vital meters: `NUTRITION`, `CLARITY`, `STAMINA`, `WARMTH` — shown as "— (soon)" in the status grid. Not yet wired to game logic.
- Intro cutscene plays once on first load, not on `restart()`.

## Rendering pipeline

Every state change calls `refresh()` → `renderMap()` + `renderStatus()` + `renderControls()`.

- `renderMap()` builds the full SVG from scratch each call — blob-shaped hex polygons, terrain art, barrier bands, trail dashes, compass rose, player marker (animated pulse).
- `renderStatus()` updates location name/badges + calls `renderVMeters()` + updates DOOM bar.
- `renderControls()` routes to a mode-specific renderer: normal play → `buildActions()` list; decode → ring UI; combo → lock UI; choice → branching prompt.

## Adding new content (quick reference)

- **New special hex**: add an entry to `SPECIAL` keyed by `"c,y"`. Include `id`, `name`, `terrain`, `env`, `light`, `desc`, `comps[]`.
- **New collectible**: `{t:"col", id, name, kind, icon, consumable?, effects?, grab, hidden?, required?}`. `kind` drives CSS: `part`=lime, `mat`=amber, `tool`=blue.
- **New manipulable**: `{t:"man", id, name, icon, verb}`. Wire the handler in `doManipulable()`.
- **New barrier**: add to `BLOCKED` array as `{a:"c,y", b:"c,y", type}`.
- **New building**: add to `BUILDINGS` array `{hexes:[...ids], entrances:[{hex, dir}]}`. Wall sealing is automatic.
- **New vital meter**: flip `active:true` in `renderVMeters()` cells array and add state field to `freshState()`.
