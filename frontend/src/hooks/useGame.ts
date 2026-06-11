import { useState } from 'react';
import { buyItem, fetchAds, fetchShop, solveAd, startGame } from '../utils/api';
import type { Ad, Game, ShopItem } from '../types';

export function useGame() {
  const [game, setGame] = useState<Game | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [shop, setShop] = useState<ShopItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const gameOver = game !== null && game.lives <= 0;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      setMessage(`Something went wrong: ${(error as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function refresh(gameId: string) {
    const [nextAds, nextShop] = await Promise.all([fetchAds(gameId), fetchShop(gameId)]);
    setAds(nextAds);
    setShop(nextShop);
  }

  const start = () =>
    run(async () => {
      const next = await startGame();
      setGame(next);
      setMessage(null);
      await refresh(next.gameId);
    });

  const solve = (adId: string) =>
    run(async () => {
      if (!game) return;
      const result = await solveAd(game.gameId, adId);
      setGame({ ...game, lives: result.lives, gold: result.gold, score: result.score });
      setMessage(result.message);
      if (result.lives > 0) await refresh(game.gameId);
    });

  const buy = (itemId: string) =>
    run(async () => {
      if (!game) return;
      const result = await buyItem(game.gameId, itemId);
      setGame({ ...game, lives: result.lives, gold: result.gold });
      setMessage(result.shoppingSuccess ? 'Purchase complete.' : 'Not enough gold.');
      await refresh(game.gameId);
    });

  return { game, ads, shop, message, busy, gameOver, start, solve, buy };
}