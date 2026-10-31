import { chmodSync, closeSync, constants, existsSync, fstatSync, lstatSync, mkdirSync, openSync, realpathSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

export function openSqlite(filename: string) {
  const path = resolve(filename);
  const directory = dirname(path);
  const isInside = (root: string, target: string) => {
    const rel = relative(root, target);
    return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
  };
  const assertPrivateLocation = (target: string) => {
    for (const name of ["public", "out", ".next"]) {
      const root = resolve(/* turbopackIgnore: true */ name);
      if (isInside(root, target) || (existsSync(/* turbopackIgnore: true */ root) && isInside(realpathSync(/* turbopackIgnore: true */ root), target))) {
        throw new Error("SQLite harus berada di direktori privat, bukan folder publik/build.");
      }
    }
  };
  if (![".sqlite", ".sqlite3", ".db"].includes(extname(path))) throw new Error("SQLITE_PATH harus berupa file .sqlite, .sqlite3, atau .db.");
  assertPrivateLocation(path);
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  assertPrivateLocation(realpathSync(directory));
  if (process.platform !== "win32" && (statSync(directory).mode & 0o077) !== 0) {
    throw new Error("Direktori SQLite harus privat (chmod 700) agar DB, WAL, dan backup tidak terbaca pengguna lain.");
  }
  // Create privately before SQLite opens the file; reject symlinks and special files.
  const fd = openSync(path, constants.O_CREAT | constants.O_RDWR | constants.O_NOFOLLOW, 0o600);
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.nlink !== 1) throw new Error("SQLITE_PATH harus berupa file biasa tanpa hard link.");
  } finally { closeSync(fd); }
  chmodSync(path, 0o600);
  const client = new Database(path, { timeout: 5000 });
  try {
    client.pragma("foreign_keys = ON");
    client.pragma("journal_mode = WAL");
    client.pragma("synchronous = FULL");
    client.pragma("trusted_schema = OFF");
    return client;
  } catch (error) { client.close(); throw error; }
}

export async function backupSqlite(client: Database.Database) {
  const directory = resolve(dirname(client.name), "backups");
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  if (lstatSync(directory).isSymbolicLink()) throw new Error("Direktori backup tidak boleh berupa symlink.");
  if (process.platform !== "win32" && (statSync(directory).mode & 0o077) !== 0) throw new Error("Direktori backup harus privat (chmod 700).");
  const path = resolve(directory, `${new Date().toISOString().replaceAll(":", "-")}-${randomUUID()}.sqlite`);
  closeSync(openSync(path, "wx", 0o600));
  await client.backup(path);
  return path;
}
