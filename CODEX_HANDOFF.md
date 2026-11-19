# CODEX_HANDOFF

## Goal

Keep `js/state.js` authoritative for economy, AI, saves, and scene progression while integrating four `game-space`-inspired activity loops into the existing Canvas maps. Move rendering, input, camera, and scene dispatch to Phaser incrementally without breaking the Canvas runtime.

## Phase

Development. The real Canvas scene base remains the default runtime; four minigame slices are integrated through scene landmarks and the `bailian/game-space` slice has been merged into `main`. Phaser 4.2.1 stays opt-in at `?phaser=1`.

## Current status

- Real Canvas scenes are live for farm, city, trade port, council, workshop, and island.
- City council and workshop have physical `SCENE_DEFS.city.portals` entrances.
- `vendor/dist/phaser.min.js` is pinned to Phaser `4.2.1`.
- `?phaser=1` starts the Phaser farm rendering/input/camera slice. Default URLs preserve the current Canvas runtime.
- `SCENE_NPCS` now drives eight scheduled residents across city, port, council, workshop, and island scenes.
- `assets/generated/world-landmark-sheet.png` and `assets/generated/gameplay-elements-sheet.png` were generated through the requested imagegen function for map and activity visual direction. `assets/manifest.json` records both assets with programmatic fallbacks.
- `GAMEPLAY_30_PLAN.md` contains 30 numbered gameplay design cards with state fields, spatial rules, rewards, failure recovery, day-end and牧心 effects, and desktop/390×844 acceptance checks. The cards were individually queued to both existing `codex` and `bailian` tmux sessions.
- Gameplay card 01 is now implemented in the existing loop. Daily tasks are weighted by season and current scene, enforce distinct categories, pay idempotently, and report completed or incomplete items in the morning summary. The settlement is also written to牧心 memory.
- `state.js` remains the owner of economy, AI, saves, scene state, and day progression.
- `js/minigames.js` owns deterministic minigame rules (hunt, fishing, mining, delivery).
- `js/minigame-layer.js` owns the Canvas overlay, pointer/keyboard routing, and result handoff.
- New sites are scene interactions, not standalone menu pages: `island_patrol`, `island_fishing`, `quarry_vein`, and `port_delivery_run`.
- Old saves receive `minigames` defaults; active sessions are intentionally cleared on load.
- The game-space slice is merged into `main`; its branch remains available for audit.
- Deployment source commit: `e94ff22` on `main`; live URL: `https://naturezhanghn.github.io/ranch_life/`.
- Gameplay cards 02–04 are implemented on the isolated `bailian/game-space` branch: rain-window forage nodes, scene find clues, and NPC daily topic choices.
- Rainy-day forage nodes now spawn across farm/city/port layouts with one-time claims, energy/time cost, a three-node combo bonus, shared inventory, and day-end reset.
- Scene finds are hidden landmarks in every scene; investigating them advances time, adds lore memory, grants coins, and completing a scene unlocks a civic point plus AI trust.
- NPCs have one daily contextual topic. Choosing a response updates `relations.npc`, community/ecology where relevant, and `social.topicDay`; repeat conversations are blocked for the day.
- Gameplay card 05 is implemented: gift tags and NPC preferences are data-driven; gifts consume inventory once per NPC/day, change `relations.npc`, return a seed/civic thank-you, and build a bounded gift history/log.
- Gameplay card 06 is implemented: three consecutive contract deliveries raise `market.tier`, raise future contract rewards, preserve the one-night expiry behavior, and reset the streak on expiry.
- Gameplay card 07 is implemented: scene finds, forage, and NPC topics append to one shared collection book; unknown entries render as silhouettes, category completion grants civic points/AI trust, and the book is reachable from the workshop garden or pause menu.

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
- `npm test` now covers 26 state tests plus 7 minigame tests plus 6 exploration/social tests, including day-report and牧心 settlement feedback.
- Merged `main` verification: 25 state tests + 7 minigame tests pass; desktop and 390×844 real scene-triggered overlay paths pass with no console errors.
- Minigame completion settlement was exercised in Chromium: hunt reward, ecology update, active-session cleanup, and overlay close all passed.
- Live deployment check: `js/minigames.js` is served from Pages, and desktop/mobile overlay plus settlement smoke tests pass with no console errors.
- Exploration smoke on desktop and 390×844: scene find discovery, rainy forage claim, NPC daily topic choice, gift panel consumption, save-state changes, and touch input all pass with no console errors or horizontal overflow.

## Risks

- Phaser and Canvas must not both own movement or action input in the same runtime.
- Phaser mode is intentionally opt-in until farm parity is verified.
- Save compatibility remains tied to `state.js`, not Phaser scene objects.
- Minigame overlay and Phaser must never own world movement at the same time.
- The quarry is a scene entered from the city road; it is intentionally not a new top-level region tab.
- The 30-card queue is asynchronous. Its remaining slices must be reviewed one at a time before merging, because both tmux agents share the project filesystem.

## Next safest task

Review the next queued gameplay card (08: seasonal routes) against the merged main, then add one isolated branch slice and browser acceptance test before merging.

## Last slice

- Added `MINIGAME_DEFS`, `tidefish`, and `ore` market resources.
- Added island patrol/fishing landmarks, the quarry scene and mining landmark, and the port delivery landmark.
- Added deterministic hunt/fishing/mining/delivery state machines and a reusable Canvas overlay.
- Added daily gating, energy costs, AI memory entries, result settlement, accepted-contract delivery logic, and save migration.
- Verified: `npm run check`; `npm test` (25 state + 7 minigame); scene-triggered desktop/mobile path from `scene-minigame-path.js`; overlay smoke from `minigame-smoke.js`; completion settlement smoke from `minigame-completion-test.js`; `npm run story-paths` still reports all five endings reachable.

## Latest slice

- Implemented cards 02 rain forage window, 03 scene find collection, and 04 NPC daily topics.
- Added `FORAGE_NODE_LAYOUT`, `SCENE_FINDS`, `NPC_TOPICS`, `social.topicDay`, `relations.npc`, and scene find state with old-save defaults.
- Verified: `npm run check`; `npm test` (26 state + 7 minigame + 3 exploration); `exploration-smoke.js` on desktop and 390×844, no console errors or horizontal overflow.
- Not yet merged or pushed; this branch remains isolated per the parallel-task instruction.

## Latest social/economy slice

- Implemented cards 05 gift preferences and 06 contract tiers/streak.
- Added `GIFT_TAGS`, `GIFT_PREFERENCES`, `MARKET_TIERS`, `social.giftDay`, `social.giftHistory`, `social.giftLog`, and market chain state with old-save defaults.
- Verified: `npm run check`; `npm test` (26 state + 7 minigame + 5 exploration); desktop/390×844 exploration smoke including a 46px mobile gift action row, no console errors.

## Latest collection slice

- Implemented card 07: shared collection entries/stats/first-seen days, silhouettes for unknowns, category completion rewards, and a workshop-garden/pause-menu local-history screen.
- Verified: `npm run check`; `npm test` (26 state + 7 minigame + 6 exploration); desktop/mobile smoke remains to be rerun for the new collection screen before merge.
