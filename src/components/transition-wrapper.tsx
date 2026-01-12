"use client";

import React, { ReactNode, useEffect, useState } from "react";

interface TransitionWrapperProps {
  children: ReactNode;
  isVisible: boolean;
  duration?: number;
  type?: "fade" | "slide" | "scale" | "slideUp";
  className?: string;
}

/**
 * 过渡动画包装器组件
 * 为内容切换提供流畅的过渡效果
 */
export function TransitionWrapper({
  children,
  isVisible,
  duration = 300,
  type = "fade",
  className = "",
}: TransitionWrapperProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // 延迟一帧以确保DOM更新
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // 等待动画完成后再移除DOM元素
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  if (!shouldRender) return null;

  const getTransitionClasses = () => {
    const baseClasses = `transition-all duration-${duration} ease-in-out`;

    switch (type) {
      case "fade":
        return `${baseClasses} ${isAnimating ? "opacity-100" : "opacity-0"}`;
      case "slide":
        return `${baseClasses} transform ${
          isAnimating
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`;
      case "slideUp":
        return `${baseClasses} transform ${
          isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`;
      case "scale":
        return `${baseClasses} transform ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={`${getTransitionClasses()} ${className}`}>{children}</div>
  );
}

interface PageTransitionProps {
  children: ReactNode;
  currentKey: string;
  className?: string;
}

/**
 * 页面过渡组件
 * 为页面切换提供流畅的过渡效果
 */
export function PageTransition({
  children,
  currentKey,
  className = "",
}: PageTransitionProps) {
  const [displayedKey, setDisplayedKey] = useState(currentKey);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (currentKey !== displayedKey) {
      setIsTransitioning(true);

      // 淡出当前内容
      const fadeOutTimer = setTimeout(() => {
        setDisplayedKey(currentKey);

        // 淡入新内容
        const fadeInTimer = setTimeout(() => {
          setIsTransitioning(false);
        }, 50);

        return () => clearTimeout(fadeInTimer);
      }, 150);

      return () => clearTimeout(fadeOutTimer);
    }
  }, [currentKey, displayedKey]);

  return (
    <div
      className={`transition-opacity duration-300 ${
        isTransitioning ? "opacity-0" : "opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * 游戏切换过渡组件
 * 专门为游戏切换优化的过渡效果
 */
export function GameTransition({
  children,
  gameId,
  isLoading,
}: {
  children: ReactNode;
  gameId: string;
  isLoading: boolean;
}) {
  return (
    <div className="relative w-full h-full">
      {/* 加载状态覆盖层 */}
      <TransitionWrapper
        isVisible={isLoading}
        type="fade"
        className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-10 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">正在切换游戏...</p>
        </div>
      </TransitionWrapper>

      {/* 游戏内容 */}
      <TransitionWrapper
        isVisible={!isLoading}
        type="slideUp"
        className="w-full h-full"
      >
        {children}
      </TransitionWrapper>
    </div>
  );
}
