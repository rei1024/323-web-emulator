import { assertEquals } from "@std/assert/equals";
import { parseInstruction, parseOperand } from "./parse-inst.ts";
import { assertThrows } from "@std/assert/throws";
import { ErrorWithLineContext } from "../core.ts";

Deno.test("parseOperand", () => {
  const ctx = { lineIndex: 0, lineSource: "" };

  assertEquals(parseOperand("123", ctx), { type: "immediate", value: 123 });
  assertEquals(parseOperand("-1", ctx), {
    type: "immediate",
    value: 4294967295,
  });
  assertEquals(parseOperand("0xabc", ctx), { type: "immediate", value: 0xabc });

  assertEquals(parseOperand("!123", ctx), {
    type: "pseudo-immediate",
    value: 123,
  });
  assertEquals(parseOperand("xA", ctx), {
    type: "register",
    index: 0xA,
  });

  assertEquals(parseOperand("@xyz", ctx), {
    type: "label",
    label: "xyz",
  });

  assertEquals(parseOperand("!@xyz", ctx), {
    type: "pseudo-immediate-label",
    label: "xyz",
  });
});

Deno.test("parseInstruction", () => {
  const ctx = { lineIndex: 0, lineSource: "" };

  assertEquals({ ...parseInstruction("add x0,x1,x2", ctx), info: null }, {
    op: "add",
    operands: [
      {
        index: 0,
        type: "register",
      },
      {
        index: 1,
        type: "register",
      },
      {
        index: 2,
        type: "register",
      },
    ],
    info: null,
  });

  assertThrows(
    () => {
      parseInstruction("unknwon x0,x1,x2", ctx);
    },
    ErrorWithLineContext,
    "Unrecognised opcode mnemonic 'unknwon'",
  );
});
