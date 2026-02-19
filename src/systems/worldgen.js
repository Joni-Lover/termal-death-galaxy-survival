import { ENEMY_BASE, HAZARD_TABLE, RESOURCE_NODE_TABLE } from "../config/contentTables.js";
import { CHUNK_SIZE } from "../core/constants.js";
import { hash2, makeSeededRng, pickWeighted } from "../core/utils.js";

export function ensureWorldAroundPlayer(state) {
  const cx = Math.floor(state.player.x / CHUNK_SIZE);
  const cy = Math.floor(state.player.y / CHUNK_SIZE);

  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      generateChunk(state, cx + ox, cy + oy);
    }
  }

  const minX = (cx - 3) * CHUNK_SIZE;
  const maxX = (cx + 3) * CHUNK_SIZE;
  const minY = (cy - 3) * CHUNK_SIZE;
  const maxY = (cy + 3) * CHUNK_SIZE;

  state.resources = state.resources.filter((node) => node.x > minX && node.x < maxX && node.y > minY && node.y < maxY);
  state.hazards = state.hazards.filter((haz) => haz.x > minX && haz.x < maxX && haz.y > minY && haz.y < maxY);
  state.enemies = state.enemies.filter((enemy) => enemy.x > minX && enemy.x < maxX && enemy.y > minY && enemy.y < maxY);
}

function generateChunk(state, cx, cy) {
  const key = `${cx},${cy}`;
  if (state.chunks.has(key)) return;
  state.chunks.add(key);

  const rng = makeSeededRng(hash2(cx, cy, state.seed));
  const x0 = cx * CHUNK_SIZE;
  const y0 = cy * CHUNK_SIZE;

  if (Math.hypot(x0, y0) < 240) return;

  const resourceCount = 4 + Math.floor(rng() * 9);
  for (let i = 0; i < resourceCount; i += 1) {
    const tpl = pickWeighted(RESOURCE_NODE_TABLE, rng);
    const radius = tpl.radiusMin + rng() * (tpl.radiusMax - tpl.radiusMin);
    state.resources.push({
      id: `${key}:r:${i}`,
      kind: tpl.kind,
      x: x0 + rng() * CHUNK_SIZE,
      y: y0 + rng() * CHUNK_SIZE,
      radius,
      yield: tpl.yield,
      score: tpl.score,
    });
  }

  const hazardCount = rng() < 0.52 ? 1 : 0;
  for (let i = 0; i < hazardCount; i += 1) {
    const tpl = pickWeighted(HAZARD_TABLE, rng);
    const radius = tpl.radiusMin + rng() * (tpl.radiusMax - tpl.radiusMin);
    const influence = tpl.influenceMin + rng() * (tpl.influenceMax - tpl.influenceMin);
    state.hazards.push({
      id: `${key}:h:${i}`,
      kind: tpl.kind,
      variant: tpl.variant || null,
      sizeClass: tpl.sizeClass || null,
      x: x0 + 80 + rng() * (CHUNK_SIZE - 160),
      y: y0 + 80 + rng() * (CHUNK_SIZE - 160),
      radius,
      influence,
    });
  }

  const enemyCount = rng() < 0.7 ? 1 + Math.floor(rng() * 2) : 0;
  for (let i = 0; i < enemyCount; i += 1) {
    state.enemies.push({
      id: `${key}:e:${i}`,
      x: x0 + rng() * CHUNK_SIZE,
      y: y0 + rng() * CHUNK_SIZE,
      vx: 0,
      vy: 0,
      radius: ENEMY_BASE.radius,
      hp: ENEMY_BASE.hp,
      contactDamage: ENEMY_BASE.contactDamage,
    });
  }
}
