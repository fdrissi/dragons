import {
	afterEach, beforeEach, describe, expect, it,
} from 'vitest';
import {mockDeep, type DeepMockProxy} from 'vitest-mock-extended';
import {asValue} from 'awilix';
import {type FastifyInstance} from 'fastify';
import supertest from 'supertest';
import {buildFastify} from '@/fastify';
import {type IGameService} from '@/services/game.service.port';

describe('Game Controller', () => {
	let fastify: FastifyInstance;
	let gameService: DeepMockProxy<IGameService>;

	beforeEach(async () => {
		gameService = mockDeep<IGameService>();
		fastify = await buildFastify({
			gameService: asValue<IGameService>(gameService),
		});
		await fastify.ready();
	});

	afterEach(async () => {
		await fastify.close();
	});

	it('POST /api/games starts a game', async () => {
		gameService.start.mockResolvedValue({
			gameId: 'g',
			lives: 3,
			gold: 0,
			level: 0,
			score: 0,
			highScore: 0,
			turn: 0,
		});

		const response = await supertest(fastify.server).post('/api/games').expect(200);

		expect(response.body.gameId).toBe('g');
		expect(gameService.start).toHaveBeenCalledOnce();
	});

	it('GET /api/games/:gameId/messages lists ads', async () => {
		gameService.listAds.mockResolvedValue([
			{
				adId: 'a1',
				message: 'help',
				reward: 10,
				expiresIn: 3,
				probability: 'Sure thing',
			},
		]);

		const response = await supertest(fastify.server)
			.get('/api/games/g/messages')
			.expect(200);

		expect(response.body).toHaveLength(1);
		expect(response.body[0].adId).toBe('a1');
		expect(gameService.listAds).toHaveBeenCalledWith('g');
	});

	it('POST /api/games/:gameId/solve/:adId returns the result', async () => {
		gameService.solve.mockResolvedValue({
			success: true,
			lives: 3,
			gold: 10,
			score: 10,
			highScore: 10,
			turn: 1,
			message: 'won',
		});

		const response = await supertest(fastify.server)
			.post('/api/games/g/solve/a1')
			.expect(200);

		expect(response.body.success).toBe(true);
		expect(gameService.solve).toHaveBeenCalledWith('g', 'a1');
	});

	it('GET /api/games/:gameId/shop lists items', async () => {
		gameService.listShop.mockResolvedValue([
			{id: 'hpot', name: 'Healing potion', cost: 50},
		]);

		const response = await supertest(fastify.server)
			.get('/api/games/g/shop')
			.expect(200);

		expect(response.body[0].id).toBe('hpot');
	});

	it('POST /api/games/:gameId/shop/buy/:itemId returns the result', async () => {
		gameService.buy.mockResolvedValue({
			shoppingSuccess: true,
			gold: 0,
			lives: 3,
			level: 1,
			turn: 2,
		});

		const response = await supertest(fastify.server)
			.post('/api/games/g/shop/buy/hpot')
			.expect(200);

		expect(response.body.shoppingSuccess).toBe(true);
		expect(gameService.buy).toHaveBeenCalledWith('g', 'hpot');
	});
});
