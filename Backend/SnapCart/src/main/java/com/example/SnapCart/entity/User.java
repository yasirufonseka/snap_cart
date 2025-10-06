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


}
