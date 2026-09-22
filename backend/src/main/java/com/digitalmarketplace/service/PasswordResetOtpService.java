package com.digitalmarketplace.service;

import com.digitalmarketplace.entity.PasswordResetOtp;
import com.digitalmarketplace.entity.User;
import com.digitalmarketplace.repository.PasswordResetOtpRepository;
import com.digitalmarketplace.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class PasswordResetOtpService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetOtpService.class);

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RATE_LIMIT_SECONDS = 60;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final PasswordResetOtpRepository otpRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final EmailService emailService;

    public PasswordResetOtpService(PasswordResetOtpRepository otpRepository,
                                   UserRepository userRepository,
                                   UserService userService,
                                   EmailService emailService) {
        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.emailService = emailService;
    }

    @Transactional
    public void sendOtp(String email) {
        log.info("sendOtp started for email: {}", email);
        // Rate limit: prevent OTP spam - allow one OTP every 60 seconds
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            long recentOtps = otpRepository.countByUserAndCreatedAtAfter(user, LocalDateTime.now().minusSeconds(RATE_LIMIT_SECONDS));
            if (recentOtps > 0) {
                log.warn("Rate limit exceeded for email: {}", email);
                throw new IllegalStateException("Please wait before requesting another OTP");
            }
        }

        // Always return generic message to prevent user enumeration
        if (user == null) {
            log.info("User not found for email (preventing enumeration): {}", email);
            return;
        }

        log.info("User found for email: {}, invalidating existing OTPs", email);
        // Invalidate any existing unused OTPs for this user
        otpRepository.findByUserAndUsedFalseAndExpiresAtAfter(user, LocalDateTime.now())
                .forEach(otp -> {
                    otp.setUsed(true);
                    otpRepository.save(otp);
                });

        log.info("Existing OTPs invalidated for user: {}", user.getEmail());

        // Generate new OTP
        String otp = generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        PasswordResetOtp resetOtp = new PasswordResetOtp();
        resetOtp.setUser(user);
        resetOtp.setOtp(otp);
        resetOtp.setExpiresAt(expiresAt);
        otpRepository.save(resetOtp);
        log.info("New OTP generated and saved for user: {}, expires at: {}", user.getEmail(), expiresAt);

        // Send email
        log.info("Sending OTP email to: {}", user.getEmail());
        emailService.sendOtpEmail(user.getEmail(), user.getName(), otp);
        log.info("OTP email sent successfully to: {}", user.getEmail());
    }

    @Transactional
    public void verifyOtp(String email, String otp) {
        log.info("verifyOtp called for email: {}", email);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            log.warn("verifyOtp: User not found for email: {}", email);
            throw new IllegalArgumentException("Invalid OTP");
        }

        PasswordResetOtp resetOtp = otpRepository.findTopByUserOrderByCreatedAtDesc(user)
                .orElseThrow(() -> {
                    log.warn("verifyOtp: No OTP found for user: {}", email);
                    return new IllegalArgumentException("Invalid OTP");
                });

        if (resetOtp.isUsed()) {
            log.warn("verifyOtp: OTP already used for email: {}", email);
            throw new IllegalArgumentException("OTP has already been used");
        }

        if (resetOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("verifyOtp: OTP expired for email: {}", email);
            throw new IllegalArgumentException("OTP has expired");
        }

        if (!resetOtp.getOtp().equals(otp)) {
            log.warn("verifyOtp: Invalid OTP provided for email: {}", email);
            throw new IllegalArgumentException("Invalid OTP");
        }

        log.info("verifyOtp: OTP verified successfully for email: {}", email);
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        log.info("resetPassword started for email: {}", email);
        verifyOtp(email, otp);

        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("Invalid OTP"));

        PasswordResetOtp resetOtp = otpRepository.findTopByUserOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new IllegalArgumentException("Invalid OTP"));

        // Mark OTP as used
        resetOtp.setUsed(true);
        otpRepository.save(resetOtp);
        log.info("OTP marked as used for email: {}", email);

        // Update password using UserService
        userService.updatePassword(user, newPassword);
        log.info("Password reset successful for email: {}", email);
    }

    public String generateOtp() {
        int otp = SECURE_RANDOM.nextInt(900000) + 100000; // 6 digits: 100000 to 999999
        return String.valueOf(otp);
    }

    public boolean canResendOtp(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return true; // Allow resend for non-existent users (prevent enumeration)
        }
        long recentOtps = otpRepository.countByUserAndCreatedAtAfter(user, LocalDateTime.now().minusSeconds(RATE_LIMIT_SECONDS));
        return recentOtps == 0;
    }

    public int getOtpExpiryMinutes() {
        return OTP_EXPIRY_MINUTES;
    }
}