/**
 * GI SMART POND
 * Aerators Page
 *
 * Displays individual aerator starter feedback.
 * Animation represents starter feedback only; physical wheel rotation
 * is not independently sensed.
 */

import { Header } from '../components/Header.js';
import { BottomNavigation } from '../components/BottomNavigation.js';
import { DEMO_DATA } from '../data/demoData.js';
import { subscribeToPondData } from '../data/dataProvider.js';
import aeratorIllustration from '../assets/illustrations/aerator.svg?raw';

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
  illustration.innerHTML = aeratorIllustration;

  const svg = illustration.querySelector('svg.aerator-illustration');
  if (svg) {
    svg.classList.add(isOn ? 'is-on' : 'is-off');
    svg.setAttribute('role', 'img');
    svg.setAttribute(
      'aria-label',
      isOn ? 'Aerator running with moving water' : 'Aerator stopped'
    );
  }

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

  const intro = document.createElement('div');
  intro.className = 'aerator-page-intro';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Aerator Monitoring';

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Individual starter feedback status';

  intro.append(title, subtitle);

  const aerators = DEMO_DATA.aerators.items || [];
  const running = aerators.filter((aerator) => Boolean(aerator.isOn)).length;
  const stopped = aerators.length - running;

  const summary = document.createElement('section');
  summary.className = 'aerator-summary';
  summary.setAttribute('aria-label', 'Aerator status summary');

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

  content.append(intro, summary, list, note);

  const navigation = BottomNavigation('aerators');
  page.append(header, content, navigation);

  subscribeToPondData((snapshot) => {
    if (!snapshot || !Array.isArray(snapshot.aerators)) return;
    const liveAerators = snapshot.aerators.map((item, index) => ({
      id: index + 1,
      name: 'AERATOR ' + String(index + 1).padStart(2, '0'),
      isOn: item.state === 'ON'
    }));
    const liveRunning = liveAerators.filter((item) => item.isOn).length;
    totalText.textContent = liveRunning + ' / ' + liveAerators.length + ' ON';
    breakdown.textContent = liveRunning + ' Running · ' + (liveAerators.length - liveRunning) + ' Stopped';
    list.replaceChildren();
    liveAerators.forEach((item) => list.appendChild(createAeratorItem(item)));
  });

  return page;
}
