import { AimPoint, GamePoint, GameRect } from '@/components/game/aim-types';

const ORIGINAL_GOAL_WIDTH = 1536;
const ORIGINAL_GOAL_HEIGHT = 1024;
const GOAL_TALLY_LEFT = 190;
const GOAL_TALLY_RIGHT = 1346;
const GOAL_TALLY_TOP = 140;
const GOAL_TALLY_BOTTOM = 870;
const OPEN_NET_TARGET_BOTTOM = GOAL_TALLY_BOTTOM;
const SHOOTER_HORIZONTAL_WEIGHT_RATIO = 0.14;

export type ShotOutcome = 'goal' | 'miss';

export type ShotResolution = {
  displayPoint: GamePoint;
  originalPoint: GamePoint;
  outcome: ShotOutcome;
};

type ResolveShotInput = {
  aim: AimPoint;
  goalImageRect: GameRect;
  movementRange: number;
  shooterOffsetX: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampRatio(value: number) {
  return clamp(value, 0, 1);
}

export function resolveGoalShot({
  aim,
  goalImageRect,
  movementRange,
  shooterOffsetX,
}: ResolveShotInput): ShotResolution {
  const shooterHorizontalRatio =
    movementRange === 0 ? 0 : clamp(shooterOffsetX / movementRange, -1, 1);
  const shooterHorizontalWeight =
    shooterHorizontalRatio *
    ORIGINAL_GOAL_WIDTH *
    SHOOTER_HORIZONTAL_WEIGHT_RATIO;
  const originalX = Math.round(
    clamp(
      clampRatio(aim.xRatio) * ORIGINAL_GOAL_WIDTH + shooterHorizontalWeight,
      0,
      ORIGINAL_GOAL_WIDTH,
    ),
  );
  const originalY = Math.round(
    clampRatio(aim.yRatio) * OPEN_NET_TARGET_BOTTOM,
  );
  const displayPoint = {
    x: goalImageRect.x + goalImageRect.width * (originalX / ORIGINAL_GOAL_WIDTH),
    y:
      goalImageRect.y +
      goalImageRect.height * (originalY / ORIGINAL_GOAL_HEIGHT),
  };
  const isGoal =
    originalX >= GOAL_TALLY_LEFT &&
    originalX <= GOAL_TALLY_RIGHT &&
    originalY >= GOAL_TALLY_TOP &&
    originalY <= GOAL_TALLY_BOTTOM;

  return {
    displayPoint,
    originalPoint: {
      x: originalX,
      y: originalY,
    },
    outcome: isGoal ? 'goal' : 'miss',
  };
}
