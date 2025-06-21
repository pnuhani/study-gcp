package com.qwervego.label.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import com.qwervego.label.dto.ErrorResponse;
import com.qwervego.label.dto.QrResponse;
import com.qwervego.label.model.Qr;
import com.qwervego.label.repository.FirestoreQrRepository;
import com.qwervego.label.service.QrService;
import com.qwervego.label.service.FirebaseAuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.firebase.auth.FirebaseAuthException;

@RestController
@RequestMapping("/api/qr")
public class QrController {

    private final FirestoreQrRepository qrRepository;
    private final QrService qrService;
    private final FirebaseAuthService firebaseAuthService;
    private final BCryptPasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(QrController.class);

    private final Firestore firestore;

    @Autowired
    public QrController(FirestoreQrRepository qrRepository, QrService qrService, 
                       FirebaseAuthService firebaseAuthService,
                       BCryptPasswordEncoder passwordEncoder, Firestore firestore) {
        this.qrRepository = qrRepository;
        this.qrService = qrService;
        this.firebaseAuthService = firebaseAuthService;
        this.passwordEncoder = passwordEncoder;
        this.firestore = firestore;

        // Log the project ID (database)
        FirestoreOptions options = (FirestoreOptions) firestore.getOptions();
        logger.info("Using Firestore project ID: {}", options.getProjectId());
    }

    @PostMapping("/add")
    public ResponseEntity<Object> addDetails(@Valid @RequestBody Qr qr, BindingResult result, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Optional<Qr> existingQrOpt = qrRepository.findById(qr.getId());

        // Firebase phone authentication is now required for all registrations
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Phone authentication required. Please verify your phone number first."));
        }

