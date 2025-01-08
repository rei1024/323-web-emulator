/**
 * Asserts that the element found by `selector` is a instance of `klass`
 * @throws {Error}
 */
export const $type: <T extends Element>(
  selector: string,
  klass: new () => T,
) => T = (selector, klass) => {
  const el = document.querySelector(selector);

  if (el == null) {
    throw Error(`can't found a element for "${selector}"`);
  }

  if (el instanceof klass) {
    return el;
  }

  throw Error(`"${selector}" is not a ${klass.name}`);
};
