package com.example.SnapCart.repository;

import com.example.SnapCart.entity.Occasion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OccasionRepository extends JpaRepository<Occasion, Long> {
    Optional<Occasion> findByName(String name);
}
