import assert from "node:assert/strict";
import { BRIDGE_QUEST, CROPS, DAY_START_MINUTES, POST_GAME_MODIFIERS, SAVE_BACKUP_KEY, SAVE_KEY, TRADE_CONTRACTS, WORLD } from "../js/data.js";
import {
  advanceDay,
  advanceBridgeQuest,
  applyDevelopmentChoice,
  applyDroughtChoice,
  applyGovernanceChoice,
  acceptTradeContract,
  acceptWeeklyRequest,
  assignSprite,
  brushAnimal,
  choosePostGameModifier,
  createInitialState,
  collectForage,
  deliverWeeklyRequest,
  emitFeedback,
  enactGovernmentPolicy,
  ensureWeeklyBoard,
  exploreIsland,
  fulfillTradeContract,
  feedAnimal,
  getClueCount,
  getActiveFestival,
  getBridgeQuestStep,
  getPostGameModifier,
  getTargetPlot,
  getBagUsage,
  loadGame,
  investInCity,
  joinFestivalActivity,
  recruitSprite,
  recordClue,
  resolveDailyRecap,
  resolveEnding,
  saveGame,
  startBridgeQuest,
  sellAtMarket,
  selectShippingRoute,
  shipProduce,
  settleShipping,
  switchScene,
  switchRegion,
  talkAnimal,
  toggleAnimalOutdoor,
  tickAnimalOutdoor,
  upgradeBackpack,
  upgradeTool,
  upgradeHouse,
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

test("daily task settlement is shown in the day report and牧心 memory", () => {
  const state = freshState();
  state.daily.tasks = [
    {
      id: "test-water",
      text: "浇一块地",
      counter: "watered",
      target: 1,
      reward: 25,
      done: false,
      rewarded: false,
    },
    {
      id: "test-talk",
      text: "和村民交谈",
      counter: "talked",
      target: 1,
      reward: 10,
      done: false,
      rewarded: false,
    },
  ];
  standAtPlot(state, 0, 0);
  useToolOnPlot(state, "hoe");
  useToolOnPlot(state, "seed");
  useToolOnPlot(state, "water");
  const report = advanceDay(state);
  assert.equal(report.dailyTasks.completed.length, 1);
  assert.equal(report.dailyTasks.completed[0].text, "浇一块地");
  assert.equal(report.dailyTasks.incomplete.length, 1);
  assert.equal(report.dailyTasks.incomplete[0].progress, 0);
  assert.equal(report.dailyTasks.reward, 25);
  assert.ok(report.systemNotes.some((note) => note.includes("今日清单结算")));
  assert.ok(state.ai.memories.some((memory) => memory.text.includes("今日清单结算")));
});

test("daily recap offers one interpretation once and applies only its choice", () => {
  const state = freshState();
  state.relations.community = 60;
  const trustBefore = state.ai.trust;
  const civicBefore = state.government.civicPoints;
  const report = advanceDay(state);
  assert.equal(report.recap.facts.length, 3);
  assert.equal(state.daily.recapOptions.length, 2);
  assert.equal(state.daily.recapChoice, null);
  const aiChoice = resolveDailyRecap(state, "ai");
  assert.equal(aiChoice.ok, true);
  assert.equal(state.ai.trust, trustBefore + 2);
  assert.equal(state.government.civicPoints, civicBefore);
  assert.equal(state.daily.recapChoice, "ai");
  assert.equal(resolveDailyRecap(state, "public").ok, false);
  assert.equal(state.relations.community, 60);
  const next = advanceDay(state);
  assert.equal(next.recap.options.length, 2);
  assert.equal(state.daily.recapChoice, null);
});

test("public daily recap pays civic point and community without repeating", () => {
  const state = freshState();
  state.relations.community = 60;
  const trustBefore = state.ai.trust;
  const civicBefore = state.government.civicPoints;
  advanceDay(state);
  const result = resolveDailyRecap(state, "public");
  assert.equal(result.ok, true);
  assert.equal(state.government.civicPoints, civicBefore + 1);
  assert.equal(state.relations.community, 61);
  assert.equal(state.ai.trust, trustBefore);
  assert.equal(resolveDailyRecap(state, "public").ok, false);
  assert.equal(state.government.civicPoints, civicBefore + 1);
});

test("feedback events dedupe, persist, and feed the day report", () => {
  const state = freshState();
  const first = emitFeedback(state, {
    eventId: "test_feedback",
    kind: "travel",
    sourceScene: "city",
    severity: "warning",
    message: "这条路今天不通。",
    dedupeKey: "test-feedback-key",
  });
  assert.ok(first);
  assert.equal(first.eventId, "test_feedback");
  assert.equal(first.message, "这条路今天不通。");
  const duplicate = emitFeedback(state, {
    eventId: "test_feedback",
    kind: "travel",
    sourceScene: "city",
    message: "这条路今天不通。",
    dedupeKey: "test-feedback-key",
  });
  assert.equal(duplicate, null);
  const second = emitFeedback(state, {
    eventId: "test_feedback_2",
    kind: "season",
    sourceScene: "farm",
    severity: "success",
    message: "季节路线已经记录。",
    dedupeKey: "test-feedback-key-2",
  });
  assert.ok(second);
  const report = advanceDay(state);
  assert.ok(report.feedbackEvents.some((event) => event.eventId === "test_feedback"));
  assert.ok(report.feedbackEvents.some((event) => event.eventId === "test_feedback_2"));
  assert.equal(state.feedback.events.length, 2);
});

test("four-station bridge quest preserves materials and completes once", () => {
  const state = freshState();
  state.coins = 100;
  state.inventory.resources.ore = 2;
  state.inventory.produce.egg = 2;
  assert.equal(startBridgeQuest(state).ok, true);
  assert.equal(getBridgeQuestStep(state).id, "repair");
  state.world.scene = "farm";
  const repair = advanceBridgeQuest(state);
  assert.equal(repair.ok, true);
  assert.equal(state.coins, 60);
  assert.equal(state.inventory.resources.ore, 0);
  assert.equal(state.quests.bridgeMaterials, 2);
  assert.equal(getBridgeQuestStep(state).id, "deliver");
  state.world.scene = "port";
  assert.equal(advanceBridgeQuest(state).ok, true);
  assert.equal(state.inventory.produce.egg, 0);
  assert.equal(getBridgeQuestStep(state).id, "council");
  state.world.scene = "council";
  assert.equal(advanceBridgeQuest(state).ok, true);
  assert.equal(getBridgeQuestStep(state).id, "reward");
  state.world.scene = "city";
  const civicBefore = state.government.civicPoints;
  const communityBefore = state.relations.community;
  const reward = advanceBridgeQuest(state);
  assert.equal(reward.ok, true);
  assert.equal(reward.completed, true);
  assert.equal(state.quests.completed, true);
  assert.equal(state.coins, 150);
  assert.equal(state.government.civicPoints, civicBefore + 1);
  assert.equal(state.relations.community, communityBefore + 2);
  assert.equal(state.stats.bridgeCompleted, 1);
  assert.equal(advanceBridgeQuest(state).ok, false);
  assert.equal(state.quests.completedSteps.length, BRIDGE_QUEST.steps.length);
});

test("expired bridge quest keeps steps and can be reaccepted next week", () => {
  const state = freshState();
  state.coins = 100;
  state.inventory.resources.ore = 2;
  startBridgeQuest(state);
  state.world.scene = "farm";
  advanceBridgeQuest(state);
  state.quests.deadlineDay = state.day;
  state.market.reputation = 10;
  const reputationBefore = state.market.reputation;
  const report = advanceDay(state);
  assert.equal(state.quests.expired, true);
  assert.equal(state.quests.stepIndex, 1);
  assert.equal(state.quests.completedSteps.includes("repair"), true);
  assert.equal(state.quests.bridgeMaterials, 2);
  assert.equal(state.quests.retryDay, state.day + 7);
  assert.ok(state.market.reputation < reputationBefore);
  assert.ok(report.feedbackEvents.some((event) => event.eventId === "bridge_expired"));
  state.day = state.quests.retryDay;
  const resumed = startBridgeQuest(state);
  assert.equal(resumed.ok, true);
  assert.equal(state.quests.expired, false);
  assert.equal(getBridgeQuestStep(state).id, "deliver");
});

test("weekly public requests can be accepted, delivered, and paid once", () => {
  const state = freshState();
  const board = ensureWeeklyBoard(state);
  assert.ok(board.requests.length >= 2);
  const request = board.requests[0];
  assert.equal(acceptWeeklyRequest(state, request.id).ok, true);
  assert.equal(acceptWeeklyRequest(state, request.id).ok, false);
  for (const [itemId, amount] of Object.entries(request.requirements)) {
    state.inventory.produce[itemId] = amount;
  }
  const coinsBefore = state.coins;
  const civicBefore = state.government.civicPoints;
  const result = deliverWeeklyRequest(state, request.id);
  assert.equal(result.ok, true);
  assert.equal(state.coins, coinsBefore + request.reward);
  assert.equal(state.government.civicPoints, civicBefore + request.civic);
  assert.equal(state.weekly.completedIds.includes(request.id), true);
  assert.equal(deliverWeeklyRequest(state, request.id).ok, false);
});

test("weekly request expiry charges reputation and refreshes the board", () => {
  const state = freshState();
  const board = ensureWeeklyBoard(state);
  const request = board.requests[0];
  acceptWeeklyRequest(state, request.id);
  state.market.reputation = 10;
  state.government.civicPoints = 5;
  state.day = 7;
  const report = advanceDay(state);
  assert.equal(state.weekly.expiredIds.includes(request.id), true);
  assert.ok(report.weeklyExpired.includes(request.title));
  assert.ok(state.market.reputation < 10);
  assert.ok(state.government.civicPoints < 5);
  assert.ok(state.weekly.requests.some((entry) => entry.id !== request.id));
});

test("festival activities require two completions and pay once", () => {
  const state = freshState();
  state.season = "夏";
  state.seasonDay = 14;
  state.day = 14;
  state.coins = 20;
  state.inventory.produce.turnip = 1;
  state.relations.community = 50;
  const festival = getActiveFestival(state);
  assert.equal(festival.id, "tide_lantern");
  assert.equal(festival.activities.length, 3);
  const soup = joinFestivalActivity(state, "soup");
  assert.equal(soup.ok, true);
  assert.equal(state.coins, 10);
  assert.equal(soup.reward, null);
  const lantern = joinFestivalActivity(state, "lantern");
  assert.equal(lantern.ok, true);
  assert.equal(state.inventory.produce.turnip, 0);
  assert.equal(state.festival.rewardClaimed, true);
  assert.equal(state.coins, 90);
  assert.equal(state.government.civicPoints, 4);
  assert.equal(state.relations.community, 54);
  assert.equal(joinFestivalActivity(state, "soup").ok, false);
  state.seasonDay = 15;
  assert.equal(getActiveFestival(state), null);
});

test("rain forage nodes expire, collect once, and feed the day report", () => {
  const state = freshState();
  state.weather = "rain";
  const report = advanceDay(state);
  assert.equal(report.forageStats.window, true);
  assert.equal(report.forageStats.spawned, 1);
  assert.equal(state.forage.weatherDay, 1);
  assert.equal(state.forage.expiresDay, 2);
  assert.equal(state.forage.expiresMinute, DAY_START_MINUTES + 180);
  const node = state.forage.nodes[0];
  state.world.scene = node.scene;
  const energyBefore = state.energy;
  const first = collectForage(state, node.id);
  assert.equal(first.ok, true);
  assert.equal(first.combo, 1);
  assert.equal(state.energy, energyBefore - 1);
  assert.equal(state.minutes, DAY_START_MINUTES + 8);
  assert.equal(state.relations.ecology, 51);
  assert.equal(state.daily.counters.foraged, 1);
  const memoryCount = state.ai.memories.length;
  const second = collectForage(state, node.id);
  assert.equal(second.ok, false);
  assert.equal(state.energy, energyBefore - 1);
  assert.equal(state.ai.memories.length, memoryCount);
  assert.equal(state.forage.claimedNodeIds.includes(node.id), true);
  const nextReport = advanceDay(state);
  assert.equal(nextReport.forageStats.collected, 1);
});

test("expired forage gives feedback without spending energy", () => {
  const state = freshState();
  state.weather = "rain";
  advanceDay(state);
  const node = state.forage.nodes[0];
  state.world.scene = node.scene;
  state.minutes = node.expiresMinute + 1;
  const energyBefore = state.energy;
  const result = collectForage(state, node.id);
  assert.equal(result.ok, false);
  assert.equal(state.energy, energyBefore);
  assert.equal(state.forage.expiryNoted, true);
  assert.ok(state.ai.memories.some((memory) => memory.text.includes("采集窗口已经关闭")));
});

test("forage node identity stays separate from item identity", () => {
  const state = freshState();
  state.forage.available = ["spring_herb"];
  state.forage.nodes = [
    {
      id: "node-a",
      interactionId: "forage",
      scene: "farm",
      x: 610,
      y: 180,
      itemId: "spring_herb",
      expiresDay: state.day,
      expiresMinute: DAY_START_MINUTES + 180,
      claimed: false,
    },
    {
      id: "node-b",
      interactionId: "forage",
      scene: "farm",
      x: 640,
      y: 180,
      itemId: "spring_herb",
      expiresDay: state.day,
      expiresMinute: DAY_START_MINUTES + 180,
      claimed: false,
    },
  ];
  state.forage.claimedNodeIds = [];
  state.world.scene = "farm";
  assert.equal(collectForage(state, "forage").ok, true);
  assert.equal(collectForage(state, "forage").ok, true);
  assert.equal(state.forage.claimedNodeIds.length, 2);
  assert.equal(state.inventory.resources.spring_herb, 2);
});

test("legacy forage saves keep only the current-day available node", () => {
  const previousStorage = globalThis.localStorage;
  const legacy = createInitialState();
  legacy.day = 4;
  legacy.season = "春";
  legacy.forage = {
    available: ["spring_herb"],
    collected: {},
    lastRefreshDay: 4,
  };
  globalThis.localStorage = {
    getItem: () => JSON.stringify(legacy),
    setItem: () => {},
    removeItem: () => {},
  };
  const loaded = loadGame();
  assert.equal(loaded.forage.nodes.length, 1);
  assert.equal(loaded.forage.nodes[0].expiresDay, 4);
  assert.equal(loaded.forage.legacyMigrated, true);
  legacy.forage = {
    available: ["spring_herb"],
    collected: {},
    lastRefreshDay: 4,
    nodes: [{
      id: "old-node",
      interactionId: "forage",
      scene: "farm",
      x: 610,
      y: 180,
      itemId: "spring_herb",
      expiresDay: 0,
      claimed: false,
    }],
  };
  const loadedBuggyNode = loadGame();
  assert.equal(loadedBuggyNode.forage.nodes[0].expiresDay, 4);
  globalThis.localStorage = previousStorage;
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

test("post-game modifier applies one constraint without rewriting the ending", () => {
  const state = freshState();
  state.story.ending = "common";
  state.story.endingSeen = true;
  state.story.endingDay = state.day;
  state.coins = 100;
  const civicBefore = state.government.civicPoints;
  const result = choosePostGameModifier(state, "publicLedger");
  assert.equal(result.ok, true);
  assert.equal(state.story.ending, "common");
  assert.equal(state.story.postGameModifier, "publicLedger");
  assert.equal(state.story.postGameDeadline, state.day + 7);
  assert.equal(state.government.civicPoints, civicBefore + 2);
  assert.equal(choosePostGameModifier(state, "handCare").ok, false);
  assert.equal(POST_GAME_MODIFIERS.length, 3);
  const contract = {
    id: "postgame-contract",
    title: "后日谈订单",
    reward: 100,
    reputation: 2,
    requirements: { egg: 1 },
    accepted: true,
    completed: false,
    expiresDay: state.day + 1,
  };
  state.inventory.produce.egg = 1;
  state.market.contracts = [contract];
  const coinsBefore = state.coins;
  const fulfilled = fulfillTradeContract(state, contract.id);
  assert.equal(fulfilled.ok, true);
  assert.equal(fulfilled.payout, 80);
  assert.equal(state.coins, coinsBefore + 80);
});

test("post-game public ledger completes after three public recaps and is idempotent", () => {
  const state = freshState();
  state.story.ending = "common";
  state.story.endingSeen = true;
  choosePostGameModifier(state, "publicLedger");
  for (let index = 0; index < 3; index += 1) {
    state.daily.recapChoice = "public";
    advanceDay(state);
  }
  const modifier = getPostGameModifier(state);
  assert.equal(modifier.id, "publicLedger");
  assert.equal(state.story.postGameProgress.completed, true);
  assert.equal(state.story.postGameProgress.value, 3);
  assert.ok(state.story.postScriptsSeen.includes("publicLedger:epilogue"));
  const progressBefore = { ...state.story.postGameProgress };
  advanceDay(state);
  assert.deepEqual(state.story.postGameProgress, progressBefore);
});

test("post-game hand-care and dry-season modifiers enforce their constraints", () => {
  const handCare = freshState();
  handCare.story.ending = "ecology";
  handCare.story.endingSeen = true;
  choosePostGameModifier(handCare, "handCare");
  for (const animal of handCare.animals) animal.fed = true;
  const careReport = advanceDay(handCare);
  assert.ok(careReport.helperActions.some((entry) => entry.includes("手工周")));
  assert.equal(handCare.story.postGameProgress.value, 1);

  const drySeason = freshState();
  drySeason.story.ending = "ecology";
  drySeason.story.endingSeen = true;
  choosePostGameModifier(drySeason, "drySeason");
  assert.ok(drySeason.maxWater <= 12);
  for (let index = 0; index < 7; index += 1) {
    drySeason.relations.community = 60;
    advanceDay(drySeason);
  }
  assert.equal(drySeason.story.postGameProgress.completed, true);
  assert.ok(drySeason.story.postScriptsSeen.includes("drySeason:epilogue"));
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
  const beforeCoins = state.coins;
  assert.equal(enactGovernmentPolicy(state, "waterCharter").ok, true);
  assert.equal(state.coins, beforeCoins - 40);
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

test("workforce can plant crops, care for livestock, fish, and raise fish", () => {
  const state = freshState();
  state.coins = 600;
  assert.equal(recruitSprite(state, "sprout").ok, true);
  assert.equal(assignSprite(state, "sprout", "planting").ok, true);
  state.sprites.unlocked.push("ember");
  state.sprites.friendship.ember = 18;
  assert.equal(assignSprite(state, "ember", "animals").ok, true);
  assert.equal(investInCity(state, "ferry").ok, true);
  assert.equal(recruitSprite(state, "angler").ok, true);
  assert.equal(assignSprite(state, "angler", "fishing").ok, true);
  assert.equal(recruitSprite(state, "pondling").ok, true);
  assert.equal(assignSprite(state, "pondling", "fishery").ok, true);
  const report = advanceDay(state);
  assert.ok(report.helperActions.some((entry) => entry.includes("播下")));
  assert.equal(state.plots.filter((plot) => plot.crop).length, 2);
  assert.equal(report.animalsUnfed.length, 0);
  assert.equal(state.stats.fishCaught, 2);
  assert.ok(state.inventory.resources.tidefish >= 2);
});

test("sleep returns the player to the farm scene and spawn", () => {
  const state = freshState();
  switchScene(state, "city", "road");
  state.player.x = 900;
  state.player.y = 500;
  advanceDay(state);
  assert.equal(state.world.scene, "farm");
  assert.equal(state.world.activeRegion, "farm");
  assert.equal(state.player.x, 240);
  assert.equal(state.player.y, 275);
  assert.equal(state.player.facing, "down");
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

test("shipping route delays arrival, charges a fee, and rejects a missed boat", () => {
  const state = freshState();
  state.inventory.produce.turnip = 3;
  state.minutes = 9 * 60;
  assert.equal(selectShippingRoute(state, "ocean").ok, true);
  const consign = shipProduce(state, "ocean");
  assert.equal(consign.ok, true);
  assert.equal(consign.arrivalDay, 3);
  const firstReport = advanceDay(state);
  assert.equal(firstReport.shipping.delayed, true);
  assert.equal(state.shipping.pending.length, 1);
  state.inventory.produce.turnip = 1;
  const missed = shipProduce(state, "ocean");
  assert.equal(missed.ok, false);
  assert.equal(state.inventory.produce.turnip, 1);
  const secondReport = advanceDay(state);
  assert.ok(secondReport.shipping.fee > 0);
  assert.equal(state.shipping.pending.length, 0);
  assert.equal(state.shipping.tripHistory[0].route, "ocean");
  assert.ok(state.shipping.tripHistory[0].payout < state.shipping.tripHistory[0].gross);
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

test("corrupt primary saves fall back to the previous automatic save", () => {
  const previousStorage = globalThis.localStorage;
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
  };
  try {
    const first = createInitialState();
    first.day = 1;
    first.coins = 111;
    saveGame(first);
    const second = createInitialState();
    second.day = 2;
    second.coins = 222;
    saveGame(second);
    assert.ok(store[SAVE_BACKUP_KEY]);
    store[SAVE_KEY] = "{not valid json";
    const loaded = loadGame();
    assert.equal(loaded.day, 1);
    assert.equal(loaded.coins, 111);
    assert.notEqual(store[SAVE_KEY], "{not valid json");
  } finally {
    globalThis.localStorage = previousStorage;
  }
});

test("illegal save numbers are clamped and missing fields get defaults", () => {
  const previousStorage = globalThis.localStorage;
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
  };
  try {
    store[SAVE_KEY] = JSON.stringify({
      day: -5,
      season: "??",
      seasonDay: 99,
      coins: -30,
      energy: 999,
      maxEnergy: 100,
      water: -8,
      maxWater: 24,
    });
    const clamped = loadGame();
    assert.equal(clamped.day, 1);
    assert.equal(clamped.season, "春");
    assert.equal(clamped.seasonDay, 28);
    assert.equal(clamped.coins, 0);
    assert.equal(clamped.energy, 100);
    assert.equal(clamped.water, 0);
    store[SAVE_KEY] = JSON.stringify({ day: 4, season: "夏" });
    const sparse = loadGame();
    assert.equal(sparse.day, 4);
    assert.equal(sparse.season, "夏");
    assert.equal(sparse.player.x, createInitialState().player.x);
    assert.ok(sparse.quests && sparse.festival && sparse.weekly);
  } finally {
    globalThis.localStorage = previousStorage;
  }
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

test("season calendar, house expansion, and town rewards are data-driven", () => {
  const state = freshState();
  state.season = "冬";
  standAtPlot(state, 0, 0);
  useToolOnPlot(state, "hoe");
  assert.equal(useToolOnPlot(state, "seed").ok, false);
  state.coins = 1000;
  assert.equal(upgradeHouse(state).ok, true);
  assert.equal(state.house.fridge !== undefined, true);
  assert.equal(state.house.storageSlots, 8);
});

console.log(`\n${passed} state tests passed.`);
