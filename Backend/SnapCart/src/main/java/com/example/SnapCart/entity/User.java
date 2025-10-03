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

}
