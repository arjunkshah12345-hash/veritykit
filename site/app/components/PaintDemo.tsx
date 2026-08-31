"use client";

import { useEffect, useRef, useState } from "react";

const PROGRAM = `ctx.fillStyle='#1e3a8a';ctx.fillRect(0,0,64,40);
ctx.fillStyle='#ea580c';ctx.fillRect(0,28,64,12);
ctx.fillStyle='#eab308';ctx.beginPath();ctx.arc(44,22,8,0,6.28);ctx.fill();
ctx.fillStyle='#1d4ed8';ctx.fillRect(0,40,64,24);`;

type Scores = { ran: number; coverage: number; colors: number };

export function PaintDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scores, setScores] = useState<Scores>({ ran: 0, coverage: 0, colors: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 64, 64);
    try {
      // The generated program only uses fillStyle / fillRect / arc / fill.
      new Function("ctx", PROGRAM)(ctx);
      const data = ctx.getImageData(0, 0, 64, 64).data;
      const colors = new Set<string>();
      let filled = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        if (!(r > 250 && g > 250 && b > 250)) {
          filled += 1;
          colors.add(`${r >> 4},${g >> 4},${b >> 4}`);
        }
      }
      setScores({
        ran: 1,
        coverage: filled / (64 * 64),
        colors: Math.min(1, colors.size / 12),
      });
    } catch {
      setScores({ ran: 0, coverage: 0, colors: 0 });
    }
  }, []);

  return (
    <div className="usage-demo-card">
      <div className="usage-demo-stage">
        <canvas ref={canvasRef} className="usage-demo-canvas" width={64} height={64} />
        <div className="usage-demo-scores">
          <div>
            ran
            <strong>{scores.ran.toFixed(2)}</strong>
          </div>
          <div>
            coverage
            <strong>{scores.coverage.toFixed(2)}</strong>
          </div>
          <div>
            colors
            <strong>{scores.colors.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
