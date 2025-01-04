import { Func } from "../function.ts";
import {
  I_ADD,
  I_AND,
  I_HLT,
  I_MUL,
  I_OR,
  I_OUT,
  I_ROT,
  I_SHA,
  I_SHF,
  I_STR,
  I_SUB,
  I_XOR,
} from "../instruction/instruction-const.ts";
import {
  decodeInstruction,
  type Instruction,
} from "../instruction/instruction.ts";
import { Cache } from "./components/cache.ts";
import { RAM } from "./components/ram.ts";
import { Registers } from "./components/registers.ts";

const airthOpMap = {
  [I_ADD]: Func.add,
  [I_SUB]: Func.sub,
  [I_MUL]: Func.mul,
  [I_SHF]: Func.shf,
  [I_ROT]: Func.rot,
  [I_SHA]: Func.sha,
  [I_OR]: Func.or,
  [I_AND]: Func.and,
  [I_XOR]: Func.xor,
};

export class Emulator {
  /**
   * hword-based addresses
   */
  private pc = 256; // Starting address

  private registers = new Registers();
  private flag: 0 | 1 = 0;
  private cache = new Cache();
  private ram = new RAM();

  getState() {
    return {
      pc: this.pc,
      registers: this.registers.getState(),
      flag: this.flag,
      cache: this.cache.getState(),
      ram: this.ram.getState(),
    };
  }

  constructor(machineCode: Uint32Array) {
    // Load machine code into RAM after column 0
    this.ram.setArray(machineCode, 128);
  }

  private execInst(
    inst: Instruction,
    hwordCount: number,
  ): { flag: 0 | 1; nextPC: number } {
    switch (inst.type) {
      case I_ADD:
      case I_SUB:
      case I_MUL:
      case I_SHF:
      case I_ROT:
      case I_SHA:
      case I_OR:
      case I_AND:
      case I_XOR: {
        const { value, flag } = airthOpMap[inst.type](
          this.registers.get(inst.xX),
          this.registers.get(inst.xY),
        );
        this.registers.set(
          inst.xZ,
          value,
        );
        return {
          flag,
          nextPC: this.pc + hwordCount,
        };
      }
      case I_STR: {
        const address = this.registers.get(inst.xY);
        this.ram.set(address, this.registers.get(inst.xX));
        return {
          flag: 0,
          nextPC: this.pc + hwordCount,
        };
      }
      case I_OUT: {
        // TODO: Implement I/O
        break;
      }
      case I_HLT: {
        return {
          flag: 0,
          nextPC: this.pc,
        };
      }
      default: {
        // @ts-expect-error TODO implement
        assertNever(inst.type);
      }
    }
    // TODO: implement
    throw new Error("Not implemented");
  }

  step(): "continue" | "halt" {
    const currentPC = this.pc;
    const instructionHWord = this.ram.get16(currentPC);
    const { hwordCount, inst } = decodeInstruction(
      instructionHWord,
      () => this.ram.get16(currentPC + 1),
      () => this.ram.get16(currentPC + 2),
    );

    const { flag, nextPC } = this.execInst(inst, hwordCount);
    this.flag = flag;

    this.pc = nextPC;

    if (inst.type === I_HLT) {
      return "halt";
    }

    return "continue";
  }

  run() {
    while (true) {
      const result = this.step();
      if (result === "halt") {
        break;
      }
    }
  }
}

function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}
