import { describe, expect, it } from "vitest";
import { createDeck, shuffle } from "./deck.js";

describe("createDeck", () => {
  it("52枚のデッキを生成する", () => {
    expect(createDeck()).toHaveLength(52);
  });

  it("全スート・全ランクの組み合わせを含む", () => {
    const deck = createDeck();
    const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;
    for (const suit of suits) {
      for (const rank of ranks) {
        expect(deck).toContainEqual({ suit, rank });
      }
    }
  });

  it("重複するカードが存在しない", () => {
    const deck = createDeck();
    const keys = deck.map((c) => `${c.suit}-${c.rank}`);
    expect(new Set(keys).size).toBe(52);
  });
});

describe("shuffle", () => {
  it("元のデッキと同じ枚数を返す", () => {
    const deck = createDeck();
    expect(shuffle(deck)).toHaveLength(52);
  });

  it("元のデッキを変更しない", () => {
    const deck = createDeck();
    const copy = [...deck];
    shuffle(deck);
    expect(deck).toEqual(copy);
  });

  it("同じカードをすべて含む", () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    expect(shuffled).toEqual(expect.arrayContaining(deck));
  });

  it("シャッフル後に順序が変わっている（確率的テスト）", () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    // 52枚が完全に同じ順序になる確率は 1/52! ≈ 0 なので実質必ずパスする
    expect(JSON.stringify(shuffled)).not.toBe(JSON.stringify(deck));
  });
});
