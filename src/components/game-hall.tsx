"use client";

import React, { useState, useEffect } from "react";
import { gameRegistry } from "@/lib/game-registry";
import { scoreManager } from "@/lib/score-manager";
import { GameMetadata } from "@/types/game";
import { ResponsiveContainer, ResponsiveGrid } from "./responsive-layout";
import { GameCardSkeleton } from "./loading-indicator";
import { TransitionWrapper } from "./transition-wrapper";

// 确保游戏注册在组件加载前完成
import "@/lib/game-registration";

interface GameHallProps {
  onGameSelect: (gameId: string) => void;
}

/**
 * 游戏大厅组件
 * 显示可用游戏列表并处理游戏选择
 */
export function GameHall({ onGameSelect }: GameHallProps) {
  const [games, setGames] = useState<GameMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // 加载游戏列表
    const loadGames = () => {
      try {
        const availableGames = gameRegistry.getAllGames();
        setGames(availableGames);
        setError(null);
      } catch (error) {
        console.error("Failed to load games:", error);
        setError("加载游戏列表失败");
      } finally {
        setIsLoading(false);
      }
    };

    // 延迟加载以确保游戏注册完成
    const timer = setTimeout(() => {
      loadGames();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleGameSelect = (gameId: string) => {
    console.log("选择游戏:", gameId);
    setIsTransitioning(true);

    // 添加短暂延迟以显示过渡效果
    setTimeout(() => {
      onGameSelect(gameId);
    }, 150);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "简单";
      case "medium":
        return "中等";
      case "hard":
        return "困难";
      default:
        return difficulty;
    }
  };

  const getControlsText = (controls: string[]) => {
    const controlMap: Record<string, string> = {
      keyboard: "键盘",
      mouse: "鼠标",
      touch: "触摸",
    };
    return controls.map((control) => controlMap[control] || control).join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex-1 py-6">
        <ResponsiveContainer size="xl">
          {/* 页面标题骨架 */}
          <div className="text-center mb-6 md:mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
          </div>

          {/* 游戏卡片骨架 */}
          <ResponsiveGrid
            cols={{ default: 1, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
            gap={4}
            className="mb-6 md:mb-8"
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <GameCardSkeleton key={index} />
            ))}
          </ResponsiveGrid>
        </ResponsiveContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">加载失败</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Hero 区域 */}
      <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <TransitionWrapper isVisible={!isTransitioning} type="slideUp">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              畅玩经典小游戏!
            </h1>
            <p className="text-base sm:text-lg text-blue-100 max-w-xl">
              经典小游戏合集，随时随地，轻松畅玩。
            </p>
          </TransitionWrapper>
        </div>
      </section>

      {/* 游戏列表区域 */}
      <ResponsiveContainer size="xl">
        <div className="py-8 sm:py-12">
          {/* 页面标题 */}
          <TransitionWrapper isVisible={!isTransitioning} type="slideUp">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              选择一个游戏
            </h2>
          </TransitionWrapper>

          {/* 游戏列表 */}
          <TransitionWrapper isVisible={!isTransitioning} type="fade">
            {games.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🎮</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  暂无可用游戏
                </h3>
                <p className="text-gray-600">游戏正在开发中，敬请期待...</p>
              </div>
            ) : (
              <ResponsiveGrid
                cols={{ default: 1, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
                gap={6}
                className="mb-8 sm:mb-12"
              >
                {games.map((game, index) => (
                  <TransitionWrapper
                    key={game.id}
                    isVisible={!isTransitioning}
                    type="slideUp"
                    duration={300 + index * 50}
                  >
                    <GameCard
                      game={game}
                      onSelect={handleGameSelect}
                      getDifficultyColor={getDifficultyColor}
                      getDifficultyText={getDifficultyText}
                      getControlsText={getControlsText}
                    />
                  </TransitionWrapper>
                ))}
              </ResponsiveGrid>
            )}
          </TransitionWrapper>

          {/* 即将上线区域 */}
          <TransitionWrapper isVisible={!isTransitioning} type="fade">
            <div className="mt-8 sm:mt-12">
              <h3 className="text-base sm:text-lg font-semibold text-gray-500 mb-3 sm:mb-4">
                更多游戏即将上线…
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 sm:h-28 rounded-lg bg-slate-200 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </TransitionWrapper>
        </div>
      </ResponsiveContainer>
    </div>
  );
}

interface GameCardProps {
  game: GameMetadata;
  onSelect: (gameId: string) => void;
  getDifficultyColor: (difficulty: string) => string;
  getDifficultyText: (difficulty: string) => string;
  getControlsText: (controls: string[]) => string;
}

/**
 * 游戏卡片组件
 * 显示单个游戏的信息和操作
 */
function GameCard({
  game,
  onSelect,
  getDifficultyColor,
  getDifficultyText,
  getControlsText,
}: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [highScore, setHighScore] = useState<number | null>(null);

  // 加载最高分
  useEffect(() => {
    const score = scoreManager.getHighScore(game.id);
    setHighScore(score?.score || null);
  }, [game.id]);

  return (
    <div
      className="relative bg-white rounded-xl shadow hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden group active:scale-95 gpu-accelerated"
      onClick={() => onSelect(game.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 游戏缩略图 */}
      <div className="h-36 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative overflow-hidden">
        {game.thumbnail ? (
          <img
            src={game.thumbnail}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-white text-4xl sm:text-5xl">🎮</div>
        )}
      </div>

      {/* 游戏信息 */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {game.name}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 min-h-[2.5rem]">
          {game.description}
        </p>

        {/* 开始游戏按钮 */}
        <button
          type="button"
          className="w-full rounded-lg bg-blue-500 py-2 font-semibold text-white text-sm sm:text-base hover:bg-blue-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(game.id);
          }}
        >
          开始游戏
        </button>
      </div>
    </div>
  );
}
