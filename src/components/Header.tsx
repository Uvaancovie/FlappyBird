import React from 'react';
import { Volume2, VolumeX, RotateCcw, Award, TrendingUp } from 'lucide-react';
import { audioManager } from '../game/audio';

interface HeaderProps {
  score: number;
  bestScore: number;
  highestMultiplier: number;
  unlockedBadgesCount?: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetGame: () => void;
  onOpenLeaderboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  highestMultiplier,
  unlockedBadgesCount = 0,
  soundEnabled,
  onToggleSound,
  onResetGame,
  onOpenLeaderboard,
}) => {
  return (
    <header className="w-full max-w-[440px] flex items-center justify-between px-3 py-2 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-xl shadow-lg mb-3 select-none">
      {/* Brand & Stats */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <img src="/resources/img/0.png" alt="Flappy Bird" className="w-6 h-4.5 object-contain" />
          <span className="font-bold text-xs tracking-wider text-amber-400 font-pixel">
            CRASH
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700/60 font-mono">
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="text-[9px] text-slate-500 font-semibold uppercase">PTS:</span>
            <span>{score}</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1 text-rose-400 font-bold">
            <TrendingUp className="w-3 h-3 text-rose-400" />
            <span>{highestMultiplier.toFixed(2)}x</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          id="btn-sound-toggle"
          onClick={() => {
            audioManager.unlockAudio();
            onToggleSound();
          }}
          className="p-1.5 text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg transition"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
        </button>

        <button
          id="btn-view-stats"
          onClick={onOpenLeaderboard}
          className="relative p-1.5 text-slate-300 hover:text-amber-300 bg-slate-700/60 hover:bg-slate-700 rounded-lg transition flex items-center gap-1"
          title="Scores & Badges"
          aria-label="View Stats and Badges"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          {unlockedBadgesCount > 0 && (
            <span className="text-[10px] font-bold font-mono text-amber-300">
              {unlockedBadgesCount}
            </span>
          )}
        </button>

        <button
          id="btn-restart"
          onClick={onResetGame}
          className="p-1.5 text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg transition"
          title="Restart Game"
          aria-label="Restart Game"
        >
          <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
        </button>
      </div>
    </header>
  );
};
export default Header;
