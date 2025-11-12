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

  public Optional<User> logIn(String username, String password) {
    System.out.println("=== LOGIN ATTEMPT ===");
    System.out.println("Username: '" + username + "'");
    // NOTE: avoid printing passwords in production logs

    if (username == null || username.trim().isEmpty()) {
      System.out.println("❌ Empty username provided");
      return Optional.empty();
    }

    Optional<User> userOpt = userRepository.findByUsername(username.trim());

    if (userOpt.isEmpty()) {
      System.out.println("❌ User not found for username='" + username + "'");
      return Optional.empty();
    }

    User user = userOpt.get();
    System.out.println("✅ User found - ID: " + user.getId());
    // Compare passwords directly for dev mode; recommend hashing for production
    if (user.getPassword() == null || !user.getPassword().equals(password)) {
      System.out.println("❌ Password mismatch for user id=" + user.getId());
      return Optional.empty();
    }

    System.out.println("✅ Login successful for user id=" + user.getId());
    return Optional.of(user);
  }
}
