package com.example.pdf;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Map;

@Service
public class PdfService {
    public byte[] generate(Map<String, Object> data) {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 18);
                cs.newLineAtOffset(70, 720);
                cs.showText("Official Birth Certificate");
                cs.endText();

                float y = 690;
                y = writeField(cs, 12, 70, y, "First Name", str(data.get("firstName")));
                y = writeField(cs, 12, 70, y, "Middle Name", str(data.get("middleName")));
                y = writeField(cs, 12, 70, y, "Last Name", str(data.get("lastName")));
                y = writeField(cs, 12, 70, y, "Date of Birth", str(data.get("dateOfBirth")));
                y = writeField(cs, 12, 70, y, "Time of Birth", str(data.get("timeOfBirth")));
                y = writeField(cs, 12, 70, y, "Place of Birth", str(data.get("placeOfBirth")));
                y = writeField(cs, 12, 70, y, "Gender", str(data.get("gender")));

                y = writeField(cs, 12, 70, y, "Mother's Name", str(data.get("motherName")));
                y = writeField(cs, 12, 70, y, "Mother's Aadhaar", str(data.get("motherAadhaarNumber")));

                y = writeField(cs, 12, 70, y, "Father's Name", str(data.get("fatherName")));
                y = writeField(cs, 12, 70, y, "Father's Aadhaar", str(data.get("fatherAadhaarNumber")));

                y = writeField(cs, 12, 70, y, "Registration Number", str(data.get("registrationNumber")));
                y = writeField(cs, 12, 70, y, "Issuing Authority", str(data.get("issuingAuthority")));
                y = writeField(cs, 12, 70, y, "Certificate URL", str(data.get("certificateUrl")));
            }

            doc.save(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private static float writeField(PDPageContentStream cs, int fontSize, float x, float y, String label, String value) throws Exception {
        if (y < 80) y = 720; // naive wrap to new page top if needed
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA, fontSize);
        cs.newLineAtOffset(x, y);
        cs.showText(label + ": " + (value == null ? "" : value));
        cs.endText();
        return y - 18;
    }

    private static String str(Object o) {
        return o == null ? null : o.toString();
    }
}


