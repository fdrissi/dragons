import type { Ad } from '../types';

// Same success estimates the backend bot uses.
const SUCCESS_RATES: Record<string, number> = {
  'Piece of cake': 0.95,
  'Sure thing': 0.95,
  'Walk in the park': 0.85,
  'Quite likely': 0.7,
  'Hmmm....': 0.45,
  Gamble: 0.3,
  Risky: 0.18,
  'Rather detrimental': 0.1,
  'Playing with fire': 0.05,
  'Suicide mission': 0.02,
  Impossible: 0.01,
};

export function successChance(ad: Ad): number {
  return SUCCESS_RATES[ad.probability] ?? 0.5;
}

export function expectedValue(ad: Ad): number {
  return successChance(ad) * ad.reward;
}

export function sortByValue(ads: Ad[]): Ad[] {
  return [...ads].sort((a, b) => expectedValue(b) - expectedValue(a));
}
