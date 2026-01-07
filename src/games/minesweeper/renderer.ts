/**
 * 扫雷游戏渲染器
 * 负责游戏界面的渲染和更新
 */

import { MinesweeperState, Cell } from "./types";

/**
 * 扫雷游戏渲染器
 */
export class MinesweeperRenderer {
  private container: HTMLElement;
  private gameElement: HTMLElement | null = null;
  private boardElement: HTMLElement | null = null;
  private timerInterval: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.createGameUI();
  }

  /**
   * 渲染游戏状态
   */
  render(state: MinesweeperState): void {
    this.updateGameInfo(state);
    this.updateBoard(state);
    this.updateTimer(state);
    this.updateDifficultyButtons(state);
  }

  /**
   * 创建游戏UI结构
   */
  private createGameUI(): void {
    this.gameElement = document.createElement("div");
    this.gameElement.className =
      "minesweeper-game w-full h-full flex flex-col bg-gray-50 min-h-0";

    this.gameElement.innerHTML = `
      <div class="game-header bg-white shadow-sm border-b">
        <!-- 游戏信息栏 -->
        <div class="flex flex-wrap justify-between items-center p-3 gap-2">
          <div class="flex items-center gap-4">
            <div class="game-info flex items-center gap-2">
              <span class="text-red-600 font-bold text-lg">💣</span>
              <span class="mines-count font-mono text-lg font-bold" id="mines-remaining">000</span>
            </div>
            <div class="timer-info flex items-center gap-2">
              <span class="text-blue-600 font-bold text-lg">⏱️</span>
              <span class="timer font-mono text-lg font-bold" id="game-timer">000</span>
            </div>
          </div>
          
          <div class="game-status">
            <span class="status-text font-bold text-lg" id="game-status">准备开始</span>
          </div>
          
          <div class="game-controls">
            <button id="restart-btn" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
              🔄 重新开始
            </button>
          </div>
        </div>
        
        <!-- 难度选择 -->
        <div class="difficulty-controls p-3 pt-0">
          <div class="flex flex-wrap gap-2">
            <button class="difficulty-btn px-3 py-1 text-sm rounded-md border transition-colors" data-difficulty="beginner">
              初级 (9×9)
            </button>
            <button class="difficulty-btn px-3 py-1 text-sm rounded-md border transition-colors" data-difficulty="intermediate">
              中级 (16×16)
            </button>
            <button class="difficulty-btn px-3 py-1 text-sm rounded-md border transition-colors" data-difficulty="expert">
              高级 (16×30)
            </button>
          </div>
        </div>
      </div>
      
      <div class="game-board-container flex-1 p-4 overflow-auto min-h-0">
        <div class="flex flex-col items-center justify-center min-h-full">
          <div id="game-board" class="game-board"></div>
          
          <!-- 游戏说明 -->
          <div class="game-instructions mt-4 text-sm text-gray-600 max-w-md text-center">
            <p class="mb-2"><strong>操作说明：</strong></p>
            <div class="text-left space-y-1">
              <p>• <strong>左键点击</strong>：揭示单元格</p>
              <p>• <strong>右键点击</strong>：标记/取消标记地雷</p>
              <p>• <strong>触摸设备</strong>：短按揭示，长按标记</p>
              <p>• <strong>快捷键</strong>：F2 或 Ctrl+R 重新开始</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(this.gameElement);
    this.boardElement = this.gameElement.querySelector("#game-board");
  }

  /**
   * 更新游戏信息显示
   */
  private updateGameInfo(state: MinesweeperState): void {
    if (!this.gameElement) return;

    const minesRemainingElement =
      this.gameElement.querySelector("#mines-remaining");
    const gameStatusElement = this.gameElement.querySelector("#game-status");

    if (minesRemainingElement) {
      const remaining = Math.max(0, state.remainingMines);
      minesRemainingElement.textContent = remaining.toString().padStart(3, "0");
    }

    if (gameStatusElement) {
      let statusText = "";
      let statusClass = "";

      switch (state.status) {
        case "idle":
          statusText = "准备开始";
          statusClass = "text-gray-600";
          break;
        case "playing":
          statusText = "游戏中";
          statusClass = "text-blue-600";
          break;
        case "won":
          statusText = `🎉 胜利！分数: ${state.score}`;
          statusClass = "text-green-600";
          break;
        case "lost":
          statusText = "💥 失败！";
          statusClass = "text-red-600";
          break;
      }

      gameStatusElement.textContent = statusText;
      gameStatusElement.className = `status-text font-bold text-lg ${statusClass}`;
    }
  }

  /**
   * 更新计时器显示
   */
  private updateTimer(state: MinesweeperState): void {
    const timerElement = this.gameElement?.querySelector("#game-timer");
    if (!timerElement) return;

    let seconds = 0;

    if (state.startTime) {
      const endTime = state.endTime || Date.now();
      seconds = Math.floor((endTime - state.startTime) / 1000);
    }

    timerElement.textContent = Math.min(999, seconds)
      .toString()
      .padStart(3, "0");

    // 管理计时器
    if (state.status === "playing" && !this.timerInterval) {
      this.timerInterval = window.setInterval(() => {
        if (state.startTime && state.status === "playing") {
          const currentSeconds = Math.floor(
            (Date.now() - state.startTime) / 1000
          );
          timerElement.textContent = Math.min(999, currentSeconds)
            .toString()
            .padStart(3, "0");
        }
      }, 1000);
    } else if (state.status !== "playing" && this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * 更新难度按钮状态
   */
  private updateDifficultyButtons(state: MinesweeperState): void {
    if (!this.gameElement) return;

    const buttons = this.gameElement.querySelectorAll(".difficulty-btn");
    buttons.forEach((button) => {
      const btn = button as HTMLElement;
      const difficulty = btn.dataset.difficulty;

      if (difficulty === state.config.difficulty) {
        btn.className =
          "difficulty-btn px-3 py-1 text-sm rounded-md border bg-blue-500 text-white border-blue-500";
      } else {
        btn.className =
          "difficulty-btn px-3 py-1 text-sm rounded-md border bg-white text-gray-700 border-gray-300 hover:bg-gray-50";
      }
    });
  }

  /**
   * 更新游戏板显示
   */
  private updateBoard(state: MinesweeperState): void {
    if (!this.boardElement) return;

    const { rows, cols } = state.config;

    // 计算响应式单元格大小
    const containerWidth = this.container.clientWidth - 32; // 减去padding
    const containerHeight = this.container.clientHeight - 200; // 减去header高度

    const maxCellWidth = Math.floor(containerWidth / cols);
    const maxCellHeight = Math.floor(containerHeight / rows);
    const cellSize = Math.max(
      20,
      Math.min(40, Math.min(maxCellWidth, maxCellHeight))
    );

    // 设置网格样式
    this.boardElement.className = `grid gap-1 border-2 border-gray-400 bg-gray-400 p-1 rounded-lg shadow-lg`;
    this.boardElement.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    this.boardElement.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

    // 清空并重新创建单元格
    this.boardElement.innerHTML = "";

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = state.board[row][col];
        const cellElement = this.createCellElement(
          cell,
          cellSize,
          state.status
        );
        this.boardElement.appendChild(cellElement);
      }
    }
  }

  /**
   * 创建单元格元素
   */
  private createCellElement(
    cell: Cell,
    size: number,
    gameStatus: string
  ): HTMLElement {
    const cellElement = document.createElement("div");
    cellElement.className =
      "cell flex items-center justify-center font-bold cursor-pointer select-none transition-all duration-150";
    cellElement.style.width = `${size}px`;
    cellElement.style.height = `${size}px`;
    cellElement.style.fontSize = `${Math.max(10, size * 0.6)}px`;
    cellElement.dataset.row = cell.row.toString();
    cellElement.dataset.col = cell.col.toString();

    // 根据单元格状态设置样式和内容
    switch (cell.state) {
      case "hidden":
        cellElement.className +=
          " bg-gray-300 border border-gray-500 shadow-sm";
        if (gameStatus === "playing" || gameStatus === "idle") {
          cellElement.className += " hover:bg-gray-200 active:bg-gray-400";
        }
        break;

      case "revealed":
        if (cell.isMine) {
          cellElement.className +=
            " bg-red-500 text-white border border-red-600";
          cellElement.textContent = "💣";
        } else {
          cellElement.className += " bg-white border border-gray-300";
          if (cell.neighborMines > 0) {
            cellElement.textContent = cell.neighborMines.toString();
            cellElement.style.color = this.getNumberColor(cell.neighborMines);
          }
        }
        break;

      case "flagged":
        cellElement.className += " bg-yellow-200 border border-yellow-400";
        cellElement.textContent = "🚩";
        break;

      case "questioned":
        cellElement.className += " bg-blue-200 border border-blue-400";
        cellElement.textContent = "?";
        break;
    }

    // 游戏结束时禁用交互
    if (gameStatus === "won" || gameStatus === "lost") {
      cellElement.style.cursor = "default";
    }

    return cellElement;
  }

  /**
   * 获取数字颜色
   */
  private getNumberColor(number: number): string {
    const colors = [
      "", // 0 不显示
      "#0000FF", // 1 蓝色
      "#008000", // 2 绿色
      "#FF0000", // 3 红色
      "#800080", // 4 紫色
      "#800000", // 5 栗色
      "#008080", // 6 青色
      "#000000", // 7 黑色
      "#808080", // 8 灰色
    ];
    return colors[number] || "#000000";
  }

  /**
   * 处理窗口大小变化
   */
  handleResize(): void {
    // 触发重新渲染以调整单元格大小
    const event = new CustomEvent("resize-board");
    this.container.dispatchEvent(event);
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    // 清理计时器
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // 移除DOM元素
    if (this.gameElement && this.container.contains(this.gameElement)) {
      this.container.removeChild(this.gameElement);
    }

    this.gameElement = null;
    this.boardElement = null;
  }
}
