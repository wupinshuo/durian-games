/**
 * 游戏模块统一接口
 * 所有游戏必须实现此接口以集成到平台中
 */
export interface GameModule {
  /** 游戏唯一标识符 */
  id: string;
  /** 游戏显示名称 */
  name: string;
  /** 游戏描述 */
  description?: string;
  /** 挂载游戏到指定容器 */
  mount(container: HTMLElement): void;
  /** 卸载游戏并清理所有资源 */
  unmount(): void;
}

/**
 * 游戏元数据接口
 * 用于游戏大厅显示和管理
 */
export interface GameMetadata {
  /** 游戏唯一标识符 */
  id: string;
  /** 游戏显示名称 */
  name: string;
  /** 游戏描述 */
  description: string;
  /** 游戏缩略图URL */
  thumbnail?: string;
  /** 游戏分类 */
  category: string;
  /** 游戏难度 */
  difficulty: "easy" | "medium" | "hard";
  /** 支持的控制方式 */
  controls: ("keyboard" | "mouse" | "touch")[];
}

/**
 * 游戏分数接口
 */
export interface GameScore {
  /** 游戏ID */
  gameId: string;
  /** 分数值 */
  score: number;
  /** 时间戳 */
  timestamp: number;
  /** 游戏特定的额外数据 */
  metadata?: Record<string, any>;
}

/**
 * 游戏加载选项
 */
export interface GameLoadOptions {
  /** 加载超时时间（毫秒），默认10秒 */
  timeout?: number;
  /** 是否强制重新加载，默认false */
  forceReload?: boolean;
}

/**
 * 游戏加载状态
 */
export interface GameLoadState {
  gameId: string;
  status: "loading" | "loaded" | "error";
  error?: string;
  startTime: number;
}

/**
 * 游戏注册中心接口
 * 管理游戏的注册、加载和元数据
 */
export interface GameRegistry {
  /** 注册游戏模块 */
  register(
    gameId: string,
    loader: () => Promise<GameModule>,
    metadata: GameMetadata
  ): void;
  /** 注销游戏模块 */
  unregister(gameId: string): void;
  /** 获取游戏实例 */
  getGame(gameId: string, options?: GameLoadOptions): Promise<GameModule>;
  /** 获取所有游戏元数据 */
  getAllGames(): GameMetadata[];
  /** 检查游戏是否已注册 */
  isRegistered(gameId: string): boolean;
  /** 获取游戏加载状态 */
  getLoadingState(gameId: string): GameLoadState | null;
  /** 获取所有加载状态 */
  getAllLoadingStates(): GameLoadState[];
  /** 清理游戏加载状态 */
  clearLoadingState(gameId: string): void;
  /** 预加载游戏 */
  preloadGame(gameId: string, options?: GameLoadOptions): Promise<void>;
}

/**
 * 分数管理器接口
 * 处理游戏分数的存储和检索
 */
export interface ScoreManager {
  /** 保存游戏分数 */
  saveScore(
    gameId: string,
    score: number,
    metadata?: Record<string, any>
  ): void;
  /** 获取游戏最高分 */
  getHighScore(gameId: string): GameScore | null;
  /** 获取游戏所有分数记录 */
  getAllScores(gameId: string): GameScore[];
  /** 清除游戏分数 */
  clearScores(gameId: string): void;
}

/**
 * 游戏容器管理器接口
 * 管理游戏的挂载和卸载
 */
export interface GameContainer {
  /** 挂载游戏到容器 */
  mountGame(gameId: string, options?: GameLoadOptions): Promise<void>;
  /** 卸载当前游戏 */
  unmountCurrentGame(): void;
  /** 获取容器元素 */
  getContainer(): HTMLElement;
  /** 获取当前游戏ID */
  getCurrentGameId(): string | null;
}
