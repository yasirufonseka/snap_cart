package com.example.SnapCart.services;

import com.example.SnapCart.dto.UserRegiRequest;
import com.example.SnapCart.entity.User;


import com.example.SnapCart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

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
        // Optional: Manually generate ID to avoid any null issues
        user.setName(request.getName());
        user.setAddress(request.getAddress());
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());  // TODO: Hash this with Spring Security for production
        user.setContact(request.getContact());
        user.setEmail(request.getEmail());

        return userRepository.save(user);
    }

}
