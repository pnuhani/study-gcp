package com.qwervego.label.service;

import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;

import com.qwervego.label.dto.ErrorResponse;
import com.qwervego.label.dto.QrResponse;
import com.qwervego.label.exception.QrNotFoundException;
import com.qwervego.label.model.Qr;
import com.qwervego.label.repository.FirestoreQrRepository;

@Service
public class QrService {

    private final BCryptPasswordEncoder passwordEncoder;
    private final FirestoreQrRepository qrRepository;

    @Autowired
    public QrService(BCryptPasswordEncoder passwordEncoder, FirestoreQrRepository qrRepository) {
        this.passwordEncoder = passwordEncoder;
        this.qrRepository = qrRepository;
    }

    public ErrorResponse validateQrData(Qr qr, BindingResult result) {
        if (result.hasErrors()) {
            StringBuilder errorMessages = new StringBuilder();
            result.getFieldErrors().forEach(error ->
                    errorMessages.append(error.getField()).append(": ").append(error.getDefaultMessage()).append("\n"));
            return new ErrorResponse(errorMessages.toString());
        }
        return null;
    }

    public void hashPassword(Qr qr) {
        // Only hash password if it's provided (for backwards compatibility)
        // Phone OTP authentication is now the primary method
        if (qr.getPassword() != null && !qr.getPassword().trim().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(qr.getPassword());
            qr.setPassword(hashedPassword);
        }
    }

    public Qr saveQrData(Qr qr) {
        return qrRepository.save(qr);
    }

    public Optional<Qr> findById(String id) {
        return qrRepository.findById(id);
    }

    public QrResponse getQrById(String id) {
        Qr qrData = qrRepository.findById(id)
                .orElseThrow(() -> new QrNotFoundException("QR code not found for ID: " + id));

        return new QrResponse(
                qrData.getId(),
                qrData.isActive(),
                qrData.getName(),
                qrData.getEmail(),
                qrData.getAddress(),
                qrData.getPhoneNumber(),
                qrData.getCreatedDate(),
                qrData.getActivationDate()
        );
    }

    public ResponseEntity<Object> processQrUpdate(Map<String, Object> updates) {
        if (!updates.containsKey("id")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("ID is required."));
        }
        
        String id = updates.get("id").toString();
        Optional<Qr> existingQrOpt = findById(id);

        if (existingQrOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("QR code not found for ID: " + id));
        }
        
        Qr existingQr = existingQrOpt.get();
        applyUpdates(existingQr, updates);

        try {
            Qr updatedQr = saveQrData(existingQr);
            return ResponseEntity.ok(updatedQr);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to update QR code: " + e.getMessage()));
        }
    }

    private void applyUpdates(Qr existingQr, Map<String, Object> updates) {
        if (updates.containsKey("name")) {
            existingQr.setName(updates.get("name").toString());
        }
        if (updates.containsKey("email")) {
            existingQr.setEmail(updates.get("email").toString());
        }
        if (updates.containsKey("address")) {
            existingQr.setAddress(updates.get("address").toString());
        }
        if (updates.containsKey("phoneNumber")) {
            existingQr.setPhoneNumber(updates.get("phoneNumber").toString());
        }
        if (updates.containsKey("isActive")) {
            existingQr.setActive(Boolean.parseBoolean(updates.get("isActive").toString()));
        }
    }

    public boolean checkPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }

    public Optional<Qr> findByPhoneNumber(String phoneNumber) {
        return qrRepository.findByPhoneNumber(phoneNumber);
    }
}
