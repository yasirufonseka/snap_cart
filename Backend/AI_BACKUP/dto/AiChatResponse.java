package com.example.SnapCart.dto;

import com.example.SnapCart.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {
    private String aiMessage;
    private List<ProductRecommendation> products;
    private List<String> followUpQuestions;
    private String conversationId;
    private ExtractedUserInfo extractedInfo; // What AI understood from user

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductRecommendation {
        private String id;
        private String name;
        private String description;
        private List<String> images;
        private double price;
        private double discount;
        private String colour;
        private String gender;
        private String occasion;
        private String brand;
        private String size;
        private String productUrl;
        private int matchScore; // How well it matches user requirements (0-100)

        public static ProductRecommendation fromProduct(Product product) {
            ProductRecommendation rec = new ProductRecommendation();
            rec.setId(product.getId());
            rec.setName(product.getBrand() + " " + product.getItems());
            rec.setDescription(product.getDescription());
            rec.setImages(product.getImages());
            rec.setPrice(product.getPrice());
            rec.setDiscount(product.getDiscount());
            rec.setColour(product.getColour());
            rec.setGender(product.getGender());
            rec.setOccasion(product.getOccasion());
            rec.setBrand(product.getBrand());
            rec.setSize(product.getSize());
            rec.setProductUrl("/product/" + product.getId());
            rec.setMatchScore(80); // Default, can be calculated
            return rec;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExtractedUserInfo {
        private String event; // wedding, party, casual, office
        private String gender; // male, female
        private String style; // luxury, simple, trendy, classic
        private String budget; // extracted price range
        private String color; // preferred color
        private String clothingType; // coat, shirt, dress, saree, etc.
        private boolean hasImage; // Did user upload image?
    }
}
