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
- Gameplay card 02 is now implemented in the existing loop. Rain-after nodes use stable scene-specific Canvas landmarks, `weatherDay`, `expiresDay`, `expiresMinute`, `claimed`, `claimedNodeIds`, and `combo`. Nodes can appear at the farm or city entrance, cost one energy, feed the daily forage counter, expire with risk feedback, and migrate legacy `available/collected` saves without creating a new-day reward.
- Task 02 follow-up review fixed the remaining boundaries. Collection advances the clock by eight minutes and ecology by one point, the morning report shows collected-only days, non-rain seasonal expiry uses seasonal wording, and old nodes with `expiresDay: 0` recover only when `lastRefreshDay` matches the current day.
- Ambient audio now uses a slower, lower-volume generated melody per scene. Farm, city, port, council, workshop, and island switch motifs when `travelToScene` or sleep changes the active scene.
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
- Gameplay card 08 is implemented: every scene has four season variants with their own palette, route label, exclusive landmark, and small optional blockers. Seasonal landmarks grant the season's forage item once per day, advance six minutes, add ecology, and enter the collection book. The farm legacy renderer and the non-farm scene renderer both draw the seasonal route, landmark, blocker, and particles.
- Gameplay card 09 is implemented: after sleep, the morning report shows three facts and two explanations. `resolveDailyRecap` pays either AI trust +2 or civic point +1 and community +1, exactly once. The pause menu exposes an unresolved recap so closing the morning card does not silently lose the choice; an unopened recap is marked as a deliberate blank at the next day boundary.
- Gameplay card 10 is implemented: after the ending, three post-game modifier cards start a seven-day constrained epilogue without rewriting the first-week ending. Public Ledger cuts order payout by 20% and tracks public recaps; Hand Care disables sprite automation and tracks all-fed days; Dry Season caps water at 12 and tracks seven days of community trust. Completion/failure unlocks a short epilogue reachable from the ending or pause menu.
- Gameplay card 24 is implemented: mayor, merchant, sprite keeper, and farmer Luo each have three time slots with two waypoints. Positions interpolate at 39–46% of player speed with a ping-pong path, and one shared resolver enforces at most one NPC within 72px of any scene portal. Renderer, interaction radius, and collision all use the same resolver.
- Gameplay card 26 is implemented: all touch controls share one `pointerdown/up/cancel/leave` state machine with pointer capture, multi-touch direction sets, a 180ms action dedupe, and a blur reset. Direction buttons are now 44px with 6px gaps; controls respect safe-area insets and report orientation/safe-area state for diagnostics.
- The branch is synchronized with `main` at `f09b381`. The merge keeps main's `FORAGE_NODE_DEFS`/`expiresMinute` implementation, legacy-node recovery, 8-minute collection time cost, and ecology gain, while retaining the shared collection hook.

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
- `npm test` now covers 30 state tests plus 7 minigame tests plus 6 exploration/social tests, including day-report,牧心 settlement, rain-node expiry, legacy-node recovery, one-time collection, separate node identity, gift preferences, contract chains, scene finds, NPC topics, collection rewards, and energy-boundary feedback.
- Task 02 browser smoke passed on desktop and 390×844 mobile. Farm and city forage nodes were visible and collectible with the action key, with no console errors.
- Isolated review of bailian commit `fc1f256` passed its 26 state, 7 minigame, 3 exploration, and syntax checks. It was not merged because its forage state contract overlaps the current `80863fa` implementation. Review feedback was sent for task 24 waypoint interpolation and 72px entrance safety, task 26 unified pointer state, and task 27 feedback deduplication and mobile text sizing.
- Merged `main` verification: 25 state tests + 7 minigame tests pass; desktop and 390×844 real scene-triggered overlay paths pass with no console errors.
- Minigame completion settlement was exercised in Chromium: hunt reward, ecology update, active-session cleanup, and overlay close all passed.
- Live deployment check: `js/minigames.js` is served from Pages, and desktop/mobile overlay plus settlement smoke tests pass with no console errors.
- Exploration smoke on desktop and 390×844: scene find discovery, rainy forage claim, NPC daily topic choice, gift panel consumption, save-state changes, and touch input all pass with no console errors or horizontal overflow.
- 844×390 landscape smoke: touch movement, workshop collection book, 77px action control, and 18 visible entries pass with no console errors or horizontal overflow.

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

- Synchronized the isolated branch with `main` at `f09b381`; the state merge retains both the hardened forage migration and the shared collection book.
- Final combined verification before card 08: `npm run check`; `npm test` (30 state + 7 minigame + 6 exploration); desktop and 390×844 exploration smoke; 844×390 landscape smoke. No console errors or horizontal overflow.
- Card 08 verification: `npm test` (30 state + 7 minigame + 8 exploration); four-season desktop smoke confirmed distinct palettes, correct landmark hints, one exclusive resource per season, and no overflow; 390×844 touch gathering and `?phaser=1` farm movement/action passed with no console errors.
- Card 09 verification: `npm test` (32 state + 7 minigame + 8 exploration); auto-sleep desktop smoke showed 2 options and 3 facts, paid AI +2 once, then verified the public path from the pause-menu recap; 390×844 tap smoke showed stacked 86px options, public +1 civic point, no overflow, and no console errors.
- Card 10 verification: `npm test` (35 state + 7 minigame + 8 exploration); ending smoke showed 3 modifier cards, preserved `common` ending, selected Public Ledger, and displayed progress in the pause menu; 390×844 tap smoke selected Hand Care with 129px cards and no overflow; `?phaser=1` remains unaffected.
- Card 24 verification: `npm test` (35 state + 7 minigame + 9 exploration); the mayor moved 74.5px over five game minutes, waypoint NPCs stayed out of blockers, and sampled doors never held more than one NPC. Desktop and 390×844 dialogue smoke reached the moving mayor with no console errors or overflow.
- Card 26 verification: `npm test` (35 state + 7 minigame + 9 exploration); 390×844 multi-touch diagonal movement, one-finger release, cancel, blur, and 180ms action dedupe passed. Direction hot zones measured ~44px with a 6px gap; 844×390 orientation switched to `landscape` with no horizontal overflow or console errors.
- This branch remains isolated until review and explicit merge approval.

## Latest social/economy slice

- Implemented cards 05 gift preferences and 06 contract tiers/streak.
- Added `GIFT_TAGS`, `GIFT_PREFERENCES`, `MARKET_TIERS`, `social.giftDay`, `social.giftHistory`, `social.giftLog`, and market chain state with old-save defaults.
- Verified: `npm run check`; `npm test` (29 state + 7 minigame + 6 exploration); desktop/390×844 exploration smoke including a 46px mobile gift action row, no console errors.

## Latest collection slice

- Implemented card 07: shared collection entries/stats/first-seen days, silhouettes for unknowns, category completion rewards, and a workshop-garden/pause-menu local-history screen.
- Verified: `npm run check`; `npm test` (29 state + 7 minigame + 6 exploration); desktop/mobile smoke passed for the new collection screen before merge.
