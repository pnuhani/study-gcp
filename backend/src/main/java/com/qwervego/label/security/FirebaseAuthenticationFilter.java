package com.qwervego.label.security;

import com.google.firebase.auth.FirebaseAuthException;
import com.qwervego.label.service.FirebaseAuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private final FirebaseAuthService firebaseAuthService;

    public FirebaseAuthenticationFilter(FirebaseAuthService firebaseAuthService) {
        this.firebaseAuthService = firebaseAuthService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String idToken = authHeader.substring(7);
            String uid = firebaseAuthService.verifyIdToken(idToken);
            Map<String, Object> claims = firebaseAuthService.getUserClaims(uid);
            
            List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + claims.getOrDefault("role", "USER"))
            );

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                uid, null, authorities
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
        } catch (FirebaseAuthException e) {
            logger.error("Firebase authentication failed", e);
        }

        filterChain.doFilter(request, response);
    }
} 
