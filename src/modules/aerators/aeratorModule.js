
/**
 * GI SMART POND
 * Aerator Monitoring Module
 *
 * Manages individual aerator starter feedback.
 * Phase 1: Digital input feedback only.
 */

const DEFAULT_TOTAL = 10;

export function createAeratorModule(total = DEFAULT_TOTAL) {
  const count = Math.max(0, Math.floor(Number(total) || 0));

  let aerators = Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `AERATOR ${String(index + 1).padStart(2, '0')}`,
    isOn: false,
    lastUpdated: null
  }));

  function updateFromFeedback(id, isStarterOn) {
    const index = aerators.findIndex(
      (aerator) => aerator.id === Number(id)
    );

    if (index === -1) {
      throw new Error(`Aerator ${id} not found`);
    }

    aerators[index] = {
      ...aerators[index],
      isOn: Boolean(isStarterOn),
      lastUpdated: new Date().toISOString()
    };

    return getStatus();
  }

  function getStatus() {
    const items = aerators.map((aerator) => ({ ...aerator }));

    const running = items.filter(
      (aerator) => aerator.isOn
    ).length;

    return {
      total: items.length,
      running,
      stopped: items.length - running,
      items
    };
  }

  function reset() {
    aerators = aerators.map((aerator) => ({
      ...aerator,
      isOn: false,
      lastUpdated: null
    }));

    return getStatus();
  }

  return {
    updateFromFeedback,
    getStatus,
    reset
  };
}
