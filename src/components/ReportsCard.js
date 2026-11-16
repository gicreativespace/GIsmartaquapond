
/**
 * GI SMART POND
 * Reports Card Component
 *
 * Displays total equipment runtime.
 * Demo value can be replaced with live report data.
 */

import reportsUrl from '../assets/illustrations/reports.svg';

export function ReportsCard(reports = {}) {
  const runtime = Number(reports.runtimeHours ?? 68.4);

  const safeRuntime = Math.max(0, runtime);
  const formattedRuntime = safeRuntime.toFixed(1);

  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'equipment-card reports-card';
  card.dataset.route = 'reports';

  card.setAttribute(
    'aria-label',
    `Reports, total runtime ${formattedRuntime} hours`
  );

  const heading = document.createElement('div');
  heading.className = 'equipment-card-heading';

  const title = document.createElement('span');
  title.className = 'equipment-card-title';
  title.textContent = 'REPORTS';

  const status = document.createElement('span');
  status.className = 'equipment-status reports-period';
  status.textContent = 'TODAY';

  heading.append(title, status);

  const illustration = document.createElement('div');
  illustration.className = 'equipment-illustration';

  const image = document.createElement('img');
  image.src = reportsUrl;
  image.alt = 'Runtime reports chart';

  illustration.appendChild(image);

  const footer = document.createElement('div');
  footer.className = 'equipment-card-footer';

  const description = document.createElement('span');
  description.className = 'equipment-card-description';
  description.textContent = `${formattedRuntime} HRS`;

  const indicator = document.createElement('span');
  indicator.className = 'equipment-status-indicator';

  footer.append(description, indicator);

  card.append(heading, illustration, footer);

  return card;
}
