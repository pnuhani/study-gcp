//package com.qwervego.label.config;
//
//import jakarta.servlet.DispatcherType;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpMethod;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configuration.WebSecurityConfiguration;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//
//@Configuration
//@EnableWebSecurity
//public class SecurityConfig  {
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf().disable()  // Disable CSRF protection for now (you might need it for production)
//                .authorizeRequests()
//                .antMatchers(HttpMethod.GET, "/api/qr").permitAll()  // Allow GET requests to /api/qr without authentication
//                .antMatchers(HttpMethod.POST, "/api/qr/add").permitAll()  // Allow POST requests to /api/qr/add without authentication
//                .anyRequest().authenticated()  // Secure all other requests
//                .and()
//                .httpBasic();  // Enable HTTP Basic Authentication for testing
//
//        return http.build();
//    }
//
//
//
//
//
//
//    @Bean
//    public BCryptPasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//}


package com.qwervego.label.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // Configure security using SecurityFilterChain instead of WebSecurityConfigurerAdapter
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // Disable CSRF protection (needed for APIs)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/qr").permitAll()  // Allow GET requests to /api/qr without authentication
                        .requestMatchers(HttpMethod.POST, "/api/qr/add").permitAll()  // Allow POST requests to /api/qr/add without authentication
                        .requestMatchers(HttpMethod.PUT, "/api/qr/*").permitAll()  // Allow POST requests to /api/qr/add without authentication
                        .anyRequest().authenticated())  // Secure all other requests
                .httpBasic(Customizer.withDefaults());  // Enable HTTP Basic Authentication for testing

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
