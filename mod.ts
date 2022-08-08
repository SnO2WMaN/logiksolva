import { oakCors } from "cors/mod.ts";
import { Application, Router } from "oak/mod.ts";
import { Logger } from "./logger.ts";
import { evalBranch, findTB, parseFormula, show } from "./prop/mod.ts";

const app = new Application();
const router = new Router();

export type LogicType = "prop";
export const isLogicType = (type: string): type is LogicType => ["prop"].includes(type);

router.get("/solve", ({ request, response }) => {
  const reqLogic = request.url.searchParams.get("logic");
  if (!reqLogic) {
    response.status = 400;
    Logger.debug(`?logic is missing.`);
    return;
  } else if (!isLogicType(reqLogic)) {
    response.status = 400;
    Logger.debug(`?logic must be "prop" but given is "${reqLogic}".`);
    return;
  }

  switch (reqLogic) {
    case "prop": {
      const reqFormula = request.url.searchParams.get("formula");
      if (reqFormula === null) {
        response.status = 400;
        Logger.debug(`?formula is missing for prop logic.`);
        return;
      }
      const formula = parseFormula(reqFormula);
      if (formula === null) {
        response.status = 400;
        Logger.debug(`"${reqFormula}" is not correct form formula in prop logic.`);
        return;
      }
      const branch = evalBranch({ stack: [["NOT", formula]], nodes: [], skip: [], props: {}, junction: null });
      const valid = findTB(branch, "TOP") === false;
      Logger.debug(`"${show(formula)}" is ${valid ? "valid" : "invalid"} in prop logic.`);

      response.body = { formula, branch, valid };
      return;
    }
  }
});
app.use(router.routes());
app.use(router.allowedMethods());
app.use(oakCors());

Logger.info(`Start listening`);
await app.listen({ port: 8080 });
