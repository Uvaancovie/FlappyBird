import React from 'react';
import {
  Coins,
  TrendingUp,
  RotateCcw,
  Zap,
  Bot,
  User,
  ShieldAlert,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { CrashRoundState, CrashHistoryItem, PilotMode } from '../types';

interface CrashArenaHUDProps {
  balanceCents: number;
  betCents: number;
  multiplier: number;
  roundState: CrashRoundState;
  pilotMode: PilotMode;
  autoCashOut: number | null;
  history: CrashHistoryItem[];
  cashedOutMultiplier: number | null;
  winAmountCents: number;
  onSetBetCents: (cents: number) => void;
  onSetPilotMode: (mode: PilotMode) => void;
  onSetAutoCashOut: (multiplier: number | null) => void;
  onStartRound: () => void;
  onCashOut: () => void;
  onResetBalance: () => void;
}

const CHIP_VALUES = [
  { label: 'R1', cents: 100 },
  { label: 'R5', cents: 500 },
  { label: 'R10', cents: 1000 },
  { label: 'R25', cents: 2500 },
  { label: 'R50', cents: 5000 },
  { label: 'R100', cents: 10000 },
  { label: 'R250', cents: 25000 },
];

const AUTO_CASHOUT_PRESETS = [
  { label: 'OFF', val: null },
  { label: '1.5x', val: 1.5 },
  { label: '2.0x', val: 2.0 },
  { label: '3.0x', val: 3.0 },
  { label: '5.0x', val: 5.0 },
  { label: '10.0x', val: 10.0 },
];

export const CrashArenaHUD: React.FC<CrashArenaHUDProps> = ({
  balanceCents,
  betCents,
  multiplier,
  roundState,
  pilotMode,
  autoCashOut,
  history,
  cashedOutMultiplier,
  winAmountCents,
  onSetBetCents,
  onSetPilotMode,
  onSetAutoCashOut,
  onStartRound,
  onCashOut,
  onResetBalance,
}) => {
  const formatZAR = (cents: number) => {
    return `R ${(cents / 100).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const potentialWinCents = Math.floor(betCents * multiplier);

  return (
    <div className="w-full max-w-[440px] flex flex-col gap-2.5 select-none">
      {/* Top Wallet & Multiplier Ribbon */}
      <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl p-3 shadow-lg flex flex-col gap-2">
        {/* Wallet Balance Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-pixel tracking-wider">
                DEMO BALANCE
              </div>
              <div className="text-base font-bold font-mono text-emerald-300">
                {formatZAR(balanceCents)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-topup-balance"
              onClick={onResetBalance}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition flex items-center gap-1"
              title="Reset Demo Credits (+R1,000.00)"
            >
              <RotateCcw className="w-3 h-3 text-sky-400" />
              <span>Reset R1k</span>
            </button>
          </div>
        </div>

        {/* Multiplier History Pill Stream */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs">
          <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1 flex-shrink-0">
            <Flame className="w-3 h-3 text-amber-400" />
            Recent:
          </span>
          {history.length === 0 ? (
            <span className="text-[10px] text-slate-600">No rounds yet</span>
          ) : (
            history.slice(0, 7).map((item) => (
              <span
                key={item.id}
                className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border flex-shrink-0 ${
                  item.multiplier >= 2.0
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                    : 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                }`}
              >
                {item.multiplier.toFixed(2)}x
              </span>
            ))
          )}
        </div>
      </div>

      {/* Betting Control Deck */}
      <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-2xl p-3.5 shadow-xl flex flex-col gap-3">
        {/* Pilot Mode Selection (Manual Fly vs AI Autopilot) */}
        <div className="flex items-center justify-between p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          <button
            id="pilot-manual"
            onClick={() => onSetPilotMode('manual')}
            disabled={roundState === 'flying'}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              pilotMode === 'manual'
                ? 'bg-slate-800 text-amber-300 font-bold border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            } ${roundState === 'flying' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Manual Pilot</span>
          </button>

          <button
            id="pilot-ai"
            onClick={() => onSetPilotMode('ai')}
            disabled={roundState === 'flying'}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              pilotMode === 'ai'
                ? 'bg-slate-800 text-sky-300 font-bold border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            } ${roundState === 'flying' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Bot className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Autopilot</span>
          </button>
        </div>

        {/* Bet Amount Input & Quick Modifiers */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              BET AMOUNT (ZAR)
            </span>
            <span className="text-amber-400 font-mono font-bold">{formatZAR(betCents)}</span>
          </div>

          {/* Quick Chip Row */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mb-2">
            {CHIP_VALUES.map((chip) => (
              <button
                key={chip.label}
                id={`chip-${chip.label}`}
                onClick={() => onSetBetCents(chip.cents)}
                disabled={roundState === 'flying'}
                className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition ${
                  betCents === chip.cents
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                } ${roundState === 'flying' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Modifiers (1/2, 2X, MIN, MAX) */}
          <div className="grid grid-cols-4 gap-1.5 text-xs">
            <button
              id="btn-bet-half"
              onClick={() => onSetBetCents(Math.max(100, Math.floor(betCents / 200) * 100))}
              disabled={roundState === 'flying'}
              className="py-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[11px]"
            >
              1/2
            </button>
            <button
              id="btn-bet-double"
              onClick={() => onSetBetCents(Math.min(balanceCents, betCents * 2))}
              disabled={roundState === 'flying'}
              className="py-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[11px]"
            >
              2X
            </button>
            <button
              id="btn-bet-min"
              onClick={() => onSetBetCents(100)}
              disabled={roundState === 'flying'}
              className="py-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[11px]"
            >
              MIN (R1)
            </button>
            <button
              id="btn-bet-max"
              onClick={() => onSetBetCents(Math.min(balanceCents, 50000))}
              disabled={roundState === 'flying'}
              className="py-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[11px]"
            >
              MAX (R500)
            </button>
          </div>
        </div>

        {/* Auto Cashout Options */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-sky-400" />
              AUTO CASH OUT
            </span>
            <span className="text-sky-300 font-mono font-bold">
              {autoCashOut ? `${autoCashOut.toFixed(1)}x` : 'Disabled'}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {AUTO_CASHOUT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                id={`autocash-${preset.label}`}
                onClick={() => onSetAutoCashOut(preset.val)}
                disabled={roundState === 'flying'}
                className={`py-1 text-[11px] font-mono font-bold rounded border transition ${
                  autoCashOut === preset.val
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-sm'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700'
                } ${roundState === 'flying' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* BIG ACTION BUTTON */}
        <div className="pt-1">
          {roundState === 'betting' && (
            <button
              id="btn-place-bet"
              onClick={onStartRound}
              disabled={balanceCents < betCents}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.99] text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 font-pixel text-xs tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>PLACE BET ({formatZAR(betCents)}) & FLY</span>
            </button>
          )}

          {roundState === 'flying' && (
            <button
              id="btn-cash-out"
              onClick={onCashOut}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] text-slate-950 font-black rounded-xl shadow-xl shadow-amber-500/40 font-pixel text-sm tracking-wider transition-all animate-pulse flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-1.5">
                <Coins className="w-5 h-5 fill-current" />
                <span>CASH OUT NOW</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                {formatZAR(potentialWinCents)} ({multiplier.toFixed(2)}x)
              </div>
            </button>
          )}

          {roundState === 'cashed_out' && (
            <div className="flex flex-col gap-2">
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-center flex items-center justify-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-xs font-pixel">
                  CASHED OUT: +{formatZAR(winAmountCents)} ({cashedOutMultiplier?.toFixed(2)}x)!
                </span>
              </div>
              <button
                id="btn-next-round-won"
                onClick={onStartRound}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl font-pixel text-xs tracking-wider transition shadow-md"
              >
                PLAY NEXT ROUND ({formatZAR(betCents)})
              </button>
            </div>
          )}

          {roundState === 'crashed' && (
            <div className="flex flex-col gap-2">
              <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-center flex items-center justify-center gap-2 text-rose-300">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span className="font-bold text-xs font-pixel">
                  CRASHED @ {multiplier.toFixed(2)}x! LOST {formatZAR(betCents)}
                </span>
              </div>
              <button
                id="btn-next-round-lost"
                onClick={onStartRound}
                disabled={balanceCents < betCents}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl font-pixel text-xs tracking-wider transition shadow-md"
              >
                REBET & FLY AGAIN ({formatZAR(betCents)})
              </button>
            </div>
          )}
        </div>

        {/* Responsible Gaming & South Africa Demo Disclaimer */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-400" />
            <span>18+ Demo & Free-play only</span>
          </div>
          <span className="text-slate-500">Durban / SA iGaming Kit</span>
        </div>
      </div>
    </div>
  );
};
