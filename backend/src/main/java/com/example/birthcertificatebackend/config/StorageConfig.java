package com.example.birthcertificatebackend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class StorageConfig {
    @PostConstruct
    public void ensureStorageDirs() {
        try {
            Path base = Path.of(System.getProperty("user.dir"), "backend", "storage");
            Files.createDirectories(base);
            Files.createDirectories(base.resolve("aadhaar-documents"));
        } catch (Exception ignored) {
        }
    }
}


