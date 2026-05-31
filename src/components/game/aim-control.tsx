import { StyleSheet, View, ViewStyle } from 'react-native';

import { AimJoystick } from '@/components/game/aim-joystick';
import { AimPoint } from '@/components/game/aim-types';

type AimControlProps = {
  aim: AimPoint;
  onAimChange: (aim: AimPoint) => void;
};

const lockedTouchStyle = {
  touchAction: 'none',
  userSelect: 'none',
} as ViewStyle;

export function AimControl({ aim, onAimChange }: AimControlProps) {
  return (
    <View style={[styles.container, lockedTouchStyle]}>
      <AimJoystick aim={aim} onAimChange={onAimChange} />
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
});
