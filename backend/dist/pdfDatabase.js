"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const pdfDbPath = path_1.default.join(__dirname, '..', '..', 'database', 'pdf_metadata.db');
const pdfDb = new better_sqlite3_1.default(pdfDbPath);
pdfDb.exec(`
  CREATE TABLE IF NOT EXISTS pdfs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submissionId INTEGER NOT NULL,
    filePath TEXT NOT NULL,
    fileName TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
exports.default = pdfDb;
