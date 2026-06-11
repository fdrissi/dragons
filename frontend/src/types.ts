export type Game = {
  gameId: string;
  lives: number;
  gold: number;
  level: number;
  score: number;
  highScore: number;
  turn: number;
};

export type Ad = {
  adId: string;
  message: string;
  reward: number;
  expiresIn: number;
  probability: string;
};

export type ShopItem = {
  id: string;
  name: string;
  cost: number;
};

export type SolveResult = {
  success: boolean;
  lives: number;
  gold: number;
  score: number;
  highScore: number;
  turn: number;
  message: string;
};

export type BuyResult = {
  shoppingSuccess: boolean;
  gold: number;
  lives: number;
  level: number;
  turn: number;
};
