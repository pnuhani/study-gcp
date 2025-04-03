package com.qwervego.label.config;

import com.qwervego.label.model.Admin;
import com.qwervego.label.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Date;

@Configuration
public class InitialDataConfig {

    @Value("${admin.superadmin.username}")
    private String superadminUsername;

    @Value("${admin.superadmin.password}")
    private String superadminPassword;

    @Value("${admin.superadmin.email}")
    private String superadminEmail;

    @Bean
    CommandLineRunner initDatabase(AdminRepository adminRepository, BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            if (!adminRepository.existsByUsername(superadminUsername)) {
                Admin superadmin = new Admin();
                superadmin.setUsername(superadminUsername);
                superadmin.setPassword(passwordEncoder.encode(superadminPassword));
                superadmin.setEmail(superadminEmail);
                superadmin.setRole("SUPERADMIN");
                superadmin.setCreatedAt(new Date());
                superadmin.setActive(true);
                adminRepository.save(superadmin);
            }
        };
    }
}