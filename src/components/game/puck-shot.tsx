import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GamePoint } from '@/components/game/aim-types';

type ActiveShot = {
  progress: number;
  start: GamePoint;
  target: GamePoint;
};

type PuckShotProps = {
  origin: GamePoint;
  puckSize?: number;
  targetPoint: GamePoint;
};

const SHOT_DURATION = 620;

export function PuckShot({ origin, puckSize = 34, targetPoint }: PuckShotProps) {
  const [activeShot, setActiveShot] = useState<ActiveShot | null>(null);
  const activeShotRef = useRef<ActiveShot | null>(null);
  const frameRef = useRef<number | null>(null);
  const shotStartTimeRef = useRef<number | null>(null);
  const latestOriginRef = useRef(origin);
  const latestTargetRef = useRef(targetPoint);

  useEffect(() => {
    latestOriginRef.current = origin;
  }, [origin]);

  useEffect(() => {
    latestTargetRef.current = targetPoint;
  }, [targetPoint]);

  const clearFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const animateShot = useCallback(
    function animateShotFrame(time: number) {
      if (shotStartTimeRef.current === null) {
        shotStartTimeRef.current = time;
      }

      const progress = Math.min((time - shotStartTimeRef.current) / SHOT_DURATION, 1);
      const nextShot = activeShotRef.current
        ? { ...activeShotRef.current, progress }
        : null;

      if (!nextShot || progress >= 1) {
        activeShotRef.current = null;
        shotStartTimeRef.current = null;
        setActiveShot(null);
        clearFrame();
        return;
      }

      activeShotRef.current = nextShot;
      setActiveShot(nextShot);
      frameRef.current = requestAnimationFrame(animateShotFrame);
    },
    [clearFrame],
  );

  const fireShot = useCallback(() => {
    if (activeShotRef.current !== null) {
      return;
    }

    const nextShot = {
      progress: 0,
      start: latestOriginRef.current,
      target: latestTargetRef.current,
    };

    activeShotRef.current = nextShot;
    shotStartTimeRef.current = null;
    setActiveShot(nextShot);
    clearFrame();
    frameRef.current = requestAnimationFrame(animateShot);
  }, [animateShot, clearFrame]);

  useEffect(() => {
    if (process.env.EXPO_OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') {
        return;
      }

      event.preventDefault();
      fireShot();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearFrame();
    };
  }, [clearFrame, fireShot]);

  if (!activeShot) {
    return null;
  }

  const currentX =
    activeShot.start.x + (activeShot.target.x - activeShot.start.x) * activeShot.progress;
  const currentY =
    activeShot.start.y + (activeShot.target.y - activeShot.start.y) * activeShot.progress;
  const scale = 1 - activeShot.progress * 0.42;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.puck,
        {
          height: puckSize,
          left: currentX - puckSize / 2,
          top: currentY - puckSize / 2,
          transform: [{ scale }],
          width: puckSize,
        },
      ]}>
      <Image
        source={require('@/assets/images/puck.transparent.png')}
        contentFit="contain"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  puck: {
    position: 'absolute',
    zIndex: 5,
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
