import assert from "node:assert/strict";
import { TRADE_CONTRACTS } from "../js/data.js";
import {
  advanceDay,
  collectForage,
  createInitialState,
  discoverSceneFind,
  fulfillTradeContract,
  generateTradeContracts,
  getNpcTopic,
  giveGift,
  resolveNpcTopic,
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

test("rain creates visible forage nodes and each node can only be claimed once", () => {
  const state = createInitialState();
  state.season = "春";
  state.seasonDay = 2;
  state.day = 2;
  state.weather = "rain";
  advanceDay(state);
  assert.ok(state.forage.nodes.length >= 1);
  const node = state.forage.nodes[0];
  state.world.scene = node.scene;
  const before = state.energy;
  const first = collectForage(state, node.id);
  assert.equal(first.ok, true);
  assert.equal(state.energy, before - 1);
  assert.equal(state.inventory.resources[node.itemId], 1);
  assert.equal(collectForage(state, node.id).ok, false);
});

test("scene finds persist, pay once, and complete a scene collection", () => {
  const state = createInitialState();
  const first = discoverSceneFind(state, "farm", "old_gate");
  assert.equal(first.ok, true);
  assert.equal(state.world.sceneFinds.farm.old_gate, true);
  assert.equal(discoverSceneFind(state, "farm", "old_gate").ok, false);
  const second = discoverSceneFind(state, "farm", "field_stone");
  assert.equal(second.completedScene, true);
  assert.equal(state.world.sceneFindRewards.farm, true);
});

test("npc daily topic changes relationship once and can resume next day", () => {
  const state = createInitialState();
  const topic = getNpcTopic(state, "mayor");
  assert.ok(topic);
  const result = resolveNpcTopic(state, "mayor", "common");
  assert.equal(result.ok, true);
  assert.ok(state.relations.npc.mayor > 8);
  assert.equal(getNpcTopic(state, "mayor"), null);
  assert.equal(resolveNpcTopic(state, "mayor", "common").ok, false);
  state.day += 1;
  assert.ok(getNpcTopic(state, "mayor"));
});

test("gift preferences consume inventory once and return a themed thank-you", () => {
  const state = createInitialState();
  state.inventory.produce.turnip = 1;
  const result = giveGift(state, "mayor", "turnip");
  assert.equal(result.ok, true);
  assert.equal(result.favorite, true);
  assert.equal(state.inventory.produce.turnip, 0);
  assert.equal(state.social.giftDay.mayor, 1);
  assert.ok(state.relations.npc.mayor > 8);
  assert.equal(giveGift(state, "mayor", "turnip").ok, false);
});

test("three consecutive contract deliveries raise the market tier without double paying", () => {
  const state = createInitialState();
  state.inventory.produce.egg = 3;
  for (let index = 0; index < 3; index += 1) {
    const contract = {
      id: `chain-${index}`,
      title: `连锁订单 ${index + 1}`,
      rewards: 100,
      reward: 100,
      reputation: 2,
      requirements: { egg: 1 },
      accepted: true,
      completed: false,
      expiresDay: state.day + 1,
    };
    state.market.contracts = [contract];
    assert.equal(fulfillTradeContract(state, contract.id).ok, true);
  }
  assert.equal(state.market.tier, 1);
  assert.equal(state.market.contractStreak, 0);
  const generated = generateTradeContracts(state)[0];
  const baseContract = TRADE_CONTRACTS.find((entry) => entry.id === generated.id);
  assert.ok(generated.reward > baseContract.reward);
});

test("discoveries feed the shared collection book exactly once", () => {
  const state = createInitialState();
  state.season = "春";
  state.day = 2;
  state.seasonDay = 2;
  state.weather = "rain";
  advanceDay(state);
  state.world.scene = state.forage.nodes[0].scene;
  collectForage(state, state.forage.nodes[0].id);
  discoverSceneFind(state, "farm", "old_gate");
  resolveNpcTopic(state, "mayor", "common");
  assert.equal(state.collection.entries.length, 3);
  assert.equal(state.collection.stats.forage.found, 1);
  assert.equal(state.collection.stats.places.found, 1);
  assert.equal(state.collection.stats.people.found, 1);
  const before = state.collection.entries.length;
  discoverSceneFind(state, "farm", "old_gate");
  assert.equal(state.collection.entries.length, before);
});

console.log(`\n${passed} exploration tests passed.`);
