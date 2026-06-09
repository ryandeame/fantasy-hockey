import { Image } from 'expo-image';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type GoalSpriteProps = {
  style?: StyleProp<ViewStyle>;
};

export function GoalSprite({ style }: GoalSpriteProps) {
  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      <Image
        source={require('@/assets/images/net/d11894f6-cfe0-4c4b-a865-93bfd9959bf4.transparent.png')}
        contentFit="contain"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1.5,
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
