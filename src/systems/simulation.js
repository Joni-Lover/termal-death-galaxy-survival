import { ENEMY_BASE } from "../config/contentTables.js";
import { UPGRADE_DEFS, canAfford, getUpgradeCost, getUpgradeEffects, spendCost } from "../config/upgrades.js";
import { FIXED_DT, OUTPOST, PLAYER } from "../core/constants.js";
import { clamp, length } from "../core/utils.js";
import { getDifficulty } from "../core/state.js";
import { consumePress } from "./input.js";
import { ensureWorldAroundPlayer } from "./worldgen.js";

const SAFE_ZONE_RADIUS = OUTPOST.radius + 70;
const ENEMY_SAFE_BUFFER = 34;
const PULSE_COST = 45;
const PULSE_COOLDOWN = 9;
const PULSE_RADIUS = 170;

function dirFromInput(state) {
  let dx = 0;
  let dy = 0;
  if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) dy -= 1;
  if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) dy += 1;
  if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) dx -= 1;
  if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) dx += 1;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return { dx: 0, dy: 0 };
  return { dx: dx / len, dy: dy / len };
}

function applyPlayerMotion(state, dt, difficulty) {
  const effects = getUpgradeEffects(state.upgrades);
  state.player.maxHull = effects.maxHull;
  state.player.maxEnergy = effects.maxEnergy;
  state.player.cargoCapacity = effects.cargoCapacity;

  const dir = dirFromInput(state);
  const boostPressed = state.keys.has("ShiftLeft") || state.keys.has("ShiftRight");
  state.player.boosting = boostPressed && state.player.energy > 0;
  const thrustScale = state.player.boosting ? 1.9 : 1;
  const thrust = PLAYER.thrust * thrustScale;

  state.player.vx += dir.dx * thrust * dt;
  state.player.vy += dir.dy * thrust * dt;

  state.player.vx *= PLAYER.drag;
  state.player.vy *= PLAYER.drag;

  const speed = length(state.player.vx, state.player.vy);
  const maxSpeed = PLAYER.maxSpeed * (state.player.boosting ? 1.75 : 1);
  if (speed > maxSpeed) {
    const k = maxSpeed / speed;
    state.player.vx *= k;
    state.player.vy *= k;
  }

  state.player.x += state.player.vx * dt;
  state.player.y += state.player.vy * dt;

  if (!state.mouse.active && speed > 1) {
    state.player.facing = Math.atan2(state.player.vy, state.player.vx);
  }

  const baseDrain = (0.9 + speed * 0.008) * difficulty.energyDrain * effects.energyDrainMultiplier;
  const thrustDrain = (Math.abs(dir.dx) + Math.abs(dir.dy)) * 1.2 * difficulty.energyDrain;
  const boostDrain = state.player.boosting ? 14 * difficulty.energyDrain : 0;
  state.player.energy = clamp(
    state.player.energy - (baseDrain + thrustDrain * effects.energyDrainMultiplier + boostDrain) * dt,
    0,
    state.player.maxEnergy,
  );

  if (state.player.energy <= 0) {
    state.player.hull = clamp(state.player.hull - dt * 0.35, 0, state.player.maxHull);
  }
}

function fireBullet(state, difficulty) {
  const wantsFire = state.keys.has("Space") || consumePress(state, "Space");
  if (!wantsFire) return;
  if (state.player.fireCooldown > 0 || state.player.energy < 3.5) return;

  const angle = state.player.facing;
  const nx = Math.cos(angle);
  const ny = Math.sin(angle);
  state.bullets.push({
    x: state.player.x + nx * 20,
    y: state.player.y + ny * 20,
    vx: nx * 520,
    vy: ny * 520,
    life: 1.6,
    radius: 4,
  });

  state.player.fireCooldown = 0.17 / difficulty.enemyAggression;
  state.player.energy = clamp(state.player.energy - 3.5 * difficulty.energyDrain, 0, state.player.maxEnergy);
}

