"use client";

import React, { useState } from "react";
import { MobileMenu } from "./responsive-layout";
import { getGameChineseName } from "@/lib/game-names";

interface NavigationProps {
  currentView: "hall" | "game";
  currentGameId: string | null;
  onNavigateToHall: () => void;
}

/**
 * 导航组件
 * 提供平台导航功能，包括返回游戏大厅的功能
 * 支持响应式设计和移动端菜单
 */
export function Navigation({
  currentView,
  currentGameId,
  onNavigateToHall,
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigateToHall = () => {
    onNavigateToHall();
    closeMobileMenu();
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* 左侧：平台标题和导航 */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                type="button"
                onClick={handleNavigateToHall}
                className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                🎮 游戏平台
              </button>

              {currentView === "game" && (
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                  <span>/</span>
                  <span>
                    {currentGameId ? getGameChineseName(currentGameId) : "游戏"}
                  </span>
                </div>
              )}
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* 桌面端返回按钮 */}
              {currentView === "game" && (
                <button
                  type="button"
                  onClick={handleNavigateToHall}
                  className="hidden sm:block px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  返回大厅
                </button>
              )}

              {/* 移动端菜单按钮 */}
              <button
                type="button"
                className="sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={toggleMobileMenu}
                title="菜单"
                aria-label="打开菜单"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 移动端菜单 */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">导航</h3>

          <button
            type="button"
            onClick={handleNavigateToHall}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            🏠 游戏大厅
          </button>

          {currentView === "game" && currentGameId && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">当前游戏:</p>
              <p className="font-medium text-gray-900">
                {currentGameId ? getGameChineseName(currentGameId) : "未知游戏"}
              </p>
              <button
                type="button"
                onClick={handleNavigateToHall}
                className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
              >
                返回大厅
              </button>
            </div>
          )}
        </div>
      </MobileMenu>
    </>
  );
}
