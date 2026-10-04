import initSqlJs from "sql.js";
import { join } from "node:path";

const sqlReady = initSqlJs({
  locateFile: (file) => join(process.cwd(), "node_modules", "sql.js", "dist", file),
});

const schema = `
  CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT, score INTEGER, course_id INTEGER);
  INSERT INTO students VALUES
    (1, 'Asha Patel', 'asha@example.test', 96, 1),
    (2, 'Mateo Ruiz', 'mateo@example.test', 88, 2),
    (3, 'Zara Khan', 'zara@example.test', 91, 1),
    (4, 'Noah Kim', 'noah@example.test', 74, 3),
    (5, 'Mia Chen', 'mia@example.test', 84, 2),
    (6, 'Eli Johnson', 'eli@example.test', NULL, 1);

  CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, is_free INTEGER NOT NULL);
  INSERT INTO courses VALUES (1, 'HTML Foundations', 'Development', 1), (2, 'CSS Layout', 'Design', 1), (3, 'JavaScript Essentials', 'Development', 1);
  CREATE TABLE enrollments (student_id INTEGER NOT NULL, course_id INTEGER NOT NULL, enrolled_at TEXT DEFAULT CURRENT_DATE, score INTEGER);
  INSERT INTO enrollments VALUES (1, 1, '2026-01-12', 96), (2, 2, '2026-02-03', 88), (3, 1, '2026-02-18', 91), (4, 3, '2026-03-02', 74), (5, 2, '2026-03-15', 84);
  CREATE TABLE mentors (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL);
  INSERT INTO mentors VALUES (1, 'Priya Shah', 'priya@example.test'), (2, 'Leo Martin', 'leo@example.test');
  CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, balance REAL NOT NULL);
  INSERT INTO accounts VALUES (1, 'Asha Patel', 1250.00), (2, 'Mateo Ruiz', 840.50);
  CREATE TABLE passed_students (name TEXT NOT NULL, score INTEGER);
  CREATE TABLE colors (name TEXT PRIMARY KEY);
  INSERT INTO colors VALUES ('Blue'), ('Green'), ('Red');
  CREATE TABLE sizes (name TEXT PRIMARY KEY);
  INSERT INTO sizes VALUES ('Large'), ('Medium'), ('Small');

  CREATE TABLE workshops (id INTEGER PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, duration_minutes INTEGER NOT NULL, fee REAL, published INTEGER NOT NULL);
  INSERT INTO workshops VALUES
    (1, 'HTML Foundations', 'Development', 40, 25, 1),
    (2, 'CSS Layout Lab', 'Design', 55, 45, 1),
    (3, 'JavaScript Essentials', 'Development', 75, 60, 1),
    (4, 'Color Theory', 'Design', 35, 20, 1),
    (5, 'Advanced React', 'Development', 90, 80, 0),
    (6, 'Portfolio Review', 'Career', 30, NULL, 1);

  CREATE TABLE learners (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE);
  INSERT INTO learners VALUES
    (1, 'Asha Patel', 'asha@example.test'),
    (2, 'Mateo Ruiz', 'mateo@example.test'),
    (3, 'Zara Khan', 'zara@example.test');

  CREATE TABLE registrations (id INTEGER PRIMARY KEY, learner_id INTEGER NOT NULL, workshop_id INTEGER NOT NULL);
  INSERT INTO registrations VALUES (1, 1, 1), (2, 1, 2), (3, 2, 3), (4, 3, 2);
`;

export type SqlPracticeResult = { output: string; columns: string[]; rows: unknown[][] };

function formatValue(value: unknown) {
  if (value === null) return "NULL";
  if (typeof value === "string") return value;
  return String(value);
}

export async function executePracticeSql(query: string): Promise<SqlPracticeResult> {
  if (query.length > 10000) throw new Error("Keep practice queries under 10,000 characters.");
  const SQL = await sqlReady;
  const db = new SQL.Database();
  try {
    db.exec(schema);
    const prepared = query.match(/PREPARE\s+\w+\s+FROM\s+'((?:''|[^'])*)'\s*;\s*SET\s+@(\w+)\s*=\s*'((?:''|[^'])*)'\s*;\s*EXECUTE\s+\w+\s+USING\s+@\2\s*;?/i);
    const preparedQuery = prepared
      ? prepared[1].replace(/''/g, "'").replace("?", `'${prepared[3].replace(/'/g, "''")}'`)
      : query;
    const compatibleQuery = preparedQuery
      .replace(/\bINT\s+PRIMARY\s+KEY\s+AUTO_INCREMENT\b/gi, "INTEGER PRIMARY KEY AUTOINCREMENT")
      .replace(/\bAUTO_INCREMENT\b/gi, "AUTOINCREMENT")
      .replace(/\bDATE\s+'([^']+)'/gi, "'$1'")
      .replace(/\s+ENGINE\s*=\s*InnoDB\b/gi, "")
      .replace(/\bSTART\s+TRANSACTION\b/gi, "BEGIN")
      .replace(/\s+FOR\s+UPDATE\b/gi, "");
    const results = db.exec(compatibleQuery);
    if (!results.length) {
      return { output: `Query complete. ${db.getRowsModified()} row(s) affected.`, columns: [], rows: [] };
    }
    const result = results.at(-1)!;
    const rows = result.values as unknown[][];
    const output = [
      result.columns.join(" | "),
      ...rows.map((row) => row.map(formatValue).join(" | ")),
      `(${rows.length} row${rows.length === 1 ? "" : "s"})`,
    ].join("\n");
    return { output, columns: result.columns, rows };
  } finally {
    db.close();
  }
}

export async function comparePracticeSql(query: string, expectedQuery: string) {
  const [actual, expected] = await Promise.all([executePracticeSql(query), executePracticeSql(expectedQuery)]);
  return { ...actual, passed: actual.output === expected.output };
}
