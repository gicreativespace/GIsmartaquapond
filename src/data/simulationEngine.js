/**
 * GI SMART POND — Simulation Engine
 * Parses the documented pond-data.txt format and replays timestamped feedback events.
 */

const EQUIPMENT_IDS = new Set([
  'EB', 'DG',
  ...Array.from({ length: 10 }, (_, index) => `AERATOR_${String(index + 1).padStart(2, '0')}`)
]);

const DEFAULT_STATUS = Object.fromEntries(
  [...EQUIPMENT_IDS].map((id) => [id, 'OFF'])
);

export function parsePondData(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('The selected file is empty.');
  }

  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const config = {};
  const initialStatus = { ...DEFAULT_STATUS };
  const events = [];
  const errors = [];
  let section = '';

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return;

    const sectionMatch = line.match(/^\[([A-Z_]+)\]$/i);
    if (sectionMatch) {
      section = sectionMatch[1].toUpperCase();
      return;
    }

    if (section === 'END') return;

    if (section === 'CONFIG') {
      const splitAt = line.indexOf('=');
      if (splitAt < 1) {
        errors.push(`Line ${index + 1}: expected KEY=VALUE in CONFIG.`);
        return;
      }
      config[line.slice(0, splitAt).trim()] = line.slice(splitAt + 1).trim();
      return;
    }

    if (section === 'INITIAL_STATUS') {
      const splitAt = line.indexOf('=');
      if (splitAt < 1) {
        errors.push(`Line ${index + 1}: expected EQUIPMENT=ON/OFF.`);
        return;
      }
      const id = line.slice(0, splitAt).trim().toUpperCase();
      const state = line.slice(splitAt + 1).trim().toUpperCase();
      if (!EQUIPMENT_IDS.has(id) || !['ON', 'OFF'].includes(state)) {
        errors.push(`Line ${index + 1}: invalid equipment or state.`);
        return;
      }
      initialStatus[id] = state;
      return;
    }

    if (section === 'EVENTS') {
      const parts = line.split('|').map((part) => part.trim());
      if (parts.length !== 3) {
        errors.push(`Line ${index + 1}: expected timestamp|equipment|ON/OFF.`);
        return;
      }
      const [timestamp, rawId, rawState] = parts;
      const id = rawId.toUpperCase();
      const state = rawState.toUpperCase();
      const time = Date.parse(timestamp);
      if (!Number.isFinite(time) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(timestamp)) {
        errors.push(`Line ${index + 1}: invalid timestamp.`);
        return;
      }
      if (!EQUIPMENT_IDS.has(id) || !['ON', 'OFF'].includes(state)) {
        errors.push(`Line ${index + 1}: unknown equipment or invalid state.`);
        return;
      }
      events.push({ timestamp, time, id, state, line: index + 1 });
      return;
    }

    errors.push(`Line ${index + 1}: content outside a recognized section.`);
  });

  if (Number(config.AERATOR_COUNT) !== 10) {
    errors.push('CONFIG: AERATOR_COUNT must be 10 for this sample system.');
  }
  if (!events.length) errors.push('EVENTS: no valid events were found.');

  events.sort((a, b) => a.time - b.time);
  for (let index = 1; index < events.length; index += 1) {
    if (events[index].time < events[index - 1].time) {
      errors.push('EVENTS: timestamps must be in chronological order.');
      break;
    }
  }

  if (errors.length) {
    const error = new Error('The simulation file needs corrections.');
    error.details = errors;
    throw error;
  }

  return {
    config,
    initialStatus,
    events,
    startTime: events[0].time,
    endTime: events[events.length - 1].time
  };
}

export function getSimulationSnapshot(simulation, eventIndex) {
  const status = { ...simulation.initialStatus };
  const appliedEvents = simulation.events.slice(0, eventIndex);
  appliedEvents.forEach((event) => { status[event.id] = event.state; });

  const currentEvent = appliedEvents.at(-1);
  const currentTime = currentEvent?.time ?? simulation.startTime;
  const aerators = Array.from({ length: 10 }, (_, index) => {
    const id = `AERATOR_${String(index + 1).padStart(2, '0')}`;
    return { id, state: status[id] };
  });

  return {
    status,
    aerators,
    currentTime,
    eventIndex,
    totalEvents: simulation.events.length,
    appliedEvents,
    nextEvent: simulation.events[eventIndex] ?? null
  };
}

export function formatSimulationTime(timestamp) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp));
}
