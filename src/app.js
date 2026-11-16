
/**
 * GI SMART POND
 * Application Controller
 *
 * Responsibilities:
 * - Application initialization
 * - Page navigation
 * - Lazy loading of pages
 * - Central application error handling
 */

const PAGE_ROUTES = {
  home: {
    load: () => import('./pages/Home.js'),
    component: 'Home'
  },
  power: {
    load: () => import('./pages/Power.js'),
    component: 'Power'
  },
  aerators: {
    load: () => import('./pages/Aerators.js'),
    component: 'Aerators'
  },
  reports: {
    load: () => import('./pages/Reports.js'),
    component: 'Reports'
  },
  settings: {
    load: () => import('./pages/Settings.js'),
    component: 'Settings'
  }
};

let appRoot = null;
let currentPage = null;

let navigationController = null;
let contactPopupShownThisSession = false;

function createBrandFooter() {
  const footer = document.createElement('footer');
  footer.className = 'brand-footer';
  footer.innerHTML = `
    <p class="brand-footer-credit">A GI Creative Space Work</p>
    <p class="brand-footer-tagline">Inspired by Godavari.</p>
  `;

  const storageKey = 'gi-smart-pond-contact-popup-seen';
  let alreadySeen = contactPopupShownThisSession;

  try {
    alreadySeen = alreadySeen || localStorage.getItem(storageKey) === 'true';
  } catch (error) {
    // Keep the popup available for this session when storage is restricted.
  }

  if (alreadySeen) return footer;

  const overlay = document.createElement('div');
  overlay.className = 'brand-contact-overlay';
  overlay.setAttribute('role', 'presentation');

  const dialog = document.createElement('section');
  dialog.className = 'brand-contact-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'brand-contact-title');
  dialog.setAttribute('aria-describedby', 'brand-contact-description');

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'brand-contact-close';
  close.setAttribute('aria-label', 'Close contact message');
  close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';

  const icon = document.createElement('div');
  icon.className = 'brand-contact-icon';
  icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L4 20l1.1-4A8.2 8.2 0 1 1 20.2 11.7Z"/><path d="M8.7 8.3c.2-.4.4-.4.7-.4h.5c.2 0 .3.1.4.4l.7 1.6c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.3 0 .6.5.8 1.2 1.5 2 2 .2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5 0 .4-.2 1-.6 1.3-.4.4-1 .6-1.6.5-1-.1-2.3-.8-3.5-1.8-1.3-1.1-2.2-2.5-2.4-3.5-.2-.9.1-1.7.5-2.2Z"/></svg>';

  const title = document.createElement('h2');
  title.id = 'brand-contact-title';
  title.textContent = 'Need Digital Solutions?';

  const description = document.createElement('p');
  description.id = 'brand-contact-description';
  description.textContent = 'For your digital needs, creative solutions and smart technology, contact us.';

  const whatsapp = document.createElement('a');
  whatsapp.className = 'brand-contact-whatsapp';
  whatsapp.href = 'https://wa.me/918985361991';
  whatsapp.target = '_blank';
  whatsapp.rel = 'noopener noreferrer';
  whatsapp.setAttribute('aria-label', 'Contact us on WhatsApp');
  whatsapp.innerHTML = `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path fill="currentColor" d="M16.02 3.2A12.7 12.7 0 0 0 5.1 22.38L3.4 28.6l6.38-1.67A12.7 12.7 0 1 0 16.02 3.2Zm0 23.1c-1.98 0-3.92-.53-5.62-1.54l-.4-.24-3.78.99 1.01-3.68-.26-.42A10.52 10.52 0 1 1 16.02 26.3Zm5.77-7.88c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.72.16-.21.32-.83 1.05-1.02 1.26-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.99-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.1-1.12 2.67s1.15 3.1 1.31 3.31c.16.21 2.26 3.45 5.48 4.84.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37Z"/>
    </svg>
    <span>WhatsApp Us</span>
  `;

  dialog.append(close, icon, title, description, whatsapp);
  overlay.append(dialog);

  const markSeenAndClose = () => {
    contactPopupShownThisSession = true;
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (error) {
      // Session-level guard above still prevents repeated display.
    }
    overlay.remove();
  };

  close.addEventListener('click', markSeenAndClose);
  whatsapp.addEventListener('click', markSeenAndClose);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) markSeenAndClose();
  });

  document.addEventListener('keydown', function handlePopupEscape(event) {
    if (event.key === 'Escape' && overlay.isConnected) {
      markSeenAndClose();
      document.removeEventListener('keydown', handlePopupEscape);
    }
  });

  footer.append(overlay);
  return footer;
}

function getCurrentRoute() {
  const route = window.location.hash
    .replace(/^#\/?/, '')
    .split('/')[0]
    .toLowerCase();

  return PAGE_ROUTES[route] ? route : 'home';
}

function showPageError(error) {
  console.error('Page loading failed:', error);

  appRoot.removeAttribute('aria-busy');

  const errorElement = document.createElement('div');
  errorElement.className = 'app-error';
  errorElement.setAttribute('role', 'alert');

  const heading = document.createElement('h2');
  heading.textContent = 'Unable to load this page';

  const message = document.createElement('p');
  message.textContent = 'Please refresh the application.';

  errorElement.append(heading, message);
  appRoot.replaceChildren(errorElement);
}

async function renderRoute() {
  const route = getCurrentRoute();

  if (!appRoot) return;

  if (navigationController) {
    navigationController.abort();
  }

  const controller = new AbortController();
  navigationController = controller;

  appRoot.setAttribute('aria-busy', 'true');

  try {
    const routeConfig = PAGE_ROUTES[route];

    const pageModule = await routeConfig.load();

    if (controller.signal.aborted) return;

    const renderPage = pageModule[routeConfig.component];

    if (typeof renderPage !== 'function') {
      throw new Error(
        `${routeConfig.component}() missing in ${route} page`
      );
    }

    const pageElement = renderPage();

    if (!(pageElement instanceof HTMLElement)) {
      throw new Error(
        `Invalid page element returned by ${route}`
      );
    }

    if (controller.signal.aborted) return;

    appRoot.replaceChildren(pageElement);
    pageElement.append(createBrandFooter());

    currentPage = route;

    appRoot.dataset.currentPage = currentPage;
    appRoot.removeAttribute('aria-busy');

    window.dispatchEvent(
      new CustomEvent('gi:page-changed', {
        detail: { page: currentPage }
      })
    );

  } catch (error) {
    if (controller.signal.aborted) return;

    showPageError(error);
  }
}

function handleNavigation(event) {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const link = target.closest('[data-route]');

  if (!link || !appRoot.contains(link)) return;

  const route = link.dataset.route;

  if (!PAGE_ROUTES[route]) return;

  event.preventDefault();

  const targetHash = `#/${route}`;

  if (window.location.hash === targetHash) {
    renderRoute();
  } else {
    window.location.hash = targetHash;
  }
}

export async function initializeApp() {
  appRoot = document.getElementById('app');

  if (!appRoot) {
    throw new Error('Application root #app was not found.');
  }

  appRoot.addEventListener('click', handleNavigation);

  window.addEventListener('hashchange', renderRoute);

  if (!window.location.hash) {
    window.location.hash = '#/home';
  } else {
    await renderRoute();
  }
}
