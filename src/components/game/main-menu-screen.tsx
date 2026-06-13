import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type MainMenuScreenProps = {
  onHighScoresPress: () => void;
  onTournamentPress: () => void;
  onVersusPress: () => void;
};

const MENU_BACKGROUND = require('@/assets/images/menu/main-menu-background.png');

export function MainMenuScreen({
  onHighScoresPress,
  onTournamentPress,
  onVersusPress,
}: MainMenuScreenProps) {
  return (
    <View style={styles.screen}>
      <Image
        source={MENU_BACKGROUND}
        contentFit="cover"
        style={styles.background}
      />
      <View style={styles.scrim} />
      <View style={styles.content}>
        <View style={styles.titleGroup}>
          <Text selectable={false} style={styles.eyebrow}>
            Fantasy Hockey
          </Text>
          <Text selectable={false} style={styles.title}>
            Shootout
          </Text>
        </View>

        <View style={styles.menuButtons}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start Tournament"
            onPress={onTournamentPress}
            style={({ pressed }) => [
              styles.menuButton,
              styles.primaryButton,
              pressed && styles.pressedButton,
            ]}>
            <Text selectable={false} style={styles.primaryButtonText}>
              Tournament
            </Text>
            <Text selectable={false} style={styles.buttonSubtext}>
              5 opponents, 10 shots each
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start Versus"
            onPress={onVersusPress}
            style={({ pressed }) => [
              styles.menuButton,
              styles.secondaryButton,
              pressed && styles.pressedButton,
            ]}>
            <Text selectable={false} style={styles.secondaryButtonText}>
              Versus
            </Text>
            <Text selectable={false} style={styles.buttonSubtext}>
              Pick goalie and shooter
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View high scores"
            onPress={onHighScoresPress}
            style={({ pressed }) => [
              styles.menuButton,
              styles.tertiaryButton,
              pressed && styles.pressedButton,
            ]}>
            <Text selectable={false} style={styles.secondaryButtonText}>
              High Scores
            </Text>
            <Text selectable={false} style={styles.buttonSubtext}>
              Tournament leaderboard
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#06131d',
  },
  background: {
    ...StyleSheet.absoluteFill,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 12, 20, 0.34)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 28,
    paddingTop: 64,
    paddingRight: 24,
    paddingBottom: 42,
    paddingLeft: 24,
  },
  titleGroup: {
    gap: 4,
  },
  eyebrow: {
    color: '#BAE6FD',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 58,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 62,
    textShadowColor: 'rgba(15, 23, 42, 0.56)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 14,
  },
  menuButtons: {
    gap: 14,
  },
  menuButton: {
    minHeight: 76,
    justifyContent: 'center',
    gap: 4,
    borderRadius: 8,
    paddingTop: 14,
    paddingRight: 18,
    paddingBottom: 14,
    paddingLeft: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.42)',
  },
  primaryButton: {
    backgroundColor: 'rgba(248, 250, 252, 0.94)',
  },
  secondaryButton: {
    backgroundColor: 'rgba(8, 31, 45, 0.72)',
  },
  tertiaryButton: {
    backgroundColor: 'rgba(8, 31, 45, 0.5)',
  },
  pressedButton: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  buttonSubtext: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
});
