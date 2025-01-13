import { $removeAllBreakpoints, $sourceLines } from "../bind.ts";
import { create } from "../util/create.ts";

export class SourceUI {
  private breakpointLineIndexSet = new Set<number>();
  private lines: {
    checkbox?: HTMLInputElement | undefined;
    line: HTMLElement;
  }[] = [];

  reset() {
    this.breakpointLineIndexSet.clear();
    this.lines = [];
    $sourceLines.replaceChildren();
    this.renderButton();
  }

  getBreakpointLineIndex(): ReadonlySet<number> {
    return this.breakpointLineIndexSet;
  }

  initialize(src: string) {
    this.reset();
    const lines = src.replace("\r", "").split("\n");
    for (const [lineIndex, line] of lines.entries()) {
      let checkbox: undefined | HTMLInputElement = undefined;
      const lineTrim = line.trimStart();
      if (!(lineTrim === "" || lineTrim.startsWith(";"))) {
        checkbox = create("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("d-inline");
        checkbox.style.width = "1.2rem";
        checkbox.style.height = "1.2rem";
        checkbox.style.marginInline = "4px";
        checkbox.addEventListener("change", () => {
          if (this.breakpointLineIndexSet.has(lineIndex)) {
            this.breakpointLineIndexSet.delete(lineIndex);
          } else {
            this.breakpointLineIndexSet.add(lineIndex);
          }
          this.renderButton();
        });
        $sourceLines.append(checkbox);
      } else {
        $sourceLines.append(
          create("span", { style: { marginLeft: "1.7rem" } }),
        );
      }

      const pre = create("pre");
      pre.classList.add("mb-0", "d-inline");
      pre.textContent = line + "\n";
      $sourceLines.append(pre);
      this.lines.push({ checkbox, line: pre });
    }
  }

  private renderButton() {
    $removeAllBreakpoints.disabled = this.breakpointLineIndexSet.size === 0;
  }

  render(currentLineIndex: number | undefined) {
    for (const [lineIndex, line] of this.lines.entries()) {
      if (lineIndex === currentLineIndex) {
        line.line.style.borderBottom = "1px solid black";
      } else {
        line.line.style.borderBottom = "";
      }
    }
  }

  removeAllBreakpoints() {
    for (const line of this.lines) {
      if (line.checkbox) {
        line.checkbox.checked = false;
      }
    }
    this.breakpointLineIndexSet.clear();

    this.renderButton();
  }
}
