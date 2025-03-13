package com.qwervego.label.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final BCryptPasswordEncoder passwordEncoder;

    // In a real application, these would come from a database
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "admin123";
    private static final Map<String, Long> validTokens = new HashMap<>();

    @Autowired
    public AdminController(BCryptPasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        // Debug logs
        System.out.println("Login attempt - Username: " + username);

        if (username == null || password == null) {
            System.out.println("Missing username or password");
            return ResponseEntity.badRequest().body(
                    Collections.singletonMap("success", false)
            );
        }

        // Check if credentials match
        boolean matches = ADMIN_USERNAME.equals(username) && ADMIN_PASSWORD.equals(password);
        System.out.println("Password: " + password);
        System.out.println("Password matches: " + matches);

        if (matches) {
            // Generate token
            String token = UUID.randomUUID().toString();
            // Store token with expiration time (4 hours from now)
            validTokens.put(token, System.currentTimeMillis() + (4 * 60 * 60 * 1000));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            return ResponseEntity.ok(response);
        }

        System.out.println("Authentication failed");
        return ResponseEntity.status(401).body(
                Collections.singletonMap("success", false)
        );
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, Boolean>> verifyToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(Collections.singletonMap("valid", false));
        }

        String token = authHeader.substring(7); // Remove "Bearer " prefix
        Long expirationTime = validTokens.get(token);

        if (expirationTime == null || expirationTime < System.currentTimeMillis()) {
            // Token not found or expired
            validTokens.remove(token); // Clean up expired token
            return ResponseEntity.ok(Collections.singletonMap("valid", false));
        }

        return ResponseEntity.ok(Collections.singletonMap("valid", true));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Boolean>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            validTokens.remove(token);
        }

        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Admin API is accessible");
        return ResponseEntity.ok(response);
    }
}