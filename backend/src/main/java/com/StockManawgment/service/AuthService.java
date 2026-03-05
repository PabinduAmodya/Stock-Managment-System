package com.StockManawgment.service;

import com.StockManawgment.dto.LoginRequest;
import com.StockManawgment.dto.LoginResponse;
import com.StockManawgment.entity.User;
import com.StockManawgment.exception.BadRequestException;
import com.StockManawgment.repository.UserRepository;
import com.StockManawgment.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (user.getStatus() == User.Status.INACTIVE) {
            throw new BadRequestException("Your account is deactivated. Contact the admin.");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        return new LoginResponse(token, user.getName(), user.getEmail(),
                user.getRole().name(), user.getStatus().name());
    }
}