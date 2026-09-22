package com.digitalmarketplace.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@digitalmarketplace.com}")
    private String fromEmail;

    @Value("${app.name:Digital Marketplace}")
    private String appName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String userName, String otp) {
        log.info("Preparing OTP email to: {}", toEmail);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP");
        message.setText(buildOtpEmailBody(userName, otp));
        log.info("Sending email to: {}", toEmail);
        try {
            mailSender.send(message);
            log.info("Email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", toEmail, e);
            throw e;
        }
    }

    private String buildOtpEmailBody(String userName, String otp) {
        return String.format("""
                Hello %s,

                Your OTP is:

                %s

                This OTP expires in 5 minutes.

                If you did not request this, please ignore this email.

                Best regards,
                The %s Team
                """, userName, otp, appName);
    }
}