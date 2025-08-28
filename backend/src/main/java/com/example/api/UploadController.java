package com.example.api;

import com.example.storage.SupabaseStorageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class UploadController {
    private final SupabaseStorageService storageService;

    public UploadController(SupabaseStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(path = "/api/uploads/aadhaar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadAadhaar(
            @RequestPart(value = "motherAadhaar", required = false) MultipartFile motherAadhaar,
            @RequestPart(value = "fatherAadhaar", required = false) MultipartFile fatherAadhaar,
            @RequestPart(value = "registrationNumber", required = false) String registrationNumber
    ) {
        Map<String, Object> result = new HashMap<>();
        if (registrationNumber != null) {
            result.put("registrationNumber", registrationNumber);
        }

        if (motherAadhaar != null && !motherAadhaar.isEmpty()) {
            String motherPath = generatePath(motherAadhaar.getOriginalFilename());
            try {
                storageService.upload("aadhaar-uploads", motherPath, motherAadhaar.getBytes(), motherAadhaar.getContentType());
                result.put("motherAadhaarPath", "aadhaar-uploads/" + motherPath);
            } catch (Exception e) {
                result.put("motherAadhaarError", e.toString());
            }
        }

        if (fatherAadhaar != null && !fatherAadhaar.isEmpty()) {
            String fatherPath = generatePath(fatherAadhaar.getOriginalFilename());
            try {
                storageService.upload("aadhaar-uploads", fatherPath, fatherAadhaar.getBytes(), fatherAadhaar.getContentType());
                result.put("fatherAadhaarPath", "aadhaar-uploads/" + fatherPath);
            } catch (Exception e) {
                result.put("fatherAadhaarError", e.toString());
            }
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping(path = "/api/uploads/health")
    public Map<String, String> health() {
        Map<String, String> m = new HashMap<>();
        m.put("status", "ok");
        return m;
    }

    private static String generatePath(String originalName) {
        String ext = "";
        if (originalName != null) {
            int dot = originalName.lastIndexOf('.')
;            if (dot >= 0 && dot < originalName.length() - 1) {
                ext = originalName.substring(dot);
            }
        }
        return UUID.randomUUID().toString() + ext;
    }
}


