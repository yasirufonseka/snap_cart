package com.example.SnapCart.services;


import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.SnapCart.entity.User;
import com.example.SnapCart.repository.UserRepository;

@Service

public class AuthService {

    private final UserRepository userRepository;


    @Autowired
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<String> logIn(String username, String password , String id){
        Optional<com.example.SnapCart.entity.User> userOpt = authenticateUser(username, password);
        if (userOpt.isPresent()) {
            return Optional.of(String.valueOf(userOpt.get().getId()));
        }
        return Optional.empty();
    }

    public Optional<com.example.SnapCart.entity.User> authenticateUser(String username, String password) {
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
                System.out.println("  - Username: '" + u.getUsername() + "', Password: '" + u.getPassword() + "', Role: '" + u.getRole() + "'")
            );
            return Optional.empty();
        }
        
        com.example.SnapCart.entity.User user = userOpt.get();
        System.out.println("✅ Found user: '" + user.getUsername() + "'");
        System.out.println("Stored password: '" + user.getPassword() + "'");
        System.out.println("User role: '" + user.getRole() + "'");
        System.out.println("Provided password: '" + password + "'");
        System.out.println("Passwords equal: " + user.getPassword().equals(password));
        
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
            System.out.println("🎉 Login successful! User ID: " + user.getId() + ", Role: " + user.getRole());
            
            // Update last login time if method exists
            try {
                userService.updateLastLoginTime(user.getId());
            } catch (Exception e) {
                System.out.println("Could not update last login time: " + e.getMessage());
            }
            
            return Optional.of(user);
        } else {
            System.out.println("❌ Password mismatch!");
            return Optional.empty();
        }
    }

    //get user by id
    public Optional<User> getUserById(String id) {
        Long userId;
        try {
            userId = Long.parseLong(id);
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
        return userRepository.findById(String.valueOf(userId));
    }

    @Autowired
    private com.example.SnapCart.services.UserService userService;

}
