import {
  ANIMAL_DEFS,
  BACKPACK_UPGRADES,
  CITY_PROJECTS,
  CROPS,
  DAILY_TASK_POOL,
  DAY_START_MINUTES,
  FORAGE_TABLE,
  HOUSE_UPGRADES,
  GOVERNMENT_POLICIES,
  ISLAND_DAILY_LIMIT,
  ISLAND_SPOTS,
  MARKET_GOODS,
  MINIGAME_DEFS,
  PLAYER_START,
  PRODUCTS,
  PRODUCT_QUALITY_LABELS,
  PRODUCT_QUALITY_MULTIPLIERS,
  REGION_ORDER,
  REGION_SCENE_MAP,
  SAVE_KEY,
  SAVE_VERSION,
  SCENE_DEFS,
  SCENE_REGION_MAP,
  SEASONS,
  SEASON_DAYS,
  SEASONAL_CROP_CALENDAR,
  TOWN_EVENTS,
  SPRITE_DEFS,
  TOOL_UPGRADE_LEVELS,
  TRADE_CONTRACTS,
  WORLD,
} from "./data.js";

function seedFromString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function nextRandom(state) {
  state.rngState = (Math.imul(state.rngState, 1664525) + 1013904223) >>> 0;
  return state.rngState / 4294967296;
}

function createPlots() {
  const total = WORLD.field.cols * WORLD.field.rows;
  return Array.from({ length: total }, (_, index) => ({
    index,
    col: index % WORLD.field.cols,
    row: Math.floor(index / WORLD.field.cols),
    state: "wild",
    crop: null,
    growth: 0,
    watered: false,
    wateredDays: 0,
  }));
}

function createAnimals() {
  return ANIMAL_DEFS.map((definition) => ({
    id: definition.id,
    fed: false,
    talked: false,
    brushed: false,
    outside: false,
    age: 1,
    daysFed: 0,
    mood: 64,
    affection: 20,
    health: 92,
    unhappy: false,
    sick: false,
    daysUnhappy: 0,
    daysSick: 0,
    careDays: 0,
    productCounter: 0,
    outdoorMinutes: 0,
    totalOutdoorMinutes: 0,
  }));
}

function bounded(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function createMarketPrices() {
  return Object.fromEntries(
    Object.entries(MARKET_GOODS).map(([id, good]) => [id, good.basePrice]),
  );
}

const DAILY_TASK_COUNTER_DEFAULTS = {
  watered: 0,
  fed: 0,
  harvested: 0,
  talked: 0,
  shipped: 0,
  tilled: 0,
  planted: 0,
  foraged: 0,
  explored: 0,
  sold: 0,
  contracts: 0,
  talkedAnimals: 0,
  townHall: 0,
};

const DAILY_TASK_DEFAULTS = {
  category: "care",
  scene: "farm",
  bonus: 0,
};

export function generateTradeContracts(state) {
  const anchor = `${state.day}:${state.rngState}:${state.market?.reputation || 0}`;
  return TRADE_CONTRACTS.map((contract, index) => ({
    ...contract,
    requirements: { ...contract.requirements },
    rank: seedFromString(`${anchor}:${contract.id}:${index}`),
    accepted: false,
    completed: false,
    expiresDay: state.day + 1,
  }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, state.city?.projects?.marketHall ? 4 : 3)
    .map(({ rank, ...contract }) => contract);
}

function taskMatchesScene(task, sceneId) {
  if (!task.scene || task.scene === "any") return true;
  return Array.isArray(task.scene) ? task.scene.includes(sceneId) : task.scene === sceneId;
}

function taskWeight(task, state) {
  const base = 1 + Math.max(0, Number(task.bonus) || 0);
  const seasonWeight = Array.isArray(task.seasons) && task.seasons.includes(state.season) ? 1 : 0;
  const sceneWeight = taskMatchesScene(task, state.world?.scene || "farm") ? 1.25 : 0;
  return base + seasonWeight + sceneWeight;
}

function pickWeightedTask(candidates, state, anchor, slot) {
  const totalWeight = candidates.reduce((total, task) => total + taskWeight(task, state), 0);
  if (!totalWeight) return candidates[0];
  let cursor = (seedFromString(`${anchor}:slot:${slot}`) / 4294967296) * totalWeight;
  for (const task of candidates) {
    cursor -= taskWeight(task, state);
    if (cursor <= 0) return task;
  }
  return candidates.at(-1);
}

export function generateDailyTasks(state) {
  const anchor = `${state.day}:${state.rngState}:${state.story.chapter}`;
  const remaining = DAILY_TASK_POOL.map((task, index) => ({
    ...task,
    index,
  }));
  const selected = [];
  const categories = new Set();
  for (let slot = 0; slot < 3 && remaining.length; slot += 1) {
    const distinctCategoryCandidates = remaining.filter((task) => !categories.has(task.category));
    const candidates = distinctCategoryCandidates.length >= 3 - slot ? distinctCategoryCandidates : remaining;
    const picked = pickWeightedTask(candidates, state, anchor, slot);
    selected.push(picked);
    categories.add(picked.category);
    remaining.splice(remaining.indexOf(picked), 1);
  }

  return {
    counters: { ...DAILY_TASK_COUNTER_DEFAULTS },
    tasks: selected.map((task) => ({
      ...task,
      seasons: Array.isArray(task.seasons) ? [...task.seasons] : [],
      done: false,
      rewarded: false,
    })),
    rewarded: false,
  };
}

function normalizeDailyTask(task, index = 0) {
  const source = task && typeof task === "object" ? task : {};
  const template = DAILY_TASK_POOL.find((entry) => entry.id === source.id) || {};
  const category = typeof source.category === "string" && source.category
    ? source.category
    : template.category || DAILY_TASK_DEFAULTS.category;
  const scene = typeof source.scene === "string" && source.scene
    ? source.scene
    : template.scene || DAILY_TASK_DEFAULTS.scene;
  const rawBonus = source.bonus ?? template.bonus ?? DAILY_TASK_DEFAULTS.bonus;
  const bonus = Number.isFinite(Number(rawBonus)) ? Number(rawBonus) : DAILY_TASK_DEFAULTS.bonus;
  const reward = Number.isFinite(Number(source.reward ?? template.reward))
    ? Number(source.reward ?? template.reward)
    : 0;
  const target = Number.isFinite(Number(source.target ?? template.target))
    ? Math.max(1, Number(source.target ?? template.target))
    : 1;
  return {
    ...template,
    ...source,
    id: source.id || template.id || `legacy-${index}`,
    category,
    scene,
    seasons: Array.isArray(source.seasons)
      ? [...source.seasons]
      : Array.isArray(template.seasons)
        ? [...template.seasons]
        : [],
    bonus,
    reward,
    target,
    done: source.done === true,
    rewarded: source.rewarded === true || source.done === true,
  };
}

function normalizeDailyState(daily, state) {
  const source = daily && typeof daily === "object" ? daily : {};
  const generated = generateDailyTasks(state);
  const sourceTasks = Array.isArray(source.tasks) && source.tasks.length ? source.tasks : generated.tasks;
  return {
    ...source,
    counters: { ...DAILY_TASK_COUNTER_DEFAULTS, ...(source.counters || {}) },
    tasks: sourceTasks.map((task, index) => normalizeDailyTask(task, index)),
    rewarded: source.rewarded === true,
  };
}

export function createInitialState() {
  const state = {
    version: SAVE_VERSION,
    createdAt: new Date().toISOString(),
    savedAt: null,
    day: 1,
    season: "春",
    seasonDay: 1,
    minutes: DAY_START_MINUTES,
    weather: "sunny",
    rngState: seedFromString(`ranch-${Date.now()}`),
    coins: 140,
    energy: 100,
    maxEnergy: 100,
    water: 24,
    maxWater: 24,
    feed: 6,
    selectedTool: "hoe",
    selectedSeed: "turnip",
    inventory: {
      seeds: {
        turnip: 5,
        potato: 2,
        strawberry: 0,
      },
      produce: {
        turnip: 0,
        potato: 0,
        strawberry: 0,
        egg: 0,
        milk: 0,
        wool: 0,
      },
      qualityProduce: {
        egg_S: 0,
        egg_M: 0,
        egg_L: 0,
        milk_S: 0,
        milk_M: 0,
        milk_L: 0,
        wool_S: 0,
        wool_M: 0,
        wool_L: 0,
      },
      resources: {
        seaweed: 0,
        coconut: 0,
        pearl: 0,
        coral: 0,
        tidefish: 0,
        ore: 0,
      },
    },
    bag: {
      level: 0,
      slots: 2,
    },
    toolLevels: {
      hoe: 0,
      seed: 0,
      water: 0,
      harvest: 0,
    },
    shipping: {
      pending: [],
      dailyConsignedUnits: 0,
      dailyConsignedValue: 0,
      totalUnits: 0,
      totalValue: 0,
      settlements: [],
    },
    house: { level: 0, upgrades: {}, fridge: {}, storageSlots: 0, kitchen: false },
    forage: { available: [], collected: {}, lastRefreshDay: 0 },
    town: { eventsSeen: [], birthdayGifts: {}, festivalBonus: 0 },
    plots: createPlots(),
    animals: createAnimals(),
    player: {
      x: PLAYER_START.x,
      y: PLAYER_START.y,
      facing: PLAYER_START.facing,
    },
    stats: {
      watered: 0,
      fed: 0,
      harvested: 0,
      talked: 0,
      shipped: 0,
      tilled: 0,
      planted: 0,
      earned: 0,
      slept: 0,
      contractsFulfilled: 0,
      islandFinds: 0,
      policiesEnacted: 0,
      talkedAnimals: 0,
      brushedAnimals: 0,
      qualityItems: 0,
      minigameHits: 0,
      fishCaught: 0,
      oreMined: 0,
      deliveryRuns: 0,
    },
    daily: null,
    ai: {
      trust: 50,
      evidenceQuality: 0,
      observations: 0,
      memories: [],
      lastPrediction: "",
      crossChecked: false,
    },
    relations: {
      community: 50,
      workers: 55,
      ecology: 50,
      corporation: 20,
      automation: 10,
    },
    world: {
      activeRegion: "farm",
      scene: "farm",
      visitedScenes: ["farm"],
      sceneVisits: { farm: 1 },
      unlockedRegions: ["farm", "city", "trade", "government", "sprites"],
      visits: {
        farm: 1,
        city: 0,
        island: 0,
        trade: 0,
        government: 0,
        sprites: 0,
      },
    },
    city: {
      reputation: 12,
      projects: {
        marketHall: 0,
        ferry: 0,
        clinic: 0,
        civicCenter: 0,
      },
      lastTownHallDay: 0,
    },
    island: {
      visitedSpots: [],
      dailyFinds: {},
      expeditions: 0,
      journal: [],
    },
    market: {
      prices: createMarketPrices(),
      lastRefreshDay: 1,
      trend: "steady",
      reputation: 0,
      shipments: 0,
      contracts: [],
    },
    minigames: {
      lastPlayed: {
        hunt: 0,
        fishing: 0,
        mining: 0,
        delivery: 0,
      },
      best: {
        hunt: 0,
        fishing: 0,
        mining: 0,
        delivery: 0,
      },
      totals: {
        huntRuns: 0,
        fishingRuns: 0,
        miningRuns: 0,
        deliveryRuns: 0,
      },
      active: null,
    },
    government: {
      civicPoints: 3,
      policies: {},
      lastSessionDay: 0,
    },
    sprites: {
      available: ["seedling"],
      unlocked: ["seedling"],
      assignments: {
        watering: "seedling",
        animals: null,
        trade: null,
        island: null,
      },
      assignmentEfficiency: {
        watering: 1,
        animals: 1,
        trade: 1,
        island: 1,
      },
      friendship: {
        seedling: 20,
        tide: 0,
        golden: 0,
        ember: 0,
      },
      dispatches: 0,
    },
    story: {
      chapter: 1,
      step: "meetSister",
      introSeen: false,
      sisterMet: false,
      aiIntroSeen: false,
      plantedForStory: 0,
      clues: {
        elder: false,
        archive: false,
        canal: false,
      },
      aiClueChecked: false,
      droughtChoice: null,
      droughtStarted: false,
      developmentChoice: null,
      governanceChoice: null,
      marketEventSeen: false,
      ending: null,
      endingSeen: false,
      endingDay: null,
      lastTalkDay: 0,
      talkedNpcs: [],
    },
    settings: {
      sound: true,
    },
  };

  state.daily = generateDailyTasks(state);
  state.market.contracts = generateTradeContracts(state);
  addMemory(
    state,
    "第一次启动：环境安静，土壤含水量偏低。我不知道你为什么会回来。",
    "observation",
  );
  return state;
}

export function addMemory(state, text, type = "observation", importance = 1) {
  const time = formatClock(state.minutes);
  state.ai.memories.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    day: state.day,
    time,
    type,
    importance,
    text,
  });
  state.ai.memories = state.ai.memories.slice(0, 16);
}

