package com.qwervego.label.dto;

import lombok.Data;
import java.util.Date;

@Data
public class AdminResponse {
    private String id;
    private String username;
    private String email;
    private String role;
    private Date createdAt;
    private Date lastLogin;
    private boolean active;
}