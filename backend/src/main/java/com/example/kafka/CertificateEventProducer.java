package com.example.kafka;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CertificateEventProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final String topicName;

    public CertificateEventProducer(KafkaTemplate<String, String> kafkaTemplate,
                                    @Value("${app.certificate.topic}") String topicName) {
        this.kafkaTemplate = kafkaTemplate;
        this.topicName = topicName;
    }

    public void publishCertificateCreated(long id, Map<String, Object> payload) {
        String json = toJson(id, payload);
        kafkaTemplate.send(topicName, String.valueOf(id), json);
    }

    private String toJson(long id, Map<String, Object> payload) {
        StringBuilder sb = new StringBuilder();
        sb.append('{');
        sb.append("\"type\":\"certificate.created\",");
        sb.append("\"id\":").append(id).append(',');
        sb.append("\"payload\":").append(mapToJson(payload));
        sb.append('}');
        return sb.toString();
    }

    private String mapToJson(Map<String, Object> map) {
        if (map == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append('{');
        boolean first = true;
        for (Map.Entry<String, Object> e : map.entrySet()) {
            if (!first) sb.append(',');
            first = false;
            sb.append('"').append(escape(e.getKey())).append('"').append(':');
            Object v = e.getValue();
            if (v == null) {
                sb.append("null");
            } else if (v instanceof Number || v instanceof Boolean) {
                sb.append(String.valueOf(v));
            } else {
                sb.append('"').append(escape(String.valueOf(v))).append('"');
            }
        }
        sb.append('}');
        return sb.toString();
    }

    private String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}


