package com.example.SnapCart.services;

import java.util.List;
import java.util.Optional;

import com.example.SnapCart.dto.PasswordChangeRequest;
import com.example.SnapCart.dto.ProfileUpdateRequest;
import com.example.SnapCart.dto.SystemPreferencesRequest;
import com.example.SnapCart.dto.UserRegiRequest;
import com.example.SnapCart.entity.User;

public interface UserService {
    User createUser(UserRegiRequest request);
    List<User> getAllUsers();
    void toggleUserStatus(String userId);
    void deleteUser(String userId);
    long getTotalUsersCount();
    
    // Settings management methods
    Optional<User> getUserById(String userId);
    User updateProfile(String userId, ProfileUpdateRequest request);
    void changePassword(String userId, PasswordChangeRequest request);
    User updateSystemPreferences(String userId, SystemPreferencesRequest request);
    void updateLastLoginTime(String userId);
}
