package com.qwervego.label.service;

import com.qwervego.label.dto.QrResponse;
import com.qwervego.label.exception.QrNotFoundException;
import com.qwervego.label.model.Qr;
import com.qwervego.label.dto.ErrorResponse;
import com.qwervego.label.repository.QrRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;

import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
public class QrService {

    private final BCryptPasswordEncoder passwordEncoder;
    private final QrRepository qrRepository;

    @Autowired
    public QrService(BCryptPasswordEncoder passwordEncoder, QrRepository qrRepository) {
        this.passwordEncoder = passwordEncoder;
        this.qrRepository = qrRepository;
    }

    // Handle validation logic and return error response if validation fails
    public ErrorResponse validateQrData(Qr qr, BindingResult result) {
        if (result.hasErrors()) {
            StringBuilder errorMessages = new StringBuilder();
            result.getFieldErrors().forEach(error ->
                    errorMessages.append(error.getField()).append(": ").append(error.getDefaultMessage()).append("\n"));
            return new ErrorResponse(errorMessages.toString());
        }
        return null;
    }

    // Hash the password securely before saving
    public void hashPassword(Qr qr) {
        // Check if the password is null using Objects.requireNonNull
        Objects.requireNonNull(qr.getPassword(), "Password cannot be null"); // This will throw NullPointerException if password is null

        String hashedPassword = passwordEncoder.encode(qr.getPassword());
        qr.setPassword(hashedPassword);
    }

    // Save or update QR data
    public Qr saveQrData(Qr qr) {
        return qrRepository.save(qr);
    }

    // Find QR by ID
    public Optional<Qr> findById(String id) {
        return qrRepository.findById(id);
    }

    // Method to fetch QR data by ID and convert it to QrResponse
    public QrResponse getQrById(String id) {
        Qr qrData = qrRepository.findById(id)
                .orElseThrow(() -> new QrNotFoundException("QR code not found for ID: " + id));

        return new QrResponse(
                qrData.getId(),
                qrData.getName(),
                qrData.getEmail(),
                qrData.getAddress(),
                qrData.getPhoneNumber(),
                qrData.isActive()
        );
    }
    // Handle QR Update logic (Refactored from Controller)
    public ResponseEntity<Object> processQrUpdate(Map<String, Object> updates) {

        if (!updates.containsKey("id")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("ID is required."));
        }
        String id = updates.get("id").toString();

        // Find QR by Phone Number
        Optional<Qr> existingQrOpt = findById(id);

        if (!existingQrOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("QR code not found for ID: " + id));
        }
        Qr existingQr = existingQrOpt.get();


        // Check if password is provided and valid
        if (!updates.containsKey("password")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Password is required for update."));
        }

        String providedPassword = updates.get("password").toString();
        if (!checkPassword(providedPassword, existingQr.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid password. Update not allowed."));
        }

        // Apply updates dynamically
        applyUpdates(existingQr, updates);

        // Save updated QR code
        Qr updatedQr = saveQrData(existingQr);
        return ResponseEntity.ok(updatedQr);
    }

    // Helper method to apply updates dynamically
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

    // Check if provided password matches stored password
    public boolean checkPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }

    public Optional<Qr> findByPhoneNumber(String phoneNumber) {
        return qrRepository.findByPhoneNumber(phoneNumber);
    }

}
