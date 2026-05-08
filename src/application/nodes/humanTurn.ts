import { formatCard } from "../../domain/card.js";
import { calculateScore, isBust } from "../../domain/engines/blackjackRuleEngine.js";
import type { GameUI } from "../../presentation/interfaces/gameUI.js";
import type { GameState } from "../../types/gameState.js";

export function createHumanTurnNode(ui: GameUI) {
  return async function humanTurn(state: GameState): Promise<Partial<GameState>> {
    ui.renderState(state);
    const action = await ui.askPlayerAction();

    if (action === "stand") {
      const score = calculateScore({ cards: state.humanHand });
      ui.showMessage(`You stand with ${score}.`);
      return { currentTurn: "ai" };
    }

    // hit
    const [card, ...rest] = state.deck;
    const humanHand = [...state.humanHand, card];
    const score = calculateScore({ cards: humanHand });

    ui.showMessage(`You drew: ${formatCard(card)}`);

    if (isBust({ cards: humanHand })) {
      ui.showMessage(`Bust! Your score is ${score}.`);
      return { deck: rest, humanHand, currentTurn: "judge" };
    }

    return { deck: rest, humanHand, currentTurn: "human" };
  };
}
