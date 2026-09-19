import {
  BG_IMG_PATH,
  BIRDS_IMG_PATH,
  CLOUDS_IMG_PATH,
  PIPE_IMG_PATH,
  TITLE_IMG_PATH,
  NOTICE_IMG_PATH,
  SCORE_IMG_PATH,
  OVER_IMG_PATH,
  AGAIN_IMG_PATH,
} from './constants';

export interface GameAssets {
  background: HTMLImageElement;
  birdImages: HTMLImageElement[][]; // [state][wing]
  cloudImages: HTMLImageElement[];
  pipeImages: HTMLImageElement[];
  title: HTMLImageElement;
  notice: HTMLImageElement;
  score: HTMLImageElement;
  over: HTMLImageElement;
  again: HTMLImageElement;
  isLoaded: boolean;
}

export function loadGameAssets(onProgress?: (percent: number) => void): Promise<GameAssets> {
  return new Promise((resolve) => {
    const assets: GameAssets = {
      background: new Image(),
      birdImages: [[], [], [], []],
      cloudImages: [],
      pipeImages: [],
      title: new Image(),
      notice: new Image(),
      score: new Image(),
      over: new Image(),
      again: new Image(),
      isLoaded: false,
    };

    const imageTasks: { img: HTMLImageElement; src: string }[] = [];

    // Background
    imageTasks.push({ img: assets.background, src: BG_IMG_PATH });

    // Bird states
    for (let state = 0; state < 4; state++) {
      for (let wing = 0; wing < 8; wing++) {
        const img = new Image();
        assets.birdImages[state][wing] = img;
        imageTasks.push({ img, src: BIRDS_IMG_PATH[state][wing] });
      }
    }

    // Clouds
    for (let i = 0; i < CLOUDS_IMG_PATH.length; i++) {
      const img = new Image();
      assets.cloudImages.push(img);
      imageTasks.push({ img, src: CLOUDS_IMG_PATH[i] });
    }

    // Pipes
    for (let i = 0; i < PIPE_IMG_PATH.length; i++) {
      const img = new Image();
      assets.pipeImages.push(img);
      imageTasks.push({ img, src: PIPE_IMG_PATH[i] });
    }

    // UI
    imageTasks.push({ img: assets.title, src: TITLE_IMG_PATH });
    imageTasks.push({ img: assets.notice, src: NOTICE_IMG_PATH });
    imageTasks.push({ img: assets.score, src: SCORE_IMG_PATH });
    imageTasks.push({ img: assets.over, src: OVER_IMG_PATH });
    imageTasks.push({ img: assets.again, src: AGAIN_IMG_PATH });

    let loadedCount = 0;
    const totalCount = imageTasks.length;

    const checkComplete = () => {
      loadedCount++;
      if (onProgress) {
        onProgress(Math.round((loadedCount / totalCount) * 100));
      }
      if (loadedCount >= totalCount) {
        assets.isLoaded = true;
        resolve(assets);
      }
    };

    imageTasks.forEach(task => {
      task.img.onload = checkComplete;
      task.img.onerror = () => {
        console.warn(`Failed to load image: ${task.src}`);
        checkComplete();
      };
      task.img.src = task.src;
    });
  });
}
