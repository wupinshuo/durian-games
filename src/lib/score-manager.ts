import { GameScore, ScoreManager } from "@/types/game";
import { StorageData } from "@/types/storage";

/**
 * 分数管理器实现
 * 处理游戏分数的本地存储和检索
 */
export class ScoreManagerImpl implements ScoreManager {
  private readonly storageKey = "game-platform-scores";

  /**
   * 保存游戏分数
   */
  saveScore(
    gameId: string,
    score: number,
    metadata?: Record<string, any>
  ): void {
    if (typeof score !== "number" || score < 0) {
      throw new Error("Score must be a non-negative number");
    }

    const gameScore: GameScore = {
      gameId,
      score,
      timestamp: Date.now(),
      metadata,
    };

    const data = this.getStorageData();
    if (!data.scores[gameId]) {
      data.scores[gameId] = [];
    }

    data.scores[gameId].push(gameScore);

    // 按分数降序排序，保留最多100条记录
    data.scores[gameId].sort((a, b) => b.score - a.score);
    data.scores[gameId] = data.scores[gameId].slice(0, 100);

    this.saveStorageData(data);
  }

  /**
   * 获取游戏最高分
   */
  getHighScore(gameId: string): GameScore | null {
    const scores = this.getAllScores(gameId);
    return scores.length > 0 ? scores[0] : null;
  }

  /**
   * 获取游戏所有分数记录
   */
  getAllScores(gameId: string): GameScore[] {
    const data = this.getStorageData();
    return data.scores[gameId] || [];
  }

  /**
   * 清除游戏分数
   */
  clearScores(gameId: string): void {
    const data = this.getStorageData();
    delete data.scores[gameId];
    this.saveStorageData(data);
  }

  /**
   * 获取存储数据
   */
  private getStorageData(): StorageData {
    try {
      if (typeof window === "undefined") {
        // 服务端渲染时返回默认数据
        return this.getDefaultStorageData();
      }

      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return this.getDefaultStorageData();
      }

      const parsed = JSON.parse(stored);
      return this.validateStorageData(parsed);
    } catch (error) {
      console.warn("Failed to load storage data, using defaults:", error);
      return this.getDefaultStorageData();
    }
  }

  /**
   * 保存存储数据
   */
  private saveStorageData(data: StorageData): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to save storage data:", error);
    }
  }

  /**
   * 获取默认存储数据
   */
  private getDefaultStorageData(): StorageData {
    return {
      scores: {},
      settings: {
        theme: "light",
        soundEnabled: true,
        language: "zh",
      },
      gameStates: {},
    };
  }

  /**
   * 验证存储数据结构
   */
  private validateStorageData(data: any): StorageData {
    if (!data || typeof data !== "object") {
      return this.getDefaultStorageData();
    }

    const defaultData = this.getDefaultStorageData();

    return {
      scores:
        data.scores && typeof data.scores === "object"
          ? data.scores
          : defaultData.scores,
      settings: {
        theme:
          data.settings?.theme === "light" || data.settings?.theme === "dark"
            ? data.settings.theme
            : defaultData.settings.theme,
        soundEnabled:
          typeof data.settings?.soundEnabled === "boolean"
            ? data.settings.soundEnabled
            : defaultData.settings.soundEnabled,
        language:
          data.settings?.language === "zh" || data.settings?.language === "en"
            ? data.settings.language
            : defaultData.settings.language,
      },
      gameStates:
        data.gameStates && typeof data.gameStates === "object"
          ? data.gameStates
          : defaultData.gameStates,
    };
  }
}

// 创建全局单例实例
export const scoreManager = new ScoreManagerImpl();
