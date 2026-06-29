package com.yuri.aiorder.order;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.yuri.aiorder.order.status.InternalOrderStatus;
import com.yuri.aiorder.order.status.OrderStatusService;
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
class OrderStatusProjectionTests {

    private static final long DOCTOR_USER_ID = 9001L;
    private static final long OTHER_DOCTOR_USER_ID = 9002L;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderStatusService statusService;

    private long clinicId;
    private long orderId;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        String clinicName = "测试诊所-" + suffix;
        String orderNo = "T" + suffix.substring(0, 12);

        jdbcClient.sql("INSERT INTO clinic (clinic_name) VALUES (:clinicName)")
                .param("clinicName", clinicName)
                .update();
        clinicId = jdbcClient.sql("SELECT clinic_id FROM clinic WHERE clinic_name = :clinicName")
                .param("clinicName", clinicName)
                .query(Long.class)
                .single();

        jdbcClient.sql("""
                        INSERT INTO orders
                            (order_no, clinic_id, doctor_user_id, cs_user_id, product_type,
                             form_data, internal_status, external_status, production_note)
                        VALUES
                            (:orderNo, :clinicId, :doctorUserId, 8001, 'REGULAR_CROWN',
                             JSON_OBJECT('patient_name', '张三', 'tooth_position', '11'),
                             'PENDING_CS_REVIEW', 'PENDING_REVIEW', '内部生产备注')
                        """)
                .param("orderNo", orderNo)
                .param("clinicId", clinicId)
                .param("doctorUserId", DOCTOR_USER_ID)
                .update();
        orderId = jdbcClient.sql("SELECT order_id FROM orders WHERE order_no = :orderNo")
                .param("orderNo", orderNo)
                .query(Long.class)
                .single();
    }

    @Test
    void statusServiceUpdatesExternalProjectionAndHistory() {
        statusService.updateOrderState(orderId, InternalOrderStatus.IN_PRODUCTION, "TEST_START_PRODUCTION", 8001L, null);

        String externalStatus = jdbcClient.sql("SELECT external_status FROM orders WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(String.class)
                .single();
        String projectionStatus = jdbcClient.sql("""
                        SELECT external_status
                        FROM order_external_projection
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query(String.class)
                .single();
        long historyCount = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM order_status_history
                        WHERE order_id = :orderId
                          AND to_internal_status = 'IN_PRODUCTION'
                          AND to_external_status = 'PRODUCING'
                        """)
                .param("orderId", orderId)
                .query(Long.class)
                .single();

        org.assertj.core.api.Assertions.assertThat(externalStatus).isEqualTo("PRODUCING");
        org.assertj.core.api.Assertions.assertThat(projectionStatus).isEqualTo("PRODUCING");
        org.assertj.core.api.Assertions.assertThat(historyCount).isEqualTo(1L);
    }

    @Test
    void doctorOrderDetailUsesDesensitizedProjection() throws Exception {
        statusService.updateOrderState(orderId, InternalOrderStatus.IN_PRODUCTION, "TEST_START_PRODUCTION", 8001L, null);

        mockMvc.perform(get("/orders/{orderId}", orderId)
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.order_id").value(orderId))
                .andExpect(jsonPath("$.data.external_status").value("PRODUCING"))
                .andExpect(jsonPath("$.data.internal_status").doesNotExist())
                .andExpect(jsonPath("$.data.production_note").doesNotExist())
                .andExpect(jsonPath("$.data.cs_user_id").doesNotExist())
                .andExpect(content().string(not(containsString("内部生产备注"))));

        mockMvc.perform(get("/orders/{orderId}", orderId)
                        .header("X-Bootstrap-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.internal_status").value("IN_PRODUCTION"))
                .andExpect(jsonPath("$.data.production_note").value("内部生产备注"))
                .andExpect(jsonPath("$.data.cs_user_id").value(8001));
    }

    @Test
    void doctorCannotAccessOtherDoctorOrInternalProcessApi() throws Exception {
        mockMvc.perform(get("/orders/{orderId}", orderId)
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", OTHER_DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", 7777L))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/orders/{orderId}/process-instance", orderId)
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isForbidden());
    }

    @Test
    void aiOrderQueryUsesDoctorSafeReadModel() throws Exception {
        statusService.updateOrderState(orderId, InternalOrderStatus.IN_QC, "TEST_QC", 8001L, null);

        mockMvc.perform(post("/ai/order-query")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"question\":\"我的订单谁在做？有没有返工？\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.answer").value(containsString("QC")))
                .andExpect(content().string(not(containsString("internal_status"))))
                .andExpect(content().string(not(containsString("内部生产备注"))))
                .andExpect(content().string(not(containsString("assigned_user_id"))));
    }
}
