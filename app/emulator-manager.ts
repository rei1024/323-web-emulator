import { assemble } from "../src/assembler/assemble.ts";
import { OutDeviceImpl } from "../src/emulator/devices/devices.ts";
import { Emulator } from "../src/emulator/emulator.ts";
import { stringifyInstruction } from "../src/emulator/instruction/instruction.ts";

export class EmulatorManager {
  private emulator: Emulator;
  private outDevice: OutDeviceImpl;

  constructor(src: string) {
    const { objectCode, machineCode } = assemble(src);
    this.outDevice = new OutDeviceImpl();
    this.emulator = new Emulator(machineCode, { outDevice: this.outDevice });
  }

  stepN(n: number) {
    const emulator = this.emulator;
    for (let i = 0; i < n; i++) {
      const result = emulator.step();
      if (result === "halt") {
        return "halt";
      }
    }
    return "continue";
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
