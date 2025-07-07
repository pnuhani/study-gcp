package com.qwervego.label.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping
    public Map<String, Object> health() {
        return Map.of(
            "status", "UP",
            "message", "Backend is running",
            "timestamp", System.currentTimeMillis()
        );
    }

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of(
            "pong", true,
            "timestamp", System.currentTimeMillis()
        );
    }
} 