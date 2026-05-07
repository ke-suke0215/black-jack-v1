import { describe, expect, it } from "vitest";
import type { Card } from "../card.js";
import { addCard, createHand } from "../hand.js";
import {
  calculateScore,
  determineWinner,
  isBust,
  shouldDealerStand,
} from "./blackjackRuleEngine.js";

function makeHand(...cards: Card[]) {
  return cards.reduce((hand, card) => addCard(hand, card), createHand());
}

const c = (rank: Card["rank"], suit: Card["suit"] = "hearts"): Card => ({
  suit,
  rank,
});

describe("calculateScore", () => {
  it("A + K = 21 (ナチュラルブラックジャック)", () => {
    expect(calculateScore(makeHand(c("A"), c("K")))).toBe(21);
  });

  it("A + 9 + 5 = 15 (Ace を 1 に降格)", () => {
    expect(calculateScore(makeHand(c("A"), c("9"), c("5")))).toBe(15);
  });

  it("A + A = 12 (1枚目 11、2枚目 1)", () => {
    expect(calculateScore(makeHand(c("A"), c("A")))).toBe(12);
  });

  it("A + A + 9 = 21 (1枚目 11、2枚目 1)", () => {
    expect(calculateScore(makeHand(c("A"), c("A"), c("9")))).toBe(21);
  });

  it("A + A + 10 = 12 (両方 1)", () => {
    expect(calculateScore(makeHand(c("A"), c("A"), c("10")))).toBe(12);
  });

  it("J, Q, K は 10 点", () => {
    expect(calculateScore(makeHand(c("J"), c("5")))).toBe(15);
    expect(calculateScore(makeHand(c("Q"), c("3")))).toBe(13);
    expect(calculateScore(makeHand(c("K"), c("2")))).toBe(12);
  });

  it("bust の手札のスコアを返す", () => {
    expect(calculateScore(makeHand(c("10"), c("10"), c("5")))).toBe(25);
  });
});

describe("isBust", () => {
  it("21 以下は bust しない", () => {
    expect(isBust(makeHand(c("10"), c("10")))).toBe(false);
    expect(isBust(makeHand(c("10"), c("A")))).toBe(false);
  });

  it("22 以上は bust", () => {
    expect(isBust(makeHand(c("10"), c("10"), c("2")))).toBe(true);
  });
});

describe("shouldDealerStand", () => {
  it("17 以上で stand", () => {
    expect(shouldDealerStand(makeHand(c("10"), c("7")))).toBe(true);
    expect(shouldDealerStand(makeHand(c("10"), c("10")))).toBe(true);
  });

  it("16 以下は hit", () => {
    expect(shouldDealerStand(makeHand(c("10"), c("6")))).toBe(false);
    expect(shouldDealerStand(makeHand(c("5"), c("4")))).toBe(false);
  });
});

describe("determineWinner", () => {
  it("単独最高スコアのプレイヤーが勝つ", () => {
    const human = makeHand(c("10"), c("9")); // 19
    const ai = makeHand(c("10"), c("7")); // 17
    const dealer = makeHand(c("10"), c("6")); // 16
    expect(determineWinner(human, ai, dealer)).toBe("human");
  });

  it("AI が最高スコアで勝つ", () => {
    const human = makeHand(c("10"), c("6")); // 16
    const ai = makeHand(c("10"), c("A")); // 21
    const dealer = makeHand(c("10"), c("8")); // 18
    expect(determineWinner(human, ai, dealer)).toBe("ai");
  });

  it("dealer が最高スコアで勝つ", () => {
    const human = makeHand(c("10"), c("6")); // 16
    const ai = makeHand(c("10"), c("7")); // 17
    const dealer = makeHand(c("10"), c("9")); // 19
    expect(determineWinner(human, ai, dealer)).toBe("dealer");
  });

  it("2人が同スコアなら draw", () => {
    const human = makeHand(c("10"), c("9")); // 19
    const ai = makeHand(c("10"), c("9"), c("spades")); // 19
    const dealer = makeHand(c("10"), c("6")); // 16
    expect(determineWinner(human, ai, dealer)).toBe("draw");
  });

  it("全員 bust なら draw", () => {
    const bust = makeHand(c("10"), c("10"), c("5")); // 25
    expect(determineWinner(bust, bust, bust)).toBe("draw");
  });

  it("2人 bust なら残り 1 人の勝ち", () => {
    const human = makeHand(c("10"), c("8")); // 18
    const bust = makeHand(c("10"), c("10"), c("5")); // 25
    expect(determineWinner(human, bust, bust)).toBe("human");
  });
});
