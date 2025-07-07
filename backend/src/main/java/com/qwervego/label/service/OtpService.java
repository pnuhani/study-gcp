package com.qwervego.label.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
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
            // Normalize phone number
            String normalizedPhone = normalizePhoneNumber(phoneNumber);
            
            // Generate session ID
            String sessionId = generateSessionId();
            
            // Create OTP session
            OtpSession session = new OtpSession(normalizedPhone, sessionId);
            otpSessions.put(sessionId, session);
            
            // Schedule cleanup after 10 minutes
            scheduler.schedule(() -> {
                otpSessions.remove(sessionId);
            }, 10, TimeUnit.MINUTES);
            
            // In a real implementation, you would integrate with SMS service
            // For now, we'll simulate OTP sending
            // In production, you would use Firebase Phone Auth or a service like Twilio
            
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
        OtpSession session = otpSessions.get(sessionId);
        
        if (session == null) {
            return Map.of(
                "success", false,
                "error", "Invalid or expired session"
            );
        }
        
        // Check if session is expired (10 minutes)
        if (System.currentTimeMillis() - session.getCreatedAt() > 10 * 60 * 1000) {
            otpSessions.remove(sessionId);
            return Map.of(
                "success", false,
                "error", "OTP session expired"
            );
        }
        
        // For demo purposes, we'll accept any 6-digit OTP
        // In production, you would validate against the actual OTP sent
        if (otp == null || otp.length() != 6 || !otp.matches("\\d{6}")) {
            return Map.of(
                "success", false,
                "error", "Invalid OTP format"
            );
        }
        
        try {
            // Mark session as verified
            session.setVerified(true);
            
            // Create or get Firebase user
            String uid = createOrGetFirebaseUser(session.getPhoneNumber());
            session.setUid(uid);
            
            // Generate Firebase custom token
            String customToken = firebaseAuth.createCustomToken(uid);
            
            return Map.of(
                "success", true,
                "message", "OTP verified successfully",
                "uid", uid,
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