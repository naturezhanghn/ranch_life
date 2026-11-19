import {
  ANIMAL_DEFS,
  CROPS,
  DAILY_TASK_POOL,
  DAY_START_MINUTES,
  PLAYER_START,
  PRODUCTS,
  SAVE_KEY,
  SAVE_VERSION,
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
    mood: 64,
    affection: 20,
    careDays: 0,
    productCounter: 0,
  }));
}

export function generateDailyTasks(state) {
  const anchor = `${state.day}:${state.rngState}:${state.story.chapter}`;
  const ranked = DAILY_TASK_POOL.map((task, index) => ({
    task,
    rank: seedFromString(`${anchor}:${task.id}:${index}`),
  }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3)
    .map(({ task }) => ({
      ...task,
      done: false,
    }));

  return {
    counters: {
      watered: 0,
      fed: 0,
      harvested: 0,
      talked: 0,
      shipped: 0,
      tilled: 0,
      planted: 0,
    },
    tasks: ranked,
    rewarded: false,
  };
}

export function createInitialState() {
  const state = {
    version: SAVE_VERSION,
    createdAt: new Date().toISOString(),
    savedAt: null,
    day: 1,
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
    },
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
  if (typeof state.daily?.counters[counter] === "number") {
    state.daily.counters[counter] += amount;
  }
  if (typeof state.stats[counter] === "number") {
    state.stats[counter] += amount;
  }
}

export function checkDailyTasks(state) {
  const completed = [];
  for (const task of state.daily.tasks) {
    if (task.done) continue;
    const value = state.daily.counters[task.counter] || 0;
    if (value >= task.target) {
      task.done = true;
      state.coins += task.reward;
      state.stats.earned += task.reward;
      completed.push(task);
    }
  }
  return completed;
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
    if (state.energy < 4) return { ok: false, message: "体力不够了。" };
    state.energy -= 4;
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
    const count = state.inventory.seeds[state.selectedSeed] || 0;
    if (count <= 0) {
      return { ok: false, message: `${crop.seedName}用完了，去村集买一些吧。` };
    }
    if (state.energy < 1) return { ok: false, message: "体力不够了。" };
    state.inventory.seeds[state.selectedSeed] -= 1;
    state.energy -= 1;
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
    if (state.energy < 2) return { ok: false, message: "体力不够了。" };
    state.water -= 1;
    state.energy -= 2;
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
    if (state.energy < 2) return { ok: false, message: "体力不够了。" };
    const amount = plot.wateredDays >= crop.days ? 2 : 1;
    state.energy -= 2;
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
  let income = 0;
  for (const [itemId, count] of Object.entries(state.inventory.produce)) {
    if (count > 0) {
      const product = PRODUCTS[itemId];
      units += count;
      income += count * product.sellPrice;
      state.inventory.produce[itemId] = 0;
    }
  }
  if (units === 0) {
    return { ok: false, message: "出货箱里还没有可以出售的农产品。" };
  }
  state.coins += income;
  state.stats.earned += income;
  bumpCounter(state, "shipped", units);
  addMemory(state, `你把 ${units} 份农产品放进合作社的出货箱，换回了 ${income} 金币。`, "economy", 2);
  return {
    ok: true,
    message: `交付了 ${units} 份产品，获得 ${income} 金币。第二天合作社就会把货送往镇上。`,
    income,
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

export function recordTalk(state, npcName) {
  bumpCounter(state, "talked");
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

export function advanceDay(state) {
  const report = {
    products: [],
    grown: 0,
    matured: 0,
    animalsUnfed: [],
    weather: "sunny",
  };

  for (const animal of state.animals) {
    if (animal.fed) {
      animal.productCounter += 1;
      const definition = ANIMAL_DEFS.find((entry) => entry.id === animal.id);
      if (animal.productCounter >= definition.productEvery) {
        animal.productCounter = 0;
        state.inventory.produce[definition.product] += 1;
        report.products.push({
          name: definition.name,
          product: PRODUCTS[definition.product].name,
          text: definition.productText,
        });
      }
      animal.mood = Math.min(100, animal.mood + 3);
    } else {
      animal.mood = Math.max(0, animal.mood - 9);
      animal.affection = Math.max(0, animal.affection - 4);
      report.animalsUnfed.push(animal.id);
      addMemory(
        state,
        `${ANIMAL_DEFS.find((entry) => entry.id === animal.id).name}昨天没有进食。它的活动量下降了。`,
        "risk",
        3,
      );
    }
    animal.fed = false;
  }

  for (const plot of state.plots) {
    if (plot.crop && plot.watered) {
      plot.growth += 1;
      report.grown += 1;
      if (plot.growth === CROPS[plot.crop].days) report.matured += 1;
    }
    plot.watered = false;
  }

  state.day += 1;
  state.minutes = DAY_START_MINUTES;
  state.energy = state.maxEnergy;
  state.stats.slept += 1;
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
      },
      stats: { ...base.stats, ...(parsed.stats || {}) },
      ai: {
        ...base.ai,
        ...(parsed.ai || {}),
        memories: Array.isArray(parsed.ai?.memories) ? parsed.ai.memories : base.ai.memories,
      },
      relations: { ...base.relations, ...(parsed.relations || {}) },
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
    if (!merged.daily?.tasks?.length) {
      merged.daily = generateDailyTasks(merged);
    }
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
