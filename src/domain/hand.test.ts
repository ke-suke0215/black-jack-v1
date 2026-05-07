import { describe, expect, it } from "vitest";
import type { Card } from "./card.js";
import { addCard, createHand } from "./hand.js";

const cardA: Card = { suit: "hearts", rank: "A" };
const card5: Card = { suit: "spades", rank: "5" };
const cardK: Card = { suit: "diamonds", rank: "K" };

describe("createHand", () => {
  it("空の手札を返す", () => {
    expect(createHand()).toEqual({ cards: [] });
  });
});

describe("addCard", () => {
  it("カードを手札に加えた新しい Hand を返す", () => {
    const hand = createHand();
    const result = addCard(hand, cardA);
    expect(result.cards).toEqual([cardA]);
  });

  it("元の Hand を変更しない", () => {
    const hand = createHand();
    addCard(hand, cardA);
    expect(hand.cards).toEqual([]);
  });

  it("複数枚追加できる", () => {
    const hand = addCard(addCard(createHand(), cardA), card5);
    expect(hand.cards).toEqual([cardA, card5]);
  });

  it("追加順序が保持される", () => {
    const hand = addCard(addCard(addCard(createHand(), cardA), card5), cardK);
    expect(hand.cards).toEqual([cardA, card5, cardK]);
  });
});
