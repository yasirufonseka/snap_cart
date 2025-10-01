package com.example.SnapCart.dto;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
public class UserRegiRequest {



    private String id;
    @NotBlank
    private String username;
    
    @NotBlank
    private String password;

    @NotNull
    private int contact;
    @NotBlank
    private String userType;

    @NotBlank
    private String name;

    @NotBlank
    private String address;

}
