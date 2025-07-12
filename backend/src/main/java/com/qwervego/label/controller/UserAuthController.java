package com.qwervego.label.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.qwervego.label.model.User;
import com.qwervego.label.repository.FirestoreUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserAuthController {
    private final FirebaseAuth firebaseAuth;
    private final FirestoreUserRepository userRepository;

    @Autowired
    public UserAuthController(FirebaseAuth firebaseAuth, FirestoreUserRepository userRepository) {
        this.firebaseAuth = firebaseAuth;
        this.userRepository = userRepository;
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signInWithOtp(@RequestBody Map<String, String> payload) {
        String idToken = payload.get("idToken");
        String phoneNumber = payload.get("phoneNumber");
        if (idToken == null || phoneNumber == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Missing idToken or phoneNumber"));
        }
        try {
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
            String tokenPhone = (String) decodedToken.getClaims().get("phone_number");
            if (tokenPhone == null || !tokenPhone.equals(phoneNumber)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Phone number mismatch or not verified"));
            }
            // Register phone number in DB if not exists
            if (userRepository.findByPhoneNumber(tokenPhone).isEmpty()) {
                User newUser = new User();
                newUser.setPhoneNumber(tokenPhone);
                newUser.setCreatedDate(new Date());
                userRepository.save(newUser);
            }
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("phoneNumber", tokenPhone);
            return ResponseEntity.ok(response);
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired OTP token"));
        }
    }
} 