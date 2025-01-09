import { assemble } from "../src/assembler/assemble.ts";
import { ErrorWithLineContext } from "../src/assembler/core.ts";
import {
  InDeviceImpl,
  type KeyboardInterface,
  OutDeviceImpl,
} from "../src/emulator/devices/devices.ts";
import { Emulator } from "../src/emulator/emulator.ts";
import { stringifyInstruction } from "../src/emulator/instruction/instruction.ts";

export function getErrorMessage(error: unknown): string {
  if (error instanceof ErrorWithLineContext) {
    return error.message +
      ` at '${error.ctx.lineSource}' line ${error.ctx.lineIndex + 1}`;
  } else {
    return error instanceof Error ? error.message : "Unknown Error";
  }
}

export class EmulatorManager {
  private emulator: Emulator;
  private outDevice: OutDeviceImpl;
  private inDevice: InDeviceImpl;

  constructor(src: string, keyboard: KeyboardInterface) {
    const { startingPC, machineCode } = assemble(src);
    this.outDevice = new OutDeviceImpl();
    this.inDevice = new InDeviceImpl({ keyboard });
    this.emulator = new Emulator(machineCode, {
      startingPC,
    }, {
      outDevice: this.outDevice,
      inDevice: this.inDevice,
    });
  }

  stepN(n: number) {
    const emulator = this.emulator;
    try {
      for (let i = 0; i < n; i++) {
        const result = emulator.step();
        if (result === "halt") {
          return "halt";
        }
      }
      return "continue";
    } catch (error) {
      return new Error("Runtime Error", { cause: error });
    }
  }

  getState() {
    return this.emulator.getState();
  }

  isHalted() {
    return this.emulator.isHalted();
  }

  getDisplay() {
    return this.outDevice.getDisplayOutput();
  }

  getCurrentInstructionString(): string {
    try {
      return stringifyInstruction(this.emulator.getCurrentInst());
    } catch (error) {
      return "";
    }
  }
}
