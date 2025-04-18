package com.qwervego.label.config;

import com.qwervego.label.model.Admin;
import com.qwervego.label.repository.FirestoreAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Date;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class InitialDataConfig {

    @Value("${admin.superadmin.username}")
    private String superadminUsername;

    @Value("${admin.superadmin.password}")
    private String superadminPassword;

    @Value("${admin.superadmin.email}")
    private String superadminEmail;


    private final FirebaseAuth firebaseAuth;

    @Autowired
    public InitialDataConfig(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    @Bean
    CommandLineRunner initDatabase(FirestoreAdminRepository adminRepository) {
        return args -> {
            try {
                // Check if superadmin exists in Firebase
                try {
                    firebaseAuth.getUserByEmail(superadminEmail);
                } catch (FirebaseAuthException e) {
                    // Create user in Firebase if not exists
                    UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                        .setEmail(superadminEmail)
                        .setPassword(superadminPassword)
                        .setEmailVerified(true);
                    
                    UserRecord userRecord = firebaseAuth.createUser(request);
                    
                    // Set custom claims for SUPERADMIN role
                    Map<String, Object> claims = new HashMap<>();
                    claims.put("role", "SUPERADMIN");
                    firebaseAuth.setCustomUserClaims(userRecord.getUid(), claims);
                }

                // Create or update admin in Firestore
                if (!adminRepository.existsByEmail(superadminEmail)) {
                    Admin superadmin = new Admin();
                    superadmin.setUsername(superadminUsername);
                    superadmin.setEmail(superadminEmail);
                    superadmin.setRole("SUPERADMIN");
                    superadmin.setCreatedAt(new Date());
                    superadmin.setActive(true);
                    adminRepository.save(superadmin);
                }
            } catch (FirebaseAuthException e) {
                throw new RuntimeException("Failed to initialize superadmin user", e);
            }
        };
    }
}
