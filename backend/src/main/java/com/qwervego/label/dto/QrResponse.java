package com.qwervego.label.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QrResponse {
    private String id;
    private String name;
    private String email;
    private String address;
    private String phoneNumber;
    private boolean isActive;
}
