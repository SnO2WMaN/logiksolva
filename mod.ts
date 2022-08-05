import { oakCors } from "cors/mod.ts";
import { Application, Router } from "oak/mod.ts";
import { Logger } from "./logger.ts";
import { evalBranch } from "./prop/branch.ts";
import { findTopOrBot } from "./prop/find_top_or_bot.ts";
import { parseFormula } from "./prop/parser.ts";

const app = new Application();
const router = new Router();

router.get("/solve", ({ request, response }) => {
  const reqFormula = request.url.searchParams.get("formula");
  if (reqFormula === null) {
    response.status = 400;
    Logger.debug(`/solve formula is missing`);
    return;
  }
  Logger.debug(`/solve given formula is ${reqFormula}`);
  const formula = parseFormula(reqFormula);
  if (formula === null) {
    response.status = 400;
    Logger.debug(`/solve ${formula} cannot be parsed.`);
    return;
  }

  const branch = evalBranch({ stack: [["NOT", formula]], nodes: [], skip: [], props: {}, junction: null });
  const valid = findTopOrBot(branch) === false;

  response.body = { branch, valid };
  return;
});
app.use(router.routes());
app.use(router.allowedMethods());
app.use(oakCors());

Logger.info(`Start listening`);
await app.listen({ port: 8080 });
