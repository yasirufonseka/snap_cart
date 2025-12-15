package com.example.SnapCart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SystemPreferencesRequest {
    
    private boolean emailNotifications = true;
    private boolean smsNotifications = false;
    private boolean pushNotifications = true;
    private String language = "en";
    private String timezone = "UTC";
    private String theme = "light";
    private boolean twoFactorEnabled = false;
}
