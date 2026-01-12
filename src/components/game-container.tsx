"use client";

import React, { useEffect, useRef, useState } from "react";
import { GameContainerImpl } from "@/lib/game-container";
import { GameLoadOptions, GameScore } from "@/types/game";
import { scoreManager } from "@/lib/score-manager";
import { LoadingIndicator } from "./loading-indicator";
import { getGameChineseName } from "@/lib/game-names";

interface GameContainerProps {
  gameId: string;
  onBackToHall: () => void;
  loadOptions?: GameLoadOptions;
}

/**
 * 游戏容器组件
 * 负责游戏的挂载、卸载和生命周期管理
 */
export function GameContainer({
  gameId,
  onBackToHall,
  loadOptions,
}: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<GameContainerImpl | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<GameScore | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const mountGame = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 加载最高分
        const highScoreData = scoreManager.getHighScore(gameId);
        setHighScore(highScoreData);

        // 创建游戏容器管理器
        if (!gameContainerRef.current && containerRef.current) {
          gameContainerRef.current = new GameContainerImpl(
            containerRef.current
          );
        }

        // 挂载游戏
        if (gameContainerRef.current) {
          await gameContainerRef.current.mountGame(gameId, loadOptions);
          setIsLoading(false);
        } else {
          throw new Error("Game container not initialized");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setIsLoading(false);
        console.error("Failed to mount game:", err);
      }
    };

    mountGame();

    // 清理函数
    return () => {
      if (gameContainerRef.current) {
        gameContainerRef.current.unmountCurrentGame();
      }
    };
  }, [gameId, loadOptions]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (gameContainerRef.current) {
        gameContainerRef.current.destroy();
        gameContainerRef.current = null;
      }
    };
  }, []);

  // 定期更新最高分（每5秒检查一次）
  useEffect(() => {
    const interval = setInterval(() => {
      const latestHighScore = scoreManager.getHighScore(gameId);
      setHighScore(latestHighScore);
    }, 5000);

    return () => clearInterval(interval);
  }, [gameId]);

  // 重试加载游戏
  const retryLoad = () => {
    if (containerRef.current && gameContainerRef.current) {
      setError(null);
      setIsLoading(true);

      gameContainerRef.current
        .mountGame(gameId, loadOptions)
        .then(() => {
          setIsLoading(false);
        })
        .catch((err) => {
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(errorMessage);
          setIsLoading(false);
          console.error("Retry failed:", err);
        });
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-white">
        {/* 游戏控制栏 */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {getGameChineseName(gameId)}
              </h2>
              {isLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>加载中...</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* 分数显示 */}
              {highScore && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">最高分:</span>{" "}
                    <span className="font-bold text-blue-600">
                      {highScore.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                {error && (
                  <button
                    type="button"
                    onClick={retryLoad}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    重试
                  </button>
                )}
                <button
                  type="button"
                  onClick={onBackToHall}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  返回大厅
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 游戏内容区域 */}
        <div className="flex-1 relative">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  游戏加载失败
                </h3>
                <p className="text-gray-600 mb-4 max-w-md">{error}</p>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={retryLoad}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    重新加载
                  </button>
                  <button
                    type="button"
                    onClick={onBackToHall}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    返回大厅
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div ref={containerRef} className="game-container" />
          )}
        </div>
      </div>
    </>
  );
}
