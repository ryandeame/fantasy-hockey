import { useCallback, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { GoalSprite } from '@/components/game/goal-sprite';
import { ShooterPlayer } from '@/components/game/shooter-player';
import { ShotResolution } from '@/components/game/shot-scoring';
import { BottomTabInset } from '@/constants/theme';
import { HockeyTeam } from '@/data/teams';

type HockeyGameSceneProps = {
  awayTeam?: HockeyTeam;
  homeTeam?: HockeyTeam;
};

export function HockeyGameScene({ awayTeam, homeTeam }: HockeyGameSceneProps) {
  const { height, width } = useWindowDimensions();
  const [goals, setGoals] = useState(0);
  const [misses, setMisses] = useState(0);
  const [lastShotResolution, setLastShotResolution] =
    useState<ShotResolution | null>(null);
  const sceneWidth = Math.min(width, 900);
  const goalWidth = Math.min(sceneWidth * 0.48, 420);
  const goalHeight = goalWidth / 1.5;
  const shooterWidth = Math.min(sceneWidth * 0.84, 600);
  const rinkTop = Math.max(height * 0.1, 52);
  const sceneLeft = (width - sceneWidth) / 2;
  const goalLeft = sceneLeft + (sceneWidth - goalWidth) / 2;
  const shooterMovementRange = sceneWidth * 0.22;
  const isMobileWeb = process.env.EXPO_OS === 'web' && width < 768;
  const faceoffTint = homeTeam?.secondaryColor ?? awayTeam?.secondaryColor ?? '#3077BD';
  const handleShotComplete = useCallback((resolution: ShotResolution) => {
    setLastShotResolution(resolution);

    if (resolution.outcome === 'goal') {
      setGoals((currentGoals) => currentGoals + 1);
      return;
    }

    setMisses((currentMisses) => currentMisses + 1);
  }, []);

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
});
