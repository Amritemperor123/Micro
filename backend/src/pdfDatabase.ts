
import Database from 'better-sqlite3';
import path from 'path';

const pdfDbPath = path.join(__dirname, '..', 'pdf_metadata.db');
const pdfDb = new Database(pdfDbPath);

pdfDb.exec(`
  CREATE TABLE IF NOT EXISTS pdfs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submissionId INTEGER NOT NULL,
    filePath TEXT NOT NULL,
    fileName TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default pdfDb;
