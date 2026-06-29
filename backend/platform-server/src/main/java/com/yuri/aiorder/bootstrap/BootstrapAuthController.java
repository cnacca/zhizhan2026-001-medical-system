package com.yuri.aiorder.bootstrap;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class BootstrapAuthController {

    private final String adminUsername;
    private final String adminPassword;

    public BootstrapAuthController(
            @Value("${app.bootstrap.admin.username:admin}") String adminUsername,
            @Value("${app.bootstrap.admin.password:change-me-admin}") String adminPassword) {
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        if (!adminUsername.equals(request.username()) || !adminPassword.equals(request.password())) {
            throw new UnauthorizedException();
        }
        return new LoginResponse("bootstrap-admin-token", "ADMIN", List.of("ADMIN"), Instant.now().plusSeconds(7200));
    }

    @GetMapping("/me")
    public CurrentUserResponse me(@RequestHeader(name = "Authorization", required = false) String authorization) {
        if (!"Bearer bootstrap-admin-token".equals(authorization)) {
            throw new UnauthorizedException();
        }
        return new CurrentUserResponse("ADMIN", List.of("ADMIN"));
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    public record LoginResponse(String accessToken, String username, List<String> roles, Instant expiresAt) {
    }

    public record CurrentUserResponse(String username, List<String> roles) {
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    private static final class UnauthorizedException extends RuntimeException {
    }
}
