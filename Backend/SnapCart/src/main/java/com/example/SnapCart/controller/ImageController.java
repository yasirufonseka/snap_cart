package com.example.SnapCart.controller;

import com.example.SnapCart.dto.ImageIdentifyRequest;
import com.example.SnapCart.dto.ImageIdentifyResponse;
import com.example.SnapCart.services.ImageIdentifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/image")
public class ImageController {

    @Autowired
    private ImageIdentifyService imageIdentifyService;

    @PostMapping("/identify")
    public ResponseEntity<ImageIdentifyResponse> identifyImage(@RequestBody ImageIdentifyRequest request) {
        ImageIdentifyResponse response = imageIdentifyService.identifyImage(request);
        return ResponseEntity.ok(response);
    }
}
