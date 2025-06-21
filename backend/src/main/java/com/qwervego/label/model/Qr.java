package com.qwervego.label.model;

import java.util.Date;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Qr {
    private String id;
    private boolean isActive;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Phone Number is required")
    private String phoneNumber;

    // Password field kept for backwards compatibility but no longer validated
    // Phone OTP authentication is now used instead
    private String password;

    private Date createdDate;
    private Date activationDate;
}