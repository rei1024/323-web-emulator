import { chunk } from "../util/chunk.ts";
import { create } from "../util/create.ts";

/**
 * 列の数
 */
const getNumberOfCols = (): number => {
  const width = window.innerWidth;
  if (width < 768) {
    return 4;
  }
  return 8;
};

const createHeaderCell = (key: number) => {
  return create("th", `x${key.toString(16).toUpperCase()}`);
};

function toString(x: number) {
  return x.toString();
  // return "0x" + x.toString(16).padStart(8, "0");
}

const createDataCell = (key: number, value: number) => {
  return create("td", {
    text: toString(value),
    fn: (td) => {
      td.dataset["test"] = `x${key.toString(16).toUpperCase()}`;
    },
  });
};

const createTable = (): { table: HTMLTableElement; cells: HTMLElement[] } => {
  const cells: HTMLElement[] = [];

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

      const td = createDataCell(i, value);
      td.style.textAlign = "right";
      td.classList.add("font-monospace");
      cells.push(td);
      data.append(td);
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

export class RegistersUI {
  private cells: HTMLElement[];
  constructor($root: HTMLElement) {
    const { table, cells } = createTable();
    $root.replaceChildren(table);
    this.cells = cells;
  }

  render(registers: number[]) {
    for (const [i, r] of registers.entries()) {
      this.cells[i].textContent = toString(r);
    }
  }
}
