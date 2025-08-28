package com.example.api;

import com.example.pdf.PdfService;
import com.example.storage.CertificateRepository;
import com.example.kafka.CertificateEventProducer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Collections;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping
public class CertificateController {
    private final CertificateRepository repository;
    private final PdfService pdfService;
    private final CertificateEventProducer eventProducer;

    public CertificateController(CertificateRepository repository, PdfService pdfService, CertificateEventProducer eventProducer) {
        this.repository = repository;
        this.pdfService = pdfService;
        this.eventProducer = eventProducer;
    }

@PostMapping(path = "/api/v1/birth-certificates", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@SuppressWarnings("unchecked")
public ResponseEntity<?> createV1(
        @RequestPart("data") String dataJson,
        @RequestPart(value = "fatherAadhaarFile", required = false) org.springframework.web.multipart.MultipartFile fatherAadhaarFile,
        @RequestPart(value = "motherAadhaarFile", required = false) org.springframework.web.multipart.MultipartFile motherAadhaarFile
) {
    try {
        // Parse JSON data
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        java.util.Map<String, Object> payload = mapper.readValue(dataJson, java.util.Map.class);

        // Handle file uploads (store path or process as needed)
        if (fatherAadhaarFile != null && !fatherAadhaarFile.isEmpty()) {
            String fatherFileName = "father_" + System.currentTimeMillis() + "_" + fatherAadhaarFile.getOriginalFilename();
            payload.put("father_aadhaar_file_path", fatherFileName);
        }
        if (motherAadhaarFile != null && !motherAadhaarFile.isEmpty()) {
            String motherFileName = "mother_" + System.currentTimeMillis() + "_" + motherAadhaarFile.getOriginalFilename();
            payload.put("mother_aadhaar_file_path", motherFileName);
        }

        // Generate PDF
        byte[] pdf = pdfService.generate(payload);
        
        // Store data and PDF
        long id = repository.insert(payload, pdf);
        payload.put("id", id);
        
        try { 
            eventProducer.publishCertificateCreated(id, payload); 
        } catch (Exception ignored) {}
        
        return ResponseEntity.ok(payload);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest().body("Failed to process application: " + e.getMessage());
    }
}

    @GetMapping("/health")
    public Map<String, String> health() {
        return Collections.singletonMap("status", "ok");
    }

    @PostMapping(path = "/api/certificates", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> create(@RequestBody Map<String, Object> payload) {
        byte[] pdf = pdfService.generate(payload);
        long id = repository.insert(payload, pdf);
        try { eventProducer.publishCertificateCreated(id, payload); } catch (Exception ignored) {}
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"birth-certificate-" + id + ".pdf\"")
                .header("X-Certificate-Id", String.valueOf(id))
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping(path = "/api/certificates/{id}.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> get(@PathVariable("id") long id) {
        Map<String, Object> data = repository.findById(id);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] pdf = pdfService.generate(data);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"birth-certificate-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // New endpoint for frontend preview compatibility
    @GetMapping(path = "/api/v1/birth-certificates/{id}/certificate", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getV1Certificate(@PathVariable("id") long id) {
        byte[] pdf = repository.findPdfById(id);
        if (pdf == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"birth-certificate-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}


