export type Point = [number, number];

/** Smooth line through the values, plus the closed area under it. */
export function chartPaths(values: number[], w: number, h: number, pad: number) {
  const n = values.length;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const points: Point[] = values.map((v, i) => [
    pad + (n < 2 ? 0 : (i / (n - 1)) * (w - pad * 2)),
    h - pad - ((v - lo) / span) * (h - pad * 2),
  ]);

  let line = '';
  points.forEach(([x, y], i) => {
    if (i === 0) {
      line = `M${x.toFixed(1)},${y.toFixed(1)}`;
      return;
    }
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    line += ` C${cx.toFixed(1)},${py.toFixed(1)} ${cx.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const area = points.length
    ? `${line} L${points[n - 1][0].toFixed(1)},${(h - pad).toFixed(1)} L${points[0][0].toFixed(1)},${(h - pad).toFixed(1)} Z`
    : '';

  return { line, area, points };
}

/** y of a value inside the same box, so guide lines line up with the curve. */
export function valueY(value: number, values: number[], h: number, pad: number) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  return h - pad - ((value - lo) / span) * (h - pad * 2);
}

export function nearestIndex(xs: number[], x: number) {
  let best = 0;
  for (let i = 1; i < xs.length; i += 1) {
    if (Math.abs(xs[i] - x) < Math.abs(xs[best] - x)) best = i;
  }
  return best;
}
