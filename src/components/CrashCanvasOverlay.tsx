import React from 'react';
import { Sparkles, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { CrashRoundState } from '../types';

interface CrashCanvasOverlayProps {
  roundState: CrashRoundState;
  multiplier: number;
  betCents: number;
  winAmountCents: number;
  cashedOutMultiplier: number | null;
  pilotMode: 'manual' | 'ai';
}

export const CrashCanvasOverlay: React.FC<CrashCanvasOverlayProps> = ({
  roundState,
  multiplier,
  betCents,
  winAmountCents,
  cashedOutMultiplier,
  pilotMode,
}) => {
  const formatZAR = (cents: number) => {
    return `R ${(cents / 100).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const potentialWinCents = Math.floor(betCents * multiplier);

  // Multiplier color class
  const getMultiplierStyle = (m: number) => {
    if (m >= 25) return 'text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.9)]';
    if (m >= 10) return 'text-purple-400 drop-shadow-[0_0_16px_rgba(192,132,252,0.85)]';
    if (m >= 5) return 'text-sky-400 drop-shadow-[0_0_14px_rgba(56,189,248,0.8)]';
    if (m >= 2) return 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]';
    return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]';
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none z-10">
      {/* Top Banner inside canvas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur border border-slate-700/80 rounded-lg text-slate-300 text-[11px] font-pixel">
          <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <span>CRASH MULTIPLIER</span>
        </div>

        <div className="px-2 py-0.5 bg-slate-900/85 backdrop-blur border border-slate-700/80 rounded-md text-[10px] text-slate-300 font-mono">
          {pilotMode === 'manual' ? '🕹️ Manual Pilot' : '🤖 AI Autopilot'}
        </div>
      </div>

      {/* Center Live Multiplier HUD */}
      <div className="flex flex-col items-center justify-center -mt-6">
        {roundState === 'flying' && (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-100">
            {/* Live Multiplier */}
            <div
              className={`text-4xl sm:text-5xl font-black font-pixel tracking-tighter ${getMultiplierStyle(
                multiplier
              )} animate-pulse`}
            >
              {multiplier.toFixed(2)}x
            </div>

            {/* Potential Win Subtitle */}
            <div className="mt-1 px-3 py-1 bg-slate-950/85 backdrop-blur rounded-full border border-slate-700/70 text-xs font-mono text-emerald-300 font-bold flex items-center gap-1 shadow-lg">
              <span>Potential: {formatZAR(potentialWinCents)}</span>
            </div>
          </div>
        )}

        {roundState === 'cashed_out' && (
          <div className="flex flex-col items-center bg-slate-950/90 backdrop-blur border-2 border-emerald-500 p-4 rounded-2xl shadow-2xl shadow-emerald-500/30 animate-in zoom-in-90 duration-200">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-pixel font-bold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>CASHED OUT!</span>
            </div>
            <div className="text-3xl font-black font-pixel text-emerald-300">
              +{formatZAR(winAmountCents)}
            </div>
            <div className="text-xs font-mono text-slate-300 mt-0.5">
              Locked in at {cashedOutMultiplier?.toFixed(2)}x
            </div>
          </div>
        )}

        {roundState === 'crashed' && (
          <div className="flex flex-col items-center bg-slate-950/90 backdrop-blur border-2 border-rose-500 p-4 rounded-2xl shadow-2xl shadow-rose-500/30 animate-in zoom-in-90 duration-200">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-pixel font-bold mb-1">
              <XCircle className="w-4 h-4" />
              <span>CRASHED!</span>
            </div>
            <div className="text-3xl font-black font-pixel text-rose-400">
              {multiplier.toFixed(2)}x
            </div>
            <div className="text-xs font-mono text-rose-300 mt-0.5">
              Lost {formatZAR(betCents)}
            </div>
          </div>
        )}

        {roundState === 'betting' && (
          <div className="flex flex-col items-center bg-slate-950/80 backdrop-blur border border-slate-700/80 px-4 py-2.5 rounded-xl text-center shadow-lg">
            <div className="text-xs font-pixel text-amber-400 mb-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PLACE BET TO FLY</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Multiplier starts rising immediately on takeoff!
            </div>
          </div>
        )}
      </div>

      {/* Bottom helper prompt */}
      <div className="flex items-center justify-center">
        {roundState === 'flying' && pilotMode === 'manual' && (
          <div className="px-3 py-1 bg-slate-950/75 backdrop-blur rounded-full text-[10px] text-slate-400 border border-slate-800">
            Tap / Spacebar to fly bird · Cash Out anytime!
          </div>
        )}
        {roundState === 'flying' && pilotMode === 'ai' && (
          <div className="px-3 py-1 bg-slate-950/75 backdrop-blur rounded-full text-[10px] text-sky-400 border border-slate-800 animate-pulse">
            🤖 AI Autopilot in control · Watch multiplier & Cash Out!
          </div>
        )}
      </div>
    </div>
  );
};
