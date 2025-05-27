package com.qwervego.label.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.qwervego.label.model.Qr;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger logger = LoggerFactory.getLogger(FirestoreQrRepository.class);
    private final Firestore firestore;
    private final String COLLECTION_NAME = "qrs";

    @Autowired
    public FirestoreQrRepository(Firestore firestore) {
        this.firestore = firestore;
        logger.info("Initialized FirestoreQrRepository with collection: {}", COLLECTION_NAME);
    }

    public Qr save(Qr qr) {
        logger.info("Saving QR document with ID: {}", qr.getId());
        DocumentReference docRef = qr.getId() == null ? 
            firestore.collection(COLLECTION_NAME).document() :
            firestore.collection(COLLECTION_NAME).document(qr.getId());
        
        if (qr.getId() == null) {
            qr.setId(docRef.getId());
            logger.info("Generated new document ID: {}", docRef.getId());
        }
        
        Map<String, Object> data = convertToMap(qr);
        logger.debug("Document data to save: {}", data);
        docRef.set(data);
        logger.info("Successfully saved QR document with ID: {}", qr.getId());
        
        return qr;
    }

    public Optional<Qr> findById(String id) {
        logger.info("Finding QR document by ID: {}", id);
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            
            if (document.exists()) {
                logger.info("Found QR document with ID: {}", id);
                return Optional.of(convertToQr(document));
            }
            logger.info("No QR document found with ID: {}", id);
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching QR document with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error fetching QR code", e);
        }
    }

    public Page<Qr> findAll(Pageable pageable) {
        logger.info("Finding all QR documents with pagination - page: {}, size: {}", 
            pageable.getPageNumber(), pageable.getPageSize());
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                .offset(pageable.getPageNumber() * pageable.getPageSize())
                .limit(pageable.getPageSize());
            
            // Get total count
            long total = firestore.collection(COLLECTION_NAME)
                .get().get().getDocuments().size();
            logger.info("Total QR documents count: {}", total);
            
            // Get paginated results
            List<Qr> qrs = query.get().get().getDocuments().stream()
                .map(this::convertToQr)
                .collect(Collectors.toList());
            
            logger.info("Retrieved {} QR documents for current page", qrs.size());
            return new PageImpl<>(qrs, pageable, total);
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching QR documents: {}", e.getMessage(), e);
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
        logger.info("Deleting QR document with ID: {}", id);
        firestore.collection(COLLECTION_NAME).document(id).delete();
        logger.info("Successfully deleted QR document with ID: {}", id);
    }

    public Optional<Qr> findByPhoneNumber(String phoneNumber) {
        logger.info("Finding QR document by phone number: {}", phoneNumber);
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("phoneNumber", phoneNumber)
                .get()
                .get();
            
            if (!querySnapshot.isEmpty()) {
                logger.info("Found QR document with phone number: {}", phoneNumber);
                return Optional.of(convertToQr(querySnapshot.getDocuments().get(0)));
            }
            logger.info("No QR document found with phone number: {}", phoneNumber);
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching QR document by phone number {}: {}", phoneNumber, e.getMessage(), e);
            throw new RuntimeException("Error fetching QR code by phone number", e);
        }
    }

    public Optional<Qr> findByEmail(String email) {
        logger.info("Finding QR document by email: {}", email);
        try {
            QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("email", email)
                .get()
                .get();
            
            if (!querySnapshot.isEmpty()) {
                logger.info("Found QR document with email: {}", email);
                return Optional.of(convertToQr(querySnapshot.getDocuments().get(0)));
            }
            logger.info("No QR document found with email: {}", email);
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching QR document by email {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Error fetching QR code by email", e);
        }
    }

    private Map<String, Object> convertToMap(Qr qr) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", qr.getId());
        data.put("isActive", qr.isActive());
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
            logger.warn("Document {} has no data", document.getId());
            return null;
        }

        Qr qr = new Qr();
        qr.setId(document.getId());
        
        Boolean active = document.getBoolean("isActive");
        qr.setActive(active != null ? active : false);
        
        qr.setName(document.getString("name"));
        qr.setEmail(document.getString("email"));
        qr.setAddress(document.getString("address"));
        qr.setPhoneNumber(document.getString("phoneNumber"));
        qr.setPassword(document.getString("password"));
        
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
