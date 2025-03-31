package com.qwervego.label.service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;
import lombok.Data;

@Service
public class OtpService {
    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private final Map<String, OtpData> otpCache = new ConcurrentHashMap<>();
    private static final long OTP_VALIDITY_DURATION = 300000; // 5 minutes in milliseconds

    @Data
    @AllArgsConstructor
    private static class OtpData {
        private String email;
        private String otp;
        private long timestamp;
        private boolean used;

        public boolean isValid() {
            long currentTime = System.currentTimeMillis();
            long timeDifference = currentTime - timestamp;
            boolean timeValid = timeDifference < OTP_VALIDITY_DURATION;

            logger.debug("OTP Validation Check - Used: {}, Time Difference: {}ms, Valid: {}",
                    used, timeDifference, (!used && timeValid));

            return !used && timeValid;
        }
    }

    public String createOtpSession(String email, String sessionId) {
        String otp = generateOtp();
        // Remove any existing session for this email
        otpCache.entrySet().removeIf(entry -> entry.getValue().getEmail().equals(email));
        
        otpCache.put(sessionId, new OtpData(email, otp, System.currentTimeMillis(), false));
        logger.info("Created OTP session - SessionID: {}, Email: {}, OTP: {}, Cache size: {}",
                sessionId, email, otp, otpCache.size());
        return otp;
    }

    public boolean validateOtp(String sessionId, String otp) {
        logger.info("Validating OTP - SessionID: {}, Provided OTP: {}", sessionId, otp);
        logger.debug("Current cache contents: {}", 
            otpCache.entrySet().stream()
                .map(e -> String.format("[%s: %s]", e.getKey(), e.getValue().getEmail()))
                .collect(Collectors.joining(", ")));
        
        OtpData data = otpCache.get(sessionId);
        if (data == null) {
            logger.warn("No OTP data found for sessionId: {}", sessionId);
            return false;
        }

        logger.debug("Found OTP data - Email: {}, Stored OTP: {}, Timestamp: {}, Used: {}",
                data.getEmail(), data.getOtp(), data.getTimestamp(), data.isUsed());

        if (!data.isValid()) {
            logger.warn("OTP is invalid or expired for sessionId: {}", sessionId);
            return false;
        }

        boolean isValid = data.getOtp().equals(otp);
        if (isValid) {
            data.setUsed(true);
            logger.info("OTP validated successfully for sessionId: {}", sessionId);
        } else {
            logger.warn("Invalid OTP provided for sessionId: {}", sessionId);
        }

        return isValid;
    }

    public String getEmail(String sessionId) {
        OtpData data = otpCache.get(sessionId);
        if (data == null) {
            logger.warn("Attempted to get email for non-existent sessionId: {}", sessionId);
            return null;
        }
        logger.debug("Retrieved email for sessionId: {} -> {}", sessionId, data.getEmail());
        return data.getEmail();
    }

    public void invalidateOtp(String sessionId) {
        logger.info("Invalidating OTP session: {}", sessionId);
        OtpData removed = otpCache.remove(sessionId);
        if (removed != null) {
            logger.debug("Successfully removed OTP session for email: {}", removed.getEmail());
        } else {
            logger.warn("Attempted to invalidate non-existent OTP session: {}", sessionId);
        }
    }

    private String generateOtp() {
        String otp = String.format("%06d", new Random().nextInt(999999));
        logger.debug("Generated new OTP: {}", otp);
        return otp;
    }
}
