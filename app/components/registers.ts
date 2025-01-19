import { chunk } from "../util/chunk.ts";
import { create } from "../util/create.ts";

const getNumberOfCols = (): number => {
  const width = window.innerWidth;
  if (width < 992) {
    return 4;
  }
  return 8;
};

const createHeaderCell = (key: number) => {
  return create("th", `x${key.toString(16).toUpperCase()}`);
};

function toStringDec(x: number) {
  return x.toString();
}

function toStringHex(x: number) {
  return "0x" + x.toString(16).toUpperCase().padStart(8, "0");
}

const createDataCell = (key: number, value: number) => {
  const $dec = document.createElement("div");
  const $hex = document.createElement("div");
  $dec.style.paddingBlock = "2px";
  $hex.style.paddingBlock = "2px";
  const $td = create("td", {
    children: [$dec, $hex],
    fn: (td) => {
      td.dataset["test"] = `x${key.toString(16).toUpperCase()}`;
    },
  });
  return {
    $td,
    $dec,
    $hex,
  };
};

const createTable = (): { table: HTMLTableElement; cells: Cell[] } => {
  const cells: Cell[] = [];

  const regs: number[] = Array(16).fill(0);

  const rows: { header: HTMLTableRowElement; data: HTMLTableRowElement }[] = [];

  const numberOfCols = getNumberOfCols();

  let i = 0;
  for (const entries of chunk(regs, numberOfCols)) {
    const header = create("tr");
    const data = create("tr");
    for (const value of entries) {
      const th = createHeaderCell(i);
      th.style.textAlign = "right";
      header.append(th);

      const { $td, $dec, $hex } = createDataCell(i, value);
      $td.style.textAlign = "right";
      $td.classList.add("font-monospace");
      cells.push({ dec: $dec, hex: $hex });
      data.append($td);
      i++;
    }

    rows.push({ header, data });
  }

  const table = create("table");
  for (const row of rows) {
    table.append(row.header, row.data);
  }

  table.classList.add("table");

  // Fixed layout
  table.style.tableLayout = "fixed";

  // 16pxから変更
  table.style.marginBottom = "0";

  return {
    table,
    cells,
  };
};

type Cell = { dec: HTMLElement; hex: HTMLElement };
type RegisterConfig = { dec: boolean; hex: boolean };

export class RegistersUI {
  private cells: Cell[] = [];
  constructor(private $root: HTMLElement) {
    this.initialize();
  }

  initialize() {
    const { table, cells } = createTable();
    this.$root.replaceChildren(table);
    this.cells = cells;
  }

  render(registers: number[], config: RegisterConfig) {
    for (const [i, r] of registers.entries()) {
      const cell = this.cells[i];
      cell.dec.textContent = config.dec ? toStringDec(r) : "";
      cell.hex.textContent = config.hex ? toStringHex(r) : "";
    }
  }
}
