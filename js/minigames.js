import { MINIGAME_DEFS } from "./data.js";

const WIDTH = 960;
const HEIGHT = 540;
const TAU = Math.PI * 2;

export function createRng(seed = 1) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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

class BaseMiniGame {
  constructor(type, rng = Math.random) {
    this.type = type;
    this.def = MINIGAME_DEFS[type];
    this.rng = rng;
    this.timeLeft = this.def?.duration || 20;
    this.finished = false;
    this.score = 0;
    this.message = this.def?.action || "";
    this.result = null;
  }

  finish(result) {
    if (this.finished) return;
    this.finished = true;
    this.result = { ...result, score: Math.round(this.score) };
  }

  update(dt) {
    if (this.finished) return;
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    this.tick(dt);
    if (this.timeLeft <= 0) this.timeout();
  }

  tick() {}

  timeout() {}

  action() {}

  move() {}

  render() {}

  drawFrame(ctx) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    this.render(ctx);
    ctx.restore();
    this.drawHud(ctx);
  }

  drawHud(ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(10, 33, 27, 0.82)";
    roundedRect(ctx, 24, 20, 470, 68, 14);
    ctx.fill();
    ctx.fillStyle = "#fff4d4";
    ctx.font = "700 22px 'PingFang SC', sans-serif";
    ctx.fillText(this.def.title, 44, 50);
    ctx.fillStyle = "rgba(241, 231, 199, 0.78)";
    ctx.font = "500 12px 'PingFang SC', sans-serif";
    ctx.fillText(this.def.action, 44, 72);

    ctx.fillStyle = "rgba(10, 33, 27, 0.82)";
    roundedRect(ctx, WIDTH - 245, 20, 220, 68, 14);
    ctx.fill();
    ctx.fillStyle = "#f3ca72";
    ctx.font = "700 15px 'SFMono-Regular', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`TIME ${this.timeLeft.toFixed(1)}s`, WIDTH - 46, 48);
    ctx.fillStyle = "#f8eed1";
    ctx.font = "700 13px 'PingFang SC', sans-serif";
    ctx.fillText(`SCORE ${Math.round(this.score)}`, WIDTH - 46, 69);
    ctx.restore();
  }

  drawResult(ctx, lines) {
    ctx.save();
    ctx.fillStyle = "rgba(11, 33, 27, 0.78)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#f7eed5";
    roundedRect(ctx, 250, 155, 460, 235, 22);
    ctx.fill();
    ctx.fillStyle = "#254d3f";
    ctx.font = "700 32px 'Noto Serif SC', 'Songti SC', serif";
    ctx.textAlign = "center";
    ctx.fillText(this.def.title, WIDTH / 2, 220);
    ctx.fillStyle = "#63776a";
    ctx.font = "500 18px 'PingFang SC', sans-serif";
    lines.forEach((line, index) => ctx.fillText(line, WIDTH / 2, 265 + index * 28));
    ctx.fillStyle = "#a76f25";
    ctx.font = "600 12px 'PingFang SC', sans-serif";
    ctx.fillText("点击/轻触或按空格收下结果", WIDTH / 2, 366);
    ctx.restore();
  }
}

export class HuntGame extends BaseMiniGame {
  constructor(rng = Math.random) {
    super("hunt", rng);
    this.hits = 0;
    this.rareHits = 0;
    this.misses = 0;
    this.spawnTimer = 0;
    this.actionCooldown = 0;
    this.aim = { x: WIDTH / 2, y: HEIGHT / 2 };
    this.birds = [];
  }

  spawnBird() {
    const fromLeft = this.rng() > 0.5;
    this.birds.push({
      x: fromLeft ? -30 : WIDTH + 30,
      y: 150 + this.rng() * 260,
      vx: (fromLeft ? 1 : -1) * (62 + this.rng() * 65),
      vy: (this.rng() - 0.5) * 24,
      wing: this.rng() * TAU,
      color: this.rng() > 0.45 ? "#3f5146" : "#665d44",
      rare: this.rng() < 0.12,
    });
    const bird = this.birds.at(-1);
    if (bird.rare) bird.color = "#d6ad4f";
  }

