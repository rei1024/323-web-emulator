import { App } from "./app.ts";
import {
  $assemblyInputTextarea,
  $frequencyInput,
  $historyEnable,
  $ramDetails,
  $ramPageLeft,
  $ramPageRight,
  $registerDec,
  $registerHex,
  $removeAllBreakpoints,
  $resetButton,
  $selectFileInput,
  $stepBack,
  $stepButton,
  $toggleButton,
  $useKeyboard,
} from "./bind.ts";
import { setupFrequencyInput } from "./components/frequency.ts";
import { onClickUseKeyboard } from "./components/keyboard.ts";

const REGISTER_DEC_KEY = "323-register-dec";
const REGISTER_HEX_KEY = "323-register-hex";

try {
  const dec = localStorage.getItem(REGISTER_DEC_KEY);
  if (dec === "true") {
    $registerDec.checked = true;
  } else if (dec === "false") {
    $registerDec.checked = false;
  }

  const hex = localStorage.getItem(REGISTER_HEX_KEY);
  if (hex === "true") {
    $registerHex.checked = true;
  } else if (hex === "false") {
    $registerHex.checked = false;
  }
} catch (error) {
  // nop
}

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

$ramDetails.addEventListener("toggle", () => {
  if ($ramDetails.open) {
    app.render();
  }
});

function saveRegisterConfig() {
  try {
    localStorage.setItem(REGISTER_DEC_KEY, String($registerDec.checked));
    localStorage.setItem(REGISTER_HEX_KEY, String($registerHex.checked));
  } catch (error) {
    console.error(error);
  }
}

$registerDec.addEventListener("click", () => {
  if (!$registerDec.checked && !$registerHex.checked) {
    $registerHex.checked = true;
  }
  saveRegisterConfig();
  app.render();
});

$registerHex.addEventListener("click", () => {
  if (!$registerDec.checked && !$registerHex.checked) {
    $registerDec.checked = true;
  }
  saveRegisterConfig();
  app.render();
});

$ramPageLeft.addEventListener("click", () => {
  app.ramPageDec();
});

$ramPageRight.addEventListener("click", () => {
  app.ramPageInc();
});

$historyEnable.addEventListener("change", () => {
  app.render();
});

$stepBack.addEventListener("click", () => {
  app.stepBack();
});

$useKeyboard.addEventListener("click", () => {
  onClickUseKeyboard();
});

$removeAllBreakpoints.addEventListener("click", () => {
  app.removeAllBreakpoints();
});
