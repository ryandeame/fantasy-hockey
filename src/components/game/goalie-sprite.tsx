import { Image } from 'expo-image';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type GoalieSpriteProps = {
  style?: StyleProp<ViewStyle>;
};

export function GoalieSprite({ style }: GoalieSpriteProps) {
  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      <Image
        source={require('@/assets/images/fe4e80da-74b4-4b75-996b-f1cae7b3226c.transparent.png')}
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
  image: {
    height: '100%',
    width: '100%',
  },
});
