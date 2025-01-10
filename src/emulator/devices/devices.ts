import { toUnsigned32 } from "../../util.ts";
import type { InDevice, OutDevice } from "../emulator.ts";

export interface KeyboardInterface {
  getKey(): "none" | "left" | "up" | "right" | "down";
}

const map = {
  none: 0,
  left: -1,
  up: -2,
  right: -3,
  down: -4,
};

export class InDeviceImpl implements InDevice {
  constructor(private config: { keyboard: KeyboardInterface }) {}
  getData(input: { pin: number }): { data: number; flag: 0 | 1 } {
    const pin = input.pin;
    if (pin === 0xD) {
      const key = this.config.keyboard.getKey();
      return {
        data: toUnsigned32(map[key]),
        flag: 0,
      };
    }
    throw new Error(`Input for pin ${pin} not implemented.`);
  }
}

const generateArray = <T>(n: number, f: (_: number) => T) =>
  Array(n).fill(0).map((_, i) => f(i));

export class Display {
  private currentData: number | null = null;

  private array: (0 | 1)[][] = generateArray(
    32,
    () => generateArray(32, () => 0),
  );

  output(data: number) {
    if (this.currentData == null) {
      this.currentData = data;
      return;
    }
    const writeData = this.currentData;
    this.currentData = null;
    // NOTE: docs
    data = data & 0x1f;
    const row = this.array[data];
    for (let i = 0; i < 32; i++) {
      row[i] = ((writeData >>> (31 - i)) & 1) !== 0 ? 1 : 0;
    }
  }

  getArray(): (0 | 1)[][] {
    return this.array.map((a) => a.slice());
  }

  getArrayTransposed(): (0 | 1)[][] {
    return transpose(this.array).reverse();
  }

  pretty(): string[] {
    return this.getArrayTransposed().map((a) =>
      a.map((x) => x === 0 ? "  " : "o ").join("")
    );
  }
}

function transpose<T>(matrix: T[][]): T[][] {
  if (matrix.length === 0 || matrix[0].length === 0) {
    return [];
  }
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

export class OutDeviceImpl implements OutDevice {
  private display = new Display();

  constructor() {}

  output({ data, pin }: { data: number; pin: number }): { flag: 0 | 1 } {
    if (pin === 0xE) {
      this.display.output(data);
      return {
        flag: 0,
      };
    } else {
      throw new Error(`Not implemented pin=${pin}`);
    }
  }

  getDisplayOutput() {
    return this.display.getArrayTransposed();
  }

  prettyDisplay() {
    return this.display.pretty();
  }
}
