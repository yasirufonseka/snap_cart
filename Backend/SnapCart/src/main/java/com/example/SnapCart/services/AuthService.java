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

      boolean isEqual=userRepository.findByUsername(username).map(user -> user.getPassword().equals(password))
        .orElse(false);

      Optional<String> getid=userRepository.findByUsername(username).map(user -> user.getId().toString());


        System.out.println("User ID: " + getid);


      return getid;

        }

}
