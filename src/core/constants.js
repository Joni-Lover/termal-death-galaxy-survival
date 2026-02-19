export const WORLD_WIDTH = 960;
export const WORLD_HEIGHT = 540;
export const FIXED_DT = 1 / 60;
export const CHUNK_SIZE = 1200;

export const PLAYER = {
  radius: 15,
  thrust: 320,
  drag: 0.86,
  maxSpeed: 310,
  maxHull: 6,
  maxEnergy: 140,
  cargoCapacity: 140,
};

export const OUTPOST = {
  x: 0,
  y: 0,
  radius: 90,
  maxEnergy: 280,
};

export const COLORS = {
  skyTop: "#061422",
  skyBottom: "#03070d",
  star: "#b9d9ff",
  player: "#8ae8ff",
  outpost: "#7fffd4",
};
