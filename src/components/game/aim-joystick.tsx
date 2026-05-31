import { useCallback, useEffect, useRef } from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { AimPoint } from '@/components/game/aim-types';

type AimJoystickProps = {
  aim: AimPoint;
  onAimChange: (aim: AimPoint) => void;
};

type WebTouch = {
  clientX?: number;
  clientY?: number;
  identifier?: number | string;
  locationX?: number;
  locationY?: number;
  pageX?: number;
  pageY?: number;
};

type WebTouchEvent = GestureResponderEvent & {
  currentTarget?: {
    getBoundingClientRect?: () => {
      left: number;
      top: number;
    };
  };
};

type WebTouchNativeEvent = {
  changedTouches?: readonly WebTouch[];
  clientX?: number;
  clientY?: number;
  identifier?: number | string;
  locationX?: number;
  locationY?: number;
  pageX?: number;
  pageY?: number;
  touches?: readonly WebTouch[];
};

const JOYSTICK_SIZE = 132;
const KNOB_SIZE = 44;
const MAX_KNOB_TRAVEL = 42;
const RETURN_TO_CENTER_DURATION_MS = 180;
const CENTER_AIM: AimPoint = {
  xRatio: 0.5,
  yRatio: 0.5,
};
const lockedTouchStyle = {
  touchAction: 'none',
  userSelect: 'none',
} as ViewStyle;

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function getTouchById(
  touches: readonly WebTouch[] | undefined,
  identifier: number | string | null,
) {
  const touchCount = touches?.length ?? 0;

  if (touchCount === 0) {
    return null;
  }

  if (identifier === null) {
    return touches?.[0] ?? null;
  }

  for (let index = 0; index < touchCount; index += 1) {
    const touch = touches?.[index];

    if (touch?.identifier === identifier) {
      return touch;
    }
  }

  return null;
}

function getJoystickOffset(
  event: GestureResponderEvent,
  identifier: number | string | null,
) {
  const webEvent = event as WebTouchEvent;
  const nativeEvent = event.nativeEvent as unknown as WebTouchNativeEvent;
  const touch =
    getTouchById(nativeEvent.touches, identifier) ??
    getTouchById(nativeEvent.changedTouches, identifier) ??
    nativeEvent;

  if (touch.locationX !== undefined && touch.locationY !== undefined) {
    return {
      x: touch.locationX - JOYSTICK_SIZE / 2,
      y: touch.locationY - JOYSTICK_SIZE / 2,
    };
  }

  const rect = webEvent.currentTarget?.getBoundingClientRect?.();

  if (!rect) {
    return null;
  }

  const clientX = touch.clientX ?? touch.pageX;
  const clientY = touch.clientY ?? touch.pageY;

  if (clientX === undefined || clientY === undefined) {
    return null;
  }

  return {
    x: clientX - rect.left - JOYSTICK_SIZE / 2,
    y: clientY - rect.top - JOYSTICK_SIZE / 2,
  };
}

function offsetToAim(offset: { x: number; y: number }) {
  const distance = Math.hypot(offset.x, offset.y);
  const scale = distance > MAX_KNOB_TRAVEL ? MAX_KNOB_TRAVEL / distance : 1;
  const clampedX = offset.x * scale;
  const clampedY = offset.y * scale;

  return {
    aim: {
      xRatio: clamp((clampedX / MAX_KNOB_TRAVEL + 1) / 2),
      yRatio: clamp((clampedY / MAX_KNOB_TRAVEL + 1) / 2),
    },
    offset: {
      x: clampedX,
      y: clampedY,
    },
  };
}

function aimToOffset(aim: AimPoint) {
  return {
    x: (clamp(aim.xRatio) * 2 - 1) * MAX_KNOB_TRAVEL,
    y: (clamp(aim.yRatio) * 2 - 1) * MAX_KNOB_TRAVEL,
  };
}

