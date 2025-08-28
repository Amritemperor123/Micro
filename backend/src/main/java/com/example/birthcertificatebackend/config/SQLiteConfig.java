package com.example.birthcertificatebackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import java.io.File;

@Configuration
public class SQLiteConfig {
    @Bean
    public DataSource dataSource() {
        // Ensure data directory exists (works both locally and in container at /app)
        File dataDir = new File("data");
        if (!dataDir.exists()) {
            // noinspection ResultOfMethodCallIgnored
            dataDir.mkdirs();
        }

        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("org.sqlite.JDBC");
        ds.setUrl("jdbc:sqlite:" + new File("data/certificates.db").getAbsolutePath());
        return ds;
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        
        // Initialize schema if table doesn't exist
        try {
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS birth_certificates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name TEXT NOT NULL,
                    middle_name TEXT,
                    last_name TEXT NOT NULL,
                    date_of_birth TEXT NOT NULL,
                    gender TEXT NOT NULL,
                    time_of_birth TEXT,
                    place_of_birth TEXT NOT NULL,
                    father_name TEXT NOT NULL,
                    father_aadhaar_number TEXT NOT NULL,
                    father_aadhaar_file_path TEXT,
                    mother_name TEXT NOT NULL,
                    mother_aadhaar_number TEXT NOT NULL,
                    mother_aadhaar_file_path TEXT,
                    issuing_authority TEXT,
                    registration_number TEXT,
                    aadhaar_consent_given INTEGER NOT NULL,
                    aadhaar_consent_timestamp TEXT,
                    status TEXT NOT NULL,
                    certificate_pdf_path TEXT
                )
                """);
            System.out.println("Database schema initialized successfully");
        } catch (Exception e) {
            System.err.println("Error initializing database schema: " + e.getMessage());
            e.printStackTrace();
        }
        
        return jdbcTemplate;
    }
}
