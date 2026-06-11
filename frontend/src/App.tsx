import { AdList } from './components/AdList'
import { Shop } from './components/Shop'
import { useGame } from './hooks/useGame'

export function App() {
	const { game, ads, shop, message, busy, gameOver, start, solve, buy } =
		useGame()

	return (
		<main>
			<header>
				<h1>Dragons of Mugloar</h1>
				<button onClick={start} disabled={busy}>
					{game ? 'New game' : 'Start game'}
				</button>
			</header>

			{game && (
				<dl className="stats">
					<div>
						<dt>Score</dt>
						<dd>{game.score}</dd>
					</div>
					<div>
						<dt>Gold</dt>
						<dd>{game.gold}</dd>
					</div>
					<div>
						<dt>Lives</dt>
						<dd>{game.lives}</dd>
					</div>
				</dl>
			)}

			{message && <p className="message">{message}</p>}
			{game && gameOver && (
				<p className="message">Game over — final score {game.score}.</p>
			)}

			{game && !gameOver && (
				<div className="columns">
					<AdList ads={ads} disabled={busy} onSolve={solve} />
					<Shop
						items={shop}
						gold={game.gold}
						disabled={busy}
						onBuy={buy}
					/>
				</div>
			)}

			{!game && <p>Start a game to see the list of ads.</p>}
		</main>
	)
}
