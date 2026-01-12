/**
 * 2048游戏状态管理
 */

import {
  Cell,
  Game2048State,
  GameConfig,
  GameHistoryState,
  MoveResult,
  Direction,
  DEFAULT_CONFIG,
} from "./types";

/**
 * 2048游戏状态管理器
 */
export class Game2048StateManager {
  private state: Game2048State;
  private config: GameConfig;
  private history: GameHistoryState[] = [];
  private listeners: Array<(state: Game2048State) => void> = [];

  constructor(config: GameConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.state = this.createInitialState();
  }

  /**
   * 获取当前状态
   */
  getState(): Game2048State {
    return { ...this.state };
  }

  /**
   * 添加状态监听器
   */
  addListener(listener: (state: Game2048State) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除状态监听器
   */
  removeListener(listener: (state: Game2048State) => void): void {
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
  private createInitialState(): Game2048State {
    const board = this.createEmptyBoard();

    return {
      status: "idle",
      board,
      score: 0,
      bestScore: this.loadBestScore(),
      startTime: null,
      endTime: null,
      canUndo: false,
      moveCount: 0,
      highestTile: 0,
      bestTile: this.loadBestTile(),
    };
  }

  /**
   * 创建空的游戏板
   */
  private createEmptyBoard(): Cell[][] {
    const board: Cell[][] = [];
    const size = this.config.boardSize;

    for (let row = 0; row < size; row++) {
      board[row] = [];
      for (let col = 0; col < size; col++) {
        board[row][col] = {
          value: 0,
          row,
          col,
        };
      }
    }

    return board;
  }

  /**
   * 开始新游戏
   */
  startNewGame(): void {
    this.state = this.createInitialState();
    this.history = [];

    // 添加初始单元格
    for (let i = 0; i < this.config.initialCells; i++) {
      this.addRandomCell();
    }

    // 更新最高数字
    this.updateHighestTile();

    this.state.status = "playing";
    this.state.startTime = Date.now();
    this.notifyListeners();
  }

  /**
   * 在随机位置添加新单元格
   */
  private addRandomCell(): boolean {
    const emptyCells = this.getEmptyCells();
    if (emptyCells.length === 0) return false;

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];

    // 90%概率生成2，10%概率生成4
    const value = Math.random() < 0.9 ? 2 : 4;

    this.state.board[row][col] = {
      value,
      row,
      col,
      isNew: true,
    };

    return true;
  }

  /**
   * 获取所有空单元格
   */
  private getEmptyCells(): Array<{ row: number; col: number }> {
    const emptyCells: Array<{ row: number; col: number }> = [];
    const size = this.config.boardSize;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (this.state.board[row][col].value === 0) {
          emptyCells.push({ row, col });
        }
      }
    }

