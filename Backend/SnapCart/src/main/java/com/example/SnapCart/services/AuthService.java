package com.example.SnapCart.services;


import com.example.SnapCart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service

public class AuthService {

    private final UserRepository userRepository;

    @Autowired
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean logIn(String username,String password){
        return userRepository.findByUsername(username).map(user -> user.getPassword().equals(password))
                .orElse(false);
        }

}
