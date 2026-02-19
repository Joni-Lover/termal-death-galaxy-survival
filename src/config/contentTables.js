export const RESOURCE_NODE_TABLE = [
  {
    kind: "asteroid",
    weight: 0.5,
    radiusMin: 16,
    radiusMax: 28,
    yield: { metal: 10, fuel: 4 },
    score: 20,
  },
  {
    kind: "shard",
    weight: 0.3,
    radiusMin: 14,
    radiusMax: 24,
    yield: { crystal: 7, entropyCore: 2 },
    score: 28,
  },
  {
    kind: "wreck",
    weight: 0.2,
    radiusMin: 18,
    radiusMax: 32,
    yield: { metal: 6, data: 5, fuel: 3 },
    score: 35,
  },
];

export const HAZARD_TABLE = [
  {
    kind: "sun",
    weight: 0.6,
    radiusMin: 70,
    radiusMax: 120,
    influenceMin: 140,
    influenceMax: 220,
  },
  {
    kind: "blackHole",
    weight: 0.4,
    radiusMin: 42,
    radiusMax: 66,
    influenceMin: 190,
    influenceMax: 280,
  },
];

export const ENEMY_BASE = {
  radius: 16,
  speed: 120,
  hp: 3,
  contactDamage: 1,
};
