package com.qwervego.label.service;

import com.qwervego.label.dto.QrResponse;
import com.qwervego.label.exception.QrNotFoundException;
import com.qwervego.label.model.Qr;
import com.qwervego.label.dto.ErrorResponse;
import com.qwervego.label.repository.QrRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;

import java.util.Objects;

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

}
