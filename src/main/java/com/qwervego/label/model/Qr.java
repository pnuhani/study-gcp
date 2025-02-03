package com.qwervego.label.model;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "qrs")
public class Qr {

    @Id
    private String id;
    private boolean isActive;
    @NotBlank(message = "Name is required")

    private String name;
    private String email;
    private String address;
    @NotBlank(message = "Name is required")
    private String phoneNumber;
    @NotBlank(message = "Password is required")
    @Size(min = 4, message = "Password must be at least 4 characters")
    private String password;
}
