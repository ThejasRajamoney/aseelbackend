declare module 'node:sqlite' {
  export class StatementSync {
    run(...params: Array<string | number | null>): void;
    all(...params: Array<string | number | null>): Array<Record<string, unknown>>;
    get(...params: Array<string | number | null>): Record<string, unknown> | undefined;
  }

  export class DatabaseSync {
    constructor(path?: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
