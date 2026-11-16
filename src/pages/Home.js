
/**
 * GI SMART POND
 * Home Page
 *
 * Main dashboard composition.
 */

import { Header } from '../components/Header.js';
import { FarmDetails } from '../components/FarmDetails.js';
import { BottomNavigation } from '../components/BottomNavigation.js';

import { PowerCard } from '../components/PowerCard.js';
import { DGCard } from '../components/DGCard.js';
import { AeratorCard } from '../components/AeratorCard.js';
import { ReportsCard } from '../components/ReportsCard.js';

import { DEMO_DATA } from '../data/demoData.js';

export function Home() {
  const page = document.createElement('main');
  page.className = 'page home-page';

  // Header
  const header = Header();

  // Main content
  const content = document.createElement('div');
  content.className = 'home-content';

  // Farm details
  const farmDetails = FarmDetails(DEMO_DATA.farm);

  // Equipment cards grid
  const equipmentGrid = document.createElement('section');
  equipmentGrid.className = 'equipment-grid';
  equipmentGrid.setAttribute(
    'aria-label',
    'Farm equipment status'
  );

  const powerCard = PowerCard(DEMO_DATA.power);
  const dgCard = DGCard(DEMO_DATA.dg);
  const aeratorCard = AeratorCard(DEMO_DATA.aerators);
  const reportsCard = ReportsCard(DEMO_DATA.reports);

  equipmentGrid.append(
    powerCard,
    dgCard,
    aeratorCard,
    reportsCard
  );

  content.append(farmDetails, equipmentGrid);

  // Bottom navigation
  const navigation = BottomNavigation('home');

  page.append(header, content, navigation);

  return page;
}
