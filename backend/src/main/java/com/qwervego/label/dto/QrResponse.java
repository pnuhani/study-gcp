package com.qwervego.label.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QrResponse {
    private String id;
    private boolean isActive;
    private String name;
    private String email;
    private String address;
    private String phoneNumber;
    private Date createdDate;
    private Date activationDate;
}
