import { expectedValue, sortByValue, successChance } from '../utils/advice';
import type { Ad } from '../types';

type Props = {
  ads: Ad[];
  disabled: boolean;
  onSolve: (adId: string) => void;
};

function chanceClass(chance: number): string {
  if (chance >= 0.7) return 'chance-high';
  if (chance >= 0.3) return 'chance-mid';
  return 'chance-low';
}

export function AdList({ ads, disabled, onSolve }: Props) {
  const sorted = sortByValue(ads);

  return (
    <section>
      <h2>Ads</h2>
      {sorted.length === 0 ? (
        <p>No ads available.</p>
      ) : (
        <>
          <p className="details">
            Sorted by expected value (success chance × reward).
          </p>
          <ul>
            {sorted.map((ad, index) => (
              <li key={ad.adId}>
                <p>
                  {ad.message}
                  {index === 0 && <strong className="best-pick"> — best pick</strong>}
                </p>
                <p className="details">
                  Reward: {ad.reward} · Expected value: {Math.round(expectedValue(ad))} ·{' '}
                  <span className={chanceClass(successChance(ad))}>
                    {ad.probability} (~{Math.round(successChance(ad) * 100)}% success)
                  </span>{' '}
                  · Expires in: {ad.expiresIn}
                </p>
                <button onClick={() => onSolve(ad.adId)} disabled={disabled}>
                  Solve
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