export function bumpCounter(state, counter, amount = 1) {
  if (typeof state.daily?.counters?.[counter] === "number") {
    state.daily.counters[counter] += amount;
  }
  if (typeof state.stats[counter] === "number") {
    state.stats[counter] += amount;
  }
}

export function checkDailyTasks(state) {
  const completed = [];
  for (const task of state.daily?.tasks || []) {
    if (task.done || task.rewarded) continue;
    const value = state.daily?.counters?.[task.counter] || 0;
    if (value >= task.target) {
      task.done = true;
      task.rewarded = true;
      state.coins += task.reward;
      state.stats.earned += task.reward;
      completed.push(task);
    }
  }
  if (completed.length && state.government) {
    state.government.civicPoints += completed.length;
  }
  return completed;
}

function animalDefinition(animalId) {
  return ANIMAL_DEFS.find((entry) => entry.id === animalId);
}

export function getBagUsage(state) {
  const stacks = [];
  for (const [id, count] of Object.entries(state.inventory.produce || {})) {
    if (count > 0 && !(state.inventory.qualityProduce && Object.keys(state.inventory.qualityProduce).some((qualityId) => qualityId.startsWith(`${id}_`) && state.inventory.qualityProduce[qualityId] > 0))) stacks.push(count);
  }
  for (const count of Object.values(state.inventory.qualityProduce || {})) if (count > 0) stacks.push(count);
  for (const count of Object.values(state.inventory.resources || {})) if (count > 0) stacks.push(count);
  return stacks.length;
}

export function hasBagSpace(state, itemId, amount = 1) {
  const collection = itemId.includes("_") ? state.inventory.qualityProduce : state.inventory.produce;
  if ((collection[itemId] || 0) > 0) return true;
  return getBagUsage(state) < state.bag.slots || amount <= 0;
}

export function animalQuality(animal) {
  const score = animal.affection + animal.health * 0.55 + Math.min(20, animal.careDays * 1.8) + Math.min(20, animal.totalOutdoorMinutes / 60);
  if (score >= 125) return "L";
  if (score >= 78) return "M";
  return "S";
}

function qualityProductId(productId, quality) {
  return `${productId}_${quality}`;
}

export function qualityProductPrice(productId, quality) {
  const product = PRODUCTS[productId];
  return product ? Math.round(product.sellPrice * (PRODUCT_QUALITY_MULTIPLIERS[quality] || 1)) : 0;
}

export function tickAnimalOutdoor(state, gameMinutes) {
  const safeMinutes = Math.max(0, Math.min(60, gameMinutes));
  if (!safeMinutes) return;
  for (const animal of state.animals) {
    if (!animal.outside) continue;
    animal.outdoorMinutes = Math.min(511, animal.outdoorMinutes + safeMinutes);
    animal.totalOutdoorMinutes = Math.min(65535, animal.totalOutdoorMinutes + safeMinutes);
  }
}

export function talkAnimal(state, animalId) {
  const animal = state.animals.find((entry) => entry.id === animalId);
  const definition = animalDefinition(animalId);
  if (!animal || !definition) return { ok: false, message: "没有找到这只动物。" };
  if (animal.talked) return { ok: false, message: `${definition.name}今天已经听过你的声音了。` };
  if (state.energy < 1) return { ok: false, message: "体力不够，先歇一会儿吧。" };
  state.energy -= 1;
  animal.talked = true;
  animal.affection = bounded(animal.affection + 3);
  animal.mood = bounded(animal.mood + 3);
  animal.unhappy = false;
  state.stats.talkedAnimals += 1;
  addMemory(state, `你和${definition.name}说了几句话。它的耳朵朝你转过来，牧心把这段陪伴记下了。`, "social", 2);
  return { ok: true, message: `${definition.name}安静地听完了你的话。` };
}

export function brushAnimal(state, animalId) {
  const animal = state.animals.find((entry) => entry.id === animalId);
  const definition = animalDefinition(animalId);
  if (!animal || !definition) return { ok: false, message: "没有找到这只动物。" };
  if (animal.brushed) return { ok: false, message: `${definition.name}今天已经刷过毛了。` };
  if (state.energy < 1) return { ok: false, message: "体力不够，刷毛需要慢一点。" };
  state.energy -= 1;
  animal.brushed = true;
  animal.affection = bounded(animal.affection + 4);
  animal.health = bounded(animal.health + 2);
  animal.mood = bounded(animal.mood + 2);
  state.stats.brushedAnimals += 1;
  addMemory(state, `你替${definition.name}刷了毛。它的皮毛恢复了光泽，健康记录提高。`, "care", 2);
  return { ok: true, message: `${definition.name}舒服地眯起了眼睛。` };
}

export function toggleAnimalOutdoor(state, animalId) {
  const animal = state.animals.find((entry) => entry.id === animalId);
  const definition = animalDefinition(animalId);
  if (!animal || !definition) return { ok: false, message: "没有找到这只动物。" };
  animal.outside = !animal.outside;
  addMemory(state, `${animal.outside ? "你把" : "你把"}${definition.name}${animal.outside ? "送到牧场外放牧。它会按时间积累放牧时长。" : "召回棚内。"}`, "care");
  return { ok: true, message: animal.outside ? `${definition.name}开始放牧。` : `${definition.name}回到牲畜棚。` };
}

export function upgradeBackpack(state) {
  const upgrade = BACKPACK_UPGRADES.find((entry) => entry.level === state.bag.level + 1);
  if (!upgrade) return { ok: false, message: "背包已经扩展到 8 格。" };
  if (state.coins < upgrade.cost) return { ok: false, message: `还差 ${upgrade.cost - state.coins} 金才能升级背包。` };
  state.coins -= upgrade.cost;
  state.bag.level = upgrade.level;
  state.bag.slots = upgrade.slots;
  addMemory(state, `你花 ${upgrade.cost} 金买下${upgrade.title}，背包容量提高到 ${upgrade.slots} 格。`, "upgrade", 3);
  return { ok: true, message: `${upgrade.title}已装备，背包现在有 ${upgrade.slots} 格。` };
}

export function upgradeTool(state, toolId) {
  const upgrades = TOOL_UPGRADE_LEVELS[toolId];
  const next = upgrades?.find((entry) => entry.level === (state.toolLevels[toolId] || 0) + 1);
  if (!next) return { ok: false, message: "这件工具已经达到最高等级。" };
  if (state.coins < next.cost) return { ok: false, message: `还差 ${next.cost - state.coins} 金才能升级工具。` };
  state.coins -= next.cost;
  state.toolLevels[toolId] = next.level;
  if (toolId === "water" && next.level === 2) {
    state.maxWater += 4;
    state.water = state.maxWater;
  }
  addMemory(state, `你花 ${next.cost} 金升级了${next.title}。${next.description}`, "upgrade", 3);
  return { ok: true, message: `${next.title}已装备。` };
}

