/**
 * 俄罗斯方块游戏引擎
 */

import {
  TetrisState,
  TetrisPiece,
  GameConfig,
  DEFAULT_CONFIG,
  GameEvent,
} from "./types";
import {
  createInitialState,
  createPiece,
  getRandomPieceType,
  canPlacePiece,
  placePieceOnBoard,
  clearCompleteLines,
  rotatePiece,
  movePiece,
  calculateScore,
  calculateLevel,
  calculateDropSpeed,
  isGameOver,
  getGhostPosition,
} from "./state";

export class TetrisEngine {
  private state: TetrisState;
  private config: GameConfig;
  private gameLoopId: number | null = null;
  private eventListeners: ((event: GameEvent) => void)[] = [];

  constructor(config: GameConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.state = createInitialState(config);
  }

  /** 获取当前游戏状态 */
  getState(): TetrisState {
    return { ...this.state };
  }

  /** 添加事件监听器 */
  addEventListener(listener: (event: GameEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /** 移除事件监听器 */
  removeEventListener(listener: (event: GameEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /** 触发事件 */
  private emitEvent(event: GameEvent): void {
    this.eventListeners.forEach((listener) => listener(event));
  }

  /** 开始游戏 */
  start(): void {
    if (this.state.status !== "idle") {
      return;
    }

    this.state = {
      ...this.state,
      status: "playing",
      startTime: Date.now(),
      canPause: true,
      lastDropTime: Date.now(),
    };

    // 生成初始方块
    this.spawnNewPiece();
    this.spawnNextPiece();

    // 开始游戏循环
    this.startGameLoop();

    this.emitEvent({ type: "game-start" });
  }

  /** 暂停游戏 */
  pause(): void {
    if (this.state.status === "playing") {
      this.state.status = "paused";
      this.stopGameLoop();
      this.emitEvent({ type: "pause" });
    }
  }

  /** 恢复游戏 */
  resume(): void {
    if (this.state.status === "paused") {
      this.state.status = "playing";
      this.state.lastDropTime = Date.now();
      this.startGameLoop();
      this.emitEvent({ type: "resume" });
    }
  }

  /** 重新开始游戏 */
  restart(): void {
    this.stopGameLoop();
    this.state = createInitialState(this.config);
    this.emitEvent({ type: "restart" });
  }

  /** 处理用户输入 */
  handleInput(
    action: "move-left" | "move-right" | "move-down" | "rotate" | "hard-drop"
  ): void {
    if (this.state.status !== "playing" || !this.state.currentPiece) {
      return;
    }

    switch (action) {
      case "move-left":
        this.movePieceLeft();
        break;
      case "move-right":
        this.movePieceRight();
        break;
      case "move-down":
        this.movePieceDown(true);
        break;
      case "rotate":
        this.rotatePiece();
        break;
      case "hard-drop":
        this.hardDrop();
        break;
    }
  }

  /** 向左移动方块 */
  private movePieceLeft(): void {
    if (!this.state.currentPiece) return;

    const newPiece = movePiece(this.state.currentPiece, -1, 0);
    if (canPlacePiece(this.state.board, newPiece, newPiece.position)) {
      this.state.currentPiece = newPiece;
      this.emitEvent({ type: "move-left" });
    }
  }

  /** 向右移动方块 */
  private movePieceRight(): void {
    if (!this.state.currentPiece) return;

    const newPiece = movePiece(this.state.currentPiece, 1, 0);
    if (canPlacePiece(this.state.board, newPiece, newPiece.position)) {
      this.state.currentPiece = newPiece;
      this.emitEvent({ type: "move-right" });
    }
  }

  /** 向下移动方块 */
  private movePieceDown(isPlayerInput: boolean = false): boolean {
    if (!this.state.currentPiece) return false;

    const newPiece = movePiece(this.state.currentPiece, 0, 1);
    if (canPlacePiece(this.state.board, newPiece, newPiece.position)) {
      this.state.currentPiece = newPiece;

      if (isPlayerInput) {
        this.state.score += calculateScore(0, this.state.level, "soft");
        this.emitEvent({ type: "move-down" });
      }

      return true;
    } else {
      // 方块无法继续下落，放置到游戏板上
      this.placePiece();
      return false;
    }
  }

  /** 旋转方块 */
  private rotatePiece(): void {
    if (!this.state.currentPiece) return;

    const rotatedPiece = rotatePiece(this.state.currentPiece);

    // 尝试基本旋转
    if (canPlacePiece(this.state.board, rotatedPiece, rotatedPiece.position)) {
      this.state.currentPiece = rotatedPiece;
      this.emitEvent({ type: "rotate" });
      return;
    }

    // 尝试墙踢（Wall Kick）
    const kickOffsets = [
      { x: -1, y: 0 }, // 左移
      { x: 1, y: 0 }, // 右移
      { x: 0, y: -1 }, // 上移
      { x: -1, y: -1 }, // 左上移
      { x: 1, y: -1 }, // 右上移
    ];

    for (const offset of kickOffsets) {
      const kickedPosition = {
        x: rotatedPiece.position.x + offset.x,
        y: rotatedPiece.position.y + offset.y,
      };

      if (canPlacePiece(this.state.board, rotatedPiece, kickedPosition)) {
        this.state.currentPiece = {
          ...rotatedPiece,
          position: kickedPosition,
        };
        this.emitEvent({ type: "rotate" });
        return;
      }
    }
  }

  /** 硬下落 */
  private hardDrop(): void {
    if (!this.state.currentPiece) return;

    const ghostPosition = getGhostPosition(
      this.state.board,
      this.state.currentPiece
    );
    const dropDistance = ghostPosition.y - this.state.currentPiece.position.y;

    this.state.currentPiece = {
      ...this.state.currentPiece,
      position: ghostPosition,
    };

    this.state.score +=
      calculateScore(0, this.state.level, "hard") * dropDistance;
    this.placePiece();
    this.emitEvent({ type: "hard-drop" });
  }

  /** 放置方块到游戏板 */
  private placePiece(): void {
    if (!this.state.currentPiece) return;

    // 将方块放置到游戏板
    this.state.board = placePieceOnBoard(
      this.state.board,
      this.state.currentPiece
    );

    // 检查并清除完整的行
    const { newBoard, clearedLines } = clearCompleteLines(this.state.board);
    this.state.board = newBoard;

    if (clearedLines > 0) {
      // 更新分数和行数
      this.state.score += calculateScore(clearedLines, this.state.level);
      this.state.lines += clearedLines;

      // 检查是否升级
      const newLevel = calculateLevel(
        this.state.lines,
        this.config.linesPerLevel
      );
      if (newLevel > this.state.level) {
        this.state.level = newLevel;
        this.state.dropSpeed = calculateDropSpeed(
          this.state.level,
          this.config.initialSpeed,
          this.config.speedIncrease
        );
        this.emitEvent({ type: "level-up", level: this.state.level });
      }

      this.emitEvent({ type: "lines-cleared", count: clearedLines });
    }

    // 生成下一个方块
    this.spawnNewPiece();
    this.spawnNextPiece();
  }

  /** 生成新方块 */
  private spawnNewPiece(): void {
    if (this.state.nextPiece) {
      this.state.currentPiece = this.state.nextPiece;
    } else {
      const pieceType = getRandomPieceType();
      this.state.currentPiece = createPiece(pieceType, this.config.boardWidth);
    }

    // 检查游戏是否结束
    if (
      this.state.currentPiece &&
      isGameOver(this.state.board, this.state.currentPiece)
    ) {
      this.endGame();
    }
  }

  /** 生成下一个方块 */
  private spawnNextPiece(): void {
    const pieceType = getRandomPieceType();
    this.state.nextPiece = createPiece(pieceType, this.config.boardWidth);
  }

  /** 结束游戏 */
  private endGame(): void {
    this.state.status = "lost";
    this.state.endTime = Date.now();
    this.state.canPause = false;
    this.stopGameLoop();
    this.emitEvent({ type: "game-end", status: "lost" });
  }

  /** 开始游戏循环 */
  private startGameLoop(): void {
    if (this.gameLoopId !== null) {
      return;
    }

    const gameLoop = () => {
      if (this.state.status === "playing") {
        const now = Date.now();

        if (now - this.state.lastDropTime >= this.state.dropSpeed) {
          this.movePieceDown();
          this.state.lastDropTime = now;
        }

        this.gameLoopId = requestAnimationFrame(gameLoop);
      }
    };

    this.gameLoopId = requestAnimationFrame(gameLoop);
  }

  /** 停止游戏循环 */
  private stopGameLoop(): void {
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  /** 销毁游戏引擎 */
  destroy(): void {
    this.stopGameLoop();
    this.eventListeners = [];
  }

  /** 获取幽灵方块位置 */
  getGhostPosition(): TetrisPiece | null {
    if (!this.state.currentPiece) return null;

    const ghostPosition = getGhostPosition(
      this.state.board,
      this.state.currentPiece
    );
    return {
      ...this.state.currentPiece,
      position: ghostPosition,
    };
  }
}
