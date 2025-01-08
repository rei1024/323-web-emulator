import { assemble } from "../src/assembler/assemble.ts";
import {
  InDeviceImpl,
  type KeyboardInterface,
  OutDeviceImpl,
} from "../src/emulator/devices/devices.ts";
import { Emulator } from "../src/emulator/emulator.ts";
import { stringifyInstruction } from "../src/emulator/instruction/instruction.ts";

export class EmulatorManager {
  private emulator: Emulator;
  private outDevice: OutDeviceImpl;
  private inDevice: InDeviceImpl;

  constructor(src: string, keyboard: KeyboardInterface) {
    const { objectCode, machineCode } = assemble(src);
    this.outDevice = new OutDeviceImpl();
    this.inDevice = new InDeviceImpl({ keyboard });
    this.emulator = new Emulator(machineCode, {
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
      return stringifyInstruction(this.emulator.getCurrentInst().inst);
    } catch (error) {
      return "";
    }
  }
}
