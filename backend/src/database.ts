

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'form_submissions.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT
  )
`);

export default db;
