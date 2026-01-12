/**
 * 2048游戏渲染器
 * 处理游戏界面渲染和动画效果
 */

import { Game2048State, Cell } from "./types";

/**
 * 2048游戏渲染器
 */
export class Game2048Renderer {
  private container: HTMLElement;
  private gameContainer: HTMLElement | null = null;
  private scoreContainer: HTMLElement | null = null;
  private boardContainer: HTMLElement | null = null;
  private gameOverlay: HTMLElement | null = null;
  private cellElements: HTMLElement[][] = [];

  // 动画相关
  private animationDuration = 150;
  private isAnimating = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.createGameStructure();
    this.setupStyles();

    // 监听窗口大小变化
    window.addEventListener("resize", this.handleWindowResize.bind(this));
  }

  /**
   * 处理窗口大小变化
   */
  private handleWindowResize(): void {
    // 延迟执行以避免频繁调用
    setTimeout(() => {
      this.updateTilePositions();
    }, 100);
  }

  /**
   * 创建游戏结构
   */
  private createGameStructure(): void {
    this.container.innerHTML = "";
    this.container.className = "game2048-container";

    // 创建主游戏容器
    this.gameContainer = document.createElement("div");
    this.gameContainer.className = "game2048-main";

    // 创建标题和分数区域
    const headerContainer = document.createElement("div");
    headerContainer.className = "game2048-header";

    const title = document.createElement("h1");
    title.className = "game2048-title";
    title.textContent = "2048";

    this.scoreContainer = document.createElement("div");
    this.scoreContainer.className = "game2048-scores";

    headerContainer.appendChild(title);
    headerContainer.appendChild(this.scoreContainer);

    // 创建游戏板容器
    this.boardContainer = document.createElement("div");
    this.boardContainer.className = "game2048-board";

    // 创建游戏结束覆盖层
    this.gameOverlay = document.createElement("div");
    this.gameOverlay.className = "game2048-overlay";
    this.gameOverlay.style.display = "none";

    // 组装结构
    this.gameContainer.appendChild(headerContainer);
    this.gameContainer.appendChild(this.boardContainer);
    this.gameContainer.appendChild(this.gameOverlay);

    this.container.appendChild(this.gameContainer);

    // 创建游戏板网格
    this.createBoard();

    // 添加说明文字
    this.createInstructions();
  }

  /**
   * 创建游戏板
   */
  private createBoard(): void {
    if (!this.boardContainer) return;

    this.boardContainer.innerHTML = "";
    this.cellElements = [];

    // 创建背景网格
    const gridContainer = document.createElement("div");
    gridContainer.className = "game2048-grid";

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const gridCell = document.createElement("div");
        gridCell.className = "game2048-grid-cell";
        gridContainer.appendChild(gridCell);
      }
    }

    // 创建数字单元格容器
    const tilesContainer = document.createElement("div");
    tilesContainer.className = "game2048-tiles";

    this.boardContainer.appendChild(gridContainer);
    this.boardContainer.appendChild(tilesContainer);

    // 初始化单元格元素数组
    for (let row = 0; row < 4; row++) {
      this.cellElements[row] = [];
      for (let col = 0; col < 4; col++) {
        this.cellElements[row][col] = document.createElement("div");
      }
    }
  }

  /**
   * 创建操作说明
   */
  private createInstructions(): void {
    const instructions = document.createElement("div");
    instructions.className = "game2048-instructions";
    instructions.innerHTML = `
      <p><strong>如何游戏:</strong></p>
      <p>使用 <strong>方向键</strong> 或 <strong>WASD</strong> 移动数字块</p>
      <p>在移动设备上可以 <strong>滑动</strong> 操作</p>
      <p>相同数字的块会合并成一个！</p>
    `;

    this.gameContainer?.appendChild(instructions);
  }

  /**
   * 渲染游戏状态
   */
  render(state: Game2048State): void {
    if (this.isAnimating) return;

    this.renderScores(state);
    this.renderBoard(state);
    this.renderGameStatus(state);
  }

  /**
   * 渲染分数
   */
  private renderScores(state: Game2048State): void {
    if (!this.scoreContainer) return;

    this.scoreContainer.innerHTML = `
      <div class="game2048-score">
        <div class="game2048-score-label">分数</div>
        <div class="game2048-score-value">${state.score.toLocaleString()}</div>
      </div>
      <div class="game2048-score">
        <div class="game2048-score-label">最高分</div>
        <div class="game2048-score-value">${state.bestScore.toLocaleString()}</div>
      </div>
      <div class="game2048-score">
        <div class="game2048-score-label">最高数字</div>
        <div class="game2048-score-value">${state.highestTile || "-"}</div>
      </div>
      <div class="game2048-score">
        <div class="game2048-score-label">历史最高</div>
        <div class="game2048-score-value">${state.bestTile || "-"}</div>
      </div>
    `;
  }

  /**
   * 渲染游戏板
   */
  private renderBoard(state: Game2048State): void {
    if (!this.boardContainer) return;

    const tilesContainer = this.boardContainer.querySelector(".game2048-tiles");
    if (!tilesContainer) return;

    // 清除现有的数字块
    tilesContainer.innerHTML = "";

    // 渲染每个非空单元格
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const cell = state.board[row][col];
        if (cell.value > 0) {
          const tileElement = this.createTileElement(cell);
          tilesContainer.appendChild(tileElement);
        }
      }
    }
  }

  /**
   * 更新所有数字块的位置和大小
   */
  private updateTilePositions(): void {
    if (!this.boardContainer) return;

    const tilesContainer = this.boardContainer.querySelector(".game2048-tiles");
    if (!tilesContainer) return;

    const tiles = tilesContainer.querySelectorAll(".game2048-tile");
    const cellSize = this.getCellSize();

    tiles.forEach((tile) => {
      const tileElement = tile as HTMLElement;
      // 从当前位置计算行列信息
      const currentLeft = parseInt(tileElement.style.left) || 0;
      const currentTop = parseInt(tileElement.style.top) || 0;
      const gap = this.getGap();

      // 根据当前位置计算行列
      const col = Math.round(currentLeft / (cellSize + gap));
      const row = Math.round(currentTop / (cellSize + gap));

      // 重新计算位置
      const position = this.getCellPosition(row, col);

      tileElement.style.width = `${cellSize}px`;
      tileElement.style.height = `${cellSize}px`;
      tileElement.style.left = `${position.x}px`;
      tileElement.style.top = `${position.y}px`;
    });
  }

  /**
   * 创建数字块元素
   */
  private createTileElement(cell: Cell): HTMLElement {
    const tile = document.createElement("div");
    tile.className = `game2048-tile game2048-tile-${cell.value}`;
    tile.textContent = cell.value.toString();

    // 设置大小
    const cellSize = this.getCellSize();
    tile.style.width = `${cellSize}px`;
    tile.style.height = `${cellSize}px`;

    // 设置位置 - 直接使用left和top定位，避免transform冲突
    const position = this.getCellPosition(cell.row, cell.col);
    tile.style.left = `${position.x}px`;
    tile.style.top = `${position.y}px`;

    // 添加动画类
    if (cell.isNew) {
      tile.classList.add("game2048-tile-new");
    }
    if (cell.isMerged) {
      tile.classList.add("game2048-tile-merged");
    }

    return tile;
  }

  /**
   * 获取单元格位置
   */
  private getCellPosition(row: number, col: number): { x: number; y: number } {
    const cellSize = this.getCellSize();
    const gap = this.getGap();

    return {
      x: col * (cellSize + gap),
      y: row * (cellSize + gap),
    };
  }

  /**
   * 获取单元格大小
   */
  private getCellSize(): number {
    if (!this.boardContainer) return 80;

    const boardRect = this.boardContainer.getBoundingClientRect();
    const gap = this.getGap();
    const padding = this.getBoardPadding();
    const availableWidth = boardRect.width - padding * 2;

    return Math.floor((availableWidth - gap * 3) / 4);
  }

  /**
   * 获取间隙大小
   */
  private getGap(): number {
    return this.isMobile() ? 8 : 12;
  }

  /**
   * 获取游戏板内边距
   */
  private getBoardPadding(): number {
    return this.isMobile() ? 8 : 12;
  }

  /**
   * 检查是否为移动设备
   */
  private isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  /**
   * 渲染游戏状态（胜利/失败覆盖层）
   */
  private renderGameStatus(state: Game2048State): void {
    if (!this.gameOverlay) return;

    if (state.status === "won" || state.status === "lost") {
      const isWon = state.status === "won";

      this.gameOverlay.innerHTML = `
        <div class="game2048-overlay-content">
          <h2 class="game2048-overlay-title ${isWon ? "won" : "lost"}">
            ${isWon ? "你赢了！" : "游戏结束"}
          </h2>
          <p class="game2048-overlay-score">
            最终分数: ${state.score.toLocaleString()}
          </p>
          ${
            isWon
              ? `
            <button class="game2048-btn game2048-btn-primary" onclick="this.parentElement.parentElement.style.display='none'">
              继续游戏
            </button>
          `
              : ""
          }
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
      .game2048-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
        background: #faf8ef;
        border-radius: 10px;
        position: relative;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }

      .game2048-main {
        position: relative;
      }

      .game2048-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 15px;
      }

      .game2048-title {
        font-size: 48px;
        font-weight: bold;
        color: #776e65;
        margin: 0;
        flex-shrink: 0;
      }

      .game2048-scores {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        min-width: 200px;
      }

      .game2048-score {
        background: #bbada0;
        padding: 6px 12px;
        border-radius: 6px;
        text-align: center;
        min-width: 80px;
      }

      .game2048-score-label {
        font-size: 11px;
        color: #eee4da;
        text-transform: uppercase;
        font-weight: bold;
        margin-bottom: 2px;
      }

      .game2048-score-value {
        font-size: 16px;
        color: white;
        font-weight: bold;
      }

      .game2048-board {
        position: relative;
        background: #bbada0;
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 20px;
      }

      .game2048-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.1s ease;
      }

      .game2048-btn-primary {
        background: #8f7a66;
        color: #f9f6f2;
      }

      .game2048-btn-primary:hover {
        background: #9f8a76;
      }

      .game2048-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }

      .game2048-grid-cell {
        aspect-ratio: 1;
        background: rgba(238, 228, 218, 0.35);
        border-radius: 6px;
      }

      .game2048-tiles {
        position: absolute;
        top: 12px;
        left: 12px;
        right: 12px;
        bottom: 12px;
      }

      .game2048-tile {
        position: absolute;
        background: #eee4da;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: bold;
        color: #776e65;
        transition: left 0.15s ease, top 0.15s ease;
        z-index: 1;
      }

      .game2048-tile-new {
        animation: tileAppear 0.2s ease;
      }

      .game2048-tile-merged {
        animation: tileMerge 0.15s ease;
        z-index: 2;
      }

      @keyframes tileAppear {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes tileMerge {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
        }
      }

      /* 数字块颜色 */
      .game2048-tile-2 { background: #eee4da; color: #776e65; }
      .game2048-tile-4 { background: #ede0c8; color: #776e65; }
      .game2048-tile-8 { background: #f2b179; color: #f9f6f2; }
      .game2048-tile-16 { background: #f59563; color: #f9f6f2; }
      .game2048-tile-32 { background: #f67c5f; color: #f9f6f2; }
      .game2048-tile-64 { background: #f65e3b; color: #f9f6f2; }
      .game2048-tile-128 { background: #edcf72; color: #f9f6f2; font-size: 28px; }
      .game2048-tile-256 { background: #edcc61; color: #f9f6f2; font-size: 28px; }
      .game2048-tile-512 { background: #edc850; color: #f9f6f2; font-size: 28px; }
      .game2048-tile-1024 { background: #edc53f; color: #f9f6f2; font-size: 24px; }
      .game2048-tile-2048 { background: #edc22e; color: #f9f6f2; font-size: 24px; }

      .game2048-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        z-index: 100;
      }

      .game2048-overlay-content {
        text-align: center;
        padding: 40px;
      }

      .game2048-overlay-title {
        font-size: 36px;
        font-weight: bold;
        margin: 0 0 20px 0;
      }

      .game2048-overlay-title.won {
        color: #f67c5f;
      }

      .game2048-overlay-title.lost {
        color: #776e65;
      }

      .game2048-overlay-score {
        font-size: 18px;
        color: #776e65;
        margin: 0 0 30px 0;
      }

      .game2048-instructions {
        background: #f9f6f2;
        padding: 20px;
        border-radius: 6px;
        font-size: 14px;
        color: #776e65;
        line-height: 1.5;
      }

      .game2048-instructions p {
        margin: 0 0 10px 0;
      }

      .game2048-instructions p:last-child {
        margin-bottom: 0;
      }

      .game2048-instructions strong {
        color: #8f7a66;
      }

      /* 移动端适配 */
      @media (max-width: 768px) {
        .game2048-container {
          padding: 15px;
          max-width: 100%;
        }

        .game2048-header {
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .game2048-title {
          font-size: 36px;
        }

        .game2048-scores {
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          width: 100%;
          max-width: 280px;
        }

        .game2048-score {
          padding: 4px 8px;
          min-width: auto;
        }

        .game2048-score-label {
          font-size: 10px;
        }

        .game2048-score-value {
          font-size: 14px;
        }

        .game2048-board {
          padding: 8px;
        }

        .game2048-grid {
          gap: 8px;
        }

        .game2048-tiles {
          top: 8px;
          left: 8px;
          right: 8px;
          bottom: 8px;
        }

        .game2048-tile {
          font-size: 24px;
        }

        .game2048-tile-128,
        .game2048-tile-256,
        .game2048-tile-512 {
          font-size: 20px;
        }

        .game2048-tile-1024,
        .game2048-tile-2048 {
          font-size: 18px;
        }

        .game2048-overlay-title {
          font-size: 28px;
        }

        .game2048-instructions {
          font-size: 12px;
        }
      }

      @media (max-width: 480px) {
        .game2048-container {
          padding: 10px;
        }

        .game2048-header {
          gap: 10px;
        }

        .game2048-title {
          font-size: 28px;
        }

        .game2048-scores {
          grid-template-columns: repeat(2, 1fr);
          gap: 4px;
          max-width: 240px;
        }

        .game2048-score {
          padding: 3px 6px;
        }

        .game2048-score-label {
          font-size: 9px;
        }

        .game2048-score-value {
          font-size: 12px;
        }

        .game2048-tile {
          font-size: 20px;
        }

        .game2048-tile-128,
        .game2048-tile-256,
        .game2048-tile-512 {
          font-size: 16px;
        }

        .game2048-tile-1024,
        .game2048-tile-2048 {
          font-size: 14px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 设置动画持续时间
   */
  setAnimationDuration(duration: number): void {
    this.animationDuration = Math.max(50, duration);
  }

  /**
   * 获取动画持续时间
   */
  getAnimationDuration(): number {
    return this.animationDuration;
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
    this.scoreContainer = null;
    this.boardContainer = null;
    this.gameOverlay = null;
    this.cellElements = [];
  }
}
