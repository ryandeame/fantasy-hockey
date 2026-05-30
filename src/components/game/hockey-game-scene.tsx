import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { GoalSprite } from '@/components/game/goal-sprite';
import { GoalieSprite } from '@/components/game/goalie-sprite';
import { ShooterPlayer } from '@/components/game/shooter-player';
import { BottomTabInset } from '@/constants/theme';
import { HockeyTeam } from '@/data/teams';

type HockeyGameSceneProps = {
  awayTeam?: HockeyTeam;
  homeTeam?: HockeyTeam;
};

export function HockeyGameScene({ awayTeam, homeTeam }: HockeyGameSceneProps) {
  const { height, width } = useWindowDimensions();
  const sceneWidth = Math.min(width, 900);
  const goalWidth = Math.min(sceneWidth * 0.48, 420);
  const goalHeight = goalWidth / 1.5;
  const goalieWidth = Math.min(sceneWidth * 0.34, 300);
  const shooterWidth = Math.min(sceneWidth * 0.84, 600);
  const rinkTop = Math.max(height * 0.1, 52);
  const sceneLeft = (width - sceneWidth) / 2;
  const goalLeft = sceneLeft + (sceneWidth - goalWidth) / 2;
  const shooterMovementRange = sceneWidth * 0.22;
  const isMobileWeb = process.env.EXPO_OS === 'web' && width < 768;
  const faceoffTint = homeTeam?.secondaryColor ?? awayTeam?.secondaryColor ?? '#3077BD';

  return (
    <View style={styles.screen}>
      <View style={styles.iceWash} />
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
        style={[
          styles.goalie,
          {
            left: sceneLeft + (sceneWidth - goalieWidth) / 2,
            top: rinkTop + goalWidth * 0.04,
            width: goalieWidth,
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
