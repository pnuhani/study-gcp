package com.qwervego.label.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
public class OtpService {
    
    private final FirebaseAuth firebaseAuth;
    private final Map<String, OtpSession> otpSessions = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    @Autowired
    public OtpService(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }
    
    public static class OtpSession {
        private String phoneNumber;
        private String sessionId;
        private long createdAt;
        private boolean verified;
        private String uid;
        
        public OtpSession(String phoneNumber, String sessionId) {
            this.phoneNumber = phoneNumber;
            this.sessionId = sessionId;
            this.createdAt = System.currentTimeMillis();
            this.verified = false;
        }
        
        // Getters and setters
        public String getPhoneNumber() { return phoneNumber; }
        public String getSessionId() { return sessionId; }
        public long getCreatedAt() { return createdAt; }
        public boolean isVerified() { return verified; }
        public void setVerified(boolean verified) { this.verified = verified; }
        public String getUid() { return uid; }
        public void setUid(String uid) { this.uid = uid; }
    }
    
    public Map<String, Object> sendOtp(String phoneNumber) {
        try {
            String normalizedPhone = normalizePhoneNumber(phoneNumber);
            
            // Generate OTP (for demo purposes, use a fixed OTP)
            String otp = "123456"; // In production, generate random OTP
            
            // Create session
            String sessionId = generateSessionId();
            OtpSession session = new OtpSession(normalizedPhone, sessionId);
            otpSessions.put(sessionId, session);
            
            // Schedule cleanup after 10 minutes
            scheduler.schedule(() -> cleanupSession(sessionId), 10, TimeUnit.MINUTES);
            
            // Create or get Firebase user
            String uid = createOrGetFirebaseUser(normalizedPhone);
            session.setUid(uid);
            
            return Map.of(
                "success", true,
                "sessionId", sessionId,
                "message", "OTP sent successfully",
                "phoneNumber", normalizedPhone
            );
            
        } catch (Exception e) {
            return Map.of(
                "success", false,
                "error", "Failed to send OTP: " + e.getMessage()
            );
        }
    }
    
    public Map<String, Object> verifyOtp(String sessionId, String otp) {
        try {
            OtpSession session = otpSessions.get(sessionId);
            
            if (session == null) {
                return Map.of(
                    "success", false,
                    "error", "Invalid session"
                );
            }
            
            // Check if session is expired (10 minutes)
            if (System.currentTimeMillis() - session.getCreatedAt() > 10 * 60 * 1000) {
                otpSessions.remove(sessionId);
                return Map.of(
                    "success", false,
                    "error", "Session expired"
                );
            }
            
            // For demo purposes, accept any 6-digit OTP
            if (otp == null || otp.length() != 6) {
                return Map.of(
                    "success", false,
                    "error", "Invalid OTP format"
                );
            }
            
            // Mark session as verified
            session.setVerified(true);
            
            // Generate custom token for Firebase
            String customToken = firebaseAuth.createCustomToken(session.getUid());
            
            return Map.of(
                "success", true,
                "message", "OTP verified successfully",
                "uid", session.getUid(),
                "customToken", customToken,
                "phoneNumber", session.getPhoneNumber()
            );
            
        } catch (Exception e) {
            return Map.of(
                "success", false,
                "error", "Failed to verify OTP: " + e.getMessage()
            );
        }
    }
    
    private String createOrGetFirebaseUser(String phoneNumber) throws FirebaseAuthException {
        try {
            // Try to get existing user by phone number
            UserRecord userRecord = firebaseAuth.getUserByPhoneNumber(phoneNumber);
            return userRecord.getUid();
        } catch (FirebaseAuthException e) {
            if (e.getAuthErrorCode().name().equals("USER_NOT_FOUND")) {
                // Create new user
                UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                    .setPhoneNumber(phoneNumber);
                
                UserRecord userRecord = firebaseAuth.createUser(request);
                return userRecord.getUid();
            }
            throw e;
        }
    }
    
    private String generateSessionId() {
        return "session_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 10000);
    }
    
    private String normalizePhoneNumber(String phoneNumber) {
        if (phoneNumber == null) return null;
        
        // Remove all non-digit characters
        String normalized = phoneNumber.replaceAll("[^\\d]", "");
        
        // Add country code if not present (assuming +1 for US)
        if (normalized.length() == 10) {
            normalized = "1" + normalized;
        }
        
        // Add + prefix
        return "+" + normalized;
    }
    
    public OtpSession getSession(String sessionId) {
        return otpSessions.get(sessionId);
    }
    
    public void cleanupSession(String sessionId) {
        otpSessions.remove(sessionId);
    }
} 