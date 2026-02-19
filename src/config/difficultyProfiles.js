export const DIFFICULTY_ORDER = ["pilgrim", "drifter", "relic", "heatDeath"];

export const DIFFICULTY_PROFILES = {
  pilgrim: {
    label: "Пилигрим",
    energyDrain: 0.55,
    hazardDamage: 0.55,
    enemyAggression: 0.58,
    enemySpawnRate: 0.62,
    lootMultiplier: 1.4,
    outpostDecay: 0.5,
    deathPenalty: 0.2,
  },
  drifter: {
    label: "Скиталец",
    energyDrain: 0.82,
    hazardDamage: 0.82,
    enemyAggression: 0.82,
    enemySpawnRate: 0.82,
    lootMultiplier: 1.15,
    outpostDecay: 0.78,
    deathPenalty: 0.38,
  },
  relic: {
    label: "Реликт",
    energyDrain: 1.25,
    hazardDamage: 1.3,
    enemyAggression: 1.35,
    enemySpawnRate: 1.2,
    lootMultiplier: 0.85,
    outpostDecay: 1.3,
    deathPenalty: 0.65,
  },
  heatDeath: {
    label: "Тепловая смерть",
    energyDrain: 1.45,
    hazardDamage: 1.7,
    enemyAggression: 1.6,
    enemySpawnRate: 1.45,
    lootMultiplier: 0.7,
    outpostDecay: 1.7,
    deathPenalty: 0.85,
  },
};
