import type { Card } from "./card.js";

export type Hand = { readonly cards: Card[] };

export function createHand(): Hand {
  return { cards: [] };
}

export function addCard(hand: Hand, card: Card): Hand {
  return { cards: [...hand.cards, card] };
}
