/**
 * 俄罗斯方块游戏渲染器
 * 处理游戏界面渲染和动画效果
 */

import { TetrisState, TetrisPiece, PieceType, PIECE_COLORS } from "./types";

/**
 * 俄罗斯方块游戏渲染器
 */
export class TetrisRenderer {
  private container: HTMLElement;
  private gameContainer: HTMLElement | null = null;
  private gameBoard: HTMLCanvasElement | null = null;
  private nextPieceCanvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private nextCtx: CanvasRenderingContext2D | null = null;
  private gameOverlay: HTMLElement | null = null;
  private scoreContainer: HTMLElement | null = null;

  // 渲染配置
  private readonly CELL_SIZE = 30;
  private readonly BORDER_WIDTH = 1;
  private readonly BOARD_PADDING = 10;

  constructor(container: HTMLElement) {
    this.container = container;
    this.createGameStructure();
    this.setupStyles();
    this.setupCanvas();

    // 监听窗口大小变化
    window.addEventListener("resize", this.handleWindowResize.bind(this));
  }

  /**
   * 处理窗口大小变化
   */
  private handleWindowResize(): void {
    setTimeout(() => {
      this.setupCanvas();
    }, 100);
  }

  /**
   * 创建游戏结构
   */
  private createGameStructure(): void {
    this.container.innerHTML = "";
    this.container.className = "tetris-container";

    // 创建主游戏容器
    this.gameContainer = document.createElement("div");
    this.gameContainer.className = "tetris-main";

    // 创建标题和分数区域
    const headerContainer = document.createElement("div");
    headerContainer.className = "tetris-header";

    const title = document.createElement("h1");
    title.className = "tetris-title";
    title.textContent = "俄罗斯方块";

    this.scoreContainer = document.createElement("div");
    this.scoreContainer.className = "tetris-scores";

    headerContainer.appendChild(title);
    headerContainer.appendChild(this.scoreContainer);

    // 创建游戏区域
    const gameArea = document.createElement("div");
    gameArea.className = "tetris-game-area";

    // 创建游戏板
    this.gameBoard = document.createElement("canvas");
    this.gameBoard.className = "tetris-board";

    // 创建侧边栏
    const sidebar = document.createElement("div");
    sidebar.className = "tetris-sidebar";

    // 下一个方块预览
    const nextContainer = document.createElement("div");
    nextContainer.className = "tetris-next-container";

    const nextLabel = document.createElement("div");
    nextLabel.className = "tetris-next-label";
    nextLabel.textContent = "下一个";

    this.nextPieceCanvas = document.createElement("canvas");
    this.nextPieceCanvas.className = "tetris-next-piece";
    this.nextPieceCanvas.width = 120;
    this.nextPieceCanvas.height = 120;

    nextContainer.appendChild(nextLabel);
    nextContainer.appendChild(this.nextPieceCanvas);

    // 控制说明
    const controls = document.createElement("div");
    controls.className = "tetris-controls";
    controls.innerHTML = `
      <div class="tetris-controls-title">控制</div>
      <div class="tetris-control-item">
        <span class="tetris-key">←→</span>
        <span class="tetris-action">移动</span>
      </div>
      <div class="tetris-control-item">
        <span class="tetris-key">↓</span>
        <span class="tetris-action">软下落</span>
      </div>
      <div class="tetris-control-item">
        <span class="tetris-key">↑</span>
        <span class="tetris-action">旋转</span>
      </div>
      <div class="tetris-control-item">
        <span class="tetris-key">空格</span>
        <span class="tetris-action">硬下落</span>
      </div>
      <div class="tetris-control-item">
        <span class="tetris-key">P</span>
        <span class="tetris-action">暂停</span>
      </div>
    `;

    sidebar.appendChild(nextContainer);
    sidebar.appendChild(controls);

    gameArea.appendChild(this.gameBoard);
    gameArea.appendChild(sidebar);

    // 创建游戏结束覆盖层
    this.gameOverlay = document.createElement("div");
    this.gameOverlay.className = "tetris-overlay";
    this.gameOverlay.style.display = "none";

    // 组装结构
    this.gameContainer.appendChild(headerContainer);
    this.gameContainer.appendChild(gameArea);
    this.gameContainer.appendChild(this.gameOverlay);

    this.container.appendChild(this.gameContainer);
  }

