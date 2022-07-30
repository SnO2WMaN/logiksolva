import { Application, Router } from "oak/mod.ts";
import { Logger } from "./logger.ts";
import { createFirstBranch, toBranch } from "./propositional/branch.ts";
import { mkConstructiveDilemma, mkModusPonens } from "./propositional/tautology.ts";
import { oakCors } from "cors/mod.ts";

const app = new Application();
const router = new Router();

router.get("/solve", (context) => {
  Logger.debug(`access`);
  const branch = toBranch(
    createFirstBranch({
      type: "NOT",
      in: mkConstructiveDilemma(
        mkModusPonens({ type: "PROP", id: "P" }, { type: "PROP", id: "Q" }),
        mkModusPonens({ type: "PROP", id: "R" }, { type: "PROP", id: "S" }),
        mkModusPonens({ type: "PROP", id: "T" }, { type: "PROP", id: "U" }),
      ),
    }),
  );

  context.response.body = branch;
  return;
});
app.use(router.routes());
app.use(router.allowedMethods());
app.use(oakCors());

Logger.debug(`Start listening`);
await app.listen({ port: 8080 });
