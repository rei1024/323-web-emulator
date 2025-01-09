import type { App } from "../app.ts";

function internalError(): never {
  throw new Error("internal");
}

/**
 * @returns {number[]}
 */
const getFrequencies = () => {
  const frequencyArray: number[] = [];
  const maxOrder = 6;
  for (let i = 0; i <= maxOrder; i++) {
    for (let j = 1; j <= 9; j++) {
      frequencyArray.push(j * (10 ** i));
    }
  }

  frequencyArray.push(
    10 * 10 ** maxOrder,
    15 * 10 ** maxOrder,
    20 * 10 ** maxOrder,
  );

  // Math.floor ensures element kind is PACKED_SMI_ELEMENTS
  return frequencyArray.map((x) => Math.floor(x));
};

/**
 * Input Frequency
 */
export function setupFrequencyInput(
  $frequencyInput: HTMLInputElement,
  app: App,
) {
  const frequencies = getFrequencies();

  $frequencyInput.min = "0";
  $frequencyInput.max = (frequencies.length - 1).toString();

  function update() {
    const value = parseInt($frequencyInput.value, 10);
    const freq = frequencies[value] ?? internalError();
    $frequencyInput.ariaValueText = `(${freq.toString()}Hz)`;
    app.setFrequency(freq);
  }

  $frequencyInput.addEventListener("input", () => {
    update();
  });

  // Duplicate tab causes bugs
  setTimeout(() => {
    update();
  }, 1);
}

export function renderFrequency($frequencyOutput: HTMLElement, freq: number) {
  $frequencyOutput.textContent = (formatWithSIPrefix(freq) + "Hz").padStart(
    7,
    " ",
  );
}

function formatWithSIPrefix(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(0) + "M";
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + "k";
  } else {
    return value.toString();
  }
}
