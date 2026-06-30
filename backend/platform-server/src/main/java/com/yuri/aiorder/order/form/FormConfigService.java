package com.yuri.aiorder.order.form;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FormConfigService {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;

    public FormConfigService(JdbcClient jdbcClient, ObjectMapper objectMapper) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
    }

    public List<FormFieldConfigResponse> listActiveFields(String productType) {
        String productFilter = productType == null || productType.isBlank()
                ? null
                : productType.trim().toUpperCase(java.util.Locale.ROOT);
        JdbcClient.StatementSpec spec = jdbcClient.sql("""
                        SELECT field_id, product_type, field_key, field_label, field_type,
                               options_json, required_flag, sort_order
                        FROM form_field_config
                        WHERE status = 'ACTIVE'
                          AND (:productType IS NULL OR product_type = :productType)
                        ORDER BY product_type, sort_order, field_id
                        """)
                .param("productType", productFilter);
        return spec.query((rs, rowNum) -> new FormFieldConfigResponse(
                        rs.getLong("field_id"),
                        rs.getString("product_type"),
                        rs.getString("field_key"),
                        rs.getString("field_label"),
                        rs.getString("field_type"),
                        rs.getInt("required_flag") == 1,
                        readOptions(rs.getString("options_json")),
                        rs.getInt("sort_order")))
                .list();
    }

    private List<String> readOptions(String optionsJson) {
        if (optionsJson == null || optionsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(optionsJson, new TypeReference<>() {
            });
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "invalid form options json", ex);
        }
    }
}
