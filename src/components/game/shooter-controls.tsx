import { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  type GestureResponderEvent,
  View,
  ViewStyle,
} from 'react-native';

export type MoveAxis = number;

type ShooterControlsProps = {
  onAxisChange: (axis: MoveAxis) => void;
  onShoot: () => void;
  showMobileControls: boolean;
};

const JOYSTICK_SIZE = 112;
const KNOB_SIZE = 42;
const MAX_KNOB_TRAVEL = 34;
const UP_SLOT_THRESHOLD = 28;
const lockedTouchStyle = {
  touchAction: 'none',
  userSelect: 'none',
} as ViewStyle;

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
  identifier?: number;
  locationX?: number;
  locationY?: number;
  pageX?: number;
  pageY?: number;
  touches?: readonly WebTouch[];
};

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

function getTouchOffset(
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

export function ShooterControls({
  onAxisChange,
  onShoot,
  showMobileControls,
}: ShooterControlsProps) {
  const activeKeys = useRef(new Set<string>());
  const activeTouchIdRef = useRef<number | string | null>(null);
  const isUpSlotActiveRef = useRef(false);
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (process.env.EXPO_OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const keys = activeKeys.current;

    const syncKeyboardDirection = () => {
      const leftPressed = keys.has('ArrowLeft');
      const rightPressed = keys.has('ArrowRight');

      if (leftPressed === rightPressed) {
        onAxisChange(0);
        return;
      }

      onAxisChange(leftPressed ? -1 : 1);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      event.preventDefault();
      keys.add(event.key);
      syncKeyboardDirection();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      event.preventDefault();
      keys.delete(event.key);
      syncKeyboardDirection();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      keys.clear();
      onAxisChange(0);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onAxisChange]);

  const updateJoystick = useCallback(
    (distanceX: number, distanceY = 0) => {
      const isUpSlot =
        distanceY <= -UP_SLOT_THRESHOLD &&
        Math.abs(distanceY) > Math.abs(distanceX) * 0.8;
      const nextKnobX = Math.max(
        -MAX_KNOB_TRAVEL,
        Math.min(MAX_KNOB_TRAVEL, distanceX),
      );
      const nextKnobY = isUpSlot ? -MAX_KNOB_TRAVEL : 0;

      setKnobOffset({ x: nextKnobX, y: nextKnobY });

      if (isUpSlot) {
        onAxisChange(0);

        if (!isUpSlotActiveRef.current) {
          isUpSlotActiveRef.current = true;
          onShoot();
        }

        return;
      }

      isUpSlotActiveRef.current = false;
      onAxisChange(nextKnobX / MAX_KNOB_TRAVEL);
    },
    [onAxisChange, onShoot],
  );

  const resetJoystick = useCallback(() => {
    activeTouchIdRef.current = null;
    isUpSlotActiveRef.current = false;
    setKnobOffset({ x: 0, y: 0 });
    onAxisChange(0);
  }, [onAxisChange]);

  const handleJoystickTouch = useCallback(
    (event: GestureResponderEvent) => {
      if (!showMobileControls) {
        return;
      }

      event.preventDefault();

      const nativeEvent = event.nativeEvent as unknown as WebTouchNativeEvent;
      const firstTouch =
        getTouchById(nativeEvent.changedTouches, activeTouchIdRef.current) ??
        getTouchById(nativeEvent.touches, activeTouchIdRef.current);

      if (activeTouchIdRef.current === null && firstTouch?.identifier !== undefined) {
        activeTouchIdRef.current = firstTouch.identifier;
      }

      const offset = getTouchOffset(event, activeTouchIdRef.current);

      if (offset) {
        updateJoystick(offset.x, offset.y);
      }
    },
    [showMobileControls, updateJoystick],
  );

  const handleJoystickEnd = useCallback(
    (event: GestureResponderEvent) => {
      const nativeEvent = event.nativeEvent as unknown as WebTouchNativeEvent;
      const endedTouch = getTouchById(
        nativeEvent.changedTouches,
        activeTouchIdRef.current,
      );

      if (endedTouch) {
        resetJoystick();
      }
    },
    [resetJoystick],
  );

  if (!showMobileControls) {
    return null;
  }

  return (
    <View
      accessibilityLabel="Move shooter"
      accessibilityRole="adjustable"
      style={[styles.mobileControls, lockedTouchStyle]}>
      <View
        style={styles.joystickTrack}
        onTouchCancel={handleJoystickEnd}
        onTouchEnd={handleJoystickEnd}
        onTouchMove={handleJoystickTouch}
        onTouchStart={handleJoystickTouch}>
        <View style={styles.upSlot} />
        <View style={styles.joystickRail} />
        <View
          style={[
            styles.joystickKnob,
            {
              transform: [
                { translateX: knobOffset.x },
                { translateY: knobOffset.y },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileControls: {
    position: 'absolute',
    bottom: '18%',
    left: '0%',
    zIndex: 4,
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joystickTrack: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 31, 45, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.56)',
  },
  upSlot: {
    position: 'absolute',
    top: 12,
    width: 8,
    height: 44,
    borderRadius: 4,
    backgroundColor: 'rgba(8, 31, 45, 0.34)',
  },
  joystickRail: {
    width: 72,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(8, 31, 45, 0.34)',
  },
  joystickKnob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'rgba(8, 31, 45, 0.82)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.84)',
  },
});
