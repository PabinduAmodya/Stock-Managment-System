package com.StockManawgment.Stock_Managment.controller;

import com.StockManawgment.Stock_Managment.dto.LoginRequest;
import com.StockManawgment.Stock_Managment.dto.LoginResponse;
import com.StockManawgment.Stock_Managment.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
