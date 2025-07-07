package com.qwervego.label.controller;

import com.qwervego.label.service.OtpService;
import com.qwervego.label.service.FirebaseAuthService;
import com.qwervego.label.repository.FirestoreQrRepository;
import com.qwervego.label.model.Qr;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/qr-signin")
@CrossOrigin(origins = "*")
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
public class QrSignInController {

    private final OtpService otpService;
    private final FirebaseAuthService firebaseAuthService;
    private final FirestoreQrRepository qrRepository;

    @Autowired
    public QrSignInController(OtpService otpService, 
                             FirebaseAuthService firebaseAuthService,
                             FirestoreQrRepository qrRepository) {
        this.otpService = otpService;
        this.firebaseAuthService = firebaseAuthService;
        this.qrRepository = qrRepository;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "error", "Phone number is required"));
        }

        Map<String, Object> result = otpService.sendOtp(phoneNumber);
        
        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
        String sessionId = request.get("sessionId");
        String otp = request.get("otp");
        
        if (sessionId == null || otp == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "error", "Session ID and OTP are required"));
        }

        Map<String, Object> result = otpService.verifyOtp(sessionId, otp);
        
        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @GetMapping("/scan/{qrId}")
    public ResponseEntity<Map<String, Object>> scanQrCode(@PathVariable String qrId) {
        try {
            Optional<Qr> qrOpt = qrRepository.findById(qrId);
            
            if (qrOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "QR code not found"));
            }

            Qr qr = qrOpt.get();
            
            if (!qr.isActive()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "QR code is not active"));
            }

            // Return QR code information for sign-in
            return ResponseEntity.ok(Map.of(
                "success", true,
                "qrId", qr.getId(),
                "name", qr.getName(),
                "email", qr.getEmail(),
                "address", qr.getAddress(),
                "phoneNumber", qr.getPhoneNumber(),
                "isActive", qr.isActive(),
                "createdDate", qr.getCreatedDate(),
                "activationDate", qr.getActivationDate()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to scan QR code: " + e.getMessage()));
        }
    }

    @PostMapping("/register-device")
    public ResponseEntity<Map<String, Object>> registerDevice(@RequestBody Map<String, String> request,
                                                             @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "error", "Authentication required"));
        }

        String idToken = authHeader.substring(7);
        
        try {
            // Verify the Firebase ID token
            String uid = firebaseAuthService.verifyIdToken(idToken);
            String verifiedPhone = firebaseAuthService.getPhoneNumber(uid);
            
            String qrId = request.get("qrId");
            String deviceId = request.get("deviceId");
            String deviceName = request.get("deviceName");
            
            if (qrId == null || deviceId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "QR ID and Device ID are required"));
            }

            Optional<Qr> qrOpt = qrRepository.findById(qrId);
            
            if (qrOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "QR code not found"));
            }

            Qr qr = qrOpt.get();
            
            // Verify phone number matches
            String normalizedVerifiedPhone = normalizePhoneNumber(verifiedPhone);
            String normalizedQrPhone = normalizePhoneNumber(qr.getPhoneNumber());
            
            if (!normalizedVerifiedPhone.equals(normalizedQrPhone)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Phone number verification failed"));
            }

            // In a real implementation, you would store device registration in a database
            // For now, we'll just return success
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Device registered successfully",
                "qrId", qrId,
                "deviceId", deviceId,
                "deviceName", deviceName,
                "phoneNumber", verifiedPhone
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "error", "Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<Map<String, Object>> signIn(@RequestBody Map<String, String> request,
                                                     @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "error", "Authentication required"));
        }

        String idToken = authHeader.substring(7);
        
        try {
            // Verify the Firebase ID token
            String uid = firebaseAuthService.verifyIdToken(idToken);
            String verifiedPhone = firebaseAuthService.getPhoneNumber(uid);
            
            String qrId = request.get("qrId");
            
            if (qrId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "QR ID is required"));
            }

            Optional<Qr> qrOpt = qrRepository.findById(qrId);
            
            if (qrOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "QR code not found"));
            }

            Qr qr = qrOpt.get();
            
            // Verify phone number matches
            String normalizedVerifiedPhone = normalizePhoneNumber(verifiedPhone);
            String normalizedQrPhone = normalizePhoneNumber(qr.getPhoneNumber());
            
            if (!normalizedVerifiedPhone.equals(normalizedQrPhone)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Phone number verification failed"));
            }

            // Return success with QR information
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Sign-in successful",
                "qrId", qr.getId(),
                "name", qr.getName(),
                "email", qr.getEmail(),
                "address", qr.getAddress(),
                "phoneNumber", qr.getPhoneNumber(),
                "uid", uid,
                "signInTime", new Date()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "error", "Authentication failed: " + e.getMessage()));
        }
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
} 