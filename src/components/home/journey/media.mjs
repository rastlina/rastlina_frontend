export function clampProgress(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
}

export function finalFrameTime(duration, fps = 24) {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.max(0, (Math.floor(duration * fps + 0.001) - 1) / fps);
}
