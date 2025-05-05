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

import com.qwervego.label.dto.ErrorResponse;
import com.qwervego.label.dto.QrResponse;
import com.qwervego.label.model.Qr;
import com.qwervego.label.repository.FirestoreQrRepository;
import com.qwervego.label.service.EmailService;
import com.qwervego.label.service.OtpService;
import com.qwervego.label.service.QrService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import com.google.cloud.firestore.Firestore;

@RestController
@RequestMapping("/api/qr")
public class QrController {

    private final FirestoreQrRepository qrRepository;
    private final QrService qrService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(QrController.class);

    private final Firestore firestore;

    @Autowired
    public QrController(FirestoreQrRepository qrRepository, QrService qrService, 
                       OtpService otpService, EmailService emailService, 
                       BCryptPasswordEncoder passwordEncoder, Firestore firestore) {
        this.qrRepository = qrRepository;
        this.qrService = qrService;
        this.otpService = otpService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.firestore = firestore;
    }

    @PostMapping("/add")
    public ResponseEntity<Object> addDetails(@Valid @RequestBody Qr qr, BindingResult result, HttpSession session) {
        Optional<Qr> existingQrOpt = qrRepository.findById(qr.getId());
        boolean isNewQr = existingQrOpt.isEmpty();

        if (isNewQr) {
            if (qr.getPassword() == null || qr.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Password is required for new QR codes."));
            }

            String sessionId = session.getId();
            String email = qr.getEmail();
            String storedEmail = otpService.getEmail(sessionId);
            if (storedEmail == null || !storedEmail.equals(email)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Email verification failed. Please verify your email first."));
            }
            otpService.invalidateOtp(sessionId);
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

        qrService.hashPassword(qr);

        try {
            Qr savedQr = qrRepository.save(qr);
            return ResponseEntity.ok(savedQr);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while saving QR data."));
        }
    }

    @PostMapping("/generate-otp")
    public ResponseEntity<Map<String, Object>> generateOtp(@RequestBody Map<String, String> request, 
                                                         HttpServletRequest httpRequest) {
        String email = request.get("email");
        String qrId = request.get("qrId");
        Boolean isPasswordReset = Boolean.valueOf(request.get("isPasswordReset"));

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email is required."));
        }

        // For password reset, verify email exists and matches the QR ID
        if (isPasswordReset) {
            if (qrId == null || qrId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "QR ID is required for password reset."));
            }

            Optional<Qr> qr = qrRepository.findById(qrId);
            if (qr.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Invalid QR code."));
            }
            
            // Verify that the email matches the QR code
            if (!qr.get().getEmail().equals(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Email does not match the QR code."));
            }
        }
        // Remove the email existence check for registration
        // This allows the same email to be used for multiple devices

        String sessionId = httpRequest.getSession().getId();
        String otp = otpService.createOtpSession(email, sessionId);
        emailService.sendOtp(email, otp);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "OTP sent to your email.",
            "sessionId", sessionId
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
        String otp = request.get("otp");
        String sessionId = request.get("sessionId"); // Get from request body instead of HttpSession
        
        boolean isValid = otpService.validateOtp(sessionId, otp);
        
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        
        if (isValid) {
            response.put("message", "OTP verified successfully");
        } else {
            response.put("message", "Invalid OTP or OTP expired");
        }
        
        return ResponseEntity.ok(response);
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

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Boolean>> verifyPassword(@RequestBody Map<String, String> request) {
        String id = request.get("id");
        String password = request.get("password");

        if (id == null || password == null) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("valid", false));
        }

        Optional<Qr> qrOpt = qrRepository.findById(id);
        if (qrOpt.isEmpty()) {
            return ResponseEntity.ok(Collections.singletonMap("valid", false));
        }

        boolean isValid = passwordEncoder.matches(password, qrOpt.get().getPassword());
        return ResponseEntity.ok(Collections.singletonMap("valid", isValid));
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

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String email = request.get("email");
        String qrId = request.get("qrId");
        String newPassword = request.get("newPassword");
        // Get the sessionId from the request body, not the current HTTP session
        String sessionId = request.get("sessionId");

        if (email == null || email.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty() 
                || qrId == null || qrId.trim().isEmpty() || sessionId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, 
                "message", "Email, QR ID, sessionId and new password are required."
            ));
        }

        // Find QR by ID first
        Optional<Qr> qrOpt = qrRepository.findById(qrId);
        if (qrOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false, 
                "message", "QR code not found."
            ));
        }

        // Verify email matches the QR code
        Qr qr = qrOpt.get();
        if (!qr.getEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false, 
                "message", "Email does not match the QR code."
            ));
        }

        // Get email from the OTP service using the provided sessionId
        String storedEmail = otpService.getEmail(sessionId);
        logger.info("Password reset request - Email: {}, StoredEmail: {}, SessionID: {}", 
                    email, storedEmail, sessionId);

        if (storedEmail == null || !storedEmail.equals(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false, 
                "message", "Email verification failed."
            ));
        }

        qr.setPassword(passwordEncoder.encode(newPassword));
        qrRepository.save(qr);

        otpService.invalidateOtp(sessionId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successfully."));
    }
}
