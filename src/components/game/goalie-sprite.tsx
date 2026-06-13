import { Image } from 'expo-image';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export const DEFAULT_GOALIE_SPRITE_SOURCE = require('@/assets/images/goalies/in-game/anchorage-icehawks-goalie.transparent.webp');

type GoalieSpriteProps = {
  source?: number;
  style?: StyleProp<ViewStyle>;
};

export function GoalieSprite({ source = DEFAULT_GOALIE_SPRITE_SOURCE, style }: GoalieSpriteProps) {
  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      <Image
        source={source}
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
