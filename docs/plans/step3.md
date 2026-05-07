# Step 3: GameState 型定義

## 目的

LangGraph の State スキーマとなる中心的な型定義を確立する。
全レイヤー (Application / Presentation / Infrastructure) が参照する型のため、
Step 4 以降の実装の前提となる。

---

## 作成ファイル

`src/types/gameState.ts`

---

## 型定義

### PlayerAction

```ts
export type PlayerAction = "hit" | "stand";
```

Human プレイヤーの操作選択肢。

---

### GameState

```ts
export type GameState = {
  deck: Card[];
  dealerHand: Card[];
  humanHand: Card[];
  aiHand: Card[];
  currentTurn: "human" | "ai" | "dealer" | "judge";
  winner?: WinnerResult;
  logs: string[];
};
```

| フィールド | 型 | 説明 |
|---|---|---|
| `deck` | `Card[]` | 残りのデッキ |
| `dealerHand` | `Card[]` | ディーラーの手札 |
| `humanHand` | `Card[]` | Human プレイヤーの手札 |
| `aiHand` | `Card[]` | AI プレイヤーの手札 |
| `currentTurn` | union | 現在のフェーズ |
| `winner` | `WinnerResult?` | 勝者 (ゲーム終了後に確定) |
| `logs` | `string[]` | ゲームログ |

---

## 設計判断

### WinnerResult の再利用

`winner` フィールドの型には `"human" | "ai" | "dealer" | "draw"` を定義するのではなく、
`src/domain/engines/blackjackRuleEngine.ts` で既に定義済みの `WinnerResult` を import して再利用する。

重複定義を避け、Domain Layer との型整合性を保証するため。

### Hand 型を使わない理由

Domain Layer の `Hand` 型 (`{ readonly cards: Card[] }`) は使わず、
`Card[]` をフラットに持つ設計とする。

LangGraph の State は JSON シリアライズされるシンプルなデータ構造が適切であるため。
