import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthScreen } from '@/components/game/auth-screen';
import { GameAudioGate } from '@/components/game/game-audio-gate';
import { HighScoreScreen } from '@/components/game/high-score-screen';
import { HockeyGameScene } from '@/components/game/hockey-game-scene';
import { MainMenuScreen } from '@/components/game/main-menu-screen';
import { TeamSelectScreen } from '@/components/game/team-select-screen';
import { TournamentAuthChoiceScreen } from '@/components/game/tournament-auth-choice-screen';
import {
  getAlphabetizedTeams,
  getDefaultTeamSelection,
  HockeyTeam,
  HOCKEY_TEAMS,
} from '@/data/teams';
import {
  supabase,
  SupabaseSession,
} from '@/lib/supabase';

type GameScreen =
  | 'auth'
  | 'high-scores'
  | 'main-menu'
  | 'tournament-auth-choice'
  | 'versus-select'
  | 'versus-play'
  | 'tournament-select'
  | 'tournament-play'
  | 'tournament-result';

type TeamSelection = {
  goalieTeam: HockeyTeam;
  shooterTeam: HockeyTeam;
};

type TournamentState = {
  opponentIndex: number;
  opponents: HockeyTeam[];
  playerTeam: HockeyTeam;
  recordScores: boolean;
  result: TournamentRoundResult | null;
  savedScore: boolean;
  saveMessage: string | null;
  totals: TournamentTotals;
};

type TournamentRoundResult = {
  goals: number;
  misses: number;
  passed: boolean;
  saves: number;
  shots: number;
};

type TournamentTotals = {
  goals: number;
  misses: number;
  roundsCompleted: number;
  saves: number;
  shots: number;
};

const TOURNAMENT_GOALS_REQUIRED = 6;
const TOURNAMENT_OPPONENT_COUNT = 5;
const TOURNAMENT_SHOTS_ALLOWED = 10;

function shuffleTeams(teams: readonly HockeyTeam[]) {
  const shuffledTeams = [...teams];

  for (let index = shuffledTeams.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentTeam = shuffledTeams[index];

    shuffledTeams[index] = shuffledTeams[swapIndex];
    shuffledTeams[swapIndex] = currentTeam;
  }

  return shuffledTeams;
}

function getTeamLabel(team: HockeyTeam) {
  return `${team.city} ${team.name}`;
}

const emptyTournamentTotals: TournamentTotals = {
  goals: 0,
  misses: 0,
  roundsCompleted: 0,
  saves: 0,
  shots: 0,
};