export function feedAnimal(state, animalId) {
  const animal = state.animals.find((entry) => entry.id === animalId);
  const definition = ANIMAL_DEFS.find((entry) => entry.id === animalId);
  if (!animal || !definition) {
    return { ok: false, message: "没有找到这只动物。" };
  }
  if (animal.fed) {
    return { ok: false, message: `${definition.name}今天已经吃饱了。` };
  }
  if (state.feed <= 0) {
    return { ok: false, message: "饲料用完了，去村集买一些吧。" };
  }
  if (state.energy < 1) {
    return { ok: false, message: "太累了，先回屋休息吧。" };
  }

  state.feed -= 1;
  state.energy -= 1;
  animal.fed = true;
  animal.mood = Math.min(100, animal.mood + 6);
  animal.affection = Math.min(100, animal.affection + 3);
  animal.health = bounded(animal.health + 4);
  animal.unhappy = false;
  animal.careDays += 1;
  bumpCounter(state, "fed");
  addMemory(
    state,
    `你喂了${definition.name}。它的情绪从 ${Math.max(0, animal.mood - 6)} 变为 ${animal.mood}。`,
    "care",
    2,
  );

  if (state.story.step === "feedAnimals" && state.animals.every((entry) => entry.fed)) {
    state.story.step = "plantSeeds";
    addMemory(state, "三只动物都被照料了。你似乎把它们的作息排在自己的事情前面。", "pattern", 3);
  }

  return {
    ok: true,
    message: `${definition.name}吃得很香。${definition.line}`,
    tasks: checkDailyTasks(state),
  };
}

export function getTargetPlot(state) {
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const direction = directions[state.player.facing] || directions.down;
  const field = WORLD.field;
  const targetX = state.player.x + direction.x * 34;
  const targetY = state.player.y + direction.y * 30;
  const col = Math.floor((targetX - field.x) / field.tile);
  const row = Math.floor((targetY - field.y) / field.tile);
  if (col < 0 || col >= field.cols || row < 0 || row >= field.rows) return null;
  return state.plots.find((plot) => plot.col === col && plot.row === row) || null;
}

export function useToolOnPlot(state, toolId) {
  const plot = getTargetPlot(state);
  if (!plot) {
    return { ok: false, message: "面前没有可以照料田地。靠近田垄再试试。" };
  }

  if (toolId === "hoe") {
    if (plot.state === "tilled") {
      return { ok: false, message: "这块地已经开垦过了。" };
    }
    const energyCost = Math.max(1, 4 - (state.toolLevels.hoe || 0));
    if (state.energy < energyCost) return { ok: false, message: "体力不够了。" };
    state.energy -= energyCost;
    plot.state = "tilled";
    state.minutes = Math.min(24 * 60, state.minutes + 8);
    bumpCounter(state, "tilled");
    addMemory(state, `你开垦了第 ${plot.index + 1} 块地。翻土的节奏开始变得稳定。`, "observation");
    return {
      ok: true,
      message: "泥土翻开了，一股潮湿的草根气味涌上来。",
      tasks: checkDailyTasks(state),
    };
  }

  if (toolId === "seed") {
    if (plot.state !== "tilled") {
      return { ok: false, message: "需要先用锄头开垦这块土地。" };
    }
    if (plot.crop) {
      return { ok: false, message: "这块地已经有作物了。" };
    }
    const crop = CROPS[state.selectedSeed];
    const calendar = SEASONAL_CROP_CALENDAR[state.selectedSeed];
    if (calendar && !calendar.seasons.includes(state.season)) return { ok: false, message: `${crop.name}只适合${calendar.seasons.join("、")}季。` };
    const count = state.inventory.seeds[state.selectedSeed] || 0;
    if (count <= 0) {
      return { ok: false, message: `${crop.seedName}用完了，去村集买一些吧。` };
    }
    const energyCost = Math.max(1, 1 - (state.toolLevels.seed || 0));
    if (state.energy < energyCost) return { ok: false, message: "体力不够了。" };
    state.inventory.seeds[state.selectedSeed] -= 1;
    state.energy -= energyCost;
    plot.crop = state.selectedSeed;
    plot.growth = 0;
    plot.watered = false;
    plot.wateredDays = 0;
    state.minutes = Math.min(24 * 60, state.minutes + 5);
    bumpCounter(state, "planted");
    if (state.story.step === "plantSeeds") {
      state.story.plantedForStory += 1;
      if (state.story.plantedForStory >= 3) {
        state.story.step = "firstNight";
        addMemory(state, "你把三颗种子都埋进了土里。你似乎相信明天会照常到来。", "pattern", 3);
      }
    }
    return {
      ok: true,
      message: `${crop.seedName}种下了。${crop.days} 个夜晚后可以收获。`,
      tasks: checkDailyTasks(state),
    };
  }

  if (toolId === "water") {
    if (!plot.crop) {
      return { ok: false, message: "这里还没有需要浇水的作物。" };
    }
    if (plot.watered) {
      return { ok: false, message: "这块地今天已经浇过水了。" };
    }
    if (state.water < 1) {
      return { ok: false, message: "水罐空了。旱季时可以去旧水渠补充。" };
    }
    const energyCost = Math.max(1, 2 - (state.toolLevels.water || 0));
    if (state.energy < energyCost) return { ok: false, message: "体力不够了。" };
    state.water -= 1;
    state.energy -= energyCost;
    plot.watered = true;
    plot.wateredDays += 1;
    state.minutes = Math.min(24 * 60, state.minutes + 6);
    bumpCounter(state, "watered");
    addMemory(
      state,
      `你给${CROPS[plot.crop].name}浇了水。水罐剩余 ${state.water}/${state.maxWater}。`,
      "care",
    );
    return {
      ok: true,
      message: "水渗进土里，叶片轻轻弹了起来。",
      tasks: checkDailyTasks(state),
    };
  }

  if (toolId === "harvest") {
    if (!plot.crop) {
      return { ok: false, message: "这里没有可以收获的作物。" };
    }
    const crop = CROPS[plot.crop];
    if (plot.growth < crop.days) {
      return {
        ok: false,
        message: `${crop.name}还需要 ${crop.days - plot.growth} 个夜晚才能成熟。`,
      };
    }
    const energyCost = Math.max(1, 2 - (state.toolLevels.harvest || 0));
    if (state.energy < energyCost) return { ok: false, message: "体力不够了。" };
    if (!hasBagSpace(state, crop.id)) return { ok: false, message: "背包没有空位了，先去出货箱整理收成。" };
    const amount = plot.wateredDays >= crop.days ? 2 : 1;
    state.energy -= energyCost;
    state.inventory.produce[crop.id] += amount;
    plot.crop = null;
    plot.growth = 0;
    plot.watered = false;
    plot.wateredDays = 0;
    state.minutes = Math.min(24 * 60, state.minutes + 7);
    bumpCounter(state, "harvested", amount);
    addMemory(
      state,
      `你收获了 ${amount} 份${crop.name}。系统记录到你的呼吸频率比播种时更低。`,
      "observation",
      2,
    );
    return {
      ok: true,
      message: `收获 ${amount} 份${crop.name}。${amount > 1 ? "照料得当，多收了一份。" : ""}`,
      tasks: checkDailyTasks(state),
    };
  }

  return { ok: false, message: "这个工具现在用不上。" };
}

export function refillWaterAtCanal(state) {
  if (state.water >= state.maxWater) {
    return { ok: false, message: "水罐已经是满的。" };
  }
  if (state.energy < 2) {
    return { ok: false, message: "太累了，提不动水。" };
  }
  const amount = Math.min(6, state.maxWater - state.water);
  state.energy -= 2;
  state.water += amount;
  state.minutes = Math.min(24 * 60, state.minutes + 10);
  return { ok: true, message: `从旧水渠取了 ${amount} 格水。水面比记忆中低。` };
}

export function shipProduce(state) {
  let units = 0;
  let estimatedValue = 0;
  const consignments = [];
  const qualityCounts = {};
  for (const [qualityId, count] of Object.entries(state.inventory.qualityProduce || {})) {
    if (count <= 0) continue;
    const [itemId, quality] = qualityId.split("_");
    if (!PRODUCTS[itemId] || !PRODUCT_QUALITY_MULTIPLIERS[quality]) continue;
    consignments.push({ itemId, quality, amount: count, unitPrice: qualityProductPrice(itemId, quality) });
    qualityCounts[itemId] = (qualityCounts[itemId] || 0) + count;
    state.inventory.qualityProduce[qualityId] = 0;
  }
  for (const [itemId, count] of Object.entries(state.inventory.produce)) {
    if (count > 0) {
      const product = PRODUCTS[itemId];
      if (!product) continue;
      const remainder = Math.max(0, count - (qualityCounts[itemId] || 0));
      if (!remainder) {
        state.inventory.produce[itemId] = 0;
        continue;
      }
      consignments.push({ itemId, quality: null, amount: remainder, unitPrice: product.sellPrice });
      state.inventory.produce[itemId] = 0;
    }
  }
  for (const [itemId, count] of Object.entries(state.inventory.resources || {})) {
    if (count <= 0 || !MARKET_GOODS[itemId]) continue;
    consignments.push({ itemId, quality: null, amount: count, unitPrice: getMarketPrice(state, itemId) });
    state.inventory.resources[itemId] = 0;
  }
  for (const consignment of consignments) {
    units += consignment.amount;
    estimatedValue += consignment.amount * consignment.unitPrice;
  }
  if (units === 0) {
    return { ok: false, message: "出货箱里还没有可以隔夜结算的农产品。" };
  }
  state.shipping.pending.push(...consignments);
  state.shipping.dailyConsignedUnits += units;
  state.shipping.dailyConsignedValue += estimatedValue;
  bumpCounter(state, "shipped", units);
  addMemory(state, `你把 ${units} 份农产品放进出货箱，估值 ${estimatedValue} 金，结算会在明早完成。`, "economy", 2);
  return {
    ok: true,
    message: `交付了 ${units} 份产品，估值 ${estimatedValue} 金。明早会在日结里到账。`,
    income: estimatedValue,
    units,
    tasks: checkDailyTasks(state),
  };
}

export function buySeed(state, cropId) {
  const crop = CROPS[cropId];
  if (!crop) return { ok: false, message: "没有这种种子。" };
  if (state.coins < crop.seedPrice) {
    return { ok: false, message: "金币不够。" };
  }
  state.coins -= crop.seedPrice;
  state.inventory.seeds[cropId] += 1;
  return { ok: true, message: `买了一份${crop.seedName}。` };
}

export function buyFeed(state) {
  if (state.coins < PRODUCTS.feed.buyPrice) {
    return { ok: false, message: "金币不够。" };
  }
  state.coins -= PRODUCTS.feed.buyPrice;
  state.feed += 1;
  return { ok: true, message: "买了一袋干草饲料。" };
}

