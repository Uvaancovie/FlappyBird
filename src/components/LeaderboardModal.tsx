import React, { useState } from 'react';
import { X, Trophy, Flame, Play, Award, Lock, CheckCircle2, TrendingUp } from 'lucide-react';
import { CrashHistoryItem } from '../types';
import { getAchievements } from '../game/achievements';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestScore: number;
  crashHistory: CrashHistoryItem[];
  gamesPlayed: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  bestScore,
  crashHistory,
  gamesPlayed,
}) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'history'>('achievements');
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  if (!isOpen) return null;

  const badges = getAchievements(bestScore, gamesPlayed);
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const filteredBadges = badges.filter((b) => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'locked') return !b.unlocked;
    return true;
  });

  const highestMultiplier = crashHistory.length > 0
    ? Math.max(...crashHistory.map((item) => item.multiplier))
    : 1.0;

  const formatZAR = (cents: number) => {
    return `R ${(cents / 100).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl text-slate-200 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          id="btn-close-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white font-pixel text-xs tracking-wider">CRASH ARENA STATS</h2>
            <p className="text-[11px] text-slate-400">Track multipliers, flights and achievement badges</p>
          </div>
        </div>

        {/* Stats Bento */}
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-rose-400 text-[10px] font-semibold mb-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Best Multiplier</span>
            </div>
            <span className="text-sm font-bold font-mono text-rose-300">{highestMultiplier.toFixed(2)}x</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-sky-400 text-[10px] font-semibold mb-0.5">
              <Play className="w-3 h-3" />
              <span>Total Flights</span>
            </div>
            <span className="text-xl font-bold font-pixel text-sky-300">{gamesPlayed}</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold mb-0.5">
              <Award className="w-3 h-3" />
              <span>Badges</span>
            </div>
            <span className="text-xl font-bold font-pixel text-emerald-300">
              {unlockedCount}/{badges.length}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-3 text-xs font-medium">
          <button
            id="tab-achievements"
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'achievements'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Badges ({unlockedCount})</span>
          </button>
          <button
            id="tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Bet History ({crashHistory.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        {activeTab === 'achievements' && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Filter pills */}
            <div className="flex items-center justify-between mb-2 px-1 text-[11px]">
              <span className="text-slate-400 uppercase font-semibold tracking-wider text-[10px]">
                Achievements
              </span>
              <div className="flex items-center gap-1">
                {(['all', 'unlocked', 'locked'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2 py-0.5 rounded capitalize text-[10px] transition ${
                      filter === f
                        ? 'bg-slate-700 text-amber-300 font-semibold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges List */}
            <div className="overflow-y-auto space-y-2 pr-1 flex-1 max-h-56">
              {filteredBadges.map((badge) => {
                const percent = Math.round((badge.progress / badge.maxProgress) * 100);

                return (
                  <div
                    key={badge.id}
                    id={`badge-${badge.id}`}
                    className={`p-2.5 rounded-xl border transition-all ${
                      badge.unlocked
                        ? 'bg-gradient-to-r from-amber-500/10 via-slate-800/80 to-slate-800/80 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Badge Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                          badge.unlocked
                            ? 'bg-amber-500/20 border border-amber-500/40 shadow-inner'
                            : 'bg-slate-800 border border-slate-700/60 grayscale opacity-60'
                        }`}
                      >
                        {badge.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4
                            className={`text-xs font-bold truncate ${
                              badge.unlocked ? 'text-amber-300' : 'text-slate-400'
                            }`}
                          >
                            {badge.title}
                          </h4>
                          {badge.unlocked ? (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold flex-shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              UNLOCKED
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 flex-shrink-0">
                              <Lock className="w-3 h-3" />
                              {badge.progress}/{badge.maxProgress}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 leading-tight mb-1.5">
                          {badge.description}
                        </p>

                        {/* Progress Bar for Locked Badges */}
                        {!badge.unlocked && (
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                            <div
                              className="bg-slate-600 h-full transition-all duration-300 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col flex-1 min-h-0">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1 px-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Recent Bets & Outcomes
            </h3>

            <div className="overflow-y-auto space-y-1.5 pr-1 flex-1 max-h-56">
              {crashHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No bets placed yet. Click Place Bet & Fly!
                </div>
              ) : (
                crashHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs border border-slate-700/50 transition"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-mono text-[11px]">#{crashHistory.length - idx}</span>
                        <span className={`font-semibold ${item.won ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.won ? 'WON' : 'CRASHED'}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">{item.timestamp}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Bet: {formatZAR(item.betAmountCents)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-bold font-mono ${item.won ? 'text-emerald-300' : 'text-rose-400'}`}>
                        {item.won ? `+${formatZAR(item.winAmountCents)}` : `-${formatZAR(item.betAmountCents)}`}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Multiplier: {item.multiplier.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer OK / Play Button */}
        <button
          id="btn-modal-done"
          onClick={onClose}
          className="w-full mt-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition shadow-md font-pixel text-xs tracking-wider"
        >
          BACK TO GAME
        </button>
      </div>
    </div>
  );
};
