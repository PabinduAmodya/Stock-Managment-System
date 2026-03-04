package com.StockManawgment.Stock_Managment.controller;

import com.StockManawgment.Stock_Managment.dto.PasswordChangeRequest;
import com.StockManawgment.Stock_Managment.dto.PasswordResetRequest;
import com.StockManawgment.Stock_Managment.dto.ProfileUpdateRequest;
import com.StockManawgment.Stock_Managment.dto.RoleChangeRequest;
import com.StockManawgment.Stock_Managment.entity.User;
import com.StockManawgment.Stock_Managment.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // ─────────────────────────────────────────────────────────────────────────
    // SELF-SERVICE PROFILE  (any authenticated role)
    // These MUST be declared before the /{id} mappings so Spring matches them first
    // ─────────────────────────────────────────────────────────────────────────

    // GET /api/users/profile  — get own profile
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(userService.getByEmail(email));
    }

    // PUT /api/users/profile  — update own name/email
    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody ProfileUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(userService.updateProfile(email, request));
    }

    // PATCH /api/users/profile/password  — change own password (requires current password)
    @PatchMapping("/profile/password")
    public ResponseEntity<String> changeOwnPassword(@RequestBody PasswordChangeRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.changeOwnPassword(email, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok("Password changed successfully");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN-ONLY USER MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────

    // POST /api/users  — create user
    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(user));
    }

    // GET /api/users  — list all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET /api/users/{id}  — get by id
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // PUT /api/users/{id}  — update name/email only (role stays unchanged here)
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    // DELETE /api/users/{id}  — delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        String callerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.deleteUser(id, callerEmail);
        return ResponseEntity.ok("User deleted successfully");
    }

    // PATCH /api/users/{id}/activate  — activate user
    @PatchMapping("/{id}/activate")
    public ResponseEntity<User> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activateUser(id));
    }

    // PATCH /api/users/{id}/deactivate  — deactivate user
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<User> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deactivateUser(id));
    }

    // PATCH /api/users/{id}/role  — change role
    @PatchMapping("/{id}/role")
    public ResponseEntity<User> changeRole(@PathVariable Long id, @RequestBody RoleChangeRequest request) {
        return ResponseEntity.ok(userService.changeRole(id, request.getRole()));
    }

    // PATCH /api/users/{id}/reset-password  — admin resets any user's password (no current pwd needed)
    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<String> resetPassword(@PathVariable Long id, @RequestBody PasswordResetRequest request) {
        userService.resetPassword(id, request.getPassword());
        return ResponseEntity.ok("Password reset successfully");
    }
}