import { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface TimerProps {
  isVisible: boolean;
  onToggle: () => void;
}

const PRESETS = [
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
  { label: '15m', seconds: 900 },
  { label: '20m', seconds: 1200 },
];

const R = 52;
const CIRC = 2 * Math.PI * R;

export const Timer = ({ isVisible, onToggle }: TimerProps) => {
  const [totalSeconds, setTotalSeconds] = useState(300);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (elapsed >= totalSeconds) {
      setRunning(false);
      return;
    }
    const id = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [running, elapsed, totalSeconds]);

  const timeLeft = Math.max(0, totalSeconds - elapsed);
  const done = elapsed >= totalSeconds && totalSeconds > 0;
  const statusLabel = done ? '⏰ Temps écoulé !' : running ? 'En cours...' : elapsed > 0 ? 'En pause' : 'Prêt';
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  const dashOffset = CIRC * (1 - progress);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handlePreset = (seconds: number) => {
    setTotalSeconds(seconds);
    setElapsed(0);
    setRunning(false);
  };

  const handleReset = () => {
    setElapsed(0);
    setRunning(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      zIndex: 60, background: 'white', border: '1px solid rgba(15,23,42,0.08)',
      borderRadius: 18, padding: '20px 24px',
      boxShadow: '0 16px 48px rgba(0,0,0,0.13), 0 4px 12px rgba(0,0,0,0.06)',
      minWidth: 260,
    }}>
      {/* Header with close */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Timer</span>
        <button onClick={onToggle} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(15,23,42,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 14 }}>✕</button>
      </div>

      {/* Ring + time */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 16 }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={R} fill="none" stroke="#E5E7EB" strokeWidth="8" />
          <circle
            cx="65" cy="65" r={R} fill="none"
            stroke={done ? '#EF4444' : '#6366F1'} strokeWidth="8"
            strokeDasharray={CIRC} strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '65px 65px', transition: 'stroke-dashoffset 0.9s linear' }}
          />
          <text
            x="65" y="62" textAnchor="middle" dominantBaseline="middle"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 700, fill: '#111827' }}
          >
            {fmt(timeLeft)}
          </text>
          <text
            x="65" y="80" textAnchor="middle" dominantBaseline="middle"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, fill: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase' }}
          >
            {statusLabel.toUpperCase()}
          </text>
        </svg>
      </div>

      {/* Presets */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => handlePreset(p.seconds)}
            style={{
              flex: 1, height: 32, borderRadius: 8,
              background: totalSeconds === p.seconds ? 'rgba(99,102,241,0.12)' : 'rgba(15,23,42,0.04)',
              border: totalSeconds === p.seconds ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(15,23,42,0.08)',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
              color: totalSeconds === p.seconds ? '#6366F1' : '#6B7280',
              fontFamily: 'inherit',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => { if (done) { handleReset(); setRunning(true); } else setRunning(r => !r); }}
          style={{
            flex: 1, height: 36, borderRadius: 10,
            background: '#6366F1', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: 'white', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 1px 4px rgba(99,102,241,0.3)',
          }}
        >
          {running ? <Pause size={14} /> : <Play size={14} />}
          {running ? 'Pause' : done ? 'Relancer' : 'Démarrer'}
        </button>
        <button
          onClick={handleReset}
          style={{
            height: 36, padding: '0 14px', borderRadius: 10,
            background: 'rgba(15,23,42,0.05)', border: '1px solid rgba(15,23,42,0.08)',
            cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#6B7280', fontFamily: 'inherit',
          }}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
};
