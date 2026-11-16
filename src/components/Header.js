
import logoUrl from '../assets/logo.svg';

/**
 * GI SMART POND
 * Application Header Component
 *
 * Returns: HTMLElement
 */

export function Header() {
  const header = document.createElement('header');
  header.className = 'app-header';

  // Brand section
  const brand = document.createElement('div');
  brand.className = 'header-brand';

  // Logo
  const logo = document.createElement('img');
  logo.src = logoUrl;
  logo.alt = 'GI Smart Pond Logo';
  logo.width = 42;
  logo.height = 42;

  // Brand text container
  const brandText = document.createElement('div');
  brandText.className = 'header-brand-text';

  const title = document.createElement('h1');
  title.className = 'header-title';
  title.textContent = 'GI SMART POND';

  const tagline = document.createElement('p');
  tagline.className = 'header-tagline';
  tagline.textContent = 'SMART AQUACULTURE MONITORING';

  brandText.append(title, tagline);
  brand.append(logo, brandText);

  // Settings navigation
  const settingsButton = document.createElement('button');
  settingsButton.type = 'button';
  settingsButton.className = 'icon-button header-settings';
  settingsButton.setAttribute('aria-label', 'Settings');
  settingsButton.setAttribute('data-route', 'settings');

  settingsButton.innerHTML = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.55"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2"/>
      <path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1M5.5 5.5 7 7M17 17l1.5 1.5M18.5 5.5 17 7M7 17l-1.5 1.5"/>
    </svg>
  `;

  header.append(brand, settingsButton);

  return header;
}
