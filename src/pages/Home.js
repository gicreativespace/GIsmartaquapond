/**
 * GI SMART POND
 * Home Dashboard — approved Power + Equipment layout.
 */

import { Header } from '../components/Header.js';
import { FarmDetails } from '../components/FarmDetails.js';
import { BottomNavigation } from '../components/BottomNavigation.js';
import { AeratorCard } from '../components/AeratorCard.js';
import { ReportsCard } from '../components/ReportsCard.js';
import { DEMO_DATA } from '../data/demoData.js';

function createSupplyTile({ label, status, isOn, type, note }) {
  const tile = document.createElement('div');
  tile.className = `home-supply-tile ${isOn ? 'is-on' : 'is-off'} `;

  const top = document.createElement('div');
  top.className = 'home-supply-top';

  const icon = document.createElement('span');
  icon.className = `home-supply-icon ${type}`;
  icon.innerHTML = type === 'eb'
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-9 12h7l-1 8 10-13h-7l1-7z"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M7 6V4h10v2M7 19v2m10-2v2M7 12h3m4 0h3"/></svg>';

  const name = document.createElement('span');
  name.className = 'home-supply-label';
  name.textContent = label;
  top.append(icon, name);

  const value = document.createElement('strong');
  value.className = 'home-supply-status';
  value.textContent = status;

  const detail = document.createElement('span');
  detail.className = 'home-supply-note';
  detail.textContent = note;

  tile.append(top, value, detail);
  return tile;
}

function createPowerOverview(power = {}, dg = {}) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'home-power-overview';
  card.dataset.route = 'power';
  card.setAttribute('aria-label', 'Open power dashboard');

  const heading = document.createElement('div');
  heading.className = 'home-power-heading';

  const title = document.createElement('h2');
  title.textContent = 'POWER STATUS';

  const link = document.createElement('span');
  link.className = 'home-power-link';
  link.textContent = 'View Details';

  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '›';
  link.append(arrow);
  heading.append(title, link);

  const supplies = document.createElement('div');
  supplies.className = 'home-power-supplies';

  const ebOn = Boolean(power.isOn);
  const dgOn = Boolean(dg.isOn);

  supplies.append(
    createSupplyTile({
      label: 'EB SUPPLY',
      status: ebOn ? 'ON' : 'OFF',
      isOn: ebOn,
      type: 'eb',
      note: ebOn ? 'Supply Available' : 'Supply Unavailable'
    }),
    createSupplyTile({
      label: 'DG SUPPLY',
      status: dgOn ? 'ON' : 'OFF',
      isOn: dgOn,
      type: 'dg',
      note: dgOn ? 'Output Available' : 'Output Unavailable'
    })
  );

  const note = document.createElement('p');
  note.className = 'home-power-footnote';
  note.textContent = 'Supply availability indication';

  card.append(heading, supplies, note);
  return card;
}

export function Home() {
  const page = document.createElement('main');
  page.className = 'page home-page';

  const header = Header();
  const content = document.createElement('div');
  content.className = 'home-content';

  const farmDetails = FarmDetails(DEMO_DATA.farm);
  const powerOverview = createPowerOverview(DEMO_DATA.power, DEMO_DATA.dg);

  const equipmentGrid = document.createElement('section');
  equipmentGrid.className = 'home-secondary-grid';
  equipmentGrid.setAttribute('aria-label', 'Farm equipment and reports');

  const aeratorCard = AeratorCard(DEMO_DATA.aerators);
  const reportsCard = ReportsCard(DEMO_DATA.reports);
  aeratorCard.classList.add('home-compact-card');
  reportsCard.classList.add('home-compact-card');

  equipmentGrid.append(aeratorCard, reportsCard);
  content.append(farmDetails, powerOverview, equipmentGrid);

  const navigation = BottomNavigation('home');
  page.append(header, content, navigation);
  return page;
}
