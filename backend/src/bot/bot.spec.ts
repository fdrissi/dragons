import {describe, expect, it} from 'vitest';
import {mock} from 'vitest-mock-extended';
import {
	expectedValue, pickAd, pickUpgrade, playGame,
} from './bot';
import {type Ad, type Game, type ShopItem} from '@/mugloar/mugloar.types';
import {type IGameService} from '@/services/game.service.port';

const ad = (overrides: Partial<Ad>): Ad => ({
	adId: 'ad-1',
	message: 'Help!',
	reward: 100,
	expiresIn: 5,
	probability: 'Sure thing',
	...overrides,
});

const game = (overrides: Partial<Game>): Game => ({
	gameId: 'g-1',
	lives: 3,
	gold: 0,
	level: 0,
	score: 0,
	highScore: 0,
	turn: 0,
	...overrides,
});

const potion: ShopItem = {id: 'hpot', name: 'Healing potion', cost: 50};
const cheapUpgrade: ShopItem = {id: 'cs', name: 'Claw Sharpening', cost: 100};
const bigUpgrade: ShopItem = {id: 'iron', name: 'Iron Plating', cost: 300};
const shop = [potion, cheapUpgrade, bigUpgrade];

describe('expectedValue', () => {
	it('rewards likely ads more than risky ones with the same reward', () => {
		const safe = ad({probability: 'Sure thing'});
		const risky = ad({probability: 'Suicide mission'});
		expect(expectedValue(safe)).toBeGreaterThan(expectedValue(risky));
	});

	it('penalises failures by the cost of a healing potion', () => {
		// P=0.95: 0.95 * 100 - 0.05 * 50 = 92.5
		expect(expectedValue(ad({probability: 'Sure thing'}))).toBe(92.5);
	});
});

describe('pickAd', () => {
	it('picks the ad with the highest expected value', () => {
		const ads = [
			ad({adId: 'risky', probability: 'Suicide mission', reward: 300}),
			ad({adId: 'safe', probability: 'Sure thing', reward: 100}),
		];
		expect(pickAd(ads)?.adId).toBe('safe');
	});

	it('picks the safest ad when playing safe, breaking ties by reward', () => {
		const ads = [
			ad({adId: 'lucrative', probability: 'Quite likely', reward: 500}),
			ad({adId: 'safe-small', probability: 'Sure thing', reward: 10}),
			ad({adId: 'safe-big', probability: 'Piece of cake', reward: 40}),
		];
		expect(pickAd(ads)?.adId).toBe('lucrative');
		expect(pickAd(ads, true)?.adId).toBe('safe-big');
	});

	it('returns undefined when there are no ads', () => {
		expect(pickAd([])).toBeUndefined();
	});
});

describe('pickUpgrade', () => {
	it('picks the priciest upgrade affordable after the potion reserve', () => {
		expect(pickUpgrade(shop, 450)?.id).toBe('iron');
		expect(pickUpgrade(shop, 250)?.id).toBe('cs');
	});

	it('never picks the healing potion and keeps the reserve intact', () => {
		expect(pickUpgrade(shop, 199)).toBeUndefined();
		expect(pickUpgrade([potion], 1000)).toBeUndefined();
	});
});

describe('playGame', () => {
	const failedSolve = {
		success: false,
		lives: 0,
		gold: 0,
		score: 0,
		highScore: 0,
		turn: 1,
		message: 'You failed.',
	};

	it('solves ads until lives run out', async () => {
		const games = mock<IGameService>();
		games.start.mockResolvedValue(game({lives: 1, gold: 0}));
		games.listShop.mockResolvedValue(shop);
		games.listAds.mockResolvedValue([ad({})]);
		games.solve.mockResolvedValue(failedSolve);

		const final = await playGame(games);

		expect(games.solve).toHaveBeenCalledTimes(1);
		expect(final.lives).toBe(0);
	});

	it('buys a healing potion when lives are low and gold allows', async () => {
		const games = mock<IGameService>();
		games.start.mockResolvedValue(game({lives: 1, gold: 60}));
		games.listShop.mockResolvedValue(shop);
		games.buy.mockResolvedValue({
			shoppingSuccess: true,
			gold: 10,
			lives: 2,
			level: 0,
			turn: 1,
		});
		games.listAds.mockResolvedValue([ad({})]);
		games.solve.mockResolvedValue({...failedSolve, gold: 10, turn: 2});

		await playGame(games);

		expect(games.buy).toHaveBeenCalledWith('g-1', 'hpot');
	});

	it('spends spare gold on an upgrade when lives are healthy', async () => {
		const games = mock<IGameService>();
		games.start.mockResolvedValue(game({lives: 5, gold: 450}));
		games.listShop.mockResolvedValue(shop);
		games.buy.mockResolvedValue({
			shoppingSuccess: true,
			gold: 150,
			lives: 5,
			level: 1,
			turn: 1,
		});
		games.listAds.mockResolvedValue([ad({})]);
		games.solve.mockResolvedValue({
			...failedSolve, lives: 0, gold: 150, turn: 2,
		});

		await playGame(games);

		expect(games.buy).toHaveBeenCalledWith('g-1', 'iron');
	});

	it('stops when no ads are available', async () => {
		const games = mock<IGameService>();
		games.start.mockResolvedValue(game({lives: 3}));
		games.listShop.mockResolvedValue(shop);
		games.listAds.mockResolvedValue([]);

		const final = await playGame(games);

		expect(games.solve).not.toHaveBeenCalled();
		expect(final.lives).toBe(3);
	});
});
