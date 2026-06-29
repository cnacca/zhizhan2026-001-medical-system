package com.yuri.aiorder.file;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class FileAccessTests {

    private static final long DOCTOR_USER_ID = 9101L;
    private static final long OTHER_DOCTOR_USER_ID = 9102L;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long clinicId;
    private long orderId;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        String clinicName = "文件测试诊所-" + suffix;
        String orderNo = "F" + suffix.substring(0, 12);

        jdbcClient.sql("INSERT INTO clinic (clinic_name) VALUES (:clinicName)")
                .param("clinicName", clinicName)
                .update();
        clinicId = jdbcClient.sql("SELECT clinic_id FROM clinic WHERE clinic_name = :clinicName")
                .param("clinicName", clinicName)
                .query(Long.class)
                .single();

        jdbcClient.sql("""
                        INSERT INTO orders
                            (order_no, clinic_id, doctor_user_id, product_type, internal_status, external_status)
                        VALUES
                            (:orderNo, :clinicId, :doctorUserId, 'REGULAR_CROWN', 'PENDING_CS_REVIEW', 'PENDING_REVIEW')
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
    void uploadTokenCompletePreviewAndDownloadAreAuditedWithoutExposingObjectKey() throws Exception {
        byte[] bytes = "pdf-bytes".getBytes(StandardCharsets.UTF_8);
        UploadToken token = requestUploadToken(bytes.length);
        long fileId = token.fileId();

        assertThat(fileStatus(fileId)).isEqualTo("PENDING");
        putObject(token.uploadUrl(), bytes, "application/pdf");

        mockMvc.perform(post("/files/{fileId}/complete", fileId)
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.file_id").value(fileId))
                .andExpect(jsonPath("$.data.upload_status").value("COMPLETED"));

        assertThat(fileStatus(fileId)).isEqualTo("COMPLETED");
        assertThat(storedFileSize(fileId)).isEqualTo((long) bytes.length);

        mockMvc.perform(get("/files/{fileId}/preview-url", fileId)
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.preview_url").value(startsWith("http")))
                .andExpect(jsonPath("$.data.object_key").doesNotExist())
                .andExpect(content().string(not(org.hamcrest.Matchers.containsString("object_key"))));

        mockMvc.perform(get("/files/{fileId}/download-url", fileId)
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.download_url").value(startsWith("http")))
                .andExpect(jsonPath("$.data.object_key").doesNotExist());

        assertThat(auditCount(fileId, "UPLOAD_TOKEN", "ALLOWED")).isEqualTo(1L);
        assertThat(auditCount(fileId, "COMPLETE", "ALLOWED")).isEqualTo(1L);
        assertThat(auditCount(fileId, "PREVIEW", "ALLOWED")).isEqualTo(1L);
        assertThat(auditCount(fileId, "DOWNLOAD", "ALLOWED")).isEqualTo(1L);
    }

    @Test
    void doctorCannotPreviewInternalOrOtherClinicFilesAndDenialsAreAudited() throws Exception {
        long internalFileId = insertCompletedFile(orderId, "INTERNAL");

        mockMvc.perform(get("/files/{fileId}/preview-url", internalFileId)
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isForbidden());

        long otherClinicOrderId = createOrderForOtherClinic();
        long otherClinicFileId = insertCompletedFile(otherClinicOrderId, "DOCTOR");

        mockMvc.perform(get("/files/{fileId}/preview-url", otherClinicFileId)
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", OTHER_DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isForbidden());

        assertThat(auditCount(internalFileId, "PREVIEW", "DENIED")).isEqualTo(1L);
        assertThat(auditCount(otherClinicFileId, "PREVIEW", "DENIED")).isEqualTo(1L);
    }

    private UploadToken requestUploadToken(long fileSize) throws Exception {
        String body = """
                {
                  "order_id": %d,
                  "source_type": "ORDER_ATTACHMENT",
                  "visibility": "DOCTOR",
                  "original_filename": "case.pdf",
                  "content_type": "application/pdf",
                  "file_size": %d
                }
                """.formatted(orderId, fileSize);
        MvcResult result = mockMvc.perform(post("/files/upload-token")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.file_id").isNumber())
                .andExpect(jsonPath("$.data.upload_url").value(startsWith("http")))
                .andExpect(jsonPath("$.data.object_key").doesNotExist())
                .andExpect(content().string(not(org.hamcrest.Matchers.containsString("object_key"))))
                .andReturn();
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        JsonNode data = root.path("data");
        return new UploadToken(data.path("file_id").asLong(), data.path("upload_url").asText());
    }

    private void putObject(String uploadUrl, byte[] bytes, String contentType) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(uploadUrl))
                .header("Content-Type", contentType)
                .PUT(HttpRequest.BodyPublishers.ofByteArray(bytes))
                .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        assertThat(response.statusCode()).isBetween(200, 299);
    }

    private record UploadToken(long fileId, String uploadUrl) {
    }

    private String fileStatus(long fileId) {
        return jdbcClient.sql("SELECT upload_status FROM file_resource WHERE file_id = :fileId")
                .param("fileId", fileId)
                .query(String.class)
                .single();
    }

    private long storedFileSize(long fileId) {
        return jdbcClient.sql("SELECT file_size FROM file_resource WHERE file_id = :fileId")
                .param("fileId", fileId)
                .query(Long.class)
                .single();
    }

    private long auditCount(long fileId, String action, String result) {
        return jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM file_access_audit
                        WHERE file_id = :fileId
                          AND action = :action
                          AND access_result = :result
                        """)
                .param("fileId", fileId)
                .param("action", action)
                .param("result", result)
                .query(Long.class)
                .single();
    }

    private long insertCompletedFile(long targetOrderId, String visibility) {
        String key = "test/" + UUID.randomUUID() + "/file.pdf";
        jdbcClient.sql("""
                        INSERT INTO file_resource
                            (order_id, owner_user_id, source_type, visibility, bucket_name, object_key,
                             original_filename, content_type, file_size, upload_status, status)
                        VALUES
                            (:orderId, :ownerUserId, 'ORDER_ATTACHMENT', :visibility, 'ai-order-private', :objectKey,
                             'file.pdf', 'application/pdf', 9, 'COMPLETED', 'ACTIVE')
                        """)
                .param("orderId", targetOrderId)
                .param("ownerUserId", DOCTOR_USER_ID)
                .param("visibility", visibility)
                .param("objectKey", key)
                .update();
        return jdbcClient.sql("SELECT file_id FROM file_resource WHERE object_key = :objectKey")
                .param("objectKey", key)
                .query(Long.class)
                .single();
    }

    private long createOrderForOtherClinic() {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        String clinicName = "其他文件测试诊所-" + suffix;
        String orderNo = "FO" + suffix.substring(0, 12);
        jdbcClient.sql("INSERT INTO clinic (clinic_name) VALUES (:clinicName)")
                .param("clinicName", clinicName)
                .update();
        long otherClinicId = jdbcClient.sql("SELECT clinic_id FROM clinic WHERE clinic_name = :clinicName")
                .param("clinicName", clinicName)
                .query(Long.class)
                .single();
        jdbcClient.sql("""
                        INSERT INTO orders
                            (order_no, clinic_id, doctor_user_id, product_type, internal_status, external_status)
                        VALUES
                            (:orderNo, :clinicId, 9301, 'REGULAR_CROWN', 'PENDING_CS_REVIEW', 'PENDING_REVIEW')
                        """)
                .param("orderNo", orderNo)
                .param("clinicId", otherClinicId)
                .update();
        return jdbcClient.sql("SELECT order_id FROM orders WHERE order_no = :orderNo")
                .param("orderNo", orderNo)
                .query(Long.class)
                .single();
    }
}
