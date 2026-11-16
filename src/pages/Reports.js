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
  const pdfButton = element('button', 'reports-export-button', 'Download PDF');
  const xlsxButton = element('button', 'reports-export-button', 'Download Excel');
  [pdfButton, xlsxButton].forEach((button) => {
    button.type = 'button';
    exportActions.append(button);
  });
  exportSection.append(exportHeading, exportActions);

  pdfButton.addEventListener('click', () => {
    const reportWindow = getExportWindow();
    const hasCoverage = reportWindow.end > reportWindow.start;
    const ebHours = hasCoverage ? getExportHours('EB', reportWindow.start, reportWindow.end) : 0;
    const dgHours = hasCoverage ? getExportHours('DG', reportWindow.start, reportWindow.end) : 0;
    const periodNames = { today: 'Today', yesterday: 'Yesterday', week: 'Weekly', month: 'Monthly' };
    const reportDate = dateLabel.textContent || getISTDateLabel(0);
    const doc = element('article', 'reports-pdf-document');
    const style = element('style');
    style.textContent = `
      @page { size: A4 portrait; margin: 13mm 14mm; }
      @media print {
        body * { visibility: hidden !important; }
        .reports-pdf-document, .reports-pdf-document * { visibility: visible !important; }
        .reports-pdf-document { display:block !important; position:absolute !important; inset:0 !important; width:100% !important; color:#123B50 !important; background:#fff !important; font-family:Inter,Arial,sans-serif !important; }
        .reports-pdf-document * { box-sizing:border-box; }
        .reports-pdf-header { text-align:center; border-bottom:2px solid #078D87; padding:0 0 13px; margin-bottom:16px; }
        .reports-pdf-brand { color:#078D87; font-size:25pt; line-height:1.15; font-weight:800; letter-spacing:.3px; }
        .reports-pdf-tagline { color:#58717D; font-size:9pt; letter-spacing:1.5px; margin-top:4px; }
        .reports-pdf-title { color:#123B50; font-size:21pt; font-weight:800; margin:15px 0 4px; }
        .reports-pdf-date { color:#58717D; font-size:11pt; }
        .reports-pdf-section { margin:13px 0 0; break-inside:avoid; }
        .reports-pdf-section-title { font-size:13pt; font-weight:800; letter-spacing:.3px; margin:0 0 8px; color:#123B50; }
        .reports-pdf-farm { display:grid; grid-template-columns:1fr 1fr; gap:9px 18px; padding:13px 15px; background:#F2F8FA; border:1px solid #DCE8EC; border-radius:9px; }
        .reports-pdf-label { display:block; color:#58717D; font-size:9pt; margin-bottom:3px; }
        .reports-pdf-value { display:block; color:#123B50; font-size:12pt; font-weight:700; }
        .reports-pdf-power { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .reports-pdf-power-card { padding:13px 15px; border-radius:9px; border:1px solid #DCE8EC; }
        .reports-pdf-power-card.eb { background:#EAF6F0; }
        .reports-pdf-power-card.dg { background:#EDF4FA; }
        .reports-pdf-power-label { font-size:10pt; font-weight:700; color:#58717D; }
        .reports-pdf-power-hours { font-size:23pt; font-weight:800; line-height:1.3; margin-top:5px; color:#123B50; font-variant-numeric:tabular-nums; }
        .reports-pdf-table { width:100%; border-collapse:collapse; }
        .reports-pdf-table th { padding:8px 11px; background:#123B50; color:#fff; text-align:left; font-size:10pt; }
        .reports-pdf-table td { padding:7px 11px; border-bottom:1px solid #DCE8EC; font-size:11pt; }
        .reports-pdf-table tbody tr:nth-child(even) { background:#F2F8FA; }
        .reports-pdf-table td:last-child,.reports-pdf-table th:last-child { text-align:right; }
        .reports-pdf-footer { margin-top:16px; padding-top:9px; border-top:1px solid #DCE8EC; display:flex; justify-content:space-between; color:#58717D; font-size:9pt; }
        .reports-pdf-footer strong { color:#078D87; }
      }
      @media screen { .reports-pdf-document { display:none; } }
    `;
    const header = element('header', 'reports-pdf-header');
    header.append(
      element('div', 'reports-pdf-brand', 'GI SMART POND'),
      element('div', 'reports-pdf-tagline', 'SMART AQUACULTURE MONITORING'),
      element('h1', 'reports-pdf-title', periodNames[selectedPeriod] + ' Performance Report'),
      element('div', 'reports-pdf-date', reportDate)
    );
    const farm = element('section', 'reports-pdf-section');
    farm.append(element('h2', 'reports-pdf-section-title', 'FARM DETAILS'));
    const farmGrid = element('div', 'reports-pdf-farm');
    [
      ['Farm Name', DEMO_DATA.farm.name],
      ['Pond ID', DEMO_DATA.farm.pondId],
      ['Location', DEMO_DATA.farm.location],
      ['Pond Size', DEMO_DATA.farm.pondSize]
    ].forEach(([label, value]) => {
      const item = element('div');
      item.append(element('span', 'reports-pdf-label', label), element('strong', 'reports-pdf-value', value));
      farmGrid.append(item);
    });
    farm.append(farmGrid);

    const power = element('section', 'reports-pdf-section');
    power.append(element('h2', 'reports-pdf-section-title', 'POWER SUPPLY SUMMARY'));
    const powerGrid = element('div', 'reports-pdf-power');
    [['EB SUPPLY', ebHours, 'eb'], ['DG SUPPLY', dgHours, 'dg']].forEach(([label, hours, type]) => {
      const card = element('div', 'reports-pdf-power-card ' + type);
      card.append(element('div', 'reports-pdf-power-label', label), element('div', 'reports-pdf-power-hours', hours.toFixed(1) + ' Hrs'));
      powerGrid.append(card);
    });
    power.append(powerGrid);

    const aerators = element('section', 'reports-pdf-section');
    aerators.append(element('h2', 'reports-pdf-section-title', 'AERATOR RUNNING HOURS'));
    const table = element('table', 'reports-pdf-table');
    const thead = element('thead');
    const headerRow = element('tr');
    ['S.No', 'Equipment', 'Running Hours'].forEach((label) => headerRow.append(element('th', '', label)));
    thead.append(headerRow);
    const tbody = element('tbody');
    for (let number = 1; number <= 10; number += 1) {
      const id = 'AERATOR_' + String(number).padStart(2, '0');
      const hours = hasCoverage ? getExportHours(id, reportWindow.start, reportWindow.end) : 0;
      const row = element('tr');
      row.append(
        element('td', '', String(number).padStart(2, '0')),
        element('td', '', 'Aerator ' + String(number).padStart(2, '0')),
        element('td', '', hours.toFixed(1) + ' Hrs')
      );
      tbody.append(row);
    }
    table.append(thead, tbody);
    aerators.append(table);

    const footer = element('footer', 'reports-pdf-footer');
    footer.append(element('strong', '', 'Inspired by Godavari.'), element('span', '', 'GI SMART POND · ' + reportDate));
    doc.append(header, farm, power, aerators, footer);
    document.head.append(style);
    document.body.append(doc);
    const cleanup = () => {
      doc.remove();
      style.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    window.setTimeout(cleanup, 120000);
  });

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

  function getExportWindow() {
    const periodWindow = getReportPeriodWindow(Date.now(), selectedPeriod);
    if (!activeSimulationSnapshot) {
      return { start: periodWindow.start, end: periodWindow.end };
    }
    const dataStart = activeSimulationSnapshot.startTime ?? periodWindow.start;
    const dataEnd = getISTDayWindow(activeSimulationSnapshot.endTime).end;
    return {
      start: Math.max(periodWindow.start, dataStart),
      end: Math.min(periodWindow.end, dataEnd)
    };
  }

  function getExportHours(equipmentId, start, end) {
    if (!activeSimulationSnapshot || end <= start) return 0;
    const value = calculateRuntimeHours(activeSimulationSnapshot, equipmentId, start, end);
    return Number.isFinite(value) ? Number(value.toFixed(1)) : 0;
  }

  function getExportRows() {
    const rows = [
      ['GI SMART POND — REPORT'],
      ['Farm', DEMO_DATA.farm.name],
      ['Location', DEMO_DATA.farm.location],
      ['Pond ID', DEMO_DATA.farm.pondId],
      ['Pond Size', DEMO_DATA.farm.pondSize],
      ['Report Period', selectedPeriod.toUpperCase()],
      ['Selected Range', dateLabel.textContent],
      [],
      ['POWER SUMMARY'],
      ['Equipment', 'Running Hours']
    ];

    const reportWindow = getExportWindow();
    const hasCoverage = reportWindow.end > reportWindow.start;
    const ebTotal = hasCoverage ? getExportHours('EB', reportWindow.start, reportWindow.end) : 0;
    const dgTotal = hasCoverage ? getExportHours('DG', reportWindow.start, reportWindow.end) : 0;
    rows.push(['EB Supply', ebTotal], ['DG Supply', dgTotal]);

    if (selectedPeriod === 'today' || selectedPeriod === 'yesterday') {
      rows.push(
        [],
        ['AERATOR RUNNING HOURS'],
        ['Aerator', 'Running Hours']
      );
      for (let number = 1; number <= 10; number += 1) {
        const id = 'AERATOR_' + String(number).padStart(2, '0');
        const hours = hasCoverage ? getExportHours(id, reportWindow.start, reportWindow.end) : 0;
        rows.push([id.replace('_', ' '), hours]);
      }

      rows.push([], ['EVENTS HISTORY'], ['Time (IST)', 'Equipment', 'State']);
      if (activeSimulationSnapshot && hasCoverage) {
        const visibleEvents = activeSimulationSnapshot.allEvents.filter((event) =>
          event.time >= reportWindow.start && event.time < reportWindow.end
        );
        visibleEvents.forEach((event) => {
          rows.push([
            formatEventTime(event.time),
            event.id.replace('AERATOR_', 'AERATOR '),
            event.state
          ]);
        });
      }
      if (rows[rows.length - 1][0] === 'State') rows.push(['No events', '', '']);
    } else {
      rows.push(
        [],
        ['DAILY POWER BREAKDOWN'],
        ['Date', 'EB Supply (hrs)', 'DG Supply (hrs)']
      );
      const firstDay = getISTDayWindow(reportWindow.start).start;
      for (let dayStart = firstDay; dayStart < reportWindow.end; dayStart += 86400000) {
        const dayEnd = dayStart + 86400000;
        const clippedStart = Math.max(dayStart, reportWindow.start);
        const clippedEnd = Math.min(dayEnd, reportWindow.end);
        const dayLabel = formatReportDate(dayStart);
        rows.push([
          dayLabel,
          clippedEnd > clippedStart ? getExportHours('EB', clippedStart, clippedEnd) : 0,
          clippedEnd > clippedStart ? getExportHours('DG', clippedStart, clippedEnd) : 0
        ]);
      }
      rows.push(['Period Total', ebTotal, dgTotal]);
    }
    return rows;
  }

  function xmlEscape(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  function columnName(index) {
    let name = '';
    let value = index + 1;
    while (value > 0) {
      const remainder = (value - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      value = Math.floor((value - 1) / 26);
    }
    return name;
  }

  function crc32(bytes) {
    let crc = -1;
    for (let i = 0; i < bytes.length; i += 1) {
      crc ^= bytes[i];
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ -1) >>> 0;
  }

  function makeZip(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const write16 = (view, at, value) => view.setUint16(at, value, true);
    const write32 = (view, at, value) => view.setUint32(at, value >>> 0, true);

    files.forEach((file) => {
      const name = encoder.encode(file.name);
      const data = encoder.encode(file.content);
      const crc = crc32(data);
      const local = new Uint8Array(30 + name.length);
      const localView = new DataView(local.buffer);
      write32(localView, 0, 0x04034B50);
      write16(localView, 4, 20);
      write16(localView, 6, 0);
      write16(localView, 8, 0);
      write16(localView, 10, 0);
      write16(localView, 12, 0);
      write32(localView, 14, crc);
      write32(localView, 18, data.length);
      write32(localView, 22, data.length);
      write16(localView, 26, name.length);
      write16(localView, 28, 0);
      local.set(name, 30);
      localParts.push(local, data);

      const central = new Uint8Array(46 + name.length);
      const centralView = new DataView(central.buffer);
      write32(centralView, 0, 0x02014B50);
      write16(centralView, 4, 20);
      write16(centralView, 6, 20);
      write16(centralView, 8, 0);
      write16(centralView, 10, 0);
      write16(centralView, 12, 0);
      write16(centralView, 14, 0);
      write32(centralView, 16, crc);
      write32(centralView, 20, data.length);
      write32(centralView, 24, data.length);
      write16(centralView, 28, name.length);
      write16(centralView, 30, 0);
      write16(centralView, 32, 0);
      write16(centralView, 34, 0);
      write16(centralView, 36, 0);
      write32(centralView, 38, 0);
      write32(centralView, 42, offset);
      central.set(name, 46);
      centralParts.push(central);
      offset += local.length + data.length;
    });

    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    write32(endView, 0, 0x06054B50);
    write16(endView, 4, 0);
    write16(endView, 6, 0);
    write16(endView, 8, files.length);
    write16(endView, 10, files.length);
    write32(endView, 12, centralSize);
    write32(endView, 16, offset);
    write16(endView, 20, 0);
    return new Blob([...localParts, ...centralParts, end], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  function createXlsxBlob(rows) {
    const sheetRows = rows.map((row, rowIndex) => {
      const cells = row.map((value, columnIndex) => {
        const ref = columnName(columnIndex) + (rowIndex + 1);
        if (typeof value === 'number' && Number.isFinite(value)) {
          return '<c r="' + ref + '" t="n"><v>' + value + '</v></c>';
        }
        return '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' +
          xmlEscape(value) + '</t></is></c>';
      }).join('');
      return '<row r="' + (rowIndex + 1) + '">' + cells + '</row>';
    }).join('');
    const worksheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheetData>' + sheetRows + '</sheetData></worksheet>';
    const workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheets><sheet name="Pond Report" sheetId="1" r:id="rId1"/></sheets></workbook>';
    const contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '</Types>';
    const rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>';
    const workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
      '</Relationships>';
    return makeZip([
      { name: '[Content_Types].xml', content: contentTypes },
      { name: '_rels/.rels', content: rootRels },
      { name: 'xl/workbook.xml', content: workbook },
      { name: 'xl/_rels/workbook.xml.rels', content: workbookRels },
      { name: 'xl/worksheets/sheet1.xml', content: worksheet }
    ]);
  }

  xlsxButton.addEventListener('click', () => {
    const workbook = createXlsxBlob(getExportRows());
    downloadFile(workbook, 'GI-SMART-POND-' + selectedPeriod.toUpperCase() + '.xlsx');
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
        hours === null ? '0.0 hrs' : hours.toFixed(1) + ' hrs';
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
