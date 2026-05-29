import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, ViewStyle } from 'react-native';

export type MoveAxis = number;

type ShooterControlsProps = {
  onAxisChange: (axis: MoveAxis) => void;
  showMobileControls: boolean;
};

const JOYSTICK_SIZE = 112;
const KNOB_SIZE = 42;
const MAX_KNOB_TRAVEL = 34;
const lockedTouchStyle = {
  touchAction: 'none',
  userSelect: 'none',
} as ViewStyle;

export function ShooterControls({
  onAxisChange,
  showMobileControls,
}: ShooterControlsProps) {
  const activeKeys = useRef(new Set<string>());
  const [knobX, setKnobX] = useState(0);

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
    (distance: number) => {
      const nextKnobX = Math.max(
        -MAX_KNOB_TRAVEL,
        Math.min(MAX_KNOB_TRAVEL, distance),
      );

      setKnobX(nextKnobX);
      onAxisChange(nextKnobX / MAX_KNOB_TRAVEL);
    },
    [onAxisChange],
  );

  const resetJoystick = useCallback(() => {
    setKnobX(0);
    onAxisChange(0);
  }, [onAxisChange]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => showMobileControls,
        onMoveShouldSetPanResponder: () => showMobileControls,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          updateJoystick(0);
        },
        onPanResponderMove: (_event, gestureState) => {
          updateJoystick(gestureState.dx);
        },
        onPanResponderRelease: resetJoystick,
        onPanResponderTerminate: resetJoystick,
        onPanResponderTerminationRequest: () => true,
      }),
    [resetJoystick, showMobileControls, updateJoystick],
  );

  if (!showMobileControls) {
    return null;
  }

  return (
    <View
      accessibilityLabel="Move shooter"
      accessibilityRole="adjustable"
      style={[styles.mobileControls, lockedTouchStyle]}
      {...panResponder.panHandlers}>
      <View style={styles.joystickTrack}>
        <View style={styles.joystickRail} />
        <View style={[styles.joystickKnob, { transform: [{ translateX: knobX }] }]} />
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
