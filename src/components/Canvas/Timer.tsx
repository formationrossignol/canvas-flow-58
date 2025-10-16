import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer as TimerIcon, Plus, Minus, Music, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimerProps {
  isVisible: boolean;
  onToggle: () => void;
}

const musicTracks = [
  { id: 1, name: "Lofi Study Beats", url: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3" },
  { id: 2, name: "Ambient Focus", url: "https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3" },
  { id: 3, name: "Peaceful Piano", url: "https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3" },
  { id: 4, name: "Nature Sounds", url: "https://assets.mixkit.co/music/preview/mixkit-forest-treasure-138.mp3" },
];

export const Timer = ({ isVisible, onToggle }: TimerProps) => {
  const [time, setTime] = useState(300); // 5 minutes par défaut
  const [initialTime, setInitialTime] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isCountdown, setIsCountdown] = useState(true);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => {
          if (isCountdown) {
            if (prev <= 1) {
              setIsRunning(false);
              setIsMusicPlaying(false);
              if (audioRef.current) {
                audioRef.current.pause();
              }
              playNotificationSound();
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, isCountdown]);

  useEffect(() => {
    if (selectedTrack !== null && isMusicPlaying) {
      const track = musicTracks.find(t => t.id === selectedTrack);
      if (track) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        audioRef.current = new Audio(track.url);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
        audioRef.current.play();
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedTrack, isMusicPlaying]);

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // 800 Hz frequency
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsMusicPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (isCountdown) {
      setTime(initialTime);
    } else {
      setTime(0);
    }
  };

  const toggleMusic = (trackId: number) => {
    if (selectedTrack === trackId && isMusicPlaying) {
      setIsMusicPlaying(false);
    } else {
      setSelectedTrack(trackId);
      setIsMusicPlaying(true);
    }
  };

  const setCustomTime = () => {
    const newTime = customMinutes * 60;
    setTime(newTime);
    setInitialTime(newTime);
    setIsRunning(false);
  };

  const toggleMode = () => {
    setIsCountdown(!isCountdown);
    setIsRunning(false);
    if (!isCountdown) {
      // Switching to countdown mode
      setTime(initialTime);
    } else {
      // Switching to stopwatch mode
      setTime(0);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-20 right-6 z-40 animate-float-in">
      <div className="floating-element bg-card/95 backdrop-blur-sm rounded-xl border border-border p-4 w-80">
        <div className="flex items-center gap-3 mb-4">
          <TimerIcon size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">
            {isCountdown ? 'Compte à rebours' : 'Chronomètre'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="ml-auto"
          >
            ×
          </Button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={isCountdown ? "default" : "outline"}
            size="sm"
            onClick={toggleMode}
            className="flex-1"
          >
            Compte à rebours
          </Button>
          <Button
            variant={!isCountdown ? "default" : "outline"}
            size="sm"
            onClick={toggleMode}
            className="flex-1"
          >
            Chronomètre
          </Button>
        </div>

        {/* Custom Time Setting for Countdown */}
        {isCountdown && !isRunning && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <label className="text-xs text-muted-foreground mb-2 block">Définir la durée (minutes)</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMinutes = Math.max(1, customMinutes - 1);
                  setCustomMinutes(newMinutes);
                }}
                className="w-8 h-8 p-0"
              >
                <Minus size={14} />
              </Button>
              <Input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center h-8"
                min="1"
                max="120"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMinutes = Math.min(120, customMinutes + 1);
                  setCustomMinutes(newMinutes);
                }}
                className="w-8 h-8 p-0"
              >
                <Plus size={14} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={setCustomTime}
                className="ml-2"
              >
                OK
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-center mb-4">
          <div className={`text-3xl font-mono font-bold mb-2 ${
            isCountdown && time <= 10 && time > 0 ? 'text-destructive animate-pulse' : 'text-foreground'
          }`}>
            {formatTime(time)}
          </div>
          <div className="text-sm text-muted-foreground">
            {isRunning ? 'En cours...' : isCountdown && time === 0 ? 'Terminé !' : 'Arrêté'}
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <Button
            variant={isRunning ? "destructive" : "default"}
            size="sm"
            onClick={toggleTimer}
            className="flex-1 gap-2"
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetTimer}
            className="gap-2"
          >
            <RotateCcw size={16} />
            Reset
          </Button>
        </div>

        {/* Music List - Only show during countdown */}
        {isCountdown && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Music size={16} className="text-primary" />
              <h4 className="text-sm font-semibold">Musique d'ambiance</h4>
            </div>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {musicTracks.map((track) => {
                  const isActive = selectedTrack === track.id && isMusicPlaying;
                  return (
                    <button
                      key={track.id}
                      onClick={() => toggleMusic(track.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'bg-muted/50 hover:bg-muted border border-transparent'
                      }`}
                    >
                      <span className="text-sm text-foreground">{track.name}</span>
                      {isActive ? (
                        <Volume2 size={16} className="text-primary" />
                      ) : (
                        <VolumeX size={16} className="text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};