
/**
 * GI SMART POND
 * Power Monitoring Module
 *
 * Handles EB voltage availability state.
 * Phase 1: Digital input feedback.
 */

export function createPowerModule() {
  let state = {
    isOn: false,
    voltageAvailable: false,
    lastUpdated: null
  };

  function updateFromFeedback(isVoltageAvailable) {
    const available = Boolean(isVoltageAvailable);

    state = {
      isOn: available,
      voltageAvailable: available,
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
      voltageAvailable: false,
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
