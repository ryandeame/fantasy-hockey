export type GoalieAlphaRun = readonly [number, number];

export type GoalieAlphaMask = {
  alphaThreshold: number;
  height: number;
  opaquePixelCount: number;
  opaqueRunsByY: readonly (readonly GoalieAlphaRun[])[];
  width: number;
};
