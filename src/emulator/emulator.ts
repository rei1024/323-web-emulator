import { Func } from "./components/function.ts";
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
} from "./instruction/instruction-const.ts";
import {
  decodeInstruction,
  type Instruction,
} from "./instruction/instruction.ts";
import { Cache } from "./components/cache.ts";
import { RAM } from "./components/ram.ts";
import { Registers } from "./components/registers.ts";
import { PROGRAM_ADDR_START_HWORD } from "../assembler/core.ts";

const airthOpMap = {
  [I_ADD]: Func.add,
  [I_SUB]: Func.sub,
  [I_MUL]: Func.mul,
  [I_DIV]: Func.div,
  [I_MOD]: Func.mod,
  [I_SHF]: Func.shf,
  [I_ROT]: Func.rot,
  [I_SHA]: Func.sha,
  [I_OR]: Func.or,
  [I_AND]: Func.and,
  [I_XOR]: Func.xor,
};

export interface InDevice {
  getData(_: {
    /**
     * Input pin
     */
    pin: number;
  }): {
    /** 32-bit number */
    data: number;

    flag: 0 | 1;
  };
}

export interface OutDevice {
  output(data: {
    /** 32-bit number */
    data: number;
    /** Output pin */
    pin: number;
  }): { flag: 0 | 1 };
}

const nopInDevice: InDevice = {
  getData() {
    return {
      data: 0,
      flag: 0,
    };
  },
};

const nopOutDevice: OutDevice = {
  output() {
    // nop
    return { flag: 0 };
  },
};

export class Emulator {
  private halted: boolean = false;
  /**
   * hword-based addresses
   */
  private pc = PROGRAM_ADDR_START_HWORD; // Starting address
  private stepCount = 0;

  private registers = new Registers();
  private flag: 0 | 1 = 0;
  private cache = new Cache();
  private ram = new RAM();

  private inDevice: InDevice;
  private outDevice: OutDevice;

  prettyRegisters() {
    return this.registers.pretty();
  }

  isHalted() {
    return this.halted;
  }

  getState() {
    return {
      stepCount: this.stepCount,
      pc: this.pc,
      registers: this.registers.getState(),
      flag: this.flag,
      cache: this.cache.getState(),
      ram: this.ram.getState(),
    };
  }

  loadState(state: ReturnType<typeof Emulator.prototype.getState>) {
    this.halted = false;
    this.stepCount = state.stepCount;
    this.registers.loadState(state.registers);
    this.flag = state.flag;
    this.cache.loadState(state.cache);
    this.ram.loadState(state.ram);
    this.pc = state.pc;
  }

  constructor(
    { machineCode, startingPC }: {
      machineCode: Uint32Array;
      startingPC?: number | undefined;
    },
    devices: {
      inDevice?: InDevice;
      outDevice?: OutDevice;
    } = {},
  ) {
    // Load machine code into RAM after column 0
    this.ram.setArray(machineCode, PROGRAM_ADDR_START_HWORD >> 1);
    this.pc = startingPC ?? PROGRAM_ADDR_START_HWORD;
    this.inDevice = devices.inDevice ?? nopInDevice;
    this.outDevice = devices.outDevice ?? nopOutDevice;
  }

  private execInst(
    inst: Instruction,
  ): { flag: 0 | 1; nextPC: number } {
    const { hwordCount } = inst;
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
        const { flag } = this.outDevice.output({
          data: this.registers.get(inst.xX),
          pin: this.registers.get(inst.xY),
        });
        return {
          flag,
          nextPC: this.pc + hwordCount,
        };
      }
      case I_JMPI: {
        return {
          flag: 0,
          nextPC: inst.imm16,
        };
      }
      case I_JFI: {
        return {
          flag: 0,
          nextPC: this.flag ? inst.imm16 : this.pc + hwordCount,
        };
      }
      case I_JNFI: {
        return {
          flag: 0,
          nextPC: this.flag ? this.pc + hwordCount : inst.imm16,
        };
      }
      case I_LDI: {
        this.registers.set(inst.xZ, inst.imm32);
        return {
          flag: 0,
          nextPC: this.pc + hwordCount,
        };
      }
      case I_LDR: {
        const address = this.registers.get(inst.xY);
        this.registers.set(inst.xZ, this.ram.get(address));
        return {
          flag: 0,
          nextPC: this.pc + hwordCount,
        };
      }
      case I_JMPR: {
        return {
          flag: 0,
          nextPC: this.registers.get(inst.xY),
        };
      }
      case I_JFR: {
        return {
          flag: 0,
          nextPC: this.flag
            ? this.registers.get(inst.xY)
            : this.pc + hwordCount,
        };
      }
      case I_JNFR: {
        return {
          flag: 0,
          nextPC: this.flag
            ? this.pc + hwordCount
            : this.registers.get(inst.xY),
        };
      }
      case I_IN: {
        const { data, flag } = this.inDevice.getData({
          pin: this.registers.get(inst.xY),
        });
        this.registers.set(inst.xZ, data);
        return {
          flag,
          nextPC: this.pc + hwordCount,
        };
      }
      case I_HLT: {
        return {
          flag: 0,
          nextPC: this.pc,
        };
      }
      default: {
        assertNever(inst);
      }
    }
  }

  getCurrentInst() {
    const currentPC = this.pc;
    const instructionHWord = this.ram.get16(currentPC);
    return decodeInstruction(
      instructionHWord,
      () => this.ram.get16(currentPC + 1),
      () => this.ram.get16(currentPC + 2),
    );
  }

  step(): "continue" | "halt" {
    if (this.halted) {
      return "halt";
    }
    const inst = this.getCurrentInst();
    // DEBUG;
    // console.log(
    //   this.ram.get16(this.pc).toString(16).padStart(4, "0"),
    //   stringifyInstruction(inst).padEnd(16, " "),
    //   this.prettyRegisters(),
    // );
    const { flag, nextPC } = this.execInst(inst);
    this.flag = flag;

    this.pc = nextPC;
    this.stepCount++;

    if (inst.type === I_HLT) {
      this.halted = true;
      return "halt";
    }

    return "continue";
  }

  run() {
    while (true) {
      // DEBUG
      // console.log(
      //   this.ram.get16(this.pc).toString(16).padStart(4, "0"),
      //   stringifyInstruction(this.getCurrentInst().inst),
      //   this.registers.getState(),
      // );
      // if (!confirm("Next")) {
      //   return;
      // }
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
