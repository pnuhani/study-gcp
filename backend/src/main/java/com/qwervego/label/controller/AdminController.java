package com.qwervego.label.controller;

import java.util.*;

import com.qwervego.label.dto.AdminCreateRequest;
import com.qwervego.label.dto.AdminResponse;
import com.qwervego.label.model.Admin;
import com.qwervego.label.repository.AdminRepository;
import com.qwervego.label.service.AdminService;
import com.qwervego.label.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AdminService adminService;
    private final AdminRepository adminRepository;

    @Autowired
    public AdminController(JwtService jwtService, BCryptPasswordEncoder passwordEncoder, AdminService adminService, AdminRepository adminRepository) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.adminService = adminService;
        this.adminRepository = adminRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials, HttpServletResponse response) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Admin admin = adminService.findByUsername(username);
        if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
            String role = admin.getRole();
            ResponseCookie jwtCookie = jwtService.generateJwtCookie(username, role);
            
            response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("role", role);
            responseBody.put("success", true);
            return ResponseEntity.ok(responseBody);
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials", "success", false));
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(HttpServletRequest request) {
        String jwt = jwtService.getJwtFromRequest(request);
        if (jwt != null && jwtService.isTokenValid(jwt)) {
            String username = jwtService.extractUsername(jwt);
            String role = jwtService.extractRole(jwt);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("username", username);
            responseBody.put("role", role);
            responseBody.put("success", true);
            return ResponseEntity.ok(responseBody);
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid token", "success", false));
    }

    @PostMapping("/superadmin/create")
    public ResponseEntity<?> createAdmin(@Valid @RequestBody AdminCreateRequest request) {
        return adminService.createAdmin(request);
    }

    @GetMapping("/superadmin/admins")
    public ResponseEntity<List<AdminResponse>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    @GetMapping("/superadmin/admins/{id}")
    public ResponseEntity<?> getAdmin(@PathVariable String id) {
        Optional<Admin> admin = adminRepository.findById(id);
        return admin.map(value -> ResponseEntity.ok(adminService.convertToResponse(value)))
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/superadmin/admins/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable String id, @Valid @RequestBody AdminCreateRequest request) {
        return adminService.updateAdmin(id, request);
    }

    @DeleteMapping("/superadmin/admins/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable String id) {
        return adminService.deleteAdmin(id);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie jwtCookie = jwtService.getCleanJwtCookie();
        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());
        return ResponseEntity.ok(Map.of("success", true));
    }
}
