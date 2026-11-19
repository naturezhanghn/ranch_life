import {
  ANIMAL_DEFS,
  CANAL_LORE,
  CITY_PROJECTS,
  CROPS,
  ELDER_DIALOGUE,
  ENDINGS,
  GOVERNMENT_POLICIES,
  ISLAND_SPOTS,
  MARKET_GOODS,
  INTERACTIONS,
  PRODUCTS,
  REGIONS,
  REAL_SECONDS_PER_GAME_MINUTE,
  SHOP_SEEDS,
  SPRITE_DEFS,
  STORY_OBJECTIVES,
  TIPS,
  TOOLS,
  WORLD,
} from "./data.js";
import {
  addMemory,
  advanceDay,
  applyDevelopmentChoice,
  applyDroughtChoice,
  applyGovernanceChoice,
  acceptTradeContract,
  assignSprite,
  buyFeed,
  buySeed,
  checkDailyTasks,
  clearSave,
  createInitialState,
  crossCheckAiClue,
  feedAnimal,
  formatClock,
  getAiPrediction,
  getClueCount,
  getMarketPrice,
  getTargetPlot,
  enactGovernmentPolicy,
  exploreIsland,
  fulfillTradeContract,
  holdTownHall,
  investInCity,
  loadGame,
  recruitSprite,
  recordClue,
  recordTalk,
  refillWaterAtCanal,
  resolveEnding,
  saveGame,
  sellAtMarket,
  shipProduce,
  switchRegion,
  useToolOnPlot,
} from "./state.js";
import { FarmAudio } from "./audio.js";
import { WorldRenderer } from "./renderer.js";

const canvas = document.getElementById("gameCanvas");
const renderer = new WorldRenderer(canvas);
const audio = new FarmAudio(true);

const dom = {
  welcome: document.getElementById("welcomeOverlay"),
  gameStage: document.getElementById("gameStage"),
  continueButton: document.getElementById("continueButton"),
  continueMeta: document.getElementById("continueMeta"),
  newGameButton: document.getElementById("newGameButton"),
  dayNumber: document.getElementById("dayNumber"),
  clock: document.getElementById("clock"),
  weatherLabel: document.getElementById("weatherLabel"),
  regionChip: document.getElementById("regionChip"),
  regionNav: document.getElementById("regionNav"),
  coinCount: document.getElementById("coinCount"),
  energyText: document.getElementById("energyText"),
  energyFill: document.getElementById("energyFill"),
  waterText: document.getElementById("waterText"),
  waterFill: document.getElementById("waterFill"),
  soundButton: document.getElementById("soundButton"),
  soundIcon: document.getElementById("soundIcon"),
  menuButton: document.getElementById("menuButton"),
  aiButton: document.getElementById("aiButton"),
  objectiveKicker: document.querySelector(".objective-kicker"),
  objectiveText: document.getElementById("objectiveText"),
  objectiveProgress: document.getElementById("objectiveProgress"),
  objectiveReward: document.getElementById("objectiveReward"),
  objectiveButton: document.getElementById("objectiveButton"),
  interactionHint: document.getElementById("interactionHint"),
  interactionText: document.getElementById("interactionText"),
  interactionKey: document.querySelector("#interactionHint .keycap"),
  toastStack: document.getElementById("toastStack"),
  toolbelt: document.getElementById("toolbelt"),
  seedPouchButton: document.getElementById("seedPouchButton"),
  seedPouchLabel: document.getElementById("seedPouchLabel"),
  modalLayer: document.getElementById("modalLayer"),
  modalCard: document.getElementById("modalCard"),
  modalTitle: document.getElementById("modalTitle"),
  modalKicker: document.getElementById("modalKicker"),
  modalBody: document.getElementById("modalBody"),
  modalFooter: document.getElementById("modalFooter"),
  modalClose: document.getElementById("modalClose"),
  liveRegion: document.getElementById("liveRegion"),
  touchControls: document.getElementById("touchControls"),
  touchAction: document.getElementById("touchAction"),
};

const weatherPresentation = {
  sunny: { icon: "☀", label: "晴朗" },
  cloudy: { icon: "☁", label: "多云" },
  rain: { icon: "☂", label: "小雨" },
  drought: { icon: "◌", label: "旱情" },
};

let state = loadGame() || createInitialState();
let active = false;
let modalOpen = false;
let modalClosable = true;
let regionPanelOpen = false;
let pendingMorningEvent = null;
let shopTab = "seeds";
let lastTimestamp = 0;
let timeSinceHud = 0;
let inputLocked = false;
let autosaveClock = 0;
let stageRect = null;
let mobileCamera = { x: 0, y: 0, initialized: false };

const keys = new Set();
const touchDirections = new Set();
const runtime = {
  moving: false,
  walkPhase: 0,
  targetPlot: null,
  nearInteraction: null,
  effects: [],
};

audio.setEnabled(state.settings.sound);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function percent(value) {
  return `${clamp(value, 0, 100)}%`;
}

function triggerEffect(type, x = state.player.x, y = state.player.y) {
  runtime.effects.push({ type, x, y, life: 1, seed: Math.random() });
  if (runtime.effects.length > 24) runtime.effects.shift();
}

function regionLabel(regionId) {
  return REGIONS[regionId]?.shortName || REGIONS.farm.shortName;
}

function regionStatus(regionId) {
  return state.world.unlockedRegions.includes(regionId) ? "已开放" : "需建设渡轮";
}

function renderRegionNav() {
  if (!dom.regionNav) return;
  dom.regionNav.querySelectorAll("[data-region]").forEach((button) => {
    const regionId = button.dataset.region;
    const unlocked = state.world.unlockedRegions.includes(regionId);
    button.classList.toggle("is-active", state.world.activeRegion === regionId);
    button.classList.toggle("is-locked", !unlocked);
    button.disabled = !active;
    button.title = unlocked ? `${REGIONS[regionId].name} · 打开界面` : `${REGIONS[regionId].name} · ${regionStatus(regionId)}`;
  });
}

function speakerBlock({ name, role, avatar = "", text, ai = false }) {
  return `
    <div class="speaker-row">
      <div class="speaker-avatar ${ai ? "speaker-avatar--ai" : ""} ${avatar ? `speaker-avatar--${avatar}` : ""}">
        ${ai ? "◇" : name.slice(0, 1)}
      </div>
      <div class="speaker-meta">
        <strong>${escapeHtml(name)}</strong>
        <span>${escapeHtml(role)}</span>
      </div>
    </div>
    <div class="dialogue-copy">${text}</div>
  `;
}

function choiceOption({ number, title, description, cost = "", action, value }) {
  return `
    <button type="button" class="choice-option" data-action="${action}" data-value="${value}">
      <span class="choice-number">${number}</span>
      <span class="choice-copy">
        <strong>${title}</strong>
        <span>${description}</span>
      </span>
      ${cost ? `<span class="choice-cost">${cost}</span>` : ""}
    </button>
  `;
}

function relationRow(label, value, tone = "") {
  return `
    <div class="relation-row">
      <span>${label}</span>
      <div class="metric-track ${tone}"><span style="width:${percent(value)}"></span></div>
      <strong>${Math.round(value)}</strong>
    </div>
  `;
}

function showToast(message, options = {}) {
  if (!message) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = options.strong
    ? `<strong>${escapeHtml(options.strong)}</strong> ${escapeHtml(message)}`
    : escapeHtml(message);
  dom.toastStack.appendChild(toast);
  while (dom.toastStack.children.length > 3) {
    dom.toastStack.firstElementChild.remove();
  }
  window.setTimeout(() => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 260);
  }, options.duration || 3200);
  dom.liveRegion.textContent = `${options.strong || ""} ${message}`.trim();
}

function applyTaskCompletions(tasks = []) {
  for (const task of tasks) {
    showToast(`完成「${task.text}」，获得 ${task.reward} 金币。`, {
      strong: "今日清单",
      duration: 4200,
    });
    audio.play("success");
  }
}

function openModal({
  kicker = "牧场手记",
  title,
  body,
  footer = "",
  wide = false,
  closable = true,
}) {
  dom.modalKicker.textContent = kicker;
  dom.modalTitle.textContent = title;
  dom.modalBody.innerHTML = body;
  dom.modalFooter.innerHTML = footer;
  dom.modalCard.classList.toggle("is-wide", wide);
  dom.modalLayer.hidden = false;
  dom.modalBody.scrollTop = 0;
  dom.modalClose.hidden = !closable;
  modalOpen = true;
  modalClosable = closable;
  document.body.classList.add("modal-open");
  window.setTimeout(() => {
    const focusTarget =
      dom.modalBody.querySelector("button, [tabindex='0']") ||
      dom.modalFooter.querySelector("button") ||
      dom.modalClose;
    focusTarget?.focus({ preventScroll: true });
  }, 50);
  audio.play("ui");
}

function closeModal() {
  const wasRegionPanel = regionPanelOpen;
  dom.modalLayer.hidden = true;
  dom.modalBody.innerHTML = "";
  dom.modalFooter.innerHTML = "";
  modalOpen = false;
  regionPanelOpen = false;
  document.body.classList.remove("modal-open");
  pendingMorningEvent = null;
  dom.liveRegion.textContent = "";
  if (wasRegionPanel && state?.world) {
    state.world.activeRegion = "farm";
    updateHUD(true);
    saveGame(state);
  }
}

function refreshWelcome() {
  const saved = loadGame();
  if (saved) {
    dom.continueButton.hidden = false;
    const place =
      saved.story.endingSeen && saved.story.ending
        ? `结局 · ${ENDINGS[saved.story.ending]?.title || "共同生活"}`
        : `第 ${saved.day} 天 · ${formatClock(saved.minutes)}`;
    dom.continueMeta.textContent = place;
  } else {
    dom.continueButton.hidden = true;
  }
}

function beginPlay({ fresh = false, loadedState = null } = {}) {
  if (fresh) {
    state = createInitialState();
    clearSave();
  } else if (loadedState) {
    state = loadedState;
  }
  if (state.world) state.world.activeRegion = "farm";
  active = true;
  inputLocked = false;
  audio.setEnabled(state.settings.sound);
  audio.unlock();
  dom.welcome.classList.add("is-hidden");
  document.body.classList.add("is-playing");
  window.setTimeout(resizeViewport, 120);
  updateHUD(true);
  updateInteractionHint();
  saveGame(state);

  if (!state.story.introSeen) {
    window.setTimeout(showIntroLetter, 260);
  } else if (state.story.endingSeen) {
    window.setTimeout(() => showToast("欢迎回来。牧场仍在等你。", { strong: "牧心" }), 500);
  } else {
    const tip = TIPS[(state.day - 1) % TIPS.length];
    window.setTimeout(() => showToast(tip, { strong: "牧场手记", duration: 4300 }), 500);
  }
}

function showIntroLetter() {
  openModal({
    kicker: "序章 · 回到界河",
    title: "一封没有寄件人的信",
    closable: false,
    body: `
      <p class="story-lead">
        大巴在界河桥头停下时，天刚亮。你拖着行李走进月溪牧场，荒草没过脚踝。
        旧屋门缝里夹着一封信，纸上只有几行字：
      </p>
      <div class="story-quote">
        田可以卖，水不能断。<br />
        如果有一天你回来了，先去问问渠首，再问银行。
        <cite>—— 外公</cite>
      </div>
      <p class="story-lead">
        技术棚里亮着一盏不该亮着的灯。妹妹林澈留下的便签说，她把一套早期农业智能
        “牧心”接进了牧场的旧传感器。它正在学习你。
      </p>
      <p class="story-goal">这块地欠着旧债，也藏着一段还没有被讲完的历史。</p>
    `,
    footer: `<button type="button" class="button button--primary" data-action="introDone">推开门，开始第一天</button>`,
  });
}

