import { App } from "./app.ts";
import {
  $assemblyInputTextarea,
  $frequencyInput,
  $resetButton,
  $selectFileInput,
  $stepButton,
  $toggleButton,
} from "./bind.ts";
import { setupFrequencyInput } from "./components/frequency.ts";

const app = new App();
app.render();

$resetButton.addEventListener("click", () => {
  const value = $assemblyInputTextarea.value;
  app.reset(value);
});

$selectFileInput.addEventListener("change", async (event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files != null && files.length > 0) {
    const file = files[0];
    const value = await file.text();
    $assemblyInputTextarea.value = value;
    app.reset(value);
  }
});

setupFrequencyInput($frequencyInput, app);

$toggleButton.addEventListener("click", () => {
  app.toggle();
});

$stepButton.addEventListener("click", () => {
  app.step();
});
