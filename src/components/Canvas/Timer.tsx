import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Timer as TimerIcon, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TimerProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const Timer = ({ isVisible, onToggle }: TimerProps) => {
  const [time, setTime] = useState(300); // 5 minutes par défaut
  const [initialTime, setInitialTime] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isCountdown, setIsCountdown] = useState(true);
  const [customMinutes, setCustomMinutes] = useState(5);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => {
          if (isCountdown) {
            if (prev <= 1) {
              setIsRunning(false);
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
    if (isCountdown) {
      setTime(initialTime);
    } else {
      setTime(0);
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
      <div className="floating-element bg-card/95 backdrop-blur-sm rounded-xl border border-border p-4">
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
        
        <div className="flex gap-2">
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
      </div>
    </div>
  );
};