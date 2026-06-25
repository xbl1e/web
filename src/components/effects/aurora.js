/**
 * Aurora Background — reactbits-inspired canvas aurora effect
 * Renders soft, animated gradient orbs in the hero background
 */
export function initAurora() {
  const canvas = document.getElementById('aurora-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, animId;

  // Aurora orb definitions
  const orbs = [
    { x: 0.15, y: 0.35, r: 0.55, color: [68, 147, 248],   speed: 0.00018, phase: 0 },
    { x: 0.75, y: 0.25, r: 0.45, color: [30,  80,  200],  speed: 0.00025, phase: 2.1 },
    { x: 0.55, y: 0.70, r: 0.50, color: [100, 60,  220],  speed: 0.00020, phase: 4.3 },
    { x: 0.30, y: 0.65, r: 0.38, color: [20,  140, 255],  speed: 0.00030, phase: 1.2 },
  ];

  function resize() {
    width  = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width  = width;
    canvas.height = height;
  }

  function draw(ts) {
    ctx.clearRect(0, 0, width, height);

    for (const orb of orbs) {
      const t = ts * orb.speed + orb.phase;
      const cx = (orb.x + Math.sin(t * 1.3) * 0.12) * width;
      const cy = (orb.y + Math.cos(t * 0.9) * 0.10) * height;
      const radius = orb.r * Math.min(width, height);

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const [r, g, b] = orb.color;
      grad.addColorStop(0,   `rgba(${r},${g},${b},0.22)`);
      grad.addColorStop(0.5, `rgba(${r},${g},${b},0.08)`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(() => {
    resize();
  });
  ro.observe(canvas.parentElement || document.body);

  resize();
  animId = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(animId);
    ro.disconnect();
  };
}