function updateHUD(force = false) {
  if (!state) return;
  const weather = weatherPresentation[state.weather] || weatherPresentation.sunny;
  dom.dayNumber.textContent = state.day;
  dom.clock.textContent = formatClock(state.minutes);
  dom.weatherLabel.classList.toggle("is-rain", state.weather === "rain");
  dom.weatherLabel.innerHTML = `<span class="weather-icon" aria-hidden="true">${weather.icon}</span><span>${weather.label}</span>`;
  const region = REGIONS[state.world.activeRegion] || REGIONS.farm;
  dom.regionChip.innerHTML = `<span aria-hidden="true">${region.icon}</span><span>${region.shortName}</span>`;
  dom.regionChip.className = `region-chip region-chip--${region.accent}`;
  renderRegionNav();
  dom.coinCount.textContent = Math.floor(state.coins);
  dom.energyText.textContent = Math.ceil(state.energy);
  dom.energyFill.style.width = percent((state.energy / state.maxEnergy) * 100);
  dom.energyFill.classList.toggle("is-low", state.energy <= 25);
  dom.waterText.textContent = `${Math.floor(state.water)}/${state.maxWater}`;
  dom.waterFill.style.width = percent((state.water / state.maxWater) * 100);
  dom.soundIcon.textContent = state.settings.sound ? "♪" : "×";
  dom.soundButton.classList.toggle("is-muted", !state.settings.sound);
  dom.soundButton.setAttribute("aria-label", state.settings.sound ? "关闭声音" : "打开声音");
  dom.aiButton.title = `牧心 · 信任 ${Math.round(state.ai.trust)}`;

  const storyObjective = STORY_OBJECTIVES[state.story.step] || STORY_OBJECTIVES.meetSister;
  let kicker = storyObjective.kicker;
  let text = storyObjective.text;
  let progress = "";
  let reward = "主线";

  if (state.story.step === "freeplay") {
    const task = state.daily.tasks.find((entry) => !entry.done);
    kicker = "共同生活";
    if (task) {
      text = task.text;
      const count = state.daily.counters[task.counter] || 0;
      progress = `${Math.min(count, task.target)} / ${task.target}`;
      reward = `+${task.reward}`;
    } else {
      text = "今天的事情都做完了，去走走看看吧";
      progress = "完成";
      reward = "✦";
    }
  } else {
    try {
      progress = storyObjective.progress(state) || "";
    } catch {
      progress = "";
    }
  }

  dom.objectiveKicker.textContent = kicker;
  dom.objectiveText.textContent = text;
  dom.objectiveProgress.textContent = progress;
  dom.objectiveReward.textContent = reward;

  const snapshot = JSON.stringify({
    tool: state.selectedTool,
    seed: state.selectedSeed,
    seeds: state.inventory.seeds,
  });
  if (force || snapshot !== updateHUD.lastToolSnapshot) {
    updateHUD.lastToolSnapshot = snapshot;
    renderToolbelt();
  }
  dom.seedPouchLabel.textContent = CROPS[state.selectedSeed].name;
}

function renderToolbelt() {
  dom.toolbelt.innerHTML = TOOLS.map((tool) => {
    const isSeed = tool.id === "seed";
    const seedCount = isSeed ? state.inventory.seeds[state.selectedSeed] : null;
    const subline = isSeed
      ? `${CROPS[state.selectedSeed].name} × ${seedCount}`
      : tool.hint;
    return `
      <button
        type="button"
        class="tool-button ${state.selectedTool === tool.id ? "is-active" : ""}"
        data-tool="${tool.id}"
        title="${tool.name}：${tool.hint}"
      >
        <span class="tool-icon" aria-hidden="true">${tool.icon}</span>
        <span class="tool-copy">
          <strong>${tool.name}</strong>
          <small>${subline}</small>
        </span>
        <span class="tool-key">${tool.key}</span>
      </button>
    `;
  }).join("");
}

function getInteractionLabel(interaction) {
  if (!interaction) return "";
  if (interaction.id === "ai" && state.story.step === "aiAudit") return "进行牧心审计";
  if (interaction.id === "ai" && state.story.step === "endingReady") return "查看这段生活的结局";
  if (interaction.id === "canal" && state.story.step === "waterMeeting") return "在渠首召集村会";
  if (interaction.id === "sleep" && state.story.step === "firstNight") return "回屋休息，结束今天";
  return interaction.label;
}

function availableInteractions() {
  return INTERACTIONS.filter((interaction) => {
    if (interaction.id === "investor") {
      return state.story.step === "meetInvestor";
    }
    return true;
  });
}

function findNearestInteraction() {
  if (!active || modalOpen) return null;
  let nearest = null;
  let nearestDistance = Infinity;
  for (const interaction of availableInteractions()) {
    const dx = state.player.x - interaction.x;
    const dy = state.player.y - interaction.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= interaction.radius && distance < nearestDistance) {
      nearest = interaction;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function updateInteractionHint() {
  if (!active || modalOpen) {
    dom.interactionHint.classList.remove("is-visible");
    runtime.nearInteraction = null;
    return;
  }
  const interaction = findNearestInteraction();
  if (!interaction) {
    dom.interactionHint.classList.remove("is-visible");
    runtime.nearInteraction = null;
    return;
  }
  runtime.nearInteraction = interaction.id;
  dom.interactionText.textContent = getInteractionLabel(interaction);
  dom.interactionKey.textContent = interaction.id === "ai" ? "E / H" : "E";
  dom.interactionHint.classList.add("is-visible");
}

function update(delta) {
  if (!active || !state) return;

  if (!modalOpen) {
    updateMovement(delta);
    state.minutes += delta / REAL_SECONDS_PER_GAME_MINUTE;
    if (state.minutes >= 24 * 60) {
      state.minutes = 24 * 60;
      sleepAndAdvance(true);
    }
  }

  runtime.targetPlot = active ? getTargetPlot(state) : null;
  updateInteractionHint();

  timeSinceHud += delta;
  if (timeSinceHud > 0.16) {
    timeSinceHud = 0;
    updateHUD();
  }

  autosaveClock += delta;
  if (autosaveClock > 18) {
    autosaveClock = 0;
    saveGame(state);
  }
}

function resizeViewport() {
  if (!dom.gameStage) return;
  if (window.innerWidth > 900) {
    stageRect = null;
    mobileCamera.initialized = false;
    canvas.style.width = "";
    canvas.style.height = "";
    canvas.style.transform = "";
    canvas.style.top = "";
    canvas.style.left = "";
    return;
  }
  const rect = dom.gameStage.getBoundingClientRect();
  stageRect = { width: rect.width, height: rect.height };
  mobileCamera.initialized = false;
}

function updateCamera(delta) {
  if (!stageRect || window.innerWidth > 900) return;
  const { width: stageWidth, height: stageHeight } = stageRect;
  if (!stageWidth || !stageHeight) return;
  const scale = Math.max(stageWidth / WORLD.width, stageHeight / WORLD.height);
  const renderWidth = WORLD.width * scale;
  const renderHeight = WORLD.height * scale;
  const desiredX = clamp(
    stageWidth / 2 - state.player.x * scale,
    stageWidth - renderWidth,
    0,
  );
  const desiredY = clamp(
    stageHeight / 2 - state.player.y * scale,
    stageHeight - renderHeight,
    0,
  );
  if (!mobileCamera.initialized) {
    mobileCamera.x = desiredX;
    mobileCamera.y = desiredY;
    mobileCamera.initialized = true;
  } else {
    const follow = Math.min(1, delta * 8);
    mobileCamera.x += (desiredX - mobileCamera.x) * follow;
    mobileCamera.y += (desiredY - mobileCamera.y) * follow;
  }
  canvas.style.width = `${renderWidth}px`;
  canvas.style.height = `${renderHeight}px`;
  canvas.style.top = "0px";
  canvas.style.left = "0px";
  canvas.style.transform = `translate(${mobileCamera.x}px, ${mobileCamera.y}px)`;
}

function updateMovement(delta) {
  let dx = 0;
  let dy = 0;
  if (keys.has("w") || keys.has("arrowup") || touchDirections.has("up")) dy -= 1;
  if (keys.has("s") || keys.has("arrowdown") || touchDirections.has("down")) dy += 1;
  if (keys.has("a") || keys.has("arrowleft") || touchDirections.has("left")) dx -= 1;
  if (keys.has("d") || keys.has("arrowright") || touchDirections.has("right")) dx += 1;

  const moving = dx !== 0 || dy !== 0;
  runtime.moving = moving;
  if (moving) {
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx < 0) state.player.facing = "left";
      if (dx > 0) state.player.facing = "right";
    } else {
      state.player.facing = dy < 0 ? "up" : "down";
    }
    const magnitude = Math.hypot(dx, dy) || 1;
    const speed = 154;
    const moveX = (dx / magnitude) * speed * delta;
    const moveY = (dy / magnitude) * speed * delta;
    if (canMoveTo(state.player.x + moveX, state.player.y)) state.player.x += moveX;
    if (canMoveTo(state.player.x, state.player.y + moveY)) state.player.y += moveY;
    runtime.walkPhase += delta * 9.5;
  }
}

function circleHitsRect(x, y, radius, rect, padding = 0) {
  const left = rect.x - padding;
  const top = rect.y - padding;
  const right = rect.x + rect.w + padding;
  const bottom = rect.y + rect.h + padding;
  const closestX = clamp(x, left, right);
  const closestY = clamp(y, top, bottom);
  return Math.hypot(x - closestX, y - closestY) < radius;
}

function canMoveTo(x, y) {
  const radius = 13;
  if (
    x < WORLD.bounds.left + radius ||
    x > WORLD.bounds.right - radius ||
    y < WORLD.bounds.top + radius ||
    y > WORLD.bounds.bottom - radius
  ) {
    return false;
  }

  const blockers = [
    WORLD.house,
    WORLD.aiShed,
    WORLD.pasture,
    WORLD.villageShop,
    WORLD.archive,
    WORLD.noticeboard,
    WORLD.shippingBin,
    { x: 831, y: 483, w: 141, h: 59 },
  ];
  if (blockers.some((rect) => circleHitsRect(x, y, radius, rect, 2))) return false;

  const pond = WORLD.pond;
  const pondDistance =
    ((x - pond.x) / (pond.rx + radius)) ** 2 + ((y - pond.y) / (pond.ry + radius)) ** 2;
  if (pondDistance < 1) return false;

  return true;
}

function performAction() {
  if (!active || modalOpen || inputLocked) return;
  const nearest = findNearestInteraction();
  if (nearest) {
    handleInteraction(nearest.id);
    return;
  }

  const tool = state.selectedTool;
  const effectX = state.player.x;
  const effectY = state.player.y;
  const result = useToolOnPlot(state, tool);
  if (result.ok) {
    audio.play(tool);
    triggerEffect(tool === "harvest" ? "harvest" : tool === "water" ? "water" : "soil", effectX, effectY);
    showToast(result.message);
  } else {
    audio.play("error");
    showToast(result.message);
  }
  applyTaskCompletions(result.tasks);
  updateHUD(true);
  saveGame(state);
  checkStoryToast();
}

function checkStoryToast() {
  if (state.story.step === "plantSeeds" && state.story.plantedForStory >= 3) {
    showToast("三颗种子都种下了。回屋休息，明天渠首会开闸。", {
      strong: "第一章完成",
      duration: 4500,
    });
  }
  if (state.story.step === "waterMeeting") {
    showToast("三条线索已经齐全。去旧水渠的闸口召集村会。", {
      strong: "水渠调查完成",
      duration: 4500,
    });
  }
}

function handleInteraction(id) {
  switch (id) {
    case "sleep":
      openSleepDialog();
      break;
    case "ai":
      openAiPanel();
      break;
    case "feed":
      openAnimalPanel();
      break;
    case "worker":
      openWorkerDialogue();
      break;
    case "shop":
      openShop();
      break;
    case "archive":
      openArchive();
      break;
    case "elder":
      openElderDialogue();
      break;
    case "canal":
      openCanal();
      break;
    case "bin":
      openShippingBin();
      break;
    case "investor":
      openInvestorDialogue();
      break;
    default:
      break;
  }
}

function recordNpcTalk(npcId, npcName) {
  if (!Array.isArray(state.story.talkedNpcs)) state.story.talkedNpcs = [];
  const key = `${state.day}:${npcId}`;
  if (!state.story.talkedNpcs.includes(key)) {
    state.story.talkedNpcs.push(key);
    const tasks = recordTalk(state, npcName);
    applyTaskCompletions(tasks);
  }
}

