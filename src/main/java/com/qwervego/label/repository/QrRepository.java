package com.qwervego.label.repository;

import com.qwervego.label.model.Qr;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QrRepository extends MongoRepository<Qr, String> {

}
