import { formatCard } from "../../domain/card.js";
import {
  calculateScore,
  isBust,
  shouldDealerStand,
} from "../../domain/engines/blackjackRuleEngine.js";
import type { GameUI } from "../../presentation/interfaces/gameUI.js";
import type { GameState } from "../../types/gameState.js";

export function createDealerTurnNode(ui: GameUI) {
  return function dealerTurn(state: GameState): Partial<GameState> {
    let hand = [...state.dealerHand];
    let deck = [...state.deck];

    ui.showMessage("--- Dealer's Turn ---");
    ui.showMessage(
      `Dealer reveals: ${hand.map(formatCard).join(" ")}  (score: ${calculateScore({ cards: hand })})`,
    );

    while (!shouldDealerStand({ cards: hand }) && !isBust({ cards: hand })) {
      const [card, ...rest] = deck;
      hand = [...hand, card];
      deck = rest;
      const score = calculateScore({ cards: hand });
      ui.showMessage(`Dealer draws: ${formatCard(card)}  (score: ${score})`);
    }

    const finalScore = calculateScore({ cards: hand });
    if (isBust({ cards: hand })) {
      ui.showMessage(`Dealer busts with ${finalScore}!`);
    } else {
      ui.showMessage(`Dealer stands with ${finalScore}.`);
    }

    return {
      dealerHand: hand,
      deck,
      currentTurn: "judge",
    };
  };
}
