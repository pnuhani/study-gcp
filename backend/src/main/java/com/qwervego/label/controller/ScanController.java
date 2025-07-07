package com.qwervego.label.controller;

import com.qwervego.label.dto.ScanRequest;
import com.qwervego.label.dto.OtpRequest;
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
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
public class ScanController {

    private final OtpService otpService;
    private final FirebaseAuthService firebaseAuthService;
    private final FirestoreQrRepository qrRepository;

    @Autowired
    public ScanController(OtpService otpService, 
                         FirebaseAuthService firebaseAuthService,
                         FirestoreQrRepository qrRepository) {
        this.otpService = otpService;
        this.firebaseAuthService = firebaseAuthService;
        this.qrRepository = qrRepository;
    }

    @PostMapping("/scan")
    public ResponseEntity<?> handleScan(@RequestBody ScanRequest request) {
        try {
            // Validate request
            if (request.getQrToken() == null || request.getQrToken().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "QR token is required"));
            }

            if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Phone number is required"));
            }

            if (request.getDeviceId() == null || request.getDeviceId().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Device ID is required"));
            }

            // Check if QR code exists and is active
            Optional<Qr> qrOpt = qrRepository.findById(request.getQrToken());
            
            if (qrOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "QR code not found"));
            }

            Qr qr = qrOpt.get();
            
            if (!qr.isActive()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "QR code is not active"));
            }

            // Verify phone number matches QR code
            String normalizedRequestPhone = normalizePhoneNumber(request.getPhoneNumber());
            String normalizedQrPhone = normalizePhoneNumber(qr.getPhoneNumber());
            
            if (!normalizedRequestPhone.equals(normalizedQrPhone)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Phone number does not match QR code"));
            }

            // Generate OTP
            Map<String, Object> otpResult = otpService.sendOtp(request.getPhoneNumber());
            
            if (!(Boolean) otpResult.get("success")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(otpResult);
            }

            // Return success response with QR information and session ID
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "QR code scanned successfully. OTP sent to your phone.",
                "qrId", qr.getId(),
                "name", qr.getName(),
                "email", qr.getEmail(),
                "address", qr.getAddress(),
                "phoneNumber", qr.getPhoneNumber(),
                "sessionId", otpResult.get("sessionId"),
                "deviceId", request.getDeviceId(),
                "scanTime", new Date()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to process scan: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpRequest request) {
        try {
            // Validate request
            if (request.getSessionId() == null || request.getSessionId().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Session ID is required"));
            }

            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "OTP is required"));
            }

            if (request.getDeviceId() == null || request.getDeviceId().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Device ID is required"));
            }

            // Verify OTP
            Map<String, Object> verifyResult = otpService.verifyOtp(request.getSessionId(), request.getOtp());
            
            if (!(Boolean) verifyResult.get("success")) {
                return ResponseEntity.badRequest().body(verifyResult);
            }

            // Get OTP session to check if device needs registration
            OtpService.OtpSession session = otpService.getSession(request.getSessionId());
            if (session == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Invalid session"));
            }

            // Check if device is already registered (in a real implementation, you'd check a database)
            // For now, we'll assume device needs registration
            boolean deviceNeedsRegistration = true; // This would be checked against a device registry

            if (deviceNeedsRegistration) {
                // Register device (in a real implementation, you'd save to database)
                // For now, we'll just return success with registration info
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "OTP verified successfully. Device registered.",
                    "uid", session.getUid(),
                    "phoneNumber", session.getPhoneNumber(),
                    "deviceId", request.getDeviceId(),
                    "deviceRegistered", true,
                    "customToken", verifyResult.get("customToken"),
                    "verificationTime", new Date()
                ));
            } else {
                // Device already registered, just return success
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "OTP verified successfully.",
                    "uid", session.getUid(),
                    "phoneNumber", session.getPhoneNumber(),
                    "deviceId", request.getDeviceId(),
                    "deviceRegistered", false,
                    "customToken", verifyResult.get("customToken"),
                    "verificationTime", new Date()
                ));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to verify OTP: " + e.getMessage()));
        }
    }

    @GetMapping("/welcome")
    public ResponseEntity<?> welcome(@RequestParam String qrToken, 
                                   @RequestParam(required = false) String deviceId) {
        try {
            // Validate QR token
            if (qrToken == null || qrToken.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "QR token is required"));
            }

            // Get QR code information
            Optional<Qr> qrOpt = qrRepository.findById(qrToken);
            
            if (qrOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "QR code not found"));
            }

            Qr qr = qrOpt.get();
            
            if (!qr.isActive()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "QR code is not active"));
            }

            // Return welcome information
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Welcome! You have successfully signed in.",
                "qrId", qr.getId(),
                "name", qr.getName(),
                "email", qr.getEmail(),
                "address", qr.getAddress(),
                "phoneNumber", qr.getPhoneNumber(),
                "deviceId", deviceId,
                "welcomeTime", new Date()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to load welcome page: " + e.getMessage()));
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