export function initSparklineCanvas() {
  const canvas = document.getElementById('sparkline-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = canvas.parentElement.clientWidth;
  let height = canvas.height = canvas.parentElement.clientHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
  });

  const data = new Array(50).fill(height / 2);
  let time = 0;

  function draw() {
    ctx.clearRect(0, 0, width, height);
    time += 0.05;
    const target = (Math.sin(time) * 10 + Math.random() * 20 - 10) + height / 2;
    data.push(Math.max(10, Math.min(height - 10, target)));
    data.shift();

    ctx.beginPath();
    ctx.moveTo(0, height);
    data.forEach((val, i) => { ctx.lineTo((i / 49) * width, height - val); });
    ctx.lineTo(width, height);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    data.forEach((val, i) => {
      if (i === 0) ctx.moveTo(0, height - val);
      else ctx.lineTo((i / 49) * width, height - val);
    });
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    requestAnimationFrame(draw);
  }
  draw();
}
