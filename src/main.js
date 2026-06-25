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
  initMagneticFriction,
  initTiltEffect,
  initParallax
} from './components/shared/interactions.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  initCustomCursor();
  initLenis();
  initTypographyReveal();
  initCardClipReveal();
  initMagneticFriction();
  initTiltEffect();
  initParallax();
  initNetworkCanvas();
  initSparklineCanvas();
  initScrambleText();
  initGitHubGlobe();
  initDiscordPresence();
  initStatsCanvas();
  initLangCanvas();
  initProjectGrid();
});

function initPreloader() {
  const tl = gsap.timeline();
  tl.to('.preloader-progress', { width: '100%', duration: 1.5, ease: 'power2.inOut' })
    .to('.preloader', { opacity: 0, duration: 0.8, ease: 'power2.inOut', onComplete: () => {
      document.querySelector('.preloader').style.display = 'none';
    }}, '+=0.2');
}

function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;

  document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: 'power2.out'
    });
  });

  const hoverElements = document.querySelectorAll('a, button, .magnetic, .card');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

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
