import { GameModule, GameMetadata, GameRegistry } from "@/types/game";

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
 * 游戏注册中心实现
 * 管理游戏模块的注册、加载和元数据，支持动态导入和错误处理
 */
export class GameRegistryImpl implements GameRegistry {
  private games = new Map<string, () => Promise<GameModule>>();
  private metadata = new Map<string, GameMetadata>();
  private loadedGames = new Map<string, GameModule>();
  private loadingStates = new Map<string, GameLoadState>();
  private loadingPromises = new Map<string, Promise<GameModule>>();

  /**
   * 注册游戏模块
   */
  register(
    gameId: string,
    loader: () => Promise<GameModule>,
    metadata: GameMetadata
  ): void {
    if (this.games.has(gameId)) {
      throw new Error(`Game with id "${gameId}" is already registered`);
    }

    this.games.set(gameId, loader);
    this.metadata.set(gameId, metadata);
  }

  /**
   * 注销游戏模块
   */
  unregister(gameId: string): void {
    this.games.delete(gameId);
    this.metadata.delete(gameId);

    // 如果游戏已加载，也要清理
    const loadedGame = this.loadedGames.get(gameId);
    if (loadedGame) {
      try {
        loadedGame.unmount();
      } catch (error) {
        console.warn(`Error unmounting game "${gameId}":`, error);
      }
      this.loadedGames.delete(gameId);
    }

    // 清理加载状态
    this.loadingStates.delete(gameId);
    this.loadingPromises.delete(gameId);
  }

  /**
   * 获取游戏实例（动态加载）
   * 支持超时控制、错误处理和重复加载防护
   */
  async getGame(
    gameId: string,
    options: GameLoadOptions = {}
  ): Promise<GameModule> {
    if (!this.games.has(gameId)) {
      throw new Error(`Game with id "${gameId}" is not registered`);
    }

    const { timeout = 10000, forceReload = false } = options;

    // 如果已经加载过且不强制重新加载，直接返回
    if (this.loadedGames.has(gameId) && !forceReload) {
      return this.loadedGames.get(gameId)!;
    }

    // 如果正在加载中，返回现有的Promise
    if (this.loadingPromises.has(gameId) && !forceReload) {
      return this.loadingPromises.get(gameId)!;
    }

    // 创建加载状态
    const loadState: GameLoadState = {
      gameId,
      status: "loading",
      startTime: Date.now(),
    };
    this.loadingStates.set(gameId, loadState);

    // 创建加载Promise
    const loadPromise = this.loadGameWithTimeout(gameId, timeout);
    this.loadingPromises.set(gameId, loadPromise);

    try {
      const gameModule = await loadPromise;

      // 更新状态为已加载
      loadState.status = "loaded";
      this.loadedGames.set(gameId, gameModule);

      return gameModule;
    } catch (error) {
      // 更新状态为错误
      loadState.status = "error";
      loadState.error = error instanceof Error ? error.message : String(error);

      // 清理加载Promise
      this.loadingPromises.delete(gameId);

      throw error;
    } finally {
      // 清理加载Promise（成功情况下）
      this.loadingPromises.delete(gameId);
    }
  }

  /**
   * 带超时的游戏加载
   */
  private async loadGameWithTimeout(
    gameId: string,
    timeout: number
  ): Promise<GameModule> {
    const loader = this.games.get(gameId)!;

    // 创建超时Promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(`Game "${gameId}" loading timeout after ${timeout}ms`)
        );
      }, timeout);
    });

    try {
      // 竞争加载和超时
      const gameModule = await Promise.race([loader(), timeoutPromise]);

      // 验证游戏模块接口
      this.validateGameModule(gameModule);

      return gameModule;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load game "${gameId}": ${error.message}`);
      }
      throw new Error(`Failed to load game "${gameId}": ${String(error)}`);
    }
  }

  /**
   * 获取游戏加载状态
   */
  getLoadingState(gameId: string): GameLoadState | null {
    return this.loadingStates.get(gameId) || null;
  }

  /**
   * 获取所有加载状态
   */
  getAllLoadingStates(): GameLoadState[] {
    return Array.from(this.loadingStates.values());
  }

  /**
   * 清理游戏加载状态
   */
  clearLoadingState(gameId: string): void {
    this.loadingStates.delete(gameId);
  }

  /**
   * 预加载游戏（不阻塞）
   */
  async preloadGame(
    gameId: string,
    options: GameLoadOptions = {}
  ): Promise<void> {
    try {
      await this.getGame(gameId, options);
    } catch (error) {
      // 预加载失败不抛出错误，只记录日志
      console.warn(`Failed to preload game "${gameId}":`, error);
    }
  }

  /**
   * 获取所有游戏元数据
   */
  getAllGames(): GameMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * 检查游戏是否已注册
   */
  isRegistered(gameId: string): boolean {
    return this.games.has(gameId);
  }

  /**
   * 验证游戏模块是否符合接口要求
   */
  private validateGameModule(
    gameModule: any
  ): asserts gameModule is GameModule {
    if (!gameModule || typeof gameModule !== "object") {
      throw new Error("Game module must be an object");
    }

    if (typeof gameModule.id !== "string") {
      throw new Error("Game module must have a string id property");
    }

    if (typeof gameModule.name !== "string") {
      throw new Error("Game module must have a string name property");
    }

    if (typeof gameModule.mount !== "function") {
      throw new Error("Game module must have a mount method");
    }

    if (typeof gameModule.unmount !== "function") {
      throw new Error("Game module must have an unmount method");
    }
  }
}

// 创建全局单例实例
export const gameRegistry = new GameRegistryImpl();
