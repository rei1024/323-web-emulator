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
import type { Instruction } from "./instruction.ts";

/**
 * for Property Based Testing
 */
export function generateRandomInstruction(): Instruction {
  const opcodeTypes = [
    I_ADD,
    I_SUB,
    I_MUL,
    I_DIV,
    I_MOD,
    I_SHF,
    I_ROT,
    I_SHA,
    I_OR,
    I_AND,
    I_XOR,
    I_STR,
    I_OUT,
    I_JMPI,
    I_JFI,
    I_JNFI,
    I_LDI,
    I_LDR,
    I_JMPR,
    I_JFR,
    I_JNFR,
    I_IN,
    I_HLT,
  ];

  // Helper function to select a random element from an array
  const randomChoice = <T>(array: T[]): T =>
    array[Math.floor(Math.random() * array.length)];

  // Functions for random number generation
  const randomRegister = generateRandomInt(0, 15); // Registers x0 to xF
  const randomImm16 = generateRandomInt(0, 0xFFFF); // 16-bit immediate value
  const randomImm32 = generateRandomInt(0, 0xFFFFFFFF); // 32-bit immediate value

  const type = randomChoice(opcodeTypes);

  switch (type) {
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
    case I_XOR:
      return {
        type,
        xX: randomRegister(),
        xY: randomRegister(),
        xZ: randomRegister(),
        hwordCount: 1,
      };
    case I_STR:
    case I_OUT:
      return {
        type,
        xX: randomRegister(),
        xY: randomRegister(),
        hwordCount: 1,
      };
    case I_JMPI:
    case I_JFI:
    case I_JNFI:
      return { type, imm16: randomImm16(), hwordCount: 2 };
    case I_LDI:
      return {
        type,
        imm32: randomImm32(),
        xZ: randomRegister(),
        hwordCount: 3,
      };
    case I_LDR:
      return {
        type,
        xY: randomRegister(),
        xZ: randomRegister(),
        hwordCount: 1,
      };
    case I_JMPR:
    case I_JFR:
    case I_JNFR:
      return { type, xY: randomRegister(), hwordCount: 1 };
    case I_IN:
      return {
        type,
        xY: randomRegister(),
        xZ: randomRegister(),
        hwordCount: 1,
      };
    case I_HLT:
      return { type, hwordCount: 1 };
    default:
      throw new Error("Unknown instruction type");
  }
}

// General-purpose random integer generator
function generateRandomInt(min: number, max: number): () => number {
  return () => Math.floor(Math.random() * (max - min + 1)) + min;
}
