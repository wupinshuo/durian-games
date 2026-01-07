"use client";

import React, { useState, useEffect } from "react";
import { gameRegistry } from "@/lib/game-registry";
import { GameMetadata } from "@/types/game";
import { ResponsiveContainer, ResponsiveGrid } from "./responsive-layout";

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
    onGameSelect(gameId);
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
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载游戏列表...</p>
        </div>
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
    <div className="flex-1 py-6">
      <ResponsiveContainer size="xl">
        {/* 页面标题 */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            游戏大厅
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            选择一个游戏开始游玩
          </p>
        </div>

        {/* 游戏列表 */}
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
            cols={{ default: 1, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
            gap={4}
            className="mb-6 md:mb-8"
          >
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={handleGameSelect}
                getDifficultyColor={getDifficultyColor}
                getDifficultyText={getDifficultyText}
                getControlsText={getControlsText}
              />
            ))}
          </ResponsiveGrid>
        )}

        {/* 底部提示 */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            更多游戏正在开发中，敬请期待更多精彩内容！
          </p>
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

  return (
    <div
      className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 overflow-hidden group active:scale-95"
      onClick={() => onSelect(game.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 游戏缩略图 */}
      <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative overflow-hidden">
        {game.thumbnail ? (
          <img
            src={game.thumbnail}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-3xl sm:text-4xl">🎮</div>
        )}

        {/* 悬停覆盖层 - 在移动设备上始终显示 */}
        <div
          className={`absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0 md:opacity-0"
          } group-active:opacity-100`}
        >
          <span className="text-white font-semibold bg-blue-500 bg-opacity-90 px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base">
            开始游戏
          </span>
        </div>
      </div>

      {/* 游戏信息 */}
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {game.name}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
          {game.description}
        </p>

        {/* 游戏标签 */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
              game.difficulty
            )}`}
          >
            {getDifficultyText(game.difficulty)}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {game.category}
          </span>
        </div>

        {/* 控制方式 */}
        <div className="text-xs text-gray-500">
          支持: {getControlsText(game.controls)}
        </div>
      </div>
    </div>
  );
}
