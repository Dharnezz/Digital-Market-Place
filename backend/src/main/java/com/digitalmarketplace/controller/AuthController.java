package com.digitalmarketplace.controller;

import com.digitalmarketplace.dto.AuthMessageResponse;
import com.digitalmarketplace.dto.ForgotPasswordRequest;
import com.digitalmarketplace.dto.LoginRequest;
import com.digitalmarketplace.dto.LoginResponse;
import com.digitalmarketplace.dto.RegisterRequest;
import com.digitalmarketplace.dto.ResetPasswordRequest;
import com.digitalmarketplace.dto.UserResponse;
import com.digitalmarketplace.dto.VerifyOtpRequest;
import com.digitalmarketplace.entity.User;
import com.digitalmarketplace.entity.UserRole;
import com.digitalmarketplace.security.JwtService;
import com.digitalmarketplace.service.PasswordResetOtpService;
import com.digitalmarketplace.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Public registration, login, and password reset endpoints")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordResetOtpService passwordResetOtpService;

    public AuthController(UserService userService, JwtService jwtService,
                          PasswordResetOtpService passwordResetOtpService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.passwordResetOtpService = passwordResetOtpService;
    }

    @Operation(summary = "Register a new user account")
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserRole role = request.role() == null ? UserRole.USER : UserRole.valueOf(request.role());
        User user = userService.createUser(request.name(), request.email(), request.password(), role);
        UserResponse response = UserResponse.from(user);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .header(HttpHeaders.LOCATION, "/api/users/" + user.getId())
                .body(response);
    }

    @Operation(summary = "Log in and receive a JWT")
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        User user = userService.authenticate(request.email(), request.password());
        String token = jwtService.generateToken(user);
        return LoginResponse.from(token, jwtService.getExpirationSeconds(), user);
    }

    @Operation(summary = "Request a password reset OTP")
    @PostMapping("/forgot-password")
    public ResponseEntity<AuthMessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String email = request.email();
        log.info("Forgot password request received for email: {}", email);
        try {
            passwordResetOtpService.sendOtp(email);
            log.info("OTP sent successfully for email: {}", email);
        } catch (IllegalStateException e) {
            log.warn("Rate limit exceeded for email: {}", email);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new AuthMessageResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Forgot password failed for email: {}", email, e);
            throw e;
        }
        // Always return generic message to prevent user enumeration
        return ResponseEntity.ok(new AuthMessageResponse(
                "If an account exists, an OTP has been sent to the registered email."));
    }

    @Operation(summary = "Verify a password reset OTP")
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthMessageResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String email = request.email();
        log.info("OTP verification request for email: {}", email);
        try {
            passwordResetOtpService.verifyOtp(email, request.otp());
            log.info("OTP verified successfully for email: {}", email);
            return ResponseEntity.ok(new AuthMessageResponse("OTP verified."));
        } catch (IllegalArgumentException e) {
            log.warn("OTP verification failed for email: {} - {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthMessageResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("OTP verification failed for email: {}", email, e);
            throw e;
        }
    }

    @Operation(summary = "Reset password using verified OTP")
    @PostMapping("/reset-password")
    public ResponseEntity<AuthMessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String email = request.email();
        log.info("Password reset request for email: {}", email);
        try {
            passwordResetOtpService.resetPassword(email, request.otp(), request.newPassword());
            log.info("Password reset successful for email: {}", email);
            return ResponseEntity.ok(new AuthMessageResponse("Password updated successfully."));
        } catch (IllegalArgumentException e) {
            log.warn("Password reset failed for email: {} - {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthMessageResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Password reset failed for email: {}", email, e);
            throw e;
        }
    }
}