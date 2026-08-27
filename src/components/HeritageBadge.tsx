import React from 'react';

/**
 * The circular heritage badge: the Ramani monogram on the front, "SINCE 1974" and the current
 * year count on the back, flipping continuously.
 *
 * The year count is derived rather than typed in. "52 years" is only true through 2026, and a
 * hardcoded number on a page whose whole point is longevity is the kind of stale detail a
 * visitor notices.
 *
 * The flip is a CSS animation, not a JS timer: it runs on the compositor, costs no re-renders,
 * and switches off wholesale under prefers-reduced-motion (see .heritage-badge in index.css),
 * where it settles on the monogram face rather than freezing mid-rotation.
 */
export const FOUNDED_YEAR = 1974;

export type HeritageBadgeProps = {
  /** Diameter in pixels. */
  size?: number;
  className?: string;
};

export const HeritageBadge: React.FC<HeritageBadgeProps> = ({ size = 128, className }) => {
  const years = new Date().getFullYear() - FOUNDED_YEAR;

  return (
    <div
      className={`heritage-badge${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size }}
      // One accessible label for the whole badge: the two faces are the same statement shown
      // twice, so exposing both to a screen reader would read as duplication.
      role="img"
      aria-label={`Ramani Steel House — ${years} years, since ${FOUNDED_YEAR}`}
    >
      <div className="heritage-badge__inner">
        <div className="heritage-badge__face heritage-badge__face--front">
          <img
            src="/img/favicon-192.png"
            alt=""
            aria-hidden="true"
            width={192}
            height={192}
            loading="lazy"
            className="h-1/2 w-1/2 object-contain"
          />
        </div>
        <div className="heritage-badge__face heritage-badge__face--back">
          <span className="heritage-badge__years">{years}</span>
          <span className="heritage-badge__label">Years</span>
          <span className="heritage-badge__since">Since {FOUNDED_YEAR}</span>
        </div>
      </div>
    </div>
  );
};
