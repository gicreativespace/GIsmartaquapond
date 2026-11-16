
/**
 * GI SMART POND
 * Demo Data
 *
 * Central sample data for dashboard and monitoring pages.
 *
 * IMPORTANT:
 * These are demonstration values only.
 * Live equipment status must come from device feedback.
 */

export const DEMO_DATA = {
  farm: {
    name: 'SURI AQUA FARM',
    location: 'Ippanapadu, Andhra Pradesh',
    pondId: 'SP-001',
    pondSize: '2 Acres',

    ponds: [
      {
        id: 'SP-001',
        name: 'Pond 01',
        size: '2 Acres'
      }
    ]
  },

  power: {
    isOn: true,
    label: 'EB SUPPLY',
    status: 'ON'
  },

  dg: {
    isOn: false,
    label: 'DG OUTPUT',
    status: 'OFF'
  },

  aerators: {
    total: 10,
    running: 7,

    items: Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      name: `AERATOR ${String(index + 1).padStart(2, '0')}`,
      isOn: index < 7,
      status: index < 7 ? 'ON' : 'OFF'
    }))
  },

  reports: {
    runtimeHours: 68.4,
    ebHours: 52.4,
    dgHours: 16.0,
    aeratorHours: 47.5,

    period: 'TODAY',

    equipment: [
      {
        id: 'EB',
        name: 'EB SUPPLY',
        runtimeHours: 52.4
      },
      {
        id: 'DG',
        name: 'DG OUTPUT',
        runtimeHours: 16.0
      },
      {
        id: 'AERATOR',
        name: 'AERATORS',
        runtimeHours: 47.5
      }
    ]
  }
};

export default DEMO_DATA;
