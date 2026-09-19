import { GameState, BirdState, PipeType, Rectangle } from '../types';
import {
  FRAME_WIDTH,
  FRAME_HEIGHT,
  GAME_SPEED,
  BG_COLOR,
  TOP_BAR_HEIGHT,
  GROUND_HEIGHT,
  TOP_PIPE_LENGTHENING,
  CLOUD_BORN_PERCENT,
  MAX_CLOUD_COUNT,
  ACC_FLAP,
  ACC_Y,
  MAX_VEL_Y,
  RECT_DESCALE,
  VERTICAL_INTERVAL,
  HORIZONTAL_INTERVAL,
  MIN_HEIGHT,
  MAX_HEIGHT,
  MAX_DELTA,
} from './constants';
import { GameAssets } from './assets';
import { audioManager } from './audio';

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

function isInProbability(numerator: number, denominator: number): boolean {
  if (numerator <= 0 || denominator <= 0) return false;
  if (numerator >= denominator) return true;
  return getRandomNumber(1, denominator + 1) <= numerator;
}

function rectsIntersect(r1: Rectangle, r2: Rectangle): boolean {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

export class CloudObject {
  public x: number;
  public y: number;
  public speed: number;
  public scaleImageWidth: number;
  public scaleImageHeight: number;
  public img: HTMLImageElement;

  constructor(img: HTMLImageElement, x: number, y: number) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.speed = GAME_SPEED * 2;
    const scale = 1 + Math.random();
    const baseWidth = img.width || 60;
    this.scaleImageWidth = Math.floor(scale * baseWidth);
    this.scaleImageHeight = Math.floor(scale * baseWidth);
  }

  public draw(ctx: CanvasRenderingContext2D, isDead: boolean, dt: number = 1.0) {
    const curSpeed = isDead ? 1 : this.speed;
    this.x -= curSpeed * dt;
    if (this.img.complete && this.img.naturalWidth > 0) {
      ctx.drawImage(this.img, this.x, this.y, this.scaleImageWidth, this.scaleImageHeight);
    }
  }

  public isOutFrame(): boolean {
    return this.x < -1 * this.scaleImageWidth;
  }
}

export class PipeObject {
  public x: number = 0;
  public y: number = 0;
  public height: number = 0;
  public type: PipeType = PipeType.TYPE_TOP_NORMAL;
  public visible: boolean = true;
  public width: number = 52;
  public speed: number = GAME_SPEED;
  public pipeRect: Rectangle = { x: 0, y: 0, width: 52, height: 0 };
  public isMoving: boolean = false;
  public dealtY: number = 0;
  public direction: number = 1; // 1 = DOWN, 0 = UP

  constructor(isMoving: boolean = false) {
    this.isMoving = isMoving;
  }

