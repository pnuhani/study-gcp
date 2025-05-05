package com.qwervego.label.config;

import com.qwervego.label.model.Admin;
import com.qwervego.label.repository.FirestoreAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class InitialDataConfig {

    private static final Logger logger = LoggerFactory.getLogger(InitialDataConfig.class);

    private final FirebaseAuth firebaseAuth;

    @Autowired
    public InitialDataConfig(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    @Bean
    CommandLineRunner initDatabase(FirestoreAdminRepository adminRepository) {
        return args -> {
            // If you have any other initialization logic, keep it here.
            // The superadmin creation/check block is now removed.
        };
    }
}
