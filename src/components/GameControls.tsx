import React from 'react';
import { GameState } from '../types';

interface GameControlsProps {
  gameState: GameState;
  onTap: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({ gameState, onTap }) => {
  return (
    <div className="w-full max-w-[440px] mt-3 flex flex-col items-center gap-2 text-center text-slate-400 text-xs">
      {/* Touch / Click button for mobile convenience */}
      <button
        id="btn-screen-tap"
        onClick={onTap}
        className="w-full sm:hidden py-3 bg-slate-800 active:bg-slate-700 border border-slate-700 rounded-xl text-amber-300 font-pixel text-xs tracking-wider shadow-md transition touch-manipulation"
      >
        {gameState === GameState.GAME_READY
          ? 'TAP TO START'
          : gameState === GameState.GAME_START
          ? 'TAP TO FLAP 🪽'
          : 'TAP TO PLAY AGAIN 🔄'}
      </button>

      <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
        <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono shadow-sm">
          SPACE
        </kbd>
        <span>or</span>
        <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono shadow-sm">
          CLICK / TAP
        </kbd>
        <span>to fly & control the bird</span>
      </div>
    </div>
  );
};
