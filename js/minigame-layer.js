import { createMinigame, MINIGAME_HEIGHT, MINIGAME_WIDTH } from "./minigames.js";

export class MinigameLayer {
  constructor({ layer, canvas, closeButton, announcement, audio = null }) {
    this.layer = layer;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.closeButton = closeButton;
    this.announcement = announcement;
    this.audio = audio;
    this.active = false;
    this.game = null;
    this.resultTimer = 0;
    this.completed = false;
    this.onComplete = null;
    this.onAbort = null;
    this.bindEvents();
  }

  bindEvents() {
    this.closeButton?.addEventListener("click", () => {
      if (this.game?.finished) this.completeNow();
      else this.abort();
    });
    this.canvas?.addEventListener("pointerdown", (event) => {
      if (!this.active) return;
      event.preventDefault();
      if (this.game?.finished) {
        this.completeNow();
        return;
      }
      const rect = this.canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * MINIGAME_WIDTH;
      const y = ((event.clientY - rect.top) / rect.height) * MINIGAME_HEIGHT;
      if (this.game?.type === "hunt") {
        this.game.action(x, y);
      } else if (this.game?.type === "delivery") {
        this.game.action(x);
      } else {
        this.game?.action();
      }
    });
    this.canvas?.addEventListener("pointermove", (event) => {
      if (!this.active || this.game?.type !== "hunt" || this.game.finished) return;
      const rect = this.canvas.getBoundingClientRect();
      this.game.aim.x = ((event.clientX - rect.left) / rect.width) * MINIGAME_WIDTH;
      this.game.aim.y = ((event.clientY - rect.top) / rect.height) * MINIGAME_HEIGHT;
    });
  }

  start({ type, contract = null, onComplete, onAbort }) {
    if (this.active) return false;
    this.active = true;
    this.completed = false;
    this.resultTimer = 0;
    this.onComplete = onComplete;
    this.onAbort = onAbort;
    this.game = createMinigame(type, { contract, seed: Date.now() + Math.floor(Math.random() * 1000) });
    if (!this.game) {
      this.active = false;
      return false;
    }
    this.layer.hidden = false;
    document.body.classList.add("minigame-active");
    this.announcement.textContent = `${this.game.def.title}。${this.game.def.action}`;
    this.closeButton?.focus({ preventScroll: true });
    if (this.audio) this.audio.unlock?.();
    return true;
  }

  update(dt) {
    if (!this.active || !this.game) return;
    this.game.update(dt);
    if (this.game.finished) {
      this.resultTimer += dt;
      if (this.resultTimer >= 2.2) this.completeNow();
    }
    this.render();
  }

  render() {
    if (!this.active || !this.game) return;
    this.game.drawFrame(this.ctx);
    if (this.game.finished) this.game.renderResult(this.ctx);
  }

  handleKeyDown(event) {
    if (!this.active) return false;
    const key = event.key.toLowerCase();
    if (key === "escape") {
      event.preventDefault();
      if (this.game.finished) this.completeNow();
      else this.abort();
      return true;
    }
    if (this.game.finished) {
      if (key === " " || key === "enter" || key === "e") {
        event.preventDefault();
        this.completeNow();
        return true;
      }
      return true;
    }
    if (key === " " || key === "enter" || key === "e") {
      event.preventDefault();
      this.game.action();
      return true;
    }
    if (key === "arrowleft" || key === "a") {
      event.preventDefault();
      this.game.move?.(-1);
      return true;
    }
    if (key === "arrowright" || key === "d") {
      event.preventDefault();
      this.game.move?.(1);
      return true;
    }
    if (key === "arrowup" || key === "w") {
      event.preventDefault();
      this.game.move?.(0, -1);
      return true;
    }
    if (key === "arrowdown" || key === "s") {
      event.preventDefault();
      this.game.move?.(0, 1);
      return true;
    }
    return true;
  }

  completeNow() {
    if (!this.active || this.completed || !this.game?.finished) return;
    this.completed = true;
    const result = this.game.result;
    const callback = this.onComplete;
    this.hide();
    callback?.(result);
  }

  abort() {
    if (!this.active) return;
    const callback = this.onAbort;
    this.hide();
    callback?.();
  }

  hide() {
    this.active = false;
    this.game = null;
    this.layer.hidden = true;
    document.body.classList.remove("minigame-active");
    this.announcement.textContent = "";
  }
}
