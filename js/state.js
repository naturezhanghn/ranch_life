import {
  ANIMAL_DEFS,
  BACKPACK_UPGRADES,
  BIRTHDAYS,
  BRIDGE_QUEST,
  CITY_PROJECTS,
  COLLECTION_DEFS,
  CROPS,
  DAILY_TASK_POOL,
  DAY_START_MINUTES,
  FORAGE_TABLE,
  FESTIVALS,
  GIFT_PREFERENCES,
  GIFT_TAGS,
  FORAGE_NODE_DEFS,
  NIGHT_MINUTES,
  HOUSE_UPGRADES,
  GOVERNMENT_POLICIES,
  ISLAND_DAILY_LIMIT,
  ISLAND_SPOTS,
  MARKET_GOODS,
  MARKET_TIERS,
  MINIGAME_DEFS,
  NPC_TOPICS,
  PLAYER_START,
  POST_GAME_MODIFIERS,
  PRODUCTS,
  PRODUCT_QUALITY_LABELS,
  PRODUCT_QUALITY_MULTIPLIERS,
  REGION_ORDER,
  REGION_SCENE_MAP,
  SAVE_BACKUP_KEY,
  SAVE_KEY,
  SAVE_VERSION,
  SCENE_DEFS,
  SCENE_FINDS,
  SCENE_NPCS,
  SCENE_REGION_MAP,
  SCENE_SEASON_VARIANTS,
  SEASONS,
  SEASON_DAYS,
  SEASONAL_CROP_CALENDAR,
  TOWN_EVENTS,
  SHIPPING_ROUTES,
  WEEKLY_REQUEST_TEMPLATES,
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

function checksumText(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
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
  const tierBonus = MARKET_TIERS[state.market?.tier || 0]?.bonus || 0;
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
    .map(({ rank, ...contract }) => ({
      ...contract,
      reward: Math.round(contract.reward * (1 + tierBonus)),
    }));
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
    recapFacts: [],
    recapOptions: [],
    recapChoice: null,
    recapDay: null,
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
    recapOptions: Array.isArray(source.recapOptions) ? source.recapOptions.slice(0, 2) : [],
    recapFacts: Array.isArray(source.recapFacts) ? source.recapFacts.slice(0, 4) : [],
    recapChoice: typeof source.recapChoice === "string" ? source.recapChoice : null,
    recapDay: Number(source.recapDay) || null,
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
      selectedRoute: "cooperative",
      trip: null,
      tripHistory: [],
    },
    house: { level: 0, upgrades: {}, fridge: {}, storageSlots: 0, kitchen: false },
    forage: {
      available: [],
      collected: {},
      nodes: [],
      claimedNodeIds: [],
      weatherDay: 0,
      expiresDay: 0,
      expiresMinute: 0,
      combo: 0,
      expiryNoted: false,
      legacyMigrated: false,
      lastRefreshDay: 0,
    },
    seasonRoutes: {
      claims: {},
      lastNotice: {},
    },
    collection: {
      entries: [],
      stats: {},
      firstSeenDay: {},
    },
    feedback: {
      events: [],
      seen: {},
      lastEvent: null,
    },
    quests: {
      activeId: null,
      stepIndex: 0,
      completedSteps: [],
      deadlineDay: null,
      retryDay: null,
      expired: false,
      completed: false,
      bridgeMaterials: 0,
    },
    weekly: {
      weekKey: null,
      requests: [],
      acceptedIds: [],
      completedIds: [],
      expiredIds: [],
      deliveredCounts: {},
    },
    festival: {
      activeId: null,
      year: 0,
      activityFlags: {},
      rewardClaimed: false,
      materialRefunded: false,
    },
    town: { eventsSeen: [], birthdayGifts: {}, festivalBonus: 0 },
    plots: createPlots(),
    animals: createAnimals(),
    fishPond: {
      stock: 2,
      capacity: 8,
      health: 72,
      lastHarvestDay: 0,
    },
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
      giftsGiven: 0,
      bridgeCompleted: 0,
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
      npc: {},
    },
    social: {
      topicDay: {},
      giftDay: {},
      giftHistory: [],
      giftLog: [],
    },
    world: {
      activeRegion: "farm",
      scene: "farm",
      visitedScenes: ["farm"],
      sceneVisits: { farm: 1 },
      sceneFinds: {},
      sceneFindRewards: {},
      findSeed: 20261119,
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
      rareHuntDay: 0,
      rareHuntCount: 0,
    },
    market: {
      prices: createMarketPrices(),
      lastRefreshDay: 1,
      trend: "steady",
      reputation: 0,
      shipments: 0,
      tier: 0,
      contractStreak: 0,
      contractChainId: null,
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
      available: ["seedling", "sprout"],
      unlocked: ["seedling"],
      assignments: {
        watering: "seedling",
        planting: null,
        animals: null,
        trade: null,
        island: null,
        fishing: null,
        fishery: null,
      },
      assignmentEfficiency: {
        watering: 1,
        planting: 1,
        animals: 1,
        trade: 1,
        island: 1,
        fishing: 1,
        fishery: 1,
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
      postGameModifier: null,
      postGameDeadline: null,
      postGameProgress: {
        daysElapsed: 0,
        value: 0,
        completed: false,
        failed: false,
        scriptId: null,
      },
      postScriptsSeen: [],
      lastTalkDay: 0,
      talkedNpcs: [],
    },
    settings: {
      sound: true,
    },
  };

  state.daily = generateDailyTasks(state);
  state.market.contracts = generateTradeContracts(state);
  ensureWeeklyBoard(state);
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

export function emitFeedback(state, {
  eventId,
  kind = "info",
  sourceScene = state.world?.scene || "farm",
  severity = "info",
  message,
  dedupeKey = `${eventId}:${state.day}:${sourceScene}`,
  dedupeWindowMs = 1600,
  ttlMs = 2600,
} = {}) {
  if (!state.feedback) state.feedback = { events: [], seen: {}, lastEvent: null };
  const now = Date.now();
  const previous = state.feedback.seen?.[dedupeKey] || 0;
  if (now - previous < dedupeWindowMs) return null;
  state.feedback.seen = state.feedback.seen || {};
  state.feedback.seen[dedupeKey] = now;
  const event = {
    id: `${eventId}:${now}:${state.feedback.events.length}`,
    eventId,
    kind,
    sourceScene,
    severity,
    message: message || eventId,
    dedupeKey,
    day: state.day,
    minute: Math.round(state.minutes),
    createdAt: now,
    expiresAt: now + ttlMs,
  };
  state.feedback.events = [event, ...(state.feedback.events || [])].slice(0, 40);
  state.feedback.lastEvent = event;
  return event;
}

export function getBridgeQuestStep(state) {
  const quest = state.quests;
  if (!quest?.activeId || quest.completed || quest.expired) return null;
  return BRIDGE_QUEST.steps[quest.stepIndex] || null;
}

export function startBridgeQuest(state) {
  const quest = state.quests;
  if (quest.completed) return { ok: false, message: "旧渠木桥已经修好了。" };
  if (quest.activeId && !quest.expired) return { ok: false, message: "修桥路线已经开始了，去当前路牌继续。" };
  if (quest.expired && state.day < (quest.retryDay || 0)) {
    return { ok: false, message: `桥材还在，下一周第 ${quest.retryDay} 天可以重新接上。` };
  }
  quest.activeId = BRIDGE_QUEST.id;
  quest.expired = false;
  quest.retryDay = null;
  quest.deadlineDay = state.day + BRIDGE_QUEST.deadlineDays;
  emitFeedback(state, {
    eventId: "bridge_started",
    kind: "quest",
    severity: "info",
    message: `${BRIDGE_QUEST.title}开工：先去牧场修桥桩。`,
    dedupeKey: `bridge_started:${state.day}`,
  });
  addMemory(state, `你接下了「${BRIDGE_QUEST.title}」。修桥不是一笔私人支出，它会把牧场、港口、议事厅和城市重新连在一起。`, "quest", 3);
  return { ok: true, message: "修桥路线已接下。先去牧场路牌修整桥桩。" };
}

export function advanceBridgeQuest(state) {
  const step = getBridgeQuestStep(state);
  if (!step) {
    return { ok: false, message: state.quests?.completed ? "旧渠木桥已经修好了。" : "先在牧场路牌接下修桥路线。" };
  }
  if (step.scene !== state.world?.scene) {
    return { ok: false, message: `这一步要去${SCENE_DEFS[step.scene]?.name || step.scene}完成。` };
  }
  if (step.cost?.coins && state.coins < step.cost.coins) {
    return { ok: false, message: `还差 ${step.cost.coins - state.coins} 金才能修桥。` };
  }
  if (step.cost?.ore && (state.inventory.resources.ore || 0) < step.cost.ore) {
    return { ok: false, message: `还差 ${step.cost.ore - (state.inventory.resources.ore || 0)} 份矿铜。` };
  }
  if (step.cost?.egg && (state.inventory.produce.egg || 0) < step.cost.egg) {
    return { ok: false, message: `还差 ${step.cost.egg - (state.inventory.produce.egg || 0)} 枚鸡蛋交给木匠。` };
  }
  if (step.cost?.coins) state.coins -= step.cost.coins;
  if (step.cost?.ore) {
    state.inventory.resources.ore -= step.cost.ore;
    state.quests.bridgeMaterials += step.cost.ore;
  }
  if (step.cost?.egg) state.inventory.produce.egg -= step.cost.egg;
  state.minutes = Math.min(24 * 60, state.minutes + 8);
  state.quests.completedSteps.push(step.id);
  state.quests.stepIndex += 1;
  const completed = state.quests.stepIndex >= BRIDGE_QUEST.steps.length;
  if (completed) {
    state.quests.completed = true;
    state.quests.deadlineDay = null;
    state.coins += step.reward?.coins || 0;
    state.stats.earned += step.reward?.coins || 0;
    state.government.civicPoints += step.reward?.civic || 0;
    state.relations.community = bounded(state.relations.community + (step.reward?.community || 0));
    state.stats.bridgeCompleted = (state.stats.bridgeCompleted || 0) + 1;
  }
  emitFeedback(state, {
    eventId: completed ? "bridge_complete" : "bridge_step",
    kind: "quest",
    severity: "success",
    message: completed ? "旧渠木桥修好了，草料车重新进村。" : `完成「${step.actionLabel}」，下一站已经出现在路牌上。`,
    dedupeKey: `bridge_step:${step.id}:${state.day}`,
  });
  addMemory(
    state,
    completed
      ? "旧渠木桥重新通行。修桥的四站没有把功劳归给一个人，桥桩、桥板、印章和回报都被写进了同一份地方记录。"
      : `修桥进度：${step.actionLabel}完成，桥材和已完成步骤会保留到下一次。`,
    "quest",
    3,
  );
  return {
    ok: true,
    step,
    completed,
    nextStep: BRIDGE_QUEST.steps[state.quests.stepIndex] || null,
    message: completed ? "旧渠木桥修好了，城市回报已经到账。" : `「${step.actionLabel}」完成，去下一块路牌。`,
  };
}

