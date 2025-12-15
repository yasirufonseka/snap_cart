package com.example.SnapCart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "occasions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Occasion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "occasion", cascade = CascadeType.ALL)
    private List<ProductOccasion> productOccasions;
}
