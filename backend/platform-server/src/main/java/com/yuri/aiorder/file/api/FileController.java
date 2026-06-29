package com.yuri.aiorder.file.api;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.DataResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class FileController {

    private final FileResourceService fileResourceService;

    public FileController(FileResourceService fileResourceService) {
        this.fileResourceService = fileResourceService;
    }

    @PostMapping("/files/upload-token")
    public DataResponse<UploadTokenResponse> createUploadToken(
            @Valid @RequestBody UploadTokenRequest request,
            @RequestHeader(name = "X-Bootstrap-Role", required = false) String role,
            @RequestHeader(name = "X-Bootstrap-User-Id", required = false) Long userId,
            @RequestHeader(name = "X-Bootstrap-Clinic-Id", required = false) Long clinicId) {
        return new DataResponse<>(fileResourceService.createUploadToken(
                request, BootstrapIdentity.fromHeaders(role, userId, clinicId)));
    }

    @PostMapping("/files/{fileId}/complete")
    public DataResponse<FileCompleteResponse> completeUpload(
            @PathVariable long fileId,
            @RequestHeader(name = "X-Bootstrap-Role", required = false) String role,
            @RequestHeader(name = "X-Bootstrap-User-Id", required = false) Long userId,
            @RequestHeader(name = "X-Bootstrap-Clinic-Id", required = false) Long clinicId) {
        return new DataResponse<>(fileResourceService.completeUpload(
                fileId, BootstrapIdentity.fromHeaders(role, userId, clinicId)));
    }

    @GetMapping("/files/{fileId}/preview-url")
    public DataResponse<FileSignedUrlResponse> getPreviewUrl(
            @PathVariable long fileId,
            @RequestHeader(name = "X-Bootstrap-Role", required = false) String role,
            @RequestHeader(name = "X-Bootstrap-User-Id", required = false) Long userId,
            @RequestHeader(name = "X-Bootstrap-Clinic-Id", required = false) Long clinicId) {
        return new DataResponse<>(fileResourceService.createPreviewUrl(
                fileId, BootstrapIdentity.fromHeaders(role, userId, clinicId)));
    }

    @GetMapping("/files/{fileId}/download-url")
    public DataResponse<FileSignedUrlResponse> getDownloadUrl(
            @PathVariable long fileId,
            @RequestHeader(name = "X-Bootstrap-Role", required = false) String role,
            @RequestHeader(name = "X-Bootstrap-User-Id", required = false) Long userId,
            @RequestHeader(name = "X-Bootstrap-Clinic-Id", required = false) Long clinicId) {
        return new DataResponse<>(fileResourceService.createDownloadUrl(
                fileId, BootstrapIdentity.fromHeaders(role, userId, clinicId)));
    }
}