  /**
   * 设置画布
   */
  private setupCanvas(): void {
    if (!this.gameBoard) return;

    const boardWidth = 10;
    const boardHeight = 20;

    // 计算画布大小
    const canvasWidth =
      boardWidth * this.CELL_SIZE + (boardWidth + 1) * this.BORDER_WIDTH;
    const canvasHeight =
      boardHeight * this.CELL_SIZE + (boardHeight + 1) * this.BORDER_WIDTH;

    this.gameBoard.width = canvasWidth;
    this.gameBoard.height = canvasHeight;

    this.ctx = this.gameBoard.getContext("2d");
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }

    // 设置下一个方块画布
    if (this.nextPieceCanvas) {
      this.nextCtx = this.nextPieceCanvas.getContext("2d");
      if (this.nextCtx) {
        this.nextCtx.imageSmoothingEnabled = false;
      }
    }
  }

  /**
   * 渲染游戏状态
   */
  render(state: TetrisState, ghostPiece?: TetrisPiece | null): void {
    this.renderScores(state);
    this.renderBoard(state, ghostPiece);
    this.renderNextPiece(state.nextPiece);
    this.renderGameStatus(state);
  }

  /**
   * 渲染分数信息
   */
  private renderScores(state: TetrisState): void {
    if (!this.scoreContainer) return;

    this.scoreContainer.innerHTML = `
      <div class="tetris-score">
        <div class="tetris-score-label">分数</div>
        <div class="tetris-score-value">${state.score.toLocaleString()}</div>
      </div>
      <div class="tetris-score">
        <div class="tetris-score-label">等级</div>
        <div class="tetris-score-value">${state.level}</div>
      </div>
      <div class="tetris-score">
        <div class="tetris-score-label">行数</div>
        <div class="tetris-score-value">${state.lines}</div>
      </div>
    `;
  }

  /**
   * 渲染游戏板
   */
  private renderBoard(
    state: TetrisState,
    ghostPiece?: TetrisPiece | null
  ): void {
    if (!this.ctx || !this.gameBoard) return;

    const { board, currentPiece } = state;

    // 清除画布
    this.ctx.clearRect(0, 0, this.gameBoard.width, this.gameBoard.height);

    // 绘制背景网格
    this.drawGrid();

    // 绘制已放置的方块
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cellType = board[row][col];
        if (cellType) {
          this.drawCell(col, row, PIECE_COLORS[cellType], false);
        }
      }
    }

    // 绘制幽灵方块（硬下落预览）
    if (
      ghostPiece &&
      currentPiece &&
      ghostPiece.position.y !== currentPiece.position.y
    ) {
      this.drawPiece(ghostPiece, true);
    }

    // 绘制当前方块
    if (currentPiece) {
      this.drawPiece(currentPiece, false);
    }
  }

  /**
   * 绘制网格
   */
  private drawGrid(): void {
    if (!this.ctx || !this.gameBoard) return;

    this.ctx.strokeStyle = "#333";
    this.ctx.lineWidth = this.BORDER_WIDTH;

    const boardWidth = 10;
    const boardHeight = 20;

    // 绘制垂直线
    for (let col = 0; col <= boardWidth; col++) {
      const x =
        col * (this.CELL_SIZE + this.BORDER_WIDTH) + this.BORDER_WIDTH / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.gameBoard.height);
      this.ctx.stroke();
    }

    // 绘制水平线
    for (let row = 0; row <= boardHeight; row++) {
      const y =
        row * (this.CELL_SIZE + this.BORDER_WIDTH) + this.BORDER_WIDTH / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.gameBoard.width, y);
      this.ctx.stroke();
    }
  }

  /**
   * 绘制单个单元格
   */
  private drawCell(
    col: number,
    row: number,
    color: string,
    isGhost: boolean
  ): void {
    if (!this.ctx) return;

    const x = col * (this.CELL_SIZE + this.BORDER_WIDTH) + this.BORDER_WIDTH;
    const y = row * (this.CELL_SIZE + this.BORDER_WIDTH) + this.BORDER_WIDTH;

    if (isGhost) {
      // 幽灵方块使用透明效果
      this.ctx.fillStyle = color + "40"; // 添加透明度
      this.ctx.fillRect(x, y, this.CELL_SIZE, this.CELL_SIZE);

      // 绘制边框
      this.ctx.strokeStyle = color + "80";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, this.CELL_SIZE, this.CELL_SIZE);
    } else {
      // 普通方块
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, this.CELL_SIZE, this.CELL_SIZE);

      // 添加高光效果
      const gradient = this.ctx.createLinearGradient(
        x,
        y,
        x + this.CELL_SIZE,
        y + this.CELL_SIZE
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.3)");
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, this.CELL_SIZE, this.CELL_SIZE);

      // 绘制边框
      this.ctx.strokeStyle = "#000";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, this.CELL_SIZE, this.CELL_SIZE);
    }
  }

  /**
   * 绘制方块
   */
  private drawPiece(piece: TetrisPiece, isGhost: boolean): void {
    const { shape, position, type } = piece;
    const color = PIECE_COLORS[type];

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 1) {
          const boardX = position.x + col;
          const boardY = position.y + row;

          // 只绘制在游戏板范围内的部分
          if (boardX >= 0 && boardX < 10 && boardY >= 0 && boardY < 20) {
            this.drawCell(boardX, boardY, color, isGhost);
          }
        }
      }
    }
  }

  /**
   * 渲染下一个方块
   */
  private renderNextPiece(nextPiece: TetrisPiece | null): void {
    if (!this.nextCtx || !this.nextPieceCanvas || !nextPiece) return;

    // 清除画布
    this.nextCtx.clearRect(
      0,
      0,
      this.nextPieceCanvas.width,
      this.nextPieceCanvas.height
    );

    const { shape, type } = nextPiece;
    const color = PIECE_COLORS[type];
    const cellSize = 20;

    // 计算居中位置
    const shapeWidth = shape[0].length * cellSize;
    const shapeHeight = shape.length * cellSize;
    const offsetX = (this.nextPieceCanvas.width - shapeWidth) / 2;
    const offsetY = (this.nextPieceCanvas.height - shapeHeight) / 2;

    // 绘制方块
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 1) {
          const x = offsetX + col * cellSize;
          const y = offsetY + row * cellSize;

          // 绘制方块
          this.nextCtx.fillStyle = color;
          this.nextCtx.fillRect(x, y, cellSize, cellSize);

          // 添加高光效果
          const gradient = this.nextCtx.createLinearGradient(
            x,
            y,
            x + cellSize,
            y + cellSize
          );
          gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
          gradient.addColorStop(1, "rgba(0, 0, 0, 0.3)");
          this.nextCtx.fillStyle = gradient;
          this.nextCtx.fillRect(x, y, cellSize, cellSize);

          // 绘制边框
          this.nextCtx.strokeStyle = "#000";
          this.nextCtx.lineWidth = 1;
          this.nextCtx.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }
  }

  /**
   * 渲染游戏状态（暂停/结束覆盖层）
   */
  private renderGameStatus(state: TetrisState): void {
    if (!this.gameOverlay) return;

    if (state.status === "paused") {
      this.gameOverlay.innerHTML = `
        <div class="tetris-overlay-content">
          <h2 class="tetris-overlay-title">游戏暂停</h2>
          <p class="tetris-overlay-message">按 P 键继续游戏</p>
        </div>
      `;
      this.gameOverlay.style.display = "flex";
    } else if (state.status === "lost") {
      this.gameOverlay.innerHTML = `
        <div class="tetris-overlay-content">
          <h2 class="tetris-overlay-title lost">游戏结束</h2>
          <p class="tetris-overlay-score">
            最终分数: ${state.score.toLocaleString()}
          </p>
          <p class="tetris-overlay-score">
            等级: ${state.level} | 行数: ${state.lines}
          </p>
        </div>
      `;
      this.gameOverlay.style.display = "flex";
    } else {
      this.gameOverlay.style.display = "none";
    }
  }

  /**
   * 设置样式
   */
  private setupStyles(): void {
    const style = document.createElement("style");
    style.textContent = `
      .tetris-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: #1a1a1a;
        border-radius: 10px;
        color: #fff;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }

      .tetris-main {
        position: relative;
      }

      .tetris-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 15px;
      }

      .tetris-title {
        font-size: 36px;
        font-weight: bold;
        color: #fff;
        margin: 0;
        flex-shrink: 0;
      }

      .tetris-scores {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }

      .tetris-score {
        background: #333;
        padding: 10px 15px;
        border-radius: 8px;
        text-align: center;
        min-width: 80px;
      }

      .tetris-score-label {
        font-size: 12px;
        color: #aaa;
        text-transform: uppercase;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .tetris-score-value {
        font-size: 20px;
        color: #fff;
        font-weight: bold;
      }

      .tetris-game-area {
        display: flex;
        gap: 20px;
        align-items: flex-start;
      }

      .tetris-board {
        background: #000;
        border: 2px solid #333;
        border-radius: 8px;
        flex-shrink: 0;
      }

      .tetris-sidebar {
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-width: 150px;
      }

      .tetris-next-container {
        background: #333;
        padding: 15px;
        border-radius: 8px;
        text-align: center;
      }

      .tetris-next-label {
        font-size: 14px;
        color: #aaa;
        text-transform: uppercase;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .tetris-next-piece {
        background: #000;
        border: 1px solid #555;
        border-radius: 4px;
      }

      .tetris-controls {
        background: #333;
        padding: 15px;
        border-radius: 8px;
      }

      .tetris-controls-title {
        font-size: 14px;
        color: #aaa;
        text-transform: uppercase;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .tetris-control-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 12px;
      }

      .tetris-control-item:last-child {
        margin-bottom: 0;
      }

      .tetris-key {
        background: #555;
        color: #fff;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
        font-size: 11px;
        font-weight: bold;
      }

      .tetris-action {
        color: #ccc;
      }

      .tetris-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        z-index: 100;
      }

      .tetris-overlay-content {
        text-align: center;
        padding: 40px;
        background: #333;
        border-radius: 10px;
        border: 2px solid #555;
      }

      .tetris-overlay-title {
        font-size: 32px;
        font-weight: bold;
        margin: 0 0 20px 0;
        color: #fff;
      }

      .tetris-overlay-title.lost {
        color: #ff6b6b;
      }

      .tetris-overlay-message {
        font-size: 16px;
        color: #ccc;
        margin: 0;
      }

      .tetris-overlay-score {
        font-size: 16px;
        color: #ccc;
        margin: 0 0 10px 0;
      }

      .tetris-overlay-score:last-child {
        margin-bottom: 0;
      }

      /* 移动端适配 */
      @media (max-width: 768px) {
        .tetris-container {
          padding: 15px;
          max-width: 100%;
        }

        .tetris-header {
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .tetris-title {
          font-size: 28px;
        }

        .tetris-scores {
          justify-content: center;
          gap: 10px;
        }

        .tetris-score {
          padding: 8px 12px;
          min-width: 70px;
        }

        .tetris-score-value {
          font-size: 16px;
        }

        .tetris-game-area {
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .tetris-sidebar {
          flex-direction: row;
          justify-content: center;
          gap: 15px;
          width: 100%;
        }

        .tetris-next-container,
        .tetris-controls {
          flex: 1;
          max-width: 200px;
        }

        .tetris-overlay-title {
          font-size: 24px;
        }

        .tetris-overlay-content {
          padding: 30px 20px;
          margin: 0 20px;
        }
      }

      @media (max-width: 480px) {
        .tetris-container {
          padding: 10px;
        }

        .tetris-title {
          font-size: 24px;
        }

        .tetris-scores {
          gap: 8px;
        }

        .tetris-score {
          padding: 6px 10px;
          min-width: 60px;
        }

        .tetris-score-value {
          font-size: 14px;
        }

        .tetris-sidebar {
          flex-direction: column;
          gap: 10px;
        }

        .tetris-next-container,
        .tetris-controls {
          max-width: none;
        }

        .tetris-overlay-title {
          font-size: 20px;
        }

        .tetris-overlay-content {
          padding: 20px 15px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    // 移除窗口大小变化监听器
    window.removeEventListener("resize", this.handleWindowResize.bind(this));

    if (this.container) {
      this.container.innerHTML = "";
    }

    // 清除引用
    this.gameContainer = null;
    this.gameBoard = null;
    this.nextPieceCanvas = null;
    this.ctx = null;
    this.nextCtx = null;
    this.gameOverlay = null;
    this.scoreContainer = null;
  }
}
