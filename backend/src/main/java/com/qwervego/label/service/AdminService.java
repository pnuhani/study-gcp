package com.qwervego.label.service;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.qwervego.label.dto.AdminCreateRequest;
import com.qwervego.label.dto.AdminResponse;
import com.qwervego.label.model.Admin;
import com.qwervego.label.repository.FirestoreAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
public class AdminService {
    private final FirestoreAdminRepository adminRepository;
    private final FirebaseAuthService firebaseAuthService;

    @Autowired
    public AdminService(FirestoreAdminRepository adminRepository, FirebaseAuthService firebaseAuthService) {
        this.adminRepository = adminRepository;
        this.firebaseAuthService = firebaseAuthService;
    }

    public Admin findByUsername(String username) {
        return adminRepository.findByUsername(username).orElse(null);
    }

    public ResponseEntity<?> createAdmin(AdminCreateRequest request) {
        try {
            // First create the user in Firebase Auth
            UserRecord userRecord = firebaseAuthService.createUser(request);

            // Then create the admin record in Firestore
            Admin admin = new Admin();
            admin.setId(userRecord.getUid());
            admin.setUsername(request.getUsername());
            admin.setEmail(request.getEmail());
            admin.setRole(request.getRole());
            admin.setCreatedAt(new Date());
            admin.setActive(true);

            Admin savedAdmin = adminRepository.save(admin);
            return ResponseEntity.ok(convertToResponse(savedAdmin));
        } catch (FirebaseAuthException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to create admin: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    public List<AdminResponse> getAllAdmins() {
        return adminRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ResponseEntity<?> updateAdmin(String id, AdminCreateRequest request) {
        try {
            Optional<Admin> adminOpt = adminRepository.findById(id);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Admin admin = adminOpt.get();
            
            // Update in Firebase Auth
            firebaseAuthService.updateUser(id, request);

            // Update in Firestore
            admin.setUsername(request.getUsername());
            admin.setEmail(request.getEmail());
            admin.setRole(request.getRole());

            Admin updatedAdmin = adminRepository.save(admin);
            return ResponseEntity.ok(convertToResponse(updatedAdmin));
        } catch (FirebaseAuthException e) {
            return ResponseEntity.badRequest().body("Failed to update admin: " + e.getMessage());
        }
    }

    public ResponseEntity<?> deleteAdmin(String id) {
        try {
            Optional<Admin> adminOpt = adminRepository.findById(id);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Delete from Firebase Auth
            firebaseAuthService.deleteUser(id);

            // Delete from Firestore
            adminRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (FirebaseAuthException e) {
            return ResponseEntity.badRequest().body("Failed to delete admin: " + e.getMessage());
        }
    }

    public AdminResponse convertToResponse(Admin admin) {
        AdminResponse response = new AdminResponse();
        response.setId(admin.getId());
        response.setUsername(admin.getUsername());
        response.setEmail(admin.getEmail());
        response.setRole(admin.getRole());
        response.setCreatedAt(admin.getCreatedAt());
        response.setLastLogin(admin.getLastLogin());
        response.setActive(admin.isActive());
        return response;
    }

    public void updateLastLogin(String username) {
        adminRepository.findByUsername(username).ifPresent(admin -> {
            admin.setLastLogin(new Date());
            adminRepository.save(admin);
        });
    }

    public ResponseEntity<?> findById(String id) {
        Optional<Admin> adminOpt = adminRepository.findById(id);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return ResponseEntity.ok(convertToResponse(admin));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