        String idToken = authHeader.substring(7);
        try {
            // Verify the Firebase ID token
            String uid = firebaseAuthService.verifyIdToken(idToken);
            String tokenPhone = firebaseAuthService.getPhoneNumber(uid);

            // Normalize both phone numbers for comparison
            String normalizedTokenPhone = normalizePhoneNumber(tokenPhone);
            String normalizedQrPhone = normalizePhoneNumber(qr.getPhoneNumber());

            if (normalizedTokenPhone == null || !normalizedTokenPhone.equals(normalizedQrPhone)) {
                logger.warn("Phone number mismatch - Token: {}, QR: {}, Normalized Token: {}, Normalized QR: {}", 
                           tokenPhone, qr.getPhoneNumber(), normalizedTokenPhone, normalizedQrPhone);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Phone number verification failed. The verified phone number does not match the provided phone number."));
            }

            logger.info("Phone authentication successful for QR registration: {} with phone: {}", qr.getId(), tokenPhone);
        } catch (Exception e) {
            logger.error("Firebase token verification failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid or expired authentication token. Please verify your phone number again."));
        }

        ErrorResponse validationError = qrService.validateQrData(qr, result);
        if (validationError != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(validationError);
        }

        if (existingQrOpt.isPresent()) {
            Qr existingQr = existingQrOpt.get();

            if (existingQr.isActive()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Tag already active, invalid request"));
            }

            if (existingQr.getCreatedDate() != null) {
                qr.setCreatedDate(existingQr.getCreatedDate());
            } else {
                qr.setCreatedDate(new Date());
            }
        } else {
            qr.setCreatedDate(new Date());
        }

        qr.setActivationDate(new Date());
        qr.setActive(true);

        // No password required for phone-only authentication
        qr.setPassword(null);

        try {
            Qr savedQr = qrRepository.save(qr);
            return ResponseEntity.ok(savedQr);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while saving QR data."));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updateQR(@RequestBody Map<String, Object> updates) {
        return qrService.processQrUpdate(updates);
    }

    @GetMapping
    public ResponseEntity<?> getQrById(@RequestParam String id) {
        // Log all collection names
        try {
            String collections = 
                StreamSupport.stream(firestore.listCollections().spliterator(), false)
                    .map(c -> c.getId())
                    .collect(Collectors.joining(", "));
            logger.info("Available Firestore collections: {}", collections);
        } catch (Exception e) {
            logger.error("Failed to list Firestore collections: {}", e.getMessage(), e);
        }

        logger.info("Received request for QR code with id: {}", id);
        try {
            Optional<Qr> qrOpt = qrRepository.findById(id);

            if (qrOpt.isEmpty()) {
                logger.warn("QR code NOT found for id: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("notFound", true, "error", "QR code not found"));
            }

            Qr qr = qrOpt.get();
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", qr.getId());
            response.put("isActive", qr.isActive());
            response.put("name", qr.getName());
            response.put("email", qr.getEmail());
            response.put("address", qr.getAddress());
            response.put("phoneNumber", qr.getPhoneNumber());
            response.put("createdDate", qr.getCreatedDate());
            response.put("activationDate", qr.getActivationDate());

            logger.info("QR code found for id: {}", id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching QR code for id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve QR information"));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllQRs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Pageable paging = PageRequest.of(page, size);
        Page<Qr> qrPage = qrRepository.findAll(paging);

        List<QrResponse> responseList = qrPage.getContent().stream()
                .map(qr -> {
                    QrResponse response = new QrResponse();
                    response.setId(qr.getId());
                    response.setActive(qr.isActive());
                    response.setCreatedDate(qr.getCreatedDate());
                    response.setActivationDate(qr.getActivationDate());
                    return response;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("qrCodes", responseList);
        response.put("currentPage", qrPage.getNumber());
        response.put("totalItems", qrPage.getTotalElements());
        response.put("totalPages", qrPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateQRCodeBatch(@RequestBody Map<String, Integer> request) {
        Integer quantity = request.get("quantity");
        if (quantity == null || quantity <= 0 || quantity > 100) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("success", false));
        }

        List<String> generatedIds = new ArrayList<>();
        LocalDate today = LocalDate.now();
        String datePrefix = today.format(DateTimeFormatter.BASIC_ISO_DATE);

        for (int i = 0; i < quantity; i++) {
            String randomPart = generateRandomId(6);
            String newId = datePrefix + "-" + randomPart;

            Qr qr = new Qr();
            qr.setId(newId);
            qr.setActive(false);
            qr.setPassword("");
            qr.setCreatedDate(new Date());

            qrRepository.save(qr);
            generatedIds.add(newId);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("qrIds", generatedIds);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<QrResponse>> getQrBatch(@RequestBody Map<String, List<String>> request) {
        List<String> ids = request.get("ids");
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }

        List<Qr> qrList = qrRepository.findAllById(ids);
        List<QrResponse> responseList = qrList.stream()
                .map(qr -> new QrResponse(
                        qr.getId(),
                        qr.isActive(),
                        qr.getName(),
                        qr.getEmail(),
                        qr.getAddress(),
                        qr.getPhoneNumber(),
                        qr.getCreatedDate(),
                        qr.getActivationDate()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    private String generateRandomId(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    // Email-based password reset endpoint removed - using phone-only authentication via Firebase

    @PostMapping("/reset-phone")
    public ResponseEntity<Map<String, Object>> resetPasswordByPhone(@RequestBody Map<String, String> request, @RequestHeader("Authorization") String authHeader) {
        String phoneNumber = request.get("phoneNumber");
        String qrId = request.get("qrId");
        String newPassword = request.get("newPassword");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Missing auth token"));
        }
        String idToken = authHeader.substring(7);

        if (phoneNumber == null || phoneNumber.isBlank() || newPassword == null || newPassword.isBlank() || qrId == null || qrId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "phoneNumber, qrId and newPassword are required"));
        }

        try {
            String uid = firebaseAuthService.verifyIdToken(idToken);
            String tokenPhone = firebaseAuthService.getPhoneNumber(uid);

            // Normalize phone numbers for comparison in reset functionality
            String normalizedTokenPhone = normalizePhoneNumber(tokenPhone);
            String normalizedRequestPhone = normalizePhoneNumber(phoneNumber);
            
            if (normalizedTokenPhone == null || !normalizedTokenPhone.equals(normalizedRequestPhone)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", "Phone number mismatch"));
            }

            Optional<Qr> qrOpt = qrRepository.findById(qrId);
            if (qrOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "QR code not found"));
            }

            Qr qr = qrOpt.get();
            String normalizedQrPhone = normalizePhoneNumber(qr.getPhoneNumber());
            if (!normalizedRequestPhone.equals(normalizedQrPhone)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", "Phone number does not match QR record"));
            }

            qr.setPassword(passwordEncoder.encode(newPassword));
            qrRepository.save(qr);

            return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successfully."));
        } catch (FirebaseAuthException e) {
            logger.error("Firebase token verification failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid token"));
        } catch (Exception ex) {
            logger.error("Error resetting password by phone", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "Server error"));
        }
    }

    @GetMapping("/debug-qr")
    public ResponseEntity<?> debugQr() {
        // Log Firestore project ID
        FirestoreOptions options = (FirestoreOptions) firestore.getOptions();
        logger.info("Using Firestore project ID: {}", options.getProjectId());

        // Log all documents in 'qr' collection
        try {
            CollectionReference qrCollection = firestore.collection("qr");
            ApiFuture<QuerySnapshot> future = qrCollection.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            logger.info("Documents in 'qr' collection:");
            for (QueryDocumentSnapshot doc : documents) {
                logger.info("Document ID: {}, Data: {}", doc.getId(), doc.getData());
            }
            return ResponseEntity.ok("Logged all documents in 'qr' collection. Check logs.");
        } catch (Exception e) {
            logger.error("Error fetching documents from 'qr' collection: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error fetching documents.");
        }
    }

    /**
     * Normalizes phone numbers for comparison by:
     * 1. Removing all non-digit characters
     * 2. Handling different country code formats
     * 3. Ensuring consistent format for comparison
     */
    private String normalizePhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return null;
        }
        
        // Remove all non-digit characters
        String digitsOnly = phoneNumber.replaceAll("[^0-9]", "");
        
        // Handle common country code variations
        // If starts with 1 (US/Canada), keep as is
        // If starts with other country codes, keep as is
        // This maintains the full international format for comparison
        return digitsOnly;
    }
}