    return emptyCells;
  }

  /**
   * 执行移动
   */
  move(direction: Direction): MoveResult {
    if (this.state.status !== "playing") {
      return { moved: false, scoreIncrease: 0, reached2048: false };
    }

    // 保存当前状态到历史记录
    this.saveToHistory();

    const oldBoard = this.cloneBoard(this.state.board);
    const oldScore = this.state.score;

    // 清除所有标记
    this.clearCellFlags();

    // 执行移动逻辑
    let scoreIncrease = 0;
    let reached2048 = false;

    switch (direction) {
      case "left":
        scoreIncrease = this.moveLeft();
        break;
      case "right":
        scoreIncrease = this.moveRight();
        break;
      case "up":
        scoreIncrease = this.moveUp();
        break;
      case "down":
        scoreIncrease = this.moveDown();
        break;
    }

    // 检查是否发生了移动
    const moved = !this.boardsEqual(oldBoard, this.state.board);

    if (moved) {
      this.state.score += scoreIncrease;
      this.state.moveCount++;
      this.state.canUndo = true;

      // 检查是否达到2048
      reached2048 = this.checkFor2048();

      // 更新最高数字
      this.updateHighestTile();

      // 添加新单元格
      this.addRandomCell();

      // 检查游戏状态
      this.checkGameStatus();

      // 更新最高分
      if (this.state.score > this.state.bestScore) {
        this.state.bestScore = this.state.score;
        this.saveBestScore(this.state.bestScore);
      }

      // 更新历史最高数字
      if (this.state.highestTile > this.state.bestTile) {
        this.state.bestTile = this.state.highestTile;
        this.saveBestTile(this.state.bestTile);
      }
    } else {
      // 如果没有移动，移除历史记录
      this.history.pop();
    }

    this.notifyListeners();
    return { moved, scoreIncrease, reached2048 };
  }

  /**
   * 向左移动
   */
  private moveLeft(): number {
    let scoreIncrease = 0;
    const size = this.config.boardSize;

    for (let row = 0; row < size; row++) {
      const line = this.state.board[row].map((cell) => cell.value);
      const { newLine, score } = this.mergeLine(line);
      scoreIncrease += score;

      for (let col = 0; col < size; col++) {
        this.state.board[row][col].value = newLine[col];
      }
    }

    return scoreIncrease;
  }

  /**
   * 向右移动
   */
  private moveRight(): number {
    let scoreIncrease = 0;
    const size = this.config.boardSize;

    for (let row = 0; row < size; row++) {
      const line = this.state.board[row].map((cell) => cell.value).reverse();
      const { newLine, score } = this.mergeLine(line);
      scoreIncrease += score;

      const reversedLine = newLine.reverse();
      for (let col = 0; col < size; col++) {
        this.state.board[row][col].value = reversedLine[col];
      }
    }

    return scoreIncrease;
  }

  /**
   * 向上移动
   */
  private moveUp(): number {
    let scoreIncrease = 0;
    const size = this.config.boardSize;

    for (let col = 0; col < size; col++) {
      const line = [];
      for (let row = 0; row < size; row++) {
        line.push(this.state.board[row][col].value);
      }

      const { newLine, score } = this.mergeLine(line);
      scoreIncrease += score;

      for (let row = 0; row < size; row++) {
        this.state.board[row][col].value = newLine[row];
      }
    }

    return scoreIncrease;
  }

  /**
   * 向下移动
   */
  private moveDown(): number {
    let scoreIncrease = 0;
    const size = this.config.boardSize;

    for (let col = 0; col < size; col++) {
      const line = [];
      for (let row = size - 1; row >= 0; row--) {
        line.push(this.state.board[row][col].value);
      }

      const { newLine, score } = this.mergeLine(line);
      scoreIncrease += score;

      for (let row = 0; row < size; row++) {
        this.state.board[size - 1 - row][col].value = newLine[row];
      }
    }

    return scoreIncrease;
  }

  /**
   * 合并一行/列
   */
  private mergeLine(line: number[]): { newLine: number[]; score: number } {
    // 移除空格
    const filtered = line.filter((val) => val !== 0);
    const newLine = [...filtered];
    let score = 0;

    // 合并相同的数字
    for (let i = 0; i < newLine.length - 1; i++) {
      if (newLine[i] === newLine[i + 1]) {
        newLine[i] *= 2;
        score += newLine[i];
        newLine[i + 1] = 0;
      }
    }

    // 再次移除空格
    const result = newLine.filter((val) => val !== 0);

    // 填充到原长度
    while (result.length < line.length) {
      result.push(0);
    }

    return { newLine: result, score };
  }

  /**
   * 更新最高数字
   */
  private updateHighestTile(): void {
    let currentHighest = 0;
    const size = this.config.boardSize;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const value = this.state.board[row][col].value;
        if (value > currentHighest) {
          currentHighest = value;
        }
      }
    }

    this.state.highestTile = currentHighest;
  }

  /**
   * 检查是否达到2048
   */
  private checkFor2048(): boolean {
    const size = this.config.boardSize;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (this.state.board[row][col].value >= this.config.winTarget) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 检查游戏状态
   */
  private checkGameStatus(): void {
    // 检查是否获胜
    if (this.checkFor2048() && this.state.status === "playing") {
      this.state.status = "won";
      this.state.endTime = Date.now();
      return;
    }

    // 检查是否还能移动
    if (!this.canMove()) {
      this.state.status = "lost";
      this.state.endTime = Date.now();
    }
  }

  /**
   * 检查是否还能移动
   */
  private canMove(): boolean {
    const size = this.config.boardSize;

    // 检查是否有空格
    if (this.getEmptyCells().length > 0) {
      return true;
    }

    // 检查是否有相邻的相同数字
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const current = this.state.board[row][col].value;

        // 检查右边
        if (
          col < size - 1 &&
          current === this.state.board[row][col + 1].value
        ) {
          return true;
        }

        // 检查下面
        if (
          row < size - 1 &&
          current === this.state.board[row + 1][col].value
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 撤销上一步
   */
  undo(): boolean {
    if (!this.state.canUndo || this.history.length === 0) {
      return false;
    }

    const lastState = this.history.pop()!;
    this.state.board = this.cloneBoard(lastState.board);
    this.state.score = lastState.score;
    this.state.moveCount = lastState.moveCount;
    this.state.canUndo = this.history.length > 0;

    this.notifyListeners();
    return true;
  }

  /**
   * 保存当前状态到历史记录
   */
  private saveToHistory(): void {
    const historyState: GameHistoryState = {
      board: this.cloneBoard(this.state.board),
      score: this.state.score,
      moveCount: this.state.moveCount,
    };

    this.history.push(historyState);

    // 限制历史记录数量
    if (this.history.length > 10) {
      this.history.shift();
    }
  }

  /**
   * 克隆游戏板
   */
  private cloneBoard(board: Cell[][]): Cell[][] {
    return board.map((row) => row.map((cell) => ({ ...cell })));
  }

  /**
   * 比较两个游戏板是否相等
   */
  private boardsEqual(board1: Cell[][], board2: Cell[][]): boolean {
    const size = this.config.boardSize;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board1[row][col].value !== board2[row][col].value) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 清除单元格标记
   */
  private clearCellFlags(): void {
    const size = this.config.boardSize;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        delete this.state.board[row][col].isNew;
        delete this.state.board[row][col].isMerged;
      }
    }
  }

  /**
   * 加载最高分
   */
  private loadBestScore(): number {
    try {
      const saved = localStorage.getItem("game2048-best-score");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * 保存最高分
   */
  private saveBestScore(score: number): void {
    try {
      localStorage.setItem("game2048-best-score", score.toString());
    } catch {
      // 忽略存储错误
    }
  }

  /**
   * 加载最高数字
   */
  private loadBestTile(): number {
    try {
      const saved = localStorage.getItem("game2048-best-tile");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * 保存最高数字
   */
  private saveBestTile(tile: number): void {
    try {
      localStorage.setItem("game2048-best-tile", tile.toString());
    } catch {
      // 忽略存储错误
    }
  }

  /**
   * 重置游戏
   */
  reset(): void {
    this.startNewGame();
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    this.listeners = [];
    this.history = [];
  }
}
