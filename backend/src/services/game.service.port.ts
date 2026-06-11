import {
	type Ad,
	type BuyResult,
	type Game,
	type ShopItem,
	type SolveResult,
} from '@/mugloar/mugloar.types';

export type IGameService = {
	start(): Promise<Game>;
	listAds(gameId: string): Promise<Ad[]>;
	solve(gameId: string, adId: string): Promise<SolveResult>;
	listShop(gameId: string): Promise<ShopItem[]>;
	buy(gameId: string, itemId: string): Promise<BuyResult>;
};
