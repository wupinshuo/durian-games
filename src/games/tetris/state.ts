/**
 * 俄罗斯方块游戏状态管理
 */

import {
  TetrisState,
  TetrisPiece,
  PieceType,
  Position,
  GameConfig,
  DEFAULT_CONFIG,
  PIECE_SHAPES,
  SCORE_VALUES,
} from "./types";

/** 创建初始游戏状态 */
export function createInitialState(
  config: GameConfig = DEFAULT_CONFIG
): TetrisState {
  return {
    status: "idle",
    board: createEmptyBoard(config.boardWidth, config.boardHeight),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    level: 1,
    lines: 0,
    startTime: null,
    endTime: null,
    dropSpeed: config.initialSpeed,
    lastDropTime: 0,
    canPause: false,
  };
}

/** 创建空游戏板 */
export function createEmptyBoard(
  width: number,
  height: number
): (PieceType | null)[][] {
  return Array(height)
    .fill(null)
    .map(() => Array(width).fill(null));
}

/** 生成随机方块类型 */
export function getRandomPieceType(): PieceType {
  const types: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];
  return types[Math.floor(Math.random() * types.length)];
}

/** 创建新方块 */
export function createPiece(type: PieceType, boardWidth: number): TetrisPiece {
  const shapes = PIECE_SHAPES[type];
  const shape = shapes[0]; // 初始旋转状态

  return {
    type,
    position: {
      x: Math.floor((boardWidth - shape[0].length) / 2),
      y: 0,
    },
    rotation: 0,
    shape,
  };
}

/** 检查方块是否可以放置在指定位置 */
export function canPlacePiece(
  board: (PieceType | null)[][],
  piece: TetrisPiece,
  position: Position
): boolean {
  const { shape } = piece;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] === 1) {
        const boardX = position.x + col;
        const boardY = position.y + row;

        // 检查边界
        if (
          boardX < 0 ||
          boardX >= board[0].length ||
          boardY < 0 ||
          boardY >= board.length
        ) {
          return false;
        }

        // 检查是否与已有方块冲突
        if (board[boardY][boardX] !== null) {
          return false;
        }
      }
    }
  }

  return true;
}

/** 将方块放置到游戏板上 */
export function placePieceOnBoard(
  board: (PieceType | null)[][],
  piece: TetrisPiece
): (PieceType | null)[][] {
  const newBoard = board.map((row) => [...row]);
  const { shape, position, type } = piece;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] === 1) {
        const boardX = position.x + col;
        const boardY = position.y + row;

        if (
          boardY >= 0 &&
          boardY < newBoard.length &&
          boardX >= 0 &&
          boardX < newBoard[0].length
        ) {
          newBoard[boardY][boardX] = type;
        }
      }
    }
  }

  return newBoard;
}

/** 检查并清除完整的行 */
export function clearCompleteLines(board: (PieceType | null)[][]): {
  newBoard: (PieceType | null)[][];
  clearedLines: number;
} {
  const newBoard: (PieceType | null)[][] = [];
  let clearedLines = 0;

  // 从下往上检查每一行
  for (let row = board.length - 1; row >= 0; row--) {
    const isComplete = board[row].every((cell) => cell !== null);

    if (isComplete) {
      clearedLines++;
    } else {
      newBoard.unshift(board[row]);
    }
  }

  // 在顶部添加空行
  while (newBoard.length < board.length) {
    newBoard.unshift(Array(board[0].length).fill(null));
  }

  return { newBoard, clearedLines };
}

/** 旋转方块 */
export function rotatePiece(piece: TetrisPiece): TetrisPiece {
  const shapes = PIECE_SHAPES[piece.type];
  const nextRotation = (piece.rotation + 1) % shapes.length;

  return {
    ...piece,
    rotation: nextRotation,
    shape: shapes[nextRotation],
  };
}

/** 移动方块 */
export function movePiece(
  piece: TetrisPiece,
  dx: number,
  dy: number
): TetrisPiece {
  return {
    ...piece,
    position: {
      x: piece.position.x + dx,
      y: piece.position.y + dy,
    },
  };
}

/** 计算分数 */
export function calculateScore(
  clearedLines: number,
  level: number,
  dropType: "soft" | "hard" | null = null
): number {
  let score = 0;

  // 消行分数
  switch (clearedLines) {
    case 1:
      score += SCORE_VALUES.SINGLE * level;
      break;
    case 2:
      score += SCORE_VALUES.DOUBLE * level;
      break;
    case 3:
      score += SCORE_VALUES.TRIPLE * level;
      break;
    case 4:
      score += SCORE_VALUES.TETRIS * level;
      break;
  }

  // 下落分数
  if (dropType === "soft") {
    score += SCORE_VALUES.SOFT_DROP;
  } else if (dropType === "hard") {
    score += SCORE_VALUES.HARD_DROP;
  }

  return score;
}

/** 计算等级 */
export function calculateLevel(lines: number, linesPerLevel: number): number {
  return Math.floor(lines / linesPerLevel) + 1;
}

/** 计算下落速度 */
export function calculateDropSpeed(
  level: number,
  initialSpeed: number,
  speedIncrease: number
): number {
  return Math.max(50, initialSpeed * Math.pow(speedIncrease, level - 1));
}

/** 检查游戏是否结束 */
export function isGameOver(
  board: (PieceType | null)[][],
  piece: TetrisPiece
): boolean {
  return !canPlacePiece(board, piece, piece.position);
}

/** 获取方块的"幽灵"位置（硬下落预览） */
export function getGhostPosition(
  board: (PieceType | null)[][],
  piece: TetrisPiece
): Position {
  let ghostY = piece.position.y;

  while (canPlacePiece(board, piece, { x: piece.position.x, y: ghostY + 1 })) {
    ghostY++;
  }

  return { x: piece.position.x, y: ghostY };
}
