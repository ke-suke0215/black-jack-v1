import { isBust, shouldDealerStand } from "../../domain/engines/blackjackRuleEngine.js";
import type { GameState } from "../../types/gameState.js";

export function dealerTurn(state: GameState): Partial<GameState> {
  let hand = [...state.dealerHand];
  let deck = [...state.deck];

  while (!shouldDealerStand({ cards: hand }) && !isBust({ cards: hand })) {
    const [card, ...rest] = deck;
    hand = [...hand, card];
    deck = rest;
  }

  return {
    dealerHand: hand,
    deck,
    currentTurn: "judge",
  };
}
