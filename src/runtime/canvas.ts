const NAMES: Record<string, [number, number, number]> = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [220, 38, 38],
  crimson: [185, 28, 28],
  orange: [234, 88, 12],
  gold: [234, 179, 8],
  yellow: [250, 204, 21],
  khaki: [196, 181, 127],
  wheat: [245, 222, 179],
  coral: [251, 113, 133],
  tomato: [239, 68, 68],
  pink: [244, 114, 182],
  purple: [147, 51, 234],
  navy: [30, 58, 138],
  midnightblue: [15, 23, 42],
  darkblue: [30, 64, 175],
  blue: [37, 99, 235],
  steelblue: [56, 189, 248],
  skyblue: [125, 211, 252],
  deepskyblue: [14, 165, 233],
  teal: [13, 148, 136],
  green: [22, 163, 74],
  brown: [120, 53, 15],
  gray: [107, 114, 128],
  grey: [107, 114, 128],
};

export type Pixel = { r: number; g: number; b: number; a: number };

export class SoftwareCanvas {
  readonly width: number;
  readonly height: number;
  readonly pixels: Uint8ClampedArray;
  fillStyle = "#000000";
  strokeStyle = "#000000";
  lineWidth = 1;
  globalAlpha = 1;
  private path: Array<{ x: number; y: number }> = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.pixels.fill(255);
  }

  getContext(): this {
    return this;
  }

  clearRect(x: number, y: number, w: number, h: number): void {
    this.rect(x, y, w, h, [255, 255, 255, 255]);
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this.rect(x, y, w, h, this.rgba(this.fillStyle));
  }

  strokeRect(x: number, y: number, w: number, h: number): void {
    this.fillRect(x, y, w, this.lineWidth);
    this.fillRect(x, y + h - this.lineWidth, w, this.lineWidth);
    this.fillRect(x, y, this.lineWidth, h);
    this.fillRect(x + w - this.lineWidth, y, this.lineWidth, h);
  }

  beginPath(): void {
    this.path = [];
  }

  moveTo(x: number, y: number): void {
    this.path.push({ x, y });
  }

  lineTo(x: number, y: number): void {
    this.path.push({ x, y });
  }

  closePath(): void {
    if (this.path[0]) this.path.push({ ...this.path[0] });
  }

  arc(x: number, y: number, r: number, start: number, end: number): void {
    const steps = Math.max(12, Math.ceil(r * 4));
    for (let i = 0; i <= steps; i++) {
      const t = start + ((end - start) * i) / steps;
      this.path.push({ x: x + Math.cos(t) * r, y: y + Math.sin(t) * r });
    }
  }

  fill(): void {
    this.fillPolygon(this.path, this.rgba(this.fillStyle));
    this.path = [];
  }

  stroke(): void {
    const color = this.rgba(this.strokeStyle);
    for (let i = 1; i < this.path.length; i++) {
      this.line(this.path[i - 1]!.x, this.path[i - 1]!.y, this.path[i]!.x, this.path[i]!.y, color);
    }
    this.path = [];
  }

  fillText(): void {
    // Intentionally a no-op glyph renderer — presence still shows up as a call.
  }

  metrics(): Record<string, number> {
    const w = this.width;
    const h = this.height;
    const colors = new Set<string>();
    let filled = 0;
    let minX = w;
    let minY = h;
    let maxX = 0;
    let maxY = 0;
    let lum = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = this.pixels[i]!;
        const g = this.pixels[i + 1]!;
        const b = this.pixels[i + 2]!;
        const a = this.pixels[i + 3]!;
        const white = r > 250 && g > 250 && b > 250;
        if (!white && a > 0) {
          filled += 1;
          colors.add(`${r >> 4},${g >> 4},${b >> 4}`);
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
        lum += (r + g + b) / 3;
      }
    }
    const area = w * h;
    const bw = Math.max(0, maxX - minX);
    const bh = Math.max(0, maxY - minY);
    return {
      coverage: filled / area,
      colorDiversity: Math.min(1, colors.size / 12),
      bbox: (bw * bh) / area,
      brightness: lum / area / 255,
      ink: filled > 8 ? 1 : 0,
    };
  }

  private rect(x: number, y: number, w: number, h: number, color: [number, number, number, number]): void {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(this.width, Math.ceil(x + w));
    const y1 = Math.min(this.height, Math.ceil(y + h));
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) this.put(xx, yy, color);
    }
  }

  private fillPolygon(points: Array<{ x: number; y: number }>, color: [number, number, number, number]): void {
    if (points.length < 3) return;
    const ys = points.map((p) => p.y);
    const y0 = Math.max(0, Math.floor(Math.min(...ys)));
    const y1 = Math.min(this.height, Math.ceil(Math.max(...ys)));
    for (let y = y0; y < y1; y++) {
      const xs: number[] = [];
      for (let i = 0; i < points.length; i++) {
        const a = points[i]!;
        const b = points[(i + 1) % points.length]!;
        if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
          const t = (y - a.y) / (b.y - a.y || 1);
          xs.push(a.x + t * (b.x - a.x));
        }
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const x0 = Math.max(0, Math.floor(xs[i]!));
        const x1 = Math.min(this.width, Math.ceil(xs[i + 1]!));
        for (let x = x0; x < x1; x++) this.put(x, y, color);
      }
    }
  }

  private line(x0: number, y0: number, x1: number, y1: number, color: [number, number, number, number]): void {
    let x = Math.round(x0);
    let y = Math.round(y0);
    const xEnd = Math.round(x1);
    const yEnd = Math.round(y1);
    const dx = Math.abs(xEnd - x);
    const dy = Math.abs(yEnd - y);
    const sx = x < xEnd ? 1 : -1;
    const sy = y < yEnd ? 1 : -1;
    let err = dx - dy;
    while (true) {
      this.put(x, y, color);
      if (x === xEnd && y === yEnd) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  private put(x: number, y: number, color: [number, number, number, number]): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const i = (y * this.width + x) * 4;
    const a = (color[3] / 255) * this.globalAlpha;
    this.pixels[i] = Math.round(this.pixels[i]! * (1 - a) + color[0] * a);
    this.pixels[i + 1] = Math.round(this.pixels[i + 1]! * (1 - a) + color[1] * a);
    this.pixels[i + 2] = Math.round(this.pixels[i + 2]! * (1 - a) + color[2] * a);
    this.pixels[i + 3] = 255;
  }

  private rgba(style: string): [number, number, number, number] {
    const named = NAMES[style.toLowerCase().replace(/\s+/g, "")];
    if (named) return [...named, 255];
    const hex = style.trim();
    if (hex.startsWith("#")) {
      const h = hex.slice(1);
      if (h.length === 3) {
        return [parseInt(h[0]! + h[0], 16), parseInt(h[1]! + h[1], 16), parseInt(h[2]! + h[2], 16), 255];
      }
      if (h.length === 6) {
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 255];
      }
    }
    const rgb = style.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (rgb) {
      return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), rgb[4] ? Number(rgb[4]) * 255 : 255];
    }
    return [0, 0, 0, 255];
  }
}
