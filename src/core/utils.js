export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function length(x, y) {
  return Math.hypot(x, y);
}

export function makeSeededRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash2(x, y, base = 1337) {
  let h = base ^ (x * 374761393) ^ (y * 668265263);
  h = (h ^ (h >>> 13)) * 1274126177;
  return h ^ (h >>> 16);
}

export function pickWeighted(items, rng) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = rng() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}
