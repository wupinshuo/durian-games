"use client";

import React, { useState } from "react";
import { MobileMenu } from "./responsive-layout";
import { getGameChineseName } from "@/lib/game-names";
import { AboutModal } from "./about-modal";

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
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

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

  const handleOpenAbout = () => {
    setIsAboutModalOpen(true);
    closeMobileMenu();
  };

  const handleCloseAbout = () => {
    setIsAboutModalOpen(false);
  };

  return (
    <>
      <nav className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* 左侧：平台标题 */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleNavigateToHall}
                className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
              >
                <span className="text-xl sm:text-2xl">🎮</span>
                <span className="text-base sm:text-xl font-bold">
                  在线小游戏平台
                </span>
              </button>
            </div>

            {/* 右侧：导航链接 */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* 桌面端导航 */}
              <nav className="hidden md:flex gap-4 sm:gap-6">
                <button
                  type="button"
                  onClick={handleNavigateToHall}
                  className={`text-sm transition-colors ${
                    currentView === "hall"
                      ? "text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  首页
                </button>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white text-sm transition-colors"
                >
                  排行榜
                </a>
                <button
                  type="button"
                  onClick={handleOpenAbout}
                  className="text-slate-300 hover:text-white text-sm transition-colors"
                >
                  关于
                </button>
              </nav>

              {/* 移动端菜单按钮 */}
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800"
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
            className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
              currentView === "hall"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            首页
          </button>

          <button
            type="button"
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            排行榜
          </button>

          <button
            type="button"
            onClick={handleOpenAbout}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            关于
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
                返回首页
              </button>
            </div>
          )}
        </div>
      </MobileMenu>

      {/* 关于弹窗 */}
      <AboutModal isOpen={isAboutModalOpen} onClose={handleCloseAbout} />
    </>
  );
}
