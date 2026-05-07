import type { GameState, PlayerAction } from "../../types/gameState.js";

export interface GameUI {
  renderState(state: GameState): void;
  askPlayerAction(): Promise<PlayerAction>;
  showMessage(message: string): void;
}
