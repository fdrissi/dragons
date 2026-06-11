import {type Cradle} from '@fastify/awilix';
import {type IGameService} from '../game.service.port';
import {
	type Ad,
	type BuyResult,
	type Game,
	type ShopItem,
	type SolveResult,
} from '@/mugloar/mugloar.types';
import {type IMugloarClient} from '@/mugloar/mugloar.port';

export class GameService implements IGameService {
	private readonly mugloar: IMugloarClient;

	public constructor({mugloarClient}: Pick<Cradle, 'mugloarClient'>) {
		this.mugloar = mugloarClient;
	}

	public async start(): Promise<Game> {
		return this.mugloar.startGame();
	}

	public async listAds(gameId: string): Promise<Ad[]> {
		return this.mugloar.listMessages(gameId);
	}

	public async solve(gameId: string, adId: string): Promise<SolveResult> {
		return this.mugloar.solve(gameId, adId);
	}

	public async listShop(gameId: string): Promise<ShopItem[]> {
		return this.mugloar.listShop(gameId);
	}

	public async buy(gameId: string, itemId: string): Promise<BuyResult> {
		return this.mugloar.buy(gameId, itemId);
	}
}
