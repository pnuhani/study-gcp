package com.qwervego.label.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.qwervego.label.model.Qr;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
public class FirestoreQrRepository {
    private final Firestore firestore;
    private final String COLLECTION_NAME = "qrs";

    @Autowired
    public FirestoreQrRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public Qr save(Qr qr) {
        DocumentReference docRef = qr.getId() == null ? 
            firestore.collection(COLLECTION_NAME).document() :
            firestore.collection(COLLECTION_NAME).document(qr.getId());
        
        if (qr.getId() == null) {
            qr.setId(docRef.getId());
        }
        
        Map<String, Object> data = convertToMap(qr);
        docRef.set(data);
        
        return qr;
    }

    public Optional<Qr> findById(String id) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            
            if (document.exists()) {
                return Optional.of(convertToQr(document));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching QR code", e);
        }
    }

    public Page<Qr> findAll(Pageable pageable) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                .offset(pageable.getPageNumber() * pageable.getPageSize())
                .limit(pageable.getPageSize());
            
            // Get total count
            long total = firestore.collection(COLLECTION_NAME)
                .get().get().getDocuments().size();
            
            // Get paginated results
            List<Qr> qrs = query.get().get().getDocuments().stream()
                .map(this::convertToQr)
                .collect(Collectors.toList());
            
            return new PageImpl<>(qrs, pageable, total);
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching QR codes", e);
        }
    }

    public List<Qr> findAllById(Iterable<String> ids) {
        List<Qr> results = new ArrayList<>();
        for (String id : ids) {
            findById(id).ifPresent(results::add);
        }
        return results;
    }

    public void deleteById(String id) {
        firestore.collection(COLLECTION_NAME).document(id).delete();
    }

    public Optional<Qr> findByPhoneNumber(String phoneNumber) {
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("phoneNumber", phoneNumber)
                .get()
                .get();
            
            if (!querySnapshot.isEmpty()) {
                return Optional.of(convertToQr(querySnapshot.getDocuments().get(0)));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching QR code by phone number", e);
        }
    }

    public Optional<Qr> findByEmail(String email) {
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("email", email)
                .get()
                .get();
            
            if (!querySnapshot.isEmpty()) {
                return Optional.of(convertToQr(querySnapshot.getDocuments().get(0)));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching QR code by email", e);
        }
    }

    private Map<String, Object> convertToMap(Qr qr) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", qr.getId());
        data.put("isActive", qr.isActive());  // Changed from "active" to "isActive"
        data.put("name", qr.getName());
        data.put("email", qr.getEmail());
        data.put("address", qr.getAddress());
        data.put("phoneNumber", qr.getPhoneNumber());
        data.put("password", qr.getPassword());
        data.put("createdDate", qr.getCreatedDate());
        data.put("activationDate", qr.getActivationDate());
        return data;
    }

    private Qr convertToQr(DocumentSnapshot document) {
        Map<String, Object> data = document.getData();
        if (data == null) {
            return null;
        }

        Qr qr = new Qr();
        qr.setId(document.getId());
        
        // Change this line to check for "isActive" instead of "active"
        Boolean active = document.getBoolean("isActive");  // Changed from "active" to "isActive"
        qr.setActive(active != null ? active : false);
        
        // Handle string fields with null checks
        qr.setName(document.getString("name"));
        qr.setEmail(document.getString("email"));
        qr.setAddress(document.getString("address"));
        qr.setPhoneNumber(document.getString("phoneNumber"));
        qr.setPassword(document.getString("password"));
        
        // Handle date fields
        Timestamp createdTimestamp = document.getTimestamp("createdDate");
        if (createdTimestamp != null) {
            qr.setCreatedDate(createdTimestamp.toDate());
        }
        
        Timestamp activationTimestamp = document.getTimestamp("activationDate");
        if (activationTimestamp != null) {
            qr.setActivationDate(activationTimestamp.toDate());
        }
        
        return qr;
    }
} 
