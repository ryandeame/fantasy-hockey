import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type PointerEvent,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

import {
  getAlphabetizedTeams,
  getDefaultTeamSelection,
  HockeyTeam,
  HOCKEY_TEAMS,
} from '@/data/teams';

type TeamSlot = 'top' | 'bottom';
type SwipeDirection = 'previous' | 'next';
type SwipePoint = {
  x: number;
  y: number;
};

const SWIPE_DISTANCE = 44;

type WebCoordinateEvent = {
  pageX?: number;
  pageY?: number;
  clientX?: number;
  clientY?: number;
  touches?: readonly WebCoordinateEvent[];
  changedTouches?: readonly WebCoordinateEvent[];
};

type TeamSelectScreenProps = {
  teams?: readonly HockeyTeam[];
  selectedTopTeamId?: string;
  selectedBottomTeamId?: string;
  onTopTeamChange?: (team: HockeyTeam) => void;
  onBottomTeamChange?: (team: HockeyTeam) => void;
  onSelectionChange?: (selection: {
    topTeam: HockeyTeam;
    bottomTeam: HockeyTeam;
  }) => void;
  onConfirmSelection?: (selection: {
    topTeam: HockeyTeam;
    bottomTeam: HockeyTeam;
  }) => void;
  confirmLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function TeamSelectScreen({
  teams = HOCKEY_TEAMS,
  selectedTopTeamId,
  selectedBottomTeamId,
  onTopTeamChange,
  onBottomTeamChange,
  onSelectionChange,
  onConfirmSelection,
  confirmLabel = 'Play',
  style,
}: TeamSelectScreenProps) {
  const { width } = useWindowDimensions();
  const alphabetizedTeams = useMemo(() => getAlphabetizedTeams(teams), [teams]);
  const defaults = useMemo(
    () => getDefaultTeamSelection(alphabetizedTeams),
    [alphabetizedTeams],
  );
  const [internalTopTeamId, setInternalTopTeamId] = useState(defaults.topTeamId);
  const [internalBottomTeamId, setInternalBottomTeamId] = useState(
    defaults.bottomTeamId,
  );
  const topTeamId = selectedTopTeamId ?? internalTopTeamId;
  const bottomTeamId = selectedBottomTeamId ?? internalBottomTeamId;
  const topTeam =
    alphabetizedTeams.find((team) => team.id === topTeamId) ??
    alphabetizedTeams[0];
  const bottomTeam =
    alphabetizedTeams.find((team) => team.id === bottomTeamId) ??
    alphabetizedTeams[1] ??
    alphabetizedTeams[0];
  const isWideLayout = width >= 780;
  const useMobileWebSwipe = Platform.OS === 'web' && !isWideLayout;

  const handleSelectTeam = (slot: TeamSlot, team: HockeyTeam) => {
    const nextTopTeam = slot === 'top' ? team : topTeam;
    const nextBottomTeam = slot === 'bottom' ? team : bottomTeam;

    if (!nextTopTeam || !nextBottomTeam) {
      return;
    }

    if (slot === 'top') {
      setInternalTopTeamId(team.id);
      onTopTeamChange?.(team);
    } else {
      setInternalBottomTeamId(team.id);
      onBottomTeamChange?.(team);
    }

    onSelectionChange?.({
      topTeam: nextTopTeam,
      bottomTeam: nextBottomTeam,
    });
  };

  if (!topTeam || !bottomTeam) {
    return (
      <View style={[styles.emptyState, style]}>
        <Text selectable style={styles.emptyStateText}>
          No teams available
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        isWideLayout && styles.wideScreen,
        style,
      ]}>
      <TeamSelectionPanel
        label="Home"
        selectedTeam={topTeam}
        selectedTeamId={topTeam.id}
        teams={alphabetizedTeams}
        useSwipeSelection={useMobileWebSwipe}
        onSelectTeam={(team) => handleSelectTeam('top', team)}
      />
      <TeamSelectionPanel
        label="Away"
        selectedTeam={bottomTeam}
        selectedTeamId={bottomTeam.id}
        teams={alphabetizedTeams}
        useSwipeSelection={useMobileWebSwipe}
        onSelectTeam={(team) => handleSelectTeam('bottom', team)}
      />
      {onConfirmSelection ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={confirmLabel}
          onPress={() => onConfirmSelection({ topTeam, bottomTeam })}
          style={styles.confirmButton}>
          <Text selectable={false} style={styles.confirmButtonText}>
            {confirmLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type TeamSelectionPanelProps = {
  label: string;
  selectedTeam: HockeyTeam;
  selectedTeamId: string;
  teams: readonly HockeyTeam[];
  useSwipeSelection: boolean;
  onSelectTeam: (team: HockeyTeam) => void;
};

function TeamSelectionPanel({
  label,
  selectedTeam,
  selectedTeamId,
  teams,
  useSwipeSelection,
  onSelectTeam,
}: TeamSelectionPanelProps) {
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(
    null,
  );
  const [swipeProgress] = useState(() => new Animated.Value(0));
  const swipeStartRef = useRef<SwipePoint | null>(null);
  const swipeDeltaRef = useRef({ dx: 0, dy: 0 });
  const swipeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSwipeAnimatingRef = useRef(false);
  const selectedTeamIndex = teams.findIndex((team) => team.id === selectedTeamId);

  useEffect(() => {
    return () => {
      if (swipeTimeoutRef.current) {
        clearTimeout(swipeTimeoutRef.current);
      }
    };
  }, []);

  const selectAdjacentTeam = (direction: SwipeDirection) => {
    if (teams.length < 2) {
      return;
    }

    const currentIndex = selectedTeamIndex >= 0 ? selectedTeamIndex : 0;
    const offset = direction === 'next' ? 1 : -1;
    const nextIndex = (currentIndex + offset + teams.length) % teams.length;
    onSelectTeam(teams[nextIndex]);
  };

  const playSwipePush = (direction: SwipeDirection) => {
    if (isSwipeAnimatingRef.current) {
      return;
    }

    isSwipeAnimatingRef.current = true;
    setSwipeDirection(direction);
    swipeProgress.setValue(0);

    swipeTimeoutRef.current = setTimeout(() => {
      selectAdjacentTeam(direction);
    }, 140);

    Animated.timing(swipeProgress, {
      toValue: 1,
      duration: 340,
      useNativeDriver: true,
    }).start(() => {
      isSwipeAnimatingRef.current = false;
      setSwipeDirection(null);
    });
  };

  const startSwipe = (point: SwipePoint) => {
    swipeStartRef.current = point;
    swipeDeltaRef.current = { dx: 0, dy: 0 };
  };

  const moveSwipe = (point: SwipePoint) => {
    const swipeStart = swipeStartRef.current;

    if (!swipeStart) {
      return;
    }

    swipeDeltaRef.current = {
      dx: point.x - swipeStart.x,
      dy: point.y - swipeStart.y,
    };
  };

  const getSwipePoint = (
    event: GestureResponderEvent | PointerEvent,
  ): SwipePoint => {
    const nativeEvent = event.nativeEvent as WebCoordinateEvent;
    const touchPoint =
      nativeEvent.touches?.[0] ?? nativeEvent.changedTouches?.[0] ?? nativeEvent;

    return {
      x: touchPoint.pageX ?? touchPoint.clientX ?? 0,
      y: touchPoint.pageY ?? touchPoint.clientY ?? 0,
    };
  };

  const finishSwipe = () => {
    if (!useSwipeSelection) {
      return;
    }

    const { dx, dy } = swipeDeltaRef.current;
    const isHorizontalSwipe =
      Math.abs(dx) >= SWIPE_DISTANCE &&
      Math.abs(dx) > Math.abs(dy) * 1.25;

    swipeStartRef.current = null;
    swipeDeltaRef.current = { dx: 0, dy: 0 };

    if (isHorizontalSwipe) {
      playSwipePush(dx < 0 ? 'next' : 'previous');
    }
  };

  const handleTouchStart = (event: GestureResponderEvent) => {
    if (!useSwipeSelection) {
      return;
    }

    startSwipe(getSwipePoint(event));
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    if (!useSwipeSelection) {
      return;
    }

    moveSwipe(getSwipePoint(event));
  };

  const handleTouchEnd = (event: GestureResponderEvent) => {
    if (!useSwipeSelection) {
      return;
    }

    moveSwipe(getSwipePoint(event));
    finishSwipe();
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (!useSwipeSelection) {
      return;
    }

    startSwipe(getSwipePoint(event));
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!useSwipeSelection) {
      return;
    }

    moveSwipe(getSwipePoint(event));
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (!useSwipeSelection) {
      return;
    }

    moveSwipe(getSwipePoint(event));
    finishSwipe();
  };

  const stickTranslateX = swipeProgress.interpolate({
    inputRange: [0, 0.62, 1],
    outputRange:
      swipeDirection === 'previous'
        ? [-190, -14, 300]
        : [300, 14, -190],
  });
  const stickScaleX = swipeDirection === 'next' ? -1 : 1;

  return (
    <View
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={finishSwipe}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={finishSwipe}
      style={[
        styles.panel,
        useSwipeSelection && styles.swipePanel,
        { backgroundColor: selectedTeam.primaryColor },
      ]}>
      {selectedTeam.teamWindowImage ? (
        <View pointerEvents="none" style={styles.teamWindowImageFrame}>
          <Image
            source={selectedTeam.teamWindowImage}
            contentFit="contain"
            style={styles.teamWindowImage}
          />
        </View>
      ) : null}

      <View style={styles.panelHeader}>
        <Text selectable style={styles.slotLabel}>
          {label}
        </Text>
        <Text selectable style={styles.abbreviation}>
          {selectedTeam.abbreviation}
        </Text>
      </View>

      <View style={styles.featuredTeam}>
        <Text selectable style={styles.city}>
          {selectedTeam.city}
        </Text>
        <Text
          selectable
          adjustsFontSizeToFit
          numberOfLines={1}
          style={styles.teamName}>
          {selectedTeam.name}
        </Text>
        <View
          style={[
            styles.colorSwatch,
            { backgroundColor: selectedTeam.secondaryColor },
          ]}
        />
      </View>

      {useSwipeSelection ? <View style={styles.swipeSpacer} /> : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.teamPicker}
          style={styles.teamPickerScroll}>
          {teams.map((team) => {
            const isSelected = team.id === selectedTeamId;

            return (
              <Pressable
                key={team.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Select ${team.city} ${team.name}`}
                onPress={() => onSelectTeam(team)}
                style={[
                  styles.teamOption,
                  isSelected && styles.selectedTeamOption,
                ]}>
                <View
                  style={[
                    styles.teamOptionColor,
                    { backgroundColor: team.primaryColor },
                  ]}
                />
                <Text selectable={false} style={styles.teamOptionText}>
                  {team.abbreviation}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {swipeDirection ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.swipeStickFrame,
            {
              transform: [
                { translateX: stickTranslateX },
                { scaleX: stickScaleX },
              ],
            },
          ]}>
          <Image
            source={require('@/assets/images/hockey-stick-swipe.transparent.png')}
            contentFit="contain"
            style={styles.swipeStick}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 560,
    overflow: 'hidden',
    backgroundColor: '#E0F2FE',
  },
  wideScreen: {
    flexDirection: 'row',
  },
  panel: {
    flex: 1,
    minHeight: 280,
    paddingTop: 24,
    paddingRight: 18,
    paddingBottom: 18,
    paddingLeft: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  swipePanel: {
    touchAction: 'pan-y' as const,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    zIndex: 1,
  },
  slotLabel: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    opacity: 0.82,
    textTransform: 'uppercase',
  },
  abbreviation: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
  featuredTeam: {
    gap: 4,
    zIndex: 1,
  },
  city: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0,
    opacity: 0.9,
  },
  teamName: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 58,
  },
  colorSwatch: {
    marginTop: 10,
    width: 72,
    height: 8,
    borderRadius: 4,
  },
  teamPickerScroll: {
    flexGrow: 0,
    zIndex: 1,
  },
  teamPicker: {
    gap: 10,
    paddingTop: 8,
    paddingBottom: 2,
  },
  swipeSpacer: {
    height: 62,
    zIndex: 1,
  },
  swipeStickFrame: {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 220,
    height: 55,
    marginTop: -28,
    zIndex: 2,
  },
  swipeStick: {
    width: 220,
    height: 55,
  },
  teamOption: {
    width: 72,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  selectedTeamOption: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  teamOptionColor: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.76,
  },
  teamOptionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
  emptyState: {
    flex: 1,
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
  },
  emptyStateText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0,
  },
  confirmButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 28,
    height: 54,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.16)',
    zIndex: 3,
  },
  confirmButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  teamWindowImageFrame: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  teamWindowImage: {
    position: 'absolute',
    right: -120,
    top: 0,
    width: '220%',
    height: '190%',
    opacity: 0.96,
  },
});
