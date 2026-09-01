"use client";

import { useEffect, useRef } from "react";

const RAMP = " .:-=+*#%@";

type Vec = { x: number; y: number; z: number };

type Sample = {
  x: number;
  y: number;
  z: number;
  nx: number;
  ny: number;
  nz: number;
};

function rotX(p: Vec, n: Vec, a: number): { p: Vec; n: Vec } {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return {
    p: { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c },
    n: { x: n.x, y: n.y * c - n.z * s, z: n.y * s + n.z * c },
  };
}

function rotY(p: Vec, n: Vec, a: number): { p: Vec; n: Vec } {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return {
    p: { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c },
    n: { x: n.x * c + n.z * s, y: n.y, z: -n.x * s + n.z * c },
  };
}

function torus(R: number, r: number, uN: number, vN: number) {
  const out: Sample[] = [];
  for (let i = 0; i < uN; i += 1) {
    const u = (i / uN) * Math.PI * 2;
    const cu = Math.cos(u);
    const su = Math.sin(u);
    for (let j = 0; j < vN; j += 1) {
      const v = (j / vN) * Math.PI * 2;
      const cv = Math.cos(v);
      const sv = Math.sin(v);
      out.push({
        x: (R + r * cv) * cu,
        y: (R + r * cv) * su,
        z: r * sv,
        nx: cv * cu,
        ny: cv * su,
        nz: sv,
      });
    }
  }
  return out;
}

const MESH = torus(1.12, 0.36, 200, 88);

function shade(nx: number, ny: number, nz: number) {
  const key = Math.max(0, nx * -0.42 + ny * -0.72 + nz * 0.55);
  const rim = Math.max(0, nx * 0.15 + ny * 0.35 + nz * 0.22);
  return Math.min(1, 0.18 + key * 0.78 + rim * 0.16);
}

export function AsciiField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let frame = 0;
    let raf = 0;
    let t0 = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(32, now - t0);
      t0 = now;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;

      const cellH = Math.max(11 * dpr, Math.min(17 * dpr, height / 34));
      const cellW = cellH * 0.56;
      const cols = Math.max(36, Math.floor(width / cellW));
      const rows = Math.max(22, Math.floor(height / cellH));
      const spin = reduce ? 0.4 : frame * 0.02;
      const ax = 0.58 + pointer.y * 0.22;
      const ay = spin + pointer.x * 0.45;

      const zbuf = new Float32Array(cols * rows);
      const chars = new Uint8Array(cols * rows);
      const lits = new Float32Array(cols * rows);
      zbuf.fill(1e9);

      const focal = 2.05;
      const cam = 4.55;

      for (const s of MESH) {
        let q = rotX({ x: s.x, y: s.y, z: s.z }, { x: s.nx, y: s.ny, z: s.nz }, ax);
        q = rotY(q.p, q.n, ay);
        const z = q.p.z + cam;
        if (z <= 0.2) continue;
        const px = (q.p.x * focal) / z;
        const py = (q.p.y * focal) / z;
        const col = Math.floor((px + 1) * 0.5 * cols);
        const row = Math.floor((py + 1) * 0.5 * rows);
        if (col < 0 || row < 0 || col >= cols || row >= rows) continue;
        const i = row * cols + col;
        if (z >= zbuf[i]!) continue;
        zbuf[i] = z;
        const lit = shade(q.n.x, q.n.y, q.n.z);
        lits[i] = lit;
        chars[i] = Math.max(1, Math.min(RAMP.length - 1, Math.floor(lit * (RAMP.length - 0.01))));
      }

      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `500 ${Math.floor(cellH)}px ${getComputedStyle(canvas).fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < chars.length; i += 1) {
        const ch = chars[i]!;
        if (ch === 0) continue;
        const c = i % cols;
        const r = (i - c) / cols;
        const lit = lits[i]!;
        const a = 0.22 + lit * 0.78;
        ctx.fillStyle = `rgba(240,236,228,${a.toFixed(3)})`;
        ctx.fillText(RAMP[ch]!, (c + 0.5) * (width / cols), (r + 0.5) * (height / rows));
      }

      if (!reduce) {
        frame += dt / 16.67;
        raf = window.requestAnimationFrame(draw);
      }
    };

    const onMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.tx = ((event.clientX - box.left) / box.width) * 2 - 1;
      pointer.ty = ((event.clientY - box.top) / box.height) * 2 - 1;
    };
    const onLeave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(() => {
      if (reduce) draw(performance.now());
    });
    ro.observe(canvas);
    draw(performance.now());

    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="vk-ascii" aria-label="Rotating 3D ASCII torus" />;
}
