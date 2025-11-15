package com.example.SnapCart.services;


import com.example.SnapCart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

import static org.hibernate.Hibernate.map;

@Service

public class AuthService {

    private final UserRepository userRepository;


    @Autowired
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<String> logIn(String username, String password , String id){
        System.out.println("=== LOGIN ATTEMPT ===");
        System.out.println("Username: '" + username + "'");
        System.out.println("Password: '" + password + "'");
        System.out.println("Password length: " + (password != null ? password.length() : "null"));
        
        // Check if user exists first
        Optional<com.example.SnapCart.entity.User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            System.out.println("❌ User not found with username: " + username);
            // Let's check all users to debug
            System.out.println("Available users:");
            userRepository.findAll().forEach(u -> 
                System.out.println("  - Username: '" + u.getUsername() + "', Password: '" + u.getPassword() + "'")
            );
            return Optional.empty();
        }
        
        com.example.SnapCart.entity.User user = userOpt.get();
        System.out.println("✅ Found user: '" + user.getUsername() + "'");
        System.out.println("Stored password: '" + user.getPassword() + "'");
        System.out.println("Provided password: '" + password + "'");
        System.out.println("Passwords equal: " + user.getPassword().equals(password));
        System.out.println("Password chars match:");
        
        // Character by character comparison for debugging
        String storedPwd = user.getPassword();
        if (storedPwd != null && password != null) {
            int minLen = Math.min(storedPwd.length(), password.length());
            for (int i = 0; i < minLen; i++) {
                char c1 = storedPwd.charAt(i);
                char c2 = password.charAt(i);
                if (c1 != c2) {
                    System.out.println("  Mismatch at position " + i + ": stored='" + c1 + "' (" + (int)c1 + "), provided='" + c2 + "' (" + (int)c2 + ")");
                }
            }
        }
        
        if (user.getPassword().equals(password)) {
            System.out.println("🎉 Login successful! User ID: " + user.getId());
            return Optional.of(String.valueOf(user.getId()));
        } else {
            System.out.println("❌ Password mismatch!");
            return Optional.empty();
        }
    }

}
