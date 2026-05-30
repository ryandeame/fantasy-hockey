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
    teamWindowImage: require('@/assets/images/anchorage-icehawks-team-window.transparent.png'),
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
    teamWindowImage: require('@/assets/images/calgary-comets-team-window.transparent.png'),
  },
  {
    id: 'detroit-blades',
    name: 'Blades',
    abbreviation: 'DET',
    city: 'Detroit',
    primaryColor: '#991B1B',
    secondaryColor: '#F8FAFC',
    teamWindowImage: require('@/assets/images/detroit-blades-team-window.transparent.png'),
  },
  {
    id: 'halifax-narwhals',
    name: 'Narwhals',
    abbreviation: 'HAL',
    city: 'Halifax',
    primaryColor: '#1D4ED8',
    secondaryColor: '#A7F3D0',
    teamWindowImage: require('@/assets/images/halifax-narwhals-team-window.transparent.png'),
  },
  {
    id: 'las-vegas-raccoons',
    name: 'Raccoons',
    abbreviation: 'LVR',
    city: 'Las Vegas',
    primaryColor: '#2E1065',
    secondaryColor: '#A3E635',
    teamWindowImage: require('@/assets/images/las-vegas-raccoons-team-window.transparent.png'),
  },
  {
    id: 'minnesota-pines',
    name: 'Pines',
    abbreviation: 'MIN',
    city: 'Minnesota',
    primaryColor: '#166534',
    secondaryColor: '#EAB308',
    teamWindowImage: require('@/assets/images/minnesota-pines-team-window.transparent.png'),
  },
  {
    id: 'montreal-beavers',
    name: 'Beavers',
    abbreviation: 'MTL',
    city: 'Montreal',
    primaryColor: '#7F1D1D',
    secondaryColor: '#38BDF8',
    teamWindowImage: require('@/assets/images/montreal-beavers-team-window.transparent.png'),
  },
  {
    id: 'portland-stormwings',
    name: 'Stormwings',
    abbreviation: 'POR',
    city: 'Portland',
    primaryColor: '#6B21A8',
    secondaryColor: '#F59E0B',
    teamWindowImage: require('@/assets/images/portland-stormwings-team-window.transparent.png'),
  },
  {
    id: 'seattle-orcas',
    name: 'Orcas',
    abbreviation: 'SEA',
    city: 'Seattle',
    primaryColor: '#0F766E',
    secondaryColor: '#99F6E4',
    teamWindowImage: require('@/assets/images/seattle-orcas-team-window.transparent.png'),
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
