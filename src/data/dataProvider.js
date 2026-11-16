/**
 * GI SMART POND — Shared Data Provider Contract
 * Dashboard consumers can use this interface for Simulation or Hardware data.
 * No Firebase or hardware connection is created here.
 */

let activeProvider = null;
const listeners = new Set();

export function setDataProvider(provider) {
  if (!provider || typeof provider.getSnapshot !== 'function') {
    throw new TypeError('A valid GI SMART POND data provider is required.');
  }
  activeProvider = provider;
  listeners.forEach((listener) => listener(provider.getSnapshot()));
}

export function getDataProvider() {
  return activeProvider;
}

export function subscribeToPondData(listener) {
  if (typeof listener !== 'function') return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishPondSnapshot(snapshot) {
  listeners.forEach((listener) => listener(snapshot));
}
