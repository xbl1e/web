import './styles/main.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

import { initDiscordPresence } from './components/cards/discordPresence.js';
import { initNetworkCanvas } from './components/cards/networkFlow.js';
import { initSparklineCanvas } from './components/cards/systemMetrics.js';
import { initGitHubGlobe } from './components/cards/githubHeatmap.js';
import { initStatsCanvas } from './components/cards/githubStats.js';
import { initLangCanvas } from './components/cards/githubLangs.js';
import { initProjectGrid } from './components/cards/projectGrid.js';

import {
  initScrambleText,
  initTypographyReveal,
  initCardClipReveal,
  initMagneticFriction
} from './components/shared/interactions.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  initLenis();
  initTypographyReveal();
  initCardClipReveal();
  initMagneticFriction();
  initNetworkCanvas();
  initSparklineCanvas();
  initScrambleText();
  initGitHubGlobe();
  initDiscordPresence();
  initStatsCanvas();
  initLangCanvas();
  initProjectGrid();
});

function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000) });
  gsap.ticker.lagSmoothing(0);
}
