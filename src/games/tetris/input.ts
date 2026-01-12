/**
 * 俄罗斯方块输入处理器
 * 处理键盘输入和触摸控制
 */

export type TetrisInputAction =
  | "move-left"
  | "move-right"
  | "move-down"
  | "rotate"
  | "hard-drop"
  | "pause"
  | "resume"
  | "restart";

export class TetrisInputHandler {
  private container: HTMLElement;
  private eventListeners: ((action: TetrisInputAction) => void)[] = [];
  private keyStates: Set<string> = new Set();
  private repeatIntervals: Map<string, number> = new Map();

  // 按键重复配置
  private readonly REPEAT_DELAY = 200; // 首次重复延迟
  private readonly REPEAT_INTERVAL = 50; // 重复间隔

  // 触摸控制相关
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private readonly SWIPE_THRESHOLD = 50;
  private readonly TAP_THRESHOLD = 200;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupEventListeners();
    this.createTouchControls();
  }

  /**
   * 添加输入事件监听器
   */
  addEventListener(listener: (action: TetrisInputAction) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * 移除输入事件监听器
   */
  removeEventListener(listener: (action: TetrisInputAction) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * 触发输入事件
   */
  private emitAction(action: TetrisInputAction): void {
    this.eventListeners.forEach((listener) => listener(action));
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 键盘事件
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));

    // 触摸事件
    this.container.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      { passive: false }
    );
    this.container.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      { passive: false }
    );
    this.container.addEventListener(
      "touchend",
      this.handleTouchEnd.bind(this),
      { passive: false }
    );

    // 防止页面滚动
    this.container.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    // 失去焦点时清除按键状态
    window.addEventListener("blur", this.clearKeyStates.bind(this));
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    // 防止重复触发
    if (this.keyStates.has(key)) {
      return;
    }

    this.keyStates.add(key);

    // 处理按键映射
    const action = this.getActionFromKey(key);
    if (action) {
      event.preventDefault();
      this.emitAction(action);

      // 设置按键重复（仅对移动操作）
      if (this.isRepeatableAction(action)) {
        this.startKeyRepeat(key, action);
      }
    }
  }

  /**
   * 处理键盘释放事件
   */
  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    this.keyStates.delete(key);
    this.stopKeyRepeat(key);
  }

  /**
   * 获取按键对应的动作
   */
  private getActionFromKey(key: string): TetrisInputAction | null {
    const keyMap: Record<string, TetrisInputAction> = {
      // 方向键
      arrowleft: "move-left",
      arrowright: "move-right",
      arrowdown: "move-down",
      arrowup: "rotate",

      // WASD
      a: "move-left",
      d: "move-right",
      s: "move-down",
      w: "rotate",

      // 其他控制
      " ": "hard-drop", // 空格键
      spacebar: "hard-drop",
      p: "pause",
      r: "restart",
    };

    return keyMap[key] || null;
  }

  /**
   * 检查动作是否可重复
   */
  private isRepeatableAction(action: TetrisInputAction): boolean {
    return ["move-left", "move-right", "move-down"].includes(action);
  }

  /**
   * 开始按键重复
   */
  private startKeyRepeat(key: string, action: TetrisInputAction): void {
    this.stopKeyRepeat(key); // 清除可能存在的重复

    const repeatId = window.setTimeout(() => {
      const intervalId = window.setInterval(() => {
        if (this.keyStates.has(key)) {
          this.emitAction(action);
        } else {
          this.stopKeyRepeat(key);
        }
      }, this.REPEAT_INTERVAL);

      this.repeatIntervals.set(key, intervalId);
    }, this.REPEAT_DELAY);

    this.repeatIntervals.set(key, repeatId);
  }

  /**
   * 停止按键重复
   */
  private stopKeyRepeat(key: string): void {
    const intervalId = this.repeatIntervals.get(key);
    if (intervalId) {
      clearInterval(intervalId);
      clearTimeout(intervalId);
      this.repeatIntervals.delete(key);
    }
  }

  /**
   * 清除所有按键状态
   */
  private clearKeyStates(): void {
    this.keyStates.clear();
    this.repeatIntervals.forEach((id) => {
      clearInterval(id);
      clearTimeout(id);
    });
    this.repeatIntervals.clear();
  }

  /**
   * 处理触摸开始事件
   */
  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchStartTime = Date.now();
    }
  }

  /**
   * 处理触摸移动事件
   */
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault(); // 防止页面滚动
  }

  /**
   * 处理触摸结束事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length === 1) {
      const touch = event.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - this.touchStartX;
      const deltaY = endY - this.touchStartY;
      const deltaTime = endTime - this.touchStartTime;

      // 检查是否为点击（短时间且移动距离小）
      if (
        deltaTime < this.TAP_THRESHOLD &&
        Math.abs(deltaX) < 20 &&
        Math.abs(deltaY) < 20
      ) {
        this.handleTap(endX, endY);
        return;
      }

      // 检查滑动手势
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > this.SWIPE_THRESHOLD || absY > this.SWIPE_THRESHOLD) {
        if (absX > absY) {
          // 水平滑动
          if (deltaX > 0) {
            this.emitAction("move-right");
          } else {
            this.emitAction("move-left");
          }
        } else {
          // 垂直滑动
          if (deltaY > 0) {
            this.emitAction("hard-drop");
          } else {
            this.emitAction("rotate");
          }
        }
      }
    }
  }

  /**
   * 处理点击事件
   */
  private handleTap(x: number, y: number): void {
    // 获取容器位置
    const rect = this.container.getBoundingClientRect();
    const relativeX = x - rect.left;
    const relativeY = y - rect.top;

    // 简单的区域划分：左侧旋转，右侧下落
    const centerX = rect.width / 2;

    if (relativeX < centerX) {
      this.emitAction("rotate");
    } else {
      this.emitAction("move-down");
    }
  }

  /**
   * 创建触摸控制界面
   */
  private createTouchControls(): void {
    // 检查是否为移动设备
    if (!this.isMobileDevice()) {
      return;
    }

    const controlsContainer = document.createElement("div");
    controlsContainer.className = "tetris-touch-controls";

    // 创建控制按钮
    const controls = [
      {
        action: "move-left",
        text: "←",
        className: "tetris-touch-btn tetris-touch-left",
      },
      {
        action: "rotate",
        text: "↻",
        className: "tetris-touch-btn tetris-touch-rotate",
      },
      {
        action: "move-right",
        text: "→",
        className: "tetris-touch-btn tetris-touch-right",
      },
      {
        action: "move-down",
        text: "↓",
        className: "tetris-touch-btn tetris-touch-down",
      },
      {
        action: "hard-drop",
        text: "⬇",
        className: "tetris-touch-btn tetris-touch-drop",
      },
      {
        action: "pause",
        text: "⏸",
        className: "tetris-touch-btn tetris-touch-pause",
      },
    ];

    controls.forEach(({ action, text, className }) => {
      const button = document.createElement("button");
      button.className = className;
      button.textContent = text;
      button.type = "button";

      // 防止默认行为
      button.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.emitAction(action as TetrisInputAction);
      });

      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.emitAction(action as TetrisInputAction);
      });

      controlsContainer.appendChild(button);
    });

    // 添加样式
    this.addTouchControlStyles();

    // 添加到容器
    this.container.appendChild(controlsContainer);
  }

  /**
   * 检查是否为移动设备
   */
  private isMobileDevice(): boolean {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  }

  /**
   * 添加触摸控制样式
   */
  private addTouchControlStyles(): void {
    const style = document.createElement("style");
    style.textContent = `
      .tetris-touch-controls {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 10px;
        z-index: 1000;
        padding: 15px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 15px;
        backdrop-filter: blur(10px);
      }

      .tetris-touch-btn {
        width: 50px;
        height: 50px;
        border: none;
        border-radius: 10px;
        background: #333;
        color: #fff;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.1s ease;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .tetris-touch-btn:active {
        background: #555;
        transform: scale(0.95);
      }

      .tetris-touch-left {
        grid-column: 1;
        grid-row: 1;
      }

      .tetris-touch-rotate {
        grid-column: 2;
        grid-row: 1;
      }

      .tetris-touch-right {
        grid-column: 3;
        grid-row: 1;
      }

      .tetris-touch-down {
        grid-column: 1;
        grid-row: 2;
      }

      .tetris-touch-drop {
        grid-column: 2;
        grid-row: 2;
      }

      .tetris-touch-pause {
        grid-column: 3;
        grid-row: 2;
      }

      /* 隐藏在桌面端 */
      @media (min-width: 769px) {
        .tetris-touch-controls {
          display: none;
        }
      }

      /* 小屏幕适配 */
      @media (max-width: 480px) {
        .tetris-touch-controls {
          bottom: 10px;
          gap: 8px;
          padding: 12px;
        }

        .tetris-touch-btn {
          width: 45px;
          height: 45px;
          font-size: 18px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 销毁输入处理器
   */
  destroy(): void {
    // 移除事件监听器
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    document.removeEventListener("keyup", this.handleKeyUp.bind(this));
    window.removeEventListener("blur", this.clearKeyStates.bind(this));

    this.container.removeEventListener(
      "touchstart",
      this.handleTouchStart.bind(this)
    );
    this.container.removeEventListener(
      "touchmove",
      this.handleTouchMove.bind(this)
    );
    this.container.removeEventListener(
      "touchend",
      this.handleTouchEnd.bind(this)
    );

    // 清除状态
    this.clearKeyStates();
    this.eventListeners = [];

    // 移除触摸控制
    const touchControls = this.container.querySelector(
      ".tetris-touch-controls"
    );
    if (touchControls) {
      touchControls.remove();
    }
  }
}
