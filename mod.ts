import { oakCors } from "cors/mod.ts";
import { Application, Router } from "oak/mod.ts";
import { Logger } from "./logger.ts";
import { createFirstBranch, toBranch } from "./propositional/branch.ts";
import { parseFormula } from "./propositional/parse.ts";

const app = new Application();
const router = new Router();

router.get("/solve", ({ request, response }) => {
  const formula = request.url.searchParams.get("formula");
  if (formula === null) {
    response.status = 400;
    Logger.debug(`/solve formula is missing`);
    return;
  }
  Logger.debug(`/solve given formula is ${formula}`);
  const parsed = parseFormula(formula);
  if (parsed === null) {
    response.status = 400;
    Logger.debug(`/solve ${parsed} cannot be parsed.`);
    return;
  }

  const branch = toBranch(
    createFirstBranch({ type: "NOT", in: parsed }),
  );

  response.body = branch;
  return;
});
app.use(router.routes());
app.use(router.allowedMethods());
app.use(oakCors());

Logger.info(`Start listening`);
await app.listen({ port: 8080 });
