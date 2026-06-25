import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────
   SCRAMBLE TEXT — hover letter scramble on tagged elements
   ───────────────────────────────────────────────────────── */
export function initScrambleText() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  const scramblers = document.querySelectorAll('.scramble-text');

  scramblers.forEach(el => {
    const originalHTML = el.innerHTML;
    const textOnly = Array.from(el.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent)
      .join('')
      .trim();

    el.addEventListener('mouseenter', () => {
      let iteration = 0;
      clearInterval(el.dataset.scrambleInterval);

      el.dataset.scrambleInterval = setInterval(() => {
        const scrambled = textOnly.split('').map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iteration) return textOnly[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');

        el.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            node.textContent = ' ' + scrambled + ' ';
          }
        });

        if (iteration >= textOnly.length) {
          clearInterval(el.dataset.scrambleInterval);
          el.innerHTML = originalHTML;
        }
        iteration += 1 / 3;
      }, 30);
    });
  });
}

/* ─────────────────────────────────────────────────────────
   TYPOGRAPHY REVEAL — staggered clip-path wipe on load
   ───────────────────────────────────────────────────────── */
export function initTypographyReveal() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.fromTo('.reveal-text',
    { y: 40, opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
    { y: 0,  opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      duration: 0.9, stagger: 0.07, delay: 0.1 }
  );

  tl.fromTo('.reveal-desc',
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 },
    '-=0.5'
  );

  tl.fromTo('.reveal-visual',
    { opacity: 0, scale: 0.985 },
    { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' },
    '-=0.7'
  );
}

/* ─────────────────────────────────────────────────────────
   CARD CLIP REVEAL — scroll-triggered wipe per card
   ───────────────────────────────────────────────────────── */
export function initCardClipReveal() {
  const cards = document.querySelectorAll('.reveal-card');

  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: (i % 3) * 0.07,
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
        }
      }
    );
  });

  // Section headers
  gsap.utils.toArray('.reveal-desc').forEach(el => {
    if (el.closest('.hero-split')) return; // handled by typography reveal
    ScrollTrigger.create({
      trigger: el,
      start: 'top 94%',
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }),
    });
  });
}

/* ─────────────────────────────────────────────────────────
   TILT EFFECT — subtle 3-D rotate on card hover
   ───────────────────────────────────────────────────────── */
export function initTiltEffect() {
  const cards = document.querySelectorAll('.card-inner');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;

      gsap.to(card, {
        rotateX: ((y - cy) / cy) * -6,
        rotateY: ((x - cx) / cx) * 6,
        transformPerspective: 1200,
        ease: 'power2.out',
        duration: 0.5
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, ease: 'power3.out', duration: 1 });
    });
  });
}

/* ─────────────────────────────────────────────────────────
   PARALLAX — mild vertical drift on cards while scrolling
   ───────────────────────────────────────────────────────── */
export function initParallax() {
  gsap.utils.toArray('.hero-visual').forEach(el => {
    gsap.to(el, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}

/* ─────────────────────────────────────────────────────────
   MAGNETIC FRICTION — elastic pull on buttons
   ───────────────────────────────────────────────────────── */
export function initMagneticFriction() {
  const magnetics = document.querySelectorAll('.magnetic');

  magnetics.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width  / 2) * 0.35;
      const y = (e.clientY - rect.top  - rect.height / 2) * 0.35;

      gsap.to(btn, { x, y, duration: 0.4, ease: 'power2.out' });

      const text = btn.querySelector('.btn-text');
      if (text) gsap.to(text, { x: x * 0.4, y: y * 0.4, duration: 0.4, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
      const text = btn.querySelector('.btn-text');
      if (text) gsap.to(text, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
    });
  });
}
