
/**
 * GI SMART POND
 * DG Monitoring Module
 *
 * Handles DG output voltage availability.
 * Does not represent engine RUN status.
 */

export function createDGModule() {
  let state = {
    isOn: false,
    outputVoltageAvailable: false,
    lastUpdated: null
  };

  function updateFromFeedback(isVoltageAvailable) {
    const available = Boolean(isVoltageAvailable);

    state = {
      isOn: available,
      outputVoltageAvailable: available,
      lastUpdated: new Date().toISOString()
    };

    return getStatus();
  }

  function getStatus() {
    return { ...state };
  }

  function reset() {
    state = {
      isOn: false,
      outputVoltageAvailable: false,
      lastUpdated: null
    };

    return getStatus();
  }

  return {
    updateFromFeedback,
    getStatus,
    reset
  };
}
