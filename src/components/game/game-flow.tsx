import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GameAudioGate } from '@/components/game/game-audio-gate';
import { HockeyGameScene } from '@/components/game/hockey-game-scene';
import { TeamSelectScreen } from '@/components/game/team-select-screen';
import {
  getAlphabetizedTeams,
  getDefaultTeamSelection,
  HockeyTeam,
  HOCKEY_TEAMS,
} from '@/data/teams';

type GameMode = 'team-select' | 'play';

type TeamSelection = {
  goalieTeam: HockeyTeam;
  shooterTeam: HockeyTeam;
};

export function GameFlow() {
  const teams = useMemo(() => getAlphabetizedTeams(HOCKEY_TEAMS), []);
  const defaults = useMemo(() => getDefaultTeamSelection(teams), [teams]);
  const defaultGoalieTeam = teams.find((team) => team.id === defaults.topTeamId) ?? teams[0];
  const defaultShooterTeam =
    teams.find((team) => team.id === defaults.bottomTeamId) ?? teams[1] ?? teams[0];
  const [mode, setMode] = useState<GameMode>('team-select');
  const [selection, setSelection] = useState<TeamSelection>({
    goalieTeam: defaultGoalieTeam,
    shooterTeam: defaultShooterTeam,
  });

  return (
    <View style={styles.container}>
      {mode === 'play' ? (
        <HockeyGameScene
          goalieTeam={selection.goalieTeam}
          shooterTeam={selection.shooterTeam}
        />
      ) : (
        <TeamSelectScreen
          selectedBottomTeamId={selection.shooterTeam.id}
          selectedTopTeamId={selection.goalieTeam.id}
          onConfirmSelection={({ bottomTeam, topTeam }) => {
            setSelection({
              goalieTeam: topTeam,
              shooterTeam: bottomTeam,
            });
            setMode('play');
          }}
          onSelectionChange={({ bottomTeam, topTeam }) => {
            setSelection({
              goalieTeam: topTeam,
              shooterTeam: bottomTeam,
            });
          }}
        />
      )}
      <GameAudioGate />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});
