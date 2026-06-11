import {pino} from 'pino';
import {type FastifyBaseLogger} from 'fastify';
import {playGame} from './bot';
import {MugloarHttpClient} from '@/mugloar/mugloar.http';
import {GameService} from '@/services/impl/game.service';

const logger = pino({level: 'warn'}) as unknown as FastifyBaseLogger;
const games = new GameService({
	mugloarClient: new MugloarHttpClient({logger}),
});

const final = await playGame(games, ({game, note}) => {
	console.log(
		`turn ${String(game.turn).padStart(3)}: ${note} | lives=${game.lives} gold=${game.gold} score=${game.score}`,
	);
});

console.log(`\nGame over. Score: ${final.score} (turns: ${final.turn})`);
