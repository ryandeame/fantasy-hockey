import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { PuckShot } from '@/components/game/puck-shot';
import { MoveAxis, ShooterControls } from '@/components/game/shooter-controls';
import { ShooterSprite } from '@/components/game/shooter-sprite';

export type ShooterSpriteLayout = {
  bottom: number;
  left: number;
  width: number;
};

type ShooterPlayerProps = {
  goalBottomY: number;
  movementRange: number;
  showMobileControls: boolean;
  spriteLayout: ShooterSpriteLayout;
};

const SHOOTER_SPEED = 320;
const PUCK_ORIGIN_X_RATIO = 0.9325;
const PUCK_ORIGIN_Y_RATIO = 0.766;

export function ShooterPlayer({
  goalBottomY,
  movementRange,
  showMobileControls,
  spriteLayout,
}: ShooterPlayerProps) {
  const { height } = useWindowDimensions();
  const [moveAxis, setMoveAxis] = useState<MoveAxis>(0);
  const [shooterOffsetX, setShooterOffsetX] = useState(0);
  const shooterOffsetRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  const handleAxisChange = useCallback((nextAxis: MoveAxis) => {
    setMoveAxis(Math.max(-1, Math.min(1, nextAxis)));
  }, []);

  useEffect(() => {
    shooterOffsetRef.current = Math.max(
      -movementRange,
      Math.min(movementRange, shooterOffsetRef.current),
    );
    setShooterOffsetX(shooterOffsetRef.current);
  }, [movementRange]);

  useEffect(() => {
    if (moveAxis === 0) {
      previousTimeRef.current = null;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      return;
    }

    const tick = (time: number) => {
      const previousTime = previousTimeRef.current ?? time;
      const deltaSeconds = Math.min((time - previousTime) / 1000, 0.05);
      previousTimeRef.current = time;
      shooterOffsetRef.current = Math.max(
        -movementRange,
        Math.min(
          movementRange,
          shooterOffsetRef.current + moveAxis * SHOOTER_SPEED * deltaSeconds,
        ),
      );
      setShooterOffsetX(shooterOffsetRef.current);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [moveAxis, movementRange]);

  const shooterTop = height - spriteLayout.bottom - spriteLayout.width;
  const puckOrigin = {
    x: spriteLayout.left + shooterOffsetX + spriteLayout.width * PUCK_ORIGIN_X_RATIO,
    y: shooterTop + spriteLayout.width * PUCK_ORIGIN_Y_RATIO,
  };

  return (
    <View pointerEvents="box-none" style={styles.playerLayer}>
      <ShooterSprite
        style={[
          {
            bottom: spriteLayout.bottom,
            left: spriteLayout.left,
            width: spriteLayout.width,
          },
          {
            transform: [{ translateX: shooterOffsetX }],
          },
        ]}
      />
      <PuckShot origin={puckOrigin} targetY={goalBottomY} />
      <ShooterControls
        onAxisChange={handleAxisChange}
        showMobileControls={showMobileControls}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  playerLayer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    zIndex: 3,
  },
});
