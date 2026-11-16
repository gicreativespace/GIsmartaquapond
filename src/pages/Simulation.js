/**
 * GI SMART POND — Simulation Testing
 * Uses the approved dashboard shell, theme, Header and four-item navigation.
 */

import { Header } from '../components/Header.js';
import { BottomNavigation } from '../components/BottomNavigation.js';
import { FarmDetails } from '../components/FarmDetails.js';
import { DEMO_DATA } from '../data/demoData.js';
import { parsePondData, getSimulationSnapshot, formatSimulationTime } from '../data/simulationEngine.js';
import { setDataProvider, publishPondSnapshot } from '../data/dataProvider.js';

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function makeButton(label, className, action) {
  const button = element('button', className, label);
  button.type = 'button';
  button.addEventListener('click', action);
  return button;
}

export function Simulation() {
  const page = element('main', 'page simulation-page');
  const content = element('div', 'page-content simulation-content');
  const intro = element('section', 'simulation-intro');
  intro.append(
    element('p', 'power-eyebrow', 'TESTING & VALIDATION'),
    element('h1', 'page-title', 'Simulation Testing'),
    element('p', 'page-subtitle', 'Validate pond events before hardware integration')
  );

  const sourceCard = element('section', 'card simulation-card');
  const sourceHead = element('div', 'simulation-section-heading');
  sourceHead.append(
    element('h2', 'equipment-title', 'SIMULATION DATA FILE'),
    element('span', 'simulation-mode-pill', 'TXT INPUT')
  );
  const fileInput = element('input', 'simulation-file-input');
  fileInput.type = 'file';
  fileInput.accept = '.txt,text/plain';
  fileInput.setAttribute('aria-label', 'Choose pond-data.txt file');
  const filePicker = element('label', 'simulation-file-picker');
  filePicker.append(
    element('span', 'simulation-file-icon', '↥'),
    element('span', 'simulation-file-copy', 'Choose pond-data.txt'),
    element('span', 'simulation-file-hint', 'Plain text file · .txt')
  );
  filePicker.append(fileInput);
  const fileName = element('p', 'simulation-file-name', 'No file selected');
  const validation = element('div', 'simulation-validation');
  validation.setAttribute('aria-live', 'polite');
  validation.textContent = 'Select your TXT file to validate its configuration and events.';
  sourceCard.append(sourceHead, filePicker, fileName, validation);

  const controlCard = element('section', 'card simulation-card');
  const controlHead = element('div', 'simulation-section-heading');
  controlHead.append(
    element('h2', 'equipment-title', 'PLAYBACK CONTROL'),
    element('span', 'simulation-status-pill is-idle', 'NOT LOADED')
  );
  const timeLabel = element('p', 'simulation-time-label', 'SIMULATED TIME');
  const timeValue = element('h2', 'simulation-time-value', '--');
  const playbackButtons = element('div', 'simulation-controls');
  const playButton = makeButton('Play', 'btn-primary', () => startPlayback());
  const stepButton = makeButton('Next Event', 'btn-secondary', () => stepForward());
  const resetButton = makeButton('Reset', 'btn-secondary', () => resetPlayback());
  playButton.disabled = stepButton.disabled = resetButton.disabled = true;
  playbackButtons.append(playButton, stepButton, resetButton);
  const progressTrack = element('div', 'simulation-progress-track');
  const progressFill = element('span', 'simulation-progress-fill');
  progressTrack.append(progressFill);
  const progressLabel = element('p', 'simulation-progress-label', '0 / 0 events processed');
  controlCard.append(controlHead, timeLabel, timeValue, playbackButtons, progressTrack, progressLabel);

  const statusCard = element('section', 'card simulation-card');
  statusCard.append(element('h2', 'equipment-title', 'POWER STATUS'));
  const powerGrid = element('div', 'simulation-power-grid');
  const ebStatus = element('div', 'simulation-power-tile');
  const dgStatus = element('div', 'simulation-power-tile');
  powerGrid.append(ebStatus, dgStatus);
  statusCard.append(powerGrid, element('h2', 'equipment-title simulation-aerator-heading', 'AERATOR STATUS'));
  const aeratorGrid = element('div', 'simulation-aerator-grid');
  statusCard.append(aeratorGrid);

  const historyCard = element('section', 'card simulation-card');
  const historyHead = element('div', 'simulation-section-heading');
  historyHead.append(element('h2', 'equipment-title', 'EVENT HISTORY'), element('span', 'simulation-event-count', '0 events'));
  const historyList = element('div', 'simulation-event-list');
  historyCard.append(historyHead, historyList);

  content.append(FarmDetails(DEMO_DATA.farm), intro, sourceCard, controlCard, statusCard, historyCard);
  page.append(Header(), content, BottomNavigation(''));
  
  let simulation = null;
  let eventIndex = 0;
  let timer = null;
  let snapshot = null;
  let providerRegistered = false;

  function stopPlayback() {
    if (timer) window.clearInterval(timer);
    timer = null;
    playButton.textContent = 'Play';
  }

  function renderSnapshot() {
    if (!simulation) return;
    snapshot = getSimulationSnapshot(simulation, eventIndex);
    const status = snapshot.status;
    const makeSupply = (node, label, id) => {
      node.className = `simulation-power-tile ${status[id] === 'ON' ? 'is-on' : 'is-off'}`;
      node.replaceChildren(
        element('span', 'simulation-power-label', label),
        element('strong', 'simulation-power-value', status[id]),
        element('span', 'simulation-power-note', status[id] === 'ON' ? 'Supply available' : 'Supply unavailable')
      );
    };
    makeSupply(ebStatus, 'EB SUPPLY', 'EB');
    makeSupply(dgStatus, 'DG OUTPUT', 'DG');

    aeratorGrid.replaceChildren();
    snapshot.aerators.forEach((aerator, index) => {
      const tile = element('div', `simulation-aerator-tile ${aerator.state === 'ON' ? 'is-on' : 'is-off'}`);
      tile.append(
        element('span', 'simulation-aerator-name', `A${String(index + 1).padStart(2, '0')}`),
        element('strong', 'simulation-aerator-state', aerator.state)
      );
      aeratorGrid.append(tile);
    });

    timeValue.textContent = formatSimulationTime(snapshot.currentTime);
    progressLabel.textContent = `${eventIndex} / ${simulation.events.length} events processed`;
    progressFill.style.width = `${simulation.events.length ? (eventIndex / simulation.events.length) * 100 : 0}%`;
    controlHead.lastElementChild.textContent = timer ? 'PLAYING' : eventIndex >= simulation.events.length ? 'COMPLETED' : 'READY';
    controlHead.lastElementChild.className = `simulation-status-pill ${timer ? 'is-playing' : 'is-ready'}`;
    historyHead.lastElementChild.textContent = `${simulation.events.length} events`;

    historyList.replaceChildren();
    const visibleEvents = simulation.events.slice(0, eventIndex).slice(-12).reverse();
    if (!visibleEvents.length) {
      historyList.append(element('p', 'simulation-empty-history', 'Events will appear here as the simulation runs.'));
    } else {
      visibleEvents.forEach((event) => {
        const row = element('div', 'simulation-event-row');
        row.append(
          element('span', 'simulation-event-time', new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).format(new Date(event.time))),
          element('span', 'simulation-event-equipment', event.id.replace('AERATOR_', 'AERATOR ')),
          element('strong', `simulation-event-state ${event.state === 'ON' ? 'is-on' : 'is-off'}`, event.state)
        );
        historyList.append(row);
      });
    }

    const provider = {
      mode: 'simulation',
      getSnapshot: () => snapshot
    };
    if (!providerRegistered) {
      setDataProvider(provider);
      providerRegistered = true;
    } else {
      publishPondSnapshot(snapshot);
    }
  }

  function stepForward() {
    if (!simulation || eventIndex >= simulation.events.length) {
      stopPlayback();
      return;
    }
    eventIndex += 1;
    renderSnapshot();
    if (eventIndex >= simulation.events.length) stopPlayback();
  }

  function startPlayback() {
    if (!simulation) return;
    if (eventIndex >= simulation.events.length) eventIndex = 0;
    if (timer) {
      stopPlayback();
      renderSnapshot();
      return;
    }
    playButton.textContent = 'Pause';
    timer = window.setInterval(stepForward, 650);
    renderSnapshot();
  }

  function resetPlayback() {
    stopPlayback();
    eventIndex = 0;
    renderSnapshot();
  }

  fileInput.addEventListener('change', async () => {
    stopPlayback();
    const file = fileInput.files?.[0];
    if (!file) return;
    fileName.textContent = file.name;
    try {
      const parsed = parsePondData(await file.text());
      simulation = parsed;
      eventIndex = 0;
      validation.className = 'simulation-validation is-valid';
      validation.textContent = `Valid file · ${parsed.events.length} events · ${parsed.config.FARM_NAME || 'Farm'} · ${parsed.config.AERATOR_COUNT} aerators`;
      playButton.disabled = stepButton.disabled = resetButton.disabled = false;
      renderSnapshot();
    } catch (error) {
      simulation = null;
      playButton.disabled = stepButton.disabled = resetButton.disabled = true;
      validation.className = 'simulation-validation is-invalid';
      validation.textContent = [error.message, ...(error.details || [])].join(' ');
      timeValue.textContent = '--';
      aeratorGrid.replaceChildren();
      historyList.replaceChildren(element('p', 'simulation-empty-history', 'Correct the file and upload it again.'));
    }
  });

  return page;
}
