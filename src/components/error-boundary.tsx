"use client";

import React, { Component, ReactNode } from "react";
import { getGameChineseName } from "@/lib/game-names";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (
    error: Error,
    errorInfo: React.ErrorInfo,
    retry: () => void
  ) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: "platform" | "game";
  gameId?: string;
}

/**
 * 通用错误边界组件
 * 捕获子组件中的JavaScript错误并显示友好的错误界面
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 调用错误处理回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 记录错误到控制台
    console.error(
      `Error caught by ${this.props.level || "generic"} error boundary:`,
      error,
      errorInfo
    );
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo,
          this.retry
        );
      }

      // 根据错误边界级别显示不同的默认UI
      if (this.props.level === "game") {
        return (
          <GameErrorFallback
            error={this.state.error}
            gameId={this.props.gameId}
            onRetry={this.retry}
          />
        );
      }

      return (
        <PlatformErrorFallback error={this.state.error} onRetry={this.retry} />
      );
    }

    return this.props.children;
  }
}

interface GameErrorFallbackProps {
  error: Error;
  gameId?: string;
  onRetry: () => void;
}

/**
 * 游戏级错误回退组件
 * 当游戏崩溃时显示的错误界面
 */
function GameErrorFallback({ error, gameId, onRetry }: GameErrorFallbackProps) {
  const handleBackToHall = () => {
    // 触发返回游戏大厅的事件
    window.dispatchEvent(new CustomEvent("navigate-to-hall"));
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-50 p-8">
      <div className="text-center max-w-md">
        <div className="text-red-500 text-6xl mb-4">💥</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">游戏出现错误</h2>
        <p className="text-gray-600 mb-4">
          {gameId
            ? `游戏 "${getGameChineseName(gameId)}" 遇到了一个问题。`
            : "游戏遇到了一个问题。"}
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700 font-mono">{error.message}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加载游戏
          </button>
          <button
            onClick={handleBackToHall}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            返回游戏大厅
          </button>
        </div>

        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            技术详情
          </summary>
          <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      </div>
    </div>
  );
}

interface PlatformErrorFallbackProps {
  error: Error;
  onRetry: () => void;
}

/**
 * 平台级错误回退组件
 * 当平台核心功能出现错误时显示的错误界面
 */
function PlatformErrorFallback({ error, onRetry }: PlatformErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="text-center max-w-lg">
        <div className="text-red-500 text-8xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">平台出现错误</h1>
        <p className="text-gray-600 mb-6">
          游戏平台遇到了一个意外错误。我们为此带来的不便深表歉意。
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <h3 className="text-sm font-semibold text-red-800 mb-2">错误信息:</h3>
          <p className="text-sm text-red-700 font-mono">{error.message}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onRetry}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            重试
          </button>
          <button
            onClick={handleReload}
            className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            刷新页面
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>如果问题持续存在，请尝试:</p>
          <ul className="mt-2 space-y-1 text-left">
            <li>• 清除浏览器缓存</li>
            <li>• 使用其他浏览器</li>
            <li>• 检查网络连接</li>
          </ul>
        </div>

        <details className="mt-8 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            技术详情
          </summary>
          <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      </div>
    </div>
  );
}
