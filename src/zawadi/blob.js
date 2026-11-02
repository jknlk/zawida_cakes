// Organic blob shapes: N radii around a centre, smoothed with a closed Catmull-Rom spline.
// Shapes are seeded per flavour so each flavour always has "its" silhouette.

export const POINTS = 11

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function radiiFor(seed, { min = 0.74, max = 1 } = {}) {
  const rnd = mulberry32(seed * 9973 + 17)
  return Array.from({ length: POINTS }, () => min + rnd() * (max - min))
}

// Closed smooth path through the polar points. r is 0..1 of `radius`.
export function blobPath(radii, { cx = 500, cy = 500, radius = 470, rotate = 0, wobble = null } = {}) {
  const n = radii.length
  const pts = radii.map((r, i) => {
    const a = (i / n) * Math.PI * 2 + rotate
    const rr = (r + (wobble ? wobble[i] : 0)) * radius
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]
  })
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d + 'Z'
}

export const lerp = (a, b, t) => a + (b - a) * t
