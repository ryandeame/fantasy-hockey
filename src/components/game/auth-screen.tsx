import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AuthScreenProps = {
  onBack: () => void;
  onSkip: () => void;
  onSignedIn: () => void;
};

type AuthMode = 'sign-in' | 'sign-up';

export function AuthScreen({ onBack, onSignedIn, onSkip }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignUp = authMode === 'sign-up';

  const submitAuth = async () => {
    if (!supabase) {
      setMessage('Supabase is not configured yet.');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const normalizedEmail = email.trim();
    const authResult = isSignUp
      ? await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              display_name: displayName.trim(),
            },
          },
        })
      : await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

    setIsSubmitting(false);

    if (authResult.error) {
      setMessage(authResult.error.message);
      return;
    }

    if (isSignUp && !authResult.data.session) {
      setMessage('Check your email to confirm the new account, then sign in.');
      return;
    }

    onSignedIn();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.panel}>
        <Text selectable={false} style={styles.eyebrow}>
          Tournament Account
        </Text>
        <Text selectable={false} style={styles.title}>
          {isSignUp ? 'Create User' : 'Log In'}
        </Text>
        <Text selectable style={styles.body}>
          Log in to record tournament attempts and appear on the high-score
          board. You can also continue without recording results.
        </Text>

        {!isSupabaseConfigured ? (
          <Text selectable style={styles.warningText}>
            Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to
            enable auth.
          </Text>
        ) : null}

        {isSignUp ? (
          <TextInput
            autoCapitalize="words"
            onChangeText={setDisplayName}
            placeholder="Display name"
            placeholderTextColor="#64748B"
            style={styles.input}
            value={displayName}
          />
        ) : null}
        <TextInput
          autoCapitalize="none"
          inputMode="email"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#64748B"
          style={styles.input}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#64748B"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {message ? (
          <Text selectable style={styles.messageText}>
            {message}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting || !isSupabaseConfigured}
          onPress={submitAuth}
          style={[
            styles.primaryButton,
            (isSubmitting || !isSupabaseConfigured) && styles.disabledButton,
          ]}>
          <Text selectable={false} style={styles.primaryButtonText}>
            {isSubmitting ? 'Working' : isSignUp ? 'Create User' : 'Log In'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setAuthMode(isSignUp ? 'sign-in' : 'sign-up')}
          style={styles.secondaryButton}>
          <Text selectable={false} style={styles.secondaryButtonText}>
            {isSignUp ? 'Already have an account?' : 'Create a new user'}
          </Text>
        </Pressable>

        <View style={styles.footerActions}>
          <Pressable accessibilityRole="button" onPress={onSkip}>
            <Text selectable={false} style={styles.footerActionText}>
              Continue without login
            </Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onBack}>
            <Text selectable={false} style={styles.footerActionText}>
              Back
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0B1624',
  },
  panel: {
    width: '100%',
    maxWidth: 480,
    gap: 12,
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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 21,
  },
  warningText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 18,
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.16)',
    paddingRight: 12,
    paddingLeft: 12,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  messageText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  disabledButton: {
    opacity: 0.48,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
  },
  footerActionText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
});
