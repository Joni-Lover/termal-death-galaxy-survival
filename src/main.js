import { WORLD_HEIGHT, WORLD_WIDTH } from "./core/constants.js";
import { createState } from "./core/state.js";
import { render } from "./render/renderer.js";
import { bindInput } from "./systems/input.js";
import { updateScene } from "./systems/simulation.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas?.getContext("2d");

if (!canvas || !ctx) {
  throw new Error("Canvas setup failed");
}

canvas.width = WORLD_WIDTH;
canvas.height = WORLD_HEIGHT;

const state = createState();

function toggleFullscreen(target) {
  if (!document.fullscreenElement) {
    target.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function resizeCanvas() {
  const ratio = WORLD_WIDTH / WORLD_HEIGHT;
  const maxW = window.innerWidth * 0.96;
  const maxH = window.innerHeight * 0.96;
  let drawW = maxW;
  let drawH = drawW / ratio;
  if (drawH > maxH) {
    drawH = maxH;
    drawW = drawH * ratio;
  }
  canvas.style.width = `${Math.floor(drawW)}px`;
  canvas.style.height = `${Math.floor(drawH)}px`;
}

bindInput(state, canvas, toggleFullscreen);
window.addEventListener("resize", resizeCanvas);
document.addEventListener("fullscreenchange", resizeCanvas);
resizeCanvas();

function serializeForText(stateRef) {
  return JSON.stringify({
    coordinateSystem: {
      origin: "top-left",
      xDirection: "right",
      yDirection: "down",
      units: "canvas pixels",
      canvasWidth: WORLD_WIDTH,
      canvasHeight: WORLD_HEIGHT,
      cameraCenteredOnPlayer: true,
    },
    mode: stateRef.mode,
    difficulty: stateRef.selectedDifficulty,
    score: Math.floor(stateRef.score),
    elapsed: Number(stateRef.elapsed.toFixed(2)),
    showHints: stateRef.showHints,
    uiCompact: stateRef.uiCompact,
    player: {
      x: Number(stateRef.player.x.toFixed(1)),
      y: Number(stateRef.player.y.toFixed(1)),
      vx: Number(stateRef.player.vx.toFixed(2)),
      vy: Number(stateRef.player.vy.toFixed(2)),
      hull: Number(stateRef.player.hull.toFixed(2)),
      maxHull: stateRef.player.maxHull,
      energy: Number(stateRef.player.energy.toFixed(2)),
      maxEnergy: stateRef.player.maxEnergy,
      cargoUsed: stateRef.player.cargoUsed,
      cargoCapacity: stateRef.player.cargoCapacity,
      nearOutpost: stateRef.player.nearOutpost,
      inSafeZone: stateRef.player.inSafeZone,
      boosting: stateRef.player.boosting,
      pulseCooldown: Number(stateRef.player.pulseCooldown.toFixed(2)),
      cargo: stateRef.player.cargo,
      facingRad: Number(stateRef.player.facing.toFixed(2)),
    },
    outpost: {
      energy: Number(stateRef.outpost.energy.toFixed(2)),
      stockpile: stateRef.outpost.stockpile,
      distanceFromPlayer: Number(
        Math.hypot(stateRef.player.x - stateRef.outpost.x, stateRef.player.y - stateRef.outpost.y).toFixed(2),
      ),
    },
    entities: {
      resourceNodes: stateRef.resources.slice(0, 20).map((n) => ({
        kind: n.kind,
        x: Number(n.x.toFixed(1)),
        y: Number(n.y.toFixed(1)),
        radius: Number(n.radius.toFixed(1)),
      })),
      hazards: stateRef.hazards.slice(0, 12).map((h) => ({
        kind: h.kind,
        x: Number(h.x.toFixed(1)),
        y: Number(h.y.toFixed(1)),
        radius: Number(h.radius.toFixed(1)),
        influence: Number(h.influence.toFixed(1)),
      })),
      enemies: stateRef.enemies.slice(0, 12).map((e) => ({
        x: Number(e.x.toFixed(1)),
        y: Number(e.y.toFixed(1)),
        hp: e.hp,
      })),
      bullets: stateRef.bullets.slice(0, 12).map((b) => ({
        x: Number(b.x.toFixed(1)),
        y: Number(b.y.toFixed(1)),
      })),
    },
    upgrades: stateRef.upgrades,
    statusMessage: stateRef.message,
    gameOverReason: stateRef.gameOverReason,
  });
}

window.render_game_to_text = () => serializeForText(state);

window.advanceTime = async (ms) => {
  const frameMs = 1000 / 60;
  const steps = Math.max(1, Math.round(ms / frameMs));
  const dt = ms / steps / 1000;
  for (let i = 0; i < steps; i += 1) {
    updateScene(state, dt);
  }
  render(ctx, state);
};

let last = performance.now();
function frame(ts) {
  const dt = Math.min(0.033, (ts - last) / 1000);
  last = ts;
  updateScene(state, dt);
  render(ctx, state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
