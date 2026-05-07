import type { Card } from "../domain/card.js";
import type { WinnerResult } from "../domain/engines/blackjackRuleEngine.js";

export type PlayerAction = "hit" | "stand";

export type GameState = {
  deck: Card[];
  dealerHand: Card[];
  humanHand: Card[];
  aiHand: Card[];
  currentTurn: "human" | "ai" | "dealer" | "judge";
  winner?: WinnerResult;
  logs: string[];
};
