import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import type { Card } from "../../domain/card.js";
import type { WinnerResult } from "../../domain/engines/blackjackRuleEngine.js";

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

type BlackjackState = typeof BlackjackStateAnnotation.State;

// Stub nodes (Step 6 で実装予定)

function dealInitialCards(_state: BlackjackState): Partial<BlackjackState> {
  console.log("[stub] dealInitialCards");
  return { currentTurn: "human", logs: ["[stub] Initial cards dealt"] };
}

function humanTurn(_state: BlackjackState): Partial<BlackjackState> {
  console.log("[stub] humanTurn");
  return { currentTurn: "ai", logs: ["[stub] Human turn done"] };
}

function aiTurn(_state: BlackjackState): Partial<BlackjackState> {
  console.log("[stub] aiTurn");
  return { currentTurn: "dealer", logs: ["[stub] AI turn done"] };
}

function dealerTurn(_state: BlackjackState): Partial<BlackjackState> {
  console.log("[stub] dealerTurn");
  return { currentTurn: "judge", logs: ["[stub] Dealer turn done"] };
}

function judge(_state: BlackjackState): Partial<BlackjackState> {
  console.log("[stub] judge");
  return { winner: "draw", logs: ["[stub] Judge: draw"] };
}

const workflow = new StateGraph(BlackjackStateAnnotation)
  .addNode("dealInitialCards", dealInitialCards)
  .addNode("humanTurn", humanTurn)
  .addNode("aiTurn", aiTurn)
  .addNode("dealerTurn", dealerTurn)
  .addNode("judge", judge)
  .addEdge(START, "dealInitialCards")
  .addEdge("dealInitialCards", "humanTurn")
  .addEdge("humanTurn", "aiTurn")
  .addEdge("aiTurn", "dealerTurn")
  .addEdge("dealerTurn", "judge")
  .addEdge("judge", END);

export const graph = workflow.compile();
export type { BlackjackState };
