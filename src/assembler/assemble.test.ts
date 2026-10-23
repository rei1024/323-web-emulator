import { assertEquals, test } from "../deps_test.ts";
import fs from "node:fs/promises";
import {
  b3s23Asm,
  b3s23MachineCode,
  expMachineCode,
  getExpAsm,
  getMovementDemoAsm,
  movementDemoMachineCode,
  sortMachineCode,
  sqrtMachineCode,
  textAsm,
  textMachineCode,
} from "../test/data.ts";
import { assemble } from "./assemble.ts";
import { ErrorWithLineContext } from "./core.ts";

/**
 * Split 32 bits number to lower 16 bits and upper 16 bits
 */
function split(u32: number): [lower: number, upper: number] {
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

test("assemble exp", () => {
  correct(getExpAsm(), expMachineCode);
});

test("assemble movement-demo", () => {
  correct(getMovementDemoAsm(), movementDemoMachineCode);
});

test("assemble b3s23", () => {
  // Lua removes trailing zero
  const buf = new Uint32Array(b3s23MachineCode.length + 33 + 5);
  buf.set(b3s23MachineCode);
  correct(b3s23Asm(), buf);
});

test("assemble text", () => {
  correct(textAsm, textMachineCode);
});

test("assemble sort", async () => {
  const sortAsm = await fs.readFile("./static/program/sort.323", "utf-8");
  // Lua removes trailing zero
  const buf = new Uint32Array(sortMachineCode.length + 32);
  buf.set(sortMachineCode);
  correct(sortAsm, buf);
});

test("assemble sqrt", async () => {
  const sqrtAsm = await fs.readFile("./static/program/sqrt.323", "utf-8");
  correct(sqrtAsm, sqrtMachineCode);
});

test("assemble programs", async () => {
  const dir = "./static/program/";
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isFile()) {
      if (!file.name.endsWith(".323")) {
        continue;
      }
      const src = await fs.readFile(dir + file.name, "utf-8");
      try {
        assemble(src);
      } catch (error) {
        throw new Error("Assemble name = " + file.name, { cause: error });
      }
    }
  }
});
