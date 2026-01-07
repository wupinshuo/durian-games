"use client";

import React, { useState } from "react";

/**
 * 错误测试组件
 * 用于测试错误边界的功能（仅在开发环境中使用）
 */
export function ErrorTest() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("Test error for error boundary");
  }

  // 只在开发环境中显示
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 rounded-lg p-4 shadow-lg">
      <h4 className="text-sm font-semibold text-red-800 mb-2">错误边界测试</h4>
      <button
        onClick={() => setShouldThrow(true)}
        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
      >
        触发错误
      </button>
    </div>
  );
}
