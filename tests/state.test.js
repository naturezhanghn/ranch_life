import assert from "node:assert/strict";
import { CROPS, TRADE_CONTRACTS, WORLD } from "../js/data.js";
import {
  advanceDay,
  applyDevelopmentChoice,
  applyDroughtChoice,
  applyGovernanceChoice,
  acceptTradeContract,
  assignSprite,
  brushAnimal,
  createInitialState,
  enactGovernmentPolicy,
  exploreIsland,
  fulfillTradeContract,
  feedAnimal,
  getClueCount,
  getTargetPlot,
  getBagUsage,
  investInCity,
  recruitSprite,
  recordClue,
  resolveEnding,
  sellAtMarket,
  shipProduce,
  settleShipping,
  switchScene,
  switchRegion,
  talkAnimal,
  toggleAnimalOutdoor,
  tickAnimalOutdoor,
  upgradeBackpack,
  upgradeTool,
  useToolOnPlot,
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

function freshState() {
  const state = createInitialState();
  state.rngState = 123456789;
  state.daily.tasks = [];
  return state;
}

function standAtPlot(state, col, row) {
  state.player.x = WORLD.field.x + col * WORLD.field.tile + WORLD.field.tile / 2;
  state.player.y = WORLD.field.y + row * WORLD.field.tile - 20;
  state.player.facing = "down";
}

function establishClues(state) {
  state.story.chapter = 2;
  state.story.step = "investigate";
  recordClue(state, "elder");
  recordClue(state, "archive");
  recordClue(state, "canal");
}

test("initial state has the vertical-slice scope", () => {
  const state = freshState();
  assert.equal(state.plots.length, 21);
  assert.equal(state.animals.length, 3);
  assert.deepEqual(
    state.animals.map((animal) => animal.id),
    ["chicken", "sheep", "cow"],
  );
  assert.equal(state.coins, 140);
  assert.equal(state.feed, 6);
  assert.equal(state.story.step, "meetSister");
});

test("target plot follows the player's facing direction", () => {
  const state = freshState();
  standAtPlot(state, 2, 1);
  const plot = getTargetPlot(state);
  assert.ok(plot);
  assert.equal(plot.col, 2);
  assert.equal(plot.row, 1);
});

test("hoe, seed, and watering form a complete farm action cycle", () => {
  const state = freshState();
  standAtPlot(state, 0, 0);
  const tilled = useToolOnPlot(state, "hoe");
  assert.equal(tilled.ok, true);
  const plot = getTargetPlot(state);
  assert.equal(plot.state, "tilled");

  const planted = useToolOnPlot(state, "seed");
  assert.equal(planted.ok, true);
  assert.equal(plot.crop, "turnip");
  assert.equal(state.inventory.seeds.turnip, 4);

  const watered = useToolOnPlot(state, "water");
  assert.equal(watered.ok, true);
  assert.equal(plot.watered, true);
  assert.equal(state.water, 23);
  assert.equal(state.energy, 93);
});

test("watered crops and fed animals produce outcomes overnight", () => {
  const state = freshState();
  standAtPlot(state, 0, 0);
  useToolOnPlot(state, "hoe");
  useToolOnPlot(state, "seed");
  useToolOnPlot(state, "water");
  const fed = feedAnimal(state, "chicken");
  assert.equal(fed.ok, true);

  const report = advanceDay(state);
  assert.equal(report.grown, 1);
  assert.equal(state.plots[0].growth, 1);
  assert.equal(state.inventory.produce.egg, 1);
  assert.equal(state.feed, 5);
  assert.equal(state.animals[0].fed, false);
  assert.equal(state.day, 2);
  assert.equal(state.minutes, 360);
  assert.equal(state.energy, state.maxEnergy);
});

test("feeding all three animals advances chapter-one objective", () => {
  const state = freshState();
  state.story.step = "feedAnimals";
  assert.equal(feedAnimal(state, "chicken").ok, true);
  assert.equal(feedAnimal(state, "sheep").ok, true);
  assert.equal(feedAnimal(state, "cow").ok, true);
  assert.equal(state.story.step, "plantSeeds");
});

test("planting three story seeds advances to first night", () => {
  const state = freshState();
  state.story.step = "plantSeeds";
  for (let index = 0; index < 3; index += 1) {
    standAtPlot(state, index, 0);
    useToolOnPlot(state, "hoe");
    useToolOnPlot(state, "seed");
  }
  assert.equal(state.story.plantedForStory, 3);
  assert.equal(state.story.step, "firstNight");
});

test("three historical clues unlock the canal council", () => {
  const state = freshState();
  establishClues(state);
  assert.equal(getClueCount(state), 3);
  assert.equal(state.story.step, "waterMeeting");
  assert.equal(state.ai.evidenceQuality, 3);
});

test("daily task rewards are paid once", () => {
  const state = freshState();
  state.daily.tasks = [
    {
      id: "test-water",
      text: "浇一块地",
      counter: "watered",
      target: 1,
      reward: 25,
      done: false,
    },
  ];
  standAtPlot(state, 0, 0);
  useToolOnPlot(state, "hoe");
  useToolOnPlot(state, "seed");
  const result = useToolOnPlot(state, "water");
  assert.equal(result.tasks.length, 1);
  assert.equal(state.coins, 165);
  assert.equal(state.daily.tasks[0].done, true);
  useToolOnPlot(state, "water");
  assert.equal(state.coins, 165);
});

test("cooperative, oversight, complete evidence yields common-ground ending", () => {
  const state = freshState();
  establishClues(state);
  applyDroughtChoice(state, "share");
  applyDevelopmentChoice(state, "coop");
  applyGovernanceChoice(state, "oversight");
  assert.ok(state.relations.community >= 60);
  assert.equal(resolveEnding(state), "common");
});

test("AI autonomy overrides other development paths", () => {
  const state = freshState();
  establishClues(state);
  applyDroughtChoice(state, "company");
  applyDevelopmentChoice(state, "company");
  applyGovernanceChoice(state, "autonomy");
  assert.equal(resolveEnding(state), "autonomy");
});

test("company path without autonomy produces enterprise-city ending", () => {
  const state = freshState();
  establishClues(state);
  applyDroughtChoice(state, "ranch");
  applyDevelopmentChoice(state, "company");
  applyGovernanceChoice(state, "oversight");
  assert.equal(resolveEnding(state), "company");
});

test("ecological path produces ecological-revival ending", () => {
  const state = freshState();
  establishClues(state);
  applyDroughtChoice(state, "share");
  applyDevelopmentChoice(state, "ecology");
  applyGovernanceChoice(state, "oversight");
  assert.equal(resolveEnding(state), "ecology");
});

test("weak trust and incomplete history produce split ending", () => {
  const state = freshState();
  state.story.chapter = 2;
  state.story.step = "investigate";
  recordClue(state, "elder");
  applyDroughtChoice(state, "ranch");
  applyDevelopmentChoice(state, "coop");
  applyGovernanceChoice(state, "oversight");
  assert.equal(state.story.ending, null);
  assert.equal(resolveEnding(state), "split");
});

test("crop data keeps a meaningful high-investment option", () => {
  const averageDailyProfit = Object.values(CROPS).map((crop) => ({
    id: crop.id,
    value: (crop.sellPrice - crop.seedPrice) / crop.days,
  }));
  const sorted = averageDailyProfit.sort((a, b) => a.value - b.value);
  assert.equal(sorted[0].id, "turnip");
  assert.equal(sorted.at(-1).id, "strawberry");
  assert.ok(sorted.at(-1).value > sorted[0].value * 1.5);
});

test("city ferry unlocks a repeatable island exploration route", () => {
  const state = freshState();
  state.coins = 220;
  assert.equal(investInCity(state, "ferry").ok, true);
  assert.equal(switchRegion(state, "island").ok, true);
  const result = exploreIsland(state, "tidePool");
  assert.equal(result.ok, true);
  assert.equal(state.inventory.resources.seaweed, 3);
  assert.equal(exploreIsland(state, "tidePool").ok, false);
  advanceDay(state);
  assert.equal(exploreIsland(state, "tidePool").ok, true);
});

test("island routes are limited and rare resources are not guaranteed", () => {
  const state = freshState();
  state.coins = 220;
  investInCity(state, "ferry");
  switchRegion(state, "island");
  assert.equal(exploreIsland(state, "tidePool").ok, true);
  assert.equal(exploreIsland(state, "silverBeach").ok, true);
  assert.equal(exploreIsland(state, "moonReef").ok, false);
  assert.ok(state.inventory.resources.pearl === 0);
});

test("dynamic trade contracts consume resources and pay reputation", () => {
  const state = freshState();
  state.inventory.resources.seaweed = 3;
  state.inventory.resources.coconut = 2;
  const contract = {
    ...TRADE_CONTRACTS.find((entry) => entry.id === "island-kitchen"),
    requirements: { seaweed: 3, coconut: 2 },
    accepted: false,
    completed: false,
  };
  state.market.contracts = [contract];
  assert.equal(acceptTradeContract(state, contract.id).ok, true);
  const before = state.coins;
  assert.equal(fulfillTradeContract(state, contract.id).ok, true);
  assert.equal(state.coins, before + contract.reward);
  assert.equal(state.stats.contractsFulfilled, 1);
  assert.equal(state.market.reputation, contract.reputation);
});

test("government policies and sprite assignments create daily automation", () => {
  const state = freshState();
  assert.equal(enactGovernmentPolicy(state, "waterCharter").ok, true);
  assert.equal(state.maxWater, 27);
  assert.equal(recruitSprite(state, "ember").ok, false);
  assert.equal(assignSprite(state, "seedling", "watering").ok, true);
  standAtPlot(state, 0, 0);
  useToolOnPlot(state, "hoe");
  useToolOnPlot(state, "seed");
  const report = advanceDay(state);
  assert.ok(report.helperActions.some((entry) => entry.includes("露水")));
  assert.equal(state.plots[0].growth, 1);
});

test("scene travel keeps one shared day, energy, and wallet state", () => {
  const state = freshState();
  const beforeCoins = state.coins;
  assert.equal(switchScene(state, "city", "road").ok, true);
  assert.equal(state.world.scene, "city");
  assert.equal(state.world.visitedScenes.includes("city"), true);
  assert.equal(state.coins, beforeCoins);
  state.energy = 61;
  assert.equal(switchScene(state, "port", "road").ok, true);
  assert.equal(state.energy, 61);
  assert.equal(state.world.scene, "port");
  assert.equal(switchScene(state, "island", "road").ok, false);
});

test("livestock care tracks age, affection, health, grazing, and quality", () => {
  const state = freshState();
  const animal = state.animals[0];
  assert.equal(talkAnimal(state, animal.id).ok, true);
  assert.equal(brushAnimal(state, animal.id).ok, true);
  assert.equal(toggleAnimalOutdoor(state, animal.id).ok, true);
  tickAnimalOutdoor(state, 90);
  assert.equal(feedAnimal(state, animal.id).ok, true);
  const report = advanceDay(state);
  assert.equal(animal.age, 2);
  assert.ok(animal.affection > 20);
  assert.ok(animal.health > 92);
  assert.ok(report.products[0].quality);
  assert.equal(state.inventory.qualityProduce[`egg_${report.products[0].quality}`], 1);
});

test("shipping waits overnight and records cumulative settlement", () => {
  const state = freshState();
  state.inventory.produce.turnip = 2;
  const before = state.coins;
  const consign = shipProduce(state);
  assert.equal(consign.ok, true);
  assert.equal(state.coins, before);
  assert.equal(state.shipping.pending.length, 1);
  const report = advanceDay(state);
  assert.equal(report.shipping.units, 2);
  assert.ok(state.coins > before);
  assert.equal(state.shipping.totalUnits, 2);
  assert.equal(state.shipping.pending.length, 0);
});

test("accepted trade orders survive one night and expire with a penalty", () => {
  const state = freshState();
  const contract = state.market.contracts[0];
  assert.equal(acceptTradeContract(state, contract.id).ok, true);
  const beforeReputation = state.market.reputation;
  advanceDay(state);
  assert.equal(state.market.contracts.some((entry) => entry.id === contract.id && entry.accepted), true);
  advanceDay(state);
  assert.ok(state.market.reputation < beforeReputation || state.government.civicPoints < 3);
});

test("backpack and tool upgrades persist and affect capacity", () => {
  const state = freshState();
  state.coins = 1000;
  assert.equal(upgradeBackpack(state).ok, true);
  assert.equal(state.bag.slots, 4);
  assert.equal(upgradeTool(state, "hoe").ok, true);
  assert.equal(state.toolLevels.hoe, 1);
  assert.equal(getBagUsage(state), 0);
});

console.log(`\n${passed} state tests passed.`);
