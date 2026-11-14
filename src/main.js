import './styles/main.css';
import { initFieldNotes } from './components/cards/fieldNotes.js';
import { initProjectGrid } from './components/cards/projectGrid.js';
import { initSignalStudy } from './components/signalStudy.js';

const canvas = document.getElementById('signal-art');
const controls = document.getElementById('study-controls');
const pauseButton = document.getElementById('study-pause');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const study = initSignalStudy(canvas, { pause: motion.matches });

if (canvas.dataset.signalReady) {
  controls.hidden = false;
  const modes = [...controls.querySelectorAll('[data-mode]')];

  for (const button of modes) {
    button.addEventListener('click', () => {
      study.setMode(Number(button.dataset.mode));
      for (const mode of modes) mode.setAttribute('aria-pressed', mode === button);
    });
  }

  function showMotionPreference() {
    pauseButton.hidden = motion.matches;
    if (motion.matches) study.setPaused(true);
    pauseButton.setAttribute('aria-pressed', 'true');
    pauseButton.setAttribute('aria-label', 'Play artwork');
  }

  if (motion.matches) showMotionPreference();
  motion.addEventListener('change', showMotionPreference);

  pauseButton.addEventListener('click', () => {
    const pause = pauseButton.getAttribute('aria-pressed') !== 'true';
    study.setPaused(pause);
    pauseButton.setAttribute('aria-pressed', pause);
    pauseButton.setAttribute('aria-label', pause ? 'Play artwork' : 'Pause artwork');
  });
}

const specimen = document.getElementById('browser-specimen');
const viewportControls = document.getElementById('viewport-controls');
const viewportModes = [...viewportControls.querySelectorAll('[data-viewport]')];
viewportControls.hidden = false;

for (const button of viewportModes) {
  button.addEventListener('click', () => {
    specimen.dataset.viewport = button.dataset.viewport;
    for (const mode of viewportModes) mode.setAttribute('aria-pressed', mode === button);
  });
}

const archive = document.getElementById('archive');
function openArchiveFromHash() {
  if (window.location.hash === '#archive') archive.open = true;
}
window.addEventListener('hashchange', openArchiveFromHash);
openArchiveFromHash();

initProjectGrid();
initFieldNotes();
