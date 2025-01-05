export interface LineContext {
  lineIndex: number;
  lineSource: string; // comment stripped
}

export class ErrorWithLineContext extends Error {
  constructor(message: string, public ctx: LineContext) {
    super(message);
  }
}
