package com.example.SnapCart.dto;

public class ImageIdentifyResponse {
    private boolean success;
    private String detectedType;
    private String detectedColor;
    private String detectedStyle;
    private String suggestion;
    private String imageUrl;
    private String error;

    public ImageIdentifyResponse() {
    }

    public ImageIdentifyResponse(boolean success, String suggestion) {
        this.success = success;
        this.suggestion = suggestion;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getDetectedType() {
        return detectedType;
    }

    public void setDetectedType(String detectedType) {
        this.detectedType = detectedType;
    }

    public String getDetectedColor() {
        return detectedColor;
    }

    public void setDetectedColor(String detectedColor) {
        this.detectedColor = detectedColor;
    }

    public String getDetectedStyle() {
        return detectedStyle;
    }

    public void setDetectedStyle(String detectedStyle) {
        this.detectedStyle = detectedStyle;
    }

    public String getSuggestion() {
        return suggestion;
    }

    public void setSuggestion(String suggestion) {
        this.suggestion = suggestion;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
