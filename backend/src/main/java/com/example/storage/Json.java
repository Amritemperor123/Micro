package com.example.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

public class Json {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static String toJson(Map<String, Object> map) {
        try {
            return MAPPER.writeValueAsString(map);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Map<String, Object> fromJson(String json) {
        try {
            return MAPPER.readValue(json, new TypeReference<Map<String, Object>>(){});
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}


