package com.example.SnapCart.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "image_history")
public class ImageHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "detected_type")
    private String detectedType;

    @Column(name = "detected_color")
    private String detectedColor;

    @Column(name = "detected_style")
    private String detectedStyle;

    @Column(name = "suggestion", length = 1000)
    private String suggestion;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
