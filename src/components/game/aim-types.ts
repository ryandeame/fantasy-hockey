export type GamePoint = {
  x: number;
  y: number;
};

export type GameRect = GamePoint & {
  height: number;
  width: number;
};

export type AimPoint = {
  xRatio: number;
  yRatio: number;
};
