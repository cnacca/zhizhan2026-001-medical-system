package com.yuri.aiorder.bootstrap;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.auth.AuthMenu;
import com.yuri.aiorder.common.auth.AuthenticatedUser;
import com.yuri.aiorder.common.auth.BearerTokenService;
import com.yuri.aiorder.common.auth.DatabaseAuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;
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

    private final BearerTokenService tokenService;
    private final DatabaseAuthService databaseAuthService;

    public BootstrapAuthController(BearerTokenService tokenService, DatabaseAuthService databaseAuthService) {
        this.tokenService = tokenService;
        this.databaseAuthService = databaseAuthService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        AuthenticatedUser authenticatedUser = databaseAuthService.authenticate(request.username(), request.password());
        return new LoginResponse(
                tokenService.issue(authenticatedUser.identity()),
                authenticatedUser.username(),
                authenticatedUser.userId(),
                authenticatedUser.clinicId(),
                authenticatedUser.roles(),
                authenticatedUser.permissions(),
                authenticatedUser.menus(),
                authenticatedUser.dataScope(),
                Instant.now().plusSeconds(tokenService.tokenTtlSeconds()));
    }

    @GetMapping("/me")
    public CurrentUserResponse me(@RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new UnauthorizedException();
        }
        BootstrapIdentity identity = tokenService.parse(authorization.substring("Bearer ".length()));
        return new CurrentUserResponse(
                identity.username() == null ? identity.role().name() : identity.username(),
                identity.userId(),
                identity.clinicId(),
                List.of(identity.role().name()),
                identity.permissions().stream().sorted().toList(),
                databaseAuthService.loadMenus(identity),
                identity.dataScope());
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    public record LoginResponse(
            String accessToken,
            String username,
            Long userId,
            Long clinicId,
            List<String> roles,
            List<String> permissions,
            List<AuthMenu> menus,
            String dataScope,
            Instant expiresAt) {
    }

    public record CurrentUserResponse(
            String username,
            Long userId,
            Long clinicId,
            List<String> roles,
            List<String> permissions,
            List<AuthMenu> menus,
            String dataScope) {
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    private static final class UnauthorizedException extends RuntimeException {
    }
}
