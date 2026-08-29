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
  /**
   * Drops the back face to the year count alone, for header-sized badges. The full three-line
   * face needs roughly 100px of diameter before "Since 1974" is readable; below that the lines
   * are texture rather than text.
   */
  compact?: boolean;
  /**
   * Loads the monogram eagerly and at high priority. Set it where the badge is above the fold
   * on every route — in the navigation it is the site's logo, so lazy-loading it leaves the
   * header visibly empty on first paint.
   */
  priority?: boolean;
  className?: string;
};

export const HeritageBadge: React.FC<HeritageBadgeProps> = ({
  size = 128,
  compact = false,
  priority = false,
  className,
}) => {
  const years = new Date().getFullYear() - FOUNDED_YEAR;

  // The face typography is specified in `em`, so without a font-size of its own the badge
  // inherits whatever the surrounding block happens to use — it renders correctly at 112px in
  // the hero only because the ambient size is 16px there. Deriving it from `size` makes the
  // badge self-contained and lets it scale down to the 40px it occupies in the navigation.
  // The divisors are chosen so the hero badge keeps exactly its current 16px.
  const fontSize = compact ? size / 2.4 : size / 7;

  return (
    <div
      className={[
        'heritage-badge',
        compact ? 'heritage-badge--compact' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: size, height: size, fontSize }}
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
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
            className="h-1/2 w-1/2 object-contain"
          />
        </div>
        <div className="heritage-badge__face heritage-badge__face--back">
          <span className="heritage-badge__years">{years}</span>
          <span className="heritage-badge__label">{compact ? 'Yrs' : 'Years'}</span>
          {!compact && <span className="heritage-badge__since">Since {FOUNDED_YEAR}</span>}
        </div>
      </div>
    </div>
  );
};
