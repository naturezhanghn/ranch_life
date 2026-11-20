import assert from "node:assert/strict";
import { createRng, DeliveryGame, FishingGame, HuntGame, MiningGame } from "../js/minigames.js";
import {
  beginMinigame,
  createInitialState,
  getMinigameAvailability,
  resolveMinigame,
} from "../js/state.js";

let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("hunt registers a hit on the aimed bird and finishes with a score", () => {
  const game = new HuntGame(createRng(11));
  game.spawnBird();
  const bird = game.birds[0];
  game.action(bird.x, bird.y);
  assert.equal(game.hits, 1);
  assert.ok(game.score > 0);
  game.update(30);
  assert.equal(game.finished, true);
  assert.equal(game.result.hits, 1);
});

test("hunt marks a rare bird and reports it in the result", () => {
  const game = new HuntGame(createRng(15));
  game.spawnBird();
  game.birds[0].rare = true;
  const bird = game.birds[0];
  game.action(bird.x, bird.y);
  assert.equal(game.hits, 1);
  assert.equal(game.rareHits, 1);
  game.timeout();
  assert.equal(game.result.rareHits, 1);
  assert.ok(game.score >= 36);
});

test("fishing rewards perfect timing only when the marker is in the green zone", () => {
  const game = new FishingGame(createRng(12));
  game.phase = "bite";
  game.marker = 0.5;
  game.zone = 0.4;
  game.action();
  assert.equal(game.catches, 1);
  assert.equal(game.perfects, 1);
  assert.equal(game.phase, "pause");
});

test("mining hook returns an ore haul and records a collapse risk", () => {
  const game = new MiningGame(createRng(13));
  game.angle = Math.atan2(-70, 205);
  game.action();
  game.update(2.3);
  assert.ok(game.haulUnits >= 0);
  game.timeout();
  assert.equal(game.finished, true);
  assert.ok(Object.prototype.hasOwnProperty.call(game.result, "collapsed"));
});

test("delivery run arrives when the cart reaches the port", () => {
  const game = new DeliveryGame(createRng(14));
  game.obstacles = [];
  game.update(20);
  assert.equal(game.finished, true);
  assert.equal(game.result.arrived, true);
  assert.equal(game.result.distance, 100);
});

test("island minigames consume energy once per day and return resources", () => {
  const state = createInitialState();
  state.world.unlockedRegions.push("island");
  const availability = getMinigameAvailability(state, "fishing");
  assert.equal(availability.ok, true);
  const started = beginMinigame(state, "fishing");
  assert.equal(started.ok, true);
  assert.equal(state.energy, 97);
  const resolved = resolveMinigame(state, "fishing", { catches: 2, perfects: 1, score: 52 });
  assert.equal(resolved.ok, true);
  assert.equal(state.inventory.resources.tidefish, 3);
  assert.equal(getMinigameAvailability(state, "fishing").ok, false);
});

test("mining deposits ore into the shared inventory", () => {
  const state = createInitialState();
  state.world.visitedScenes.push("city");
  assert.equal(beginMinigame(state, "mining").ok, true);
  const resolved = resolveMinigame(state, "mining", { haulUnits: 3, collapsed: true, score: 21 });
  assert.equal(resolved.ok, true);
  assert.equal(state.inventory.resources.ore, 3);
  assert.equal(state.stats.oreMined, 3);
});

test("delivery uses an accepted, fully stocked contract and pays its reward", () => {
  const state = createInitialState();
  state.daily.tasks = [];
  state.market.contracts = [
    {
      id: "harbor-breakfast",
      title: "港口早餐会",
      requirements: { egg: 1 },
      reward: 196,
      reputation: 4,
      accepted: true,
      completed: false,
    },
  ];
  state.inventory.produce.egg = 1;
  const availability = getMinigameAvailability(state, "delivery");
  assert.equal(availability.ok, true);
  assert.equal(beginMinigame(state, "delivery").ok, true);
  const before = state.coins;
  const resolved = resolveMinigame(state, "delivery", { arrived: true, collisions: 0, score: 100 });
  assert.equal(resolved.ok, true);
  assert.equal(state.market.contracts[0].completed, true);
  assert.equal(state.coins, before + 226);
});

test("hunt caps rare capture once per day and adds a failure stamina penalty", () => {
  const state = createInitialState();
  state.world.unlockedRegions.push("island");
  state.world.scene = "island";
  state.season = "冬";
  assert.equal(beginMinigame(state, "hunt").ok, true);
  const first = resolveMinigame(state, "hunt", { hits: 1, misses: 0, rareHits: 1, score: 50 });
  assert.equal(first.ok, true);
  assert.equal(first.rareHits, 1);
  assert.equal(first.rareValue, 127);
  assert.ok(first.rareValue <= 130);
  assert.equal(state.inventory.resources.pearl, 1);
  assert.equal(state.island.rareHuntDay, 1);

  state.minigames.active = { type: "hunt", day: 1, contractId: null };
  const sameDay = resolveMinigame(state, "hunt", { hits: 1, misses: 0, rareHits: 1, score: 40 });
  assert.equal(sameDay.rareHits, 0);
  assert.equal(state.inventory.resources.pearl, 1);

  state.day = 2;
  assert.equal(beginMinigame(state, "hunt").ok, true);
  const nextDay = resolveMinigame(state, "hunt", { hits: 1, misses: 0, rareHits: 1, score: 40 });
  assert.equal(nextDay.rareHits, 1);
  assert.equal(state.inventory.resources.pearl, 2);

  state.day = 3;
  assert.equal(beginMinigame(state, "hunt").ok, true);
  const energyBefore = state.energy;
  const failed = resolveMinigame(state, "hunt", { hits: 0, misses: 5, rareHits: 0, score: 0 });
  assert.equal(failed.ok, true);
  assert.equal(failed.failPenalty, 3);
  assert.equal(state.energy, energyBefore - 3);
});

console.log(`\n${passed} minigame tests passed.`);
