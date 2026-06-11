import {type Cradle} from '@fastify/awilix';
import {type FastifyBaseLogger} from 'fastify';
import {
	type Ad,
	type BuyResult,
	type Game,
	type ShopItem,
	type SolveResult,
} from './mugloar.types';
import {type IMugloarClient} from './mugloar.port';
import {
	AdListSchema,
	BuyResultSchema,
	GameSchema,
	ShopItemListSchema,
	SolveResultSchema,
} from './mugloar.schema';
import {CONFIG} from '@/configuration/index';

export class MugloarHttpClient implements IMugloarClient {
	private readonly baseUrl: string;
	private readonly logger: FastifyBaseLogger;

	public constructor({logger}: Pick<Cradle, 'logger'>) {
		this.baseUrl = CONFIG.get('mugloar').baseUrl;
		this.logger = logger;
	}

	public async startGame(): Promise<Game> {
		const data = await this.request('POST', '/game/start');
		return GameSchema.parse(data);
	}

	public async listMessages(gameId: string): Promise<Ad[]> {
		const data = await this.request('GET', `/${gameId}/messages`);
		const parsed = AdListSchema.parse(data);
		// Some ads come base64- or ROT13-encoded; we skip those.
		return parsed
			.filter(ad => ad.encrypted === null || ad.encrypted === undefined)
			.map(({encrypted, ...rest}) => rest);
	}

	public async solve(gameId: string, adId: string): Promise<SolveResult> {
		const data = await this.request('POST', `/${gameId}/solve/${adId}`);
		return SolveResultSchema.parse(data);
	}

	public async listShop(gameId: string): Promise<ShopItem[]> {
		const data = await this.request('GET', `/${gameId}/shop`);
		return ShopItemListSchema.parse(data);
	}

	public async buy(gameId: string, itemId: string): Promise<BuyResult> {
		const data = await this.request('POST', `/${gameId}/shop/buy/${itemId}`);
		return BuyResultSchema.parse(data);
	}

	private async request(method: 'GET' | 'POST', path: string): Promise<unknown> {
		const url = `${this.baseUrl}${path}`;
		const response = await fetch(url, {method});
		if (!response.ok) {
			const body = await response.text().catch(() => '');
			this.logger.warn(
				{url, status: response.status, body},
				'mugloar request failed',
			);
			throw new Error(`mugloar ${method} ${path} → ${response.status}`);
		}

		return response.json();
	}
}
