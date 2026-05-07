import { isBust } from "../../domain/engines/blackjackRuleEngine.js";
import type { GameUI } from "../../presentation/interfaces/gameUI.js";
import type { GameState } from "../../types/gameState.js";

export function createHumanTurnNode(ui: GameUI) {
  return async function humanTurn(state: GameState): Promise<Partial<GameState>> {
    ui.renderState(state);
    const action = await ui.askPlayerAction();

    if (action === "stand") {
      return { currentTurn: "ai" };
    }

    // hit
    const [card, ...rest] = state.deck;
    const humanHand = [...state.humanHand, card];

    if (isBust({ cards: humanHand })) {
      return { deck: rest, humanHand, currentTurn: "judge" };
    }

    return { deck: rest, humanHand, currentTurn: "human" };
  };
}
