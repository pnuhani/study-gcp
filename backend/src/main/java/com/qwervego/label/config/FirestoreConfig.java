package com.qwervego.label.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.File;
import java.io.FileNotFoundException;
import java.util.Base64;

@Configuration
public class FirestoreConfig {
    private final Logger logger = LoggerFactory.getLogger(FirestoreConfig.class);

    @Value("${firebase.project.id}")
    private String projectId;

    @Value("${firebase.credentials}")
    private String firebaseCredentials;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                logger.info("Initializing Firebase App...");
                
                if (projectId == null || projectId.isEmpty()) {
                    throw new IllegalArgumentException("Firebase project ID is not configured");
                }
                
                if (firebaseCredentials == null || firebaseCredentials.isEmpty()) {
                    throw new IllegalArgumentException("Firebase credentials (Base64) are not configured");
                }
                
                logger.info("Using Base64 encoded Firebase credentials");
                logger.info("Connecting to Firebase project: {}", projectId);
                byte[] decodedCredentials = Base64.getDecoder().decode(firebaseCredentials);
                GoogleCredentials credentials = GoogleCredentials.fromStream(new ByteArrayInputStream(decodedCredentials));

                FirebaseOptions options = FirebaseOptions.builder()
                    .setProjectId(projectId)
                    .setCredentials(credentials)
                    .build();

                FirebaseApp app = FirebaseApp.initializeApp(options);
                logger.info("Firebase App initialized successfully with project ID: {}", projectId);
                return app;
            }
            logger.info("Using existing Firebase App instance with project ID: {}", projectId);
            return FirebaseApp.getInstance();
        } catch (Exception e) {
            logger.error("Error initializing Firebase: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
        logger.info("Initializing Firebase Auth for project: {}", projectId);
        return FirebaseAuth.getInstance(firebaseApp);
    }

    @Bean
    public Firestore firestore(FirebaseApp firebaseApp) {
        logger.info("Initializing Firestore client for project: {}", projectId);
        Firestore firestore = FirestoreClient.getFirestore(firebaseApp);
        logger.info("Firestore client initialized successfully");
        return firestore;
    }
}
