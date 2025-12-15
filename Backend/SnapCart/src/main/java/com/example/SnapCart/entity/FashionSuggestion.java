package com.example.SnapCart.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fashion_suggestions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FashionSuggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_type")
    private String itemType; // shirt, pants, dress, shoes, etc.

    @Column(name = "color")
    private String color;

    @Column(name = "style")
    private String style; // casual, formal, party, sporty, etc.

    @Column(name = "suggestion", length = 1000)
    private String suggestion;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
