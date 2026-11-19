import { CROPS, INTERACTIONS, TOOLS, WORLD } from "./data.js";

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

export class WorldRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.ctx.imageSmoothingEnabled = true;
    this.time = 0;
  }

  render(state, runtime = {}, delta = 0.016) {
    this.time += delta;
    const time = this.time;
    const ctx = this.ctx;
    const { player } = state;

    ctx.clearRect(0, 0, WORLD.width, WORLD.height);
    this.drawGround(ctx, state, time);
    this.drawPaths(ctx, time);
    this.drawCanal(ctx, state, time);
    this.drawField(ctx, state, time, runtime);
    this.drawPasture(ctx, state, time);
    this.drawVillageBase(ctx, time);
    this.drawHouse(ctx, state, time);
    this.drawAiShed(ctx, state, time);
    this.drawMarket(ctx, time);
    this.drawArchive(ctx, time);
    this.drawNoticeboard(ctx, time);
    this.drawShippingBin(ctx, time);
    this.drawCanalGate(ctx, state, time);
    this.drawStaticProps(ctx, time);

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
    this.drawForegroundFlora(ctx, time);
    this.drawFloatingAtmosphere(ctx, state, time);
    this.drawWeather(ctx, state, time);
    this.drawLighting(ctx, state, time);
    this.drawEffects(ctx, runtime, time, delta);
    this.drawDebugVignette(ctx);
  }

  drawGround(ctx, state, time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    gradient.addColorStop(0, "#89a96b");
    gradient.addColorStop(0.55, "#88a762");
    gradient.addColorStop(1, "#75985a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    ctx.save();
    ctx.globalAlpha = state.weather === "drought" ? 0.27 : 0.18;
    for (let row = 0; row < 13; row += 1) {
      for (let col = 0; col < 23; col += 1) {
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

    ctx.fillStyle = "#7a5a3d";
    roundedRect(ctx, x + 20, y + 155, 168, 57, 4);
    ctx.fill();
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
    ctx.fillText("三只牲畜", x + w - 97, y + 46);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#62472f";
    ctx.fillRect(734, 213, 32, 57);
    ctx.fillStyle = "#9a7449";
    ctx.fillRect(738, 217, 24, 49);
    ctx.fillStyle = "#4a3a27";
    ctx.fillRect(742, 224, 16, 29);
    ctx.fillStyle = "#d7bd80";
    ctx.font = "700 8px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("饲料", 750, 242);
    ctx.restore();
  }

  drawPastureAnimals(ctx, state, time, drawables) {
    const positions = {
      chicken: { x: 868, y: 218, scale: 0.86 },
      sheep: { x: 979, y: 246, scale: 0.9 },
      cow: { x: 1090, y: 225, scale: 1 },
    };
    for (let index = 0; index < state.animals.length; index += 1) {
      const animal = state.animals[index];
      const pos = positions[animal.id];
      if (!pos) continue;
      const wanderX = Math.sin(time * 0.38 + index * 2.1) * 11;
      const wanderY = Math.cos(time * 0.27 + index * 1.4) * 4;
      const x = pos.x + wanderX;
      const y = pos.y + wanderY;
      drawables.push({
        y,
        draw: () => {
          if (animal.id === "chicken") this.drawChicken(ctx, x, y, pos.scale, time);
          if (animal.id === "sheep") this.drawSheep(ctx, x, y, pos.scale, time);
          if (animal.id === "cow") this.drawCow(ctx, x, y, pos.scale, time);
          if (!animal.fed) this.drawFoodBubble(ctx, x, y - 62, time);
          if (animal.fed) this.drawHeart(ctx, x + 31, y - 58, time);
        },
      });
    }
  }

  drawChicken(ctx, x, y, scale, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
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
    ctx.lineTo(-7, 8);
    ctx.moveTo(5, 3);
    ctx.lineTo(6, 8);
    ctx.stroke();
    ctx.restore();
  }

  drawSheep(ctx, x, y, scale, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
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
    ctx.lineTo(-13, 7);
    ctx.moveTo(2, 1);
    ctx.lineTo(2, 7);
    ctx.stroke();
    ctx.restore();
  }

  drawCow(ctx, x, y, scale, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
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
    ctx.lineTo(-22, 8);
    ctx.moveTo(19, 0);
    ctx.lineTo(20, 8);
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
        } else {
          ctx.fillStyle = "#c65f57";
          for (let berry = 0; berry < 3; berry += 1) {
            ctx.beginPath();
            ctx.arc(-8 + berry * 8, -1 + (berry % 2) * 7, 4.2, 0, TAU);
            ctx.fill();
            ctx.fillStyle = "#f0dca9";
            ctx.fillRect(-8 + berry * 8 - 1, -1 + (berry % 2) * 7 - 1, 1.3, 1.3);
            ctx.fillStyle = "#c65f57";
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
      const x = 68 + hash01(flower * 9.7) * 1130;
      const y = 58 + hash01(flower * 13.1) * 592;
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
    ctx.fillText("林澈", 0, -76);
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
    const interaction = INTERACTIONS.find((entry) => entry.id === runtime.nearInteraction);
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

  drawForegroundFlora(ctx, time) {
    ctx.save();
    const bushes = [
      [12, 720, 0.9],
      [95, 717, 0.56],
      [1238, 694, 0.94],
      [1130, 715, 0.5],
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
      const x = ((particle * 79 + time * speed) % 1320) - 20;
      const y = 100 + ((particle * 53 + Math.sin(time * 0.3 + particle) * 22) % 530);
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
        const x = 140 + hash01(fly * 15.7) * 1010;
        const y = 360 + hash01(fly * 19.3) * 300;
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
        const x = ((drop * 131 + time * 120) % 1320) - 20;
        const y = ((drop * 83 + time * speed) % 780) - 30;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y + 16);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(206, 238, 235, 0.18)";
      for (let ring = 0; ring < 13; ring += 1) {
        const x = 120 + hash01(ring * 11) * 1040;
        const y = 390 + hash01(ring * 17) * 260;
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
        const x = ((mote * 127 + time * 12) % 1320) - 20;
        const y = 140 + ((mote * 71 + Math.sin(time * 0.5 + mote) * 28) % 520);
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
