
/**
 * GI SMART POND
 * DG Card Component
 *
 * Displays DG output voltage availability.
 * Does not represent engine RUN feedback.
 */

import dgUrl from '../assets/illustrations/dg-generator.svg';

export function DGCard(dg = {}) {
  const isOn = Boolean(dg.isOn);

  const card = document.createElement('button');
  card.type = 'button';
  card.className = `equipment-card dg-card ${isOn ? 'is-on' : 'is-off'}`;
  card.dataset.route = 'dg';

  card.setAttribute(
    'aria-label',
    `DG output voltage ${isOn ? 'available' : 'not available'}`
  );

  const heading = document.createElement('div');
  heading.className = 'equipment-card-heading';

  const title = document.createElement('span');
  title.className = 'equipment-card-title';
  title.textContent = 'DG';

  const status = document.createElement('span');
  status.className = 'equipment-status';
  status.textContent = isOn ? 'ON' : 'OFF';

  heading.append(title, status);

  const illustration = document.createElement('div');
  illustration.className = 'equipment-illustration';

  const image = document.createElement('img');
  image.src = dgUrl;
  image.alt = 'DG generator';

  illustration.appendChild(image);

  const footer = document.createElement('div');
  footer.className = 'equipment-card-footer';

  const description = document.createElement('span');
  description.className = 'equipment-card-description';
  description.textContent = 'DG OUTPUT';

  const indicator = document.createElement('span');
  indicator.className = 'equipment-status-indicator';

  footer.append(description, indicator);

  card.append(heading, illustration, footer);

  return card;
}
