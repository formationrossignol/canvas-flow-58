import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimerProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const Timer = ({ isVisible, onToggle }: TimerProps) => {
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);

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
    setTime(0);
    setIsRunning(false);
  };

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-28 right-6 z-40 gap-2 floating-element bg-card/95 backdrop-blur-sm"
        onClick={onToggle}
      >
        <TimerIcon size={16} />
        Timer
      </Button>
    );
  }

  return (
    <div className="absolute top-28 right-6 z-40 animate-float-in">
      <div className="floating-element bg-card/95 backdrop-blur-sm rounded-xl border border-border p-4">
        <div className="flex items-center gap-3 mb-4">
          <TimerIcon size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Timer</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="ml-auto"
          >
            ×
          </Button>
        </div>
        
        <div className="text-center mb-4">
          <div className="text-3xl font-mono font-bold text-foreground mb-2">
            {formatTime(time)}
          </div>
          <div className="text-sm text-muted-foreground">
            {isRunning ? 'En cours...' : 'Arrêté'}
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