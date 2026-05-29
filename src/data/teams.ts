export type HockeyTeam = {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
  primaryColor: string;
  secondaryColor: string;
  teamWindowImage?: number;
};

export const HOCKEY_TEAMS: HockeyTeam[] = [
  {
    id: 'anchorage-icehawks',
    name: 'Icehawks',
    abbreviation: 'ANC',
    city: 'Anchorage',
    primaryColor: '#0E7490',
    secondaryColor: '#ECFEFF',
  },
  {
    id: 'boston-bears',
    name: 'Bears',
    abbreviation: 'BOS',
    city: 'Boston',
    primaryColor: '#111827',
    secondaryColor: '#FBBF24',
    teamWindowImage: require('@/assets/images/boston-bears-team-window.transparent.png'),
  },
  {
    id: 'calgary-comets',
    name: 'Comets',
    abbreviation: 'CGY',
    city: 'Calgary',
    primaryColor: '#B91C1C',
    secondaryColor: '#FDE68A',
  },
  {
    id: 'detroit-blades',
    name: 'Blades',
    abbreviation: 'DET',
    city: 'Detroit',
    primaryColor: '#991B1B',
    secondaryColor: '#F8FAFC',
  },
  {
    id: 'minnesota-pines',
    name: 'Pines',
    abbreviation: 'MIN',
    city: 'Minnesota',
    primaryColor: '#166534',
    secondaryColor: '#EAB308',
  },
  {
    id: 'seattle-orcas',
    name: 'Orcas',
    abbreviation: 'SEA',
    city: 'Seattle',
    primaryColor: '#0F766E',
    secondaryColor: '#99F6E4',
  },
];

export function getAlphabetizedTeams(teams: readonly HockeyTeam[] = HOCKEY_TEAMS) {
  return [...teams].sort((leftTeam, rightTeam) =>
    `${leftTeam.city} ${leftTeam.name}`.localeCompare(
      `${rightTeam.city} ${rightTeam.name}`,
    ),
  );
}

export function getDefaultTeamSelection(
  teams: readonly HockeyTeam[] = HOCKEY_TEAMS,
) {
  const alphabetizedTeams = getAlphabetizedTeams(teams);

  return {
    topTeamId: alphabetizedTeams[0]?.id,
    bottomTeamId: alphabetizedTeams[1]?.id ?? alphabetizedTeams[0]?.id,
  };
}
