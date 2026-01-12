"use client";

import React from "react";
import { getGameChineseName } from "@/lib/game-names";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  progress?: number;
  className?: string;
}

/**
 * 增强的加载指示器组件
 * 支持不同尺寸、进度显示和自定义消息
 */
export function LoadingIndicator({
  size = "md",
  message = "加载中...",
  progress,
  className = "",
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      {/* 旋转加载器 */}
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
        />
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* 加载消息 */}
      <div className="text-center">
        <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
          {message}
        </p>
        {progress !== undefined && (
          <div className="mt-2 w-32 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface GameLoadingOverlayProps {
  gameId: string;
  isVisible: boolean;
  progress?: number;
  onCancel?: () => void;
}

/**
 * 游戏加载覆盖层组件
 * 在游戏切换时显示的全屏加载界面
 */
export function GameLoadingOverlay({
  gameId,
  isVisible,
  progress,
  onCancel,
}: GameLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
      <div className="text-center max-w-md mx-4">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            正在加载游戏
          </h2>
          <p className="text-gray-600 text-lg">{getGameChineseName(gameId)}</p>
        </div>

        <LoadingIndicator
          size="lg"
          message="请稍候，游戏即将开始..."
          progress={progress}
        />

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-6 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            取消加载
          </button>
        )}
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

/**
 * 骨架屏组件
 * 用于内容加载时的占位显示
 */
export function Skeleton({ className = "", animate = true }: SkeletonProps) {
  return (
    <div
      className={`bg-gray-200 rounded ${
        animate ? "animate-pulse" : ""
      } ${className}`}
    />
  );
}

/**
 * 游戏卡片骨架屏
 */
export function GameCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* 缩略图骨架 */}
      <Skeleton className="aspect-video w-full" />

      {/* 内容骨架 */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}
