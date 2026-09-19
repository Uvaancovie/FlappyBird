import { AchievementBadge } from '../types';

export const BADGE_DEFINITIONS = [
  {
    id: 'first_point',
    title: 'First Flight',
    description: 'Score your first point',
    icon: '🐣',
    requiredScore: 1,
    category: 'score' as const,
  },
  {
    id: 'pipe_dodger',
    title: 'Pipe Dodger',
    description: 'Pass 5 pipes in a single run',
    icon: '🪶',
    requiredScore: 5,
    category: 'score' as const,
  },
  {
    id: 'ten_points',
    title: '10 Points',
    description: 'Reach double digits (10+ points)',
    icon: '🥉',
    requiredScore: 10,
    category: 'score' as const,
  },
  {
    id: 'flapper_pro',
    title: 'Flapper Pro',
    description: 'Achieve a score of 25 or more',
    icon: '🥈',
    requiredScore: 25,
    category: 'score' as const,
  },
  {
    id: 'sky_master',
    title: 'Sky Master',
    description: 'Master the skies with 50+ points',
    icon: '🥇',
    requiredScore: 50,
    category: 'score' as const,
  },
  {
    id: 'century_flyer',
    title: 'Century Legend',
    description: 'Ascend to legend with 100+ points',
    icon: '👑',
    requiredScore: 100,
    category: 'score' as const,
  },
  {
    id: 'rookie_pilot',
    title: 'Rookie Aviator',
    description: 'Play at least 5 games',
    icon: '🛫',
    requiredGames: 5,
    category: 'games' as const,
  },
  {
    id: 'dedicated_pilot',
    title: 'Dedicated Pilot',
    description: 'Complete 25 flight attempts',
    icon: '✈️',
    requiredGames: 25,
    category: 'games' as const,
  },
  {
    id: 'ace_veteran',
    title: 'Ace Veteran',
    description: 'Complete 100 flight attempts',
    icon: '🌟',
    requiredGames: 100,
    category: 'games' as const,
  },
];

export function getAchievements(bestScore: number, gamesPlayed: number): AchievementBadge[] {
  return BADGE_DEFINITIONS.map((def) => {
    let unlocked = false;
    let progress = 0;
    let maxProgress = 1;

    if (def.category === 'score' && def.requiredScore !== undefined) {
      maxProgress = def.requiredScore;
      progress = Math.min(bestScore, maxProgress);
      unlocked = bestScore >= def.requiredScore;
    } else if (def.category === 'games' && def.requiredGames !== undefined) {
      maxProgress = def.requiredGames;
      progress = Math.min(gamesPlayed, maxProgress);
      unlocked = gamesPlayed >= def.requiredGames;
    }

    return {
      ...def,
      unlocked,
      progress,
      maxProgress,
    };
  });
}

export function checkNewlyUnlocked(
  prevScore: number,
  prevGames: number,
  newScore: number,
  newGames: number
): AchievementBadge[] {
  const prevList = getAchievements(prevScore, prevGames);
  const newList = getAchievements(newScore, newGames);

  const newlyUnlocked: AchievementBadge[] = [];
  newList.forEach((item, idx) => {
    if (item.unlocked && !prevList[idx].unlocked) {
      newlyUnlocked.push(item);
    }
  });

  return newlyUnlocked;
}
