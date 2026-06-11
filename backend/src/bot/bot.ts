import {type Ad, type Game, type ShopItem} from '@/mugloar/mugloar.types';
import {type IGameService} from '@/services/game.service.port';

// How often each difficulty label tends to succeed.
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

const HEALING_POTION_ID = 'hpot';
const HEALING_POTION_COST = 50;
const HEAL_BELOW_LIVES = 4;
const DANGER_LIVES = 2;
const GOLD_RESERVE = 100; // Kept aside for potions.

export function successRate(ad: Ad): number {
	return SUCCESS_RATES[ad.probability] ?? 0.5;
}

// Average reward, minus the potion needed when the ad fails.
export function expectedValue(ad: Ad): number {
	const p = successRate(ad);
	return (p * ad.reward) - ((1 - p) * HEALING_POTION_COST);
}

export function pickAd(ads: Ad[], playSafe = false): Ad | undefined {
	const sorted = [...ads].sort((a, b) =>
		playSafe
			? successRate(b) - successRate(a) || b.reward - a.reward
			: expectedValue(b) - expectedValue(a),
	);
	return sorted[0];
}

// Upgrades make the dragon fail less, so spare gold goes there.
export function pickUpgrade(shop: ShopItem[], gold: number): ShopItem | undefined {
	return shop
		.filter(item => item.id !== HEALING_POTION_ID)
		.filter(item => item.cost <= gold - GOLD_RESERVE)
		.sort((a, b) => b.cost - a.cost)[0];
}

export type BotTurn = {
	game: Game;
	note: string;
};

export async function playGame(
	games: IGameService,
	onTurn?: (turn: BotTurn) => void,
): Promise<Game> {
	let game = await games.start();
	const shop = await games.listShop(game.gameId);
	const potion = shop.find(item => item.id === HEALING_POTION_ID);

	while (game.lives > 0) {
		const toBuy
			= game.lives < HEAL_BELOW_LIVES && potion && game.gold >= potion.cost
				? potion
				: pickUpgrade(shop, game.gold);
		if (toBuy) {
			const result = await games.buy(game.gameId, toBuy.id);
			game = {
				...game,
				gold: result.gold,
				lives: result.lives,
				level: result.level,
				turn: result.turn,
			};
			onTurn?.({game, note: `bought ${toBuy.name}`});
			continue;
		}

		const ads = await games.listAds(game.gameId);
		const playSafe = game.lives <= DANGER_LIVES || game.gold < HEALING_POTION_COST;
		const ad = pickAd(ads, playSafe);
		if (!ad) {
			break;
		}

		const result = await games.solve(game.gameId, ad.adId);
		game = {
			...game,
			lives: result.lives,
			gold: result.gold,
			score: result.score,
			highScore: result.highScore,
			turn: result.turn,
		};
		onTurn?.({
			game,
			note: `${result.success ? 'solved' : 'failed'} "${ad.probability}" for ${ad.reward}`,
		});
	}

	return game;
}
