package com.example.SnapCart.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Template Security Configuration
 * -----------------------------------
 * This configuration demonstrates:
 *  - JWT authentication filter
 *  - Stateless session management
 *  - CORS configuration with dynamic origins
 *  - OAuth2 login (Google, GitHub, etc.)
 *  - Custom password encryption
 */


@Configuration
public class Config {

  public Config(){}

  /**
   * CORS configuration to allow requests from Angular frontend.
   */
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:4200"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}

