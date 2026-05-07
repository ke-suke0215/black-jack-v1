import "dotenv/config";
import { graph } from "./application/graph/blackjack.graph.js";

const result = await graph.invoke({});

console.log("\n=== Game finished ===");
console.log("Winner:", result.winner);
console.log("Logs:");
for (const log of result.logs) {
  console.log(" -", log);
}
