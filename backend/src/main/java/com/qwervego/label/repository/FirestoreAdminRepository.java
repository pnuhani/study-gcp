package com.qwervego.label.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.qwervego.label.model.Admin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
public class FirestoreAdminRepository {
    private final Firestore firestore;
    private final String COLLECTION_NAME = "admins";

    @Autowired
    public FirestoreAdminRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public Admin save(Admin admin) {
        DocumentReference docRef = admin.getId() == null ? 
            firestore.collection(COLLECTION_NAME).document() :
            firestore.collection(COLLECTION_NAME).document(admin.getId());
        
        if (admin.getId() == null) {
            admin.setId(docRef.getId());
        }
        
        Map<String, Object> data = convertToMap(admin);
        docRef.set(data);
        
        return admin;
    }

    public Optional<Admin> findById(String id) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            
            if (document.exists()) {
                return Optional.of(convertToAdmin(document));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching admin", e);
        }
    }

    public List<Admin> findAll() {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            return documents.stream()
                .map(this::convertToAdmin)
                .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching admins", e);
        }
    }

    public void deleteById(String id) {
        firestore.collection(COLLECTION_NAME).document(id).delete();
    }

    public Optional<Admin> findByUsername(String username) {
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("username", username)
                .get()
                .get();
            
            if (!querySnapshot.isEmpty()) {
                return Optional.of(convertToAdmin(querySnapshot.getDocuments().get(0)));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching admin by username", e);
        }
    }

    public Optional<Admin> findByEmail(String email) {
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("email", email)
                .get()
                .get();
            
            if (!querySnapshot.isEmpty()) {
                return Optional.of(convertToAdmin(querySnapshot.getDocuments().get(0)));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching admin by email", e);
        }
    }

    public boolean existsByUsername(String username) {
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("username", username)
                .get()
                .get();
            return !querySnapshot.isEmpty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error checking username existence", e);
        }
    }

    public boolean existsByEmail(String email) {
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("email", email)
                .get()
                .get();
            return !querySnapshot.isEmpty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error checking email existence", e + " Email : " + email);
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