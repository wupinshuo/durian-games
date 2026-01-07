/**
 * 扫雷游戏类型定义
 */

/** 游戏难度级别 */
export type Difficulty = "beginner" | "intermediate" | "expert" | "custom";

/** 游戏状态 */
export type GameStatus = "idle" | "playing" | "won" | "lost";

/** 单元格状态 */
export type CellState = "hidden" | "revealed" | "flagged" | "questioned";

/** 单元格数据 */
export interface Cell {
  /** 是否是地雷 */
  isMine: boolean;
  /** 相邻地雷数量 */
  neighborMines: number;
  /** 单元格状态 */
  state: CellState;
  /** 行索引 */
  row: number;
  /** 列索引 */
  col: number;
}

/** 游戏配置 */
export interface GameConfig {
  /** 行数 */
  rows: number;
  /** 列数 */
  cols: number;
  /** 地雷数量 */
  mines: number;
  /** 难度级别 */
  difficulty: Difficulty;
}

/** 游戏状态 */
export interface MinesweeperState {
  /** 游戏状态 */
  status: GameStatus;
  /** 游戏板 */
  board: Cell[][];
  /** 游戏配置 */
  config: GameConfig;
  /** 剩余地雷数（显示用） */
  remainingMines: number;
  /** 已标记的地雷数 */
  flaggedMines: number;
  /** 已揭示的安全单元格数 */
  revealedCells: number;
  /** 游戏开始时间 */
  startTime: number | null;
  /** 游戏结束时间 */
  endTime: number | null;
  /** 当前分数 */
  score: number;
}

/** 预定义难度配置 */
export const DIFFICULTY_CONFIGS: Record<
  Exclude<Difficulty, "custom">,
  GameConfig
> = {
  beginner: {
    rows: 9,
    cols: 9,
    mines: 10,
    difficulty: "beginner",
  },
  intermediate: {
    rows: 16,
    cols: 16,
    mines: 40,
    difficulty: "intermediate",
  },
  expert: {
    rows: 16,
    cols: 30,
    mines: 99,
    difficulty: "expert",
  },
};

/** 游戏事件类型 */
export type GameEvent =
  | { type: "cell-reveal"; row: number; col: number }
  | { type: "cell-flag"; row: number; col: number }
  | { type: "cell-question"; row: number; col: number }
  | { type: "game-reset"; config?: GameConfig }
  | { type: "game-start" }
  | { type: "game-end"; status: "won" | "lost" };
