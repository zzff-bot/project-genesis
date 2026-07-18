import { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 背景网格动画 — 排除聊天页面（保持聊天沉浸感）
 *
 * 使用 Canvas 绘制光标追踪网格：
 * 鼠标移动时周围格点亮起柔光，点击产生波纹扩散。
 * 通过 document 级别事件追踪鼠标坐标，确保不影响内容交互。
 */

/* ── 衰减曲线 ── */
const FALLOFF: Record<string, (t: number) => number> = {
  linear: (t) => t,
  smooth: (t) => t * t * (3 - 2 * t),
  sharp:  (t) => t * t * t,
};

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(v, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

/* ── 配置 ── */
const CONFIG = {
  cellSize: 64,
  radius: 150,
  falloff: 'smooth' as const,
  holdTime: 300,
  fadeDuration: 1000,
  lineWidth: 0.8,
  maxOpacity: 0.35,
  gridOpacity: 0.02,
  cellRadius: 6,
  pulseSpeed: 450,
};

export function BackgroundGrid() {
  const { pathname } = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#5b5fe3');

  // 聊天页面不显示
  if (pathname.startsWith('/chat/')) return null;

  // 读取 CSS 变量中的品牌色
  useEffect(() => {
    const updateColor = () => {
      const style = getComputedStyle(document.documentElement);
      const primary = style.getPropertyValue('--color-primary').trim();
      if (primary) setColor(primary);
    };
    updateColor();
    // 监听主题切换
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let cols = 0, rows = 0, offX = 0, offY = 0;
    let alphas = new Float32Array(0);
    let touched = new Float64Array(0);
    let w = 0, h = 0;
    const pulses: Array<{ x: number; y: number; t0: number }> = [];
    let raf = 0, running = false, lastFrame = 0;
    let mouseX = -1000, mouseY = -1000;
    let mouseOnScreen = false;
    const config = { ...CONFIG };

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width  = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / config.cellSize) + 1;
      rows = Math.ceil(h / config.cellSize) + 1;
      offX = (w - cols * config.cellSize) / 2;
      offY = (h - rows * config.cellSize) / 2;
      alphas  = new Float32Array(cols * rows);
      touched = new Float64Array(cols * rows);
    };

    const cellCenter = (i: number): [number, number] => [
      offX + (i % cols) * config.cellSize + config.cellSize / 2,
      offY + Math.floor(i / cols) * config.cellSize + config.cellSize / 2,
    ];

    const energize = (x: number, y: number, boost?: number) => {
      const r = Math.max(config.radius, 1);
      const ease = FALLOFF[config.falloff] ?? FALLOFF.linear;
      const now = performance.now();
      const minCol = Math.max(0, Math.floor((x - r - offX) / config.cellSize));
      const maxCol = Math.min(cols - 1, Math.floor((x + r - offX) / config.cellSize));
      const minRow = Math.max(0, Math.floor((y - r - offY) / config.cellSize));
      const maxRow = Math.min(rows - 1, Math.floor((y + r - offY) / config.cellSize));
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const i = r * cols + c;
          const [cx, cy] = cellCenter(i);
          const dist = Math.hypot(cx - x, cy - y);
          if (dist > config.radius) continue;
          const level = ease(1 - dist / config.radius) * config.maxOpacity * (boost ?? 1);
          if (level > alphas[i]) { alphas[i] = level; touched[i] = now; }
          else if (level > 0) { touched[i] = now; }
        }
      }
    };

    const draw = (now: number) => {
      const dt = Math.min(now - lastFrame, 50);
      lastFrame = now;
      ctx.clearRect(0, 0, w, h);
      const [cr, cg, cb] = hexToRgb(color);

      // 极淡静态网格背景
      if (config.gridOpacity > 0) {
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${config.gridOpacity})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          const x = Math.round(offX + c * config.cellSize) + 0.5;
          ctx.moveTo(x, 0); ctx.lineTo(x, h);
        }
        for (let r = 0; r <= rows; r++) {
          const y = Math.round(offY + r * config.cellSize) + 0.5;
          ctx.moveTo(0, y); ctx.lineTo(w, y);
        }
        ctx.stroke();
      }

      // 鼠标位置高亮
      if (mouseOnScreen) energize(mouseX, mouseY);

      // 点击脉冲波纹
      for (let pi = pulses.length - 1; pi >= 0; pi--) {
        const pulse = pulses[pi];
        const ringR = (now - pulse.t0) / 1000 * config.pulseSpeed;
        if (ringR > Math.hypot(w, h)) { pulses.splice(pi, 1); continue; }
        const band = config.cellSize;
        const minCol = Math.max(0, Math.floor((pulse.x - ringR - band - offX) / config.cellSize));
        const maxCol = Math.min(cols - 1, Math.floor((pulse.x + ringR + band - offX) / config.cellSize));
        const minRow = Math.max(0, Math.floor((pulse.y - ringR - band - offY) / config.cellSize));
        const maxRow = Math.min(rows - 1, Math.floor((pulse.y + ringR + band - offY) / config.cellSize));
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            const i = r * cols + c;
            const [cx, cy] = cellCenter(i);
            const dist = Math.hypot(cx - pulse.x, cy - pulse.y);
            if (Math.abs(dist - ringR) < band / 2 && config.maxOpacity > alphas[i]) {
              alphas[i] = config.maxOpacity; touched[i] = now;
            }
          }
        }
      }

      // 绘制
      let anyVisible = pulses.length > 0 || mouseOnScreen;
      const fadeStep = dt / Math.max(config.fadeDuration, 16);
      const half = config.cellSize / 2;

      for (let i = 0; i < alphas.length; i++) {
        let a = alphas[i];
        if (a <= 0) continue;
        if (now - touched[i] > config.holdTime) {
          a = Math.max(0, a - fadeStep);
          alphas[i] = a;
          if (a <= 0) continue;
        }
        anyVisible = true;

        const [cx, cy] = cellCenter(i);
        const grad = ctx.createRadialGradient(cx, cy, half * 0.12, cx, cy, config.cellSize * 1.05);
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

        const x = cx - half + 0.5;
        const y = cy - half + 0.5;
        const s = config.cellSize - 1;

        ctx.beginPath();
        ctx.roundRect(x, y, s, s, config.cellRadius);
        ctx.strokeStyle = grad;
        ctx.lineWidth = config.lineWidth;
        ctx.stroke();
      }

      if (anyVisible) raf = requestAnimationFrame(draw);
      else running = false;
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(draw);
    };

    // ═══ Document 级别全局事件（不阻挡内容交互） ═══
    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseOnScreen = true;
      wake();
    };

    const onPointerLeave = () => { mouseOnScreen = false; };

    const onPointerDown = (e: PointerEvent) => {
      pulses.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
      wake();
    };

    resize();
    wake();

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', resize);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  );
}
