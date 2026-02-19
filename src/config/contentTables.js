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
    weight: 0.52,
    radiusMin: 70,
    radiusMax: 120,
    influenceMin: 140,
    influenceMax: 220,
  },
  {
    kind: "blackHole",
    variant: "fracture",
    sizeClass: "small",
    weight: 0.2,
    radiusMin: 32,
    radiusMax: 48,
    influenceMin: 150,
    influenceMax: 220,
  },
  {
    kind: "blackHole",
    variant: "maelstrom",
    sizeClass: "medium",
    weight: 0.17,
    radiusMin: 46,
    radiusMax: 68,
    influenceMin: 200,
    influenceMax: 300,
  },
  {
    kind: "blackHole",
    variant: "voidCrown",
    sizeClass: "giant",
    weight: 0.11,
    radiusMin: 66,
    radiusMax: 96,
    influenceMin: 260,
    influenceMax: 390,
  },
];

export const ENEMY_BASE = {
  radius: 16,
  speed: 120,
  hp: 3,
  contactDamage: 1,
};
