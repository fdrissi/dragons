import fastify from 'fastify';
import {type Cradle, diContainer} from '@fastify/awilix';
import {type NameAndRegistrationPair} from 'awilix';
import {
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod';
import {awilixPlugin} from './di/awilix.plugin';
import {configureDiContext} from './di/di.context';
import shutdownPlugin from './shutdown/shutdown.plugin';
import {gameController} from './controllers/game.controller';

export async function buildFastify(
	overrides?: NameAndRegistrationPair<Cradle>,
) {
	const server = fastify();

	await server.register(awilixPlugin());
	await server.register(shutdownPlugin);
	await server.register(configureDiContext);
	if (overrides) {
		diContainer.register(overrides);
	}

	server.setValidatorCompiler(validatorCompiler);
	server.setSerializerCompiler(serializerCompiler);

	await server.register(gameController, {prefix: '/api'});

	return server;
}
