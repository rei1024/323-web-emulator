import { expect, test as viTest } from "vitest";

export function assertEquals<T>(actual: T, expected: T, msg?: string) {
  expect(actual, msg).toEqual(expected);
}

export function assertThrows<E extends Error = Error>(
  fn: () => unknown,
  errorClassOrMsg?: (new (...args: any[]) => unknown) | string,
  msgIncludes?: string,
  msg?: string,
): E {
  let thrown = false;
  let error: any;
  try {
    fn();
  } catch (e) {
    thrown = true;
    error = e;
  }
  if (!thrown) {
    throw new Error(msg ?? "Expected function to throw, but it did not");
  }

  if (typeof errorClassOrMsg === "function") {
    expect(error).toBeInstanceOf(errorClassOrMsg);
    if (msgIncludes !== undefined) {
      expect(error.message).toContain(msgIncludes);
    }
  } else if (typeof errorClassOrMsg === "string") {
    expect(error.message).toContain(errorClassOrMsg);
  }

  return error as E;
}

export function test(name: string, fn: () => void | Promise<void>) {
  return viTest(name, fn);
}
