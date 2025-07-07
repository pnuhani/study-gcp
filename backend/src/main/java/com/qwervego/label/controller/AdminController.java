package com.qwervego.label.controller;

import com.qwervego.label.dto.AdminCreateRequest;
import com.qwervego.label.dto.AdminResponse;
import com.qwervego.label.model.Admin;
import com.qwervego.label.repository.FirestoreAdminRepository;
import com.qwervego.label.service.AdminService;
import com.qwervego.label.service.FirebaseAuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
public class AdminController {

    private final FirebaseAuthService firebaseAuthService;
    private final AdminService adminService;
    private final FirestoreAdminRepository adminRepository;

    public AdminController(FirebaseAuthService firebaseAuthService, AdminService adminService, FirestoreAdminRepository adminRepository) {
        this.firebaseAuthService = firebaseAuthService;
        this.adminService = adminService;
        this.adminRepository = adminRepository;
    }

    // @GetMapping("/verify")
    // public ResponseEntity<Map<String, Object>> verifyToken(...) { ... }


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
        return ResponseEntity.ok(Map.of("success", true));
    }
}
