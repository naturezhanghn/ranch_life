# CODEX_HANDOFF

## Goal

Move rendering, input, camera, and scene dispatch to Phaser incrementally while keeping `js/state.js` authoritative for economy, AI, saves, and existing tests.

## Phase

Development, Phaser migration slice. The real Canvas scene base is complete and remains the default runtime path. Phaser 4.2.1 is locally vendored for an opt-in farm slice.

## Current status

- Real Canvas scenes are live for farm, city, trade port, council, workshop, and island.
- City council and workshop have physical `SCENE_DEFS.city.portals` entrances.
- `vendor/dist/phaser.min.js` is pinned to Phaser `4.2.1`.
- `?phaser=1` starts the Phaser farm rendering/input/camera slice. Default URLs preserve the current Canvas runtime.
- `SCENE_NPCS` now drives eight scheduled residents across city, port, council, workshop, and island scenes.
- `assets/generated/world-landmark-sheet.png` was generated through the requested imagegen function for map visual direction.
- `state.js` remains the owner of economy, AI, saves, scene state, and day progression.

## Important files

- `js/state.js` authoritative state and rules
- `js/game.js` existing loop, scene interactions, and migration bridge entry
- `js/renderer.js` current Canvas renderer
- `js/phaser-bridge.js` opt-in Phaser adapter
- `js/phaser-farm-scene.js` Phaser farm scene renderer/input/camera
- `assets/generated/world-landmark-sheet.png` generated environment reference sheet
- `vendor/dist/phaser.min.js` local Phaser runtime
- `tests/state.test.js` state regression suite

## Verification

- `npm run check`
- `npm test`
- Real Chromium smoke on desktop and 390×844 mobile for current Canvas scenes
- Phaser smoke still required after each adapter change, including farm movement, action, scene dispatch, save/reload, and portrait/landscape resize

## Risks

- Phaser and Canvas must not both own movement or action input in the same runtime.
- Phaser mode is intentionally opt-in until farm parity is verified.
- Save compatibility remains tied to `state.js`, not Phaser scene objects.

## Next safest task

Run the opt-in Phaser farm slice in Chromium, verify movement/action/camera and reload, then add one scene-dispatch test before migrating city/port/council/workshop/island visuals.
