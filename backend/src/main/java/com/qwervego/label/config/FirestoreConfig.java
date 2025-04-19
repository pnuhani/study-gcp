package com.qwervego.label.config;


//
//
//
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.ByteArrayInputStream;

@Configuration
public class FirestoreConfig {
    
  @Value("${firebase.project.id}")
    private String projectId;

    @Value("${FIREBASE_CREDENTIALS:}")
    private String firebaseCredentials;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            GoogleCredentials credentials;
            
            if (!firebaseCredentials.isEmpty()) {
                // Use credentials from environment variable
                credentials = GoogleCredentials.fromStream(
                    new ByteArrayInputStream(firebaseCredentials.getBytes())
                );
            } else {
                // Fall back to file-based credentials
                credentials = GoogleCredentials.fromStream(
                    new ClassPathResource("serviceAccountKey.json").getInputStream()
                );
            }

            FirebaseOptions options = FirebaseOptions.builder()
                .setProjectId(projectId)
                .setCredentials(credentials)
                .build();

            return FirebaseApp.initializeApp(options);
        }
        return FirebaseApp.getInstance();
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