function weeklyBoardKey(state) {
  const week = Math.floor((state.day - 1) / 7) + 1;
  return `${state.season}-${week}`;
}

function weeklyDeadlineDay(state) {
  return (Math.floor((state.day - 1) / 7) + 1) * 7 + 1;
}

export function ensureWeeklyBoard(state, force = false) {
  if (!state.weekly) {
    state.weekly = {
      weekKey: null,
      requests: [],
      acceptedIds: [],
      completedIds: [],
      expiredIds: [],
      deliveredCounts: {},
    };
  }
  const key = weeklyBoardKey(state);
  if (!force && state.weekly.weekKey === key && state.weekly.requests.length) return state.weekly;
  const week = Math.floor((state.day - 1) / 7);
  const seasonOffset = SEASONS.indexOf(state.season);
  const firstIndex = (week * 2 + seasonOffset) % WEEKLY_REQUEST_TEMPLATES.length;
  const templates = [0, 1].map((offset) => (
    WEEKLY_REQUEST_TEMPLATES[(firstIndex + offset) % WEEKLY_REQUEST_TEMPLATES.length]
  ));
  state.weekly = {
    weekKey: key,
    requests: templates.map((template) => ({
      ...template,
      requirements: { ...template.requirements },
      deadlineDay: weeklyDeadlineDay(state),
      accepted: false,
      completed: false,
      expired: false,
    })),
    acceptedIds: [],
    completedIds: state.weekly.completedIds || [],
    expiredIds: state.weekly.expiredIds || [],
    deliveredCounts: state.weekly.deliveredCounts || {},
  };
  return state.weekly;
}

export function getActiveFestival(state) {
  const definition = Object.values(FESTIVALS).find((festival) => (
    festival.season === state.season && festival.day === state.seasonDay
  ));
  if (!definition) return null;
  const year = Math.floor((state.day - 1) / (SEASON_DAYS * SEASONS.length)) + 1;
  if (
    !state.festival
    || state.festival.activeId !== definition.id
    || state.festival.year !== year
  ) {
    state.festival = {
      activeId: definition.id,
      year,
      activityFlags: {},
      rewardClaimed: false,
      materialRefunded: false,
    };
  }
  return { ...definition, year, flags: state.festival.activityFlags, rewardClaimed: state.festival.rewardClaimed };
}

export function joinFestivalActivity(state, activityId) {
  const festival = getActiveFestival(state);
  if (!festival) return { ok: false, message: "今天港口没有节日活动。" };
  const activity = festival.activities.find((entry) => entry.id === activityId);
  if (!activity) return { ok: false, message: "这个摊位还没有开张。" };
  if (state.festival.activityFlags[activityId]) return { ok: false, message: "这项节日活动今天已经完成了。" };
  if (activity.cost?.coins && state.coins < activity.cost.coins) {
    return { ok: false, message: `还差 ${activity.cost.coins - state.coins} 金才能参加。` };
  }
  if (activity.cost?.turnip && (state.inventory.produce.turnip || 0) < activity.cost.turnip) {
    return { ok: false, message: "背包里没有足够的白萝卜来折潮灯。" };
  }
  if (activity.cost?.coins) state.coins -= activity.cost.coins;
  if (activity.cost?.turnip) state.inventory.produce.turnip -= activity.cost.turnip;
  state.festival.activityFlags[activityId] = true;
  state.relations.community = bounded(state.relations.community + (activity.community || 0));
  state.market.reputation += activity.reputation || 0;
  const completed = Object.keys(state.festival.activityFlags).length;
  let reward = null;
  if (completed >= 2 && !state.festival.rewardClaimed) {
    state.festival.rewardClaimed = true;
    state.coins += festival.reward.coins;
    state.stats.earned += festival.reward.coins;
    state.government.civicPoints += festival.reward.civic;
    state.relations.community = bounded(state.relations.community + festival.reward.community);
    reward = festival.reward;
  }
  emitFeedback(state, {
    eventId: reward ? "festival_complete" : "festival_activity",
    kind: "festival",
    severity: "success",
    sourceScene: "port",
    message: reward
      ? `${festival.name}完成两项活动，获得 ${reward.coins} 金和 ${reward.civic} 公民点。`
      : `${activity.label}完成，节日现场又多了一盏灯。`,
    dedupeKey: `festival:${festival.id}:${festival.year}:${activityId}`,
  });
  addMemory(state, `${festival.name}：${activity.detail}${reward ? ` 完成两项现场活动，获得节日回报。` : ""}`, "festival", 3);
  return {
    ok: true,
    activity,
    completed,
    reward,
    message: reward
      ? `${festival.name}完成两项活动，获得 ${reward.coins} 金。`
      : `${activity.label}完成，还差 ${Math.max(0, 2 - completed)} 项领取节日回报。`,
  };
}

export function acceptWeeklyRequest(state, requestId) {
  const board = ensureWeeklyBoard(state);
  const request = board.requests.find((entry) => entry.id === requestId);
  if (!request) return { ok: false, message: "这周的公告板上没有这项请求。" };
  if (request.expired || request.completed) return { ok: false, message: "这项请求已经结束。" };
  if (request.accepted) return { ok: false, message: "这项请求已经在你的清单里。" };
  if (board.acceptedIds.length >= 2) return { ok: false, message: "一周最多同时接两项公共请求。" };
  request.accepted = true;
  board.acceptedIds.push(request.id);
  emitFeedback(state, {
    eventId: "weekly_accepted",
    kind: "quest",
    severity: "info",
    sourceScene: "city",
    message: `接下本周公共请求「${request.title}」，第 ${request.deadlineDay} 天截止。`,
    dedupeKey: `weekly_accepted:${request.id}:${board.weekKey}`,
  });
  addMemory(state, `你接下了本周公共请求「${request.title}」，期限是第 ${request.deadlineDay} 天清晨。`, "quest", 2);
  return { ok: true, request, message: `已接下「${request.title}」。` };
}

export function deliverWeeklyRequest(state, requestId) {
  const board = ensureWeeklyBoard(state);
  const request = board.requests.find((entry) => entry.id === requestId);
  if (!request) return { ok: false, message: "这周的公告板上没有这项请求。" };
  if (!request.accepted) return { ok: false, message: "先在公告板接下这项请求。" };
  if (request.completed) return { ok: false, message: "这项请求已经交付。" };
  if (request.expired) return { ok: false, message: "这项请求已经过期。" };
  const missing = Object.entries(request.requirements).find(([itemId, amount]) =>
    inventoryQuantity(state, itemId) < amount,
  );
  if (missing) {
    const item = MARKET_GOODS[missing[0]] || PRODUCTS[missing[0]];
    return { ok: false, message: `还缺 ${missing[1] - inventoryQuantity(state, missing[0])} 份${item?.name || missing[0]}。` };
  }
  for (const [itemId, amount] of Object.entries(request.requirements)) {
    consumeInventoryItem(state, itemId, amount);
  }
  request.completed = true;
  board.completedIds.push(request.id);
  board.deliveredCounts[request.id] = (board.deliveredCounts[request.id] || 0) + 1;
  state.coins += request.reward;
  state.stats.earned += request.reward;
  state.government.civicPoints += request.civic;
  state.market.reputation += request.reputation;
  emitFeedback(state, {
    eventId: "weekly_delivered",
    kind: "quest",
    severity: "success",
    message: `本周公共请求「${request.title}」交付完成。`,
    dedupeKey: `weekly_delivered:${request.id}:${board.weekKey}`,
  });
  addMemory(state, `你交付了本周公共请求「${request.title}」，获得 ${request.reward} 金、${request.civic} 公民点和 ${request.reputation} 声誉。`, "quest", 3);
  return { ok: true, request, message: `交付「${request.title}」，获得 ${request.reward} 金。` };
}

