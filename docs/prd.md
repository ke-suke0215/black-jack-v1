# LangGraph Blackjack Agent

## 概要

LangGraph を学習するためのサンプルアプリケーションとして、
ブラックジャックを題材にした AI エージェントアプリを構築する。

このアプリケーションは最終的に Web UI を持つことを前提とする。

ただし、初期段階では MVP として CLI ベースで実装する。

そのため、
ゲームのコアロジックとユーザーインターフェースを明確に分離した設計を採用する。

---

# このアプリの目的

これは単なるブラックジャックアプリではない。

以下を学習するための教材として設計する。

- LangGraph
- StateGraph
- Agent orchestration
- Human-in-the-loop
- Tool Calling
- Structured Output
- Deterministic Logic と LLM Logic の分離
- UI と Domain の分離
- Workflow 設計

---

# 技術スタック

## 前提

TypeScript を中心とした Fullstack JavaScript 構成を採用する。

将来的な Web UI 化を前提に、
サーバ・フロント・AI Workflow を TypeScript で統一する。

---

# Core

## Runtime

- Node.js

## Package Manager

- pnpm

## Language

- TypeScript

---

# AI / Agent

## LangGraph

Graph ベース workflow orchestration。

## LangChain

LLM integration / tool calling。

## OpenAI API

LLM provider。

---

# Frontend（将来）

## Remix

Web UI framework。

理由:

- Fullstack TypeScript
- Loader / Action ベース構成
- Server integration が自然
- React Router v7 系統との親和性

## React

UI rendering。

## Tailwind CSS

UI styling。

## shadcn/ui

UI component library。

---

# Validation / Utility

## zod

schema validation。

用途:

- LLM structured output
- tool input validation
- domain validation

---

# Development Tooling

## Biome

formatter / linter。

ESLint + Prettier の代替。

## dotenv

environment variable management。

---

# 将来的な選択肢

## WebSocket

リアルタイム対戦対応。

## PostgreSQL

試合履歴保存。

## Redis

game session 管理。

---

# 技術スタック選定理由

---

# なぜ TypeScript か

## 理由

### LangGraph JS ecosystem が強い

LangGraph は Python と JS が存在するが、
今回は Web UI 統合まで考慮し TypeScript を採用する。

---

### Frontend と統一できる

最終的に以下を TypeScript で統一可能。

```txt
Frontend
Backend
LangGraph
Domain
```

---

### zod との相性

LLM structured output を型安全に扱いやすい。

---

# なぜ LangGraph か

ブラックジャックは状態遷移が明確なため、
StateGraph 学習に非常に向いている。

```txt
state
↓
action
↓
next state
```

---

# なぜ CLI から始めるか

Web UI を先に作ると、
本質的でない UI 実装に時間を使いやすい。

まずは以下へ集中する。

- graph 設計
- state 管理
- orchestration
- agent loop

---

# 設計方針

## 最重要方針

### UI とゲームロジックを分離する

ゲーム進行やルールは UI に依存させない。

CLI はあくまで「入力/表示手段」の 1 つとして扱う。

将来的に以下へ置き換え可能な構造にする。

- Web UI
- API Server
- Discord Bot
- Slack Bot
- Multiplayer Server

---

# アーキテクチャ

## レイヤ構成

```txt
+----------------------+
| Presentation Layer   |
|----------------------|
| CLI UI               |
| (future: Web UI)     |
+----------------------+

+----------------------+
| Application Layer    |
|----------------------|
| GameMaster           |
| LangGraph Workflow   |
+----------------------+

+----------------------+
| Domain Layer         |
|----------------------|
| BlackjackRuleEngine  |
| Card                 |
| Deck                 |
| Hand                 |
+----------------------+

+----------------------+
| Infrastructure Layer |
|----------------------|
| OpenAI API           |
| LangChain            |
+----------------------+
```

---

# レイヤ責務

---

# Presentation Layer

UI を担当する。

初期段階では CLI。

将来的に React / Remix ベース Web UI を追加する。

## 責務

- ユーザー入力
- 画面表示
- 状態描画

## やらないこと

- 点数計算
- ゲーム進行
- 勝敗判定
- AI ロジック

---

# Application Layer

ゲーム進行を担当する。

LangGraph はこのレイヤに配置する。

## 責務

- ターン管理
- phase 管理
- workflow orchestration
- graph state 更新
- node 遷移

