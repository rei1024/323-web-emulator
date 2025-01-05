import { assertEquals } from "@std/assert";
import {
  I_ADD,
  I_HLT,
  I_JMPI,
  I_LDI,
  I_OUT,
  I_SUB,
} from "./instruction-const.ts";
import {
  type AddInstruction,
  decodeInstruction,
  encodeInstruction,
  stringifyInstruction,
  type SubInstruction,
} from "./instruction.ts";

Deno.test("stringifyInstruction sub", () => {
  const instruction: SubInstruction = {
    type: I_SUB,
    xX: 0,
    xY: 1,
    xZ: 2,
  };
  const stringified = stringifyInstruction(instruction);
  // reversed
  assertEquals(stringified, "sub x1,x0,x2");
});

Deno.test("encodeInstruction add", () => {
  const instruction: AddInstruction = {
    type: I_ADD,
    xX: 0,
    xY: 1,
    xZ: 2,
  };
  const encoded = encodeInstruction(instruction);
  assertEquals(encoded, [0x012]);
});

Deno.test("encodeInstruction sub", () => {
  const instruction: SubInstruction = {
    type: I_SUB,
    xX: 0,
    xY: 1,
    xZ: 2,
  };
  const encoded = encodeInstruction(instruction);
  assertEquals(encoded, [0x1012]);
});

Deno.test("decodeInstruction add", () => {
  const encoded = 0x0123;
  const decoded = decodeInstruction(encoded, () => {
    throw new Error();
  }, () => {
    throw new Error();
  });

  assertEquals(decoded, {
    inst: {
      type: I_ADD,
      xX: 1,
      xY: 2,
      xZ: 3,
    },
    hwordCount: 1,
  });

  assertEquals(encodeInstruction(decoded.inst), [encoded]);
});

Deno.test("decodeInstruction JMPI", () => {
  const encoded = 0xe000;
  const imm16 = 0xb;
  const decoded = decodeInstruction(encoded, () => imm16, () => 0xc);

  const expected = [encoded, imm16];

  assertEquals(decoded, {
    inst: {
      type: I_JMPI,
      imm16: imm16,
    },
    hwordCount: expected.length,
  });

  const reencoded = encodeInstruction(decoded.inst);

  assertEquals(reencoded, expected);
  assertEquals(decoded.hwordCount, expected.length);
});

Deno.test("decodeInstruction LDI", () => {
  const encoded = 0xe015;
  const imm16 = 0xb;
  const imm16Lower = 0xc;
  const decoded = decodeInstruction(encoded, () => imm16, () => imm16Lower);

  const expected = [encoded, imm16, imm16Lower];
  assertEquals(decoded, {
    inst: {
      type: I_LDI,
      // least significant 16 bits first
      imm32: imm16Lower << 16 | imm16,
      xZ: 5,
    },
    hwordCount: expected.length,
  });

  const reencoded = encodeInstruction(decoded.inst);
  assertEquals(reencoded, expected);
  assertEquals(decoded.hwordCount, expected.length);
});

Deno.test("decodeInstruction OUT", () => {
  const encoded = 0xa231;
  const decoded = decodeInstruction(encoded, () => {
    throw new Error();
  }, () => {
    throw new Error();
  });

  const expected = [encoded];
  assertEquals(decoded, {
    inst: {
      type: I_OUT,
      xX: 2,
      xY: 3,
    },
    hwordCount: expected.length,
  });

  const reencoded = encodeInstruction(decoded.inst);
  assertEquals(reencoded, expected);
  assertEquals(decoded.hwordCount, expected.length);
});

Deno.test("decodeInstruction hlt", () => {
  const encoded = 0xeeee;
  const decoded = decodeInstruction(encoded, () => {
    throw new Error();
  }, () => {
    throw new Error();
  });

  const expected = [encoded];
  assertEquals(decoded, {
    inst: {
      type: I_HLT,
    },
    hwordCount: expected.length,
  });

  const reencoded = encodeInstruction(decoded.inst);
  assertEquals(reencoded, expected);
  assertEquals(decoded.hwordCount, expected.length);
});
