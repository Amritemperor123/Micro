"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAdmins = exports.verifyAdmin = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const adminDbPath = path_1.default.join(__dirname, '..', '..', 'database', 'admin.db');
const adminDb = new better_sqlite3_1.default(adminDbPath);
// Ensure admin table exists
adminDb.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    admin TEXT PRIMARY KEY,
    password TEXT NOT NULL
  )
`);
// Check if admin user exists, if not create default
const checkAdmin = adminDb.prepare('SELECT COUNT(*) as count FROM admin WHERE admin = ?');
const adminExists = checkAdmin.get('admin123');
if (!adminExists || adminExists.count === 0) {
    const insertStmt = adminDb.prepare('INSERT INTO admin (admin, password) VALUES (?, ?)');
    insertStmt.run('admin123', 'admin123');
    console.log('Default admin user created: admin123 / admin123');
}
const verifyAdmin = (username, password) => {
    try {
        const stmt = adminDb.prepare('SELECT password FROM admin WHERE admin = ?');
        const result = stmt.get(username);
        if (result && result.password === password) {
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('Error verifying admin:', error);
        return false;
    }
};
exports.verifyAdmin = verifyAdmin;
const getAllAdmins = () => {
    try {
        const stmt = adminDb.prepare('SELECT admin FROM admin');
        const results = stmt.all();
        return results.map(row => row.admin);
    }
    catch (error) {
        console.error('Error fetching admins:', error);
        return [];
    }
};
exports.getAllAdmins = getAllAdmins;
exports.default = adminDb;
