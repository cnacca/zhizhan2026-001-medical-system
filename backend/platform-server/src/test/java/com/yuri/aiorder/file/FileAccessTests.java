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
    void multipartUploadCanInitiateUploadPartCompleteAndAuditWithoutExposingObjectKey() throws Exception {
        byte[] bytes = "multipart-pdf-bytes".getBytes(StandardCharsets.UTF_8);
        MultipartUploadInfo upload = initiateMultipartUpload(bytes.length);

        assertThat(fileStatus(upload.fileId())).isEqualTo("PENDING");
        assertThat(multipartUploadId(upload.fileId())).isEqualTo(upload.uploadId());

        String partUrl = requestPartUrl(upload.fileId(), upload.uploadId(), 1);
        String etag = putObject(partUrl, bytes, "application/pdf");

        mockMvc.perform(post("/files/{fileId}/multipart/complete", upload.fileId())
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "upload_id": "%s",
                                  "parts": [
                                    {"part_number": 1, "etag": "%s"}
                                  ]
                                }
                                """.formatted(upload.uploadId(), etag)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.file_id").value(upload.fileId()))
                .andExpect(jsonPath("$.data.upload_status").value("COMPLETED"));

        assertThat(fileStatus(upload.fileId())).isEqualTo("COMPLETED");
        assertThat(storedFileSize(upload.fileId())).isEqualTo((long) bytes.length);
        assertThat(auditCount(upload.fileId(), "MULTIPART_INITIATE", "ALLOWED")).isEqualTo(1L);
        assertThat(auditCount(upload.fileId(), "MULTIPART_PART_URL", "ALLOWED")).isEqualTo(1L);
        assertThat(auditCount(upload.fileId(), "MULTIPART_COMPLETE", "ALLOWED")).isEqualTo(1L);
    }

    @Test
    void multipartUploadStatusListsUploadedPartsForResume() throws Exception {
        byte[] firstPart = new byte[5 * 1024 * 1024];
        byte[] secondPart = "resume-tail".getBytes(StandardCharsets.UTF_8);
        MultipartUploadInfo upload = initiateMultipartUpload(firstPart.length + secondPart.length);

        String firstPartUrl = requestPartUrl(upload.fileId(), upload.uploadId(), 1);
        String firstPartEtag = putObject(firstPartUrl, firstPart, "application/pdf");

        mockMvc.perform(get("/files/{fileId}/multipart/status", upload.fileId())
                        .param("upload_id", upload.uploadId())
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.file_id").value(upload.fileId()))
                .andExpect(jsonPath("$.data.upload_id").value(upload.uploadId()))
                .andExpect(jsonPath("$.data.upload_status").value("PENDING"))
                .andExpect(jsonPath("$.data.part_count").value(2))
                .andExpect(jsonPath("$.data.completed_parts[0].part_number").value(1))
                .andExpect(jsonPath("$.data.completed_parts[0].etag").value(firstPartEtag))
                .andExpect(jsonPath("$.data.completed_parts[0].size").value(firstPart.length))
                .andExpect(jsonPath("$.data.object_key").doesNotExist())
                .andExpect(content().string(not(org.hamcrest.Matchers.containsString("object_key"))));

        assertThat(auditCount(upload.fileId(), "MULTIPART_STATUS", "ALLOWED")).isEqualTo(1L);
    }

    @Test
    void multipartPendingUploadsListsOnlyCurrentDoctorRowsForCrossDeviceResume() throws Exception {
        MultipartUploadInfo ownUpload = initiateMultipartUploadAs(
                DOCTOR_USER_ID,
                clinicId,
                11L * 1024L * 1024L,
                "resume-own.pdf");
        MultipartUploadInfo otherUpload = initiateMultipartUploadAs(
                OTHER_DOCTOR_USER_ID,
                clinicId,
                11L * 1024L * 1024L,
                "resume-other.pdf");

        MvcResult result = mockMvc.perform(get("/files/multipart/pending")
                        .param("order_id", String.valueOf(orderId))
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].file_id").value(ownUpload.fileId()))
                .andExpect(jsonPath("$.data.items[0].upload_id").value(ownUpload.uploadId()))
                .andExpect(jsonPath("$.data.items[0].order_id").value(orderId))
                .andExpect(jsonPath("$.data.items[0].original_filename").value("resume-own.pdf"))
                .andExpect(jsonPath("$.data.items[0].file_size").value(11L * 1024L * 1024L))
                .andExpect(jsonPath("$.data.items[0].part_size").value(5242880))
                .andExpect(jsonPath("$.data.items[0].part_count").value(3))
                .andExpect(jsonPath("$.data.items[0].object_key").doesNotExist())
                .andExpect(content().string(not(org.hamcrest.Matchers.containsString("object_key"))))
                .andReturn();

        JsonNode items = objectMapper.readTree(result.getResponse().getContentAsString()).path("data").path("items");
        assertThat(items).hasSize(1);
        assertThat(items.get(0).path("file_id").asLong()).isNotEqualTo(otherUpload.fileId());
        assertThat(auditCount(ownUpload.fileId(), "MULTIPART_PENDING_LIST", "ALLOWED")).isEqualTo(1L);
    }

    @Test
    void multipartUploadCanBeAbortedAndCannotBeAbortedByOtherDoctor() throws Exception {
        MultipartUploadInfo upload = initiateMultipartUpload(16L);

        mockMvc.perform(post("/files/{fileId}/multipart/abort", upload.fileId())
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", OTHER_DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"upload_id":"%s"}
                                """.formatted(upload.uploadId())))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/files/{fileId}/multipart/abort", upload.fileId())
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"upload_id":"%s"}
                                """.formatted(upload.uploadId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.file_id").value(upload.fileId()))
                .andExpect(jsonPath("$.data.upload_status").value("ABORTED"));

        assertThat(fileStatus(upload.fileId())).isEqualTo("ABORTED");
        assertThat(auditCount(upload.fileId(), "MULTIPART_ABORT", "ALLOWED")).isEqualTo(1L);
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

    private MultipartUploadInfo initiateMultipartUpload(long fileSize) throws Exception {
        return initiateMultipartUploadAs(DOCTOR_USER_ID, clinicId, fileSize, "case-multipart.pdf");
    }

    private MultipartUploadInfo initiateMultipartUploadAs(
            long userId,
            long requestClinicId,
            long fileSize,
            String originalFilename) throws Exception {
        int expectedPartCount = Math.toIntExact((fileSize + 5242879L) / 5242880L);
        String body = """
                {
                  "order_id": %d,
                  "source_type": "ORDER_ATTACHMENT",
                  "visibility": "DOCTOR",
                  "original_filename": "%s",
                  "content_type": "application/pdf",
                  "file_size": %d,
                  "part_size": 5242880
                }
                """.formatted(orderId, originalFilename, fileSize);
        MvcResult result = mockMvc.perform(post("/files/multipart/initiate")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", userId)
                        .header("X-Bootstrap-Clinic-Id", requestClinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.file_id").isNumber())
                .andExpect(jsonPath("$.data.upload_id").isString())
                .andExpect(jsonPath("$.data.part_size").value(5242880))
                .andExpect(jsonPath("$.data.part_count").value(expectedPartCount))
                .andExpect(jsonPath("$.data.object_key").doesNotExist())
                .andExpect(content().string(not(org.hamcrest.Matchers.containsString("object_key"))))
                .andReturn();
        JsonNode data = objectMapper.readTree(result.getResponse().getContentAsString()).path("data");
        return new MultipartUploadInfo(data.path("file_id").asLong(), data.path("upload_id").asText());
    }

    private String requestPartUrl(long fileId, String uploadId, int partNumber) throws Exception {
        MvcResult result = mockMvc.perform(post("/files/{fileId}/multipart/part-url", fileId)
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"upload_id":"%s","part_number":%d}
                                """.formatted(uploadId, partNumber)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.file_id").value(fileId))
                .andExpect(jsonPath("$.data.part_number").value(partNumber))
                .andExpect(jsonPath("$.data.upload_url").value(startsWith("http")))
                .andExpect(jsonPath("$.data.object_key").doesNotExist())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data")
                .path("upload_url")
                .asText();
    }

    private String putObject(String uploadUrl, byte[] bytes, String contentType) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(uploadUrl))
                .header("Content-Type", contentType)
                .PUT(HttpRequest.BodyPublishers.ofByteArray(bytes))
                .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        assertThat(response.statusCode()).isBetween(200, 299);
        return response.headers()
                .firstValue("ETag")
                .orElseThrow()
                .replace("\"", "");
    }

    private record UploadToken(long fileId, String uploadUrl) {
    }

    private record MultipartUploadInfo(long fileId, String uploadId) {
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

    private String multipartUploadId(long fileId) {
        return jdbcClient.sql("SELECT multipart_upload_id FROM file_resource WHERE file_id = :fileId")
                .param("fileId", fileId)
                .query(String.class)
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
