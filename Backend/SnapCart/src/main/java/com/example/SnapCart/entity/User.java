package com.example.SnapCart.entity;


import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotNull;

@Document(collection="User")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {


    @Id
    private  String userId;
    @NotBlank
    private String name;
    @NotBlank
    private String address;
    @NotNull
    private int contact;
    @NotBlank
    private String userType;
    @NotBlank
    @Indexed(unique = true)
    private String username;
    @NotBlank
    private String password;

}
