import './styles/main.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

import { initDiscordPresence } from './components/cards/discordPresence.js';
import { initNetworkCanvas }   from './components/cards/networkFlow.js';
import { initSparklineCanvas } from './components/cards/systemMetrics.js';
import { initGitHubGlobe }     from './components/cards/githubHeatmap.js';
import { initStatsCanvas }     from './components/cards/githubStats.js';
import { initLangCanvas }      from './components/cards/githubLangs.js';
import { initProjectGrid }     from './components/cards/projectGrid.js';

import {
  initScrambleText,
  initTypographyReveal,
  initCardClipReveal,
  initMagneticFriction,
  initTiltEffect,
  initParallax
} from './components/shared/interactions.js';

import { initAurora }          from './components/effects/aurora.js';
import { initSpotlightCards }  from './components/effects/spotlight.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCustomCursor();
  initLenis();
  initAurora();
  initTypographyReveal();
  initCardClipReveal();
  initMagneticFriction();
  initTiltEffect();
  initParallax();
  initSpotlightCards();
  initNetworkCanvas();
  initSparklineCanvas();
  initScrambleText();
  initGitHubGlobe();
  initDiscordPresence();
  initStatsCanvas();
  initLangCanvas();
  initProjectGrid();
});

/* ─── Preloader ─────────────────────────────────────────── */
function initPreloader() {
  const tl = gsap.timeline();
  tl.to('.preloader-progress', {
    width: '100%',
    duration: 1.4,
    ease: 'power2.inOut'
  }).to('.preloader', {
    opacity: 0,
    duration: 0.6,
    ease: 'power2.inOut',
    onComplete: () => {
      const el = document.querySelector('.preloader');
      if (el) el.style.display = 'none';
    }
  }, '+=0.15');
}

/* ─── Custom Cursor ─────────────────────────────────────── */
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;

  document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.08,
      ease: 'power2.out'
    });
  });

  const hoverTargets = document.querySelectorAll('a, button, .magnetic, .card');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

/* ─── Lenis Smooth Scroll ───────────────────────────────── */
function initLenis() {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}
