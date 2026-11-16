
/**
 * GI SMART POND
 * Power Card Component
 *
 * Displays EB supply availability.
 * Voltage monitoring relay feedback.
 */

import powerUrl from '../assets/illustrations/power.svg';

export function PowerCard(power = {}) {
  const isOn = Boolean(power.isOn);

  const card = document.createElement('button');
  card.type = 'button';
  card.className = `equipment-card power-card ${isOn ? 'is-on' : 'is-off'}`;
  card.dataset.route = 'power';

  card.setAttribute('aria-label', `Power supply ${isOn ? 'ON' : 'OFF'}`);

  const heading = document.createElement('div');
  heading.className = 'equipment-card-heading';

  const title = document.createElement('span');
  title.className = 'equipment-card-title';
  title.textContent = 'POWER';

  const status = document.createElement('span');
  status.className = 'equipment-status';
  status.textContent = isOn ? 'ON' : 'OFF';

  heading.append(title, status);

  const illustration = document.createElement('div');
  illustration.className = 'equipment-illustration';

  const image = document.createElement('img');
  image.src = powerUrl;
  image.alt = 'Electrical power symbol';

  illustration.appendChild(image);

  const footer = document.createElement('div');
  footer.className = 'equipment-card-footer';

  const description = document.createElement('span');
  description.className = 'equipment-card-description';
  description.textContent = 'EB SUPPLY';

  const indicator = document.createElement('span');
  indicator.className = 'equipment-status-indicator';

  footer.append(description, indicator);

  card.append(heading, illustration, footer);

  return card;
}