export function GameFlow() {
  const teams = useMemo(() => getAlphabetizedTeams(HOCKEY_TEAMS), []);
  const defaults = useMemo(() => getDefaultTeamSelection(teams), [teams]);
  const defaultGoalieTeam = teams.find((team) => team.id === defaults.topTeamId) ?? teams[0];
  const defaultShooterTeam =
    teams.find((team) => team.id === defaults.bottomTeamId) ?? teams[1] ?? teams[0];
  const [screen, setScreen] = useState<GameScreen>('main-menu');
  const [playKey, setPlayKey] = useState(0);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [selection, setSelection] = useState<TeamSelection>({
    goalieTeam: defaultGoalieTeam,
    shooterTeam: defaultShooterTeam,
  });
  const [tournament, setTournament] = useState<TournamentState | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const beginVersus = () => {
    setScreen('versus-select');
  };

  const beginTournament = () => {
    setScreen(session ? 'tournament-select' : 'tournament-auth-choice');
  };

  const startTournamentForTeam = (playerTeam: HockeyTeam, recordScores = Boolean(session)) => {
    const opponents = shuffleTeams(
      teams.filter((team) => team.id !== playerTeam.id),
    ).slice(0, TOURNAMENT_OPPONENT_COUNT);
    const firstOpponent = opponents[0] ?? defaultGoalieTeam;

    setTournament({
      opponentIndex: 0,
      opponents,
      playerTeam,
      recordScores,
      result: null,
      savedScore: false,
      saveMessage: null,
      totals: emptyTournamentTotals,
    });
    setSelection({
      goalieTeam: firstOpponent,
      shooterTeam: playerTeam,
    });
    setPlayKey((currentKey) => currentKey + 1);
    setScreen('tournament-play');
  };

  const saveTournamentAttempt = async ({
    finalResult,
    nextTotals,
    tournamentState,
    tournamentWon,
  }: {
    finalResult: TournamentRoundResult;
    nextTotals: TournamentTotals;
    tournamentState: TournamentState;
    tournamentWon: boolean;
  }) => {
    if (
      !supabase ||
      !session ||
      !tournamentState.recordScores ||
      tournamentState.savedScore
    ) {
      return;
    }

    const user = session.user;
    const displayName =
      typeof user.user_metadata?.display_name === 'string'
        ? user.user_metadata.display_name
        : null;
    const { error } = await supabase.from('tournament_high_scores').insert({
      user_id: user.id,
      user_email: user.email,
      display_name: displayName,
      player_team_id: tournamentState.playerTeam.id,
      player_team_name: getTeamLabel(tournamentState.playerTeam),
      completed_rounds: nextTotals.roundsCompleted,
      opponent_team_ids: tournamentState.opponents.map((team) => team.id),
      opponent_team_names: tournamentState.opponents.map(getTeamLabel),
      total_goals: nextTotals.goals,
      total_saves: nextTotals.saves,
      total_misses: nextTotals.misses,
      total_shots: nextTotals.shots,
      tournament_won: tournamentWon,
      final_round_result: finalResult,
    });

    setTournament((currentTournament) =>
      currentTournament
        ? {
            ...currentTournament,
            savedScore: !error,
            saveMessage: error
              ? `Score save failed: ${error.message}`
              : 'Tournament score recorded.',
          }
        : currentTournament,
    );
  };

  const handleTournamentComplete = (result: TournamentRoundResult) => {
    const currentTournament = tournament;

    if (!currentTournament) {
      setScreen('tournament-result');
      return;
    }

    const roundWasCompleted = result.passed ? 1 : 0;
    const nextTotals = {
      goals: currentTournament.totals.goals + result.goals,
      misses: currentTournament.totals.misses + result.misses,
      roundsCompleted: currentTournament.totals.roundsCompleted + roundWasCompleted,
      saves: currentTournament.totals.saves + result.saves,
      shots: currentTournament.totals.shots + result.shots,
    };
    const tournamentWon =
      result.passed &&
      currentTournament.opponentIndex >= currentTournament.opponents.length - 1;
    const shouldRecordAttempt = !result.passed || tournamentWon;

    setTournament({
      ...currentTournament,
      result,
      totals: nextTotals,
    });

    if (shouldRecordAttempt) {
      void saveTournamentAttempt({
        finalResult: result,
        nextTotals,
        tournamentState: currentTournament,
        tournamentWon,
      });
    }

    setScreen('tournament-result');
  };

  const advanceTournament = () => {
    if (!tournament) {
      setScreen('main-menu');
      return;
    }

    const nextOpponentIndex = tournament.opponentIndex + 1;
    const nextOpponent = tournament.opponents[nextOpponentIndex];

    if (!nextOpponent) {
      setScreen('main-menu');
      return;
    }

    setTournament({
      ...tournament,
      opponentIndex: nextOpponentIndex,
      result: null,
    });
    setSelection({
      goalieTeam: nextOpponent,
      shooterTeam: tournament.playerTeam,
    });
    setPlayKey((currentKey) => currentKey + 1);
    setScreen('tournament-play');
  };

  const retryTournamentOpponent = () => {
    if (!tournament) {
      setScreen('tournament-select');
      return;
    }

    setTournament({
      ...tournament,
      result: null,
      savedScore: false,
      saveMessage: null,
      totals: {
        ...tournament.totals,
        goals: tournament.totals.goals - (tournament.result?.goals ?? 0),
        misses: tournament.totals.misses - (tournament.result?.misses ?? 0),
        saves: tournament.totals.saves - (tournament.result?.saves ?? 0),
        shots: tournament.totals.shots - (tournament.result?.shots ?? 0),
      },
    });
    setPlayKey((currentKey) => currentKey + 1);
    setScreen('tournament-play');
  };

  const currentTournamentOpponent =
    tournament?.opponents[tournament.opponentIndex] ?? selection.goalieTeam;

  return (
    <View style={styles.container}>
      {screen === 'main-menu' ? (
        <MainMenuScreen
          onHighScoresPress={() => setScreen('high-scores')}
          onTournamentPress={beginTournament}
          onVersusPress={beginVersus}
        />
      ) : null}
      {screen === 'high-scores' ? (
        <HighScoreScreen onBack={() => setScreen('main-menu')} />
      ) : null}
      {screen === 'tournament-auth-choice' ? (
        <TournamentAuthChoiceScreen
          onBack={() => setScreen('main-menu')}
          onContinueAnonymous={() => setScreen('tournament-select')}
          onLogin={() => setScreen('auth')}
        />
      ) : null}
      {screen === 'auth' ? (
        <AuthScreen
          onBack={() => setScreen('tournament-auth-choice')}
          onSignedIn={() => setScreen('tournament-select')}
          onSkip={() => setScreen('tournament-select')}
        />
      ) : null}
      {screen === 'versus-play' ? (
        <HockeyGameScene
          goalieTeam={selection.goalieTeam}
          shooterTeam={selection.shooterTeam}
        />
      ) : null}
      {screen === 'versus-select' ? (
        <TeamSelectScreen
          selectedBottomTeamId={selection.shooterTeam.id}
          selectedTopTeamId={selection.goalieTeam.id}
          onConfirmSelection={({ bottomTeam, topTeam }) => {
            setSelection({
              goalieTeam: topTeam,
              shooterTeam: bottomTeam,
            });
            setPlayKey((currentKey) => currentKey + 1);
            setScreen('versus-play');
          }}
          onSelectionChange={({ bottomTeam, topTeam }) => {
            setSelection({
              goalieTeam: topTeam,
              shooterTeam: bottomTeam,
            });
          }}
        />
      ) : null}
      {screen === 'tournament-select' ? (
        <TeamSelectScreen
          confirmLabel="Start Tournament"
          selectedSingleTeamId={selection.shooterTeam.id}
          selectionMode="single"
          singleTeamLabel="Your Team"
          onConfirmSingleSelection={({ team }) =>
            startTournamentForTeam(team, Boolean(session))
          }
          onSingleTeamChange={(team) => {
            setSelection({
              goalieTeam: selection.goalieTeam,
              shooterTeam: team,
            });
          }}
        />
      ) : null}
      {screen === 'tournament-play' ? (
        <HockeyGameScene
          key={`tournament-${playKey}`}
          challenge={{
            goalsRequired: TOURNAMENT_GOALS_REQUIRED,
            shotsAllowed: TOURNAMENT_SHOTS_ALLOWED,
          }}
          goalieTeam={currentTournamentOpponent}
          shooterTeam={tournament?.playerTeam ?? selection.shooterTeam}
          onChallengeComplete={handleTournamentComplete}
        />
      ) : null}
      {screen === 'tournament-result' && tournament?.result ? (
        <TournamentResult
          opponent={currentTournamentOpponent}
          opponentIndex={tournament.opponentIndex}
          opponentTotal={tournament.opponents.length}
          playerTeam={tournament.playerTeam}
          recordScores={tournament.recordScores}
          result={tournament.result}
          saveMessage={tournament.saveMessage}
          totals={tournament.totals}
          onAdvance={advanceTournament}
          onMainMenu={() => setScreen('main-menu')}
          onRetry={retryTournamentOpponent}
        />
      ) : null}
      {screen !== 'main-menu' && screen !== 'auth' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to main menu"
          onPress={() => setScreen('main-menu')}
          style={styles.menuPill}>
          <Text selectable={false} style={styles.menuPillText}>
            Menu
          </Text>
        </Pressable>
      ) : null}
      <GameAudioGate />
    </View>
  );
}

