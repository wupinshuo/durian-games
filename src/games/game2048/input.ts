/**
 * 2048游戏输入处理
 * 处理键盘和触摸输入
 */

import { Direction } from "./types";

/**
 * 2048游戏输入处理器
 */
export class Game2048InputHandler {
  private container: HTMLElement;
  private isEnabled = true;

  // 事件回调
  public onMove?: (direction: Direction) => void;

  // 触摸相关
  private touchStartX = 0;
  private touchStartY = 0;
  private minSwipeDistance = 30;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 键盘事件
    document.addEventListener("keydown", this.handleKeyDown);

    // 触摸事件
    this.container.addEventListener("touchstart", this.handleTouchStart, {
      passive: false,
    });
    this.container.addEventListener("touchend", this.handleTouchEnd, {
      passive: false,
    });

    // 鼠标事件（用于桌面端的拖拽）
    this.container.addEventListener("mousedown", this.handleMouseDown);
    this.container.addEventListener("mouseup", this.handleMouseUp);

    // 防止默认的滚动行为
    this.container.addEventListener("touchmove", this.preventDefaultTouch, {
      passive: false,
    });
  }

  /**
   * 处理键盘按键
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isEnabled) return;

    let direction: Direction | null = null;

    switch (event.key) {
      case "ArrowUp":
      case "w":
      case "W":
        direction = "up";
        break;
      case "ArrowDown":
      case "s":
      case "S":
        direction = "down";
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        direction = "left";
        break;
      case "ArrowRight":
      case "d":
      case "D":
        direction = "right";
        break;
    }

    if (direction) {
      event.preventDefault();
      this.onMove?.(direction);
    }
  };

  /**
   * 处理触摸开始
   */
  private handleTouchStart = (event: TouchEvent): void => {
    if (!this.isEnabled || event.touches.length !== 1) return;

    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;

    event.preventDefault();
  };

  /**
   * 处理触摸结束
   */
  private handleTouchEnd = (event: TouchEvent): void => {
    if (!this.isEnabled || event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // 检查是否达到最小滑动距离
    if (Math.max(absDeltaX, absDeltaY) < this.minSwipeDistance) {
      return;
    }

    let direction: Direction | null = null;

    // 确定滑动方向
    if (absDeltaX > absDeltaY) {
      // 水平滑动
      direction = deltaX > 0 ? "right" : "left";
    } else {
      // 垂直滑动
      direction = deltaY > 0 ? "down" : "up";
    }

    if (direction) {
      event.preventDefault();
      this.onMove?.(direction);
    }
  };

  /**
   * 处理鼠标按下（用于桌面端拖拽）
   */
  private handleMouseDown = (event: MouseEvent): void => {
    if (!this.isEnabled) return;

    this.touchStartX = event.clientX;
    this.touchStartY = event.clientY;

    // 添加临时的鼠标移动监听器
    document.addEventListener("mousemove", this.handleMouseMove);
  };

  /**
   * 处理鼠标移动
   */
  private handleMouseMove = (event: MouseEvent): void => {
    // 防止文本选择
    event.preventDefault();
  };

  /**
   * 处理鼠标释放
   */
  private handleMouseUp = (event: MouseEvent): void => {
    if (!this.isEnabled) return;

    // 移除临时的鼠标移动监听器
    document.removeEventListener("mousemove", this.handleMouseMove);

    const deltaX = event.clientX - this.touchStartX;
    const deltaY = event.clientY - this.touchStartY;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // 检查是否达到最小拖拽距离
    if (Math.max(absDeltaX, absDeltaY) < this.minSwipeDistance) {
      return;
    }

    let direction: Direction | null = null;

    // 确定拖拽方向
    if (absDeltaX > absDeltaY) {
      // 水平拖拽
      direction = deltaX > 0 ? "right" : "left";
    } else {
      // 垂直拖拽
      direction = deltaY > 0 ? "down" : "up";
    }

    if (direction) {
      this.onMove?.(direction);
    }
  };

  /**
   * 防止默认触摸行为
   */
  private preventDefaultTouch = (event: TouchEvent): void => {
    event.preventDefault();
  };

  /**
   * 启用输入
   */
  enable(): void {
    this.isEnabled = true;
  }

  /**
   * 禁用输入
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * 检查是否启用
   */
  isInputEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 设置最小滑动距离
   */
  setMinSwipeDistance(distance: number): void {
    this.minSwipeDistance = Math.max(10, distance);
  }

  /**
   * 销毁输入处理器
   */
  destroy(): void {
    // 移除键盘事件
    document.removeEventListener("keydown", this.handleKeyDown);

    // 移除触摸事件
    this.container.removeEventListener("touchstart", this.handleTouchStart);
    this.container.removeEventListener("touchend", this.handleTouchEnd);
    this.container.removeEventListener("touchmove", this.preventDefaultTouch);

    // 移除鼠标事件
    this.container.removeEventListener("mousedown", this.handleMouseDown);
    this.container.removeEventListener("mouseup", this.handleMouseUp);
    document.removeEventListener("mousemove", this.handleMouseMove);

    // 清除回调
    this.onMove = undefined;
  }
}
