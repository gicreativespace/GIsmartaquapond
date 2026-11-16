
/**
 * GI SMART POND
 * Sync Service
 *
 * Coordinates device feedback with monitoring modules.
 * Firebase synchronization will be connected later.
 */

export function createSyncService({
  powerModule,
  dgModule,
  aeratorModule,
  reportModule
} = {}) {
  if (!powerModule || !dgModule || !aeratorModule || !reportModule) {
    throw new Error('All monitoring modules are required');
  }

  let lastSnapshot = null;

  function syncDeviceInputs(inputs, timestamp = Date.now()) {
    if (!Array.isArray(inputs) || inputs.length < 12) {
      throw new Error('Expected at least 12 digital inputs');
    }

    const now = Number(timestamp);

    if (!Number.isFinite(now)) {
      throw new Error('Invalid sync timestamp');
    }

    // Phase 1 input mapping:
    // DI-01: EB voltage availability
    // DI-02: DG output voltage availability
    // DI-03 to DI-12: Aerator 01 to 10 starter feedback

    const powerOn = Boolean(inputs[0]);
    const dgOn = Boolean(inputs[1]);

    const aeratorStates = inputs.slice(2, 12).map(Boolean);

    // Update equipment modules.
    const power = powerModule.updateFromFeedback(powerOn);
    const dg = dgModule.updateFromFeedback(dgOn);

    const aerators = aeratorStates.map((isOn, index) => {
      aeratorModule.updateFromFeedback(index + 1, isOn);

      return {
        id: index + 1,
        isOn
      };
    });

    // Update runtime tracking.
    reportModule.updateStatus('EB', powerOn, now);
    reportModule.updateStatus('DG', dgOn, now);

    aeratorStates.forEach((isOn, index) => {
      reportModule.updateStatus(
        `AERATOR-${index + 1}`,
        isOn,
        now
      );
    });

    lastSnapshot = {
      timestamp: new Date(now).toISOString(),
      power,
      dg,
      aerators
    };

    return getLastSnapshot();
  }

  function getLastSnapshot() {
    if (!lastSnapshot) {
      return null;
    }

    return structuredClone(lastSnapshot);
  }

  return {
    syncDeviceInputs,
    getLastSnapshot
  };
}
