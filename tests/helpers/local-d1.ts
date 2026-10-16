import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
const migrations = () =>
  readdirSync("migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync("migrations/" + f, "utf8"))
    .join("\n");
export class SqlStatement {
  constructor(
    private db: DatabaseSync,
    private sql: string,
    private values: SQLInputValue[] = [],
  ) {}
  bind(...v: SQLInputValue[]) {
    return new SqlStatement(this.db, this.sql, v);
  }
  async first() {
    return this.db.prepare(this.sql).get(...this.values) ?? null;
  }
  async all() {
    return {
      results: this.db.prepare(this.sql).all(...this.values),
      success: true,
    };
  }
  runSync() {
    const result = this.db.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(result.changes) } };
  }
  async run() {
    return this.runSync();
  }
}
export class LocalD1 {
  db = new DatabaseSync(":memory:");
  constructor() {
    this.db.exec(migrations());
  }
  prepare(sql: string) {
    return new SqlStatement(this.db, sql);
  }
  async batch(statements: SqlStatement[]) {
    this.db.exec("BEGIN");
    try {
      const results = [];
      for (const statement of statements) results.push(statement.runSync());
      this.db.exec("COMMIT");
      return results;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
}
