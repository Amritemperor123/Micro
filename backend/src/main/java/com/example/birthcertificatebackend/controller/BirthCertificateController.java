package com.example.birthcertificatebackend.controller;

import com.example.birthcertificatebackend.dto.BirthCertificateRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/v1/birth-certificates")
public class BirthCertificateController {

    private final JdbcTemplate jdbc;

    public BirthCertificateController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(@RequestPart("data") BirthCertificateRequest data,
                                    @RequestPart(value = "fatherAadhaarFile", required = false) MultipartFile father,
                                    @RequestPart(value = "motherAadhaarFile", required = false) MultipartFile mother
    ) throws Exception {
        Path storage = Path.of(System.getProperty("user.dir"), "storage", "aadhaar-documents");
        Files.createDirectories(storage);

        String fatherPath = null;
        String motherPath = null;
        if (father != null && !father.isEmpty()) {
            Path dest = storage.resolve("father_" + System.currentTimeMillis() + ext(father.getOriginalFilename()));
            Files.copy(father.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            fatherPath = dest.toString();
        }
        if (mother != null && !mother.isEmpty()) {
            Path dest = storage.resolve("mother_" + System.currentTimeMillis() + ext(mother.getOriginalFilename()));
            Files.copy(mother.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            motherPath = dest.toString();
        }

        String status = "submitted";
        String now = OffsetDateTime.now().toString();
        jdbc.update("insert into birth_certificates (first_name,middle_name,last_name,date_of_birth,gender,time_of_birth,place_of_birth,father_name,father_aadhaar_number,father_aadhaar_file_path,mother_name,mother_aadhaar_number,mother_aadhaar_file_path,issuing_authority,registration_number,aadhaar_consent_given,aadhaar_consent_timestamp,status) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                data.firstName, data.middleName, data.lastName, data.dateOfBirth, data.gender, data.timeOfBirth, data.placeOfBirth,
                data.fatherName, data.fatherAadhaarNumber, fatherPath, data.motherName, data.motherAadhaarNumber, motherPath,
                data.issuingAuthority, data.registrationNumber, Boolean.TRUE.equals(data.aadhaarConsentGiven) ? 1 : 0, now, status);

        Long id = jdbc.queryForObject("select last_insert_rowid()", Long.class);

        // For simplicity, skip PDF generation in this minimal backend. Frontend opens download endpoint only when exists.
        return ResponseEntity.ok().body(new IdResponse(id));
    }

    @GetMapping("/{id}/certificate")
    public ResponseEntity<byte[]> viewCertificate(@PathVariable Long id) throws Exception {
        try {
            String path = jdbc.queryForObject("select certificate_pdf_path from birth_certificates where id=?", String.class, id);
            Path p = Path.of(path);
            if (!Files.exists(p)) return ResponseEntity.notFound().build();
            byte[] bytes = Files.readAllBytes(p);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + p.getFileName())
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(bytes);
        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.notFound().build();
        }
    }

    static class IdResponse { public Long id; IdResponse(Long id){ this.id=id; } }

    private static String ext(String original) {
        if (original == null) return "";
        int i = original.lastIndexOf('.');
        return i >= 0 ? original.substring(i) : "";
    }
}