  public setAttribute(x: number, y: number, height: number, type: PipeType, visible: boolean) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.type = type;
    this.visible = visible;
    this.dealtY = 0;
    this.direction = type === PipeType.TYPE_TOP_HARD ? 0 : 1;
    this.setRectangle(this.x, this.y, this.height);
  }

  public setRectangle(x: number, y: number, height: number) {
    this.pipeRect.x = x;
    this.pipeRect.y = y;
    this.pipeRect.height = height;
    this.pipeRect.width = this.width;
  }

  public draw(ctx: CanvasRenderingContext2D, assets: GameAssets, isDead: boolean, dt: number = 1.0) {
    const imgs = assets.pipeImages;
    if (!imgs || imgs.length < 3) return;

    const pipeBody = imgs[0];
    const pipeTopHead = imgs[1];
    const pipeBottomHead = imgs[2];

    const pipeWidth = pipeBody.width || 52;
    const pipeHeight = pipeBody.height || 420;
    const pipeHeadWidth = pipeTopHead.width || 52;
    const pipeHeadHeight = pipeTopHead.height || 26;
    this.width = pipeWidth;
    this.pipeRect.width = pipeWidth;

    const currentY = this.y + (this.isMoving ? this.dealtY : 0);

    switch (this.type) {
      case PipeType.TYPE_TOP_NORMAL:
      case PipeType.TYPE_TOP_HARD: {
        const count = Math.floor((this.height - pipeHeadHeight) / pipeHeight) + 1;
        for (let i = 0; i < count; i++) {
          ctx.drawImage(pipeBody, this.x, currentY + i * pipeHeight);
        }
        ctx.drawImage(
          pipeTopHead,
          this.x - ((pipeHeadWidth - this.width) >> 1),
          this.height - TOP_PIPE_LENGTHENING - pipeHeadHeight + (this.isMoving ? this.dealtY : 0)
        );
        break;
      }
      case PipeType.TYPE_BOTTOM_NORMAL:
      case PipeType.TYPE_BOTTOM_HARD: {
        const count = Math.floor((this.height - pipeHeadHeight - GROUND_HEIGHT) / pipeHeight) + 1;
        for (let i = 0; i < count; i++) {
          ctx.drawImage(
            pipeBody,
            this.x,
            FRAME_HEIGHT - pipeHeight - GROUND_HEIGHT - i * pipeHeight + (this.isMoving ? this.dealtY : 0)
          );
        }
        ctx.drawImage(
          pipeBottomHead,
          this.x - ((pipeHeadWidth - this.width) >> 1),
          FRAME_HEIGHT - this.height + (this.isMoving ? this.dealtY : 0)
        );
        break;
      }
      case PipeType.TYPE_HOVER_NORMAL:
      case PipeType.TYPE_HOVER_HARD: {
        const count = Math.floor((this.height - 2 * pipeHeadHeight) / pipeHeight) + 1;
        ctx.drawImage(
          pipeBottomHead,
          this.x - ((pipeHeadWidth - this.width) >> 1),
          currentY
        );
        for (let i = 0; i < count; i++) {
          ctx.drawImage(
            pipeBody,
            this.x,
            currentY + i * pipeHeight + pipeHeadHeight
          );
        }
        const bottomHeadY = currentY + this.height - pipeHeadHeight;
        ctx.drawImage(
          pipeTopHead,
          this.x - ((pipeHeadWidth - this.width) >> 1),
          bottomHeadY
        );
        break;
      }
    }

    if (!isDead) {
      this.movement(pipeHeadWidth, dt);
    }
  }

  private movement(pipeHeadWidth: number, dt: number) {
    const movementStep = this.speed * dt;
    this.x -= movementStep;
    this.pipeRect.x -= movementStep;

    if (this.x < -1 * pipeHeadWidth) {
      this.visible = false;
    }

    if (this.isMoving) {
      const dealtYStep = dt;
      if (this.direction === 1) {
        this.dealtY += dealtYStep;
        if (this.dealtY > MAX_DELTA) {
          this.direction = 0;
        }
      } else {
        this.dealtY -= dealtYStep;
        if (this.dealtY <= 0) {
          this.direction = 1;
        }
      }
      this.pipeRect.y = this.y + this.dealtY;
    }
  }

  public isInFrame(): boolean {
    return this.x + this.width < FRAME_WIDTH;
  }
}

export class GameEngine {
  private assets: GameAssets;
  private onStateChange?: (state: GameState, score: number, bestScore: number) => void;
  private onNewHighScore?: (score: number) => void;

  public gameState: GameState = GameState.GAME_READY;
  public score: number = 0;
  public bestScore: number = 0;
  public isAutopilot: boolean = false;
  private autopilotCooldown: number = 0;

  // Bird properties
  public birdX: number = FRAME_WIDTH >> 2;
  public birdY: number = FRAME_HEIGHT >> 1;
  public birdVelocity: number = 0;
  public birdWingState: number = 0;
  public birdState: BirdState = BirdState.BIRD_NORMAL;
  public birdWidth: number = 34;
  public birdHeight: number = 24;
  public birdCollisionRect: Rectangle = {
    x: (FRAME_WIDTH >> 2) - 17 + RECT_DESCALE,
    y: (FRAME_HEIGHT >> 1) - 12 + RECT_DESCALE * 2,
    width: 34 - RECT_DESCALE * 3,
    height: 34 - RECT_DESCALE * 4,
  };
  private keyFlag: boolean = true;

  // Background properties
  private bgLayerX: number = 0;
  private groundHeight: number = GROUND_HEIGHT;

  // Foreground (Clouds)
  private clouds: CloudObject[] = [];
  private lastCloudTime: number = 0;

  // Pipes
  private pipes: PipeObject[] = [];
  private pipePool: PipeObject[] = [];

  // Track scored pipe pairs to prevent duplicate scores
  private scoredPipes: Set<PipeObject> = new Set();

