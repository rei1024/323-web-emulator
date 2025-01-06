import type { InDevice, OutDevice } from "../emulator.ts";

export class InDeviceImpl implements InDevice {
  constructor() {}
  getData({ pin }: { pin: number }): { data: number; flag: 0 | 1 } {
    throw new Error("Method not implemented.");
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
    this.array[data] = [...writeData.toString(2).padStart(32, "0")].map((x) =>
      x === "0" ? 0 : 1
    );
  }

  getArray(): (0 | 1)[][] {
    return this.array.map((a) => a.slice());
  }

  pretty(): string[] {
    return transpose(this.getArray()).map((a) =>
      a.map((x) => x === 0 ? "  " : "o ").join("")
    ).reverse();
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
    return this.display.getArray();
  }

  prettyDisplay() {
    return this.display.pretty();
  }
}
