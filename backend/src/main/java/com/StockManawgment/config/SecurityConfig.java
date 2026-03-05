package com.StockManawgment.config;
import com.StockManawgment.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── PUBLIC ──────────────────────────────────────────
                        .requestMatchers("/api/auth/**").permitAll()

                        // ── SELF-SERVICE PROFILE (any authenticated user) ──
                        // IMPORTANT: these must come BEFORE the /api/users/** ADMIN rule
                        .requestMatchers(HttpMethod.GET,   "/api/users/profile").authenticated()
                        .requestMatchers(HttpMethod.PUT,   "/api/users/profile").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/users/profile/password").authenticated()

                        // ── USER MANAGEMENT — ADMIN only ────────────────────
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // ── SUPPLIERS — ADMIN + MANAGER (delete: ADMIN only) ─
                        .requestMatchers(HttpMethod.GET,    "/api/suppliers/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.POST,   "/api/suppliers/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT,    "/api/suppliers/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/suppliers/**").hasRole("ADMIN")

                        // ── CATEGORIES — all view, ADMIN+MANAGER manage, ADMIN delete ─
                        .requestMatchers(HttpMethod.GET,    "/api/categories/**").hasAnyRole("ADMIN", "MANAGER", "CASHIER")
                        .requestMatchers(HttpMethod.POST,   "/api/categories/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT,    "/api/categories/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")

                        // ── PRODUCTS — all view, ADMIN+MANAGER manage, ADMIN delete ─
                        .requestMatchers(HttpMethod.GET,    "/api/products/**").hasAnyRole("ADMIN", "MANAGER", "CASHIER")
                        .requestMatchers(HttpMethod.POST,   "/api/products/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT,    "/api/products/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        // ── STOCK — ADMIN + MANAGER only ─────────────────────
                        .requestMatchers(HttpMethod.GET,    "/api/stocks/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.POST,   "/api/stocks/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/stocks/**").hasRole("ADMIN")

                        // ── PURCHASES — ADMIN + MANAGER only ──────────────────
                        .requestMatchers(HttpMethod.GET,    "/api/purchases/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.POST,   "/api/purchases/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT,    "/api/purchases/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PATCH,  "/api/purchases/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/purchases/**").hasRole("ADMIN")

                        // ── SALES — all roles create+view, ADMIN+MANAGER update, ADMIN delete ─
                        .requestMatchers(HttpMethod.GET,    "/api/sales/**").hasAnyRole("ADMIN", "MANAGER", "CASHIER")
                        .requestMatchers(HttpMethod.POST,   "/api/sales/**").hasAnyRole("ADMIN", "MANAGER", "CASHIER")
                        .requestMatchers(HttpMethod.PUT,    "/api/sales/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/sales/**").hasRole("ADMIN")

                        // ── CUSTOMERS — all roles manage, ADMIN delete ────────
                        .requestMatchers(HttpMethod.GET,    "/api/customers/**").hasAnyRole("ADMIN", "MANAGER", "CASHIER")
                        .requestMatchers(HttpMethod.POST,   "/api/customers/**").hasAnyRole("ADMIN", "MANAGER", "CASHIER")
                        .requestMatchers(HttpMethod.PUT,    "/api/customers/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/customers/**").hasRole("ADMIN")

                        // ── REPORTS — ADMIN + MANAGER only ────────────────────
                        .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "MANAGER")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}