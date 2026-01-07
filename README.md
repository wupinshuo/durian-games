# 网页游戏平台

一个模块化的网页游戏平台，提供经典小游戏（扫雷、2048、俄罗斯方块），具有统一界面，支持PC和移动浏览器。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **开发语言**: React + TypeScript
- **样式框架**: Tailwind CSS
- **包管理器**: pnpm
- **测试框架**: Jest + fast-check
- **Node.js版本**: 20.16.0

## 项目结构

```
src/
├── app/                 # Next.js App Router 页面
├── components/          # 共享组件
├── games/              # 游戏模块
├── lib/                # 核心库和工具
└── types/              # TypeScript 类型定义
```

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 开发服务器

```bash
pnpm dev
```

### 构建项目

```bash
pnpm build
```

### 运行测试

```bash
pnpm test
```

## 架构特点

- **模块化设计**: 游戏作为独立模块，通过统一接口集成
- **动态加载**: 使用代码分割，按需加载游戏资源
- **响应式设计**: 支持桌面和移动设备，最小宽度320px
- **类型安全**: 全面的TypeScript支持和严格类型检查
- **测试驱动**: 单元测试和属性测试相结合的测试策略
