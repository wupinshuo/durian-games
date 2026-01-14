"use client";

import React, { useState, useEffect } from "react";
import { GameContainer } from "./game-container";
import { Navigation } from "./navigation";
import { GameHall } from "./game-hall";
import { Footer } from "./footer";
import { PlatformErrorBoundary } from "./platform-error-boundary";
import { GameErrorBoundary } from "./game-error-boundary";
import { PageTransition } from "./transition-wrapper";

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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* 顶部导航栏 */}
        <Navigation
          currentView={currentView}
          currentGameId={currentGameId}
          onNavigateToHall={navigateToHall}
        />

        {/* 主内容区域 */}
        <main className="flex-1 flex flex-col">
          <PageTransition currentKey={currentView + (currentGameId || "")}>
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
          </PageTransition>
        </main>

        {/* 底部信息栏 */}
        <Footer />
      </div>
    </PlatformErrorBoundary>
  );
}
