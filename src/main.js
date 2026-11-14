import './styles/main.css';
import { initFieldNotes } from './components/cards/fieldNotes.js';
import { initProjectGrid } from './components/cards/projectGrid.js';

for (const link of document.querySelectorAll('[data-exhibit]')) {
  const dialog = document.getElementById(link.dataset.exhibit);
  if (!dialog?.showModal) continue;

  link.setAttribute('aria-haspopup', 'dialog');
  link.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dialog.showModal();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

const archive = document.getElementById('archive');
function openArchiveFromHash() {
  if (window.location.hash === '#archive') archive.open = true;
}
window.addEventListener('hashchange', openArchiveFromHash);
openArchiveFromHash();

const pointerMotion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
for (const artwork of document.querySelectorAll('[data-tilt]')) {
  artwork.addEventListener('pointermove', (event) => {
    if (!pointerMotion.matches) return;
    const bounds = artwork.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    artwork.style.setProperty('--art-x', `${x * 13}px`);
    artwork.style.setProperty('--art-y', `${y * 10}px`);
  });

  artwork.addEventListener('pointerleave', () => {
    artwork.style.removeProperty('--art-x');
    artwork.style.removeProperty('--art-y');
  });
}

initProjectGrid();
initFieldNotes();
