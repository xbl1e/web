import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

export function initTypographyReveal() {
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

  tl.fromTo('.reveal-text',
    { y: 30, opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
    { y: 0, opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 0.8, stagger: 0.05, delay: 0 }
  );

  tl.fromTo('.reveal-desc',
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.05 },
    "-=0.4"
  );

  tl.fromTo('.reveal-visual',
    { opacity: 0, scale: 0.99 },
    { opacity: 1, scale: 1, duration: 1, ease: "power2.out" },
    "-=0.5"
  );
}

export function initCardClipReveal() {
  const cards = document.querySelectorAll('.reveal-card, .reveal-visual');
  cards.forEach(card => {
    gsap.fromTo(card,
      { clipPath: "inset(0% 100% 0% 0%)", opacity: 0 },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration: 0.8,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: card,
          start: "top 90%"
        }
      }
    );
  });
}

export function initMagneticFriction() {
  const magnetics = document.querySelectorAll('.magnetic');
  magnetics.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.4;

      gsap.to(btn, { x: x, y: y, duration: 0.4, ease: "power2.out" });

      const text = btn.querySelector('.btn-text');
      if (text) gsap.to(text, { x: x * 0.5, y: y * 0.5, duration: 0.4, ease: "power2.out" });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
      const text = btn.querySelector('.btn-text');
      if (text) gsap.to(text, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    });
  });
}
