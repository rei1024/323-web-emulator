import {
  $keyDown,
  $keyLeft,
  $keyRight,
  $keyUp,
  $useKeyboard,
} from "../bind.ts";

export const keyboard = {
  up: false,
  down: false,
  left: false,
  right: false,
};

export function getKey() {
  return (Object.entries(keyboard).find((x) => x[1])
    ?.[0] as keyof typeof keyboard | undefined) ?? "none";
}

$keyUp.addEventListener("mousedown", () => {
  keyboard.up = true;
});

$keyDown.addEventListener("mousedown", () => {
  keyboard.down = true;
});

$keyLeft.addEventListener("mousedown", () => {
  keyboard.left = true;
});

$keyRight.addEventListener("mousedown", () => {
  keyboard.right = true;
});

document.addEventListener("mouseup", () => {
  keyboard.up = false;
  keyboard.down = false;
  keyboard.left = false;
  keyboard.right = false;
});

let useHardware = false;

document.addEventListener("keydown", (e) => {
  if (!useHardware) {
    return;
  }
  if (e instanceof KeyboardEvent) {
    if (e.isComposing) {
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        keyboard.down = true;
        break;
      case "ArrowUp":
        e.preventDefault();
        keyboard.up = true;
        break;
      case "ArrowLeft":
        e.preventDefault();
        keyboard.left = true;
        break;
      case "ArrowRight":
        e.preventDefault();
        keyboard.right = true;
        break;
      case "Escape":
        useHardware = false;
        render();
        break;
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (!useHardware) {
    return;
  }
  if (e instanceof KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        keyboard.down = false;
        break;
      case "ArrowUp":
        keyboard.up = false;
        break;
      case "ArrowLeft":
        keyboard.left = false;
        break;
      case "ArrowRight":
        keyboard.right = false;
        break;
    }
  }
});

export function onClickUseKeyboard() {
  useHardware = !useHardware;
  render();
}

function render() {
  $useKeyboard.textContent = useHardware
    ? "Disable arrow keys"
    : "Use arrow keys";
  $useKeyboard.classList.add(useHardware ? "btn-danger" : "btn-primary");
  $useKeyboard.classList.remove(useHardware ? "btn-primary" : "btn-danger");
}
