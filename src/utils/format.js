export function formatDuration(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);

  let timeStr = `${m}:${s < 10 ? '0' + s : s}`;
  if (h > 0) timeStr = `${h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  return timeStr;
}
