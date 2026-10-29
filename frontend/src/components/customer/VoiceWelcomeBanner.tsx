import { useState, useEffect, useRef } from 'react';
import { Volume2, Sparkles, Play, Pause } from 'lucide-react';

interface VoiceWelcomeBannerProps {
  voiceGreeting?: {
    enabled: boolean;
    audioUrl?: string;
    text?: string;
    voiceGender?: string;
  } | null;
  restaurantName: string;
}

export default function VoiceWelcomeBanner({
  voiceGreeting,
  restaurantName,
}: VoiceWelcomeBannerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [hasUserTapped, setHasUserTapped] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!voiceGreeting?.enabled || !voiceGreeting?.audioUrl) {
    return null;
  }

  const audioUrl = voiceGreeting.audioUrl;

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => {
      setIsPlaying(false);
      setHasPlayedOnce(true);
    };

    const sessionKey = `mq-welcome-played:${restaurantName}`;
    const alreadyPlayed = sessionStorage.getItem(sessionKey);
    if (alreadyPlayed) {
      setHasPlayedOnce(true);
      return;
    }

    const handleFirstTouch = () => {
      if (audioRef.current && !hasUserTapped) {
        setHasUserTapped(true);
        audioRef.current
          .play()
          .then(() => {
            sessionStorage.setItem(sessionKey, 'true');
            setHasPlayedOnce(true);
          })
          .catch(() => {
            // Browser autoplay restrictions
          });
      }
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };

    window.addEventListener('click', handleFirstTouch, { once: true });
    window.addEventListener('touchstart', handleFirstTouch, { once: true });

    return () => {
      audio.pause();
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
  }, [audioUrl, restaurantName]);

  const togglePlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasPlayedOnce(true);
        })
        .catch(console.error);
    }
  };

  return (
    <aside
      aria-label="Welcome greeting"
      className="mx-auto w-full max-w-md px-4 pt-2.5 pb-1 animate-in fade-in duration-300"
    >
      <div
        onClick={togglePlayback}
        className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer shadow-lg ${
          isPlaying
            ? 'border-amber-400/50 bg-gradient-to-r from-amber-950/40 via-[#1a231e] to-amber-950/30 shadow-amber-500/10'
            : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-md'
        } p-2.5 sm:px-3.5 flex items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all ${
              isPlaying
                ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/30 scale-105'
                : 'bg-white/10 text-amber-300 border-white/15'
            }`}
          >
            {isPlaying ? (
              <Volume2 className="h-4 w-4 animate-bounce" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                {isPlaying ? 'Hostess Speaking' : hasPlayedOnce ? 'Replay Greeting' : 'Voice Welcome'}
              </span>
              {isPlaying && (
                <span className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-full bg-amber-400 animate-pulse" />
                  <span className="w-0.5 h-2 bg-amber-400 animate-pulse delay-75" />
                  <span className="w-0.5 h-3 bg-amber-400 animate-pulse delay-150" />
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-white/90 truncate">
              {isPlaying
                ? `Namaste! Welcome to ${restaurantName}`
                : hasPlayedOnce
                ? `Tap to replay welcome voice`
                : `Tap to hear table welcome for ${restaurantName}`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? 'Pause welcome voice' : 'Play welcome voice'}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5 text-amber-300" />}
        </button>
      </div>
    </aside>
  );
}
