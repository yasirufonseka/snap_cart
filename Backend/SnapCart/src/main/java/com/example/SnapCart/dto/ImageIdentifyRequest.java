package com.example.SnapCart.dto;

public class ImageIdentifyRequest {
    private String imageUrl;
    private String imageData; // base64 encoded image

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }
}