function expireWeeklyRequests(state, report, checkDay = state.day) {
  const board = ensureWeeklyBoard(state);
  for (const request of board.requests) {
    if (!request.accepted || request.completed || request.expired) continue;
    if (checkDay < request.deadlineDay) continue;
    request.expired = true;
    board.expiredIds.push(request.id);
    state.market.reputation = Math.max(0, state.market.reputation - 2);
    state.government.civicPoints = Math.max(0, state.government.civicPoints - 1);
    report.weeklyExpired.push(request.title);
    emitFeedback(state, {
      eventId: "weekly_expired",
      kind: "quest",
      severity: "warning",
      sourceScene: "city",
      message: `公共请求「${request.title}」未在周末交付，公民点和声誉下降。`,
      dedupeKey: `weekly_expired:${request.id}:${board.weekKey}`,
    });
    addMemory(state, `本周公共请求「${request.title}」过期。公告板留下了空白，下一周会换一批请求。`, "risk", 3);
  }
}

export function getSceneSeasonVariant(state, sceneId = state.world?.scene || "farm") {
  return SCENE_SEASON_VARIANTS[sceneId]?.[state.season] || null;
}

export function getPostGameModifier(state) {
  return POST_GAME_MODIFIERS.find((modifier) => modifier.id === state.story?.postGameModifier) || null;
}

export function choosePostGameModifier(state, modifierId) {
  const modifier = POST_GAME_MODIFIERS.find((entry) => entry.id === modifierId);
  if (!modifier) return { ok: false, message: "没有这张修正牌。" };
  if (!state.story.ending && !state.story.endingSeen) {
    return { ok: false, message: "先走完首周结局，再选择修正牌。" };
  }
  if (state.story.postGameModifier) {
    return { ok: false, message: "这一周已经有一张修正牌了。" };
  }
  state.story.postGameModifier = modifier.id;
  state.story.postGameDeadline = state.day + modifier.durationDays;
  state.story.postGameProgress = {
    daysElapsed: 0,
    value: 0,
    completed: false,
    failed: false,
    scriptId: null,
  };
  state.story.postScriptsSeen = [];
  state.story.step = "postGame";
  if (modifier.id === "publicLedger") state.government.civicPoints += 2;
  if (modifier.id === "handCare") state.relations.community = bounded(state.relations.community + 3);
  if (modifier.id === "drySeason") {
    state.relations.ecology = bounded(state.relations.ecology + 3);
    state.maxWater = Math.min(state.maxWater, 12);
    state.water = Math.min(state.water, state.maxWater);
  }
  addMemory(state, `结局后的修正牌「${modifier.title}」：${modifier.constraint}${modifier.boon}`, "decision", 4);
  return { ok: true, modifier };
}

function advancePostGameDay(state, report, closingRecapChoice) {
  const modifier = getPostGameModifier(state);
  if (!modifier) return null;
  const progress = state.story.postGameProgress;
  if (progress.completed || progress.failed) return null;
  progress.daysElapsed += 1;
  if (modifier.goal.type === "publicActions" && closingRecapChoice === "public") {
    progress.value += 1;
  } else if (modifier.goal.type === "careDays" && report.animalsUnfed.length === 0) {
    progress.value += 1;
  } else if (modifier.goal.type === "surviveDays" && state.relations.community >= 50) {
    progress.value += 1;
  }
  if (progress.value >= modifier.goal.target) {
    progress.completed = true;
    progress.scriptId = `${modifier.id}:epilogue`;
    if (!state.story.postScriptsSeen.includes(progress.scriptId)) {
      state.story.postScriptsSeen.push(progress.scriptId);
    }
    addMemory(state, `后日谈完成：修正牌「${modifier.title}」的牌面目标达成。${modifier.epilogue.note}`, "story", 4);
  } else if (progress.daysElapsed >= modifier.durationDays) {
    progress.failed = true;
    progress.scriptId = `${modifier.id}:fail`;
    if (!state.story.postScriptsSeen.includes(progress.scriptId)) {
      state.story.postScriptsSeen.push(progress.scriptId);
    }
    addMemory(state, `后日谈结束：修正牌「${modifier.title}」没有完成牌面目标。${modifier.fail.note}`, "risk", 3);
  }
  report.postGame = {
    modifierId: modifier.id,
    title: modifier.title,
    value: progress.value,
    target: modifier.goal.target,
    label: modifier.goal.label,
    daysElapsed: progress.daysElapsed,
    deadline: state.story.postGameDeadline,
    completed: progress.completed,
    failed: progress.failed,
    scriptId: progress.scriptId,
  };
  return report.postGame;
}

function buildDailyRecapOptions(state, report, closingDay) {
  const completed = report.dailyTasks?.completed?.length || 0;
  const incomplete = report.dailyTasks?.incomplete?.length || 0;
  const collected = report.forageStats?.collected || 0;
  const products = report.products?.length || 0;
  const facts = [
    `今日清单：完成 ${completed} 项，未完成 ${incomplete} 项。`,
    collected
      ? `山货与季节路线：采到 ${collected} 份，窗口结束后节点会收起。`
      : products
        ? `牲畜棚留下了 ${products} 件产品，明天的现金流有了着落。`
        : "今天没有新的采集或牲畜产品，时间更多花在照料和判断上。",
    `社区信任 ${Math.round(state.relations.community)} · 生态韧性 ${Math.round(state.relations.ecology)} · 牧心信任 ${Math.round(state.ai.trust)}。`,
  ];
  return {
    day: closingDay,
    facts,
    options: [
      {
        id: "ai",
        label: "写进牧心",
        detail: "让牧心把今天的取舍纳入长期记忆，优先提高它的信任与判断权重。",
        effect: "牧心信任 +2",
        facts,
      },
      {
        id: "public",
        label: "转为公共行动",
        detail: "把今天的经验整理成村务建议，让社区共享这段判断，而不是只留在机器里。",
        effect: "公民点 +1 · 社区信任 +1",
        facts,
      },
    ],
  };
}

export function resolveDailyRecap(state, choiceId) {
  const options = Array.isArray(state.daily?.recapOptions) ? state.daily.recapOptions : [];
  const option = options.find((entry) => entry.id === choiceId);
  if (!option) return { ok: false, message: "这不是今天留下的一个解释。" };
  if (state.daily.recapChoice) return { ok: false, message: "今天的日结解释已经写下了。" };
  state.daily.recapChoice = option.id;
  if (option.id === "ai") {
    state.ai.trust = bounded(state.ai.trust + 2);
    addMemory(state, `日结解释写入牧心：你选择让机器记住今天的取舍，牧心信任提高了 2 点。`, "routine", 3);
  } else {
    state.government.civicPoints += 1;
    state.relations.community = bounded(state.relations.community + 1);
    addMemory(state, `日结解释转为公共行动：你把今天的经验带进村务讨论，公民点 +1，社区信任 +1。`, "routine", 3);
  }
  return { ok: true, option };
}

