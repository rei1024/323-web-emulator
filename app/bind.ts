import { $type } from "./util/selector.ts";

export const $selectFileInput = $type("#select-file", HTMLInputElement);
export const $assemblyInputTextarea = $type(
  "#assembly-input-textarea",
  HTMLTextAreaElement,
);

export const $resetButton = $type("#reset", HTMLButtonElement);
export const $toggleButton = $type("#toggle", HTMLButtonElement);
export const $stepButton = $type("#step-button", HTMLButtonElement);

export const $message = $type("#message", HTMLElement);

export const $frequencyInput = $type("#frequency-input", HTMLInputElement);
export const $frequencyOutput = $type("#frequency-output", HTMLElement);

export const $programCounter = $type("#program-counter", HTMLElement);
export const $stepNumber = $type("#step-number", HTMLElement);

export const $displayCanvas = $type("#display-canvas", HTMLCanvasElement);
export const $currentInstruction = $type("#current-instruction", HTMLElement);
export const $registers = $type("#registers", HTMLElement);

export const $keyUp = $type("#key-up", HTMLButtonElement);
export const $keyLeft = $type("#key-left", HTMLButtonElement);
export const $keyRight = $type("#key-right", HTMLButtonElement);
export const $keyDown = $type("#key-down", HTMLButtonElement);

export const $ramDetails = $type("#ram-details", HTMLDetailsElement);
export const $ram = $type("#ram", HTMLElement);
