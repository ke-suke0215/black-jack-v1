import type { GameState } from "../../types/gameState.js";

export function aiTurn(_state: GameState): Partial<GameState> {
  return { currentTurn: "dealer", logs: ["[AI stub] skipped"] };
}