## 中心コンポーネント

### GameMaster

ゲーム進行管理。

### LangGraph

ゲームフロー管理。

---

# Domain Layer

ブラックジャックのルールを管理する。

完全 deterministic に設計する。

## 責務

- 点数計算
- bust 判定
- dealer ルール
- 勝敗判定
- カード操作

## 特徴

LLM に依存しない。

---

# Infrastructure Layer

外部サービスとの接続。

## 責務

- OpenAI API
- LangChain
- Logging
- Persistence（将来）

---

# コンポーネント設計

## GameMaster

ゲーム全体の進行を管理する。

### 責務

- ゲーム開始
- カード配布
- turn 管理
- phase 管理
- graph state 更新
- 次 node 決定

### やらないこと

- 点数計算
- bust 判定
- AI 意思決定

---

## BlackjackRuleEngine

ブラックジャックルールを deterministic に処理する。

### 責務

- score calculation
- Ace 判定
- dealer rule
- bust 判定
- 勝敗判定

### 特徴

完全 pure function に近づける。

---

## HumanPlayer

ユーザー入力抽象。

CLI 実装はここに属する。

将来的には Web UI 実装へ差し替え可能にする。

---

## AIAgentPlayer

LLM ベース AI プレイヤー。

### 責務

- 状態理解
- hit / stand 判断
- tool 呼び出し

### AI に持たせないもの

- ゲームルール
- 点数計算
- 勝敗判定
- turn 管理

---

# UI 抽象化

## 重要方針

CLI 固定の設計にしない。

---

# 悪い例

```ts
console.log("Player turn");
```

GameMaster 内に UI を書く。

---

# 良い例

```ts
ui.renderGameState(state);
```

UI レイヤを抽象化する。

---

# UI Interface 例

```ts
interface GameUI {
  renderState(state: GameState): void;

  askPlayerAction(): Promise<PlayerAction>;

  showMessage(message: string): void;
}
```

---

# CLI 実装

```ts
class CLIUI implements GameUI
```

---

# 将来的な Web UI 実装

```ts
class WebSocketUI implements GameUI
```

または

```txt
Frontend (React)
↓
API
↓
GameMaster
```

---

# LangGraph 構成

## Graph

```txt
start
  ↓
deal_initial_cards
  ↓
human_turn
  ↓
ai_turn
  ↓
dealer_turn
  ↓
judge
  ↓
end
```

---

# State

```ts
type GameState = {
  deck: Card[];

  dealerHand: Card[];

  humanHand: Card[];
  aiHand: Card[];

  currentTurn: "human" | "ai" | "dealer" | "judge";

  winner?: "human" | "ai" | "dealer" | "draw";

  logs: string[];
};
```

---

# Tool Calling

AI に与える tool は限定する。

## tools

- hit()
- stand()

---

# Prompt 設計

## 重要方針

AI にルールを理解させない。

---

# 悪い例

```txt
ブラックジャックをプレイしてください
```

---

# 良い例

```txt
Available actions:
- hit
- stand

Your cards:
- 10
- 6

Dealer open card:
- 9
```

---

# ディレクトリ構成例

```txt
src/
  application/
    gameMaster.ts

    graph/
      blackjack.graph.ts

    nodes/
      dealInitialCards.ts
      humanTurn.ts
      aiTurn.ts
      dealerTurn.ts
      judge.ts

  domain/
    card.ts
    deck.ts
    hand.ts

    engines/
      blackjackRuleEngine.ts

  agents/
    aiAgentPlayer.ts

  presentation/
    interfaces/
      gameUI.ts

    cli/
      cliUI.ts

    future-web/
      webUI.ts

  infrastructure/
    llm/
      openaiClient.ts

  prompts/
    blackjackPlayerPrompt.ts

  tools/
    hit.ts
    stand.ts

  types/
    gameState.ts

  index.ts
```

---

# MVP スコープ

## 実装するもの

- CLI UI
- Human vs AI
- hit / stand
- dealer rule
- 勝敗判定
- LangGraph workflow

---

# 実装しないもの

## ゲーム機能

- 賭け
- チップ
- スプリット
- ダブルダウン
- 保険

## システム機能

- DB
- 認証
- WebSocket
- マルチルーム

---

# 設計思想

## Deterministic と LLM を分離する

### deterministic

- ルール
- 点数計算
- 勝敗

### LLM

- 意思決定のみ
