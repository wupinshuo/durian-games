import { GameScore } from "./game";

/**
 * 平台设置接口
 */
export interface PlatformSettings {
  /** 主题设置 */
  theme: "light" | "dark";
  /** 声音开关 */
  soundEnabled: boolean;
  /** 语言设置 */
  language: "zh" | "en";
}

/**
 * 本地存储数据结构
 */
export interface StorageData {
  /** 游戏分数数据 */
  scores: {
    [gameId: string]: GameScore[];
  };
  /** 平台设置 */
  settings: PlatformSettings;
  /** 游戏状态保存 */
  gameStates: {
    [gameId: string]: any;
  };
}

/**
 * 通用游戏状态基类
 */
export interface BaseGameState {
  /** 游戏状态 */
  status: "idle" | "playing" | "paused" | "finished";
  /** 当前分数 */
  score: number;
  /** 开始时间 */
  startTime: number;
  /** 结束时间 */
  endTime?: number;
}
