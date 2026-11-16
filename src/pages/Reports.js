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


function getISTDateParts(timestamp) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date(timestamp));
  const values = {};
  parts.forEach((part) => { if (part.type !== 'literal') values[part.type] = Number(part.value); });
  return values;
}

function getISTDayWindow(timestamp) {
  const values = getISTDateParts(timestamp);
  const start = Date.UTC(values.year, values.month - 1, values.day) - (330 * 60000);
  return { start, end: start + 86400000 };
}

function getReportPeriodWindow(timestamp, period) {
  const day = getISTDayWindow(timestamp);
  if (period === 'yesterday') return { start: day.start - 86400000, end: day.start };
  if (period === 'week') return { start: day.start - (6 * 86400000), end: day.end };
  if (period === 'month') {
    const values = getISTDateParts(timestamp);
    return {
      start: Date.UTC(values.year, values.month - 1, 1) - (330 * 60000),
      end: Date.UTC(values.year, values.month, 1) - (330 * 60000)
    };
  }
  return day;
}

function formatReportDate(timestamp) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date(timestamp));
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
  let activeSimulationSnapshot = null;
  const dateLabel = element('p', 'reports-date-label', getISTDateLabel(0));

  const tabs = element('div', 'reports-day-tabs');
  tabs.setAttribute('role', 'group');
  tabs.setAttribute('aria-label', 'Report period');

  const tabButtons = new Map();
  [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' }
  ].forEach((period) => {
    const button = element('button', 'reports-day-button', period.label);
    button.type = 'button';
    button.setAttribute('aria-pressed', period.id === selectedPeriod ? 'true' : 'false');
    if (period.id === selectedPeriod) button.classList.add('active');
    button.addEventListener('click', () => {
      selectedPeriod = period.id;
      tabButtons.forEach((tab, id) => {
        const active = id === selectedPeriod;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      syncReportSections();
      if (activeSimulationSnapshot) renderSimulationReport(activeSimulationSnapshot);
      else dateLabel.textContent = period.label + ' · ' + getISTDateLabel(period.id === 'yesterday' ? -1 : 0);
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

  const exportSection = element('section', 'reports-summary-card reports-export-section');
  const exportHeading = element('div', 'reports-summary-heading');
  exportHeading.append(
    createIcon('clock', 'reports-heading-icon'),
    element('h2', '', 'Export Reports')
  );
  const exportActions = element('div', 'reports-export-actions');
  const pdfButton = element('button', 'reports-export-button', 'PDF');
  const csvButton = element('button', 'reports-export-button', 'Excel / CSV');
  const posterButton = element('button', 'reports-export-button', 'Poster PNG');
  [pdfButton, csvButton, posterButton].forEach((button) => {
    button.type = 'button';
    exportActions.append(button);
  });
  exportSection.append(exportHeading, exportActions);

  pdfButton.addEventListener('click', () => window.print());

  function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = element('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function csvCell(value) {
    return '"' + String(value ?? '').replace(/"/g, '""') + '"';
  }

  csvButton.addEventListener('click', () => {
    const rows = [
      ['GI SMART POND REPORT', dateLabel.textContent],
      ['Equipment', 'Running Hours'],
      ['EB Supply', page.querySelector('[data-equipment-id="EB"] .reports-power-hours')?.textContent || '--'],
      ['DG Supply', page.querySelector('[data-equipment-id="DG"] .reports-power-hours')?.textContent || '--']
    ];
    if (selectedPeriod === 'today' || selectedPeriod === 'yesterday') {
      rows.push(['Aerator', 'Running Hours']);
      for (let number = 1; number <= 10; number += 1) {
        const id = 'AERATOR_' + String(number).padStart(2, '0');
        const value = page.querySelector('[data-equipment-id="' + id + '"] .reports-aerator-hours')?.textContent || '--';
        rows.push([id.replace('_', ' '), value]);
      }
      rows.push([], ['Events History'], ['Time', 'Equipment', 'State']);
      eventsList.querySelectorAll('.reports-event-row').forEach((row) => {
        rows.push(Array.from(row.children).map((cell) => cell.textContent));
      });
    }
    const csv = '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
    downloadFile(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'GI-SMART-POND-' + selectedPeriod + '.csv');
  });

  posterButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#F2F8FA';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#123B50';
    context.font = '600 54px Inter, Arial, sans-serif';
    context.fillText('GI SMART POND', 76, 120);
    context.fillStyle = '#078D87';
    context.font = '28px Inter, Arial, sans-serif';
    context.fillText('SMART AQUACULTURE MONITORING', 78, 170);
    context.fillStyle = '#123B50';
    context.font = '600 38px Inter, Arial, sans-serif';
    context.fillText('Pond Performance Report', 76, 270);
    context.font = '28px Inter, Arial, sans-serif';
    context.fillStyle = '#607782';
    context.fillText(dateLabel.textContent, 78, 320);
    const drawMetric = (label, value, x, y, fill) => {
      context.fillStyle = fill;
      context.beginPath();
      context.roundRect(x, y, 430, 190, 24);
      context.fill();
      context.fillStyle = '#56717D';
      context.font = '30px Inter, Arial, sans-serif';
      context.fillText(label, x + 34, y + 62);
      context.fillStyle = '#123B50';
      context.font = '600 54px Inter, Arial, sans-serif';
      context.fillText(value, x + 34, y + 132);
    };
    drawMetric('EB SUPPLY', powerGrid.querySelector('.eb .reports-power-hours').textContent, 76, 390, '#E5F4EC');
    drawMetric('DG SUPPLY', powerGrid.querySelector('.dg .reports-power-hours').textContent, 574, 390, '#E8F1F8');
    context.fillStyle = '#123B50';
    context.font = '600 34px Inter, Arial, sans-serif';
    context.fillText('Aerator Running Hours', 78, 700);
    if (selectedPeriod === 'today' || selectedPeriod === 'yesterday') {
      for (let number = 1; number <= 10; number += 1) {
        const id = 'AERATOR_' + String(number).padStart(2, '0');
        const value = page.querySelector('[data-equipment-id="' + id + '"] .reports-aerator-hours')?.textContent || '-- hrs';
        const x = number <= 5 ? 82 : 570;
        const y = 770 + ((number - 1) % 5) * 76;
        context.fillStyle = '#56717D';
        context.font = '27px Inter, Arial, sans-serif';
        context.fillText('A' + String(number).padStart(2, '0'), x, y);
        context.fillStyle = '#123B50';
        context.font = '600 27px Inter, Arial, sans-serif';
        context.fillText(value, x + 230, y);
      }
    } else {
      context.fillStyle = '#607782';
      context.font = '26px Inter, Arial, sans-serif';
      context.fillText('Weekly and monthly view: EB / DG supply totals', 80, 790);
    }
    context.fillStyle = '#078D87';
    context.font = '28px Inter, Arial, sans-serif';
    context.fillText('Inspired by Godavari.', 78, 1260);
    canvas.toBlob((blob) => {
      if (blob) downloadFile(blob, 'GI-SMART-POND-' + selectedPeriod + '-poster.png');
    }, 'image/png');
  });

  content.append(
    FarmDetails(DEMO_DATA.farm),
    intro,
    tabs,
    dateLabel,
    powerSection,
    aeratorSection,
    eventsSection,
    exportSection
  );

  page.append(Header(), content, BottomNavigation('reports'));

  function syncReportSections() {
    const showDailyDetails = selectedPeriod === 'today' || selectedPeriod === 'yesterday';
    aeratorSection.remove();
    eventsSection.remove();
    if (showDailyDetails) content.append(aeratorSection, eventsSection);
  }

  syncReportSections();

  function renderSimulationReport(snapshot) {
    activeSimulationSnapshot = snapshot;
    if (!snapshot || !Array.isArray(snapshot.allEvents)) return;

    // Report tabs always follow the real India calendar, not the playback cursor
    // or the last date in the uploaded file. Uploaded data only limits coverage.
    const window = getReportPeriodWindow(Date.now(), selectedPeriod);
    const dataStart = snapshot.startTime;
    const dataEnd = getISTDayWindow(snapshot.endTime).end;
    const reportStart = Math.max(window.start, dataStart);
    const reportEnd = Math.min(window.end, dataEnd);
    const hasCoverage = reportEnd > reportStart;
    const rangeStartLabel = formatReportDate(reportStart);
    const rangeEndLabel = hasCoverage ? formatReportDate(reportEnd - 1) : formatReportDate(window.start);
    const periodLabels = { today: 'Today', yesterday: 'Yesterday', week: 'Week', month: 'Month' };
    dateLabel.textContent = selectedPeriod === 'today' || selectedPeriod === 'yesterday'
      ? periodLabels[selectedPeriod] + ' · ' + rangeEndLabel
      : rangeStartLabel + ' – ' + rangeEndLabel;

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
        hours === null ? '0%' : Math.min(100, (hours / 24) * 100) + '%';
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
