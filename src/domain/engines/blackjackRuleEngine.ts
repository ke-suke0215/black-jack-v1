import type { Hand } from "../hand.js";

export type WinnerResult = "human" | "ai" | "dealer" | "draw";

function rankToValue(rank: string): number {
  if (rank === "A") return 1;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return Number(rank);
}

export function calculateScore(hand: Hand): number {
  let score = 0;
  let aces = 0;

  for (const card of hand.cards) {
    score += rankToValue(card.rank);
    if (card.rank === "A") aces++;
  }

  for (let i = 0; i < aces; i++) {
    if (score + 10 <= 21) score += 10;
  }

  return score;
}

export function isBust(hand: Hand): boolean {
  return calculateScore(hand) > 21;
}

export function shouldDealerStand(hand: Hand): boolean {
  return calculateScore(hand) >= 17;
}

export function determineWinner(humanHand: Hand, aiHand: Hand, dealerHand: Hand): WinnerResult {
  const scores: Record<WinnerResult, number> = {
    human: isBust(humanHand) ? -1 : calculateScore(humanHand),
    ai: isBust(aiHand) ? -1 : calculateScore(aiHand),
    dealer: isBust(dealerHand) ? -1 : calculateScore(dealerHand),
    draw: -1,
  };

  const max = Math.max(scores.human, scores.ai, scores.dealer);

  // 全員 bust
  if (max === -1) return "draw";

  const winners = (["human", "ai", "dealer"] as const).filter((p) => scores[p] === max);

  return winners.length === 1 ? winners[0] : "draw";
}
