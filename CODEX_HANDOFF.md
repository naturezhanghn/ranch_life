# CODEX_HANDOFF

## Goal

Keep `js/state.js` authoritative for economy, AI, saves, and scene progression while integrating four `game-space`-inspired activity loops into the existing Canvas maps. Move rendering, input, camera, and scene dispatch to Phaser incrementally without breaking the Canvas runtime.

## Phase

Development. The real Canvas scene base remains the default runtime; four minigame slices are being integrated through scene landmarks. Phaser 4.2.1 stays opt-in at `?phaser=1`.

## Current status

- Real Canvas scenes are live for farm, city, trade port, council, workshop, and island.
- City council and workshop have physical `SCENE_DEFS.city.portals` entrances.
- `vendor/dist/phaser.min.js` is pinned to Phaser `4.2.1`.
- `?phaser=1` starts the Phaser farm rendering/input/camera slice. Default URLs preserve the current Canvas runtime.
- `SCENE_NPCS` now drives eight scheduled residents across city, port, council, workshop, and island scenes.
- `assets/generated/world-landmark-sheet.png` was generated through the requested imagegen function for map visual direction.
- `state.js` remains the owner of economy, AI, saves, scene state, and day progression.
- `js/minigames.js` owns deterministic minigame rules (hunt, fishing, mining, delivery).
- `js/minigame-layer.js` owns the Canvas overlay, pointer/keyboard routing, and result handoff.
- New sites are scene interactions, not standalone menu pages: `island_patrol`, `island_fishing`, `quarry_vein`, and `port_delivery_run`.
- Old saves receive `minigames` defaults; active sessions are intentionally cleared on load.

## Important files

- `js/state.js` authoritative state and rules
- `js/game.js` existing loop, scene interactions, and migration bridge entry
- `js/renderer.js` current Canvas renderer
- `js/phaser-bridge.js` opt-in Phaser adapter
- `js/phaser-farm-scene.js` Phaser farm scene renderer/input/camera
- `js/minigames.js` deterministic four-game state machines
- `js/minigame-layer.js` reusable Canvas activity overlay
- `tests/minigames.test.js` pure minigame and settlement tests
- `assets/generated/world-landmark-sheet.png` generated environment reference sheet
- `vendor/dist/phaser.min.js` local Phaser runtime
- `tests/state.test.js` state regression suite

## Verification

- `npm run check`
- `npm test`
- Real Chromium smoke on desktop and 390×844 mobile for current Canvas scenes
- Phaser smoke still required after each adapter change, including farm movement, action, scene dispatch, save/reload, and portrait/landscape resize
- Node16 Playwright 1.38 audits run through `/tmp/ranch-browser-test/node_modules/playwright` against the existing 4174 server. Mobile controls, mobile scene flow, desktop scene flow, console errors, overflow, touch controls, city→council/workshop entrances, island on-site exploration, and trade port were verified.
- Regression coverage now includes sleep returning `world.scene` and player spawn to farm, policy `coinCost` deduction, retained/expired order behavior, and safe pointer capture handling.
- `npm test` now covers 25 state tests plus 7 minigame tests.

## Risks

- Phaser and Canvas must not both own movement or action input in the same runtime.
- Phaser mode is intentionally opt-in until farm parity is verified.
- Save compatibility remains tied to `state.js`, not Phaser scene objects.
- Minigame overlay and Phaser must never own world movement at the same time.
- The quarry is a scene entered from the city road; it is intentionally not a new top-level region tab.

## Next safest task

Finish the browser acceptance matrix for all four scene-triggered activity overlays on desktop and 390×844 touch, then merge the isolated `bailian/game-space` slice into the active worktree and run the combined suite. After that, continue Phaser parity.

## Last slice

- Added `MINIGAME_DEFS`, `tidefish`, and `ore` market resources.
- Added island patrol/fishing landmarks, the quarry scene and mining landmark, and the port delivery landmark.
- Added deterministic hunt/fishing/mining/delivery state machines and a reusable Canvas overlay.
- Added daily gating, energy costs, AI memory entries, result settlement, accepted-contract delivery logic, and save migration.
- Verified: `npm run check`; `npm test` (25 state + 7 minigame); desktop and 390×844 overlay smoke from `/tmp/ranch-browser-test/minigame-smoke.js`; completion settlement smoke from `minigame-completion-test.js`.
