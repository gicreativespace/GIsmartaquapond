
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
  home: () => import('./pages/Home.js'),
  power: () => import('./pages/Power.js'),
  aerators: () => import('./pages/Aerators.js'),
  reports: () => import('./pages/Reports.js'),
  settings: () => import('./pages/Settings.js')
};

let appRoot = null;
let currentPage = null;
let navigationController = null;

function getCurrentRoute() {
  const route = window.location.hash
    .replace(/^#\/?/, '')
    .split('/')[0]
    .toLowerCase();

  return PAGE_ROUTES[route] ? route : 'home';
}

async function renderRoute() {
  const route = getCurrentRoute();

  if (!appRoot) return;

  if (navigationController) {
    navigationController.abort();
  }

  navigationController = new AbortController();

  appRoot.setAttribute('aria-busy', 'true');

  try {
    const pageModule = await PAGE_ROUTES[route]();

    if (!pageModule.renderPage) {
      throw new Error(`renderPage() missing in ${route} page`);
    }

    const pageElement = await pageModule.renderPage();

    if (!(pageElement instanceof HTMLElement)) {
      throw new Error(`Invalid page element returned by ${route}`);
    }

    // Prevent an older navigation request from replacing a newer page.
    if (navigationController.signal.aborted) return;

    appRoot.replaceChildren(pageElement);

    currentPage = route;

    appRoot.dataset.currentPage = currentPage;
    appRoot.removeAttribute('aria-busy');

    window.dispatchEvent(
      new CustomEvent('gi:page-changed', {
        detail: { page: currentPage }
      })
    );
  } catch (error) {
    if (navigationController.signal.aborted) return;

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
}

function handleNavigation(event) {
  const link = event.target.closest('[data-route]');

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
