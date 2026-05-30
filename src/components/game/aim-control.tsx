import { useCallback, useRef } from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { AimPoint } from '@/components/game/aim-types';

type AimControlProps = {
  aim: AimPoint;
  onAimChange: (aim: AimPoint) => void;
};

const AIM_PAD_WIDTH = 172;
const AIM_PAD_HEIGHT = 112;
const RETICLE_SIZE = 22;
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

function eventToAim(
  event: GestureResponderEvent,
  identifier: number | string | null,
): AimPoint | null {
  const webEvent = event as WebTouchEvent;
  const nativeEvent = event.nativeEvent as unknown as WebTouchNativeEvent;
  const touch =
    getTouchById(nativeEvent.touches, identifier) ??
    getTouchById(nativeEvent.changedTouches, identifier) ??
    nativeEvent;

  if (touch.locationX !== undefined && touch.locationY !== undefined) {
    return {
      xRatio: clamp(touch.locationX / AIM_PAD_WIDTH),
      yRatio: clamp(touch.locationY / AIM_PAD_HEIGHT),
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
    xRatio: clamp((clientX - rect.left) / AIM_PAD_WIDTH),
    yRatio: clamp((clientY - rect.top) / AIM_PAD_HEIGHT),
  };
}

export function AimControl({ aim, onAimChange }: AimControlProps) {
  const activeTouchIdRef = useRef<number | string | null>(null);

  const handleAimTouch = useCallback(
    (event: GestureResponderEvent) => {
      event.preventDefault();

      const nativeEvent = event.nativeEvent as unknown as WebTouchNativeEvent;
      const firstTouch =
        getTouchById(nativeEvent.changedTouches, activeTouchIdRef.current) ??
        getTouchById(nativeEvent.touches, activeTouchIdRef.current);

      if (activeTouchIdRef.current === null && firstTouch?.identifier !== undefined) {
        activeTouchIdRef.current = firstTouch.identifier;
      }

      const nextAim = eventToAim(event, activeTouchIdRef.current);

      if (nextAim) {
        onAimChange(nextAim);
      }
    },
    [onAimChange],
  );

  const handleAimEnd = useCallback(
    (event: GestureResponderEvent) => {
      const nativeEvent = event.nativeEvent as unknown as WebTouchNativeEvent;
      const endedTouch = getTouchById(
        nativeEvent.changedTouches,
        activeTouchIdRef.current,
      );

      if (endedTouch) {
        activeTouchIdRef.current = null;
      }
    },
    [],
  );

  return (
    <View
      accessibilityLabel="Aim shot"
      accessibilityRole="adjustable"
      style={[styles.container, lockedTouchStyle]}>
      <View
        style={styles.pad}
        onTouchCancel={handleAimEnd}
        onTouchEnd={handleAimEnd}
        onTouchMove={handleAimTouch}
        onTouchStart={handleAimTouch}>
        <View style={[styles.guideLine, styles.verticalGuide]} />
        <View style={[styles.guideLine, styles.horizontalGuide]} />
        <View style={[styles.cornerMark, styles.topLeftMark]} />
        <View style={[styles.cornerMark, styles.topRightMark]} />
        <View style={[styles.cornerMark, styles.bottomLeftMark]} />
        <View style={[styles.cornerMark, styles.bottomRightMark]} />
        <View
          pointerEvents="none"
          style={[
            styles.reticle,
            {
              left: aim.xRatio * AIM_PAD_WIDTH - RETICLE_SIZE / 2,
              top: aim.yRatio * AIM_PAD_HEIGHT - RETICLE_SIZE / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    zIndex: 4,
  },
  pad: {
    height: AIM_PAD_HEIGHT,
    width: AIM_PAD_WIDTH,
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.68)',
    backgroundColor: 'rgba(9, 27, 38, 0.34)',
  },
  guideLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.36)',
  },
  verticalGuide: {
    top: 0,
    bottom: 0,
    left: AIM_PAD_WIDTH / 2 - 0.5,
    width: 1,
  },
  horizontalGuide: {
    left: 0,
    right: 0,
    top: AIM_PAD_HEIGHT / 2 - 0.5,
    height: 1,
  },
  cornerMark: {
    position: 'absolute',
    height: 14,
    width: 14,
    borderColor: 'rgba(255, 255, 255, 0.76)',
  },
  topLeftMark: {
    top: 8,
    left: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRightMark: {
    top: 8,
    right: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeftMark: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRightMark: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  reticle: {
    position: 'absolute',
    height: RETICLE_SIZE,
    width: RETICLE_SIZE,
    borderRadius: RETICLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(226, 47, 63, 0.78)',
  },
});
