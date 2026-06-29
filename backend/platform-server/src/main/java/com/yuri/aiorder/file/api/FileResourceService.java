package com.yuri.aiorder.file.api;

import com.yuri.aiorder.common.BootstrapIdentity;
import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import io.minio.http.Method;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FileResourceService {

    private static final Set<String> DOCTOR_VISIBLE_FILE_VISIBILITIES = Set.of("DOCTOR", "DOCTOR_CS", "ALL");

    private final JdbcClient jdbcClient;
    private final MinioClient minioClient;
    private final FileStorageProperties properties;

    public FileResourceService(JdbcClient jdbcClient, MinioClient minioClient, FileStorageProperties properties) {
        this.jdbcClient = jdbcClient;
        this.minioClient = minioClient;
        this.properties = properties;
    }

    public UploadTokenResponse createUploadToken(UploadTokenRequest request, BootstrapIdentity identity) {
        if (request.fileSize() > properties.maxFileSizeBytes()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file exceeds current size limit");
        }
        OrderScope orderScope = loadOrderScope(request.orderId());
        requireUploadScope(orderScope, normalizeVisibility(request.visibility()), identity);
        ensureBucket();

        String objectKey = buildObjectKey(request);
        jdbcClient.sql("""
                        INSERT INTO file_resource
                            (order_id, owner_user_id, source_type, visibility, bucket_name, object_key,
                             original_filename, content_type, file_size, upload_status, status)
                        VALUES
                            (:orderId, :ownerUserId, :sourceType, :visibility, :bucketName, :objectKey,
                             :originalFilename, :contentType, :fileSize, 'PENDING', 'ACTIVE')
                        """)
                .param("orderId", request.orderId())
                .param("ownerUserId", identity.userId())
                .param("sourceType", normalizeCode(request.sourceType()))
                .param("visibility", normalizeVisibility(request.visibility()))
                .param("bucketName", properties.bucket())
                .param("objectKey", objectKey)
                .param("originalFilename", request.originalFilename())
                .param("contentType", request.contentType())
                .param("fileSize", request.fileSize())
                .update();
        long fileId = jdbcClient.sql("""
                        SELECT file_id
                        FROM file_resource
                        WHERE bucket_name = :bucketName
                          AND object_key = :objectKey
                        """)
                .param("bucketName", properties.bucket())
                .param("objectKey", objectKey)
                .query(Long.class)
                .single();
        audit(fileId, request.orderId(), identity.userId(), "UPLOAD_TOKEN", "ALLOWED", null);

        return new UploadTokenResponse(
                fileId,
                presignedUrl(Method.PUT, objectKey, properties.uploadUrlTtlSeconds()),
                properties.uploadUrlTtlSeconds());
    }

    public FileCompleteResponse completeUpload(long fileId, BootstrapIdentity identity) {
        FileRow file = loadFile(fileId);
        requireFileActorScope(file, identity, "COMPLETE");
        StatObjectResponse stat = statObject(file);
        if (stat.size() <= 0) {
            audit(file.fileId(), file.orderId(), identity.userId(), "COMPLETE", "DENIED", "empty object");
            throw new ResponseStatusException(HttpStatus.CONFLICT, "uploaded object is empty");
        }
        if (file.fileSize() != null && stat.size() != file.fileSize()) {
            audit(file.fileId(), file.orderId(), identity.userId(), "COMPLETE", "DENIED", "file size mismatch");
            throw new ResponseStatusException(HttpStatus.CONFLICT, "uploaded object size does not match token");
        }
        if (file.contentType() != null && stat.contentType() != null
                && !file.contentType().equalsIgnoreCase(stat.contentType())) {
            audit(file.fileId(), file.orderId(), identity.userId(), "COMPLETE", "DENIED", "content type mismatch");
            throw new ResponseStatusException(HttpStatus.CONFLICT, "uploaded object content type does not match token");
        }
        String contentType = stat.contentType() == null ? file.contentType() : stat.contentType();
        jdbcClient.sql("""
                        UPDATE file_resource
                        SET upload_status = 'COMPLETED',
                            file_size = :fileSize,
                            content_type = :contentType,
                            checksum = :checksum
                        WHERE file_id = :fileId
                        """)
                .param("fileSize", stat.size())
                .param("contentType", contentType)
                .param("checksum", stat.etag())
                .param("fileId", file.fileId())
                .update();
        audit(file.fileId(), file.orderId(), identity.userId(), "COMPLETE", "ALLOWED", null);
        return new FileCompleteResponse(file.fileId(), "COMPLETED", stat.size(), contentType, stat.etag());
    }

    public FileSignedUrlResponse createPreviewUrl(long fileId, BootstrapIdentity identity) {
        FileRow file = loadFile(fileId);
        requireCompleted(file, "PREVIEW", identity);
        requireFileActorScope(file, identity, "PREVIEW");
        String url = presignedUrl(Method.GET, file.objectKey(), properties.previewUrlTtlSeconds());
        audit(file.fileId(), file.orderId(), identity.userId(), "PREVIEW", "ALLOWED", null);
        return new FileSignedUrlResponse(file.fileId(), url, null, properties.previewUrlTtlSeconds());
    }

    public FileSignedUrlResponse createDownloadUrl(long fileId, BootstrapIdentity identity) {
        FileRow file = loadFile(fileId);
        requireCompleted(file, "DOWNLOAD", identity);
        requireFileActorScope(file, identity, "DOWNLOAD");
        String url = presignedUrl(Method.GET, file.objectKey(), properties.downloadUrlTtlSeconds());
        audit(file.fileId(), file.orderId(), identity.userId(), "DOWNLOAD", "ALLOWED", null);
        return new FileSignedUrlResponse(file.fileId(), null, url, properties.downloadUrlTtlSeconds());
    }

    private void ensureBucket() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(properties.bucket())
                    .build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(properties.bucket())
                        .build());
            }
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "file storage bucket unavailable", ex);
        }
    }

    private StatObjectResponse statObject(FileRow file) {
        try {
            return minioClient.statObject(StatObjectArgs.builder()
                    .bucket(file.bucketName())
                    .object(file.objectKey())
                    .build());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "uploaded object not found", ex);
        }
    }

    private String presignedUrl(Method method, String objectKey, int ttlSeconds) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(method)
                    .bucket(properties.bucket())
                    .object(objectKey)
                    .expiry(ttlSeconds, TimeUnit.SECONDS)
                    .build());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "cannot create signed url", ex);
        }
    }

    private void requireUploadScope(OrderScope orderScope, String visibility, BootstrapIdentity identity) {
        if (!identity.isDoctor()) {
            return;
        }
        if (!DOCTOR_VISIBLE_FILE_VISIBILITIES.contains(visibility)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "doctor cannot upload internal files");
        }
        if (!doctorCanAccess(orderScope.doctorUserId(), orderScope.clinicId(), identity)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "doctor cannot upload to this order");
        }
    }

    private void requireCompleted(FileRow file, String action, BootstrapIdentity identity) {
        if ("COMPLETED".equals(file.uploadStatus())) {
            return;
        }
        audit(file.fileId(), file.orderId(), identity.userId(), action, "DENIED", "file upload is not completed");
        throw new ResponseStatusException(HttpStatus.CONFLICT, "file upload is not completed");
    }

    private void requireFileActorScope(FileRow file, BootstrapIdentity identity, String action) {
        if (!identity.isDoctor()) {
            return;
        }
        if (file.orderId() == null || file.doctorUserId() == null
                || !DOCTOR_VISIBLE_FILE_VISIBILITIES.contains(file.visibility())
                || !doctorCanAccess(file.doctorUserId(), file.clinicId(), identity)) {
            audit(file.fileId(), file.orderId(), identity.userId(), action, "DENIED", "doctor cannot access this file");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "doctor cannot access this file");
        }
    }

    private boolean doctorCanAccess(Long doctorUserId, Long clinicId, BootstrapIdentity identity) {
        return (doctorUserId != null && identity.userId() != null && doctorUserId.equals(identity.userId()))
                || (clinicId != null && identity.clinicId() != null && clinicId.equals(identity.clinicId()));
    }

    private OrderScope loadOrderScope(long orderId) {
        try {
            return jdbcClient.sql("""
                            SELECT order_id, clinic_id, doctor_user_id
                            FROM orders
                            WHERE order_id = :orderId
                            """)
                    .param("orderId", orderId)
                    .query((rs, rowNum) -> new OrderScope(
                            rs.getLong("order_id"),
                            rs.getLong("clinic_id"),
                            rs.getObject("doctor_user_id", Long.class)))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found", ex);
        }
    }

    private FileRow loadFile(long fileId) {
        try {
            return jdbcClient.sql("""
                            SELECT
                                f.file_id,
                                f.order_id,
                                f.owner_user_id,
                                f.visibility,
                                f.bucket_name,
                                f.object_key,
                                f.content_type,
                                f.file_size,
                                f.upload_status,
                                f.status,
                                o.clinic_id,
                                o.doctor_user_id
                            FROM file_resource f
                            LEFT JOIN orders o ON o.order_id = f.order_id
                            WHERE f.file_id = :fileId
                            """)
                    .param("fileId", fileId)
                    .query((rs, rowNum) -> new FileRow(
                            rs.getLong("file_id"),
                            rs.getObject("order_id", Long.class),
                            rs.getObject("owner_user_id", Long.class),
                            rs.getString("visibility"),
                            rs.getString("bucket_name"),
                            rs.getString("object_key"),
                            rs.getString("content_type"),
                            rs.getObject("file_size", Long.class),
                            rs.getString("upload_status"),
                            rs.getString("status"),
                            rs.getObject("clinic_id", Long.class),
                            rs.getObject("doctor_user_id", Long.class)))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "file not found", ex);
        }
    }

    private void audit(Long fileId, Long orderId, Long actorUserId, String action, String result, String reason) {
        jdbcClient.sql("""
                        INSERT INTO file_access_audit
                            (file_id, order_id, actor_user_id, action, access_result, reason)
                        VALUES
                            (:fileId, :orderId, :actorUserId, :action, :accessResult, :reason)
                        """)
                .param("fileId", fileId)
                .param("orderId", orderId)
                .param("actorUserId", actorUserId)
                .param("action", action)
                .param("accessResult", result)
                .param("reason", reason)
                .update();
    }

    private String buildObjectKey(UploadTokenRequest request) {
        String source = normalizeCode(request.sourceType()).toLowerCase(Locale.ROOT);
        String filename = sanitizeFilename(request.originalFilename());
        return source + "/" + request.orderId() + "/" + LocalDate.now() + "/" + UUID.randomUUID() + "/" + filename;
    }

    private String sanitizeFilename(String filename) {
        String clean = filename.replaceAll("[^A-Za-z0-9._-]", "_");
        if (clean.isBlank()) {
            return "upload.bin";
        }
        return clean.length() > 120 ? clean.substring(clean.length() - 120) : clean;
    }

    private String normalizeCode(String value) {
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeVisibility(String value) {
        return normalizeCode(value);
    }

    private record OrderScope(long orderId, long clinicId, Long doctorUserId) {
    }

    private record FileRow(
            long fileId,
            Long orderId,
            Long ownerUserId,
            String visibility,
            String bucketName,
            String objectKey,
            String contentType,
            Long fileSize,
            String uploadStatus,
            String status,
            Long clinicId,
            Long doctorUserId) {
    }
}
