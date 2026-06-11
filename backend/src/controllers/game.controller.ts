import {type FastifyPluginAsync} from 'fastify';
import {type ZodTypeProvider} from 'fastify-type-provider-zod';
import {BuyParameters, GameIdParameters, SolveParameters} from './game.schema';

export const gameController: FastifyPluginAsync = async server => {
	const app = server.withTypeProvider<ZodTypeProvider>();
	const games = server.diContainer.resolve('gameService');

	app.post('/games', async () => games.start());

	app.get(
		'/games/:gameId/messages',
		{schema: {params: GameIdParameters}},
		async request => games.listAds(request.params.gameId),
	);

	app.post(
		'/games/:gameId/solve/:adId',
		{schema: {params: SolveParameters}},
		async request => games.solve(request.params.gameId, request.params.adId),
	);

	app.get(
		'/games/:gameId/shop',
		{schema: {params: GameIdParameters}},
		async request => games.listShop(request.params.gameId),
	);

	app.post(
		'/games/:gameId/shop/buy/:itemId',
		{schema: {params: BuyParameters}},
		async request => games.buy(request.params.gameId, request.params.itemId),
	);
};
