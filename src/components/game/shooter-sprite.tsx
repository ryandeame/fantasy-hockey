import { Image } from 'expo-image';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type ShooterSpriteProps = {
  shooterImage?: number;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_SHOOTER_IMAGE = require('@/assets/images/shooters/webp/anchorage-icehawks-shooter.transparent.webp');

export function ShooterSprite({ shooterImage, style }: ShooterSpriteProps) {
  return (
    <View pointerEvents="none" style={[styles.container, styles.sprite, style]}>
      <Image
        cachePolicy="memory-disk"
        priority="high"
        source={shooterImage ?? DEFAULT_SHOOTER_IMAGE}
        contentFit="contain"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
  },
  sprite: {
    position: 'absolute',
    zIndex: 3,
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
