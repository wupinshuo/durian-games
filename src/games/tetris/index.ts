/**
 * 俄罗斯方块游戏模块
 * 整合游戏引擎、渲染器和输入处理器
 */

import { GameModule } from "../../types/game";
import { scoreManager } from "../../lib/score-manager";
import { TetrisEngine } from "./game";
import { TetrisRenderer } from "./renderer";
import { TetrisInputHandler, TetrisInputAction } from "./input";
import { GameConfig, DEFAULT_CONFIG, GameEvent } from "./types";

export class TetrisGame implements GameModule {
  readonly id = "tetris";
  readonly name = "俄罗斯方块";
  readonly description = "经典俄罗斯方块游戏，支持键盘和触摸控制";

  private engine: TetrisEngine | null = null;
  private renderer: TetrisRenderer | null = null;
  private inputHandler: TetrisInputHandler | null = null;
  private gameLoopId: number | null = null;
  private container: HTMLElement | null = null;

  // 游戏配置
  private config: GameConfig = DEFAULT_CONFIG;

  /**
   * 挂载游戏到容器
   */
  mount(container: HTMLElement): void {
    this.container = container;

    // 初始化游戏组件
    this.engine = new TetrisEngine(this.config);
    this.renderer = new TetrisRenderer(container);
    this.inputHandler = new TetrisInputHandler(container);

    // 设置事件监听
    this.setupEventListeners();

    // 开始渲染循环
    this.startRenderLoop();

    // 自动开始游戏
    this.engine.start();
  }

  /**
   * 卸载游戏
   */
  unmount(): void {
    // 停止渲染循环
    this.stopRenderLoop();

    // 销毁组件
    if (this.inputHandler) {
      this.inputHandler.destroy();
      this.inputHandler = null;
    }

    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }

    if (this.engine) {
      this.engine.destroy();
      this.engine = null;
    }

    // 清除容器引用
    this.container = null;
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.engine || !this.inputHandler) return;

    // 监听输入事件
    this.inputHandler.addEventListener(this.handleInput.bind(this));

    // 监听游戏事件
    this.engine.addEventListener(this.handleGameEvent.bind(this));
  }

  /**
   * 处理输入事件
   */
  private handleInput(action: TetrisInputAction): void {
    if (!this.engine) return;

    switch (action) {
      case "move-left":
      case "move-right":
      case "move-down":
      case "rotate":
      case "hard-drop":
        this.engine.handleInput(action);
        break;

      case "pause":
        if (this.engine.getState().status === "playing") {
          this.engine.pause();
        }
        break;

      case "resume":
        if (this.engine.getState().status === "paused") {
          this.engine.resume();
        }
        break;

      case "restart":
        this.engine.restart();
        this.engine.start();
        break;
    }

    // 特殊处理暂停/恢复切换
    if (action === "pause") {
      const state = this.engine.getState();
      if (state.status === "paused") {
        this.engine.resume();
      } else if (state.status === "playing") {
        this.engine.pause();
      }
    }
  }

  /**
   * 处理游戏事件
   */
  private handleGameEvent(event: GameEvent): void {
    // 这里可以添加音效、粒子效果等
    switch (event.type) {
      case "game-start":
        console.log("Tetris game started");
        break;

      case "game-end":
        console.log("Tetris game ended");
        // 保存分数到 ScoreManager
        if (this.engine) {
          const state = this.engine.getState();
          scoreManager.saveScore(this.id, state.score, {
            level: state.level,
            lines: state.lines,
            status: "ended",
          });
        }
        break;

      case "lines-cleared":
        console.log(`Cleared ${event.count} lines`);
        // 可以添加消行动画效果
        break;

      case "level-up":
        console.log(`Level up to ${event.level}`);
        // 可以添加升级效果
        break;
    }
  }

  /**
   * 开始渲染循环
   */
  private startRenderLoop(): void {
    if (this.gameLoopId !== null) return;

    const renderLoop = () => {
      if (this.engine && this.renderer) {
        const state = this.engine.getState();
        const ghostPiece = this.engine.getGhostPosition();
        this.renderer.render(state, ghostPiece);
      }

      this.gameLoopId = requestAnimationFrame(renderLoop);
    };

    this.gameLoopId = requestAnimationFrame(renderLoop);
  }

  /**
   * 停止渲染循环
   */
  private stopRenderLoop(): void {
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  /**
   * 获取当前游戏状态（用于调试）
   */
  getGameState() {
    return this.engine?.getState() || null;
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
   * 设置游戏配置
   */
  setConfig(config: Partial<GameConfig>): void {
    this.config = { ...this.config, ...config };

    // 如果游戏正在运行，需要重新初始化
    if (this.engine && this.container) {
      const wasPlaying = this.engine.getState().status === "playing";
      this.unmount();
      this.mount(this.container);

      if (wasPlaying) {
        this.engine?.start();
      }
    }
  }
}

// 导出游戏实例创建函数
export function createTetrisGame(): TetrisGame {
  return new TetrisGame();
}

// 导出默认实例
const tetrisGame = new TetrisGame();
export default tetrisGame;

// 导出类型
export * from "./types";
export { TetrisEngine } from "./game";
export { TetrisRenderer } from "./renderer";
export { TetrisInputHandler } from "./input";
