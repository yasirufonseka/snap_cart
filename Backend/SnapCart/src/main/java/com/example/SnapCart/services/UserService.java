package com.example.SnapCart.services;

import com.example.SnapCart.dto.UserRegiRequest;
import com.example.SnapCart.entity.User;

public interface UserService {
    User createUser  (UserRegiRequest request);


}