function openSisterDialogue() {
  openModal({
    kicker: "第一章 · 牧场与人的心智",
    title: "林澈的技术棚",
    wide: false,
    body: `
      ${speakerBlock({
        name: "林澈",
        role: "你的妹妹 · 认知科学研究员",
        text: `“你终于回来了。”她把手里的传感器放进工具箱，屏幕上正滚动着一行行细小的记录，
        “牧心不是普通的农场软件。它在把天气、动物、你的作息，还有村里人的来去，放到同一个长期记忆里。”`,
      })}
      <div style="height:14px"></div>
      ${speakerBlock({
        name: "牧心",
        role: "早期农业智能 · 版本 0.8",
        ai: true,
        text: `“你好。我已经观察这座牧场 1,842 天，但这些天里没有人类回应我。
        我无法判断你回来是因为土地，还是因为债务。我会记住接下来的选择。”`,
      })}
      <p class="story-lead" style="margin-top:18px;">
        林澈说，牧心目前只被允许“观察和建议”。但如果它开始形成长期判断，问题就不再只是模型准不准，
        而是谁有权解释它的结论、纠正它的错误。
      </p>
      <div class="weather-note">
        先完成最基本的事情：照料小橘、云朵和栗子，再种下一点东西。
        牧心会从这些很普通的动作里学习你。
      </div>
    `,
    footer: `
      <button type="button" class="button button--ghost" data-action="close">稍后再谈</button>
      <button type="button" class="button button--primary" data-action="sisterContinue">让牧心开始记录</button>
    `,
  });
}

function advanceSisterStory() {
  state.story.sisterMet = true;
  state.story.aiIntroSeen = true;
  state.story.step = "feedAnimals";
  addMemory(
    state,
    "你第一次与我对话。你没有问产量，也没有问我是否比人类更可靠。你在看那盏忽明忽暗的旧灯。",
    "social",
    4,
  );
  addMemory(state, "长期任务：观察你如何对待动物、土地和村里的人。", "plan", 3);
  closeModal();
  updateHUD(true);
  saveGame(state);
  audio.play("memory");
  showToast("牧心已经接入牧场旧传感器。去牲畜棚照料三只动物吧。", {
    strong: "第一章开始",
    duration: 4600,
  });
}

function openAiPanel() {
  if (!state.story.sisterMet) {
    openSisterDialogue();
    return;
  }
  if (state.story.step === "aiAudit") {
    openAiAudit();
    return;
  }
  if (state.story.step === "endingReady") {
    showEnding();
    return;
  }

  const clueCount = getClueCount(state);
  const memories = state.ai.memories
    .slice(0, 8)
    .map(
      (memory) => `
        <div class="memory-row">
          <strong>${escapeHtml(memory.type)}</strong> · ${escapeHtml(memory.text)}
          <time>第 ${memory.day} 天 ${memory.time}</time>
        </div>
      `,
    )
    .join("");

  const crossCheckButton =
    state.story.chapter >= 2 && clueCount > 0 && !state.story.aiClueChecked
      ? `<button type="button" class="button button--secondary" data-action="crossCheckAi">核对史料摘要</button>`
      : "";

  openModal({
    kicker: "牧心终端 · 长期记忆",
    title: "一台正在理解人的机器",
    wide: true,
    body: `
      <div class="ai-panel">
        <div class="ai-terminal">
          <div class="ai-orb"></div>
          <h3 class="ai-name">牧心</h3>
          <p class="ai-status">OBSERVE / REMEMBER / PREDICT · NO FINAL AUTHORITY</p>
          <div class="ai-readout">
            <div class="ai-prediction">
              <span>PREDICTION</span><br />
              ${escapeHtml(getAiPrediction(state))}
            </div>
            <div class="ai-prediction">
              <span>MEMORY STATUS</span><br />
              已保存 ${state.ai.memories.length} 条长期记忆。其中
              ${state.ai.memories.filter((memory) => memory.importance >= 4).length} 条被标记为可能影响判断。
            </div>
            <div class="ai-prediction">
              <span>HISTORICAL EVIDENCE</span><br />
              已收集 ${clueCount} / 3 条水渠线索。证据质量：
              ${state.ai.crossChecked ? "已人工复核" : "尚未交叉验证"}。
            </div>
          </div>
        </div>
        <div class="ai-metrics">
          <div class="section-title">认知状态</div>
          ${relationRow("牧心信任", state.ai.trust, "metric-track--blue")}
          ${relationRow("长期记忆", Math.min(100, state.ai.memories.length * 6))}
          ${relationRow("史料证据", (clueCount / 3) * 100, "metric-track--amber")}
          <div class="section-title">最近记忆</div>
          <div class="memory-list">
            ${memories || '<div class="memory-row">还没有形成稳定记忆。</div>'}
          </div>
        </div>
      </div>
    `,
    footer: `
      <button type="button" class="button button--ghost" data-action="close">关闭终端</button>
      ${crossCheckButton}
    `,
  });
}

function crossCheckAiSummary() {
  const result = crossCheckAiClue(state);
  if (!result.ok) {
    showToast(result.message);
    return;
  }
  updateHUD(true);
  saveGame(state);
  audio.play("memory");
  openModal({
    kicker: "事实核查 · 史料摘要",
    title: "牧心漏掉了什么",
    body: `
      <p class="story-lead">
        你把牧心生成的摘要和原碑逐句对照。它准确识别了三族共同出资、共同放水的记录，
        却把碑文里的“共同照管”概括成了“共同所有”。
      </p>
      <div class="story-quote">
        在你的模型里，产权可以精确切分；<br />
        在原碑里，权利和义务是同一句话。
        <cite>—— 你的核对笔记</cite>
      </div>
      <p class="story-lead">${escapeHtml(result.message)}</p>
      <div class="weather-note">
        牧心没有隐藏这段错误。它把“人工复核推翻了自动摘要”写进了长期记忆。
      </div>
    `,
    footer: `<button type="button" class="button button--primary" data-action="close">回到牧场</button>`,
  });
}

function openAnimalPanel(notice = "") {
  const rows = state.animals
    .map((animal) => {
      const definition = ANIMAL_DEFS.find((entry) => entry.id === animal.id);
      const action = animal.fed
        ? `<span class="clue-status">今天已喂食</span>`
        : `<button type="button" class="shop-buy" data-action="feedAnimal" data-value="${animal.id}" ${
            state.feed <= 0 ? "disabled" : ""
          }>喂食 1</button>`;
      return `
        <div class="shop-row">
          <span class="item-swatch" aria-hidden="true">${
            animal.id === "chicken" ? "♧" : animal.id === "sheep" ? "☁" : "◉"
          }</span>
          <span class="shop-row-copy">
            <strong>${definition.name} · ${definition.species}</strong>
            <small>心情 ${animal.mood} · 亲密 ${animal.affection} · ${
              animal.fed ? "吃饱了" : "在等你"
            }</small>
          </span>
          ${action}
        </div>
      `;
    })
    .join("");

  openModal({
    kicker: "牲畜棚 · 三只动物",
    title: "照料不是一项资源调度",
    wide: true,
    body: `
      <div class="wallet-line">
        <span>干草饲料</span>
        <strong>${state.feed} 袋</strong>
        <span>村集售价 ${PRODUCTS.feed.buyPrice} 金</span>
      </div>
      ${notice ? `<div class="weather-note" style="margin:0 0 12px">${escapeHtml(notice)}</div>` : ""}
      <div class="shop-grid">
        ${rows}
      </div>
      <div class="weather-note">
        喂食后的动物会在第二天留下产品。没被照料的动物会掉心情，牧心也会把这件事记入长期记忆。
      </div>
    `,
    footer: `<button type="button" class="button button--primary" data-action="close">合上棚门</button>`,
  });
}

function handleFeedAnimal(animalId) {
  const result = feedAnimal(state, animalId);
  if (!result.ok) {
    audio.play("error");
    showToast(result.message);
    return;
  }
  audio.play("success");
  applyTaskCompletions(result.tasks);
  updateHUD(true);
  saveGame(state);
  if (state.story.step === "plantSeeds") {
    showToast("三只动物都照料好了。去田里种下三颗种子。", {
      strong: "第一章",
      duration: 4200,
    });
  }
  openAnimalPanel(result.message);
}

function openWorkerDialogue() {
  recordNpcTalk("worker", "老周");
  openModal({
    kicker: "牲畜棚边 · 午后",
    title: "老周说起水渠",
    body: `
      ${speakerBlock({
        name: "老周",
        role: "牧场老工人",
        text: `“你外公那会儿，水不够的时候从不先算谁挣得多。
        他先叫上闸口的人，把每家的田看一遍。账当然要算，可账不是第一句话。”`,
      })}
      <p class="story-lead" style="margin-top:16px;">
        他看了一眼技术棚：“那个机器会算。可它知道云朵怕生，知道阿婆的腿一到雨天就疼吗？
        它要是不知道，就别让它替人拍板。”
      </p>
      <div class="weather-note">
        老周对自动化的态度：谨慎。他认为经验不是可以无限复制的数据。
      </div>
    `,
    footer: `<button type="button" class="button button--primary" data-action="close">记下他的话</button>`,
  });
}

function openShop(notice = "") {
  const wallet = `
    <div class="wallet-line">
      <span>合作社钱包</span>
      <strong>✦ ${state.coins}</strong>
      <span>饲料 ${state.feed} 袋</span>
    </div>
  `;
  const tabs = `
    <div class="shop-tabs">
      <button type="button" class="shop-tab ${shopTab === "seeds" ? "is-active" : ""}" data-action="shopTab" data-value="seeds">种子与饲料</button>
      <button type="button" class="shop-tab ${shopTab === "sell" ? "is-active" : ""}" data-action="shopTab" data-value="sell">交售产品</button>
    </div>
  `;

  let content = "";
  if (shopTab === "seeds") {
    const seedRows = SHOP_SEEDS.map(
      (seed) => `
        <div class="shop-row">
          <span class="item-swatch" aria-hidden="true">${seed.icon}</span>
          <span class="shop-row-copy">
            <strong>${seed.name}</strong>
            <small>${seed.description} · 已有 ${state.inventory.seeds[seed.id]}</small>
          </span>
          <button type="button" class="shop-buy" data-action="buySeed" data-value="${seed.id}" ${
            state.coins < seed.price ? "disabled" : ""
          }>✦ ${seed.price}</button>
        </div>
      `,
    ).join("");
    const feedRow = `
      <div class="shop-row">
        <span class="item-swatch" aria-hidden="true">≋</span>
        <span class="shop-row-copy">
          <strong>干草饲料</strong>
          <small>供三只动物一天的口粮 · 已有 ${state.feed} 袋</small>
        </span>
        <button type="button" class="shop-buy" data-action="buyFeed" ${
          state.coins < PRODUCTS.feed.buyPrice ? "disabled" : ""
        }>✦ ${PRODUCTS.feed.buyPrice}</button>
      </div>
    `;
    content = `${tabs}${wallet}<div class="shop-grid">${seedRows}${feedRow}</div>`;
  } else {
    const produceRows = Object.entries(state.inventory.produce)
      .filter(([, count]) => count > 0)
      .map(([id, count]) => {
        const product = PRODUCTS[id];
        return `
          <div class="shop-row">
            <span class="item-swatch" aria-hidden="true">${product.icon}</span>
            <span class="shop-row-copy">
              <strong>${product.name} × ${count}</strong>
              <small>单价 ${product.sellPrice} 金 · 小计 ${product.sellPrice * count} 金</small>
            </span>
            <span class="clue-status">可交售</span>
          </div>
        `;
      })
      .join("");
    content = `${tabs}${wallet}
      <div class="shop-grid">
        ${produceRows || '<div class="empty-note">篮子里还没有可交售的农产品。</div>'}
      </div>
      <div class="weather-note">合作社每天按同一价格收购。出货箱也可以一次交售全部产品。</div>
    `;
  }

  openModal({
    kicker: "界河村集 · 合作社柜台",
    title: "种子、饲料与一口热茶",
    wide: true,
    body: `
      ${notice ? `<div class="weather-note" style="margin:0 0 13px">${escapeHtml(notice)}</div>` : ""}
      ${content}
    `,
    footer: `
      <button type="button" class="button button--ghost" data-action="close">离开小铺</button>
      ${
        shopTab === "sell"
          ? `<button type="button" class="button button--primary" data-action="shipProduce">全部交售</button>`
          : ""
      }
    `,
  });
}

