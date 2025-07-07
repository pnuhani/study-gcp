package com.qwervego.label.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "success", true,
            "message", "Backend is running",
            "timestamp", System.currentTimeMillis()
        );
    }

    @PostMapping("/scan")
    public Map<String, Object> testScan(@RequestBody Map<String, String> request) {
        return Map.of(
            "success", true,
            "message", "Test scan endpoint working",
            "qrToken", request.get("qrToken"),
            "phoneNumber", request.get("phoneNumber"),
            "deviceId", request.get("deviceId"),
            "sessionId", "test_session_123"
        );
    }

    @PostMapping("/verify-otp")
    public Map<String, Object> testVerifyOtp(@RequestBody Map<String, String> request) {
        return Map.of(
            "success", true,
            "message", "Test OTP verification working",
            "sessionId", request.get("sessionId"),
            "otp", request.get("otp"),
            "deviceId", request.get("deviceId"),
            "uid", "test_uid_123",
            "customToken", "test_token_123"
        );
    }

    @GetMapping("/welcome")
    public Map<String, Object> testWelcome(@RequestParam String qrToken, 
                                          @RequestParam(required = false) String deviceId) {
        return Map.of(
            "success", true,
            "message", "Test welcome endpoint working",
            "qrId", qrToken,
            "name", "Test User",
            "email", "test@example.com",
            "address", "123 Test Street",
            "phoneNumber", "+1234567890",
            "deviceId", deviceId,
            "welcomeTime", System.currentTimeMillis()
        );
    }
} 