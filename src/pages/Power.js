
/**
 * GI SMART POND
 * Power Page
 *
 * EB and DG electrical supply monitoring.
 * Status is based on voltage monitoring relay feedback.
 */

import { Header } from '../components/Header.js';
import { BottomNavigation } from '../components/BottomNavigation.js';
import { DEMO_DATA } from '../data/demoData.js';

function createSupplyCard(title, description, isOn, source) {
  const card = document.createElement('section');

  card.className = `supply-detail-card ${isOn ? 'is-on' : 'is-off'}`;

  const heading = document.createElement('div');
  heading.className = 'supply-detail-heading';

  const name = document.createElement('h2');
  name.className = 'supply-detail-title';
  name.textContent = title;

  const status = document.createElement('span');
  status.className = 'equipment-status';
  status.textContent = isOn ? 'ON' : 'OFF';

  heading.append(name, status);

  const detail = document.createElement('p');
  detail.className = 'supply-detail-description';
  detail.textContent = description;

  const indicatorRow = document.createElement('div');
  indicatorRow.className = 'supply-indicator-row';

  const indicator = document.createElement('span');
  indicator.className = 'equipment-status-indicator';

  const feedback = document.createElement('span');
  feedback.className = 'supply-feedback';
  feedback.textContent = isOn
    ? 'Voltage Available'
    : 'Voltage Not Available';

  indicatorRow.append(indicator, feedback);

  const sourceLabel = document.createElement('p');
  sourceLabel.className = 'supply-source-label';
  sourceLabel.textContent = source;

  card.append(heading, detail, indicatorRow, sourceLabel);

  return card;
}

export function Power() {
  const page = document.createElement('main');
  page.className = 'page power-page';

  const header = Header();

  const content = document.createElement('div');
  content.className = 'page-content';

  const pageTitle = document.createElement('h1');
  pageTitle.className = 'page-title';
  pageTitle.textContent = 'Power Monitoring';

  const pageSubtitle = document.createElement('p');
  pageSubtitle.className = 'page-subtitle';
  pageSubtitle.textContent =
    'Monitor EB and DG electrical supply availability';

  const supplySection = document.createElement('section');
  supplySection.className = 'supply-details';

  supplySection.append(
    createSupplyCard(
      'EB SUPPLY',
      'Electricity board incoming supply',
      DEMO_DATA.power.isOn,
      'Voltage Monitoring Relay'
    ),
    createSupplyCard(
      'DG OUTPUT',
      'Generator output voltage availability',
      DEMO_DATA.dg.isOn,
      'DG Output Voltage Monitoring Relay'
    )
  );

  const note = document.createElement('p');
  note.className = 'power-monitoring-note';
  note.textContent =
    'Status indicates voltage availability only. It does not represent DG engine running status.';

  content.append(
    pageTitle,
    pageSubtitle,
    supplySection,
    note
  );

  const navigation = BottomNavigation('power');

  page.append(header, content, navigation);

  return page;
}
