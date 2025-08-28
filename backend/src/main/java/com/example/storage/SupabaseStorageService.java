package com.example.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class SupabaseStorageService {
    private final String supabaseUrl;
    private final String serviceRoleKey;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public SupabaseStorageService(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.service_role_key}") String serviceRoleKey
    ) {
        this.supabaseUrl = supabaseUrl;
        this.serviceRoleKey = serviceRoleKey;
    }

    public void upload(String bucket, String path, byte[] bytes, String contentType) {
        if (supabaseUrl == null || serviceRoleKey == null) {
            throw new IllegalStateException("Supabase URL or Service Role key is not configured");
        }
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl + "/storage/v1/object/" + bucket + "/" + path))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                    .header(HttpHeaders.CONTENT_TYPE, contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(bytes))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                String body = response.body();
                throw new RuntimeException("Supabase upload failed with status " + response.statusCode() + (body != null && !body.isEmpty() ? (": " + body) : ""));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload to Supabase Storage", e);
        }
    }
}


