import "dotenv/config";
import { createBlackjackGraph } from "./application/graph/blackjack.graph.js";
import { CLIUI } from "./presentation/cli/cliUI.js";

const ui = new CLIUI();
const graph = createBlackjackGraph(ui);
await graph.invoke({});
