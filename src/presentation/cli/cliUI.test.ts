import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState } from "../../types/gameState.js";
import { CLIUI } from "./cliUI.js";

const emptyState: GameState = {
  deck: [],
  dealerHand: [],
  humanHand: [],
  aiHand: [],
  currentTurn: "human",
  logs: [],
};

describe("CLIUI.showMessage", () => {
  it("console.log にメッセージを渡す", () => {
    const ui = new CLIUI();
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    ui.showMessage("Hello, World!");
    expect(spy).toHaveBeenCalledWith("Hello, World!");
    spy.mockRestore();
  });
});

describe("CLIUI.renderState", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("スーツ記号を正しく表示する", () => {
    const ui = new CLIUI();
    const state: GameState = {
      ...emptyState,
      humanHand: [
        { suit: "hearts", rank: "A" },
        { suit: "spades", rank: "K" },
      ],
    };
    ui.renderState(state);
    const output = logSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("A♥");
    expect(output).toContain("K♠");
  });

  it("スコアを表示する", () => {
    const ui = new CLIUI();
    const state: GameState = {
      ...emptyState,
      currentTurn: "dealer",
      dealerHand: [
        { suit: "diamonds", rank: "10" },
        { suit: "clubs", rank: "7" },
      ],
    };
    ui.renderState(state);
    const output = logSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("score: 17");
  });

  it("Human ターン中はディーラーの2枚目を隠す", () => {
    const ui = new CLIUI();
    const state: GameState = {
      ...emptyState,
      currentTurn: "human",
      dealerHand: [
        { suit: "spades", rank: "7" },
        { suit: "hearts", rank: "5" },
      ],
    };
    ui.renderState(state);
    const output = logSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("7♠");
    expect(output).toContain("[?]");
    expect(output).not.toContain("5♥");
    expect(output).not.toContain("score: 12");
  });

  it("空のハンドは (empty) と表示する", () => {
    const ui = new CLIUI();
    ui.renderState(emptyState);
    const output = logSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("(empty)");
  });

  it("diamonds と clubs のスーツ記号を正しく表示する", () => {
    const ui = new CLIUI();
    const state: GameState = {
      ...emptyState,
      aiHand: [
        { suit: "diamonds", rank: "Q" },
        { suit: "clubs", rank: "5" },
      ],
    };
    ui.renderState(state);
    const output = logSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("Q♦");
    expect(output).toContain("5♣");
  });
});

describe("CLIUI.askPlayerAction", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('"hit" を返す', async () => {
    const ui = new CLIUI();
    const mockRl = {
      question: vi.fn((_prompt: string, cb: (answer: string) => void) => {
        cb("hit");
      }),
      close: vi.fn(),
    };
    vi.mock("node:readline", () => ({
      createInterface: () => mockRl,
    }));

    // readline をモックするため動的インポートを利用
    const rlModule = await import("node:readline");
    vi.spyOn(rlModule, "createInterface").mockReturnValue(mockRl as never);

    const action = await ui.askPlayerAction();
    expect(action).toBe("hit");
  });

  it('"stand" を返す', async () => {
    const ui = new CLIUI();
    const rlModule = await import("node:readline");
    const mockRl = {
      question: vi.fn((_prompt: string, cb: (answer: string) => void) => {
        cb("stand");
      }),
      close: vi.fn(),
    };
    vi.spyOn(rlModule, "createInterface").mockReturnValue(mockRl as never);

    const action = await ui.askPlayerAction();
    expect(action).toBe("stand");
  });

  it("無効入力の後に有効な入力を受け付ける", async () => {
    const ui = new CLIUI();
    const rlModule = await import("node:readline");
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    let callCount = 0;
    const mockRl = {
      question: vi.fn((_prompt: string, cb: (answer: string) => void) => {
        callCount++;
        cb(callCount === 1 ? "invalid" : "stand");
      }),
      close: vi.fn(),
    };
    vi.spyOn(rlModule, "createInterface").mockReturnValue(mockRl as never);

    const action = await ui.askPlayerAction();
    expect(action).toBe("stand");
    expect(logSpy).toHaveBeenCalledWith('Invalid input. Please enter "hit" or "stand".');

    logSpy.mockRestore();
  });
});
