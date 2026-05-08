import { describe, expect, it } from "vitest";
import {
  type Card,
  CardSchema,
  formatCard,
  RANKS,
  type Rank,
  RankSchema,
  SUIT_SYMBOLS,
  SUITS,
  type Suit,
  SuitSchema,
} from "./card.js";

describe("SUITS", () => {
  it("4種類のスートを持つ", () => {
    expect(SUITS).toHaveLength(4);
    expect(SUITS).toContain("hearts");
    expect(SUITS).toContain("diamonds");
    expect(SUITS).toContain("clubs");
    expect(SUITS).toContain("spades");
  });
});

describe("RANKS", () => {
  it("13種類のランクを持つ", () => {
    expect(RANKS).toHaveLength(13);
  });

  it("A と数字と絵札を含む", () => {
    expect(RANKS).toContain("A");
    expect(RANKS).toContain("10");
    expect(RANKS).toContain("J");
    expect(RANKS).toContain("Q");
    expect(RANKS).toContain("K");
  });
});

describe("SuitSchema", () => {
  it("有効なスートをパースできる", () => {
    const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
    for (const suit of suits) {
      expect(SuitSchema.parse(suit)).toBe(suit);
    }
  });

  it("無効なスートはエラーになる", () => {
    expect(() => SuitSchema.parse("joker")).toThrow();
    expect(() => SuitSchema.parse("")).toThrow();
  });
});

describe("RankSchema", () => {
  it("有効なランクをパースできる", () => {
    const ranks: Rank[] = ["A", "2", "10", "J", "Q", "K"];
    for (const rank of ranks) {
      expect(RankSchema.parse(rank)).toBe(rank);
    }
  });

  it("無効なランクはエラーになる", () => {
    expect(() => RankSchema.parse("1")).toThrow();
    expect(() => RankSchema.parse("11")).toThrow();
    expect(() => RankSchema.parse("")).toThrow();
  });
});

describe("CardSchema", () => {
  it("有効なカードをパースできる", () => {
    const card: Card = { suit: "hearts", rank: "A" };
    expect(CardSchema.parse(card)).toEqual(card);
  });

  it("suit が不正な場合はエラーになる", () => {
    expect(() => CardSchema.parse({ suit: "invalid", rank: "A" })).toThrow();
  });

  it("rank が不正な場合はエラーになる", () => {
    expect(() => CardSchema.parse({ suit: "hearts", rank: "invalid" })).toThrow();
  });

  it("フィールドが欠けている場合はエラーになる", () => {
    expect(() => CardSchema.parse({ suit: "hearts" })).toThrow();
    expect(() => CardSchema.parse({ rank: "A" })).toThrow();
  });
});

describe("SUIT_SYMBOLS", () => {
  it("4つのスートの記号を持つ", () => {
    expect(SUIT_SYMBOLS.hearts).toBe("♥");
    expect(SUIT_SYMBOLS.diamonds).toBe("♦");
    expect(SUIT_SYMBOLS.clubs).toBe("♣");
    expect(SUIT_SYMBOLS.spades).toBe("♠");
  });
});

describe("formatCard", () => {
  it("ランクとスート記号を結合する", () => {
    expect(formatCard({ rank: "Q", suit: "spades" })).toBe("Q♠");
    expect(formatCard({ rank: "A", suit: "hearts" })).toBe("A♥");
    expect(formatCard({ rank: "10", suit: "diamonds" })).toBe("10♦");
  });
});
