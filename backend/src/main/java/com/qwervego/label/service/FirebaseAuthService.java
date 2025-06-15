package com.qwervego.label.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;
import com.google.firebase.auth.UserRecord.UpdateRequest;
import com.qwervego.label.dto.AdminCreateRequest;
import com.qwervego.label.model.Admin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class FirebaseAuthService {
    private final FirebaseAuth firebaseAuth;

    @Autowired
    public FirebaseAuthService(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    public UserRecord createUser(AdminCreateRequest request) throws FirebaseAuthException {
        CreateRequest createRequest = new CreateRequest()
            .setEmail(request.getEmail())
            .setPassword(request.getPassword())
            .setEmailVerified(false)
            .setDisplayName(request.getUsername());

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", request.getRole());
        
        UserRecord user = firebaseAuth.createUser(createRequest);
        firebaseAuth.setCustomUserClaims(user.getUid(), claims);
        
        return user;
    }

    public void updateUser(String uid, AdminCreateRequest request) throws FirebaseAuthException {
        UpdateRequest updateRequest = new UpdateRequest(uid);
        
        if (request.getEmail() != null) {
            updateRequest.setEmail(request.getEmail());
        }
        if (request.getPassword() != null) {
            updateRequest.setPassword(request.getPassword());
        }
        if (request.getUsername() != null) {
            updateRequest.setDisplayName(request.getUsername());
        }
        
        firebaseAuth.updateUser(updateRequest);
        
        if (request.getRole() != null) {
            Map<String, Object> claims = new HashMap<>();
            claims.put("role", request.getRole());
            firebaseAuth.setCustomUserClaims(uid, claims);
        }
    }

    public void deleteUser(String uid) throws FirebaseAuthException {
        firebaseAuth.deleteUser(uid);
    }

    public UserRecord getUserByEmail(String email) throws FirebaseAuthException {
        return firebaseAuth.getUserByEmail(email);
    }

    public String verifyIdToken(String idToken) throws FirebaseAuthException {
        return firebaseAuth.verifyIdToken(idToken).getUid();
    }

    public Map<String, Object> getUserClaims(String uid) throws FirebaseAuthException {
        return firebaseAuth.getUser(uid).getCustomClaims();
    }

    public String getPhoneNumber(String uid) throws FirebaseAuthException {
        return firebaseAuth.getUser(uid).getPhoneNumber();
    }
} 