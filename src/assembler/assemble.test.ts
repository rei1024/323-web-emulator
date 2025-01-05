import { assertEquals } from "@std/assert/equals";
import { expAsm, expMachineCode } from "../test/data.ts";
import { assemble } from "./assemble.ts";

Deno.test.ignore("assemble exp", () => {
  assertEquals(assemble(expAsm), expMachineCode);
});