  constructor(
    assets: GameAssets,
    callbacks?: {
      onStateChange?: (state: GameState, score: number, bestScore: number) => void;
      onNewHighScore?: (score: number) => void;
    }
  ) {
    this.assets = assets;
    this.onStateChange = callbacks?.onStateChange;
    this.onNewHighScore = callbacks?.onNewHighScore;
    this.loadBestScore();
    this.initPipesPool();
    this.reset();
  }

  private loadBestScore() {
    try {
      const saved = localStorage.getItem('flappy_bird_best_score');
      if (saved) {
        this.bestScore = parseInt(saved, 10) || 0;
      }
    } catch {
      this.bestScore = 0;
    }
  }

  private saveBestScore() {
    const prevBest = this.bestScore;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      try {
        localStorage.setItem('flappy_bird_best_score', this.bestScore.toString());
        if (this.onNewHighScore && this.bestScore > prevBest) {
          this.onNewHighScore(this.bestScore);
        }
      } catch {
        // ignore
      }
    }
  }

  private initPipesPool() {
    for (let i = 0; i < 20; i++) {
      this.pipePool.push(new PipeObject(false));
      this.pipePool.push(new PipeObject(true));
    }
  }

  private getPipeFromPool(moving: boolean): PipeObject {
    const pipe = this.pipePool.find((p) => p.isMoving === moving && !p.visible);
    if (pipe) {
      pipe.visible = true;
      return pipe;
    }
    const newPipe = new PipeObject(moving);
    this.pipePool.push(newPipe);
    return newPipe;
  }

  public reset() {
    this.score = 0;
    this.gameState = GameState.GAME_READY;
    this.birdState = BirdState.BIRD_NORMAL;
    this.birdX = FRAME_WIDTH >> 2;
    this.birdY = FRAME_HEIGHT >> 1;
    this.birdVelocity = 0;
    this.birdWingState = 0;
    this.keyFlag = true;
    this.scoredPipes.clear();

    const img = this.assets.birdImages[0]?.[0];
    if (img && img.naturalWidth) {
      this.birdWidth = img.naturalWidth;
      this.birdHeight = img.naturalHeight;
    }

    this.updateBirdCollisionRect();
    this.pipes = [];
    this.notifyState();
  }

  private updateBirdCollisionRect() {
    const rectX = this.birdX - this.birdWidth / 2;
    const rectY = this.birdY - this.birdHeight / 2;
    this.birdCollisionRect.x = rectX + RECT_DESCALE;
    this.birdCollisionRect.y = rectY + RECT_DESCALE * 2;
    this.birdCollisionRect.width = this.birdWidth - RECT_DESCALE * 3;
    this.birdCollisionRect.height = this.birdWidth - RECT_DESCALE * 4;
  }

  public handleInput() {
    switch (this.gameState) {
      case GameState.GAME_READY:
        this.birdFlap();
        this.birdFall();
        this.gameState = GameState.GAME_START;
        this.notifyState();
        break;
      case GameState.GAME_START:
        this.birdFlap();
        this.birdFall();
        break;
      case GameState.STATE_OVER:
        this.reset();
        break;
    }
  }

  public handleKeyUp() {
    this.keyFlag = true;
  }

  public birdFlap() {
    if (!this.keyFlag) return;
    if (this.isBirdDead()) return;

    audioManager.playFly();
    this.birdState = BirdState.BIRD_UP;
    if (this.birdCollisionRect.y > TOP_BAR_HEIGHT) {
      this.birdVelocity = ACC_FLAP;
      this.birdWingState = 0;
    }
    this.keyFlag = false;
  }

  public birdFall() {
    if (this.isBirdDead()) return;
    this.birdState = BirdState.BIRD_FALL;
  }

  private deadBirdFall() {
    this.birdState = BirdState.BIRD_DEAD_FALL;
    audioManager.playCrash();
    this.birdVelocity = 0;
  }

  public isBirdDead(): boolean {
    return this.birdState === BirdState.BIRD_DEAD_FALL || this.birdState === BirdState.BIRD_DEAD;
  }

  private die() {
    this.saveBestScore();
    this.birdState = BirdState.BIRD_DEAD;
    this.gameState = GameState.STATE_OVER;
    this.notifyState();
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange(this.gameState, this.score, this.bestScore);
    }
  }

  // Update & Draw tick
  public tick(ctx: CanvasRenderingContext2D, dt: number = 1.0) {
    if (this.isAutopilot && this.gameState === GameState.GAME_START && !this.isBirdDead()) {
      this.runAutopilot();
    }

    this.drawBackground(ctx, dt);
    this.drawForeground(ctx, dt);

    if (this.gameState !== GameState.GAME_READY) {
      this.drawGameElements(ctx, dt);
    }

    this.drawBird(ctx, dt);
  }

  private runAutopilot() {
    if (this.autopilotCooldown > 0) {
      this.autopilotCooldown--;
      return;
    }

    // Find the next upcoming pipe
    const upcomingPipes = this.pipes.filter((p) => p.visible && p.x + p.width > this.birdX - 10);
    upcomingPipes.sort((a, b) => a.x - b.x);

    let targetY = FRAME_HEIGHT * 0.5;

    if (upcomingPipes.length > 0) {
      const nearestX = upcomingPipes[0].x;
      const nearestGroup = upcomingPipes.filter((p) => Math.abs(p.x - nearestX) < 10);

      const topPipe = nearestGroup.find((p) => p.type === PipeType.TYPE_TOP_NORMAL || p.type === PipeType.TYPE_TOP_HARD);
      const bottomPipe = nearestGroup.find((p) => p.type === PipeType.TYPE_BOTTOM_NORMAL || p.type === PipeType.TYPE_BOTTOM_HARD);
      const hoverPipe = nearestGroup.find((p) => p.type === PipeType.TYPE_HOVER_NORMAL || p.type === PipeType.TYPE_HOVER_HARD);

      if (topPipe && bottomPipe) {
        targetY = (topPipe.y + topPipe.height + bottomPipe.y) / 2;
      } else if (hoverPipe) {
        targetY = hoverPipe.y - 45; // Fly over or under hover pipe
      } else if (topPipe) {
        targetY = topPipe.y + topPipe.height + 60;
      } else if (bottomPipe) {
        targetY = bottomPipe.y - 60;
      }
    }

    // Add slight organic wobble
    const threshold = targetY + 6;

    if ((this.birdY > threshold || this.birdY > FRAME_HEIGHT - this.groundHeight - 40) && this.birdVelocity >= -2) {
      this.keyFlag = true;
      this.birdFlap();
      this.birdFall();
      this.autopilotCooldown = 4 + Math.floor(Math.random() * 3);
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D, dt: number = 1.0) {
    // Sky
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);

    const bgImg = this.assets.background;
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      const imgWidth = bgImg.naturalWidth;
      const imgHeight = bgImg.naturalHeight;
      this.groundHeight = Math.floor(imgHeight / 2);

      const count = Math.floor(FRAME_WIDTH / imgWidth) + 2;
      for (let i = 0; i < count; i++) {
        ctx.drawImage(bgImg, imgWidth * i - this.bgLayerX, FRAME_HEIGHT - imgHeight);
      }

      if (!this.isBirdDead()) {
        this.bgLayerX += GAME_SPEED * dt;
        if (this.bgLayerX > imgWidth) {
          this.bgLayerX -= imgWidth;
        }
      }
    }
  }

  private drawForeground(ctx: CanvasRenderingContext2D, dt: number = 1.0) {
    const now = Date.now();
    if (now - this.lastCloudTime > 100) {
      this.lastCloudTime = now;
      if (this.clouds.length < MAX_CLOUD_COUNT) {
        if (isInProbability(CLOUD_BORN_PERCENT, 100)) {
          const index = getRandomNumber(0, this.assets.cloudImages.length);
          const cloudImg = this.assets.cloudImages[index];
          if (cloudImg) {
            const x = FRAME_WIDTH;
            const y = getRandomNumber(TOP_BAR_HEIGHT, Math.floor(FRAME_HEIGHT / 3));
            this.clouds.push(new CloudObject(cloudImg, x, y));
          }
        }
      }

      // Filter out off-screen clouds
      this.clouds = this.clouds.filter((cloud) => !cloud.isOutFrame());
    }

    const dead = this.isBirdDead();
    for (const cloud of this.clouds) {
      cloud.draw(ctx, dead, dt);
    }
  }

  private drawGameElements(ctx: CanvasRenderingContext2D, dt: number = 1.0) {
    const isDead = this.isBirdDead();

    // Draw active pipes
    for (let i = 0; i < this.pipes.length; i++) {
      const pipe = this.pipes[i];
      if (pipe.visible) {
        pipe.draw(ctx, this.assets, isDead, dt);
      } else {
        this.pipes.splice(i, 1);
        i--;
      }
    }

    // Collision detection
    this.checkCollision();

    // Pipe generation logic
    this.pipeBornLogic();
  }

  private checkCollision() {
    if (this.isBirdDead()) return;

    for (const pipe of this.pipes) {
      if (rectsIntersect(pipe.pipeRect, this.birdCollisionRect)) {
        this.deadBirdFall();
        return;
      }
    }
  }

  private pipeBornLogic() {
    if (this.isBirdDead()) return;

    if (this.pipes.length === 0) {
      const topHeight = getRandomNumber(MIN_HEIGHT, MAX_HEIGHT + 1);
      const top = this.getPipeFromPool(false);
      top.setAttribute(
        FRAME_WIDTH,
        -TOP_PIPE_LENGTHENING,
        topHeight + TOP_PIPE_LENGTHENING,
        PipeType.TYPE_TOP_NORMAL,
        true
      );

      const bottom = this.getPipeFromPool(false);
      bottom.setAttribute(
        FRAME_WIDTH,
        topHeight + VERTICAL_INTERVAL,
        FRAME_HEIGHT - topHeight - VERTICAL_INTERVAL,
        PipeType.TYPE_BOTTOM_NORMAL,
        true
      );

      this.pipes.push(top, bottom);
    } else {
      const lastPipe = this.pipes[this.pipes.length - 1];
      const currentDistance = lastPipe.x - this.birdX + this.birdWidth / 2;
      const SCORE_DISTANCE = PipeObject.prototype.width * 2 + HORIZONTAL_INTERVAL;

      if (lastPipe.isInFrame()) {
        // Scoring logic
        if (!this.scoredPipes.has(lastPipe) && currentDistance <= SCORE_DISTANCE + 52 * 1.5) {
          this.scoredPipes.add(lastPipe);
          this.score++;
          audioManager.playScore();
          this.saveBestScore();
          this.notifyState();
        }

        const currentScore = this.score + 1;
        if (isInProbability(currentScore, 20)) {
          if (isInProbability(1, 4)) {
            this.addMovingHoverPipe(lastPipe);
          } else {
            this.addMovingNormalPipe(lastPipe);
          }
        } else {
          if (isInProbability(1, 2)) {
            this.addNormalPipe(lastPipe);
          } else {
            this.addHoverPipe(lastPipe);
          }
        }
      }
    }
  }

  private addNormalPipe(lastPipe: PipeObject) {
    const topHeight = getRandomNumber(MIN_HEIGHT, MAX_HEIGHT + 1);
    const x = lastPipe.x + HORIZONTAL_INTERVAL;

    const top = this.getPipeFromPool(false);
    top.setAttribute(
      x,
      -TOP_PIPE_LENGTHENING,
      topHeight + TOP_PIPE_LENGTHENING,
      PipeType.TYPE_TOP_NORMAL,
      true
    );

    const bottom = this.getPipeFromPool(false);
    bottom.setAttribute(
      x,
      topHeight + VERTICAL_INTERVAL,
      FRAME_HEIGHT - topHeight - VERTICAL_INTERVAL,
      PipeType.TYPE_BOTTOM_NORMAL,
      true
    );

    this.pipes.push(top, bottom);
  }

  private addHoverPipe(lastPipe: PipeObject) {
    const topHoverHeight = getRandomNumber(Math.floor(FRAME_HEIGHT / 6), Math.floor(FRAME_HEIGHT / 4));
    const x = lastPipe.x + HORIZONTAL_INTERVAL;
    const y = getRandomNumber(Math.floor(FRAME_HEIGHT / 12), Math.floor(FRAME_HEIGHT / 6));

    const topHover = this.getPipeFromPool(false);
    topHover.setAttribute(x, y, topHoverHeight, PipeType.TYPE_HOVER_NORMAL, true);

    const bottomHoverHeight = FRAME_HEIGHT - 2 * y - topHoverHeight - VERTICAL_INTERVAL;
    const bottomHover = this.getPipeFromPool(false);
    bottomHover.setAttribute(
      x,
      y + topHoverHeight + VERTICAL_INTERVAL,
      bottomHoverHeight,
      PipeType.TYPE_HOVER_NORMAL,
      true
    );

    this.pipes.push(topHover, bottomHover);
  }

  private addMovingNormalPipe(lastPipe: PipeObject) {
    const topHeight = getRandomNumber(MIN_HEIGHT, MAX_HEIGHT + 1);
    const x = lastPipe.x + HORIZONTAL_INTERVAL;

    const top = this.getPipeFromPool(true);
    top.setAttribute(
      x,
      -TOP_PIPE_LENGTHENING,
      topHeight + TOP_PIPE_LENGTHENING,
      PipeType.TYPE_TOP_HARD,
      true
    );

    const bottom = this.getPipeFromPool(true);
    bottom.setAttribute(
      x,
      topHeight + VERTICAL_INTERVAL,
      FRAME_HEIGHT - topHeight - VERTICAL_INTERVAL,
      PipeType.TYPE_BOTTOM_HARD,
      true
    );

    this.pipes.push(top, bottom);
  }

  private addMovingHoverPipe(lastPipe: PipeObject) {
    const topHoverHeight = getRandomNumber(Math.floor(FRAME_HEIGHT / 6), Math.floor(FRAME_HEIGHT / 4));
    const x = lastPipe.x + HORIZONTAL_INTERVAL;
    const y = getRandomNumber(Math.floor(FRAME_HEIGHT / 12), Math.floor(FRAME_HEIGHT / 6));

    const topHover = this.getPipeFromPool(true);
    topHover.setAttribute(x, y, topHoverHeight, PipeType.TYPE_HOVER_HARD, true);

    const bottomHoverHeight = FRAME_HEIGHT - 2 * y - topHoverHeight - VERTICAL_INTERVAL;
    const bottomHover = this.getPipeFromPool(true);
    bottomHover.setAttribute(
      x,
      y + topHoverHeight + VERTICAL_INTERVAL,
      bottomHoverHeight,
      PipeType.TYPE_HOVER_HARD,
      true
    );

    this.pipes.push(topHover, bottomHover);
  }

  private drawBird(ctx: CanvasRenderingContext2D, dt: number = 1.0) {
    // Movement calculation
    this.birdMovement(dt);

    const stateIndex = Math.min(this.birdState, BirdState.BIRD_DEAD_FALL);
    const wingIndex = Math.floor(this.birdWingState / 10) % 8;

    let birdImg = this.assets.birdImages[stateIndex]?.[wingIndex];
    if (this.birdVelocity > 0 && this.assets.birdImages[BirdState.BIRD_UP]?.[0]) {
      birdImg = this.assets.birdImages[BirdState.BIRD_UP][0];
    }

    if (birdImg && birdImg.complete && birdImg.naturalWidth > 0) {
      const halfW = birdImg.naturalWidth >> 1;
      const halfH = birdImg.naturalHeight >> 1;
      ctx.drawImage(birdImg, this.birdX - halfW, this.birdY - halfH);
    }

    if (this.birdState === BirdState.BIRD_DEAD) {
      // Clean: let HTML overlay handle the game over screens completely!
    } else if (this.birdState !== BirdState.BIRD_DEAD_FALL && this.gameState === GameState.GAME_START) {
      this.drawScore(ctx);
    }
  }

  private birdMovement(dt: number) {
    this.birdWingState += dt;
    const bottomBoundary = FRAME_HEIGHT - this.groundHeight - this.birdHeight / 2;

    if (this.birdState === BirdState.BIRD_FALL || this.birdState === BirdState.BIRD_DEAD_FALL) {
      if (this.birdVelocity < MAX_VEL_Y) {
        this.birdVelocity -= ACC_Y * dt;
      }
      this.birdY = Math.min(this.birdY - this.birdVelocity * dt, bottomBoundary);
      this.updateBirdCollisionRect();

      if (this.birdCollisionRect.y > bottomBoundary) {
        if (this.birdState === BirdState.BIRD_FALL) {
          audioManager.playCrash();
        }
        this.die();
      }
    }
  }

  private drawScore(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.font = 'bold 36px "Press Start 2P", system-ui, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const str = this.score.toString();
    const x = FRAME_WIDTH >> 1;
    const y = Math.floor(FRAME_HEIGHT / 12);

    ctx.strokeText(str, x, y);
    ctx.fillText(str, x, y);
    ctx.restore();
  }
}
