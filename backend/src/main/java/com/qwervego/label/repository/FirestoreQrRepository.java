package com.qwervego.label.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.qwervego.label.model.Qr;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
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
        logger.info("Finding QR document with ID: {}", id);
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            
            if (document.exists()) {
                Qr qr = convertToQr(document);
                logger.info("Found QR document with ID: {}", id);
                return Optional.of(qr);
            } else {
                logger.warn("QR document not found with ID: {}", id);
                return Optional.empty();
            }
        } catch (Exception e) {
            logger.error("Error finding QR document with ID {}: {}", id, e.getMessage(), e);
            return Optional.empty();
        }
    }

    public List<Qr> findAll() {
        logger.info("Finding all QR documents");
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
            QuerySnapshot querySnapshot = future.get();
            
            List<Qr> qrList = new ArrayList<>();
            for (QueryDocumentSnapshot document : querySnapshot.getDocuments()) {
                Qr qr = convertToQr(document);
                if (qr != null) {
                    qrList.add(qr);
                }
            }
            
            logger.info("Found {} QR documents", qrList.size());
            return qrList;
        } catch (Exception e) {
            logger.error("Error finding all QR documents: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public Page<Qr> findAll(Pageable pageable) {
        logger.info("Finding QR documents with pagination: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                .orderBy("createdDate", Query.Direction.DESCENDING)
                .limit(pageable.getPageSize())
                .offset((int) pageable.getOffset());
            
            ApiFuture<QuerySnapshot> future = query.get();
            QuerySnapshot querySnapshot = future.get();
            
            List<Qr> qrList = new ArrayList<>();
            for (QueryDocumentSnapshot document : querySnapshot.getDocuments()) {
                Qr qr = convertToQr(document);
                if (qr != null) {
                    qrList.add(qr);
                }
            }
            
            // Get total count
            ApiFuture<QuerySnapshot> countFuture = firestore.collection(COLLECTION_NAME).get();
            QuerySnapshot countSnapshot = countFuture.get();
            long totalElements = countSnapshot.size();
            
            logger.info("Found {} QR documents out of {} total", qrList.size(), totalElements);
            return new PageImpl<>(qrList, pageable, totalElements);
        } catch (Exception e) {
            logger.error("Error finding QR documents with pagination: {}", e.getMessage(), e);
            return new PageImpl<>(new ArrayList<>(), pageable, 0);
        }
    }

    public List<Qr> findAllById(List<String> ids) {
        logger.info("Finding QR documents with IDs: {}", ids);
        try {
            List<Qr> qrList = new ArrayList<>();
            for (String id : ids) {
                Optional<Qr> qrOpt = findById(id);
                qrOpt.ifPresent(qrList::add);
            }
            
            logger.info("Found {} QR documents out of {} requested", qrList.size(), ids.size());
            return qrList;
        } catch (Exception e) {
            logger.error("Error finding QR documents by IDs: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public void deleteById(String id) {
        logger.info("Deleting QR document with ID: {}", id);
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            docRef.delete();
            logger.info("Successfully deleted QR document with ID: {}", id);
        } catch (Exception e) {
            logger.error("Error deleting QR document with ID {}: {}", id, e.getMessage(), e);
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
