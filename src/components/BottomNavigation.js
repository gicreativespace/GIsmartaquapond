
/**
 * GI SMART POND
 * Bottom Navigation Component
 *
 * Four fixed navigation items.
 * Uses existing app.js data-route handler.
 */

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    icon: `
      <path d="M3 10.5 12 3l9 7.5"/>
      <path d="M5.5 9v11h13V9"/>
      <path d="M9 20v-6h6v6"/>
    `
  },
  {
    id: 'power',
    label: 'Power',
    icon: `
      <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7z"/>
    `
  },
  {
    id: 'aerators',
    label: 'Aerators',
    icon: `
      <circle cx="12" cy="12" r="2"/>
      <path d="M12 10V3"/>
      <path d="M14 12h7"/>
      <path d="M12 14v7"/>
      <path d="M10 12H3"/>
      <path d="m13.5 10.5 5-5"/>
      <path d="m10.5 13.5-5 5"/>
      <path d="m13.5 13.5 5 5"/>
      <path d="m10.5 10.5-5-5"/>
    `
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: `
      <path d="M4 19V5"/>
      <path d="M4 19h17"/>
      <rect x="7" y="12" width="3" height="5" rx="1"/>
      <rect x="12" y="8" width="3" height="9" rx="1"/>
      <rect x="17" y="4" width="3" height="13" rx="1"/>
    `
  }
];

/**
 * Creates a navigation icon.
 */

function createIcon(path) {
  const svg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );

  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '23');
  svg.setAttribute('height', '23');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  svg.innerHTML = path;

  return svg;
}

/**
 * Bottom Navigation
 */

export function BottomNavigation(activeRoute = 'home') {
  const nav = document.createElement('nav');

  nav.className = 'bottom-navigation';
  nav.setAttribute('aria-label', 'Main navigation');

  NAV_ITEMS.forEach((item) => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'bottom-nav-item';
    button.dataset.route = item.id;

    const isActive = activeRoute === item.id;

    if (isActive) {
      button.classList.add('active');
    }

    button.setAttribute(
      'aria-current',
      isActive ? 'page' : 'false'
    );

    button.setAttribute(
      'aria-label',
      item.label
    );

    const icon = createIcon(item.icon);

    const label = document.createElement('span');
    label.className = 'bottom-nav-label';
    label.textContent = item.label;

    button.append(icon, label);

    nav.appendChild(button);
  });

  return nav;
}
