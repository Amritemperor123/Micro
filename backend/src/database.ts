

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs-extra';

const dbPath = path.join(__dirname, '..', '..', 'database', 'form_submissions.db');

// Ensure the directory exists
fs.ensureDirSync(path.dirname(dbPath));

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT
  )
`);

export default db;
