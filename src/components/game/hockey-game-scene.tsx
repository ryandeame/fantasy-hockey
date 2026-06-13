import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { GoalSprite } from '@/components/game/goal-sprite';
import { goalieHasOpaqueAlphaAtPoint } from '@/components/game/goalie-alpha-collision';
import { GoalieSprite } from '@/components/game/goalie-sprite';
import { ShooterPlayer } from '@/components/game/shooter-player';
import { ShotResolution } from '@/components/game/shot-scoring';
import { BottomTabInset } from '@/constants/theme';
import { HockeyTeam } from '@/data/teams';

type HockeyGameSceneProps = {
  challenge?: {
    goalsRequired: number;
    shotsAllowed: number;
  };
  goalieTeam?: HockeyTeam;
  onChallengeComplete?: (result: {
    goals: number;
    misses: number;
    passed: boolean;
    saves: number;
    shots: number;
  }) => void;
  shooterTeam?: HockeyTeam;
};

export function HockeyGameScene({
  challenge,
  goalieTeam,
  onChallengeComplete,
  shooterTeam,
}: HockeyGameSceneProps) {
  const { height, width } = useWindowDimensions();
  const [goals, setGoals] = useState(0);
  const [misses, setMisses] = useState(0);
  const [saves, setSaves] = useState(0);
  const [goalieOffsetX, setGoalieOffsetX] = useState(0);
  const [lastShotResolution, setLastShotResolution] =
    useState<ShotResolution | null>(null);
  const sceneWidth = Math.min(width, 900);
  const goalWidth = Math.min(sceneWidth * 0.48, 420);
  const goalHeight = goalWidth / 1.5;
  const shooterWidth = Math.min(sceneWidth * 0.84, 600);
  const rinkTop = Math.max(height * 0.1, 52);
  const sceneLeft = (width - sceneWidth) / 2;
  const goalLeft = sceneLeft + (sceneWidth - goalWidth) / 2;
  const goalieWidth = goalHeight * 0.88;
  const goalieMovementRange = Math.max(0, (goalWidth - goalieWidth) * 0.36);
  const goalieRect = useMemo(
    () => ({
      x: goalLeft + (goalWidth - goalieWidth) / 2 + goalieOffsetX,
      y: rinkTop + goalHeight * 0.05,
      width: goalieWidth,
      height: goalieWidth,
    }),
    [goalHeight, goalieOffsetX, goalieWidth, goalLeft, goalWidth, rinkTop],
  );
  const shooterMovementRange = sceneWidth * 0.22;
  const isMobileWeb = process.env.EXPO_OS === 'web' && width < 768;
  const faceoffTint =
    shooterTeam?.secondaryColor ?? goalieTeam?.secondaryColor ?? '#3077BD';
  const goalieAlphaMask = goalieTeam?.goalieAlphaMask;
  const shotsTaken = goals + misses + saves;

  useEffect(() => {
    let frameId: number | null = null;
    let startedAt: number | null = null;
    const duration = 2600;

    const tick = (time: number) => {
      startedAt ??= time;
      const progress = ((time - startedAt) % duration) / duration;
      setGoalieOffsetX(Math.sin(progress * Math.PI * 2) * goalieMovementRange);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [goalieMovementRange]);

  const resolveShotAtImpact = useCallback(
    (resolution: ShotResolution): ShotResolution => {
      if (resolution.outcome !== 'goal') {
        return resolution;
      }

      if (!goalieAlphaMask) {
        return resolution;
      }

      const goalieHit = goalieHasOpaqueAlphaAtPoint({
        mask: goalieAlphaMask,
        point: resolution.displayPoint,
        rect: goalieRect,
      });

      return goalieHit ? { ...resolution, outcome: 'save' } : resolution;
    },
    [goalieAlphaMask, goalieRect],
  );

  const handleShotComplete = useCallback(
    (resolution: ShotResolution) => {
      const nextGoals = goals + (resolution.outcome === 'goal' ? 1 : 0);
      const nextSaves = saves + (resolution.outcome === 'save' ? 1 : 0);
      const nextMisses = misses + (resolution.outcome === 'miss' ? 1 : 0);
      const nextShots = nextGoals + nextSaves + nextMisses;

      setLastShotResolution(resolution);
      setGoals(nextGoals);
      setSaves(nextSaves);
      setMisses(nextMisses);

      if (challenge && nextShots >= challenge.shotsAllowed) {
        onChallengeComplete?.({
          goals: nextGoals,
          misses: nextMisses,
          passed: nextGoals >= challenge.goalsRequired,
          saves: nextSaves,
          shots: nextShots,
        });
      }
    },
    [challenge, goals, misses, onChallengeComplete, saves],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.iceWash} />
      <View style={styles.scoreboard}>
        <Text selectable={false} style={styles.scoreText}>
          GOAL {goals}
        </Text>
        <Text selectable={false} style={styles.scoreText}>
          MISS {misses}
        </Text>
        <Text selectable={false} style={styles.scoreText}>
          SAVE {saves}
        </Text>
        {challenge ? (
          <Text selectable={false} style={styles.scoreText}>
            SHOT {Math.min(shotsTaken, challenge.shotsAllowed)}/
            {challenge.shotsAllowed}
          </Text>
        ) : null}
        {challenge ? (
          <Text selectable={false} style={styles.scoreText}>
            NEED {challenge.goalsRequired}
          </Text>
        ) : null}
        <Text selectable={false} style={styles.scoreText}>
          RESULT {lastShotResolution?.outcome.toUpperCase() ?? '-'}
        </Text>
        <Text selectable={false} style={styles.scoreText}>
          PX{' '}
          {lastShotResolution
            ? `${lastShotResolution.originalPoint.x},${lastShotResolution.originalPoint.y}`
            : '-'}
        </Text>
      </View>
      <View style={[styles.centerLine, { top: rinkTop + goalHeight * 0.87 }]} />
      <View
        style={[
          styles.faceoffCircle,
          styles.leftCircle,
          { borderColor: `${faceoffTint}40` },
        ]}
      />
      <View
        style={[
          styles.faceoffCircle,
          styles.rightCircle,
          { borderColor: `${faceoffTint}40` },
        ]}
      />

      <GoalSprite
        style={[
          styles.goal,
          {
            left: goalLeft,
            top: rinkTop,
            width: goalWidth,
          },
        ]}
      />
      <GoalieSprite
        source={goalieTeam?.goalieImage}
        style={[
          styles.goalie,
          {
            left: goalieRect.x,
            top: goalieRect.y,
            width: goalieRect.width,
          },
        ]}
      />

      <ShooterPlayer
        goalBottomY={rinkTop + goalHeight}
        goalTargetArea={{
          x: goalLeft,
          y: rinkTop,
          width: goalWidth,
          height: goalHeight,
        }}
        movementRange={shooterMovementRange}
        onShotComplete={handleShotComplete}
        resolveShotAtImpact={resolveShotAtImpact}
        shotsDisabled={challenge ? shotsTaken >= challenge.shotsAllowed : false}
        shooterImage={shooterTeam?.shooterImage}
        showMobileControls={isMobileWeb}
        spriteLayout={{
          bottom: BottomTabInset,
          left: sceneLeft + (sceneWidth - shooterWidth) / 2 - shooterWidth * 0.12,
          width: shooterWidth,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#dceff7',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  iceWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#eefaff',
  },
  centerLine: {
    position: 'absolute',
    height: 3,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(199, 37, 47, 0.22)',
  },
  scoreboard: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 6,
    gap: 4,
    minWidth: 86,
    paddingTop: 8,
    paddingRight: 10,
    paddingBottom: 8,
    paddingLeft: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(8, 31, 45, 0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0,
  },
  faceoffCircle: {
    position: 'absolute',
    bottom: '16%',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
  },
  leftCircle: {
    left: -100,
  },
  rightCircle: {
    right: -100,
  },
  goal: {
    position: 'absolute',
    zIndex: 1,
  },
  goalie: {
    position: 'absolute',
    zIndex: 2,
  },
});
