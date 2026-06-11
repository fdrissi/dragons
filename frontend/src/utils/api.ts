import type { Ad, BuyResult, Game, ShopItem, SolveResult } from '../types';

async function request<T>(path: string, method: 'GET' | 'POST' = 'GET'): Promise<T> {
  const response = await fetch(`/api${path}`, { method });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const startGame = () => request<Game>('/games', 'POST');

export const fetchAds = (gameId: string) => request<Ad[]>(`/games/${gameId}/messages`);

export const fetchShop = (gameId: string) => request<ShopItem[]>(`/games/${gameId}/shop`);

export const solveAd = (gameId: string, adId: string) =>
  request<SolveResult>(`/games/${gameId}/solve/${adId}`, 'POST');

export const buyItem = (gameId: string, itemId: string) =>
  request<BuyResult>(`/games/${gameId}/shop/buy/${itemId}`, 'POST');
