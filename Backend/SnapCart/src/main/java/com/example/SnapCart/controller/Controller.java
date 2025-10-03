package com.example.SnapCart.controller;


import com.example.SnapCart.dto.UserRegiRequest;
import com.example.SnapCart.entity.User;
import com.example.SnapCart.modal.UserLogin;
import com.example.SnapCart.services.AuthService;
import com.example.SnapCart.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("api/")
@CrossOrigin(origins = "http://localhost:4200")
public class Controller {

    private final UserService userService;
    private final AuthService authService;

    @Autowired
    public Controller(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }


    @PostMapping("CreateUser")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserRegiRequest request) {
            try {
                User savedUser = userService.createUser(request);
                return ResponseEntity.ok(savedUser);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(e.getMessage());  // Returns 400 with message like "Username already exists"
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());  // For other errors
            }
        }



    @PostMapping("login")
    public ResponseEntity<Map<String , String>> login(@RequestBody UserLogin loginReq) {
        boolean success = authService.logIn(loginReq.getUsername(), loginReq.getPassword());
        if (success) {
            return ResponseEntity.ok(Map.of("message","Login successful!"));
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
        }
    }


}
