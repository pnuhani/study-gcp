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

import javax.validation.Valid;

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
import com.qwervego.label.repository.QrRepository;
import com.qwervego.label.service.EmailService;
import com.qwervego.label.service.OtpService;
import com.qwervego.label.service.QrService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/qr")
public class QrController {

    private static final Logger logger = LoggerFactory.getLogger(QrController.class);
    private final QrService qrService;
    private final QrRepository qrRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public QrController(QrService qrService, QrRepository qrRepository, OtpService otpService,
            EmailService emailService, BCryptPasswordEncoder passwordEncoder) {
        this.qrService = qrService;
        this.qrRepository = qrRepository;
        this.otpService = otpService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
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

            // Verify email using OTP
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
            Qr savedQr = qrService.saveQrData(qr);
            return ResponseEntity.ok(savedQr);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while saving QR data."));
        }
    }

    @PostMapping("/generate-otp")
    public ResponseEntity<Map<String, Object>> generateOtp(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email is required."));
        }

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
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String otp = request.get("otp");
        String sessionId = httpRequest.getSession().getId();

        if (otp == null || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "OTP is required."));
        }

        boolean isValid = otpService.validateOtp(sessionId, otp);
        if (isValid) {
            return ResponseEntity.ok(Map.of("valid", true, "message", "OTP is valid."));
        } else {
            return ResponseEntity.ok(Map.of("valid", false, "message", "OTP is invalid."));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updateQR(@RequestBody Map<String, Object> updates) {
        return qrService.processQrUpdate(updates);
    }

    @GetMapping
    public ResponseEntity<?> getQRInfo(@RequestParam String id) {
        try {
            Optional<Qr> qrOpt = qrRepository.findById(id);

            if (qrOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("notFound", true, "error", "QR code not found"));
            }

            Qr qr = qrOpt.get();
            System.out.println("QR found: " + id + ", isActive=" + qr.isActive());

            Map<String, Object> response = new HashMap<>();
            response.put("id", qr.getId());
            response.put("name", qr.getName());
            response.put("email", qr.getEmail());
            response.put("address", qr.getAddress());
            response.put("phoneNumber", qr.getPhoneNumber());
            response.put("isActive", qr.isActive());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
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

        Optional<Qr> qrOpt = qrService.findById(id);
        if (qrOpt.isEmpty()) {
            return ResponseEntity.ok(Collections.singletonMap("valid", false));
        }

        boolean isValid = qrService.checkPassword(password, qrOpt.get().getPassword());
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
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(chars.length());
            sb.append(chars.charAt(index));
        }

        return sb.toString();
    }

//    @PostMapping("/forgot-password/generate-otp")
//    public ResponseEntity<Map<String, Object>> forgotPasswordGenerateOtp(@RequestBody Map<String, String> request,
//            HttpSession session) {
//        String email = request.get("email");
//        if (email == null || email.trim().isEmpty()) {
//            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email is required"));
//        }
//
//        // Check if the email exists in the QR database
//        Optional<Qr> qrOpt = qrRepository.findByPhoneNumber(email);
//        if (qrOpt.isEmpty()) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(Collections.singletonMap("error", "Email not found in our system"));
//        }
//
//        String sessionId = session.getId();
//        String otp = otpService.createOtpSession(email, sessionId);
//        emailService.sendOtp(email, otp);
//
//        Map<String, Object> response = new HashMap<>();
//        response.put("success", true);
//        response.put("message", "OTP sent to " + email);
//        response.put("sessionId", sessionId);  // Add this line
//        return ResponseEntity.ok(response);
//    }

//@PostMapping("/forgot-password/verify-otp")
//public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
//    String sessionId = request.get("sessionId");
//    String otp = request.get("otp");
//    boolean valid = otpService.validateOtp(sessionId, otp);
//    return ResponseEntity.ok(Map.of("valid", valid));
//}


    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String email = request.get("id"); // We're receiving email in the 'id' field
        String newPassword = request.get("newPassword");

        if (email == null || email.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email and new password are required."));
        }

        // Find QR by email instead of ID
        Optional<Qr> qrOpt = qrRepository.findByEmail(email);
        if (qrOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "User not found."));
        }

        Qr qr = qrOpt.get();
        String sessionId = httpRequest.getSession().getId();
        String storedEmail = otpService.getEmail(sessionId);

        if (storedEmail == null || !storedEmail.equals(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", "Email verification failed."));
        }

        qr.setPassword(passwordEncoder.encode(newPassword));
        qrRepository.save(qr);

        otpService.invalidateOtp(sessionId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successfully."));
    }
}
