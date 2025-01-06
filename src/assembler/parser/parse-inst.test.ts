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
    isWordBased: true,
    label: "xyz",
  });

  assertEquals(parseOperand("!@xyz", ctx), {
    type: "label",
    isPseudo: true,
    isWordBased: true,
    label: "xyz",
  });

  assertEquals(parseOperand("xyz", ctx), {
    type: "label",
    isPseudo: false,
    isWordBased: false,
    label: "xyz",
  });

  assertEquals(parseOperand("!xyz", ctx), {
    type: "label",
    isPseudo: true,
    isWordBased: false,
    label: "xyz",
  });
});

const ctx = { lineIndex: 0, lineSource: "" };

Deno.test("parseInstruction add", () => {
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
});

Deno.test("parseInstruction unknown", () => {
  assertThrows(
    () => {
      parseInstruction("unknwon x0,x1,x2", ctx);
    },
    ErrorWithLineContext,
    "Unrecognised opcode mnemonic 'unknwon'",
  );
});

Deno.test("parseInstruction st", () => {
  assertEquals({ ...parseInstruction("st x1,!@pdx1", ctx), info: null }, {
    op: "st",
    operands: [
      {
        registerIndex: 1,
        type: "register",
      },
      {
        isPseudo: true,
        isWordBased: true,
        label: "pdx1",
        type: "label",
      },
    ],
    info: null,
  });
});
