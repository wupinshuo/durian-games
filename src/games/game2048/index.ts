/**
 * 2048游戏模块
 * 实现GameModule接口，集成到游戏平台
 */

import { GameModule } from "@/types/game";
import { scoreManager } from "@/lib/score-manager";
import { Game2048Engine } from "./game";
import { Game2048Renderer } from "./renderer";
import { Game2048InputHandler } from "./input";
import { Game2048State, Direction } from "./types";

/**
 * 2048游戏模块
 */
export class Game2048 implements GameModule {
  id = "game2048";
  name = "2048";
  description = "经典2048数字合并游戏，通过滑动合并相同数字达到2048";

  private engine: Game2048Engine | null = null;
  private renderer: Game2048Renderer | null = null;
  private inputHandler: Game2048InputHandler | null = null;
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
    this.engine = new Game2048Engine();

    // 创建渲染器
    this.renderer = new Game2048Renderer(this.container);

    // 创建输入处理器
    this.inputHandler = new Game2048InputHandler(this.container);

    // 设置游戏引擎状态变化回调
    this.engine.setStateChangeCallback((state: Game2048State) => {
      this.renderer?.render(state);
      this.handleGameStateChange(state);
    });

    // 设置输入事件处理
    this.setupInputHandlers();

    // 开始新游戏
    this.engine.startNewGame();
  }

  /**
   * 设置输入事件处理
   */
  private setupInputHandlers(): void {
    if (!this.inputHandler || !this.engine) return;

    // 移动事件
    this.inputHandler.onMove = (direction: Direction) => {
      this.engine?.move(direction);
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
  private handleGameStateChange(state: Game2048State): void {
    // 游戏结束时的处理
    if (state.status === "won" || state.status === "lost") {
      this.handleGameEnd(state);
    }
  }

  /**
   * 处理游戏结束
   */
  private handleGameEnd(state: Game2048State): void {
    if (state.status === "won") {
      console.log(`游戏胜利！分数: ${state.score}`);

      // 保存分数到分数管理系统
      scoreManager.saveScore(this.id, state.score, {
        bestTile: state.bestTile,
        moveCount: state.moveCount,
        status: "won",
      });
    } else if (state.status === "lost") {
      console.log(`游戏结束！最终分数: ${state.score}`);

      // 保存分数到分数管理系统
      scoreManager.saveScore(this.id, state.score, {
        bestTile: state.bestTile,
        moveCount: state.moveCount,
        status: "lost",
      });
    }
  }

  /**
   * 获取当前游戏状态（用于调试）
   */
  getGameState(): Game2048State | null {
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
const game2048 = new Game2048();
export default game2048;