function updateAim(state) {
  if (!state.mouse.active) return;
  const dx = state.mouse.worldX - state.player.x;
  const dy = state.mouse.worldY - state.player.y;
  if (Math.hypot(dx, dy) < 2) return;
  state.player.facing = Math.atan2(dy, dx);
}

function updateBullets(state, dt) {
  for (const bullet of state.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
  }
  state.bullets = state.bullets.filter((b) => b.life > 0);
}


function updateSafeZone(state) {
  const dist = Math.hypot(state.player.x - state.outpost.x, state.player.y - state.outpost.y);
  state.player.inSafeZone = dist < SAFE_ZONE_RADIUS;
}

function applyHazards(state, dt, difficulty) {
  if (state.player.inSafeZone) return;
  for (const hazard of state.hazards) {
    const dx = hazard.x - state.player.x;
    const dy = hazard.y - state.player.y;
    const dist = Math.max(1, Math.hypot(dx, dy));

    if (hazard.kind === "blackHole" && dist < hazard.influence) {
      const force = ((hazard.influence - dist) / hazard.influence) * 210 * difficulty.hazardDamage;
      state.player.vx += (dx / dist) * force * dt;
      state.player.vy += (dy / dist) * force * dt;
    }

    if (dist < hazard.radius + PLAYER.radius) {
      const damage = hazard.kind === "sun" ? 0.8 : 1.4;
      state.player.hull = clamp(state.player.hull - damage * difficulty.hazardDamage * dt, 0, state.player.maxHull);
      state.player.energy = clamp(state.player.energy - 3.2 * difficulty.hazardDamage * dt, 0, state.player.maxEnergy);
    }
  }
}

function updateEnemies(state, dt, difficulty) {
  state.spawnEnemyIn -= dt;
  if (state.spawnEnemyIn <= 0) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 380 + Math.random() * 420;
    state.enemies.push({
      id: `dyn:${state.elapsed.toFixed(2)}:${Math.random().toString(16).slice(2, 7)}`,
      x: state.player.x + Math.cos(angle) * dist,
      y: state.player.y + Math.sin(angle) * dist,
      vx: 0,
      vy: 0,
      radius: ENEMY_BASE.radius,
      hp: ENEMY_BASE.hp,
      contactDamage: ENEMY_BASE.contactDamage,
    });
    const spawnEvery = Math.max(1.2, 3.3 / difficulty.enemySpawnRate);
    state.spawnEnemyIn = spawnEvery;
  }

  for (const enemy of state.enemies) {
    const safeBarrier = SAFE_ZONE_RADIUS + ENEMY_SAFE_BUFFER;

    // While player is inside the safe zone, enemies disengage and drift away from the outpost.
    if (state.player.inSafeZone) {
      const awayX = enemy.x - OUTPOST.x;
      const awayY = enemy.y - OUTPOST.y;
      const awayDist = Math.max(1, Math.hypot(awayX, awayY));
      const accel = ENEMY_BASE.speed * 0.9 * difficulty.enemyAggression;
      enemy.vx += (awayX / awayDist) * accel * dt;
      enemy.vy += (awayY / awayDist) * accel * dt;
    } else {
      const dx = state.player.x - enemy.x;
      const dy = state.player.y - enemy.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const chase = dist < 520 ? 1 : 0.35;
      const accel = ENEMY_BASE.speed * difficulty.enemyAggression * chase;
      enemy.vx += (dx / dist) * accel * dt;
      enemy.vy += (dy / dist) * accel * dt;
    }

    enemy.vx *= 0.93;
    enemy.vy *= 0.93;
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;

    // Hard enemy exclusion wall around the outpost safe zone.
    const distToOutpostAfterMove = Math.max(1, Math.hypot(enemy.x - OUTPOST.x, enemy.y - OUTPOST.y));
    if (distToOutpostAfterMove < safeBarrier) {
      const nx = (enemy.x - OUTPOST.x) / distToOutpostAfterMove;
      const ny = (enemy.y - OUTPOST.y) / distToOutpostAfterMove;
      enemy.x = OUTPOST.x + nx * safeBarrier;
      enemy.y = OUTPOST.y + ny * safeBarrier;

      const inwardSpeed = enemy.vx * nx + enemy.vy * ny;
      if (inwardSpeed < 0) {
        enemy.vx -= inwardSpeed * nx * 1.8;
        enemy.vy -= inwardSpeed * ny * 1.8;
      }
    }

    const dx = state.player.x - enemy.x;
    const dy = state.player.y - enemy.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const hitDist = enemy.radius + PLAYER.radius;
    if (dist < hitDist && !state.player.inSafeZone) {
      state.player.hull = clamp(
        state.player.hull - enemy.contactDamage * difficulty.enemyAggression * dt * 3.2,
        0,
        state.player.maxHull,
      );
    }
  }

  for (const bullet of state.bullets) {
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0) continue;
      const d = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
      if (d < bullet.radius + enemy.radius) {
        enemy.hp -= 1;
        bullet.life = 0;
        if (enemy.hp <= 0) {
          state.score += 30;
          if (Math.random() < 0.42 * difficulty.lootMultiplier) {
            const fuelGain = 2 + Math.floor(Math.random() * 3);
            state.player.cargo.fuel += fuelGain;
            state.player.cargoUsed += fuelGain;
          }
        }
      }
    }
  }

  state.enemies = state.enemies.filter((e) => e.hp > 0);
}

