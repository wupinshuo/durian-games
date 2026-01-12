/**
 * 俄罗斯方块游戏类型定义
 */

/** 游戏状态 */
export type GameStatus = "idle" | "playing" | "paused" | "lost";

/** 方块类型 */
export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

/** 方块颜色 */
export const PIECE_COLORS: Record<PieceType, string> = {
  I: "#00f0f0", // 青色
  O: "#f0f000", // 黄色
  T: "#a000f0", // 紫色
  S: "#00f000", // 绿色
  Z: "#f00000", // 红色
  J: "#0000f0", // 蓝色
  L: "#f0a000", // 橙色
};

/** 方块形状定义 */
export const PIECE_SHAPES: Record<PieceType, number[][][]> = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
};

/** 方块位置 */
export interface Position {
  x: number;
  y: number;
}

/** 方块数据 */
export interface TetrisPiece {
  /** 方块类型 */
  type: PieceType;
  /** 当前位置 */
  position: Position;
  /** 当前旋转状态 */
  rotation: number;
  /** 方块形状 */
  shape: number[][];
}

/** 游戏配置 */
export interface GameConfig {
  /** 游戏板宽度 */
  boardWidth: number;
  /** 游戏板高度 */
  boardHeight: number;
  /** 初始下落速度（毫秒） */
  initialSpeed: number;
  /** 速度增加率 */
  speedIncrease: number;
  /** 每级需要的行数 */
  linesPerLevel: number;
}

/** 游戏状态 */
export interface TetrisState {
  /** 游戏状态 */
  status: GameStatus;
  /** 游戏板 */
  board: (PieceType | null)[][];
  /** 当前方块 */
  currentPiece: TetrisPiece | null;
  /** 下一个方块 */
  nextPiece: TetrisPiece | null;
  /** 当前分数 */
  score: number;
  /** 当前等级 */
  level: number;
  /** 已消除的行数 */
  lines: number;
  /** 游戏开始时间 */
  startTime: number | null;
  /** 游戏结束时间 */
  endTime: number | null;
  /** 当前下落速度 */
  dropSpeed: number;
  /** 上次下落时间 */
  lastDropTime: number;
  /** 是否可以暂停 */
  canPause: boolean;
}

/** 默认游戏配置 */
export const DEFAULT_CONFIG: GameConfig = {
  boardWidth: 10,
  boardHeight: 20,
  initialSpeed: 1000, // 1秒
  speedIncrease: 0.9, // 每级速度增加10%
  linesPerLevel: 10,
};

/** 分数计算 */
export const SCORE_VALUES = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
};

/** 游戏事件类型 */
export type GameEvent =
  | { type: "move-left" }
  | { type: "move-right" }
  | { type: "move-down" }
  | { type: "rotate" }
  | { type: "hard-drop" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "restart" }
  | { type: "game-start" }
  | { type: "game-end"; status: "lost" }
  | { type: "lines-cleared"; count: number }
  | { type: "level-up"; level: number };
