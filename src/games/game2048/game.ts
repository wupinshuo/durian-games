/**
 * 2048游戏核心逻辑
 */

import { Game2048StateManager } from "./state";
import { Game2048State, Direction, GameConfig, DEFAULT_CONFIG } from "./types";

/**
 * 2048游戏引擎
 * 处理游戏逻辑和状态管理
 */
export class Game2048Engine {
  private stateManager: Game2048StateManager;
  private onStateChange?: (state: Game2048State) => void;

  constructor(config: GameConfig = DEFAULT_CONFIG) {
    this.stateManager = new Game2048StateManager(config);
  }

  /**
   * 设置状态变化回调
   */
  setStateChangeCallback(callback: (state: Game2048State) => void): void {
    this.onStateChange = callback;
    this.stateManager.addListener(callback);
  }

  /**
   * 获取当前游戏状态
   */
  getState(): Game2048State {
    return this.stateManager.getState();
  }

  /**
   * 开始新游戏
   */
  startNewGame(): void {
    this.stateManager.startNewGame();
  }

  /**
   * 执行移动
   */
  move(direction: Direction): boolean {
    const result = this.stateManager.move(direction);
    return result.moved;
  }

  /**
   * 撤销上一步
   */
  undo(): boolean {
    return this.stateManager.undo();
  }

  /**
   * 重置游戏
   */
  restart(): void {
    this.stateManager.reset();
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.getState().canUndo;
  }

  /**
   * 获取游戏统计信息
   */
  getGameStats(): {
    score: number;
    bestScore: number;
    moveCount: number;
    timeElapsed: number;
    highestTile: number;
    emptyTiles: number;
  } {
    const state = this.getState();

    let timeElapsed = 0;
    if (state.startTime) {
      const endTime = state.endTime || Date.now();
      timeElapsed = Math.floor((endTime - state.startTime) / 1000);
    }

    let highestTile = 0;
    let emptyTiles = 0;

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const value = state.board[row][col].value;
        if (value === 0) {
          emptyTiles++;
        } else if (value > highestTile) {
          highestTile = value;
        }
      }
    }

    return {
      score: state.score,
      bestScore: state.bestScore,
      moveCount: state.moveCount,
      timeElapsed,
      highestTile,
      emptyTiles,
    };
  }

  /**
   * 获取可能的移动方向
   */
  getPossibleMoves(): Direction[] {
    const state = this.getState();
    const possibleMoves: Direction[] = [];

    // 简单检查：如果有空格或相邻相同数字，则所有方向都可能
    // 这里可以优化为更精确的检查
    const directions: Direction[] = ["up", "down", "left", "right"];

    for (const direction of directions) {
      // 创建临时状态管理器来测试移动
      const tempManager = new Game2048StateManager();
      tempManager["state"] = JSON.parse(JSON.stringify(state));

      const result = tempManager.move(direction);
      if (result.moved) {
        possibleMoves.push(direction);
      }
    }

    return possibleMoves;
  }

  /**
   * 检查游戏是否结束
   */
  isGameOver(): boolean {
    const state = this.getState();
    return state.status === "won" || state.status === "lost";
  }

  /**
   * 检查是否获胜
   */
  isWon(): boolean {
    return this.getState().status === "won";
  }

  /**
   * 检查是否失败
   */
  isLost(): boolean {
    return this.getState().status === "lost";
  }

  /**
   * 继续游戏（获胜后继续）
   */
  continueGame(): void {
    const state = this.getState();
    if (state.status === "won") {
      this.stateManager["state"].status = "playing";
      this.onStateChange?.(this.getState());
    }
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
