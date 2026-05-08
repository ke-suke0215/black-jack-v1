import { formatCard } from "../../domain/card.js";
import { createDeck, shuffle } from "../../domain/deck.js";
import { calculateScore } from "../../domain/engines/blackjackRuleEngine.js";
import type { GameUI } from "../../presentation/interfaces/gameUI.js";
import type { GameState } from "../../types/gameState.js";

export function createDealInitialCardsNode(ui: GameUI) {
  return function dealInitialCards(_state: GameState): Partial<GameState> {
    const deck = shuffle(createDeck());
    const humanHand = [deck[0], deck[3]];
    const aiHand = [deck[1], deck[4]];
    const dealerHand = [deck[2], deck[5]];
    const remainingDeck = deck.slice(6);

    ui.showMessage("=== Blackjack Start! ===");
    ui.showMessage(
      `Your hand: ${humanHand.map(formatCard).join(" ")}  (score: ${calculateScore({ cards: humanHand })})`,
    );
    ui.showMessage(`Dealer shows: ${formatCard(dealerHand[0])} [hidden]`);

    return {
      deck: remainingDeck,
      humanHand,
      aiHand,
      dealerHand,
      currentTurn: "human",
      logs: ["Initial cards dealt"],
    };
  };
}
