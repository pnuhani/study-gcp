package com.qwervego.label.service;

import com.qwervego.label.dto.AdminCreateRequest;
import com.qwervego.label.dto.AdminResponse;
import com.qwervego.label.model.Admin;
import com.qwervego.label.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final AdminRepository adminRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public AdminService(AdminRepository adminRepository, BCryptPasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Admin findByUsername(String username) {
        return adminRepository.findByUsername(username).orElse(null);
    }

    public ResponseEntity<?> createAdmin(AdminCreateRequest request) {
        // Check if username or email already exists
        if (adminRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (adminRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        Admin admin = new Admin();
        admin.setUsername(request.getUsername());
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setRole(request.getRole());
        admin.setCreatedAt(new Date());
        admin.setActive(true);

        Admin savedAdmin = adminRepository.save(admin);
        return ResponseEntity.ok(convertToResponse(savedAdmin));
    }

    public List<AdminResponse> getAllAdmins() {
        return adminRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ResponseEntity<?> updateAdmin(String id, AdminCreateRequest request) {
        Optional<Admin> adminOpt = adminRepository.findById(id);
        if (adminOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Admin admin = adminOpt.get();
        
        // Check if new username/email conflicts with other admins
        if (!admin.getUsername().equals(request.getUsername()) && 
            adminRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (!admin.getEmail().equals(request.getEmail()) && 
            adminRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        admin.setUsername(request.getUsername());
        admin.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        admin.setRole(request.getRole());

        Admin updatedAdmin = adminRepository.save(admin);
        return ResponseEntity.ok(convertToResponse(updatedAdmin));
    }

    public ResponseEntity<?> deleteAdmin(String id) {
        if (!adminRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        adminRepository.deleteById(id);
        return ResponseEntity.ok().build();
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

}

