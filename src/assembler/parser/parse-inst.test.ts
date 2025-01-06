import { assertEquals } from "@std/assert/equals";
import { parseInstruction, parseOperand } from "./parse-inst.ts";
import { assertThrows } from "@std/assert/throws";
import { ErrorWithLineContext } from "../core.ts";

Deno.test("parseOperand", () => {
  const ctx = { lineIndex: 0, lineSource: "" };

  assertEquals(parseOperand("123", ctx), {
    type: "immediate",
    isPseudo: false,
    value: 123,
  });
  assertEquals(parseOperand("-1", ctx), {
    type: "immediate",
    isPseudo: false,
    value: 4294967295,
  });
  assertEquals(parseOperand("0xabc", ctx), {
    type: "immediate",
    isPseudo: false,
    value: 0xabc,
  });

  assertEquals(parseOperand("!123", ctx), {
    type: "immediate",
    isPseudo: true,
    value: 123,
  });
  assertEquals(parseOperand("xA", ctx), {
    type: "register",
    registerIndex: 0xA,
  });

  assertEquals(parseOperand("@xyz", ctx), {
    type: "label",
    isPseudo: false,
    is32: true,
    label: "xyz",
  });

  assertEquals(parseOperand("!@xyz", ctx), {
    type: "label",
    isPseudo: true,
    is32: true,
    label: "xyz",
  });

  assertEquals(parseOperand("xyz", ctx), {
    type: "label",
    isPseudo: false,
    is32: false,
    label: "xyz",
  });

  assertEquals(parseOperand("!xyz", ctx), {
    type: "label",
    isPseudo: true,
    is32: false,
    label: "xyz",
  });
});

Deno.test("parseInstruction", () => {
  const ctx = { lineIndex: 0, lineSource: "" };

  assertEquals({ ...parseInstruction("add x0,x1,x2", ctx), info: null }, {
    op: "add",
    operands: [
      {
        registerIndex: 0,
        type: "register",
      },
      {
        registerIndex: 1,
        type: "register",
      },
      {
        registerIndex: 2,
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
