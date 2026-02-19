import { DIFFICULTY_PROFILES } from "../config/difficultyProfiles.js";
import { createUpgradesState, getUpgradeEffects } from "../config/upgrades.js";
import { OUTPOST, PLAYER } from "./constants.js";

export function createState() {
  return {
    mode: "menu",
    time: 0,
    seed: 4201337,
    selectedDifficulty: "pilgrim",
    score: 0,
    elapsed: 0,
    message: "",
    showHints: true,
    uiCompact: true,
    keys: new Set(),
    justPressed: new Set(),
    chunks: new Set(),
    stars: makeStars(),
    upgrades: createUpgradesState(),
    mouse: {
      active: false,
      screenX: 0,
      screenY: 0,
      worldX: 0,
      worldY: 0,
    },
    player: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      facing: 0,
      hull: PLAYER.maxHull,
      energy: PLAYER.maxEnergy,
      maxHull: PLAYER.maxHull,
      maxEnergy: PLAYER.maxEnergy,
      cargoCapacity: PLAYER.cargoCapacity,
      fireCooldown: 0,
      pulseCooldown: 0,
      pulseFx: 0,
      boosting: false,
      nearOutpost: true,
      inSafeZone: true,
      cargoUsed: 0,
      cargo: { metal: 0, fuel: 0, crystal: 0, data: 0, entropyCore: 0 },
    },
    outpost: {
      x: OUTPOST.x,
      y: OUTPOST.y,
      energy: 250,
      stockpile: { metal: 28, fuel: 30, crystal: 12, data: 7, entropyCore: 0 },
    },
    bullets: [],
    enemies: [],
    resources: [],
    hazards: [],
    spawnEnemyIn: 2,
    gameOverReason: "",
  };
}

function makeStars() {
  const stars = [];
  for (let i = 0; i < 220; i += 1) {
    stars.push({
      x: (Math.random() - 0.5) * 9000,
      y: (Math.random() - 0.5) * 9000,
      z: 0.2 + Math.random() * 0.8,
    });
  }
  return stars;
}

export function getDifficulty(state) {
  return DIFFICULTY_PROFILES[state.selectedDifficulty] || DIFFICULTY_PROFILES.pilgrim;
}

export function resetRun(state) {
  const effects = getUpgradeEffects(state.upgrades);
  state.mode = "playing";
  state.time = 0;
  state.elapsed = 0;
  state.score = 0;
  state.message = "";
  state.showHints = true;
  state.chunks.clear();
  state.resources.length = 0;
  state.hazards.length = 0;
  state.enemies.length = 0;
  state.bullets.length = 0;
  state.spawnEnemyIn = 2;
  state.player.x = 0;
  state.player.y = 0;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.facing = 0;
  state.player.maxHull = effects.maxHull;
  state.player.maxEnergy = effects.maxEnergy;
  state.player.cargoCapacity = effects.cargoCapacity;
  state.player.hull = effects.maxHull;
  state.player.energy = effects.maxEnergy;
  state.player.fireCooldown = 0;
  state.player.pulseCooldown = 0;
  state.player.pulseFx = 0;
  state.player.boosting = false;
  state.player.nearOutpost = true;
  state.player.inSafeZone = true;
  state.player.cargoUsed = 0;
  state.player.cargo = { metal: 0, fuel: 0, crystal: 0, data: 0, entropyCore: 0 };
  state.outpost.energy = 250;
  state.outpost.stockpile = { metal: 28, fuel: 30, crystal: 12, data: 7, entropyCore: 0 };
  state.message = "Salvage. Return cargo. Keep Ember alive.";
  state.mouse.active = false;
  state.gameOverReason = "";
}