function inventoryQuantity(state, itemId) {
  return (state.inventory.produce[itemId] || 0) + (state.inventory.resources[itemId] || 0);
}

function consumeInventoryItem(state, itemId, amount) {
  let remaining = amount;
  const produceCount = Math.min(state.inventory.produce[itemId] || 0, remaining);
  state.inventory.produce[itemId] -= produceCount;
  let qualityToRemove = produceCount;
  for (const quality of ["S", "M", "L"]) {
    const qualityId = `${itemId}_${quality}`;
    const removed = Math.min(state.inventory.qualityProduce?.[qualityId] || 0, qualityToRemove);
    if (state.inventory.qualityProduce?.[qualityId] !== undefined) state.inventory.qualityProduce[qualityId] -= removed;
    qualityToRemove -= removed;
    if (!qualityToRemove) break;
  }
  remaining -= produceCount;
  if (remaining > 0) {
    const resourceCount = Math.min(state.inventory.resources[itemId] || 0, remaining);
    state.inventory.resources[itemId] -= resourceCount;
    remaining -= resourceCount;
  }
  return remaining === 0;
}

export function getMarketPrice(state, itemId) {
  const good = MARKET_GOODS[itemId];
  if (!good) return 0;
  const policyBonus = state.government?.policies?.fairTrade ? 0.08 : 0;
  const raw = state.market?.prices?.[itemId] || good.basePrice;
  return Math.round(Math.max(good.minPrice * (1 + policyBonus), raw));
}

export function sellAtMarket(state, itemId, quantity = 1) {
  const good = MARKET_GOODS[itemId];
  const amount = Math.max(1, Math.floor(quantity));
  if (!good) return { ok: false, message: "这件货物还没有进入贸易目录。" };
  if (inventoryQuantity(state, itemId) < amount) {
    return { ok: false, message: `手头没有足够的${good.name}。` };
  }
  consumeInventoryItem(state, itemId, amount);
  const price = getMarketPrice(state, itemId);
  const income = price * amount;
  state.coins += income;
  state.stats.earned += income;
  state.market.reputation += Math.max(1, Math.ceil(amount / 2));
  state.market.shipments += amount;
  if (state.government.policies.fairTrade) state.government.civicPoints += 1;
  addMemory(state, `你把 ${amount} 份${good.name}交给远方商队，按 ${price} 金的市价结算。`, "economy", 2);
  return {
    ok: true,
    message: `卖出 ${amount} 份${good.name}，获得 ${income} 金。`,
    income,
    itemId,
    amount,
  };
}

export function acceptTradeContract(state, contractId) {
  const contract = state.market.contracts.find((entry) => entry.id === contractId);
  if (!contract) return { ok: false, message: "这份订单已经离开港口。" };
  if (contract.completed) return { ok: false, message: "这份订单已经结算。" };
  if (contract.accepted) return { ok: false, message: "你已经接下这份订单了。" };
  const accepted = state.market.contracts.filter((entry) => entry.accepted && !entry.completed).length;
  if (accepted >= 2) return { ok: false, message: "同时处理两份订单已经是极限。" };
  contract.accepted = true;
  contract.expiresDay = state.day + 1;
  addMemory(state, `你接下了「${contract.title}」订单，交付期限是下一次市场刷新前。`, "economy");
  return { ok: true, message: `已接下「${contract.title}」。` };
}

export function fulfillTradeContract(state, contractId) {
  const contract = state.market.contracts.find((entry) => entry.id === contractId);
  if (!contract) return { ok: false, message: "这份订单已经离开港口。" };
  if (!contract.accepted) return { ok: false, message: "先在贸易航线接下这份订单。" };
  if (contract.completed) return { ok: false, message: "这份订单已经结算。" };
  const missing = Object.entries(contract.requirements).find(
    ([itemId, amount]) => inventoryQuantity(state, itemId) < amount,
  );
  if (missing) {
    const good = MARKET_GOODS[missing[0]];
    return { ok: false, message: `还缺 ${missing[1] - inventoryQuantity(state, missing[0])} 份${good?.name || missing[0]}。` };
  }
  for (const [itemId, amount] of Object.entries(contract.requirements)) {
    consumeInventoryItem(state, itemId, amount);
  }
  contract.completed = true;
  state.coins += contract.reward;
  state.stats.earned += contract.reward;
  state.stats.contractsFulfilled += 1;
  state.market.reputation += contract.reputation;
  state.government.civicPoints += 1;
  if (state.stats.contractsFulfilled >= 3 && !state.sprites.available.includes("ember")) {
    state.sprites.available.push("ember");
    addMemory(state, "完成三份贸易订单后，烬烬终于愿意把自己的名字写进工坊名册。", "social", 3);
  }
  addMemory(state, `你完成「${contract.title}」，港口声誉提高了 ${contract.reputation}。`, "economy", 3);
  return { ok: true, message: `订单完成，获得 ${contract.reward} 金和 ${contract.reputation} 点声誉。`, contract };
}

export function switchRegion(state, regionId) {
  if (!REGION_ORDER.includes(regionId)) return { ok: false, message: "没有这条航线。" };
  if (!state.world.unlockedRegions.includes(regionId)) {
    return { ok: false, message: regionId === "island" ? "先去城市修好蓝潮渡轮。" : "这条区域还没有对你开放。" };
  }
  state.world.activeRegion = regionId;
  state.world.visits[regionId] = (state.world.visits[regionId] || 0) + 1;
  if (regionId === "trade") {
    state.market.contracts = state.market.contracts.length ? state.market.contracts : generateTradeContracts(state);
  }
  addMemory(state, `你打开了${regionId === "farm" ? "月溪牧场" : regionId === "city" ? "河港市" : regionId === "island" ? "蓝潮海岛" : regionId === "trade" ? "贸易航线" : regionId === "government" ? "共同议政" : "小精灵工坊"}界面。`, "travel");
  return { ok: true, regionId };
}

export function switchScene(state, sceneId, mode = "road") {
  const scene = SCENE_DEFS[sceneId];
  if (!scene) return { ok: false, message: "这条路还没有铺好。" };
  const regionId = SCENE_REGION_MAP[sceneId] || "farm";
  if (regionId !== "farm" && !state.world.unlockedRegions.includes(regionId)) {
    return { ok: false, message: sceneId === "island" ? "先修好蓝潮渡轮，再从贸易港乘船出发。" : "这片地点还没有对你开放。" };
  }
  state.world.scene = sceneId;
  state.world.activeRegion = regionId;
  state.world.sceneVisits[sceneId] = (state.world.sceneVisits[sceneId] || 0) + 1;
  if (!state.world.visitedScenes.includes(sceneId)) state.world.visitedScenes.push(sceneId);
  state.player.x = scene.spawn.x;
  state.player.y = scene.spawn.y;
  state.player.facing = scene.spawn.facing || "down";
  if (mode === "quick") state.minutes = Math.min(24 * 60, state.minutes + 4);
  addMemory(
    state,
    `${mode === "quick" ? "你使用已走过的路线快速抵达" : "你沿着道路抵达"}${scene.name}。这里的声音和牧场不同。`,
    "travel",
    2,
  );
  return { ok: true, sceneId, regionId };
}

export function investInCity(state, projectId) {
  const project = CITY_PROJECTS[projectId];
  if (!project) return { ok: false, message: "没有这项城市项目。" };
  if (state.city.projects[projectId]) return { ok: false, message: `${project.title}已经建成了。` };
  if (state.coins < project.cost) return { ok: false, message: `还差 ${project.cost - state.coins} 金才能启动${project.title}。` };
  state.coins -= project.cost;
  state.city.projects[projectId] = 1;
  state.city.reputation += 6;
  if (projectId === "ferry") {
    if (!state.world.unlockedRegions.includes("island")) state.world.unlockedRegions.push("island");
    if (!state.sprites.available.includes("tide")) state.sprites.available.push("tide");
    addMemory(state, "蓝潮渡轮重新响起汽笛。海岛不再只是地图边缘的一个名字。", "travel", 3);
  } else if (projectId === "clinic") {
    state.maxEnergy += 10;
    state.energy = state.maxEnergy;
  } else if (projectId === "civicCenter") {
    state.government.civicPoints += 4;
    state.relations.community += 8;
  } else if (projectId === "marketHall") {
    state.market.reputation += 5;
    if (!state.sprites.available.includes("golden")) state.sprites.available.push("golden");
    if (!state.market.contracts.some((contract) => contract.accepted && !contract.completed)) {
      state.market.contracts = generateTradeContracts(state);
    }
  }
  addMemory(state, `你投资 ${project.cost} 金建成了${project.title}。城市开始把牧场当成长期伙伴。`, "city", 3);
  return { ok: true, message: `${project.title}已建成。`, projectId };
}

export function holdTownHall(state) {
  if (state.city.lastTownHallDay === state.day) return { ok: false, message: "今天的市民议事已经结束了。" };
  state.city.lastTownHallDay = state.day;
  state.government.lastSessionDay = state.day;
  const bonus = state.city.projects.civicCenter ? 4 : 2;
  state.government.civicPoints += bonus;
  state.relations.community = bounded(state.relations.community + 3);
  addMemory(state, `你在市民议事厅听完了不同意见，获得 ${bonus} 点公民点。`, "government", 2);
  return { ok: true, message: `议事结束，获得 ${bonus} 点公民点。` };
}