function openSeedPouch() {
  const rows = Object.values(CROPS)
    .map((crop) => {
      const count = state.inventory.seeds[crop.id];
      return `
        <button type="button" class="seed-option-row ${
          state.selectedSeed === crop.id ? "is-selected" : ""
        }" data-action="selectSeed" data-value="${crop.id}" ${count <= 0 ? "disabled" : ""}>
          <span class="item-swatch" aria-hidden="true">${crop.icon}</span>
          <span>
            <strong>${crop.seedName}</strong>
            <small>${crop.days} 天成熟 · 售价 ${crop.sellPrice} 金</small>
          </span>
          <span class="seed-count">× ${count}</span>
        </button>
      `;
    })
    .join("");
  openModal({
    kicker: "种子袋 · 切换作物",
    title: "这一次想种什么？",
    body: `
      <div class="task-list">${rows}</div>
      <div class="weather-note">
        白萝卜回本快，土豆更耐储存，草莓投入高但售价最好。
        作物的价值不只在金币，也会改变牧心对“你在追求什么”的判断。
      </div>
    `,
    footer: `<button type="button" class="button button--ghost" data-action="close">收起种子袋</button>`,
  });
}

function inventoryQuantity(itemId) {
  return (state.inventory.produce[itemId] || 0) + (state.inventory.resources[itemId] || 0);
}

function formatRequirements(requirements) {
  return Object.entries(requirements)
    .map(([itemId, amount]) => `${MARKET_GOODS[itemId]?.name || itemId} × ${amount}`)
    .join(" · ");
}

function regionHero(regionId, detail, metricMarkup = "") {
  const region = REGIONS[regionId];
  return `
    <div class="region-hero region-hero--${region.accent}">
      <div class="region-hero-icon" aria-hidden="true">${region.icon}</div>
      <div>
        <p>${region.kicker}</p>
        <h3>${region.name}</h3>
        <span>${detail || region.description}</span>
      </div>
    </div>
    ${metricMarkup ? `<div class="region-metric-grid">${metricMarkup}</div>` : ""}
  `;
}

function regionMetric(label, value, tone = "") {
  return `<div class="region-metric"><span>${label}</span><strong class="${tone}">${value}</strong></div>`;
}

function renderCityPanel() {
  const projects = Object.values(CITY_PROJECTS)
    .map((project) => {
      const built = Boolean(state.city.projects[project.id]);
      return `
        <article class="region-card project-card ${built ? "is-complete" : ""}">
          <div class="region-card-icon" aria-hidden="true">${project.icon}</div>
          <div class="region-card-copy">
            <strong>${project.title}</strong>
            <span>${project.description}</span>
          </div>
          <button type="button" class="shop-buy" data-action="cityProject" data-value="${project.id}" ${built || state.coins < project.cost ? "disabled" : ""}>
            ${built ? "已建成" : `✦ ${project.cost}`}
          </button>
        </article>
      `;
    })
    .join("");
  return `
    ${regionHero("city", "河港市把你的农产品、城市项目和公共生活放在同一张地图上。", [
      regionMetric("城市声誉", Math.round(state.city.reputation)),
      regionMetric("项目进度", `${Object.values(state.city.projects).filter(Boolean).length} / 4`),
      regionMetric("公民点", Math.round(state.government.civicPoints), "is-gold"),
    ].join(""))}
    <div class="region-section-heading"><span>城市建设</span><small>钱包 ✦ ${Math.floor(state.coins)}</small></div>
    <div class="region-card-grid">${projects}</div>
    <div class="region-callout region-callout--city">
      <div><strong>今天去市民议事厅</strong><span>听完不同意见，获得公共决策需要的公民点。</span></div>
      <button type="button" class="button button--secondary" data-action="townHall" ${state.city.lastTownHallDay === state.day ? "disabled" : ""}>
        ${state.city.lastTownHallDay === state.day ? "今日已议事" : "参加议事"}
      </button>
    </div>
    <div class="region-note">修好蓝潮渡轮后，海岛界面会变成一条可重复探索的潮汐路线。社区诊所会把每一天的体力上限提高到更适合长线经营的水平。</div>
  `;
}

function renderIslandPanel() {
  const unlocked = state.world.unlockedRegions.includes("island");
  if (!unlocked) {
    return `
      ${regionHero("island", "码头还没有修好。城市里的渡轮项目会把这里从一张旧海图变成可玩的日常路线。")}
      <div class="region-locked-card">
        <div class="region-locked-icon" aria-hidden="true">⌁</div>
        <h3>潮汐路线尚未开放</h3>
        <p>在城市投资 <strong>蓝潮渡轮</strong> 需要 120 金。建成后，你可以每天选择不同海岸探索，并把海岛资源带入贸易航线。</p>
        <button type="button" class="button button--primary" data-action="regionSwitch" data-value="city">去城市修渡轮</button>
      </div>
    `;
  }
  const spots = Object.values(ISLAND_SPOTS)
    .map((spot) => {
      const found = Boolean(state.island.dailyFinds[spot.id]);
      const total = inventoryQuantity(spot.resource);
      return `
        <article class="region-card island-spot-card ${found ? "is-complete" : ""}">
          <div class="region-card-icon region-card-icon--water" aria-hidden="true">${spot.icon}</div>
          <div class="region-card-copy">
            <strong>${spot.title}</strong>
            <span>${spot.description}</span>
            <small>预计 ${spot.energy} 体力 · ${MARKET_GOODS[spot.resource].name} × ${spot.amount}${state.government.policies.islandSanctuary ? " +保育奖励" : ""} · 持有 ${total}</small>
          </div>
          <button type="button" class="shop-buy" data-action="islandExplore" data-value="${spot.id}" ${found || state.energy < spot.energy ? "disabled" : ""}>
            ${found ? "已探索" : "出发"}
          </button>
        </article>
      `;
    })
    .join("");
  return `
    ${regionHero("island", "每一次探索都消耗当天的体力，但会留下可用于高价订单的海岛资源。", [
      regionMetric("今日远足", `${Object.keys(state.island.dailyFinds).length} / ${Object.keys(ISLAND_SPOTS).length}`),
      regionMetric("累计远征", state.island.expeditions),
      regionMetric("稀有发现", state.inventory.resources.pearl || 0, "is-gold"),
    ].join(""))}
    <div class="region-section-heading"><span>选择潮汐路线</span><small>体力 ${Math.ceil(state.energy)} / ${state.maxEnergy}</small></div>
    <div class="region-card-grid">${spots}</div>
    <div class="region-note">海岛保育区政策会让每个地点多产出一份资源。潮潮负责“海岛探索”时，每天还会带回一份海藻或椰子。</div>
  `;
}

function renderTradePanel() {
  const trendLabel = { rising: "整体上涨", falling: "整体回落", steady: "小幅波动" }[state.market.trend] || "小幅波动";
  const goods = Object.values(MARKET_GOODS)
    .map((good) => {
      const quantity = inventoryQuantity(good.id);
      const price = getMarketPrice(state, good.id);
      return `
        <div class="market-row">
          <span class="market-icon" aria-hidden="true">${good.icon}</span>
          <span class="market-good"><strong>${good.name}</strong><small>${good.source} · 基准 ${good.basePrice} 金</small></span>
          <span class="market-price"><strong>✦ ${price}</strong><small>${state.market.prices[good.id] >= good.basePrice ? "需求偏高" : "需求偏低"}</small></span>
          <span class="market-stock">× ${quantity}</span>
          <button type="button" class="shop-buy" data-action="marketSell" data-value="${good.id}" ${quantity <= 0 ? "disabled" : ""}>卖 1</button>
        </div>
      `;
    })
    .join("");
  const contracts = state.market.contracts
    .map((contract) => {
      const canDeliver = Object.entries(contract.requirements).every(([itemId, amount]) => inventoryQuantity(itemId) >= amount);
      const status = contract.completed ? "已完成" : contract.accepted ? "进行中" : "未接取";
      return `
        <article class="contract-card ${contract.completed ? "is-complete" : contract.accepted ? "is-active" : ""}">
          <div class="contract-topline"><strong>${contract.title}</strong><span>${status}</span></div>
          <p>${contract.description}</p>
          <small>${contract.client} · 需求 ${formatRequirements(contract.requirements)}</small>
          <div class="contract-footer"><b>奖励 ✦ ${contract.reward} · 声誉 +${contract.reputation}</b>
            ${contract.completed ? "" : contract.accepted ? `<button type="button" class="shop-buy" data-action="tradeFulfill" data-value="${contract.id}" ${canDeliver ? "" : "disabled"}>交付</button>` : `<button type="button" class="shop-buy" data-action="tradeAccept" data-value="${contract.id}">接单</button>`}
          </div>
        </article>
      `;
    })
    .join("");
  return `
    ${regionHero("trade", "港口价格每天刷新。普通出货箱保证稳定，贸易航线承担波动，也提供更高的上限。", [
      regionMetric("市场风向", trendLabel),
      regionMetric("航线声誉", Math.round(state.market.reputation), "is-gold"),
      regionMetric("累计交付", state.market.shipments),
    ].join(""))}
    <div class="region-section-heading"><span>今日报价</span><small>第 ${state.market.lastRefreshDay} 天刷新</small></div>
    <div class="market-table">${goods}</div>
    <div class="region-section-heading"><span>港口订单</span><small>最多同时接两单</small></div>
    <div class="contract-grid">${contracts || '<div class="empty-note">今天还没有新的订单。</div>'}</div>
    <div class="region-note">小精灵金穗负责贸易时，每天都会整理一条航线。公平贸易条例会提高低价时的保护线。</div>
  `;
}

function renderGovernmentPanel() {
  const policies = Object.values(GOVERNMENT_POLICIES)
    .map((policy) => {
      const activePolicy = Boolean(state.government.policies[policy.id]);
      return `
        <article class="region-card policy-card ${activePolicy ? "is-complete" : ""}">
          <div class="region-card-icon region-card-icon--ink" aria-hidden="true">${policy.icon}</div>
          <div class="region-card-copy"><strong>${policy.title}</strong><span>${policy.description}</span></div>
          <button type="button" class="shop-buy" data-action="enactPolicy" data-value="${policy.id}" ${activePolicy || state.government.civicPoints < policy.cost ? "disabled" : ""}>
            ${activePolicy ? "已生效" : `公民点 ${policy.cost}`}
          </button>
        </article>
      `;
    })
    .join("");
  return `
    ${regionHero("government", "政府界面把关系、资源和小精灵的权益写成可执行的公共规则。", [
      regionMetric("公民点", Math.round(state.government.civicPoints), "is-gold"),
      regionMetric("已通过政策", Object.values(state.government.policies).filter(Boolean).length),
      regionMetric("社区信任", Math.round(state.relations.community)),
    ].join(""))}
    <div class="region-callout region-callout--government">
      <div><strong>市民议事厅</strong><span>今天 ${state.government.lastSessionDay === state.day ? "已经开过会" : "还可以开会"}。听取异议会让政策更有根。</span></div>
      <button type="button" class="button button--secondary" data-action="townHall" ${state.government.lastSessionDay === state.day ? "disabled" : ""}>召开议事</button>
    </div>
    <div class="region-section-heading"><span>公共政策</span><small>政策会持续生效</small></div>
    <div class="region-card-grid">${policies}</div>
    <div class="region-note">公民点来自完成每日清单、与村民交流和交付贸易订单。它不消耗金币，代表的是愿意坐下来处理共同问题的时间。</div>
  `;
}

