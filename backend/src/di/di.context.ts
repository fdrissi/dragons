import {diContainer} from '@fastify/awilix';
import {asClass, asValue} from 'awilix';
import {type FastifyBaseLogger, type FastifyInstance} from 'fastify';
import {MugloarHttpClient} from '@/mugloar/mugloar.http';
import {type IMugloarClient} from '@/mugloar/mugloar.port';
import {GameService} from '@/services/impl/game.service';
import {type IGameService} from '@/services/game.service.port';

declare module '@fastify/awilix' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Cradle {
		logger: FastifyBaseLogger;
		mugloarClient: IMugloarClient;
		gameService: IGameService;
	}
}

export async function configureDiContext(
	server: FastifyInstance,
): Promise<void> {
	diContainer.register({
		logger: asValue(server.log),
		mugloarClient: asClass<IMugloarClient>(MugloarHttpClient),
		gameService: asClass<IGameService>(GameService),
	});
}
