package com.qwervego.label.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScanRequest {
    private String qrToken;
    private String phoneNumber;
    private String deviceId;
} 