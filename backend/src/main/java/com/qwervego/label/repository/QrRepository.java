package com.qwervego.label.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.qwervego.label.model.Qr;

@Repository
public interface QrRepository extends MongoRepository<Qr, String> {

    Optional<Qr> findByPhoneNumber(String phoneNumber);
    Optional<Qr> findByEmail(String email);

}
