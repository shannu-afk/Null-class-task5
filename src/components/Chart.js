import React, { useEffect, useRef } from 'react';

const PALETTE = ['#1976d2', '#ff9800', '#9c27b0', '#43a047', '#e91e63', '#009688', '#5d4037', '#607d8b'];
export function colorFor(idx) { return PALETTE[idx % PALETTE.length]; }

function shade(hex, pct) {
  const c = parseInt(hex.slice(1), 16);
  let r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff;
  const t = pct < 0 ? 0 : 255; const p = Math.abs(pct) / 100;
  r = Math.round((t - r) * p) + r;
  g = Math.round((t - g) * p) + g;
  b = Math.round((t - b) * p) + b;
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

export default function Chart({ data, overlays, signals }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.clientWidth;
    const H = canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, W, H);

    if (!data || data.length === 0) return;
    const closes = data.map(d => d.close);
    const min = Math.min(...closes.map(x => isFinite(x) ? x : Infinity));
    const max = Math.max(...closes.map(x => isFinite(x) ? x : -Infinity));
    const pad = (max - min) * 0.1;
    const yMin = min - pad;
    const yMax = max + pad;

    const xStep = W / Math.max(1, (data.length - 1));
    const yScale = (v) => H - ((v - yMin) / (yMax - yMin)) * H;

    // grid
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let g = 1; g < 5; g++) {
      const yy = (H / 5) * g;
      ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke();
    }

    // price
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = i * xStep;
      const y = yScale(closes[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // overlays
    overlays.forEach(ov => {
      if (!ov.series) return;
      ctx.strokeStyle = ov.color;
      ctx.lineWidth = ov.lineWidth || 1.2;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < ov.series.length; i++) {
        const v = ov.series[i];
        if (!isFinite(v)) { started = false; continue; }
        const x = i * xStep;
        const y = yScale(v);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // signals
    signals.forEach(s => {
      const x = s.i * xStep;
      const y = yScale(closes[s.i]);
      ctx.fillStyle = s.type === 'buy' ? '#0a0' : '#c00';
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    });
  }, [data, overlays, signals]);

  return <canvas ref={canvasRef} className="chart-canvas" />;
}

export function bollToOverlays(ind, b) {
  return [
    { name: ind.name + ' U', color: ind.color, series: b.upper },
    { name: ind.name + ' M', color: shade(ind.color, -10), series: b.mid },
    { name: ind.name + ' L', color: shade(ind.color, -20), series: b.lower },
  ];
}

export { shade };
