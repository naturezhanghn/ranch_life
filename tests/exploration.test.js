import assert from "node:assert/strict";
import {
  SCENE_DEFS,
  SCENE_NPCS,
  SCENE_SEASON_VARIANTS,
  SEASONS,
  TRADE_CONTRACTS,
  scheduledNpcPositions,
} from "../js/data.js";
import {
  advanceDay,
  collectSeasonalLandmark,
  collectForage,
  createInitialState,
  discoverSceneFind,
  fulfillTradeContract,
  generateTradeContracts,
  getSceneSeasonVariant,
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

test("birthday gifts double the relationship delta and record the day", () => {
  const state = createInitialState();
  state.season = "春";
  state.seasonDay = 12;
  state.day = 12;
  state.inventory.produce.turnip = 1;
  const civicBefore = state.government.civicPoints;
  const relationBefore = state.relations.npc.mayor || 8;
  const result = giveGift(state, "mayor", "turnip");
  assert.equal(result.ok, true);
  assert.equal(result.birthday, true);
  assert.equal(result.delta, 10);
  assert.equal(state.relations.npc.mayor, relationBefore + 10);
  assert.equal(state.town.birthdayGifts.mayor, 12);
  assert.equal(state.government.civicPoints, civicBefore + 1);
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

test("four seasonal routes expose one exclusive landmark and stay clear of portals", () => {
  const state = createInitialState();
  for (const season of SEASONS) {
    state.season = season;
    for (const sceneId of ["farm", "city", "port", "island", "council", "workshop", "quarry"]) {
      const variant = getSceneSeasonVariant(state, sceneId);
      assert.ok(variant, `${sceneId} should have a ${season} variant`);
      assert.ok(variant.label && variant.routeLabel && variant.landmark?.id);
      assert.ok(SCENE_SEASON_VARIANTS[sceneId][season].palette.length === 2);
      for (const blocker of variant.blockers || []) {
        assert.ok(blocker.w < 200 && blocker.h < 80, "seasonal blockers must stay small");
        for (const portal of SCENE_DEFS[sceneId].portals || []) {
          const inside =
            portal.x > blocker.x - 16
            && portal.x < blocker.x + blocker.w + 16
            && portal.y > blocker.y - 16
            && portal.y < blocker.y + blocker.h + 16;
          assert.equal(inside, false, `${sceneId} ${season} blocker must not cover a portal`);
        }
      }
    }
  }
});

test("seasonal landmark can be gathered once per day and records its own route", () => {
  const state = createInitialState();
  state.season = "夏";
  state.day = 3;
  state.seasonDay = 3;
  const before = state.energy;
  const first = collectSeasonalLandmark(state, "farm");
  assert.equal(first.ok, true);
  assert.equal(first.itemId, "summer_berry");
  assert.equal(state.energy, before - 1);
  assert.equal(state.inventory.resources.summer_berry, 1);
  assert.equal(state.seasonRoutes.claims[`夏:farm:${first.landmark.id}`], 3);
  assert.equal(state.collection.stats.forage.found, 1);
  assert.equal(collectSeasonalLandmark(state, "farm").ok, false);
  state.day = 4;
  assert.equal(collectSeasonalLandmark(state, "farm").ok, true);
  state.season = "秋";
  assert.equal(collectSeasonalLandmark(state, "farm").itemId, "autumn_mushroom");
});

test("scheduled NPCs interpolate between waypoints and never crowd a door", () => {
  const waypointNpcs = SCENE_NPCS.filter((npc) => npc.scenes.some((entry) => entry.path?.length === 2));
  assert.ok(waypointNpcs.length >= 4);
  for (const npc of waypointNpcs) {
    assert.equal(npc.scenes.length, 3);
    assert.ok(npc.scenes.every((entry) => entry.path?.length === 2));
  }
  const first = scheduledNpcPositions(6 * 60, "city").find((position) => position.npc.id === "mayor");
  const second = scheduledNpcPositions(6 * 60 + 5, "city").find((position) => position.npc.id === "mayor");
  const distance = Math.hypot(second.x - first.x, second.y - first.y);
  const speedRatio = distance / (5 * 0.22) / 154;
  assert.ok(speedRatio >= 0.35 && speedRatio <= 0.55, `mayor speed ratio ${speedRatio}`);

  for (let minutes = 6 * 60; minutes <= 22 * 60; minutes += 15) {
    for (const sceneId of Object.keys(SCENE_DEFS)) {
      const positions = scheduledNpcPositions(minutes, sceneId);
      for (const portal of SCENE_DEFS[sceneId].portals || []) {
        const near = positions.filter((position) => (
          Math.hypot(position.x - portal.x, position.y - portal.y) < 72
        ));
        assert.ok(near.length <= 1, `${sceneId} door ${portal.id} at ${minutes} has ${near.length} NPCs`);
      }
    }
  }
});

console.log(`\n${passed} exploration tests passed.`);
