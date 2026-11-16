
/**
 * GI SMART POND
 * Farm Management Module
 *
 * Manages farm and pond information.
 * Future-ready for Firebase integration.
 */

const DEFAULT_FARM = {
  id: 'FARM-001',
  name: 'SURI AQUA FARM',
  location: 'Ippanapadu, Andhra Pradesh',
  ponds: [
    {
      id: 'SP-001',
      name: 'POND 01',
      size: '2 Acres'
    }
  ]
};

export function createFarmModule(initialFarm = DEFAULT_FARM) {
  let farm = structuredClone(initialFarm);

  function getFarm() {
    return structuredClone(farm);
  }

  function updateFarm(details = {}) {
    farm = {
      ...farm,
      ...details,
      ponds: details.ponds
        ? structuredClone(details.ponds)
        : farm.ponds
    };

    return getFarm();
  }

  function getPonds() {
    return structuredClone(farm.ponds || []);
  }

  function getPond(pondId) {
    const pond = farm.ponds?.find(
      (item) => item.id === pondId
    );

    return pond ? structuredClone(pond) : null;
  }

  function addPond(pond) {
    if (!pond?.id || !pond?.name) {
      throw new Error('Pond ID and name are required');
    }

    if (farm.ponds.some((item) => item.id === pond.id)) {
      throw new Error(`Pond ${pond.id} already exists`);
    }

    farm.ponds.push(structuredClone(pond));

    return getPonds();
  }

  function updatePond(pondId, details = {}) {
    const index = farm.ponds.findIndex(
      (item) => item.id === pondId
    );

    if (index === -1) {
      throw new Error(`Pond ${pondId} not found`);
    }

    farm.ponds[index] = {
      ...farm.ponds[index],
      ...details,
      id: pondId
    };

    return getPond(pondId);
  }

  return {
    getFarm,
    updateFarm,
    getPonds,
    getPond,
    addPond,
    updatePond
  };
}
