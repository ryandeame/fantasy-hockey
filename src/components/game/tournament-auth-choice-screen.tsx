import { Pressable, StyleSheet, Text, View } from 'react-native';

type TournamentAuthChoiceScreenProps = {
  onBack: () => void;
  onContinueAnonymous: () => void;
  onLogin: () => void;
};

export function TournamentAuthChoiceScreen({
  onBack,
  onContinueAnonymous,
  onLogin,
}: TournamentAuthChoiceScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.panel}>
        <Text selectable={false} style={styles.eyebrow}>
          Tournament
        </Text>
        <Text selectable={false} style={styles.title}>
          Record your run?
        </Text>
        <Text selectable style={styles.body}>
          Log in or create a user before starting if you want this tournament
          attempt saved to the high-score board.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onLogin}
          style={styles.primaryButton}>
          <Text selectable={false} style={styles.primaryButtonText}>
            Log In / Create User
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onContinueAnonymous}
          style={styles.secondaryButton}>
          <Text selectable={false} style={styles.secondaryButtonText}>
            Play Without Recording
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onBack}>
          <Text selectable={false} style={styles.backText}>
            Back
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0B1624',
  },
  panel: {
    width: '100%',
    maxWidth: 500,
    gap: 14,
    borderRadius: 8,
    padding: 22,
    backgroundColor: 'rgba(248, 250, 252, 0.96)',
  },
  eyebrow: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0F172A',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 38,
  },
  body: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 23,
  },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.18)',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  backText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
});
