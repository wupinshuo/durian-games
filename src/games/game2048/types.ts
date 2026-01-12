/**
 * 2048游戏类型定义
 */

/** 游戏状态 */
export type GameStatus = "idle" | "playing" | "won" | "lost";

/** 移动方向 */
export type Direction = "up" | "down" | "left" | "right";

/** 游戏板单元格 */
export interface Cell {
  /** 单元格值，0表示空单元格 */
  value: number;
  /** 行索引 */
  row: number;
  /** 列索引 */
  col: number;
  /** 是否是新生成的单元格 */
  isNew?: boolean;
  /** 是否是合并产生的单元格 */
  isMerged?: boolean;
}

/** 游戏状态 */
export interface Game2048State {
  /** 游戏状态 */
  status: GameStatus;
  /** 游戏板 (4x4) */
  board: Cell[][];
  /** 当前分数 */
  score: number;
  /** 最高分数 */
  bestScore: number;
  /** 游戏开始时间 */
  startTime: number | null;
  /** 游戏结束时间 */
  endTime: number | null;
  /** 是否可以撤销 */
  canUndo: boolean;
  /** 移动次数 */
  moveCount: number;
  /** 当前游戏达到的最高数字 */
  highestTile: number;
  /** 历史最高数字 */
  bestTile: number;
}

/** 游戏历史状态（用于撤销功能） */
export interface GameHistoryState {
  board: Cell[][];
  score: number;
  moveCount: number;
}

/** 移动结果 */
export interface MoveResult {
  /** 是否发生了移动 */
  moved: boolean;
  /** 分数增加 */
  scoreIncrease: number;
  /** 是否达到2048 */
  reached2048: boolean;
}

/** 游戏配置 */
export interface GameConfig {
  /** 游戏板大小 */
  boardSize: number;
  /** 获胜目标 */
  winTarget: number;
  /** 初始单元格数量 */
  initialCells: number;
}

/** 默认游戏配置 */
export const DEFAULT_CONFIG: GameConfig = {
  boardSize: 4,
  winTarget: 2048,
  initialCells: 2,
};

/** 游戏事件类型 */
export type GameEvent =
  | { type: "move"; direction: Direction }
  | { type: "restart" }
  | { type: "undo" }
  | { type: "game-start" }
  | { type: "game-end"; status: "won" | "lost" };
