/**
 * 游戏名称映射工具
 * 将游戏ID转换为中文显示名称
 */

const GAME_NAMES: Record<string, string> = {
  minesweeper: "扫雷",
  "2048": "2048",
  tetris: "俄罗斯方块",
};

/**
 * 获取游戏的中文名称
 * @param gameId 游戏ID
 * @returns 中文游戏名称，如果找不到则返回原ID
 */
export function getGameChineseName(gameId: string): string {
  return GAME_NAMES[gameId] || gameId;
}

/**
 * 获取所有游戏名称映射
 * @returns 游戏名称映射对象
 */
export function getAllGameNames(): Record<string, string> {
  return { ...GAME_NAMES };
}
