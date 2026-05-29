import { Asset } from 'expo-asset';
import { setAudioModeAsync, useAudioPlaylist } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const gameMusic = require('@/assets/sounds/Frozen Riff (Hockey Game Mix).mp3');
const gamePlaylist = {
  sources: [gameMusic],
  loop: 'all' as const,
  updateInterval: 250,
};

export function GameAudioGate() {
  const playlist = useAudioPlaylist(gamePlaylist);
  const isWeb = process.env.EXPO_OS === 'web' || typeof window !== 'undefined';
  const [webAudioEnabled, setWebAudioEnabled] = useState(false);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const needsUserEnable = isWeb && !webAudioEnabled;

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

  const handleEnableSound = () => {
    if (isWeb && typeof window !== 'undefined') {
      const asset = Asset.fromModule(gameMusic);
      const audio = webAudioRef.current ?? new window.Audio(asset.uri);

      audio.loop = true;
      webAudioRef.current = audio;
      void audio
        .play()
        .then(() => {
          setWebAudioEnabled(true);
        })
        .catch(() => {
          setWebAudioEnabled(false);
        });
      return;
    }

    try {
      playlist.play();
    } catch {
      // The overlay remains visible while playback is blocked.
    }
  };

  if (!isWeb || !needsUserEnable) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={styles.dialog}>
        <Text selectable style={styles.title}>
          Enable sound
        </Text>
        <Text selectable style={styles.message}>
          Your browser is waiting for a tap before music can play.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enable game sound"
          onPress={handleEnableSound}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}>
          <Text selectable={false} style={styles.buttonText}>
            Enable Audio
          </Text>
        </Pressable>
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
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
});
