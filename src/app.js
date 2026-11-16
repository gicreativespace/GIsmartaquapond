
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
