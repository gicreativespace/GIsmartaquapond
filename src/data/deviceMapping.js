
/**
 * GI SMART POND
 * Device Mapping
 *
 * Phase 1: Digital Input feedback mapping.
 *
 * DI-01       : EB voltage availability
 * DI-02       : DG output voltage availability
 * DI-03 to 12 : Aerator starter auxiliary feedback
 *
 * IMPORTANT:
 * Array indexes are zero-based.
 * DI numbers are one-based.
 * Verify actual wiring before connecting hardware.
 */

export const DEVICE_MAPPING = {
  totalInputs: 12,

  inputs: [
    {
      di: 1,
      index: 0,
      id: 'EB',
      name: 'EB SUPPLY',
      type: 'power',
      description: 'EB voltage monitoring relay feedback'
    },
    {
      di: 2,
      index: 1,
      id: 'DG',
      name: 'DG OUTPUT',
      type: 'dg',
      description: 'DG output voltage monitoring relay feedback'
    },

    ...Array.from({ length: 10 }, (_, index) => ({
      di: index + 3,
      index: index + 2,
      id: `AERATOR-${index + 1}`,
      name: `AERATOR ${String(index + 1).padStart(2, '0')}`,
      type: 'aerator',
      aeratorId: index + 1,
      description: 'Starter auxiliary contact feedback'
    }))
  ]
};

/**
 * Get device configuration using DI number.
 * DI number starts from 1.
 */
export function getDeviceByDI(diNumber) {
  const di = Number(diNumber);

  if (!Number.isInteger(di)) {
    return null;
  }

  return (
    DEVICE_MAPPING.inputs.find(
      (device) => device.di === di
    ) || null
  );
}

/**
 * Get device configuration using array index.
 * Array index starts from 0.
 */
export function getDeviceByInputIndex(index) {
  const inputIndex = Number(index);

  if (!Number.isInteger(inputIndex)) {
    return null;
  }

  return (
    DEVICE_MAPPING.inputs.find(
      (device) => device.index === inputIndex
    ) || null
  );
}

/**
 * Convert raw digital input values
 * into named equipment feedback.
 */
export function mapDigitalInputs(inputs) {
  if (
    !Array.isArray(inputs) ||
    inputs.length < DEVICE_MAPPING.totalInputs
  ) {
    throw new Error(
      `Expected ${DEVICE_MAPPING.totalInputs} digital inputs`
    );
  }

  return DEVICE_MAPPING.inputs.map((device) => ({
    ...device,
    isOn: Boolean(inputs[device.index])
  }));
}

/**
 * Get all aerator mappings.
 */
export function getAeratorMappings() {
  return DEVICE_MAPPING.inputs.filter(
    (device) => device.type === 'aerator'
  );
}
