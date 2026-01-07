/**
 * 扫雷游戏状态管理
 */

import {
  Cell,
  GameConfig,
  MinesweeperState,
  GameStatus,
  CellState,
  DIFFICULTY_CONFIGS,
} from "./types";

/**
 * 扫雷游戏状态管理器
 */
export class MinesweeperStateManager {
  private state: MinesweeperState;
  private listeners: Array<(state: MinesweeperState) => void> = [];

  constructor(config: GameConfig = DIFFICULTY_CONFIGS.beginner) {
    this.state = this.createInitialState(config);
  }

  /**
   * 获取当前状态
   */
  getState(): MinesweeperState {
    return { ...this.state };
  }

  /**
   * 添加状态监听器
   */
  addListener(listener: (state: MinesweeperState) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除状态监听器
   */
  removeListener(listener: (state: MinesweeperState) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器状态变化
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  /**
   * 创建初始状态
   */
  private createInitialState(config: GameConfig): MinesweeperState {
    const board = this.createEmptyBoard(config.rows, config.cols);

    return {
      status: "idle",
      board,
      config,
      remainingMines: config.mines,
      flaggedMines: 0,
      revealedCells: 0,
      startTime: null,
      endTime: null,
      score: 0,
    };
  }

  /**
   * 创建空的游戏板
   */
  private createEmptyBoard(rows: number, cols: number): Cell[][] {
    const board: Cell[][] = [];

    for (let row = 0; row < rows; row++) {
      board[row] = [];
      for (let col = 0; col < cols; col++) {
        board[row][col] = {
          isMine: false,
          neighborMines: 0,
          state: "hidden",
          row,
          col,
        };
      }
    }

    return board;
  }

  /**
   * 初始化游戏（放置地雷）
   */
  initializeGame(firstClickRow: number, firstClickCol: number): void {
    if (this.state.status !== "idle") return;

    this.placeMines(firstClickRow, firstClickCol);
    this.calculateNeighborMines();

    this.state.status = "playing";
    this.state.startTime = Date.now();

    this.notifyListeners();
  }

  /**
   * 放置地雷
   */
  private placeMines(excludeRow: number, excludeCol: number): void {
    const { rows, cols, mines } = this.state.config;
    const totalCells = rows * cols;
    const availableCells: Array<{ row: number; col: number }> = [];

    // 收集所有可用位置（排除首次点击位置及其邻居）
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isExcluded =
          Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1;
        if (!isExcluded) {
          availableCells.push({ row, col });
        }
      }
    }

    // 随机选择地雷位置
    const minePositions = this.shuffleArray(availableCells).slice(0, mines);

    // 放置地雷
    minePositions.forEach(({ row, col }) => {
      this.state.board[row][col].isMine = true;
    });
  }

  /**
   * 计算每个单元格的邻居地雷数
   */
  private calculateNeighborMines(): void {
    const { rows, cols } = this.state.config;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!this.state.board[row][col].isMine) {
          this.state.board[row][col].neighborMines = this.countNeighborMines(
            row,
            col
          );
        }
      }
    }
  }

  /**
   * 计算指定位置的邻居地雷数
   */
  private countNeighborMines(row: number, col: number): number {
    let count = 0;
    const { rows, cols } = this.state.config;

    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
      for (
        let c = Math.max(0, col - 1);
        c <= Math.min(cols - 1, col + 1);
        c++
      ) {
        if (r !== row || c !== col) {
          if (this.state.board[r][c].isMine) {
            count++;
          }
        }
      }
    }

    return count;
  }

  /**
   * 揭示单元格
   */
  revealCell(row: number, col: number): boolean {
    if (this.state.status === "won" || this.state.status === "lost")
      return false;

    const cell = this.state.board[row][col];
    if (cell.state !== "hidden") return false;

    // 如果是第一次点击，初始化游戏
    if (this.state.status === "idle") {
      this.initializeGame(row, col);
    }

    // 揭示单元格
    cell.state = "revealed";
    this.state.revealedCells++;

    if (cell.isMine) {
      // 踩到地雷，游戏结束
      this.state.status = "lost";
      this.state.endTime = Date.now();
      this.revealAllMines();
    } else {
      // 如果是空白单元格，自动揭示邻居
      if (cell.neighborMines === 0) {
        this.revealNeighbors(row, col);
      }

      // 检查是否获胜
      this.checkWinCondition();
    }

    this.notifyListeners();
    return true;
  }

  /**
   * 标记/取消标记单元格
   */
  toggleFlag(row: number, col: number): boolean {
    if (this.state.status === "won" || this.state.status === "lost")
      return false;

    const cell = this.state.board[row][col];
    if (cell.state === "revealed") return false;

    if (cell.state === "hidden") {
      cell.state = "flagged";
      this.state.flaggedMines++;
      this.state.remainingMines--;
    } else if (cell.state === "flagged") {
      cell.state = "hidden";
      this.state.flaggedMines--;
      this.state.remainingMines++;
    }

    this.notifyListeners();
    return true;
  }

  /**
   * 自动揭示邻居单元格（用于空白单元格）
   */
  private revealNeighbors(row: number, col: number): void {
    const { rows, cols } = this.state.config;

    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
      for (
        let c = Math.max(0, col - 1);
        c <= Math.min(cols - 1, col + 1);
        c++
      ) {
        if (r !== row || c !== col) {
          const neighbor = this.state.board[r][c];
          if (neighbor.state === "hidden") {
            this.revealCell(r, c);
          }
        }
      }
    }
  }

  /**
   * 揭示所有地雷（游戏结束时）
   */
  private revealAllMines(): void {
    const { rows, cols } = this.state.config;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = this.state.board[row][col];
        if (cell.isMine && cell.state !== "flagged") {
          cell.state = "revealed";
        }
      }
    }
  }

  /**
   * 检查获胜条件
   */
  private checkWinCondition(): void {
    const { rows, cols, mines } = this.state.config;
    const totalSafeCells = rows * cols - mines;

    if (this.state.revealedCells === totalSafeCells) {
      this.state.status = "won";
      this.state.endTime = Date.now();
      this.calculateScore();
    }
  }

  /**
   * 计算分数
   */
  private calculateScore(): void {
    if (!this.state.startTime || !this.state.endTime) return;

    const timeBonus = Math.max(
      0,
      1000 - Math.floor((this.state.endTime - this.state.startTime) / 1000)
    );
    const difficultyMultiplier = this.getDifficultyMultiplier();

    this.state.score =
      (timeBonus + this.state.config.mines * 10) * difficultyMultiplier;
  }

  /**
   * 获取难度系数
   */
  private getDifficultyMultiplier(): number {
    switch (this.state.config.difficulty) {
      case "beginner":
        return 1;
      case "intermediate":
        return 2;
      case "expert":
        return 3;
      default:
        return 1;
    }
  }

  /**
   * 重置游戏
   */
  reset(config?: GameConfig): void {
    const newConfig = config || this.state.config;
    this.state = this.createInitialState(newConfig);
    this.notifyListeners();
  }

  /**
   * 数组洗牌算法
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    this.listeners = [];
  }
}
