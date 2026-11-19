import { RanchPhaserFarmScene } from "./phaser-farm-scene.js";

export function startPhaserBridge() {
  if (window.__RANCH_PHASER__) return window.__RANCH_PHASER__;
  if (!window.Phaser || !window.__RANCH_DEBUG__) throw new Error("Phaser bridge requires Phaser and the ranch debug state");
  const stage = document.getElementById("gameStage");
  const canvas = document.createElement("canvas");
  canvas.id = "phaserCanvas";
  stage.appendChild(canvas);
  window.__RANCH_PHASER_INPUT__ = true;
  window.__RANCH_PHASER_ACTION__ = () => window.__RANCH_DEBUG__.actions.performAction?.();
  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    renderType: Phaser.CANVAS,
    width: 1280,
    height: 720,
    parent: stage,
    canvas,
    transparent: false,
    backgroundColor: "#88a762",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [RanchPhaserFarmScene],
  });
  window.__RANCH_PHASER__ = game;
  document.body.classList.add("phaser-runtime");
  return game;
}
