"use client";

import React from "react";

/**
 * Footer 组件
 * 显示平台底部信息和链接
 */
export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-3 sm:gap-4 py-4 sm:py-6 text-xs sm:text-sm text-slate-500 md:flex-row md:justify-between">
          <span>© 2026 在线小游戏平台</span>
          <div className="flex gap-4 sm:gap-6">
            <button
              type="button"
              className="hover:text-slate-700 transition-colors"
            >
              🏆 排行榜
            </button>
            <button
              type="button"
              className="hover:text-slate-700 transition-colors"
            >
              ⭐ 成就
            </button>
            <button
              type="button"
              className="hover:text-slate-700 transition-colors"
            >
              ❤️ 收藏
            </button>
            <button
              type="button"
              className="hover:text-slate-700 transition-colors"
            >
              ⚙️ 设置
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
