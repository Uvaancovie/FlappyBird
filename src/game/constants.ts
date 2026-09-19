export const FRAME_WIDTH = 420;
export const FRAME_HEIGHT = 640;

export const GAME_TITLE = "Flappy Bird";

// Image asset paths
export const BG_IMG_PATH = "/resources/img/background.png";

export const BIRDS_IMG_PATH = [
  [
    "/resources/img/0.png",
    "/resources/img/1.png",
    "/resources/img/2.png",
    "/resources/img/3.png",
    "/resources/img/4.png",
    "/resources/img/5.png",
    "/resources/img/6.png",
    "/resources/img/7.png",
  ],
  [
    "/resources/img/up.png",
    "/resources/img/up.png",
    "/resources/img/up.png",
    "/resources/img/up.png",
    "/resources/img/up.png",
    "/resources/img/up.png",
    "/resources/img/up.png",
    "/resources/img/up.png",
  ],
  [
    "/resources/img/down_0.png",
    "/resources/img/down_1.png",
    "/resources/img/down_2.png",
    "/resources/img/down_3.png",
    "/resources/img/down_4.png",
    "/resources/img/down_5.png",
    "/resources/img/down_6.png",
    "/resources/img/down_7.png",
  ],
  [
    "/resources/img/dead.png",
    "/resources/img/dead.png",
    "/resources/img/dead.png",
    "/resources/img/dead.png",
    "/resources/img/dead.png",
    "/resources/img/dead.png",
    "/resources/img/dead.png",
    "/resources/img/dead.png",
  ],
];

export const CLOUDS_IMG_PATH = [
  "/resources/img/cloud_0.png",
  "/resources/img/cloud_1.png",
];

export const PIPE_IMG_PATH = [
  "/resources/img/pipe.png",
  "/resources/img/pipe_top.png",
  "/resources/img/pipe_bottom.png",
];

export const TITLE_IMG_PATH = "/resources/img/title.png";
export const NOTICE_IMG_PATH = "/resources/img/start.png";
export const SCORE_IMG_PATH = "/resources/img/score.png";
export const OVER_IMG_PATH = "/resources/img/over.png";
export const AGAIN_IMG_PATH = "/resources/img/again.png";

// Sound paths
export const SOUND_FLY_PATH = "/resources/wav/fly.wav";
export const SOUND_CRASH_PATH = "/resources/wav/crash.wav";
export const SOUND_SCORE_PATH = "/resources/wav/score.wav";

// Physics & speed constants
export const GAME_SPEED = 4;
export const BG_COLOR = "#4bc4cf";
export const FPS = 30;

export const TOP_BAR_HEIGHT = 20;
export const GROUND_HEIGHT = 35;
export const TOP_PIPE_LENGTHENING = 100;

export const CLOUD_BORN_PERCENT = 6;
export const CLOUD_IMAGE_COUNT = 2;
export const MAX_CLOUD_COUNT = 7;

export const ACC_FLAP = 14;
export const ACC_Y = 2;
export const MAX_VEL_Y = 15;
export const RECT_DESCALE = 2;

export const VERTICAL_INTERVAL = Math.floor(FRAME_HEIGHT / 5); // 128
export const HORIZONTAL_INTERVAL = FRAME_HEIGHT >> 2; // 160
export const MIN_HEIGHT = FRAME_HEIGHT >> 3; // 80
export const MAX_HEIGHT = ((FRAME_HEIGHT >> 3) * 5); // 400
export const MAX_DELTA = 50;
