import { assertEquals } from "@std/assert/equals";
import {
  b3s23Asm,
  b3s23MachineCode,
  expAsm,
  expMachineCode,
  sortMachineCode,
  sqrtMachineCode,
  textAsm,
  textMachineCode,
} from "../test/data.ts";
import { assemble } from "./assemble.ts";
import { ErrorWithLineContext } from "./core.ts";
import { movementDemoAsm } from "../test/data.ts";
import { movementDemoMachineCode } from "../test/data.ts";

function split(u32: number) {
  return [u32 & 0xffff, u32 >>> 16];
}

function toHWordString(machineCode: Uint32Array): string[] {
  return [...machineCode].flatMap((x) => split(x)).map((x) =>
    x.toString(16).padStart(4, "0")
  );
}

function correct(asm: string, expectedMachineCode: Uint32Array) {
  const expected = toHWordString(expectedMachineCode);

  try {
    const assembled = toHWordString(assemble(asm).machineCode);
    assertEquals(assembled, expected);
  } catch (error) {
    if (error instanceof ErrorWithLineContext) {
      error.message = error.message + " Ctx:" + JSON.stringify(error.ctx);
      throw error;
    }
    throw error;
  }
}

Deno.test("assemble exp", () => {
  correct(expAsm, expMachineCode);
});

Deno.test("assemble movement-demo", () => {
  correct(movementDemoAsm, movementDemoMachineCode);
});

Deno.test("assemble b3s23", () => {
  // Lua removes trailing zero
  const buf = new Uint32Array(b3s23MachineCode.length + 33 + 5);
  buf.set(b3s23MachineCode);
  correct(b3s23Asm, buf);
});

Deno.test("assemble text", () => {
  correct(textAsm, textMachineCode);
});

Deno.test("assemble sort", async () => {
  const sortAsm = await Deno.readTextFile("./static/program/sort.323");
  // Lua removes trailing zero
  const buf = new Uint32Array(sortMachineCode.length + 32);
  buf.set(sortMachineCode);
  correct(sortAsm, buf);
});

Deno.test("assemble sqrt", async () => {
  const sqrtAsm = await Deno.readTextFile("./static/program/sqrt.323");
  correct(sqrtAsm, sqrtMachineCode);
});

Deno.test("assemble programs", async () => {
  const dir = "./static/program/";
  for await (const file of Deno.readDir(dir)) {
    if (file.isFile) {
      const src = new TextDecoder().decode(
        await Deno.readFile(dir + file.name),
      );
      try {
        assemble(src);
      } catch (error) {
        throw new Error("Assemble name = " + file.name, { cause: error });
      }
    }
  }
});
