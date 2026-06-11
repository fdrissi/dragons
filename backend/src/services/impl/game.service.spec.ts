import {describe, expect, it} from 'vitest';
import {mockDeep} from 'vitest-mock-extended';
import {GameService} from './game.service';
import {type IMugloarClient} from '@/mugloar/mugloar.port';

const aGame = {
	gameId: 'g',
	lives: 3,
	gold: 0,
	level: 0,
	score: 0,
	highScore: 0,
	turn: 0,
};

describe('GameService', () => {
	it('start delegates to mugloar.startGame', async () => {
		const mugloarClient = mockDeep<IMugloarClient>();
		mugloarClient.startGame.mockResolvedValue(aGame);
		const service = new GameService({mugloarClient});

		await expect(service.start()).resolves.toEqual(aGame);
		expect(mugloarClient.startGame).toHaveBeenCalledOnce();
	});

	it('listAds forwards gameId', async () => {
		const mugloarClient = mockDeep<IMugloarClient>();
		mugloarClient.listMessages.mockResolvedValue([]);
		const service = new GameService({mugloarClient});

		await service.listAds('g1');

		expect(mugloarClient.listMessages).toHaveBeenCalledWith('g1');
	});

	it('solve forwards gameId and adId', async () => {
		const mugloarClient = mockDeep<IMugloarClient>();
		mugloarClient.solve.mockResolvedValue({
			success: true,
			lives: 3,
			gold: 10,
			score: 10,
			highScore: 10,
			turn: 1,
			message: 'ok',
		});
		const service = new GameService({mugloarClient});

		await service.solve('g', 'a1');

		expect(mugloarClient.solve).toHaveBeenCalledWith('g', 'a1');
	});

	it('listShop forwards gameId', async () => {
		const mugloarClient = mockDeep<IMugloarClient>();
		mugloarClient.listShop.mockResolvedValue([]);
		const service = new GameService({mugloarClient});

		await service.listShop('g');

		expect(mugloarClient.listShop).toHaveBeenCalledWith('g');
	});

	it('buy forwards gameId and itemId', async () => {
		const mugloarClient = mockDeep<IMugloarClient>();
		mugloarClient.buy.mockResolvedValue({
			shoppingSuccess: true,
			gold: 0,
			lives: 3,
			level: 1,
			turn: 2,
		});
		const service = new GameService({mugloarClient});

		await service.buy('g', 'hpot');

		expect(mugloarClient.buy).toHaveBeenCalledWith('g', 'hpot');
	});
});
