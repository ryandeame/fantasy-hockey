import type { GoalieAlphaMask } from '@/components/game/goalie-alpha-mask';

import { ANCHORAGE_ICEHAWKS_GOALIE_ALPHA_MASK } from '@/assets/images/goalies/alpha-maps/anchorage-icehawks-goalie-alpha-mask';
import { BOSTON_LOBSTERS_GOALIE_ALPHA_MASK } from '@/assets/images/goalies/alpha-maps/boston-lobsters-goalie-alpha-mask';
import { CALGARY_COMETS_GOALIE_ALPHA_MASK } from '@/assets/images/goalies/alpha-maps/calgary-comets-goalie-alpha-mask';
import { DETROIT_BLADES_GOALIE_ALPHA_MASK } from '@/assets/images/goalies/alpha-maps/detroit-blades-goalie-alpha-mask';
import { HALIFAX_NARWHALS_GOALIE_ALPHA_MASK } from '@/assets/images/goalies/alpha-maps/halifax-narwhals-goalie-alpha-mask';
import { LAS_VEGAS_RACCOONS_GOALIE_ALPHA_MASK } from '@/assets/images/goalies/alpha-maps/las-vegas-raccoons-goalie-alpha-mask';
import { MINNESOTA_PINES_GOALIE_ALPHA_MASK } from '@/assets/images/goalies/alpha-maps/minnesota-pines-goalie-alpha-mask';
import { MONTREAL_BEAVERS_GOALIE_ALPHA_MASK } from '@/assets/images/goalies/alpha-maps/montreal-beavers-goalie-alpha-mask';
import { PORTLAND_STORMWINGS_GOALIE_ALPHA_MASK } from '@/assets/images/goalies/alpha-maps/portland-stormwings-goalie-alpha-mask';
import { SEATTLE_ORCAS_GOALIE_ALPHA_MASK } from '@/assets/images/goalies/alpha-maps/seattle-orcas-goalie-alpha-mask';

export type HockeyTeam = {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
  goalieAlphaMask?: GoalieAlphaMask;
  goalieImage?: number;
  primaryColor: string;
  secondaryColor: string;
  shooterImage?: number;
  teamWindowImage?: number;
};

