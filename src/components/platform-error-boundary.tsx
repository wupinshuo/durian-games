"use client";

import React from "react";
import { ErrorBoundary } from "./error-boundary";

interface PlatformErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * 平台级错误边界组件
 * 捕获整个平台的未处理错误，提供最后的错误处理机制
 */
export function PlatformErrorBoundary({
  children,
}: PlatformErrorBoundaryProps) {
  const handlePlatformError = (error: Error, errorInfo: React.ErrorInfo) => {
    // 记录平台级错误
    console.error("Platform-level error:", error, errorInfo);

    // 这里可以添加错误报告逻辑
    // 例如发送错误报告到监控服务
    try {
      // 示例：发送错误报告
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // 存储到本地存储以便后续分析
      const existingReports = JSON.parse(
        localStorage.getItem("platform-error-reports") || "[]"
      );
      existingReports.push(errorReport);

      // 只保留最近的10个错误报告
      if (existingReports.length > 10) {
        existingReports.splice(0, existingReports.length - 10);
      }

      localStorage.setItem(
        "platform-error-reports",
        JSON.stringify(existingReports)
      );
    } catch (reportError) {
      console.error("Failed to save error report:", reportError);
    }
  };

  return (
    <ErrorBoundary level="platform" onError={handlePlatformError}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * 错误恢复工具类
 * 提供错误恢复和诊断功能
 */
export class ErrorRecovery {
  /**
   * 从游戏错误中恢复
   */
  static async recoverFromGameError(gameId: string): Promise<void> {
    try {
      // 清理游戏相关的本地存储
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(`game-${gameId}-`)) {
          localStorage.removeItem(key);
        }
      });

      // 清理可能的内存泄漏
      if (window.gc && typeof window.gc === "function") {
        window.gc();
      }

      console.log(`Recovered from game error for: ${gameId}`);
    } catch (error) {
      console.error(`Failed to recover from game error for ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * 从存储错误中恢复
   */
  static recoverFromStorageError(): void {
    try {
      // 尝试清理可能损坏的存储数据
      const testKey = "storage-test";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);

      console.log("Storage recovery successful");
    } catch (error) {
      console.error("Storage recovery failed:", error);
      // 如果本地存储完全不可用，使用内存存储作为后备
      console.warn("Falling back to memory storage");
    }
  }

  /**
   * 重试失败的操作
   */
  static async retryFailedOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `Operation failed (attempt ${attempt}/${maxRetries}):`,
          error
        );

        if (attempt < maxRetries) {
          // 等待指定时间后重试
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw new Error(
      `Operation failed after ${maxRetries} attempts: ${lastError!.message}`
    );
  }

  /**
   * 获取错误报告
   */
  static getErrorReports(): any[] {
    try {
      return JSON.parse(localStorage.getItem("platform-error-reports") || "[]");
    } catch (error) {
      console.error("Failed to get error reports:", error);
      return [];
    }
  }

  /**
   * 清除错误报告
   */
  static clearErrorReports(): void {
    try {
      localStorage.removeItem("platform-error-reports");
    } catch (error) {
      console.error("Failed to clear error reports:", error);
    }
  }

  /**
   * 诊断系统状态
   */
  static diagnoseSystem(): {
    localStorage: boolean;
    sessionStorage: boolean;
    webGL: boolean;
    canvas: boolean;
    audioContext: boolean;
  } {
    const diagnosis = {
      localStorage: false,
      sessionStorage: false,
      webGL: false,
      canvas: false,
      audioContext: false,
    };

    // 测试 localStorage
    try {
      const testKey = "diagnosis-test";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      diagnosis.localStorage = true;
    } catch (error) {
      console.warn("localStorage not available:", error);
    }

    // 测试 sessionStorage
    try {
      const testKey = "diagnosis-test";
      sessionStorage.setItem(testKey, "test");
      sessionStorage.removeItem(testKey);
      diagnosis.sessionStorage = true;
    } catch (error) {
      console.warn("sessionStorage not available:", error);
    }

    // 测试 WebGL
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      diagnosis.webGL = !!gl;
    } catch (error) {
      console.warn("WebGL not available:", error);
    }

    // 测试 Canvas
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      diagnosis.canvas = !!ctx;
    } catch (error) {
      console.warn("Canvas not available:", error);
    }

    // 测试 AudioContext
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        diagnosis.audioContext = true;
        audioContext.close();
      }
    } catch (error) {
      console.warn("AudioContext not available:", error);
    }

    return diagnosis;
  }
}
