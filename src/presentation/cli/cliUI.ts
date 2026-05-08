import * as readline from "node:readline";
import { formatCard } from "../../domain/card.js";
import { calculateScore } from "../../domain/engines/blackjackRuleEngine.js";
import type { GameState, PlayerAction } from "../../types/gameState.js";
import type { GameUI } from "../interfaces/gameUI.js";

export class CLIUI implements GameUI {
  renderState(state: GameState): void {
    const formatCards = (cards: GameState["humanHand"]): string => {
      if (cards.length === 0) return "(empty)";
      return cards.map((c) => formatCard(c)).join(" ");
    };

    const dealerScore =
      state.dealerHand.length > 0 ? calculateScore({ cards: state.dealerHand }) : 0;
    const humanScore = state.humanHand.length > 0 ? calculateScore({ cards: state.humanHand }) : 0;
    const aiScore = state.aiHand.length > 0 ? calculateScore({ cards: state.aiHand }) : 0;

    console.log("=== Game State ===");
    console.log(
      `Dealer: ${formatCards(state.dealerHand)}${state.dealerHand.length > 0 ? ` (score: ${dealerScore})` : ""}`,
    );
    console.log(
      `Human:  ${formatCards(state.humanHand)}${state.humanHand.length > 0 ? ` (score: ${humanScore})` : ""}`,
    );
    console.log(
      `AI:     ${formatCards(state.aiHand)}${state.aiHand.length > 0 ? ` (score: ${aiScore})` : ""}`,
    );
    console.log("==================");
  }

  askPlayerAction(): Promise<PlayerAction> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question("Your action (hit / stand): ", (answer) => {
        rl.close();
        const trimmed = answer.trim().toLowerCase();
        if (trimmed === "hit" || trimmed === "stand") {
          resolve(trimmed);
        } else {
          console.log('Invalid input. Please enter "hit" or "stand".');
          resolve(this.askPlayerAction());
        }
      });
    });
  }

  showMessage(message: string): void {
    console.log(message);
  }
}
