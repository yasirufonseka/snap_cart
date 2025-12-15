package com.example.SnapCart.services;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.SnapCart.dto.PasswordChangeRequest;
import com.example.SnapCart.dto.ProfileUpdateRequest;
import com.example.SnapCart.dto.SystemPreferencesRequest;
import com.example.SnapCart.dto.UserRegiRequest;
import com.example.SnapCart.entity.User;
import com.example.SnapCart.repository.UserRepository;

@Service
public class ServiceImp implements UserService {

    @Autowired
    private UserRepository userRepository;


    @Override
    public User createUser(@RequestBody UserRegiRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setAddress(request.getAddress());
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());  // TODO: Hash this with Spring Security for production
        user.setContact(request.getContact());
        user.setEmail(request.getEmail());
        
        // Set role from request, default to customer if not provided
        String role = request.getRole();
        if (role == null || role.trim().isEmpty()) {
            role = "customer";
        }
        // Validate role values
        if (!role.equals("customer") && !role.equals("seller") && !role.equals("admin")) {
            role = "customer"; // Default to customer for invalid roles
        }
        user.setRole(role);
        
        user.setCreatedAt(new Date());
        user.setUpdatedAt(new Date());
        
        System.out.println("Creating user with role: " + role);

        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void toggleUserStatus(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        
        User user = userOpt.get();
        user.setActive(!user.isActive());
        user.setUpdatedAt(new Date());
        userRepository.save(user);
    }

    @Override
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        userRepository.deleteById(userId);
    }

    @Override
    public long getTotalUsersCount() {
        return userRepository.count();
    }
    
    // Settings management implementations
    @Override
    public Optional<User> getUserById(String userId) {
        return userRepository.findById(userId);
    }
    
    @Override
    public User updateProfile(String userId, ProfileUpdateRequest request) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        
        User user = userOpt.get();
        
        // Check if username is being changed and if it's already taken
        if (!user.getUsername().equals(request.getUsername())) {
            Optional<User> existingUser = userRepository.findByUsername(request.getUsername());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                throw new RuntimeException("Username already exists");
            }
        }
        
        // Update profile fields
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setContact(request.getContact());
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        user.setUpdatedAt(new Date());
        
        return userRepository.save(user);
    }
    
    @Override
    public void changePassword(String userId, PasswordChangeRequest request) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        
        User user = userOpt.get();
        
        // Verify current password (in production, use proper password hashing)
        if (!user.getPassword().equals(request.getCurrentPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Verify new password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and confirmation do not match");
        }
        
        // Update password (in production, hash the password)
        user.setPassword(request.getNewPassword());
        user.setUpdatedAt(new Date());
        
        userRepository.save(user);
    }
    
    @Override
    public User updateSystemPreferences(String userId, SystemPreferencesRequest request) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        
        User user = userOpt.get();
        
        // Update system preferences
        user.setEmailNotifications(request.isEmailNotifications());
        user.setSmsNotifications(request.isSmsNotifications());
        user.setPushNotifications(request.isPushNotifications());
        user.setLanguage(request.getLanguage());
        user.setTimezone(request.getTimezone());
        user.setTheme(request.getTheme());
        user.setTwoFactorEnabled(request.isTwoFactorEnabled());
        user.setUpdatedAt(new Date());
        
        return userRepository.save(user);
    }
    
    @Override
    public void updateLastLoginTime(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastLoginAt(new Date());
            userRepository.save(user);
        }
    }

}