export const HOCKEY_TEAMS: HockeyTeam[] = [
  {
    id: 'anchorage-icehawks',
    name: 'Icehawks',
    abbreviation: 'ANC',
    city: 'Anchorage',
    goalieAlphaMask: ANCHORAGE_ICEHAWKS_GOALIE_ALPHA_MASK,
    goalieImage: require('@/assets/images/goalies/in-game/anchorage-icehawks-goalie.transparent.webp'),
    primaryColor: '#0E7490',
    secondaryColor: '#ECFEFF',
    shooterImage: require('@/assets/images/shooters/webp/anchorage-icehawks-shooter.transparent.webp'),
    teamWindowImage: require('@/assets/images/team-select/webp/anchorage-icehawks-team-window.transparent.webp'),
  },
  {
    id: 'boston-lobsters',
    name: 'Lobsters',
    abbreviation: 'BOS',
    city: 'Boston',
    goalieAlphaMask: BOSTON_LOBSTERS_GOALIE_ALPHA_MASK,
    goalieImage: require('@/assets/images/goalies/in-game/boston-lobsters-goalie.transparent.webp'),
    primaryColor: '#0B1624',
    secondaryColor: '#F97316',
    shooterImage: require('@/assets/images/shooters/webp/boston-lobsters-shooter.transparent.webp'),
    teamWindowImage: require('@/assets/images/team-select/webp/boston-lobsters-team-window.transparent.webp'),
  },
  {
    id: 'calgary-comets',
    name: 'Comets',
    abbreviation: 'CGY',
    city: 'Calgary',
    goalieAlphaMask: CALGARY_COMETS_GOALIE_ALPHA_MASK,
    goalieImage: require('@/assets/images/goalies/in-game/calgary-comets-goalie.transparent.webp'),
    primaryColor: '#B91C1C',
    secondaryColor: '#FDE68A',
    shooterImage: require('@/assets/images/shooters/webp/calgary-comets-shooter.transparent.webp'),
    teamWindowImage: require('@/assets/images/team-select/webp/calgary-comets-team-window.transparent.webp'),
  },
  {
    id: 'detroit-blades',
    name: 'Blades',
    abbreviation: 'DET',
    city: 'Detroit',
    goalieAlphaMask: DETROIT_BLADES_GOALIE_ALPHA_MASK,
    goalieImage: require('@/assets/images/goalies/in-game/detroit-blades-goalie.transparent.webp'),
    primaryColor: '#991B1B',
    secondaryColor: '#F8FAFC',
    shooterImage: require('@/assets/images/shooters/webp/detroit-blades-shooter.transparent.webp'),
    teamWindowImage: require('@/assets/images/team-select/webp/detroit-blades-team-window.transparent.webp'),
  },
  {
    id: 'halifax-narwhals',
    name: 'Narwhals',
    abbreviation: 'HAL',
    city: 'Halifax',
    goalieAlphaMask: HALIFAX_NARWHALS_GOALIE_ALPHA_MASK,
    goalieImage: require('@/assets/images/goalies/in-game/halifax-narwhals-goalie.transparent.webp'),
    primaryColor: '#1D4ED8',
    secondaryColor: '#A7F3D0',
    shooterImage: require('@/assets/images/shooters/webp/halifax-narwhals-shooter.transparent.webp'),
    teamWindowImage: require('@/assets/images/team-select/webp/halifax-narwhals-team-window.transparent.webp'),
  },
  {
    id: 'las-vegas-raccoons',
    name: 'Raccoons',
    abbreviation: 'LVR',
    city: 'Las Vegas',
    goalieAlphaMask: LAS_VEGAS_RACCOONS_GOALIE_ALPHA_MASK,
    goalieImage: require('@/assets/images/goalies/in-game/las-vegas-raccoons-goalie.transparent.webp'),
    primaryColor: '#2E1065',
    secondaryColor: '#A3E635',
    shooterImage: require('@/assets/images/shooters/webp/las-vegas-raccoons-shooter.transparent.webp'),
    teamWindowImage: require('@/assets/images/team-select/webp/las-vegas-raccoons-team-window.transparent.webp'),
  },
  {
    id: 'minnesota-pines',
    name: 'Pines',
    abbreviation: 'MIN',
    city: 'Minnesota',
    goalieAlphaMask: MINNESOTA_PINES_GOALIE_ALPHA_MASK,
    goalieImage: require('@/assets/images/goalies/in-game/minnesota-pines-goalie.transparent.webp'),
    primaryColor: '#166534',
    secondaryColor: '#EAB308',
    shooterImage: require('@/assets/images/shooters/webp/minnesota-pines-shooter.transparent.webp'),
    teamWindowImage: require('@/assets/images/team-select/webp/minnesota-pines-team-window.transparent.webp'),
  },
  {
    id: 'montreal-beavers',
    name: 'Beavers',
    abbreviation: 'MTL',
    city: 'Montreal',
    goalieAlphaMask: MONTREAL_BEAVERS_GOALIE_ALPHA_MASK,
    goalieImage: require('@/assets/images/goalies/in-game/montreal-beavers-goalie.transparent.webp'),
    primaryColor: '#7F1D1D',
    secondaryColor: '#38BDF8',
    shooterImage: require('@/assets/images/shooters/webp/montreal-beavers-shooter.transparent.webp'),
    teamWindowImage: require('@/assets/images/team-select/webp/montreal-beavers-team-window.transparent.webp'),
  },
  {
    id: 'portland-stormwings',
    name: 'Stormwings',
    abbreviation: 'POR',
    city: 'Portland',
    goalieAlphaMask: PORTLAND_STORMWINGS_GOALIE_ALPHA_MASK,
    goalieImage: require('@/assets/images/goalies/in-game/portland-stormwings-goalie.transparent.webp'),
    primaryColor: '#6B21A8',
    secondaryColor: '#F59E0B',
    shooterImage: require('@/assets/images/shooters/webp/portland-stormwings-shooter.transparent.webp'),
    teamWindowImage: require('@/assets/images/team-select/webp/portland-stormwings-team-window.transparent.webp'),
  },
  {
    id: 'seattle-orcas',
    name: 'Orcas',
    abbreviation: 'SEA',
    city: 'Seattle',
    goalieAlphaMask: SEATTLE_ORCAS_GOALIE_ALPHA_MASK,
    goalieImage: require('@/assets/images/goalies/in-game/seattle-orcas-goalie.transparent.webp'),
    primaryColor: '#0F766E',
    secondaryColor: '#99F6E4',
    shooterImage: require('@/assets/images/shooters/webp/seattle-orcas-shooter.transparent.webp'),
    teamWindowImage: require('@/assets/images/team-select/webp/seattle-orcas-team-window.transparent.webp'),
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
