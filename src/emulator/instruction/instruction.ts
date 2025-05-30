import { toUnsigned32 } from "../../util.ts";
import {
  I_ADD,
  I_AND,
  I_DIV,
  I_HLT,
  I_IN,
  I_JFI,
  I_JFR,
  I_JMPI,
  I_JMPR,
  I_JNFI,
  I_JNFR,
  I_LDI,
  I_LDR,
  I_MOD,
  I_MUL,
  I_OR,
  I_OUT,
  I_ROT,
  I_SHA,
  I_SHF,
  I_STR,
  I_SUB,
  I_XOR,
} from "./instruction-const.ts";

export interface BaseInstruction {
  type: number;
  hwordCount: number;
}

export interface AddInstruction extends BaseInstruction {
  type: typeof I_ADD;
  xX: number; // Register X
  xY: number; // Register Y
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface SubInstruction extends BaseInstruction {
  type: typeof I_SUB;
  xX: number; // Register X
  xY: number; // Register Y
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface MulInstruction extends BaseInstruction {
  type: typeof I_MUL;
  xX: number; // Register X
  xY: number; // Register Y
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface DivInstruction extends BaseInstruction {
  type: typeof I_DIV;
  xX: number; // Register X
  xY: number; // Register Y
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface ModInstruction extends BaseInstruction {
  type: typeof I_MOD;
  xX: number; // Register X
  xY: number; // Register Y
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface ShfInstruction extends BaseInstruction {
  type: typeof I_SHF;
  xX: number; // Register X
  xY: number; // Register Y
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface RotInstruction extends BaseInstruction {
  type: typeof I_ROT;
  xX: number; // Register X
  xY: number; // Register Y
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface ShaInstruction extends BaseInstruction {
  type: typeof I_SHA;
  xX: number; // Register X
  xY: number; // Register Y
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface OrInstruction extends BaseInstruction {
  type: typeof I_OR;
  xX: number; // Register X
  xY: number; // Register Y
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface AndInstruction extends BaseInstruction {
  type: typeof I_AND;
  xX: number; // Register X
  xY: number; // Register Y
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface XorInstruction extends BaseInstruction {
  type: typeof I_XOR;
  xX: number; // Register X
  xY: number; // Register Y
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface StrInstruction extends BaseInstruction {
  type: typeof I_STR;
  xX: number; // Register X
  xY: number; // RAM address
  hwordCount: 1;
}

export interface OutInstruction extends BaseInstruction {
  type: typeof I_OUT;
  xX: number; // Register X
  xY: number; // I/O pin
  hwordCount: 1;
}

export interface JmpiInstruction extends BaseInstruction {
  type: typeof I_JMPI;
  imm16: number; // Immediate value
  hwordCount: 2;
}

export interface JfiInstruction extends BaseInstruction {
  type: typeof I_JFI;
  imm16: number; // Immediate value
  hwordCount: 2;
}

export interface JnfiInstruction extends BaseInstruction {
  type: typeof I_JNFI;
  imm16: number; // Immediate value
  hwordCount: 2;
}

export interface LdiInstruction extends BaseInstruction {
  type: typeof I_LDI;
  imm32: number; // Immediate value
  xZ: number; // Register Z
  hwordCount: 3;
}

export interface LdrInstruction extends BaseInstruction {
  type: typeof I_LDR;
  xY: number; // RAM address
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface JmprInstruction extends BaseInstruction {
  type: typeof I_JMPR;
  xY: number; // Register Y
  hwordCount: 1;
}

export interface JfrInstruction extends BaseInstruction {
  type: typeof I_JFR;
  xY: number; // Register Y
  hwordCount: 1;
}

export interface JnfrInstruction extends BaseInstruction {
  type: typeof I_JNFR;
  xY: number; // Register Y
  hwordCount: 1;
}

export interface InInstruction extends BaseInstruction {
  type: typeof I_IN;
  xY: number; // I/O pin
  xZ: number; // Register Z
  hwordCount: 1;
}

export interface HltInstruction extends BaseInstruction {
  type: typeof I_HLT;
  hwordCount: 1;
}

export type Instruction =
  | AddInstruction
  | SubInstruction
  | MulInstruction
  | DivInstruction
  | ModInstruction
  | ShfInstruction
  | RotInstruction
  | ShaInstruction
  | OrInstruction
  | AndInstruction
  | XorInstruction
  | StrInstruction
  | OutInstruction
  | JmpiInstruction
  | JfiInstruction
  | JnfiInstruction
  | LdiInstruction
  | LdrInstruction
  | JmprInstruction
  | JfrInstruction
  | JnfrInstruction
  | InInstruction
  | HltInstruction;

// note: not all mnemonics are 1:1 with the instruction type.
export const typeToMnemonic = {
  [I_ADD]: "add",
  [I_SUB]: "sub",
  [I_MUL]: "mul",
  [I_DIV]: "div",
  [I_MOD]: "mod",
  [I_SHF]: "shf",
  [I_ROT]: "rot",
  [I_SHA]: "sha",
  [I_OR]: "or",
  [I_AND]: "and",
  [I_XOR]: "xor",
  [I_STR]: "st",
  [I_OUT]: "out",
  [I_JMPI]: "jmp",
  [I_JFI]: "jf",
  [I_JNFI]: "jnf",
  [I_LDI]: "ld",
  [I_LDR]: "ld",
  [I_JMPR]: "jmp",
  [I_JFR]: "jf",
  [I_JNFR]: "jnf",
  [I_IN]: "in",
  [I_HLT]: "hlt",
} as const;

function toHex(x: number): string {
  return x.toString(16).toUpperCase();
}

function toHexWithPrefix(x: number): string {
  if (x < 0) {
    x = toUnsigned32(x);
  }
  return "0x" + toHex(x);
}

export function stringifyInstruction(inst: Instruction): string {
  switch (inst.type) {
    case I_SUB: {
      // NOTE: reversed xX and xY
      const mnemonic = typeToMnemonic[inst.type];
      return `${mnemonic} x${toHex(inst.xY)},x${toHex(inst.xX)},x${
        toHex(inst.xZ)
      }`;
    }
    case I_ADD:
    case I_MUL:
    case I_DIV:
    case I_MOD:
    case I_SHF:
    case I_ROT:
    case I_SHA:
    case I_OR:
    case I_AND:
    case I_XOR: {
      const mnemonic = typeToMnemonic[inst.type];
      return `${mnemonic} x${toHex(inst.xX)},x${toHex(inst.xY)},x${
        toHex(inst.xZ)
      }`;
    }
    case I_STR:
    case I_OUT: {
      const mnemonic = typeToMnemonic[inst.type];
      return `${mnemonic} x${toHex(inst.xX)},x${toHex(inst.xY)}`;
    }
    case I_JMPI:
    case I_JFI:
    case I_JNFI: {
      const mnemonic = typeToMnemonic[inst.type];
      return `${mnemonic} ${toHexWithPrefix(inst.imm16)}`;
    }
    case I_LDI: {
      const mnemonic = typeToMnemonic[inst.type];
      return `${mnemonic} ${toHexWithPrefix(inst.imm32)},x${toHex(inst.xZ)}`;
    }
    case I_LDR: {
      const mnemonic = typeToMnemonic[inst.type];
      return `${mnemonic} x${toHex(inst.xY)},x${toHex(inst.xZ)}`;
    }
    case I_JMPR:
    case I_JFR:
    case I_JNFR: {
      const mnemonic = typeToMnemonic[inst.type];
      return `${mnemonic} x${toHex(inst.xY)}`;
    }
    case I_IN: {
      const mnemonic = typeToMnemonic[inst.type];
      return `${mnemonic} x${toHex(inst.xY)},x${toHex(inst.xZ)}`;
    }
    case I_HLT: {
      return "hlt";
    }
  }
}

const typeToTopNybble = {
  [I_ADD]: 0x0,
  [I_SUB]: 0x1,
  [I_MUL]: 0x2,
  [I_DIV]: 0x3,
  [I_MOD]: 0x4,
  [I_SHF]: 0x7,
  [I_ROT]: 0x8,
  [I_SHA]: 0x9,
  [I_OR]: 0xb,
  [I_AND]: 0xc,
  [I_XOR]: 0xd,
  [I_STR]: 0xa,
  [I_OUT]: 0xa,
  [I_JMPI]: 0xe,
  [I_JFI]: 0xe,
  [I_JNFI]: 0xe,
  [I_LDI]: 0xe,
  [I_LDR]: 0xe,
  [I_JMPR]: 0xe,
  [I_JFR]: 0xe,
  [I_JNFR]: 0xe,
  [I_IN]: 0xe,
  [I_HLT]: 0xe,
} as const;

/**
 * @returns hword (16 bits) array
 */
export function encodeInstruction(inst: Instruction): number[] {
  switch (inst.type) {
    case I_ADD:
    case I_SUB:
    case I_MUL:
    case I_DIV:
    case I_MOD:
    case I_SHF:
    case I_ROT:
    case I_SHA:
    case I_OR:
    case I_AND:
    case I_XOR: {
      return [
        typeToTopNybble[inst.type] << 12 | inst.xX << 8 | inst.xY << 4 |
        inst.xZ,
      ];
    }
    case I_STR: {
      return [
        // NOTE: reversed.
        typeToTopNybble[inst.type] << 12 | inst.xY << 8 | inst.xX << 4 | 0,
      ];
    }
    case I_OUT: {
      return [
        typeToTopNybble[inst.type] << 12 | inst.xX << 8 | inst.xY << 4 | 1,
      ];
    }
    case I_JMPI:
    case I_JFI:
    case I_JNFI: {
      return [
        typeToTopNybble[inst.type] << 12 |
        (inst.type === I_JMPI ? 0 : inst.type === I_JFI ? 2 : 1),
        inst.imm16,
      ];
    }
    case I_LDI: {
      return [
        typeToTopNybble[inst.type] << 12 | 1 << 4 | inst.xZ,
        // split to hwords
        inst.imm32 & 0xffff,
        inst.imm32 >>> 16,
      ];
    }
    case I_LDR: {
      return [
        typeToTopNybble[inst.type] << 12 | 1 << 8 | inst.xY << 4 | inst.xZ,
      ];
    }
    case I_JMPR: {
      return [
        typeToTopNybble[inst.type] << 12 | 2 << 8 | (inst.xY << 4),
      ];
    }
    case I_JFR:
    case I_JNFR: {
      return [
        typeToTopNybble[inst.type] << 12 | 2 << 8 | (inst.xY << 4) |
        (inst.type === I_JFR ? 2 : 1),
      ];
    }
    case I_IN: {
      return [
        typeToTopNybble[inst.type] << 12 | 3 << 8 | inst.xY << 4 | inst.xZ,
      ];
    }
    case I_HLT: {
      return [0xeeee];
    }
  }
}

const arithOpNybbleToType = {
  0: I_ADD,
  1: I_SUB,
  2: I_MUL,
  3: I_DIV,
  4: I_MOD,
  7: I_SHF,
  8: I_ROT,
  9: I_SHA,
  0xb: I_OR,
  0xc: I_AND,
  0xd: I_XOR,
} as Record<number, number>;

export function decodeInstruction(
  hword: number,
  getNextHword: () => number | undefined,
  getNextNextHword: () => number | undefined,
): Instruction {
  const opNybble = hword >>> 12;
  const x = (hword >>> 8) & 0xf;
  const y = (hword >>> 4) & 0xf;
  const z = hword & 0xf;

  const arithType = arithOpNybbleToType[opNybble];
  if (arithType !== undefined) {
    return {
      // deno-lint-ignore no-explicit-any
      type: arithType as any,
      xX: x,
      xY: y,
      xZ: z,
      hwordCount: 1,
    };
  }

  if (opNybble === 0xa) {
    // 0xaXY(0|1)
    if (z === 0) {
      return {
        type: I_STR,
        // NOTE: reversed.
        xX: y,
        xY: x,
        hwordCount: 1,
      };
    } else if (z === 1) {
      return {
        type: I_OUT,
        xX: x,
        xY: y,
        hwordCount: 1,
      };
    }
    throw new Error(`Invalid instruction ${toHex(hword)}`);
  }

  if (opNybble !== 0xe) {
    throw new Error(`Invalid instruction ${toHex(hword)}`);
  }

  if (x === 0) {
    if (y === 1) {
      // 0xe01Z
      const nextHword = getNextHword();
      if (nextHword === undefined) {
        throw new Error("Unexpected end of instruction");
      }
      const nextNextHword = getNextNextHword();
      if (nextNextHword === undefined) {
        throw new Error("Unexpected end of instruction");
      }
      // least significant hword first
      const imm32 = toUnsigned32(nextHword | nextNextHword << 16);
      return {
        type: I_LDI,
        imm32,
        xZ: z,
        hwordCount: 3,
      };
    } else if (y !== 0) {
      throw new Error(`Invalid instruction ${toHex(hword)}`);
    }

    switch (z) {
      case 0: {
        const imm16 = getNextHword();
        if (imm16 === undefined) {
          throw new Error("Unexpected end of instruction");
        }
        return {
          type: I_JMPI,
          imm16,
          hwordCount: 2,
        };
      }
      case 1: {
        const imm16 = getNextHword();
        if (imm16 === undefined) {
          throw new Error("Unexpected end of instruction");
        }
        // NOTE: Documentation is wrong. jnf and jf are swapped.
        return {
          type: I_JNFI,
          imm16,
          hwordCount: 2,
        };
      }
      case 2: {
        const imm16 = getNextHword();
        if (imm16 === undefined) {
          throw new Error("Unexpected end of instruction");
        }
        return {
          type: I_JFI,
          imm16,
          hwordCount: 2,
        };
      }
      default: {
        throw new Error(`Invalid instruction ${toHex(hword)}`);
      }
    }
  }

  if (x === 1) {
    return {
      type: I_LDR,
      xY: y,
      xZ: z,
      hwordCount: 1,
    };
  }

  if (x === 2) {
    switch (z) {
      case 0: {
        return {
          type: I_JMPR,
          xY: y,
          hwordCount: 1,
        };
      }
      case 1: {
        // NOTE: Documentation is wrong. jnf and jf are swapped.
        return {
          type: I_JNFR,
          xY: y,
          hwordCount: 1,
        };
      }
      case 2: {
        return {
          type: I_JFR,
          xY: y,
          hwordCount: 1,
        };
      }
      default: {
        throw new Error(`Invalid instruction ${toHex(hword)}`);
      }
    }
  }

  if (x === 3) {
    return {
      type: I_IN,
      xY: y,
      xZ: z,
      hwordCount: 1,
    };
  }

  if (hword === 0xeeee) {
    return {
      type: I_HLT,
      hwordCount: 1,
    };
  }

  throw new Error(`Invalid instruction ${toHex(hword)}`);
}
