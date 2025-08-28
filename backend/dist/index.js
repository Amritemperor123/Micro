"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./database"));
const pdfDatabase_1 = __importDefault(require("./pdfDatabase"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const pdfGenerator_1 = require("./pdfGenerator");
const app = (0, express_1.default)();
const port = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Create certificates directory if it doesn't exist
const pdfsDir = path_1.default.join(__dirname, '..', 'certificates');
fs_extra_1.default.ensureDirSync(pdfsDir);
app.post('/submit-form', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { formData } = req.body;
    try {
        // Insert into form_submissions.db
        const stmt = database_1.default.prepare('INSERT INTO submissions (data) VALUES (?)');
        const result = stmt.run(JSON.stringify(formData));
        const submissionId = result.lastInsertRowid;
        // Generate PDF
        const pdfFileName = `birth_certificate_${submissionId}_${Date.now()}.pdf`;
        const pdfFilePath = path_1.default.join(pdfsDir, pdfFileName);
        try {
            yield (0, pdfGenerator_1.generatePdf)(submissionId, pdfFilePath);
            // Insert PDF metadata into pdf_metadata.db
            const pdfStmt = pdfDatabase_1.default.prepare('INSERT INTO pdfs (submissionId, filePath, fileName) VALUES (?, ?, ?)');
            const pdfResult = pdfStmt.run(submissionId, pdfFilePath, pdfFileName);
            const pdfId = pdfResult.lastInsertRowid;
            res.status(200).json({
                message: 'Form data submitted and PDF generated successfully!',
                pdfId: pdfId,
                submissionId: submissionId,
                pdfFileName: pdfFileName
            });
        }
        catch (pdfError) {
            console.error('Error generating PDF:', pdfError);
            res.status(500).json({
                message: 'Form submitted but PDF generation failed',
                submissionId: submissionId,
                error: 'PDF generation failed'
            });
        }
    }
    catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({
            message: 'Error submitting form data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Endpoint to serve PDFs
app.get('/pdf/:id', (req, res) => {
    const pdfId = req.params.id;
    try {
        const stmt = pdfDatabase_1.default.prepare('SELECT filePath FROM pdfs WHERE id = ?');
        const result = stmt.get(pdfId);
        if (result && result.filePath && fs_extra_1.default.existsSync(result.filePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="birth_certificate.pdf"');
            res.sendFile(result.filePath);
        }
        else {
            res.status(404).json({ message: 'PDF not found.' });
        }
    }
    catch (error) {
        console.error('Error serving PDF:', error);
        res.status(500).json({ message: 'Error serving PDF.' });
    }
});
// Endpoint to get all PDFs
app.get('/pdfs', (req, res) => {
    try {
        const stmt = pdfDatabase_1.default.prepare(`
      SELECT p.id, p.submissionId, p.fileName, p.filePath, s.data, p.createdAt
      FROM pdfs p
      LEFT JOIN submissions s ON p.submissionId = s.id
      ORDER BY p.createdAt DESC
    `);
        const results = stmt.all();
        const pdfs = results.map((row) => ({
            id: row.id,
            submissionId: row.submissionId,
            fileName: row.fileName,
            submissionData: row.data ? JSON.parse(row.data) : null,
            createdAt: row.createdAt
        }));
        res.json(pdfs);
    }
    catch (error) {
        console.error('Error fetching PDFs:', error);
        res.status(500).json({ message: 'Error fetching PDFs.' });
    }
});
// Endpoint to get submission data
app.get('/submission/:id', (req, res) => {
    const submissionId = req.params.id;
    try {
        const stmt = database_1.default.prepare('SELECT data FROM submissions WHERE id = ?');
        const result = stmt.get(submissionId);
        if (result && result.data) {
            res.json(JSON.parse(result.data));
        }
        else {
            res.status(404).json({ message: 'Submission not found.' });
        }
    }
    catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ message: 'Error fetching submission.' });
    }
});
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    console.log(`Certificates directory: ${pdfsDir}`);
});
