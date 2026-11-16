
/**
 * GI SMART POND
 * Aerators Page
 *
 * Displays individual aerator starter feedback.
 * Does not claim physical paddle-wheel rotation sensing.
 */

import { Header } from '../components/Header.js';
import { BottomNavigation } from '../components/BottomNavigation.js';
import { DEMO_DATA } from '../data/demoData.js';

function createAeratorItem(aerator) {
  const isOn = Boolean(aerator.isOn);

  const item = document.createElement('article');
  item.className = `aerator-detail-card ${isOn ? 'is-on' : 'is-off'}`;

  const heading = document.createElement('div');
  heading.className = 'aerator-detail-heading';

  const name = document.createElement('h2');
  name.className = 'aerator-detail-name';
  name.textContent = aerator.name;

  const status = document.createElement('span');
  status.className = 'equipment-status';
  status.textContent = isOn ? 'ON' : 'OFF';

  heading.append(name, status);

  const visual = document.createElement('div');
  visual.className = 'aerator-detail-visual';

  const illustration = document.createElement('div');
  illustration.className = 'aerator-wheel-illustration';

  const image = document.createElement('img');
  image.src = '/src/assets/illustrations/aerator.svg';
  image.alt = 'Aerator paddle wheel';

  illustration.appendChild(image);
  visual.appendChild(illustration);

  const feedback = document.createElement('p');
  feedback.className = 'aerator-feedback';
  feedback.textContent = isOn
    ? 'Starter Feedback: ON'
    : 'Starter Feedback: OFF';

  item.append(heading, visual, feedback);

  return item;
}

export function Aerators() {
  const page = document.createElement('main');
  page.className = 'page aerators-page';

  const header = Header();

  const content = document.createElement('div');
  content.className = 'page-content';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Aerator Monitoring';

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Individual starter feedback status';

  const aerators = DEMO_DATA.aerators.items || [];

  const running = aerators.filter(
    (aerator) => Boolean(aerator.isOn)
  ).length;

  const stopped = aerators.length - running;

  const summary = document.createElement('section');
  summary.className = 'aerator-summary';

  const totalText = document.createElement('p');
  totalText.className = 'aerator-summary-total';
  totalText.textContent = `${running} / ${aerators.length} ON`;

  const breakdown = document.createElement('p');
  breakdown.className = 'aerator-summary-breakdown';
  breakdown.textContent = `${running} Running · ${stopped} Stopped`;

  summary.append(totalText, breakdown);

  const list = document.createElement('section');
  list.className = 'aerator-list';
  list.setAttribute('aria-label', 'Individual aerator status');

  aerators.forEach((aerator) => {
    list.appendChild(createAeratorItem(aerator));
  });

  const note = document.createElement('p');
  note.className = 'aerator-monitoring-note';
  note.textContent =
    'Wheel animation represents starter feedback status. Actual paddle-wheel rotation is not independently sensed.';

  content.append(
    title,
    subtitle,
    summary,
    list,
    note
  );

  const navigation = BottomNavigation('aerators');

  page.append(header, content, navigation);

  return page;
}
