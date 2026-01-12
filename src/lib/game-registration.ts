import { gameRegistry } from "./game-registry";
import { GameMetadata } from "@/types/game";

/**
 * 游戏注册配置
 * 在这里注册所有可用的游戏
 */

// 注册扫雷游戏
gameRegistry.register(
  "minesweeper",
  () => import("@/games/minesweeper").then((module) => module.default),
  {
    id: "minesweeper",
    name: "扫雷",
    description:
      "经典的扫雷游戏，找出所有地雷而不触雷。支持多种难度级别，考验你的逻辑推理能力。",
    thumbnail: "/thumbnails/minesweeper.svg",
    category: "益智",
    difficulty: "medium",
    controls: ["mouse", "touch"],
  } as GameMetadata
);

// 注册2048游戏
gameRegistry.register(
  "2048",
  () => import("@/games/game2048").then((module) => module.default),
  {
    id: "2048",
    name: "2048",
    description:
      "滑动数字方块，合并相同数字达到2048。简单易学，但要达到高分需要策略思考。",
    thumbnail: "/thumbnails/2048.svg",
    category: "益智",
    difficulty: "medium",
    controls: ["keyboard", "touch"],
  } as GameMetadata
);

// 注册俄罗斯方块游戏
gameRegistry.register(
  "tetris",
  () => import("@/games/tetris").then((module) => module.default),
  {
    id: "tetris",
    name: "俄罗斯方块",
    description:
      "经典的俄罗斯方块游戏，旋转和移动方块填满行。速度越来越快，挑战你的反应能力。",
    thumbnail: "/thumbnails/tetris.svg",
    category: "动作",
    difficulty: "hard",
    controls: ["keyboard"],
  } as GameMetadata
);
