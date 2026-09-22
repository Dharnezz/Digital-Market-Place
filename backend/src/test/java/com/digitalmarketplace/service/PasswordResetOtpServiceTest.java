package com.digitalmarketplace.service;

import com.digitalmarketplace.entity.PasswordResetOtp;
import com.digitalmarketplace.entity.User;
import com.digitalmarketplace.entity.UserRole;
import com.digitalmarketplace.repository.PasswordResetOtpRepository;
import com.digitalmarketplace.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetOtpServiceTest {

    @Mock
    private PasswordResetOtpRepository otpRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PasswordResetOtpService passwordResetOtpService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setRole(UserRole.USER);
    }

    @Test
    void sendOtp_createsOtpAndSendsEmail_whenUserExists() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpRepository.countByUserAndCreatedAtAfter(eq(testUser), any())).thenReturn(0L);
        when(otpRepository.findByUserAndUsedFalseAndExpiresAtAfter(eq(testUser), any())).thenReturn(List.of());
        when(otpRepository.save(any(PasswordResetOtp.class))).thenAnswer(inv -> inv.getArgument(0));

        passwordResetOtpService.sendOtp("test@example.com");

        verify(otpRepository).save(any(PasswordResetOtp.class));
        verify(emailService).sendOtpEmail(eq("test@example.com"), eq("Test User"), anyString());
    }

    @Test
    void sendOtp_doesNothing_whenUserDoesNotExist() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        passwordResetOtpService.sendOtp("unknown@example.com");

        verify(otpRepository, never()).save(any());
        verify(emailService, never()).sendOtpEmail(anyString(), anyString(), anyString());
    }

    @Test
    void sendOtp_throwsException_whenRateLimitExceeded() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpRepository.countByUserAndCreatedAtAfter(eq(testUser), any())).thenReturn(1L);

        assertThatThrownBy(() -> passwordResetOtpService.sendOtp("test@example.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Please wait before requesting another OTP");
    }

    @Test
    void sendOtp_invalidatesExistingUnusedOtps() {
        PasswordResetOtp existingOtp = new PasswordResetOtp();
        existingOtp.setUser(testUser);
        existingOtp.setOtp("123456");
        existingOtp.setExpiresAt(LocalDateTime.now().plusMinutes(2));
        existingOtp.setUsed(false);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpRepository.countByUserAndCreatedAtAfter(eq(testUser), any())).thenReturn(0L);
        when(otpRepository.findByUserAndUsedFalseAndExpiresAtAfter(eq(testUser), any())).thenReturn(List.of(existingOtp));
        when(otpRepository.save(any(PasswordResetOtp.class))).thenAnswer(inv -> inv.getArgument(0));

        passwordResetOtpService.sendOtp("test@example.com");

        assertThat(existingOtp.isUsed()).isTrue();
        verify(otpRepository, times(2)).save(any(PasswordResetOtp.class));
    }

    @Test
    void verifyOtp_throwsException_whenUserDoesNotExist() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> passwordResetOtpService.verifyOtp("unknown@example.com", "123456"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid OTP");
    }

    @Test
    void verifyOtp_throwsException_whenNoOtpExists() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpRepository.findTopByUserOrderByCreatedAtDesc(testUser)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> passwordResetOtpService.verifyOtp("test@example.com", "123456"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid OTP");
    }

    @Test
    void verifyOtp_throwsException_whenOtpAlreadyUsed() {
        PasswordResetOtp usedOtp = new PasswordResetOtp();
        usedOtp.setUser(testUser);
        usedOtp.setOtp("123456");
        usedOtp.setExpiresAt(LocalDateTime.now().plusMinutes(2));
        usedOtp.setUsed(true);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpRepository.findTopByUserOrderByCreatedAtDesc(testUser)).thenReturn(Optional.of(usedOtp));

        assertThatThrownBy(() -> passwordResetOtpService.verifyOtp("test@example.com", "123456"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("OTP has already been used");
    }

    @Test
    void verifyOtp_throwsException_whenOtpExpired() {
        PasswordResetOtp expiredOtp = new PasswordResetOtp();
        expiredOtp.setUser(testUser);
        expiredOtp.setOtp("123456");
        expiredOtp.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        expiredOtp.setUsed(false);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpRepository.findTopByUserOrderByCreatedAtDesc(testUser)).thenReturn(Optional.of(expiredOtp));

        assertThatThrownBy(() -> passwordResetOtpService.verifyOtp("test@example.com", "123456"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("OTP has expired");
    }

    @Test
    void verifyOtp_throwsException_whenOtpMismatch() {
        PasswordResetOtp validOtp = new PasswordResetOtp();
        validOtp.setUser(testUser);
        validOtp.setOtp("123456");
        validOtp.setExpiresAt(LocalDateTime.now().plusMinutes(2));
        validOtp.setUsed(false);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpRepository.findTopByUserOrderByCreatedAtDesc(testUser)).thenReturn(Optional.of(validOtp));

        assertThatThrownBy(() -> passwordResetOtpService.verifyOtp("test@example.com", "654321"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid OTP");
    }

    @Test
    void verifyOtp_succeeds_whenValidOtp() {
        PasswordResetOtp validOtp = new PasswordResetOtp();
        validOtp.setUser(testUser);
        validOtp.setOtp("123456");
        validOtp.setExpiresAt(LocalDateTime.now().plusMinutes(2));
        validOtp.setUsed(false);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpRepository.findTopByUserOrderByCreatedAtDesc(testUser)).thenReturn(Optional.of(validOtp));

        passwordResetOtpService.verifyOtp("test@example.com", "123456");
    }

    @Test
    void resetPassword_updatesPasswordAndMarksOtpUsed() {
        PasswordResetOtp validOtp = new PasswordResetOtp();
        validOtp.setUser(testUser);
        validOtp.setOtp("123456");
        validOtp.setExpiresAt(LocalDateTime.now().plusMinutes(2));
        validOtp.setUsed(false);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpRepository.findTopByUserOrderByCreatedAtDesc(testUser)).thenReturn(Optional.of(validOtp));
        when(otpRepository.save(any(PasswordResetOtp.class))).thenAnswer(inv -> inv.getArgument(0));

        passwordResetOtpService.resetPassword("test@example.com", "123456", "NewPassword123!");

        verify(userService).updatePassword(eq(testUser), eq("NewPassword123!"));
        verify(otpRepository).save(argThat(otp -> otp.isUsed()));
    }

    @Test
    void generateOtp_returnsSixDigitString() {
        String otp = passwordResetOtpService.generateOtp();
        assertThat(otp).hasSize(6).matches("\\d{6}");
    }

    @Test
    void canResendOtp_returnsTrue_whenNoRecentOtp() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpRepository.countByUserAndCreatedAtAfter(eq(testUser), any())).thenReturn(0L);

        assertThat(passwordResetOtpService.canResendOtp("test@example.com")).isTrue();
    }

    @Test
    void canResendOtp_returnsFalse_whenRecentOtpExists() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpRepository.countByUserAndCreatedAtAfter(eq(testUser), any())).thenReturn(1L);

        assertThat(passwordResetOtpService.canResendOtp("test@example.com")).isFalse();
    }

    @Test
    void canResendOtp_returnsTrue_whenUserDoesNotExist() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThat(passwordResetOtpService.canResendOtp("unknown@example.com")).isTrue();
    }

    @Test
    void getOtpExpiryMinutes_returnsConfiguredValue() {
        assertThat(passwordResetOtpService.getOtpExpiryMinutes()).isEqualTo(5);
    }
}