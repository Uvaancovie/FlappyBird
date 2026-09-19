import React, { useState, useRef, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Sparkles } from 'lucide-react';
import {
  GameState,
  AchievementBadge,
  CrashRoundState,
  CrashHistoryItem,
  PilotMode,
} from './types';
import { GameEngine } from './game/engine';
import { audioManager } from './game/audio';
import { getAchievements, checkNewlyUnlocked } from './game/achievements';
import { Header } from './components/Header';
import { FlappyGame } from './components/FlappyGame';
import { CrashArenaHUD } from './components/CrashArenaHUD';
import { CrashCanvasOverlay } from './components/CrashCanvasOverlay';
import { LeaderboardModal } from './components/LeaderboardModal';

export const App: React.FC = () => {
  // Arcade State
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('flappy_bird_best_score') || '0', 10) || 0;
    } catch {
      return 0;
    }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => audioManager.isSoundEnabled());
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [gamesPlayed, setGamesPlayed] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('flappy_bird_games_played') || '0', 10) || 0;
    } catch {
      return 0;
    }
  });

  // Crash Arena Betting & Multiplier State
  const [demoBalanceCents, setDemoBalanceCents] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('flappy_crash_balance_cents');
      return saved ? parseInt(saved, 10) : 100000; // default R 1,000.00
    } catch {
      return 100000;
    }
  });
  const [betCents, setBetCents] = useState<number>(5000); // R 50.00 default
  const [crashRoundState, setCrashRoundState] = useState<CrashRoundState>('betting');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number | null>(null);
  const [winAmountCents, setWinAmountCents] = useState<number>(0);
  const [pilotMode, setPilotMode] = useState<PilotMode>('ai');
  const [autoCashOut, setAutoCashOut] = useState<number | null>(null);
  const [crashHistory, setCrashHistory] = useState<CrashHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('flappy_crash_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Refs for high frequency state sync
  const crashRoundStateRef = useRef<CrashRoundState>('betting');
  const multiplierRef = useRef<number>(1.0);
  const betCentsRef = useRef<number>(5000);
  const pilotModeRef = useRef<PilotMode>('ai');

  const changeCrashRoundState = (state: CrashRoundState) => {
    setCrashRoundState(state);
    crashRoundStateRef.current = state;
  };

  const changeMultiplier = (m: number) => {
    setMultiplier(m);
    multiplierRef.current = m;
  };

  const changeBetCents = (cents: number) => {
    setBetCents(cents);
    betCentsRef.current = cents;
  };

  const changePilotMode = (mode: PilotMode) => {
    setPilotMode(mode);
    pilotModeRef.current = mode;
  };

  // Achievement unlock notification toast
  const [unlockedToast, setUnlockedToast] = useState<AchievementBadge | null>(null);

  const engineRef = useRef<GameEngine | null>(null);
  const prevBestRef = useRef<number>(bestScore);
  const prevGamesRef = useRef<number>(gamesPlayed);
  const flightStartTimeRef = useRef<number>(0);
  const crashAnimRef = useRef<number | null>(null);

  // Sync demo balance to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('flappy_crash_balance_cents', demoBalanceCents.toString());
    } catch {
      // ignore
    }
  }, [demoBalanceCents]);

  // Check achievements whenever bestScore or gamesPlayed changes
  useEffect(() => {
    const newlyUnlocked = checkNewlyUnlocked(
      prevBestRef.current,
      prevGamesRef.current,
      bestScore,
      gamesPlayed
    );

    if (newlyUnlocked.length > 0) {
      const latest = newlyUnlocked[newlyUnlocked.length - 1];
      setUnlockedToast(latest);

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.2 },
        });
      } catch {
        // ignore
      }

      const timer = setTimeout(() => {
        setUnlockedToast(null);
      }, 4000);

      prevBestRef.current = bestScore;
      prevGamesRef.current = gamesPlayed;

      return () => clearTimeout(timer);
    }

    prevBestRef.current = bestScore;
    prevGamesRef.current = gamesPlayed;
  }, [bestScore, gamesPlayed]);

  // Trigger crash state instantly and freeze the multiplier
  const triggerCrashed = useCallback(() => {
    if (crashRoundStateRef.current !== 'flying') return;

    changeCrashRoundState('crashed');
    audioManager.playCrash();

    // Save loss to history
    setCrashHistory((prev) => {
      const item: CrashHistoryItem = {
        id: Date.now().toString(),
        multiplier: multiplierRef.current,
        won: false,
        winAmountCents: 0,
        betAmountCents: betCentsRef.current,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const updated = [item, ...prev.slice(0, 19)];
      try {
        localStorage.setItem('flappy_crash_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Multiplier tick loop during active crash flight
  useEffect(() => {
    if (crashRoundState !== 'flying') {
      if (crashAnimRef.current) cancelAnimationFrame(crashAnimRef.current);
      return;
    }

    let lastTickMultiplier = 1.0;

    const updateMultiplier = () => {
      // If the bird crashed/is dead inside the engine, trigger crash instantly and stop the multiplier!
      if (engineRef.current && engineRef.current.isBirdDead() && crashRoundStateRef.current === 'flying') {
        triggerCrashed();
        return;
      }

      const elapsedSec = (performance.now() - flightStartTimeRef.current) / 1000;

      // Exponential smooth curve: M = 1.00 + (t * 0.12) + (t^1.45 * 0.045) + (score * 0.5)
      const currentFlightScore = engineRef.current ? engineRef.current.score : 0;
      const calculated = Math.max(
        1.0,
        1.0 + elapsedSec * 0.12 + Math.pow(elapsedSec, 1.45) * 0.045 + currentFlightScore * 0.5
      );

      changeMultiplier(calculated);

      // Audio ticker every +0.1x for smooth audio excitement
      if (calculated - lastTickMultiplier >= 0.1) {
        lastTickMultiplier = calculated;
        audioManager.playMultiplierTick(calculated);
      }

      // Auto-cashout check
      if (autoCashOut && calculated >= autoCashOut && crashRoundStateRef.current === 'flying') {
        handleCashOutAt(calculated);
        return;
      }

      crashAnimRef.current = requestAnimationFrame(updateMultiplier);
    };

    crashAnimRef.current = requestAnimationFrame(updateMultiplier);

    return () => {
      if (crashAnimRef.current) cancelAnimationFrame(crashAnimRef.current);
    };
  }, [crashRoundState, autoCashOut, triggerCrashed]);

  // Handler for state changes from the Flappy game engine
  const handleScoreUpdate = useCallback(
    (newScore: number, newBestScore: number, state: GameState) => {
      setScore(newScore);
      setBestScore(newBestScore);

      // If the engine reports GAME_OVER and we were still flying, it crashed!
      if (state === GameState.STATE_OVER && crashRoundStateRef.current === 'flying') {
        triggerCrashed();
      }
    },
    [triggerCrashed]
  );

  const handleGameOver = useCallback((_finalScore: number) => {
    setGamesPlayed((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('flappy_bird_games_played', next.toString());
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Start a Crash Round
  const handleStartCrashRound = useCallback(() => {
    if (demoBalanceCents < betCentsRef.current) return;
    if (crashRoundStateRef.current === 'flying') return;

    audioManager.unlockAudio();
    audioManager.playCoinChip();

    // Deduct bet
    setDemoBalanceCents((prev) => prev - betCentsRef.current);
    changeMultiplier(1.0);
    setCashedOutMultiplier(null);
    setWinAmountCents(0);
    changeCrashRoundState('flying');
    flightStartTimeRef.current = performance.now();

    if (engineRef.current) {
      engineRef.current.isAutopilot = pilotModeRef.current === 'ai';
      engineRef.current.reset();
      engineRef.current.handleInput();
    }
  }, [demoBalanceCents]);

  // Cash Out at current multiplier
  const handleCashOutAt = useCallback((cashOutMult: number) => {
    if (crashRoundStateRef.current !== 'flying') return;

    const winCents = Math.floor(betCentsRef.current * cashOutMult);
    setCashedOutMultiplier(cashOutMult);
    setWinAmountCents(winCents);
    setDemoBalanceCents((prev) => prev + winCents);
    changeCrashRoundState('cashed_out');

    audioManager.playCashOut();

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }

    // Save win to history
    setCrashHistory((prev) => {
      const item: CrashHistoryItem = {
        id: Date.now().toString(),
        multiplier: cashOutMult,
        won: true,
        winAmountCents: winCents,
        betAmountCents: betCentsRef.current,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const updated = [item, ...prev.slice(0, 19)];
      try {
        localStorage.setItem('flappy_crash_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const handleCashOut = useCallback(() => {
    handleCashOutAt(multiplierRef.current);
  }, [handleCashOutAt]);

  // Direct start and cashout reference refs for Keyboard listeners
  const startRoundRef = useRef<() => void>(() => {});
  const cashOutRef = useRef<() => void>(() => {});
  const setPilotModeRef = useRef<(mode: PilotMode) => void>(() => {});

  useEffect(() => {
    startRoundRef.current = handleStartCrashRound;
    cashOutRef.current = handleCashOut;
    setPilotModeRef.current = handleSetPilotMode;
  }, [handleStartCrashRound, handleCashOut]);

  // Global key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        audioManager.unlockAudio();

        if (crashRoundStateRef.current === 'flying') {
          if (pilotModeRef.current === 'ai') {
            setPilotModeRef.current('manual');
          }
          if (engineRef.current) {
            engineRef.current.handleInput();
          }
        } else {
          startRoundRef.current();
        }
      }

      if (e.code === 'Enter') {
        e.preventDefault();
        audioManager.unlockAudio();
        if (crashRoundStateRef.current === 'flying') {
          cashOutRef.current();
        } else {
          startRoundRef.current();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (crashRoundStateRef.current === 'flying' && pilotModeRef.current === 'manual' && engineRef.current) {
          engineRef.current.handleKeyUp();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleCanvasTap = () => {
    audioManager.unlockAudio();
    if (crashRoundStateRef.current === 'flying') {
      if (pilotModeRef.current === 'ai') {
        handleSetPilotMode('manual');
      }
      if (engineRef.current) {
        engineRef.current.handleInput();
      }
    } else {
      handleStartCrashRound();
    }
  };

  const handleCanvasTapUp = () => {
    if (crashRoundStateRef.current === 'flying' && pilotModeRef.current === 'manual') {
      if (engineRef.current) {
        engineRef.current.handleKeyUp();
      }
    }
  };

  const handleResetBalance = () => {
    setDemoBalanceCents(100000); // R 1,000.00
    audioManager.playCashOut();
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioManager.setSoundEnabled(next);
  };

  const handleResetGame = () => {
    if (engineRef.current) {
      engineRef.current.reset();
    }
    changeCrashRoundState('betting');
    changeMultiplier(1.0);
  };

  const handleSetPilotMode = (mode: PilotMode) => {
    changePilotMode(mode);
    if (engineRef.current) {
      engineRef.current.isAutopilot = mode === 'ai';
    }
  };

  const achievements = getAchievements(bestScore, gamesPlayed);
  const unlockedBadgesCount = achievements.filter((a) => a.unlocked).length;

  const highestMultiplier = crashHistory.length > 0
    ? Math.max(...crashHistory.map((item) => item.multiplier))
    : 1.0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-2 sm:p-4 selection:bg-amber-500 selection:text-black relative">
      {/* Toast Notification for Unlocked Badges */}
      {unlockedToast && (
        <div
          id="toast-achievement"
          onClick={() => {
            setUnlockedToast(null);
            setIsLeaderboardOpen(true);
          }}
          className="fixed top-4 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-2xl shadow-2xl border-2 border-amber-300 animate-bounce cursor-pointer"
        >
          <div className="p-2 bg-slate-950/20 rounded-xl text-xl flex-shrink-0">
            {unlockedToast.icon}
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold font-pixel uppercase tracking-wider text-slate-900">
              <Sparkles className="w-3 h-3" />
              BADGE UNLOCKED!
            </div>
            <div className="font-bold text-xs text-slate-950">{unlockedToast.title}</div>
            <div className="text-[11px] text-slate-900/90 leading-tight">
              {unlockedToast.description}
            </div>
          </div>
          <Award className="w-5 h-5 text-slate-950 ml-1" />
        </div>
      )}

      {/* Game Header Bar */}
      <Header
        score={score}
        bestScore={bestScore}
        highestMultiplier={highestMultiplier}
        unlockedBadgesCount={unlockedBadgesCount}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onResetGame={handleResetGame}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Interactive Crash Arena Dashboard */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center mt-2 mb-6">
        {/* Left Side: Flappy Game Screen */}
        <main className="w-full max-w-[420px] flex flex-col items-center justify-center flex-shrink-0">
          <FlappyGame
            onScoreUpdate={handleScoreUpdate}
            onGameOver={handleGameOver}
            engineRef={engineRef}
            onCanvasTap={handleCanvasTap}
            onCanvasTapUp={handleCanvasTapUp}
          >
            <CrashCanvasOverlay
              roundState={crashRoundState}
              multiplier={multiplier}
              betCents={betCents}
              winAmountCents={winAmountCents}
              cashedOutMultiplier={cashedOutMultiplier}
              pilotMode={pilotMode}
            />
          </FlappyGame>
        </main>

        {/* Right Side: Betting & Metrics HUD */}
        <div className="w-full max-w-[440px] flex-col flex gap-4 flex-grow">
          <CrashArenaHUD
            balanceCents={demoBalanceCents}
            betCents={betCents}
            multiplier={multiplier}
            roundState={crashRoundState}
            pilotMode={pilotMode}
            autoCashOut={autoCashOut}
            history={crashHistory}
            cashedOutMultiplier={cashedOutMultiplier}
            winAmountCents={winAmountCents}
            onSetBetCents={changeBetCents}
            onSetPilotMode={handleSetPilotMode}
            onSetAutoCashOut={setAutoCashOut}
            onStartRound={handleStartCrashRound}
            onCashOut={handleCashOut}
            onResetBalance={handleResetBalance}
          />
        </div>
      </div>

      {/* Leaderboard & Achievements Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        bestScore={bestScore}
        crashHistory={crashHistory}
        gamesPlayed={gamesPlayed}
      />
    </div>
  );
};

export default App;
