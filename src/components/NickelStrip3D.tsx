import React from 'react';

/**
 * A rotating H type nickel strip, rendered in 3D on a canvas.
 *
 * The geometry is the real thing rather than an abstract shape: two outer rails joined by
 * cross members, leaving the repeating rectangular windows that give H type strip its name and
 * its purpose — the narrow neck between cell contacts concentrates heat at the spot weld. A
 * visitor who builds battery packs recognises it immediately, which a gradient blob does not
 * achieve.
 *
 * Hand-rolled rather than Three.js. The shape is ~90 flat quads, which a painter's-algorithm
 * renderer draws comfortably at 60fps; pulling in a WebGL engine would add roughly 150KB
 * gzipped to a page that was deliberately cut from 15.2MB to ~3.3MB for Core Web Vitals.
 *
 * Cheap where it matters: the render loop stops entirely when the canvas scrolls out of view,
 * and under prefers-reduced-motion it draws one static frame at a three-quarter angle and never
 * starts a loop at all.
 */

type Vec3 = [number, number, number];

/** One flat quad: four corner indices into the vertex list, plus its outward normal. */
type Face = { indices: [number, number, number, number]; normal: Vec3 };

type Mesh = { vertices: Vec3[]; faces: Face[] };

/** An axis-aligned box, appended to the mesh as six quads. */
const addBox = (mesh: Mesh, min: Vec3, max: Vec3) => {
  const base = mesh.vertices.length;
  const [x0, y0, z0] = min;
  const [x1, y1, z1] = max;

  mesh.vertices.push(
    [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], // back face, z0
    [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]  // front face, z1
  );

  const q = (a: number, b: number, c: number, d: number, normal: Vec3): Face => ({
    indices: [base + a, base + b, base + c, base + d],
    normal,
  });

  mesh.faces.push(
    q(4, 5, 6, 7, [0, 0, 1]),   // front
    q(1, 0, 3, 2, [0, 0, -1]),  // back
    q(3, 2, 6, 7, [0, 1, 0]),   // top
    q(0, 1, 5, 4, [0, -1, 0]),  // bottom
    q(1, 2, 6, 5, [1, 0, 0]),   // right
    q(0, 4, 7, 3, [-1, 0, 0])   // left
  );
};

/**
 * The strip: two rails running its length, joined by evenly spaced rungs. Proportions are
 * exaggerated in thickness — a real 0.15mm strip 8mm wide would be invisibly thin on screen —
 * but the pattern and its proportions are the product's own.
 */
/** Shared with the projection below, which sizes the strip to the canvas from these. */
const HALF_LENGTH = 3.4;
const HALF_HEIGHT = 0.72;

const buildStrip = (): Mesh => {
  const mesh: Mesh = { vertices: [], faces: [] };

  const halfLength = HALF_LENGTH;
  const halfHeight = HALF_HEIGHT;
  const halfThickness = 0.075;
  const railHeight = 0.2;
  const rungHalfWidth = 0.16;
  const rungCount = 7;

  // Rails.
  addBox(mesh, [-halfLength, halfHeight - railHeight, -halfThickness], [halfLength, halfHeight, halfThickness]);
  addBox(mesh, [-halfLength, -halfHeight, -halfThickness], [halfLength, -halfHeight + railHeight, halfThickness]);

  // Rungs, including one at each end so the strip reads as closed rather than cut off.
  const span = halfLength * 2;
  for (let i = 0; i < rungCount; i++) {
    const cx = -halfLength + (span * i) / (rungCount - 1);
    const x0 = Math.max(-halfLength, cx - rungHalfWidth);
    const x1 = Math.min(halfLength, cx + rungHalfWidth);
    addBox(mesh, [x0, -halfHeight + railHeight, -halfThickness], [x1, halfHeight - railHeight, halfThickness]);
  }

  return mesh;
};

const LIGHT: Vec3 = (() => {
  const v: Vec3 = [-0.45, 0.72, 0.53];
  const len = Math.hypot(...v);
  return [v[0] / len, v[1] / len, v[2] / len];
})();

/**
 * Nickel: cool grey, running from a deep blue-shadow to a bright but never pure-white highlight.
 *
 * The curve is deliberately steep (`^1.5`). A gentler ramp lit almost every face to the same
 * near-white and the strip read as painted plastic — metal needs most surfaces sitting mid-tone
 * with the light concentrated on the few faces actually facing the source. The highlight also
 * stops short of 255 and keeps a blue bias, because a neutral white highlight looks like paper.
 */
const shade = (intensity: number) => {
  const t = Math.min(1, Math.max(0, intensity));
  const eased = Math.pow(t, 1.5);
  const r = Math.round(38 + eased * 197);
  const g = Math.round(55 + eased * 187);
  const b = Math.round(68 + eased * 178);
  return `rgb(${r},${g},${b})`;
};

