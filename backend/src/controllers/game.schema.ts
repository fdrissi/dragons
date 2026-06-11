import {z} from 'zod';

export const GameIdParameters = z.object({gameId: z.string().min(1)});

export const SolveParameters = z.object({
	gameId: z.string().min(1),
	adId: z.string().min(1),
});

export const BuyParameters = z.object({
	gameId: z.string().min(1),
	itemId: z.string().min(1),
});