  tick(dt) {
    this.actionCooldown = Math.max(0, this.actionCooldown - dt);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnBird();
      this.spawnTimer = 0.75 + this.rng() * 0.8;
    }
    for (const bird of this.birds) {
      bird.x += bird.vx * dt;
      bird.y += bird.vy * dt;
      bird.wing += dt * 7;
    }
    this.birds = this.birds.filter(
      (bird) => bird.x > -80 && bird.x < WIDTH + 80 && bird.y > 80 && bird.y < HEIGHT - 30,
    );
    if (this.hits >= 7) this.finish(this.resultForFinish());
  }

  move(dx, dy) {
    this.aim.x = clamp(this.aim.x + dx * 28, 30, WIDTH - 30);
    this.aim.y = clamp(this.aim.y + dy * 28, 80, HEIGHT - 30);
  }

  action(x, y) {
    if (this.finished) return;
    if (this.actionCooldown > 0) return;
    this.actionCooldown = 0.18;
    this.aim.x = typeof x === "number" ? x : this.aim.x;
    this.aim.y = typeof y === "number" ? y : this.aim.y;
    let hitIndex = -1;
    let bestDistance = 50;
    this.birds.forEach((bird, index) => {
      const distance = Math.hypot(bird.x - this.aim.x, bird.y - this.aim.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        hitIndex = index;
      }
    });
    if (hitIndex >= 0) {
      const [bird] = this.birds.splice(hitIndex, 1);
      this.hits += 1;
      if (bird.rare) {
        this.rareHits += 1;
        this.score += 36;
        this.message = "金色候鸟被安全标记，这是一次稀有巡护记录。";
      } else {
        this.score += 18;
        this.message = "驱离成功，谷仓安全了一点。";
      }
    } else {
      this.misses += 1;
      this.score = Math.max(0, this.score - 2);
      this.message = "声波脉冲落空，鸟群换了个方向。";
    }
  }

  resultForFinish() {
    return { hits: this.hits, rareHits: this.rareHits, misses: this.misses };
  }

  timeout() {
    this.finish(this.resultForFinish());
  }

  render(ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#b8d4bd");
    sky.addColorStop(0.55, "#75a998");
    sky.addColorStop(1, "#436f5b");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "rgba(42, 78, 55, 0.35)";
    for (let row = 0; row < 4; row += 1) {
      ctx.beginPath();
      ctx.moveTo(0, 380 + row * 38);
      for (let x = 0; x <= WIDTH; x += 80) {
        ctx.quadraticCurveTo(x + 34, 352 + row * 38, x + 80, 380 + row * 38);
      }
      ctx.lineTo(WIDTH, HEIGHT);
      ctx.lineTo(0, HEIGHT);
      ctx.fill();
    }

    for (const bird of this.birds) {
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.fillStyle = bird.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 8, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-10, -3, 10, 4, -0.4 + Math.sin(bird.wing) * 0.3, 0, TAU);
      ctx.ellipse(10, -3, 10, 4, 0.4 - Math.sin(bird.wing) * 0.3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#d1a055";
      ctx.beginPath();
      ctx.moveTo(18, -1);
      ctx.lineTo(27, 2);
      ctx.lineTo(18, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = "#fff1b9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.aim.x, this.aim.y, 18, 0, TAU);
    ctx.moveTo(this.aim.x - 29, this.aim.y);
    ctx.lineTo(this.aim.x - 8, this.aim.y);
    ctx.moveTo(this.aim.x + 8, this.aim.y);
    ctx.lineTo(this.aim.x + 29, this.aim.y);
    ctx.moveTo(this.aim.x, this.aim.y - 29);
    ctx.lineTo(this.aim.x, this.aim.y - 8);
    ctx.moveTo(this.aim.x, this.aim.y + 8);
    ctx.lineTo(this.aim.x, this.aim.y + 29);
    ctx.stroke();
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "#e9f3c2";
    ctx.beginPath();
    ctx.arc(this.aim.x, this.aim.y, 42 + Math.sin(this.timeLeft * 4) * 4, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  drawHud(ctx) {
    super.drawHud(ctx);
    ctx.save();
    ctx.fillStyle = "rgba(255, 248, 221, 0.88)";
    roundedRect(ctx, 28, HEIGHT - 54, 420, 30, 10);
    ctx.fill();
    ctx.fillStyle = "#486453";
    ctx.font = "600 12px 'PingFang SC', sans-serif";
    ctx.fillText(`驱离 ${this.hits}  ·  稀有 ${this.rareHits}  ·  落空 ${this.misses}  ·  ${this.message}`, 42, HEIGHT - 34);
    ctx.restore();
  }

  renderResult(ctx) {
    this.drawResult(ctx, [`驱离斑翅雀：${this.hits} 只`, `稀有候鸟：${this.rareHits} 只 · 评分：${Math.round(this.score)}`]);
  }
}

export class BattleGame extends BaseMiniGame {
  constructor(rng = Math.random, options = {}) {
    super("battle", rng);
    this.weapon = options.weapon === "shotgun" ? "shotgun" : "huntingKnife";
    this.partner = options.partner || null;
    this.enemies = [];
    this.spawnTimer = 0.4;
    this.attackCooldown = 0;
    this.defeated = 0;
    this.misses = 0;
    this.damage = 0;
    this.baseHealth = 100;
    this.wave = 1;
    this.aim = { x: WIDTH / 2, y: 330 };
    this.message = this.weapon === "shotgun"
      ? "猎枪已上膛，优先守住谷仓入口。"
      : "猎刀在手，靠近野兽后快速挥砍。";
  }

  spawnBeast() {
    const side = this.rng() > 0.5 ? -1 : 1;
    const kind = this.rng() > 0.45 ? "boar" : "wolf";
    const elite = this.rng() < 0.16;
    this.enemies.push({
      id: `${kind}-${this.wave}-${this.enemies.length}`,
      kind,
      elite,
      x: side < 0 ? -38 : WIDTH + 38,
      y: 225 + this.rng() * 185,
      speed: (kind === "boar" ? 36 : 45) + this.rng() * 20 + (elite ? 9 : 0),
      hp: (kind === "boar" ? 30 : 24) + (elite ? 20 : 0),
      maxHp: (kind === "boar" ? 30 : 24) + (elite ? 20 : 0),
      phase: this.rng() * TAU,
      hitFlash: 0,
    });
  }

  tick(dt) {
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.spawnTimer -= dt;
    const aliveLimit = Math.min(8, 3 + Math.floor(this.wave / 2));
    if (this.spawnTimer <= 0 && this.enemies.length < aliveLimit && this.defeated < 12) {
      this.spawnBeast();
      this.spawnTimer = Math.max(0.38, 1.1 - this.wave * 0.04) + this.rng() * 0.5;
    }
    for (const enemy of this.enemies) {
      const dx = WIDTH / 2 - enemy.x;
      const dy = 375 - enemy.y;
      const distance = Math.hypot(dx, dy) || 1;
      enemy.x += (dx / distance) * enemy.speed * dt;
      enemy.y += (dy / distance) * enemy.speed * dt + Math.sin(this.timeLeft * 2 + enemy.phase) * 0.18;
      enemy.phase += dt * 4;
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      if (distance < 58) {
        this.baseHealth = Math.max(0, this.baseHealth - (enemy.elite ? 13 : 8));
        this.damage += enemy.elite ? 13 : 8;
        enemy.hp = 0;
        this.message = "野兽撞上谷仓围栏，赶快补上缺口！";
      }
    }
    this.enemies = this.enemies.filter((enemy) => enemy.hp > 0);
    if (this.partner && this.enemies.length && this.rng() < dt * 0.7) {
      const target = this.enemies[Math.floor(this.rng() * this.enemies.length)];
      target.hp -= 16;
      target.hitFlash = 0.16;
      this.message = `${this.partner}拦住了一只野兽。`;
      if (target.hp <= 0) {
        this.defeated += 1;
        this.score += 12;
      }
    }
    this.wave = Math.max(this.wave, 1 + Math.floor(this.defeated / 3));
    if (this.baseHealth <= 0 || this.defeated >= 12) this.finish(this.resultForFinish());
  }

  move(dx, dy = 0) {
    this.aim.x = clamp(this.aim.x + (dx || 0) * 28, 35, WIDTH - 35);
    this.aim.y = clamp(this.aim.y + (dy || 0) * 28, 110, HEIGHT - 45);
  }

  action(x, y) {
    if (this.finished || this.attackCooldown > 0) return;
    this.attackCooldown = this.weapon === "shotgun" ? 0.48 : 0.24;
    if (typeof x === "number") this.aim.x = clamp(x, 35, WIDTH - 35);
    if (typeof y === "number") this.aim.y = clamp(y, 110, HEIGHT - 45);
    const reach = this.weapon === "shotgun" ? 132 : 78;
    let targetIndex = -1;
    let closest = reach;
    this.enemies.forEach((enemy, index) => {
      const distance = Math.hypot(enemy.x - this.aim.x, enemy.y - this.aim.y);
      if (distance < closest) {
        closest = distance;
        targetIndex = index;
      }
    });
    if (targetIndex < 0) {
      this.misses += 1;
      this.score = Math.max(0, this.score - 1);
      this.message = this.weapon === "shotgun" ? "枪声擦过树梢，野兽还在逼近。" : "刀锋落空，先拉开半步再挥刀。";
      return;
    }
    const target = this.enemies[targetIndex];
    const damage = this.weapon === "shotgun" ? 36 : 18;
    target.hp -= damage;
    target.hitFlash = 0.18;
    this.score += this.weapon === "shotgun" ? 8 : 6;
    if (target.hp <= 0) {
      this.enemies.splice(targetIndex, 1);
      this.defeated += 1;
      this.score += target.elite ? 24 : 14;
      this.message = target.elite ? "精英野兽被击退，围栏暂时安全。" : "野兽倒退回林线，谷仓守住了。";
    } else {
      this.message = this.weapon === "shotgun" ? "命中！继续守住谷仓入口。" : "刀锋命中，别让它靠近牲畜区。";
    }
  }

  resultForFinish() {
    return {
      defeated: this.defeated,
      hits: this.defeated,
      misses: this.misses,
      damage: this.damage,
      baseHealth: this.baseHealth,
      waves: this.wave,
      weapon: this.weapon,
      partner: this.partner,
    };
  }

  timeout() {
    this.finish(this.resultForFinish());
  }

  render(ctx) {
    const dusk = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    dusk.addColorStop(0, "#263d42");
    dusk.addColorStop(0.5, "#53634d");
    dusk.addColorStop(1, "#1d302c");
    ctx.fillStyle = dusk;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "rgba(20, 42, 32, 0.55)";
    for (let tree = 0; tree < 13; tree += 1) {
      const x = 28 + tree * 82;
      const y = 150 + (tree % 3) * 24;
      ctx.fillRect(x - 4, y, 8, 250);
      ctx.beginPath();
      ctx.arc(x, y - 18, 34 + (tree % 3) * 7, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#6c5138";
    roundedRect(ctx, 408, 275, 145, 142, 14);
    ctx.fill();
    ctx.fillStyle = "#b36d47";
    ctx.beginPath();
    ctx.moveTo(390, 286);
    ctx.lineTo(480, 218);
    ctx.lineTo(571, 286);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e8c77c";
    ctx.fillRect(460, 335, 40, 82);
    ctx.fillStyle = "rgba(227, 201, 126, 0.35)";
    ctx.fillRect(442, 310, 20, 22);
    ctx.fillRect(508, 310, 20, 22);
    ctx.strokeStyle = "#d9ba73";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(120, 430);
    ctx.lineTo(838, 430);
    ctx.stroke();
    for (let post = 0; post < 10; post += 1) {
      ctx.fillStyle = "#a67b4d";
      ctx.fillRect(120 + post * 80, 405, 8, 44);
    }
    for (const enemy of this.enemies) {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      const scale = enemy.elite ? 1.2 : 1;
      ctx.scale(scale, scale);
      ctx.fillStyle = enemy.hitFlash > 0 ? "#f6e29b" : enemy.kind === "boar" ? "#7b5749" : "#4d5f58";
      ctx.beginPath();
      ctx.ellipse(0, 0, 25, 14, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(22, -5, 11, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#e7c17f";
      ctx.fillRect(29, -8, 8, 3);
      ctx.fillRect(29, 1, 8, 3);
      ctx.fillStyle = "#f3e1ae";
      ctx.fillRect(22, -8, 3, 3);
      ctx.fillStyle = "rgba(25, 35, 28, 0.72)";
      ctx.fillRect(-22, -25, 45, 5);
      ctx.fillStyle = "#db7460";
      ctx.fillRect(-22, -25, 45 * Math.max(0, enemy.hp / enemy.maxHp), 5);
      ctx.restore();
    }
    ctx.save();
    ctx.strokeStyle = this.weapon === "shotgun" ? "#f3d58a" : "#d7e2c3";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.aim.x, this.aim.y, this.weapon === "shotgun" ? 25 : 16, 0, TAU);
    ctx.moveTo(this.aim.x - 34, this.aim.y);
    ctx.lineTo(this.aim.x + 34, this.aim.y);
    ctx.moveTo(this.aim.x, this.aim.y - 34);
    ctx.lineTo(this.aim.x, this.aim.y + 34);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "rgba(14, 31, 26, 0.8)";
    roundedRect(ctx, 28, HEIGHT - 62, 540, 37, 11);
    ctx.fill();
    ctx.fillStyle = "#f7e9bd";
    ctx.font = "600 13px 'PingFang SC', sans-serif";
    ctx.fillText(`${this.message} · ${this.weapon === "shotgun" ? "猎枪" : "猎刀"}${this.partner ? ` · 副手 ${this.partner}` : ""}`, 44, HEIGHT - 38);
    ctx.fillStyle = "rgba(15, 28, 25, 0.8)";
    roundedRect(ctx, 660, HEIGHT - 60, 270, 25, 8);
    ctx.fill();
    ctx.fillStyle = "#d86c5e";
    ctx.fillRect(670, HEIGHT - 52, 250 * this.baseHealth / 100, 9);
    ctx.fillStyle = "#fff0cb";
    ctx.font = "700 11px 'PingFang SC', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`谷仓防线 ${Math.round(this.baseHealth)}% · 击退 ${this.defeated}`, 920, HEIGHT - 38);
    ctx.textAlign = "left";
  }

  renderResult(ctx) {
    this.drawResult(ctx, [
      this.baseHealth > 0 ? "野兽入侵已被击退，牧场守住了。" : "围栏被冲开了一段，需要尽快修复。",
      `击退 ${this.defeated} 只 · 防线 ${Math.round(this.baseHealth)}% · 评分 ${Math.round(this.score)}`,
    ]);
  }
}

export class FishingGame extends BaseMiniGame {
  constructor(rng = Math.random) {
    super("fishing", rng);
    this.attempt = 0;
    this.catches = 0;
    this.perfects = 0;
    this.misses = 0;
    this.phase = "wait";
    this.timer = 1.4 + this.rng() * 1.4;
    this.marker = 0;
    this.markerDirection = 1;
    this.zone = 0.34 + this.rng() * 0.26;
    this.message = "看浮漂，别急着拉竿。";
  }

  nextAttempt() {
    this.attempt += 1;
    if (this.attempt >= 3) {
      this.finish({ catches: this.catches, perfects: this.perfects, misses: this.misses });
      return;
    }
    this.phase = "wait";
    this.timer = 1.1 + this.rng() * 1.8;
    this.zone = 0.3 + this.rng() * 0.36;
    this.message = "浮漂安静下来了。";
  }

  tick(dt) {
    if (this.phase === "wait") {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.phase = "bite";
        this.timer = 1.5;
        this.message = "咬钩！现在收线！";
      }
    } else if (this.phase === "bite") {
      this.marker += dt * 2.2 * this.markerDirection;
      if (this.marker >= 1) {
        this.marker = 1;
        this.markerDirection = -1;
      } else if (this.marker <= 0) {
        this.marker = 0;
        this.markerDirection = 1;
      }
      this.timer -= dt;
      if (this.timer <= 0) {
        this.misses += 1;
        this.message = "鱼跑掉了。下一次把握时机。";
        this.phase = "pause";
        this.timer = 0.6;
      }
    } else if (this.phase === "pause") {
      this.timer -= dt;
      if (this.timer <= 0) this.nextAttempt();
    }
  }

  action() {
    if (this.finished) return;
    if (this.phase === "wait") {
      this.misses += 1;
      this.message = "拉得太早，水面只留下一圈波纹。";
      this.phase = "pause";
      this.timer = 0.55;
      return;
    }
    if (this.phase !== "bite") return;
    const perfect = Math.abs(this.marker - 0.5) < 0.11;
    const inZone = Math.abs(this.marker - 0.5) < 0.5 - Math.abs(this.zone - 0.5);
    if (inZone) {
      this.catches += 1;
      this.perfects += perfect ? 1 : 0;
      this.score += perfect ? 32 : 20;
      this.message = perfect ? "完美收线，银鱼在月光里翻身！" : "收线成功，带上来一条潮汐银鱼。";
    } else {
      this.misses += 1;
      this.message = "收线偏了，鱼从钩边溜走。";
    }
    this.phase = "pause";
    this.timer = 0.6;
  }

  timeout() {
    this.finish({ catches: this.catches, perfects: this.perfects, misses: this.misses });
  }

  render(ctx) {
    const water = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    water.addColorStop(0, "#9cc9b4");
    water.addColorStop(0.55, "#4e9a9b");
    water.addColorStop(1, "#275e6e");
    ctx.fillStyle = water;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = "rgba(225, 246, 219, 0.36)";
    ctx.lineWidth = 2;
    for (let index = 0; index < 9; index += 1) {
      ctx.beginPath();
      ctx.arc(WIDTH / 2, 320, 60 + index * 38 + Math.sin(index + this.timeLeft) * 3, 0, TAU);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(28, 76, 78, 0.62)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 130);
    ctx.lineTo(WIDTH / 2, 300);
    ctx.stroke();
    ctx.fillStyle = this.phase === "bite" ? "#f4d07a" : "#dbe7b6";
    ctx.beginPath();
    ctx.arc(WIDTH / 2, 304 + Math.sin(this.timeLeft * 3) * 4, 10, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(10, 32, 38, 0.68)";
    roundedRect(ctx, 260, 388, 440, 58, 15);
    ctx.fill();
    ctx.fillStyle = "#f9eed2";
    ctx.font = "600 17px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.message, WIDTH / 2, 424);
    if (this.phase === "bite") {
      const markerX = 310 + this.marker * 340;
      ctx.fillStyle = "rgba(255, 247, 214, 0.27)";
      ctx.fillRect(310, 465, 340, 18);
      ctx.fillStyle = "rgba(148, 221, 139, 0.82)";
      ctx.fillRect(310 + (this.zone * 340), 465, (0.64 - Math.abs(this.zone - 0.5) * 2) * 340, 18);
      ctx.fillStyle = "#f5cf78";
      ctx.beginPath();
      ctx.arc(markerX, 474, 7, 0, TAU);
      ctx.fill();
    }
  }

  drawHud(ctx) {
    super.drawHud(ctx);
    ctx.save();
    ctx.fillStyle = "rgba(255, 248, 221, 0.9)";
    roundedRect(ctx, 28, HEIGHT - 54, 340, 30, 10);
    ctx.fill();
    ctx.fillStyle = "#315e5b";
    ctx.font = "600 12px 'PingFang SC', sans-serif";
    ctx.fillText(`第 ${Math.min(this.attempt + 1, 3)} / 3 次 · 上钩 ${this.catches} · 完美 ${this.perfects}`, 42, HEIGHT - 34);
    ctx.restore();
  }

  renderResult(ctx) {
    this.drawResult(ctx, [`钓到潮汐银鱼：${this.catches} 条`, `完美收线：${this.perfects} 次`]);
  }
}

export class MiningGame extends BaseMiniGame {
  constructor(rng = Math.random) {
    super("mining", rng);
    this.angle = -0.9;
    this.direction = 1;
    this.phase = "swing";
    this.hookLength = 0;
    this.attempts = 3;
    this.haulUnits = 0;
    this.collapsed = false;
    this.message = "看准金脉，按下放钩。";
    this.items = [
      { x: 335, y: 245, value: 2, type: "ore" },
      { x: 410, y: 325, value: 3, type: "ore" },
      { x: 520, y: 270, value: 2, type: "ore" },
      { x: 605, y: 360, value: 4, type: "silver" },
      { x: 700, y: 300, value: 5, type: "gold" },
      { x: 280, y: 390, value: 2, type: "ore" },
      { x: 480, y: 440, value: 4, type: "silver" },
      { x: 770, y: 390, value: 6, type: "gold" },
      { x: 390, y: 180, value: 1, type: "ore" },
      { x: 610, y: 220, value: 2, type: "ore" },
      { x: 630, y: 455, value: 8, type: "gold", risk: true },
      { x: 330, y: 460, value: 3, type: "silver" },
    ];
  }

  tick(dt) {
    if (this.phase === "swing") {
      this.angle += dt * 0.9 * this.direction;
      if (this.angle > 0.9) {
        this.angle = 0.9;
        this.direction = -1;
      } else if (this.angle < -0.9) {
        this.angle = -0.9;
        this.direction = 1;
      }
      return;
    }
    if (this.phase === "out") {
      this.hookLength += dt * 245;
      const grabbed = this.findGrabbedItem();
      if (grabbed) {
        if (grabbed.risk) {
          this.collapsed = true;
          this.message = "抓到不稳定矿囊，吊钩被迫收回。";
          this.items = this.items.filter((item) => item !== grabbed);
          this.phase = "retract";
        } else {
          this.haulUnits += grabbed.value;
          this.score += grabbed.value * 7;
          this.items = this.items.filter((item) => item !== grabbed);
          this.message = grabbed.value >= 5 ? "抓到富矿脉，吊钩沉得厉害！" : "矿铜上来了。";
          this.phase = "retract";
        }
      } else if (this.hookLength >= 380) {
        this.message = "这一钩落空了。";
        this.phase = "retract";
      }
    } else if (this.phase === "retract") {
      this.hookLength -= dt * 310;
      if (this.hookLength <= 0) {
        this.hookLength = 0;
        this.attempts -= 1;
        if (this.attempts <= 0 || this.items.every((item) => item.type === "ore" && item.value < 1)) {
          this.finish({ haulUnits: this.haulUnits, collapsed: this.collapsed });
          return;
        }
        this.phase = "swing";
        this.message = "调整角度，再来一钩。";
      }
    }
  }

  findGrabbedItem() {
    const origin = { x: WIDTH / 2, y: 120 };
    const x = origin.x + Math.sin(this.angle) * this.hookLength;
    const y = origin.y + Math.cos(this.angle) * this.hookLength;
    return this.items.find((item) => Math.hypot(item.x - x, item.y - y) < 22) || null;
  }

  action() {
    if (this.finished) return;
    if (this.phase === "swing") {
      this.phase = "out";
      this.hookLength = 0;
      this.message = "吊钩下潜中…";
    }
  }

  timeout() {
    this.finish({ haulUnits: this.haulUnits, collapsed: this.collapsed });
  }

  render(ctx) {
    const rock = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    rock.addColorStop(0, "#9b8b6c");
    rock.addColorStop(0.38, "#625b4b");
    rock.addColorStop(1, "#282d2a");
    ctx.fillStyle = rock;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "rgba(245, 221, 157, 0.1)";
    for (let index = 0; index < 9; index += 1) {
      ctx.beginPath();
      ctx.ellipse(80 + index * 107, 250 + (index % 3) * 60, 64, 18, index * 0.5, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = "#3b352b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 120);
    ctx.lineTo(WIDTH / 2 + Math.sin(this.angle) * this.hookLength, 120 + Math.cos(this.angle) * this.hookLength);
    ctx.stroke();
    for (const item of this.items) {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.fillStyle = item.type === "gold" ? "#f0c45e" : item.type === "silver" ? "#d2ddd0" : "#c58a57";
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(9, 0);
      ctx.lineTo(0, 11);
      ctx.lineTo(-9, 0);
      ctx.closePath();
      ctx.fill();
      if (item.risk) {
        ctx.strokeStyle = "#d56c5f";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.fillStyle = "#584b35";
    ctx.beginPath();
    ctx.arc(WIDTH / 2 + Math.sin(this.angle) * this.hookLength, 120 + Math.cos(this.angle) * this.hookLength, 8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(12, 29, 25, 0.78)";
    roundedRect(ctx, 260, 452, 440, 50, 14);
    ctx.fill();
    ctx.fillStyle = "#f9eed2";
    ctx.font = "600 15px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.message, WIDTH / 2, 482);
    ctx.fillStyle = "rgba(255, 249, 225, 0.8)";
    ctx.font = "600 11px 'PingFang SC', sans-serif";
    ctx.fillText(`剩余机会 ${this.attempts} · 已带回 ${this.haulUnits} 份矿铜`, WIDTH / 2, 504);
  }

  drawHud(ctx) {
    super.drawHud(ctx);
  }

  renderResult(ctx) {
    this.drawResult(ctx, [`带回矿铜：${this.haulUnits} 份`, this.collapsed ? "发生过一次矿道坍塌" : "矿道保持稳定"]);
  }
}

export class DeliveryGame extends BaseMiniGame {
  constructor(rng = Math.random, contract = null) {
    super("delivery", rng);
    this.contract = contract;
    this.distance = 0;
    this.lane = 1;
    this.collisions = 0;
    this.progress = 0;
    this.message = "把货送到港口，别撞上路障。";
    this.obstacles = [
      { at: 22, lane: 0 },
      { at: 36, lane: 2 },
      { at: 50, lane: 1 },
      { at: 66, lane: 0 },
      { at: 78, lane: 2 },
    ];
  }

  tick(dt) {
    const speed = 8.3;
    this.distance = Math.min(100, this.distance + speed * dt);
    this.progress = this.distance / 100;
    for (const obstacle of this.obstacles) {
      if (!obstacle.hit && Math.abs(this.distance - obstacle.at) < 1.2 && this.lane === obstacle.lane) {
        obstacle.hit = true;
        this.collisions += 1;
        this.timeLeft = Math.max(0, this.timeLeft - 2.6);
        this.message = "撞上路障，货物晃了一下，损失 2.6 秒。";
      }
    }
    if (this.distance >= 100) {
      this.finish({ arrived: true, collisions: this.collisions, distance: this.distance });
    }
  }

  move(direction) {
    if (this.finished) return;
    this.lane = clamp(this.lane + direction, 0, 2);
  }

  action(x) {
    if (this.finished) return;
    if (typeof x === "number") this.move(x < WIDTH / 2 ? -1 : 1);
  }

  timeout() {
    this.finish({ arrived: this.distance >= 86, collisions: this.collisions, distance: this.distance });
  }

  render(ctx) {
    const dusk = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    dusk.addColorStop(0, "#6d8f95");
    dusk.addColorStop(0.45, "#bc9064");
    dusk.addColorStop(1, "#343e3b");
    ctx.fillStyle = dusk;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#384f47";
    for (let index = 0; index < 8; index += 1) {
      ctx.fillRect(40 + index * 125, 260, 18, 230);
      ctx.beginPath();
      ctx.arc(49 + index * 125, 260, 40, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#5f5042";
    ctx.beginPath();
    ctx.moveTo(220, HEIGHT);
    ctx.lineTo(354, 116);
    ctx.lineTo(606, 116);
    ctx.lineTo(760, HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 220, 146, 0.55)";
    ctx.lineWidth = 3;
    for (let index = 0; index < 9; index += 1) {
      const y = 140 + index * 48;
      ctx.beginPath();
      ctx.moveTo(480 - (y - 116) * 0.36, y);
      ctx.lineTo(480 + (y - 116) * 0.36, y);
      ctx.stroke();
    }
    const laneX = { 0: 355, 1: 480, 2: 605 }[this.lane];
    for (const obstacle of this.obstacles) {
      if (obstacle.hit) continue;
      const relative = obstacle.at - this.distance;
      if (relative < -8 || relative > 34) continue;
      const y = 480 - relative * 14;
      const x = { 0: 355, 1: 480, 2: 605 }[obstacle.lane];
      ctx.fillStyle = "#b35c4c";
      roundedRect(ctx, x - 26, y - 16, 52, 24, 6);
      ctx.fill();
      ctx.fillStyle = "#f1cf75";
      ctx.fillRect(x - 18, y - 10, 12, 4);
    }
    ctx.save();
    ctx.translate(laneX, 428);
    ctx.fillStyle = "#dfb15f";
    roundedRect(ctx, -31, -32, 62, 43, 8);
    ctx.fill();
    ctx.fillStyle = "#784d32";
    ctx.fillRect(-24, -47, 48, 18);
    ctx.fillStyle = "#213c38";
    ctx.beginPath();
    ctx.arc(-20, 13, 10, 0, TAU);
    ctx.arc(20, 13, 10, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "rgba(12, 29, 25, 0.78)";
    roundedRect(ctx, 270, 452, 420, 48, 14);
    ctx.fill();
    ctx.fillStyle = "#f9eed2";
    ctx.font = "600 14px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.message, WIDTH / 2, 481);
    ctx.fillStyle = "#f2ca70";
    ctx.fillRect(330, 503, 300, 8);
    ctx.fillStyle = "#9ed29a";
    ctx.fillRect(330, 503, 300 * this.progress, 8);
  }

  renderResult(ctx) {
    this.drawResult(ctx, [
      this.result?.arrived ? "订单已送到港口。" : "运货超时，订单还在等待。",
      `路程 ${Math.round(this.result?.distance || this.distance)}% · 碰撞 ${this.collisions} 次`,
    ]);
  }
}

export function createMinigame(type, options = {}) {
  const rng = options.rng || createRng(options.seed || Date.now());
  if (type === "hunt") return new HuntGame(rng);
  if (type === "battle") return new BattleGame(rng, options);
  if (type === "fishing") return new FishingGame(rng);
  if (type === "mining") return new MiningGame(rng);
  if (type === "delivery") return new DeliveryGame(rng, options.contract || null);
  return null;
}

export { WIDTH as MINIGAME_WIDTH, HEIGHT as MINIGAME_HEIGHT };
