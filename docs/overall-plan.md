# Overall Implementation Plan

LangGraph Blackjack Agent の実装計画。
各ステップはコミット単位を想定している。

---

## 進捗サマリー

| Step    | 内容                                 | 状態       |
| ------- | ------------------------------------ | ---------- |
| Step 1  | プロジェクト初期化                   | [x] 完了   |
| Step 2  | Domain Layer                         | [ ] 未着手 |
| Step 3  | GameState 型定義                     | [ ] 未着手 |
| Step 4  | Presentation Layer (CLI UI)          | [ ] 未着手 |
| Step 5  | LangGraph Graph 骨格                 | [ ] 未着手 |
| Step 6  | LangGraph ノード実装 (Deterministic) | [ ] 未着手 |
| Step 7  | Infrastructure Layer                 | [ ] 未着手 |
| Step 8  | AI Agent 実装                        | [ ] 未着手 |
| Step 9  | aiTurn ノード実装                    | [ ] 未着手 |
| Step 10 | 統合・整理                           | [ ] 未着手 |

---

## Step 1: プロジェクト初期化

> 目的: 開発環境を整える。依存ライブラリのインストールとディレクトリ構成の作成。

- [x] `pnpm init` でプロジェクト初期化
- [x] TypeScript インストール・`tsconfig.json` 設定
- [x] Biome インストール・設定 (`biome.json`)
- [x] dotenv インストール・`.env.example` 作成
- [x] zod インストール
- [x] `src/` 以下のディレクトリ構成を作成
  - [x] `src/application/graph/`
  - [x] `src/application/nodes/`
  - [x] `src/domain/engines/`
  - [x] `src/agents/`
  - [x] `src/presentation/interfaces/`
  - [x] `src/presentation/cli/`
  - [x] `src/infrastructure/llm/`
  - [x] `src/prompts/`
  - [x] `src/tools/`
  - [x] `src/types/`
- [x] `src/index.ts` エントリポイント作成 (空)
- [x] `package.json` の scripts 設定 (`dev`, `build`, `lint`, `format`)

---

## Step 2: Domain Layer

> 目的: ブラックジャックのゲームロジックを LLM・UI に依存しない pure な形で実装する。
> このステップ完了時点で、ルール・点数計算・勝敗判定が単体でテスト可能になる。

### Card

- [ ] `src/domain/card.ts` 作成
  - [ ] `Suit` 型定義 (`hearts`, `diamonds`, `clubs`, `spades`)
  - [ ] `Rank` 型定義 (`A`, `2`〜`10`, `J`, `Q`, `K`)
  - [ ] `Card` 型定義

### Deck

- [ ] `src/domain/deck.ts` 作成
  - [ ] 52枚のデッキ生成関数
  - [ ] シャッフル関数

### Hand

- [ ] `src/domain/hand.ts` 作成
  - [ ] `Hand` 型定義
  - [ ] カードを手札に加える関数

### BlackjackRuleEngine

- [ ] `src/domain/engines/blackjackRuleEngine.ts` 作成
  - [ ] スコア計算 (Ace は 1 or 11 の最適判定)
  - [ ] bust 判定 (スコア > 21)
  - [ ] dealer rule (スコア 17 以上で stand)
  - [ ] 勝敗判定 (`human` / `ai` / `dealer` / `draw`)

---

## Step 3: GameState 型定義

> 目的: LangGraph の State スキーマを確定させる。
> 全レイヤーが参照する中心的な型定義。

- [ ] `src/types/gameState.ts` 作成
  - [ ] `Card` 型のインポート
  - [ ] `GameState` 型定義
    - [ ] `deck: Card[]`
    - [ ] `dealerHand: Card[]`
    - [ ] `humanHand: Card[]`
    - [ ] `aiHand: Card[]`
    - [ ] `currentTurn: "human" | "ai" | "dealer" | "judge"`
    - [ ] `winner?: "human" | "ai" | "dealer" | "draw"`
    - [ ] `logs: string[]`
  - [ ] `PlayerAction` 型定義 (`"hit"` | `"stand"`)

---

## Step 4: Presentation Layer (CLI UI)

> 目的: UI を抽象化し、CLI 実装を作成する。
> このステップ完了時点で、UI 層のインターフェースが確定し差し替え可能な構造になる。

### GameUI Interface

- [ ] `src/presentation/interfaces/gameUI.ts` 作成
  - [ ] `GameUI` interface 定義
    - [ ] `renderState(state: GameState): void`
    - [ ] `askPlayerAction(): Promise<PlayerAction>`
    - [ ] `showMessage(message: string): void`

### CLIUI

- [ ] `src/presentation/cli/cliUI.ts` 作成
  - [ ] `CLIUI implements GameUI` 実装
  - [ ] `renderState`: カード・スコアを整形してコンソール表示
  - [ ] `askPlayerAction`: readline でユーザー入力受付 (`hit` / `stand`)
  - [ ] `showMessage`: コンソールへのメッセージ出力

---

## Step 5: LangGraph Graph 骨格

> 目的: LangGraph の StateGraph を構築し、ノード遷移の骨格を作る。
> 各ノードはスタブ実装とし、start → end まで graph が流れることを確認する。

