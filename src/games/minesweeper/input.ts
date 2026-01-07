/**
 * 扫雷游戏输入处理器
 * 处理鼠标和触摸输入事件
 */

import { DIFFICULTY_CONFIGS } from "./types";

/**
 * 扫雷游戏输入处理器
 */
export class MinesweeperInputHandler {
  private container: HTMLElement;
  private isMouseDown = false;
  private touchStartTime = 0;
  private longPressTimer: number | null = null;
  private readonly LONG_PRESS_DURATION = 500; // 长按时间（毫秒）
  private lastTouchTarget: HTMLElement | null = null;

  // 事件回调
  onLeftClick?: (row: number, col: number) => void;
  onRightClick?: (row: number, col: number) => void;
  onMiddleClick?: (row: number, col: number) => void;
  onRestart?: () => void;
  onDifficultyChange?: (difficulty: keyof typeof DIFFICULTY_CONFIGS) => void;
  onCustomConfig?: (rows: number, cols: number, mines: number) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 鼠标事件
    this.container.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this),
      { passive: false }
    );
    this.container.addEventListener("mouseup", this.handleMouseUp.bind(this), {
      passive: false,
    });
    this.container.addEventListener(
      "contextmenu",
      this.handleContextMenu.bind(this),
      { passive: false }
    );
    this.container.addEventListener("click", this.handleClick.bind(this), {
      passive: false,
    });

    // 触摸事件
    this.container.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      { passive: false }
    );
    this.container.addEventListener(
      "touchend",
      this.handleTouchEnd.bind(this),
      { passive: false }
    );
    this.container.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      { passive: false }
    );
    this.container.addEventListener(
      "touchcancel",
      this.handleTouchCancel.bind(this),
      { passive: false }
    );

    // 键盘事件
    document.addEventListener("keydown", this.handleKeyDown.bind(this));

    // 窗口大小变化事件
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;

    // 阻止中键点击的默认行为
    if (event.button === 1) {
      event.preventDefault();
    }
  }

  /**
   * 处理鼠标释放事件
   */
  private handleMouseUp(event: MouseEvent): void {
    if (!this.isMouseDown) return;
    this.isMouseDown = false;

    const cellInfo = this.getCellFromEvent(event);
    if (!cellInfo) return;

    const { row, col } = cellInfo;

    // 根据鼠标按键处理不同操作
    switch (event.button) {
      case 0: // 左键
        this.onLeftClick?.(row, col);
        break;
      case 1: // 中键
        event.preventDefault();
        this.onMiddleClick?.(row, col);
        break;
      case 2: // 右键
        this.onRightClick?.(row, col);
        break;
    }
  }

  /**
   * 处理右键菜单事件
   */
  private handleContextMenu(event: MouseEvent): void {
    event.preventDefault(); // 阻止默认右键菜单
  }

  /**
   * 处理点击事件
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // 处理重新开始按钮
    if (target.id === "restart-btn" || target.closest("#restart-btn")) {
      event.preventDefault();
      this.onRestart?.();
      return;
    }

    // 处理难度选择按钮
    if (
      target.classList.contains("difficulty-btn") ||
      target.closest(".difficulty-btn")
    ) {
      event.preventDefault();
      const difficultyBtn = target.classList.contains("difficulty-btn")
        ? target
        : target.closest(".difficulty-btn");
      const difficulty = (difficultyBtn as HTMLElement)?.dataset
        .difficulty as keyof typeof DIFFICULTY_CONFIGS;
      if (difficulty) {
        this.onDifficultyChange?.(difficulty);
      }
      return;
    }
  }

  /**
   * 处理触摸开始事件
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();

    if (event.touches.length !== 1) return;

    this.touchStartTime = Date.now();
    const touch = event.touches[0];
    const element = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    ) as HTMLElement;
    this.lastTouchTarget = element;

    // 处理UI按钮的触摸
    if (
      element &&
      (element.id === "restart-btn" || element.closest("#restart-btn"))
    ) {
      element.classList.add("active:bg-blue-700");
      return;
    }

    if (
      element &&
      (element.classList.contains("difficulty-btn") ||
        element.closest(".difficulty-btn"))
    ) {
      const btn = element.classList.contains("difficulty-btn")
        ? element
        : (element.closest(".difficulty-btn") as HTMLElement);
      btn.classList.add("active:bg-gray-200");
      return;
    }

    // 处理游戏单元格的触摸
    const cellInfo = this.getCellFromTouch(touch);
    if (cellInfo) {
      // 设置长按定时器
      this.longPressTimer = window.setTimeout(() => {
        // 添加触觉反馈（如果支持）
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        this.onRightClick?.(cellInfo.row, cellInfo.col);
        this.longPressTimer = null;
      }, this.LONG_PRESS_DURATION);
    }
  }

  /**
   * 处理触摸结束事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();

    // 清除长按定时器
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const touchDuration = Date.now() - this.touchStartTime;

    if (event.changedTouches.length === 1) {
      const touch = event.changedTouches[0];
      const element = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      ) as HTMLElement;

      // 处理UI按钮
      if (
        element &&
        (element.id === "restart-btn" || element.closest("#restart-btn"))
      ) {
        if (
          element === this.lastTouchTarget ||
          element.closest("#restart-btn") ===
            this.lastTouchTarget?.closest("#restart-btn")
        ) {
          this.onRestart?.();
        }
        return;
      }

      if (
        element &&
        (element.classList.contains("difficulty-btn") ||
          element.closest(".difficulty-btn"))
      ) {
        const btn = element.classList.contains("difficulty-btn")
          ? element
          : (element.closest(".difficulty-btn") as HTMLElement);
        if (
          btn === this.lastTouchTarget ||
          btn === this.lastTouchTarget?.closest(".difficulty-btn")
        ) {
          const difficulty = btn.dataset
            .difficulty as keyof typeof DIFFICULTY_CONFIGS;
          if (difficulty) {
            this.onDifficultyChange?.(difficulty);
          }
        }
        return;
      }

      // 处理游戏单元格 - 如果是短触摸，执行左键点击
      if (touchDuration < this.LONG_PRESS_DURATION) {
        const cellInfo = this.getCellFromTouch(touch);
        if (cellInfo) {
          this.onLeftClick?.(cellInfo.row, cellInfo.col);
        }
      }
    }

    this.lastTouchTarget = null;
  }

  /**
   * 处理触摸移动事件
   */
  private handleTouchMove(event: TouchEvent): void {
    // 如果有长按定时器且手指移动了，取消长按
    if (this.longPressTimer) {
      const touch = event.touches[0];
      const currentElement = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );

      // 如果移动到了不同的元素，取消长按
      if (currentElement !== this.lastTouchTarget) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    }
  }

  /**
   * 处理触摸取消事件
   */
  private handleTouchCancel(event: TouchEvent): void {
    event.preventDefault();

    // 清除长按定时器
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    this.lastTouchTarget = null;
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // 只在游戏容器获得焦点时处理键盘事件
    if (!this.container.contains(document.activeElement)) {
      return;
    }

    switch (event.key) {
      case "r":
      case "R":
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.onRestart?.();
        }
        break;
      case "F2":
        event.preventDefault();
        this.onRestart?.();
        break;
      case "1":
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.onDifficultyChange?.("beginner");
        }
        break;
      case "2":
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.onDifficultyChange?.("intermediate");
        }
        break;
      case "3":
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.onDifficultyChange?.("expert");
        }
        break;
    }
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    // 触发游戏板重新渲染以适应新的窗口大小
    const resizeEvent = new CustomEvent("game-resize");
    this.container.dispatchEvent(resizeEvent);
  }

  /**
   * 从鼠标事件获取单元格信息
   */
  private getCellFromEvent(
    event: MouseEvent
  ): { row: number; col: number } | null {
    const target = event.target as HTMLElement;
    return this.getCellFromElement(target);
  }

  /**
   * 从触摸事件获取单元格信息
   */
  private getCellFromTouch(touch: Touch): { row: number; col: number } | null {
    const element = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    ) as HTMLElement;
    return this.getCellFromElement(element);
  }

  /**
   * 从DOM元素获取单元格信息
   */
  private getCellFromElement(
    element: HTMLElement
  ): { row: number; col: number } | null {
    if (!element || !element.classList.contains("cell")) {
      return null;
    }

    const row = parseInt(element.dataset.row || "");
    const col = parseInt(element.dataset.col || "");

    if (isNaN(row) || isNaN(col)) {
      return null;
    }

    return { row, col };
  }

  /**
   * 移除所有事件监听器
   */
  private removeEventListeners(): void {
    this.container.removeEventListener(
      "mousedown",
      this.handleMouseDown.bind(this)
    );
    this.container.removeEventListener(
      "mouseup",
      this.handleMouseUp.bind(this)
    );
    this.container.removeEventListener(
      "contextmenu",
      this.handleContextMenu.bind(this)
    );
    this.container.removeEventListener("click", this.handleClick.bind(this));
    this.container.removeEventListener(
      "touchstart",
      this.handleTouchStart.bind(this)
    );
    this.container.removeEventListener(
      "touchend",
      this.handleTouchEnd.bind(this)
    );
    this.container.removeEventListener(
      "touchmove",
      this.handleTouchMove.bind(this)
    );
    this.container.removeEventListener(
      "touchcancel",
      this.handleTouchCancel.bind(this)
    );
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    window.removeEventListener("resize", this.handleResize.bind(this));
  }

  /**
   * 销毁输入处理器
   */
  destroy(): void {
    // 清除长按定时器
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // 移除事件监听器
    this.removeEventListeners();

    this.lastTouchTarget = null;
  }
}
