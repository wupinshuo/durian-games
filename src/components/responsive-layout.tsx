"use client";

import React, { ReactNode } from "react";

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * 响应式布局组件
 * 提供统一的响应式容器和间距管理
 * 支持最小320px宽度
 */
export function ResponsiveLayout({
  children,
  className = "",
}: ResponsiveLayoutProps) {
  return (
    <div
      className={`w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  gap?: number;
  className?: string;
}

/**
 * 响应式网格组件
 * 提供灵活的网格布局，支持不同屏幕尺寸的列数配置
 * 针对320px最小宽度优化
 */
export function ResponsiveGrid({
  children,
  cols = { default: 1, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className = "",
}: ResponsiveGridProps) {
  const gridClasses = [
    `grid`,
    `gap-${gap}`,
    cols.default && `grid-cols-${cols.default}`,
    cols.xs && `xs:grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols["2xl"] && `2xl:grid-cols-${cols["2xl"]}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={gridClasses}>{children}</div>;
}

interface ResponsiveContainerProps {
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * 响应式容器组件
 * 提供不同尺寸的内容容器，支持320px最小宽度
 */
export function ResponsiveContainer({
  children,
  size = "lg",
  className = "",
  padding = "md",
}: ResponsiveContainerProps) {
  const sizeClasses = {
    xs: "max-w-sm",
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    "2xl": "max-w-8xl",
    full: "max-w-full",
  };

  const paddingClasses = {
    none: "",
    sm: "px-2 sm:px-4",
    md: "px-3 sm:px-4 md:px-6 lg:px-8",
    lg: "px-4 sm:px-6 md:px-8 lg:px-12",
  };

  return (
    <div
      className={`w-full ${sizeClasses[size]} mx-auto ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: ReactNode;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}

/**
 * 响应式文本组件
 * 根据屏幕尺寸调整文本大小
 */
export function ResponsiveText({
  children,
  size = "base",
  className = "",
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    base: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
    xl: "text-xl sm:text-2xl",
    "2xl": "text-2xl sm:text-3xl",
    "3xl": "text-2xl sm:text-3xl md:text-4xl",
  };

  return <div className={`${sizeClasses[size]} ${className}`}>{children}</div>;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * 移动端菜单组件
 * 为小屏幕设备提供侧边栏菜单
 */
export function MobileMenu({ isOpen, onClose, children }: MobileMenuProps) {
  return (
    <>
      {/* 背景遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <button
            onClick={onClose}
            className="mb-4 p-2 rounded-md hover:bg-gray-100"
          >
            ✕
          </button>
          {children}
        </div>
      </div>
    </>
  );
}

/**
 * 响应式断点检测Hook
 */
export function useResponsive() {
  const [breakpoint, setBreakpoint] = React.useState<string>("lg");

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 480) setBreakpoint("xs");
      else if (width < 640) setBreakpoint("sm");
      else if (width < 768) setBreakpoint("md");
      else if (width < 1024) setBreakpoint("lg");
      else if (width < 1280) setBreakpoint("xl");
      else setBreakpoint("2xl");
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === "xs" || breakpoint === "sm",
    isTablet: breakpoint === "md",
    isDesktop:
      breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl",
  };
}