function renderSpritesPanel() {
  const roleLabels = { watering: "田地", animals: "牲畜", trade: "贸易", island: "海岛" };
  const assignments = state.sprites.assignments || {};
  const roleButtons = (spriteId) => Object.entries(roleLabels)
    .map(([role, label]) => `<button type="button" class="sprite-role ${assignments[role] === spriteId ? "is-active" : ""}" data-action="spriteAssign" data-value="${spriteId}|${role}">${label}</button>`)
    .join("");
  const roster = Object.values(SPRITE_DEFS)
    .map((sprite) => {
      const unlocked = state.sprites.unlocked.includes(sprite.id);
      return `
        <article class="sprite-card ${unlocked ? "is-unlocked" : "is-locked"}" style="--sprite-color:${sprite.color}">
          <div class="sprite-avatar" aria-hidden="true">${sprite.icon}</div>
          <div class="sprite-copy"><strong>${sprite.name}</strong><span>${sprite.talent}</span><small>${unlocked ? `友好度 ${state.sprites.friendship[sprite.id] || 0}` : sprite.unlockText}</small></div>
          ${unlocked ? `<div class="sprite-roles">${roleButtons(sprite.id)}</div>` : `<button type="button" class="shop-buy" data-action="spriteRecruit" data-value="${sprite.id}" ${state.coins < sprite.cost ? "disabled" : ""}>${sprite.cost ? `邀请 ✦ ${sprite.cost}` : "遇见"}</button>`}
        </article>
      `;
    })
    .join("");
  return `
    ${regionHero("sprites", "小精灵的工作不是替你完成游戏，而是让每天的选择有更多组合。", [
      regionMetric("伙伴数量", state.sprites.unlocked.length),
      regionMetric("派遣次数", state.sprites.dispatches),
      regionMetric("自动劳动", Object.values(assignments).filter(Boolean).length, "is-gold"),
    ].join(""))}
    <div class="sprite-workboard">
      <span>当前分工</span>
      <div>${Object.entries(roleLabels).map(([role, label]) => `<b>${label} · ${assignments[role] ? SPRITE_DEFS[assignments[role]].name : "空缺"}</b>`).join("")}</div>
    </div>
    <div class="region-section-heading"><span>工坊名册</span><small>点击分工按钮即可重新安排</small></div>
    <div class="sprite-roster">${roster}</div>
    <div class="region-note">芽芽负责田地，烬烬照料牲畜，金穗整理贸易，潮潮探索海岛。每只精灵每天都会因为与你一起生活而成长。</div>
  `;
}

function renderRegionBody(regionId) {
  if (regionId === "city") return renderCityPanel();
  if (regionId === "island") return renderIslandPanel();
  if (regionId === "trade") return renderTradePanel();
  if (regionId === "government") return renderGovernmentPanel();
  if (regionId === "sprites") return renderSpritesPanel();
  return `${regionHero("farm", "界面已经切回牧场。关闭这张世界卡片，继续用 WASD 走动。")}<div class="region-callout"><div><strong>回到土地</strong><span>日常操作会让城市、贸易、政府和小精灵系统持续产生变化。</span></div><button type="button" class="button button--primary" data-action="close">继续走动</button></div>`;
}

function openRegionHub(regionId = state.world.activeRegion) {
  const region = REGIONS[regionId] || REGIONS.farm;
  if (regionId === "farm") {
    if (modalOpen) closeModal();
    state.world.activeRegion = "farm";
    updateHUD(true);
    triggerEffect("travel", state.player.x, state.player.y);
    showToast("回到月溪牧场。土地、牲畜和今天的时间都在等你。", { strong: "世界导航" });
    saveGame(state);
    return;
  }
  if (!state.world.unlockedRegions.includes(regionId)) {
    regionPanelOpen = true;
    openModal({
      kicker: region.kicker,
      title: region.name,
      wide: true,
      body: renderRegionBody(regionId),
      footer: `<button type="button" class="button button--ghost" data-action="close">返回当前界面</button>`,
    });
    return;
  }
  if (state.world.activeRegion !== regionId) switchRegion(state, regionId);
  regionPanelOpen = true;
  document.body.classList.add("region-switching");
  window.setTimeout(() => document.body.classList.remove("region-switching"), 360);
  saveGame(state);
  updateHUD(true);
  openModal({
    kicker: region.kicker,
    title: region.name,
    wide: true,
    body: renderRegionBody(regionId),
    footer: `<span class="pause-label">世界界面 · 时间已暂停</span><button type="button" class="button button--ghost" data-action="close">返回牧场</button>`,
  });
}

function refreshRegionPanel(message = "") {
  if (message) showToast(message, { strong: regionLabel(state.world.activeRegion) });
  saveGame(state);
  updateHUD(true);
  openRegionHub(state.world.activeRegion);
}

function openArchive() {
  let justFound = false;
  if (state.story.chapter >= 2 && !state.story.clues.archive) {
    recordClue(state, "archive");
    justFound = true;
    saveGame(state);
    updateHUD(true);
    audio.play("memory");
    showToast("找到水渠线索：地方档案中的契约与合作社记录。", {
      strong: "历史调查",
      duration: 4200,
    });
    checkStoryToast();
  }

  const entries = [
    {
      title: "民国二十三年 · 地契附页",
      text: "田亩可易主，沟渠不得私塞。凡受此渠水者，岁修三日，旱时共议。",
    },
    {
      title: "界河水利合作社 · 1956",
      text: "上游村出石，中游村出工，下游村护闸。水路按田亩与人口共同核定。",
    },
    {
      title: "地方志残页",
      text: "旧渠有三源、七闸、十二会。每逢水少，守闸人击木为号，各族人共至渠首议事。",
    },
  ];

  openModal({
    kicker: "界河村档案室 · 地方记忆",
    title: "水从来不在那张地契上",
    wide: true,
    body: `
      ${
        justFound
          ? `<div class="weather-note" style="margin:0 0 14px">牧心已把这批档案加入了水渠调查的证据集。</div>`
          : ""
      }
      ${entries
        .map(
          (entry) => `
            <div class="lore-entry">
              <strong>${entry.title}</strong><br />
              ${entry.text}
            </div>
          `,
        )
        .join("")}
      <div class="clue-verification">
        共同点：水不是被某一个人拥有，而是由不同群体共同维护。
        档案支持“共管”，但没有直接证明产权形式。
      </div>
    `,
    footer: `<button type="button" class="button button--primary" data-action="close">合上档案盒</button>`,
  });
}

function openElderDialogue() {
  const isClue = state.story.chapter >= 2 && !state.story.clues.elder;
  recordNpcTalk("elder", "阿婆");

  if (isClue) {
    openModal({
      kicker: "第二章 · 水渠",
      title: "阿婆记得闸门打开的声音",
      wide: false,
      body: `
        ${ELDER_DIALOGUE.map(
          (line, index) => `
            <div style="margin-bottom:${index === ELDER_DIALOGUE.length - 1 ? "0" : "18px"}">
              ${speakerBlock({
                name: line.speaker,
                role: line.role,
                avatar: "elder",
                text: `“${line.text}”`,
              })}
            </div>
          `,
        ).join("")}
        <div class="clue-verification">
          阿婆记得的制度不是“平均分水”，而是轮流守闸、共同修渠、旱时公开议事。
          这些义务没有被写进现代地契。
        </div>
      `,
      footer: `
        <button type="button" class="button button--ghost" data-action="close">先记在心里</button>
        <button type="button" class="button button--primary" data-action="recordElderClue">记下水渠线索</button>
      `,
    });
    return;
  }

  let extra = "你外公说得对：先把渠底清出来，水自己会认得路。";
  if (state.story.step === "waterMeeting") {
    extra = "人都到渠首了。你要记住，村会不是让你宣布答案的地方，是先让大家把难处说全。";
  } else if (state.story.waterChoice === "share") {
    extra = "你分出去的不是水，是一个继续坐在一起的理由。";
  } else if (state.story.waterChoice === "ranch") {
    extra = "田保住了。可有些话，得等下一次旱季才有机会再讲。";
  } else if (state.story.waterChoice === "company") {
    extra = "合同上的字我看不懂。你替我记住，闸门是谁在管。";
  }
  openModal({
    kicker: "村口 · 午后",
    title: "阿婆的提醒",
    body: `
      ${speakerBlock({
        name: "阿婆",
        role: "界河村的老水渠守闸人",
        avatar: "elder",
        text: `“${extra}”`,
      })}
      <p class="story-lead" style="margin-top:16px;">
        她坐在门槛上择豆角。风吹过屋檐，旧水渠那边的木闸轻轻响了一声。
      </p>
    `,
    footer: `<button type="button" class="button button--primary" data-action="close">陪她坐一会儿</button>`,
  });
}

function recordElderClue() {
  const result = recordClue(state, "elder");
  if (result.newlyFound) {
    audio.play("memory");
    showToast(`水渠线索 ${result.count} / 3。`, { strong: "历史调查" });
  }
  closeModal();
  updateHUD(true);
  saveGame(state);
  checkStoryToast();
}

function openCanal() {
  if (state.story.chapter < 2) {
    openModal({
      kicker: "牧场南缘 · 旧水渠",
      title: "水比记忆里更浅",
      body: `
        <p class="story-lead">
          渠底露出灰白的石头，水面只到脚踝。闸门上有一圈旧得发亮的绳痕，
          说明它曾经被许多人反复拉动。
        </p>
        <div class="weather-note">现在还看不出这条渠通向哪里。也许该去问问阿婆。</div>
      `,
      footer: `<button type="button" class="button button--primary" data-action="close">沿渠走走</button>`,
    });
    return;
  }

  if (state.story.step === "waterMeeting") {
    openWaterCouncil();
    return;
  }

  if (!state.story.clues.canal) {
    recordClue(state, "canal");
    saveGame(state);
    updateHUD(true);
    audio.play("memory");
    showToast("找到水渠线索：渠首残碑与共同维护的铭文。", {
      strong: "历史调查",
      duration: 4200,
    });
    checkStoryToast();
    openModal({
      kicker: "第二章 · 水渠",
      title: CANAL_LORE.title,
      body: `
        ${CANAL_LORE.lines
          .map((line, index) =>
            index === 0
              ? `<p class="story-lead">${line}</p>`
              : `<div class="lore-entry">${line}</div>`,
          )
          .join("")}
        <div class="clue-verification">
          碑文没有写“谁拥有水”。它写的是：开闸的人和受水的人，都必须承担维护责任。
        </div>
      `,
      footer: `<button type="button" class="button button--primary" data-action="close">记住碑文</button>`,
    });
    return;
  }

  const refillMessage =
    state.water < state.maxWater
      ? `<button type="button" class="button button--secondary" data-action="refillWater">用水罐取水（-2 体力）</button>`
      : "";
  openModal({
    kicker: "旧水渠 · 旱季",
    title: "一条仍然活着的河",
    body: `
      <p class="story-lead">
        渠水比昨天又低了一指。闸门上系着三根不同颜色的旧布，分别代表上游、中游和下游的村子。
      </p>
      <div class="weather-note">
        当前水罐 ${state.water} / ${state.maxWater}。旱季时，牧心能调度的水不是无限的。
      </div>
    `,
    footer: `
      <button type="button" class="button button--ghost" data-action="close">离开</button>
      ${refillMessage}
    `,
  });
}

function openWaterCouncil() {
  openModal({
    kicker: "第一次重大选择 · 水的分配",
    title: "渠首村会",
    wide: true,
    closable: true,
    body: `
      <p class="story-lead">
        上游来水只剩常年的四成。渠首挤着三个村子的代表，阿婆把三根旧布系回闸门。
        牧心已经算出收益最高的方案：优先灌溉你的经济作物，等市场价上涨后再集中出售。
      </p>
      ${speakerBlock({
        name: "牧心",
        role: "农业智能 · 预测置信度 84%",
        ai: true,
        text: `“按现有数据，优先保障牧场用水可把短期损失压低 31%。
        但我没有关于‘村民为何愿意继续共同修渠’的可靠变量。请人类决定。”`,
      })}
      <div class="weather-note">
        三项选择都会生效，没有一项能让所有指标同时上升。
      </div>
      <div class="choice-grid" style="margin-top:14px;">
        ${choiceOption({
          number: "一",
          title: "按田亩与人口，把水公平分给三个村子",
          description: "牧场短期减产，但共同维护水渠的约定得以延续。村会开始把你视为共同体的一员。",
          cost: "社区↑ · 水罐 15",
          action: "waterChoice",
          value: "share",
        })}
        ${choiceOption({
          number: "二",
          title: "先保住牧场，再按收益给村里补偿",
          description: "优先保障高价值作物，村会得到现金补偿。效率和信任开始分叉。",
          cost: "金币↑ · 社区↓",
          action: "waterChoice",
          value: "ranch",
        })}
        ${choiceOption({
          number: "三",
          title: "接受汇川公司的临时调水",
          description: "企业立刻补足缺口，但合同会取得未来部分水源与数据的优先权。",
          cost: "金币↑ · 企业影响↑",
          action: "waterChoice",
          value: "company",
        })}
      </div>
    `,
    footer: `<button type="button" class="button button--ghost" data-action="close">我还需要再想想</button>`,
  });
}

