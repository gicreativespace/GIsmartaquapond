/**
 * GI SMART POND
 * Power Monitoring Dashboard
 *
 * EB and DG status comes from voltage relay feedback.
 * Current values are demonstration data until device sync is connected.
 */

import { Header } from '../components/Header.js';
import { BottomNavigation } from '../components/BottomNavigation.js';
import { DEMO_DATA } from '../data/demoData.js';

function createPowerIcon(kind) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.7');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    kind === 'eb'
      ? 'M4 20V8l8-5 8 5v12M8 20v-6h8v6M9 9h.01M15 9h.01'
      : 'M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6M12 4V2'
  );
  svg.appendChild(path);
  return svg;
}

function createSupplyCard({ title, description, isOn, source, kind }) {
  const card = document.createElement('section');
  card.className = `supply-detail-card ${isOn ? 'is-on' : 'is-off'}`;

  const top = document.createElement('div');
  top.className = 'supply-card-top';

  const iconBox = document.createElement('div');
  iconBox.className = `supply-icon-box ${kind}`;
  iconBox.appendChild(createPowerIcon(kind));

  const heading = document.createElement('div');
  heading.className = 'supply-card-heading';

  const titleElement = document.createElement('h2');
  titleElement.className = 'supply-detail-title';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'supply-detail-description';
  descriptionElement.textContent = description;

  heading.append(titleElement, descriptionElement);
  top.append(iconBox, heading);

  const statusRow = document.createElement('div');
  statusRow.className = 'supply-status-row';

  const statusText = document.createElement('div');
  statusText.className = 'supply-status-text';

  const dot = document.createElement('span');
  dot.className = 'equipment-status-indicator';

  const feedback = document.createElement('span');
  feedback.className = 'supply-feedback';
  feedback.textContent = isOn ? 'Voltage Available' : 'Voltage Not Available';

  statusText.append(dot, feedback);

  const badge = document.createElement('span');
  badge.className = 'supply-state-badge';
  badge.textContent = isOn ? 'ON' : 'OFF';

  statusRow.append(statusText, badge);

  const sourceRow = document.createElement('div');
  sourceRow.className = 'supply-source-row';

  const sourceLabel = document.createElement('span');
  sourceLabel.textContent = 'FEEDBACK SOURCE';

  const sourceValue = document.createElement('strong');
  sourceValue.textContent = source;

  sourceRow.append(sourceLabel, sourceValue);
  card.append(top, statusRow, sourceRow);

  return card;
}

export function Power() {
  const page = document.createElement('main');
  page.className = 'page power-page';

  const content = document.createElement('div');
  content.className = 'page-content';

  const intro = document.createElement('section');
  intro.className = 'power-page-intro';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'power-eyebrow';
  eyebrow.textContent = 'ELECTRICAL SYSTEM';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Power Monitoring';

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Supply availability overview';

  intro.append(eyebrow, title, subtitle);

  const sectionHeading = document.createElement('div');
  sectionHeading.className = 'power-section-heading';

  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = 'SUPPLY STATUS';

  const sectionMeta = document.createElement('span');
  sectionMeta.textContent = 'EB / DG';
  sectionHeading.append(sectionTitle, sectionMeta);

  const supplySection = document.createElement('section');
  supplySection.className = 'supply-details';
  supplySection.setAttribute('aria-label', 'Electrical supply status');

  supplySection.append(
    createSupplyCard({
      title: 'EB SUPPLY',
      description: 'Electricity board incoming supply',
      isOn: DEMO_DATA.power.isOn,
      source: 'Voltage monitoring relay',
      kind: 'eb'
    }),
    createSupplyCard({
      title: 'DG OUTPUT',
      description: 'Generator output voltage',
      isOn: DEMO_DATA.dg.isOn,
      source: 'DG output voltage relay',
      kind: 'dg'
    })
  );

  const note = document.createElement('aside');
  note.className = 'power-monitoring-note';

  const noteTitle = document.createElement('strong');
  noteTitle.textContent = 'Monitoring note';

  const noteText = document.createElement('p');
  noteText.textContent =
    'ON / OFF indicates voltage availability only. DG output status does not confirm that the generator engine is running.';

  note.append(noteTitle, noteText);

  content.append(intro, sectionHeading, supplySection, note);

  page.append(Header(), content, BottomNavigation('power'));
  return page;
}
