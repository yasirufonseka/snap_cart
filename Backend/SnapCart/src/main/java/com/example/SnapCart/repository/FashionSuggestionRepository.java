package com.example.SnapCart.repository;

import com.example.SnapCart.entity.FashionSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FashionSuggestionRepository extends JpaRepository<FashionSuggestion, Long> {

    @Query("SELECT f FROM FashionSuggestion f WHERE " +
            "LOWER(f.itemType) LIKE LOWER(CONCAT('%', :type, '%')) AND " +
            "LOWER(f.color) LIKE LOWER(CONCAT('%', :color, '%')) AND " +
            "LOWER(f.style) LIKE LOWER(CONCAT('%', :style, '%'))")
    List<FashionSuggestion> findByTypeColorStyle(
            @Param("type") String type,
            @Param("color") String color,
            @Param("style") String style);

    @Query("SELECT f FROM FashionSuggestion f WHERE " +
            "LOWER(f.itemType) LIKE LOWER(CONCAT('%', :type, '%'))")
    List<FashionSuggestion> findByItemType(@Param("type") String type);
}