function triggerPulse(state) {
  if (!consumePress(state, "KeyV")) return;

  if (state.player.pulseCooldown > 0) {
    state.message = `Pulse cd: ${state.player.pulseCooldown.toFixed(1)}s`;
    return;
  }
  if (state.player.energy < PULSE_COST) {
    state.message = "No pulse energy.";
    return;
  }

  let destroyed = 0;
  for (const enemy of state.enemies) {
    const dist = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
    if (dist <= PULSE_RADIUS) {
      enemy.hp = 0;
      destroyed += 1;
    }
  }
  state.enemies = state.enemies.filter((e) => e.hp > 0);

  state.player.energy = clamp(state.player.energy - PULSE_COST, 0, state.player.maxEnergy);
  state.player.pulseCooldown = PULSE_COOLDOWN;
  state.player.pulseFx = 0.28;
  if (destroyed > 0) {
    state.score += destroyed * 35;
    state.message = `Pulse hit: ${destroyed}.`;
  } else {
    state.message = "Pulse fired.";
  }
}

function salvageNearby(state, difficulty) {
  if (!consumePress(state, "KeyE")) return;

  for (let i = state.resources.length - 1; i >= 0; i -= 1) {
    const node = state.resources[i];
    const d = Math.hypot(node.x - state.player.x, node.y - state.player.y);
    if (d > node.radius + 28) continue;

    for (const [resource, amount] of Object.entries(node.yield)) {
      const scaled = Math.max(1, Math.round(amount * difficulty.lootMultiplier));
      if (state.player.cargoUsed >= state.player.cargoCapacity) break;
      const room = state.player.cargoCapacity - state.player.cargoUsed;
      const accepted = Math.min(room, scaled);
      state.player.cargo[resource] += accepted;
      state.player.cargoUsed += accepted;
    }

    state.score += node.score;
    state.resources.splice(i, 1);
    break;
  }
}

