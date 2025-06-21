package com.qwervego.label.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Allow frontend origins - both localhost and 127.0.0.1 for development
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",  // Vite dev server
            "http://localhost:5174",
            "http://localhost:3000",
            "http://127.0.0.1:5173",  // IP-based access for Firebase auth
            "http://127.0.0.1:5174",
            "http://127.0.0.1:3000",
            "https://frontend-230228655056.asia-south1.run.app"  // Your Cloud Run frontend URL
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Configuration
    public static class WebConfig implements WebMvcConfigurer {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:5173",  // Vite dev server
                        "http://localhost:5174",
                        "http://localhost:3000",
                        "http://127.0.0.1:5173",  // IP-based access for Firebase auth
                        "http://127.0.0.1:5174",
                        "http://127.0.0.1:3000",
                        "https://frontend-230228655056.asia-south1.run.app"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
        }
    }

}
