package com.yuri.aiorder.patient;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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
class PatientManagementTests {

    private static final long DOCTOR_USER_ID = 9001L;
    private static final long OTHER_DOCTOR_USER_ID = 9002L;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private MockMvc mockMvc;

    private long clinicId;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        String clinicName = "患者管理测试诊所-" + suffix;

        jdbcClient.sql("INSERT INTO clinic (clinic_name) VALUES (:clinicName)")
                .param("clinicName", clinicName)
                .update();
        clinicId = jdbcClient.sql("SELECT clinic_id FROM clinic WHERE clinic_name = :clinicName")
                .param("clinicName", clinicName)
                .query(Long.class)
                .single();
    }

    @Test
    void doctorCanCreateSearchAndReadOwnPatientHistory() throws Exception {
        long patientId = createPatient(DOCTOR_USER_ID, "林一舟");

        mockMvc.perform(get("/patients")
                        .param("keyword", "一舟")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].patient_id").value(patientId))
                .andExpect(jsonPath("$.data.items[0].patient_name").value("林一舟"))
                .andExpect(jsonPath("$.data.items[0].order_count").value(0));

        String orderRequest = """
                {
                  "patient_id": %d,
                  "product_type": "REGULAR_CROWN",
                  "form_data": {
                    "patient_name": "林一舟",
                    "tooth_position": "36"
                  }
                }
                """.formatted(patientId);

        String orderResponse = mockMvc.perform(post("/orders")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.order_id").isNumber())
                .andReturn()
                .getResponse()
                .getContentAsString();
        long orderId = ((Number) com.jayway.jsonpath.JsonPath.read(orderResponse, "$.data.order_id")).longValue();

        mockMvc.perform(get("/patients/{patientId}/orders", patientId)
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].order_id").value(orderId))
                .andExpect(jsonPath("$.data.items[0].external_status").value("PENDING_REVIEW"))
                .andExpect(jsonPath("$.data.items[0].internal_status").doesNotExist())
                .andExpect(jsonPath("$.data.items[0].production_note").doesNotExist())
                .andExpect(content().string(not(containsString("PENDING_CS_REVIEW"))));
    }

    @Test
    void doctorCannotBindOrReadAnotherDoctorsPatient() throws Exception {
        long otherPatientId = createPatient(OTHER_DOCTOR_USER_ID, "赵不同");

        String orderRequest = """
                {
                  "patient_id": %d,
                  "product_type": "REGULAR_CROWN",
                  "form_data": {
                    "patient_name": "赵不同",
                    "tooth_position": "11"
                  }
                }
                """.formatted(otherPatientId);

        mockMvc.perform(post("/orders")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderRequest))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/patients/{patientId}/orders", otherPatientId)
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isForbidden());
    }

    private long createPatient(long doctorUserId, String patientName) throws Exception {
        String request = """
                {
                  "patient_name": "%s",
                  "patient_age": 42,
                  "patient_gender": "UNKNOWN",
                  "oral_description": "一期患者档案验收"
                }
                """.formatted(patientName);

        String response = mockMvc.perform(post("/patients")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", doctorUserId)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.patient_id").isNumber())
                .andExpect(jsonPath("$.data.patient_name").value(patientName))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return ((Number) com.jayway.jsonpath.JsonPath.read(response, "$.data.patient_id")).longValue();
    }
}