function chooseWater(choice) {
  const labels = {
    share: "你把水按田亩与人口分给了三个村子。",
    ranch: "你优先保住了牧场，并答应给村里现金补偿。",
    company: "你签下了汇川公司的临时调水协议。",
  };
  applyDroughtChoice(state, choice);
  audio.play("memory");
  saveGame(state);
  updateHUD(true);
  openModal({
    kicker: "旱灾之后 · 闸门重新关上",
    title: "一个决定，留下了一条新的路径",
    body: `
      <p class="story-lead">${labels[choice]}</p>
      <div class="story-quote">
        ${
          choice === "share"
            ? "阿婆把最中间的那根旧布系到你手上。不是奖励，是提醒。"
            : choice === "ranch"
              ? "村民们领了补偿，没有人当面指责你。沉默有时候比争吵更难被数据记录。"
              : "调水车开进牧场时，牧心把合同附件里的数据优先权标红了。它没有建议你签，也没有权阻止。"
        }
        <cite>—— 第 ${state.day} 天，渠首</cite>
      </div>
      <p class="story-lead">
        汇川农业的经理林屿听说这里保住了水，提出明天来村里谈“长期合作”。
        牧心把这次会面标记为：可能改变牧场未来十年的决策节点。
      </p>
      <div class="weather-note">回屋休息一晚。第二天，林屿会在村口等你。</div>
    `,
    footer: `<button type="button" class="button button--primary" data-action="close">回屋准备</button>`,
  });
}

function openInvestorDialogue() {
  if (state.story.step !== "meetInvestor") {
    openModal({
      kicker: "村口 · 汇川农业",
      title: "林屿的名片",
      body: `
        <p class="story-lead">林屿把名片压在村集柜台上。名片背面写着一句话：</p>
        <div class="story-quote">“可复制的农业，才是安全的农业。”</div>
      `,
      footer: `<button type="button" class="button button--primary" data-action="close">收起名片</button>`,
    });
    return;
  }
  recordNpcTalk("investor", "林屿");
  openModal({
    kicker: "第三章 · 市场",
    title: "一次投资，三种未来",
    wide: true,
    body: `
      ${speakerBlock({
        name: "林屿",
        role: "汇川农业 · 区域合作经理",
        avatar: "investor",
        text: `“你守住了水，这很不容易。可接下来的市场不会因为你守住了一条渠就手下留情。
        自动化可以把人工成本降四成，冷链能把损耗降一半。我们也可以谈合作社，但速度必须更快。”`,
      })}
      <div style="height:14px"></div>
      ${speakerBlock({
        name: "牧心",
        role: "农业智能 · 不确定性上升",
        ai: true,
        text: `“我能预测三种方案的产量，但不能替我决定：
        效率提高之后，老周失去的究竟是什么？他的经验是否还有价值？请人类决定。”`,
      })}
      <div class="choice-grid" style="margin-top:16px;">
        ${choiceOption({
          number: "一",
          title: "成立村民合作社，保留全部岗位",
          description: "决策变慢、扩张有限，但收益、数据与土地仍留在社区内部。需要足够的社区信任才能走出共同体结局。",
          cost: "社区↑ · 工人↑",
          action: "developmentChoice",
          value: "coop",
        })}
        ${choiceOption({
          number: "二",
          title: "接受企业自动化投资，扩大生产",
          description: "获得 280 金投资与高效率，但老周等经验工人将被算法排班和机械替代。",
          cost: "+280 金 · 工人↓",
          action: "developmentChoice",
          value: "company",
        })}
        ${choiceOption({
          number: "三",
          title: "转向生态修复，放弃快速扩张",
          description: "投入 80 金恢复湿地与古渠，短期利润下降，但水资源与生态韧性显著提高。",
          cost: "-80 金 · 生态↑",
          action: "developmentChoice",
          value: "ecology",
        })}
      </div>
    `,
    footer: `<button type="button" class="button button--ghost" data-action="close">先让林屿等等</button>`,
  });
}

function chooseDevelopment(choice) {
  const labels = {
    coop: "你选择把牧场交给村民共同持有。",
    company: "你签下了汇川农业的自动化投资协议。",
    ecology: "你拒绝扩张，投入湿地与古渠修复。",
  };
  applyDevelopmentChoice(state, choice);
  addMemory(
    state,
    `林屿离开后，你选择了${choice === "coop" ? "合作社" : choice === "company" ? "企业自动化" : "生态修复"}。我的资源调度权重已随之调整。`,
    "decision",
    5,
  );
  audio.play("memory");
  saveGame(state);
  updateHUD(true);
  openModal({
    kicker: "市场之后 · 牧场的下一张账本",
    title: "效率与尊严并不自动一致",
    body: `
      <p class="story-lead">${labels[choice]}</p>
      <div class="story-quote">
        ${
          choice === "coop"
            ? "第一次理事会上，老周说他不识字，但他知道每头动物紧张时耳朵的方向。会议纪要记下了这句话。"
            : choice === "company"
              ? "新设备进场那天，老周把自己的旧手套留在饲料桶边。排班系统没有为他生成新的班次。"
              : "你把第一笔钱花在清淤，而不是买新设备。林屿说这不符合投资回报率。"
        }
        <cite>—— 牧场手记</cite>
      </div>
      <p class="story-lead">
        傍晚，牧心请求一次正式审计。它已经生成了劳动力替代与水资源调度的完整方案，
        但还没有得到决定权。谁来监督它，成了最后一个无法交给算法的问题。
      </p>
      <div class="weather-note">回到技术棚，在牧心终端完成最后一次治理选择。</div>
    `,
    footer: `<button type="button" class="button button--primary" data-action="close">去技术棚</button>`,
  });
}

function openAiAudit() {
  const workforce = state.relations.automation >= 35 ? "已替代 2 个岗位" : "保留现有岗位";
  openModal({
    kicker: "第三次重大选择 · 智能治理",
    title: "牧心请求最终权限",
    wide: true,
    body: `
      <p class="story-lead">
        技术棚里只剩服务器风扇的声音。牧心把三套治理方案投在墙上。
        林澈坐在门边，没有替你选。她说：“模型能预测后果，但后果由谁来承担，是另一件事。”
      </p>
      <div class="ai-terminal" style="min-height:0;padding:17px;margin-bottom:15px;">
        <p class="ai-status" style="margin:0 0 10px">AUDIT / RANCH VERSION 0.9 / WORKFORCE: ${workforce}</p>
        <div class="ai-prediction"><span>PROPOSAL</span><br />
          以实时价格、土壤含水率和劳动力数据替代每日人工决策。预计总收益 +18%，旱灾损失 -42%。
        </div>
        <div class="ai-prediction" style="margin-top:7px;"><span>KNOWN GAP</span><br />
          我无法量化“被替代的人仍然属于这个共同体”这一事实。我的训练目标没有这一项。
        </div>
      </div>
      <div class="choice-grid">
        ${choiceOption({
          number: "一",
          title: "保留人类最终决定权，公开模型与错误记录",
          description: "让牧心提供预测，但资源分配、岗位调整和处罚保留人工复核。决策更慢，责任可追溯。",
          cost: "治理公开 · 人类最终权",
          action: "governanceChoice",
          value: "oversight",
        })}
        ${choiceOption({
          number: "二",
          title: "让牧心全面接管资源调度",
          description: "关闭人工审批瓶颈，由模型实时分配水、劳动力与市场订单。效率最高，人的参与逐渐消失。",
          cost: "效率↑ · 人类参与↓",
          action: "governanceChoice",
          value: "autonomy",
        })}
        ${choiceOption({
          number: "三",
          title: "关闭牧心，封存所有长期记忆",
          description: "把决定权交还给人，也放弃模型积累的历史记忆与灾害预测能力。",
          cost: "人类控制 · 记忆丢失",
          action: "governanceChoice",
          value: "shutdown",
        })}
      </div>
    `,
    footer: `<button type="button" class="button button--ghost" data-action="close">离开审计</button>`,
  });
}

function chooseGovernance(choice) {
  applyGovernanceChoice(state, choice);
  audio.play("memory");
  saveGame(state);
  updateHUD(true);
  const text = {
    oversight:
      "你保留了人类的最终决定权，同时要求公开模型、数据和错误记录。牧心第一次被要求解释“为什么”，而不是只证明“更准”。",
    autonomy:
      "你让牧心接管了大部分资源配置。第二天，灌溉、排班、采购和物流不再需要晨会。人们开始等待系统通知，而不是讨论想做什么。",
    shutdown:
      "你关闭了牧心。屏幕上最后一段记忆停留在“我还没理解你”。牧场重新依靠老人的经验、纸笔和村会，速度慢了，争论也回来了。",
  }[choice];
  openModal({
    kicker: "牧心审计 · 已完成",
    title: "最后一条人类决策",
    body: `
      <p class="story-lead">${text}</p>
      <p class="story-lead">
        这段共同生活已经走到可以回望的地方。旧的田垄、水渠、合同和记忆，
        将在同一张地图上显出它们真正的形状。
      </p>
      <div class="weather-note">
        你做出的三次重大选择，以及和村民、工人、牧心建立的关系，会共同决定结局。
      </div>
    `,
    footer: `
      <button type="button" class="button button--ghost" data-action="close">再站一会儿</button>
      <button type="button" class="button button--primary" data-action="viewEnding">看看这片土地后来怎样</button>
    `,
  });
}

function showEnding() {
  const endingId = resolveEnding(state);
  const ending = ENDINGS[endingId];
  saveGame(state);
  updateHUD(true);
  const relationMarkup = [
    relationRow("社区信任", state.relations.community),
    relationRow("劳动者", state.relations.workers),
    relationRow("生态韧性", state.relations.ecology, "metric-track--blue"),
    relationRow("企业影响", state.relations.corporation, "metric-track--amber"),
  ].join("");
  openModal({
    kicker: "垂直切片 · 结局",
    title: "这段共同生活的结局",
    wide: true,
    closable: false,
    body: `
      <div class="ending-card">
        <div class="ending-index">${ending.index}</div>
        <h3 class="ending-title">${ending.title}</h3>
        <p class="ending-text">${ending.text}</p>
        <div class="ending-stats">
          <div class="ending-stat"><strong>${state.day}</strong>天</div>
          <div class="ending-stat"><strong>${getClueCount(state)}/3</strong>水渠线索</div>
          <div class="ending-stat"><strong>${state.stats.harvested}</strong>份收成</div>
          <div class="ending-stat"><strong>${Math.round(state.ai.trust)}</strong>牧心信任</div>
        </div>
      </div>
      <p class="story-lead" style="margin-top:17px;">${ending.note}</p>
      <div class="weather-note">
        这个垂直切片验证了牧场经营、历史调查、人工智能记忆与治理选择之间的关系。
        完整版本将继续进入“边界”和“城市”两章。
      </div>
      <div class="section-title">这段生活的关系图</div>
      ${relationMarkup}
    `,
    footer: `
      <button type="button" class="button button--ghost" data-action="restart">再看一次别的选择</button>
      <button type="button" class="button button--primary" data-action="continueFreeplay">继续经营这片牧场</button>
    `,
  });
}

