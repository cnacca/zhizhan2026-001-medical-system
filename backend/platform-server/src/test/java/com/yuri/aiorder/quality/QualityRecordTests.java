package com.yuri.aiorder.quality;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class QualityRecordTests {

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private MockMvc mockMvc;

    private long orderId;
    private String orderNo;
    private String productType;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        productType = "quality-" + suffix.substring(0, 8);
        long clinicId = createClinic("质量记录测试诊所-" + suffix.substring(0, 8));
        orderNo = "QR" + suffix.substring(0, 12);
        orderId = createOrder(orderNo, clinicId, productType);
    }

    @Test
    void csCanRegisterExternalReturnAndListQualityRecords() throws Exception {
        mockMvc.perform(post("/quality-records/external-returns")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", 8801L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "order_id": %d,
                                  "reason_category": "FIT_ISSUE",
                                  "responsibility_type": "DOCTOR",
                                  "reason_detail": "医生退回重做边缘适配"
                                }
                                """.formatted(orderId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.quality_record_type").value("EXTERNAL_RETURN"))
                .andExpect(jsonPath("$.data.order_id").value(orderId))
                .andExpect(jsonPath("$.data.order_no").value(orderNo))
                .andExpect(jsonPath("$.data.check_result").value("FAIL"))
                .andExpect(jsonPath("$.data.rework_id").isNumber())
                .andExpect(jsonPath("$.data.responsibility_type").value("DOCTOR"))
                .andExpect(jsonPath("$.data.reason_category").value("FIT_ISSUE"))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$").value(not(containsString("password_hash"))));

        mockMvc.perform(get("/quality-records")
                        .header("X-Bootstrap-Role", "ADMIN")
                        .header("X-Bootstrap-User-Id", 8802L)
                        .param("record_type", "EXTERNAL_RETURN")
                        .param("order_id", String.valueOf(orderId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].quality_record_type").value("EXTERNAL_RETURN"))
                .andExpect(jsonPath("$.data.items[0].order_no").value(orderNo))
                .andExpect(jsonPath("$.data.items[0].responsibility_type").value("DOCTOR"))
                .andExpect(jsonPath("$.data.items[0].reason_detail").value("医生退回重做边缘适配"));

        mockMvc.perform(get("/production/quality/summary")
                        .header("X-Bootstrap-Role", "ADMIN")
                        .header("X-Bootstrap-User-Id", 8803L)
                        .param("product_type", productType))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.external_rework_count").value(1));
    }

    @Test
    void qualityRecordsCanFilterByStatusAndResponsibilityType() throws Exception {
        seedExternalReturn(orderId, "DOCTOR", "FIT_ISSUE", "医生退回");
        seedExternalReturn(orderId, "CS", "MARGIN_ISSUE", "客服录入异常");

        mockMvc.perform(get("/quality-records")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", 8804L)
                        .param("order_id", String.valueOf(orderId))
                        .param("status", "PENDING")
                        .param("responsibility_type", "CS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].responsibility_type").value("CS"))
                .andExpect(jsonPath("$.data.items[0].reason_category").value("MARGIN_ISSUE"));
    }

    @Test
    void doctorCannotReadOrCreateInternalQualityRecords() throws Exception {
        mockMvc.perform(get("/quality-records")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", 8805L)
                        .header("X-Bootstrap-Clinic-Id", 1L))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/quality-records/external-returns")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", 8805L)
                        .header("X-Bootstrap-Clinic-Id", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "order_id": %d,
                                  "reason_category": "FIT_ISSUE",
                                  "responsibility_type": "DOCTOR",
                                  "reason_detail": "医生端不能直接写内部质量记录"
                                }
                                """.formatted(orderId)))
                .andExpect(status().isForbidden());
    }

    private long createClinic(String clinicName) {
        jdbcClient.sql("""
                        INSERT INTO clinic (clinic_name, contact_name, status)
                        VALUES (:clinicName, '质量联系人', 'ACTIVE')
                        """)
                .param("clinicName", clinicName)
                .update();
        return jdbcClient.sql("SELECT LAST_INSERT_ID()")
                .query(Long.class)
                .single();
    }

    private long createOrder(String targetOrderNo, long clinicId, String targetProductType) {
        jdbcClient.sql("""
                        INSERT INTO orders
                            (order_no, clinic_id, product_type, form_data, internal_status, external_status)
                        VALUES
                            (:orderNo, :clinicId, :productType, JSON_OBJECT(), 'SHIPPED', 'SHIPPED')
                        """)
                .param("orderNo", targetOrderNo)
                .param("clinicId", clinicId)
                .param("productType", targetProductType)
                .update();
        return jdbcClient.sql("SELECT LAST_INSERT_ID()")
                .query(Long.class)
                .single();
    }

    private void seedExternalReturn(
            long targetOrderId, String responsibilityType, String reasonCategory, String reasonDetail) {
        jdbcClient.sql("""
                        INSERT INTO check_record
                            (order_id, node_instance_id, check_type, result, checker_user_id, note)
                        VALUES
                            (:orderId, NULL, 'EXTERNAL_RETURN', 'FAIL', 8800, :note)
                        """)
                .param("orderId", targetOrderId)
                .param("note", reasonDetail)
                .update();
        long checkId = jdbcClient.sql("SELECT LAST_INSERT_ID()")
                .query(Long.class)
                .single();
        jdbcClient.sql("""
                        INSERT INTO rework_record
                            (order_id, source_check_id, reason_category, reason_detail, responsibility_type, status)
                        VALUES
                            (:orderId, :checkId, :reasonCategory, :reasonDetail, :responsibilityType, 'PENDING')
                        """)
                .param("orderId", targetOrderId)
                .param("checkId", checkId)
                .param("reasonCategory", reasonCategory)
                .param("reasonDetail", reasonDetail)
                .param("responsibilityType", responsibilityType)
                .update();
    }
}
