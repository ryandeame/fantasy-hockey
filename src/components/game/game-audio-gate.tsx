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
const WEB_AUDIO_PREFERENCE_KEY = 'fantasy-hockey.audio-preference';

type WebAudioPreference = 'music' | 'muted';

function getStoredWebAudioPreference() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedPreference = window.localStorage.getItem(
      WEB_AUDIO_PREFERENCE_KEY,
    );

    if (storedPreference === 'music' || storedPreference === 'muted') {
      return storedPreference;
    }
  } catch {
    return null;
  }

  return null;
}

export function GameAudioGate() {
  const playlist = useAudioPlaylist(gamePlaylist);
  const isWeb = process.env.EXPO_OS === 'web' || typeof window !== 'undefined';
  const [webAudioPreference, setWebAudioPreference] =
    useState<WebAudioPreference | null>(() => getStoredWebAudioPreference());
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

  useEffect(() => {
    if (webAudioPreference === 'music') {
      playWebMusic();
    }
  }, [playWebMusic, webAudioPreference]);

  const handlePlayMusic = () => {
    if (isWeb && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(WEB_AUDIO_PREFERENCE_KEY, 'music');
      } catch {
        // Storage failures should not block the user's current choice.
      }
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
    if (!isWeb || typeof window === 'undefined') {
      return;
    }

    const audio = webAudioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    try {
      window.localStorage.setItem(WEB_AUDIO_PREFERENCE_KEY, 'muted');
    } catch {
      // Storage failures should not block the user's current choice.
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
          Game audio
        </Text>
        <Text selectable style={styles.message}>
          Choose whether this browser should play music.
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
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.58)',
    backgroundColor: 'rgba(8, 31, 45, 0.9)',
    padding: 18,
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.86)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 20,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  secondaryButton: {
    backgroundColor: 'rgba(248, 250, 252, 0.74)',
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
});
