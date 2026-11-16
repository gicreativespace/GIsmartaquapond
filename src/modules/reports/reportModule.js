
/**
 * GI SMART POND
 * Reports Module
 *
 * Calculates equipment runtime from status transitions.
 * Runtime is accumulated only while feedback is ON.
 */

export function createReportModule() {
  const records = new Map();

  function ensureRecord(id) {
    if (!records.has(id)) {
      records.set(id, {
        id,
        isOn: false,
        startedAt: null,
        totalMilliseconds: 0
      });
    }

    return records.get(id);
  }

  function updateStatus(id, isOn, timestamp = Date.now()) {
    const record = ensureRecord(id);
    const now = Number(timestamp);

    if (!Number.isFinite(now)) {
      throw new Error('Invalid timestamp');
    }

    const nextState = Boolean(isOn);

    if (record.isOn === nextState) {
      return getRuntime(id, now);
    }

    if (nextState) {
      record.startedAt = now;
      record.isOn = true;
    } else {
      if (record.startedAt !== null) {
        record.totalMilliseconds += Math.max(
          0,
          now - record.startedAt
        );
      }

      record.startedAt = null;
      record.isOn = false;
    }

    return getRuntime(id, now);
  }

  function getRuntime(id, timestamp = Date.now()) {
    const record = ensureRecord(id);

    let total = record.totalMilliseconds;

    if (record.isOn && record.startedAt !== null) {
      total += Math.max(
        0,
        Number(timestamp) - record.startedAt
      );
    }

    return {
      id,
      isOn: record.isOn,
      runtimeHours: total / 3600000
    };
  }

  function getAllRuntimes(timestamp = Date.now()) {
    return Array.from(records.keys()).map((id) =>
      getRuntime(id, timestamp)
    );
  }

  function reset() {
    records.clear();
  }

  return {
    updateStatus,
    getRuntime,
    getAllRuntimes,
    reset
  };
}
