package com.qwervego.label.repository;

import com.qwervego.label.model.Qr;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QrRepository extends MongoRepository<Qr, String> {

    Optional<Qr> findByPhoneNumber(String phoneNumber);

}
