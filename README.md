# Dragons of Mugloar

My solution for the [Dragons of Mugloar](https://dragonsofmugloar.com/doc/) test assignment.

Two parts:

- **backend** — a small Fastify server. It proxies the Mugloar API for the frontend, and it contains the bot. The bot plays a full game on its own and scores well above 1000 points.
- **frontend** — one page (React) to play the game by hand: start a game, read the ads, solve the ones you pick, buy items, and follow your score, gold and lives. Ads are sorted by expected value and show a success estimate, to make choices easier.

## How to run

You need Node 22 and pnpm.

```bash
pnpm install
pnpm dev       # backend on :8080, frontend on :5173
pnpm bot:run   # the bot plays one game in the terminal
pnpm test      # backend tests
```

Then open <http://localhost:5173>.

## How the bot plays

Every turn it does one of these:

1. Lives below 4 and enough gold? Buy a healing potion.
2. Spare gold left after a potion reserve? Buy the most expensive shop upgrade. Upgrades make the dragon fail less.
3. Otherwise, solve the ad with the best expected value: success chance × reward, minus the cost of a potion when it fails. When lives are low, or there is no gold for a potion yet, it takes the safest ad instead. Dying early is the main risk.

The success chance comes from the ad's difficulty label ("Sure thing" ≈ 95%, "Suicide mission" ≈ 2%, ...). The whole strategy lives in `backend/src/bot/bot.ts`.
