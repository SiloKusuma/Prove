import React, { useEffect, useRef } from 'react';

interface InteractiveGlobeProps {
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  alpha: number;
  isLand: boolean;
  isMarker?: boolean;
  markerPhase?: number;
}

function isCoordinateOnLand(lat: number, lon: number): boolean {
  lon = ((lon + 180) % 360) - 180;

  // North America
  if (lat >= 15 && lat <= 70 && lon >= -165 && lon <= -50) {
    if (lat <= 30 && lon <= -105) return true;
    if (lat >= 25 && lon >= -125 && lon <= -70) return true;
    if (lat >= 55 && lon >= -165 && lon <= -60) return true;
  }

  // South America
  if (lat >= -55 && lat <= 12 && lon >= -82 && lon <= -34) {
    if (lat >= -20 && lon >= -75 && lon <= -40) return true;
    if (lat < -20 && lon >= -72 && lon <= -50) return true;
    if (lat > -5 && lon >= -80 && lon <= -35) return true;
  }

  // Europe
  if (lat >= 36 && lat <= 70 && lon >= -10 && lon <= 45) {
    return true;
  }

  // Africa
  if (lat >= -35 && lat <= 37 && lon >= -18 && lon <= 52) {
    if (lat >= 15 && lon >= -15 && lon <= 40) return true;
    if (lat < 15 && lon >= 8 && lon <= 45) return true;
    if (lat < 0 && lon >= 12 && lon <= 35) return true;
  }

  // Asia
  if (lat >= 5 && lat <= 75 && lon >= 45 && lon <= 150) {
    if (lat <= 35 && lon >= 68 && lon <= 90) return true;
    if (lat >= 20 && lat <= 50 && lon >= 90 && lon <= 130) return true;
    if (lat >= 50 && lon >= 50 && lon <= 150) return true;
    if (lat >= 10 && lat <= 25 && lon >= 95 && lon <= 110) return true;
    if (lat >= -10 && lat <= 6 && lon >= 95 && lon <= 140) return true;
    if (lat >= 30 && lat <= 45 && lon >= 125 && lon <= 145) return true;
  }

  // Australia & Oceania
  if (lat >= -40 && lat <= -12 && lon >= 112 && lon <= 154) {
    return true;
  }
  if (lat >= -47 && lat <= -34 && lon >= 165 && lon <= 178) {
    return true;
  }

  return false;
}

export const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.0018 });
  const rotationAnglesRef = useRef({ x: 0.25, y: 0.8 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let radius = 180;
    let centerX = 200;
    let centerY = 200;
    let dpr = 1;

    // Generate Points on a Fibonacci Sphere
    const totalPoints = 1350;
    const points: Point3D[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < totalPoints; i++) {
      const y = 1 - (i / (totalPoints - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const lat = Math.asin(y) * (180 / Math.PI);
      const lon = Math.atan2(z, x) * (180 / Math.PI);

      const isLand = isCoordinateOnLand(lat, lon);
      const isMarker = isLand && (i % 64 === 0);

      points.push({
        x,
        y,
        z,
        baseRadius: isLand ? (isMarker ? 2.4 : 1.35) : 0.8,
        alpha: isLand ? (isMarker ? 1.0 : 0.85) : 0.22,
        isLand,
        isMarker,
        markerPhase: Math.random() * Math.PI * 2,
      });
    }

    const updateCanvasSize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const side = Math.min(rect.width, window.innerWidth - 32, 460);
      const displaySize = Math.max(260, Math.floor(side));

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Force strict square aspect ratio so it NEVER stretches or flattens
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
      canvas.style.width = `${displaySize}px`;
      canvas.style.height = `${displaySize}px`;

      centerX = (canvas.width) / 2;
      centerY = (canvas.height) / 2;
      radius = (displaySize * 0.42) * dpr;
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isDraggingRef.current) {
        rotationAnglesRef.current.y += rotationVelocityRef.current.y;
        rotationAnglesRef.current.x += rotationVelocityRef.current.x;
        rotationVelocityRef.current.x *= 0.95;
        rotationVelocityRef.current.y = rotationVelocityRef.current.y * 0.95 + 0.0016 * 0.05;
      }

      const rotX = rotationAnglesRef.current.x;
      const rotY = rotationAnglesRef.current.y;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Subtle outer circle silhouette (1px crisp border)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#1F1F1F';
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();

      const projected = points.map((p) => {
        // Points are unit sphere coords (-1 to +1) scaled by current radius
        const pxScaled = p.x * radius;
        const pyScaled = p.y * radius;
        const pzScaled = p.z * radius;

        const x1 = pxScaled * cosY - pzScaled * sinY;
        const z1 = pxScaled * sinY + pzScaled * cosY;

        const y2 = pyScaled * cosX - z1 * sinX;
        const z2 = pyScaled * sinX + z1 * cosX;

        return {
          px: centerX + x1,
          py: centerY + y2,
          depth: z2,
          rawZ: z2 / radius,
          point: p,
        };
      });

      projected.sort((a, b) => a.depth - b.depth);

      for (let i = 0; i < projected.length; i++) {
        const item = projected[i];
        const { px, py, rawZ, point } = item;

        const depthNorm = (rawZ + 1) / 2;
        if (depthNorm <= 0.06) continue;

        const pointAlpha = point.alpha * (0.12 + 0.88 * Math.pow(depthNorm, 1.8));
        const pointSize = point.baseRadius * dpr * (0.65 + 0.55 * depthNorm);

        if (point.isMarker) {
          point.markerPhase = (point.markerPhase || 0) + 0.035;
          const pingScale = 1 + (Math.sin(point.markerPhase) + 1) * 1.3;
          const pingAlpha = Math.max(0, (1 - (pingScale - 1) / 2.6) * depthNorm);

          if (rawZ > 0) {
            ctx.beginPath();
            ctx.arc(px, py, pointSize * pingScale * 2.2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${pingAlpha * 0.6})`;
            ctx.lineWidth = 1 * dpr;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(px, py, pointSize * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, pointAlpha * 1.4)})`;
          ctx.fill();
        } else if (point.isLand) {
          ctx.beginPath();
          ctx.arc(px, py, pointSize, 0, Math.PI * 2);
          const brightness = Math.floor(215 + 40 * depthNorm);
          ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${pointAlpha})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, pointSize * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(160, 160, 160, ${pointAlpha * 0.32})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;

      rotationVelocityRef.current = {
        x: -dy * 0.003,
        y: dx * 0.003,
      };

      rotationAnglesRef.current.y += dx * 0.004;
      rotationAnglesRef.current.x -= dy * 0.004;
      rotationAnglesRef.current.x = Math.max(-1.1, Math.min(1.1, rotationAnglesRef.current.x));

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastMousePosRef.current.x;
      const dy = e.touches[0].clientY - lastMousePosRef.current.y;

      rotationAnglesRef.current.y += dx * 0.004;
      rotationAnglesRef.current.x -= dy * 0.004;
      rotationAnglesRef.current.x = Math.max(-1.1, Math.min(1.1, rotationAnglesRef.current.x));

      rotationVelocityRef.current = {
        x: -dy * 0.002,
        y: dx * 0.002,
      };

      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-square flex items-center justify-center select-none overflow-hidden touch-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing block"
      />
    </div>
  );
};
