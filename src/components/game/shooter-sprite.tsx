import { Image } from 'expo-image';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type ShooterSpriteProps = {
  style?: StyleProp<ViewStyle>;
};

export function ShooterSprite({ style }: ShooterSpriteProps) {
  return (
    <View pointerEvents="none" style={[styles.container, styles.sprite, style]}>
      <Image
        source={require('@/assets/images/b47af213-b35b-4df2-bd88-1c8cb285acf3.transparent.png')}
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