- [ ] `src/application/graph/blackjack.graph.ts` 作成
  - [ ] `StateGraph` の定義 (`GameState` をスキーマとして使用)
  - [ ] 各ノードをスタブ関数として登録
    - [ ] `dealInitialCards`
    - [ ] `humanTurn`
    - [ ] `aiTurn`
    - [ ] `dealerTurn`
    - [ ] `judge`
  - [ ] ノード間の遷移 (edge) を定義
  - [ ] graph のコンパイル (`graph.compile()`)
- [ ] `src/index.ts` から graph を呼び出して動作確認

---

## Step 6: LangGraph ノード実装 (Deterministic 部分)

> 目的: LLM を使わないノードをすべて実装し、Human vs Dealer のゲームを動作させる。
> **このステップ完了時点で、CLI 上でゲームとして遊べる状態になる (マイルストーン 1)。**

- [ ] `src/application/nodes/dealInitialCards.ts` 実装
  - [ ] デッキ生成・シャッフル
  - [ ] プレイヤー・AI・ディーラーへ 2 枚ずつ配布
  - [ ] `GameState` 更新

- [ ] `src/application/nodes/humanTurn.ts` 実装
  - [ ] `CLIUI.askPlayerAction()` で入力受付
  - [ ] `hit` → カードを引く
  - [ ] `stand` → ターン終了
  - [ ] bust 判定・ターン管理

- [ ] `src/application/nodes/dealerTurn.ts` 実装
  - [ ] dealer rule に従い自動進行 (スコア 17 以上で stand)
  - [ ] `BlackjackRuleEngine` を使用

- [ ] `src/application/nodes/judge.ts` 実装
  - [ ] `BlackjackRuleEngine` で勝敗判定
  - [ ] `GameState.winner` を更新
  - [ ] 結果を `CLIUI.showMessage()` で表示

- [ ] graph の条件分岐 (bust 時のショートカットなど) を実装
- [ ] `aiTurn` を一時的にスキップする遷移を設定
- [ ] Human vs Dealer で動作確認

---

## Step 7: Infrastructure Layer

> 目的: OpenAI API との接続を確立する。

- [ ] `src/infrastructure/llm/geminiClient.ts` 作成
  - [ ] LangChain の `ChatGoogleGenerativeAI` インスタンス設定
  - [ ] モデル (`gemini-2.0-flash` 等)・temperature などの設定
- [ ] `.env` に `GOOGLE_API_KEY` を設定
- [ ] API 疎通確認 (簡単なスクリプトで接続テスト)

---

## Step 8: AI Agent 実装

> 目的: LLM が tool calling で hit/stand を判断する AI プレイヤーを実装する。

### Tools

- [ ] `src/tools/hit.ts` 作成
  - [ ] LangChain tool 形式で `hit` 定義
- [ ] `src/tools/stand.ts` 作成
  - [ ] LangChain tool 形式で `stand` 定義

### Prompt

- [ ] `src/prompts/blackjackPlayerPrompt.ts` 作成
  - [ ] AI にルールを教えない設計
  - [ ] 渡す情報: 自分のカード、ディーラーのオープンカード、利用可能アクション
  - [ ] 例:
    ```
    Available actions: hit, stand
    Your cards: 10, 6
    Dealer open card: 9
    ```

### AIAgentPlayer

- [ ] `src/agents/aiAgentPlayer.ts` 作成
  - [ ] `openaiClient` に `hit` / `stand` tools をバインド
  - [ ] `GameState` からプロンプトを生成
  - [ ] LLM に tool calling させて `hit` / `stand` を返す
  - [ ] structured output / zod で返り値を型安全に処理

---

## Step 9: aiTurn ノード実装

> 目的: AI Agent を graph に組み込み、Human vs AI vs Dealer の完全な MVP を完成させる。
> **このステップ完了時点で MVP 完成 (マイルストーン 2)。**

- [ ] `src/application/nodes/aiTurn.ts` 実装
  - [ ] `AIAgentPlayer` を呼び出して hit/stand を決定
  - [ ] `hit` → カードを引く
  - [ ] `stand` → ターン終了
  - [ ] bust 判定・ターン管理
- [ ] graph の `aiTurn` スキップ設定を解除し、正式に組み込む
- [ ] Human vs AI vs Dealer でエンドツーエンド動作確認

---

## Step 10: 統合・整理

> 目的: コードを整理し、MVP として安定した状態にする。

- [ ] `src/application/gameMaster.ts` 作成
  - [ ] graph の初期化・実行管理
  - [ ] ゲームループ (再戦対応)
  - [ ] エラーハンドリング
- [ ] `src/index.ts` を `GameMaster` 経由で起動するよう整備
- [ ] ログ出力 (`GameState.logs`) の整理
- [ ] Biome による lint / format の最終確認
- [ ] `README.md` にセットアップ・起動手順を記載

---

## マイルストーン

| マイルストーン     | 達成条件                                                       |
| ------------------ | -------------------------------------------------------------- |
| M1: CLI ゲーム動作 | Step 6 完了。LLM なしで Human vs Dealer が CLI 上で動く        |
| M2: MVP 完成       | Step 9 完了。LangGraph + AI Agent が動く Human vs AI vs Dealer |
