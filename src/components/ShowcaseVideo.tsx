import React from 'react';
import { Play } from 'lucide-react';
import { productImagePath } from '../lib/productImage';
import { HERO_PRODUCT_SLUG } from '../lib/homeContent';
import { SHOWCASE_VIDEO } from '../lib/showcaseVideo';

/**
 * The product showcase reel, played on demand.
 *
 * The file is a 1080x1920 social reel: 33 seconds, with audio, and 19MB — roughly twice the
 * homepage's entire budget after the image work. Nothing about it is decorative enough to
 * justify spending that on every visitor, and most never press play, so there is no <video>
 * element on the page at all until someone asks for one. Before that it is a poster image and
 * a button; after it, a real player with controls.
 *
 * Deliberately not autoplaying and not muted-looping in the background: it has a voice/music
 * track and a watermark, which is right for a feed and wrong for a page a buyer is reading.
 */
export const ShowcaseVideo: React.FC = () => {
  const [playing, setPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Autofocus and play once the element exists, so the button press and the playback are one
  // action rather than two.
  React.useEffect(() => {
    if (playing) videoRef.current?.play().catch(() => {});
  }, [playing]);

  return (
    <div className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-3xl border border-white/15 bg-slate-950 shadow-xl">
      {/* 9:16, reserved up front so the section does not jump when the player appears. */}
      <div className="relative aspect-[9/16]">
        {playing ? (
          <video
            ref={videoRef}
            src={SHOWCASE_VIDEO.src}
            poster={productImagePath(HERO_PRODUCT_SLUG)}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          >
            Your browser cannot play this video.
          </video>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${SHOWCASE_VIDEO.name}`}
            className="group absolute inset-0 h-full w-full"
          >
            <img
              src={productImagePath(HERO_PRODUCT_SLUG)}
              alt={SHOWCASE_VIDEO.thumbnailAlt}
              width={900}
              height={900}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover opacity-80 transition group-hover:opacity-95"
            />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-brand shadow-lg transition group-hover:scale-105">
                <Play size={26} className="ml-1" fill="currentColor" />
              </span>
              <span className="px-4 text-center text-sm font-semibold text-white">
                Watch the {SHOWCASE_VIDEO.durationLabel} showcase
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
