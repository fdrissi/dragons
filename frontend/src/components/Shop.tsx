import type { ShopItem } from '../types';

type Props = {
  items: ShopItem[];
  gold: number;
  disabled: boolean;
  onBuy: (itemId: string) => void;
};

export function Shop({ items, gold, disabled, onBuy }: Props) {
  return (
    <section>
      <h2>Shop</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <p>
              {item.name} — {item.cost} gold
            </p>
            <button onClick={() => onBuy(item.id)} disabled={disabled || gold < item.cost}>
              Buy
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
