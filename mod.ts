import { oakCors } from "cors/mod.ts";
import { Application, Router } from "oak/mod.ts";
import { Logger } from "./logger.ts";
import {
  checkInference as checkPropInference,
  parseInference as parsePropInference,
  showInference as showPropInference,
} from "./prop/mod.ts";

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
      const reqInference = request.url.searchParams.get("inference");
      if (reqInference === null) {
        response.status = 400;
        Logger.debug(`?inference is missing for prop logic.`);
        return;
      }
      const inference = parsePropInference(reqInference);
      if (inference === null) {
        response.status = 400;
        Logger.debug(`"${reqInference}" is not correct form inference in prop logic.`);
        return;
      }
      const { tableau, valid } = checkPropInference(inference);
      Logger.debug(`"${showPropInference(inference)}" is ${valid ? "valid" : "invalid"} in prop logic.`);
      response.body = { inference, tableau, valid };
      return;
    }
  }
});
app.use(router.routes());
app.use(router.allowedMethods());
app.use(oakCors());

Logger.info(`Start listening`);
await app.listen({ port: 8080 });
