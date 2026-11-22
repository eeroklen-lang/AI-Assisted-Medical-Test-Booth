import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * The booth UI is designed for a large kiosk screen (huge type, fixed spacing,
 * `h-screen overflow-hidden` pages); the pages need roughly a 1920×1200 canvas.
 * On smaller screens such as a laptop browser window, content would overflow
 * and get clipped.
 *
 * This wrapper lays the app out on a virtual canvas that is at least
 * DESIGN_WIDTH × DESIGN_HEIGHT and scales it down to fit the window, so every
 * page looks the same as on the kiosk, just smaller. The canvas always fills
 * the whole window (no letterboxing): the spare space goes to the axis where
 * the window is relatively larger.
 *
 * Pages keep using `h-screen` / `min-h-screen`; those utilities are remapped to
 * the canvas height via `--kiosk-height` in styles/index.css.
 */
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1200;

function readWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

export function KioskViewport({ children }: { children: ReactNode }) {
  const [size, setSize] = useState(readWindowSize);

  useEffect(() => {
    const onResize = () => setSize(readWindowSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Only scale down: on screens at least as large as the design, render 1:1.
  const scale = Math.min(1, size.width / DESIGN_WIDTH, size.height / DESIGN_HEIGHT);
  const canvasWidth = size.width / scale;
  const canvasHeight = size.height / scale;

  const style = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: canvasWidth,
    height: canvasHeight,
    transform: `scale(${scale})`,
    transformOrigin: '0 0',
    overflowX: 'hidden',
    overflowY: 'auto',
    '--kiosk-height': `${canvasHeight}px`,
  } as CSSProperties;

  return <div style={style}>{children}</div>;
}
