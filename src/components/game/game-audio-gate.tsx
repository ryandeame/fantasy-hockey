import { Asset } from 'expo-asset';
import { setAudioModeAsync, useAudioPlaylist } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const gameMusic = require('@/assets/sounds/Frozen Riff (Hockey Game Mix).mp3');
const gamePlaylist = {
  sources: [gameMusic],
  loop: 'all' as const,
  updateInterval: 250,
};

type WebAudioPreference = 'music' | 'muted';

export function GameAudioGate() {
  const playlist = useAudioPlaylist(gamePlaylist);
  const isWeb = process.env.EXPO_OS === 'web' || typeof window !== 'undefined';
  const [webAudioPreference, setWebAudioPreference] =
    useState<WebAudioPreference | null>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const needsUserPreference = isWeb && webAudioPreference === null;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
    });
  }, []);

  useEffect(() => {
    if (isWeb) {
      return;
    }

    try {
      playlist.play();
    } catch {
      // Native playback failures are non-blocking for the scene.
    }
  }, [isWeb, playlist]);

  const playWebMusic = useCallback(() => {
    if (!isWeb || typeof window === 'undefined') {
      return;
    }

    const asset = Asset.fromModule(gameMusic);
    const audio = webAudioRef.current ?? new window.Audio(asset.uri);

    audio.loop = true;
    webAudioRef.current = audio;
    void audio.play().catch(() => {
      // Browsers may still block autoplay after reload; keep the stored choice.
    });
  }, [isWeb]);

  const handlePlayMusic = () => {
    if (isWeb && typeof window !== 'undefined') {
      setWebAudioPreference('music');
      playWebMusic();
      return;
    }

    try {
      playlist.play();
    } catch {
      // The overlay remains visible while playback is blocked.
    }
  };

  const handleNoSound = () => {
    const audio = webAudioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setWebAudioPreference('muted');
  };

  if (!isWeb || !needsUserPreference) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={styles.dialog}>
        <Text selectable style={styles.title}>
          Audio
        </Text>
        <Text selectable style={styles.message}>
          Play music?
        </Text>
        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Play music"
            onPress={handlePlayMusic}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}>
            <Text selectable={false} style={styles.buttonText}>
              Play music
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="No sound"
            onPress={handleNoSound}
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text selectable={false} style={styles.buttonText}>
              No sound
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 18,
    paddingRight: 14,
    paddingLeft: 14,
  },
  dialog: {
    width: '100%',
    maxWidth: 260,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.58)',
    backgroundColor: 'rgba(8, 31, 45, 0.9)',
    padding: 10,
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.86)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
  },
  button: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  secondaryButton: {
    backgroundColor: 'rgba(248, 250, 252, 0.74)',
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
});
