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
        try {
            passwordResetOtpService.sendOtp(request.email());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new AuthMessageResponse(e.getMessage()));
        }
        // Always return generic message to prevent user enumeration
        return ResponseEntity.ok(new AuthMessageResponse(
                "If an account exists, an OTP has been sent to the registered email."));
    }

    @Operation(summary = "Verify a password reset OTP")
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthMessageResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            passwordResetOtpService.verifyOtp(request.email(), request.otp());
            return ResponseEntity.ok(new AuthMessageResponse("OTP verified."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthMessageResponse(e.getMessage()));
        }
    }

    @Operation(summary = "Reset password using verified OTP")
    @PostMapping("/reset-password")
    public ResponseEntity<AuthMessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordResetOtpService.resetPassword(request.email(), request.otp(), request.newPassword());
            return ResponseEntity.ok(new AuthMessageResponse("Password updated successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthMessageResponse(e.getMessage()));
        }
    }
}