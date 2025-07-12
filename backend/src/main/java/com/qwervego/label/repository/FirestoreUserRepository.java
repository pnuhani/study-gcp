package com.qwervego.label.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.qwervego.label.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Repository
public class FirestoreUserRepository {
    private static final Logger logger = LoggerFactory.getLogger(FirestoreUserRepository.class);
    private final Firestore firestore;
    private final String COLLECTION_NAME = "users";

    @Autowired
    public FirestoreUserRepository(Firestore firestore) {
        this.firestore = firestore;
        logger.info("Initialized FirestoreUserRepository with collection: {}", COLLECTION_NAME);
    }

    public User save(User user) {
        logger.info("Saving User document with phone: {}", user.getPhoneNumber());
        DocumentReference docRef = user.getId() == null ?
            firestore.collection(COLLECTION_NAME).document() :
            firestore.collection(COLLECTION_NAME).document(user.getId());

        if (user.getId() == null) {
            user.setId(docRef.getId());
            logger.info("Generated new document ID: {}", docRef.getId());
        }

        Map<String, Object> data = convertToMap(user);
        docRef.set(data);
        logger.info("Successfully saved User document with ID: {}", user.getId());
        return user;
    }

    public Optional<User> findByPhoneNumber(String phoneNumber) {
        logger.info("Finding User document by phone number: {}", phoneNumber);
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("phoneNumber", phoneNumber)
                .get()
                .get();

            if (!querySnapshot.isEmpty()) {
                logger.info("Found User document with phone number: {}", phoneNumber);
                return Optional.of(convertToUser(querySnapshot.getDocuments().get(0)));
            }
            logger.info("No User document found with phone number: {}", phoneNumber);
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching User document by phone number {}: {}", phoneNumber, e.getMessage(), e);
            throw new RuntimeException("Error fetching User by phone number", e);
        }
    }

    private Map<String, Object> convertToMap(User user) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("phoneNumber", user.getPhoneNumber());
        data.put("createdDate", user.getCreatedDate());
        return data;
    }

    private User convertToUser(DocumentSnapshot document) {
        Map<String, Object> data = document.getData();
        if (data == null) {
            logger.warn("Document {} has no data", document.getId());
            return null;
        }
        User user = new User();
        user.setId(document.getId());
        user.setPhoneNumber(document.getString("phoneNumber"));
        user.setCreatedDate(document.getDate("createdDate"));
        return user;
    }
} 