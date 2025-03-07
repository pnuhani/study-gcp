package com.qwervego.label.controller;

import com.qwervego.label.dto.ErrorResponse;
import com.qwervego.label.dto.QrResponse;
import com.qwervego.label.exception.QrNotFoundException;
import com.qwervego.label.model.Qr;
import com.qwervego.label.repository.QrRepository;
import com.qwervego.label.service.QrService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/qr")
public class QrController {

    private static final Logger logger = LoggerFactory.getLogger(QrController.class);
    private final QrService qrService;


    @Autowired
    public QrController(QrService qrService) {
        this.qrService = qrService;
    }

    // Get QR data by ID
    @GetMapping
    public ResponseEntity<QrResponse> getQRById(@RequestParam("id") String id) {
        QrResponse response = qrService.getQrById(id);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/add")
    public ResponseEntity<Object> addDetails(@Valid @RequestBody Qr qr, BindingResult result) {
        // Handle validation using QrService
        ErrorResponse validationError = qrService.validateQrData(qr, result);
        if (validationError != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(validationError);
        }

        // Check if the QR ID already exists and isActive is true
        Optional<QrResponse> existingQr = Optional.ofNullable(qrService.getQrById(qr.getId()));
        if (existingQr.isPresent() && existingQr.get().isActive()) {
            // If the ID exists and isActive is true, return a conflict response
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Tag already active, invalid request"));

        }


            // Hash the password before saving
            qrService.hashPassword(qr);

        // Explicitly set isActive = true before saving
        qr.setActive(true);

            // Save or update QR data
            try {
                Qr savedQr = qrService.saveQrData(qr);  // Delegate to service for saving
                return ResponseEntity.ok(savedQr); // Return saved QR with hashed password
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ErrorResponse("An error occurred while saving QR data."));
            }
        }

    @PutMapping("/update")
    public ResponseEntity<Object> updateQR(@RequestBody Map<String, Object> updates) {
        return qrService.processQrUpdate(updates);
    }
    }