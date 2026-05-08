import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Card } from "../../domain/card.js";
import { shuffle } from "../../domain/deck.js";
import type { GameUI } from "../../presentation/interfaces/gameUI.js";
import type { GameState, PlayerAction } from "../../types/gameState.js";
import { createBlackjackGraph } from "./blackjack.graph.js";

vi.mock("../../domain/deck.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../domain/deck.js")>();
  return {
    ...actual,
    shuffle: vi.fn((deck: Card[]) => deck),
  };
});

// shuffle=identity のときのデッキ配置（SUITS.flatMap(RANKS) 順）:
//   idx: 0=A♥, 1=2♥, 2=3♥, 3=4♥, 4=5♥, 5=6♥, 6=7♥, 7=8♥, 8=9♥, ...
//   humanHand=[A♥,4♥](15), aiHand=[2♥,5♥](7), dealerHand=[3♥,6♥](9)
//   remainingDeck=[7♥,8♥,9♥,...]

class TestUI implements GameUI {
  messages: string[] = [];
  renderCalls: GameState[] = [];
  private actionQueue: PlayerAction[] = [];

  queueActions(...actions: PlayerAction[]): void {
    this.actionQueue.push(...actions);
  }

  renderState(state: GameState): void {
    this.renderCalls.push({ ...state });
  }

  askPlayerAction(): Promise<PlayerAction> {
    const action = this.actionQueue.shift();
    if (action === undefined) {
      throw new Error("TestUI: action queue exhausted");
    }
    return Promise.resolve(action);
  }

  showMessage(message: string): void {
    this.messages.push(message);
  }
}

describe("Blackjack E2E", () => {
  let ui: TestUI;

  beforeEach(() => {
    ui = new TestUI();
    vi.mocked(shuffle).mockImplementation((deck) => deck);
  });

  it("Scenario A: human stand → dealer busts → human wins", async () => {
    // human=15, dealer=9→draws 7♥(16)→draws 8♥(24, bust)
    ui.queueActions("stand");
    const graph = createBlackjackGraph(ui);
    const result = await graph.invoke({});

    expect(result.winner).toBe("human");
    expect(ui.renderCalls).toHaveLength(1);
    expect(ui.messages).toEqual([
      "=== Blackjack Start! ===",
      "Your hand: A♥ 4♥  (score: 15)",
      "Dealer shows: 3♥ [hidden]",
      "You stand with 15.",
      "[AI] AI player passes (stub).",
      "--- Dealer's Turn ---",
      "Dealer reveals: 3♥ 6♥  (score: 9)",
      "Dealer draws: 7♥  (score: 16)",
      "Dealer draws: 8♥  (score: 24)",
      "Dealer busts with 24!",
      "Game Over! Winner: human",
    ]);
  });

  it("Scenario B: human busts (3 hits) → dealer wins, aiTurn/dealerTurn skipped", async () => {
    // +7♥=12, +8♥=20, +9♥=29(bust) → judge直行: human=-1, ai=7, dealer=9 → dealer wins
    ui.queueActions("hit", "hit", "hit");
    const graph = createBlackjackGraph(ui);
    const result = await graph.invoke({});

    expect(result.winner).toBe("dealer");
    expect(ui.renderCalls).toHaveLength(3);
    expect(ui.messages).toEqual([
      "=== Blackjack Start! ===",
      "Your hand: A♥ 4♥  (score: 15)",
      "Dealer shows: 3♥ [hidden]",
      "You drew: 7♥",
      "You drew: 8♥",
      "You drew: 9♥",
      "Bust! Your score is 29.",
      "Game Over! Winner: dealer",
    ]);
    expect(ui.messages).not.toContain("[AI] AI player passes (stub).");
    expect(ui.messages).not.toContain("--- Dealer's Turn ---");
  });

  it("Scenario C: human hit+stand → dealer stands at 17 → dealer wins", async () => {
    // human: +7♥=12, stand / dealer: 9→draws 8♥(17, stand) → human=12, dealer=17 → dealer wins
    ui.queueActions("hit", "stand");
    const graph = createBlackjackGraph(ui);
    const result = await graph.invoke({});

    expect(result.winner).toBe("dealer");
    expect(ui.renderCalls).toHaveLength(2);
    expect(ui.messages).toEqual([
      "=== Blackjack Start! ===",
      "Your hand: A♥ 4♥  (score: 15)",
      "Dealer shows: 3♥ [hidden]",
      "You drew: 7♥",
      "You stand with 12.",
      "[AI] AI player passes (stub).",
      "--- Dealer's Turn ---",
      "Dealer reveals: 3♥ 6♥  (score: 9)",
      "Dealer draws: 8♥  (score: 17)",
      "Dealer stands with 17.",
      "Game Over! Winner: dealer",
    ]);
  });

  it("Scenario D: human hit×2+stand → human wins, node execution order verified", async () => {
    // human: +7♥=12, +8♥=20, stand / dealer: 9→draws 9♥(18, stand) → human=20, dealer=18 → human wins
    ui.queueActions("hit", "hit", "stand");
    const graph = createBlackjackGraph(ui);
    const result = await graph.invoke({});

    expect(result.winner).toBe("human");
    expect(ui.renderCalls).toHaveLength(3);
    expect(ui.messages).toEqual([
      "=== Blackjack Start! ===",
      "Your hand: A♥ 4♥  (score: 15)",
      "Dealer shows: 3♥ [hidden]",
      "You drew: 7♥",
      "You drew: 8♥",
      "You stand with 20.",
      "[AI] AI player passes (stub).",
      "--- Dealer's Turn ---",
      "Dealer reveals: 3♥ 6♥  (score: 9)",
      "Dealer draws: 9♥  (score: 18)",
      "Dealer stands with 18.",
      "Game Over! Winner: human",
    ]);
  });
});
