import React, { useState } from 'react';
import { ExternalLink, Play, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface MediaSectionProps {
  posterImages: string[];
  trailerLinks: string[];
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // youtube.com/watch?v=ID
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
    // youtu.be/ID
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

function PosterGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  if (images.length === 0) return null;

  const validImages = images.filter((_, i) => !imgError[i]);
  if (validImages.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-gold flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5" />
        Posters
      </h4>
      <div className="relative">
        {images.length === 1 ? (
          <div className="rounded-lg overflow-hidden bg-theatre-dark border border-gold-dim max-w-xs mx-auto">
            <img
              src={images[0]}
              alt="Movie poster"
              className="w-full object-cover"
              onError={() => setImgError((prev) => ({ ...prev, 0: true }))}
            />
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {images.map((url, i) => (
              !imgError[i] && (
                <div
                  key={i}
                  className={`flex-shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    current === i ? 'border-gold shadow-gold' : 'border-gold-dim'
                  }`}
                  style={{ width: '140px' }}
                  onClick={() => setCurrent(i)}
                >
                  <img
                    src={url}
                    alt={`Poster ${i + 1}`}
                    className="w-full h-48 object-cover"
                    onError={() => setImgError((prev) => ({ ...prev, [i]: true }))}
                  />
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TrailerEmbed({ url, index }: { url: string; index: number }) {
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
          />
        </div>
      </div>
    );
  }

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
}

export default function MediaSection({ posterImages, trailerLinks }: MediaSectionProps) {
  const hasPosters = posterImages && posterImages.length > 0;
  const hasTrailers = trailerLinks && trailerLinks.length > 0;

  if (!hasPosters && !hasTrailers) return null;

  return (
    <div className="theatre-card rounded-xl p-5 space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 gold-gradient rounded-full" />
        <h3 className="font-display text-base font-semibold text-gold">Media</h3>
      </div>

      {hasPosters && <PosterGallery images={posterImages} />}

      {hasTrailers && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-gold flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5" />
            Trailers
          </h4>
          <div className="space-y-3">
            {trailerLinks.map((url, i) => (
              <TrailerEmbed key={i} url={url} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
