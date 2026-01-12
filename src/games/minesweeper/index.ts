/**
 * 扫雷游戏模块
 * 实现GameModule接口，集成到游戏平台
 */

import { GameModule } from "@/types/game";
import { scoreManager } from "@/lib/score-manager";
import { MinesweeperEngine } from "./game";
import { MinesweeperRenderer } from "./renderer";
import { MinesweeperInputHandler } from "./input";
import { MinesweeperState, DIFFICULTY_CONFIGS } from "./types";

/**
 * 扫雷游戏模块
 */
export class MinesweeperGame implements GameModule {
  id = "minesweeper";
  name = "扫雷";
  description = "经典扫雷游戏，找出所有地雷而不触雷";

  private engine: MinesweeperEngine | null = null;
  private renderer: MinesweeperRenderer | null = null;
  private inputHandler: MinesweeperInputHandler | null = null;
  private container: HTMLElement | null = null;
  private isRunning = false;

  /**
   * 挂载游戏到容器
   */
  mount(container: HTMLElement): void {
    if (this.isRunning) {
      this.unmount();
    }

    this.container = container;
    this.initializeGame();
    this.isRunning = true;
  }

  /**
   * 卸载游戏并清理资源
   */
  unmount(): void {
    if (!this.isRunning) return;

    this.cleanup();
    this.isRunning = false;
  }

  /**
   * 初始化游戏组件
   */
  private initializeGame(): void {
    if (!this.container) return;

    // 创建游戏引擎
    this.engine = new MinesweeperEngine(DIFFICULTY_CONFIGS.beginner);

    // 创建渲染器
    this.renderer = new MinesweeperRenderer(this.container);

    // 创建输入处理器
    this.inputHandler = new MinesweeperInputHandler(this.container);

    // 设置游戏引擎状态变化回调
    this.engine.setStateChangeCallback((state: MinesweeperState) => {
      this.renderer?.render(state);
      this.handleGameStateChange(state);
    });

    // 设置输入事件处理
    this.setupInputHandlers();

    // 初始渲染
    this.renderer.render(this.engine.getState());
  }

  /**
   * 设置输入事件处理
   */
  private setupInputHandlers(): void {
    if (!this.inputHandler || !this.engine) return;

    // 左键点击事件
    this.inputHandler.onLeftClick = (row: number, col: number) => {
      this.engine?.leftClick(row, col);
    };

    // 右键点击事件
    this.inputHandler.onRightClick = (row: number, col: number) => {
      this.engine?.rightClick(row, col);
    };

    // 中键点击事件（自动揭示）
    this.inputHandler.onMiddleClick = (row: number, col: number) => {
      this.engine?.autoRevealNeighbors(row, col);
    };

    // 重新开始游戏
    this.inputHandler.onRestart = () => {
      this.engine?.restart();
    };

    // 改变难度
    this.inputHandler.onDifficultyChange = (
      difficulty: keyof typeof DIFFICULTY_CONFIGS
    ) => {
      this.engine?.changeDifficulty(difficulty);
    };

    // 自定义配置
    this.inputHandler.onCustomConfig = (
      rows: number,
      cols: number,
      mines: number
    ) => {
      this.engine?.setCustomConfig(rows, cols, mines);
    };

    // 监听窗口大小变化事件
    this.container?.addEventListener(
      "game-resize",
      this.handleResize.bind(this)
    );
  }

  /**
   * 处理游戏状态变化
   */
  private handleGameStateChange(state: MinesweeperState): void {
    // 游戏结束时的处理
    if (state.status === "won" || state.status === "lost") {
      this.handleGameEnd(state);
    }
  }

  /**
   * 处理游戏结束
   */
  private handleGameEnd(state: MinesweeperState): void {
    if (state.status === "won") {
      console.log(`游戏胜利！分数: ${state.score}`);

      // 保存分数到分数管理系统
      scoreManager.saveScore(this.id, state.score, {
        difficulty: state.config.difficulty,
        timeElapsed:
          state.endTime && state.startTime
            ? state.endTime - state.startTime
            : 0,
        mineCount: state.config.mines,
        boardSize: `${state.config.rows}x${state.config.cols}`,
        status: "won",
      });
    } else if (state.status === "lost") {
      console.log("游戏失败！");

      // 即使失败也记录分数（为0分）
      scoreManager.saveScore(this.id, 0, {
        difficulty: state.config.difficulty,
        timeElapsed:
          state.endTime && state.startTime
            ? state.endTime - state.startTime
            : 0,
        mineCount: state.config.mines,
        boardSize: `${state.config.rows}x${state.config.cols}`,
        status: "lost",
      });
    }
  }

  /**
   * 获取当前游戏状态（用于调试）
   */
  getGameState(): MinesweeperState | null {
    return this.engine?.getState() || null;
  }

  /**
   * 获取游戏统计信息（用于调试）
   */
  getGameStats() {
    return this.engine?.getGameStats() || null;
  }

  /**
   * 获取当前最高分
   */
  getHighScore() {
    return scoreManager.getHighScore(this.id);
  }

  /**
   * 获取所有分数记录
   */
  getAllScores() {
    return scoreManager.getAllScores(this.id);
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    if (this.renderer && this.engine) {
      // 重新渲染以适应新的窗口大小
      this.renderer.render(this.engine.getState());
    }
  }

  /**
   * 清理所有资源
   */
  private cleanup(): void {
    // 移除事件监听器
    this.container?.removeEventListener(
      "game-resize",
      this.handleResize.bind(this)
    );

    // 销毁输入处理器
    if (this.inputHandler) {
      this.inputHandler.destroy();
      this.inputHandler = null;
    }

    // 销毁渲染器
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }

    // 销毁游戏引擎
    if (this.engine) {
      this.engine.destroy();
      this.engine = null;
    }

    // 清理容器
    if (this.container) {
      this.container.innerHTML = "";
      this.container = null;
    }
  }
}

// 导出游戏实例
const minesweeperGame = new MinesweeperGame();
export default minesweeperGame;
