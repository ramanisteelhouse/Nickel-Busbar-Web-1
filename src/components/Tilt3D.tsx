import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface Tilt3DProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum tilt rotation in degrees. */
  maxTilt?: number;
  /** Vertical translateZ (px) applied to the whole layer on hover, giving a lift effect. */
  liftZ?: number;
}

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);
  return reduced;
};

/** Mouse-tracking 3D tilt wrapper. Disabled automatically for touch devices and prefers-reduced-motion. */
export const Tilt3D: React.FC<Tilt3DProps> = ({ children, className, maxTilt = 10, liftZ = 24 }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springConfig = { stiffness: 150, damping: 18, mass: 0.5 };
  const springX = useSpring(pointerX, springConfig);
  const springY = useSpring(pointerY, springConfig);

  const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt]);
  const translateZ = useSpring(0, springConfig);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === 'touch') return;
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  };

  const handlePointerLeave = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
    translateZ.set(0);
  };

  const handlePointerEnter = () => {
    if (reducedMotion) return;
    translateZ.set(liftZ);
  };

  return (
    <div style={{ perspective: 1200 }} className={className}>
      <motion.div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={
          reducedMotion
            ? undefined
            : { rotateX, rotateY, translateZ, transformStyle: 'preserve-3d' }
        }
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

/** Scroll-triggered fade/rise reveal for consistent Apple/Google-style section entrances. */
export const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);
