# Birth Certificate Microservice

A complete end-to-end microservice that handles birth certificate applications, stores data locally, generates PDFs, and provides a web interface for management.

## Quick Start

1. **Backend**: `http://localhost:3001`
2. **Frontend**: `http://localhost:8080`

## Features

- **Form Submission**: Complete birth certificate application form with validation
- **Local Data Storage**: SQLite database for form submissions and PDF metadata
- **PDF Generation**: Automatic PDF generation with professional formatting
- **PDF Management**: View, download, and manage all generated certificates
- **Modern UI**: React-based frontend with shadcn/ui components
- **Real-time Updates**: Automatic PDF opening after form submission

## Architecture

### Backend (Node.js + Express + TypeScript)
- **Server**: Express.js server running on port 3001
- **Database**: SQLite with two databases:
  - `form_submissions.db`: Stores form data
  - `pdf_metadata.db`: Stores PDF file information
- **PDF Generation**: PDFKit for creating professional birth certificates
- **File Storage**: Local `certificates/` folder for PDF storage

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript
- **UI Components**: shadcn/ui component library
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React hooks for local state
- **Server**: Vite dev server on port 8080

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd birth-certificate-microservice
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run build
   npm start
   ```
   The backend will run on `http://localhost:3001`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:8080`

3. **Open your browser** and navigate to `http://localhost:8080`

## Usage

### Submitting a Birth Certificate Application

1. Navigate to the "Submit Application" tab
2. Fill out the complete birth certificate form including:
   - Personal information (name, date of birth, gender, etc.)
   - Father's information (name, Aadhaar number)
   - Mother's information (name, Aadhaar number)
   - Official information (issuing authority, registration number)
3. Provide Aadhaar consent when prompted
4. Submit the form
5. The PDF will be automatically generated and opened in a new tab

### Managing Generated PDFs

1. Navigate to the "View Certificates" tab
2. View all generated birth certificates with submission details
3. Use the "View" button to open PDFs in a new tab
4. Use the "Download" button to save PDFs locally
5. Refresh the list to see new certificates

## API Endpoints

### Backend API

- `POST /submit-form` - Submit birth certificate application
- `GET /pdf/:id` - View/download a specific PDF
- `GET /pdfs` - List all generated PDFs
- `GET /submission/:id` - Get submission data by ID

### Request/Response Examples

**Submit Form:**
```json
POST /submit-form
{
  "formData": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "placeOfBirth": "Mumbai",
    "fatherName": "John Doe Sr.",
    "fatherAadhaarNumber": "123456789012",
    "motherName": "Jane Doe",
    "motherAadhaarNumber": "987654321098"
  }
}
```

**Response:**
```json
{
  "message": "Form data submitted and PDF generated successfully!",
  "pdfId": 1,
  "submissionId": 1,
  "pdfFileName": "birth_certificate_1_1234567890.pdf"
}
```

## Database Schema

### Form Submissions Table
```sql
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT
);
```

### PDF Metadata Table
```sql
CREATE TABLE pdfs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submissionId INTEGER NOT NULL,
  filePath TEXT NOT NULL,
  fileName TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## File Structure

```
├── backend/
│   ├── src/
│   │   ├── index.ts          # Main server file
│   │   ├── database.ts       # Form submissions database
│   │   └── pdfDatabase.ts    # PDF metadata database
│   ├── pdfGenerator.ts       # PDF generation logic
│   ├── certificates/         # Generated PDF storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BirthCertificateForm.tsx
│   │   │   ├── PdfList.tsx
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── types/
│   │   │   └── birth-certificate.ts
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## PDF Features

The generated PDFs include:
- Professional header with "BIRTH CERTIFICATE" title
- Government of India branding
- Unique certificate number
- Organized sections for personal, father's, and mother's information
- Official information section (if provided)
- Generation timestamp and certificate ID
- Professional formatting with proper fonts and spacing

## Development

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

### Environment Variables

The application currently uses default localhost URLs. For production, update the frontend API calls to use environment variables:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

## Troubleshooting

### Common Issues

1. **PDF not opening**: Ensure the backend server is running and the certificates folder exists
2. **Database errors**: Check that the backend has write permissions to create SQLite databases
3. **CORS issues**: The backend includes CORS middleware, but ensure your frontend URL is allowed
4. **Port conflicts**: 
   - Backend: Change port in `backend/src/index.ts` if 3001 is occupied
   - Frontend: Change port in `frontend/vite.config.ts` if 8080 is occupied

### Logs

Check the backend console for:
- Server startup messages
- Database connection status
- PDF generation logs
- Error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please check the troubleshooting section or create an issue in the repository.
