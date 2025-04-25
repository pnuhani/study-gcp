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
import java.io.IOException;

@Configuration
public class FirestoreConfig {
    private static final Logger logger = LoggerFactory.getLogger(FirestoreConfig.class);
    
    @Value("${FIREBASE_PROJECT_ID}")
    private String projectId;

    @Value("${FIREBASE_CREDENTIALS}")
    private String firebaseCredentials;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                logger.info("Initializing Firebase App...");
                
                // Validate environment variables
                if (projectId == null || projectId.trim().isEmpty()) {
                    throw new IllegalArgumentException("FIREBASE_PROJECT_ID environment variable is not set");
                }
                if (firebaseCredentials == null || firebaseCredentials.trim().isEmpty()) {
                    throw new IllegalArgumentException("FIREBASE_CREDENTIALS environment variable is not set");
                }

                logger.info("Using Firebase Project ID: {}", projectId);
                logger.debug("Firebase credentials length: {}", firebaseCredentials.length());

                // Initialize Firebase with environment variables
                GoogleCredentials credentials = GoogleCredentials.fromStream(
                    new ByteArrayInputStream(firebaseCredentials.getBytes())
                );

                FirebaseOptions options = FirebaseOptions.builder()
                    .setProjectId(projectId)
                    .setCredentials(credentials)
                    .build();

                FirebaseApp app = FirebaseApp.initializeApp(options);
                logger.info("Firebase App initialized successfully");
                return app;
            }
            return FirebaseApp.getInstance();
        } catch (IllegalArgumentException e) {
            logger.error("Firebase configuration error: {}", e.getMessage());
            throw new IllegalStateException("Failed to initialize Firebase: Configuration error", e);
        } catch (IOException e) {
            logger.error("Error reading Firebase credentials: {}", e.getMessage());
            throw new IllegalStateException("Failed to initialize Firebase: Credentials error", e);
        } catch (Exception e) {
            logger.error("Unexpected error initializing Firebase: {}", e.getMessage());
            throw new IllegalStateException("Failed to initialize Firebase", e);
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
        return FirebaseAuth.getInstance(firebaseApp);
    }

    @Bean
    public Firestore firestore(FirebaseApp firebaseApp) {
        return FirestoreClient.getFirestore(firebaseApp);
    }
}