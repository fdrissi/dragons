import {
	beforeEach, describe, expect, it, vi,
} from 'vitest';
import {mockDeep} from 'vitest-mock-extended';
import {type FastifyBaseLogger} from 'fastify';
import {MugloarHttpClient} from './mugloar.http';

const BASE_URL = 'https://dragonsofmugloar.com/api/v2';

const okResponse = (body: unknown): Response =>
	({
		ok: true,
		status: 200,
		async json() {
			return body;
		},
		async text() {
			return JSON.stringify(body);
		},
	}) as unknown as Response;

const errorResponse = (status: number, body: string): Response =>
	({
		ok: false,
		status,
		async json() {
			return JSON.parse(body) as unknown;
		},
		async text() {
			return body;
		},
	}) as unknown as Response;

describe('MugloarHttpClient', () => {
	const logger = mockDeep<FastifyBaseLogger>();
	const client = new MugloarHttpClient({logger});
	const fetchMock = vi.fn();

	beforeEach(() => {
		fetchMock.mockReset();
		vi.stubGlobal('fetch', fetchMock);
	});

	it('startGame POSTs /game/start and parses the response', async () => {
		fetchMock.mockResolvedValue(
			okResponse({
				gameId: 'abc',
				lives: 3,
				gold: 0,
				level: 0,
				score: 0,
				highScore: 0,
				turn: 0,
			}),
		);

		const game = await client.startGame();

		expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/game/start`, {
			method: 'POST',
		});
		expect(game.gameId).toBe('abc');
	});

	it('listMessages returns parsed ads', async () => {
		fetchMock.mockResolvedValue(
			okResponse([
				{
					adId: 'a1',
					message: 'help',
					reward: 10,
					expiresIn: 3,
					probability: 'Sure thing',
				},
			]),
		);

		const ads = await client.listMessages('g1');

		expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/g1/messages`, {
			method: 'GET',
		});
		expect(ads).toHaveLength(1);
		expect(ads[0]!.adId).toBe('a1');
	});

	it('listMessages filters out encrypted ads', async () => {
		fetchMock.mockResolvedValue(
			okResponse([
				{
					adId: 'plain',
					message: 'help',
					reward: 10,
					expiresIn: 3,
					encrypted: null,
					probability: 'Sure thing',
				},
				{
					adId: 'b64',
					message: 'aGVscA==',
					reward: 10,
					expiresIn: 3,
					encrypted: 1,
					probability: 'U3VyZSB0aGluZw==',
				},
				{
					adId: 'rot',
					message: 'urycc',
					reward: 10,
					expiresIn: 3,
					encrypted: 2,
					probability: 'Fher guvat',
				},
			]),
		);

		const ads = await client.listMessages('g1');

		expect(ads).toHaveLength(1);
		expect(ads[0]!.adId).toBe('plain');
	});

	it('listMessages coerces reward strings to numbers', async () => {
		fetchMock.mockResolvedValue(
			okResponse([
				{
					adId: 'a1',
					message: 'help',
					reward: '42',
					expiresIn: 3,
					probability: 'Sure thing',
				},
			]),
		);

		const ads = await client.listMessages('g1');

		expect(ads[0]!.reward).toBe(42);
	});

	it('solve POSTs /:gameId/solve/:adId', async () => {
		fetchMock.mockResolvedValue(
			okResponse({
				success: true,
				lives: 3,
				gold: 10,
				score: 10,
				highScore: 10,
				turn: 1,
				message: 'won',
			}),
		);

		const result = await client.solve('g', 'a1');

		expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/g/solve/a1`, {
			method: 'POST',
		});
		expect(result.success).toBe(true);
	});

	it('listShop returns items', async () => {
		fetchMock.mockResolvedValue(
			okResponse([{id: 'hpot', name: 'Healing potion', cost: 50}]),
		);

		const items = await client.listShop('g');

		expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/g/shop`, {method: 'GET'});
		expect(items[0]!.id).toBe('hpot');
	});

	it('buy POSTs /:gameId/shop/buy/:itemId', async () => {
		fetchMock.mockResolvedValue(
			okResponse({
				shoppingSuccess: true,
				gold: 0,
				lives: 3,
				level: 1,
				turn: 2,
			}),
		);

		const result = await client.buy('g', 'hpot');

		expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/g/shop/buy/hpot`, {
			method: 'POST',
		});
		expect(result.shoppingSuccess).toBe(true);
	});

	it('throws and logs when the upstream returns non-2xx', async () => {
		fetchMock.mockResolvedValue(errorResponse(500, 'oops'));

		await expect(client.startGame()).rejects.toThrow(/500/);
		expect(logger.warn).toHaveBeenCalled();
	});

	it('rejects responses that do not match the schema', async () => {
		fetchMock.mockResolvedValue(okResponse({lol: true}));

		await expect(client.startGame()).rejects.toBeInstanceOf(Error);
	});
});
