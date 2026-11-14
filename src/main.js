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

const hero = document.querySelector('.hero-image');
const pointerMotion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');

hero.addEventListener('pointermove', (event) => {
  if (!pointerMotion.matches) return;
  const bounds = hero.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  hero.style.setProperty('--hero-x', `${x * 14}px`);
  hero.style.setProperty('--hero-y', `${y * 10}px`);
});

hero.addEventListener('pointerleave', () => {
  hero.style.removeProperty('--hero-x');
  hero.style.removeProperty('--hero-y');
});

initProjectGrid();
initFieldNotes();
