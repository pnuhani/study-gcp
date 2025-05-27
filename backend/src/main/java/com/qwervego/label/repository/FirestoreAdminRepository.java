package com.qwervego.label.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.qwervego.label.model.Admin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
public class FirestoreAdminRepository {
    private static final Logger logger = LoggerFactory.getLogger(FirestoreAdminRepository.class);
    private final Firestore firestore;
    private final String COLLECTION_NAME = "admins";

    @Autowired
    public FirestoreAdminRepository(Firestore firestore) {
        this.firestore = firestore;
        logger.info("Initialized FirestoreAdminRepository with collection: {}", COLLECTION_NAME);
    }

    public Admin save(Admin admin) {
        logger.info("Saving admin document with ID: {}", admin.getId());
        DocumentReference docRef = admin.getId() == null ? 
            firestore.collection(COLLECTION_NAME).document() :
            firestore.collection(COLLECTION_NAME).document(admin.getId());
        
        if (admin.getId() == null) {
            admin.setId(docRef.getId());
            logger.info("Generated new document ID: {}", docRef.getId());
        }
        
        Map<String, Object> data = convertToMap(admin);
        logger.debug("Document data to save: {}", data);
        docRef.set(data);
        logger.info("Successfully saved admin document with ID: {}", admin.getId());
        
        return admin;
    }

    public Optional<Admin> findById(String id) {
        logger.info("Finding admin document by ID: {}", id);
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            
            if (document.exists()) {
                logger.info("Found admin document with ID: {}", id);
                return Optional.of(convertToAdmin(document));
            }
            logger.info("No admin document found with ID: {}", id);
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching admin document with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error fetching admin", e);
        }
    }

    public List<Admin> findAll() {
        logger.info("Finding all admin documents");
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            logger.info("Retrieved {} admin documents", documents.size());
            return documents.stream()
                .map(this::convertToAdmin)
                .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching admin documents: {}", e.getMessage(), e);
            throw new RuntimeException("Error fetching admins", e);
        }
    }

    public void deleteById(String id) {
        logger.info("Deleting admin document with ID: {}", id);
        firestore.collection(COLLECTION_NAME).document(id).delete();
        logger.info("Successfully deleted admin document with ID: {}", id);
    }

    public Optional<Admin> findByUsername(String username) {
        logger.info("Finding admin document by username: {}", username);
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("username", username)
                .get()
                .get();
            
            if (!querySnapshot.isEmpty()) {
                logger.info("Found admin document with username: {}", username);
                return Optional.of(convertToAdmin(querySnapshot.getDocuments().get(0)));
            }
            logger.info("No admin document found with username: {}", username);
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching admin document by username {}: {}", username, e.getMessage(), e);
            throw new RuntimeException("Error fetching admin by username", e);
        }
    }

    public Optional<Admin> findByEmail(String email) {
        logger.info("Finding admin document by email: {}", email);
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("email", email)
                .get()
                .get();
            
            if (!querySnapshot.isEmpty()) {
                logger.info("Found admin document with email: {}", email);
                return Optional.of(convertToAdmin(querySnapshot.getDocuments().get(0)));
            }
            logger.info("No admin document found with email: {}", email);
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching admin document by email {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Error fetching admin by email", e);
        }
    }

    public boolean existsByUsername(String username) {
        logger.info("Checking if admin exists with username: {}", username);
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("username", username)
                .get()
                .get();
            boolean exists = !querySnapshot.isEmpty();
            logger.info("Admin exists with username {}: {}", username, exists);
            return exists;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error checking username existence for {}: {}", username, e.getMessage(), e);
            throw new RuntimeException("Error checking username existence", e);
        }
    }

    public boolean existsByEmail(String email) {
        logger.info("Checking if admin exists with email: {}", email);
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("email", email)
                .get()
                .get();
            
            boolean exists = !querySnapshot.isEmpty();
            logger.info("Admin exists with email {}: {}", email, exists);
            return exists;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error checking email existence for {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Error checking email existence", e);
        }
    }

    private Map<String, Object> convertToMap(Admin admin) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", admin.getId());
        data.put("username", admin.getUsername());
        data.put("email", admin.getEmail());
        data.put("password", admin.getPassword());
        data.put("role", admin.getRole());
        data.put("createdAt", admin.getCreatedAt());
        data.put("lastLogin", admin.getLastLogin());
        data.put("active", admin.isActive());
        return data;
    }

    private Admin convertToAdmin(DocumentSnapshot document) {
        Map<String, Object> data = document.getData();
        if (data == null) {
            logger.warn("Document {} has no data", document.getId());
            return null;
        }

        Admin admin = new Admin();
        admin.setId(document.getId());
        admin.setUsername(document.getString("username"));
        admin.setEmail(document.getString("email"));
        admin.setPassword(document.getString("password"));
        admin.setRole(document.getString("role"));
        admin.setCreatedAt(document.getDate("createdAt"));
        admin.setLastLogin(document.getDate("lastLogin"));
        admin.setActive(document.getBoolean("active"));
        return admin;
    }
} 