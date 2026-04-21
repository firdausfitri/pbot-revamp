export function clampPercentage(value) {
  if (Number.isNaN(Number(value))) {
    return 0;
  }
  return Math.max(0, Math.min(100, Number(value)));
}
