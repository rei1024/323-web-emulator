import {
  $currentInstruction,
  $displayCanvas,
  $flag,
  $frequencyOutput,
  $programCounter,
  $ram,
  $ramDetails,
  $registerDec,
  $registerHex,
  $registers,
  $stepNumber,
} from "./bind.ts";
import { renderControlButtons } from "./components/control-buttons.ts";
import { DisplayUI } from "./components/display.ts";
import { renderFrequency } from "./components/frequency.ts";
import { getKey } from "./components/keyboard.ts";
import { renderMessage } from "./components/message.ts";
import { RAMUI } from "./components/ram.ts";
import { RegistersUI } from "./components/registers.ts";
import type { AppState } from "./core.ts";
import { EmulatorManager, getErrorMessage } from "./emulator-manager.ts";
import { Valve } from "./util/valve.ts";

export class App {
  private state: AppState = "Init";
  private prevState: AppState | undefined;
  private valve: Valve;
  private emulatorManager: EmulatorManager | null = null;
  private message: string = "";
  private displayUI = new DisplayUI($displayCanvas);
  private registersUI = new RegistersUI($registers);
  private ramUI = new RAMUI($ram);
  constructor() {
    this.valve = new Valve((value) => {
      this.stepN(value);
    }, {
      frequency: 30,
    });
  }

  render() {
    if (this.emulatorManager?.isHalted()) {
      this.state = "Halted";
    }

    this.valve.disabled = this.state !== "Run";

    // Need to this otherwise button can't be clicked
    if (this.state === "Stop" || this.prevState !== this.state) {
      renderControlButtons(this.state);
    }
    renderMessage(this.message);
    renderFrequency($frequencyOutput, this.valve.frequency);

    const emulatorManager = this.emulatorManager;
    if (emulatorManager != undefined) {
      const state = emulatorManager.getState();
      $programCounter.textContent = "0x" +
        state.pc.toString(16);
      $stepNumber.textContent = state.stepCount.toLocaleString();
      $flag.textContent = String(state.flag);
      this.displayUI.render(emulatorManager.getDisplay());
      $currentInstruction.textContent = emulatorManager
        .getCurrentInstructionString();
      this.registersUI.render(state.registers, {
        dec: $registerDec.checked,
        hex: $registerHex.checked,
      });
      if ($ramDetails.open) {
        this.ramUI.render(state.ram, state.pc);
      }
    }

    this.prevState = this.state;
  }

  reset(value: string) {
    this.message = "";
    this.registersUI.initialize();
    this.ramUI.initialize();
    if (value.trim() === "") {
      this.message = "Program is empty";
      this.state = "Error";
      this.render();
      return;
    }
    try {
      this.emulatorManager = new EmulatorManager(value, {
        getKey() {
          return getKey();
        },
      });
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
    this.stepN(1);
  }

  private stepN(n: number) {
    const result = this.emulatorManager?.stepN(n);
    if (result instanceof Error) {
      this.state = "Error";
      this.message = result.cause instanceof Error
        ? result.cause.message
        : result.message;
    }
    this.render();
  }
}
