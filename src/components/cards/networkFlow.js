import { PALETTE } from '../../utils/colors.js';

export function initNetworkCanvas() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = canvas.parentElement.clientWidth;
  let height = canvas.height = canvas.parentElement.clientHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
  });

  const tracks = 6;
  const packets = [];

  function spawnPacket() {
    packets.push({
      track: Math.floor(Math.random() * tracks),
      x: -50,
      length: Math.random() * 60 + 20,
      speed: Math.random() * 5 + 10,
      color: Math.random() > 0.7 ? PALETTE.accent : 'rgba(255,255,255,0.3)',
    });
  }

  setInterval(spawnPacket, 120);

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < tracks; i++) {
      const y = (height / (tracks + 1)) * (i + 1);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.x += p.speed;
      const y = (height / (tracks + 1)) * (p.track + 1);

      const gradient = ctx.createLinearGradient(p.x - p.length, y, p.x, y);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, p.color);

      ctx.beginPath();
      ctx.moveTo(p.x - p.length, y);
      ctx.lineTo(p.x, y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (p.x - p.length > width) {
        packets.splice(i, 1);
      }
    }
    requestAnimationFrame(draw);
  }

  draw();
}
