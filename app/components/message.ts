import { $message } from "../bind.ts";

export function renderMessage(message: string) {
  if (message === "") {
    $message.classList.add("d-none");
  } else {
    $message.classList.remove("d-none");
  }
  $message.textContent = message;
}
