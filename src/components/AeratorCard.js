
/**
 * GI SMART POND
 * Aerator Card Component
 *
 * Displays aerator starter feedback summary.
 * Animation represents starter status only.
 */

import aeratorUrl from '../assets/illustrations/aerator.svg';

export function AeratorCard(aerators = {}) {
  const total = Number(aerators.total ?? 10);
  const running = Number(aerators.running ?? 7);

  const safeTotal = Math.max(0, total);
  const safeRunning = Math.min(
    safeTotal,
    Math.max(0, running)
  );

  const isOn = safeRunning > 0;

  const card = document.createElement('button');
  card.type = 'button';
  card.className = `equipment-card aerator-card ${isOn ? 'is-on' : 'is-off'}`;
  card.dataset.route = 'aerators';

  card.setAttribute(
    'aria-label',
    `${safeRunning} of ${safeTotal} aerators have starter feedback ON`
  );

  const heading = document.createElement('div');
  heading.className = 'equipment-card-heading';

  const title = document.createElement('span');
  title.className = 'equipment-card-title';
  title.textContent = 'AERATORS';

  const status = document.createElement('span');
  status.className = 'equipment-status';
  status.textContent = `${String(safeRunning).padStart(2, '0')} / ${String(safeTotal).padStart(2, '0')} ON`;

  heading.append(title, status);

  const illustration = document.createElement('div');
  illustration.className = 'equipment-illustration aerator-card-illustration';

  const image = document.createElement('img');
  image.src = aeratorUrl;
  image.alt = 'Aerator paddle wheel illustration';

  illustration.appendChild(image);

  const footer = document.createElement('div');
  footer.className = 'equipment-card-footer';

  const description = document.createElement('span');
  description.className = 'equipment-card-description';
  description.textContent = 'STARTER FEEDBACK';

  const indicator = document.createElement('span');
  indicator.className = 'equipment-status-indicator';

  footer.append(description, indicator);

  card.append(heading, illustration, footer);

  return card;
}
