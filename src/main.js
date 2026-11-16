
import './styles/variables.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/animations.css';
import './styles/responsive.css';

import { initializeApp } from './app.js';

/**
 * GI SMART POND
 * Application Entry Point
 */

const APP_VERSION = '1.0.0';

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.info('Service workers are not supported.');
    return;
  }

  if (!import.meta.env.PROD) {
    return;
  }

  try {
    const baseUrl = import.meta.env.BASE_URL;

    await navigator.serviceWorker.register(
      `${baseUrl}service-worker.js`,
      { scope: baseUrl }
    );

    console.info('GI SMART POND: Service worker registered.');
  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
}

async function startApplication() {
  console.info(`GI SMART POND v${APP_VERSION}`);

  try {
    await initializeApp();
    await registerServiceWorker();
  } catch (error) {
    console.error('Application initialization failed:', error);

    const appRoot = document.getElementById('app');

    if (appRoot) {
      appRoot.innerHTML = `
        <main role="alert" class="app-error">
          <h2>Unable to load GI SMART POND</h2>
          <p>Please refresh the application.</p>
        </main>
      `;
    }
  }
}

startApplication();
