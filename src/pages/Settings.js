/**
 * GI SMART POND
 * Premium Settings Page
 * Visual entry points for farm and device preferences.
 */

import { Header } from '../components/Header.js';
import { BottomNavigation } from '../components/BottomNavigation.js';
import { DEMO_DATA } from '../data/demoData.js';

const ICONS = {
  farm: '<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-7h6v7M3 10.5h18"/>',
  pond: '<path d="M3 15c2.2 0 2.2-2 4.5-2s2.3 2 4.5 2 2.3-2 4.5-2 2.3 2 4.5 2"/><path d="M3 19c2.2 0 2.2-2 4.5-2s2.3 2 4.5 2 2.3-2 4.5-2 2.3 2 4.5 2"/><path d="M12 3v6m-3-3 3 3 3-3"/>',
  device: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9zM9 1v3m6-3v3M9 20v3m6-3v3M1 9h3m-3 6h3m16-6h3m-3 6h3"/>',
  sliders: '<path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3"/><path d="M1 14h6m2-6h6m2 8h6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>'
};

function createIcon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.65');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = ICONS[name] || ICONS.info;
  return svg;
}

function createSettingItem(title, description, iconName = 'sliders') {
  const item = document.createElement('div');
  item.className = 'setting-item';

  const icon = document.createElement('span');
  icon.className = 'setting-item-icon';
  icon.append(createIcon(iconName));

  const details = document.createElement('div');
  details.className = 'setting-item-details';

  const heading = document.createElement('h3');
  heading.className = 'setting-item-title';
  heading.textContent = title;

  const text = document.createElement('p');
  text.className = 'setting-item-description';
  text.textContent = description;

  details.append(heading, text);

  const arrow = document.createElement('span');
  arrow.className = 'setting-item-arrow';
  arrow.textContent = '›';
  arrow.setAttribute('aria-hidden', 'true');

  item.append(icon, details, arrow);
  return item;
}

function createSettingsSection(title, description, iconName, items) {
  const section = document.createElement('section');
  section.className = 'settings-section';

  const heading = document.createElement('div');
  heading.className = 'settings-section-heading';

  const icon = document.createElement('span');
  icon.className = 'settings-section-icon';
  icon.append(createIcon(iconName));

  const copy = document.createElement('div');
  copy.className = 'settings-section-heading-copy';

  const titleElement = document.createElement('h2');
  titleElement.className = 'settings-section-title';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'settings-section-description';
  descriptionElement.textContent = description;

  copy.append(titleElement, descriptionElement);
  heading.append(icon, copy);

  const list = document.createElement('div');
  list.className = 'settings-section-list';
  items.forEach((item) => list.append(createSettingItem(...item)));

  section.append(heading, list);
  return section;
}

export function Settings() {
  const page = document.createElement('main');
  page.className = 'page settings-page';

  const content = document.createElement('div');
  content.className = 'page-content';

  const intro = document.createElement('section');
  intro.className = 'settings-page-intro';

  const eyebrow = document.createElement('span');
  eyebrow.className = 'settings-eyebrow';
  eyebrow.textContent = 'PREFERENCES & CONFIGURATION';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Settings';

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Manage your farm and monitoring setup';

  intro.append(eyebrow, title, subtitle);

  const farm = DEMO_DATA.farm || {};
  const farmCard = document.createElement('section');
  farmCard.className = 'settings-farm-card';

  const farmIcon = document.createElement('span');
  farmIcon.className = 'settings-farm-icon';
  farmIcon.append(createIcon('farm'));

  const farmCopy = document.createElement('div');
  farmCopy.className = 'settings-farm-copy';

  const farmLabel = document.createElement('span');
  farmLabel.className = 'settings-farm-label';
  farmLabel.textContent = 'CURRENT FARM';

  const farmName = document.createElement('strong');
  farmName.className = 'settings-farm-name';
  farmName.textContent = farm.name || 'My Farm';

  const farmLocation = document.createElement('span');
  farmLocation.className = 'settings-farm-location';
  farmLocation.textContent = farm.location || 'Location not configured';

  farmCopy.append(farmLabel, farmName, farmLocation);

  const farmStatus = document.createElement('span');
  farmStatus.className = 'settings-farm-status';
  farmStatus.textContent = 'ACTIVE';

  farmCard.append(farmIcon, farmCopy, farmStatus);

  const farmSection = createSettingsSection(
    'Farm Configuration',
    'Farm identity and pond details',
    'farm',
    [
      ['Farm Details', 'View and manage farm information', 'farm'],
      ['Pond Configuration', 'Manage pond identification and size', 'pond']
    ]
  );

  const deviceSection = createSettingsSection(
    'Device Configuration',
    'Connectivity and equipment inputs',
    'device',
    [
      ['Connectivity', 'ESP32 and Modbus communication settings', 'device'],
      ['Equipment Mapping', 'Configure EB, DG and aerator inputs', 'sliders']
    ]
  );

  const appSection = createSettingsSection(
    'Application',
    'Product information and support',
    'info',
    [
      ['About GI SMART POND', 'Smart Aquaculture. Smarter Monitoring. Better Farming.', 'info']
    ]
  );

  content.append(intro, farmCard, farmSection, deviceSection, appSection);
  page.append(Header(), content, BottomNavigation('home'));
  return page;
}
