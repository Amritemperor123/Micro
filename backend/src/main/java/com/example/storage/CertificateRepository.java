package com.example.storage;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import jakarta.annotation.PostConstruct;
import java.util.Map;

@Repository
public class CertificateRepository {
    private final JdbcTemplate jdbcTemplate;

    public CertificateRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS certificates (\n" +
                "  id INTEGER PRIMARY KEY AUTOINCREMENT,\n" +
                "  payload TEXT NOT NULL,\n" +
                "  pdf_data BLOB,\n" +
                "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n" +
                ")");
    }

    public long insert(Map<String, Object> payload, byte[] pdfData) {
        jdbcTemplate.update("INSERT INTO certificates(payload, pdf_data) VALUES (?, ?)", 
            Json.toJson(payload), pdfData);
        Long id = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        return id == null ? -1L : id;
    }

    public Map<String, Object> findById(long id) {
        try {
            String json = jdbcTemplate.queryForObject(
                    "SELECT payload FROM certificates WHERE id=?",
                    String.class,
                    id
            );
            return Json.fromJson(json);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public byte[] findPdfById(long id) {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT pdf_data FROM certificates WHERE id=?",
                    byte[].class,
                    id
            );
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }
}