type TournamentResultProps = {
  opponent: HockeyTeam;
  opponentIndex: number;
  opponentTotal: number;
  playerTeam: HockeyTeam;
  recordScores: boolean;
  result: TournamentRoundResult;
  saveMessage: string | null;
  totals: TournamentTotals;
  onAdvance: () => void;
  onMainMenu: () => void;
  onRetry: () => void;
};

function TournamentResult({
  opponent,
  opponentIndex,
  opponentTotal,
  playerTeam,
  recordScores,
  result,
  saveMessage,
  totals,
  onAdvance,
  onMainMenu,
  onRetry,
}: TournamentResultProps) {
  const isTournamentComplete = result.passed && opponentIndex >= opponentTotal - 1;

  return (
    <View style={styles.resultScreen}>
      <View style={styles.resultPanel}>
        <Text selectable={false} style={styles.resultEyebrow}>
          Tournament Round {opponentIndex + 1}/{opponentTotal}
        </Text>
        <Text selectable={false} style={styles.resultTitle}>
          {result.passed ? 'You Advanced' : 'Round Failed'}
        </Text>
        <Text selectable style={styles.resultBody}>
          {getTeamLabel(playerTeam)} scored {result.goals} goals on{' '}
          {result.shots} shots against {getTeamLabel(opponent)}.
        </Text>
        <Text selectable={false} style={styles.resultStats}>
          Goals {result.goals}  Saves {result.saves}  Misses {result.misses}
        </Text>
        <Text selectable={false} style={styles.resultStats}>
          Total Goals {totals.goals}  Rounds {totals.roundsCompleted}
        </Text>
        <Text selectable style={styles.resultSaveText}>
          {recordScores
            ? saveMessage ?? 'This attempt will be recorded when it ends.'
            : 'Anonymous tournament: this attempt is not recorded.'}
        </Text>

        {isTournamentComplete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Finish tournament"
            onPress={onMainMenu}
            style={styles.resultButton}>
            <Text selectable={false} style={styles.resultButtonText}>
              Tournament Complete
            </Text>
          </Pressable>
        ) : null}
        {result.passed && !isTournamentComplete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next opponent"
            onPress={onAdvance}
            style={styles.resultButton}>
            <Text selectable={false} style={styles.resultButtonText}>
              Next Opponent
            </Text>
          </Pressable>
        ) : null}
        {!result.passed ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry opponent"
            onPress={onRetry}
            style={styles.resultButton}>
            <Text selectable={false} style={styles.resultButtonText}>
              Retry Opponent
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to main menu"
          onPress={onMainMenu}
          style={styles.resultSecondaryButton}>
          <Text selectable={false} style={styles.resultSecondaryButtonText}>
            Main Menu
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  menuPill: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    borderRadius: 8,
    paddingTop: 8,
    paddingRight: 12,
    paddingBottom: 8,
    paddingLeft: 12,
    backgroundColor: 'rgba(8, 31, 45, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  menuPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  resultScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0B1624',
  },
  resultPanel: {
    width: '100%',
    maxWidth: 520,
    gap: 12,
    borderRadius: 8,
    padding: 22,
    backgroundColor: 'rgba(248, 250, 252, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  resultEyebrow: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  resultTitle: {
    color: '#0F172A',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 38,
  },
  resultBody: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 23,
  },
  resultStats: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  resultSaveText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 18,
  },
  resultButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  resultButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  resultSecondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.18)',
  },
  resultSecondaryButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
});
