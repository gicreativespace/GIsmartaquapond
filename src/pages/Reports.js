/**
 * GI SMART POND
 * Daily Reports — approved minimal layout.
 * Uses the same shared Header, FarmDetails, BottomNavigation and
 * application Signature Ribbon as the Home dashboard.
 *
 * Historical values remain blank until timestamped device events
 * and Firestore daily summaries are connected.
 */

import { Header } from '../components/Header.js';
import { FarmDetails } from '../components/FarmDetails.js';
import { BottomNavigation } from '../components/BottomNavigation.js';
import { DEMO_DATA } from '../data/demoData.js';
import { subscribeToPondData } from '../data/dataProvider.js';
import { calculateRuntimeHours } from '../data/simulationEngine.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createIcon(name, className = '') {
  const paths = {
    zap: '<path d="m13 2-3 9h7l-6 11 2-9H6l7-11z"/>',
    generator: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M7 6V4h10v2M7 19v2m10-2v2M7 12h3m4 0h3"/>',
    fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10V3m2 9h7m-9 2v7m-2-9H3m10.5-1.5 5-5m-8 8-5 5m8-5 5 5m-8-8-5-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.7');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  if (className) svg.setAttribute('class', className);
  svg.innerHTML = paths[name] || paths.clock;
  return svg;
}

function getISTDateLabel(dayOffset) {
  const todayParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const values = {};
  todayParts.forEach((part) => {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
  });

  const date = new Date(Date.UTC(
    values.year,
    values.month - 1,
    values.day + dayOffset,
    12
  ));

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function createPowerCard(label, type, iconName) {
  const card = element('div', 'reports-power-item ' + type);
  card.dataset.equipmentId = type.toUpperCase();
  const heading = element('div', 'reports-power-item-heading');
  heading.append(createIcon(iconName), element('span', '', label));
  card.append(heading, element('strong', 'reports-power-hours', '-- hrs'));
  return card;
}

function createAeratorRow(number) {
  const row = element('div', 'reports-aerator-row');
  row.dataset.equipmentId = 'AERATOR_' + String(number).padStart(2, '0');
  const name = element('span', 'reports-aerator-name', 'A' + String(number).padStart(2, '0'));
  const track = element('div', 'reports-aerator-track');
  const fill = element('div', 'reports-aerator-fill');
  fill.style.width = '0%';
  track.append(fill);
  const hours = element('strong', 'reports-aerator-hours', '-- hrs');
  row.append(name, track, hours);
  return row;
}


function getSimulationPeriodWindow(timestamp, days) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date(timestamp));
  const values = {};
  parts.forEach((part) => { if (part.type !== 'literal') values[part.type] = Number(part.value); });
  const todayStart = Date.UTC(values.year, values.month - 1, values.day) - (330 * 60000);
  return { start: todayStart - ((days - 1) * 86400000), end: todayStart + 86400000 };
}

function formatReportDate(timestamp) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date(timestamp + 12 * 60 * 60 * 1000));
}

function formatEventTime(timestamp) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  }).format(new Date(timestamp));
}