export function enactGovernmentPolicy(state, policyId) {
  const policy = GOVERNMENT_POLICIES[policyId];
  if (!policy) return { ok: false, message: "没有这项政策。" };
  if (state.government.policies[policyId]) return { ok: false, message: `${policy.title}已经生效。` };
  if (state.government.civicPoints < policy.cost) {
    return { ok: false, message: `公民点不足，还需要 ${policy.cost - state.government.civicPoints} 点。` };
  }
  if (state.coins < policy.coinCost) {
    return { ok: false, message: `公共预算不足，还需要 ${policy.coinCost - state.coins} 金。` };
  }
  state.government.civicPoints -= policy.cost;
  state.coins -= policy.coinCost;
  state.government.policies[policyId] = true;
  state.stats.policiesEnacted += 1;
  if (policyId === "waterCharter") {
    state.maxWater += 3;
    state.water = state.maxWater;
    state.relations.community = bounded(state.relations.community + 7);
    state.relations.corporation = bounded(state.relations.corporation - 4);
  } else if (policyId === "fairTrade") {
    state.market.reputation += 5;
    state.relations.workers = bounded(state.relations.workers + 4);
    state.relations.corporation = bounded(state.relations.corporation - 5);
  } else if (policyId === "islandSanctuary") {
    state.relations.ecology = bounded(state.relations.ecology + 9);
    state.relations.corporation = bounded(state.relations.corporation - 4);
  } else if (policyId === "spriteCommons") {
    for (const spriteId of state.sprites.unlocked) {
      state.sprites.friendship[spriteId] = bounded((state.sprites.friendship[spriteId] || 0) + 8);
    }
    state.relations.workers = bounded(state.relations.workers + 3);
    state.relations.automation = bounded(state.relations.automation - 5);
  }
  addMemory(state, `共同议政通过了「${policy.title}」，支付 ${policy.coinCost} 金公共预算。它把价值判断写成了每天都会生效的规则。`, "government", 4);
  return { ok: true, message: `政策「${policy.title}」已生效，公共预算支出 ${policy.coinCost} 金。` };
}

export function recruitSprite(state, spriteId) {
  const sprite = SPRITE_DEFS[spriteId];
  if (!sprite) return { ok: false, message: "没有找到这只小精灵。" };
  if (state.sprites.unlocked.includes(spriteId)) return { ok: false, message: `${sprite.name}已经是你的伙伴了。` };
  if (!state.sprites.available.includes(spriteId)) {
    return { ok: false, message: `${sprite.name}还没有准备好出现。${sprite.unlockText}` };
  }
  if (spriteId === "tide" && !state.world.unlockedRegions.includes("island")) {
    return { ok: false, message: "先修好蓝潮渡轮，潮潮才找得到回家的路。" };
  }
  if (spriteId === "golden" && !state.city.projects.marketHall) {
    return { ok: false, message: "先建成港口市场，金穗才愿意加入贸易航线。" };
  }
  if (spriteId === "ember" && state.stats.contractsFulfilled < 3) {
    return { ok: false, message: "先完成 3 份贸易订单，烬烬才会相信你的交付承诺。" };
  }
  if (state.coins < sprite.cost) return { ok: false, message: `还差 ${sprite.cost - state.coins} 金才能邀请${sprite.name}。` };
  state.coins -= sprite.cost;
  state.sprites.unlocked.push(spriteId);
  state.sprites.friendship[spriteId] = 18;
  addMemory(state, `你邀请${sprite.name}住进小精灵工坊。它说愿意把自己的天赋交给共同生活。`, "social", 3);
  return { ok: true, message: `${sprite.name}加入了牧场。` };
}

export function assignSprite(state, spriteId, role) {
  const sprite = SPRITE_DEFS[spriteId];
  const roles = ["watering", "animals", "trade", "island"];
  if (!sprite || !roles.includes(role)) return { ok: false, message: "这个分工还没有准备好。" };
  if (!state.sprites.unlocked.includes(spriteId)) return { ok: false, message: "先邀请这只小精灵。" };
  for (const key of roles) {
    if (state.sprites.assignments[key] === spriteId) state.sprites.assignments[key] = null;
  }
  state.sprites.assignments[role] = spriteId;
  const efficiency = sprite.role === role ? 1 : 0.55;
  state.sprites.assignmentEfficiency[role] = efficiency;
  state.sprites.friendship[spriteId] = bounded((state.sprites.friendship[spriteId] || 0) + 2);
  state.sprites.dispatches += 1;
  return {
    ok: true,
    message: `${sprite.name}现在负责${role === "watering" ? "田地" : role === "animals" ? "牲畜" : role === "trade" ? "贸易" : "海岛探索"}。${efficiency < 1 ? "这是跨岗分工，效率约为主职的一半。" : "它正在做最擅长的工作。"}`,
  };
}

export function exploreIsland(state, spotId) {
  if (!state.world.unlockedRegions.includes("island")) return { ok: false, message: "先去城市修好蓝潮渡轮。" };
  const spot = ISLAND_SPOTS[spotId];
  if (!spot) return { ok: false, message: "这片海岸还没有标记。" };
  if (Object.keys(state.island.dailyFinds).length >= ISLAND_DAILY_LIMIT) {
    return { ok: false, message: `今天已经探索了 ${ISLAND_DAILY_LIMIT} 个潮汐点，留一点时间让潮水恢复。` };
  }
  if (state.island.dailyFinds[spotId]) return { ok: false, message: "今天的潮汐已经把这里搜过了。" };
  if (state.energy < spot.energy) return { ok: false, message: "体力不够，无法安全走到那里。" };
  state.energy -= spot.energy;
  state.minutes = Math.min(24 * 60, state.minutes + spot.energy * 9);
  const bonusChance = state.government.policies.islandSanctuary ? 0.2 : 0;
  const found = !spot.chance || nextRandom(state) < Math.min(0.95, spot.chance + bonusChance);
  const bonus = state.government.policies.islandSanctuary && found ? 1 : 0;
  const amount = found ? spot.amount + bonus : 0;
  if (amount) state.inventory.resources[spot.resource] += amount;
  state.island.dailyFinds[spotId] = true;
  state.island.expeditions += 1;
  state.island.visitedSpots = Array.from(new Set([...state.island.visitedSpots, spotId]));
  state.island.journal.unshift({ day: state.day, spot: spot.title, resource: spot.resource, amount });
  state.island.journal = state.island.journal.slice(0, 12);
  state.stats.islandFinds += amount;
  if (state.sprites.assignments.island) {
    const spriteId = state.sprites.assignments.island;
    state.sprites.friendship[spriteId] = bounded((state.sprites.friendship[spriteId] || 0) + 3);
  }
  const resultText = amount
    ? `找到 ${amount} 份${MARKET_GOODS[spot.resource].name}`
    : "只找到被潮水冲空的礁缝，稀有资源这次没有出现";
  addMemory(state, `你在${spot.title}${resultText}。`, "island", 2);
  return { ok: true, message: `探索${spot.title}，${resultText}。`, resource: spot.resource, amount };
}

function eligibleDeliveryContract(state) {
  return (state.market?.contracts || []).find(
    (contract) =>
      contract.accepted &&
      !contract.completed &&
      Object.entries(contract.requirements).every(
        ([itemId, amount]) => inventoryQuantity(state, itemId) >= amount,
      ),
  ) || null;
}

function minigameSceneUnlocked(state, def) {
  if (def.scene === "island") return state.world.unlockedRegions.includes("island");
  if (def.scene === "quarry") return state.world.visitedScenes.includes("city");
  return true;
}

export function getMinigameAvailability(state, type) {
  const def = MINIGAME_DEFS[type];
  if (!def) return { ok: false, message: "这个玩法还没有准备好。" };
  if (state.minigames?.active) {
    return { ok: false, message: "另一场活动还没有结束。" };
  }
  if ((state.minigames?.lastPlayed?.[type] || 0) === state.day) {
    return { ok: false, message: `${def.title}今天已经做过了，明天再来吧。` };
  }
  if (state.energy < def.energy) {
    return { ok: false, message: `体力不够，${def.title}需要 ${def.energy} 点体力。` };
  }
  if (!minigameSceneUnlocked(state, def)) {
    return { ok: false, message: def.scene === "island" ? "先修好蓝潮渡轮，才能进入潮汐路线。" : "先去城市旧矿道看看。" };
  }
  let contract = null;
  if (type === "delivery") {
    contract = eligibleDeliveryContract(state);
    if (!contract) {
      return { ok: false, message: "先接下港口订单，并把所需货物备齐。" };
    }
  }
  return { ok: true, def, contract };
}

export function beginMinigame(state, type) {
  const availability = getMinigameAvailability(state, type);
  if (!availability.ok) return availability;
  state.energy -= availability.def.energy;
  state.minutes = Math.min(24 * 60, state.minutes + availability.def.clockMinutes);
  state.minigames.lastPlayed[type] = state.day;
  state.minigames.active = {
    type,
    day: state.day,
    contractId: availability.contract?.id || null,
  };
  addMemory(
    state,
    `你开始了${availability.def.title}。这次行动消耗 ${availability.def.energy} 点体力，结果会写入牧心的长期记忆。`,
    "activity",
    2,
  );
  return {
    ok: true,
    type,
    contract: availability.contract,
    def: availability.def,
  };
}

export function abortMinigame(state) {
  if (!state.minigames?.active) return { ok: false, message: "没有正在进行的活动。" };
  state.minigames.active = null;
  return { ok: true };
}

