
/**
 * GI SMART POND
 * Farm Details Component
 *
 * Reusable for multiple farms and ponds.
 * Future-ready for Firebase data.
 */

const DEFAULT_FARM = {
  name: 'SURI AQUA FARM',
  location: 'Ippanapadu, Andhra Pradesh',
  pondId: 'SP-001',
  pondSize: '2 Acres'
};

export function FarmDetails(farm = {}) {
  const details = {
    ...DEFAULT_FARM,
    ...farm
  };

  const card = document.createElement('section');
  card.className = 'farm-details-card';
  card.setAttribute('aria-label', 'Farm details');

  // Farm name
  const name = document.createElement('h2');
  name.className = 'farm-name';
  name.textContent = details.name;

  // Farm location
  const location = document.createElement('p');
  location.className = 'farm-location';
  location.textContent = details.location;

  // Pond information
  const meta = document.createElement('div');
  meta.className = 'farm-meta';

  const pondId = createMetaItem(
    'Pond ID',
    details.pondId
  );

  const pondSize = createMetaItem(
    'Pond Size',
    details.pondSize
  );

  meta.append(pondId, pondSize);

  card.append(name, location, meta);

  return card;
}

/**
 * Creates a reusable farm metadata item.
 */

function createMetaItem(label, value) {
  const item = document.createElement('div');
  item.className = 'farm-meta-item';

  const labelElement = document.createElement('span');
  labelElement.className = 'farm-meta-label';
  labelElement.textContent = `${label}:`;

  const valueElement = document.createElement('strong');
  valueElement.className = 'farm-meta-value';
  valueElement.textContent = value;

  item.append(labelElement, valueElement);

  return item;
}
