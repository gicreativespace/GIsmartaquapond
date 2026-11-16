
/**
 * GI SMART POND
 * Reports Page
 *
 * Daily equipment runtime summary.
 * Demo values will later be replaced by Firebase data.
 */

import { Header } from '../components/Header.js';
import { BottomNavigation } from '../components/BottomNavigation.js';
import { DEMO_DATA } from '../data/demoData.js';

function createReportItem(label, value, unit = 'HRS') {
  const item = document.createElement('article');
  item.className = 'report-detail-card';

  const title = document.createElement('span');
  title.className = 'report-detail-label';
  title.textContent = label;

  const amount = document.createElement('strong');
  amount.className = 'report-detail-value';
  amount.textContent = `${Number(value || 0).toFixed(1)} ${unit}`;

  item.append(title, amount);

  return item;
}

export function Reports() {
  const page = document.createElement('main');
  page.className = 'page reports-page';

  const header = Header();

  const content = document.createElement('div');
  content.className = 'page-content';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Farm Reports';

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Daily equipment runtime summary';

  const reports = DEMO_DATA.reports || {};

  const summary = document.createElement('section');
  summary.className = 'reports-summary-card';

  const summaryLabel = document.createElement('span');
  summaryLabel.className = 'reports-summary-label';
  summaryLabel.textContent = "TODAY'S TOTAL RUNTIME";

  const summaryValue = document.createElement('strong');
  summaryValue.className = 'reports-summary-value';
  summaryValue.textContent =
    `${Number(reports.runtimeHours ?? 0).toFixed(1)} HRS`;

  summary.append(summaryLabel, summaryValue);

  const details = document.createElement('section');
  details.className = 'reports-details';
  details.setAttribute('aria-label', 'Equipment runtime details');

  details.append(
    createReportItem('EB SUPPLY', reports.ebHours ?? 0),
    createReportItem('DG OUTPUT', reports.dgHours ?? 0),
    createReportItem('AERATOR RUNTIME', reports.aeratorHours ?? 0)
  );

  const note = document.createElement('p');
  note.className = 'reports-note';
  note.textContent =
    'Sample report data. Actual runtime will be calculated from recorded equipment status changes.';

  content.append(
    title,
    subtitle,
    summary,
    details,
    note
  );

  const navigation = BottomNavigation('reports');

  page.append(header, content, navigation);

  return page;
}
