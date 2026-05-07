import { createDeck, shuffle } from "../../domain/deck.js";
import type { GameState } from "../../types/gameState.js";

export function dealInitialCards(_state: GameState): Partial<GameState> {
  const deck = shuffle(createDeck());
  const humanHand = [deck[0], deck[3]];
  const aiHand = [deck[1], deck[4]];
  const dealerHand = [deck[2], deck[5]];
  const remainingDeck = deck.slice(6);

  return {
    deck: remainingDeck,
    humanHand,
    aiHand,
    dealerHand,
    currentTurn: "human",
    logs: ["Initial cards dealt"],
  };
}
