import { z } from "zod";

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export const SUITS: readonly Suit[] = ["hearts", "diamonds", "clubs", "spades"];

export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export const RANKS: readonly Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export type Card = { readonly suit: Suit; readonly rank: Rank };

export const SuitSchema = z.enum(["hearts", "diamonds", "clubs", "spades"]);
export const RankSchema = z.enum([
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
]);
export const CardSchema = z.object({ suit: SuitSchema, rank: RankSchema });

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

export function formatCard(card: Card): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}
