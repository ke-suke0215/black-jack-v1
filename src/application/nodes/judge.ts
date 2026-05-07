import { determineWinner } from "../../domain/engines/blackjackRuleEngine.js";
import type { GameUI } from "../../presentation/interfaces/gameUI.js";
import type { GameState } from "../../types/gameState.js";

export function createJudgeNode(ui: GameUI) {
  return function judge(state: GameState): Partial<GameState> {
    const winner = determineWinner(
      { cards: state.humanHand },
      { cards: state.aiHand },
      { cards: state.dealerHand },
    );
    ui.showMessage(`Game Over! Winner: ${winner}`);
    return { winner, logs: [`Game Over! Winner: ${winner}`] };
  };
}
