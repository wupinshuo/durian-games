"use client";

import React from "react";
import { ErrorBoundary } from "./error-boundary";

interface GameErrorBoundaryProps {
  children: React.ReactNode;
  gameId: string;
  onGameError?: (gameId: string, error: Error) => void;
  onReturnToHall?: () => void;
}

/**
 * 游戏专用错误边界组件
 * 为游戏提供专门的错误处理和恢复机制
 */
export function GameErrorBoundary({
  children,
  gameId,
  onGameError,
  onReturnToHall,
}: GameErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // 记录游戏特定的错误信息
    console.error(`Game "${gameId}" crashed:`, error, errorInfo);

    // 调用游戏错误回调
    if (onGameError) {
      onGameError(gameId, error);
    }

    // 可以在这里添加错误报告逻辑
    // 例如发送错误报告到服务器
  };

  const customFallback = (
    error: Error,
    errorInfo: React.ErrorInfo,
    retry: () => void
  ) => {
    return (
      <GameCrashScreen
        gameId={gameId}
        error={error}
        onRetry={retry}
        onReturnToHall={onReturnToHall}
      />
    );
  };

  return (
    <ErrorBoundary
      level="game"
      gameId={gameId}
      onError={handleError}
      fallback={customFallback}
    >
      {children}
    </ErrorBoundary>
  );
}

interface GameCrashScreenProps {
  gameId: string;
  error: Error;
  onRetry: () => void;
  onReturnToHall?: () => void;
}

/**
 * 游戏崩溃屏幕组件
 * 显示游戏崩溃时的用户界面
 */
function GameCrashScreen({
  gameId,
  error,
  onRetry,
  onReturnToHall,
}: GameCrashScreenProps) {
  const getGameDisplayName = (id: string) => {
    const gameNames: Record<string, string> = {
      minesweeper: "扫雷",
      "2048": "2048",
      tetris: "俄罗斯方块",
    };
    return gameNames[id] || id;
  };

  const getErrorSuggestion = (error: Error) => {
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("fetch")) {
      return "请检查网络连接后重试";
    }

    if (message.includes("memory") || message.includes("heap")) {
      return "游戏占用内存过多，建议刷新页面";
    }

    if (message.includes("timeout")) {
      return "游戏加载超时，请重试";
    }

    return "游戏遇到意外错误，请重试";
  };

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="text-center max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* 错误图标 */}
        <div className="text-red-500 text-6xl mb-4">🎮💥</div>

        {/* 错误标题 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {getGameDisplayName(gameId)} 崩溃了
        </h2>

        {/* 错误描述 */}
        <p className="text-gray-600 mb-4">{getErrorSuggestion(error)}</p>

        {/* 错误详情 */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 text-left">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-mono">{error.message}</p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            重新加载游戏
          </button>

          {onReturnToHall && (
            <button
              onClick={onReturnToHall}
              className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              返回游戏大厅
            </button>
          )}
        </div>

        {/* 帮助信息 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            遇到问题？
          </h4>
          <ul className="text-xs text-blue-700 space-y-1 text-left">
            <li>• 尝试刷新浏览器页面</li>
            <li>• 检查浏览器是否支持该游戏</li>
            <li>• 清除浏览器缓存和Cookie</li>
            <li>• 确保JavaScript已启用</li>
          </ul>
        </div>

        {/* 技术详情（可折叠） */}
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 select-none">
            查看技术详情
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-600 overflow-auto max-h-32">
            <div className="mb-2">
              <strong>游戏ID:</strong> {gameId}
            </div>
            <div className="mb-2">
              <strong>错误类型:</strong> {error.name}
            </div>
            <div className="mb-2">
              <strong>时间:</strong> {new Date().toLocaleString()}
            </div>
            <div>
              <strong>堆栈跟踪:</strong>
              <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