export const NickelStrip3D: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mesh = buildStrip();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let angle = reduceMotion ? -0.55 : 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Capped at 2: beyond that the canvas grows faster than the visible gain.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);

      // A gentle fixed tilt so the extruded thickness stays visible through the whole turn, and
      // a roll so the strip runs diagonally. The strip is 4.7:1 while the canvas is nearer 1.5:1
      // — laid out flat it left most of the frame empty, and the diagonal both fills the box and
      // gives the piece some motion even at the instant it is standing still.
      const tiltX = -0.34;
      const roll = -0.24;
      const cosY = Math.cos(angle);
      const sinY = Math.sin(angle);
      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);
      const cosR = Math.cos(roll);
      const sinR = Math.sin(roll);

      const rotate = ([x, y, z]: Vec3): Vec3 => {
        const rx = x * cosY + z * sinY;
        const rz = -x * sinY + z * cosY;
        const ry = y * cosX - rz * sinX;
        const rz2 = y * sinX + rz * cosX;
        return [rx * cosR - ry * sinR, rx * sinR + ry * cosR, rz2];
      };

      const cameraZ = 9;
      // Fit the strip to the canvas from its own dimensions rather than a tuned constant. It
      // turns on Y, so at some point in every rotation the far end swings to z = +HALF_LENGTH
      // and perspective magnifies it by this much; sizing for that worst case is what keeps the
      // strip inside the frame for the whole turn instead of only at the angle it was tuned at.
      const nearestZ = cameraZ / (cameraZ - HALF_LENGTH);
      // Extents after the roll, so the diagonal is fitted rather than the flat strip.
      const spanX = HALF_LENGTH * Math.abs(cosR) + HALF_HEIGHT * Math.abs(sinR);
      const spanY = HALF_LENGTH * Math.abs(sinR) + HALF_HEIGHT * Math.abs(cosR);
      const scale = Math.min(
        width / (2 * spanX * nearestZ * 1.04),
        height / (2 * spanY * nearestZ * 1.15)
      );
      const project = ([x, y, z]: Vec3): [number, number] => {
        const p = cameraZ / (cameraZ - z);
        return [width / 2 + x * scale * p, height / 2 - y * scale * p];
      };

      const rotated = mesh.vertices.map(rotate);

      type Drawable = { depth: number; points: [number, number][]; intensity: number };
      const drawables: Drawable[] = [];

      for (const face of mesh.faces) {
        const n = rotate(face.normal);
        // Backface culling: the camera looks down -z, so a face pointing away is never drawn.
        if (n[2] <= 0.001) continue;

        const verts = face.indices.map((i) => rotated[i]);
        const depth = (verts[0][2] + verts[1][2] + verts[2][2] + verts[3][2]) / 4;

        const lambert = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
        // A tight specular term on top of the diffuse, which is what makes it read as metal
        // rather than plastic.
        const specular = Math.pow(Math.max(0, n[2]), 14) * 0.5;
        drawables.push({
          depth,
          points: verts.map(project),
          intensity: 0.1 + lambert * 0.78 + specular,
        });
      }

      // Painter's algorithm: farthest first.
      drawables.sort((a, b) => a.depth - b.depth);

      for (const d of drawables) {
        ctx.beginPath();
        ctx.moveTo(d.points[0][0], d.points[0][1]);
        for (let i = 1; i < d.points.length; i++) ctx.lineTo(d.points[i][0], d.points[i][1]);
        ctx.closePath();

        // A gradient across each face rather than one flat colour. Flat fills gave every
        // surface a single tone and the strip read as moulded plastic; sweeping the value
        // across the quad is what puts a sheen on it, which is most of what makes brushed
        // metal look like metal. The axis runs corner to corner, so it shifts as the piece
        // turns instead of sitting still on the face.
        const [p0, , p2] = d.points;
        const gradient = ctx.createLinearGradient(p0[0], p0[1], p2[0], p2[1]);
        gradient.addColorStop(0, shade(d.intensity * 0.78));
        gradient.addColorStop(0.55, shade(d.intensity));
        gradient.addColorStop(1, shade(d.intensity * 1.22));

        ctx.fillStyle = gradient;
        ctx.fill();
        // A hairline closes the seams antialiasing leaves between adjacent quads.
        ctx.strokeStyle = shade(d.intensity);
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    };

    const tick = () => {
      angle += 0.0055;
      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };

    resize();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(canvas);

    // Off-screen means no work at all, rather than a loop nobody can see.
    const visibility = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    visibility.observe(canvas);

    return () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
    };
  }, []);

  // Decorative: the strip, its pattern and its specification are all stated in the surrounding
  // copy, so announcing the canvas as well would only repeat them to a screen reader.
  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};
