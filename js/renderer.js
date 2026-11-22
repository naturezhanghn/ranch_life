import {
  BRIDGE_QUEST,
  CROPS,
  FESTIVALS,
  INTERACTIONS,
  NPC_BONDS,
  SCENE_DEFS,
  SCENE_FINDS,
  SCENE_INTERACTIONS,
  SCENE_SEASON_VARIANTS,
  SPRITE_DEFS,
  WORKER_DEFS,
  scheduledNpcPositions,
  TOOLS,
  WORLD,
} from "./data.js";

const TAU = Math.PI * 2;

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function hash01(value) {
  let x = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  x -= Math.floor(x);
  return x;
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

// Residents follow short loops around the part of the ranch they are
// responsible for. Keeping these routes in the renderer makes their activity
// visible even while the daily simulation continues to run in state.js.
const FARM_EMPLOYEE_ROUTES = {
  planting: [
    { x: 326, y: 330 },
    { x: 492, y: 330 },
    { x: 694, y: 380 },
    { x: 686, y: 506 },
    { x: 432, y: 515 },
  ],
  watering: [
    { x: 322, y: 462 },
    { x: 452, y: 286 },
    { x: 658, y: 286 },
    { x: 728, y: 462 },
    { x: 560, y: 532 },
  ],
  animals: [
    { x: 824, y: 116 },
    { x: 1010, y: 96 },
    { x: 1150, y: 172 },
    { x: 1080, y: 292 },
    { x: 880, y: 286 },
  ],
  trade: [
    { x: 196, y: 644 },
    { x: 352, y: 644 },
    { x: 584, y: 586 },
    { x: 752, y: 360 },
    { x: 818, y: 344 },
  ],
  island: [
    { x: 714, y: 604 },
    { x: 830, y: 556 },
    { x: 902, y: 514 },
    { x: 820, y: 552 },
  ],
  fishing: [
    { x: 820, y: 658 },
    { x: 956, y: 682 },
    { x: 1118, y: 678 },
    { x: 1192, y: 628 },
    { x: 1030, y: 584 },
  ],
  fishery: [
    { x: 858, y: 548 },
    { x: 1008, y: 524 },
    { x: 1164, y: 548 },
    { x: 1178, y: 590 },
    { x: 948, y: 592 },
  ],
  hunting: [
    { x: 1088, y: 392 },
    { x: 1188, y: 414 },
    { x: 1178, y: 510 },
    { x: 1064, y: 548 },
    { x: 1002, y: 474 },
  ],
  rest: [
    { x: 670, y: 642 },
    { x: 730, y: 628 },
    { x: 784, y: 650 },
    { x: 730, y: 674 },
  ],
};

export class WorldRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    canvas.width = WORLD.width;
    canvas.height = WORLD.height;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.ctx.imageSmoothingEnabled = true;
    this.time = 0;
  }

  render(state, runtime = {}, delta = 0.016) {
    this.time += delta;
    const time = this.time;
    const ctx = this.ctx;
    const { player } = state;
    const workShift = this.isWorkShift(state);

    if (state.world?.scene && state.world.scene !== "farm") {
      this.renderScene(ctx, state, runtime, time, delta);
      return;
    }

    const farmSeasonVariant = SCENE_SEASON_VARIANTS.farm?.[state.season] || null;
    ctx.clearRect(0, 0, WORLD.width, WORLD.height);
    this.drawGround(ctx, state, time);
    this.drawPaths(ctx, time);
    this.drawCanal(ctx, state, time);
    this.drawRanchFence(ctx, time);
    this.drawSeasonalRoute(ctx, state, "farm", farmSeasonVariant, time);
    this.drawField(ctx, state, time, runtime);
    this.drawPasture(ctx, state, time);
    this.drawVillageBase(ctx, time);
    this.drawHouse(ctx, state, time);
    this.drawAiShed(ctx, state, time);
    this.drawHousingStructures(ctx, state, time);
    this.drawAutomationYard(ctx, state, time);
    this.drawAutomatedRanch(ctx, state, time);
    this.drawMarket(ctx, time);
    this.drawArchive(ctx, time);
    this.drawNoticeboard(ctx, time);
    this.drawShippingBin(ctx, time);
    this.drawFarmBuildingAccents(ctx, state, time);
    this.drawCanalGate(ctx, state, time);
    this.drawStaticProps(ctx, time);
    this.drawFarmSignature(ctx, state, time);
    this.drawSeasonalBlockers(ctx, state, farmSeasonVariant, time);
    this.drawScenePortals(ctx, SCENE_DEFS.farm, time);
    this.drawForageNode(ctx, state, time);
    this.drawSceneFinds(ctx, state, time);
    this.drawSeasonalLandmark(ctx, state, "farm", farmSeasonVariant, time);
    this.drawBridgeQuestMarker(ctx, state, "farm", time);
    this.drawFestivalMarkers(ctx, state, "farm", time);

    const drawables = [];
    const sisterY = 257;
    drawables.push({
      y: sisterY,
      draw: () => this.drawSister(ctx, 398, sisterY, time),
    });

    const workerY = 287;
    drawables.push({
      y: workerY,
      draw: () => this.drawWorker(ctx, 705, workerY, time),
    });

    if (workShift) {
      const assignedWorkers = new Set();
      for (const [role, workerId] of Object.entries(state.workers?.assignments || {})) {
        const worker = WORKER_DEFS[workerId];
        if (!worker || !FARM_EMPLOYEE_ROUTES[role] || assignedWorkers.has(workerId)) continue;
        assignedWorkers.add(workerId);
        const motion = this.getFarmEmployeeMotion(role, workerId, time);
        motion.working = true;
        drawables.push({
          y: motion.y,
          draw: () => this.drawFarmEmployee(ctx, motion.x, motion.y, worker, role, time, motion),
        });
      }
      const unassignedWorkers = (state.workers?.hired || [])
        .filter((workerId) => !assignedWorkers.has(workerId))
        .map((workerId) => WORKER_DEFS[workerId])
        .filter(Boolean);
      unassignedWorkers.forEach((worker, index) => {
        const defaultRole = ["planting", "watering", "animals"][index % 3];
        const motion = this.getFarmEmployeeMotion(defaultRole, worker.id, time, index);
        motion.working = true;
        drawables.push({
          y: motion.y,
          draw: () => this.drawFarmEmployee(ctx, motion.x, motion.y, worker, defaultRole, time, motion),
        });
      });

      const assignedSprites = new Set();
      for (const [role, spriteId] of Object.entries(state.sprites?.assignments || {})) {
        const sprite = SPRITE_DEFS[spriteId];
        if (!sprite || !FARM_EMPLOYEE_ROUTES[role] || assignedSprites.has(spriteId)) continue;
        assignedSprites.add(spriteId);
        const motion = this.getFarmSpriteMotion(role, spriteId, time);
        motion.working = true;
        drawables.push({
          y: motion.y - 8,
          draw: () => this.drawFarmSprite(ctx, motion.x, motion.y, sprite, role, time, motion),
        });
      }
    }

    if (this.shouldShowInvestor(state)) {
      drawables.push({
        y: 604,
        draw: () => this.drawInvestor(ctx, 684, 604, time),
      });
    }

    const elderY = 681;
    drawables.push({
      y: elderY,
      draw: () => this.drawElder(ctx, 280, elderY, time),
    });

    this.drawPastureAnimals(ctx, state, time, drawables);

    drawables.push({
      y: player.y,
      draw: () =>
        this.drawPlayer(ctx, player.x, player.y, player.facing, runtime, time, state),
    });

    drawables
      .sort((a, b) => a.y - b.y)
      .forEach((drawable) => {
        ctx.save();
        drawable.draw();
        ctx.restore();
      });

    this.drawFieldHighlight(ctx, state, runtime, time);
    this.drawInteractionHighlight(ctx, state, runtime, time);
    this.drawFeedbackLabel(ctx, state);
    this.drawForegroundFlora(ctx, time);
    this.drawFloatingAtmosphere(ctx, state, time);
    this.drawSeasonalAtmosphere(ctx, state, farmSeasonVariant, time);
    this.drawWeather(ctx, state, time);
    this.drawLighting(ctx, state, time);
    this.drawEffects(ctx, runtime, time, delta);
    this.drawDebugVignette(ctx);
  }

  isWorkShift(state) {
    const minutes = Number(state?.minutes);
    return Number.isFinite(minutes) && minutes >= 10 * 60 && minutes < 18 * 60;
  }

  renderScene(ctx, state, runtime, time, delta) {
    const sceneId = state.world.scene;
    const scene = SCENE_DEFS[sceneId] || SCENE_DEFS.city;
    const seasonVariant = SCENE_SEASON_VARIANTS[sceneId]?.[state.season] || null;
    const palette = seasonVariant?.palette || scene.palette;
    ctx.clearRect(0, 0, WORLD.width, WORLD.height);
    const gradient = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    gradient.addColorStop(0, palette[0]);
    gradient.addColorStop(1, palette[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    if (sceneId === "farmland") {
      this.drawFarmlandScene(ctx, state, runtime, time);
    } else if (sceneId === "wilderness") {
      this.drawWildernessScene(ctx, state, time);
      if (!this.isWorkShift(state)) this.drawOffShiftWildernessResidents(ctx, state, time);
    } else {
      this.drawSceneGround(ctx, sceneId, time);
      this.drawSeasonalRoute(ctx, state, sceneId, seasonVariant, time);
      this.drawSceneStructures(ctx, sceneId, time);
      this.drawSceneSignature(ctx, state, sceneId, time);
      if (sceneId === "workerDorm" && !this.isWorkShift(state)) {
        this.drawOffShiftResidents(ctx, state, time);
      }
    }
    this.drawSeasonalBlockers(ctx, state, seasonVariant, time);
    this.drawScenePortals(ctx, scene, time);
    this.drawSceneLandmarks(ctx, state, sceneId, time);
    this.drawSceneFinds(ctx, state, time);
    this.drawSeasonalLandmark(ctx, state, sceneId, seasonVariant, time);
    this.drawBridgeQuestMarker(ctx, state, sceneId, time);
    this.drawFestivalMarkers(ctx, state, sceneId, time);

    const drawables = [];
    if (sceneId === "farmland" && this.isWorkShift(state)) {
      this.addFarmlandWorkers(ctx, state, time, drawables);
    }
    const npcPositions = scheduledNpcPositions(state.minutes, sceneId);
    this.drawNpcInteractions(ctx, npcPositions, sceneId, time);
    for (const position of npcPositions) {
      drawables.push({
        y: position.y,
        draw: () => this.drawSceneNpc(ctx, position.npc, position, time),
      });
    }
    drawables.push({
      y: state.player.y,
      draw: () => this.drawPlayer(ctx, state.player.x, state.player.y, state.player.facing, runtime, time, state),
    });
    drawables.sort((a, b) => a.y - b.y).forEach((drawable) => {
      ctx.save();
      drawable.draw();
      ctx.restore();
    });

    this.drawSceneInteractionHighlight(ctx, state, runtime, time);
    this.drawFeedbackLabel(ctx, state);
    this.drawSceneAtmosphere(ctx, sceneId, time);
    this.drawSeasonalAtmosphere(ctx, state, seasonVariant, time);
    this.drawWeather(ctx, state, time);
    this.drawLighting(ctx, state, time);
    this.drawEffects(ctx, runtime, time, delta);
    this.drawDebugVignette(ctx);
  }

  drawFarmlandScene(ctx, state, runtime, time) {
    const scene = SCENE_DEFS.farmland || {};
    const configuredField = scene.field || WORLD.farmland || {};
    const field = {
      x: configuredField.x ?? 34,
      y: configuredField.y ?? 86,
      cols: configuredField.cols ?? 18,
      rows: configuredField.rows ?? 10,
      tile: configuredField.tile ?? 74,
      gap: configuredField.gap ?? 7,
    };
    /*
     * The fallback keeps old saves playable while the dedicated farmland
     * layout is being unlocked. New saves provide WORLD.farmland with the
     * larger 18 × 10 grid.
     */
    const fallbackField = {
      x: 34,
      y: 86,
      cols: 15,
      rows: 8,
      tile: 94,
      gap: 7,
    };
    if (!configuredField || !Object.keys(configuredField).length) Object.assign(field, fallbackField);
    const gap = field.gap;
    const plots = Array.isArray(state.farmlandPlots) && state.farmlandPlots.length
      ? state.farmlandPlots
      : (state.plots || []);
    const season = state.season || "春";
    const seasonTint = {
      春: ["#8db86b", "#6c9b5c", "#a7ca7b"],
      夏: ["#79ad5c", "#4f8a52", "#9fc568"],
      秋: ["#a9a766", "#8c8852", "#d2bd72"],
      冬: ["#a7bcac", "#718f7a", "#d7e0c6"],
    }[season] || ["#8db86b", "#6c9b5c", "#a7ca7b"];

    const sky = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    sky.addColorStop(0, seasonTint[0]);
    sky.addColorStop(0.42, seasonTint[1]);
    sky.addColorStop(1, "#3f6f4d");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    // A wide, readable entrance header makes this scene feel like a separate
    // farming district while keeping every screen tile available to work.
    ctx.save();
    ctx.fillStyle = "rgba(25, 61, 43, 0.32)";
    ctx.fillRect(0, 0, WORLD.width, 64);
    ctx.fillStyle = "rgba(255, 247, 214, 0.96)";
    ctx.font = "800 18px 'PingFang SC', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(scene.name || "左侧丰收牧场", 34, 29);
    ctx.fillStyle = "rgba(255, 247, 214, 0.72)";
    ctx.font = "600 10px 'PingFang SC', sans-serif";
    ctx.fillText("整片土地都可以开垦、播种、浇水与收获", 36, 47);
    ctx.textAlign = "right";
    ctx.fillText(`${season}季 · ${field.cols * field.rows} 格耕地`, WORLD.width - 34, 34);
    ctx.restore();

    // Water channels and raised borders give the large field a clear rhythm.
    ctx.save();
    ctx.strokeStyle = "rgba(183, 224, 208, 0.44)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(12, WORLD.height - 56);
    ctx.bezierCurveTo(320, WORLD.height - 90, 470, 70, 820, 108);
    ctx.bezierCurveTo(1110, 144, 1300, WORLD.height - 120, WORLD.width - 12, 92);
    ctx.stroke();
    ctx.strokeStyle = "rgba(226, 242, 214, 0.24)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const tileWidth = field.tile;
    const tileHeight = field.tile * 0.78;
    const plotAt = (index) => plots[index] || {
      index,
      state: "wild",
      crop: null,
      growth: 0,
      watered: false,
      wateredDays: 0,
      col: index % field.cols,
      row: Math.floor(index / field.cols),
    };
    const drawMiniCrop = (plot, x, y, width, height) => {
      if (!plot.crop) return;
      const crop = CROPS[plot.crop];
      if (!crop) return;
      const progress = Math.max(0, Math.min(1, Number(plot.growth || 0) / Math.max(1, crop.days)));
      const stem = Math.min(height * 0.42, 9 + progress * 20);
      const color = crop.isGrass ? "#9ec66d" : crop.id === "pumpkin" ? "#e0a84f" : "#8cc272";
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.2, width * 0.018);
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y + height - 9);
      ctx.lineTo(x + width / 2, y + height - stem);
      ctx.stroke();
      ctx.fillStyle = color;
      for (let leaf = 0; leaf < 3; leaf += 1) {
        const side = leaf % 2 ? -1 : 1;
        ctx.beginPath();
        ctx.ellipse(
          x + width / 2 + side * (5 + leaf * 2),
          y + height - stem + 7 + leaf * 3,
          5 + progress * 4,
          2.5 + progress * 2,
          side * 0.45,
          0,
          TAU,
        );
        ctx.fill();
      }
      if (progress >= 1) {
        ctx.fillStyle = crop.id === "pumpkin" || crop.id === "watermelon" ? "#efb85e" : "#f2d989";
        ctx.beginPath();
        ctx.arc(x + width / 2, y + 12, Math.max(3, width * 0.07), 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    };

    for (let row = 0; row < field.rows; row += 1) {
      for (let col = 0; col < field.cols; col += 1) {
        const index = row * field.cols + col;
        const plot = plotAt(index);
        const x = field.x + col * (tileWidth + gap);
        const y = field.y + row * (tileHeight + gap);
        const target = runtime.targetPlot?.index === plot.index;
        ctx.save();
        ctx.fillStyle = "rgba(31, 71, 47, 0.22)";
        roundedRect(ctx, x - 2, y + 5, tileWidth + 4, tileHeight + 7, 8);
        ctx.fill();
        roundedRect(ctx, x, y, tileWidth, tileHeight, 7);
        if (plot.state === "tilled" || plot.crop) {
          ctx.fillStyle = plot.watered ? "#755039" : "#8c6040";
          ctx.fill();
          ctx.strokeStyle = plot.watered ? "rgba(188, 224, 207, 0.62)" : "rgba(94, 54, 36, 0.32)";
          ctx.lineWidth = plot.watered ? 2 : 1.5;
          for (let furrow = 1; furrow < 4; furrow += 1) {
            ctx.beginPath();
            ctx.moveTo(x + 9, y + furrow * tileHeight / 4);
            ctx.lineTo(x + tileWidth - 9, y + furrow * tileHeight / 4 + Math.sin(index + furrow) * 2);
            ctx.stroke();
          }
          if (plot.watered) {
            ctx.fillStyle = "rgba(179, 226, 216, 0.42)";
            for (let drop = 0; drop < 4; drop += 1) {
              ctx.beginPath();
              ctx.arc(x + 16 + drop * (tileWidth - 30) / 3, y + 10 + (drop % 2) * (tileHeight - 20), 2.3, 0, TAU);
              ctx.fill();
            }
          }
          drawMiniCrop(plot, x, y, tileWidth, tileHeight);
        } else {
          ctx.fillStyle = `rgba(${seasonTint[2] === "#d7e0c6" ? "177, 193, 165" : "116, 155, 85"}, 0.76)`;
          ctx.fill();
          ctx.strokeStyle = "rgba(64, 109, 61, 0.28)";
          ctx.lineWidth = 1;
          for (let blade = 0; blade < 7; blade += 1) {
            const bx = x + 9 + hash01(index * 17 + blade) * (tileWidth - 18);
            const by = y + tileHeight - 8 - hash01(index * 31 + blade) * (tileHeight - 18);
            ctx.beginPath();
            ctx.moveTo(bx, by + 6);
            ctx.quadraticCurveTo(bx + Math.sin(time + blade) * 3, by, bx + 3, by - 7);
            ctx.stroke();
          }
        }
        if (target) {
          ctx.strokeStyle = "#ffe7a3";
          ctx.lineWidth = 3;
          ctx.setLineDash([7, 4]);
          roundedRect(ctx, x + 3, y + 3, tileWidth - 6, tileHeight - 6, 6);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
      }
    }

    const activity = state.workerActivityFarmland || state.workerActivity;
    if (activity?.day === state.day && this.isWorkShift(state)) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 236, 169, 0.86)";
      ctx.font = "700 9px 'PingFang SC', sans-serif";
      ctx.textAlign = "center";
      for (const entry of [
        ...(activity.harvesting || []).map((item) => ({ ...item, mark: "收" })),
        ...(activity.planting || []).map((item) => ({ ...item, mark: "种" })),
        ...(activity.watering || []).map((item) => ({ ...item, mark: "水" })),
      ]) {
        const row = Math.floor(entry.index / field.cols);
        const col = entry.index % field.cols;
        ctx.fillText(entry.mark, field.x + col * (tileWidth + gap) + tileWidth / 2, field.y + row * (tileHeight + gap) + 15);
      }
      ctx.restore();
    }

    // Animated irrigation wheels and scarecrows keep the enlarged farmland
    // active even when the player is the only resident on screen.
    ctx.save();
    for (let col = 2; col < field.cols; col += 4) {
      const x = field.x + col * (tileWidth + gap) - gap / 2;
      ctx.strokeStyle = "#b6d6b2";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, field.y - 11);
      ctx.lineTo(x, field.y + field.rows * (tileHeight + gap) - 10);
      ctx.stroke();
      ctx.fillStyle = "#f0d17c";
      ctx.beginPath();
      ctx.arc(x, field.y + 22 + Math.sin(time * 1.4 + col) * 3, 5, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#79563c";
    ctx.fillRect(WORLD.width - 72, 98, 5, 118);
    ctx.fillStyle = "#d7bc77";
    roundedRect(ctx, WORLD.width - 122, 82, 104, 34, 5);
    ctx.fill();
    ctx.fillStyle = "#5c4931";
    ctx.font = "800 11px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("丰收耕地", WORLD.width - 70, 103);
    ctx.restore();
  }

  addFarmlandWorkers(ctx, state, time, drawables) {
    const routes = [
      [{ x: 150, y: 188 }, { x: 440, y: 188 }, { x: 720, y: 188 }, { x: 980, y: 188 }, { x: 1290, y: 188 }],
      [{ x: 260, y: 348 }, { x: 560, y: 348 }, { x: 860, y: 348 }, { x: 1160, y: 348 }, { x: 1440, y: 348 }],
      [{ x: 140, y: 520 }, { x: 430, y: 520 }, { x: 740, y: 520 }, { x: 1040, y: 520 }, { x: 1360, y: 520 }],
      [{ x: 230, y: 700 }, { x: 520, y: 700 }, { x: 840, y: 700 }, { x: 1160, y: 700 }, { x: 1450, y: 700 }],
    ];
    const roleOrder = ["planting", "watering", "animals", "trade"];
    const assigned = new Set();
    const addResident = (character, kind, role, index) => {
      if (!character || assigned.has(character.id)) return;
      assigned.add(character.id);
      const route = routes[index % routes.length];
      const seed = [...String(character.id)].reduce(
        (sum, value, valueIndex) => sum + value.charCodeAt(0) * (valueIndex + 1),
        index * 17,
      );
      const progress = (time * (0.12 + (seed % 5) * 0.012) + index * 0.76) % route.length;
      const segment = Math.floor(progress);
      const phase = progress - segment;
      const from = route[segment];
      const to = route[(segment + 1) % route.length];
      const eased = phase * phase * (3 - 2 * phase);
      const motion = {
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        facing: to.x >= from.x ? 1 : -1,
        moving: phase < 0.88,
        working: true,
        seed,
        walkPhase: time * 7 + seed * 0.05,
        actionPhase: time * 1.3 + seed * 0.04,
      };
      drawables.push({
        y: motion.y,
        draw: () => {
          if (kind === "worker") {
            this.drawFarmEmployee(ctx, motion.x, motion.y, character, role, time, motion);
          } else {
            this.drawFarmSprite(ctx, motion.x, motion.y - 18, character, role, time, { ...motion, y: motion.y - 18 });
          }
        },
      });
    };
    for (const [role, workerId] of Object.entries(state.workers?.assignments || {})) {
      const worker = WORKER_DEFS[workerId];
      if (worker) addResident(worker, "worker", role, roleOrder.indexOf(role));
    }
    (state.workers?.hired || []).forEach((workerId, index) => {
      const worker = WORKER_DEFS[workerId];
      if (worker) addResident(worker, "worker", roleOrder[index % roleOrder.length], index + 4);
    });
    for (const [role, spriteId] of Object.entries(state.sprites?.assignments || {})) {
      const sprite = SPRITE_DEFS[spriteId];
      if (sprite) addResident(sprite, "sprite", role, roleOrder.indexOf(role) + 8);
    }
  }

  drawWildernessScene(ctx, state, time) {
    const gradient = ctx.createLinearGradient(0, 0, WORLD.width, WORLD.height);
    gradient.addColorStop(0, "#456d4d");
    gradient.addColorStop(0.48, "#315b45");
    gradient.addColorStop(1, "#203f38");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    ctx.save();
    ctx.globalAlpha = 0.2;
    for (let row = 0; row < 18; row += 1) {
      for (let col = 0; col < 32; col += 1) {
        const x = 20 + col * 51 + hash01(row * 19 + col) * 22;
        const y = 20 + row * 49 + hash01(row * 31 + col * 7) * 20;
        ctx.strokeStyle = row % 3 === 0 ? "#b8d18b" : "#85ad78";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 8);
        ctx.quadraticCurveTo(x - 4, y - 3, x - 8, y - 10);
        ctx.moveTo(x, y + 8);
        ctx.quadraticCurveTo(x + 3, y - 2, x + 9, y - 9);
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(220, 190, 123, 0.35)";
    ctx.lineWidth = 78;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(80, 650);
    ctx.bezierCurveTo(360, 610, 640, 520, 950, 470);
    ctx.bezierCurveTo(1120, 442, 1210, 443, 1295, 443);
    ctx.stroke();
    ctx.strokeStyle = "#d1ae73";
    ctx.lineWidth = 64;
    ctx.stroke();
    ctx.restore();
    const trees = [
      [130, 120, 1.15], [330, 220, 0.9], [690, 130, 1.2], [910, 220, 0.96],
      [1160, 130, 1.08], [1390, 170, 1.2], [1510, 430, 0.9], [1220, 690, 1.15],
      [780, 760, 1.1], [340, 820, 1.25], [70, 430, 0.9], [1480, 780, 1.3],
    ];
    for (const [x, y, scale] of trees) this.drawTree(ctx, x, y, scale, time);
    this.drawWildernessBerryTree(ctx, 520, 300, time, "北林野果");
    this.drawWildernessBerryTree(ctx, 1450, 300, time, "深林野果");
    const beasts = [
      { kind: "deer", x: 350, y: 420, scale: 1.08, speed: 0.22, seed: 0.4 },
      { kind: "boar", x: 760, y: 650, scale: 1.04, speed: 0.18, seed: 1.9 },
      { kind: "fox", x: 1160, y: 300, scale: 0.92, speed: 0.26, seed: 3.1 },
      { kind: "rabbit", x: 1370, y: 520, scale: 0.8, speed: 0.34, seed: 4.8 },
      { kind: "deer", x: 1460, y: 740, scale: 0.9, speed: 0.16, seed: 6.2 },
    ];
    for (const beast of beasts) {
      const driftX = Math.sin(time * beast.speed + beast.seed) * 24;
      const driftY = Math.cos(time * beast.speed * 0.7 + beast.seed) * 9;
      const facing = Math.cos(time * beast.speed + beast.seed) >= 0 ? 1 : -1;
      this.drawWildBeast(ctx, beast.x + driftX, beast.y + driftY, beast.kind, beast.scale, time, facing);
    }
    for (const [x, y] of [[980, 430], [1400, 620]]) {
      ctx.save();
      ctx.fillStyle = "rgba(218, 188, 118, 0.22)";
      ctx.beginPath();
      ctx.ellipse(x, y, 112, 68, -0.12, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(244, 226, 165, 0.78)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#f3dfaa";
      ctx.font = "700 14px 'PingFang SC', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("猎场 · 追踪足迹", x, y + 5);
      ctx.restore();
    }
    ctx.save();
    ctx.fillStyle = "#ead69b";
    ctx.font = "700 15px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("护栏入口 · 进入广阔野外", 1295, 415);
    ctx.fillText("野果林", 1450, 245);
    ctx.restore();
  }

  drawWildernessBerryTree(ctx, x, y, time, label) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(15, 31, 25, 0.32)";
    ctx.beginPath();
    ctx.ellipse(0, 45, 72, 17, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#6b4a31";
    ctx.fillRect(-8, -6, 16, 58);
    ctx.fillStyle = "#4d8b57";
    for (let leaf = 0; leaf < 8; leaf += 1) {
      ctx.beginPath();
      ctx.arc(-46 + (leaf % 4) * 30, -25 + Math.floor(leaf / 4) * 26, 32, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#c85056";
    for (let berry = 0; berry < 9; berry += 1) {
      ctx.beginPath();
      ctx.arc(-34 + (berry % 5) * 17, -23 + (berry % 3) * 18 + Math.sin(time * 1.5 + berry) * 2, 4, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#f2dda6";
    ctx.font = "700 12px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, 0, 72);
    ctx.restore();
  }

  drawWildBeast(ctx, x, y, kind, scale, time, facing) {
    ctx.save();
    ctx.translate(x, y + Math.sin(time * 2.2 + x * 0.01) * 1.5);
    ctx.scale(scale * facing, scale);
    this.drawShadow(ctx, 0, 8, kind === "rabbit" ? 12 : 22, 5);
    const step = Math.sin(time * 8 + x * 0.03) * 2.5;
    if (kind === "deer") {
      ctx.fillStyle = "#9b6949";
      ctx.beginPath();
      ctx.ellipse(0, -7, 22, 11, 0, 0, TAU);
      ctx.fill();
      ctx.fillRect(13, -31, 7, 24);
      ctx.beginPath();
      ctx.ellipse(21, -34, 9, 6, -0.12, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#704936";
      ctx.lineWidth = 3;
      for (const leg of [-13, -3, 8, 16]) {
        ctx.beginPath();
        ctx.moveTo(leg, 0);
        ctx.lineTo(leg + (leg % 2 ? -step : step), 13);
        ctx.stroke();
      }
      ctx.strokeStyle = "#d6b17a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, -38);
      ctx.lineTo(16, -51);
      ctx.moveTo(25, -38);
      ctx.lineTo(30, -50);
      ctx.stroke();
      ctx.fillStyle = "#f2d89b";
      ctx.beginPath();
      ctx.arc(24, -35, 1.4, 0, TAU);
      ctx.fill();
    } else if (kind === "boar") {
      ctx.fillStyle = "#6f4d3d";
      ctx.beginPath();
      ctx.ellipse(0, -5, 24, 13, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(23, -7, 11, 9, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#e1b788";
      ctx.beginPath();
      ctx.ellipse(31, -5, 5, 4, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#4f392f";
      ctx.lineWidth = 4;
      for (const leg of [-14, -3, 10, 17]) {
        ctx.beginPath();
        ctx.moveTo(leg, 3);
        ctx.lineTo(leg + (leg % 2 ? -step : step), 13);
        ctx.stroke();
      }
      ctx.fillStyle = "#261f1d";
      ctx.beginPath();
      ctx.arc(27, -9, 1.5, 0, TAU);
      ctx.fill();
    } else if (kind === "fox") {
      ctx.fillStyle = "#c36f3e";
      ctx.beginPath();
      ctx.ellipse(0, -7, 19, 10, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(13, -12);
      ctx.lineTo(31, -4);
      ctx.lineTo(15, 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f0c18b";
      ctx.beginPath();
      ctx.ellipse(27, -5, 7, 4, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#c36f3e";
      ctx.beginPath();
      ctx.moveTo(18, -14);
      ctx.lineTo(24, -28);
      ctx.lineTo(28, -13);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#7d4b35";
      ctx.lineWidth = 3;
      for (const leg of [-12, 2, 12]) {
        ctx.beginPath();
        ctx.moveTo(leg, 0);
        ctx.lineTo(leg + (leg % 2 ? -step : step), 11);
        ctx.stroke();
      }
      ctx.fillStyle = "#35241f";
      ctx.beginPath();
      ctx.arc(28, -7, 1.4, 0, TAU);
      ctx.fill();
    } else {
      ctx.fillStyle = "#c7b8a0";
      ctx.beginPath();
      ctx.ellipse(0, -7, 13, 10, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(12, -15, 8, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, -21);
      ctx.lineTo(8, -33);
      ctx.lineTo(13, -23);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#827666";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7, 1);
      ctx.lineTo(-10 - step, 10);
      ctx.moveTo(6, 1);
      ctx.lineTo(9 + step, 10);
      ctx.stroke();
      ctx.fillStyle = "#352b28";
      ctx.beginPath();
      ctx.arc(14, -16, 1.3, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawSceneGround(ctx, sceneId, time) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = sceneId === "island" ? "#e6f0c6" : "#e8d4a6";
    ctx.lineWidth = 2;
    if (sceneId === "city" || sceneId === "council" || sceneId === "metropolis") {
      for (let x = 0; x < WORLD.width; x += 46) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 26, WORLD.height);
        ctx.stroke();
      }
      for (let y = 26; y < WORLD.height; y += 46) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WORLD.width, y + 18);
        ctx.stroke();
      }
    } else if (sceneId === "port") {
      ctx.fillStyle = "rgba(215, 245, 227, 0.12)";
      ctx.fillRect(0, 430, WORLD.width, 290);
      for (let row = 0; row < 7; row += 1) {
        ctx.beginPath();
        ctx.moveTo(0, 456 + row * 38 + Math.sin(time * 0.4 + row) * 3);
        ctx.bezierCurveTo(250, 438 + row * 38, 510, 474 + row * 38, 760, 454 + row * 38);
        ctx.bezierCurveTo(980, 436 + row * 38, 1120, 478 + row * 38, WORLD.width, 454 + row * 38);
        ctx.stroke();
      }
    } else if (sceneId === "island" || sceneId === "workshop") {
      for (let index = 0; index < 36; index += 1) {
        const x = 25 + hash01(index * 9.7) * 1220;
        const y = 30 + hash01(index * 17.3) * 640;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 8, y - 4);
        ctx.lineTo(x + 15, y);
        ctx.stroke();
      }
    } else if (sceneId === "quarry") {
      for (let index = 0; index < 28; index += 1) {
        const x = 18 + hash01(index * 7.3) * 1240;
        const y = 60 + hash01(index * 13.1) * 600;
        ctx.fillStyle = index % 3 === 0 ? "rgba(235, 208, 142, 0.13)" : "rgba(39, 43, 40, 0.15)";
        ctx.beginPath();
        ctx.ellipse(x, y, 8 + (index % 4) * 4, 3 + (index % 2) * 3, index, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawSeasonalRoute(ctx, state, sceneId, variant, time) {
    const scene = SCENE_DEFS[sceneId];
    if (!variant?.landmark || !scene?.spawn) return;
    const from = scene.spawn;
    const to = variant.landmark;
    const midX = (from.x + to.x) / 2;
    const midY = Math.min(from.y, to.y) - 54;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 244, 197, 0.28)";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 12]);
    ctx.lineDashOffset = -time * 8;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(midX, midY, to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let step = 0.24; step < 1; step += 0.24) {
      const inverse = 1 - step;
      const x = inverse * inverse * from.x + 2 * inverse * step * midX + step * step * to.x;
      const y = inverse * inverse * from.y + 2 * inverse * step * midY + step * step * to.y;
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#fff3c4";
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawSeasonalBlockers(ctx, state, variant, time) {
    if (!variant?.blockers?.length) return;
    ctx.save();
    for (const blocker of variant.blockers) {
      const snow = state.season === "冬";
      ctx.fillStyle = snow ? "rgba(226, 238, 238, 0.88)" : "rgba(72, 87, 64, 0.75)";
      roundedRect(ctx, blocker.x, blocker.y, blocker.w, blocker.h, 14);
      ctx.fill();
      ctx.globalAlpha = snow ? 0.5 : 0.28;
      ctx.fillStyle = snow ? "#ffffff" : "#d8b873";
      for (let index = 0; index < 4; index += 1) {
        ctx.beginPath();
        ctx.arc(blocker.x + 16 + index * (blocker.w - 32) / 3, blocker.y + 10 + Math.sin(time + index) * 2, 5, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = snow ? "#eef7f5" : "#f3e4bb";
      ctx.font = "700 9px 'PingFang SC', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(blocker.label, blocker.x + blocker.w / 2, blocker.y + blocker.h / 2 + 3);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  drawSeasonalLandmark(ctx, state, sceneId, variant, time) {
    if (!variant?.landmark) return;
    const landmark = variant.landmark;
    const claimKey = `${state.season}:${sceneId}:${landmark.id}`;
    const claimed = (state.seasonRoutes?.claims?.[claimKey] || 0) === state.day;
    const pulse = 1 + Math.sin(time * 2 + landmark.x * 0.02) * 0.1;
    ctx.save();
    ctx.globalAlpha = claimed ? 0.28 : 0.65;
    ctx.strokeStyle = "#fff3bd";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(landmark.x, landmark.y, 24 * pulse, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = claimed ? 0.4 : 0.9;
    ctx.fillStyle = "#f7e6a6";
    ctx.beginPath();
    ctx.arc(landmark.x, landmark.y, 7, 0, TAU);
    ctx.fill();
    this.drawPlaceTag(
      ctx,
      landmark.x,
      landmark.y - 34,
      `${claimed ? "已走过" : "本季"} · ${variant.label}`,
      "rgba(255, 247, 216, 0.9)",
      "#5b5231",
    );
    ctx.restore();
  }

  drawBridgeQuestMarker(ctx, state, sceneId, time) {
    const sign = BRIDGE_QUEST.signs[sceneId];
    if (!sign) return;
    const quest = state.quests || {};
    const step = quest.activeId && !quest.expired && !quest.completed
      ? BRIDGE_QUEST.steps[quest.stepIndex]
      : null;
    const activeHere = step?.scene === sceneId;
    ctx.save();
    ctx.fillStyle = "rgba(83, 59, 36, 0.7)";
    ctx.fillRect(sign.x - 3, sign.y - 22, 6, 28);
    ctx.fillStyle = activeHere ? "#f0d27f" : "rgba(225, 208, 166, 0.8)";
    roundedRect(ctx, sign.x - 33, sign.y - 42, 66, 23, 5);
    ctx.fill();
    ctx.strokeStyle = activeHere ? "#fff1b6" : "rgba(112, 90, 53, 0.65)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#4f4a35";
    ctx.font = "700 9px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("桥", sign.x, sign.y - 30);
    if (activeHere) {
      const pulse = 1 + Math.sin(time * 2.4 + sign.x * 0.01) * 0.1;
      ctx.strokeStyle = "rgba(255, 235, 164, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(step.x, step.y, 26 * pulse, 0, TAU);
      ctx.stroke();
      this.drawPlaceTag(ctx, step.x, step.y - 44, step.label, "rgba(255, 247, 216, 0.94)", "#5b5231");
    }
    ctx.restore();
  }

  drawFestivalMarkers(ctx, state, sceneId, time) {
    const festival = Object.values(FESTIVALS).find((entry) => (
      entry.season === state.season && entry.day === state.seasonDay && entry.scene === sceneId
    ));
    if (!festival) return;
    ctx.save();
    for (const activity of festival.activities) {
      const completed = state.festival?.activityFlags?.[activity.id];
      ctx.globalAlpha = completed ? 0.38 : 0.86;
      ctx.fillStyle = completed ? "#b7c7b3" : "#d69b57";
      ctx.beginPath();
      ctx.moveTo(activity.x - 30, activity.y - 8);
      ctx.lineTo(activity.x, activity.y - 48);
      ctx.lineTo(activity.x + 30, activity.y - 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255, 240, 187, 0.78)";
      ctx.fillRect(activity.x - 25, activity.y - 8, 50, 6);
      ctx.fillStyle = completed ? "#647568" : "#fff2bd";
      ctx.globalAlpha = 0.82;
      ctx.beginPath();
      ctx.arc(activity.x, activity.y - 54 + Math.sin(time * 2 + activity.x) * 2, 5, 0, TAU);
      ctx.fill();
      this.drawPlaceTag(
        ctx,
        activity.x,
        activity.y - 70,
        completed ? `${festival.name} · 已完成` : activity.label,
        "rgba(255, 247, 216, 0.92)",
        "#6b4a2d",
      );
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  drawSeasonalAtmosphere(ctx, state, variant, time) {
    if (!variant) return;
    const palette = {
      春: ["#f1d7d5", "petal"],
      夏: ["#d8f0bd", "spark"],
      秋: ["#e8c27d", "leaf"],
      冬: ["#eef8f8", "snow"],
    }[state.season] || ["#f1d7d5", "petal"];
    ctx.save();
    ctx.fillStyle = palette[0];
    for (let index = 0; index < 22; index += 1) {
      const drift = time * (5 + index % 4);
      const x = ((index * 137 + drift) % (WORLD.width + 40)) - 20;
      const y = 80 + ((index * 83 + Math.sin(time * 0.5 + index) * 24 + drift * (0.3 + (index % 3) * 0.18)) % Math.max(260, WORLD.height - 180));
      ctx.globalAlpha = state.season === "冬" ? 0.4 : 0.28;
      if (palette[1] === "leaf") {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 0.6 + index);
        ctx.fillRect(-3, -1.2, 6, 2.4);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, state.season === "夏" ? 1.3 : 2, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawOffShiftResidents(ctx, state, time) {
    const workerSlots = [
      [160, 224], [244, 224], [328, 224], [412, 224],
      [186, 270], [270, 270], [354, 270], [438, 270],
    ];
    const spriteSlots = [
      [650, 224], [730, 224], [810, 224], [890, 224],
      [690, 270], [770, 270], [850, 270], [930, 270],
    ];
    const makeIdleMotion = (x, y, id, index, moving = false, facing = 1) => {
      const seed = [...String(id || index)].reduce((total, character, characterIndex) => (
        total + character.charCodeAt(0) * (characterIndex + 1)
      ), 0);
      return {
        x,
        y,
        facing,
        moving,
        working: false,
        seed,
        walkPhase: time * 1.4 + seed * 0.04,
        actionPhase: time * 1.1 + seed * 0.03,
      };
    };
    const residents = [
      ...(state.workers?.hired || []).map((id, index) => ({
        kind: "worker",
        character: WORKER_DEFS[id],
        slot: workerSlots[index % workerSlots.length],
      })),
      ...(state.sprites?.unlocked || []).map((id, index) => ({
        kind: "sprite",
        character: SPRITE_DEFS[id],
        slot: spriteSlots[index % spriteSlots.length],
      })),
    ].filter((entry) => entry.character && entry.slot);

    // The evening return is staged so residents pass through the shared door
    // one at a time. The game clock remains authoritative, while `time` only
    // supplies the walking bob and keeps each arrival visually alive.
    const eveningStart = 18 * 60;
    const entrySpacing = 4;
    const entryDuration = 3.5;
    const minutes = Number.isFinite(Number(state.minutes)) ? Number(state.minutes) : eveningStart;
    const arriving = minutes >= eveningStart && minutes < eveningStart + residents.length * entrySpacing + entryDuration;
    if (arriving) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 244, 186, 0.72)";
      ctx.beginPath();
      ctx.arc(550, 332, 18 + Math.sin(time * 3) * 2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 244, 186, 0.95)";
      ctx.font = "700 10px 'PingFang SC', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("回屋入口", 550, 365);
      ctx.restore();
    }

    residents.forEach(({ kind, character, slot }, index) => {
      const arrivalAt = eveningStart + index * entrySpacing;
      const elapsed = minutes - arrivalAt;
      if (minutes >= eveningStart && elapsed < 0) return;
      const progress = minutes < eveningStart ? 1 : Math.min(1, elapsed / entryDuration);
      const from = { x: 550, y: 348 };
      const eased = progress * progress * (3 - 2 * progress);
      const x = from.x + (slot[0] - from.x) * eased;
      const y = from.y + (slot[1] - from.y) * eased;
      const moving = progress < 1;
      const facing = slot[0] >= from.x ? 1 : -1;
      const motion = makeIdleMotion(x, y, character.id, index, moving, facing);
      if (kind === "worker") {
        this.drawFarmEmployee(ctx, x, y, character, "休息", time, motion);
      } else {
        this.drawFarmSprite(ctx, x, y, character, "休息", time, motion);
      }
    });
    ctx.save();
    ctx.fillStyle = "rgba(255, 239, 172, 0.75)";
    ctx.font = "700 11px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(arriving ? "18:00 后 · 住户按序回屋休息" : "住户已回屋 · 安静休息中", 550, 322);
    ctx.fillStyle = "rgba(255, 247, 218, 0.58)";
    ctx.font = "600 9px 'PingFang SC', sans-serif";
    ctx.fillText("员工房间", 305, 312);
    ctx.fillText("小精灵房间", 795, 312);
    ctx.restore();
  }

  drawOffShiftWildernessResidents(ctx, state, time) {
    const residents = [
      ...(state.workers?.hired || []).slice(0, 2).map((id) => ({ kind: "worker", character: WORKER_DEFS[id] })),
      ...(state.sprites?.unlocked || []).slice(0, 2).map((id) => ({ kind: "sprite", character: SPRITE_DEFS[id] })),
    ].filter((entry) => entry.character);
    const routes = [
      [{ x: 330, y: 448 }, { x: 430, y: 390 }, { x: 520, y: 438 }, { x: 438, y: 520 }],
      [{ x: 720, y: 540 }, { x: 820, y: 470 }, { x: 932, y: 512 }, { x: 850, y: 604 }],
      [{ x: 1050, y: 286 }, { x: 1140, y: 330 }, { x: 1080, y: 402 }, { x: 980, y: 354 }],
      [{ x: 1260, y: 620 }, { x: 1360, y: 564 }, { x: 1450, y: 628 }, { x: 1368, y: 694 }],
    ];
    residents.forEach(({ kind, character }, index) => {
      const route = routes[index % routes.length];
      const seed = [...String(character.id)].reduce((sum, value, valueIndex) => sum + value.charCodeAt(0) * (valueIndex + 1), 0);
      const progress = (time * (0.12 + (seed % 3) * 0.018) + index * 0.7) % route.length;
      const segment = Math.floor(progress);
      const phase = progress - segment;
      const from = route[segment];
      const to = route[(segment + 1) % route.length];
      const eased = phase * phase * (3 - 2 * phase);
      const motion = {
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        facing: to.x >= from.x ? 1 : -1,
        moving: phase < 0.82,
        working: false,
        seed,
        walkPhase: time * 7 + seed * 0.05,
        actionPhase: time * 1.2 + seed * 0.04,
      };
      if (kind === "worker") {
        this.drawFarmEmployee(ctx, motion.x, motion.y, character, "休息", time, motion);
      } else {
        this.drawFarmSprite(ctx, motion.x, motion.y - 19, character, "休息", time, { ...motion, y: motion.y - 19 });
      }
    });
    if (residents.length) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 247, 218, 0.72)";
      ctx.font = "700 10px 'PingFang SC', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("下班后 · 森林散步", 820, 690);
      ctx.restore();
    }
  }

  drawDetailedStructure(ctx, x, y, w, h, label, roof, time) {
    const isCivic = /议事|档案|建设|公告|安全|公共/.test(label);
    const isNature = /花园|温室|精灵|伙伴|潮声|月光|蜂蜜/.test(label);
    const isIndustrial = /仓库|矿|种子|出货|航线|渡轮/.test(label);
    const wall = isCivic ? "#d8d1bb" : isNature ? "#d8dfb8" : isIndustrial ? "#d7c49f" : "#e4d1aa";
    const trim = isCivic ? "#8d9b9b" : isNature ? "#8ca66f" : isIndustrial ? "#a77e4e" : "#b68a60";
    const shadow = "rgba(31, 49, 41, 0.24)";
    ctx.save();
    ctx.lineJoin = "round";
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 13, w * 0.54, 18, 0, 0, TAU);
    ctx.fill();

    const bodyGradient = ctx.createLinearGradient(x, y + 30, x, y + h);
    bodyGradient.addColorStop(0, wall);
    bodyGradient.addColorStop(1, isCivic ? "#c1c3af" : "#c7ad87");
    ctx.fillStyle = bodyGradient;
    roundedRect(ctx, x + 7, y + 30, w - 14, h - 30, 9);
    ctx.fill();
    ctx.fillStyle = "rgba(93, 72, 53, 0.18)";
    ctx.fillRect(x + 12, y + h - 13, w - 24, 8);
    ctx.fillStyle = trim;
    ctx.fillRect(x + 12, y + h - 17, w - 24, 4);

    const roofGradient = ctx.createLinearGradient(x, y - 8, x, y + 42);
    roofGradient.addColorStop(0, roof);
    roofGradient.addColorStop(1, "#5a5146");
    ctx.fillStyle = roofGradient;
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 38);
    ctx.lineTo(x + w * 0.16, y + 2);
    ctx.lineTo(x + w * 0.5, y - 17);
    ctx.lineTo(x + w * 0.84, y + 2);
    ctx.lineTo(x + w + 12, y + 38);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(57, 48, 39, 0.46)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 228, 166, 0.24)";
    ctx.lineWidth = 1.4;
    for (let tile = 0; tile < 7; tile += 1) {
      const t = (tile + 1) / 8;
      const roofX = x + w * (0.16 + t * 0.68);
      const roofY = y + 2 - Math.sin(Math.PI * t) * 19;
      ctx.beginPath();
      ctx.moveTo(roofX - 20, roofY + 24);
      ctx.lineTo(roofX, roofY + 2);
      ctx.lineTo(roofX + 20, roofY + 24);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255, 235, 174, 0.48)";
    ctx.fillRect(x + w / 2 - 25, y - 7, 50, 4);

    const windowY = y + 64;
    const windowWidth = Math.max(24, Math.min(42, w * 0.18));
    const windowHeight = 30;
    const windowXs = w > 210 ? [x + w * 0.21, x + w * 0.79] : [x + w * 0.26, x + w * 0.74];
    for (const windowX of windowXs) {
      ctx.fillStyle = "#674a36";
      roundedRect(ctx, windowX - windowWidth / 2 - 4, windowY - 4, windowWidth + 8, windowHeight + 8, 4);
      ctx.fill();
      const windowGlow = 0.68 + Math.sin(time * 0.7 + windowX) * 0.06;
      ctx.fillStyle = `rgba(249, 205, 112, ${windowGlow})`;
      roundedRect(ctx, windowX - windowWidth / 2, windowY, windowWidth, windowHeight, 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(108, 76, 49, 0.72)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(windowX, windowY);
      ctx.lineTo(windowX, windowY + windowHeight);
      ctx.moveTo(windowX - windowWidth / 2, windowY + windowHeight / 2);
      ctx.lineTo(windowX + windowWidth / 2, windowY + windowHeight / 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 242, 184, 0.24)";
      ctx.fillRect(windowX - windowWidth / 2 + 3, windowY + 3, windowWidth * 0.32, 4);
    }

    const doorWidth = Math.max(24, Math.min(40, w * 0.16));
    const doorX = x + w / 2 - doorWidth / 2;
    ctx.fillStyle = "#694936";
    roundedRect(ctx, doorX - 4, y + h - 67, doorWidth + 8, 67, 5);
    ctx.fill();
    ctx.fillStyle = "#8e6548";
    roundedRect(ctx, doorX, y + h - 63, doorWidth, 63, 3);
    ctx.fill();
    ctx.strokeStyle = "rgba(250, 213, 139, 0.42)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(doorX + doorWidth / 2, y + h - 60);
    ctx.lineTo(doorX + doorWidth / 2, y + h - 4);
    ctx.stroke();
    ctx.fillStyle = "#efc16c";
    ctx.beginPath();
    ctx.arc(doorX + doorWidth - 7, y + h - 32, 2.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = trim;
    ctx.fillRect(doorX - 10, y + h - 69, doorWidth + 20, 5);

    if (isNature || label.includes("休息")) {
      ctx.strokeStyle = "#73925c";
      ctx.lineWidth = 2;
      for (const side of [-1, 1]) {
        const planterX = x + w / 2 + side * Math.min(72, w * 0.32);
        ctx.fillStyle = "#a16d46";
        roundedRect(ctx, planterX - 14, y + h - 27, 28, 9, 3);
        ctx.fill();
        for (let leaf = 0; leaf < 3; leaf += 1) {
          ctx.beginPath();
          ctx.moveTo(planterX + (leaf - 1) * 7, y + h - 20);
          ctx.quadraticCurveTo(planterX + (leaf - 1) * 8 + side * 4, y + h - 34, planterX + (leaf - 1) * 7 + side * 7, y + h - 38);
          ctx.stroke();
        }
      }
    } else if (isIndustrial) {
      ctx.fillStyle = "#b88d55";
      ctx.fillRect(x + 16, y + h - 30, 20, 13);
      ctx.fillRect(x + w - 36, y + h - 30, 20, 13);
      ctx.fillStyle = "#6c4d35";
      ctx.fillRect(x + 18, y + h - 28, 16, 2);
      ctx.fillRect(x + w - 34, y + h - 28, 16, 2);
    }

    ctx.fillStyle = "rgba(255, 247, 218, 0.95)";
    ctx.font = "700 11px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h + 24);
    ctx.fillStyle = "rgba(46, 67, 55, 0.74)";
    ctx.font = "600 8px 'PingFang SC', sans-serif";
    ctx.fillText(isCivic ? "公共服务" : isNature ? "自然共居" : isIndustrial ? "生产与流通" : "日常生活", x + w / 2, y + h + 36);
    this.drawPlaceTag(ctx, x + w / 2, y - 15, label, "rgba(255, 247, 216, 0.92)", "#36594a");
    ctx.restore();
  }

  drawFarmBuildingAccents(ctx, state, time) {
    const night = state.minutes >= 18 * 60 || state.minutes < 7 * 60;
    const drawLantern = (x, y, color = "#e9bd63") => {
      ctx.save();
      ctx.strokeStyle = "#654a34";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x, y - 4);
      ctx.stroke();
      ctx.fillStyle = "#6b4a34";
      roundedRect(ctx, x - 6, y - 5, 12, 16, 3);
      ctx.fill();
      ctx.globalAlpha = night ? 0.86 : 0.42;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y + 3, 4, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.16 + Math.sin(time * 1.6 + x) * 0.04;
      ctx.fillStyle = "#ffe9a8";
      ctx.beginPath();
      ctx.arc(x, y + 3, 13, 0, TAU);
      ctx.fill();
      ctx.restore();
    };
    const drawPlanter = (x, y, hue = "#77a65d") => {
      ctx.save();
      ctx.fillStyle = "#a5724b";
      roundedRect(ctx, x - 16, y - 7, 32, 10, 3);
      ctx.fill();
      ctx.strokeStyle = hue;
      ctx.lineWidth = 2;
      for (let leaf = -1; leaf <= 1; leaf += 1) {
        ctx.beginPath();
        ctx.moveTo(x + leaf * 7, y - 6);
        ctx.quadraticCurveTo(x + leaf * 8 - 4, y - 20, x + leaf * 7 - 2, y - 25);
        ctx.stroke();
      }
      ctx.restore();
    };
    const drawCrate = (x, y, color = "#a77a4b") => {
      ctx.save();
      ctx.fillStyle = color;
      roundedRect(ctx, x - 12, y - 11, 24, 20, 3);
      ctx.fill();
      ctx.strokeStyle = "rgba(79, 54, 35, 0.58)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 8, y - 8, 16, 14);
      ctx.beginPath();
      ctx.moveTo(x - 7, y - 7);
      ctx.lineTo(x + 7, y + 5);
      ctx.moveTo(x + 7, y - 7);
      ctx.lineTo(x - 7, y + 5);
      ctx.stroke();
      ctx.restore();
    };

    const house = WORLD.house;
    drawLantern(house.x + 27, house.y + house.h - 34);
    drawLantern(house.x + house.w - 28, house.y + house.h - 34, "#edcf7a");
    drawPlanter(house.x + 80, house.y + house.h - 7, "#d27d6b");
    drawPlanter(house.x + house.w - 72, house.y + house.h - 7, "#78a865");

    const ai = WORLD.aiShed;
    drawLantern(ai.x + 18, ai.y + ai.h - 15, "#8bd4c2");
    drawLantern(ai.x + ai.w - 18, ai.y + ai.h - 15, "#8bd4c2");
    ctx.save();
    ctx.strokeStyle = "rgba(143, 220, 199, 0.58)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ai.x + 22, ai.y + ai.h + 2);
    ctx.quadraticCurveTo(ai.x + ai.w / 2, ai.y + ai.h + 18, ai.x + ai.w - 22, ai.y + ai.h + 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    const housing = WORLD.workerHousing;
    drawLantern(housing.x + 19, housing.y + housing.h - 14);
    drawLantern(housing.x + housing.w - 19, housing.y + housing.h - 14);
    drawPlanter(housing.x + 45, housing.y + housing.h - 4, "#d27d6b");
    drawPlanter(housing.x + housing.w - 45, housing.y + housing.h - 4, "#78a865");

    const market = WORLD.villageShop;
    drawCrate(market.x + 25, market.y + market.h - 6, "#c6924e");
    drawCrate(market.x + market.w - 26, market.y + market.h - 6, "#8cac63");
    drawLantern(market.x + market.w / 2, market.y + market.h - 8, "#f0c76d");
    const archive = WORLD.archive;
    drawPlanter(archive.x + 24, archive.y + archive.h - 4, "#86a66c");
    drawPlanter(archive.x + archive.w - 24, archive.y + archive.h - 4, "#c28a64");
    drawLantern(archive.x + archive.w / 2, archive.y + archive.h - 7, "#e7c477");

    const board = WORLD.noticeboard;
    drawLantern(board.x + board.w / 2, board.y + board.h + 13, "#efc66e");
    const bin = WORLD.shippingBin;
    drawCrate(bin.x + bin.w / 2, bin.y + bin.h + 12, "#a8784a");

    const pasture = WORLD.pasture;
    drawPlanter(pasture.x + 28, pasture.y + pasture.h - 25, "#9fc66f");
    drawPlanter(pasture.x + pasture.w - 30, pasture.y + pasture.h - 25, "#d3a269");
  }

  drawSceneStructures(ctx, sceneId, time) {
    const structures = {
      city: [
        [52, 66, 248, 146, "河港旅店", "#a8664c"],
        [348, 68, 234, 146, "城市建设处", "#766b5c"],
        [650, 72, 252, 145, "共同议事厅", "#6f7d83"],
        [974, 82, 220, 132, "精灵工坊", "#7b965f"],
        [48, 312, 218, 132, "旧织坊", "#a27b4c"],
        [978, 310, 226, 136, "城市花园", "#668e68"],
      ],
      port: [
        [52, 72, 240, 142, "港口仓库", "#916e49"],
        [360, 70, 272, 142, "贸易航线厅", "#86704f"],
        [714, 74, 266, 136, "蓝潮渡轮", "#4d7e86"],
        [1030, 72, 174, 138, "出货总站", "#846747"],
        [50, 340, 192, 136, "海员休息室", "#9c7353"],
      ],
      council: [
        [126, 86, 506, 235, "共同议事厅", "#667882"],
        [718, 86, 414, 235, "公共档案库", "#7b7263"],
        [84, 420, 250, 104, "水章公告栏", "#9c8251"],
        [970, 420, 218, 104, "市民休息处", "#5f846d"],
      ],
      workshop: [
        [90, 72, 288, 190, "小精灵工坊", "#759b63"],
        [508, 86, 270, 172, "种子仓", "#a08754"],
        [920, 92, 250, 166, "月光温室", "#668e75"],
        [160, 408, 198, 128, "蜂蜜花园", "#b28b4c"],
        [854, 400, 220, 130, "伙伴休息处", "#906a52"],
      ],
      metropolis: [
        [48, 72, 258, 194, "农机研发中心", "#577b91"],
        [350, 64, 264, 202, "金融交易所", "#806b56"],
        [658, 66, 268, 204, "大学种子实验室", "#657c9b"],
        [970, 60, 246, 210, "畜牧遗传学院", "#806568"],
        [50, 382, 280, 148, "国际贸易塔", "#667e79"],
        [392, 390, 276, 144, "城市金融服务台", "#8b7559"],
        [734, 388, 282, 144, "研究图书馆", "#647795"],
      ],
      island: [
        [74, 72, 250, 168, "潮声湾", "#6faba1"],
        [488, 86, 214, 156, "银沙滩", "#ccb878"],
        [892, 66, 300, 190, "月光礁", "#6d98a1"],
        [342, 428, 202, 122, "赤潮花园", "#ad6c68"],
      ],
      quarry: [
        [54, 72, 250, 154, "矿工小屋", "#75644e"],
        [438, 84, 386, 158, "旧矿道入口", "#4d4b43"],
        [926, 74, 238, 162, "废矿车棚", "#716053"],
        [190, 376, 208, 112, "碎石场", "#8a7659"],
        [834, 380, 246, 118, "安全站", "#6e7464"],
      ],
      workerDorm: [
        [100, 70, 410, 225, "员工休息室", "#a86c4f"],
        [590, 70, 410, 225, "小精灵房间", "#718e61"],
        [290, 405, 700, 180, "公共厨房与餐厅", "#8b7959"],
      ],
    }[sceneId] || [];
    for (const [x, y, w, h, label, roof] of structures) this.drawDetailedStructure(ctx, x, y, w, h, label, roof, time);
    if (sceneId === "house") {
      ctx.save();
      ctx.fillStyle = "rgba(255, 248, 223, 0.68)";
      ctx.fillRect(54, 52, WORLD.width - 108, WORLD.height - 92);
      ctx.strokeStyle = "rgba(116, 78, 52, 0.22)";
      ctx.lineWidth = 2;
      const roomRight = WORLD.width - 60;
      const roomBottom = WORLD.height - 50;
      for (let x = 70; x < roomRight; x += 42) {
        ctx.beginPath();
        ctx.moveTo(x, 58);
        ctx.lineTo(x, roomBottom);
        ctx.stroke();
      }
      for (let y = 74; y < roomBottom; y += 42) {
        ctx.beginPath();
        ctx.moveTo(60, y);
        ctx.lineTo(roomRight, y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(171, 125, 82, 0.25)";
      roundedRect(ctx, 380, 270, 520, 238, 20);
      ctx.fill();
      ctx.fillStyle = "#c88f5d";
      roundedRect(ctx, 92, 116, 260, 178, 12);
      ctx.fill();
      ctx.fillStyle = "#f1dca9";
      roundedRect(ctx, 108, 132, 228, 146, 9);
      ctx.fill();
      ctx.fillStyle = "#8d5f42";
      ctx.fillRect(124, 190, 110, 44);
      ctx.fillStyle = "#e9c67a";
      ctx.fillRect(250, 172, 46, 64);
      ctx.fillStyle = "#fff0b6";
      ctx.fillRect(256, 178, 34, 25);
      this.drawPlaceTag(ctx, 220, 104, "厨房", "rgba(255, 247, 216, 0.9)", "#5e4936");

      ctx.fillStyle = "#5b4a45";
      roundedRect(ctx, 542, 154, 198, 106, 10);
      ctx.fill();
      ctx.fillStyle = "#273d42";
      ctx.fillRect(560, 170, 162, 72);
      ctx.fillStyle = `rgba(137, 215, 194, ${0.55 + Math.sin(time * 1.4) * 0.12})`;
      ctx.fillRect(572, 182, 138, 48);
      ctx.fillStyle = "#d7ab6e";
      ctx.fillRect(620, 260, 42, 12);
      this.drawPlaceTag(ctx, 640, 142, "电视", "rgba(255, 247, 216, 0.9)", "#5e4936");

      ctx.fillStyle = "#9b684d";
      roundedRect(ctx, 954, 150, 178, 116, 14);
      ctx.fill();
      ctx.fillStyle = "#d3a067";
      ctx.fillRect(972, 168, 140, 70);
      ctx.fillStyle = "#4b4b4a";
      ctx.fillRect(1012, 248, 60, 12);
      ctx.fillStyle = "#9ad0a2";
      ctx.fillRect(1016, 186, 24, 20);
      ctx.fillStyle = "#e3b46e";
      ctx.fillRect(1050, 186, 24, 20);
      this.drawPlaceTag(ctx, 1040, 138, "掌机角", "rgba(255, 247, 216, 0.9)", "#5e4936");

      ctx.fillStyle = "#806247";
      roundedRect(ctx, 934, 424, 236, 132, 14);
      ctx.fill();
      ctx.fillStyle = "#e5c89e";
      roundedRect(ctx, 950, 440, 204, 100, 10);
      ctx.fill();
      ctx.fillStyle = "#72513e";
      ctx.fillRect(978, 460, 150, 14);
      ctx.fillRect(978, 506, 150, 14);
      this.drawPlaceTag(ctx, 1052, 412, "卧室", "rgba(255, 247, 216, 0.9)", "#5e4936");

      ctx.fillStyle = "rgba(120, 84, 59, 0.32)";
      ctx.fillRect(544, 574, 192, 18);
      ctx.fillStyle = "#e5bd70";
      ctx.beginPath();
      ctx.arc(640, 582, 46, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#6d543e";
      ctx.fillRect(635, 610, 10, 34);
      this.drawPlaceTag(ctx, 640, 548, "餐桌", "rgba(255, 247, 216, 0.9)", "#5e4936");
      ctx.restore();
    }
    if (sceneId === "island") {
      for (let index = 0; index < 18; index += 1) {
        this.drawTree(ctx, 30 + hash01(index * 8.7) * 1200, 300 + hash01(index * 11.1) * 330, 0.45 + hash01(index * 4.3) * 0.3, time);
      }
    }
    if (sceneId === "workshop") {
      ctx.save();
      ctx.strokeStyle = "rgba(232, 252, 184, 0.45)";
      ctx.lineWidth = 2;
      for (let index = 0; index < 5; index += 1) {
        ctx.beginPath();
        ctx.arc(650, 350, 28 + index * 16 + Math.sin(time + index) * 2, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawScenePortals(ctx, scene, time) {
    for (const portal of scene.portals || []) {
      const pulse = 1 + Math.sin(time * 2.6 + portal.x * 0.01) * 0.08;
      ctx.save();
      ctx.strokeStyle = "rgba(255, 238, 175, 0.85)";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.ellipse(portal.x, portal.y, 28 * pulse, 11 * pulse, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      this.drawPlaceTag(ctx, portal.x, portal.y - 24, portal.label, "rgba(255, 247, 216, 0.9)", "#6b552e");
      ctx.restore();
    }
  }

  drawSceneLandmarks(ctx, state, sceneId, time) {
    for (const interaction of SCENE_INTERACTIONS[sceneId] || []) {
      if (
        interaction.forageNode
        && !(state.forage?.nodes || []).some((node) => (
          node.interactionId === interaction.id
            && node.scene === sceneId
            && !node.claimed
            && node.expiresDay === state.day
            && state.minutes <= node.expiresMinute
        ))
      ) continue;
      ctx.save();
      const color = sceneId === "island" ? "#d2f0d4" : "#e7cd8d";
      ctx.globalAlpha = 0.78;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(interaction.x, interaction.y, 13 + Math.sin(time * 1.5 + interaction.x) * 2, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = "#365b4d";
      ctx.font = "700 10px 'PingFang SC', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(interaction.label.replace("进入", "").replace("查看", ""), interaction.x, interaction.y + 4);
      ctx.restore();
    }
  }

  drawSceneNpc(ctx, npc, position, time) {
    const visual = npc.visual || {};
    const moving = position.moving !== false;
    const facing = position.facing || 1;
    const bob = Math.sin(time * (moving ? 2.4 : 1.4) + position.x * 0.01) * (moving ? 1.5 : 0.7);
    const step = moving ? Math.sin(time * 8 + position.x * 0.02) * 2.5 : 0;
    this.drawShadow(ctx, position.x, position.y + 4, moving ? 20 : 19, 8);
    ctx.save();
    ctx.translate(position.x, position.y + bob);
    ctx.fillStyle = "#403b36";
    ctx.fillRect(-10 + step, -8, 7, 10);
    ctx.fillRect(3 - step, -8, 7, 10);
    ctx.fillStyle = "#52463b";
    ctx.fillRect(-12 + step, 1, 10, 3);
    ctx.fillRect(2 - step, 1, 10, 3);
    ctx.fillStyle = visual.body || "#6d806f";
    roundedRect(ctx, -14, -38, 28, 31, 5);
    ctx.fill();
    ctx.fillStyle = visual.trim || "#d9c27c";
    ctx.fillRect(-14, -35, 28, 4);
    ctx.fillRect(-3, -31, 6, 22);
    ctx.fillStyle = visual.skin || "#d9a47f";
    ctx.beginPath();
    ctx.arc(0, -49, 11, 0, TAU);
    ctx.fill();
    ctx.fillStyle = visual.hair || "#403934";
    if (visual.hairStyle === "bun") {
      ctx.beginPath();
      ctx.arc(0, -55, 12, Math.PI, 0);
      ctx.arc(-11, -50, 5, 0, TAU);
      ctx.fill();
    } else if (visual.hairStyle === "beard") {
      ctx.beginPath();
      ctx.arc(0, -55, 12, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#8b7663";
      ctx.beginPath();
      ctx.arc(0, -43, 6, 0, TAU);
      ctx.fill();
    } else if (visual.hairStyle === "short") {
      ctx.beginPath();
      ctx.arc(0, -55, 12, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-12, -56, 5, 8);
    } else if (visual.hairStyle === "hat") {
      ctx.beginPath();
      ctx.arc(0, -55, 12, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = visual.trim || "#d9c27c";
      ctx.fillRect(-15, -58, 30, 5);
      ctx.fillStyle = "#9b4c48";
      ctx.fillRect(-11, -53, 22, 4);
    } else if (visual.hairStyle === "leaf") {
      ctx.beginPath();
      ctx.arc(0, -55, 12, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = visual.trim || "#d9c27c";
      ctx.beginPath();
      ctx.ellipse(-7, -66, 3, 7, -0.4, 0, TAU);
      ctx.ellipse(5, -67, 3, 7, 0.4, 0, TAU);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, -55, 12, Math.PI, 0);
      ctx.fill();
      if (visual.hairStyle === "swept") {
        ctx.beginPath();
        ctx.moveTo(-10, -55);
        ctx.quadraticCurveTo(0, -64, 11, -57);
        ctx.lineTo(7, -49);
        ctx.closePath();
        ctx.fill();
      } else if (visual.hairStyle === "bob") {
        ctx.fillRect(-12, -53, 5, 13);
        ctx.fillRect(7, -53, 5, 13);
      }
    }
    ctx.fillStyle = "#2f2b2a";
    ctx.beginPath();
    ctx.arc(facing * 3, -50, 1.4, 0, TAU);
    ctx.arc(facing * 8, -50, 1.4, 0, TAU);
    ctx.fill();
    if (visual.face === "glasses") {
      ctx.strokeStyle = "#43525a";
      ctx.lineWidth = 1;
      ctx.strokeRect(facing * 1, -54, 6, 4);
      ctx.strokeRect(facing * 7, -54, 6, 4);
      ctx.beginPath();
      ctx.moveTo(facing * 6, -52);
      ctx.lineTo(facing * 7, -52);
      ctx.stroke();
    } else {
      ctx.strokeStyle = visual.face === "stern" ? "#754f42" : "#a85f56";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(facing * 6, -46, visual.face === "smile" || visual.face === "bright" ? 2.6 : 1.8, 0.15, Math.PI - 0.15);
      ctx.stroke();
    }
    this.drawNpcAccessory(ctx, visual.accessory, facing, time, moving);
    ctx.fillStyle = "rgba(255, 248, 221, 0.96)";
    ctx.font = "700 8px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(npc.name, 0, -70);
    ctx.fillStyle = "rgba(232, 220, 181, 0.8)";
    ctx.font = "600 7px 'PingFang SC', sans-serif";
    ctx.fillText(npc.role, 0, -61);
    ctx.restore();
  }

  drawNpcInteractions(ctx, positions, sceneId, time) {
    if (!positions?.length) return;
    const visible = new Map(positions.map((position) => [position.npc.id, position]));
    NPC_BONDS.filter((bond) => bond.scene === sceneId).forEach((bond, index) => {
      const first = visible.get(bond.a);
      const second = visible.get(bond.b);
      if (!first || !second) return;
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      if (distance > 210) return;
      const x = (first.x + second.x) / 2;
      const y = Math.min(first.y, second.y) - 48;
      const pulse = 0.78 + Math.sin(time * 2 + index) * 0.08;
      ctx.save();
      ctx.globalAlpha = 0.24;
      ctx.strokeStyle = "#f4d487";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(first.x, first.y - 23);
      ctx.lineTo(second.x, second.y - 23);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "rgba(255, 247, 214, 0.94)";
      roundedRect(ctx, x - 72, y - 11, 144, 22, 8);
      ctx.fill();
      ctx.fillStyle = "#5a624b";
      ctx.font = "700 8px 'PingFang SC', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${bond.label} · ${bond.line}`, x, y + 2);
      ctx.restore();
    });
  }

  drawNpcAccessory(ctx, accessory, facing, time, moving) {
    if (accessory === "clipboard") {
      ctx.fillStyle = "#c69b58";
      ctx.fillRect(facing * 16 - 7, -25, 12, 16);
      ctx.fillStyle = "#f2e5ba";
      ctx.fillRect(facing * 16 - 4, -22, 7, 9);
    } else if (accessory === "satchel") {
      ctx.fillStyle = "#7c563c";
      roundedRect(ctx, facing * 17 - 7, -25, 14, 16, 3);
      ctx.fill();
      ctx.strokeStyle = "#e0be77";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(facing * 17, -25, 7, Math.PI, TAU);
      ctx.stroke();
    } else if (accessory === "staff") {
      ctx.strokeStyle = "#6d5139";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(facing * 16, -13);
      ctx.lineTo(facing * 22, -50);
      ctx.stroke();
      ctx.fillStyle = "#dce998";
      ctx.beginPath();
      ctx.arc(facing * 22, -52 + Math.sin(time * 2) * 2, 4, 0, TAU);
      ctx.fill();
    } else if (accessory === "basket") {
      ctx.fillStyle = "#b67b45";
      roundedRect(ctx, facing * 17 - 9, -17, 18, 11, 3);
      ctx.fill();
      ctx.strokeStyle = "#e8c477";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(facing * 17, -18, 9, Math.PI, TAU);
      ctx.stroke();
    } else if (accessory === "book") {
      ctx.fillStyle = "#9e6d61";
      ctx.fillRect(facing * 16 - 8, -24, 16, 12);
      ctx.strokeStyle = "#f0d898";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(facing * 16, -23);
      ctx.lineTo(facing * 16, -13);
      ctx.stroke();
    } else if (accessory === "ladle") {
      ctx.strokeStyle = "#d8d1b1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(facing * 15, -15);
      ctx.lineTo(facing * 24, -40 + Math.sin(time * 2 + (moving ? 1 : 0)) * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(facing * 24, -43, 4, 0, TAU);
      ctx.stroke();
    } else if (accessory === "shell") {
      ctx.fillStyle = "#f0d18b";
      ctx.beginPath();
      ctx.arc(facing * 14, -19, 5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#c3e5d2";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-7, -31);
      ctx.quadraticCurveTo(0, -24, 7, -31);
      ctx.stroke();
    } else if (accessory === "lantern") {
      ctx.fillStyle = "#6a4a35";
      roundedRect(ctx, facing * 17 - 6, -27, 12, 16, 3);
      ctx.fill();
      ctx.fillStyle = "#f3cf76";
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(facing * 17, -19, 4, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (accessory === "⚓") {
      ctx.strokeStyle = "#e7c77b";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(facing * 17, -22, 5, 0, TAU);
      ctx.moveTo(facing * 17, -27);
      ctx.lineTo(facing * 17, -14);
      ctx.moveTo(facing * 12, -18);
      ctx.lineTo(facing * 17, -14);
      ctx.lineTo(facing * 22, -18);
      ctx.stroke();
    }
  }

  drawSceneAtmosphere(ctx, sceneId, time) {
    ctx.save();
    const count = sceneId === "island" ? 26 : 16;
    for (let index = 0; index < count; index += 1) {
      const x = ((index * 91 + time * (4 + index % 4)) % 1320) - 20;
      const y = 70 + ((index * 67 + Math.sin(time * 0.4 + index) * 18) % 560);
      ctx.globalAlpha = sceneId === "island" ? 0.2 : 0.1;
      ctx.fillStyle = sceneId === "island" ? "#e6f3bd" : "#f4dfa7";
      ctx.beginPath();
      ctx.arc(x, y, 1.8 + (index % 2), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawFarmSignature(ctx, state, time) {
    ctx.save();
    // The pond catches a different rhythm from the canal, with fish rings
    // and reeds moving gently even when the player is standing still.
    const pond = WORLD.pond || { x: 1035, y: 620, rx: 170, ry: 70 };
    ctx.strokeStyle = "rgba(214, 239, 211, 0.34)";
    ctx.lineWidth = 1.5;
    for (let ring = 0; ring < 4; ring += 1) {
      const phase = (time * 0.22 + ring * 0.26) % 1;
      ctx.globalAlpha = (1 - phase) * 0.45;
      ctx.beginPath();
      ctx.ellipse(pond.x - 52 + ring * 31, pond.y + 3 + (ring % 2) * 18, 5 + phase * 27, 2 + phase * 9, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.46;
    ctx.strokeStyle = "#b1c987";
    ctx.lineWidth = 2;
    for (let blade = 0; blade < 12; blade += 1) {
      const x = pond.x - 130 + blade * 24;
      const y = pond.y + 48 + (blade % 3) * 7;
      ctx.beginPath();
      ctx.moveTo(x, y + 20);
      ctx.quadraticCurveTo(x - 3 + Math.sin(time * 1.2 + blade) * 4, y - 3, x + 3, y - 16);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "#f3dfac";
    for (let gust = 0; gust < 7; gust += 1) {
      const x = 350 + ((time * 26 + gust * 153) % 680);
      const y = 410 + (gust % 4) * 42;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 18, y - 4, x + 38, y + 1);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawSceneSignature(ctx, state, sceneId, time) {
    if (sceneId === "city") this.drawCitySignature(ctx, time);
    if (sceneId === "port") this.drawPortSignature(ctx, time);
    if (sceneId === "council") this.drawCouncilSignature(ctx, time);
    if (sceneId === "workshop") this.drawWorkshopSignature(ctx, time);
    if (sceneId === "island") this.drawIslandSignature(ctx, time);
    if (sceneId === "quarry") this.drawQuarrySignature(ctx, time);
    if (sceneId === "metropolis") this.drawMetropolisSignature(ctx, time);
  }

  drawMetropolisSignature(ctx, time) {
    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.strokeStyle = "#c6e1d4";
    ctx.lineWidth = 2;
    for (let lane = 0; lane < 7; lane += 1) {
      const y = 302 + lane * 34;
      const offset = (time * (16 + lane * 3)) % 150;
      ctx.beginPath();
      ctx.moveTo(-30 + offset, y);
      ctx.lineTo(110 + offset, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#f0c777";
    for (let tower = 0; tower < 9; tower += 1) {
      const x = 56 + tower * 142;
      const y = 740 + Math.sin(time * 0.7 + tower) * 3;
      ctx.beginPath();
      ctx.arc(x, y, 4 + (tower % 3), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawCitySignature(ctx, time) {
    ctx.save();
    // Animated street reflections and a slow ribbon of leaves make the city
    // feel inhabited without adding extra collision objects.
    ctx.globalAlpha = 0.18;
    for (let lane = 0; lane < 5; lane += 1) {
      const offset = (time * (22 + lane * 3)) % 180;
      ctx.strokeStyle = lane % 2 ? "#f2d28d" : "#9cc6b3";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(48 + offset, 286 + lane * 44);
      ctx.lineTo(150 + offset, 286 + lane * 44);
      ctx.stroke();
    }
    for (let leaf = 0; leaf < 11; leaf += 1) {
      const x = ((leaf * 131 + time * 18) % 1240) - 20;
      const y = 250 + (leaf * 37) % 330 + Math.sin(time * 0.8 + leaf) * 8;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time * 0.7 + leaf);
      ctx.fillStyle = leaf % 2 ? "#d8b56e" : "#99b47b";
      ctx.fillRect(-4, -1, 8, 2);
      ctx.restore();
    }
    ctx.restore();
  }

  drawPortSignature(ctx, time) {
    ctx.save();
    ctx.globalAlpha = 0.27;
    ctx.strokeStyle = "#b8e1d0";
    ctx.lineWidth = 2;
    for (let row = 0; row < 8; row += 1) {
      const y = 456 + row * 34;
      const drift = Math.sin(time * 0.7 + row) * 9;
      ctx.beginPath();
      ctx.moveTo(-20, y + drift);
      ctx.bezierCurveTo(240, y - 11 + drift, 480, y + 14, 760, y + drift);
      ctx.bezierCurveTo(980, y - 14, 1120, y + 12, 1320, y - 2 + drift);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.72;
    for (let gull = 0; gull < 4; gull += 1) {
      const x = ((time * 30 + gull * 300) % 1380) - 40;
      const y = 180 + gull * 28 + Math.sin(time * 1.4 + gull) * 10;
      ctx.strokeStyle = "#f4e5ba";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 8, Math.PI + 0.25, TAU - 0.25);
      ctx.arc(x + 13, y, 8, Math.PI + 0.25, TAU - 0.25);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCouncilSignature(ctx, time) {
    ctx.save();
    const centerX = 876;
    const centerY = 202;
    const rotation = time * 0.18;
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#f2d79b";
    ctx.lineWidth = 2;
    for (let ring = 0; ring < 3; ring += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, 42 + ring * 14, 0, TAU);
      ctx.stroke();
    }
    for (let ray = 0; ray < 8; ray += 1) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(32, 0);
      ctx.lineTo(76, 0);
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.17;
    ctx.fillStyle = "#fff0bd";
    for (let mote = 0; mote < 13; mote += 1) {
      const x = 110 + ((mote * 163 + time * 9) % 1040);
      const y = 360 + Math.sin(time * 0.6 + mote) * 42 + (mote % 4) * 50;
      ctx.beginPath();
      ctx.arc(x, y, 1.5 + mote % 2, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawWorkshopSignature(ctx, time) {
    ctx.save();
    const centerX = 650;
    const centerY = 352;
    for (let orbit = 0; orbit < 3; orbit += 1) {
      const angle = time * (0.55 + orbit * 0.12) + orbit * 2.1;
      const radius = 38 + orbit * 17;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius * 0.56;
      ctx.globalAlpha = 0.42 - orbit * 0.08;
      ctx.fillStyle = orbit === 1 ? "#f5d987" : "#b9e5bc";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, 3 + orbit, 0, TAU);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "#f4d994";
    ctx.lineWidth = 2;
    for (let spark = 0; spark < 6; spark += 1) {
      const x = 480 + spark * 83;
      const y = 300 + Math.sin(time * 1.5 + spark) * 18;
      ctx.beginPath();
      ctx.moveTo(x, y - 4);
      ctx.lineTo(x, y + 4);
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x + 4, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawIslandSignature(ctx, time) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = "#d9edc0";
    ctx.lineWidth = 1.5;
    const pools = [[372, 342], [760, 342], [1100, 350], [590, 590]];
    pools.forEach(([x, y], index) => {
      const pulse = (time * 0.34 + index * 0.22) % 1;
      ctx.beginPath();
      ctx.ellipse(x, y + 4, 18 + pulse * 42, 7 + pulse * 13, 0, 0, TAU);
      ctx.stroke();
    });
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = "#e6e4a0";
    for (let firefly = 0; firefly < 12; firefly += 1) {
      const x = 90 + ((firefly * 157 + time * 11) % 1120);
      const y = 280 + (firefly * 41) % 330 + Math.sin(time * 1.1 + firefly) * 14;
      ctx.globalAlpha = 0.15 + Math.max(0, Math.sin(time * 2 + firefly)) * 0.55;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawQuarrySignature(ctx, time) {
    ctx.save();
    const lanternX = 300;
    const lanternY = 560;
    const glow = ctx.createRadialGradient(lanternX, lanternY - 26, 2, lanternX, lanternY - 26, 110);
    glow.addColorStop(0, "rgba(244, 201, 108, 0.22)");
    glow.addColorStop(1, "rgba(244, 201, 108, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(lanternX - 120, lanternY - 140, 240, 240);
    ctx.fillStyle = "#e9c77b";
    for (let dust = 0; dust < 18; dust += 1) {
      const x = 110 + ((dust * 181 + time * 8) % 1040);
      const y = 260 + (dust * 47) % 330 + Math.sin(time * 0.7 + dust) * 8;
      ctx.globalAlpha = 0.1 + (dust % 3) * 0.04;
      ctx.beginPath();
      ctx.arc(x, y, 1 + dust % 2, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = "#cba46a";
    ctx.lineWidth = 2;
    for (let pebble = 0; pebble < 5; pebble += 1) {
      const x = 500 + ((time * 28 + pebble * 150) % 620);
      const y = 288 + Math.abs(Math.sin(time * 1.3 + pebble)) * 160;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 5, y + 7);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawSceneInteractionHighlight(ctx, state, runtime, time) {
    this.drawInteractionHighlight(ctx, state, runtime, time);
  }

  drawFeedbackLabel(ctx, state) {
    const event = state.feedback?.lastEvent;
    if (!event || Date.now() > (event.expiresAt || 0)) return;
    const remaining = Math.max(0, (event.expiresAt - Date.now()) / 1000);
    const alpha = Math.min(1, remaining / 0.5);
    const colors = {
      success: ["rgba(214, 238, 190, 0.94)", "#2f5c46", "#d8f0b8"],
      warning: ["rgba(248, 224, 173, 0.95)", "#6b4d28", "#c9903d"],
      info: ["rgba(218, 235, 224, 0.94)", "#365e52", "#8eb9a4"],
    }[event.severity] || ["rgba(218, 235, 224, 0.94)", "#365e52", "#8eb9a4"];
    const message = event.message.length > 30 ? `${event.message.slice(0, 30)}…` : event.message;
    const x = Math.max(150, Math.min(WORLD.width - 150, state.player.x));
    const y = Math.max(100, state.player.y - 74);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "700 11px 'PingFang SC', sans-serif";
    const width = Math.max(180, Math.min(340, ctx.measureText(message).width + 28));
    ctx.fillStyle = colors[0];
    roundedRect(ctx, x - width / 2, y - 24, width, 38, 11);
    ctx.fill();
    ctx.strokeStyle = colors[2];
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = colors[1];
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, x, y - 10);
    ctx.font = "700 7px 'PingFang SC', sans-serif";
    ctx.globalAlpha = alpha * 0.68;
    ctx.fillText(event.eventId, x, y + 4);
    ctx.restore();
  }

  drawSceneFinds(ctx, state, time) {
    const sceneId = state.world?.scene || "farm";
    for (const find of SCENE_FINDS[sceneId] || []) {
      if (state.world.sceneFinds?.[sceneId]?.[find.id]) continue;
      const pulse = 0.75 + Math.sin(time * 1.8 + find.x * 0.02) * 0.12;
      ctx.save();
      ctx.globalAlpha = 0.24;
      ctx.fillStyle = "#f2ddb0";
      ctx.beginPath();
      ctx.arc(find.x, find.y + 8, 18 * pulse, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.58;
      ctx.strokeStyle = "#f3e0b1";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(find.x, find.y - 7);
      ctx.lineTo(find.x + 7, find.y);
      ctx.lineTo(find.x, find.y + 7);
      ctx.lineTo(find.x - 7, find.y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  drawForageNode(ctx, state, time) {
    const node = (state.forage?.nodes || []).find((entry) => (
      entry.scene === "farm"
        && !entry.claimed
        && entry.expiresDay === state.day
        && state.minutes <= entry.expiresMinute
    ));
    if (!node) return;
    const pulse = 1 + Math.sin(time * 2.5) * 0.12;
    ctx.save();
    ctx.fillStyle = "#e4d38b";
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 15 * pulse, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#5f8d5d";
    ctx.font = "700 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("❋", node.x, node.y + 6);
    this.drawPlaceTag(ctx, node.x, node.y - 26, node.weatherDay ? "雨后足迹" : "季节山货", "rgba(255, 247, 216, 0.9)", "#5d6136");
    ctx.restore();
  }

  drawGround(ctx, state, time) {
    const variant = SCENE_SEASON_VARIANTS.farm?.[state.season];
    const palette = variant?.palette || ["#89a96b", "#88a762", "#75985a"];
    const gradient = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    gradient.addColorStop(0, palette[0]);
    gradient.addColorStop(0.55, palette[0]);
    gradient.addColorStop(1, palette[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    // The ranch fence encloses the settled core. The eastern and southern
    // bands use a deeper woodland palette to make the outer hunting grounds
    // read as a separate, much larger region.
    const fence = WORLD.ranchFence || { right: 1250, bottom: 754 };
    ctx.fillStyle = "rgba(42, 76, 48, 0.16)";
    ctx.fillRect(fence.right, 0, WORLD.width - fence.right, WORLD.height);
    ctx.fillRect(0, fence.bottom, WORLD.width, WORLD.height - fence.bottom);
    ctx.fillStyle = "rgba(197, 169, 103, 0.12)";
    ctx.fillRect(fence.right, fence.rightGate?.top || 428, WORLD.width - fence.right, 9);
    ctx.fillRect(fence.bottomGate?.left || 620, fence.bottom, (fence.bottomGate?.right || 704) - (fence.bottomGate?.left || 620), WORLD.height - fence.bottom);

    ctx.save();
    ctx.globalAlpha = state.weather === "drought" ? 0.27 : 0.18;
    for (let row = 0; row < Math.ceil(WORLD.height / 58) + 1; row += 1) {
      for (let col = 0; col < Math.ceil(WORLD.width / 58) + 1; col += 1) {
        const x = 14 + col * 58;
        const y = 12 + row * 58;
        const n = hash01(row * 37 + col * 91);
        if (n > 0.56) {
          ctx.strokeStyle = n > 0.8 ? "#6c8e52" : "#9db77a";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + n * 18, y + n * 12);
          ctx.quadraticCurveTo(
            x + n * 18 + Math.sin(time * 1.4 + n * 8) * 2,
            y + n * 12 - 7,
            x + n * 18 + 2,
            y + n * 12 - 12,
          );
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    const light = ctx.createRadialGradient(840, 120, 20, 840, 120, 520);
    light.addColorStop(0, "rgba(255, 235, 167, 0.15)");
    light.addColorStop(1, "rgba(255, 235, 167, 0)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    ctx.save();
    for (let index = 0; index < 9; index += 1) {
      const x = ((index * 211 + time * (3 + index * 0.4)) % 1440) - 80;
      const y = 110 + (index % 4) * 135;
      ctx.globalAlpha = 0.025 + (index % 3) * 0.012;
      ctx.fillStyle = "#183c34";
      ctx.beginPath();
      ctx.ellipse(x, y, 140 + index * 4, 42 + (index % 3) * 12, -0.08, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawPaths(ctx, time) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = "rgba(124, 100, 59, 0.18)";
    ctx.lineWidth = 88;
    ctx.beginPath();
    ctx.moveTo(218, 220);
    ctx.bezierCurveTo(235, 286, 250, 368, 250, 472);
    ctx.bezierCurveTo(250, 548, 252, 600, 245, 674);
    ctx.stroke();

    ctx.strokeStyle = "#d9bd83";
    ctx.lineWidth = 80;
    ctx.beginPath();
    ctx.moveTo(218, 220);
    ctx.bezierCurveTo(235, 286, 250, 368, 250, 472);
    ctx.bezierCurveTo(250, 548, 252, 600, 245, 674);
    ctx.stroke();

    ctx.strokeStyle = "#d4b579";
    ctx.lineWidth = 64;
    ctx.beginPath();
    ctx.moveTo(252, 444);
    ctx.bezierCurveTo(390, 430, 532, 470, 671, 472);
    ctx.bezierCurveTo(760, 475, 811, 505, 882, 544);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 238, 190, 0.34)";
    ctx.lineWidth = 4;
    ctx.setLineDash([3, 18]);
    ctx.beginPath();
    ctx.moveTo(227, 244);
    ctx.bezierCurveTo(237, 338, 257, 438, 252, 536);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "#cfaf74";
    ctx.lineWidth = 46;
    ctx.beginPath();
    ctx.moveTo(580, 490);
    ctx.bezierCurveTo(630, 535, 641, 566, 665, 654);
    ctx.stroke();

    // The enlarged ranch keeps a visible route into the new eastern and
    // southern acreage so the camera reveals destinations as the player walks.
    ctx.strokeStyle = "#cfaf74";
    ctx.lineWidth = 42;
    ctx.beginPath();
    ctx.moveTo(842, 525);
    ctx.bezierCurveTo(1010, 560, 1190, 606, 1415, 690);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1040, 575);
    ctx.bezierCurveTo(1145, 500, 1260, 430, 1450, 360);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    for (let index = 0; index < 58; index += 1) {
      const n = hash01(index * 7.31);
      const y = 240 + n * 430;
      const x = 218 + Math.sin(n * 12) * 18 + n * 13;
      ctx.globalAlpha = 0.16;
      ellipse(ctx, x, y, 1.3 + (index % 3) * 0.35, 0.8, "#6f583a");
    }
    ctx.restore();
  }

  drawRanchFence(ctx, time) {
    const fence = WORLD.ranchFence || {};
    const left = fence.left ?? 42;
    const top = fence.top ?? 24;
    const right = fence.right ?? 1250;
    const bottom = fence.bottom ?? 754;
    const rightGateTop = fence.rightGate?.top ?? 408;
    const rightGateBottom = fence.rightGate?.bottom ?? 478;
    const bottomGateLeft = fence.bottomGate?.left ?? 620;
    const bottomGateRight = fence.bottomGate?.right ?? 704;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(66, 55, 38, 0.28)";
    ctx.lineWidth = 9;
    const drawRail = (x1, y1, x2, y2) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };
    drawRail(left, top, right, top);
    drawRail(left, bottom, bottomGateLeft, bottom);
    drawRail(bottomGateRight, bottom, right, bottom);
    drawRail(left, top, left, bottom);
    drawRail(right, top, right, rightGateTop);
    drawRail(right, rightGateBottom, right, bottom);
    ctx.strokeStyle = "#a47b4e";
    ctx.lineWidth = 4;
    drawRail(left, top - 2, right, top - 2);
    drawRail(left, bottom - 2, bottomGateLeft, bottom - 2);
    drawRail(bottomGateRight, bottom - 2, right, bottom - 2);
    drawRail(left - 1, top, left - 1, bottom);
    drawRail(right - 1, top, right - 1, rightGateTop);
    drawRail(right - 1, rightGateBottom, right - 1, bottom);
    ctx.fillStyle = "#705238";
    const posts = [];
    for (let x = left; x <= right; x += 52) posts.push([x, top]);
    for (let x = left; x <= right; x += 52) posts.push([x, bottom]);
    for (let y = top + 42; y < bottom; y += 52) {
      posts.push([left, y]);
      if (y < rightGateTop || y > rightGateBottom) posts.push([right, y]);
    }
    for (const [x, y] of posts) {
      ctx.fillRect(x - 4, y - 9, 8, 22);
      ctx.fillStyle = "#c29a62";
      ctx.fillRect(x - 2, y - 8, 4, 18);
      ctx.fillStyle = "#705238";
    }
    ctx.fillStyle = "rgba(255, 238, 181, 0.92)";
    ctx.font = "700 13px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("月溪牧场", 642, top + 19);
    ctx.fillStyle = "#d7b977";
    ctx.fillRect(right - 4, rightGateTop, 8, rightGateBottom - rightGateTop);
    ctx.fillRect(bottomGateLeft, bottom - 4, bottomGateRight - bottomGateLeft, 8);
    ctx.fillStyle = "#5d4932";
    ctx.font = "700 11px 'PingFang SC', sans-serif";
    ctx.fillText("野外入口", right - 58, rightGateTop - 12);
    ctx.fillText("南林道", (bottomGateLeft + bottomGateRight) / 2, bottom - 14);
    ctx.globalAlpha = 0.28 + Math.sin(time * 1.8) * 0.06;
    ctx.strokeStyle = "#f3d98f";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 8]);
    drawRail(right + 18, rightGateTop + 35, right + 80, rightGateTop + 35);
    drawRail(bottomGateLeft + 42, bottom + 18, bottomGateLeft + 42, bottom + 62);
    ctx.setLineDash([]);
    ctx.restore();
  }

  drawVillageBase(ctx, time) {
    ctx.save();
    ctx.fillStyle = "rgba(237, 218, 173, 0.2)";
    ctx.beginPath();
    ctx.ellipse(275, 615, 240, 92, 0.02, 0, TAU);
    ctx.fill();

    const houses = [
      { x: 42, y: 535, w: 122, h: 85, roof: "#8d5b3d" },
      { x: 455, y: 516, w: 122, h: 92, roof: "#79604d" },
    ];
    for (const house of houses) {
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = "rgba(50, 69, 49, 0.16)";
      ctx.beginPath();
      ctx.ellipse(house.x + house.w / 2, house.y + house.h + 5, house.w / 2, 15, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#e2cfa3";
      ctx.fillRect(house.x + 12, house.y + 26, house.w - 20, house.h - 26);
      ctx.fillStyle = "rgba(105, 75, 50, 0.22)";
      for (let x = house.x + 20; x < house.x + house.w - 8; x += 18) {
        ctx.fillRect(x, house.y + 30, 2, house.h - 32);
      }
      ctx.fillStyle = house.roof;
      ctx.beginPath();
      ctx.moveTo(house.x, house.y + 37);
      ctx.lineTo(house.x + house.w / 2, house.y - 2);
      ctx.lineTo(house.x + house.w, house.y + 37);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#72523a";
      ctx.fillRect(house.x + house.w / 2 - 9, house.y + 58, 18, 34);
      ctx.fillStyle = "#f0c16c";
      ctx.fillRect(house.x + 24, house.y + 52, 17, 15);
      ctx.fillRect(house.x + house.w - 43, house.y + 52, 17, 15);
      ctx.strokeStyle = "rgba(255, 224, 166, 0.3)";
      ctx.lineWidth = 1.5;
      for (let tile = 0; tile < 5; tile += 1) {
        ctx.beginPath();
        ctx.moveTo(house.x + 15 + tile * 22, house.y + 30);
        ctx.lineTo(house.x + house.w / 2, house.y + 4);
        ctx.stroke();
      }
      ctx.fillStyle = "#6a4b34";
      ctx.fillRect(house.x + house.w / 2 - 14, house.y + 54, 28, 4);
      ctx.fillStyle = "#e7bb65";
      ctx.beginPath();
      ctx.arc(house.x + house.w / 2 + 8, house.y + 72, 2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#9d6d45";
      roundedRect(ctx, house.x + 9, house.y + house.h - 11, 25, 8, 2);
      ctx.fill();
      roundedRect(ctx, house.x + house.w - 34, house.y + house.h - 11, 25, 8, 2);
      ctx.fill();
      ctx.strokeStyle = house.roof === "#8d5b3d" ? "#79a35f" : "#b6a568";
      ctx.lineWidth = 1.5;
      for (const planterX of [house.x + 17, house.x + house.w - 22]) {
        ctx.beginPath();
        ctx.moveTo(planterX, house.y + house.h - 4);
        ctx.quadraticCurveTo(planterX - 4, house.y + house.h - 18, planterX - 2, house.y + house.h - 23);
        ctx.moveTo(planterX + 8, house.y + house.h - 4);
        ctx.quadraticCurveTo(planterX + 11, house.y + house.h - 17, planterX + 9, house.y + house.h - 22);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.18 + Math.sin(time * 0.8 + house.x) * 0.04;
      ctx.fillStyle = "#f6e5be";
      ctx.beginPath();
      ctx.arc(house.x + house.w - 24, house.y - 10, 7, 0, TAU);
      ctx.arc(house.x + house.w - 19, house.y - 21, 5, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "#765d39";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(280, 618, 56, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  drawHouse(ctx, state, time) {
    const { x, y, w, h } = WORLD.house;
    ctx.save();
    ctx.fillStyle = "rgba(41, 61, 43, 0.2)";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.56, y + h + 12, w * 0.58, 25, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#d9c598";
    ctx.fillRect(x + 16, y + 63, w - 28, h - 63);
    ctx.fillStyle = "#b88b63";
    roundedRect(ctx, x + 26, y + 88, w - 50, h - 89, 4);
    ctx.fill();
    ctx.fillStyle = "#d5c294";
    roundedRect(ctx, x + 32, y + 93, w - 61, h - 94, 3);
    ctx.fill();

    ctx.strokeStyle = "rgba(109, 67, 44, 0.36)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 61, y + 96);
    ctx.lineTo(x + 61, y + h);
    ctx.moveTo(x + w - 63, y + 96);
    ctx.lineTo(x + w - 63, y + h);
    ctx.stroke();

    ctx.fillStyle = "#8f4f32";
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 72);
    ctx.lineTo(x + 32, y + 6);
    ctx.lineTo(x + w - 26, y + 6);
    ctx.lineTo(x + w + 20, y + 72);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#a8613a";
    ctx.beginPath();
    ctx.moveTo(x - 2, y + 66);
    ctx.lineTo(x + 38, y + 12);
    ctx.lineTo(x + w - 32, y + 12);
    ctx.lineTo(x + w + 12, y + 66);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(92, 49, 34, 0.5)";
    ctx.lineWidth = 2;
    for (let line = 0; line < 4; line += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 4 + line * 2, y + 50 + line * 5);
      ctx.lineTo(x + w - 3, y + 50 + line * 5);
      ctx.stroke();
    }

    ctx.fillStyle = "#6c4a34";
    ctx.fillRect(x + 34, y - 2, 28, 44);
    ctx.fillStyle = "#493a31";
    ctx.fillRect(x + 29, y - 8, 38, 10);
    ctx.save();
    ctx.globalAlpha = 0.13 + Math.sin(time * 0.55) * 0.025;
    ctx.fillStyle = "#f5e4b7";
    ctx.beginPath();
    ctx.arc(x + 47, y - 18, 23, 0, TAU);
    ctx.fill();
    ctx.restore();

    const night = state.minutes >= 18.5 * 60 || state.minutes < 7 * 60;
    this.drawWindow(ctx, x + 70, y + 110, 49, 43, night ? "#f5c66e" : "#8ba7a0", time);
    this.drawWindow(ctx, x + 190, y + 108, 28, 41, night ? "#edbc62" : "#91a99f", time);

    ctx.fillStyle = "#5b3c2b";
    ctx.beginPath();
    ctx.arc(x + 157, y + 166, 26, Math.PI, 0);
    ctx.lineTo(x + 183, y + h + 1);
    ctx.lineTo(x + 131, y + h + 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#8a6244";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#e5bc61";
    ctx.beginPath();
    ctx.arc(x + 174, y + 170, 3, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#705238";
    ctx.fillRect(x + 53, y + 164, 50, 8);
    for (let index = 0; index < 7; index += 1) {
      const fx = x + 58 + index * 7;
      const fy = y + 159 + Math.sin(index * 1.7) * 3;
      ctx.fillStyle = index % 2 === 0 ? "#d17b61" : "#f0d8a1";
      ctx.beginPath();
      ctx.arc(fx, fy, 3, 0, TAU);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255, 248, 223, 0.16)";
    ctx.fillRect(x + 20, y + 8, w - 50, 3);
    ctx.restore();

    this.drawPlaceTag(ctx, x + w - 55, y - 22, "家", "#f6e5b8", "#224c40");
  }

  drawHousingStructures(ctx, state, time) {
    const housing = WORLD.housing || {};
    if (WORLD.workerHousing) {
      const building = WORLD.workerHousing;
      const occupancy = (state.workers?.hired?.length || 0) + (state.sprites?.unlocked?.length || 0);
      const capacity = state.housing?.capacity || 8;
      this.drawHousingBuilding(ctx, building, {
        label: state.housing?.name || "员工与精灵宿舍",
        sublabel: "居民与伙伴共居",
        roof: "#8b6d59",
        wall: "#e2cda3",
        accent: "#e8c476",
        icon: "⌂✦",
        occupancy,
        capacity,
        level: state.housing?.level || 0,
        time,
      });
      return;
    }
    const workerHouse = housing.worker || { x: 536, y: 72, w: 164, h: 112 };
    const spriteHouse = housing.sprite || { x: 536, y: 192, w: 164, h: 92 };
    const workerState = state.housing?.worker || state.housing?.workers || {};
    const spriteState = state.housing?.sprite || state.housing?.sprites || {};
    this.drawHousingBuilding(ctx, workerHouse, {
      label: "员工宿舍",
      sublabel: "居民员工",
      roof: "#a86c4f",
      wall: "#e3c79b",
      accent: "#e7bc6a",
      icon: "⌂",
      occupancy: state.workers?.hired?.length || 0,
      capacity: workerState.capacity || 4,
      level: workerState.level || 0,
      time,
    });
    this.drawHousingBuilding(ctx, spriteHouse, {
      label: "精灵小屋",
      sublabel: "伙伴共居",
      roof: "#718e61",
      wall: "#d4e0ae",
      accent: "#f0d47d",
      icon: "✦",
      occupancy: state.sprites?.unlocked?.length || 0,
      capacity: spriteState.capacity || 4,
      level: spriteState.level || 0,
      time: time + 1.8,
    });
  }

  drawHousingBuilding(ctx, building, options) {
    const {
      label,
      sublabel,
      roof,
      wall,
      accent,
      icon,
      occupancy,
      capacity,
      level,
      time,
    } = options;
    const { x, y, w, h } = building;
    const safeCapacity = Math.max(1, Number(capacity) || 1);
    const safeOccupancy = Math.max(0, Number(occupancy) || 0);
    ctx.save();
    ctx.fillStyle = "rgba(39, 57, 43, 0.22)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 8, w * 0.54, 13, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = wall;
    roundedRect(ctx, x + 7, y + 27, w - 14, h - 27, 7);
    ctx.fill();
    ctx.fillStyle = "rgba(116, 79, 53, 0.18)";
    for (let line = 0; line < 3; line += 1) {
      ctx.fillRect(x + 15, y + 44 + line * 18, w - 30, 2);
    }
    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 34);
    ctx.lineTo(x + w / 2, y - 10);
    ctx.lineTo(x + w + 6, y + 34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(67, 55, 42, 0.35)";
    ctx.lineWidth = 2;
    for (let tile = 0; tile < 4; tile += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 12 + tile * 8, y + 30);
      ctx.lineTo(x + w / 2 + tile * 8, y - 2);
      ctx.stroke();
      ctx.moveTo(x + w - 12 - tile * 8, y + 30);
      ctx.lineTo(x + w / 2 - tile * 8, y - 2);
      ctx.stroke();
    }

    ctx.fillStyle = "#664735";
    roundedRect(ctx, x + w / 2 - 13, y + h - 38, 26, 38, 4);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.fillRect(x + 16, y + 47, 26, 19);
    ctx.fillRect(x + w - 42, y + 47, 26, 19);
    ctx.fillStyle = "rgba(255, 239, 169, 0.76)";
    ctx.fillRect(x + 19, y + 50, 20, 13);
    ctx.fillRect(x + w - 39, y + 50, 20, 13);
    ctx.strokeStyle = "rgba(97, 68, 45, 0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 29, y + 50);
    ctx.lineTo(x + 29, y + 63);
    ctx.moveTo(x + w - 29, y + 50);
    ctx.lineTo(x + w - 29, y + 63);
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 21, 11, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#5a4538";
    ctx.font = "700 12px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(icon, x + w / 2, y + 25);

    ctx.fillStyle = "rgba(255, 247, 218, 0.96)";
    ctx.font = "700 11px 'PingFang SC', sans-serif";
    ctx.fillText(label, x + w / 2, y + h + 22);
    ctx.fillStyle = "rgba(248, 236, 196, 0.86)";
    ctx.font = "600 8px 'PingFang SC', sans-serif";
    ctx.fillText(`${sublabel} · ${safeOccupancy}/${safeCapacity} · Lv.${level}`, x + w / 2, y + h + 35);

    const smoke = (Math.sin(time * 1.3) + 1) * 0.5;
    ctx.globalAlpha = 0.16 + smoke * 0.08;
    ctx.fillStyle = "#f5e6bd";
    ctx.beginPath();
    ctx.arc(x + w - 29 + Math.sin(time * 0.8) * 2, y - 18 - smoke * 6, 5, 0, TAU);
    ctx.arc(x + w - 23 + Math.sin(time * 0.9 + 1) * 2, y - 28 - smoke * 5, 4, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawWindow(ctx, x, y, width, height, color, time) {
    ctx.save();
    ctx.fillStyle = "#604430";
    ctx.fillRect(x - 3, y - 3, width + 6, height + 6);
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "#5a7b76");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "rgba(255, 245, 210, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width / 2, y + height);
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + width, y + height / 2);
    ctx.stroke();
    ctx.globalAlpha = 0.12 + Math.sin(time * 0.9) * 0.03;
    ctx.fillStyle = "#ffe6a2";
    ctx.fillRect(x - 7, y - 7, width + 14, height + 14);
    ctx.restore();
  }

  drawAiShed(ctx, state, time) {
    const { x, y, w, h } = WORLD.aiShed;
    ctx.save();
    ctx.fillStyle = "rgba(37, 63, 48, 0.2)";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.52, y + h + 8, w * 0.56, 18, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#596b59";
    ctx.fillRect(x + 10, y + 45, w - 20, h - 45);
    ctx.fillStyle = "#70806b";
    ctx.fillRect(x + 17, y + 53, w - 34, h - 53);
    ctx.strokeStyle = "rgba(36, 67, 57, 0.33)";
    ctx.lineWidth = 2;
    for (let line = 0; line < 4; line += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 69 + line * 15);
      ctx.lineTo(x + w - 20, y + 69 + line * 15);
      ctx.stroke();
    }

    ctx.fillStyle = "#354b43";
    ctx.beginPath();
    ctx.moveTo(x - 3, y + 52);
    ctx.lineTo(x + 25, y + 17);
    ctx.lineTo(x + w - 8, y + 17);
    ctx.lineTo(x + w + 8, y + 52);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#243e38";
    ctx.fillRect(x + 25, y + 20, w - 45, 18);
    ctx.strokeStyle = "rgba(117, 194, 178, 0.26)";
    ctx.lineWidth = 1;
    for (let index = 0; index < 5; index += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 32 + index * 20, y + 22);
      ctx.lineTo(x + 39 + index * 20, y + 37);
      ctx.stroke();
    }

    ctx.fillStyle = "#162f2b";
    ctx.beginPath();
    ctx.arc(x + 85, y + 103, 27, 0, TAU);
    ctx.fill();
    const pulse = 0.65 + Math.sin(time * 2.2) * 0.16;
    ctx.strokeStyle = `rgba(112, 209, 190, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = `rgba(125, 223, 204, ${0.52 + Math.sin(time * 2.2) * 0.16})`;
    ctx.beginPath();
    ctx.arc(x + 85, y + 103, 6, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#2b4b43";
    ctx.fillRect(x + 38, y + 111, 31, 21);
    ctx.fillStyle = "#9ad7c8";
    for (let index = 0; index < 3; index += 1) {
      ctx.globalAlpha = 0.3 + Math.sin(time * 2 + index) * 0.18;
      ctx.fillRect(x + 43 + index * 7, y + 116, 3, 3 + index * 3);
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "#3a5148";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w - 26, y + 17);
    ctx.lineTo(x + w - 26, y - 11);
    ctx.stroke();
    ctx.fillStyle = Math.floor(time * 1.7) % 2 === 0 ? "#e5b65f" : "#8dd4c4";
    ctx.beginPath();
    ctx.arc(x + w - 26, y - 13, 3, 0, TAU);
    ctx.fill();

    ctx.restore();
    this.drawPlaceTag(ctx, x + w / 2, y + h + 13, "牧心 · 技术棚", "#b8e3d5", "#173e37");
  }

  drawPasture(ctx, state, time) {
    const { x, y, w, h } = WORLD.pasture;
    ctx.save();
    ctx.fillStyle = "#779956";
    roundedRect(ctx, x + 4, y + 10, w - 8, h - 8, 10);
    ctx.fill();
    ctx.fillStyle = "rgba(54, 89, 44, 0.18)";
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 6; col += 1) {
        ellipse(
          ctx,
          x + 40 + col * 66 + hash01(row * 10 + col) * 16,
          y + 53 + row * 45,
          10,
          4,
          "rgba(57, 88, 46, 0.18)",
        );
      }
    }

    ctx.strokeStyle = "rgba(208, 225, 151, 0.72)";
    ctx.lineWidth = 2;
    for (let tuft = 0; tuft < 34; tuft += 1) {
      const tuftX = x + 24 + hash01(tuft * 4.7) * (w - 48);
      const tuftY = y + 34 + hash01(tuft * 8.1) * (h - 72);
      const sway = Math.sin(time * 1.1 + tuft) * 2;
      ctx.beginPath();
      ctx.moveTo(tuftX, tuftY + 8);
      ctx.quadraticCurveTo(tuftX - 2, tuftY + 1, tuftX - 4 + sway, tuftY - 5);
      ctx.moveTo(tuftX, tuftY + 8);
      ctx.quadraticCurveTo(tuftX + 2, tuftY + 1, tuftX + 5 + sway, tuftY - 5);
      ctx.stroke();
    }
    const grassPlots = state.pasture?.grassPlots || [];
    const grassCols = 12;
    const grassRows = 6;
    const grassLeft = x + 28;
    const grassTop = y + 54;
    const grassWidth = w - 56;
    const grassHeight = h - 108;
    for (const plot of grassPlots) {
      const cellW = grassWidth / grassCols;
      const cellH = grassHeight / grassRows;
      const cellX = grassLeft + plot.col * cellW;
      const cellY = grassTop + plot.row * cellH;
      const planted = plot.crop === "grass";
      const ready = planted && plot.growth >= CROPS.grass.days;
      ctx.save();
      ctx.globalAlpha = planted ? (ready ? 0.72 : 0.46) : 0.2;
      ctx.fillStyle = ready ? "#a8d36e" : "#8fbc64";
      roundedRect(ctx, cellX + 3, cellY + 4, cellW - 6, cellH - 8, 6);
      ctx.fill();
      ctx.strokeStyle = ready ? "#d9ee9d" : "#c3dd8a";
      ctx.lineWidth = ready ? 2 : 1;
      const bladeCount = ready ? 5 : planted ? 3 : 2;
      for (let blade = 0; blade < bladeCount; blade += 1) {
        const bladeX = cellX + 8 + (blade + 1) * (cellW - 16) / (bladeCount + 1);
        const bladeY = cellY + cellH - 8;
        ctx.beginPath();
        ctx.moveTo(bladeX, bladeY);
        ctx.quadraticCurveTo(bladeX - 2, bladeY - 8, bladeX - 4 + Math.sin(time + plot.index + blade) * 1.5, bladeY - 13);
        ctx.moveTo(bladeX, bladeY);
        ctx.quadraticCurveTo(bladeX + 2, bladeY - 8, bladeX + 4 + Math.sin(time + plot.index + blade) * 1.5, bladeY - 13);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.fillStyle = "rgba(213, 190, 123, 0.48)";
    ctx.beginPath();
    ctx.moveTo(x + 18, y + h - 54);
    ctx.quadraticCurveTo(x + 100, y + h - 92, x + 193, y + h - 56);
    ctx.quadraticCurveTo(x + 262, y + h - 27, x + 332, y + h - 55);
    ctx.lineWidth = 18;
    ctx.strokeStyle = "rgba(213, 190, 123, 0.42)";
    ctx.stroke();

    ctx.strokeStyle = "#8b6846";
    ctx.lineWidth = 7;
    ctx.lineJoin = "round";
    ctx.strokeRect(x + 8, y + 12, w - 16, h - 20);
    ctx.strokeStyle = "#d2b17d";
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 8, y + 12, w - 16, h - 20);

    ctx.fillStyle = "#725237";
    for (let xx = x + 14; xx <= x + w - 14; xx += 52) {
      ctx.fillRect(xx, y + 6, 7, 20);
      ctx.fillRect(xx, y + h - 18, 7, 18);
    }
    for (let yy = y + 20; yy <= y + h - 22; yy += 42) {
      ctx.fillRect(x + 5, yy, 7, 16);
      ctx.fillRect(x + w - 12, yy, 7, 16);
    }

    // The lower-left fence has a visible gate so the enlarged pasture reads
    // as a walkable part of the ranch instead of a decorative backdrop.
    ctx.fillStyle = "#779956";
    ctx.fillRect(x + 2, y + h - 78, 16, 54);
    ctx.fillStyle = "#8b6846";
    ctx.fillRect(x - 1, y + h - 82, 7, 62);
    ctx.fillRect(x + 20, y + h - 82, 7, 62);
    ctx.strokeStyle = "#d2b17d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h - 68);
    ctx.lineTo(x + 22, y + h - 50);
    ctx.moveTo(x + 22, y + h - 68);
    ctx.lineTo(x + 4, y + h - 50);
    ctx.stroke();

    ctx.fillStyle = "#7a5a3d";
    roundedRect(ctx, x + 20, y + 155, 168, 57, 4);
    ctx.fill();
    ctx.fillStyle = "#9a704b";
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 160);
    ctx.lineTo(x + 38, y + 133);
    ctx.lineTo(x + 170, y + 133);
    ctx.lineTo(x + 196, y + 160);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d8b979";
    ctx.fillRect(x + 35, y + 138, 133, 5);
    ctx.fillStyle = "#4f3b2b";
    ctx.fillRect(x + 35, y + 171, 37, 40);
    ctx.fillRect(x + 86, y + 171, 37, 40);
    ctx.fillRect(x + 137, y + 171, 37, 40);
    ctx.strokeStyle = "#d3b17b";
    ctx.lineWidth = 2;
    for (let stall = 0; stall < 4; stall += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 34 + stall * 47, y + 166);
      ctx.lineTo(x + 34 + stall * 47, y + 211);
      ctx.stroke();
    }
    ctx.fillStyle = "#e0c47f";
    ctx.fillRect(x + 47, y + 148, 90, 9);
    ctx.fillStyle = "#5b422f";
    ctx.font = "700 8px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("牛羊棚 · 饮水与休息", x + 92, y + 155);
    ctx.fillStyle = "#5d442f";
    ctx.strokeStyle = "#d6b77e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 163);
    ctx.lineTo(x + 174, y + 163);
    ctx.stroke();
    ctx.fillStyle = "#a47748";
    ctx.fillRect(x + 24, y + 158, 160, 5);
    ctx.fillStyle = "#3b342a";
    ctx.fillRect(x + 50, y + 184, 38, 22);
    ctx.fillStyle = "#927047";
    ctx.fillRect(x + 54, y + 188, 30, 14);
    ctx.fillStyle = "#c8a66a";
    ctx.fillRect(x + 105, y + 184, 34, 22);

    ctx.fillStyle = "#e4d19b";
    roundedRect(ctx, x + w - 159, y + 27, 123, 28, 3);
    ctx.fill();
    ctx.fillStyle = "#5e4b33";
    ctx.font = "700 12px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`牛羊区 · ${state.animals.length} 位成员`, x + w - 97, y + 46);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#62472f";
    const feedX = x - 46;
    ctx.fillRect(feedX, y + 158, 32, 57);
    ctx.fillStyle = "#9a7449";
    ctx.fillRect(feedX + 4, y + 162, 24, 49);
    ctx.fillStyle = "#4a3a27";
    ctx.fillRect(feedX + 8, y + 169, 16, 29);
    ctx.fillStyle = "#d7bd80";
    ctx.font = "700 8px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("饲料", feedX + 16, y + 187);
    ctx.fillStyle = "#87a95e";
    ctx.fillRect(feedX + 34, y + 12, 44, 11);
    ctx.fillStyle = "#b8d17c";
    for (let blade = 0; blade < 5; blade += 1) {
      ctx.beginPath();
      ctx.moveTo(feedX + 38 + blade * 8, y + 21);
      ctx.lineTo(feedX + 40 + blade * 8, y + 7 + Math.sin(time + blade) * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#d9bd79";
    ctx.fillRect(feedX + 34, y + 31, 44, 8);
    ctx.fillStyle = "#5a432f";
    ctx.font = "700 7px 'PingFang SC', sans-serif";
    ctx.fillText("干草与饮水", feedX + 56, y + 38);
    ctx.restore();
  }

  drawPastureAnimals(ctx, state, time, drawables) {
    const pasture = WORLD.pasture;
    const positions = {
      chicken: { x: pasture.x + pasture.w * 0.22, y: pasture.y + pasture.h * 0.48, scale: 0.86 },
      duck: { x: pasture.x + pasture.w * 0.34, y: pasture.y + pasture.h * 0.34, scale: 0.82 },
      sheep: { x: pasture.x + pasture.w * 0.5, y: pasture.y + pasture.h * 0.58, scale: 0.9 },
      cow: { x: pasture.x + pasture.w * 0.76, y: pasture.y + pasture.h * 0.46, scale: 1 },
    };
    const herdSlots = [
      { x: pasture.x + pasture.w * 0.2, y: pasture.y + pasture.h * 0.34, scale: 0.78 },
      { x: pasture.x + pasture.w * 0.38, y: pasture.y + pasture.h * 0.7, scale: 0.82 },
      { x: pasture.x + pasture.w * 0.58, y: pasture.y + pasture.h * 0.32, scale: 0.86 },
      { x: pasture.x + pasture.w * 0.78, y: pasture.y + pasture.h * 0.7, scale: 0.8 },
      { x: pasture.x + pasture.w * 0.9, y: pasture.y + pasture.h * 0.34, scale: 0.72 },
    ];
    for (let index = 0; index < state.animals.length; index += 1) {
      const animal = state.animals[index];
      const pos = index < 4 && positions[animal.id]
        ? positions[animal.id]
        : herdSlots[index % herdSlots.length];
      if (!pos) continue;
      const motion = this.getAnimalMotion(animal, index, time, pasture, pos);
      drawables.push({
        y: motion.y,
        draw: () => {
          if (animal.id === "chicken") this.drawChicken(ctx, motion.x, motion.y, pos.scale, time, motion.facing);
          if (animal.id === "duck") this.drawDuck(ctx, motion.x, motion.y, pos.scale, time, motion.facing);
          if (animal.id === "sheep") this.drawSheep(ctx, motion.x, motion.y, pos.scale, time, motion.facing);
          if (animal.id === "cow") this.drawCow(ctx, motion.x, motion.y, pos.scale, time, motion.facing);
          this.drawAnimalMovementEffect(ctx, motion, animal, time);
          if (!animal.fed) this.drawFoodBubble(ctx, motion.x, motion.y - 62, time);
          if (animal.fed) this.drawHeart(ctx, motion.x + 31, motion.y - 58, time);
        },
      });
    }
  }

  getAnimalMotion(animal, index, time, pasture, position) {
    const seed = [...String(animal?.id || index)].reduce(
      (sum, character, offset) => sum + character.charCodeAt(0) * (offset + 3),
      index * 41 + 17,
    );
    const active = animal?.inBarn !== true;
    const pace = active ? 0.22 + (seed % 5) * 0.018 : 0.1;
    const phase = time * pace + seed * 0.021;
    const left = pasture.x + 44;
    const right = pasture.x + pasture.w - 38;
    const top = pasture.y + 66;
    const bottom = pasture.y + pasture.h - 34;
    const width = Math.max(40, right - left);
    const height = Math.max(30, bottom - top);
    const normalizedX = (Math.sin(phase) * 0.5 + 0.5);
    const normalizedY = (Math.sin(phase * 0.71 + seed) * 0.5 + 0.5);
    const x = left + normalizedX * width;
    const y = top + normalizedY * height;
    const nextX = left + (Math.sin(phase + 0.08) * 0.5 + 0.5) * width;
    const moving = Math.abs(nextX - x) > 1.5;
    const runBurst = active && Math.sin(phase * 1.7 + seed) > 0.72 && animal?.id !== "chicken";
    const canGraze = animal?.id === "sheep" || animal?.id === "cow";
    const grazing = canGraze && !runBurst && Math.sin(phase * 1.3 + seed * 0.7) > -0.35;
    return {
      x,
      y,
      facing: nextX >= x ? 1 : -1,
      moving,
      running: runBurst,
      grazing,
      walkPhase: time * (runBurst ? 11 : 5) + seed,
      seed,
      homeX: position.x,
      homeY: position.y,
    };
  }

  drawAnimalMovementEffect(ctx, motion, animal, time) {
    if (motion.grazing) {
      ctx.save();
      ctx.globalAlpha = 0.68;
      ctx.strokeStyle = animal?.id === "cow" ? "#d6ec9a" : "#b9d883";
      ctx.lineWidth = 1.5;
      const nibble = Math.sin(time * 5 + motion.seed) * 2;
      ctx.beginPath();
      ctx.moveTo(motion.x - 9, motion.y + 4);
      ctx.quadraticCurveTo(motion.x - 5, motion.y - 2 + nibble, motion.x - 2, motion.y + 4);
      ctx.moveTo(motion.x + 1, motion.y + 5);
      ctx.quadraticCurveTo(motion.x + 5, motion.y - 1 - nibble, motion.x + 8, motion.y + 4);
      ctx.stroke();
      ctx.restore();
    }
    if (motion.running) {
      ctx.save();
      ctx.globalAlpha = 0.34;
      ctx.fillStyle = "#e1c98f";
      for (let index = 0; index < 3; index += 1) {
        const dustPhase = (time * 2.1 + index * 0.22 + motion.seed * 0.02) % 1;
        ctx.beginPath();
        ctx.arc(motion.x - motion.facing * (12 + dustPhase * 12), motion.y + 5 - dustPhase * 3, 2 + dustPhase * 2, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawDuck(ctx, x, y, scale, time, facing = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * facing, scale);
    const gait = Math.sin(time * 7 + x * 0.02) * 1.5;
    ellipse(ctx, 0, 3, 22, 7, "rgba(45, 62, 34, 0.2)");
    ctx.fillStyle = "#e4d6a6";
    ctx.beginPath();
    ctx.ellipse(0, -13, 16, 17, -0.08, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#f0dfb6";
    ctx.beginPath();
    ctx.arc(10, -25, 9, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#6c9b86";
    ctx.beginPath();
    ctx.arc(8, -31, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#d78243";
    ctx.beginPath();
    ctx.moveTo(17, -24);
    ctx.lineTo(27, -21);
    ctx.lineTo(17, -18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2d2922";
    ctx.beginPath();
    ctx.arc(13, -27, 1.7, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#d78243";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 3);
    ctx.lineTo(-7, 8 + gait);
    ctx.moveTo(5, 3);
    ctx.lineTo(6, 8 - gait);
    ctx.stroke();
    ctx.restore();
  }

  drawChicken(ctx, x, y, scale, time, facing = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * facing, scale);
    const gait = Math.sin(time * 7 + x * 0.02) * 1.5;
    ellipse(ctx, 0, 2, 22, 7, "rgba(45, 62, 34, 0.2)");
    ctx.fillStyle = "#d88645";
    ctx.beginPath();
    ctx.ellipse(0, -13, 15, 17, -0.1, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#f0bf71";
    ctx.beginPath();
    ctx.arc(10, -24, 9, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#c3543d";
    ctx.beginPath();
    ctx.moveTo(7, -33);
    ctx.lineTo(11, -40);
    ctx.lineTo(14, -32);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#9e5d2f";
    ctx.beginPath();
    ctx.moveTo(18, -24);
    ctx.lineTo(25, -21);
    ctx.lineTo(18, -19);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2d2922";
    ctx.beginPath();
    ctx.arc(13, -26, 1.7, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#b7652f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 3);
    ctx.lineTo(-7, 8 + gait);
    ctx.moveTo(5, 3);
    ctx.lineTo(6, 8 - gait);
    ctx.stroke();
    ctx.restore();
  }

  drawSheep(ctx, x, y, scale, time, facing = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * facing, scale);
    const gait = Math.sin(time * 5.5 + x * 0.02) * 1.8;
    ellipse(ctx, 0, 3, 29, 8, "rgba(45, 62, 34, 0.2)");
    ctx.fillStyle = "#e9e2d2";
    for (let index = 0; index < 7; index += 1) {
      ctx.beginPath();
      ctx.arc(-18 + index * 6, -20 + Math.sin(index * 1.8) * 4, 11, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#d7cebd";
    ctx.beginPath();
    ctx.ellipse(-2, -14, 23, 16, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#81705c";
    ctx.beginPath();
    ctx.ellipse(20, -16, 10, 9, 0.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#e7d6b9";
    ctx.beginPath();
    ctx.ellipse(24, -16, 6, 5, 0.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#2d2922";
    ctx.beginPath();
    ctx.arc(23, -18, 1.6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#66564a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, 1);
    ctx.lineTo(-13, 7 + gait);
    ctx.moveTo(2, 1);
    ctx.lineTo(2, 7 - gait);
    ctx.stroke();
    ctx.restore();
  }

  drawCow(ctx, x, y, scale, time, facing = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * facing, scale);
    const gait = Math.sin(time * 4.6 + x * 0.02) * 2;
    ellipse(ctx, 0, 4, 40, 10, "rgba(45, 62, 34, 0.2)");
    ctx.fillStyle = "#736255";
    ctx.beginPath();
    ctx.ellipse(-4, -21, 35, 23, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#eee4d1";
    ctx.beginPath();
    ctx.ellipse(-18, -25, 12, 10, 0.2, 0, TAU);
    ctx.ellipse(11, -16, 14, 9, -0.4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#e5d6be";
    ctx.beginPath();
    ctx.ellipse(31, -31, 15, 17, 0.08, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#5b493d";
    ctx.beginPath();
    ctx.arc(36, -34, 2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#c99d76";
    ctx.beginPath();
    ctx.ellipse(43, -27, 8, 6, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#d8c19a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(27, -46);
    ctx.quadraticCurveTo(20, -56, 24, -59);
    ctx.moveTo(37, -46);
    ctx.quadraticCurveTo(43, -55, 40, -58);
    ctx.stroke();
    ctx.fillStyle = "#c78e66";
    ctx.beginPath();
    ctx.ellipse(-27, -39, 9, 5, -0.4, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#65574a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-23, 0);
    ctx.lineTo(-22, 8 + gait);
    ctx.moveTo(19, 0);
    ctx.lineTo(20, 8 - gait);
    ctx.stroke();
    ctx.strokeStyle = "#5f5146";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-37, -18);
    ctx.quadraticCurveTo(-50, -16, -45, -5);
    ctx.stroke();
    ctx.restore();
  }

  drawFoodBubble(ctx, x, y, time) {
    ctx.save();
    const bob = Math.sin(time * 2.4) * 2;
    ctx.translate(x, y + bob);
    ctx.fillStyle = "rgba(255, 248, 226, 0.9)";
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#d28e47";
    ctx.font = "700 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("…", 0, -1);
    ctx.restore();
  }

  drawHeart(ctx, x, y, time) {
    ctx.save();
    ctx.globalAlpha = 0.55 + Math.sin(time * 2.8) * 0.22;
    ctx.translate(x, y + Math.sin(time * 2) * 2);
    ctx.fillStyle = "#d87768";
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(-10, -5, -4, -13, 0, -7);
    ctx.bezierCurveTo(4, -13, 10, -5, 0, 3);
    ctx.fill();
    ctx.restore();
  }

  drawAutomationYard(ctx, state, time) {
    const yard = WORLD.automationYard;
    if (!yard) return;
    const automation = state.automation || { level: 0, name: "手工作业区" };
    ctx.save();
    ctx.fillStyle = "rgba(47, 66, 47, 0.2)";
    ctx.beginPath();
    ctx.ellipse(yard.x + yard.w / 2, yard.y + yard.h + 8, yard.w * 0.54, 14, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#92744c";
    roundedRect(ctx, yard.x, yard.y, yard.w, yard.h, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(241, 218, 164, 0.48)";
    ctx.lineWidth = 2;
    for (let line = 0; line < 4; line += 1) {
      ctx.beginPath();
      ctx.moveTo(yard.x + 16, yard.y + 22 + line * 42);
      ctx.lineTo(yard.x + yard.w - 16, yard.y + 22 + line * 42);
      ctx.stroke();
    }
    ctx.fillStyle = "#5e5445";
    roundedRect(ctx, yard.x + 18, yard.y + 22, yard.w - 36, 74, 9);
    ctx.fill();
    ctx.fillStyle = "#3e4f49";
    roundedRect(ctx, yard.x + 30, yard.y + 36, yard.w - 60, 46, 6);
    ctx.fill();
    ctx.strokeStyle = "#c8ad68";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(yard.x + 40, yard.y + 58);
    ctx.lineTo(yard.x + yard.w - 40, yard.y + 58);
    ctx.stroke();
    const running = automation.level > 0 && Math.floor(time * 1.4) % 2 === 0;
    ctx.fillStyle = running ? "#e6c56e" : "#789e86";
    for (let index = 0; index < 3; index += 1) {
      ctx.beginPath();
      ctx.arc(yard.x + 44 + index * 30, yard.y + 58, 5, 0, TAU);
      ctx.fill();
    }
    if (automation.level >= 1) this.drawAutomationMachine(ctx, yard.x + 34, yard.y + 122, "播种", running, time);
    if (automation.level >= 2) this.drawAutomationMachine(ctx, yard.x + 74, yard.y + 122, "滴灌", running, time);
    if (automation.level >= 3) this.drawAutomationMachine(ctx, yard.x + 114, yard.y + 122, "收获", running, time);
    ctx.fillStyle = "#f3e1ad";
    ctx.font = "700 10px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`左侧农机区 · Lv.${automation.level}`, yard.x + yard.w / 2, yard.y + yard.h - 18);
    ctx.fillStyle = "rgba(255, 247, 218, 0.86)";
    ctx.font = "600 8px 'PingFang SC', sans-serif";
    ctx.fillText(automation.level ? "逐格自动作业" : "可扩建自动化", yard.x + yard.w / 2, yard.y + yard.h - 6);
    ctx.restore();
  }

  drawAutomatedRanch(ctx, state, time) {
    const ranch = WORLD.automatedRanch;
    const automation = state.automatedRanch || { level: 0, name: "待开垦的自动牧场", lastActions: [] };
    const level = Math.max(0, Number(automation.level) || 0);
    ctx.save();
    ctx.fillStyle = "rgba(42, 63, 40, 0.2)";
    ctx.beginPath();
    ctx.ellipse(ranch.x + ranch.w / 2, ranch.y + ranch.h + 6, ranch.w * 0.48, 12, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = level ? "#789d5d" : "#71855b";
    roundedRect(ctx, ranch.x, ranch.y, ranch.w, ranch.h, 10);
    ctx.fill();
    ctx.strokeStyle = level ? "#d5bd7d" : "#a99168";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = "rgba(220, 210, 153, 0.75)";
    ctx.lineWidth = 2;
    for (let post = 0; post < 8; post += 1) {
      const px = ranch.x + 14 + post * (ranch.w - 28) / 7;
      ctx.beginPath();
      ctx.moveTo(px, ranch.y + ranch.h - 22);
      ctx.lineTo(px, ranch.y + ranch.h - 4);
      ctx.stroke();
    }
    ctx.fillStyle = "#765337";
    roundedRect(ctx, ranch.x + 18, ranch.y + 36, 74, 45, 5);
    ctx.fill();
    ctx.fillStyle = "#b2814e";
    ctx.beginPath();
    ctx.moveTo(ranch.x + 12, ranch.y + 40);
    ctx.lineTo(ranch.x + 29, ranch.y + 20);
    ctx.lineTo(ranch.x + 82, ranch.y + 20);
    ctx.lineTo(ranch.x + 99, ranch.y + 40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e2c980";
    ctx.fillRect(ranch.x + 31, ranch.y + 45, 48, 5);
    ctx.fillStyle = "#3f382c";
    ctx.fillRect(ranch.x + 31, ranch.y + 56, 18, 25);
    ctx.fillRect(ranch.x + 57, ranch.y + 56, 18, 25);
    ctx.fillStyle = "#d4e39a";
    ctx.fillRect(ranch.x + 110, ranch.y + 42, 46, 12);
    ctx.fillStyle = "#55773f";
    ctx.fillRect(ranch.x + 114, ranch.y + 45, 38, 6);
    ctx.fillStyle = "#cfe7a0";
    ctx.beginPath();
    ctx.arc(ranch.x + 134, ranch.y + 71, 10 + Math.sin(time * 2) * 1.5, 0, TAU);
    ctx.fill();
    if (level > 0) {
      const capacity = level >= 3 ? 99 : level >= 2 ? 8 : 4;
      const animals = (state.animals || []).slice(0, capacity);
      animals.forEach((animal, index) => {
        const lane = index % 2;
        const phase = time * (0.34 + (index % 3) * 0.08) + index * 1.7;
        const px = ranch.x + 116 + ((index * 31 + Math.sin(phase) * 10) % 92);
        const py = ranch.y + 63 + lane * 18 + Math.cos(phase * 0.8) * 4;
        const color = animal.id === "cow" ? "#6a5549" : animal.id === "sheep" ? "#e5dfcf" : animal.id === "duck" ? "#9ca99f" : "#d88748";
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(px, py, animal.id === "cow" ? 9 : 6, animal.id === "cow" ? 5 : 4, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#f6e9bf";
        ctx.beginPath();
        ctx.arc(px + 5, py - 2, 3, 0, TAU);
        ctx.fill();
        if (animal.fed || animal.grazed) {
          ctx.fillStyle = "#f2d786";
          ctx.font = "700 7px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("·", px, py - 8);
        }
      });
    }
    if (level >= 2) {
      ctx.strokeStyle = "#92d3c0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ranch.x + 108, ranch.y + 32);
      ctx.lineTo(ranch.x + 108, ranch.y + 82);
      ctx.moveTo(ranch.x + 162, ranch.y + 32);
      ctx.lineTo(ranch.x + 162, ranch.y + 82);
      ctx.stroke();
      ctx.fillStyle = "#b5e4d4";
      ctx.fillRect(ranch.x + 105, ranch.y + 27, 66, 4);
    }
    if (level >= 3) {
      ctx.fillStyle = "#e8c86e";
      ctx.beginPath();
      ctx.arc(ranch.x + ranch.w - 28, ranch.y + 36, 7 + Math.sin(time * 2.5) * 1.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#5e4d33";
      ctx.font = "700 7px 'PingFang SC', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("AI", ranch.x + ranch.w - 28, ranch.y + 39);
    }
    ctx.fillStyle = "rgba(255, 247, 215, 0.95)";
    ctx.font = "700 10px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(level ? `自动养殖牧场 · Lv.${level}` : "左侧自动养殖牧场", ranch.x + ranch.w / 2, ranch.y + 16);
    ctx.fillStyle = "rgba(255, 247, 215, 0.72)";
    ctx.font = "600 8px 'PingFang SC', sans-serif";
    ctx.fillText(level ? "自动喂养 · 放牧 · 健康记录" : "靠近后开通自动化", ranch.x + ranch.w / 2, ranch.y + ranch.h - 8);
    ctx.restore();
  }

  drawAutomationMachine(ctx, x, y, label, running, time) {
    ctx.save();
    ctx.fillStyle = "#4e493c";
    roundedRect(ctx, x - 15, y - 12, 30, 22, 5);
    ctx.fill();
    ctx.fillStyle = running ? "#f0c86d" : "#8eaa91";
    ctx.beginPath();
    ctx.arc(x, y - 1, 6 + Math.sin(time * 2 + x) * 1.2, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#d9c27d";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 11);
    ctx.lineTo(x + 10, y + 11);
    ctx.stroke();
    ctx.fillStyle = "#f2e0ac";
    ctx.font = "700 7px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y + 23);
    ctx.restore();
  }

  drawField(ctx, state, time, runtime) {
    const { field } = WORLD;
    ctx.save();
    ctx.fillStyle = "rgba(71, 89, 49, 0.16)";
    roundedRect(ctx, field.x - 19, field.y - 19, field.cols * field.tile + 38, field.rows * field.tile + 34, 15);
    ctx.fill();
    ctx.strokeStyle = "rgba(238, 218, 170, 0.24)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 8]);
    roundedRect(ctx, field.x - 11, field.y - 11, field.cols * field.tile + 22, field.rows * field.tile + 22, 11);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const plot of state.plots) {
      const x = field.x + plot.col * field.tile;
      const y = field.y + plot.row * field.tile;
      const isTarget = runtime.targetPlot?.index === plot.index;
      ctx.save();
      roundedRect(ctx, x + 3, y + 3, field.tile - 6, field.tile - 6, 7);
      if (plot.state === "wild") {
        ctx.fillStyle = "rgba(114, 145, 79, 0.54)";
        ctx.fill();
        ctx.strokeStyle = "rgba(58, 92, 45, 0.16)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.strokeStyle = "rgba(80, 119, 57, 0.55)";
        for (let grass = 0; grass < 4; grass += 1) {
          const gx = x + 14 + hash01(plot.index * 7 + grass) * 30;
          const gy = y + 19 + hash01(plot.index * 11 + grass) * 25;
          ctx.beginPath();
          ctx.moveTo(gx, gy + 5);
          ctx.quadraticCurveTo(gx + Math.sin(time + grass) * 2, gy, gx + 2, gy - 5);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = plot.watered ? "#664733" : "#8b6243";
        ctx.fill();
        ctx.strokeStyle = plot.watered
          ? "rgba(49, 37, 29, 0.34)"
          : "rgba(102, 68, 45, 0.3)";
        ctx.lineWidth = 2;
        for (let line = 1; line < 3; line += 1) {
          ctx.beginPath();
          ctx.moveTo(x + 9, y + line * 17 + 4);
          ctx.quadraticCurveTo(x + field.tile / 2, y + line * 17 + (line % 2 ? 1 : 7), x + field.tile - 9, y + line * 17 + 4);
          ctx.stroke();
        }
        if (plot.watered) {
          ctx.globalAlpha = 0.16;
          ctx.fillStyle = "#b7e2dc";
          for (let dot = 0; dot < 4; dot += 1) {
            ellipse(ctx, x + 12 + dot * 10, y + 10 + (dot % 2) * 27, 5, 1.4, "#b7e2dc");
          }
        }
        if (plot.crop) this.drawCrop(ctx, plot, x, y, time);
      }

      if (isTarget) {
        ctx.strokeStyle = "rgba(255, 238, 175, 0.9)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        roundedRect(ctx, x + 5, y + 5, field.tile - 10, field.tile - 10, 6);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }

    this.drawWorkerFieldActivity(ctx, state, time);

    ctx.fillStyle = "#6d4b32";
    ctx.fillRect(field.x - 31, field.y + 1, 4, 44);
    ctx.fillStyle = "#e4c98e";
    roundedRect(ctx, field.x - 49, field.y - 13, 49, 22, 3);
    ctx.fill();
    ctx.fillStyle = "#5f4b31";
    ctx.font = "700 9px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("田垄", field.x - 24, field.y + 2);
    ctx.restore();
  }

  drawWorkerFieldActivity(ctx, state, time) {
    const activity = state.workerActivity;
    if (!activity || activity.day !== state.day || state.minutes < 10 * 60 || state.minutes >= 18 * 60) return;
    const field = WORLD.field;
    const actions = [
      ...(activity.harvesting || []).map((entry) => ({ ...entry, type: "harvest" })),
      ...(activity.planting || []).map((entry) => ({ ...entry, type: "plant" })),
      ...(activity.watering || []).map((entry) => ({ ...entry, type: "water" })),
    ];
    if (!actions.length) return;
    const elapsed = state.minutes - 10 * 60;
    const actionSpan = 24;
    const currentIndex = Math.floor(elapsed / actionSpan);
    const progress = (elapsed % actionSpan) / actionSpan;
    const drawTileMark = (entry, phase, active) => {
      const plot = state.plots.find((candidate) => candidate.index === entry.index);
      if (!plot) return;
      const x = field.x + plot.col * field.tile;
      const y = field.y + plot.row * field.tile;
      ctx.save();
      const pulse = active ? 1 + Math.sin(time * 5.5 + entry.index) * 0.08 : 1;
      ctx.globalAlpha = active ? 0.84 : 0.42;
      ctx.strokeStyle = entry.type === "water" ? "#c7eee5" : entry.type === "harvest" ? "#f4d17e" : "#cbe79a";
      ctx.lineWidth = active ? 2.5 : 1.5;
      roundedRect(ctx, x + 5 - (pulse - 1) * 2, y + 5 - (pulse - 1) * 2, field.tile - 10 + (pulse - 1) * 4, field.tile - 10 + (pulse - 1) * 4, 7);
      ctx.stroke();
      if (entry.type === "water") {
        ctx.globalAlpha = active ? 0.2 : 0.08;
        ctx.fillStyle = "#5fa7a0";
        roundedRect(ctx, x + 8, y + 8, field.tile - 16, field.tile - 16, 6);
        ctx.fill();
        ctx.globalAlpha = active ? 0.84 : 0.25;
        ctx.fillStyle = "#c8f0e5";
        for (let drop = 0; drop < 4; drop += 1) {
          const dropPhase = (phase + drop * 0.17) % 1;
          ctx.globalAlpha = active ? 0.82 - dropPhase * 0.45 : 0.25;
          ctx.beginPath();
          ctx.arc(x + 15 + drop * 9, y + 12 + dropPhase * 24, 2, 0, TAU);
          ctx.fill();
        }
      } else if (entry.type === "harvest") {
        ctx.fillStyle = "#ffe5a1";
        ctx.font = "800 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("✿", x + field.tile / 2, y + 23 - phase * 10);
        ctx.globalAlpha = active ? 0.7 : 0.22;
        ctx.strokeStyle = "#fff0b5";
        ctx.beginPath();
        ctx.arc(x + field.tile / 2, y + field.tile / 2, 10 + phase * 12, 0, TAU);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#e7d38b";
        ctx.font = "800 15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("·", x + field.tile / 2, y + field.tile / 2 + 5);
      }
      ctx.restore();
    };
    actions.forEach((entry, index) => {
      if (index < currentIndex) drawTileMark(entry, 1, false);
      else if (index === currentIndex) drawTileMark(entry, progress, true);
    });
  }

  drawCrop(ctx, plot, x, y, time) {
    const crop = CROPS[plot.crop];
    const progress = Math.min(1, plot.growth / crop.days);
    const sway = Math.sin(time * 2 + plot.index) * (1 + progress);
    const centerX = x + 28 + sway;
    const centerY = y + 44;
    ctx.save();
    ctx.translate(centerX, centerY);

    if (progress < 0.34) {
      ctx.strokeStyle = crop.leaf;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.quadraticCurveTo(-4, -6, -8, -9);
      ctx.moveTo(0, 2);
      ctx.quadraticCurveTo(4, -7, 9, -10);
      ctx.stroke();
      ctx.fillStyle = crop.leaf;
      ctx.beginPath();
      ctx.ellipse(-8, -10, 5, 3, -0.6, 0, TAU);
      ctx.ellipse(9, -11, 5, 3, 0.6, 0, TAU);
      ctx.fill();
    } else if (progress < 0.7) {
      ctx.fillStyle = crop.leaf;
      for (let leaf = 0; leaf < 5; leaf += 1) {
        const angle = -Math.PI / 2 + (leaf - 2) * 0.45;
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(angle) * 9,
          Math.sin(angle) * 9 - 2,
          7,
          4,
          angle,
          0,
          TAU,
        );
        ctx.fill();
      }
      ctx.strokeStyle = "#527541";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(0, -9);
      ctx.stroke();
    } else {
      ctx.fillStyle = crop.leaf;
      for (let leaf = 0; leaf < 8; leaf += 1) {
        const angle = -Math.PI / 2 + (leaf - 3.5) * 0.36;
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(angle) * 12,
          Math.sin(angle) * 13 - 2,
          9,
          4.5,
          angle,
          0,
          TAU,
        );
        ctx.fill();
      }
      ctx.strokeStyle = "#4d6f3d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 7);
      ctx.lineTo(0, -13);
      ctx.stroke();

      const mature = plot.growth >= crop.days;
      if (mature) {
        if (plot.crop === "turnip") {
          ctx.fillStyle = "#f1ead3";
          ctx.beginPath();
          ctx.ellipse(0, 0, 11, 9, 0, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#d8d2ba";
          ctx.beginPath();
          ctx.moveTo(-4, 7);
          ctx.lineTo(4, 7);
          ctx.lineTo(1, 12);
          ctx.closePath();
          ctx.fill();
        } else if (plot.crop === "potato") {
          ctx.fillStyle = "#b98350";
          for (let spud = 0; spud < 3; spud += 1) {
            ctx.beginPath();
            ctx.ellipse(-8 + spud * 8, 4 + (spud % 2) * 4, 5, 3.5, 0, 0, TAU);
            ctx.fill();
          }
        } else if (plot.crop === "strawberry" || plot.crop === "tomato") {
          ctx.fillStyle = crop.color;
          for (let fruit = 0; fruit < 3; fruit += 1) {
            ctx.beginPath();
            ctx.arc(-8 + fruit * 8, -1 + (fruit % 2) * 7, 4.2, 0, TAU);
            ctx.fill();
          }
        } else if (plot.crop === "corn") {
          ctx.fillStyle = crop.color;
          for (let ear = 0; ear < 3; ear += 1) {
            ctx.beginPath();
            ctx.ellipse(-8 + ear * 8, 2, 3.5, 8, 0, 0, TAU);
            ctx.fill();
          }
        } else if (plot.crop === "watermelon") {
          ctx.fillStyle = crop.color;
          ctx.beginPath();
          ctx.ellipse(0, 2, 15, 9, -0.12, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "rgba(236, 216, 164, 0.55)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-8, -4);
          ctx.lineTo(-5, 8);
          ctx.moveTo(0, -6);
          ctx.lineTo(2, 8);
          ctx.moveTo(8, -4);
          ctx.lineTo(7, 6);
          ctx.stroke();
        } else if (plot.crop === "pumpkin") {
          ctx.fillStyle = crop.color;
          for (let lobe = 0; lobe < 3; lobe += 1) {
            ctx.beginPath();
            ctx.ellipse(-8 + lobe * 8, 2, 7, 9, 0, 0, TAU);
            ctx.fill();
          }
        } else if (["carrot", "sweetpotato"].includes(plot.crop)) {
          ctx.fillStyle = crop.color;
          for (let root = 0; root < 3; root += 1) {
            ctx.beginPath();
            ctx.ellipse(-8 + root * 8, 4, 4.5, 8, 0.2, 0, TAU);
            ctx.fill();
          }
        } else if (plot.crop === "leek") {
          ctx.fillStyle = crop.color;
          for (let stalk = 0; stalk < 3; stalk += 1) {
            ctx.fillRect(-9 + stalk * 8, -8, 4, 17);
          }
        } else {
          ctx.fillStyle = crop.color;
          for (let produce = 0; produce < 3; produce += 1) {
            ctx.beginPath();
            ctx.arc(-8 + produce * 8, 2 + (produce % 2) * 5, 5, 0, TAU);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 0.35 + Math.sin(time * 3 + plot.index) * 0.14;
        ctx.strokeStyle = "#fff2bd";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, TAU);
        ctx.stroke();
      } else {
        ctx.fillStyle = crop.id === "strawberry" ? "#d37a72" : "rgba(236, 216, 164, 0.55)";
        ctx.beginPath();
        ctx.arc(0, -1, 2.2, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawMarket(ctx, time) {
    const { x, y, w, h } = WORLD.villageShop;
    ctx.save();
    ctx.fillStyle = "rgba(43, 62, 43, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h + 7, w * 0.53, 15, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#9b7044";
    ctx.fillRect(x + 11, y + 35, w - 22, h - 35);
    ctx.fillStyle = "#c69a61";
    ctx.fillRect(x + 17, y + 42, w - 34, h - 42);
    ctx.fillStyle = "#664a30";
    for (let post = 0; post < 4; post += 1) {
      ctx.fillRect(x + 21 + post * 47, y + 35, 7, h - 35);
    }

    ctx.fillStyle = "#f1e3c2";
    for (let stripe = 0; stripe < 7; stripe += 1) {
      ctx.fillStyle = stripe % 2 === 0 ? "#e8d7ae" : "#b96448";
      ctx.beginPath();
      ctx.moveTo(x + stripe * 28, y + 19);
      ctx.lineTo(x + stripe * 28 + 28, y + 19);
      ctx.lineTo(x + stripe * 28 + 35, y + 49);
      ctx.lineTo(x + stripe * 28 + 7, y + 49);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = "#6f5133";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 9, y + 19);
    ctx.lineTo(x + w - 8, y + 19);
    ctx.stroke();

    ctx.fillStyle = "#7b5838";
    ctx.fillRect(x + 40, y + 78, 66, 9);
    ctx.fillRect(x + 40, y + 87, 8, 18);
    ctx.fillRect(x + 98, y + 87, 8, 18);
    ctx.fillStyle = "#c98b45";
    for (let index = 0; index < 6; index += 1) {
      ctx.beginPath();
      ctx.arc(x + 53 + index * 8, y + 73, 4, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#f0dfaf";
    roundedRect(ctx, x + 116, y + 68, 54, 27, 2);
    ctx.fill();
    ctx.fillStyle = "#4c4939";
    ctx.font = "700 10px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("村集小铺", x + 143, y + 86);
    ctx.restore();

    this.drawPlaceTag(ctx, x + w / 2, y - 5, "种子 · 饲料 · 出货", "#ead4a1", "#654433");
  }

  drawArchive(ctx, time) {
    const { x, y, w, h } = WORLD.archive;
    ctx.save();
    ctx.fillStyle = "rgba(39, 61, 46, 0.2)";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h + 7, w * 0.55, 15, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#a89779";
    ctx.fillRect(x + 12, y + 36, w - 24, h - 36);
    ctx.fillStyle = "#c1b291";
    ctx.fillRect(x + 18, y + 42, w - 36, h - 42);
    ctx.fillStyle = "#7e7462";
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.lineTo(x + 27, y + 7);
    ctx.lineTo(x + w - 24, y + 7);
    ctx.lineTo(x + w, y + 40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#948a73";
    ctx.fillRect(x + 23, y + 36, w - 46, 6);
    ctx.fillStyle = "#716752";
    for (let column = 0; column < 4; column += 1) {
      ctx.fillRect(x + 29 + column * 30, y + 45, 7, h - 49);
    }
    ctx.fillStyle = "#62533d";
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 86, 22, Math.PI, 0);
    ctx.lineTo(x + w / 2 + 22, y + h);
    ctx.lineTo(x + w / 2 - 22, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d7c391";
    ctx.fillRect(x + 55, y + 56, 61, 18);
    ctx.fillStyle = "#524b3b";
    ctx.font = "700 8px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("地方档案室", x + 85, y + 68);
    ctx.restore();

    this.drawPlaceTag(ctx, x + w / 2, y - 8, "地方档案室", "#d9c69a", "#5d503d");
  }

  drawNoticeboard(ctx, time) {
    const { x, y, w, h } = WORLD.noticeboard;
    ctx.save();
    ctx.fillStyle = "rgba(44, 64, 44, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 4, 25, 7, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#6c4f33";
    ctx.fillRect(x + 5, y + 9, 6, h - 9);
    ctx.fillRect(x + w - 11, y + 9, 6, h - 9);
    ctx.fillStyle = "#9a744a";
    roundedRect(ctx, x - 5, y, w + 10, 45, 3);
    ctx.fill();
    ctx.fillStyle = "#ead7a9";
    ctx.fillRect(x + 1, y + 7, 14, 21);
    ctx.fillRect(x + 20, y + 9, 14, 24);
    ctx.fillStyle = "#856741";
    ctx.fillRect(x + 5, y + 13, 6, 1);
    ctx.fillRect(x + 5, y + 18, 8, 1);
    ctx.fillRect(x + 24, y + 15, 6, 1);
    ctx.fillRect(x + 24, y + 20, 8, 1);
    ctx.restore();
  }

  drawShippingBin(ctx, time) {
    const { x, y, w, h } = WORLD.shippingBin;
    ctx.save();
    ctx.fillStyle = "rgba(44, 63, 43, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 4, w * 0.58, 8, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#6c4b31";
    roundedRect(ctx, x, y, w, h, 4);
    ctx.fill();
    ctx.fillStyle = "#9a7148";
    ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
    ctx.strokeStyle = "rgba(82, 57, 37, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 16);
    ctx.lineTo(x + w - 8, y + 16);
    ctx.moveTo(x + 8, y + 29);
    ctx.lineTo(x + w - 8, y + 29);
    ctx.stroke();
    ctx.fillStyle = "#e8d49d";
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 20, 6, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#8c6338";
    ctx.font = "700 8px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("出", x + w / 2, y + 23);
    ctx.restore();
  }

  drawCanal(ctx, state, time) {
    const pond = WORLD.pond;
    ctx.save();
    const bank = ctx.createLinearGradient(pond.x - pond.rx, 0, pond.x + pond.rx, 0);
    bank.addColorStop(0, "#738a53");
    bank.addColorStop(1, "#668247");
    ctx.fillStyle = bank;
    ctx.beginPath();
    ctx.ellipse(pond.x, pond.y, pond.rx + 30, pond.ry + 28, -0.02, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#b9ad8a";
    ctx.beginPath();
    ctx.ellipse(pond.x, pond.y, pond.rx + 14, pond.ry + 13, -0.02, 0, TAU);
    ctx.fill();

    const water = ctx.createLinearGradient(0, pond.y - pond.ry, 0, pond.y + pond.ry);
    water.addColorStop(0, state.weather === "drought" ? "#7b9c8a" : "#6ba8ad");
    water.addColorStop(0.6, state.weather === "drought" ? "#648973" : "#5d969d");
    water.addColorStop(1, "#4f8085");
    ctx.fillStyle = water;
    ctx.beginPath();
    ctx.ellipse(pond.x, pond.y, pond.rx, pond.ry, -0.02, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = "rgba(224, 242, 220, 0.38)";
    ctx.lineWidth = 1.5;
    for (let ripple = 0; ripple < 7; ripple += 1) {
      const rx = 30 + ripple * 20 + Math.sin(time * 0.7 + ripple) * 3;
      const ry = 8 + ripple * 2.2;
      ctx.beginPath();
      ctx.ellipse(
        pond.x - 55 + ripple * 15,
        pond.y - 18 + (ripple % 3) * 15,
        rx,
        ry,
        -0.02,
        0,
        Math.PI,
      );
      ctx.stroke();
    }

    ctx.fillStyle = "#5e8f50";
    for (let pad = 0; pad < 4; pad += 1) {
      ctx.beginPath();
      ctx.ellipse(
        pond.x - 74 + pad * 51,
        pond.y + 24 - (pad % 2) * 15,
        13,
        5,
        0.2,
        0,
        TAU,
      );
      ctx.fill();
    }
    ctx.fillStyle = "#ddc079";
    ctx.beginPath();
    ctx.arc(pond.x + 46, pond.y + 14, 3, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = "#6f8350";
    ctx.lineWidth = 2;
    for (let reed = 0; reed < 13; reed += 1) {
      const x = pond.x - pond.rx - 4 + reed * 29;
      const height = 12 + hash01(reed * 4) * 18;
      ctx.beginPath();
      ctx.moveTo(x, pond.y + pond.ry - 13);
      ctx.quadraticCurveTo(x + Math.sin(time + reed) * 3, pond.y + pond.ry - 25, x + 2, pond.y + pond.ry - 13 - height);
      ctx.stroke();
    }

    ctx.fillStyle = "#a69b7d";
    for (let rock = 0; rock < 10; rock += 1) {
      const angle = (rock / 10) * TAU;
      const x = pond.x + Math.cos(angle) * (pond.rx + 19);
      const y = pond.y + Math.sin(angle) * (pond.ry + 18);
      ctx.beginPath();
      ctx.ellipse(x, y, 9 + (rock % 3) * 3, 5 + (rock % 2) * 2, angle, 0, TAU);
      ctx.fill();
    }
    // A narrow river continues beyond the fish pond and opens into the
    // forest outside the ranch fence. Its animated current gives the pond
    // workers a visible downstream destination.
    ctx.fillStyle = "#6b8655";
    ctx.beginPath();
    ctx.moveTo(1232, 554);
    ctx.bezierCurveTo(1284, 560, 1302, 594, 1286, 632);
    ctx.bezierCurveTo(1268, 677, 1310, 706, 1380, 722);
    ctx.bezierCurveTo(1450, 738, 1514, 724, WORLD.width + 18, 704);
    ctx.lineTo(WORLD.width + 18, 816);
    ctx.bezierCurveTo(1504, 824, 1428, 840, 1352, 816);
    ctx.bezierCurveTo(1280, 794, 1220, 742, 1238, 690);
    ctx.bezierCurveTo(1252, 650, 1238, 604, 1198, 588);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4c8994";
    ctx.beginPath();
    ctx.moveTo(1244, 570);
    ctx.bezierCurveTo(1288, 578, 1294, 602, 1278, 640);
    ctx.bezierCurveTo(1260, 682, 1308, 720, 1384, 735);
    ctx.bezierCurveTo(1454, 749, 1518, 736, WORLD.width + 18, 718);
    ctx.lineTo(WORLD.width + 18, 798);
    ctx.bezierCurveTo(1500, 810, 1430, 824, 1360, 801);
    ctx.bezierCurveTo(1298, 780, 1244, 736, 1254, 692);
    ctx.bezierCurveTo(1264, 648, 1248, 616, 1215, 596);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(220, 244, 225, 0.45)";
    ctx.lineWidth = 2;
    for (let wave = 0; wave < 6; wave += 1) {
      const waveX = 1292 + wave * 42 + Math.sin(time * 0.8 + wave) * 5;
      const waveY = 650 + wave * 23;
      ctx.beginPath();
      ctx.moveTo(waveX, waveY);
      ctx.quadraticCurveTo(waveX + 18, waveY - 5, waveX + 34, waveY);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(236, 222, 169, 0.9)";
    ctx.font = "700 12px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("鱼池外河谷 · 可垂钓", 1370, 690);
    ctx.restore();
  }

  drawCanalGate(ctx, state, time) {
    ctx.save();
    ctx.fillStyle = "rgba(39, 59, 42, 0.2)";
    ctx.beginPath();
    ctx.ellipse(897, 541, 75, 12, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#867e68";
    roundedRect(ctx, 833, 492, 137, 47, 4);
    ctx.fill();
    ctx.fillStyle = "#a99e82";
    roundedRect(ctx, 840, 487, 123, 35, 5);
    ctx.fill();
    ctx.fillStyle = "#6e6959";
    for (let brick = 0; brick < 5; brick += 1) {
      ctx.fillRect(846 + brick * 23, 487, 2, 34);
    }

    ctx.fillStyle = "#684a31";
    ctx.fillRect(857, 452, 9, 58);
    ctx.fillRect(931, 452, 9, 58);
    ctx.fillStyle = "#8f6a44";
    ctx.fillRect(853, 448, 91, 12);
    ctx.fillStyle = "#4f3927";
    ctx.fillRect(861, 461, 74, 23);
    ctx.fillStyle = "#b9a26f";
    ctx.beginPath();
    ctx.arc(898, 471, 6, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = "#5f5341";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(847, 480);
    ctx.lineTo(841, 534);
    ctx.moveTo(949, 480);
    ctx.lineTo(955, 534);
    ctx.stroke();

    if (state.story.step === "waterMeeting") {
      const glow = 0.45 + Math.sin(time * 2.4) * 0.2;
      ctx.strokeStyle = `rgba(247, 209, 121, ${glow})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(898, 468, 32 + Math.sin(time * 1.6) * 4, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    this.drawPlaceTag(ctx, 897, 426, "旧水渠 · 渠首", "#d8e3bb", "#284e42");
  }

  drawStaticProps(ctx, time) {
    const trees = [
      [39, 157, 0.92],
      [134, 33, 0.76],
      [307, 27, 0.72],
      [574, 72, 0.65],
      [742, 42, 0.66],
      [1231, 302, 0.82],
      [1227, 448, 0.74],
      [65, 376, 0.68],
      [611, 670, 0.58],
      [754, 691, 0.62],
      [1320, 108, 0.78],
      [1480, 210, 0.92],
      [1370, 468, 0.76],
      [1510, 760, 0.86],
      [1120, 832, 0.7],
      [1380, 846, 0.64],
    ];
    for (const [x, y, scale] of trees) {
      this.drawTree(ctx, x, y, scale, time);
    }

    this.drawSignpost(ctx, 594, 454, "牧场", "#d5b879");
    this.drawSignpost(ctx, 646, 458, "村庄", "#d5b879");

    ctx.save();
    ctx.fillStyle = "#d6b573";
    ctx.globalAlpha = 0.8;
    for (let flower = 0; flower < 34; flower += 1) {
      const x = 68 + hash01(flower * 9.7) * (WORLD.width - 118);
      const y = 58 + hash01(flower * 13.1) * (WORLD.height - 108);
      if (
        (x > 100 && x < 760 && y > 260 && y < 510) ||
        (x > 810 && y > 470)
      ) {
        continue;
      }
      const color = ["#f0dd9f", "#e5a28d", "#d8ebba"][flower % 3];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 1.8 + (flower % 2), 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(244, 233, 195, 0.25)";
    ctx.lineWidth = 1;
    for (let index = 0; index < 4; index += 1) {
      const x = 805 + index * 38;
      const y = 397 + (index % 2) * 12;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 13, y - 5);
      ctx.lineTo(x + 28, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawTree(ctx, x, y, scale, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const sway = Math.sin(time * 0.75 + x * 0.02) * 2;
    ctx.fillStyle = "rgba(43, 63, 38, 0.2)";
    ctx.beginPath();
    ctx.ellipse(12, 30, 50, 15, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#725638";
    ctx.beginPath();
    ctx.moveTo(-7, 28);
    ctx.quadraticCurveTo(-5, -12, 8 + sway, -55);
    ctx.quadraticCurveTo(18, -9, 15, 28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4f7747";
    ctx.beginPath();
    ctx.arc(-19 + sway, -53, 28, 0, TAU);
    ctx.arc(12 + sway, -70, 34, 0, TAU);
    ctx.arc(42 + sway, -51, 26, 0, TAU);
    ctx.arc(8 + sway, -35, 36, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#658b55";
    ctx.beginPath();
    ctx.arc(-11 + sway, -66, 19, 0, TAU);
    ctx.arc(29 + sway, -64, 21, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(219, 231, 174, 0.22)";
    ctx.beginPath();
    ctx.arc(-4 + sway, -79, 12, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawSignpost(ctx, x, y, text, color) {
    ctx.save();
    ctx.fillStyle = "#624830";
    ctx.fillRect(x, y, 6, 62);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 38, y + 10);
    ctx.lineTo(x + 29, y + 10);
    ctx.lineTo(x + 41, y + 21);
    ctx.lineTo(x + 29, y + 32);
    ctx.lineTo(x - 38, y + 32);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5a4830";
    ctx.font = "700 9px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, x - 4, y + 25);
    ctx.restore();
  }

  drawSister(ctx, x, y, time) {
    this.drawShadow(ctx, x, y + 4, 20, 6);
    const bob = Math.sin(time * 1.5) * 0.6;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = "#2d4b46";
    ctx.fillRect(-14, -43, 28, 35);
    ctx.fillStyle = "#e2b68e";
    ctx.beginPath();
    ctx.arc(0, -54, 12, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#273a3c";
    ctx.beginPath();
    ctx.arc(-4, -54, 1.3, 0, TAU);
    ctx.arc(4, -54, 1.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#273a3c";
    ctx.beginPath();
    ctx.arc(0, -58, 13, Math.PI, 0);
    ctx.lineTo(11, -48);
    ctx.quadraticCurveTo(0, -52, -11, -48);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#93c7b9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -54, 13.5, Math.PI * 0.95, Math.PI * 1.8);
    ctx.stroke();
    ctx.fillStyle = "#1f3e3a";
    ctx.fillRect(-9, -7, 7, 9);
    ctx.fillRect(3, -7, 7, 9);
    ctx.fillStyle = "#e9d599";
    ctx.fillRect(-11, -39, 22, 3);
    ctx.fillStyle = "#4a3c31";
    ctx.font = "700 9px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("彤彤", 0, -76);
    ctx.restore();
  }

  drawWorker(ctx, x, y, time) {
    this.drawShadow(ctx, x, y + 4, 20, 6);
    const bob = Math.sin(time * 1.2 + 1) * 0.5;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = "#6b7c65";
    ctx.fillRect(-15, -40, 30, 32);
    ctx.fillStyle = "#d5ac80";
    ctx.beginPath();
    ctx.arc(0, -51, 11, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#38443b";
    ctx.beginPath();
    ctx.arc(-4, -51, 1.2, 0, TAU);
    ctx.arc(4, -51, 1.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#3f4843";
    ctx.beginPath();
    ctx.arc(0, -56, 13, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-15, -57, 30, 5);
    ctx.fillStyle = "#4b554d";
    ctx.fillRect(-11, -8, 8, 10);
    ctx.fillRect(4, -8, 8, 10);
    ctx.fillStyle = "#2f3e36";
    ctx.font = "700 9px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("老周", 0, -73);
    ctx.restore();
  }

  getFarmEmployeeMotion(role, workerId, time, lane = 0) {
    const route = FARM_EMPLOYEE_ROUTES[role] || FARM_EMPLOYEE_ROUTES.rest;
    const workerKey = String(workerId || role || "worker");
    const seed = [...workerKey].reduce((total, character, index) => (
      total + character.charCodeAt(0) * (index + 1)
    ), 0);
    const offset = hash01(seed) * route.length + lane * 0.18;
    const progress = (time * (0.27 + (seed % 5) * 0.012) + offset) % route.length;
    const segment = Math.floor(progress);
    const segmentPhase = progress - segment;
    const from = route[segment];
    const to = route[(segment + 1) % route.length];
    const traveling = segmentPhase < 0.78;
    const travelPhase = Math.min(segmentPhase / 0.78, 1);
    const easedPhase = travelPhase * travelPhase * (3 - 2 * travelPhase);
    const x = from.x + (to.x - from.x) * easedPhase;
    const y = from.y + (to.y - from.y) * easedPhase;
    const horizontalDelta = to.x - from.x;
    const facing = Math.abs(horizontalDelta) > 4 ? Math.sign(horizontalDelta) : 1;
    return {
      x,
      y,
      facing,
      moving: traveling,
      working: !traveling && role !== "休息",
      seed,
      walkPhase: time * 9 + seed * 0.07,
      actionPhase: time * 3.6 + seed * 0.11,
    };
  }

  getFarmSpriteMotion(role, spriteId, time) {
    const motion = this.getFarmEmployeeMotion(role, spriteId, time);
    return {
      ...motion,
      y: motion.y - 19,
      walkPhase: motion.walkPhase * 1.2,
      actionPhase: motion.actionPhase * 1.15,
    };
  }

  drawFarmSprite(ctx, x, y, sprite, role, time, motion = null) {
    const spriteMotion = motion || this.getFarmSpriteMotion(role, sprite?.id, time);
    const visual = sprite?.visual || {};
    const skin = visual.skin || "#f0c79b";
    const hair = visual.hair || sprite?.color || "#6f584b";
    const outfit = visual.outfit || sprite?.color || "#7aa875";
    const accent = visual.accent || "#f1d28a";
    const facing = spriteMotion.facing || 1;
    const bob = Math.sin(time * 3.1 + spriteMotion.seed) * 2;
    const action = spriteMotion.working ? Math.sin(spriteMotion.actionPhase) * 5 : 0;
    this.drawShadow(ctx, x, y + 4, 12, 4);
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = outfit;
    roundedRect(ctx, -9, -19, 18, 17, 6);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.fillRect(-7, -17, 14, 3);
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -25, 8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(0, -29, 9, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#2c312d";
    ctx.beginPath();
    ctx.arc(-3, -25, 1, 0, TAU);
    ctx.arc(3, -25, 1, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(116, 60, 47, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -22, 2.2, 0.1, Math.PI - 0.1);
    ctx.stroke();
    if (["leaf", "sprout", "crown"].includes(visual.hairStyle)) {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.ellipse(-4, -37, 3, 6, -0.4, 0, TAU);
      ctx.ellipse(4, -37, 3, 6, 0.4, 0, TAU);
      ctx.fill();
    } else if (visual.hairStyle === "wave") {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -30, 11, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
    } else if (visual.hairStyle === "bubble") {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(-7, -32, 3, 0, TAU);
      ctx.arc(7, -32, 3, 0, TAU);
      ctx.fill();
    } else if (visual.hairStyle === "ember") {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(-4, -36);
      ctx.lineTo(0, -43);
      ctx.lineTo(4, -36);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = accent;
    ctx.font = "700 7px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(visual.badge || sprite.icon || "✦", 0, -11);
    this.drawSpriteTool(ctx, role, facing, action, spriteMotion.working);
    ctx.fillStyle = "rgba(255, 247, 218, 0.96)";
    ctx.font = "700 7px 'PingFang SC', sans-serif";
    ctx.fillText(sprite.name, 0, -44);
    ctx.restore();
  }

  drawSpriteTool(ctx, role, facing, action, working) {
    if (role === "watering") {
      ctx.strokeStyle = "#bce9e2";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(facing * 8, -12);
      ctx.lineTo(facing * 22, -7 + action);
      ctx.stroke();
      if (working) ellipse(ctx, facing * 25, -4 + action, 2, 2, "#bce9e2");
    } else if (role === "planting") {
      ctx.strokeStyle = "#dbb66b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(facing * 7, -11);
      ctx.lineTo(facing * (18 + action), 1);
      ctx.stroke();
      if (working) ellipse(ctx, facing * 20, 2, 2, 1, "#9dbc73");
    } else if (role === "fishing") {
      ctx.strokeStyle = "#c89b66";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(facing * 7, -12);
      ctx.lineTo(facing * 27, -29 + action);
      ctx.stroke();
      ctx.strokeStyle = "#e6f1d5";
      ctx.beginPath();
      ctx.moveTo(facing * 27, -29 + action);
      ctx.lineTo(facing * 25, -5);
      ctx.stroke();
    } else if (role === "fishery") {
      ctx.strokeStyle = "#d5c88d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(facing * 14, -21, 7, 0, TAU);
      ctx.stroke();
      if (working) ellipse(ctx, facing * 18, -4 + action, 2, 1.5, "#f1d381");
    } else if (role === "animals") {
      ellipse(ctx, facing * 15, -7, 4, 3, "#ead393");
      if (working) ellipse(ctx, facing * 21, -3 + action, 1.5, 1.5, "#ead393");
    } else if (role === "trade") {
      ctx.fillStyle = "#b9864e";
      ctx.fillRect(facing * 12 - 4, -13, 8, 7);
      ctx.strokeStyle = "#734d37";
      ctx.strokeRect(facing * 12 - 4, -13, 8, 7);
    } else if (role === "island") {
      ctx.fillStyle = "#9d704c";
      roundedRect(ctx, facing * 12 - 5, -14, 10, 8, 2);
      ctx.fill();
    } else if (role === "hunting") {
      ctx.strokeStyle = "#5a4434";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(facing * 8, -13);
      ctx.lineTo(facing * 26, -25 + action);
      ctx.stroke();
      ctx.fillStyle = "#d8bd79";
      ctx.beginPath();
      ctx.arc(facing * 28, -26 + action, 2, 0, TAU);
      ctx.fill();
    }
  }

  drawFarmEmployee(ctx, x, y, worker, role, time, motion = null) {
    const employeeMotion = motion || this.getFarmEmployeeMotion(role, worker?.id, time);
    const bob = employeeMotion.moving
      ? Math.sin(employeeMotion.walkPhase) * 1.25
      : Math.sin(time * 2.4 + employeeMotion.seed) * 0.45;
    this.drawShadow(ctx, x, y + 4, employeeMotion.moving ? 19 : 18, 6);
    const colors = {
      planting: "#b97855",
      watering: "#5d8d9a",
      animals: "#8c7655",
      fishing: "#4c8692",
      fishery: "#65a58d",
      hunting: "#9b7256",
      trade: "#a27b52",
      island: "#6f9464",
      休息: "#89705f",
    };
    const visual = worker?.visual || {};
    const bodyColor = visual.outfit || colors[role] || "#7c6d5c";
    const accentColor = visual.accent || "#c8a36e";
    const skinColor = visual.skin || "#d8ad86";
    const hairColor = visual.hair || (role === "fishing" || role === "fishery" ? "#315e6b" : "#4f443c");
    const legSwing = employeeMotion.moving ? Math.sin(employeeMotion.walkPhase) * 3 : 0;
    const armSwing = employeeMotion.moving ? Math.sin(employeeMotion.walkPhase + Math.PI) * 3 : 0;
    const handX = employeeMotion.facing * 13;
    const actionSwing = Math.sin(employeeMotion.actionPhase) * 4;

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = visual.pants || "#3f493f";
    ctx.fillRect(-10 + legSwing, -8, 7, 9);
    ctx.fillRect(3 - legSwing, -8, 7, 9);
    ctx.fillStyle = visual.shoes || "#4a3a32";
    ctx.fillRect(-12 + legSwing, -1, 10, 3);
    ctx.fillRect(2 - legSwing, -1, 10, 3);
    ctx.fillStyle = bodyColor;
    roundedRect(ctx, -13, -38, 26, 30, 4);
    ctx.fill();
    ctx.fillStyle = accentColor;
    ctx.fillRect(-13, -36, 26, 4);
    ctx.fillStyle = "rgba(255, 240, 194, 0.45)";
    ctx.fillRect(-2, -32, 4, 21);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-9, -20);
    ctx.lineTo(-4, -20);
    ctx.moveTo(4, -20);
    ctx.lineTo(9, -20);
    ctx.stroke();
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -49, 10, 0, TAU);
    ctx.fill();
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(0, -54, 12, Math.PI, 0);
    ctx.fill();
    if (visual.hairStyle === "curly" || visual.hairStyle === "bob") {
      ctx.beginPath();
      ctx.arc(-10, -50, 5, 0, TAU);
      ctx.arc(10, -50, 5, 0, TAU);
      ctx.fill();
    } else if (visual.hairStyle === "braid" || visual.hairStyle === "ponytail") {
      ctx.beginPath();
      ctx.arc(employeeMotion.facing * -12, -48, 5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = hairColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(employeeMotion.facing * -10, -48);
      ctx.lineTo(employeeMotion.facing * -15, -36);
      ctx.stroke();
    }
    ctx.fillStyle = "#342c2b";
    ctx.beginPath();
    ctx.arc(employeeMotion.facing * 4, -51, 1.3, 0, TAU);
    ctx.arc(employeeMotion.facing * 9, -51, 1.3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(107, 56, 51, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(employeeMotion.facing * 6.5, -47, 2.5, 0.1, Math.PI - 0.1);
    ctx.stroke();
    if (visual.face === "freckles") {
      ctx.fillStyle = "rgba(143, 84, 62, 0.52)";
      ctx.beginPath();
      ctx.arc(employeeMotion.facing * 1, -47, 0.8, 0, TAU);
      ctx.arc(employeeMotion.facing * 5, -46, 0.8, 0, TAU);
      ctx.fill();
    } else if (visual.face === "glasses") {
      ctx.strokeStyle = "#4a5250";
      ctx.lineWidth = 1;
      ctx.strokeRect(employeeMotion.facing * 1, -54, 5, 4);
      ctx.strokeRect(employeeMotion.facing * 7, -54, 5, 4);
      ctx.beginPath();
      ctx.moveTo(employeeMotion.facing * 6, -52);
      ctx.lineTo(employeeMotion.facing * 7, -52);
      ctx.stroke();
    }
    if (visual.headwear === "straw") {
      ctx.fillStyle = "#e3bb69";
      ctx.beginPath();
      ctx.ellipse(0, -58, 17, 4, 0, 0, TAU);
      ctx.fill();
      ctx.fillRect(-10, -66, 20, 8);
    } else if (visual.headwear === "wool" || visual.headwear === "beanie") {
      ctx.fillStyle = visual.headwear === "beanie" ? "#2e5666" : "#8c665c";
      ctx.beginPath();
      ctx.arc(0, -58, 14, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-13, -58, 26, 4);
    } else if (visual.headwear === "bandana") {
      ctx.fillStyle = "#d77655";
      ctx.fillRect(-12, -59, 24, 4);
      ctx.beginPath();
      ctx.moveTo(employeeMotion.facing * 10, -57);
      ctx.lineTo(employeeMotion.facing * 17, -51);
      ctx.lineTo(employeeMotion.facing * 10, -51);
      ctx.closePath();
      ctx.fill();
    } else if (visual.headwear === "cap") {
      ctx.fillStyle = "#5d8d82";
      ctx.beginPath();
      ctx.arc(0, -58, 13, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-15, -57, 19, 3);
    } else if (visual.headwear === "hood") {
      ctx.strokeStyle = "#536d57";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -52, 15, Math.PI * 1.02, Math.PI * 1.98);
      ctx.stroke();
    } else if (visual.headwear === "ribbon") {
      ctx.fillStyle = "#e0a56d";
      ctx.beginPath();
      ctx.arc(employeeMotion.facing * -11, -56, 3, 0, TAU);
      ctx.moveTo(employeeMotion.facing * -11, -56);
      ctx.lineTo(employeeMotion.facing * -17, -61);
      ctx.lineTo(employeeMotion.facing * -16, -52);
      ctx.closePath();
      ctx.fill();
    }
    if (visual.badge) {
      ctx.fillStyle = accentColor;
      ctx.font = "700 7px 'PingFang SC', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(visual.badge, 0, -24);
    }

    // A small stride and arm swing keeps walking employees readable at the
    // same scale as the rest of the ranch cast.
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(employeeMotion.facing * 9, -29);
    ctx.lineTo(employeeMotion.facing * (15 + armSwing), -18);
    ctx.stroke();

    ctx.strokeStyle = role === "watering" ? "#afd2d0" : role === "planting" ? "#dfbd72" : "#c8a36e";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    if (role === "planting") {
      const toolX = employeeMotion.facing * (21 + (employeeMotion.working ? actionSwing : 0));
      ctx.beginPath();
      ctx.moveTo(handX, -13);
      ctx.lineTo(toolX, employeeMotion.working ? 6 : 1);
      ctx.stroke();
      if (employeeMotion.working) {
        ctx.globalAlpha = 0.72;
        ellipse(ctx, toolX, 7, 5, 2, "#d5b875");
        ctx.fillStyle = "#a7c978";
        ctx.beginPath();
        ctx.arc(toolX + employeeMotion.facing * 5, 1, 2, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else if (role === "watering") {
      const canX = employeeMotion.facing * 16;
      ctx.fillStyle = "#86b9b7";
      roundedRect(ctx, canX - employeeMotion.facing * 7, -22, 14, 10, 3);
      ctx.fill();
      ctx.strokeStyle = "#afd2d0";
      ctx.beginPath();
      ctx.moveTo(canX + employeeMotion.facing * 5, -17);
      ctx.lineTo(employeeMotion.facing * 26, -9 + (employeeMotion.working ? actionSwing : 0));
      ctx.stroke();
      if (employeeMotion.working) {
        ctx.fillStyle = "#bce9e2";
        for (let drop = 0; drop < 3; drop += 1) {
          const dropPhase = (time * 1.4 + employeeMotion.seed * 0.03 + drop * 0.28) % 1;
          const dropX = employeeMotion.facing * (27 + dropPhase * 16);
          const dropY = -7 + dropPhase * 12 + (drop % 2) * 3;
          ctx.globalAlpha = 0.78 - dropPhase * 0.5;
          ctx.beginPath();
          ctx.arc(dropX, dropY, 1.7, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    } else if (role === "fishing") {
      const tipX = employeeMotion.facing * 38;
      const tipY = -42 + (employeeMotion.working ? actionSwing : 0);
      ctx.strokeStyle = "#bd8f5e";
      ctx.beginPath();
      ctx.moveTo(handX, -17);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ctx.strokeStyle = "#d5ead3";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(employeeMotion.facing * 34, -4);
      ctx.stroke();
      ctx.fillStyle = "#dd8067";
      ctx.beginPath();
      ctx.arc(employeeMotion.facing * 34, -2 + Math.sin(employeeMotion.actionPhase) * 2, 3, 0, TAU);
      ctx.fill();
      if (employeeMotion.working) {
        ctx.strokeStyle = "rgba(220, 242, 211, 0.72)";
        ctx.beginPath();
        ctx.ellipse(employeeMotion.facing * 34, 6, 10 + Math.sin(employeeMotion.actionPhase) * 3, 3, 0, 0, TAU);
        ctx.stroke();
      }
    } else if (role === "fishery") {
      const netX = employeeMotion.facing * 17;
      ctx.strokeStyle = "#d4c58e";
      ctx.beginPath();
      ctx.moveTo(handX, -16);
      ctx.lineTo(netX, -29);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(netX + employeeMotion.facing * 7, -32, 8, 0, TAU);
      ctx.stroke();
      if (employeeMotion.working) {
        ctx.fillStyle = "#f2cf82";
        for (let feed = 0; feed < 3; feed += 1) {
          const feedPhase = (time * 1.1 + feed * 0.31 + employeeMotion.seed * 0.02) % 1;
          ctx.globalAlpha = 0.7 - feedPhase * 0.4;
          ctx.beginPath();
          ctx.arc(employeeMotion.facing * (23 + feedPhase * 16), -6 + feedPhase * 9, 2, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    } else if (role === "animals") {
      const bucketX = employeeMotion.facing * 19;
      ctx.beginPath();
      ctx.arc(bucketX, -7, 6, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bucketX, -9, 4, Math.PI, TAU);
      ctx.stroke();
      if (employeeMotion.working) {
        ctx.fillStyle = "#ead393";
        for (let feed = 0; feed < 3; feed += 1) {
          const feedPhase = (time * 1.3 + feed * 0.32 + employeeMotion.seed * 0.02) % 1;
          ctx.globalAlpha = 0.72 - feedPhase * 0.45;
          ctx.beginPath();
          ctx.arc(bucketX + employeeMotion.facing * feedPhase * 14, -1 + feedPhase * 7, 2, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    } else if (role === "trade") {
      const crateX = employeeMotion.facing * 19;
      ctx.fillStyle = "#bf9057";
      ctx.fillRect(crateX - 7, -19, 14, 13);
      ctx.strokeStyle = "#7b5436";
      ctx.beginPath();
      ctx.moveTo(crateX - 7, -13);
      ctx.lineTo(crateX + 7, -13);
      ctx.moveTo(crateX, -19);
      ctx.lineTo(crateX, -6);
      ctx.stroke();
    } else if (role === "island") {
      const bagX = employeeMotion.facing * 17;
      ctx.fillStyle = "#9a6e4f";
      roundedRect(ctx, bagX - 7, -18, 14, 12, 3);
      ctx.fill();
      ctx.strokeStyle = "#d9c18a";
      ctx.beginPath();
      ctx.moveTo(bagX - 5, -19);
      ctx.quadraticCurveTo(bagX, -27, bagX + 5, -19);
      ctx.stroke();
    } else if (role === "hunting") {
      const toolX = employeeMotion.facing * 20;
      ctx.strokeStyle = "#5a4434";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(handX, -16);
      ctx.lineTo(toolX, -32 + (employeeMotion.working ? actionSwing : 0));
      ctx.stroke();
      ctx.fillStyle = "#e4c982";
      ctx.beginPath();
      ctx.arc(toolX, -33 + (employeeMotion.working ? actionSwing : 0), 3, 0, TAU);
      ctx.fill();
      if (employeeMotion.working) {
        ctx.strokeStyle = "rgba(240, 220, 145, 0.78)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(employeeMotion.facing * 30, -35, 7 + Math.sin(employeeMotion.actionPhase) * 2, 0, TAU);
        ctx.stroke();
      }
    }

    ctx.fillStyle = "rgba(255, 247, 218, 0.94)";
    ctx.font = "700 8px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(worker.name, 0, -69);
    ctx.globalAlpha = 0.72;
    ctx.font = "600 7px 'PingFang SC', sans-serif";
    ctx.fillText(role, 0, -59);
    ctx.restore();
  }

  drawInvestor(ctx, x, y, time) {
    this.drawShadow(ctx, x, y + 4, 22, 7);
    const bob = Math.sin(time * 1.3) * 0.6;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = "#2d4147";
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-11, -45);
    ctx.lineTo(11, -45);
    ctx.lineTo(17, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d9b38c";
    ctx.beginPath();
    ctx.arc(0, -56, 12, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#2e3130";
    ctx.beginPath();
    ctx.arc(-4, -56, 1.3, 0, TAU);
    ctx.arc(4, -56, 1.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#2e3130";
    ctx.beginPath();
    ctx.arc(0, -58, 13, Math.PI, 0);
    ctx.lineTo(12, -50);
    ctx.quadraticCurveTo(0, -54, -12, -50);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d0b67c";
    ctx.fillRect(-5, -45, 10, 23);
    ctx.fillStyle = "#f1e6c9";
    roundedRect(ctx, 13, -37, 23, 30, 3);
    ctx.fill();
    ctx.strokeStyle = "#7a6e58";
    ctx.stroke();
    ctx.fillStyle = "#34433e";
    ctx.font = "700 9px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("林屿", 0, -78);
    ctx.restore();
  }

  drawElder(ctx, x, y, time) {
    this.drawShadow(ctx, x, y + 4, 19, 6);
    const bob = Math.sin(time * 0.9) * 0.45;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = "#72584d";
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(-8, -40);
    ctx.quadraticCurveTo(0, -48, 8, -40);
    ctx.lineTo(14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d4aa81";
    ctx.beginPath();
    ctx.arc(0, -51, 11, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#4b3d34";
    ctx.beginPath();
    ctx.arc(-4, -51, 1.2, 0, TAU);
    ctx.arc(4, -51, 1.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#dedbd0";
    ctx.beginPath();
    ctx.arc(0, -58, 12, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-10, -55, 5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#c7b18f";
    ctx.fillRect(9, -52, 3, 45);
    ctx.fillStyle = "#4b3d34";
    ctx.font = "700 9px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("阿婆", 0, -74);
    ctx.restore();
  }

  drawPlayer(ctx, x, y, facing, runtime, time, state) {
    const moving = runtime.moving;
    const walk = runtime.walkPhase || time * 7;
    const speedBounce = moving ? Math.abs(Math.sin(walk)) * 2.2 : Math.sin(time * 1.8) * 0.55;
    const legSwing = moving ? Math.sin(walk) * 4 : 0;
    const armSwing = moving ? Math.sin(walk + Math.PI) * 3.2 : 0;
    this.drawShadow(ctx, x, y + 3, moving ? 23 : 20, 7);

    ctx.save();
    ctx.translate(x, y - speedBounce);
    if (facing === "left") ctx.scale(-1, 1);

    ctx.strokeStyle = "#35433b";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-7, -9);
    ctx.lineTo(-8 - legSwing, 0);
    ctx.moveTo(7, -9);
    ctx.lineTo(8 + legSwing, 0);
    ctx.stroke();
    ctx.strokeStyle = "#6c4a32";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10 - legSwing, 0);
    ctx.lineTo(-5 - legSwing, 0);
    ctx.moveTo(6 + legSwing, 0);
    ctx.lineTo(11 + legSwing, 0);
    ctx.stroke();

    ctx.fillStyle = "#355a50";
    roundedRect(ctx, -13, -39, 26, 33, 7);
    ctx.fill();
    ctx.fillStyle = "#d89a4d";
    ctx.fillRect(-13, -35, 26, 4);
    ctx.fillStyle = "#31483f";
    ctx.fillRect(-4, -34, 8, 27);

    ctx.strokeStyle = "#d3a478";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-12, -32);
    ctx.lineTo(-15 + armSwing, -16);
    ctx.moveTo(12, -32);
    ctx.lineTo(15 - armSwing, -16);
    ctx.stroke();

    ctx.fillStyle = "#e1b68d";
    ctx.beginPath();
    ctx.arc(0, -49, 10.5, 0, TAU);
    ctx.fill();

    if (facing !== "up") {
      ctx.fillStyle = "#34413a";
      ctx.beginPath();
      ctx.arc(-3.2, -49, 1.15, 0, TAU);
      ctx.arc(3.2, -49, 1.15, 0, TAU);
      ctx.fill();
      if (facing !== "left") {
        ctx.strokeStyle = "rgba(111, 68, 50, 0.7)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(0, -45, 3.4, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
    }

    ctx.fillStyle = "#3a3d34";
    ctx.beginPath();
    ctx.arc(0, -53, 11, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = "#d5b26b";
    ctx.beginPath();
    ctx.ellipse(0, -60, 19, 6, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#c39b58";
    ctx.beginPath();
    ctx.ellipse(0, -63, 10, 7, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#ac8247";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-15, -59);
    ctx.quadraticCurveTo(-19, -66, -11, -67);
    ctx.stroke();

    ctx.fillStyle = "#6e4a32";
    roundedRect(ctx, 9, -34, 7, 20, 3);
    ctx.fill();
    ctx.fillStyle = "#c5965b";
    ctx.fillRect(10, -30, 5, 2);

    if (state.energy <= 25) {
      ctx.fillStyle = "rgba(255, 247, 223, 0.85)";
      ctx.font = "700 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("…", 17, -67);
    }
    ctx.restore();
  }

  drawShadow(ctx, x, y, rx, ry) {
    ctx.save();
    ctx.fillStyle = "rgba(41, 57, 38, 0.24)";
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawFieldHighlight(ctx, state, runtime, time) {
    if (!runtime.targetPlot) return;
    const tool = TOOLS.find((entry) => entry.id === state.selectedTool);
    if (!tool) return;
    const plot = runtime.targetPlot;
    const field = WORLD.field;
    if (plot.row === 0) {
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = "rgba(255, 246, 209, 0.82)";
      roundedRect(
        ctx,
        field.x + plot.col * field.tile + 12,
        field.y - 27,
        32,
        17,
        4,
      );
      ctx.fill();
      ctx.fillStyle = "#3d5e4d";
      ctx.font = "700 9px 'PingFang SC', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tool.name, field.x + plot.col * field.tile + 28, field.y - 15);
      ctx.restore();
    }
  }

  drawInteractionHighlight(ctx, state, runtime, time) {
    if (!runtime.nearInteraction) return;
    const interaction = this.getSceneInteraction(state, runtime.nearInteraction);
    if (!interaction) return;
    const pulse = 1 + Math.sin(time * 3.2) * 0.1;
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = "#fff0b6";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.ellipse(
      interaction.x,
      interaction.y + 8,
      24 * pulse,
      9 * pulse,
      0,
      0,
      TAU,
    );
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#fff4c9";
    ctx.beginPath();
    ctx.arc(interaction.x, interaction.y - 41 + Math.sin(time * 2.5) * 2, 3, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  getSceneInteraction(state, interactionId) {
    const sceneId = state.world?.scene || "farm";
    const base = sceneId === "farm" ? INTERACTIONS : SCENE_INTERACTIONS[sceneId] || [];
    const portalEntries = (SCENE_DEFS[sceneId]?.portals || []).map((portal) => portal);
    const npcEntries = scheduledNpcPositions(state.minutes, sceneId).map((position) => ({
      id: `npc_${position.npc.id}`,
      x: position.x,
      y: position.y,
      radius: 46,
    }));
    return [...base, ...portalEntries, ...npcEntries].find((entry) => entry.id === interactionId) || null;
  }

  drawForegroundFlora(ctx, time) {
    ctx.save();
    const bushes = [
      [12, 720, 0.9],
      [95, 717, 0.56],
      [1558, 874, 0.94],
      [1390, 880, 0.5],
      [1260, 862, 0.62],
    ];
    for (const [x, y, scale] of bushes) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = "#436344";
      ctx.beginPath();
      ctx.arc(0, -6, 34, 0, TAU);
      ctx.arc(26, 1, 28, 0, TAU);
      ctx.arc(-26, 3, 25, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#6f8c57";
      ctx.beginPath();
      ctx.arc(-13, -17, 13, 0, TAU);
      ctx.arc(19, -14, 16, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  drawFloatingAtmosphere(ctx, state, time) {
    if (state.weather === "rain" || state.weather === "drought") return;
    ctx.save();
    for (let particle = 0; particle < 18; particle += 1) {
      const speed = 7 + (particle % 5) * 3;
      const x = ((particle * 79 + time * speed) % (WORLD.width + 40)) - 20;
      const y = 100 + ((particle * 53 + Math.sin(time * 0.3 + particle) * 22) % (WORLD.height - 170));
      ctx.globalAlpha = 0.12 + (particle % 4) * 0.03;
      ctx.fillStyle = particle % 3 === 0 ? "#f4dfa7" : "#dfe9c1";
      ctx.beginPath();
      ctx.ellipse(x, y, 2.4, 1.2, Math.sin(time + particle) * 0.9, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    if (state.minutes >= 19 * 60) {
      ctx.save();
      for (let fly = 0; fly < 15; fly += 1) {
        const x = 140 + hash01(fly * 15.7) * (WORLD.width - 250);
        const y = 360 + hash01(fly * 19.3) * (WORLD.height - 430);
        const alpha = Math.max(0, Math.sin(time * 1.2 + fly * 2.4)) * 0.7;
        if (alpha < 0.08) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#e7e18c";
        ctx.shadowColor = "#e7e18c";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x + Math.sin(time * 0.5 + fly) * 11, y + Math.cos(time * 0.4 + fly) * 8, 1.6, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawWeather(ctx, state, time) {
    if (state.weather === "rain") {
      ctx.save();
      ctx.fillStyle = "rgba(47, 78, 86, 0.16)";
      ctx.fillRect(0, 0, WORLD.width, WORLD.height);
      ctx.strokeStyle = "rgba(198, 230, 230, 0.34)";
      ctx.lineWidth = 1.2;
      for (let drop = 0; drop < 110; drop += 1) {
        const speed = 520 + (drop % 5) * 55;
        const x = ((drop * 131 + time * 120) % (WORLD.width + 40)) - 20;
        const y = ((drop * 83 + time * speed) % (WORLD.height + 60)) - 30;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y + 16);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(206, 238, 235, 0.18)";
      for (let ring = 0; ring < 13; ring += 1) {
        const x = 120 + hash01(ring * 11) * Math.max(520, WORLD.width - 240);
        const y = 390 + hash01(ring * 17) * Math.max(180, WORLD.height - 520);
        const pulse = (time * 0.9 + ring * 0.3) % 1;
        ctx.beginPath();
        ctx.ellipse(x, y, 3 + pulse * 9, 1 + pulse * 3, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    } else if (state.weather === "cloudy") {
      ctx.save();
      ctx.fillStyle = "rgba(77, 101, 103, 0.08)";
      ctx.fillRect(0, 0, WORLD.width, WORLD.height);
      ctx.restore();
    } else if (state.weather === "drought") {
      ctx.save();
      ctx.fillStyle = "rgba(198, 153, 70, 0.1)";
      ctx.fillRect(0, 0, WORLD.width, WORLD.height);
      for (let mote = 0; mote < 24; mote += 1) {
        const x = ((mote * 127 + time * 12) % (WORLD.width + 40)) - 20;
        const y = 140 + ((mote * 71 + Math.sin(time * 0.5 + mote) * 28) % Math.max(240, WORLD.height - 240));
        ctx.globalAlpha = 0.12 + (mote % 3) * 0.03;
        ctx.fillStyle = "#f3d18a";
        ctx.beginPath();
        ctx.arc(x, y, 1.3 + (mote % 2), 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawLighting(ctx, state, time) {
    const minutes = state.minutes;
    let alpha = 0;
    let color = "rgba(21, 43, 70, 1)";
    if (minutes > 17.5 * 60) {
      const progress = Math.min(1, (minutes - 17.5 * 60) / (22 * 60 - 17.5 * 60));
      alpha = progress * 0.34;
      color = progress < 0.4 ? "rgba(111, 63, 59, 1)" : "rgba(22, 41, 65, 1)";
    }
    if (minutes < 7.5 * 60) {
      const progress = 1 - Math.min(1, Math.max(0, (minutes - 6 * 60) / (1.5 * 60)));
      alpha = Math.max(alpha, 0.14 + progress * 0.18);
      color = "rgba(86, 98, 104, 1)";
    }
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    ctx.restore();

    if (minutes >= 18.5 * 60) {
      ctx.save();
      const glow = ctx.createRadialGradient(218, 205, 4, 218, 205, 165);
      glow.addColorStop(0, "rgba(255, 201, 106, 0.2)");
      glow.addColorStop(1, "rgba(255, 201, 106, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(40, 30, 370, 330);
      const aiGlow = ctx.createRadialGradient(440, 171, 2, 440, 171, 100);
      aiGlow.addColorStop(0, "rgba(104, 214, 191, 0.2)");
      aiGlow.addColorStop(1, "rgba(104, 214, 191, 0)");
      ctx.fillStyle = aiGlow;
      ctx.fillRect(330, 60, 230, 220);
      ctx.restore();
    }
  }

  drawEffects(ctx, runtime, time, delta) {
    if (!runtime.effects?.length) return;
    ctx.save();
    for (const effect of runtime.effects) {
      effect.life -= delta * 1.35;
      if (effect.life <= 0) continue;
      const progress = 1 - effect.life;
      const alpha = Math.min(1, effect.life * 1.8);
      ctx.globalAlpha = alpha;
      if (effect.type === "water") {
        ctx.strokeStyle = "#c9f0e5";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(effect.x, effect.y + 7, 9 + progress * 33, 4 + progress * 13, 0, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = "#d9f5d2";
        for (let index = 0; index < 5; index += 1) {
          ctx.beginPath();
          ctx.arc(effect.x - 20 + index * 10, effect.y - progress * 28 - (index % 2) * 8, 2, 0, TAU);
          ctx.fill();
        }
      } else if (effect.type === "harvest" || effect.type === "trade" || effect.type === "city" || effect.type === "policy") {
        const symbol = effect.type === "harvest" ? "✿" : effect.type === "trade" ? "✦" : effect.type === "policy" ? "⚖" : "＋";
        ctx.fillStyle = effect.type === "trade" ? "#f6d478" : "#fff1b5";
        ctx.font = "800 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(symbol, effect.x, effect.y - 25 - progress * 28);
        ctx.strokeStyle = "rgba(255, 242, 185, 0.85)";
        ctx.lineWidth = 1.3;
        for (let ray = 0; ray < 6; ray += 1) {
          const angle = (ray / 6) * TAU + effect.seed * TAU;
          const radius = 12 + progress * 24;
          ctx.beginPath();
          ctx.moveTo(effect.x + Math.cos(angle) * radius, effect.y - 14 + Math.sin(angle) * radius * 0.48);
          ctx.lineTo(effect.x + Math.cos(angle) * (radius + 5), effect.y - 14 + Math.sin(angle) * (radius + 5) * 0.48);
          ctx.stroke();
        }
      } else if (effect.type === "sprite") {
        ctx.fillStyle = "#c8f1be";
        ctx.shadowColor = "#b0e7a0";
        ctx.shadowBlur = 12;
        for (let spark = 0; spark < 7; spark += 1) {
          const angle = (spark / 7) * TAU + time * 0.7;
          const radius = 10 + progress * 30 + (spark % 2) * 8;
          ctx.beginPath();
          ctx.arc(effect.x + Math.cos(angle) * radius, effect.y - 25 + Math.sin(angle) * radius * 0.5, 2.4, 0, TAU);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      } else if (effect.type === "island" || effect.type === "travel") {
        ctx.strokeStyle = effect.type === "island" ? "#a5e1e1" : "#ffe0a3";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y - 12, 10 + progress * 35, 0, TAU);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#fff1b5";
        ctx.fillRect(effect.x - progress * 18, effect.y - progress * 26, 3, 3);
      }
    }
    ctx.restore();
    runtime.effects = runtime.effects.filter((effect) => effect.life > 0);
  }

  drawDebugVignette(ctx) {
    ctx.save();
    const vignette = ctx.createRadialGradient(
      WORLD.width / 2,
      WORLD.height / 2,
      240,
      WORLD.width / 2,
      WORLD.height / 2,
      760,
    );
    vignette.addColorStop(0, "rgba(10, 28, 23, 0)");
    vignette.addColorStop(1, "rgba(10, 28, 23, 0.19)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    ctx.restore();
  }

  drawPlaceTag(ctx, x, y, text, background, color) {
    ctx.save();
    ctx.font = "700 9px 'PingFang SC', sans-serif";
    const width = Math.max(38, ctx.measureText(text).width + 18);
    ctx.fillStyle = "rgba(255, 251, 235, 0.82)";
    roundedRect(ctx, x - width / 2, y - 15, width, 19, 9);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y - 5);
    ctx.restore();
  }

  shouldShowInvestor(state) {
    return (
      state.story.step === "meetInvestor" ||
      state.story.step === "aiAudit" ||
      state.story.step === "endingReady" ||
      Boolean(state.story.developmentChoice)
    );
  }
}
