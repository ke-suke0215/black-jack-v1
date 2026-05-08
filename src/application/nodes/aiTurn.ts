import type { GameUI } from "../../presentation/interfaces/gameUI.js";
import type { GameState } from "../../types/gameState.js";

export function createAiTurnNode(ui: GameUI) {
  return function aiTurn(_state: GameState): Partial<GameState> {
    ui.showMessage("[AI] AI player passes (stub).");
    return { currentTurn: "dealer", logs: ["[AI stub] skipped"] };
  };
}