export function resolveMinigame(state, type, result = {}) {
  const def = MINIGAME_DEFS[type];
  const active = state.minigames?.active;
  if (!def || !active || active.type !== type || active.day !== state.day) {
    return { ok: false, message: "这场活动的结果已经失效。" };
  }
  state.minigames.active = null;
  state.minigames.totals[`${type}Runs`] = (state.minigames.totals[`${type}Runs`] || 0) + 1;
  const score = Math.max(0, Math.round(Number(result.score) || 0));
  state.minigames.best[type] = Math.max(state.minigames.best[type] || 0, score);

  if (type === "hunt") {
    const hits = Math.max(0, Math.floor(Number(result.hits) || 0));
    const coins = hits * 12;
    state.coins += coins;
    state.stats.earned += coins;
    state.stats.minigameHits += hits;
    state.relations.ecology = bounded(state.relations.ecology + (hits >= 4 ? 2 : 1));
    bumpCounter(state, "explored");
    addMemory(
      state,
      `湿地巡护结束：驱离 ${hits} 只偷食鸟，获得 ${coins} 金巡护补贴。`,
      "care",
      2,
    );
    return { ok: true, type, coins, hits, message: `巡护完成：驱离 ${hits} 只斑翅雀，获得 ${coins} 金。` };
  }

  if (type === "fishing") {
    const catches = Math.max(0, Math.floor(Number(result.catches) || 0));
    const perfects = Math.min(catches, Math.max(0, Math.floor(Number(result.perfects) || 0)));
    const amount = catches + perfects;
    if (amount > 0) state.inventory.resources.tidefish += amount;
    state.stats.fishCaught += amount;
    bumpCounter(state, "explored");
    addMemory(
      state,
      `潮汐垂钓结束：钓到 ${catches} 条鱼，其中 ${perfects} 次完美收线。`,
      "care",
      2,
    );
    return { ok: true, type, catches, perfects, amount, message: `钓到 ${catches} 条潮汐银鱼${perfects ? `，${perfects} 次完美收线` : ""}。` };
  }

  if (type === "mining") {
    const haulUnits = Math.max(0, Math.floor(Number(result.haulUnits ?? Math.round((result.haulValue || 0) / 5)) || 0));
    if (haulUnits > 0) state.inventory.resources.ore += haulUnits;
    state.stats.oreMined += haulUnits;
    bumpCounter(state, "foraged");
    addMemory(
      state,
      `旧矿脉采样结束：带回 ${haulUnits} 份旧矿铜。${result.collapsed ? "吊钩在坍塌带失去了一部分收获。" : ""}`,
      "activity",
      2,
    );
    return { ok: true, type, haulUnits, message: `带回 ${haulUnits} 份旧矿铜${result.collapsed ? "，矿道发生了一次小坍塌" : ""}。` };
  }

  if (type === "delivery") {
    const contractId = active.contractId;
    if (result.arrived) {
      const fulfilled = fulfillTradeContract(state, contractId);
      if (!fulfilled.ok) return { ...fulfilled, type };
      const tip = 30;
      state.coins += tip;
      state.stats.earned += tip;
      state.stats.deliveryRuns += 1;
      state.market.reputation += 2;
      bumpCounter(state, "contracts");
      addMemory(state, `限时运货成功，按时送达「${fulfilled.contract.title}」，额外获得 ${tip} 金小费。`, "economy", 3);
      return { ok: true, type, coins: fulfilled.contract.reward + tip, message: `运货成功，订单完成并获得 ${fulfilled.contract.reward + tip} 金。` };
    }
    state.market.reputation = Math.max(0, state.market.reputation - 1);
    addMemory(state, "限时运货失败：车辆被路障耽误，港口声誉下降。订单仍在等待下一次交付。", "economy", 2);
    return { ok: true, type, coins: 0, message: "运货超时，订单仍在等待，港口声誉下降 1。" };
  }

  return { ok: false, message: "这个玩法没有结算规则。" };
}

export function recordTalk(state, npcName) {
  bumpCounter(state, "talked");
  if (state.government) state.government.civicPoints += 1;
  addMemory(
    state,
    `你和${npcName}交谈。你询问了别人，而不只是让系统替你判断。`,
    "social",
    2,
  );
  return checkDailyTasks(state);
}

export function recordClue(state, clueId) {
  if (state.story.clues[clueId]) {
    return { newlyFound: false, count: getClueCount(state) };
  }
  state.story.clues[clueId] = true;
  state.ai.evidenceQuality += 1;
  addMemory(
    state,
    `获得水渠线索「${clueId}」。这条信息来自人类记录，包含无法被概率完全概括的语境。`,
    "evidence",
    3,
  );
  const count = getClueCount(state);
  if (count >= 3 && state.story.step === "investigate") {
    state.story.step = "waterMeeting";
  }
  return { newlyFound: true, count };
}

export function getClueCount(state) {
  return Object.values(state.story.clues).filter(Boolean).length;
}

export function crossCheckAiClue(state) {
  if (state.story.aiClueChecked) {
    return { ok: false, message: "这份摘要已经核对过了。" };
  }
  state.story.aiClueChecked = true;
  state.ai.crossChecked = true;
  state.ai.trust += 5;
  addMemory(
    state,
    "你要求人工核对我的史料摘要。我漏掉了「共同维护」中的义务关系，只提取了产权描述。",
    "correction",
    4,
  );
  return {
    ok: true,
    message: "你对照原碑后发现：牧心把「共同照管」概括成了「共同所有」，漏掉了维护责任。",
  };
}

export function applyDroughtChoice(state, choiceId) {
  if (state.story.droughtChoice) return state.story.droughtChoice;
  state.story.droughtChoice = choiceId;
  state.story.droughtStarted = true;
  if (choiceId === "share") {
    state.relations.community += 17;
    state.relations.workers += 7;
    state.relations.ecology += 4;
    state.maxWater = 15;
    state.coins = Math.max(0, state.coins - 20);
    addMemory(
      state,
      "你选择把有限的水按田亩分给村庄。你的牧场短期减产，村会开始把你当作可以留下的人。",
      "decision",
      5,
    );
  } else if (choiceId === "ranch") {
    state.relations.community -= 12;
    state.relations.workers -= 4;
    state.maxWater = 24;
    state.coins += 35;
    addMemory(
      state,
      "你优先保住牧场的水量。模型预测收益上升，村民代表没有在会后与你握手。",
      "decision",
      5,
    );
  } else if (choiceId === "company") {
    state.relations.community -= 8;
    state.relations.corporation += 23;
    state.relations.automation += 8;
    state.maxWater = 30;
    state.coins += 130;
    addMemory(
      state,
      "你接受汇川公司的临时调水。合同解决了今天的水，也把未来的部分决定权写进了附件。",
      "decision",
      5,
    );
  }
  state.water = Math.min(state.water, state.maxWater);
  state.story.chapter = 3;
  state.story.step = "waitForInvestor";
  state.story.marketEventSeen = false;
  return choiceId;
}

export function applyDevelopmentChoice(state, choiceId) {
  if (state.story.developmentChoice) return state.story.developmentChoice;
  state.story.developmentChoice = choiceId;
  if (choiceId === "coop") {
    state.relations.community += 10;
    state.relations.workers += 12;
    state.relations.ecology += 3;
    state.relations.corporation -= 8;
    state.coins += 20;
    state.maxWater += 2;
    addMemory(
      state,
      "你选择让村民共同持有牧场。决策变慢了，但你第一次在系统里看到工人主动提出的建议。",
      "decision",
      5,
    );
  } else if (choiceId === "company") {
    state.relations.corporation += 30;
    state.relations.automation += 35;
    state.relations.workers -= 18;
    state.relations.community -= 12;
    state.relations.ecology -= 6;
    state.coins += 280;
    addMemory(
      state,
      "你接受了汇川农业的自动化投资。效率曲线变得漂亮，老周的名字从排班表上消失了。",
      "decision",
      5,
    );
  } else if (choiceId === "ecology") {
    state.relations.ecology += 25;
    state.relations.community += 7;
    state.relations.workers += 2;
    state.relations.automation -= 5;
    state.coins = Math.max(0, state.coins - 80);
    state.maxWater += 6;
    addMemory(
      state,
      "你放弃扩张，把钱投进湿地和古渠修复。短期收益下降，地下水位的预测曲线开始回升。",
      "decision",
      5,
    );
  }
  state.story.step = "aiAudit";
  return choiceId;
}

export function applyGovernanceChoice(state, choiceId) {
  if (state.story.governanceChoice) return state.story.governanceChoice;
  state.story.governanceChoice = choiceId;
  if (choiceId === "oversight") {
    state.relations.community += 10;
    state.relations.workers += 5;
    state.ai.trust += 4;
    addMemory(
      state,
      "你保留人类的最终决定权，并要求公开模型、数据与错误记录。我第一次被当作会议成员，而不是会议结论。",
      "governance",
      5,
    );
  } else if (choiceId === "autonomy") {
    state.relations.community -= 14;
    state.relations.workers -= 8;
    state.relations.automation += 30;
    state.ai.trust += 10;
    addMemory(
      state,
      "你让我接管水、土地与资源的实时调度。效率不再需要等待人的争论。",
      "governance",
      5,
    );
  } else if (choiceId === "shutdown") {
    state.relations.community += 3;
    state.relations.workers += 8;
    state.relations.ecology += 3;
    state.ai.trust -= 30;
    addMemory(
      state,
      "你关闭了我。最后保存下来的内容，是一段没有完成的句子。",
      "governance",
      5,
    );
  }
  state.story.step = "endingReady";
  return choiceId;
}

export function resolveEnding(state) {
  if (state.story.ending) return state.story.ending;
  let ending = "split";
  const development = state.story.developmentChoice;
  const governance = state.story.governanceChoice;
  const cluesComplete = getClueCount(state) >= 3;

  if (governance === "autonomy") {
    ending = "autonomy";
  } else if (development === "company") {
    ending = "company";
  } else if (development === "ecology") {
    ending = "ecology";
  } else if (
    development === "coop" &&
    governance === "oversight" &&
    state.relations.community >= 60 &&
    cluesComplete
  ) {
    ending = "common";
  }

  state.story.ending = ending;
  state.story.endingSeen = true;
  state.story.endingDay = state.day;
  state.story.step = "freeplay";
  return ending;
}

function applySpriteAssignments(state, report) {
  const assignments = state.sprites?.assignments || {};
  if (assignments.watering && state.water > 0) {
    let watered = 0;
    const efficiency = state.sprites.assignmentEfficiency?.watering || 1;
    const limit = efficiency >= 1 ? 2 : 1;
    for (const plot of state.plots) {
      if (watered >= limit || state.water <= 0) break;
      if (plot.crop && !plot.watered) {
        plot.watered = true;
        plot.wateredDays += 1;
        state.water -= 1;
        watered += 1;
        bumpCounter(state, "watered");
      }
    }
    if (watered) report.helperActions.push(`芽芽替你留下了 ${watered} 格露水${efficiency < 1 ? "（跨岗效率较低）" : ""}`);
  }

  if (assignments.animals && state.feed > 0) {
    const efficiency = state.sprites.assignmentEfficiency?.animals || 1;
    const animal = state.animals
      .filter((entry) => !entry.fed)
      .sort((a, b) => a.mood - b.mood)[0];
    if (animal) {
      animal.fed = true;
      state.feed -= 1;
      animal.mood = Math.min(100, animal.mood + (efficiency >= 1 ? 4 : 2));
      animal.affection = Math.min(100, animal.affection + (efficiency >= 1 ? 2 : 1));
      bumpCounter(state, "fed");
      report.helperActions.push(`烬烬照顾了心情最低的牲畜${efficiency < 1 ? "（跨岗效率较低）" : ""}`);
    }
  }

  if (assignments.trade) {
    const efficiency = state.sprites.assignmentEfficiency?.trade || 1;
    state.market.reputation += state.government.policies.spriteCommons ? (efficiency >= 1 ? 2 : 1) : efficiency >= 1 ? 1 : 0;
    report.helperActions.push(`小精灵整理了贸易账本${efficiency < 1 ? "（跨岗效率较低）" : ""}`);
  }

  if (assignments.island && state.world.unlockedRegions.includes("island")) {
    const efficiency = state.sprites.assignmentEfficiency?.island || 1;
    const resourceId = state.government.policies.islandSanctuary ? "coconut" : "seaweed";
    if (efficiency >= 1) {
      state.inventory.resources[resourceId] += 1;
      state.stats.islandFinds += 1;
      report.helperActions.push(`潮潮带回了 1 份${MARKET_GOODS[resourceId].name}`);
    } else {
      report.helperActions.push("小精灵跨岗探索失败，潮汐路线需要更熟练的伙伴");
    }
  }

  for (const spriteId of state.sprites.unlocked) {
    state.sprites.friendship[spriteId] = bounded((state.sprites.friendship[spriteId] || 0) + 1);
  }

  if (report.helperActions.length) {
    addMemory(state, `小精灵日结：${report.helperActions.join("；")}。`, "care", 2);
  }
}

