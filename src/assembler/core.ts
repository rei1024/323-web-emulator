export interface LineContext {
  /**
   * 0-based index
   */
  lineIndex: number;
  /** source code of the line */
  lineSource: string; // comment stripped
}

export class ErrorWithLineContext extends Error {
  constructor(message: string, public ctx: LineContext) {
    super(message);
  }
}

export const PROGRAM_ADDR_START_HWORD = 256;
