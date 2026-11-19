export class RanchPhaserFarmScene extends Phaser.Scene {
  constructor() {
    super({ key: "RanchPhaserFarmScene" });
  }

  create() {
    this.map = this.add.graphics();
    this.player = this.add.graphics();
    this.portal = this.add.graphics();
    this.label = this.add.text(26, 26, "牧场 · Phaser 4.2.1", {
      fontFamily: "sans-serif",
      fontSize: "16px",
      color: "#f8efd4",
      backgroundColor: "#183c34cc",
      padding: { left: 10, right: 10, top: 7, bottom: 7 },
    });
    this.label.setScrollFactor(0);
    this.cameras.main.setBounds(0, 0, 1280, 720);
    this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E");
    this.held = new Set();
    this.onWindowKeyDown = (event) => {
      const key = event.key.toUpperCase();
      this.held.add(key);
      if (["W", "A", "S", "D", "ARROWUP", "ARROWDOWN", "ARROWLEFT", "ARROWRIGHT", " "].includes(key)) event.preventDefault();
      if (key === "E" || key === " ") window.__RANCH_PHASER_ACTION__?.();
    };
    this.onWindowKeyUp = (event) => this.held.delete(event.key.toUpperCase());
    window.addEventListener("keydown", this.onWindowKeyDown);
    window.addEventListener("keyup", this.onWindowKeyUp);
    this.events.once("shutdown", () => {
      window.removeEventListener("keydown", this.onWindowKeyDown);
      window.removeEventListener("keyup", this.onWindowKeyUp);
    });
    this.drawFarm();
  }

  update(_time, delta) {
    const state = window.__RANCH_DEBUG__?.getState?.();
    if (!state) return;
    const speed = 0.16 * delta;
    let dx = 0;
    let dy = 0;
    if (this.held.has("W") || this.held.has("ARROWUP")) dy -= speed;
    if (this.held.has("S") || this.held.has("ARROWDOWN")) dy += speed;
    if (this.held.has("A") || this.held.has("ARROWLEFT")) dx -= speed;
    if (this.held.has("D") || this.held.has("ARROWRIGHT")) dx += speed;
    if (dx || dy) {
      state.player.x = Math.max(76, Math.min(1204, state.player.x + dx));
      state.player.y = Math.max(86, Math.min(684, state.player.y + dy));
      state.player.facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
    }
    this.player.clear();
    this.player.fillStyle(0xe1b68d, 1);
    this.player.fillCircle(state.player.x, state.player.y - 22, 10);
    this.player.fillStyle(0x315a4e, 1);
    this.player.fillRoundedRect(state.player.x - 12, state.player.y - 15, 24, 28, 7);
    this.cameras.main.centerOn(state.player.x, state.player.y);
  }

  drawFarm() {
    this.map.clear();
    this.map.fillStyle(0x88a762, 1);
    this.map.fillRect(0, 0, 1280, 720);
    this.map.fillStyle(0xd9bd83, 1);
    this.map.fillRoundedRect(180, 100, 92, 520, 30);
    this.map.fillRoundedRect(220, 410, 700, 68, 28);
    this.map.fillStyle(0x315a4e, 0.18);
    this.map.fillRoundedRect(90, 50, 250, 175, 14);
    this.map.fillStyle(0x6b4933, 1);
    this.map.fillRect(402, 326, 392, 168);
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        this.map.fillStyle(0x8b6243, 1);
        this.map.fillRoundedRect(405 + col * 56, 329 + row * 56, 50, 50, 7);
      }
    }
    this.map.fillStyle(0x5d969d, 1);
    this.map.fillEllipse(1035, 620, 340, 140);
    this.portal.clear();
    this.portal.lineStyle(3, 0xffeeb1, 0.9);
    this.portal.strokeEllipse(652, 458, 56, 22);
    this.portal.strokeEllipse(824, 555, 56, 22);
    this.portal.fillStyle(0xfff1b5, 1);
    this.portal.fillCircle(652, 458, 4);
    this.portal.fillCircle(824, 555, 4);
  }
}
