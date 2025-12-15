package com.example.SnapCart.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeminiSearchParams {
    private String intent;
    private String gender;
    private String occasion;
    private String color;
    private String style;
    private String category;
    private String budget;

    @JsonProperty("missing_info")
    private List<String> missingInfo;

    @JsonProperty("should_search")
    private Boolean shouldSearch;

    @JsonProperty("search_query")
    private String searchQuery;

    @JsonProperty("ai_response")
    private String aiResponse;
}
