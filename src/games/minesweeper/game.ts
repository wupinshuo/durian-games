/**
 * 扫雷游戏核心逻辑
 */

import { MinesweeperStateManager } from "./state";
import { GameConfig, MinesweeperState, DIFFICULTY_CONFIGS } from "./types";

/**
 * 扫雷游戏引擎
 * 处理游戏逻辑和状态管理
 */
export class MinesweeperEngine {
  private stateManager: MinesweeperStateManager;
  private onStateChange?: (state: MinesweeperState) => void;

  constructor(config: GameConfig = DIFFICULTY_CONFIGS.beginner) {
    this.stateManager = new MinesweeperStateManager(config);
  }

  /**
   * 设置状态变化回调
   */
  setStateChangeCallback(callback: (state: MinesweeperState) => void): void {
    this.onStateChange = callback;
    this.stateManager.addListener(callback);
  }

  /**
   * 获取当前游戏状态
   */
  getState(): MinesweeperState {
    return this.stateManager.getState();
  }

  /**
   * 左键点击单元格（揭示）
   */
  leftClick(row: number, col: number): boolean {
    return this.stateManager.revealCell(row, col);
  }

  /**
   * 右键点击单元格（标记/取消标记）
   */
  rightClick(row: number, col: number): boolean {
    return this.stateManager.toggleFlag(row, col);
  }

  /**
   * 重新开始游戏
   */
  restart(config?: GameConfig): void {
    this.stateManager.reset(config);
  }

  /**
   * 改变难度
   */
  changeDifficulty(difficulty: keyof typeof DIFFICULTY_CONFIGS): void {
    const config = DIFFICULTY_CONFIGS[difficulty];
    this.stateManager.reset(config);
  }

  /**
   * 自定义游戏配置
   */
  setCustomConfig(rows: number, cols: number, mines: number): void {
    // 验证配置的合理性
    const maxMines = Math.floor(rows * cols * 0.8); // 最多80%的单元格可以是地雷
    const validMines = Math.min(Math.max(1, mines), maxMines);

    const config: GameConfig = {
      rows: Math.max(5, Math.min(50, rows)), // 限制行数在5-50之间
      cols: Math.max(5, Math.min(50, cols)), // 限制列数在5-50之间
      mines: validMines,
      difficulty: "custom",
    };

    this.stateManager.reset(config);
  }

  /**
   * 获取游戏统计信息
   */
  getGameStats(): {
    totalCells: number;
    revealedCells: number;
    flaggedCells: number;
    remainingCells: number;
    accuracy: number;
    timeElapsed: number;
  } {
    const state = this.getState();
    const totalCells = state.config.rows * state.config.cols;
    const remainingCells =
      totalCells - state.revealedCells - state.flaggedMines;
    const accuracy =
      state.revealedCells > 0
        ? (state.revealedCells / (state.revealedCells + state.flaggedMines)) *
          100
        : 0;

    let timeElapsed = 0;
    if (state.startTime) {
      const endTime = state.endTime || Date.now();
      timeElapsed = Math.floor((endTime - state.startTime) / 1000);
    }

    return {
      totalCells,
      revealedCells: state.revealedCells,
      flaggedCells: state.flaggedMines,
      remainingCells,
      accuracy,
      timeElapsed,
    };
  }

  /**
   * 检查是否可以进行自动揭示
   * 当一个已揭示的数字单元格周围的标记数等于其数字时，可以自动揭示其他邻居
   */
  canAutoReveal(row: number, col: number): boolean {
    const state = this.getState();
    const cell = state.board[row][col];

    if (cell.state !== "revealed" || cell.neighborMines === 0) {
      return false;
    }

    // 计算周围标记的地雷数
    let flaggedCount = 0;
    const { rows, cols } = state.config;

    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
      for (
        let c = Math.max(0, col - 1);
        c <= Math.min(cols - 1, col + 1);
        c++
      ) {
        if (r !== row || c !== col) {
          if (state.board[r][c].state === "flagged") {
            flaggedCount++;
          }
        }
      }
    }

    return flaggedCount === cell.neighborMines;
  }

  /**
   * 自动揭示邻居单元格
   */
  autoRevealNeighbors(row: number, col: number): boolean {
    if (!this.canAutoReveal(row, col)) {
      return false;
    }

    const state = this.getState();
    const { rows, cols } = state.config;
    let revealed = false;

    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
      for (
        let c = Math.max(0, col - 1);
        c <= Math.min(cols - 1, col + 1);
        c++
      ) {
        if (r !== row || c !== col) {
          const neighbor = state.board[r][c];
          if (neighbor.state === "hidden") {
            this.stateManager.revealCell(r, c);
            revealed = true;
          }
        }
      }
    }

    return revealed;
  }

  /**
   * 销毁游戏引擎
   */
  destroy(): void {
    if (this.onStateChange) {
      this.stateManager.removeListener(this.onStateChange);
    }
    this.stateManager.destroy();
  }
}
