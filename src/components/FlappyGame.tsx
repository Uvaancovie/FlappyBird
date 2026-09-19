import React, { useEffect, useRef, useState } from 'react';
import { FRAME_WIDTH, FRAME_HEIGHT } from '../game/constants';
import { loadGameAssets, GameAssets } from '../game/assets';
import { GameEngine } from '../game/engine';

interface FlappyGameProps {
  onScoreUpdate: (score: number, bestScore: number, state: any) => void;
  onGameOver: (finalScore: number) => void;
  engineRef: React.MutableRefObject<GameEngine | null>;
  onCanvasTap: () => void;
  onCanvasTapUp: () => void;
  children?: React.ReactNode;
}

export const FlappyGame: React.FC<FlappyGameProps> = ({
  onScoreUpdate,
  onGameOver,
  engineRef,
  onCanvasTap,
  onCanvasTapUp,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadingPercent, setLoadingPercent] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const prevGameStateRef = useRef<any>(0);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let localEngine: GameEngine | null = null;

    loadGameAssets((percent) => {
      setLoadingPercent(percent);
    }).then((assets: GameAssets) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      localEngine = new GameEngine(assets, {
        onStateChange: (state, score, bestScore) => {
          onScoreUpdate(score, bestScore, state);
          if (
            prevGameStateRef.current === 1 && // GameState.GAME_START
            state === 2 // GameState.STATE_OVER
          ) {
            onGameOver(score);
          }
          prevGameStateRef.current = state;
        },
        onNewHighScore: () => {
          // high score effect if any
        },
      });

      engineRef.current = localEngine;
      setIsReady(true);

      const gameLoop = (currentTime: number) => {
        let dtMs = currentTime - lastTime;
        if (dtMs > 100) dtMs = 16.67; // avoid extreme jumps if tab is backgrounded
        lastTime = currentTime;

        // 30 FPS is our baseline speed (approx 33.33ms per frame)
        const dt = dtMs / 33.33;

        if (localEngine) {
          localEngine.tick(ctx, dt);
        }
        animId = requestAnimationFrame(gameLoop);
      };

      animId = requestAnimationFrame(gameLoop);
    });

    return () => {
      if (animId) cancelAnimationFrame(animId);
      engineRef.current = null;
    };
  }, [onScoreUpdate, onGameOver, engineRef]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onCanvasTap();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    onCanvasTapUp();
  };

  return (
    <div
      id="flappy-game-container"
      className="relative w-full max-w-[420px] h-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-950 select-none flex items-center justify-center"
      style={{ aspectRatio: `${FRAME_WIDTH}/${FRAME_HEIGHT}` }}
    >
      {!isReady && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900 text-slate-100 gap-3">
          <img src="/resources/img/0.png" alt="Loading" className="w-10 h-8 animate-bounce" />
          <div className="text-xs font-pixel text-amber-400 tracking-wider">LOADING FLAPPY BIRD...</div>
          <div className="w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-amber-400 transition-all duration-150"
              style={{ width: `${loadingPercent}%` }}
            />
          </div>
        </div>
      )}

      <canvas
        id="flappy-canvas"
        ref={canvasRef}
        width={FRAME_WIDTH}
        height={FRAME_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="w-full h-full object-contain cursor-pointer touch-none"
      />

      {children}
    </div>
  );
};