export function AimJoystick({ aim, onAimChange }: AimJoystickProps) {
  const activeTouchIdRef = useRef<number | string | null>(null);
  const latestAimRef = useRef(aim);
  const returnFrameRef = useRef<number | null>(null);
  const returnStartTimeRef = useRef<number | null>(null);
  const knobOffset = aimToOffset(aim);

  useEffect(() => {
    latestAimRef.current = aim;
  }, [aim]);

  const cancelReturnAnimation = useCallback(() => {
    if (returnFrameRef.current !== null) {
      cancelAnimationFrame(returnFrameRef.current);
      returnFrameRef.current = null;
    }

    returnStartTimeRef.current = null;
  }, []);

  useEffect(() => () => cancelReturnAnimation(), [cancelReturnAnimation]);

  const returnAimToCenter = useCallback(() => {
    cancelReturnAnimation();

    const startAim = latestAimRef.current;

    const animate = (time: number) => {
      if (returnStartTimeRef.current === null) {
        returnStartTimeRef.current = time;
      }

      const elapsed = time - returnStartTimeRef.current;
      const progress = clamp(elapsed / RETURN_TO_CENTER_DURATION_MS);
      const easedProgress = 1 - (1 - progress) ** 3;
      const nextAim = {
        xRatio:
          startAim.xRatio +
          (CENTER_AIM.xRatio - startAim.xRatio) * easedProgress,
        yRatio:
          startAim.yRatio +
          (CENTER_AIM.yRatio - startAim.yRatio) * easedProgress,
      };

      latestAimRef.current = nextAim;
      onAimChange(nextAim);

      if (progress < 1) {
        returnFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      returnFrameRef.current = null;
      returnStartTimeRef.current = null;
    };

    returnFrameRef.current = requestAnimationFrame(animate);
  }, [cancelReturnAnimation, onAimChange]);

  const handleTouch = useCallback(
    (event: GestureResponderEvent) => {
      event.preventDefault();
      cancelReturnAnimation();

      const nativeEvent = event.nativeEvent as unknown as WebTouchNativeEvent;
      const firstTouch =
        getTouchById(nativeEvent.changedTouches, activeTouchIdRef.current) ??
        getTouchById(nativeEvent.touches, activeTouchIdRef.current);

      if (activeTouchIdRef.current === null && firstTouch?.identifier !== undefined) {
        activeTouchIdRef.current = firstTouch.identifier;
      }

      const offset = getJoystickOffset(event, activeTouchIdRef.current);

      if (!offset) {
        return;
      }

      const nextAim = offsetToAim(offset).aim;

      latestAimRef.current = nextAim;
      onAimChange(nextAim);
    },
    [cancelReturnAnimation, onAimChange],
  );

  const handleTouchEnd = useCallback(
    (event: GestureResponderEvent) => {
      const nativeEvent = event.nativeEvent as unknown as WebTouchNativeEvent;
      const endedTouch = getTouchById(
        nativeEvent.changedTouches,
        activeTouchIdRef.current,
      );

      if (endedTouch) {
        activeTouchIdRef.current = null;
        returnAimToCenter();
      }
    },
    [returnAimToCenter],
  );

  return (
    <View
      accessibilityLabel="Aim shot"
      accessibilityRole="adjustable"
      onTouchCancel={handleTouchEnd}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouch}
      onTouchStart={handleTouch}
      style={[styles.container, lockedTouchStyle]}>
      <View style={styles.innerRing} />
      <View style={styles.crosshairHorizontal} />
      <View style={styles.crosshairVertical} />
      <View
        pointerEvents="none"
        style={[
          styles.knob,
          {
            transform: [
              { translateX: knobOffset.x },
              { translateY: knobOffset.y },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(9, 27, 38, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.68)',
  },
  innerRing: {
    position: 'absolute',
    width: MAX_KNOB_TRAVEL * 2,
    height: MAX_KNOB_TRAVEL * 2,
    borderRadius: MAX_KNOB_TRAVEL,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.36)',
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: JOYSTICK_SIZE - 28,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: JOYSTICK_SIZE - 28,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  knob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'rgba(226, 47, 63, 0.78)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
