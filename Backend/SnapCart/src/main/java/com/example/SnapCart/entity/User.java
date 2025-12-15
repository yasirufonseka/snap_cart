package com.example.SnapCart.entity;


import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.GeneratedColumn;
import org.springframework.aot.generate.Generated;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.format.annotation.DateTimeFormat;

import javax.validation.constraints.NotNull;
import java.time.format.DateTimeFormatterBuilder;
import java.util.Date;

@Document(collection="User")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @GeneratedColumn("")
    private String id;
    @NotBlank
    private String name;
    @NotBlank
    private String address;
    @NotNull
    private String contact;
    @NotBlank
    private String email;
    @NotBlank
    @Indexed(unique = true)
    private String username;
    @NotBlank
    private String password;
    
    // Additional fields for settings
    private String profileImage;
    private boolean isActive = true;
    private String role = "user";
    
    // System preferences
    private boolean emailNotifications = true;
    private boolean smsNotifications = false;
    private boolean pushNotifications = true;
    private String language = "en";
    private String timezone = "UTC";
    private String theme = "light";
    private boolean twoFactorEnabled = false;
    
    // Timestamps
    @CreatedDate
    private Date createdAt = new Date();
    private Date updatedAt = new Date();
    private Date lastLoginAt;

}
