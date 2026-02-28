import React, { useState, useMemo, memo } from 'react';
import { ExternalLink, Play, Image as ImageIcon, AlertCircle } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

interface MediaSectionProps {
  posterImages: string[];
  trailerLinks: string[];
}

function isDataUrl(url: string): boolean {
  return typeof url === 'string' && url.startsWith('data:');
}

function isBlobUrl(url: string): boolean {
  return typeof url === 'string' && url.startsWith('blob:');
}

function isLocalVideoUrl(url: string): boolean {
  if (!url) return false;
  if (isDataUrl(url)) return url.startsWith('data:video/');
  if (isBlobUrl(url)) return true;
  return false;
}

function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (isDataUrl(url) || isBlobUrl(url)) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/', '');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

function getVimeoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.replace('/', '');
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

function getEmbedUrl(url: string): string | null {
  return getYouTubeEmbedUrl(url) ?? getVimeoEmbedUrl(url);
}

const PosterPlaceholder = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-theatre-dark text-muted-foreground gap-2">
    <ImageIcon className="w-10 h-10 opacity-30" />
    <span className="text-xs opacity-50">Image unavailable</span>
  </div>
);

const PosterGallery = memo(function PosterGallery({ images }: { images: string[] }) {
  const [imgError, setImgError] = useState<Record<number, boolean>>({});
  const [current, setCurrent] = useState(0);

  const validImages = useMemo(
    () => images.filter((url) => url && typeof url === 'string' && url.trim() !== ''),
    [images]
  );

  if (validImages.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-gold flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5" />
        Posters
      </h4>
      <div className="relative">
        {validImages.length === 1 ? (
          <div className="rounded-lg overflow-hidden bg-theatre-dark border border-gold-dim max-w-xs mx-auto" style={{ minHeight: '120px' }}>
            {imgError[0] ? (
              <PosterPlaceholder />
            ) : (
              <img
                src={validImages[0]}
                alt="Movie poster"
                className="w-full object-cover"
                loading="lazy"
                onError={() => setImgError((prev) => ({ ...prev, 0: true }))}
              />
            )}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {validImages.map((url, i) => (
              <div
                key={i}
                className={`flex-shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                  current === i ? 'border-gold shadow-gold' : 'border-gold-dim'
                }`}
                style={{ width: '140px', minHeight: '192px' }}
                onClick={() => setCurrent(i)}
              >
                {imgError[i] ? (
                  <div className="w-full h-48 flex items-center justify-center bg-theatre-dark">
                    <ImageIcon className="w-8 h-8 text-muted-foreground opacity-30" />
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`Poster ${i + 1}`}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    onError={() => setImgError((prev) => ({ ...prev, [i]: true }))}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

const TrailerEmbed = memo(function TrailerEmbed({ url, index }: { url: string; index: number }) {
  const [videoError, setVideoError] = useState(false);

  if (!isValidUrl(url)) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border border-gold-dim/40 bg-theatre-dark text-muted-foreground text-sm">
        <AlertCircle className="w-4 h-4 flex-shrink-0 text-destructive/60" />
        <span>Trailer {index + 1}: Invalid URL</span>
      </div>
    );
  }

  // Local device video (data URL or blob URL) — render inline HTML video
  if (isLocalVideoUrl(url)) {
    if (videoError) {
      return (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-gold-dim/40 bg-theatre-dark text-muted-foreground text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-destructive/60" />
          <span>Trailer {index + 1}: Could not load video</span>
        </div>
      );
    }
    return (
      <div className="rounded-lg overflow-hidden border border-gold-dim bg-theatre-dark">
        <video
          src={url}
          controls
          className="w-full max-h-72 object-contain bg-black"
          title={`Trailer ${index + 1}`}
          onError={() => setVideoError(true)}
        />
      </div>
    );
  }

  // YouTube / Vimeo embed
  const embedUrl = getEmbedUrl(url);
  if (embedUrl) {
    return (
      <div className="rounded-lg overflow-hidden border border-gold-dim bg-theatre-dark">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            title={`Trailer ${index + 1}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Fallback: external link button
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 rounded-lg border border-gold-dim bg-theatre-dark hover:border-gold hover:bg-theatre-gold/5 transition-all group"
    >
      <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
        <Play className="w-4 h-4 text-theatre-dark ml-0.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors">
          Watch Trailer {index + 1}
        </p>
        <p className="text-xs text-muted-foreground truncate">{url}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors flex-shrink-0" />
    </a>
  );
});

function MediaSectionInner({ posterImages, trailerLinks }: MediaSectionProps) {
  const safePosters = useMemo(
    () => (Array.isArray(posterImages) ? posterImages.filter((u) => u && typeof u === 'string') : []),
    [posterImages]
  );
  const safeTrailers = useMemo(
    () => (Array.isArray(trailerLinks) ? trailerLinks.filter((u) => u && typeof u === 'string') : []),
    [trailerLinks]
  );

  const hasPosters = safePosters.length > 0;
  const hasTrailers = safeTrailers.length > 0;

  if (!hasPosters && !hasTrailers) return null;

  return (
    <div className="theatre-card rounded-xl p-5 space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 gold-gradient rounded-full" />
        <h3 className="font-display text-base font-semibold text-gold">Media</h3>
      </div>

      {hasPosters && (
        <ErrorBoundary
          fallback={
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg border border-gold-dim/40 bg-theatre-dark">
              <AlertCircle className="w-4 h-4 text-destructive/60 flex-shrink-0" />
              Poster gallery could not be displayed.
            </div>
          }
        >
          <PosterGallery images={safePosters} />
        </ErrorBoundary>
      )}

      {hasTrailers && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-gold flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5" />
            Trailers
          </h4>
          <div className="space-y-3">
            {safeTrailers.map((url, i) => (
              <ErrorBoundary
                key={i}
                fallback={
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg border border-gold-dim/40 bg-theatre-dark">
                    <AlertCircle className="w-4 h-4 text-destructive/60 flex-shrink-0" />
                    Trailer {i + 1} could not be displayed.
                  </div>
                }
              >
                <TrailerEmbed url={url} index={i} />
              </ErrorBoundary>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const MediaSection = memo(MediaSectionInner);
export default MediaSection;
