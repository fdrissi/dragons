import {
	type Ad,
	type BuyResult,
	type Game,
	type ShopItem,
	type SolveResult,
} from './mugloar.types';

export type IMugloarClient = {
	startGame(): Promise<Game>;
	listMessages(gameId: string): Promise<Ad[]>;
	solve(gameId: string, adId: string): Promise<SolveResult>;
	listShop(gameId: string): Promise<ShopItem[]>;
	buy(gameId: string, itemId: string): Promise<BuyResult>;
};
