import { $keyDown, $keyLeft, $keyRight, $keyUp } from "../bind.ts";

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
