# Step 2: Domain Layer 実装計画

## Context

LangGraph Blackjack Agent の Step 2。LLM・UI に依存しない pure な Domain Layer を実装する。
このステップ完了時点で、ルール・点数計算・勝敗判定が単体でテスト可能になる。

---

## テストフレームワーク: Vitest

Jest ではなく Vitest を選ぶ理由:
- `tsconfig.json` の `"module": "NodeNext"` との相性が良い（Jest は ESM/NodeNext で設定が複雑）
- TypeScript をゼロコンフィグでネイティブサポート
- `vitest.config.ts` 1ファイルで完結

---

## 実装ファイル一覧

### 新規作成

| ファイル | 内容 |
|---|---|
| `src/domain/card.ts` | `Suit`, `Rank`, `Card` 型 + 定数配列 + Zod スキーマ |
| `src/domain/deck.ts` | `createDeck()`, `shuffle()` |
| `src/domain/hand.ts` | `Hand` 型, `createHand()`, `addCard()` |
| `src/domain/engines/blackjackRuleEngine.ts` | `calculateScore()`, `isBust()`, `shouldDealerStand()`, `determineWinner()` |
| `src/domain/card.test.ts` | card テスト |
| `src/domain/deck.test.ts` | deck テスト |
| `src/domain/hand.test.ts` | hand テスト |
| `src/domain/engines/blackjackRuleEngine.test.ts` | ルールエンジンテスト |
| `vitest.config.ts` | Vitest 設定 |

### 変更するファイル

| ファイル | 変更内容 |
|---|---|
| `package.json` | `"test"`, `"test:watch"` スクリプト追加、vitest インストール |
| `docs/overall-plan.md` | Step 2 チェックボックスを完了に更新 |

---

## 実装詳細

### `src/domain/card.ts`

```ts
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export const SUITS: readonly Suit[] = ["hearts", "diamonds", "clubs", "spades"];

export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export const RANKS: readonly Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export type Card = { readonly suit: Suit; readonly rank: Rank };

// Zod スキーマ（後の Infrastructure/Agent 層で再利用）
export const SuitSchema = z.enum([...]);
export const CardSchema = z.object({ suit: SuitSchema, rank: RankSchema });
```

### `src/domain/deck.ts`

- `createDeck()`: `SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank })))` で52枚生成
- `shuffle(deck)`: Fisher-Yates shuffle、入力を**変異しない**新配列を返す

### `src/domain/hand.ts`

- `Hand` = `{ readonly cards: Card[] }`（クラスではなく plain object）
- `addCard(hand, card)` は新しい `Hand` を返す（純粋関数、変異なし）

### `src/domain/engines/blackjackRuleEngine.ts`

**`calculateScore(hand)`:**
1. 全カードを集計（Ace は一旦 1 として加算）
2. Ace の枚数分ループし、`score + 10 <= 21` なら +10

**`isBust(hand)`:** `calculateScore > 21`

**`shouldDealerStand(hand)`:** `calculateScore >= 17`

**`determineWinner(humanHand, aiHand, dealerHand)`:**
- bust したプレイヤーのスコアをセンチネル値 `-1` にして `Math.max` で最大スコアを取得
- 最大スコアと同点のプレイヤーが複数いれば `"draw"`

**export する型:**
```ts
export type WinnerResult = "human" | "ai" | "dealer" | "draw";
```

---

## NodeNext の注意点

source ファイル間の import は `.js` 拡張子が必要（tsc のビルド要件）:
```ts
import type { Card } from "./card.js";
```

test ファイルは Vitest のリゾルバが使われるため `.ts` 拡張子でも可。

---

## テストケース（主要なもの）

### `calculateScore` のエッジケース

| 手札 | 期待スコア | 備考 |
|---|---|---|
| A + K | 21 | ナチュラルブラックジャック |
| A + 9 + 5 | 15 | Ace を 1 に降格 |
| A + A | 12 | 1枚目11、2枚目1 |
| A + A + 9 | 21 | 1枚目11、2枚目1、合計21 |
| A + A + 10 | 12 | 両方1、合計12 |

### `determineWinner` のケース

- 単独最高スコア → その人の勝ち
- 2人同スコア → `"draw"`
- 全員 bust → `"draw"`
- 2人 bust → 残り1人の勝ち

---

## 実装順序

1. `pnpm add -D vitest` インストール
2. `vitest.config.ts` 作成
3. `package.json` スクリプト更新
4. `src/domain/card.ts`
5. `src/domain/deck.ts`
6. `src/domain/hand.ts`
7. `src/domain/engines/blackjackRuleEngine.ts`
8. 各テストファイル作成
9. `pnpm test` 全パス確認
10. `pnpm check` Biome クリーン確認
11. `docs/overall-plan.md` 更新

---

## 検証方法

```bash
pnpm test        # 全テストパス確認
pnpm check       # Biome lint/format クリーン確認
pnpm build       # tsc コンパイル成功確認
```