export function collectSeasonalLandmark(state, sceneId = state.world?.scene || "farm") {
  const variant = getSceneSeasonVariant(state, sceneId);
  const landmark = variant?.landmark;
  if (!variant || !landmark) return { ok: false, message: "这条季节小径还没有出现。" };
  const claimKey = `${state.season}:${sceneId}:${landmark.id}`;
  state.seasonRoutes = state.seasonRoutes || { claims: {}, lastNotice: {} };
  state.seasonRoutes.claims = state.seasonRoutes.claims || {};
  if ((state.seasonRoutes.claims[claimKey] || 0) === state.day) {
    emitFeedback(state, {
      eventId: "season_claimed",
      kind: "season",
      severity: "info",
      message: "这条季节小径今天已经走过了。",
      dedupeKey: `${claimKey}:${state.day}`,
    });
    return { ok: false, message: "这条季节小径今天已经走过了，明天再来看看。" };
  }
  if (state.energy < 1) {
    emitFeedback(state, {
      eventId: "season_energy",
      kind: "season",
      severity: "warning",
      message: "体力不够，先回去休息，季节小径不会在今天消失。",
      dedupeKey: `season_energy:${state.day}`,
    });
    return { ok: false, message: "体力不够，先在附近歇一会儿吧。" };
  }
  const item = (FORAGE_TABLE[state.season] || []).find((entry) => entry.id === landmark.itemId);
  if (!item) return { ok: false, message: "这里今天的季节物还没有成熟。" };
  state.energy -= 1;
  state.minutes = Math.min(24 * 60, state.minutes + 6);
  state.inventory.resources[item.id] = (state.inventory.resources[item.id] || 0) + 1;
  state.seasonRoutes.claims[claimKey] = state.day;
  emitFeedback(state, {
    eventId: "season_gathered",
    kind: "season",
    severity: "success",
    message: `沿${variant.routeLabel}采到${item.name}。`,
    dedupeKey: `${claimKey}:${state.day}`,
  });
  recordCollection(
    state,
    "forage",
    item.id,
    item.name,
    `${SCENE_DEFS[sceneId]?.name || sceneId} · ${variant.label}`,
  );
  bumpCounter(state, "foraged");
  state.relations.ecology = bounded(state.relations.ecology + 1);
  addMemory(
    state,
    `${landmark.detail}你在${variant.routeLabel}采到${item.name}，并把这条季节路线记进地方志。`,
    "forage",
    2,
  );
  return {
    ok: true,
    itemId: item.id,
    item,
    variant,
    landmark,
    message: `沿${variant.routeLabel}采到${item.name}。本季这条路今天已经走完了。`,
  };
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

function summarizeDailyTasks(state) {
  const tasks = Array.isArray(state.daily?.tasks) ? state.daily.tasks : [];
  const completed = tasks
    .filter((task) => task.done || task.rewarded)
    .map((task) => ({
      id: task.id,
      text: task.text,
      reward: Number(task.reward) || 0,
    }));
  const incomplete = tasks
    .filter((task) => !task.done && !task.rewarded)
    .map((task) => ({
      id: task.id,
      text: task.text,
      progress: Math.min(state.daily?.counters?.[task.counter] || 0, task.target),
      target: task.target,
    }));
  return {
    completed,
    incomplete,
    reward: completed.reduce((total, task) => total + task.reward, 0),
  };
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

export function selectShippingRoute(state, routeId) {
  const route = SHIPPING_ROUTES[routeId];
  if (!route) return { ok: false, message: "没有这条航运路线。" };
  state.shipping.selectedRoute = routeId;
  addMemory(state, `你把下一批出货安排在${route.name}：${route.description}`, "economy", 1);
  return {
    ok: true,
    route,
    message: state.shipping.trip
      ? `下一批货物将走${route.name}；当前航次仍按原路线结算。`
      : `已选择${route.name}，下一班船在 ${formatClock(route.departMinute)}。`,
  };
}

export function shipProduce(state, routeId = state.shipping.selectedRoute) {
  const route = SHIPPING_ROUTES[routeId] || SHIPPING_ROUTES.cooperative;
  let units = 0;
  let estimatedValue = 0;
  const consignments = [];
  const consumed = [];
  const qualityCounts = {};
  for (const [qualityId, count] of Object.entries(state.inventory.qualityProduce || {})) {
    if (count <= 0) continue;
    const [itemId, quality] = qualityId.split("_");
    if (!PRODUCTS[itemId] || !PRODUCT_QUALITY_MULTIPLIERS[quality]) continue;
    consignments.push({ itemId, quality, amount: count, unitPrice: qualityProductPrice(itemId, quality) });
    qualityCounts[itemId] = (qualityCounts[itemId] || 0) + count;
    consumed.push({ bucket: "qualityProduce", id: qualityId, amount: count });
  }
  for (const [itemId, count] of Object.entries(state.inventory.produce)) {
    if (count > 0) {
      const product = PRODUCTS[itemId];
      if (!product) continue;
      const remainder = Math.max(0, count - (qualityCounts[itemId] || 0));
      if (!remainder) {
        continue;
      }
      consignments.push({ itemId, quality: null, amount: remainder, unitPrice: product.sellPrice });
      consumed.push({ bucket: "produce", id: itemId, amount: remainder });
    }
  }
  for (const [itemId, count] of Object.entries(state.inventory.resources || {})) {
    if (count <= 0 || !MARKET_GOODS[itemId]) continue;
    consignments.push({ itemId, quality: null, amount: count, unitPrice: getMarketPrice(state, itemId) });
    consumed.push({ bucket: "resources", id: itemId, amount: count });
  }
  for (const consignment of consignments) {
    units += consignment.amount;
    estimatedValue += consignment.amount * consignment.unitPrice;
  }
  if (units === 0) {
    return { ok: false, message: "出货箱里还没有可以隔夜结算的农产品。" };
  }
  const existingTrip = state.shipping.trip;
  if (existingTrip && state.day >= existingTrip.departDay
    && (state.day > existingTrip.departDay || state.minutes > existingTrip.departMinute)) {
    return { ok: false, message: "这一班船已经离港，货物留在出货箱里，等下一班。" };
  }
  for (const item of consumed) {
    state.inventory[item.bucket][item.id] = Math.max(0, (state.inventory[item.bucket][item.id] || 0) - item.amount);
  }
  let trip = existingTrip;
  if (!trip) {
    const departDay = state.minutes <= route.departMinute ? state.day : state.day + 1;
    trip = {
      routeId: route.id,
      departDay,
      departMinute: route.departMinute,
      arrivalDay: departDay + route.arrivalDays,
      manifest: [],
    };
    state.shipping.trip = trip;
  }
  trip.manifest.push(...consignments);
  state.shipping.pending.push(...consignments);
  state.shipping.dailyConsignedUnits += units;
  state.shipping.dailyConsignedValue += estimatedValue;
  bumpCounter(state, "shipped", units);
  addMemory(state, `你把 ${units} 份农产品放进出货箱，安排${route.name}，估值 ${estimatedValue} 金，预计第 ${trip.arrivalDay} 天到港。`, "economy", 2);
  return {
    ok: true,
    message: `交付了 ${units} 份产品，估值 ${estimatedValue} 金。${route.name}预计第 ${trip.arrivalDay} 天到港。`,
    income: estimatedValue,
    units,
    trip,
    arrivalDay: trip.arrivalDay,
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
  const qualityCount = Object.entries(state.inventory.qualityProduce || {})
    .filter(([key]) => key.startsWith(`${itemId}_`))
    .reduce((total, [, count]) => total + (Number(count) || 0), 0);
  return (state.inventory.produce[itemId] || 0) + (state.inventory.resources[itemId] || 0) + qualityCount;
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
  const payout = getPostGameModifier(state)?.id === "publicLedger"
    ? Math.round(contract.reward * 0.8)
    : contract.reward;
  contract.completed = true;
  state.coins += payout;
  state.stats.earned += payout;
  state.stats.contractsFulfilled += 1;
  state.market.reputation += contract.reputation;
  state.market.contractStreak = (state.market.contractStreak || 0) + 1;
  state.market.contractChainId = contract.id;
  state.government.civicPoints += 1;
  let tierMessage = "";
  if (state.market.contractStreak >= 3 && (state.market.tier || 0) < MARKET_TIERS.length - 1) {
    state.market.tier = (state.market.tier || 0) + 1;
    state.market.contractStreak = 0;
    tierMessage = ` 航线等级提升为${MARKET_TIERS[state.market.tier].name}。`;
    addMemory(state, `连续完成三份订单，港口把你的航线等级提升为${MARKET_TIERS[state.market.tier].name}。`, "economy", 4);
  }
  if (state.stats.contractsFulfilled >= 3 && !state.sprites.available.includes("ember")) {
    state.sprites.available.push("ember");
    addMemory(state, "完成三份贸易订单后，烬烬终于愿意把自己的名字写进工坊名册。", "social", 3);
  }
  addMemory(state, `你完成「${contract.title}」，港口声誉提高了 ${contract.reputation}。`, "economy", 3);
  return {
    ok: true,
    message: `订单完成，获得 ${payout} 金和 ${contract.reputation} 点声誉。${tierMessage}${payout < contract.reward ? " 修正牌「公共账本」抽取了 20% 进入公共记录。" : ""}`,
    contract,
    payout,
    tierMessage,
  };
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
  const variant = getSceneSeasonVariant(state, sceneId);
  const noticeKey = `${state.season}:${sceneId}:${state.day}`;
  state.seasonRoutes = state.seasonRoutes || { claims: {}, lastNotice: {} };
  state.seasonRoutes.lastNotice = state.seasonRoutes.lastNotice || {};
  const shouldNotice = variant && !state.seasonRoutes.lastNotice[noticeKey];
  if (shouldNotice) state.seasonRoutes.lastNotice[noticeKey] = true;
  addMemory(
    state,
    `${mode === "quick" ? "你使用已走过的路线快速抵达" : "你沿着道路抵达"}${scene.name}。这里的声音和牧场不同。${shouldNotice ? `${variant.label}已经在路边显出来：${variant.routeLabel}。` : ""}`,
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
    for (const spriteId of ["angler", "pondling"]) {
      if (!state.sprites.available.includes(spriteId)) state.sprites.available.push(spriteId);
    }
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
  const roles = ["watering", "planting", "animals", "trade", "island", "fishing", "fishery"];
  const roleLabels = {
    watering: "浇水",
    planting: "播种",
    animals: "牲畜",
    trade: "贸易",
    island: "海岛探索",
    fishing: "钓鱼",
    fishery: "养鱼",
  };
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
    message: `${sprite.name}现在负责${roleLabels[role]}。${efficiency < 1 ? "这是跨岗分工，效率约为主职的一半。" : "它正在做最擅长的工作。"}`,
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
    const misses = Math.max(0, Math.floor(Number(result.misses) || 0));
    let rareHits = Math.min(1, Math.max(0, Math.floor(Number(result.rareHits) || 0)));
    if (rareHits && state.island?.rareHuntDay === state.day) rareHits = 0;
    const seasonMultiplier = { 春: 1, 夏: 1.02, 秋: 1.05, 冬: 1.08 }[state.season] || 1;
    const rareValue = Math.round(118 * seasonMultiplier) * rareHits;
    const coins = hits * 10;
    state.coins += coins;
    state.stats.earned += coins;
    state.stats.minigameHits += hits;
    state.relations.ecology = bounded(state.relations.ecology + (hits >= 4 ? 2 : 1));
    state.market.reputation += Math.min(2, (hits > 0 ? 1 : 0) + (rareHits > 0 ? 1 : 0));
    if (rareHits > 0) {
      state.inventory.resources.pearl += rareHits;
      state.island.rareHuntDay = state.day;
      state.island.rareHuntCount = (state.island.rareHuntCount || 0) + rareHits;
    }
    let failPenalty = 0;
    if (hits === 0 && misses > 0) {
      failPenalty = Math.min(3, 1 + Math.floor(misses / 2));
      state.energy = Math.max(0, state.energy - failPenalty);
    }
    bumpCounter(state, "explored");
    addMemory(
      state,
      `湿地巡护结束：驱离 ${hits} 只偷食鸟${rareHits ? `，安全标记 ${rareHits} 只稀有候鸟` : ""}，获得 ${coins} 金巡护补贴。${rareHits && state.island.rareHuntDay === state.day && state.island.rareHuntCount === rareHits ? "今日稀有捕获额度已使用。" : ""}`,
      "care",
      2,
    );
    return {
      ok: true,
      type,
      coins,
      hits,
      rareHits,
      rareValue,
      failPenalty,
      message: `巡护完成：驱离 ${hits} 只斑翅雀${rareHits ? `，标记 ${rareHits} 只稀有候鸟` : ""}，获得 ${coins} 金${rareHits ? `，并带回价值约 ${rareValue} 金的月光珍珠` : ""}。${failPenalty ? ` 空手而归额外消耗 ${failPenalty} 体力。` : ""}`,
    };
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
  if (getPostGameModifier(state)?.id === "handCare") {
    report.helperActions.push("修正牌「手工周」：小精灵暂停自动工作，照料必须由你亲自完成。");
    return;
  }
  const assignments = state.sprites?.assignments || {};
  if (assignments.planting) {
    const spriteId = assignments.planting;
    const efficiency = state.sprites.assignmentEfficiency?.planting || 1;
    const cropId = state.selectedSeed;
    const crop = CROPS[cropId];
    const calendar = SEASONAL_CROP_CALENDAR[cropId];
    const canPlant = crop && (!calendar || calendar.seasons.includes(state.season));
    let planted = 0;
    const limit = efficiency >= 1 ? 2 : 1;
    if (canPlant && (state.inventory.seeds[cropId] || 0) > 0) {
      for (const plot of state.plots) {
        if (planted >= limit || (state.inventory.seeds[cropId] || 0) <= 0) break;
        if (plot.crop) continue;
        if (plot.state !== "tilled") {
          plot.state = "tilled";
          bumpCounter(state, "tilled");
        }
        plot.crop = cropId;
        plot.growth = 0;
        plot.watered = false;
        plot.wateredDays = 0;
        state.inventory.seeds[cropId] -= 1;
        planted += 1;
        bumpCounter(state, "planted");
        if (state.story.step === "plantSeeds") {
          state.story.plantedForStory += 1;
          if (state.story.plantedForStory >= 3) state.story.step = "firstNight";
        }
      }
    }
    if (planted) report.helperActions.push(`${SPRITE_DEFS[spriteId]?.name || "员工"}替你开垦并播下了 ${planted} 颗${crop.name}${efficiency < 1 ? "（跨岗效率较低）" : ""}`);
  }

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
    const limit = efficiency >= 1 ? state.animals.length : 1;
    const animals = state.animals
      .filter((entry) => !entry.fed)
      .sort((a, b) => a.mood - b.mood)
      .slice(0, limit);
    let cared = 0;
    for (const animal of animals) {
      if (state.feed <= 0) break;
      animal.fed = true;
      state.feed -= 1;
      animal.mood = Math.min(100, animal.mood + (efficiency >= 1 ? 4 : 2));
      animal.affection = Math.min(100, animal.affection + (efficiency >= 1 ? 2 : 1));
      bumpCounter(state, "fed");
      cared += 1;
    }
    if (cared) report.helperActions.push(`${SPRITE_DEFS[assignments.animals]?.name || "员工"}照顾了 ${cared} 只牲畜${efficiency < 1 ? "（跨岗效率较低）" : ""}`);
  }

  if (assignments.fishing && state.world.unlockedRegions.includes("island")) {
    const efficiency = state.sprites.assignmentEfficiency?.fishing || 1;
    if (efficiency >= 1) {
      state.inventory.resources.tidefish = (state.inventory.resources.tidefish || 0) + 1;
      state.stats.fishCaught += 1;
      bumpCounter(state, "explored");
      report.helperActions.push(`${SPRITE_DEFS[assignments.fishing]?.name || "员工"}沿潮汐路线钓回了 1 条鱼`);
    } else {
      report.helperActions.push("跨岗钓鱼今天没有找到合适的潮位");
    }
  }

  if (assignments.fishery && state.fishPond) {
    const efficiency = state.sprites.assignmentEfficiency?.fishery || 1;
    const pond = state.fishPond;
    const growth = efficiency >= 1 ? 2 : 1;
    pond.stock = Math.min(pond.capacity, pond.stock + growth);
    pond.health = Math.min(100, pond.health + 4);
    if (pond.stock >= 3) {
      pond.stock -= 1;
      pond.lastHarvestDay = state.day;
      state.inventory.resources.tidefish = (state.inventory.resources.tidefish || 0) + 1;
      state.stats.fishCaught += 1;
      report.helperActions.push(`${SPRITE_DEFS[assignments.fishery]?.name || "员工"}照看鱼塘并收获了 1 条鲜鱼`);
    } else {
      report.helperActions.push(`${SPRITE_DEFS[assignments.fishery]?.name || "员工"}给鱼塘添了鱼食，鱼群正在长大`);
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
      state.market.contractStreak = 0;
      state.market.contractChainId = null;
      report?.expiredContracts?.push(contract.title);
      emitFeedback(state, {
        eventId: "contract_expired",
        kind: "order",
        severity: "warning",
        sourceScene: "port",
        message: `订单「${contract.title}」已经过期，声誉和公民点下降。`,
        dedupeKey: `contract_expired:${contract.id}:${state.day}`,
      });
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
  const trip = state.shipping.trip;
  const route = SHIPPING_ROUTES[trip?.routeId] || SHIPPING_ROUTES.cooperative;
  if (trip && state.day + 1 < trip.arrivalDay) {
    if (report) {
      report.shipping = {
        units: 0,
        value: 0,
        items: [],
        delayed: true,
        route: route.name,
        arrivalDay: trip.arrivalDay,
      };
    }
    return { units: 0, value: 0, items: [], delayed: true, arrivalDay: trip.arrivalDay };
  }
  let units = 0;
  let value = 0;
  const items = [];
  for (const item of pending) {
    const itemValue = item.amount * item.unitPrice;
    units += item.amount;
    value += itemValue;
    items.push({ ...item, value: itemValue });
  }
  const volatility = route.risk
    ? 1 + (nextRandom(state) * 2 - 1) * route.risk
    : 1;
  const gross = Math.max(0, Math.round(value * route.priceMultiplier * volatility));
  const fee = Math.round(gross * route.feeRate);
  const payout = Math.max(0, gross - fee);
  state.coins += payout;
  state.stats.earned += payout;
  state.shipping.totalUnits += units;
  state.shipping.totalValue += payout;
  state.shipping.settlements.unshift({ day: state.day, units, value: payout, gross, fee, route: route.id });
  state.shipping.settlements = state.shipping.settlements.slice(0, 12);
  state.shipping.pending = [];
  state.shipping.trip = null;
  state.shipping.dailyConsignedUnits = 0;
  state.shipping.dailyConsignedValue = 0;
  state.shipping.tripHistory.unshift({
    day: state.day,
    route: route.id,
    routeName: route.name,
    units,
    gross,
    fee,
    payout,
  });
  state.shipping.tripHistory = state.shipping.tripHistory.slice(0, 12);
  addMemory(state, `${route.name}结算了 ${units} 份产品：毛收入 ${gross} 金，手续费 ${fee} 金，到账 ${payout} 金。`, "economy", 3);
  if (report) report.shipping = { units, value: payout, gross, fee, route: route.name, items };
  return { units, value: payout, gross, fee, items };
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

const FORAGE_WINDOW_MINUTES = DAY_START_MINUTES + 180;

function forageItemForSeason(state, itemId) {
  return (FORAGE_TABLE[state.season] || []).find((entry) => entry.id === itemId) || null;
}

function forageNodeIsActive(state, node) {
  return Boolean(
    node
      && !node.claimed
      && node.scene === (state.world?.scene || "farm")
      && node.expiresDay === state.day
      && state.minutes <= node.expiresMinute,
  );
}

function buildForageNodes(state, rainWindow) {
  const table = FORAGE_TABLE[state.season] || [];
  const nodes = [];
  const weatherDay = rainWindow ? state.day - 1 : 0;
  const expiresMinute = rainWindow ? FORAGE_WINDOW_MINUTES : NIGHT_MINUTES;
  for (const item of table) {
    const guaranteed = rainWindow && nodes.length === 0;
    if (!guaranteed && nextRandom(state) >= item.chance) continue;
    const definition = FORAGE_NODE_DEFS[Math.floor(nextRandom(state) * FORAGE_NODE_DEFS.length)] || FORAGE_NODE_DEFS[0];
    nodes.push({
      id: `${state.day}:${definition.id}:${item.id}`,
      interactionId: definition.interactionId,
      scene: definition.scene,
      x: definition.x,
      y: definition.y,
      radius: definition.radius,
      itemId: item.id,
      spawnDay: state.day,
      weatherDay,
      expiresDay: state.day,
      expiresMinute,
      claimed: false,
    });
  }
  return nodes;
}

function normalizeForageState(forage, state) {
  const source = forage && typeof forage === "object" ? forage : {};
  const available = Array.isArray(source.available)
    ? source.available.filter((itemId) => forageItemForSeason(state, itemId))
    : [];
  const collected = source.collected && typeof source.collected === "object" ? { ...source.collected } : {};
  const rawNodes = Array.isArray(source.nodes) ? source.nodes : [];
  const migratingLegacy = rawNodes.length === 0 && available.length > 0;
  const legacyRefreshDay = Number(source.lastRefreshDay) || 0;
  const legacyExpiresDay = Number(source.expiresDay) || (legacyRefreshDay === state.day ? state.day : 0);
  const nodes = rawNodes
    .filter((node) => (
      node
      && typeof node.id === "string"
      && typeof node.scene === "string"
      && Number.isFinite(Number(node.x))
      && Number.isFinite(Number(node.y))
      && forageItemForSeason(state, node.itemId)
    ))
    .map((node) => ({
      ...node,
      x: Number(node.x),
      y: Number(node.y),
      expiresDay: Math.max(0, Number(node.expiresDay) || (legacyRefreshDay === state.day ? state.day : 0)),
      expiresMinute: Math.max(DAY_START_MINUTES, Number(node.expiresMinute) || NIGHT_MINUTES),
      claimed: Boolean(node.claimed),
    }));
  if (!nodes.length && available.length) {
    available.slice(0, FORAGE_NODE_DEFS.length).forEach((itemId, index) => {
      const definition = FORAGE_NODE_DEFS[index % FORAGE_NODE_DEFS.length];
      nodes.push({
        id: `legacy:${state.day}:${definition.id}:${itemId}`,
        interactionId: definition.interactionId,
        scene: definition.scene,
        x: definition.x,
        y: definition.y,
        radius: definition.radius,
        itemId,
        spawnDay: state.day,
        weatherDay: Number(source.weatherDay) || 0,
        expiresDay: Math.max(0, legacyExpiresDay),
        expiresMinute: Math.max(DAY_START_MINUTES, Number(source.expiresMinute) || NIGHT_MINUTES),
        claimed: Boolean(collected[itemId]),
      });
    });
  }
  const claimedNodeIds = Array.from(new Set(
    (Array.isArray(source.claimedNodeIds) ? source.claimedNodeIds : [])
      .filter((id) => nodes.some((node) => node.id === id)),
  ));
  nodes.forEach((node) => {
    if (node.claimed && !claimedNodeIds.includes(node.id)) claimedNodeIds.push(node.id);
  });
  return {
    ...state.forage,
    ...source,
    available,
    collected,
    nodes,
    claimedNodeIds,
    weatherDay: Math.max(0, Number(source.weatherDay) || 0),
    expiresDay: Math.max(0, Number(source.expiresDay) || 0),
    expiresMinute: Math.max(DAY_START_MINUTES, Number(source.expiresMinute) || 0),
    combo: Math.max(0, Math.min(99, Number(source.combo) || 0)),
    expiryNoted: Boolean(source.expiryNoted),
    legacyMigrated: Boolean(source.legacyMigrated || migratingLegacy),
    lastRefreshDay: Math.max(0, Number(source.lastRefreshDay) || 0),
  };
}

export function collectForage(state, forageId) {
  const nodes = Array.isArray(state.forage?.nodes) ? state.forage.nodes : [];
  const matchingNodes = nodes.filter((entry) => (
    entry.id === forageId
      || entry.interactionId === forageId
      || entry.itemId === forageId
  ));
  const node = matchingNodes.find((entry) => !entry.claimed) || matchingNodes[0];
  const itemId = node?.itemId || forageId;
  const item = forageItemForSeason(state, itemId);
  if (!item || !state.forage.available.includes(itemId)) return { ok: false, message: "这里今天没有新的山货。" };
  if (node?.claimed || state.forage.claimedNodeIds?.includes(node.id)) {
    emitFeedback(state, {
      eventId: "forage_claimed",
      kind: "forage",
      severity: "info",
      message: "这份山货已经采过了。",
      dedupeKey: `forage_claimed:${node?.id || itemId}:${state.day}`,
    });
    return { ok: false, message: "这份山货已经采过了。" };
  }
  if (!node || !forageNodeIsActive(state, node)) {
    const rainWindow = Boolean(node?.weatherDay || state.forage.weatherDay);
    if (!state.forage.expiryNoted && state.forage.expiresDay === state.day) {
      state.forage.expiryNoted = true;
      addMemory(
        state,
        rainWindow ? "雨后采集窗口已经关闭，剩余山货留给下一次天气变化。" : "季节山货采集窗口已经关闭，下一次刷新再来看看。",
        "risk",
        2,
      );
    }
    const expiredMessage = rainWindow ? "雨后足迹已经淡了，下一场雨后再来看看。" : "这处季节山货已经过期，下一次刷新再来看看。";
    emitFeedback(state, {
      eventId: "forage_expired",
      kind: "forage",
      severity: "warning",
      message: expiredMessage,
      dedupeKey: `forage_expired:${node?.id || itemId}:${state.day}`,
    });
    return {
      ok: false,
      message: expiredMessage,
    };
  }
  if (state.energy < 1) return { ok: false, message: "体力不够，先回去休息吧。" };
  state.energy -= 1;
  state.minutes = Math.min(24 * 60, state.minutes + 8);
  state.inventory.resources[itemId] = (state.inventory.resources[itemId] || 0) + 1;
  state.forage.collected[itemId] = true;
  node.claimed = true;
  if (!state.forage.claimedNodeIds.includes(node.id)) state.forage.claimedNodeIds.push(node.id);
  state.forage.combo = Math.min(99, state.forage.combo + 1);
  recordCollection(
    state,
    "forage",
    itemId,
    item.name,
    node.scene === "city" ? "村口山货" : "牧场山路",
  );
  bumpCounter(state, "foraged");
  state.relations.ecology = bounded(state.relations.ecology + 1);
  emitFeedback(state, {
    eventId: "forage_gathered",
    kind: "forage",
    severity: "success",
    message: `采到${item.name}。本次窗口已采 ${state.forage.combo} 份。`,
    dedupeKey: `forage_gathered:${node.id}:${state.day}`,
  });
  addMemory(state, `你在${node.scene === "city" ? "村口" : "牧场山路"}采到${item.name}，这是本次窗口已采的第 ${state.forage.combo} 份山货。`, "forage", 2);
  return { ok: true, message: `采到${item.name}。本次窗口已采 ${state.forage.combo} 份。`, nodeId: node.id, combo: state.forage.combo };
}

export function recordCollection(state, group, entryId, label, source) {
  const definition = COLLECTION_DEFS[group];
  if (!definition) return { ok: false, message: "这页地方志还没有准备好。" };
  const key = `${group}:${entryId}`;
  if (state.collection.entries.some((entry) => entry.key === key)) {
    return { ok: false, message: "这条内容已经收录进地方志了。" };
  }
  state.collection.entries.push({
    key,
    group,
    id: entryId,
    label,
    source: source || definition.name,
    firstSeenDay: state.day,
  });
  state.collection.firstSeenDay[key] = state.day;
  const total = definition.entries.length;
  const found = state.collection.entries.filter((entry) => entry.group === group).length;
  const previous = state.collection.stats[group] || {};
  const completed = found >= total;
  state.collection.stats[group] = {
    found,
    total,
    completed,
    rewarded: previous.rewarded === true,
  };
  if (completed && !previous.rewarded) {
    state.collection.stats[group].rewarded = true;
    state.government.civicPoints += 1;
    state.ai.trust = bounded(state.ai.trust + 2);
    addMemory(state, `地方志「${definition.name}」已经集齐。你获得 1 公民点，牧心也把这条长期兴趣记进了记忆。`, "history", 4);
  }
  return {
    ok: true,
    key,
    found,
    total,
    completed,
    message: `地方志新增：${label}。${completed ? `「${definition.name}」已集齐。` : ""}`,
  };
}

export function discoverSceneFind(state, sceneId, findId) {
  const find = (SCENE_FINDS[sceneId] || []).find((entry) => entry.id === findId);
  if (!find) return { ok: false, message: "这里没有值得调查的旧物。" };
  state.world.sceneFinds[sceneId] ||= {};
  if (state.world.sceneFinds[sceneId][findId]) {
    return { ok: false, message: "这处线索已经记进地方志了。" };
  }
  state.world.sceneFinds[sceneId][findId] = true;
  recordCollection(state, "places", `${sceneId}:${find.id}`, find.label, SCENE_DEFS[sceneId]?.name || sceneId);
  state.minutes = Math.min(24 * 60, state.minutes + 12);
  if (find.reward?.coins) {
    state.coins += find.reward.coins;
    state.stats.earned += find.reward.coins;
  }
  addMemory(state, `${find.label}：${find.lore}`, "history", 3);
  const all = SCENE_FINDS[sceneId] || [];
  const found = all.filter((entry) => state.world.sceneFinds[sceneId][entry.id]);
  let completion = "";
  if (found.length === all.length && !state.world.sceneFindRewards[sceneId]) {
    state.world.sceneFindRewards[sceneId] = true;
    state.government.civicPoints += 1;
    state.ai.trust = bounded(state.ai.trust + 2);
    completion = " 这张地图的地方志条目已经集齐：获得 1 公民点和牧心信任。";
    addMemory(state, `你集齐了${SCENE_DEFS[sceneId]?.name || sceneId}的地方志条目。地图不再只是通路，它开始有了自己的年轮。`, "history", 4);
  }
  return {
    ok: true,
    message: `${find.lore}${find.reward?.coins ? ` 获得 ${find.reward.coins} 金。` : ""}${completion}`,
    find,
    completedScene: found.length === all.length,
  };
}

export function getNpcTopic(state, npcId) {
  if (!NPC_TOPICS[npcId]) return null;
  if ((state.social?.topicDay?.[npcId] || 0) === state.day) return null;
  return NPC_TOPICS[npcId];
}

export function resolveNpcTopic(state, npcId, choiceId) {
  const topic = getNpcTopic(state, npcId);
  if (!topic) return { ok: false, message: "今天已经和这个人聊过了，明天再来吧。" };
  const choice = topic.choices.find((entry) => entry.id === choiceId);
  if (!choice) return { ok: false, message: "这个回答还没有准备好。" };
  state.social.topicDay[npcId] = state.day;
  recordCollection(state, "people", npcId, topic.prompt, SCENE_NPCS.find((entry) => entry.id === npcId)?.name || npcId);
  state.relations.npc[npcId] = bounded((state.relations.npc[npcId] || 8) + choice.delta, 0, 100);
  if (choice.community) state.relations.community = bounded(state.relations.community + choice.community);
  if (choice.ecology) state.relations.ecology = bounded(state.relations.ecology + choice.ecology);
  addMemory(
    state,
    `第 ${state.day} 天，你和${SCENE_NPCS.find((entry) => entry.id === npcId)?.name || "一位居民"}谈了「${topic.prompt}」，你的回答是：${choice.label}`,
    "social",
    3,
  );
  return {
    ok: true,
    message: choice.reply,
    delta: choice.delta,
    relation: state.relations.npc[npcId],
  };
}

export function isNpcBirthday(state, npcId) {
  const birthday = BIRTHDAYS[npcId];
  return Boolean(birthday && birthday.season === state.season && birthday.day === state.seasonDay);
}

export function giveGift(state, npcId, itemId) {
  if ((state.social.giftDay[npcId] || 0) === state.day) {
    return { ok: false, message: "今天已经给这个人送过礼物了。关系需要一点时间才能继续生长。" };
  }
  if (inventoryQuantity(state, itemId) < 1) {
    return { ok: false, message: "背包里没有这份物品。" };
  }
  const preference = GIFT_PREFERENCES[npcId] || { likes: [], dislikes: [] };
  const tags = GIFT_TAGS[itemId] || [];
  const favorite = tags.some((tag) => preference.likes.includes(tag));
  const disliked = tags.some((tag) => preference.dislikes.includes(tag));
  const birthday = isNpcBirthday(state, npcId);
  const baseDelta = favorite ? 5 : disliked ? -2 : 1;
  const delta = birthday ? baseDelta * 2 : baseDelta;
  consumeInventoryItem(state, itemId, 1);
  state.social.giftDay[npcId] = state.day;
  if (birthday) state.town.birthdayGifts[npcId] = state.day;
  state.social.giftHistory.push({ day: state.day, npcId, itemId, delta });
  state.social.giftHistory = state.social.giftHistory.slice(-24);
  state.social.giftLog.unshift({ day: state.day, npcId, itemId, delta });
  state.social.giftLog = state.social.giftLog.slice(0, 12);
  state.relations.npc[npcId] = bounded((state.relations.npc[npcId] || 8) + delta, 0, 100);
  state.stats.giftsGiven += 1;
  let reward = null;
  if (favorite) {
    if (npcId === "mayor") {
      state.government.civicPoints += 1;
      reward = "获得 1 公民点";
    } else {
      state.inventory.seeds.turnip = (state.inventory.seeds.turnip || 0) + 1;
      reward = "获得 1 份白萝卜种子";
    }
  }
  const itemName = MARKET_GOODS[itemId]?.name || PRODUCTS[itemId]?.name || itemId;
  addMemory(
    state,
    `你把${itemName}送给${SCENE_NPCS.find((entry) => entry.id === npcId)?.name || "一位居民"}${birthday ? "（生日）" : ""}，关系变化 ${delta > 0 ? "+" : ""}${delta}${reward ? `，${reward}` : ""}。`,
    "social",
    2,
  );
  return {
    ok: true,
    delta,
    relation: state.relations.npc[npcId],
    favorite,
    disliked,
    birthday,
    reward,
    giftResult: { delta, favorite, disliked, birthday },
    message: favorite
      ? `这份礼物正合心意。关系 +${delta}${reward ? `，${reward}` : ""}${birthday ? "；生日加成已计入。" : "。"}`
      : disliked
        ? `对方收下了，但显然不太喜欢。关系 ${delta}${birthday ? "（生日仍然让这份失礼更明显）" : ""}。`
        : `对方收下了礼物。关系 +${delta}${birthday ? "；生日加成已计入。" : "。"}`
  };
}

export function advanceDay(state) {
  const reportStartedAt = Date.now();
  const closingDay = state.day;
  const closingRecapChoice = state.daily?.recapChoice || null;
  const previousWeather = state.weather;
  const previousForageNodes = Array.isArray(state.forage?.nodes) ? state.forage.nodes : [];
  const previousForageCollected = previousForageNodes.filter((node) => node.claimed).length;
  const previousForageExpired = previousForageNodes.filter((node) => !node.claimed && node.expiresDay <= closingDay).length;
  const report = {
    products: [],
    grown: 0,
    matured: 0,
    animalsUnfed: [],
    helperActions: [],
    expiredContracts: [],
    livestock: [],
    shipping: { units: 0, value: 0, items: [] },
    dailyTasks: { completed: [], incomplete: [], reward: 0 },
    forageStats: {
      spawned: 0,
      collected: previousForageCollected,
      expired: previousForageExpired,
      combo: Math.max(0, Number(state.forage?.combo) || 0),
      window: false,
    },
    seasonVariant: null,
    questExpired: null,
    weeklyExpired: [],
    systemNotes: [],
    weather: "sunny",
  };
  expireWeeklyRequests(state, report, closingDay + 1);
  if (state.daily?.recapOptions?.length && !state.daily.recapChoice) {
    addMemory(state, "昨天的日结解释没有落笔。牧心把这段留白记成一次未决的取舍。", "routine", 1);
  }
  if (previousForageExpired) {
    addMemory(state, `雨后采集窗口结束了，有 ${previousForageExpired} 个节点没有被采走。`, "risk", 2);
  }

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

  report.dailyTasks = summarizeDailyTasks(state);
  const completedText = report.dailyTasks.completed.length
    ? `完成${report.dailyTasks.completed.map((task) => `「${task.text}」`).join("、")}`
    : "没有完成今日清单";
  const incompleteText = report.dailyTasks.incomplete.length
    ? `未完成${report.dailyTasks.incomplete.map((task) => `「${task.text}」`).join("、")}`
    : "今日清单全部完成";
  addMemory(
    state,
    `今日清单结算：${completedText}；${incompleteText}，获得 ${report.dailyTasks.reward} 金。牧心会把这次取舍留在明天的判断里。`,
    "routine",
    2,
  );


  state.day += 1;
  state.seasonDay += 1;
  if (state.seasonDay > SEASON_DAYS) {
    state.seasonDay = 1;
    state.season = SEASONS[(SEASONS.indexOf(state.season) + 1) % SEASONS.length];
    const farmVariant = getSceneSeasonVariant(state, "farm");
    addMemory(
      state,
      `季节更替：现在是${state.season}季。作物日历、山货目录和场景路线已经刷新${farmVariant ? `，牧场出现了「${farmVariant.label}」` : ""}。`,
      "season",
      3,
    );
  }
  if (
    state.quests.activeId
    && !state.quests.completed
    && !state.quests.expired
    && state.quests.deadlineDay
    && state.day > state.quests.deadlineDay
  ) {
    state.quests.expired = true;
    state.quests.retryDay = state.day + BRIDGE_QUEST.retryDays;
    state.market.reputation = Math.max(0, state.market.reputation - 2);
    state.government.civicPoints = Math.max(0, state.government.civicPoints - 1);
    report.questExpired = BRIDGE_QUEST.title;
    emitFeedback(state, {
      eventId: "bridge_expired",
      kind: "quest",
      severity: "warning",
      sourceScene: state.world?.scene || "farm",
      message: `「${BRIDGE_QUEST.title}」错过了期限，桥材和已完成步骤仍然保留。`,
      dedupeKey: `bridge_expired:${state.day}`,
    });
    addMemory(state, `「${BRIDGE_QUEST.title}」错过了期限，港口声誉下降。桥材和已完成步骤被保留，下一周可以重新接上。`, "risk", 3);
  }
  ensureWeeklyBoard(state);
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
  report.seasonVariant = getSceneSeasonVariant(state, "farm");
  advancePostGameDay(state, report, closingRecapChoice);

  const rainWindow = previousWeather === "rain";
  const seasonalForage = rainWindow || nextRandom(state) > 0.45 || state.seasonDay === 1;
  const forageNodes = seasonalForage ? buildForageNodes(state, rainWindow) : [];
  state.forage = {
    ...state.forage,
    available: forageNodes.map((node) => node.itemId),
    collected: {},
    nodes: forageNodes,
    claimedNodeIds: [],
    weatherDay: rainWindow ? closingDay : 0,
    expiresDay: state.day,
    expiresMinute: rainWindow ? FORAGE_WINDOW_MINUTES : NIGHT_MINUTES,
    combo: 0,
    expiryNoted: false,
    lastRefreshDay: state.day,
  };
  report.forageStats.spawned = forageNodes.length;
  report.forageStats.window = rainWindow;
  if (rainWindow && forageNodes.length) {
    addMemory(state, "雨后足迹出现了。清晨的山货只会停留一小段时间，牧场和村口都值得走一趟。", "observation", 2);
  }
  state.forage.lastRefreshDay = state.day;
  report.forage = forageNodes.map((node) => forageItemForSeason(state, node.itemId)?.name).filter(Boolean);
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

  if (getPostGameModifier(state)?.id === "drySeason") {
    state.maxWater = Math.min(state.maxWater, 12);
  }
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
  const recap = buildDailyRecapOptions(state, report, closingDay);
  state.daily.recapFacts = recap.facts;
  state.daily.recapOptions = recap.options;
  state.daily.recapChoice = null;
  state.daily.recapDay = closingDay;
  report.recap = recap;
  state.story.talkedNpcs = [];

  if (state.story.developmentChoice && !state.story.governanceChoice) {
    state.story.step = "aiAudit";
  }

  report.feedbackEvents = (state.feedback?.events || [])
    .filter((event) => event.day === closingDay || event.createdAt >= reportStartedAt)
    .slice(0, 4);
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
    const serialized = serializeState(state);
    const previous = localStorage.getItem(SAVE_KEY);
    if (previous) {
      localStorage.setItem(SAVE_BACKUP_KEY, previous);
      localStorage.setItem(`${SAVE_BACKUP_KEY}-checksum`, checksumText(previous));
    }
    localStorage.setItem(SAVE_KEY, serialized);
    return true;
  } catch (error) {
    console.warn("Unable to save game", error);
    return false;
  }
}

export function loadGame() {
  try {
    const primary = localStorage.getItem(SAVE_KEY);
    const backup = localStorage.getItem(SAVE_BACKUP_KEY);
    let raw = primary;
    let usingBackup = false;
    if (!raw && backup) {
      raw = backup;
      usingBackup = true;
    }
    if (!raw) return null;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (primaryError) {
      if (!backup || usingBackup) throw primaryError;
      raw = backup;
      usingBackup = true;
      parsed = JSON.parse(raw);
    }
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
        tripHistory: Array.isArray(parsed.shipping?.tripHistory)
          ? parsed.shipping.tripHistory
          : base.shipping.tripHistory,
        trip: parsed.shipping?.trip || null,
        selectedRoute: SHIPPING_ROUTES[parsed.shipping?.selectedRoute]
          ? parsed.shipping.selectedRoute
          : base.shipping.selectedRoute,
      },
      house: { ...base.house, ...(parsed.house || {}), upgrades: { ...base.house.upgrades, ...(parsed.house?.upgrades || {}) }, fridge: { ...base.house.fridge, ...(parsed.house?.fridge || {}) } },
      forage: {
        ...base.forage,
        ...(parsed.forage || {}),
        available: Array.isArray(parsed.forage?.available) ? parsed.forage.available : base.forage.available,
        collected: { ...base.forage.collected, ...(parsed.forage?.collected || {}) },
        nodes: Array.isArray(parsed.forage?.nodes) ? parsed.forage.nodes : base.forage.nodes,
        claimed: { ...base.forage.claimed, ...(parsed.forage?.claimed || {}) },
      },
      collection: {
        ...base.collection,
        ...(parsed.collection || {}),
        entries: Array.isArray(parsed.collection?.entries)
          ? parsed.collection.entries
          : base.collection.entries,
        stats: { ...base.collection.stats, ...(parsed.collection?.stats || {}) },
        firstSeenDay: { ...base.collection.firstSeenDay, ...(parsed.collection?.firstSeenDay || {}) },
      },
      feedback: {
        events: Array.isArray(parsed.feedback?.events) ? parsed.feedback.events.slice(0, 40) : [],
        seen: parsed.feedback?.seen && typeof parsed.feedback.seen === "object"
          ? { ...parsed.feedback.seen }
          : {},
        lastEvent: parsed.feedback?.lastEvent || null,
      },
      quests: {
        ...base.quests,
        ...(parsed.quests || {}),
        completedSteps: Array.isArray(parsed.quests?.completedSteps)
          ? parsed.quests.completedSteps
          : base.quests.completedSteps,
      },
      weekly: {
        ...base.weekly,
        ...(parsed.weekly || {}),
        requests: Array.isArray(parsed.weekly?.requests)
          ? parsed.weekly.requests
          : base.weekly.requests,
        acceptedIds: Array.isArray(parsed.weekly?.acceptedIds)
          ? parsed.weekly.acceptedIds
          : base.weekly.acceptedIds,
        completedIds: Array.isArray(parsed.weekly?.completedIds)
          ? parsed.weekly.completedIds
          : base.weekly.completedIds,
        expiredIds: Array.isArray(parsed.weekly?.expiredIds)
          ? parsed.weekly.expiredIds
          : base.weekly.expiredIds,
        deliveredCounts: { ...base.weekly.deliveredCounts, ...(parsed.weekly?.deliveredCounts || {}) },
      },
      festival: {
        ...base.festival,
        ...(parsed.festival || {}),
        activityFlags: { ...base.festival.activityFlags, ...(parsed.festival?.activityFlags || {}) },
        rewardClaimed: parsed.festival?.rewardClaimed === true,
      },
      town: { ...base.town, ...(parsed.town || {}), eventsSeen: Array.isArray(parsed.town?.eventsSeen) ? parsed.town.eventsSeen : base.town.eventsSeen, birthdayGifts: { ...base.town.birthdayGifts, ...(parsed.town?.birthdayGifts || {}) } },
      fishPond: { ...base.fishPond, ...(parsed.fishPond || {}) },
      stats: { ...base.stats, ...(parsed.stats || {}) },
      ai: {
        ...base.ai,
        ...(parsed.ai || {}),
        memories: Array.isArray(parsed.ai?.memories) ? parsed.ai.memories : base.ai.memories,
      },
      relations: {
        ...base.relations,
        ...(parsed.relations || {}),
        npc: { ...base.relations.npc, ...(parsed.relations?.npc || {}) },
      },
      social: {
        ...base.social,
        ...(parsed.social || {}),
        topicDay: { ...base.social.topicDay, ...(parsed.social?.topicDay || {}) },
        giftDay: { ...base.social.giftDay, ...(parsed.social?.giftDay || {}) },
        giftHistory: Array.isArray(parsed.social?.giftHistory)
          ? parsed.social.giftHistory
          : base.social.giftHistory,
        giftLog: Array.isArray(parsed.social?.giftLog)
          ? parsed.social.giftLog
          : base.social.giftLog,
      },
      seasonRoutes: {
        ...base.seasonRoutes,
        ...(parsed.seasonRoutes || {}),
        claims: { ...base.seasonRoutes.claims, ...(parsed.seasonRoutes?.claims || {}) },
        lastNotice: { ...base.seasonRoutes.lastNotice, ...(parsed.seasonRoutes?.lastNotice || {}) },
      },
      world: {
        ...base.world,
        ...(parsed.world || {}),
        visits: { ...base.world.visits, ...(parsed.world?.visits || {}) },
        sceneVisits: { ...base.world.sceneVisits, ...(parsed.world?.sceneVisits || {}) },
        sceneFinds: { ...base.world.sceneFinds, ...(parsed.world?.sceneFinds || {}) },
        sceneFindRewards: { ...base.world.sceneFindRewards, ...(parsed.world?.sceneFindRewards || {}) },
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
        postGameProgress: {
          ...base.story.postGameProgress,
          ...(parsed.story?.postGameProgress || {}),
        },
        postScriptsSeen: Array.isArray(parsed.story?.postScriptsSeen)
          ? Array.from(new Set(parsed.story.postScriptsSeen))
          : base.story.postScriptsSeen,
      },
      settings: { ...base.settings, ...(parsed.settings || {}) },
      player: { ...base.player, ...(parsed.player || {}) },
      daily: parsed.daily || base.daily,
    };

    merged.season = SEASONS.includes(merged.season) ? merged.season : base.season;
    merged.day = Number.isFinite(Number(merged.day)) ? Math.max(1, Math.floor(Number(merged.day))) : base.day;
    merged.seasonDay = Number.isFinite(Number(merged.seasonDay))
      ? Math.max(1, Math.min(SEASON_DAYS, Math.floor(Number(merged.seasonDay))))
      : base.seasonDay;
    merged.minutes = Number.isFinite(Number(merged.minutes))
      ? Math.max(DAY_START_MINUTES, Math.min(24 * 60, Number(merged.minutes)))
      : base.minutes;
    merged.coins = Number.isFinite(Number(merged.coins)) ? Math.max(0, Math.floor(Number(merged.coins))) : base.coins;
    merged.maxEnergy = Number.isFinite(Number(merged.maxEnergy)) ? Math.max(1, Math.floor(Number(merged.maxEnergy))) : base.maxEnergy;
    merged.energy = Number.isFinite(Number(merged.energy))
      ? Math.max(0, Math.min(merged.maxEnergy, Number(merged.energy)))
      : base.energy;
    merged.fishPond.stock = Number.isFinite(Number(merged.fishPond.stock))
      ? Math.max(0, Math.min(merged.fishPond.capacity, Math.floor(Number(merged.fishPond.stock))))
      : base.fishPond.stock;
    merged.fishPond.capacity = Number.isFinite(Number(merged.fishPond.capacity))
      ? Math.max(1, Math.floor(Number(merged.fishPond.capacity)))
      : base.fishPond.capacity;
    merged.fishPond.health = Number.isFinite(Number(merged.fishPond.health))
      ? Math.max(0, Math.min(100, Number(merged.fishPond.health)))
      : base.fishPond.health;
    merged.maxWater = Number.isFinite(Number(merged.maxWater)) ? Math.max(1, Math.floor(Number(merged.maxWater))) : base.maxWater;
    merged.water = Number.isFinite(Number(merged.water))
      ? Math.max(0, Math.min(merged.maxWater, Number(merged.water)))
      : base.water;
    merged.player = {
      ...base.player,
      ...(merged.player || {}),
      x: Number.isFinite(Number(merged.player?.x)) ? Number(merged.player.x) : base.player.x,
      y: Number.isFinite(Number(merged.player?.y)) ? Number(merged.player.y) : base.player.y,
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
    merged.forage = normalizeForageState(merged.forage, merged);
    merged.daily = normalizeDailyState(merged.daily, merged);
    ensureWeeklyBoard(merged);
    if (!merged.market.contracts?.length) {
      merged.market.contracts = generateTradeContracts(merged);
    }
    if (!merged.world.unlockedRegions.includes("farm")) merged.world.unlockedRegions.unshift("farm");
    if (!SCENE_DEFS[merged.world.scene]) merged.world.scene = "farm";
    if (!merged.world.visitedScenes.includes("farm")) merged.world.visitedScenes.unshift("farm");
    merged.sprites.available = Array.from(new Set([...(merged.sprites.available || []), ...(merged.sprites.unlocked || [])]));
    if (usingBackup) localStorage.setItem(SAVE_KEY, raw);
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