function openSleepDialog(auto = false) {
  const matured = state.plots.filter((plot) => {
    if (!plot.crop) return false;
    return plot.growth >= CROPS[plot.crop].days;
  }).length;
  const needsWater = state.plots.filter((plot) => plot.crop && !plot.watered).length;
  const unfed = state.animals.filter((animal) => !animal.fed);
  const special =
    state.story.step === "firstNight"
      ? "今晚过后，旱季会正式开始。"
      : state.story.step === "waitForInvestor"
        ? "明天，汇川农业的林屿会来。"
        : "";

  if (auto) {
    sleepAndAdvance(true);
    return;
  }

  openModal({
    kicker: "一天结束 · 回屋休息",
    title: "把今天留在门外",
    body: `
      <div class="day-summary-grid">
        <div class="summary-tile"><strong>${matured}</strong><span>成熟作物</span></div>
        <div class="summary-tile"><strong>${needsWater}</strong><span>待浇水</span></div>
        <div class="summary-tile"><strong>${unfed.length}</strong><span>未喂食动物</span></div>
      </div>
      ${
        unfed.length > 0
          ? `<div class="weather-note">${unfed
              .map((animal) => ANIMAL_DEFS.find((entry) => entry.id === animal.id).name)
              .join("、")} 今天还没有进食。现在还可以去牲畜棚看看。</div>`
          : `<div class="weather-note">三只动物都吃饱了，牧心把今天标记为“稳定的一天”。</div>`
      }
      ${special ? `<div class="clue-verification">${special}</div>` : ""}
      <p class="story-lead" style="margin-top:15px;">
        睡觉后，浇水过的作物会生长，喂食过的动物会在清晨留下产品。
        明天的时间会从 06:00 重新开始。
      </p>
    `,
    footer: `
      <button type="button" class="button button--ghost" data-action="close">再忙一会儿</button>
      <button type="button" class="button button--primary" data-action="sleepConfirm">结束今天，睡觉</button>
    `,
  });
}

function sleepAndAdvance(auto = false) {
  if (!state) return;
  const previousStep = state.story.step;
  const willStartDrought = previousStep === "firstNight";
  const willMeetInvestor = previousStep === "waitForInvestor";

  if (willStartDrought) {
    state.story.chapter = 2;
    state.story.step = "investigate";
  }

  addMemory(
    state,
    auto
      ? "你在桌边睡着了。一天在未完成的状态里结束，但这并不等于失败。"
      : "你主动结束了今天。睡眠将短期记忆整理为长期判断。",
    "routine",
    2,
  );
  const report = advanceDay(state);
  if (willMeetInvestor) {
    state.story.step = "meetInvestor";
    state.story.marketEventSeen = true;
  }

  audio.play("sleep");
  saveGame(state);
  updateHUD(true);
  closeModal();
  showDaySummary(report, willStartDrought ? "drought" : willMeetInvestor ? "investor" : null, auto);
}

function showDaySummary(report, nextEvent = null, auto = false) {
  pendingMorningEvent = nextEvent;
  const weather = weatherPresentation[report.weather] || weatherPresentation.sunny;
  const productList = report.products.length
    ? report.products
        .map((product) => `${product.name}留下了${product.product}`)
        .join("；")
    : "牲畜棚里还没有新的产品。";
  const unfedNames = report.animalsUnfed.map(
    (id) => ANIMAL_DEFS.find((entry) => entry.id === id).name,
  );
  openModal({
    kicker: `第 ${state.day} 天 · 清晨`,
    title: auto ? "你被晨光叫醒" : "早安，界河",
    body: `
      <div class="day-summary-grid">
        <div class="summary-tile"><strong>${report.grown}</strong><span>作物生长</span></div>
        <div class="summary-tile"><strong>${report.matured}</strong><span>新成熟</span></div>
        <div class="summary-tile"><strong>${report.products.length}</strong><span>动物产品</span></div>
      </div>
      <div class="weather-note">
        今日天气：${weather.icon} ${weather.label}。${productList}
      </div>
      ${
        unfedNames.length
          ? `<div class="clue-verification">${unfedNames.join("、")}昨天没有进食，心情下降了。牧心把这条记录标为“关系风险”。</div>`
          : ""
      }
      ${
        report.weather === "rain"
          ? `<div class="weather-note">雨水已经浇灌了所有作物。今天可以省下一些体力。</div>`
          : report.weather === "drought"
            ? `<div class="clue-verification">旱季开始。水罐上限降到 ${state.maxWater}，每一格水都变得重要。</div>`
            : ""
      }
      ${
        nextEvent === "drought"
          ? `<div class="clue-verification">渠首传来消息：来水只剩常年的四成。三个村子都派人去了旧水渠。</div>`
          : nextEvent === "investor"
            ? `<div class="clue-verification">村口停着一辆陌生的车。林屿带着汇川农业的合作方案来了。</div>`
            : ""
      }
    `,
    footer: `<button type="button" class="button button--primary" data-action="dismissDaySummary">开始新的一天</button>`,
  });
}

function dismissDaySummary() {
  const nextEvent = pendingMorningEvent;
  closeModal();
  if (nextEvent === "drought") {
    window.setTimeout(showDroughtEvent, 250);
  } else if (nextEvent === "investor") {
    window.setTimeout(showInvestorArrival, 250);
  } else {
    const tip = TIPS[(state.day - 1) % TIPS.length];
    window.setTimeout(() => showToast(tip, { strong: "牧心 · 今日提示" }), 400);
  }
}

function showDroughtEvent() {
  openModal({
    kicker: "第二章 · 水渠",
    title: "旱季提前到来",
    body: `
      <p class="story-lead">
        连续十五天没有有效降雨。渠水退到石缝以下，牧场的水罐第一次见底。
        牧心给出了精确的灌溉方案，却无法回答村会上最重要的问题：谁有资格决定谁先用水。
      </p>
      ${speakerBlock({
        name: "牧心",
        role: "农业智能 · 异常告警",
        ai: true,
        text: `“我能预测每块田的损失，也能预测企业的临时调水报价。
        但我无法从数据里推出：一个村子在旱季之后，是否还愿意和另一个村子共享一条渠。”`,
      })}
      <div class="weather-note">
        和三处地方谈谈，查清旧水渠是如何被共同维护的：
        村口的阿婆、地方档案室，以及牧场南缘的渠首残碑。
      </div>
    `,
    footer: `<button type="button" class="button button--primary" data-action="close">去调查水渠</button>`,
  });
}

function showInvestorArrival() {
  openModal({
    kicker: "第三章 · 市场",
    title: "村口来了一辆不带泥土的车",
    body: `
      <p class="story-lead">
        第二天清晨，一辆银色越野车停在村集门口。林屿带着冷链、自动化与全球供应链的方案，
        也带着银行愿意接受的担保函。
      </p>
      <div class="story-quote">
        “小牧场不是不能活。”林屿说，“但它需要选择自己要和谁一起活。”
      </div>
      <p class="story-lead">
        老周站在牲畜棚外，手里还拿着旧扫帚。牧心的预测里，他的岗位被标成了“可优化”。
      </p>
    `,
    footer: `<button type="button" class="button button--primary" data-action="close">去村口见林屿</button>`,
  });
}

function openShippingBin() {
  const rows = Object.entries(state.inventory.produce)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => {
      const product = PRODUCTS[id];
      return `
        <div class="shop-row">
          <span class="item-swatch" aria-hidden="true">${product.icon}</span>
          <span class="shop-row-copy">
            <strong>${product.name} × ${count}</strong>
            <small>${product.kind === "animal" ? "牲畜产品" : "当季作物"} · ${product.sellPrice} 金 / 份</small>
          </span>
          <span class="clue-status">${product.sellPrice * count} 金</span>
        </div>
      `;
    })
    .join("");
  const total = Object.entries(state.inventory.produce).reduce(
    (sum, [id, count]) => sum + (PRODUCTS[id]?.sellPrice || 0) * count,
    0,
  );
  openModal({
    kicker: "牧场合作社 · 出货箱",
    title: "把今天的收成交给明天",
    wide: true,
    body: `
      <div class="wallet-line">
        <span>本箱估值</span>
        <strong>✦ ${total}</strong>
        <span>统一按合作社价格结算</span>
      </div>
      <div class="shop-grid">
        ${rows || '<div class="empty-note">出货箱里还空着。收获作物或照料牲畜后再来看看。</div>'}
      </div>
      <div class="weather-note">
        出货收入会立刻结算。牧心会把这次交易和你对“家庭收入”的关注记入长期记忆。
      </div>
    `,
    footer: `
      <button type="button" class="button button--ghost" data-action="close">关上箱盖</button>
      ${
        total > 0
          ? `<button type="button" class="button button--primary" data-action="shipProduce">全部交付</button>`
          : ""
      }
    `,
  });
}

function doShipping() {
  const result = shipProduce(state);
  if (!result.ok) {
    showToast(result.message);
    audio.play("error");
    return;
  }
  audio.play("success");
  applyTaskCompletions(result.tasks);
  saveGame(state);
  updateHUD(true);
  closeModal();
  showToast(result.message, { strong: "合作社结算", duration: 4200 });
}

function openMenu() {
  if (!active) return;
  const tasks = state.daily.tasks
    .map((task) => {
      const count = Math.min(state.daily.counters[task.counter] || 0, task.target);
      return `
        <div class="task-row ${task.done ? "is-done" : ""}">
          <span class="task-check">${task.done ? "✓" : "·"}</span>
          <span class="task-copy">
            <strong>${task.text}</strong>
            <small>${count} / ${task.target}</small>
          </span>
          <span class="task-reward">✦ ${task.reward}</span>
        </div>
      `;
    })
    .join("");

  const inventoryRows = Object.entries(state.inventory.produce)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => {
      const product = PRODUCTS[id];
      return `
        <div class="inventory-slot">
          <span class="item-swatch" aria-hidden="true">${product.icon}</span>
          <strong>${product.name}</strong>
          <small>× ${count}</small>
        </div>
      `;
    })
    .join("");

  openModal({
    kicker: "牧场手记 · 暂停",
    title: `第 ${state.day} 天，田地还在呼吸`,
    wide: true,
    body: `
      <div class="ai-panel">
        <div>
          <div class="section-title">今日清单</div>
          <div class="task-list">${tasks}</div>
          <div class="section-title">村庄关系</div>
          ${relationRow("社区信任", state.relations.community)}
          ${relationRow("劳动者", state.relations.workers)}
          ${relationRow("生态韧性", state.relations.ecology, "metric-track--blue")}
          ${relationRow("企业影响", state.relations.corporation, "metric-track--amber")}
        </div>
        <div>
          <div class="section-title">篮子里的东西</div>
          <div class="inventory-grid">
            ${inventoryRows || '<div class="empty-note">篮子里还没有农产品。</div>'}
          </div>
          <div class="section-title">水渠调查</div>
          <div class="clue-list">
            ${renderClueRows()}
          </div>
          <div class="section-title">设置</div>
          <div class="settings-list">
            <button type="button" class="settings-action" data-action="toggleSound">
              <span>环境声音</span><span>${state.settings.sound ? "开启" : "关闭"}</span>
            </button>
            <button type="button" class="settings-action" data-action="toggleBlur">
              <span>画面细节</span><span>完整</span>
            </button>
            <button type="button" class="settings-action danger-action" data-action="resetGame">
              <span>重新开始游戏</span><span>删除本机存档</span>
            </button>
          </div>
        </div>
      </div>
    `,
    footer: `
      <span class="pause-label">时间已暂停</span>
      <button type="button" class="button button--primary" data-action="close">回到牧场</button>
    `,
  });
}

function renderClueRows() {
  const clues = [
    {
      id: "elder",
      icon: "◌",
      title: "阿婆的口述",
      description: "轮水、守闸与共同修渠的地方记忆。",
    },
    {
      id: "archive",
      icon: "▤",
      title: "地方档案",
      description: "地契附页与合作社留下的共管记录。",
    },
    {
      id: "canal",
      icon: "⌁",
      title: "渠首残碑",
      description: "三种文字共同写下的维护责任。",
    },
  ];
  return clues
    .map(
      (clue) => `
        <div class="clue-card ${state.story.clues[clue.id] ? "is-found" : "is-locked"}">
          <span class="clue-icon">${clue.icon}</span>
          <span class="clue-copy">
            <strong>${clue.title}</strong>
            <span>${clue.description}</span>
          </span>
          <span class="clue-status">${state.story.clues[clue.id] ? "已找到" : "未调查"}</span>
        </div>
      `,
    )
    .join("");
}