function interactOutpost(state) {
  const dx = state.player.x - state.outpost.x;
  const dy = state.player.y - state.outpost.y;
  const atOutpost = Math.hypot(dx, dy) < OUTPOST.radius + 40;
  state.player.nearOutpost = atOutpost;

  if (!atOutpost) return;

  for (const key of Object.keys(state.player.cargo)) {
    const amount = state.player.cargo[key];
    if (amount > 0) {
      state.outpost.stockpile[key] += amount;
      state.player.cargoUsed -= amount;
      state.player.cargo[key] = 0;
    }
  }

  const effects = getUpgradeEffects(state.upgrades);
  state.player.energy = clamp(
    state.player.energy + 22 * FIXED_DT * effects.outpostChargeMultiplier,
    0,
    state.player.maxEnergy,
  );

  if (consumePress(state, "KeyQ")) {
    const fuelUse = Math.min(3, state.outpost.stockpile.fuel);
    if (fuelUse > 0) {
      state.outpost.stockpile.fuel -= fuelUse;
      state.outpost.energy = clamp(state.outpost.energy + fuelUse * 8 * effects.outpostChargeMultiplier, 0, OUTPOST.maxEnergy);
      state.message = "Outpost fueled.";
    }
  }

  for (const [id, def] of Object.entries(UPGRADE_DEFS)) {
    if (!consumePress(state, def.key)) continue;

    const level = state.upgrades[id];
    const cost = getUpgradeCost(id, level);
    if (!cost) {
      state.message = `${def.label}: max level.`;
      continue;
    }
    if (!canAfford(state.outpost.stockpile, cost)) {
      state.message = `Need mats for "${def.label}".`;
      continue;
    }

    spendCost(state.outpost.stockpile, cost);
    state.upgrades[id] += 1;
    const nextEffects = getUpgradeEffects(state.upgrades);
    state.player.maxHull = nextEffects.maxHull;
    state.player.maxEnergy = nextEffects.maxEnergy;
    state.player.cargoCapacity = nextEffects.cargoCapacity;
    state.player.hull = clamp(state.player.hull + 0.8, 0, state.player.maxHull);
    state.player.energy = clamp(state.player.energy + 14, 0, state.player.maxEnergy);
    state.message = `${def.label}: lvl ${state.upgrades[id]}.`;
  }
}

function decayOutpost(state, dt, difficulty) {
  const baseDecay = 1.45 * difficulty.outpostDecay;
  const enemyPressure = state.enemies.length * 0.015 * difficulty.enemyAggression;
  state.outpost.energy = clamp(state.outpost.energy - (baseDecay + enemyPressure) * dt, 0, OUTPOST.maxEnergy);
}

function handleFailure(state, difficulty) {
  if (state.player.hull <= 0) {
    state.mode = "gameover";
    state.gameOverReason = "Hull lost in entropy field.";
  } else if (state.outpost.energy <= 0) {
    state.mode = "gameover";
    state.gameOverReason = "Outpost Ember went dark.";
  }

  if (state.mode === "gameover") {
    for (const key of Object.keys(state.outpost.stockpile)) {
      state.outpost.stockpile[key] = Math.floor(state.outpost.stockpile[key] * (1 - difficulty.deathPenalty));
    }
  }
}

export function updatePlaying(state, dt) {
  const difficulty = getDifficulty(state);
  state.elapsed += dt;
  state.time += dt;
  state.player.fireCooldown = Math.max(0, state.player.fireCooldown - dt);
  state.player.pulseCooldown = Math.max(0, state.player.pulseCooldown - dt);
  state.player.pulseFx = Math.max(0, state.player.pulseFx - dt);

  ensureWorldAroundPlayer(state);
  updateSafeZone(state);
  updateAim(state);
  fireBullet(state, difficulty);
  triggerPulse(state);
  applyPlayerMotion(state, dt, difficulty);
  applyHazards(state, dt, difficulty);
  updateBullets(state, dt);
  updateEnemies(state, dt, difficulty);
  salvageNearby(state, difficulty);
  interactOutpost(state);
  decayOutpost(state, dt, difficulty);
  handleFailure(state, difficulty);

  state.justPressed.clear();
}

export function updateScene(state, dt) {
  if (state.mode === "playing") {
    updatePlaying(state, dt);
  } else {
    state.time += dt;
    state.justPressed.clear();
  }
}
