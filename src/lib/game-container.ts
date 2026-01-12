import { GameContainer, GameModule, GameLoadOptions } from "@/types/game";
import { gameRegistry } from "./game-registry";
import { getGameChineseName } from "./game-names";

/**
 * 游戏容器管理器实现
 * 管理游戏的挂载、卸载和生命周期，支持加载状态和错误处理
 */
export class GameContainerImpl implements GameContainer {
  private container: HTMLElement;
  private currentGame: GameModule | null = null;
  private currentGameId: string | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * 挂载游戏到容器
   */
  async mountGame(gameId: string, options?: GameLoadOptions): Promise<void> {
    try {
      // 如果当前已有游戏，先卸载
      if (this.currentGame) {
        this.unmountCurrentGame();
      }

      // 显示加载状态
      this.showLoadingState(gameId);

      // 加载新游戏
      const game = await gameRegistry.getGame(gameId, options);

      // 清空容器，准备挂载新游戏
      this.container.innerHTML = "";

      // 挂载新游戏
      game.mount(this.container);

      this.currentGame = game;
      this.currentGameId = gameId;

      // 清理加载状态
      gameRegistry.clearLoadingState(gameId);

      console.log(`Game ${gameId} mounted successfully`);
    } catch (error) {
      // 如果挂载失败，确保清理状态
      this.currentGame = null;
      this.currentGameId = null;

      this.showErrorState(
        gameId,
        error instanceof Error ? error.message : String(error)
      );

      throw new Error(`Failed to mount game "${gameId}": ${error}`);
    }
  }
  /**
   * 显示加载状态
   */
  private showLoadingState(gameId: string): void {
    const chineseName = getGameChineseName(gameId);
    this.container.innerHTML = `
      <div class="flex items-center justify-center h-full animate-fade-in">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-gray-600">正在加载游戏...</p>
          <p class="text-sm text-gray-500 mt-2">${chineseName}</p>
        </div>
      </div>
    `;
  }

  /**
   * 显示错误状态
   */
  private showErrorState(gameId: string, error: string): void {
    const chineseName = getGameChineseName(gameId);
    this.container.innerHTML = `
      <div class="flex items-center justify-center h-full animate-fade-in">
        <div class="text-center">
          <div class="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">游戏加载失败</h3>
          <p class="text-gray-600 mb-2">${chineseName}</p>
          <p class="text-gray-600 mb-4 text-sm">${error}</p>
          <button 
            onclick="window.location.reload()" 
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 卸载当前游戏
   */
  unmountCurrentGame(): void {
    if (this.currentGame) {
      try {
        // 卸载游戏
        this.currentGame.unmount();
      } catch (error) {
        console.warn(`Error unmounting game "${this.currentGameId}":`, error);
      }

      this.currentGame = null;
      this.currentGameId = null;
    }

    // 清空容器
    this.container.innerHTML = "";
  }

  /**
   * 获取容器元素
   */
  getContainer(): HTMLElement {
    return this.container;
  }

  /**
   * 获取当前游戏ID
   */
  getCurrentGameId(): string | null {
    return this.currentGameId;
  }

  /**
   * 检查是否有游戏正在运行
   */
  hasActiveGame(): boolean {
    return this.currentGame !== null;
  }

  /**
   * 销毁容器管理器
   */
  destroy(): void {
    // 卸载当前游戏
    this.unmountCurrentGame();
  }
}
