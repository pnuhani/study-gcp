package com.qwervego.label.config;

import com.google.cloud.firestore.Firestore;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
public class FirestoreHealthIndicator implements HealthIndicator {

    private static final Logger logger = LoggerFactory.getLogger(FirestoreHealthIndicator.class);

    private final Firestore firestore;

    public FirestoreHealthIndicator(Firestore firestore) {
        this.firestore = firestore;
    }

    @Override
    public Health health() {
        try {
            // Get and log the list of collection IDs
            StringBuilder collectionsList = new StringBuilder();
            for (var collection : firestore.listCollections()) {
                collectionsList.append(collection.getId()).append(", ");
            }
            String collections = collectionsList.length() > 0
                    ? collectionsList.substring(0, collectionsList.length() - 2)
                    : "(none)";
            logger.info("Firestore health check: Connected. Collections: {}", collections);

            return Health.up()
                    .withDetail("firestore", "Connected")
                    .withDetail("collections", collections)
                    .build();
        } catch (Exception e) {
            logger.error("Firestore health check failed: {}", e.getMessage(), e);
            return Health.down(e).withDetail("firestore", "Not connected").build();
        }
    }
}