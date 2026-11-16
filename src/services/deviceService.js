
/**
 * GI SMART POND
 * Device Service
 *
 * Central device communication manager.
 * Hardware transport will be integrated later.
 */

export function createDeviceService() {
  let deviceState = {
    connected: false,
    deviceId: null,
    lastSeen: null,
    connectionType: 'MODBUS_RTU'
  };

  const listeners = new Set();

  function notifyListeners() {
    const snapshot = getDeviceStatus();

    listeners.forEach((listener) => {
      listener(snapshot);
    });
  }

  function updateConnection(isConnected, deviceId = null) {
    deviceState = {
      ...deviceState,
      connected: Boolean(isConnected),
      deviceId: deviceId || deviceState.deviceId,
      lastSeen: new Date().toISOString()
    };

    notifyListeners();

    return getDeviceStatus();
  }

  function getDeviceStatus() {
    return { ...deviceState };
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function disconnect() {
    deviceState = {
      ...deviceState,
      connected: false,
      lastSeen: new Date().toISOString()
    };

    notifyListeners();

    return getDeviceStatus();
  }

  return {
    updateConnection,
    getDeviceStatus,
    subscribe,
    disconnect
  };
}
