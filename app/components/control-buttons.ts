import { $resetButton, $stepButton, $toggleButton } from "../bind.ts";
import type { AppState } from "../core.ts";
import { startButton, stopButton } from "./toggle.ts";

export function renderControlButtons(state: AppState) {
  switch (state) {
    case "Init": {
      startButton($toggleButton);
      $resetButton.disabled = false;
      $toggleButton.disabled = true;
      $stepButton.disabled = true;
      break;
    }
    case "Error": {
      startButton($toggleButton);
      $resetButton.disabled = false;
      $toggleButton.disabled = true;
      $stepButton.disabled = true;
      break;
    }
    case "Run": {
      stopButton($toggleButton);
      $resetButton.disabled = false;
      $toggleButton.disabled = false;
      $stepButton.disabled = true;
      break;
    }
    case "Stop": {
      startButton($toggleButton);
      $resetButton.disabled = false;
      $toggleButton.disabled = false;
      $stepButton.disabled = false;
      break;
    }
    case "Halted": {
      startButton($toggleButton);
      $resetButton.disabled = false;
      $toggleButton.disabled = true;
      $stepButton.disabled = true;
      break;
    }
  }
}
