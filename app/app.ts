import { ErrorWithLineContext } from "../src/assembler/core.ts";
import {
  $currentInstruction,
  $displayCanvas,
  $frequencyOutput,
  $programCounter,
  $registers,
  $stepNumber,
} from "./bind.ts";
import { renderControlButtons } from "./components/control-buttons.ts";
import { DisplayUI } from "./components/display.ts";
import { renderFrequency } from "./components/frequency.ts";
import { renderMessage } from "./components/message.ts";
import { RegistersUI } from "./components/registers.ts";
import type { AppState } from "./core.ts";
import { EmulatorManager } from "./emulator-manager.ts";
import { Valve } from "./util/valve.ts";

export class App {
  private state: AppState = "Init";
  private prevState: AppState | undefined;
  private valve: Valve;
  private emulatorManager = new EmulatorManager();
  private message: string = "";
  private displayUI = new DisplayUI($displayCanvas);
  private registersUI = new RegistersUI($registers);
  constructor() {
    this.valve = new Valve((value) => {
      this.emulatorManager.stepN(value);
      this.render();
    }, {
      frequency: 30,
    });
  }

  render() {
    if (this.emulatorManager.isHalted()) {
      this.state = "Halted";
    }

    this.valve.disabled = this.state !== "Run";

    // Need to this otherwise button can't be clicked
    if (this.state === "Stop" || this.prevState !== this.state) {
      renderControlButtons(this.state);
    }
    renderMessage(this.message);
    renderFrequency($frequencyOutput, this.valve.frequency);

    const state = this.emulatorManager.getState();
    if (state != undefined) {
      $programCounter.textContent = "0x" +
        state.pc.toString(16);
      $stepNumber.textContent = state.stepCount.toString();
      this.displayUI.render(this.emulatorManager.getDisplay()!);
      $currentInstruction.textContent = this.emulatorManager
        .getCurrentInstructionString();
      this.registersUI.render(state.registers);
    }

    this.prevState = this.state;
  }

  reset(value: string) {
    this.message = "";
    if (value.trim() === "") {
      this.message = "Program is empty";
      this.state = "Error";
      this.render();
      return;
    }
    try {
      this.emulatorManager.load(value);
      this.state = "Stop";
    } catch (error) {
      this.message = getErrorMessage(error);
      this.state = "Error";
    }
    this.render();
  }

  toggle() {
    if (this.state === "Stop") {
      this.state = "Run";
    } else if (this.state === "Run") {
      this.state = "Stop";
    }
    this.render();
  }

  setFrequency(freq: number) {
    this.valve.frequency = freq;
    this.render();
  }

  step() {
    this.emulatorManager.stepN(1);
    this.render();
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ErrorWithLineContext) {
    return error.message +
      ` at '${error.ctx.lineSource}' line ${error.ctx.lineIndex + 1}`;
  } else {
    return error instanceof Error ? error.message : "Unknown Error";
  }
}