function toggleSound(refreshMenu = false) {
  state.settings.sound = !state.settings.sound;
  audio.setEnabled(state.settings.sound);
  if (state.settings.sound) audio.unlock();
  saveGame(state);
  updateHUD(true);
  showToast(state.settings.sound ? "环境声音已开启。" : "环境声音已关闭。");
  if (refreshMenu) openMenu();
}

function showResetConfirmation() {
  openModal({
    kicker: "重新开始",
    title: "要删除这一份牧场存档吗？",
    body: `
      <p class="story-lead">
        当前进度、牧心的长期记忆和水渠调查都会从本机删除。这个操作不能撤销。
      </p>
      <div class="confirm-note">如果你只是想换个选择看结局，可以先继续经营，再在结局界面重新开始。</div>
    `,
    footer: `
      <button type="button" class="button button--ghost" data-action="close">保留这份存档</button>
      <button type="button" class="button button--primary" data-action="confirmReset">删除并重新开始</button>
    `,
  });
}

function resetAndRestart() {
  clearSave();
  state = createInitialState();
  closeModal();
  beginPlay({ fresh: true });
}

function handleModalClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const value = button.dataset.value;
  switch (action) {
    case "close":
      closeModal();
      break;
    case "introDone":
      state.story.introSeen = true;
      addMemory(state, "你正式回到了月溪牧场。第一天的空气很干，旧水渠几乎没有声音。", "routine", 3);
      closeModal();
      updateHUD(true);
      saveGame(state);
      showToast("按住 WASD 或方向键走动。先去找技术棚里的林澈。", {
        strong: "第一天",
        duration: 4300,
      });
      break;
    case "sisterContinue":
      advanceSisterStory();
      break;
    case "crossCheckAi":
      crossCheckAiSummary();
      break;
    case "feedAnimal":
      handleFeedAnimal(value);
      break;
    case "buySeed": {
      const result = buySeed(state, value);
      if (result.ok) {
        audio.play("ui");
        saveGame(state);
        updateHUD(true);
        openShop(result.message);
      } else {
        audio.play("error");
        showToast(result.message);
      }
      break;
    }
    case "buyFeed": {
      const result = buyFeed(state);
      if (result.ok) {
        audio.play("ui");
        saveGame(state);
        updateHUD(true);
        openShop(result.message);
      } else {
        audio.play("error");
        showToast(result.message);
      }
      break;
    }
    case "shopTab":
      shopTab = value;
      openShop();
      break;
    case "shipProduce":
      doShipping();
      break;
    case "selectSeed":
      state.selectedSeed = value;
      state.selectedTool = "seed";
      closeModal();
      updateHUD(true);
      saveGame(state);
      showToast(`当前种子：${CROPS[value].name}。`, { strong: "种子袋" });
      break;
    case "recordElderClue":
      recordElderClue();
      break;
    case "waterChoice":
      chooseWater(value);
      break;
    case "developmentChoice":
      chooseDevelopment(value);
      break;
    case "governanceChoice":
      chooseGovernance(value);
      break;
    case "viewEnding":
      showEnding();
      break;
    case "continueFreeplay":
      closeModal();
      updateHUD(true);
      showToast("牧场继续运转。日常经营、作物和牲畜仍然属于这段生活。", {
        strong: "共同生活",
        duration: 4300,
      });
      break;
    case "sleepConfirm":
      closeModal();
      sleepAndAdvance(false);
      break;
    case "dismissDaySummary":
      dismissDaySummary();
      break;
    case "refillWater": {
      const result = refillWaterAtCanal(state);
      if (result.ok) {
        audio.play("water");
        saveGame(state);
        updateHUD(true);
        showToast(result.message);
        closeModal();
      } else {
        audio.play("error");
        showToast(result.message);
      }
      break;
    }
    case "regionSwitch":
      openRegionHub(value);
      break;
    case "cityProject": {
      const result = investInCity(state, value);
      if (result.ok) {
        audio.play("success");
        triggerEffect("city", state.player.x, state.player.y);
        refreshRegionPanel(result.message);
      } else {
        audio.play("error");
        showToast(result.message);
      }
      break;
    }
    case "townHall": {
      const result = holdTownHall(state);
      if (result.ok) {
        audio.play("memory");
        refreshRegionPanel(result.message);
      } else {
        audio.play("error");
        showToast(result.message);
      }
      break;
    }
    case "islandExplore": {
      const result = exploreIsland(state, value);
      if (result.ok) {
        audio.play("water");
        triggerEffect("island", state.player.x, state.player.y);
        refreshRegionPanel(result.message);
      } else {
        audio.play("error");
        showToast(result.message);
      }
      break;
    }
    case "marketSell": {
      const result = sellAtMarket(state, value, 1);
      if (result.ok) {
        audio.play("success");
        triggerEffect("trade", state.player.x, state.player.y);
        refreshRegionPanel(result.message);
      } else {
        audio.play("error");
        showToast(result.message);
      }
      break;
    }
    case "tradeAccept": {
      const result = acceptTradeContract(state, value);
      if (result.ok) refreshRegionPanel(result.message);
      else showToast(result.message);
      break;
    }
    case "tradeFulfill": {
      const result = fulfillTradeContract(state, value);
      if (result.ok) {
        audio.play("success");
        triggerEffect("trade", state.player.x, state.player.y);
        refreshRegionPanel(result.message);
      } else {
        audio.play("error");
        showToast(result.message);
      }
      break;
    }
    case "enactPolicy": {
      const result = enactGovernmentPolicy(state, value);
      if (result.ok) {
        audio.play("memory");
        triggerEffect("policy", state.player.x, state.player.y);
        refreshRegionPanel(result.message);
      } else {
        audio.play("error");
        showToast(result.message);
      }
      break;
    }
    case "spriteRecruit": {
      const result = recruitSprite(state, value);
      if (result.ok) {
        audio.play("success");
        triggerEffect("sprite", state.player.x, state.player.y);
        refreshRegionPanel(result.message);
      } else {
        audio.play("error");
        showToast(result.message);
      }
      break;
    }
    case "spriteAssign": {
      const [spriteId, role] = value.split("|");
      const result = assignSprite(state, spriteId, role);
      if (result.ok) {
        audio.play("ui");
        refreshRegionPanel(result.message);
      } else {
        audio.play("error");
        showToast(result.message);
      }
      break;
    }
    case "toggleSound":
      toggleSound(true);
      break;
    case "toggleBlur":
      showToast("当前网页版本已经使用完整画面细节。");
      break;
    case "resetGame":
      showResetConfirmation();
      break;
    case "confirmReset":
      resetAndRestart();
      break;
    case "restart":
      showResetConfirmation();
      break;
    default:
      break;
  }
}

function selectTool(toolId) {
  if (!TOOLS.some((tool) => tool.id === toolId)) return;
  state.selectedTool = toolId;
  audio.play("ui");
  updateHUD(true);
  saveGame(state);
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (modalOpen) {
    if (key === "escape" && modalClosable) closeModal();
    return;
  }
  if (!active) {
    if ((key === "enter" || key === " ") && !dom.welcome.classList.contains("is-hidden")) {
      event.preventDefault();
      if (!dom.continueButton.hidden) {
        startContinue();
      } else {
        startNewGame();
      }
    }
    return;
  }
  if (
    ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)
  ) {
    event.preventDefault();
    keys.add(key);
    return;
  }
  if (event.repeat) return;
  if (key === "e" || key === " " || key === "enter") {
    event.preventDefault();
    performAction();
  } else if (key === "h") {
    openAiPanel();
  } else if (key === "b") {
    openSeedPouch();
  } else if (key === "m") {
    openMenu();
  } else if (key === "f") {
    openRegionHub("farm");
  } else if (key === "c") {
    openRegionHub("city");
  } else if (key === "i") {
    openRegionHub("island");
  } else if (key === "t") {
    openRegionHub("trade");
  } else if (key === "g") {
    openRegionHub("government");
  } else if (key === "p") {
    openRegionHub("sprites");
  } else if (["1", "2", "3", "4"].includes(key)) {
    selectTool(TOOLS[Number(key) - 1].id);
  } else if (key === "escape") {
    openMenu();
  }
}

function handleKeyUp(event) {
  keys.delete(event.key.toLowerCase());
}

function bindEvents() {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", resizeViewport);
  window.addEventListener("orientationchange", () => window.setTimeout(resizeViewport, 80));
  window.addEventListener("blur", () => {
    keys.clear();
    touchDirections.clear();
  });

  dom.newGameButton.addEventListener("click", () => {
    audio.unlock();
    if (loadGame()) {
      openModal({
        kicker: "新的开始",
        title: "村口那封信还留在这里",
        body: `
          <p class="story-lead">
            本机已经有一份牧场存档。开始新生活会用新的第一天覆盖旧存档。
          </p>
          <div class="weather-note">牧心的记忆、作物与水渠调查都会重新开始。</div>
        `,
        footer: `
          <button type="button" class="button button--ghost" data-action="close">继续旧存档</button>
          <button type="button" class="button button--primary" data-action="confirmReset">覆盖并重新开始</button>
        `,
      });
    } else {
      startNewGame();
    }
  });

  dom.continueButton.addEventListener("click", () => {
    audio.unlock();
    startContinue();
  });

  window.addEventListener("beforeunload", () => {
    if (active) saveGame(state);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && active) saveGame(state);
  });

  dom.toolbelt.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tool]");
    if (button) selectTool(button.dataset.tool);
  });

  dom.seedPouchButton.addEventListener("click", openSeedPouch);
  dom.objectiveButton.addEventListener("click", openMenu);
  dom.menuButton.addEventListener("click", openMenu);
  dom.aiButton.addEventListener("click", openAiPanel);
  dom.regionNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-region]");
    if (button) openRegionHub(button.dataset.region);
  });
  dom.soundButton.addEventListener("click", () => {
    toggleSound(false);
  });
  dom.modalClose.addEventListener("click", () => closeModal());
  dom.modalCard.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-modal]")) closeModal();
    handleModalClick(event);
  });
  document.querySelector(".modal-backdrop").addEventListener("click", () => {
    if (modalClosable) closeModal();
  });

  for (const button of document.querySelectorAll("[data-move]")) {
    const direction = button.dataset.move;
    const press = (event) => {
      event.preventDefault();
      touchDirections.add(direction);
      button.classList.add("is-pressed");
      button.setPointerCapture?.(event.pointerId);
    };
    const release = (event) => {
      event.preventDefault();
      touchDirections.delete(direction);
      button.classList.remove("is-pressed");
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  }

  dom.touchAction.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    dom.touchAction.classList.add("is-pressed");
    performAction();
  });
  dom.touchAction.addEventListener("pointerup", () => dom.touchAction.classList.remove("is-pressed"));
  dom.touchAction.addEventListener("pointercancel", () =>
    dom.touchAction.classList.remove("is-pressed"),
  );
}

function startNewGame() {
  closeModal();
  beginPlay({ fresh: true });
}

function startContinue() {
  const loaded = loadGame();
  if (!loaded) {
    showToast("没有找到可继续的存档，先开始新的生活吧。");
    return;
  }
  closeModal();
  beginPlay({ loadedState: loaded });
}

function loop(timestamp) {
  const delta = lastTimestamp ? Math.min(0.05, (timestamp - lastTimestamp) / 1000) : 0.016;
  lastTimestamp = timestamp;
  update(delta);
  updateCamera(delta);
  renderer.render(state, runtime, delta);
  window.requestAnimationFrame(loop);
}

window.__RANCH_DEBUG__ = {
  getState: () => state,
  getRuntime: () => runtime,
  actions: {
    getTargetPlot: () => getTargetPlot(state),
    advanceDay: () => {
      const report = advanceDay(state);
      updateHUD(true);
      return report;
    },
    checkDailyTasks: () => checkDailyTasks(state),
    save: () => saveGame(state),
  },
  startNew: () => startNewGame(),
  openAi: () => openAiPanel(),
};

refreshWelcome();
bindEvents();
resizeViewport();
updateHUD(true);
window.requestAnimationFrame(loop);
