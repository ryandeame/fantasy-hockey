import { GamePoint, GameRect } from '@/components/game/aim-types';
import { GOALIE_ALPHA_MASK, GoalieAlphaMask } from '@/components/game/goalie-alpha-mask';

type GoalieCollisionInput = {
  mask?: GoalieAlphaMask;
  point: GamePoint;
  rect: GameRect;
};

function rowHasOpaquePixel(
  row: readonly (readonly [number, number])[],
  sourceX: number,
) {
  let left = 0;
  let right = row.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const [runStart, runEnd] = row[middle];

    if (sourceX < runStart) {
      right = middle - 1;
    } else if (sourceX > runEnd) {
      left = middle + 1;
    } else {
      return true;
    }
  }

  return false;
}

export function goalieHasOpaqueAlphaAtPoint({
  mask = GOALIE_ALPHA_MASK,
  point,
  rect,
}: GoalieCollisionInput) {
  if (rect.width <= 0 || rect.height <= 0) {
    return false;
  }

  const localX = point.x - rect.x;
  const localY = point.y - rect.y;

  if (
    localX < 0 ||
    localX > rect.width ||
    localY < 0 ||
    localY > rect.height
  ) {
    return false;
  }

  const sourceX = Math.min(
    mask.width - 1,
    Math.floor((localX / rect.width) * mask.width),
  );
  const sourceY = Math.min(
    mask.height - 1,
    Math.floor((localY / rect.height) * mask.height),
  );

  return rowHasOpaquePixel(mask.opaqueRunsByY[sourceY] ?? [], sourceX);
}
