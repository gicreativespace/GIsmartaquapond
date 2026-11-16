
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
  settingsButton.hidden = true;
  settingsButton.dataset.adminOnly = 'true';

  settingsButton.innerHTML = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.65"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"/>
      <path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V4a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z"/>
    </svg>
  `;

  header.append(brand, settingsButton);

  return header;
}
