import { assertEquals } from "@std/assert/equals";
import { expAsm, expMachineCode } from "../test/data.ts";
import { assemble } from "./assemble.ts";
import { ErrorWithLineContext } from "./core.ts";

Deno.test("assemble exp", () => {
  try {
    assertEquals(
      [...assemble(expAsm)].map((x) => x.toString(16).padStart(8, "0")),
      [...expMachineCode].map((x) => x.toString(16).padStart(8, "0")),
    );
  } catch (error) {
    if (error instanceof ErrorWithLineContext) {
      error.message = error.message + " Ctx:" + JSON.stringify(error.ctx);
      throw error;
    }
    throw error;
  }
});
