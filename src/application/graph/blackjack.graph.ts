import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import type { Card } from "../../domain/card.js";
import type { WinnerResult } from "../../domain/engines/blackjackRuleEngine.js";
import type { GameUI } from "../../presentation/interfaces/gameUI.js";
import { aiTurn } from "../nodes/aiTurn.js";
import { dealerTurn } from "../nodes/dealerTurn.js";
import { dealInitialCards } from "../nodes/dealInitialCards.js";
import { createHumanTurnNode } from "../nodes/humanTurn.js";
import { createJudgeNode } from "../nodes/judge.js";

const BlackjackStateAnnotation = Annotation.Root({
  deck: Annotation<Card[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  dealerHand: Annotation<Card[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  humanHand: Annotation<Card[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  aiHand: Annotation<Card[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  currentTurn: Annotation<"human" | "ai" | "dealer" | "judge">({
    reducer: (_, next) => next,
    default: () => "human" as const,
  }),
  winner: Annotation<WinnerResult | undefined>({
    reducer: (_, next) => next,
    default: () => undefined,
  }),
  logs: Annotation<string[]>({
    reducer: (existing, next) => [...existing, ...next],
    default: () => [],
  }),
});

export type BlackjackState = typeof BlackjackStateAnnotation.State;

function routeAfterHumanTurn(state: BlackjackState): "humanTurn" | "aiTurn" | "judge" {
  if (state.currentTurn === "human") return "humanTurn";
  if (state.currentTurn === "judge") return "judge";
  return "aiTurn";
}

export function createBlackjackGraph(ui: GameUI) {
  const workflow = new StateGraph(BlackjackStateAnnotation)
    .addNode("dealInitialCards", dealInitialCards)
    .addNode("humanTurn", createHumanTurnNode(ui))
    .addNode("aiTurn", aiTurn)
    .addNode("dealerTurn", dealerTurn)
    .addNode("judge", createJudgeNode(ui))
    .addEdge(START, "dealInitialCards")
    .addEdge("dealInitialCards", "humanTurn")
    .addConditionalEdges("humanTurn", routeAfterHumanTurn)
    .addEdge("aiTurn", "dealerTurn")
    .addEdge("dealerTurn", "judge")
    .addEdge("judge", END);

  return workflow.compile();
}
