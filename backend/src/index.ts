
import express from 'express';
import cors from 'cors';
import db from './database';
import pdfDb from './pdfDatabase';
import fs from 'fs-extra';
import path from 'path';
import { generatePdf } from './pdfGenerator';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Create certificates directory if it doesn't exist
const pdfsDir = path.join(__dirname, '..', 'certificates');
fs.ensureDirSync(pdfsDir);

app.post('/submit-form', async (req, res) => {
  const { formData } = req.body;
  try {
    // Insert into form_submissions.db
    const stmt = db.prepare('INSERT INTO submissions (data) VALUES (?)');
    const result = stmt.run(JSON.stringify(formData));
    const submissionId = result.lastInsertRowid as number;

    // Generate PDF
    const pdfFileName = `birth_certificate_${submissionId}_${Date.now()}.pdf`;
    const pdfFilePath = path.join(pdfsDir, pdfFileName);
    
    try {
      await generatePdf(submissionId, pdfFilePath);
      
      // Insert PDF metadata into pdf_metadata.db
      const pdfStmt = pdfDb.prepare('INSERT INTO pdfs (submissionId, filePath, fileName) VALUES (?, ?, ?)');
      const pdfResult = pdfStmt.run(submissionId, pdfFilePath, pdfFileName);
      const pdfId = pdfResult.lastInsertRowid;

      res.status(200).json({ 
        message: 'Form data submitted and PDF generated successfully!', 
        pdfId: pdfId,
        submissionId: submissionId,
        pdfFileName: pdfFileName
      });
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      res.status(500).json({ 
        message: 'Form submitted but PDF generation failed', 
        submissionId: submissionId,
        error: 'PDF generation failed'
      });
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ 
      message: 'Error submitting form data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint to serve PDFs
app.get('/pdf/:id', (req, res) => {
  const pdfId = req.params.id;
  try {
    const stmt = pdfDb.prepare('SELECT filePath FROM pdfs WHERE id = ?');
    interface PdfResult { filePath: string; }
    const result = stmt.get(pdfId) as PdfResult;

    if (result && result.filePath && fs.existsSync(result.filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="birth_certificate.pdf"');
      res.sendFile(result.filePath);
    } else {
      res.status(404).json({ message: 'PDF not found.' });
    }
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({ message: 'Error serving PDF.' });
  }
});

// Endpoint to get all PDFs
app.get('/pdfs', (req, res) => {
  try {
    const stmt = pdfDb.prepare(`
      SELECT p.id, p.submissionId, p.fileName, p.filePath, s.data, p.createdAt
      FROM pdfs p
      LEFT JOIN submissions s ON p.submissionId = s.id
      ORDER BY p.createdAt DESC
    `);
    const results = stmt.all();
    
    const pdfs = results.map((row: any) => ({
      id: row.id,
      submissionId: row.submissionId,
      fileName: row.fileName,
      submissionData: row.data ? JSON.parse(row.data) : null,
      createdAt: row.createdAt
    }));
    
    res.json(pdfs);
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    res.status(500).json({ message: 'Error fetching PDFs.' });
  }
});

// Endpoint to get submission data
app.get('/submission/:id', (req, res) => {
  const submissionId = req.params.id;
  try {
    const stmt = db.prepare('SELECT data FROM submissions WHERE id = ?');
    const result = stmt.get(submissionId) as { data: string };

    if (result && result.data) {
      res.json(JSON.parse(result.data));
    } else {
      res.status(404).json({ message: 'Submission not found.' });
    }
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Error fetching submission.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
  console.log(`Certificates directory: ${pdfsDir}`);
});
