"use client";

import React, { useState, useEffect } from "react";
import { GameContainer } from "./game-container";
import { Navigation } from "./navigation";
import { GameHall } from "./game-hall";
import { PlatformErrorBoundary } from "./platform-error-boundary";
import { GameErrorBoundary } from "./game-error-boundary";

/**
 * 平台Shell组件
 * 提供整个游戏平台的主要布局和导航结构
 */
export function PlatformShell() {
  const [currentView, setCurrentView] = useState<"hall" | "game">("hall");
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  /**
   * 导航到游戏大厅
   */
  const navigateToHall = () => {
    setCurrentView("hall");
    setCurrentGameId(null);
  };

  /**
   * 导航到指定游戏
   */
  const navigateToGame = (gameId: string) => {
    setCurrentGameId(gameId);
    setCurrentView("game");
  };

  /**
   * 处理游戏错误
   */
  const handleGameError = (gameId: string, error: Error) => {
    console.error(`Game ${gameId} encountered an error:`, error);
    // 可以在这里添加错误报告逻辑
  };

  // 监听全局导航事件
  useEffect(() => {
    const handleNavigateToHall = () => {
      navigateToHall();
    };

    window.addEventListener("navigate-to-hall", handleNavigateToHall);

    return () => {
      window.removeEventListener("navigate-to-hall", handleNavigateToHall);
    };
  }, []);

  return (
    <PlatformErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* 顶部导航栏 */}
        <Navigation
          currentView={currentView}
          currentGameId={currentGameId}
          onNavigateToHall={navigateToHall}
        />

        {/* 主内容区域 */}
        <main className="flex-1 flex flex-col">
          {currentView === "hall" ? (
            <GameHall onGameSelect={navigateToGame} />
          ) : (
            <GameErrorBoundary
              gameId={currentGameId!}
              onGameError={handleGameError}
              onReturnToHall={navigateToHall}
            >
              <GameContainer
                gameId={currentGameId!}
                onBackToHall={navigateToHall}
              />
            </GameErrorBoundary>
          )}
        </main>

        {/* 底部信息栏 */}
        <footer className="bg-white border-t border-gray-200 p-3 sm:p-4">
          <div className="max-w-6xl mx-auto text-center text-xs sm:text-sm text-gray-500">
            网页游戏平台 - 模块化游戏体验
          </div>
        </footer>
      </div>
    </PlatformErrorBoundary>
  );
}
