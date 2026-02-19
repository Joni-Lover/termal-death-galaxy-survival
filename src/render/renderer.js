import { DIFFICULTY_ORDER, DIFFICULTY_PROFILES } from "../config/difficultyProfiles.js";
import { UPGRADE_DEFS, getUpgradeCost } from "../config/upgrades.js";
import { COLORS, OUTPOST, WORLD_HEIGHT, WORLD_WIDTH } from "../core/constants.js";

function worldToScreen(cameraX, cameraY, x, y) {
  const relX = x - cameraX;
  const relY = y - cameraY;
  const depth = clamp01((relY + 700) / 1600);
  const scale = 0.55 + depth * 0.95;
  return {
    x: WORLD_WIDTH * 0.5 + relX * scale,
    y: WORLD_HEIGHT * 0.18 + relY * 0.52 + depth * 180,
    scale,
    depth,
  };
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function drawBackground(ctx, state, cameraX, cameraY) {
  const grad = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  grad.addColorStop(0, "#030a14");
  grad.addColorStop(0.5, COLORS.skyTop);
  grad.addColorStop(1, COLORS.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  drawPerspectiveLanes(ctx, cameraX, cameraY);

  for (const star of state.stars) {
    const sx = ((star.x - cameraX * star.z * 0.05) % 3000 + 3000) % 3000;
    const sy = ((star.y - cameraY * star.z * 0.05) % 3000 + 3000) % 3000;
    const x = (sx / 3000) * WORLD_WIDTH;
    const y = (sy / 3000) * WORLD_HEIGHT;
    const s = 1 + 2 * star.z;
    ctx.fillStyle = `rgba(185,217,255,${0.25 + 0.6 * star.z})`;
    ctx.fillRect(x, y, s, s);
  }
}

function drawPerspectiveLanes(ctx, cameraX, cameraY) {
  const vanX = WORLD_WIDTH * 0.5;
  const vanY = WORLD_HEIGHT * 0.16;
  ctx.strokeStyle = "rgba(110, 160, 220, 0.12)";
  ctx.lineWidth = 1;
  for (let i = -5; i <= 5; i += 1) {
    const bx = WORLD_WIDTH * 0.5 + i * 120 - (cameraX * 0.05);
    ctx.beginPath();
    ctx.moveTo(vanX, vanY);
    ctx.lineTo(bx, WORLD_HEIGHT + 20);
    ctx.stroke();
  }
  for (let j = 0; j < 8; j += 1) {
    const y = WORLD_HEIGHT * 0.3 + j * 44 + (cameraY * 0.03) % 44;
    const width = 90 + j * 105;
    ctx.strokeStyle = `rgba(100, 150, 210, ${0.04 + j * 0.015})`;
    ctx.beginPath();
    ctx.moveTo(vanX - width, y);
    ctx.lineTo(vanX + width, y);
    ctx.stroke();
  }
}

function drawMenuBackground(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  grad.addColorStop(0, "#0a1220");
  grad.addColorStop(1, "#04070d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  ctx.fillStyle = "rgba(22, 38, 58, 0.9)";
  ctx.fillRect(90, 56, WORLD_WIDTH - 180, WORLD_HEIGHT - 112);
  ctx.strokeStyle = "rgba(120, 170, 220, 0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(90, 56, WORLD_WIDTH - 180, WORLD_HEIGHT - 112);
}

function drawOutpost(ctx, cameraX, cameraY, state) {
  const p = worldToScreen(cameraX, cameraY, OUTPOST.x, OUTPOST.y);
  const rr = OUTPOST.radius * p.scale;
  const ringR = Math.max(10, rr - 22 * p.scale);
  const tiltY = 0.62;

  // Outer ring with pseudo-3D tilt
  ctx.strokeStyle = "rgba(126, 255, 212, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, rr, rr * tiltY, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = "rgba(110, 235, 205, 0.45)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, ringR, ringR * tiltY, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Core dome
  const coreGrad = ctx.createRadialGradient(p.x - rr * 0.2, p.y - rr * 0.2, rr * 0.1, p.x, p.y, rr * 0.9);
  coreGrad.addColorStop(0, "rgba(170, 255, 235, 0.42)");
  coreGrad.addColorStop(1, "rgba(48, 125, 112, 0.15)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, ringR * 0.9, ringR * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#dffef3";
  ctx.font = "13px Trebuchet MS";
  ctx.fillText("Оплот Эмбер", p.x - 45, p.y - rr - 10);

  const energyPct = state.outpost.energy / OUTPOST.maxEnergy;
  ctx.fillStyle = "rgba(4,20,14,0.8)";
  ctx.fillRect(p.x - 44, p.y + rr + 8, 88, 8);
  ctx.fillStyle = energyPct > 0.35 ? "#76f7b0" : "#ff9f74";
  ctx.fillRect(p.x - 44, p.y + rr + 8, 88 * energyPct, 8);
}

function drawResources(ctx, cameraX, cameraY, state) {
  for (const node of state.resources) {
    const p = worldToScreen(cameraX, cameraY, node.x, node.y);
    if (p.x < -90 || p.x > WORLD_WIDTH + 90 || p.y < -90 || p.y > WORLD_HEIGHT + 90) continue;
    const rr = node.radius * p.scale;

    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + rr * 0.55, rr * 0.75, rr * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    let c1 = "#c2c8cf";
    let c2 = "#7f8893";
    if (node.kind === "shard") {
      c1 = "#acf0ff";
      c2 = "#3f9ac4";
    } else if (node.kind === "wreck") {
      c1 = "#d8b08c";
      c2 = "#8d6342";
    }
    const g = ctx.createRadialGradient(p.x - rr * 0.35, p.y - rr * 0.3, rr * 0.1, p.x, p.y, rr);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(230,245,255,0.18)";
    ctx.lineWidth = Math.max(1, rr * 0.08);
    ctx.beginPath();
    ctx.arc(p.x, p.y, rr * 0.75, -0.7, 1.9);
    ctx.stroke();
  }
}

function drawHazards(ctx, cameraX, cameraY, state) {
  for (const hazard of state.hazards) {
    const p = worldToScreen(cameraX, cameraY, hazard.x, hazard.y);
    if (p.x < -260 || p.x > WORLD_WIDTH + 260 || p.y < -260 || p.y > WORLD_HEIGHT + 260) continue;
    const hr = hazard.radius * p.scale;
    const hi = hazard.influence * (0.58 + p.depth * 0.32);

    if (hazard.kind === "sun") {
      const g = ctx.createRadialGradient(p.x, p.y, 6, p.x, p.y, hi);
      g.addColorStop(0, "rgba(255,220,140,0.55)");
      g.addColorStop(1, "rgba(255,120,30,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, hi, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffd08f";
      ctx.beginPath();
      ctx.arc(p.x, p.y, hr, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const g = ctx.createRadialGradient(p.x, p.y, 5, p.x, p.y, hi);
      g.addColorStop(0, "rgba(175,160,255,0.3)");
      g.addColorStop(1, "rgba(40,20,75,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, hi, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1a0f2a";
      ctx.beginPath();
      ctx.arc(p.x, p.y, hr, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#8f84ff";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, hr + 5 * p.scale, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawEnemies(ctx, cameraX, cameraY, state) {
  for (const enemy of state.enemies) {
    const p = worldToScreen(cameraX, cameraY, enemy.x, enemy.y);
    if (p.x < -60 || p.x > WORLD_WIDTH + 60 || p.y < -60 || p.y > WORLD_HEIGHT + 60) continue;

    drawBlackStar(ctx, p.x, p.y, (enemy.radius + 3) * p.scale, state.time * 1.9);
  }
}

function drawBlackStar(ctx, x, y, r, spin = 0) {
  const spikes = 5;
  const inner = r * 0.44;
  const rot = -Math.PI / 2 + spin;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "rgba(18, 14, 28, 0.95)";
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i += 1) {
    const radius = i % 2 === 0 ? r : inner;
    const a = rot + i * step;
    const px = Math.cos(a) * radius;
    const py = Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(132, 112, 220, 0.75)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "rgba(82, 70, 140, 0.7)";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBullets(ctx, cameraX, cameraY, state) {
  ctx.fillStyle = "#ffe4a1";
  for (const bullet of state.bullets) {
    const p = worldToScreen(cameraX, cameraY, bullet.x, bullet.y);
    if (p.x < -20 || p.x > WORLD_WIDTH + 20 || p.y < -20 || p.y > WORLD_HEIGHT + 20) continue;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(2, bullet.radius * p.scale), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(ctx, cameraX, cameraY, state) {
  const p = worldToScreen(cameraX, cameraY, state.player.x, state.player.y);
  const s = p.scale;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(state.player.facing);
  ctx.scale(s, s);

  // Ship shadow
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath();
  ctx.ellipse(-2, 10, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main hull (low-poly style)
  const hullGrad = ctx.createLinearGradient(-14, -12, 18, 12);
  hullGrad.addColorStop(0, "#b7f3ff");
  hullGrad.addColorStop(1, "#4ab8dc");
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.lineTo(-9, -12);
  ctx.lineTo(-3, 0);
  ctx.lineTo(-9, 12);
  ctx.closePath();
  ctx.fill();

  // Top plate for volume
  ctx.fillStyle = "rgba(210, 250, 255, 0.8)";
  ctx.beginPath();
  ctx.moveTo(9, -2);
  ctx.lineTo(-7, -8);
  ctx.lineTo(-1, -1);
  ctx.lineTo(10, -0.4);
  ctx.closePath();
  ctx.fill();

  // Side wing
  ctx.fillStyle = "rgba(95, 208, 235, 0.9)";
  ctx.beginPath();
  ctx.moveTo(4, 3);
  ctx.lineTo(-10, 11);
  ctx.lineTo(-3, 2);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = "#f8feff";
  ctx.beginPath();
  ctx.arc(0, 0, 3.6, 0, Math.PI * 2);
  ctx.fill();

  // Booster flame
  if (state.player.boosting) {
    ctx.fillStyle = "rgba(255, 185, 110, 0.9)";
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(-21 - Math.random() * 6, -4);
    ctx.lineTo(-21 - Math.random() * 6, 4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  if (state.player.pulseFx > 0) {
    const pulseRadius = 170 * (1.2 - state.player.pulseFx * 1.6);
    ctx.strokeStyle = `rgba(152, 196, 255, ${state.player.pulseFx * 2})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(8, pulseRadius), 0, Math.PI * 2);
    ctx.stroke();
  }

  if (state.mouse.active) {
    drawCrosshair(ctx, state.mouse.screenX, state.mouse.screenY);
  }
}

function drawCrosshair(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = "rgba(185, 228, 255, 0.9)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x + 8, y);
  ctx.moveTo(x, y - 8);
  ctx.lineTo(x, y + 8);
  ctx.stroke();
  ctx.restore();
}

function drawHud(ctx, state) {
  if (state.uiCompact) {
    drawCompactHud(ctx, state);
    return;
  }

  ctx.fillStyle = "rgba(4, 12, 24, 0.74)";
  ctx.fillRect(14, 14, 420, 236);
  ctx.strokeStyle = "rgba(120, 180, 255, 0.52)";
  ctx.strokeRect(14, 14, 420, 236);

  ctx.fillStyle = "#eaf5ff";
  ctx.font = "18px Trebuchet MS";
  ctx.fillText(`Счёт: ${Math.floor(state.score)}`, 26, 42);
  ctx.fillText(`Время: ${state.elapsed.toFixed(1)}с`, 26, 68);
  ctx.fillText(`Сложность: ${DIFFICULTY_PROFILES[state.selectedDifficulty].label}`, 26, 94);

  const hullPct = state.player.hull / state.player.maxHull;
  const energyPct = state.player.energy / state.player.maxEnergy;
  const cargoPct = state.player.cargoUsed / state.player.cargoCapacity;

  drawBar(ctx, 26, 106, 190, 10, hullPct, "Корпус", "#ff9e8f");
  drawBar(ctx, 26, 126, 190, 10, energyPct, "Энергия корабля", "#8de6ff");
  drawBar(ctx, 26, 146, 190, 10, cargoPct, "Трюм", "#ffd494");

  ctx.font = "13px Trebuchet MS";
  ctx.fillStyle = "#cbddf7";
  ctx.fillText(
    `Запасы: M ${state.outpost.stockpile.metal} | F ${state.outpost.stockpile.fuel} | C ${state.outpost.stockpile.crystal} | D ${state.outpost.stockpile.data}`,
    26,
    172,
  );
  ctx.fillText(`Апгрейды: Реактор ${state.upgrades.reactor}/3 | Корпус ${state.upgrades.hull}/3 | Трюм ${state.upgrades.cargo}/4`, 26, 192);
  ctx.fillText(
    `Импульс V: ${state.player.pulseCooldown > 0 ? state.player.pulseCooldown.toFixed(1) + "с" : "готов"} | Ускорение Shift`,
    26,
    212,
  );

  if (state.showHints) {
    ctx.fillText("Space/ЛКМ выстрел, V/ПКМ импульс, Shift ускорение", 450, 30);
    ctx.fillText("E добыча, Q топливо -> энергия оплота", 450, 50);
    if (state.player.nearOutpost) {
      ctx.fillStyle = "#ffdfb0";
      ctx.fillText("У оплота: Z Реактор, X Корпус, C Трюм", 450, 70);
    }
    if (state.player.inSafeZone) {
      ctx.fillStyle = "#9ff3bb";
      ctx.fillText("Безопасная зона: аномалии и контактный урон не действуют", 450, 90);
    }
    drawUpgradeHints(ctx, state);
    drawObjectiveChecklist(ctx, state);
  }

  if (state.message) {
    ctx.fillStyle = "#f6d89a";
    ctx.fillText(`Статус: ${state.message}`, 450, state.showHints ? 112 : 30);
  }
  ctx.fillStyle = "#b7d8f7";
  ctx.fillText(`H: ${state.showHints ? "скрыть" : "показать"} подсказки`, 450, 226);
  ctx.fillText("J: компактный HUD", 450, 246);
}

function drawCompactHud(ctx, state) {
  ctx.fillStyle = "rgba(4, 12, 24, 0.72)";
  ctx.fillRect(14, 14, 330, 108);
  ctx.strokeStyle = "rgba(120, 180, 255, 0.52)";
  ctx.strokeRect(14, 14, 330, 108);

  const hullPct = state.player.hull / state.player.maxHull;
  const energyPct = state.player.energy / state.player.maxEnergy;

  ctx.fillStyle = "#eaf5ff";
  ctx.font = "18px Trebuchet MS";
  ctx.fillText(`Счёт ${Math.floor(state.score)}  Время ${state.elapsed.toFixed(1)}с`, 24, 38);
  ctx.font = "15px Trebuchet MS";
  ctx.fillText(`Корпус ${state.player.hull.toFixed(1)}/${state.player.maxHull}`, 24, 62);
  drawBar(ctx, 24, 68, 180, 8, hullPct, "", "#ff9e8f");
  ctx.fillText(`Энергия ${state.player.energy.toFixed(0)}/${state.player.maxEnergy}`, 24, 92);
  drawBar(ctx, 24, 98, 180, 8, energyPct, "", "#8de6ff");

  ctx.font = "13px Trebuchet MS";
  ctx.fillStyle = "#b7d8f7";
  ctx.fillText(
    `V ${state.player.pulseCooldown > 0 ? state.player.pulseCooldown.toFixed(1) + "с" : "готов"} | Shift ускорение | H подсказки | J полный HUD`,
    360,
    30,
  );
  if (state.player.inSafeZone) {
    ctx.fillStyle = "#9ff3bb";
    ctx.fillText("Безопасная зона активна", 360, 50);
  }
  if (state.message) {
    ctx.fillStyle = "#f6d89a";
    ctx.fillText(`Статус: ${state.message}`, 360, 70);
  }
}

function drawBar(ctx, x, y, w, h, pct, label, color) {
  ctx.fillStyle = "rgba(8,18,32,0.9)";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, pct)), h);
  ctx.fillStyle = "#cde6ff";
  ctx.font = "12px Trebuchet MS";
  ctx.fillText(label, x + w + 8, y + h);
}

function drawUpgradeHints(ctx, state) {
  const lines = [];
  for (const [id, def] of Object.entries(UPGRADE_DEFS)) {
    const level = state.upgrades[id];
    const cost = getUpgradeCost(id, level);
    if (!cost) {
      lines.push(`${def.short}: ${def.label} МАКС`);
      continue;
    }
    lines.push(`${def.short}: ${def.label} Ур.${level + 1} (${formatCost(cost)})`);
  }

  ctx.fillStyle = "rgba(6,16,30,0.68)";
  ctx.fillRect(450, 130, 492, 78);
  ctx.strokeStyle = "rgba(130, 180, 235, 0.45)";
  ctx.strokeRect(450, 130, 492, 78);
  ctx.fillStyle = "#d7e9ff";
  ctx.font = "13px Trebuchet MS";
  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillText(lines[i], 462, 152 + i * 18);
  }
}

function formatCost(cost) {
  const mapping = { metal: "M", fuel: "F", crystal: "C", data: "D", entropyCore: "E" };
  return Object.entries(cost)
    .map(([key, value]) => `${mapping[key] || key}:${value}`)
    .join(" ");
}

function drawMenu(ctx, state) {
  ctx.fillStyle = "rgba(2,8,18,0.92)";
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f2fbff";
  ctx.font = "bold 44px Trebuchet MS";
  ctx.fillText("Тепловая Смерть: Выживание в Галактике", WORLD_WIDTH / 2, 130);

  ctx.fillStyle = "#b8d8f7";
  ctx.font = "22px Trebuchet MS";
  ctx.fillText("Выживание в открытом космосе на фоне тепловой смерти Вселенной", WORLD_WIDTH / 2, 172);

  ctx.font = "20px Trebuchet MS";
  ctx.fillText("Лети во все стороны, добывай реликты, избегай звёзд и чёрных дыр", WORLD_WIDTH / 2, 210);

  const startY = 270;
  for (let i = 0; i < DIFFICULTY_ORDER.length; i += 1) {
    const key = DIFFICULTY_ORDER[i];
    const selected = key === state.selectedDifficulty;
    const label = `${i + 1}. ${DIFFICULTY_PROFILES[key].label}`;
    ctx.fillStyle = selected ? "#ffd39c" : "#d8e7ff";
    ctx.fillText(label, WORLD_WIDTH / 2, startY + i * 34);
  }

  ctx.fillStyle = "#ffe5b3";
  ctx.font = "bold 26px Trebuchet MS";
  ctx.fillText("Нажми Enter для старта", WORLD_WIDTH / 2, 455);
  ctx.font = "17px Trebuchet MS";
  ctx.fillText("WASD/Стрелки движение, мышь прицел, Space/ЛКМ выстрел, Shift ускорение", WORLD_WIDTH / 2, 492);
  ctx.fillText("V/ПКМ импульс, E добыча, Q подпитка оплота, H подсказки, J HUD, M/Esc меню", WORLD_WIDTH / 2, 516);

  drawStartGuide(ctx);
  ctx.textAlign = "left";
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = "rgba(20,0,0,0.58)";
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffe2d0";
  ctx.font = "bold 54px Trebuchet MS";
  ctx.fillText("Сигнал потерян", WORLD_WIDTH / 2, 200);

  ctx.font = "25px Trebuchet MS";
  ctx.fillStyle = "#fff1e8";
  ctx.fillText(state.gameOverReason, WORLD_WIDTH / 2, 252);
  ctx.fillText(`Итоговый счёт: ${Math.floor(state.score)}`, WORLD_WIDTH / 2, 292);
  ctx.fillText(`Время выживания: ${state.elapsed.toFixed(1)}с`, WORLD_WIDTH / 2, 326);

  ctx.fillStyle = "#ffd7a1";
  ctx.fillText("Нажми R для перезапуска", WORLD_WIDTH / 2, 390);
  ctx.textAlign = "left";
}

export function render(ctx, state) {
  if (state.mode === "menu") {
    drawMenuBackground(ctx);
    drawMenu(ctx, state);
    return;
  }

  const cameraX = state.player.x;
  const cameraY = state.player.y;
  drawBackground(ctx, state, cameraX, cameraY);
  drawHazards(ctx, cameraX, cameraY, state);
  drawResources(ctx, cameraX, cameraY, state);
  drawOutpost(ctx, cameraX, cameraY, state);
  drawBullets(ctx, cameraX, cameraY, state);
  drawEnemies(ctx, cameraX, cameraY, state);
  drawPlayer(ctx, cameraX, cameraY, state);
  drawHud(ctx, state);

  if (state.mode === "gameover") drawGameOver(ctx, state);
}

function drawStartGuide(ctx) {
  const x = 148;
  const y = 236;
  const w = 664;
  const h = 198;
  ctx.fillStyle = "rgba(5, 15, 30, 0.96)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(120, 180, 240, 0.55)";
  ctx.strokeRect(x, y, w, h);

  ctx.textAlign = "left";
  ctx.fillStyle = "#dff0ff";
  ctx.font = "bold 19px Trebuchet MS";
  ctx.fillText("Что делать:", x + 16, y + 30);

  ctx.font = "17px Trebuchet MS";
  ctx.fillStyle = "#d2e6fb";
  ctx.fillText("1. Вылетай из Оплота Эмбер и ищи астероиды, осколки и руины.", x + 16, y + 62);
  ctx.fillText("2. Подлети к узлу и нажми E, чтобы собрать ресурсы в трюм.", x + 16, y + 90);
  ctx.fillText("3. Вернись к оплоту: груз автоматически уйдёт в общий склад.", x + 16, y + 118);
  ctx.fillText("4. Нажимай Q, чтобы конвертировать топливо в энергию оплота.", x + 16, y + 146);
  ctx.fillText("5. Улучшай корабль у оплота: Z реактор, X корпус, C трюм.", x + 16, y + 174);
}

function drawObjectiveChecklist(ctx, state) {
  const x = 450;
  const y = 220;
  const w = 492;
  const h = 124;
  const hasCargo = state.player.cargoUsed > 0;
  const atOutpost = state.player.nearOutpost;
  const lowOutpostEnergy = state.outpost.energy < 110;

  const items = [
    `${hasCargo ? "ГОТОВО" : "ЗАДАЧА"}: Добыть ресурсный узел (E)`,
    `${hasCargo && atOutpost ? "ГОТОВО" : "ЗАДАЧА"}: Вернуть груз в оплот`,
    `${lowOutpostEnergy ? "ЗАДАЧА" : "ГОТОВО"}: Держать энергию оплота (Q)`,
    "СОВЕТ: Обходи звёзды и чёрные дыры",
  ];

  ctx.fillStyle = "rgba(6,16,30,0.68)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(130, 180, 235, 0.45)";
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#d7e9ff";
  ctx.font = "13px Trebuchet MS";
  ctx.fillText("Чеклист миссии", x + 12, y + 18);
  for (let i = 0; i < items.length; i += 1) {
    ctx.fillStyle = items[i].startsWith("ГОТОВО") ? "#9ff3bb" : "#d7e9ff";
    ctx.fillText(items[i], x + 12, y + 40 + i * 20);
  }
}
