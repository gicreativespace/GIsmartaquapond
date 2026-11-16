
/**
 * GI SMART POND
 * Settings Page
 *
 * Farm and device configuration entry points.
 */

import { Header } from '../components/Header.js';
import { BottomNavigation } from '../components/BottomNavigation.js';
import { DEMO_DATA } from '../data/demoData.js';

function createSettingItem(title, description) {
  const item = document.createElement('section');
  item.className = 'setting-item';

  const details = document.createElement('div');
  details.className = 'setting-item-details';

  const heading = document.createElement('h2');
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

  item.append(details, arrow);

  return item;
}

export function Settings() {
  const page = document.createElement('main');
  page.className = 'page settings-page';

  const header = Header();

  const content = document.createElement('div');
  content.className = 'page-content';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Settings';

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Farm and device preferences';

  const farm = DEMO_DATA.farm || {};

  const farmSection = document.createElement('section');
  farmSection.className = 'settings-section';

  const farmHeading = document.createElement('h2');
  farmHeading.className = 'settings-section-title';
  farmHeading.textContent = 'FARM CONFIGURATION';

  const farmInfo = document.createElement('div');
  farmInfo.className = 'settings-farm-info';

  const farmName = document.createElement('strong');
  farmName.textContent = farm.name || 'My Farm';

  const farmLocation = document.createElement('span');
  farmLocation.textContent = farm.location || 'Location not configured';

  farmInfo.append(farmName, farmLocation);

  farmSection.append(
    farmHeading,
    farmInfo,
    createSettingItem(
      'Farm Details',
      'View and manage farm information'
    ),
    createSettingItem(
      'Pond Configuration',
      'Manage pond identification and size'
    )
  );

  const deviceSection = document.createElement('section');
  deviceSection.className = 'settings-section';

  const deviceHeading = document.createElement('h2');
  deviceHeading.className = 'settings-section-title';
  deviceHeading.textContent = 'DEVICE CONFIGURATION';

  deviceSection.append(
    deviceHeading,
    createSettingItem(
      'Connectivity',
      'ESP32 and Modbus communication settings'
    ),
    createSettingItem(
      'Equipment Mapping',
      'Configure EB, DG and aerator inputs'
    )
  );

  const appSection = document.createElement('section');
  appSection.className = 'settings-section';

  const appHeading = document.createElement('h2');
  appHeading.className = 'settings-section-title';
  appHeading.textContent = 'APPLICATION';

  appSection.append(
    appHeading,
    createSettingItem(
      'About GI SMART POND',
      'Smart Aquaculture. Smarter Monitoring. Better Farming.'
    )
  );

  content.append(
    title,
    subtitle,
    farmSection,
    deviceSection,
    appSection
  );

  const navigation = BottomNavigation('home');

  page.append(header, content, navigation);

  return page;
}
