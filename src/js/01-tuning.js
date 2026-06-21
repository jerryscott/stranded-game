/* ==========================================================
   SECTION: TUNING
   ========================================================== */
const DOOM_LIMIT = 150, DOOM_WARN = [0.5, 0.75, 0.9];
// Issue #3 (accepted, not fixed): these are plaintext constants, readable
// via devtools/view-source. Any client-only obfuscation here is theater
// against a determined player — not worth the complexity in a single-file
// browser game. Documented limitation.
const CIPHER_SHIFT = 7, LOCKER_CODE = "42";
const DEHYDRATION_DMG = 10, LOW_WARN = 25;
const REQUIRED = ["coolant_cell", "flux_coil", "green_keycard"];
const RAFT_MAT = ["driftwood", "vines", "dopehtesu"];
const DEBUG_MODES_ENABLED = true;  // master toggle for the "/d" no-death start command. Set false in release builds to disable it.
