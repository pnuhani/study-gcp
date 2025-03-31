package com.qwervego.label.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QrResponse {
    private String id;
    @JsonProperty("isActive")
    private boolean isActive;
    private String name;
    private String email;
    private String address;
    private String phoneNumber;
    private Date createdDate;
    private Date activationDate;
}
