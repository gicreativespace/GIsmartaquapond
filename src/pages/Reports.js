/**
 * GI SMART POND
 * Premium Reports Dashboard
 * Historical values remain unavailable until timestamped device events are connected.
 */

import { Header } from '../components/Header.js';
import { BottomNavigation } from '../components/BottomNavigation.js';

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: '7days', label: '7 Days' },
  { id: '30days', label: '30 Days' }
];

const METRICS = [
  { label: 'Aerator Hours', unit: 'Hours', icon: 'fan', tone: 'teal' },
  { label: 'Power Availability', unit: 'Percentage', icon: 'activity', tone: 'blue' },
  { label: 'EB Supply', unit: 'Hours', icon: 'zap', tone: 'green' },
  { label: 'DG Supply', unit: 'Hours', icon: 'battery', tone: 'blue' }
];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createIcon(name, className = '') {
  const paths = {
    fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10V3m2 9h7m-9 2v7m-2-9H3m10.5-1.5 5-5m-8 8-5 5m8-5 5 5m-8-8-5-5"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    zap: '<path d="m13 2-3 9h7l-6 11 2-9H6l7-11z"/>',
    battery: '<rect x="3" y="7" width="17" height="10" rx="2"/><path d="M23 10v4M7 10v4m5-4v4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 6-7"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5m4-1v5l4 2"/>',
    pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 15h2a1.5 1.5 0 0 0 0-3H8v6m6-6v6h1a3 3 0 0 0 0-6h-1m5 0h-2v6m0-3h2"/>',
    excel: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m8 8 5 8m0-8-5 8m7-8h3m-3 4h3m-3 4h3"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>'
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
  svg.innerHTML = paths[name] || paths.chart;
  return svg;
}

function getPeriodLabel(period) {
  return PERIODS.find((item) => item.id === period)?.label || 'Today';
}

function createMetricCard(metric) {
  const card = element('article', 'reports-metric-card');
  const top = element('div', 'reports-metric-top');
  top.append(element('span', 'reports-metric-label', metric.label), createIcon(metric.icon, 'reports-metric-icon ' + metric.tone));
  card.append(top, element('strong', 'reports-metric-value', '--'), element('span', 'reports-metric-unit', metric.unit));
  return card;
}

function createAeratorRow(number) {
  const row = element('div', 'reports-aerator-row');
  row.append(
    element('span', 'reports-aerator-name', 'Aerator ' + String(number).padStart(2, '0')),
    element('strong', 'reports-aerator-hours', '-- hrs')
  );
  return row;
}

function createPrintSheet(period) {
  const sheet = element('section', 'reports-print-sheet');
  sheet.append(
    element('p', 'reports-print-brand', 'GI SMART POND'),
    element('h1', '', 'Farm Performance Report'),
    element('p', 'reports-print-farm', 'SURI AQUA FARM · IPPANAPADU, ANDHRA PRADESH'),
    element('p', 'reports-print-range', 'Report period: ' + getPeriodLabel(period) + ' · Generated: ' + new Date().toLocaleString('en-IN'))
  );
  const table = document.createElement('table');
  table.className = 'reports-print-table';
  const rows = [
    ['Aerator Hours', '--'], ['Power Availability', '--'], ['EB Supply', '--'], ['DG Supply', '--'],
    ...Array.from({ length: 10 }, (_, index) => ['Aerator ' + String(index + 1).padStart(2, '0'), '--'])
  ];
  rows.forEach(([label, value]) => {
    const tr = document.createElement('tr');
    tr.append(element('td', '', label), element('td', '', value));
    table.append(tr);
  });
  sheet.append(table, element('p', 'reports-print-note', 'Historical readings will appear after the device event history is connected.'));
  return sheet;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function exportExcel(period) {
  const rows = [
    ['GI SMART POND - Farm Report'], ['Farm', 'SURI AQUA FARM'],
    ['Location', 'Ippanapadu, Andhra Pradesh'], ['Period', getPeriodLabel(period)],
    ['Metric', 'Value'], ['Aerator Hours', '--'], ['Power Availability', '--'],
    ['EB Supply Hours', '--'], ['DG Supply Hours', '--'],
    ...Array.from({ length: 10 }, (_, index) => ['Aerator ' + String(index + 1).padStart(2, '0') + ' Running Hours', '--']),
    [], ['Note', 'Historical values will populate after timestamped device feedback is connected.']
  ];
  const csv = '\uFEFF' + rows.map((row) =>
    row.map((cell) => '"' + String(cell ?? '').replace(/"/g, '""') + '"').join(',')
  ).join('\r\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'GI-Smart-Pond-' + period + '-Report.csv');
}

function drawPoster(period) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Poster canvas is not supported on this device.');
  const rounded = (x, y, width, height, radius, fill) => {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = fill;
    ctx.fill();
  };
  ctx.fillStyle = '#F2F8FA';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  rounded(48, 48, 984, 250, 34, '#123B50');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 52px Arial, sans-serif';
  ctx.fillText('GI SMART POND', 94, 132);
  ctx.fillStyle = '#CFE3E8';
  ctx.font = '26px Arial, sans-serif';
  ctx.fillText('SMART AQUACULTURE MONITORING', 96, 180);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 42px Arial, sans-serif';
  ctx.fillText('Farm Performance Report', 94, 246);
  ctx.fillStyle = '#123B50';
  ctx.font = '600 34px Arial, sans-serif';
  ctx.fillText('SURI AQUA FARM', 72, 370);
  ctx.fillStyle = '#66808B';
  ctx.font = '25px Arial, sans-serif';
  ctx.fillText('IPPANAPADU, ANDHRA PRADESH', 72, 414);
  ctx.fillText(getPeriodLabel(period) + '  |  ' + new Date().toLocaleDateString('en-IN'), 72, 458);
  const tiles = [
    ['AERATOR HOURS', '--', '#078D87'], ['POWER AVAILABILITY', '--', '#287BA8'],
    ['EB SUPPLY', '--', '#13A887'], ['DG SUPPLY', '--', '#287BA8']
  ];
  tiles.forEach((tile, index) => {
    const x = 72 + (index % 2) * 480;
    const y = 510 + Math.floor(index / 2) * 205;
    rounded(x, y, 440, 165, 24, '#FFFFFF');
    ctx.fillStyle = '#66808B';
    ctx.font = '600 23px Arial, sans-serif';
    ctx.fillText(tile[0], x + 30, y + 54);
    ctx.fillStyle = tile[2];
    ctx.font = '600 58px Arial, sans-serif';
    ctx.fillText(tile[1], x + 30, y + 122);
  });
  rounded(72, 950, 936, 230, 24, '#FFFFFF');
  ctx.fillStyle = '#123B50';
  ctx.font = '600 30px Arial, sans-serif';
  ctx.fillText('AERATOR-WISE RUNNING HOURS', 108, 1010);
  ctx.fillStyle = '#66808B';
  ctx.font = '25px Arial, sans-serif';
  ctx.fillText('Aerators 01–10:  -- hrs each', 108, 1075);
  ctx.fillText('Values will update when recorded device history is available.', 108, 1130);
  ctx.fillStyle = '#078D87';
  ctx.font = '600 27px Arial, sans-serif';
  ctx.fillText('Your pond. Your power. Your information.', 72, 1260);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not create poster image.')), 'image/png');
  });
}

async function createPoster(period, status) {
  const blob = await drawPoster(period);
  const file = new File([blob], 'GI-Smart-Pond-' + period + '-Poster.png', { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: 'GI SMART POND Farm Report', files: [file] });
    return;
  }
  downloadBlob(blob, file.name);
  status.textContent = 'Poster image saved. You can share it on WhatsApp.';
}

export function Reports() {
  const page = element('main', 'page reports-page');
  const content = element('div', 'page-content');
  const intro = element('section', 'reports-page-intro');
  intro.append(element('h1', 'page-title', 'Reports'), element('p', 'page-subtitle', 'Farm performance overview'));

  let activePeriod = 'today';
  const periodTabs = element('div', 'reports-period-tabs');
  periodTabs.setAttribute('role', 'group');
  periodTabs.setAttribute('aria-label', 'Report period');
  const tabButtons = new Map();
  let periodStatus;

  PERIODS.forEach((period) => {
    const button = element('button', 'reports-period-button', period.label);
    button.type = 'button';
    button.setAttribute('aria-pressed', period.id === activePeriod ? 'true' : 'false');
    if (period.id === activePeriod) button.classList.add('active');
    button.addEventListener('click', () => {
      activePeriod = period.id;
      tabButtons.forEach((tab, id) => {
        const selected = id === activePeriod;
        tab.classList.toggle('active', selected);
        tab.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
      if (periodStatus) periodStatus.textContent = getPeriodLabel(activePeriod) + ' report selected';
    });
    tabButtons.set(period.id, button);
    periodTabs.append(button);
  });

  const metricGrid = element('section', 'reports-metric-grid');
  metricGrid.setAttribute('aria-label', 'Farm performance summary');
  METRICS.forEach((metric) => metricGrid.append(createMetricCard(metric)));

  const aeratorSection = element('section', 'reports-section-card');
  const aeratorHeading = element('div', 'reports-section-heading');
  aeratorHeading.append(element('h2', '', 'Aerator-wise Running Hours'), createIcon('clock', 'reports-section-icon'));
  const aeratorList = element('div', 'reports-aerator-list');
  for (let number = 1; number <= 10; number += 1) aeratorList.append(createAeratorRow(number));
  aeratorSection.append(aeratorHeading, aeratorList);

  const powerSection = element('section', 'reports-section-card');
  const powerHeading = element('div', 'reports-section-heading');
  powerHeading.append(element('h2', '', 'Power History'), element('span', 'reports-section-tag', 'EB / DG'));
  const chartPlaceholder = element('div', 'reports-chart-placeholder');
  chartPlaceholder.append(
    createIcon('chart', 'reports-chart-icon'),
    element('strong', '', 'Power availability history'),
    element('span', '', 'Chart will appear when recorded history is available.')
  );
  powerSection.append(powerHeading, chartPlaceholder);

  const eventsSection = element('section', 'reports-section-card');
  const eventsHeading = element('div', 'reports-section-heading');
  eventsHeading.append(element('h2', '', 'Events History'), createIcon('history', 'reports-section-icon'));
  eventsSection.append(eventsHeading, element('div', 'reports-event-empty', 'EB / DG and Aerator ON / OFF events will appear here.'));

  const dataNote = element('p', 'reports-data-note', 'Historical readings are not connected yet. Values will appear after timestamped ESP32 feedback events are stored.');
  const exportSection = element('section', 'reports-export-section');
  const exportTitle = element('h2', 'reports-export-title', 'Export Reports');
  const exportCard = element('div', 'reports-export-card');
  const exportStatus = element('p', 'reports-export-status', 'Choose a format to save or share this report.');
  periodStatus = element('span', 'reports-period-status', 'Today report selected');

  const makeExportRow = (kind, label, description, icon, action) => {
    const button = element('button', 'reports-export-row ' + kind);
    button.type = 'button';
    const iconBox = element('span', 'reports-export-icon');
    iconBox.append(createIcon(icon));
    const copy = element('span', 'reports-export-copy');
    copy.append(element('strong', '', label), element('small', '', description));
    button.append(iconBox, copy, createIcon(kind === 'poster' ? 'chevron' : 'download', 'reports-export-action'));
    button.addEventListener('click', action);
    return button;
  };

  const pdfButton = makeExportRow('pdf', 'Export PDF', 'Detailed report · Save as PDF', 'pdf', () => {
    page.classList.add('is-printing');
    const printSheet = createPrintSheet(activePeriod);
    page.append(printSheet);
    const cleanup = () => {
      page.classList.remove('is-printing');
      printSheet.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.requestAnimationFrame(() => window.print());
  });

  const excelButton = makeExportRow('excel', 'Export Excel', 'Excel-compatible spreadsheet (CSV)', 'excel', () => {
    exportExcel(activePeriod);
    exportStatus.textContent = 'Excel-compatible CSV report downloaded.';
  });

  const posterButton = makeExportRow('poster', 'Create Poster', 'Visual farm report · PNG image', 'image', async () => {
    posterButton.disabled = true;
    exportStatus.textContent = 'Creating your farm poster…';
    try {
      await createPoster(activePeriod, exportStatus);
      if (!exportStatus.textContent.startsWith('Poster image saved')) exportStatus.textContent = 'Poster ready to share.';
    } catch (error) {
      exportStatus.textContent = error?.message || 'Poster could not be created.';
    } finally {
      posterButton.disabled = false;
    }
  });

  exportCard.append(pdfButton, excelButton, posterButton);
  exportSection.append(exportTitle, periodStatus, exportCard, exportStatus);
  content.append(intro, periodTabs, metricGrid, aeratorSection, powerSection, eventsSection, dataNote, exportSection);
  page.append(Header(), content, BottomNavigation('reports'));
  return page;
}
