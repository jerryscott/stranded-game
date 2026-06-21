# Iteration 7.1 — Requested Changes (rolled back from v0.6.5)

Recorded 2026-06-20 before rolling the repo back to **v0.6.5** (`432c2e8`).
The full implementation is preserved in commit `2d13d8e`, also tagged
**`v0.7.1-archive`**. Recover anytime with:

```sh
git checkout v0.7.1-archive          # inspect the 7.1 build
git show v0.7.1-archive:archive/stranded_v0_7_1.html > /tmp/v0.7.1.html
```

## What was requested for v0.7.1

1. **Building sub-maps**
   - Replace the separate `BUILD_GEN` + `BUILD_BREAK` overworld hexes with a
     single `GENBUILDING` overworld hex.
   - Its interior is a 2-room sub-map (`GEN_ROOM` + `GEN_BREAK`), powered by a
     new sub-map context system: `S.submap` / `activeHexes` / `activeC2I` /
     `activeBmap`.
   - `enterBuilding()` / `exitBuilding()` added in `game-movement`.
   - `BLDG` runtime state reset by `initBuildings()` on every world init.

2. **Map layout changes**
   - Lake moved to col 2 (coord `2,0`).
   - `DRONE` moved to the old lake position.

3. **Ship Repair Manual**
   - Floats in the lake; now **required before launch**.
   - Nav-Comp hints and `attemptEscape()` gated on `repair_manual`.

4. **Raft material swap**
   - **Dopehtesu Pods** replace **Floatfoam** as the 3rd raft material.
   - Obelisk plaintext updated to *hint* at the pod, not list the parts.

5. **Bug fixes carried in 7.1**
   - All stale `BUILD_GEN` / `BUILD_BREAK` `comp()` refs fixed to
     `GEN_ROOM` / `GEN_BREAK`.

## Why rolled back

The 7.1 updates "didn't work" (per the user). Rolling back to v0.6.5 to
re-approach these features cleanly. Use this list as the spec for a retry.