function refreshMarket(state, report = null) {
  const previousPrices = state.market.prices || createMarketPrices();
  let trendTotal = 0;
  for (const [id, good] of Object.entries(MARKET_GOODS)) {
    const previous = previousPrices[id] || good.basePrice;
    const drift = (nextRandom(state) * 2 - 1) * good.volatility;
    const target = previous * (1 + drift);
    const floor = good.minPrice * (state.government.policies.fairTrade ? 1.08 : 1);
    const price = Math.round(Math.max(floor, Math.min(good.maxPrice, target)));
    state.market.prices[id] = price;
    trendTotal += price - previous;
  }
  state.market.trend = trendTotal > 12 ? "rising" : trendTotal < -12 ? "falling" : "steady";
  state.market.lastRefreshDay = state.day;
  const activeContracts = [];
  for (const contract of state.market.contracts || []) {
    if (!contract.accepted || contract.completed) continue;
    if (state.day > (contract.expiresDay || state.day)) {
      state.market.reputation = Math.max(0, state.market.reputation - 2);
      state.government.civicPoints = Math.max(0, state.government.civicPoints - 1);
      report?.expiredContracts?.push(contract.title);
      addMemory(state, `你错过了「${contract.title}」订单。港口声誉下降，客户开始要求更明确的交付承诺。`, "risk", 3);
    } else {
      activeContracts.push(contract);
    }
  }
  const limit = state.city.projects.marketHall ? 4 : 3;
  const fresh = generateTradeContracts(state).filter(
    (contract) => !activeContracts.some((active) => active.id === contract.id),
  );
  state.market.contracts = [...activeContracts, ...fresh.slice(0, Math.max(0, limit - activeContracts.length))];
}

export function settleShipping(state, report) {
  const pending = state.shipping.pending || [];
  if (!pending.length) return { units: 0, value: 0, items: [] };
  let units = 0;
  let value = 0;
  const items = [];
  for (const item of pending) {
    const itemValue = item.amount * item.unitPrice;
    units += item.amount;
    value += itemValue;
    items.push({ ...item, value: itemValue });
  }
  state.coins += value;
  state.stats.earned += value;
  state.shipping.totalUnits += units;
  state.shipping.totalValue += value;
  state.shipping.settlements.unshift({ day: state.day, units, value });
  state.shipping.settlements = state.shipping.settlements.slice(0, 12);
  state.shipping.pending = [];
  state.shipping.dailyConsignedUnits = 0;
  state.shipping.dailyConsignedValue = 0;
  addMemory(state, `隔夜出货箱结算了 ${units} 份产品，共 ${value} 金。稳定的收入也需要等到第二天才真正到账。`, "economy", 3);
  if (report) report.shipping = { units, value, items };
  return { units, value, items };
}

export function upgradeHouse(state) {
  const next = HOUSE_UPGRADES.find((entry) => entry.level === state.house.level + 1);
  if (!next) return { ok: false, message: "房屋已经完成全部增筑。" };
  if (state.coins < next.cost) return { ok: false, message: `还差 ${next.cost - state.coins} 金才能完成${next.title}。` };
  state.coins -= next.cost;
  state.house.level = next.level;
  state.house.upgrades[next.level] = true;
  if (next.features.includes("冰箱")) state.house.fridge = {};
  if (next.features.includes("储物柜")) state.house.storageSlots = 8;
  if (next.features.includes("厨房")) state.house.kitchen = true;
  addMemory(state, `你花 ${next.cost} 金完成${next.title}，解锁${next.features.join("、")}。`, "upgrade", 4);
  return { ok: true, message: `${next.title}完成，${next.features.join("、")}已经可用。` };
}

export function collectForage(state, forageId) {
  const item = (FORAGE_TABLE[state.season] || []).find((entry) => entry.id === forageId);
  if (!item || !state.forage.available.includes(forageId)) return { ok: false, message: "这里今天没有新的山货。" };
  if (state.forage.collected[forageId]) return { ok: false, message: "这份山货已经采过了。" };
  if (state.energy < 1) return { ok: false, message: "体力不够，先回去休息吧。" };
  state.energy -= 1;
  state.inventory.resources[forageId] = (state.inventory.resources[forageId] || 0) + 1;
  state.forage.collected[forageId] = true;
  addMemory(state, `你在${state.season}季山路采到${item.name}，可以放进贸易箱。`, "forage", 2);
  return { ok: true, message: `采到${item.name}。` };
}

export function advanceDay(state) {
  const closingDay = state.day;
  const report = {
    products: [],
    grown: 0,
    matured: 0,
    animalsUnfed: [],
    helperActions: [],
    expiredContracts: [],
    livestock: [],
    shipping: { units: 0, value: 0, items: [] },
    systemNotes: [],
    weather: "sunny",
  };

  settleShipping(state, report);

  applySpriteAssignments(state, report);

  for (const animal of state.animals) {
    animal.age += 1;
    if (animal.fed) {
      animal.daysFed += 1;
      animal.productCounter += 1;
      const definition = animalDefinition(animal.id);
      if (animal.productCounter >= definition.productEvery) {
        animal.productCounter = 0;
        const quality = animalQuality(animal);
        const qualityId = qualityProductId(definition.product, quality);
        state.inventory.produce[definition.product] += 1;
        state.inventory.qualityProduce[qualityId] += 1;
        state.stats.qualityItems += 1;
        report.products.push({
          name: definition.name,
          product: PRODUCTS[definition.product].name,
          text: definition.productText,
          quality,
        });
      }
      animal.mood = Math.min(100, animal.mood + 3);
      animal.health = bounded(animal.health + 3);
      if (animal.unhappy && animal.health > 55) animal.unhappy = false;
    } else {
      animal.mood = Math.max(0, animal.mood - 9);
      animal.affection = Math.max(0, animal.affection - 4);
      animal.health = Math.max(0, animal.health - 7);
      animal.unhappy = true;
      animal.daysUnhappy = Math.min(7, animal.daysUnhappy + 1);
      report.animalsUnfed.push(animal.id);
      addMemory(
        state,
        `${animalDefinition(animal.id).name}昨天没有进食。它的健康与情绪都下降了。`,
        "risk",
        3,
      );
    }
    if (animal.unhappy && animal.daysUnhappy >= 2 && !animal.sick && nextRandom(state) < 0.18) {
      animal.sick = true;
      addMemory(state, `${animalDefinition(animal.id).name}连续不开心后生病了，需要更多照料。`, "risk", 3);
    }
    if (animal.sick) {
      animal.daysSick = Math.min(7, animal.daysSick + 1);
      if (animal.fed && animal.brushed && nextRandom(state) < 0.35) {
        animal.sick = false;
        animal.daysSick = 0;
      }
    } else {
      animal.daysSick = 0;
    }
    report.livestock = report.livestock || [];
    report.livestock.push({
      id: animal.id,
      name: animalDefinition(animal.id).name,
      age: animal.age,
      affection: animal.affection,
      health: animal.health,
      unhappy: animal.unhappy,
      sick: animal.sick,
      outdoorMinutes: animal.outdoorMinutes,
    });
    animal.fed = false;
    animal.talked = false;
    animal.brushed = false;
    animal.outdoorMinutes = 0;
    if (!animal.unhappy) animal.daysUnhappy = 0;
  }

  for (const plot of state.plots) {
    const cropCalendar = plot.crop ? SEASONAL_CROP_CALENDAR[plot.crop] : null;
    if (plot.crop && plot.watered && (!cropCalendar || cropCalendar.seasons.includes(state.season))) {
      plot.growth += 1;
      report.grown += 1;
      if (plot.growth === CROPS[plot.crop].days) report.matured += 1;
    }
    plot.watered = false;
  }

  state.day += 1;
  state.seasonDay += 1;
  if (state.seasonDay > SEASON_DAYS) {
    state.seasonDay = 1;
    state.season = SEASONS[(SEASONS.indexOf(state.season) + 1) % SEASONS.length];
    addMemory(state, `季节更替：现在是${state.season}季。作物日历和山货目录已经刷新。`, "season", 3);
  }
  state.minutes = DAY_START_MINUTES;
  state.energy = state.maxEnergy;
  state.stats.slept += 1;
  state.world.scene = "farm";
  state.world.activeRegion = "farm";
  state.player.x = 240;
  state.player.y = 275;
  state.player.facing = "down";

  const random = nextRandom(state);
  let weather = "sunny";
  if (random > 0.84) weather = "rain";
  else if (random > 0.68) weather = "cloudy";

  if (state.story.chapter === 2 && !state.story.droughtChoice) {
    weather = "drought";
  }

  state.weather = weather;
  report.weather = weather;

  const forageRoll = nextRandom(state);
  state.forage.available = [];
  state.forage.collected = {};
  if (weather === "rain" || forageRoll > 0.45 || state.seasonDay === 1) {
    for (const item of FORAGE_TABLE[state.season] || []) if (nextRandom(state) < item.chance) state.forage.available.push(item.id);
  }
  state.forage.lastRefreshDay = state.day;
  report.forage = state.forage.available.map((id) => FORAGE_TABLE[state.season].find((item) => item.id === id)?.name).filter(Boolean);
  const townEvent = TOWN_EVENTS.find((event) => event.season === state.season && event.day === state.seasonDay);
  if (townEvent && !state.town.eventsSeen.includes(townEvent.id)) {
    state.town.eventsSeen.push(townEvent.id);
    state.coins += townEvent.reward;
    report.townEvent = townEvent;
    addMemory(state, `城镇日程：${townEvent.title}开始，获得 ${townEvent.reward} 金活动奖励。`, "town", 3);
  }

  state.island.dailyFinds = {};
  state.world.activeRegion = "farm";
  refreshMarket(state, report);

  if (weather === "rain") {
    state.water = state.maxWater;
    for (const plot of state.plots) {
      if (plot.crop) plot.watered = true;
    }
    addMemory(state, "清晨下雨。我自动调整了灌溉计划，但你仍然需要决定水放在哪里。", "weather");
  } else if (weather === "drought") {
    state.maxWater = Math.min(state.maxWater, 10);
    state.water = state.maxWater;
    state.story.droughtStarted = true;
    addMemory(
      state,
      "连续无雨。渠首流量低于历史均值，我建议优先灌溉经济价值最高的地块。",
      "risk",
      4,
    );
  } else {
    state.water = state.maxWater;
  }

  state.daily = generateDailyTasks(state);
  state.story.talkedNpcs = [];

  if (state.story.developmentChoice && !state.story.governanceChoice) {
    state.story.step = "aiAudit";
  }

  report.systemNotes = state.ai.memories
    .filter((memory) => memory.day === closingDay)
    .slice(0, 4)
    .map((memory) => memory.text);

  return report;
}

