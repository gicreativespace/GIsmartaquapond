
/**
 * GI SMART POND
 * Calculation Utilities
 *
 * Common equipment and runtime calculations.
 */

export function calculateRunningPercentage(running, total) {
  const count = Math.max(0, Number(running) || 0);
  const capacity = Math.max(0, Number(total) || 0);

  if (capacity === 0) return 0;

  return Math.round(
    (Math.min(count, capacity) / capacity) * 100
  );
}

export function calculateStoppedCount(running, total) {
  const count = Math.max(0, Number(running) || 0);
  const capacity = Math.max(0, Number(total) || 0);

  return Math.max(0, capacity - count);
}

export function millisecondsToHours(milliseconds) {
  const value = Number(milliseconds);

  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value / 3600000;
}

export function formatRuntimeHours(hours) {
  const value = Number(hours);

  if (!Number.isFinite(value) || value < 0) {
    return '0.0 HRS';
  }

  return `${value.toFixed(1)} HRS`;
}

export function calculateAverageRuntime(runtimes = []) {
  if (!Array.isArray(runtimes) || runtimes.length === 0) {
    return 0;
  }

  const validValues = runtimes
    .map(Number)
    .filter((value) => Number.isFinite(value) && value >= 0);

  if (validValues.length === 0) return 0;

  const total = validValues.reduce(
    (sum, value) => sum + value,
    0
  );

  return total / validValues.length;
}

export function getEquipmentCounts(items = []) {
  const list = Array.isArray(items) ? items : [];

  const running = list.filter(
    (item) => Boolean(item.isOn)
  ).length;

  return {
    total: list.length,
    running,
    stopped: list.length - running,
    runningPercentage: calculateRunningPercentage(
      running,
      list.length
    )
  };
}

export function isVoltageAvailable(feedback) {
  return feedback === true || feedback === 1;
}
