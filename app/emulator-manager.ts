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

type State = ReturnType<typeof EmulatorManager.prototype.getStateWithOutput>;

const MAX_HISTORY = 32;

export class EmulatorManager {
  private histories: State[] = [];
  private emulator: Emulator;
  private outDevice: OutDeviceImpl;
  private inDevice: InDeviceImpl;

  constructor(src: string, keyboard: KeyboardInterface) {
    const assembleResult = assemble(src);
    this.outDevice = new OutDeviceImpl();
    this.inDevice = new InDeviceImpl({ keyboard });
    this.emulator = new Emulator(assembleResult, {
      outDevice: this.outDevice,
      inDevice: this.inDevice,
    });
  }

  resetHistory() {
    this.histories = [];
  }

  stepN(n: number, historyEnabled: boolean) {
    const emulator = this.emulator;
    try {
      for (let i = 0; i < n; i++) {
        if (historyEnabled) {
          this.histories.push(this.getStateWithOutput());
          if (this.histories.length > MAX_HISTORY) {
            this.histories.shift();
          }
        }
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

  canStepBack() {
    return this.histories.length > 0;
  }

  stepBack(): boolean {
    const prevState = this.histories.pop();
    if (prevState != null) {
      this.loadState(prevState);
      return true;
    }
    return false;
  }

  getState() {
    return this.emulator.getState();
  }

  getStateWithOutput() {
    return {
      emulator: this.emulator.getState(),
      output: this.outDevice.getState(),
      instString: this.getCurrentInstructionString(),
    };
  }

  loadState(state: State) {
    this.emulator.loadState(state.emulator);
    this.outDevice.loadState(state.output);
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