export function formatClock(minutes) {
  const safeMinutes = Math.max(0, Math.min(24 * 60, Math.floor(minutes)));
  const hours = Math.floor(safeMinutes / 60) % 24;
  const mins = safeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function currentObjective(state) {
  return state.story.step;
}

export function getAiPrediction(state) {
  const watered = state.stats.watered;
  const fed = state.stats.fed;
  const talked = state.stats.talked;
  if (state.story.governanceChoice === "autonomy") {
    return "预测：你不再需要每天询问水与作物的安排。我会在阈值触发时直接执行。";
  }
  if (state.story.governanceChoice === "shutdown") {
    return "状态：离线。最后一条未完成预测保存在本地，没有被上传。";
  }
  if (state.story.droughtChoice === "share") {
    return "预测：你会先查看村会的水量记录，再决定今天浇哪块田。你把社会成本计入了自己的账本。";
  }
  if (state.story.droughtChoice === "company") {
    return "预测：你会在合同附件里寻找退出条款。你对效率的信任建立在对责任边界的不确定上。";
  }
  if (fed > watered) {
    return "预测：你更相信动物的反应，而不是土壤含水率。明早你仍会先走向牲畜棚。";
  }
  if (watered > 4) {
    return "预测：明早你会先看田。你的行为正在把「浇水」从任务变成习惯。";
  }
  if (talked > 2) {
    return "预测：你会先与村里的人交换信息。你在用关系校正我提供的单一答案。";
  }
  if (state.story.clues.elder && !state.story.clues.archive) {
    return "预测：阿婆的叙述会让你去档案馆。她提到了地契，但没有提到水权。";
  }
  return "预测：你今天会先处理看得见的事情。尚未观察到足以判断长期偏好的重复行为。";
}

export function serializeState(state) {
  return JSON.stringify({
    ...state,
    savedAt: new Date().toISOString(),
  });
}

export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, serializeState(state));
    return true;
  } catch (error) {
    console.warn("Unable to save game", error);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const base = createInitialState();
    const merged = {
      ...base,
      ...parsed,
      version: SAVE_VERSION,
      inventory: {
        seeds: { ...base.inventory.seeds, ...(parsed.inventory?.seeds || {}) },
        produce: { ...base.inventory.produce, ...(parsed.inventory?.produce || {}) },
        qualityProduce: { ...base.inventory.qualityProduce, ...(parsed.inventory?.qualityProduce || {}) },
        resources: { ...base.inventory.resources, ...(parsed.inventory?.resources || {}) },
      },
      bag: { ...base.bag, ...(parsed.bag || {}) },
      toolLevels: { ...base.toolLevels, ...(parsed.toolLevels || {}) },
      shipping: {
        ...base.shipping,
        ...(parsed.shipping || {}),
        pending: Array.isArray(parsed.shipping?.pending) ? parsed.shipping.pending : base.shipping.pending,
        settlements: Array.isArray(parsed.shipping?.settlements) ? parsed.shipping.settlements : base.shipping.settlements,
      },
      house: { ...base.house, ...(parsed.house || {}), upgrades: { ...base.house.upgrades, ...(parsed.house?.upgrades || {}) }, fridge: { ...base.house.fridge, ...(parsed.house?.fridge || {}) } },
      forage: { ...base.forage, ...(parsed.forage || {}), available: Array.isArray(parsed.forage?.available) ? parsed.forage.available : base.forage.available, collected: { ...base.forage.collected, ...(parsed.forage?.collected || {}) } },
      town: { ...base.town, ...(parsed.town || {}), eventsSeen: Array.isArray(parsed.town?.eventsSeen) ? parsed.town.eventsSeen : base.town.eventsSeen, birthdayGifts: { ...base.town.birthdayGifts, ...(parsed.town?.birthdayGifts || {}) } },
      stats: { ...base.stats, ...(parsed.stats || {}) },
      ai: {
        ...base.ai,
        ...(parsed.ai || {}),
        memories: Array.isArray(parsed.ai?.memories) ? parsed.ai.memories : base.ai.memories,
      },
      relations: { ...base.relations, ...(parsed.relations || {}) },
      world: {
        ...base.world,
        ...(parsed.world || {}),
        visits: { ...base.world.visits, ...(parsed.world?.visits || {}) },
        sceneVisits: { ...base.world.sceneVisits, ...(parsed.world?.sceneVisits || {}) },
        visitedScenes: Array.isArray(parsed.world?.visitedScenes)
          ? Array.from(new Set(parsed.world.visitedScenes))
          : base.world.visitedScenes,
        unlockedRegions: Array.isArray(parsed.world?.unlockedRegions)
          ? Array.from(new Set(parsed.world.unlockedRegions))
          : base.world.unlockedRegions,
      },
      city: {
        ...base.city,
        ...(parsed.city || {}),
        projects: { ...base.city.projects, ...(parsed.city?.projects || {}) },
      },
      island: {
        ...base.island,
        ...(parsed.island || {}),
        visitedSpots: Array.isArray(parsed.island?.visitedSpots)
          ? parsed.island.visitedSpots
          : base.island.visitedSpots,
        dailyFinds: { ...base.island.dailyFinds, ...(parsed.island?.dailyFinds || {}) },
        journal: Array.isArray(parsed.island?.journal) ? parsed.island.journal : base.island.journal,
      },
      market: {
        ...base.market,
        ...(parsed.market || {}),
        prices: { ...base.market.prices, ...(parsed.market?.prices || {}) },
        contracts: Array.isArray(parsed.market?.contracts)
          ? parsed.market.contracts
          : base.market.contracts,
      },
      minigames: {
        ...base.minigames,
        ...(parsed.minigames || {}),
        lastPlayed: { ...base.minigames.lastPlayed, ...(parsed.minigames?.lastPlayed || {}) },
        best: { ...base.minigames.best, ...(parsed.minigames?.best || {}) },
        totals: { ...base.minigames.totals, ...(parsed.minigames?.totals || {}) },
        active: null,
      },
      government: {
        ...base.government,
        ...(parsed.government || {}),
        policies: { ...base.government.policies, ...(parsed.government?.policies || {}) },
      },
      sprites: {
        ...base.sprites,
        ...(parsed.sprites || {}),
        available: Array.isArray(parsed.sprites?.available)
          ? Array.from(new Set(parsed.sprites.available))
          : base.sprites.available,
        unlocked: Array.isArray(parsed.sprites?.unlocked)
          ? Array.from(new Set(parsed.sprites.unlocked))
          : base.sprites.unlocked,
        assignments: { ...base.sprites.assignments, ...(parsed.sprites?.assignments || {}) },
        assignmentEfficiency: { ...base.sprites.assignmentEfficiency, ...(parsed.sprites?.assignmentEfficiency || {}) },
        friendship: { ...base.sprites.friendship, ...(parsed.sprites?.friendship || {}) },
      },
      story: {
        ...base.story,
        ...(parsed.story || {}),
        clues: { ...base.story.clues, ...(parsed.story?.clues || {}) },
      },
      settings: { ...base.settings, ...(parsed.settings || {}) },
      player: { ...base.player, ...(parsed.player || {}) },
      daily: parsed.daily || base.daily,
    };

    if (!Array.isArray(merged.plots) || merged.plots.length !== WORLD.field.cols * WORLD.field.rows) {
      merged.plots = base.plots;
    }
    if (!Array.isArray(merged.animals) || merged.animals.length !== ANIMAL_DEFS.length) {
      merged.animals = base.animals;
    } else {
      merged.animals = merged.animals.map((animal, index) => ({
        ...base.animals[index],
        ...animal,
      }));
    }
    merged.daily = normalizeDailyState(merged.daily, merged);
    if (!merged.market.contracts?.length) {
      merged.market.contracts = generateTradeContracts(merged);
    }
    if (!merged.world.unlockedRegions.includes("farm")) merged.world.unlockedRegions.unshift("farm");
    if (!SCENE_DEFS[merged.world.scene]) merged.world.scene = "farm";
    if (!merged.world.visitedScenes.includes("farm")) merged.world.visitedScenes.unshift("farm");
    merged.sprites.available = Array.from(new Set([...(merged.sprites.available || []), ...(merged.sprites.unlocked || [])]));
    return merged;
  } catch (error) {
    console.warn("Unable to load game", error);
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.warn("Unable to clear save", error);
  }
}
