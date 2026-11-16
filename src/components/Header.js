
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
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3"/>
      <path d="
        M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06
        -1.7 2.94-.08-.02a1.7 1.7 0 0 0-1.78.66l-.04.07
        h-3.4l-.04-.07a1.7 1.7 0 0 0-1.78-.66l-.08.02
        -1.7-2.94.06-.06A1.7 1.7 0 0 0 9.6 15l-.08-.03v-3.4
        l.08-.03a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-2.94
        .08.02a1.7 1.7 0 0 0 1.78-.66l.04-.07h3.4l.04.07
        a1.7 1.7 0 0 0 1.78.66l.08-.02 1.7 2.94-.06.06
        A1.7 1.7 0 0 0 19.4 12l.08.03v3.4z
      "/>
    </svg>
  `;

  header.append(brand, settingsButton);

  return header;
}
