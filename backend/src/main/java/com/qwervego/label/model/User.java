package com.qwervego.label.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String id;
    private String phoneNumber;
    private Date createdDate;
} 