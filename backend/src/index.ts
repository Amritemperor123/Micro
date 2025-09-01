
import express from 'express';
import cors from 'cors';
import db from './database';
import pdfDb from './pdfDatabase';
import { verifyAdmin } from './adminDatabase';
import fs from 'fs-extra';
import path from 'path';
import { generatePdf } from './pdfGenerator';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create certificates directory if it doesn't exist
const pdfsDir = path.join(__dirname, '..', '..', 'database', 'certificates');
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
    // Get all PDFs from pdf_metadata.db
    const pdfStmt = pdfDb.prepare(`
      SELECT id, submissionId, fileName, filePath, createdAt
      FROM pdfs
      ORDER BY createdAt DESC
    `);
    const pdfResults = pdfStmt.all();
    
    // Get submission data for each PDF
    const pdfs = pdfResults.map((pdf: any) => {
      let submissionData = null;
      
      try {
        // Get submission data from form_submissions.db
        const submissionStmt = db.prepare('SELECT data FROM submissions WHERE id = ?');
        const submissionResult = submissionStmt.get(pdf.submissionId) as { data: string } | undefined;
        
        if (submissionResult && submissionResult.data) {
          submissionData = JSON.parse(submissionResult.data);
        }
      } catch (submissionError) {
        console.error(`Error fetching submission ${pdf.submissionId}:`, submissionError);
      }
      
      return {
        id: pdf.id,
        submissionId: pdf.submissionId,
        fileName: pdf.fileName,
        submissionData: submissionData,
        createdAt: pdf.createdAt
      };
    });
    
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

// Admin authentication endpoint
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      message: 'Username and password are required' 
    });
  }

  const isValid = verifyAdmin(username, password);
  
  if (isValid) {
    res.status(200).json({ 
      message: 'Login successful',
      authenticated: true
    });
  } else {
    res.status(401).json({ 
      message: 'Invalid credentials',
      authenticated: false
    });
  }
});

// Protected endpoint to verify admin access
app.post('/admin/verify', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      message: 'Username and password are required' 
    });
  }

  const isValid = verifyAdmin(username, password);
  
  if (isValid) {
    res.status(200).json({ 
      message: 'Access granted',
      authenticated: true
    });
  } else {
    res.status(401).json({ 
      message: 'Access denied',
      authenticated: false
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
  console.log(`Certificates directory: ${pdfsDir}`);
});
