// @ts-check

type CreateOptions<T extends keyof HTMLElementTagNameMap> = {
  fn?: ((element: HTMLElementTagNameMap[T]) => void) | undefined;
  text?: string;
  classes?: string[];
  children?: (string | Node)[];
  style?: Record<string, string>;
};

/**
 * Create HTML element
 */
export function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  textOrOptions?: string | CreateOptions<K>,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);

  if (typeof textOrOptions === "string") {
    e.textContent = textOrOptions;
  } else if (
    textOrOptions !== undefined && textOrOptions !== null &&
    typeof textOrOptions === "object"
  ) {
    if (textOrOptions.text) {
      e.textContent = textOrOptions.text;
    }
    if (textOrOptions.classes) {
      e.classList.add(...textOrOptions.classes);
    }
    if (textOrOptions.fn) {
      textOrOptions.fn(e);
      textOrOptions.fn = undefined;
    }
    if (textOrOptions.children) {
      e.append(...textOrOptions.children);
    }
    if (textOrOptions.style) {
      for (const [key, value] of Object.entries(textOrOptions.style)) {
        if (key in e.style) {
          // @ts-ignore
          e.style[key] = value;
        } else {
          e.style.setProperty(key, value);
        }
      }
    }
  }

  return e;
}
