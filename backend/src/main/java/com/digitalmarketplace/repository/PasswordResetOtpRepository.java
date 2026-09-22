package com.digitalmarketplace.repository;

import com.digitalmarketplace.entity.PasswordResetOtp;
import com.digitalmarketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findTopByUserOrderByCreatedAtDesc(User user);

    List<PasswordResetOtp> findByUserAndUsedFalseAndExpiresAtAfter(User user, LocalDateTime now);

    long countByUserAndCreatedAtAfter(User user, LocalDateTime since);
}