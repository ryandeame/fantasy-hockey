import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  isSupabaseConfigured,
  supabase,
  TournamentHighScore,
} from '@/lib/supabase';

type HighScoreScreenProps = {
  onBack: () => void;
};

function getPlayerName(score: TournamentHighScore) {
  return score.display_name || score.user_email || 'Player';
}

export function HighScoreScreen({ onBack }: HighScoreScreenProps) {
  const [scores, setScores] = useState<TournamentHighScore[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadScores = useCallback(async () => {
    if (!supabase) {
      setMessage('Supabase is not configured yet.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from('tournament_high_scores')
      .select('*')
      .order('total_goals', { ascending: false })
      .order('completed_rounds', { ascending: false })
      .order('total_shots', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(25);

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setScores((data ?? []) as TournamentHighScore[]);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadScores();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadScores]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text selectable={false} style={styles.eyebrow}>
          Tournament
        </Text>
        <Text selectable={false} style={styles.title}>
          High Scores
        </Text>
      </View>

      {!isSupabaseConfigured ? (
        <Text selectable style={styles.messageText}>
          Add Supabase env vars to load scores.
        </Text>
      ) : null}
      {message ? (
        <Text selectable style={styles.messageText}>
          {message}
        </Text>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scoreList}
        style={styles.scoreScroller}>
        {isLoading ? (
          <Text selectable={false} style={styles.emptyText}>
            Loading scores
          </Text>
        ) : null}
        {!isLoading && scores.length === 0 ? (
          <Text selectable={false} style={styles.emptyText}>
            No recorded tournament scores yet
          </Text>
        ) : null}
        {scores.map((score, index) => (
          <View key={score.id} style={styles.scoreRow}>
            <Text selectable={false} style={styles.rankText}>
              #{index + 1}
            </Text>
            <View style={styles.scoreDetails}>
              <Text selectable style={styles.playerText}>
                {getPlayerName(score)}
              </Text>
              <Text selectable={false} style={styles.teamText}>
                {score.player_team_name}
              </Text>
            </View>
            <View style={styles.statColumn}>
              <Text selectable={false} style={styles.goalsText}>
                {score.total_goals}
              </Text>
              <Text selectable={false} style={styles.statLabel}>
                Goals
              </Text>
            </View>
            <View style={styles.statColumn}>
              <Text selectable={false} style={styles.statText}>
                {score.completed_rounds}
              </Text>
              <Text selectable={false} style={styles.statLabel}>
                Rounds
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={loadScores}
          style={styles.secondaryButton}>
          <Text selectable={false} style={styles.secondaryButtonText}>
            Refresh
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.primaryButton}>
          <Text selectable={false} style={styles.primaryButtonText}>
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
    gap: 14,
    paddingTop: 52,
    paddingRight: 18,
    paddingBottom: 24,
    paddingLeft: 18,
    backgroundColor: '#0B1624',
  },
  header: {
    gap: 4,
  },
  eyebrow: {
    color: '#BAE6FD',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 42,
  },
  messageText: {
    color: '#FDE68A',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  scoreScroller: {
    flex: 1,
  },
  scoreList: {
    gap: 10,
    paddingBottom: 12,
  },
  emptyText: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  scoreRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(248, 250, 252, 0.94)',
  },
  rankText: {
    width: 38,
    color: '#2563EB',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
  },
  scoreDetails: {
    flex: 1,
    gap: 2,
  },
  playerText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
  teamText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  statColumn: {
    alignItems: 'flex-end',
  },
  goalsText: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0,
  },
  statText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  primaryButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
});
