import {z} from 'zod';

export const GameSchema = z.object({
	gameId: z.string(),
	lives: z.number(),
	gold: z.number(),
	level: z.number(),
	score: z.number(),
	highScore: z.number(),
	turn: z.number(),
});

export const AdSchema = z.object({
	adId: z.string(),
	message: z.string(),
	reward: z.coerce.number(),
	expiresIn: z.number(),
	probability: z.string(),
	encrypted: z.union([z.literal(1), z.literal(2), z.null()]).optional(),
});

export const AdListSchema = z.array(AdSchema);

export const ShopItemSchema = z.object({
	id: z.string(),
	name: z.string(),
	cost: z.number(),
});

export const ShopItemListSchema = z.array(ShopItemSchema);

export const SolveResultSchema = z.object({
	success: z.boolean(),
	lives: z.number(),
	gold: z.number(),
	score: z.number(),
	highScore: z.number(),
	turn: z.number(),
	message: z.string(),
});

export const BuyResultSchema = z.object({
	shoppingSuccess: z.boolean(),
	gold: z.number(),
	lives: z.number(),
	level: z.number(),
	turn: z.number(),
});