export function Reports() {
  const page = element('main', 'page reports-page');
  const content = element('div', 'reports-content');

  const intro = element('section', 'reports-page-intro');
  intro.append(
    element('h1', 'page-title', 'Reports'),
    element('p', 'page-subtitle', 'Daily power and aerator summary')
  );

  let selectedPeriod = 'today';
  let selectedDays = 1;
  let activeSimulationSnapshot = null;
  const dateLabel = element('p', 'reports-date-label', getISTDateLabel(0));

  const tabs = element('div', 'reports-day-tabs');
  tabs.setAttribute('role', 'group');
  tabs.setAttribute('aria-label', 'Report day');

  const tabButtons = new Map();
  [
    { id: 'today', label: 'Today', days: 1 },
    { id: '7days', label: '7 Days', days: 7 },
    { id: '30days', label: '30 Days', days: 30 }
  ].forEach((period) => {
    const button = element('button', 'reports-day-button', period.label);
    button.type = 'button';
    button.setAttribute('aria-pressed', period.id === selectedPeriod ? 'true' : 'false');
    if (period.id === selectedPeriod) button.classList.add('active');
    button.addEventListener('click', () => {
      selectedPeriod = period.id;
      selectedDays = period.days;
      tabButtons.forEach((tab, id) => {
        const active = id === selectedPeriod;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (activeSimulationSnapshot) renderSimulationReport(activeSimulationSnapshot);
      else dateLabel.textContent = period.label + ' · ' + getISTDateLabel(0);
    });
    tabButtons.set(period.id, button);
    tabs.append(button);
  });

  const powerSection = element('section', 'reports-summary-card');
  const powerHeading = element('div', 'reports-summary-heading');
  powerHeading.append(
    createIcon('zap', 'reports-heading-icon'),
    element('h2', '', 'Power Monitoring')
  );
  const powerGrid = element('div', 'reports-power-grid');
  powerGrid.append(
    createPowerCard('EB Supply', 'eb', 'zap'),
    createPowerCard('DG Supply', 'dg', 'generator')
  );
  powerSection.append(powerHeading, powerGrid);

  const aeratorSection = element('section', 'reports-summary-card');
  const aeratorHeading = element('div', 'reports-summary-heading');
  aeratorHeading.append(
    createIcon('fan', 'reports-heading-icon'),
    element('h2', '', 'Aerator Running Hours'),
    element('span', 'reports-unit-count', '10 Units')
  );
  const aeratorList = element('div', 'reports-aerator-list');
  for (let number = 1; number <= 10; number += 1) {
    aeratorList.append(createAeratorRow(number));
  }
  aeratorSection.append(aeratorHeading, aeratorList);

  const eventsSection = element('section', 'reports-summary-card');
  const eventsHeading = element('div', 'reports-summary-heading');
  eventsHeading.append(
    createIcon('clock', 'reports-heading-icon'),
    element('h2', '', 'Events History'),
    element('span', 'reports-unit-count reports-event-count', '0 Events')
  );
  const eventsList = element('div', 'reports-event-list');
  eventsList.append(element('p', 'reports-event-empty', 'Simulation events will appear here.'));
  eventsSection.append(eventsHeading, eventsList);

  content.append(
    FarmDetails(DEMO_DATA.farm),
    intro,
    tabs,
    dateLabel,
    powerSection,
    aeratorSection,
    eventsSection
  );

  page.append(Header(), content, BottomNavigation('reports'));

  function renderSimulationReport(snapshot) {
    activeSimulationSnapshot = snapshot;
    if (!snapshot || !Array.isArray(snapshot.allEvents)) return;

    const window = getSimulationPeriodWindow(snapshot.currentTime, selectedDays);
    const reportStart = Math.max(window.start, snapshot.startTime);
    const reportEnd = Math.min(window.end, snapshot.currentTime + 1);
    const hasCoverage = reportEnd > reportStart;
    const rangeStartLabel = formatReportDate(window.start);
    const rangeEndLabel = formatReportDate(Math.min(window.end - 1, snapshot.currentTime));
    dateLabel.textContent = selectedDays === 1
      ? 'Today · ' + rangeEndLabel
      : rangeStartLabel + ' – ' + rangeEndLabel + ' · ' + selectedDays + ' days';

    ['EB', 'DG'].forEach((id) => {
      const card = page.querySelector('.reports-power-item[data-equipment-id="' + id + '"]');
      if (!card) return;
      const hours = hasCoverage
        ? calculateRuntimeHours(snapshot, id, reportStart, reportEnd)
        : null;
      card.querySelector('.reports-power-hours').textContent =
        hours === null ? '-- hrs' : hours.toFixed(1) + ' hrs';
    });

    for (let number = 1; number <= 10; number += 1) {
      const id = 'AERATOR_' + String(number).padStart(2, '0');
      const row = page.querySelector('.reports-aerator-row[data-equipment-id="' + id + '"]');
      if (!row) continue;
      const hours = hasCoverage
        ? calculateRuntimeHours(snapshot, id, reportStart, reportEnd)
        : null;
      row.querySelector('.reports-aerator-hours').textContent =
        hours === null ? '-- hrs' : hours.toFixed(1) + ' hrs';
      row.querySelector('.reports-aerator-fill').style.width =
        hours === null ? '0%' : Math.min(100, (hours / Math.max(1, selectedDays * 24)) * 100) + '%';
    }

    const visibleEvents = snapshot.allEvents.filter((event) =>
      event.time >= reportStart && event.time < reportEnd
    );
    const eventCount = page.querySelector('.reports-event-count');
    eventCount.textContent = visibleEvents.length + ' Events';
    eventsList.replaceChildren();
    if (!visibleEvents.length) {
      eventsList.append(element('p', 'reports-event-empty', 'No events recorded in this period.'));
    } else {
      visibleEvents.slice(-30).reverse().forEach((event) => {
        const row = element('div', 'reports-event-row');
        const equipment = event.id.replace('AERATOR_', 'AERATOR ');
        row.append(
          element('span', 'reports-event-time', formatEventTime(event.time)),
          element('span', 'reports-event-equipment', equipment),
          element('strong', 'reports-event-state ' + (event.state === 'ON' ? 'is-on' : 'is-off'), event.state)
        );
        eventsList.append(row);
      });
    }
  }

  subscribeToPondData((snapshot) => {
    if (snapshot && Array.isArray(snapshot.allEvents)) renderSimulationReport(snapshot);
  });
  return page;
}
