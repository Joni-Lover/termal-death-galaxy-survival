import { PLAYER } from "../core/constants.js";

export const UPGRADE_DEFS = {
  reactor: {
    key: "KeyZ",
    label: "Стабилизатор реактора",
    short: "Z",
    maxLevel: 3,
    costs: [
      { fuel: 12, crystal: 5, data: 2 },
      { fuel: 18, crystal: 8, data: 5 },
      { fuel: 24, crystal: 12, data: 9, entropyCore: 2 },
    ],
  },
  hull: {
    key: "KeyX",
    label: "Усиление корпуса",
    short: "X",
    maxLevel: 3,
    costs: [
      { metal: 18, fuel: 4, crystal: 2 },
      { metal: 28, fuel: 7, crystal: 4 },
      { metal: 40, fuel: 10, crystal: 7, entropyCore: 1 },
    ],
  },
  cargo: {
    key: "KeyC",
    label: "Грузовая решётка",
    short: "C",
    maxLevel: 4,
    costs: [
      { metal: 10, crystal: 3, data: 2 },
      { metal: 16, crystal: 5, data: 4 },
      { metal: 24, crystal: 8, data: 7 },
      { metal: 32, crystal: 10, data: 10, entropyCore: 1 },
    ],
  },
};

export function createUpgradesState() {
  return {
    reactor: 0,
    hull: 0,
    cargo: 0,
  };
}

export function getUpgradeEffects(upgrades) {
  const reactor = upgrades.reactor || 0;
  const hull = upgrades.hull || 0;
  const cargo = upgrades.cargo || 0;

  return {
    energyDrainMultiplier: Math.max(0.65, 1 - reactor * 0.08),
    outpostChargeMultiplier: 1 + reactor * 0.22,
    maxEnergy: PLAYER.maxEnergy + reactor * 16,
    maxHull: PLAYER.maxHull + hull,
    cargoCapacity: PLAYER.cargoCapacity + cargo * 28,
  };
}

export function getUpgradeCost(id, level) {
  const def = UPGRADE_DEFS[id];
  if (!def || level >= def.maxLevel) return null;
  return def.costs[level] || null;
}

export function canAfford(stockpile, cost) {
  if (!cost) return false;
  return Object.entries(cost).every(([key, value]) => (stockpile[key] || 0) >= value);
}

export function spendCost(stockpile, cost) {
  for (const [key, value] of Object.entries(cost)) {
    stockpile[key] -= value;
  }
}
