import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import Hls from "hls.js";

interface VideoPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer = ({ url, title, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    const isHls = url.includes(".m3u8") || url.includes(".m3u");

    if (isHls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return () => hls.destroy();
    } else if (isHls && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play().catch(() => {});
    } else {
      video.src = url;
      video.play().catch(() => {});
    }
  }, [url]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setPlaying(true); }
    else { video.pause(); setPlaying(false); }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          ref={containerRef}
          className="relative w-full max-w-5xl aspect-video"
          onClick={(e) => e.stopPropagation()}
          onMouseMove={handleMouseMove}
        >
          <video
            ref={videoRef}
            className="w-full h-full bg-black rounded-lg"
            muted={muted}
            playsInline
            onClick={togglePlay}
          />

          {/* Controls overlay */}
          <motion.div
            initial={false}
            animate={{ opacity: showControls ? 1 : 0 }}
            className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between pointer-events-auto">
              <h3 className="text-foreground font-bold text-lg drop-shadow-lg">{title}</h3>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center hover:bg-background/80 transition-colors">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Bottom controls */}
            <div className="flex items-center gap-4 pointer-events-auto">
              <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                {playing ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground fill-current" />}
              </button>
              <button onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX className="w-5 h-5 text-foreground" /> : <Volume2 className="w-5 h-5 text-foreground" />}
              </button>
              <div className="flex-1" />
              <button onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="w-5 h-5 text-foreground" /> : <Maximize className="w-5 h-5 text-foreground" />}
              </button>
            </div>
          </motion.div>

          {/* No URL fallback */}
          {!url && (
            <div className="absolute inset-0 flex items-center justify-center bg-black rounded-lg">
              <p className="text-muted-foreground text-lg">Nenhum link de vídeo disponível</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayer;
